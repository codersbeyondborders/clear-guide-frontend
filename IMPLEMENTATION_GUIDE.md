# ClearGuide — Implementation Guide & Task Breakdown

## Quick Reference: Build Priorities

1. **Phase 1**: Database + Auth + Landing Page (Foundation)
2. **Phase 2**: Manufacturer Dashboard + Manual Editor (Core MVP)
3. **Phase 3**: End User Features (User Experience)
4. **Phase 4**: AI Integration + File Storage (Intelligence)
5. **Phase 5**: Performance & Accessibility (Polish)
6. **Phase 6**: Deployment (Go Live)

---

## Detailed Phase 1: Core Foundation (Weeks 1-2)

### Task 1.1: Database Schema & AWS Aurora PostgreSQL Setup

**Objective**: Create a production-ready PostgreSQL schema on AWS Aurora PostgreSQL with best practices for performance, scaling, and reliability.

**AWS Infrastructure**:
- **Engine**: Aurora PostgreSQL 16 (writer + read replica)
- **Connection Pooling**: RDS Proxy (IAM-authenticated, max_connections managed server-side)
- **Auth**: IAM token-based authentication (no static passwords)
- **Encryption**: at-rest (KMS) + in-transit (SSL/TLS enforced)
- **Driver**: `pg` with `@aws-sdk/rds-signer` for token refresh
- **ORM**: Drizzle ORM (`drizzle-orm/node-postgres`) over the shared `pg` Pool

**Schema Design Principles**:
- Primary keys: `uuid` (generated via `gen_random_uuid()`) for distributed-safe IDs
- All timestamps: `TIMESTAMPTZ` (timezone-aware) stored in UTC
- Soft deletes: `deleted_at TIMESTAMPTZ` column — never hard-delete rows
- Composite indexes on every high-cardinality foreign-key + filter column pair
- `CHECK` constraints on enum-like columns to enforce values at the DB layer
- Partitioning on `analytics` (by month) and `ai_chat_history` (by month) — both are high-volume append-only tables
- All text user content columns use `TEXT` (not `VARCHAR(n)`) to avoid silent truncation

**Subtasks**:

1. **Provision Aurora cluster** via AWS Console or Terraform:
   - Create Aurora PostgreSQL 16 cluster in a VPC
   - Enable Multi-AZ (writer + 1 read replica minimum)
   - Enable RDS Proxy (IAM auth) — gives connection pooling without managing pgBouncer
   - Enable Enhanced Monitoring + Performance Insights
   - Store connection string as `DATABASE_URL` in Vercel environment variables

2. **Create `lib/db/index.ts`** — Drizzle client over `pg` Pool with IAM token refresh:
   ```typescript
   import { Pool } from 'pg'
   import { drizzle } from 'drizzle-orm/node-postgres'
   import { Signer } from '@aws-sdk/rds-signer'
   import * as schema from './schema'

   const signer = new Signer({
     hostname: process.env.DB_HOST!,
     port: 5432,
     region: process.env.AWS_REGION!,
     username: process.env.DB_USER!,
   })

   export const pool = new Pool({
     host: process.env.DB_HOST,
     port: 5432,
     user: process.env.DB_USER,
     database: process.env.DB_NAME,
     ssl: { rejectUnauthorized: true },
     password: () => signer.getAuthToken(), // rotates every 15 min automatically
   })

   export const db = drizzle(pool, { schema })
   ```

3. **Create `lib/db/schema.ts`** with all tables (see full schema below)

4. **Run DDL** via a one-time `node scripts/migrate.ts` script (using the pool directly — no drizzle-kit push in production):
   ```bash
   npx tsx scripts/migrate.ts
   ```

5. **Seed demo data** (`scripts/seed.ts`):
   - Demo manufacturer user
   - 2–3 sample manuals with sections

**Full Table Schema** (`lib/db/schema.ts`):

