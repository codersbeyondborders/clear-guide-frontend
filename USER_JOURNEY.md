# ClearGuide — User Journey Document

---

## Overview

ClearGuide serves two distinct user types: **Manufacturers** who create and publish accessible product manuals, and **End Users** who consume those manuals. This document describes the full journey for each.

---

## 1. Manufacturer Journey

### 1.1 Discovery & Sign-up

The manufacturer lands on the **ClearGuide landing page** (`/`).

- They see the hero section with the value proposition: "Your Manuals, Simplified"
- Key stats (10,000+ manuals, 98% accessibility score, 300+ manufacturers) build trust
- Feature cards highlight the Manufacturer Dashboard, AI Chat, QR Integration, and Analytics
- The "Seamless Integration" section shows the workflow and setup time
- Pricing plans (Free / Pro / Enterprise) help them choose a tier
- They click **"Get Started Free"** or **"Login"** in the nav

---

### 1.2 Authentication

The manufacturer is taken to the **Login page** (`/manufacturer/login`).

- They enter their email and password
- A demo credentials hint box shows `demo@brewtech.com` / `password123` for quick access
- Clicking the credential values auto-fills the form
- On successful login they are redirected to the **Manufacturer Dashboard**

---

### 1.3 Manufacturer Dashboard (`/manufacturer/dashboard`)

The dashboard is the central hub for managing all manuals.

- The manufacturer sees a grid of all their published and draft manuals
- Each card shows: product name, status badge (Published / Draft), last updated date
- Three actions per card: **Edit**, **Analytics**, **Delete**
- An empty state prompts them to create their first manual
- They click **"Create New Manual"** to begin

---

### 1.4 Creating a Manual (`/manufacturer/new`)

The manual editor is a multi-step form.

**Step 1 — Basic Information**
- Product Name, Product Model, Make (Brand), Serial Number
- These fields identify the product and are used for QR-based lookup

**Step 2 — Language Translations**
- A grid of 16 languages with flag icons
- English is always selected and locked
- Selecting additional languages queues AI auto-translation on save
- A counter badge shows how many languages are selected
- An AI callout lists which languages will be translated

**Step 3 — Add Manual Content**
The manufacturer chooses one of two methods:

**Option A: Upload Manual**
- Drag-and-drop or click to upload a PDF or Word document (up to 50 MB)
- The uploaded file is shown with name and size, with an option to remove
- An AI hint explains that sections, accessibility metadata, and the AI chat knowledge base will be extracted automatically on save

**Option B: Manual Sections**
- The manufacturer builds the manual section by section
- Each section has:
  - Section Title
  - Text Content (resizable textarea)
  - Image uploads (drag-and-drop, PNG/JPG/WebP, thumbnail grid preview)
  - Video uploads (drag-and-drop, MP4/MOV/WebM, file list)
- Sections can be added, reordered, and deleted
- A "Change method" link lets them switch back to Upload at any time

**Step 4 — Save**
- The manufacturer sets the status (Draft or Published) via a dropdown
- Clicking **"Save Manual"** triggers the **AI Processing overlay**:
  1. Parsing document structure
  2. Extracting sections and headings
  3. Generating accessibility metadata
  4. Building AI knowledge base
  5. Optimising for multimodal delivery
  6. Finalising and publishing
- Each step shows a spinner while active and a checkmark when complete
- A progress bar tracks overall completion
- On finish, a "Manual Ready!" success state appears, then the manufacturer is redirected to the dashboard

---

### 1.5 Editing a Manual (`/manufacturer/edit/:id`)

- Same editor as creation, pre-populated with existing data
- The manufacturer can update any field, add/remove sections, or change status
- Save triggers the same AI Processing overlay

---

### 1.6 Analytics (`/manufacturer/analytics/:id`)

The analytics page gives the manufacturer insight into how their manual is being used.

- **KPI cards**: Total Views, Active Users (30 days), Average Time Spent
- **Views Over Time** line chart (last 7 days) — emerald line on a clean grid
- **Top AI Support Queries** horizontal bar chart — shows what users are asking most
- The manufacturer uses this to identify confusing sections and improve content

---

## 2. End User Journey

### 2.1 Discovery

The end user receives a product and wants to read the manual. They have two entry points:

**A. QR Code scan** — they scan the QR code printed on the product packaging. This deep-links directly to the manual view (`/manual/:id`).

