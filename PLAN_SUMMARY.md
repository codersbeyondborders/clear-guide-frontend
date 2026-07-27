# ClearGuide — Professional Build Plan Summary

## 🎯 Mission Statement

Build a **production-ready, accessible, fast, and engaging platform** that enables manufacturers to create AI-powered product manuals and end users to consume them across 4 distinct modes (text, infographics, video, AI chat).

---

## 📊 High-Level Overview

```
ClearGuide Platform
├── Landing Page (Public)
├── Manufacturer Flow
│   ├── Login / Auth
│   ├── Dashboard (manage manuals)
│   ├── Manual Editor (create/edit with AI)
│   └── Analytics (track engagement)
└── End User Flow
    ├── Portal (QR + search)
    ├── Welcome Screen (mode selection)
    ├── Content Modes
    │   ├── Text with Images
    │   ├── Infographic
    │   ├── Video
    │   └── AI Chat
    └── Accessibility Controls (global)
```

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 16, React 19, TypeScript |
| **Styling** | Tailwind CSS v4, CSS Custom Properties |
| **UI Components** | shadcn/ui, Lucide React |
| **State** | React Context, SWR |
| **Database** | Neon (PostgreSQL), Drizzle ORM |
| **Auth** | Better Auth (email/password) |
| **Storage** | Vercel Blob (PDFs, images, videos) |
| **AI** | Google Genai API (translation, chat, parsing) |
| **Voice** | Web Speech API (TTS, voice input) |
| **Deployment** | Vercel (Next.js native) |

---

## 🎨 Design System