```typescript
import {
  pgTable, uuid, text, boolean, integer, real,
  timestamp, jsonb, index, uniqueIndex, check, pgEnum
} from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'

// ─── Enums (enforced at DB layer) ────────────────────────────────────────────

export const manualStatusEnum = pgEnum('manual_status', ['draft', 'processing', 'published', 'archived'])
export const uploadMethodEnum = pgEnum('upload_method', ['upload', 'sections'])
export const chatRoleEnum     = pgEnum('chat_role',     ['user', 'assistant'])
export const viewModeEnum     = pgEnum('view_mode',     ['text', 'infographic', 'video', 'chat'])

// ─── Better Auth Core Tables ─────────────────────────────────────────────────

export const user = pgTable('user', {
  id:            text('id').primaryKey(),
  name:          text('name').notNull(),
  email:         text('email').notNull().unique(),
  emailVerified: boolean('emailVerified').notNull().default(false),
  image:         text('image'),
  createdAt:     timestamp('createdAt', { withTimezone: true }).notNull().defaultNow(),
  updatedAt:     timestamp('updatedAt', { withTimezone: true }).notNull().defaultNow(),
})

export const session = pgTable('session', {
  id:         text('id').primaryKey(),
  expiresAt:  timestamp('expiresAt',  { withTimezone: true }).notNull(),
  token:      text('token').notNull().unique(),
  createdAt:  timestamp('createdAt',  { withTimezone: true }).notNull().defaultNow(),
  updatedAt:  timestamp('updatedAt',  { withTimezone: true }).notNull().defaultNow(),
  ipAddress:  text('ipAddress'),
  userAgent:  text('userAgent'),
  userId:     text('userId').notNull().references(() => user.id, { onDelete: 'cascade' }),
}, (t) => [
  index('session_user_id_idx').on(t.userId),
  index('session_expires_at_idx').on(t.expiresAt),
])

export const account = pgTable('account', {
  id:                   text('id').primaryKey(),
  accountId:            text('accountId').notNull(),
  providerId:           text('providerId').notNull(),
  userId:               text('userId').notNull().references(() => user.id, { onDelete: 'cascade' }),
  accessToken:          text('accessToken'),
  refreshToken:         text('refreshToken'),
  idToken:              text('idToken'),
  accessTokenExpiresAt: timestamp('accessTokenExpiresAt', { withTimezone: true }),
  refreshTokenExpiresAt:timestamp('refreshTokenExpiresAt',{ withTimezone: true }),
  scope:                text('scope'),
  password:             text('password'),
  createdAt:            timestamp('createdAt', { withTimezone: true }).notNull().defaultNow(),
  updatedAt:            timestamp('updatedAt', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index('account_user_id_idx').on(t.userId),
  uniqueIndex('account_provider_account_idx').on(t.providerId, t.accountId),
])

export const verification = pgTable('verification', {
  id:         text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value:      text('value').notNull(),
  expiresAt:  timestamp('expiresAt',  { withTimezone: true }).notNull(),
  createdAt:  timestamp('createdAt',  { withTimezone: true }).notNull().defaultNow(),
  updatedAt:  timestamp('updatedAt',  { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index('verification_identifier_idx').on(t.identifier),
])

// ─── App Tables ───────────────────────────────────────────────────────────────

export const manuals = pgTable('manuals', {
  id:             uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  userId:         text('userId').notNull(),                     // scoped to auth user; no FK for schema flexibility
  productName:    text('product_name').notNull(),
  productModel:   text('product_model').notNull(),
  brand:          text('brand').notNull(),
  serialNumber:   text('serial_number'),
  status:         manualStatusEnum('status').notNull().default('draft'),
  languages:      text('languages').array().notNull().default(sql`ARRAY['en']::text[]`),
  uploadMethod:   uploadMethodEnum('upload_method'),
  originalFileUrl:text('original_file_url'),
  thumbnailUrl:   text('thumbnail_url'),
  createdAt:      timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt:      timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  deletedAt:      timestamp('deleted_at', { withTimezone: true }),           // soft delete
}, (t) => [
  index('manuals_user_status_idx').on(t.userId, t.status),                  // dashboard list query
  index('manuals_user_created_idx').on(t.userId, t.createdAt.desc()),       // date-sorted list
  index('manuals_deleted_at_idx').on(t.deletedAt),                          // filter active rows fast
  index('manuals_status_idx').on(t.status),                                 // admin/public filtered views
])

export const manualSections = pgTable('manual_sections', {
  id:            uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  manualId:      uuid('manual_id').notNull(),                               // no FK: section bulk inserts are faster without FK checks
  sectionNumber: integer('section_number').notNull(),
  title:         text('title').notNull(),
  content:       text('content').notNull().default(''),
  imageUrls:     text('image_urls').array().notNull().default(sql`ARRAY[]::text[]`),
  videoUrls:     text('video_urls').array().notNull().default(sql`ARRAY[]::text[]`),
  createdAt:     timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt:     timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index('sections_manual_order_idx').on(t.manualId, t.sectionNumber),      // ordered section fetch
  uniqueIndex('sections_manual_number_uidx').on(t.manualId, t.sectionNumber),
])

export const translations = pgTable('translations', {
  id:                uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  manualId:          uuid('manual_id').notNull(),
  sectionId:         uuid('section_id'),                                    // null = full-manual translation
  language:          text('language').notNull(),                            // BCP-47 code e.g. "fr", "de"
  translatedContent: text('translated_content').notNull(),
  generatedAt:       timestamp('generated_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  uniqueIndex('translations_manual_section_lang_uidx').on(t.manualId, t.sectionId, t.language),
  index('translations_manual_lang_idx').on(t.manualId, t.language),
])

// Partitioned by month via application-level routing (Aurora doesn't support declarative partitioning
// the same way as vanilla PG; use native partitioning if on Aurora PG 14+).
// Recommended: CREATE TABLE analytics_YYYY_MM PARTITION OF analytics ...
// The schema below defines the parent; migration script adds monthly partitions.
export const analytics = pgTable('analytics', {
  id:             uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  manualId:       uuid('manual_id').notNull(),
  userId:         text('user_id'),                                          // null for anonymous users
  userSessionId:  text('user_session_id').notNull(),
  mode:           viewModeEnum('mode').notNull(),
  timeSpentSeconds: integer('time_spent_seconds').notNull().default(0),
  viewedAt:       timestamp('viewed_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index('analytics_manual_viewed_idx').on(t.manualId, t.viewedAt.desc()), // per-manual time-series
  index('analytics_viewed_at_idx').on(t.viewedAt.desc()),                 // global time-series + partition pruning
  index('analytics_session_idx').on(t.userSessionId),
])

// Same monthly-partition strategy recommended for ai_chat_history.
export const aiChatHistory = pgTable('ai_chat_history', {
  id:            uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  manualId:      uuid('manual_id').notNull(),
  userId:        text('user_id'),
  userSessionId: text('user_session_id').notNull(),
  role:          chatRoleEnum('role').notNull(),
  message:       text('message').notNull(),
  tokenCount:    integer('token_count'),                                    // for AI cost tracking
  createdAt:     timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index('chat_manual_session_idx').on(t.manualId, t.userSessionId, t.createdAt.asc()), // chat thread fetch
  index('chat_created_at_idx').on(t.createdAt.desc()),                    // partition pruning
])

// Manual knowledge base — derived from AI-processed content, used as RAG context.
export const manualKnowledgeBase = pgTable('manual_knowledge_base', {
  id:        uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  manualId:  uuid('manual_id').notNull().unique(),
  chunks:    jsonb('chunks').notNull().default(sql`'[]'::jsonb`),          // [{text, sectionId, embedding_id}]
  modelVersion: text('model_version').notNull(),                           // track which AI model built it
  builtAt:   timestamp('built_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index('kb_manual_idx').on(t.manualId),
])
```

