# ClearGuide — Comprehensive Build Plan

## Executive Summary

This document outlines a complete, professional build plan for ClearGuide—a platform for manufacturers to create accessible product manuals and for end users to consume them via multiple modes (text, infographics, video, AI chat). The architecture prioritizes **performance**, **accessibility (WCAG 2.1 AA)**, **responsive design**, and **user engagement**.

---

## Architecture Overview

### Technology Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS v4 with CSS custom properties for theming
- **UI Components**: shadcn/ui, Lucide React icons
- **State Management**: React Context + SWR for data fetching
- **Database**: Neon (PostgreSQL) with Drizzle ORM
- **Authentication**: Better Auth with email/password
- **File Storage**: Vercel Blob for PDFs, images, videos
- **AI Integration**: Google Genai API for translation, parsing, knowledge base
- **Speech**: Web Speech API (client-side) for TTS and voice input
- **Analytics**: PostHog (optional, for user engagement tracking)

### Design System

- **Color Palette**: Emerald green (#16a34a) as primary accent, neutral grays for UI, high-contrast black/yellow for accessibility
- **Typography**: Inter (body), heading hierarchy with line-height 1.5–1.6
- **Spacing**: Tailwind scale (4px grid: px-4, py-6, gap-4)
- **Breakpoints**: Mobile-first (sm: 640px, md: 768px, lg: 1024px, xl: 1280px)
- **Accessibility**: ARIA labels, semantic HTML, keyboard navigation, focus indicators, color contrast >4.5:1

---

## Database Schema

### Users Table
```sql
id, email, password_hash, created_at, updated_at
```

### Manuals Table
```sql
id, manufacturer_id, product_name, product_model, brand, serial_number,
status (draft/published), languages (JSON array), created_at, updated_at
```

### Manual Sections Table
```sql
id, manual_id, section_number, title, content, image_urls (JSON),
video_urls (JSON), created_at, updated_at
```

### Translations Table
```sql
id, manual_id, language, translated_content (JSON), created_at
```

### Analytics Table
```sql
id, manual_id, user_session_id, mode (text/infographic/video/chat),
time_spent_seconds, viewed_at, created_at
```

### AI Chat History Table
```sql
id, manual_id, user_session_id, role (user/assistant), message, created_at
```

---

## Phase 1: Core Foundation (Week 1–2)

### 1.1 Database & Authentication Setup
- [x] Initialize Neon database with schema
- [x] Set up Drizzle ORM migrations
- [x] Configure Better Auth (email/password, session management)
- [x] Create auth middleware for protected routes

### 1.2 Project Structure & Configuration
- [x] Set up Next.js 16 with App Router
- [x] Configure Tailwind CSS v4 with custom properties
- [x] Create reusable component library structure (`/components/ui`, `/components/layout`, `/components/forms`)
- [x] Configure environment variables (.env.local)
- [x] Set up PostCSS for CSS processing

### 1.3 Landing Page (`/`)
- [ ] Hero section with value proposition and stats
- [ ] Feature cards (Dashboard, AI Chat, QR, Analytics)
- [ ] "Seamless Integration" workflow section
- [ ] Pricing plans (Free / Pro / Enterprise)
- [ ] CTA buttons ("Get Started Free", "Login")
- [ ] Footer with links and legal
- [ ] Responsive design for mobile/tablet/desktop
- [ ] Performance: target LCP < 2.5s, CLS < 0.1

---

## Phase 2: Manufacturer Features (Week 2–4)

### 2.1 Authentication Pages
- [ ] **Login Page** (`/manufacturer/login`)
  - Email & password input fields
  - Demo credentials hint box (auto-fill on click)
  - "Forgot Password" link (placeholder)
  - Error/success toast notifications
  - Redirect to dashboard on success

### 2.2 Manufacturer Dashboard (`/manufacturer/dashboard`)
- [ ] Grid layout of manual cards (responsive: 1 col mobile, 2 col tablet, 3 col desktop)
- [ ] Card UI: product name, status badge, last updated, action buttons (Edit, Analytics, Delete)
- [ ] Empty state with "Create New Manual" CTA
- [ ] Search/filter by product name
- [ ] Pagination or infinite scroll if many manuals
- [ ] Soft delete confirmation modal before deletion

### 2.3 Manual Editor (`/manufacturer/new` & `/manufacturer/edit/:id`)

#### Step 1: Basic Information
- [ ] Product Name, Model, Brand, Serial Number inputs
- [ ] Auto-save draft to localStorage during edit
- [ ] Field validation (required fields)

#### Step 2: Language Selection
- [ ] Grid of 16 language flags + names
- [ ] English always selected and locked
- [ ] Counter badge showing selected languages
- [ ] AI hint explaining auto-translation
- [ ] Checkmark on selected languages

#### Step 3a: Upload Manual (Option A)
- [ ] Drag-and-drop or click-to-upload PDF/Word (up to 50 MB)
- [ ] File preview (name, size) with remove button
- [ ] Progress bar during upload
- [ ] AI hint explaining auto-extraction

#### Step 3b: Build Sections (Option B)
- [ ] Section list with add/delete/reorder functionality
- [ ] For each section:
  - [ ] Title input
  - [ ] Content textarea (resizable)
  - [ ] Image upload (drag-and-drop, thumbnails)
  - [ ] Video upload (drag-and-drop, file list)
- [ ] "Change Method" link to switch to upload
- [ ] Section validation (title + at least text or image required)

#### Step 4: Save & Publish
- [ ] Status dropdown (Draft / Published)
- [ ] Save button triggers AI Processing overlay
- [ ] **AI Processing Overlay**:
  1. Parsing document structure (spinner)
  2. Extracting sections and headings
  3. Generating accessibility metadata
  4. Building AI knowledge base
  5. Optimizing for multimodal delivery
  6. Finalizing and publishing
- [ ] Progress bar showing overall completion
- [ ] "Manual Ready!" success state
- [ ] Redirect to dashboard

### 2.4 Analytics Page (`/manufacturer/analytics/:id`)
- [ ] KPI cards: Total Views, Active Users (30 days), Average Time Spent
- [ ] "Views Over Time" line chart (last 7 days)
  - X-axis: dates, Y-axis: views
  - Emerald line with hover tooltips
- [ ] "Top AI Support Queries" horizontal bar chart
  - Query text on Y-axis, count on X-axis
- [ ] Responsive layout (stacked on mobile)
- [ ] Export data as CSV (optional enhancement)

---

## Phase 3: End User Features (Week 4–6)

### 3.1 End User Portal (`/user`)
- [ ] QR code display image
- [ ] "Simulate QR Scan" button for demo
- [ ] Search form:
  - Make (Manufacturer) dropdown or text input
  - Model text input
  - Serial Number text input
  - Search button (disabled until all fields filled)
- [ ] Responsive layout: stack on mobile, side-by-side on desktop

### 3.2 Manual Welcome Screen (`/manual/:id`)
- [ ] Product badge ("Product Manual")
- [ ] Product name heading
- [ ] Manufacturer name
- [ ] Language picker (16 languages, flag icons)
- [ ] Four mode cards:
  1. Text with Images
  2. Infographic
  3. Video
  4. AI Chat
- [ ] Download button (PDF / DOCX export)
- [ ] Animation/transition to selected mode

### 3.3 Text with Images Mode
- [ ] Responsive layout:
  - Desktop: sidebar + content (flex)
  - Mobile: hamburger menu → full-width content
- [ ] Sidebar: section list (clickable, active indicator)
- [ ] Content area:
  - Section image (capped at 45vh, responsive)
  - Section title
  - Section text (justified, line-height 1.6)
  - Font size controls (A−/A+): 12px–32px
- [ ] TTS toggle in header (reads section aloud)
- [ ] Previous/Next section buttons at bottom
- [ ] ARIA labels for screen readers

### 3.4 Infographic Mode
- [ ] Full-screen infographic display (object-contain)
- [ ] Slim title bar with product name
- [ ] No sidebar (immersive experience)
- [ ] Responsive: image scales to fit viewport height

### 3.5 Video Mode
- [ ] **Desktop layout**: video player (left, flex-1) + section thumbnails (right, 200px)
- [ ] **Mobile layout**: video player (full width) + horizontal scroll section thumbnails
- [ ] Main video player:
  - Autoplay enabled
  - Controls (play, pause, volume, fullscreen)
  - Progress bar
- [ ] Audio description transcript in emerald callout below player
- [ ] Section thumbnails:
  - Video frame preview image
  - Section title
  - Play icon overlay
  - Emerald border on active thumbnail
  - Clickable to switch video

### 3.6 AI Chat Mode
- [ ] Chat header:
  - AI assistant name/status
  - Audio toggle (🔊/🔇)
  - Live status display ("Listening…", "Processing…", "Ready")
- [ ] Chat message list:
  - User messages (right-aligned, blue bubble)
  - AI messages (left-aligned, gray bubble)
  - Typing animation while AI generates response
  - "Listening — tap mic to stop" pill during voice input
- [ ] Input bar:
  - Mic button (left): toggles red when listening
  - Text input (middle): disabled while mic active
  - Send button (right)
- [ ] Voice input via Web Speech API
- [ ] Voice output via Web Speech API (if audio toggle on)
- [ ] Session persistence (local storage or DB)

### 3.7 Accessibility Controls (Header, all modes)
- [ ] Language picker: 16 languages with flag + name
- [ ] TTS toggle (text mode only)
- [ ] A− / A+ buttons: font size 12px–32px
- [ ] Contrast toggle: high-contrast mode (black bg, yellow text)
- [ ] Download button: PDF or DOCX export

### 3.8 Language Translation
- [ ] Banner at top of content: "Showing AI-translated content in 🇫🇷 French"
- [ ] "Switch to English" link
- [ ] Language picker always accessible in header
- [ ] Smooth transition when switching languages

---

## Phase 4: Advanced Features (Week 6–7)

### 4.1 AI Integration
- [ ] Google Genai API for:
  - PDF/document parsing
  - Section extraction
  - Accessibility metadata generation
  - Language translation (16 languages)
  - AI chat knowledge base context
- [ ] Rate limiting and error handling
- [ ] Fallback responses for rate limits

### 4.2 File Storage & CDN
- [ ] Vercel Blob integration for:
  - PDF uploads
  - Image uploads (manual sections, infographics)
  - Video uploads (section videos)
- [ ] Thumbnail generation for videos
- [ ] Image optimization (WebP, responsive sizes)

### 4.3 Email Notifications (Optional)
- [ ] Password reset email
- [ ] Manual published notification (to manufacturer)
- [ ] Analytics digest email (weekly)

---

## Phase 5: Polish & Optimization (Week 7–8)

### 5.1 Performance Optimization
- [ ] Image optimization (next/image, WebP, srcset)
- [ ] Code splitting and lazy loading
- [ ] Service Worker for offline support (optional)
- [ ] Database query optimization and indexing
- [ ] Caching strategy (ISR for manual pages, SWR for dynamic data)
- [ ] Target metrics:
  - LCP: < 2.5s
  - FCP: < 1.5s
  - CLS: < 0.1
  - INP: < 200ms

### 5.2 Accessibility Audit
- [ ] WCAG 2.1 AA compliance check
- [ ] Automated axe-core scan
- [ ] Manual keyboard navigation test
- [ ] Screen reader testing (NVDA, JAWS, VoiceOver)
- [ ] Color contrast verification
- [ ] ARIA labels and roles verification

### 5.3 Responsive Design Testing
- [ ] Mobile (375px): iPhone SE, iPhone 14
- [ ] Tablet (768px): iPad
- [ ] Desktop (1024px+): various widths
- [ ] Orientation changes
- [ ] Touch vs. mouse interactions

### 5.4 Error Handling & Validation
- [ ] Form validation with clear error messages
- [ ] API error handling with user-friendly toasts
- [ ] Fallback UI states (loading, error, empty)
- [ ] 404 and 500 error pages

### 5.5 Security
- [ ] CSRF protection on forms
- [ ] XSS prevention (sanitize user input)
- [ ] Rate limiting on API endpoints
- [ ] SQL injection prevention (ORM + parameterized queries)
- [ ] Environment variable security (no secrets in client code)

---

## Phase 6: Deployment & DevOps (Week 8)

### 6.1 Vercel Deployment
- [ ] Connect GitHub repository to Vercel
- [ ] Configure build settings and environment variables
- [ ] Enable automatic deployments on push to main
- [ ] Set up preview deployments for pull requests
- [ ] Configure custom domain

### 6.2 Monitoring & Analytics
- [ ] Set up PostHog for user analytics (optional)
- [ ] Error tracking (Sentry)
- [ ] Performance monitoring (Web Vitals via Analytics)
- [ ] Log aggregation (if needed)

### 6.3 Documentation
- [ ] README with setup instructions
- [ ] API documentation
- [ ] Component storybook (optional)
- [ ] Deployment guide

---

## Component Inventory

### Layout Components
- `Header` (with nav, auth status)
- `Sidebar` (for manufacturer and manual pages)
- `Footer`
- `Container` (responsive max-width wrapper)
- `Grid` (responsive grid layouts)

### UI Components
- `Button` (primary, secondary, danger)
- `Input` (text, email, password)
- `Textarea` (resizable)
- `Select` (dropdown)
- `Checkbox`
- `Radio`
- `Badge` (status indicator)
- `Card` (container with shadow/border)
- `Modal` (dialog)
- `Toast` (notifications)
- `Spinner` (loading indicator)
- `Skeleton` (loading placeholder)

### Form Components
- `FormField` (label + input + error)
- `MultiSelect` (languages, tags)
- `FileUpload` (drag-and-drop)
- `ImageGallery` (thumbnail grid)
- `RichTextEditor` (for manual content)

### Data Visualization
- `LineChart` (views over time)
- `BarChart` (top queries)
- `KPICard` (metric display)

### Specific Features
- `LanguagePicker` (16 languages)
- `AccessibilityControls` (font size, contrast, TTS)
- `ManualCard` (dashboard grid item)
- `ModeSelector` (text/infographic/video/chat)
- `ChatMessage` (message bubble)
- `VideoPlayer` (with section thumbnails)
- `AIProcessingOverlay` (upload progress)

---

## Testing Strategy

### Unit Tests
- Component rendering and props
- Form validation
- Utility functions
- API response parsing

### Integration Tests
- User authentication flow
- Manual creation and save
- File uploads
- AI processing

### E2E Tests (Playwright)
- Manufacturer landing → login → create manual → dashboard
- End user search → manual view → mode switching
- Accessibility workflows (keyboard nav, screen reader)

---

## Accessibility Checklist

- [ ] Semantic HTML (header, main, section, article, nav)
- [ ] ARIA labels on interactive elements
- [ ] Keyboard navigation (Tab, Enter, Escape)
- [ ] Focus indicators visible (outline, ring)
- [ ] Color contrast > 4.5:1 for text
- [ ] High-contrast mode support
- [ ] Form labels explicitly linked to inputs
- [ ] Error messages tied to fields (aria-describedby)
- [ ] Screen reader announcements (aria-live)
- [ ] Alt text on all images
- [ ] Responsive text scaling (12px–32px)
- [ ] Mobile touch targets ≥ 44×44px

---

## Performance Targets

| Metric | Target | Tool |
|--------|--------|------|
| LCP | < 2.5s | Lighthouse |
| FCP | < 1.5s | Lighthouse |
| CLS | < 0.1 | Lighthouse |
| INP | < 200ms | Lighthouse |
| Time to Interactive | < 3.5s | Lighthouse |
| Build Size | < 100KB (gzipped) | next/stats |

---

## Timeline Summary

| Phase | Duration | Deliverables |
|-------|----------|--------------|
| 1: Foundation | 2 weeks | DB, auth, landing page, project setup |
| 2: Manufacturer | 2 weeks | Dashboard, editor, analytics |
| 3: End User | 2 weeks | Portal, 4 view modes, accessibility controls |
| 4: Advanced | 1 week | AI, storage, notifications |
| 5: Polish | 1 week | Performance, accessibility, testing |
| 6: Deployment | 1 week | Vercel, monitoring, documentation |
| **Total** | **8 weeks** | **Production-ready ClearGuide** |

---

## Success Criteria

- ✓ All user journeys functional and tested
- ✓ WCAG 2.1 AA compliance
- ✓ Performance targets met (LCP, FCP, CLS, INP)
- ✓ Mobile-responsive across all breakpoints
- ✓ Deployed on Vercel with CI/CD
- ✓ Error handling and validation throughout
- ✓ User-facing analytics working
- ✓ AI features (translation, chat, parsing) functional
- ✓ File uploads and storage working
- ✓ Documentation complete

---

*Last Updated: June 2026*
