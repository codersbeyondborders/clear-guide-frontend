# ClearGuide — System Architecture

## System Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                          End Users                               │
│  (QR Scan / Search) → Landing Page → Portal → Welcome Screen    │
└────────────────────────────┬──────────────────────────────────────┘
                             │
                ┌────────────┼────────────┐
                │            │            │
          ┌─────▼──┐  ┌──────▼───┐  ┌────▼────┐
          │  Text  │  │   Video  │  │   Chat  │
          │ Mode   │  │   Mode   │  │  Mode   │
          └────────┘  └──────────┘  └─────────┘
                             │
                ┌────────────┴──────────────┐
                │                           │
       ┌────────▼──────────┐      ┌────────▼────────┐
       │  Next.js Frontend │      │  Node.js API    │
       │  (React 19)       │      │  (Route Handler)│
       └────────┬──────────┘      └────────┬────────┘
                │                          │
       ┌────────┴──────────────────────────┴────────┐
       │                                             │
    ┌──▼────────┐  ┌─────────────┐  ┌──────────┐   │
    │   Blob    │  │  Aurora DB  │  │   AI API │   │
    │  Storage  │  │ (PostgreSQL)│  │ (Genai)  │   │
    └───────────┘  └─────────────┘  └──────────┘   │
       │
       └─────────────────────────────────────────────┘