**Required Environment Variables**:
```
DATABASE_URL=          # Full connection string (for Better Auth pg Pool)
DB_HOST=               # Aurora cluster / RDS Proxy endpoint
DB_USER=               # IAM DB user
DB_NAME=               # Database name
AWS_REGION=            # e.g. us-east-1
AWS_ACCESS_KEY_ID=     # IAM credentials (or use instance role / Lambda role)
AWS_SECRET_ACCESS_KEY= # IAM credentials
BETTER_AUTH_SECRET=    # openssl rand -base64 32
```

**Key Indexes Summary**:

| Table | Index | Query it enables |
|---|---|---|
| `manuals` | `(userId, status)` | Dashboard filtered list |
| `manuals` | `(userId, created_at DESC)` | Date-sorted list |
| `manual_sections` | `(manual_id, section_number)` | Ordered section fetch |
| `translations` | `(manual_id, language)` | All sections in a language |
| `analytics` | `(manual_id, viewed_at DESC)` | Per-manual chart data |
| `ai_chat_history` | `(manual_id, session_id, created_at ASC)` | Chat thread |

**Deliverables**:
- `lib/db/index.ts` — Drizzle + pg Pool with IAM token refresh
- `lib/db/schema.ts` — all table definitions with indexes
- `scripts/migrate.ts` — DDL runner
- `scripts/seed.ts` — demo data

**Acceptance Criteria**:
- All tables + indexes created on Aurora cluster
- IAM auth connection works end-to-end
- RDS Proxy handles connection pooling (no pool exhaustion under load)
- Demo seed data queryable

---

### Task 1.2: Better Auth Integration

**Objective**: Set up email/password authentication with session management backed by Aurora PostgreSQL.

**Subtasks**:
1. Install: `pnpm add better-auth pg @aws-sdk/rds-signer drizzle-orm`
2. Create `lib/auth.ts`:
   - Use the **same `pg` Pool** as Drizzle (one connection pool)
   - Configure email/password strategy
   - Session duration: 30 days
   - Dev-mode cookie override for `sameSite: "none"` (required for preview iframes)
   - `trustedOrigins` cascade: `BETTER_AUTH_URL` → `VERCEL_PROJECT_PRODUCTION_URL` → `VERCEL_URL` → `V0_RUNTIME_URL`
3. Create `lib/auth-client.ts` (React client)
4. Create `app/api/auth/[...all]/route.ts` (catch-all handler — `[...all]` is required)
5. Create `middleware.ts`:
   - Protect `/manufacturer/*` routes
   - Allow public routes (`/`, `/user`, `/manual/:id`, `/manufacturer/login`)