**B. Manual search** — they visit the ClearGuide landing page, click **"Find a Guide"**, and are taken to the End User Portal.

---

### 2.2 End User Portal (`/user`)

- A QR code image is displayed with a "Simulate QR Scan" button for demo purposes
- Below a divider, a search form lets them enter:
  - Make (Manufacturer)
  - Model
  - Serial Number
- The search button is disabled until all three fields are filled
- Any valid search loads the demo manual (`/manual/demo-qr-123`)

---

### 2.3 Manual Welcome Screen (`/manual/:id`)

When the manual loads, the user sees a **Welcome Screen** before any content.

- A "Product Manual" badge, product name, and manufacturer are shown
- A **language picker** lets them choose their preferred language from 16 options (flag + name)
- Four mode cards let them choose how to consume the manual:

| Mode | Description |
|---|---|
| Text with Images | Step-by-step text with inline section images |
| Infographic | Full-screen visual product overview |
| Video | Guided video walkthroughs per section |
| AI Chat | Type or speak questions, get spoken answers |

- A **Download** button at the bottom offers PDF or DOCX export

---

### 2.4 Text with Images Mode

- The left sidebar lists all manual sections; clicking one navigates to it
- The active section shows a full-width section image (capped at 45vh) above the text
- Text is rendered with adjustable font size
- A **TTS (text-to-speech) toggle** in the header reads the section aloud when enabled
- The user navigates between sections using the sidebar

---

### 2.5 Infographic Mode

- The sidebar is hidden; the infographic fills the full available screen height
- A slim title bar shows the product name and "Visual product overview"
- The image is displayed with `object-contain` so it never crops or overflows
- No scrolling required — the entire infographic is visible at once

---

### 2.6 Video Mode

- **Main player** (left, full width on mobile / flex-1 on desktop): plays the video for the active section with autoplay
- An audio description transcript is shown below the player in an emerald callout
- **Section thumbnails** (right column on desktop / horizontal scroll on mobile): shows all sections as clickable video thumbnails
  - Each thumbnail shows a video frame preview, section title, and a play icon overlay
  - The active section has an emerald border and a ▶ badge
  - Clicking a thumbnail switches the main player to that section's video

---

### 2.7 AI Chat Mode

The chat and audio chat are merged into a single unified interface.

- The chat header shows the AI assistant name and a live status ("Listening...", "Processing...", "Type or speak your question")
- A **🔊/🔇 audio toggle** in the header controls whether AI responses are spoken aloud
- The input bar has three controls:
  - **Mic button** (left): tap to start voice input; turns red while listening; tap again to stop
  - **Text input** (middle): type a question; disabled while mic is active
  - **Send button** (right): submits the typed message
- A "Listening — tap mic to stop" pill appears in the message list while recording
- AI responses appear as chat bubbles; if audio is on, they are spoken via the Web Speech API
- Typing dots animate while the AI is generating a response

---

### 2.8 Accessibility Controls (always available)

The header provides persistent accessibility controls regardless of mode:

| Control | Function |
|---|---|
| Language picker | Switch content language (16 options) |
| TTS toggle | Read section text aloud (text mode only) |
| A− / A+ | Decrease / increase font size (12px–32px) |
| Contrast | Toggle high-contrast mode (black/yellow theme) |
| Download | Export manual as PDF or DOCX |

**High-contrast mode** inverts the entire UI to a black background with yellow text, borders, and accents — designed for users with low vision.

---

### 2.9 Language Translation

When a non-English language is selected:

- A banner appears at the top of the content area: "Showing AI-translated content in 🇫🇷 French"
- A "Switch to English" link resets the language
- The language picker in the header remains visible in all modes for quick switching

---

## 3. Journey Summary

```
Manufacturer
  Landing Page → Login → Dashboard → Create Manual
    → Basic Info → Language Translations → Upload or Build Sections
    → Save (AI Processing) → Dashboard

End User
  QR Scan / Landing Page → End User Portal → Manual Welcome Screen
    → Choose Language → Choose Mode
      → Text with Images (TTS optional)
      → Infographic (full-screen)
      → Video (main player + section thumbnails)
      → AI Chat (type or speak, audio responses)
    → Download (PDF / DOCX)
```

---

*Document generated: April 2026*