```

---

## Technology Layers

### Client (Browser)
```
┌──────────────────────────────────────────┐
│         React 19 Components              │
│  ┌──────────────────────────────────────┤
│  │  Pages (routing via Next.js)         │
│  │  - Landing (/)                       │
│  │  - Login (/manufacturer/login)       │
│  │  - Dashboard (/manufacturer/...)     │
│  │  - Manual Views (/manual/[id]/...)   │
│  │  - Portal (/user)                    │
│  └──────────────────────────────────────┤
│  ┌──────────────────────────────────────┤
│  │  Components (reusable, typed)        │
│  │  - UI (Button, Input, Card, etc.)    │
│  │  - Layout (Header, Sidebar, etc.)    │
│  │  - Domain-Specific                   │
│  └──────────────────────────────────────┤
│  ┌──────────────────────────────────────┤
│  │  Hooks & State                       │
│  │  - useAuth (Better Auth)             │
│  │  - useManuals (SWR)                  │
│  │  - useAccessibility (Context)        │
│  │  - useTTS (Web Speech API)           │
│  │  - useVoiceInput (Web Speech API)    │
│  └──────────────────────────────────────┤
│  ┌──────────────────────────────────────┤
│  │  Styling                             │
│  │  - Tailwind CSS v4                   │
│  │  - CSS Custom Properties             │
│  │  - High-Contrast Mode CSS            │
│  └──────────────────────────────────────┘
└──────────────────────────────────────────┘
```

### Server (Next.js / Node.js)
```
┌──────────────────────────────────────────┐
│        Next.js App Router                │
│  ┌──────────────────────────────────────┤
│  │  Route Handlers (/app/api/...)       │
│  │  - POST /api/auth/sign-in            │
│  │  - POST /api/auth/sign-out           │
│  │  - GET/POST /api/manuals             │
│  │  - PUT/DELETE /api/manuals/:id       │
│  │  - GET /api/manuals/:id/analytics    │
│  │  - POST /api/chat                    │
│  │  - GET /api/manuals/:id/download     │
│  └──────────────────────────────────────┤
│  ┌──────────────────────────────────────┤
│  │  Server Functions                    │
│  │  - Auth (Better Auth)                │
│  │  - Database (Drizzle ORM + pg, IAM)  │
│  │  - AI (Google Genai)                 │
│  │  - Storage (Vercel Blob)             │
│  │  - File Processing                   │
│  └──────────────────────────────────────┤
│  ┌──────────────────────────────────────┤
│  │  Middleware                          │
│  │  - Auth protection                   │
│  │  - CORS headers                      │
│  │  - Rate limiting (optional)          │
│  └──────────────────────────────────────┘
└──────────────────────────────────────────┘
```

### Database (AWS Aurora PostgreSQL 16)
```
┌──────────────────────────────────────────────────────┐
│   AWS Aurora PostgreSQL 16 (Multi-AZ, RDS Proxy)     │
│                                                       │
│  Connection: pg Pool + @aws-sdk/rds-signer (IAM)     │
│  Pooling:    RDS Proxy (serverless-safe)             │
│  Encryption: KMS at-rest + TLS in-transit            │
│  ORM:        Drizzle ORM (drizzle-orm/node-postgres) │
│                                                       │
│  ┌────────────────────────────────────────────────┤  │
│  │  user  (Better Auth)                           │  │
│  │  - id TEXT PK, name, email UNIQUE              │  │
│  │  - emailVerified, image                        │  │
│  │  - createdAt TIMESTAMPTZ, updatedAt TIMESTAMPTZ│  │
│  └────────────────────────────────────────────────┤  │
│  ┌────────────────────────────────────────────────┤  │
│  │  session  (Better Auth)                        │  │
│  │  - id TEXT PK, token UNIQUE, expiresAt         │  │
│  │  - userId FK → user(id) ON DELETE CASCADE      │  │
│  │  - idx: (userId), (expiresAt)                  │  │
│  └────────────────────────────────────────────────┤  │
│  ┌────────────────────────────────────────────────┤  │
│  │  account  (Better Auth)                        │  │
│  │  - id TEXT PK, providerId, accountId           │  │
│  │  - userId FK → user(id) ON DELETE CASCADE      │  │
│  │  - uidx: (providerId, accountId)               │  │
│  └────────────────────────────────────────────────┤  │
│  ┌────────────────────────────────────────────────┤  │
│  │  verification  (Better Auth)                   │  │
│  │  - id TEXT PK, identifier, value, expiresAt    │  │
│  └────────────────────────────────────────────────┤  │
│  ┌────────────────────────────────────────────────┤  │
│  │  manuals  (App)                                │  │
│  │  - id UUID PK (gen_random_uuid())              │  │
│  │  - userId TEXT NOT NULL (scoped, no FK)        │  │
│  │  - product_name, product_model, brand          │  │
│  │  - status ENUM(draft|processing|published|     │  │
│  │           archived)                            │  │
│  │  - languages TEXT[]                            │  │
│  │  - deleted_at TIMESTAMPTZ  (soft delete)       │  │
│  │  - idx: (userId, status), (userId, created_at) │  │
│  └────────────────────────────────────────────────┤  │
│  ┌────────────────────────────────────────────────┤  │
│  │  manual_sections  (App)                        │  │
│  │  - id UUID PK, manual_id UUID, section_number  │  │
│  │  - title, content TEXT                         │  │
│  │  - image_urls TEXT[], video_urls TEXT[]         │  │
│  │  - uidx: (manual_id, section_number)           │  │
│  └────────────────────────────────────────────────┤  │
│  ┌────────────────────────────────────────────────┤  │
│  │  translations  (App)                           │  │
│  │  - id UUID PK, manual_id UUID, section_id UUID │  │
│  │  - language TEXT (BCP-47), translated_content  │  │
│  │  - uidx: (manual_id, section_id, language)     │  │
│  └────────────────────────────────────────────────┤  │
│  ┌────────────────────────────────────────────────┤  │
│  │  analytics  (App — monthly partitioned)        │  │
│  │  - id UUID PK, manual_id UUID                  │  │
│  │  - user_session_id TEXT, mode ENUM             │  │
│  │  - time_spent_seconds INT, viewed_at TIMESTAMPTZ│ │
│  │  - idx: (manual_id, viewed_at DESC)            │  │
│  └────────────────────────────────────────────────┤  │
│  ┌────────────────────────────────────────────────┤  │
│  │  ai_chat_history  (App — monthly partitioned)  │  │
│  │  - id UUID PK, manual_id UUID                  │  │
│  │  - user_session_id TEXT, role ENUM(user|assistant)│ │
│  │  - message TEXT, token_count INT               │  │
│  │  - idx: (manual_id, session_id, created_at ASC)│  │
│  └────────────────────────────────────────────────┤  │
│  ┌────────────────────────────────────────────────┤  │
│  │  manual_knowledge_base  (App)                  │  │
│  │  - id UUID PK, manual_id UUID UNIQUE           │  │
│  │  - chunks JSONB, model_version TEXT            │  │
│  └────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────┘
```

### External Services
```
┌────────────────────────────────────────────────────┐
│              Third-Party APIs                      │
│  ┌──────────────────────────────────────────────┤ │
│  │  Vercel Blob (File Storage)                  │ │
│  │  - PDF uploads (manuals)                     │ │
│  │  - Image uploads (sections)                  │ │
│  │  - Video uploads (sections)                  │ │
│  │  - Download exports (PDF/DOCX)              │ │
│  └──────────────────────────────────────────────┤ │
│  ┌──────────────────────────────────────────────┤ │
│  │  Google Genai API                            │ │
│  │  - Document parsing                          │ │
│  │  - Content translation (16 languages)        │ │
│  │  - AI chat responses (knowledge base)        │ │
│  │  - Accessibility metadata generation        │ │
│  └──────────────────────────────────────────────┤ │
│  ┌──────────────────────────────────────────────┤ │
│  │  Web APIs (Client-side)                      │ │
│  │  - Web Speech API (TTS, voice input)         │ │
│  │  - localStorage (user preferences)           │ │
│  │  - navigator.share (optional)                │ │
│  └──────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────┘
```

---

## Data Flow Diagrams

### Manufacturer Creating a Manual

```
1. Manufacturer enters form data (product info, languages)
   ↓