6. Create `app/sign-in/page.tsx` and `app/sign-up/page.tsx` (server components that redirect authed users)
7. Create `components/auth-form.tsx` (shared client form)
8. Create `hooks/useAuth.ts` client hook

**Deliverables**:
- `lib/auth.ts`
- `lib/auth-client.ts`
- `middleware.ts`
- `app/api/auth/[...all]/route.ts`
- `hooks/useAuth.ts`

**Acceptance Criteria**:
- Signup/login/logout working against Aurora
- Sessions persist across page refreshes
- Protected routes redirect to login
- Demo credentials work (`demo@brewtech.com` / `password123`)

---

### Task 1.3: Design System & Tailwind Setup

**Objective**: Implement cohesive design system with Tailwind CSS v4.

**Subtasks**:
1. Define color tokens in `globals.css`:
   - Primary: Emerald (`#16a34a`)
   - Neutrals: Gray scale (50–950)
   - Semantic: success, error, warning, info
   - Accessibility: high-contrast black (`#000`) and yellow (`#FFFF00`)
2. Configure typography:
   - Font family: Inter for body + headings
   - Scale: sm (12px), base (16px), lg (18px), xl (24px), 2xl (32px)
   - Line height: 1.5–1.6 for readability
3. Set up component variants:
   - Button sizes (sm, md, lg) and variants (primary, secondary, outline, ghost, danger)
   - Input base styles with focus states
   - Card, Badge, Modal base styles
4. Create global styles for:
   - Focus indicators (ring on all interactive elements)
   - High-contrast mode activation
   - Print styles

**Deliverables**:
- `app/globals.css` with all design tokens
- `tailwind.config.ts` with custom configuration

**Acceptance Criteria**:
- Color variables accessible in all components
- Focus ring visible on Tab navigation
- High-contrast mode applies correctly
- Responsive scales work (`sm:`, `md:`, `lg:`)

---

### Task 1.4: Reusable UI Component Library

**Objective**: Build foundational UI components used across the app.

**Create Components**:
- `components/ui/Button.tsx` (primary, secondary, danger, outline)
- `components/ui/Input.tsx` (text, email, password with validation states)
- `components/ui/Textarea.tsx` (resizable, with character count)
- `components/ui/Select.tsx` (dropdown with keyboard support)
- `components/ui/Checkbox.tsx` & `Radio.tsx`
- `components/ui/Badge.tsx` (for status, tags)
- `components/ui/Card.tsx` (container with variants)
- `components/ui/Modal.tsx` (dialog with backdrop)
- `components/ui/Toast.tsx` (notifications)
- `components/ui/Spinner.tsx` (loading indicator)
- `components/ui/Skeleton.tsx` (loading placeholder)

**Key Features**:
- ARIA labels and roles
- Keyboard navigation support
- Disabled states
- Loading states
- Error states with messaging
- TypeScript props interface for each

**Deliverables**:
- All components in `components/ui/` with TypeScript

**Acceptance Criteria**:
- All components render without errors
- Props interface clear and typed
- Accessibility props present (`aria-label`, `role`, `aria-describedby`)
- Keyboard navigation working for interactive elements

---

### Task 1.5: Landing Page (`/`)

**Objective**: Create high-converting, responsive landing page.

**Sections**:
1. **Header/Navigation**
   - Logo
   - Links: "Find a Guide" (→ `/user`), "Dashboard" (→ `/manufacturer/dashboard` if logged in, else `/manufacturer/login`)
   - "Get Started" CTA button (→ `/manufacturer/login`)
   - Auth status (if logged in, show user email + logout button)

2. **Hero Section**
   - Headline: "Your Manuals, Simplified"
   - Subheading: "Create accessible, AI-powered product guides in minutes"
   - Hero image (illustration or product mockup)
   - Two CTAs: "Get Started Free" (primary), "View Demo" (secondary)

3. **Trust Section (Stats)**
   - "10,000+ manuals published"
   - "98% accessibility score"
   - "300+ manufacturers"
   - "50+ languages supported"

4. **Feature Cards**
   - **Dashboard**: "Manage all your manuals in one place"
   - **AI Chat**: "Users get instant answers via chat"
   - **QR Integration**: "Print QR codes for instant access"
   - **Analytics**: "Track user engagement and improve content"

5. **Workflow Section**
   - Visual flow: Upload → AI Process → Publish
   - Copy emphasizing ease and speed

6. **Pricing Section**
   - Three tiers: Free, Pro, Enterprise
   - CTA buttons for each

7. **Footer**
   - Links (About, Docs, Privacy, Terms)
   - Copyright

