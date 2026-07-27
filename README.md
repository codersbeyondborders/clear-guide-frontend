<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Clear Guide

**Clear Guide** is an AI-powered, cloud-based SaaS platform that transforms static, paper-based product manuals into dynamic, multi-format, and fully accessible digital guides. Built as a social enterprise, it targets the £274 billion "Purple Pound" market while helping manufacturers meet rising ESG and accessibility regulations.

> Developed as part of the MSc Disability, Design & Innovation (2025–26) programme at UAL, using the Sustainable Design Thinking Model and a "Design From the Margins" approach.

---

## The Problem

Traditional paper manuals rely on tiny font sizes and low-contrast layouts that are entirely inaccessible to users with visual or cognitive impairments. Research found that:

- Over **1.3 billion people** globally live with a disability, many of whom are excluded by paper-based documentation
- **60% of users** have abandoned a task or device due to an inaccessible manual
- Paper is overwhelmingly kept for warranty purposes only — not used for instruction
- Users trust YouTube and peer-to-peer advice over official guides

---

## The Solution

Clear Guide replaces paper manuals with an accessible, AI-driven digital alternative. Manufacturers upload their documentation once; the platform automatically converts it into:

- 📖 **Screen-reader-optimised text** with scalable font sizes and high-contrast mode
- 🎙️ **Voice-guided instructions** with full audio descriptions for every section
- 🎬 **Audio-described video walkthroughs** per manual section
- 🤖 **Interactive AI chat** — ask questions in plain language, get instant answers
- 🌍 **16-language support** via automatic translation
- 📱 **QR code integration** — scan from product packaging to open the manual instantly

---

## Key Features

| Feature | Description |
|---|---|
| Manufacturer Dashboard | Upload, edit, and publish manuals with real-time analytics |
| Accessible Manual Viewer | High-contrast mode, adjustable font sizes, TTS, and keyboard navigation |
| AI Chat Support | Voice and text input with transparent AI disclosure |
| Multi-format Delivery | Text, infographic, video, and chat views in a single interface |
| QR Code Generation | Auto-generated QR codes linking product to its digital manual |
| Analytics | Track views, active users, average time spent, and top AI queries |

---

## The Curb-Cut Effect

Features engineered for accessibility deliver mainstream benefits too:

| "Extreme" Feature | Designed For | Mainstream Benefit |
|---|---|---|
| Audio descriptions | Blind / low-vision users | Hands-free instructions while working |
| Video walkthroughs | Cognitive disabilities | Quick reference for busy professionals |
| High-contrast / scalable UI | Low visual acuity | Better readability outdoors or in low light |
| Interactive AI chat | Complex navigation difficulties | Instant search — skip irrelevant content |

---

## Business Model

Clear Guide operates as a **social enterprise** on a tiered B2B subscription model:

| Tier | Price | Includes |
|---|---|---|
| Free | £0/month | Up to 3 manuals, basic accessibility features, QR code generation |
| Pro | £29/month | Unlimited manuals, full accessibility suite, AI chat support, analytics |
| Enterprise | £89/month | Custom branding, SSO, API access, dedicated account manager |

A portion of corporate profits subsidises digitisation for small assistive technology providers and non-profits.

---

## Social & Environmental Impact

- Eliminates thousands of tons of paper waste annually
- Aligns with **SDG 10** (Reduced Inequalities) and **SDG 12** (Responsible Consumption and Production)
- Supports compliance with the **European Accessibility Act**, **UK Equality Act**, and **Digital Product Passport (DPP)** regulations (mandatory from 2027)
- Enables circular economy by keeping repair and recycling guides accessible throughout a product's lifecycle

---

## Tech Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS v4
- **Backend:** Next.js App Router with Route Handlers (API)
- **AI:** Google Gemini API (`@google/genai`)
- **Charts:** Recharts
- **Icons:** Lucide React
- **Styling utilities:** clsx, tailwind-merge

---

## Run Locally

**Prerequisites:** Node.js 18+

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy the environment file and add your Gemini API key:
   ```bash
   cp .env.example .env.local
   ```
   Then set `GEMINI_API_KEY` in `.env.local`.

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Demo Credentials (Manufacturer Portal)

| Field | Value |
|---|---|
| Email | `demo@brewtech.com` |
| Password | `password123` |

---

## Project Structure

```
├── app/
│   ├── api/                  # Next.js Route Handlers (manuals, chat, analytics)
│   ├── manufacturer/         # Dashboard, login, editor, analytics pages
│   ├── manual/[id]/          # End-user manual viewer
│   ├── user/                 # End-user portal (QR scan / product search)
│   └── page.tsx              # Landing page
├── components/
│   ├── pages/                # Shared page-level components (ManualEditor)
│   ├── ui/                   # Primitive UI components (Button, Input)
│   └── viewer/               # AccessibleManualViewer, AIChatSupport
├── lib/
│   └── utils.ts              # cn() utility (clsx + tailwind-merge)
└── public/                   # Static assets (images, videos, QR codes)
```

---

## References

- Blackwell, A. (2017) *The Curb-Cut Effect*, Stanford Social Innovation Review
- Chen, N. (2019) *A Model of Universal Manual Design for Technical Products*, KTH Royal Institute of Technology
- Rigot, A. (2022) *Design From the Margins*, Harvard Kennedy School Belfer Center
- Scope (2026) *Attracting more disabled customers and the Purple Pound*
- WHO (2022) *Disability*, World Health Organization
- European Parliament (2024) *Digital Product Passport for the Textile Sector*

---

<div align="center">
  <sub>Built with accessibility at the core — not as an afterthought.</sub>
</div>