2. Uploads file or builds sections (with drag-and-drop)
   ↓
3. Submits → POST /api/manuals (multipart form data)
   ↓
4. Backend:
   a. Validates input
   b. Uploads file to Vercel Blob
   c. Triggers AI processing:
      - Parse document structure (PDF → sections)
      - Extract images and metadata
      - Generate alt text for accessibility
      - Build AI knowledge base from content
      - Translate content to 16 languages
   d. Save manual, sections, translations to Aurora DB
   ↓
5. Return success → Redirect to dashboard
```

### End User Consuming a Manual (Text Mode)

```
1. User scans QR code or searches → /manual/:id
   ↓
2. GET /manual/:id → Fetch manual data from Aurora
   ↓
3. Show Welcome Screen (language picker + mode selector)
   ↓
4. User selects "Text with Images"
   ↓
5. Fetch sections → Display sidebar + content
   ↓
6. User interactions:
   - Click section → Update content area
   - Toggle TTS → Play audio via Web Speech API
   - Adjust font size → Update CSS custom property
   - Toggle contrast → Apply high-contrast CSS class
   - Download → Fetch pre-generated PDF from Blob storage
   ↓
7. Log analytics → POST /api/manuals/:id/analytics
   (session_id, mode, time_spent, viewed_at)
```

### AI Chat Interaction

```
1. User clicks AI Chat mode
   ↓
2. Show chat UI (empty message list, input bar)
   ↓
3. User speaks (mic) or types question
   ↓
4. Submit → POST /api/chat
   {
     manual_id: string,
     session_id: string,
     message: string,
     mode: 'text' | 'voice'
   }
   ↓
5. Backend:
   a. Retrieve manual knowledge base from Aurora (manual_knowledge_base table)
   b. Build AI context (sections, content)
   c. Call Google Genai API with question + context
   d. Stream response back
   e. Save to ai_chat_history table
   ↓
6. Append AI response to chat UI
   ↓
7. If audio toggle ON:
   - Use Web Speech API to speak response
   ↓
8. User can ask follow-up questions (loop back to step 3)
```

---

## Component Hierarchy

```
<RootLayout>
  ├─ <Header>
  │  ├─ Logo
  │  ├─ Navigation
  │  └─ Auth Status
  │
  ├─ <main>
  │  └─ Page Route (children)
  │     └─ Specific page components
  │
  └─ <Footer>

Example for /manual/:id (Text Mode):
  <ManualLayout>
    ├─ <Header>
    │  ├─ LanguagePicker
    │  ├─ TTSToggle
    │  ├─ FontSizeControls (A−/A+)
    │  ├─ ContrastToggle
    │  └─ DownloadButton
    │
    ├─ <main className="flex">
    │  ├─ <Sidebar>
    │  │  └─ SectionList
    │  │     └─ SectionItem (repeating)
    │  │
    │  └─ <ContentArea>
    │     ├─ SectionImage
    │     ├─ SectionText
    │     ├─ PreviousButton
    │     └─ NextButton
```

---

## API Endpoint Structure

```
Authentication
  POST   /api/auth/sign-in
  POST   /api/auth/sign-out
  GET    /api/auth/session

Manuals
  GET    /api/manuals (list, filtered by user)
  POST   /api/manuals (create)
  GET    /api/manuals/:id (fetch one)
  PUT    /api/manuals/:id (update)
  DELETE /api/manuals/:id (soft delete)
  GET    /api/manuals/:id/download (export PDF/DOCX)