**Technical Requirements**:
- Fully responsive (mobile, tablet, desktop)
- Fast (LCP < 2.5s, CLS < 0.1)
- SEO optimized (meta tags, schema.org)
- No third-party script bloat

**Deliverables**:
- `app/page.tsx` with all sections
- Image assets optimized (WebP, srcset)
- Meta tags in layout

**Acceptance Criteria**:
- Page loads in < 2.5s (LCP)
- Mobile: all sections readable without horizontal scroll
- Tablet/Desktop: multi-column layouts work
- Links route to correct pages
- CTAs visible and prominent

---

### Task 1.6: 404 & Error Pages

**Objective**: Professional error handling pages.

**Create**:
- `app/not-found.tsx` (404 page)
- `app/error.tsx` (500 error boundary)

**Features**:
- Helpful messaging
- Link back to home or previous page
- Consistent design

**Deliverables**:
- Both error pages
- Global error boundary

---

## Detailed Phase 2: Manufacturer Features (Weeks 3-4)

### Task 2.1: Authentication Pages

#### Task 2.1a: Login Page (`/manufacturer/login`)

**Objective**: Secure, user-friendly login with demo credentials hint.

**Components**:
- Email input with validation (required, valid email)
- Password input (required, min 8 chars)
- "Remember me" checkbox (optional)
- Submit button (shows loading spinner during request)
- "Forgot password?" link (placeholder)
- Demo credentials hint box:
  - Shows: `demo@brewtech.com` / `password123`
  - Clicking email or password auto-fills the form

**Flow**:
1. User enters credentials
2. Submit → call `/api/auth/sign-in` endpoint
3. On success → store session → redirect to `/manufacturer/dashboard`
4. On error → show error toast

**Deliverables**:
- `app/manufacturer/login/page.tsx`
- Form validation logic

**Acceptance Criteria**:
- Form submits and logs in successfully
- Demo credentials work
- Error messages display on failure
- Auto-fill on demo credential click works

---

#### Task 2.1b: Signup Page (Optional for MVP)

**Skip for Phase 1**; prioritize dashboard first.

---

### Task 2.2: Manufacturer Dashboard (`/manufacturer/dashboard`)

**Objective**: Central hub for viewing and managing manuals.

**Layout**:
- **Header**: "My Manuals" + "Create New Manual" CTA button
- **Sidebar** (mobile: hamburger):
  - User profile (email, logout link)
  - Nav items (Dashboard, Analytics, Settings—optional)
- **Main Content**:
  - Grid of manual cards (responsive: 1 col mobile, 2 col tablet, 3 col desktop)
  - Empty state message + CTA if no manuals

**Manual Card**:
- Product name (heading, semibold)
- Status badge (Published [green] / Draft [gray])
- "Last updated: X days ago"
- Three action buttons: Edit, Analytics, Delete
- Hover effect (shadow lift)

**Card Actions**:
- **Edit** → navigate to `/manufacturer/edit/:id`
- **Analytics** → navigate to `/manufacturer/analytics/:id`
- **Delete** → show confirmation modal, then set `deleted_at` (soft delete)

**Data Fetching**:
- Fetch user's manuals via SWR: `GET /api/manuals?status=all`
- Auto-refresh every 30s
- Show loading skeleton while fetching
- Query scoped by `userId` (no RLS — all queries must filter by session user)

**Deliverables**:
- `app/manufacturer/dashboard/page.tsx`
- `app/api/manuals/route.ts` (GET endpoint)
- `components/ManualCard.tsx`
- `hooks/useManuals.ts` (SWR hook)

**Acceptance Criteria**:
- Manuals load and display correctly
- Cards are responsive
- Empty state displays
- Edit/Analytics/Delete actions work
- User can create new manual via button

---

### Task 2.3: Manual Editor (`/manufacturer/new` & `/manufacturer/edit/:id`)

#### Architecture: Multi-Step Form

**State Management**:
- Use React Context (`ManualEditorContext`) to manage multi-step form state
- State shape:
  ```typescript
  {
    step: 1 | 2 | 3 | 4,
    formData: {
      productName: string,
      productModel: string,
      brand: string,
      serialNumber: string,
      languages: string[],
      uploadMethod: 'upload' | 'sections',
      uploadedFile?: File,
      sections?: Section[],
      status: 'draft' | 'published'
    }
  }
  ```
- Auto-save to localStorage every change
- Restore from localStorage on page load

---

#### Step 1: Basic Information

**Form Fields**:
- Product Name (required, text)
- Product Model (required, text)
- Brand / Make (required, text)
- Serial Number (optional, text)

