# ClearGuide — Frontend

> **AI-native product intelligence platform** that transforms static equipment manuals into multi-modal, accessible, interactive experiences. Built for the XPRIZE Hackathon.

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=nextdotjs)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org)
[![Firebase](https://img.shields.io/badge/Firebase-Auth%20%2B%20Firestore-orange?logo=firebase)](https://firebase.google.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38bdf8?logo=tailwindcss)](https://tailwindcss.com)
[![WCAG](https://img.shields.io/badge/WCAG-2.2%20AAA-green)](https://www.w3.org/WAI/standards-guidelines/wcag/)

---

## What is ClearGuide?

ClearGuide bridges the gap between complex technical documentation and real-world users who need to understand it — regardless of literacy level, language, or ability.

**Key capabilities:**
- 📷 **Camera Visual Search** — point your camera at a machine or broken part to instantly retrieve relevant manual sections and troubleshooting steps
- 🔍 **QR & Specs Search** — scan a QR code or search by model number to pull up interactive equipment specs and exploded diagrams
- 🎬 **Dynamic Video Generator** — auto-synthesizes step-by-step video walkthroughs for repair procedures
- 💬 **Community Repair Hub** — product-specific forums powered by an autonomous AI moderator (`GuideBot`)
- ♿ **Accessibility First** — WCAG 2.2 AAA compliant with high-contrast modes, ARIA live regions, voice input, and simplified language summaries

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Auth | Firebase Authentication |
| Database | Firebase Firestore |
| Storage | Firebase Storage |
| AI / Backend | REST API → `clear-guide-backend` |

---

## Project Structure

```
clear-guide-frontend/
├── app/                        # Next.js App Router pages
│   ├── manufacturer/           # Manufacturer dashboard, auth, manual creation
│   ├── manual/[id]/            # Manual viewer (text, video, chat, forum, infographic)
│   ├── find/                   # QR + camera + spec search
│   ├── community/              # Community hub & forums
│   └── u/[username]/           # User profiles
├── components/
│   ├── ui/                     # Base UI primitives (Button, Card, Modal, etc.)
│   ├── dashboard/              # Manufacturer dashboard components
│   ├── find/                   # Search components (QR, photo, spec)
│   ├── hub/                    # Community hub components
│   ├── community/              # Forum & review components
│   └── viewer/                 # Manual viewer components
├── context/                    # React context providers (Auth, Theme, Accessibility)
├── hooks/                      # Custom hooks (useAuth, useManuals, useTTS, etc.)
├── lib/                        # Utilities, Firebase config, API client, types
└── public/                     # Static assets
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- A Firebase project with Auth, Firestore, and Storage enabled
- The `clear-guide-backend` running locally or deployed

### 1. Clone & Install

```bash
git clone git@github.com:codersbeyondborders/clear-guide-frontend.git
cd clear-guide-frontend
npm install
```

### 2. Set Up Environment Variables

```bash
cp .env.example .env.local
```

Fill in your Firebase config and backend URL in `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 3. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## User Roles

| Role | Access |
|---|---|
| **End User** | Browse manuals, visual search, community hub, profile |
| **Manufacturer** | Create/manage manuals, analytics dashboard, team invites |
| **Admin** | Full platform access |

---

## Related Repos

| Repo | Description |
|---|---|
| [`clear-guide-backend`](https://github.com/codersbeyondborders/clear-guide-backend) | API Gateway (Fastify) + AI Agent Mesh (Python/FastAPI) |

---

## Contributing

This project is part of the **XPRIZE Hackathon**. Contributions from the team are welcome — please branch off `main` and open a PR.

---

*Built with ❤️ by Coders Beyond Borders*