Analytics
  GET    /api/manuals/:id/analytics (KPIs + charts)
  POST   /api/analytics/log (client-side tracking)

Chat
  POST   /api/chat (user message → AI response)
  GET    /api/chat/history/:manual_id/:session_id

Files (Storage)
  POST   /api/upload (uploads to Vercel Blob)
  GET    /api/download/:file_id
```

---

## State Management Strategy

### Client-Side State (React Context + localStorage)

**AccessibilityContext** (global):
- language (string)
- fontSize (12–32)
- contrastMode (boolean)
- audioEnabled (boolean)

**ManualEditorContext** (page scope):
- step (1–4)
- formData (product info, languages, content)

**SessionContext** (page scope):
- currentSection (section_id)
- sessionId (unique per user session)

### Server-Side State (Aurora PostgreSQL Database)
- All user data, manuals, analytics
- Translated content (cached)
- AI chat history

### Real-Time State (SWR)
```typescript
// Revalidate every 30s, stale-while-revalidate
useManuals() → GET /api/manuals
useAnalytics(id) → GET /api/manuals/:id/analytics
```

---

## Caching Strategy

| Resource | Strategy | TTL |
|----------|----------|-----|
| Landing page | ISR (Incremental Static Regeneration) | 1 hour |
| Manual pages | ISR | 1 hour |
| Dashboard | SWR (stale-while-revalidate) | 30s |
| Analytics | SWR | 1 minute |
| Images (Blob) | CDN with browser cache | 30 days |
| Auth session | Cookie (httpOnly, secure) | 30 days |

---

## Error Handling Flow

```
Client Error (4xx)
  ↓
Show user-friendly toast: "Please check your input"
+ Specific field error if form

Server Error (5xx)
  ↓
Log to error tracking (Sentry, optional)
  ↓
Show generic toast: "Something went wrong (Error ID: xyz)"
  ↓
Show retry button

Network Error
  ↓
Show offline banner
  ↓
Retry queue (SWR auto-retry)
```

---

## Security Layers

```
Client
  ↓ HTTPS (Vercel)
  ↓ CSRF token (Better Auth)
  ↓ Input sanitization (DOMPurify)
  ↓
Server
  ↓ Auth middleware (check session)
  ↓ Rate limiting (optional, Upstash)
  ↓ Input validation (Zod/Yup)
  ↓ SQL injection prevention (Drizzle ORM parameterizes all queries)
  ↓ Output sanitization
  ↓
Database
  ↓ Aurora encrypted at-rest (KMS) + in-transit (TLS enforced)
  ↓ IAM-authenticated connections via RDS Proxy
  ↓ UserId-scoped queries on every row (no RLS — enforced in application layer)
```

---

## Performance Optimization Points

| Layer | Optimization |
|-------|-------------|
| **Network** | Image WebP + srcset, gzip, CDN (Vercel) |
| **Client** | Code splitting, dynamic imports, SWR |
| **Render** | React 19 optimizations, memo, useCallback |
| **Database** | Indexes on FK & status, pagination |
| **API** | Response caching (SWR), ISR |
| **Storage** | Blob CDN, image optimization |

---

## Deployment & Infrastructure

```
GitHub Repository
  ↓
  Push to main
  ↓
Vercel CI/CD
  ↓
  Build: pnpm run build
  ↓
  Test: optional (e2e tests)
  ↓
  Deploy to Vercel Edge Network
  ↓
  Database: Aurora PostgreSQL (migrations via scripts/migrate.ts, DDL manual)
  IAM Auth: RDS Signer token refresh on every connection
  ↓
  Storage: Vercel Blob (auto-provisioned)
  ↓
  Live on https://clearguide.vercel.app
```

---

## Monitoring & Observability

```
Error Tracking: Sentry (optional)
  ├─ Client errors
  ├─ Server errors
  └─ Performance issues

User Analytics: PostHog (optional)
  ├─ Feature usage
  ├─ User funnels
  └─ Session recordings

Performance: Vercel Analytics
  ├─ Web Vitals (LCP, FCP, CLS, INP)
  ├─ Edge response times
  └─ Deployment metrics

Logs: Vercel Functions logging + Sentry
```

---

*Last Updated: June 2026*