**UI**:
- Simple card layout with 4 inputs
- "Next" button (enabled only if all required fields filled)
- "Save as Draft" link (saves to DB, doesn't progress)

**Deliverables**:
- `app/manufacturer/new/page.tsx`
- `app/manufacturer/new/_components/Step1.tsx`

---

#### Step 2: Language Selection

**UI**:
- Grid of 16 language flags + names
- English always pre-selected and disabled
- Checkmark overlay on selected languages
- Counter badge: "X languages selected"
- AI info box: "The following languages will be auto-translated via AI: [list]"

**Deliverables**:
- `app/manufacturer/new/_components/Step2.tsx`
- `components/LanguagePicker.tsx`

---

#### Step 3: Upload or Build Content

**Option A: Upload Manual**
- Drag-and-drop zone or click-to-upload
- Accepted: PDF, Word (doc/docx)
- Max 50 MB
- Progress bar during upload
- File preview with name, size, remove button

**Option B: Build Sections**
- Add/remove/reorder sections
- For each section:
  - Title input
  - Content textarea (resizable)
  - Image uploads (drag-and-drop, grid preview)
  - Video uploads (drag-and-drop, file list)
- "Change method" link to switch to Upload

**Deliverables**:
- `app/manufacturer/new/_components/Step3.tsx`
- `components/FileUpload.tsx` (drag-and-drop)
- `components/ImageGallery.tsx` (thumbnail grid)
- `components/SectionBuilder.tsx` (section management)

---

#### Step 4: Save & Publish

**UI**:
- Status dropdown: "Draft" or "Published"
- "Save Manual" button (primary)
- "Cancel" link (go back to dashboard)

**On Save**:
1. Send `POST` to `/api/manuals` with form data
2. Show AI Processing overlay (6 animated steps)
3. Progress bar at top (0–100%)
4. On complete: Show "Manual Ready!" success message
5. After 2s: Redirect to `/manufacturer/dashboard`

**Deliverables**:
- `app/manufacturer/new/_components/Step4.tsx`
- `app/api/manuals/route.ts` (POST endpoint)
- `components/AIProcessingOverlay.tsx`

**Acceptance Criteria**:
- Form submits and manual saves
- AI processing overlay displays all 6 steps
- Progress bar animates
- Redirect works on success
- Error handling shows toast on failure

---

### Task 2.4: Edit Manual (`/manufacturer/edit/:id`)

**Objective**: Allow manufacturers to update manual content.

**Implementation**:
- Reuse editor steps from `/manufacturer/new`
- On page load: fetch existing manual data via `GET /api/manuals/:id`
- Pre-populate form with existing data
- On save: `PUT` to `/api/manuals/:id` instead of POST
- Same AI Processing overlay on save

**Deliverables**:
- `app/manufacturer/edit/[id]/page.tsx`
- Route handler `PUT /api/manuals/:id`

---

### Task 2.5: Analytics Page (`/manufacturer/analytics/:id`)

**Objective**: Provide insights into manual usage.

**Components**:
1. **Header**: Manual name + back link
2. **KPI Cards** (grid, responsive):
   - Total Views
   - Active Users (30 days)
   - Average Time Spent (in minutes)
   - Trend vs. last month (↑ +12%)

3. **Charts**:
   - **Views Over Time** (line chart, Recharts)
   - **Top AI Support Queries** (horizontal bar chart, Recharts)

4. **Download**: "Export as CSV" button (optional)

**Data Fetching**:
- `GET /api/manuals/:id/analytics` → KPI + chart data from `analytics` table
- Aurora read replica used for analytics queries (read-heavy, can tolerate slight lag)
- SWR hook for auto-refresh

**Deliverables**:
- `app/manufacturer/analytics/[id]/page.tsx`
- `app/api/manuals/[id]/analytics/route.ts`
- `components/KPICard.tsx`
- `components/LineChart.tsx` (Recharts)
- `components/BarChart.tsx` (Recharts)

---

## Detailed Phase 3: End User Features (Weeks 5-6)

### Task 3.1: End User Portal (`/user`)

**Sections**:
1. **Header**: "Find Your Guide"
2. **QR Code Demo**:
   - Large QR code image (static, linked to demo manual)
   - "Simulate QR Scan" button → navigate to `/manual/demo-qr-123`
3. **Search Form**:
   - Make dropdown, Model input, Serial Number input
   - On submit: navigate to `/manual/:id`

**Deliverables**:
- `app/user/page.tsx`
- `components/QRCodeDisplay.tsx`
- `components/ManualSearchForm.tsx`

---

### Task 3.2: Manual Welcome Screen (`/manual/:id`)

**Layout**:
- Centered card: badge, product name, manufacturer, language picker
- Mode Selection (4 cards): Text with Images, Infographic, Video, AI Chat
- Download button (PDF / DOCX dropdown)

**Deliverables**:
- `app/manual/[id]/page.tsx`
- `components/ModeSelector.tsx`

---

### Task 3.3: Text with Images Mode

**Layout**:
- Desktop: Sidebar (250px) + Content (flex-1)
- Mobile: Hamburger → offcanvas sidebar

**Header Controls**:
- Language picker, TTS toggle, Font size (A−/A+), Contrast toggle, Download

**Deliverables**:
- `app/manual/[id]/text/page.tsx`
- `components/ManualSidebar.tsx`
- `components/AccessibilityControls.tsx`
- `hooks/useTTS.ts`

---

### Task 3.4: Infographic Mode

**Deliverables**:
- `app/manual/[id]/infographic/page.tsx`

---

### Task 3.5: Video Mode

**Deliverables**:
- `app/manual/[id]/video/page.tsx`
- `components/VideoPlayer.tsx`
- `components/SectionThumbnails.tsx`

---

### Task 3.6: AI Chat Mode

**Deliverables**:
- `app/manual/[id]/chat/page.tsx`
- `components/ChatContainer.tsx`
- `components/ChatMessage.tsx`
- `components/ChatInput.tsx`
- `app/api/chat/route.ts`
- `hooks/useVoiceInput.ts`

---

### Task 3.7: Accessibility Controls (Header, all modes)

**Controls**: Language Picker, TTS Toggle, Font Size (A−/A+), Contrast Toggle, Download

**Deliverables**:
- `components/AccessibilityControls.tsx`
- `context/AccessibilityContext.ts`
- `hooks/useAccessibility.ts`

---

## Detailed Phase 4: Advanced Features (Week 7)

### Task 4.1: AI Integration

**Objective**: AWS Bedrock (Claude 3 Sonnet) for document parsing, translation, chat, and knowledge base construction.

**Model**: `anthropic.claude-3-sonnet-20240229-v1:0` via `@aws-sdk/client-bedrock-runtime`
**Auth**: Same IAM role as Aurora (`AWS_ROLE_ARN`), scoped with `bedrock:InvokeModel` + `bedrock:InvokeModelWithResponseStream` permissions.

**Architecture**:
- `lib/ai.ts` — shared Bedrock client with helpers:
  - `bedrockInvoke(prompt)` — single-turn JSON response (used for parsing, translation)
  - `bedrockStream(messages)` — streaming `InvokeModelWithResponseStreamCommand` (used for chat)
  - `parseManualContent(sections)` — extracts structured sections from raw text
  - `translateContent(content, targetLang)` — translates a single section
  - `buildKnowledgeBase(sections)` — chunks content + generates knowledge base JSON
  - `generateChatResponse(messages, context)` — returns an async stream of tokens

**Endpoints**:
1. `POST /api/manuals`: On save, trigger AI pipeline:
   - If `uploadMethod === 'upload'` → parse PDF/DOCX content into sections via Bedrock
   - For each non-English language in `languages[]` → translate all sections via Bedrock
   - Build `manual_knowledge_base` entry from all section content
   - Save everything to Aurora in a single transaction
2. `POST /api/chat`: Streaming RAG chat:
   - Fetch `manual_knowledge_base.chunks` for the manual
   - Build a system prompt with the knowledge base context
   - Call `bedrockStream()` → forward token stream as `text/event-stream`

**Required Environment Variables**:
```
AWS_REGION=              # e.g. us-east-1
AWS_ROLE_ARN=            # IAM role with bedrock:InvokeModel + bedrock:InvokeModelWithResponseStream
BEDROCK_MODEL_ID=        # anthropic.claude-3-sonnet-20240229-v1:0
```

**Deliverables**:
- `lib/ai.ts` — Bedrock client + all AI helpers
- `POST /api/manuals` — AI pipeline integration
- `POST /api/chat` — streaming Bedrock RAG

---

### Task 4.2: File Storage via Vercel Blob

**Objective**: Store PDFs, images, videos securely via Vercel Blob. Store returned URLs in Aurora.

**Deliverables**:
- `lib/blob.ts`
- Integration in manual editor

---

### Task 4.3: Email Notifications (Optional)

**Skip for Phase 1**.

---

## Detailed Phase 5: Polish & Optimization (Week 8)

### Task 5.1: Performance Optimization

**Target Metrics**: LCP < 2.5s, FCP < 1.5s, CLS < 0.1, INP < 200ms

**Database Optimizations**:
- All indexes already defined in schema (see Task 1.1)
- Use Aurora **read replica** endpoint for analytics queries (set `DB_READ_HOST` env var)
- Use RDS Proxy for connection pooling — eliminates Lambda/serverless connection storm
- Paginate all list queries (`LIMIT 20 OFFSET n` or keyset pagination using `created_at < cursor`)
- Use `SELECT` only needed columns — never `SELECT *` in application code

**Application Optimizations**:
- `next/image` for all images (WebP + srcset)
- Dynamic imports for heavy components (charts, video player)
- ISR for manual pages (revalidate 1 hour)
- SWR with 30s stale-while-revalidate for dashboard/analytics

**Deliverables**:
- `next.config.ts` with optimization settings
- Performance monitoring setup

---

### Task 5.2: Accessibility Audit (WCAG 2.1 AA)

**Checklist**:
- [ ] Semantic HTML (`header`, `main`, `section`, `article`, `nav`)
- [ ] ARIA labels on interactive elements
- [ ] Keyboard navigation (Tab, Enter, Escape, Arrow keys)
- [ ] Focus indicators visible
- [ ] Color contrast > 4.5:1
- [ ] High-contrast mode works
- [ ] Form labels linked to inputs (`htmlFor`)
- [ ] `aria-live` on dynamic status blocks
- [ ] Alt text on all images
- [ ] Video captions and audio descriptions
- [ ] Mobile touch targets ≥ 44×44px

---

### Task 5.3: Responsive Design Testing

**Devices**: 375px, 390px, 411px (mobile) / 768px, 820px (tablet) / 1024px, 1280px, 1920px (desktop)

---

### Task 5.4: Error Handling & Validation

- Client-side validation (immediate feedback)
- Server-side validation (Zod schemas on all API routes)
- Loading / error / empty states on all data-dependent UI

---

### Task 5.5: Security

- CSRF tokens (Better Auth handles)
- Input sanitization (`sanitize-html` for user content)
- SQL injection prevention (Drizzle ORM parameterizes all queries)
- Rate limiting on API endpoints (optional, via Upstash Redis)
- Secrets only in server-side environment variables

---

## Detailed Phase 6: Deployment & DevOps (Week 8)

### Task 6.1: Vercel Deployment

**Environment Variables to Configure**:
```
DATABASE_URL=               # Aurora / RDS Proxy connection string (Better Auth)
DB_HOST=                    # Aurora writer endpoint (Drizzle IAM auth)
DB_READ_HOST=               # Aurora reader endpoint (analytics queries)
DB_USER=                    # IAM database user
DB_NAME=                    # Database name
AWS_REGION=                 # e.g. us-east-1
AWS_ACCESS_KEY_ID=          # IAM key (or use OIDC federation with Vercel)
AWS_SECRET_ACCESS_KEY=      # IAM secret
BETTER_AUTH_SECRET=         # Random secret (openssl rand -base64 32)
GOOGLE_GENAI_API_KEY=       # AI API
BLOB_READ_WRITE_TOKEN=      # Vercel Blob
```

**IAM Best Practice**: Use **OIDC federation** between Vercel and AWS rather than static IAM keys. This allows Vercel deployments to assume an IAM role without storing long-lived credentials.

**Setup Steps**:
1. Connect GitHub repo to Vercel
2. Configure all environment variables above
3. Set build command: `pnpm run build`
4. Enable Preview Deployments (PRs)
5. Custom domain configuration

---

### Task 6.2: Monitoring & Analytics

- **Error Tracking**: Sentry (optional)
- **User Analytics**: PostHog (optional)
- **Performance**: Vercel Analytics (Web Vitals)
- **Database**: RDS Performance Insights + Enhanced Monitoring (AWS Console)
- **Alerts**: CloudWatch alarms on DB CPU > 80%, connection count > 80% of max

---

### Task 6.3: Documentation

**Deliverables**:
- `README.md` — setup, tech stack, commands
- `API_DOCS.md` — endpoints, request/response formats
- `DEPLOYMENT.md` — Vercel + AWS setup steps, env vars, IAM policy

---

## Quick Prioritization Guide

**MVP (Must-Have) for Launch**:
1. Landing page
2. Login & authentication (Aurora-backed)
3. Manufacturer dashboard
4. Manual editor (basic)
5. Manual welcome screen
6. Text with Images mode
7. Analytics page (basic)

**Phase 2 Enhancements**:
- AI chat mode
- Video mode
- Infographic mode
- Advanced analytics
- Email notifications

**Phase 3 (Future)**:
- Mobile app (React Native)
- Multi-user teams
- Aurora Global Database (multi-region reads)
- Community features

---

## Success Metrics

- **Launch**: All MVP features working
- **Performance**: LCP < 2.5s, CLS < 0.1 on all pages
- **Accessibility**: WCAG 2.1 AA compliance
- **Mobile**: Perfect responsiveness on 375px–1920px
- **User Engagement**: >80% mode completion rate
- **AI Quality**: Translation accuracy >95%, chat relevance >85%
- **Uptime**: 99.5%+ availability (Aurora Multi-AZ ensures automatic failover < 30s)

---

*Document Last Updated: June 2026*