- **Accent Color**: Emerald green (#16a34a)
- **Contrast Mode**: Black/yellow for accessibility
- **Typography**: Inter, 16px base, 1.5–1.6 line height
- **Spacing**: Tailwind 4px grid
- **Breakpoints**: Mobile (0–640px), Tablet (641–1024px), Desktop (1025px+)
- **Accessibility**: WCAG 2.1 AA compliance

---

## 📅 6-Phase Timeline

### Phase 1: Foundation (Weeks 1–2)
- Database schema & Neon setup
- Better Auth configuration
- Design system & component library
- Landing page

### Phase 2: Manufacturer Hub (Weeks 3–4)
- Authentication pages
- Dashboard (view/manage manuals)
- Manual editor (4-step form with AI)
- Analytics page

### Phase 3: End User Experience (Weeks 5–6)
- Portal (QR + search)
- Welcome screen (mode selection)
- 4 content modes (text, infographic, video, chat)
- Accessibility controls (global)

### Phase 4: Intelligence (Week 7)
- AI integration (translation, parsing, knowledge base)
- File storage via Vercel Blob
- Email notifications (optional)

### Phase 5: Polish (Week 8)
- Performance optimization (LCP < 2.5s, CLS < 0.1)
- WCAG 2.1 AA audit
- Responsive design testing (375px–1920px)
- Error handling & security hardening

### Phase 6: Launch (Week 8)
- Vercel deployment
- Monitoring & analytics setup
- Documentation complete

---

## 🎯 Key Features by User Type

### For Manufacturers
✅ **Dashboard**: Central hub for all manuals  
✅ **Multi-Step Editor**: Basic info → Languages → Content → Publish  
✅ **AI Processing**: Auto-extract sections, generate metadata, translate 16 languages  
✅ **Analytics**: Views, active users, AI queries, charts  
✅ **QR Integration**: Print QR codes for instant access  

### For End Users
✅ **QR Scanning**: Instant access to manual via QR code  
✅ **Smart Search**: Find manuals by make, model, serial  
✅ **4 Content Modes**:
- **Text with Images**: Traditional reading with side-by-side images
- **Infographic**: Full-screen visual overview
- **Video**: Guided walkthroughs with section thumbnails
- **AI Chat**: Ask questions, get instant answers (voice + text)

✅ **Accessibility**: Font size (12–32px), high-contrast mode, TTS, language picker (16 languages)  
✅ **Export**: Download as PDF or DOCX  

---

## 📐 Core Pages & Routes

| Route | Name | User | Status |
|-------|------|------|--------|
| `/` | Landing | Public | MVP |
| `/manufacturer/login` | Login | Manufacturer | MVP |
| `/manufacturer/dashboard` | Dashboard | Manufacturer | MVP |
| `/manufacturer/new` | Editor | Manufacturer | MVP |
| `/manufacturer/edit/:id` | Edit | Manufacturer | MVP |
| `/manufacturer/analytics/:id` | Analytics | Manufacturer | MVP |
| `/user` | Portal | End User | MVP |
| `/manual/:id` | Welcome | End User | MVP |
| `/manual/:id?mode=text` | Text Mode | End User | MVP |
| `/manual/:id?mode=infographic` | Infographic | End User | Phase 2 |
| `/manual/:id?mode=video` | Video | End User | Phase 2 |
| `/manual/:id?mode=chat` | AI Chat | End User | Phase 2 |

---

## 🚀 Performance Targets

| Metric | Target | Tool |
|--------|--------|------|
| LCP | < 2.5s | Lighthouse |
| FCP | < 1.5s | Lighthouse |
| CLS | < 0.1 | Lighthouse |
| INP | < 200ms | Lighthouse |
| Build Size | < 100KB (gzipped) | next/stats |

---

## ♿ Accessibility Commitments

✅ WCAG 2.1 AA compliance  
✅ Keyboard navigation (Tab, Enter, Escape, Arrow keys)  
✅ Screen reader support (ARIA labels, semantic HTML)  
✅ Color contrast > 4.5:1  
✅ High-contrast mode (black/yellow)  
✅ Adjustable font size (12–32px)  
✅ Mobile touch targets ≥ 44×44px  
✅ Focus indicators visible  

---

## 📱 Responsive Design Targets

| Device | Width | Breakpoint |
|--------|-------|-----------|
| iPhone SE | 375px | Mobile |
| iPhone 14 | 390px | Mobile |
| iPad | 768px | Tablet |
| Desktop | 1024px+ | Desktop |
| Large Desktop | 1920px+ | Desktop |

**Guarantee**: No horizontal scrolling on any viewport. Text readable without zoom.

---

## 🔒 Security & Best Practices

✅ Email/password hashing (Better Auth)  
✅ Session management (secure, httpOnly cookies)  
✅ CSRF protection on forms  
✅ SQL injection prevention (ORM + parameterized queries)  
✅ XSS prevention (input sanitization)  
✅ Rate limiting on API endpoints  
✅ No secrets in client code  

---

## 📊 Component Inventory

**Layout**: Header, Sidebar, Footer, Container, Grid  
**Forms**: Input, Textarea, Select, Checkbox, Radio, FileUpload  
**UI**: Button, Badge, Card, Modal, Toast, Spinner, Skeleton  
**Data**: LineChart, BarChart, KPICard  
**Domain-Specific**: LanguagePicker, AccessibilityControls, ManualCard, ModeSelector, ChatMessage, VideoPlayer  

---

## 📋 Success Criteria

✓ All user journeys (manufacturer + end user) fully functional  
✓ WCAG 2.1 AA compliance verified  
✓ Performance targets met (LCP, FCP, CLS, INP)  
✓ Responsive on 375px–1920px  
✓ Deployed on Vercel with CI/CD  
✓ Error handling & validation throughout  
✓ AI features functional (translation, chat, parsing)  
✓ File uploads & storage working  
✓ Documentation complete  
✓ Team ready to maintain & scale  

---

## 🎬 Next Steps

1. **Start Phase 1**: Begin with database schema & authentication setup
2. **Build incrementally**: Phase by phase, testing continuously
3. **Engage QA early**: Accessibility & performance testing throughout
4. **Iterate on feedback**: User testing during Phase 3–4
5. **Launch with confidence**: Ship to Vercel when Phase 5 complete

---

## 📞 Resources

- **BUILD_PLAN.md**: Detailed 6-phase roadmap with database schema
- **IMPLEMENTATION_GUIDE.md**: Task-by-task breakdown for each phase
- **USER_JOURNEY.md**: End-to-end user flows (reference document)

---

**Status**: ✅ Plan Approved | Ready to Build  
**Last Updated**: June 2026
