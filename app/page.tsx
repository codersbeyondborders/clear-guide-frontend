import Link from 'next/link'
import Image from 'next/image'
import {
  BookOpen, Check, X, Star,
  Shield, MessageSquare, Globe, Volume2,
  LayoutDashboard, QrCode, ChevronDown, Zap,
  ArrowRight, Sparkles,
  Twitter, Linkedin, Github,
  AlignLeft, Play, Image as ImageIcon, Brain, Download,
  MousePointerClick, Factory,
} from 'lucide-react'
import { FindYourGuideSection } from '@/components/FindYourGuideSection'
import { NavBar } from '@/components/NavBar'

/* ─── Section label helper ─────────────────────────────────────────────── */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest mb-5" style={{ color: 'var(--color-primary)' }}>
      <span className="w-3.5 h-px" style={{ backgroundColor: 'var(--color-primary)' }} aria-hidden="true" />
      {children}
    </p>
  )
}

/* ─── Hero ─────────────────────────────────────────────────────────────── */
function Hero() {
  return (
    <section className="overflow-hidden bg-white" aria-labelledby="hero-heading">
      <div className="container">
        <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center py-16 md:py-24 lg:py-28">

          {/* Left — text */}
          <div className="order-2 md:order-1">
            {/* Pill badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold mb-8 border border-emerald-200 bg-emerald-50 text-emerald-700">
              <Sparkles className="w-3 h-3" aria-hidden="true" />
              AI-Powered Manual Platform
            </div>

            <h1
              id="hero-heading"
              className="text-4xl sm:text-5xl lg:text-[3.75rem] font-bold text-slate-900 tracking-tight leading-[1.06] mb-6 text-balance"
            >
              Product manuals{' '}
              <span style={{ color: 'var(--color-primary)' }}>people</span>{' '}
              actually use
            </h1>

            <p className="text-lg text-slate-500 leading-relaxed mb-8 max-w-[460px]">
              Replace paper manuals with accessible, AI-powered digital guides.
              High-contrast, multilingual, instant AI chat — built for everyone.
            </p>

            <div className="flex flex-wrap items-center gap-3 mb-10">
              <Link href="/sign-up" className="btn-primary">
                Get started free
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
              <a href="#features" className="btn-outline">
                See how it works
              </a>
            </div>

            {/* Trust signals */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              {['No credit card required', 'WCAG 2.2 AAA', 'Free plan available'].map((t) => (
                <span key={t} className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                  <Check className="w-3 h-3 shrink-0" style={{ color: 'var(--color-primary)' }} aria-hidden="true" />
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Right — hero image */}
          <div className="order-1 md:order-2 rounded-2xl overflow-hidden border border-slate-200 shadow-2xl shadow-slate-200/60">
            <Image
              src="/images/hero.png"
              alt="Split illustration: frustrated user struggling with paper manual on the left, happy user accessing digital guide on phone on the right"
              width={640}
              height={480}
              className="w-full h-auto object-cover"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─── See How It Works ──────────────────────────────────────────────────── */
function SeeHowItWorks() {
  return (
    <section
      id="how-it-works"
      className="py-20 md:py-28 bg-slate-50 border-y border-slate-100"
      aria-labelledby="how-it-works-heading"
    >
      <div className="container">
        <div className="max-w-2xl mx-auto text-center">
          <SectionLabel>Get Started</SectionLabel>
          <h2
            id="how-it-works-heading"
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight mb-5 text-balance"
          >
            See how ClearGuide works
          </h2>
          <p className="text-base text-slate-500 leading-relaxed mb-12 max-w-lg mx-auto">
            Whether you&apos;re finding a guide for a product you own or publishing
            manuals for your customers — ClearGuide makes it effortless.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {/* For Users — emerald outline → filled on hover */}
            <a
              href="#find-guide"
              className="group inline-flex items-center gap-3 rounded-2xl border-2 border-emerald-500 text-emerald-600 bg-transparent hover:bg-emerald-500 hover:text-white px-8 py-5 font-semibold text-sm transition-all duration-200 w-full sm:w-auto justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              <MousePointerClick className="w-5 h-5 shrink-0" aria-hidden="true" />
              <span>
                <span className="block text-base font-bold tracking-tight">For Users</span>
                <span className="block text-xs opacity-70 font-normal mt-0.5">Find your product guide</span>
              </span>
              <ArrowRight className="w-4 h-4 shrink-0 ml-auto transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </a>

            {/* For Manufacturers — slate outline → filled on hover */}
            <a
              href="#manufacturers"
              className="group inline-flex items-center gap-3 rounded-2xl border-2 border-slate-900 text-slate-900 bg-transparent hover:bg-slate-900 hover:text-white px-8 py-5 font-semibold text-sm transition-all duration-200 w-full sm:w-auto justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-700"
            >
              <Factory className="w-5 h-5 shrink-0" aria-hidden="true" />
              <span>
                <span className="block text-base font-bold tracking-tight">For Manufacturers</span>
                <span className="block text-xs opacity-70 font-normal mt-0.5">Publish accessible manuals</span>
              </span>
              <ArrowRight className="w-4 h-4 shrink-0 ml-auto transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─── Why ClearGuide ────────────────────────────────────────────────────── */
const whyFeatures = [
  {
    icon: Shield,
    title: 'WCAG 2.2 AAA Compliant',
    description:
      'Every guide passes the highest accessibility standard. High contrast, keyboard navigation, and screen reader support built in.',
  },
  {
    icon: Globe,
    title: 'Planet Friendly',
    description:
      'Replace physical paper manuals with digital guides and reduce your product\'s paper waste and carbon footprint at scale.',
  },
  {
    icon: Globe,
    title: '50+ Languages',
    description:
      'AI-powered translations auto-generated at publish time. One upload, every language.',
  },
  {
    icon: Volume2,
    title: 'Audio Descriptions',
    description:
      'Full text-to-speech narration and image descriptions for visually impaired users.',
  },
]

function WhyClearGuide() {
  return (
    <section className="py-20 md:py-28 bg-white" aria-labelledby="why-heading">
      <div className="container">
        <div className="grid md:grid-cols-2 gap-16 items-start">

          {/* Left sticky */}
          <div className="md:sticky md:top-24">
            <SectionLabel>Why ClearGuide?</SectionLabel>
            <h2
              id="why-heading"
              className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 leading-tight mb-6 tracking-tight text-balance"
            >
              The smarter choice for{' '}
              <em className="not-italic" style={{ color: 'var(--color-primary)' }}>accessible</em>{' '}
              manuals
            </h2>
            <p className="text-base text-slate-500 leading-relaxed max-w-sm">
              Traditional paper manuals exclude millions of users. ClearGuide turns
              them into living, accessible digital experiences that work for everyone.
            </p>
          </div>

          {/* Right — 2×2 feature grid */}
          <div className="grid sm:grid-cols-2 gap-4">
            {whyFeatures.map((f) => (
              <article
                key={f.title}
                className="rounded-2xl border border-slate-100 p-6 bg-slate-50 hover:border-emerald-200 hover:bg-emerald-50/40 transition-colors group"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-colors group-hover:bg-emerald-100/60"
                  style={{ backgroundColor: 'var(--color-primary-subtle)' }}
                  aria-hidden="true"
                >
                  <f.icon className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-2 tracking-tight">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.description}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─── Platform Features ─────────────────────────────────────────────────── */
const platformFeatures = [
  {
    icon: BookOpen,
    badge: 'Accessibility',
    title: 'Accessible Manual Viewer',
    description:
      'High contrast mode, adjustable font sizes, zoom controls, and full keyboard navigation — built in from day one.',
  },
  {
    icon: MessageSquare,
    badge: 'AI-Powered',
    title: 'AI Chat Support',
    description:
      'Ask any question and receive instant, accurate answers drawn directly from the manual content.',
  },
  {
    icon: LayoutDashboard,
    badge: 'Analytics',
    title: 'Manufacturer Dashboard',
    description:
      'Upload, edit, and publish manuals. Track engagement, drop-off points, and search queries in real time.',
  },
  {
    icon: QrCode,
    badge: 'Integration',
    title: 'Smart QR Integration',
    description:
      'Auto-generated QR codes link directly to the correct manual. Print on packaging and users are guided instantly.',
  },
  {
    icon: AlignLeft,
    badge: 'Content',
    title: 'Simple Text Format',
    description:
      'Clean, readable text layout with clear headings and bullet points — easy to follow on any screen size.',
  },
  {
    icon: Play,
    badge: 'Content',
    title: 'Video Format',
    description:
      'Embed step-by-step video walkthroughs directly in your guide so users can see and follow along in real time.',
  },
  {
    icon: ImageIcon,
    badge: 'Content',
    title: 'Infographic Format',
    description:
      'Visual diagrams and annotated infographics that break down complex assembly or troubleshooting steps at a glance.',
  },
  {
    icon: Brain,
    badge: 'UX',
    title: 'Low Cognitive Load',
    description:
      'Content is chunked into short, digestible steps. No walls of text — just clear, calm guidance at every stage.',
  },
  {
    icon: Download,
    badge: 'Export',
    title: 'Multiple Download Options',
    description:
      'Users can download guides in PDF, DOCX, or plain text — keeping a copy offline in the format that suits them best.',
  },
]

function PlatformFeatures() {
  return (
    <section id="features" className="py-20 md:py-28 bg-slate-50" aria-labelledby="platform-heading">
      <div className="container">
        <header className="mb-14">
          <SectionLabel>Platform Features</SectionLabel>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <h2
              id="platform-heading"
              className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight max-w-xl text-balance"
            >
              Every tool to elevate your manuals
            </h2>
            <Link href="/sign-up" className="btn-primary shrink-0 self-start md:self-auto">
              Start for free
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>
        </header>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {platformFeatures.map((f, i) => {
            const dark = i === 0
            return (
              <article
                key={f.title}
                className={`rounded-2xl p-7 border flex items-start gap-5 transition-shadow hover:shadow-lg ${
                  dark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
                }`}
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                  style={{
                    backgroundColor: dark ? 'rgba(0,196,122,0.15)' : 'var(--color-primary-subtle)',
                  }}
                  aria-hidden="true"
                >
                  <f.icon className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
                </div>
                <div className="min-w-0">
                  <span
                    className="inline-block text-xs font-bold px-2.5 py-0.5 rounded-full mb-3"
                    style={{
                      backgroundColor: dark ? 'rgba(0,196,122,0.15)' : 'var(--color-primary-subtle)',
                      color: dark ? '#4ade80' : 'var(--color-emerald-700, #047857)',
                    }}
                  >
                    {f.badge}
                  </span>
                  <h3
                    className="text-base font-bold mb-2 tracking-tight"
                    style={{ color: dark ? '#fff' : '#0f172a' }}
                  >
                    {f.title}
                  </h3>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: dark ? 'rgba(255,255,255,0.55)' : '#64748b' }}
                  >
                    {f.description}
                  </p>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/* ─── Before & After ────────────────────────────────────────────────────── */
const withoutList = [
  'Squinting at tiny printed text in poor lighting',
  'Manual lost or discarded with the packaging',
  'No help when a step is confusing or unclear',
  'Diagrams with no explanation for visually impaired users',
  'Only available in one language',
  'Calling support for basic setup questions',
]

const withList = [
  'Adjustable font sizes and high-contrast mode built in',
  'Always accessible via QR code or product search',
  'Instant AI chat answers any question in plain language',
  'Audio descriptions and text-to-speech for every section',
  'Auto-translated into 50+ languages at the tap of a button',
  'Voice-activated AI answers hands-free, 24/7',
]

function BeforeAfter() {
  return (
    <section className="py-20 md:py-28 bg-white" aria-labelledby="ba-heading">
      <div className="container">
        <header className="mb-14 text-center">
          <SectionLabel>The Difference</SectionLabel>
          <h2
            id="ba-heading"
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight mb-4 text-balance"
          >
            Before &amp; after ClearGuide
          </h2>
          <p className="text-base text-slate-500 max-w-sm mx-auto leading-relaxed">
            See how the experience transforms when manuals are built for people, not paper.
          </p>
        </header>

        {/* Photos */}
        <div className="grid sm:grid-cols-2 gap-4 mb-10">
          <figure className="relative rounded-2xl overflow-hidden shadow-md">
            <Image
              src="/images/before.png"
              alt="Elderly woman struggling to read a tiny paper manual with a magnifying glass"
              width={600}
              height={400}
              className="w-full object-cover"
              style={{ height: '18rem' }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" aria-hidden="true" />
            <figcaption className="absolute bottom-4 left-4">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-white text-red-600 shadow">
                <X className="w-3 h-3" aria-hidden="true" />
                Without ClearGuide
              </span>
            </figcaption>
          </figure>

          <figure className="relative rounded-2xl overflow-hidden shadow-md">
            <Image
              src="/images/after.png"
              alt="Same woman now smiling, holding a phone showing the ClearGuide digital manual for the coffee maker"
              width={600}
              height={400}
              className="w-full object-cover"
              style={{ height: '18rem' }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" aria-hidden="true" />
            <figcaption className="absolute bottom-4 left-4">
              <span
                className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full shadow"
                style={{ backgroundColor: 'var(--color-primary)', color: '#fff' }}
              >
                <Check className="w-3 h-3" aria-hidden="true" />
                With ClearGuide
              </span>
            </figcaption>
          </figure>
        </div>

        {/* Comparison lists */}
        <div className="grid sm:grid-cols-2 gap-5">
          <div className="rounded-2xl border border-red-100 bg-red-50/60 p-7">
            <h3 className="text-sm font-bold text-slate-900 mb-5 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <X className="w-3 h-3 text-red-500" aria-hidden="true" />
              </span>
              Without ClearGuide
            </h3>
            <ul className="flex flex-col gap-3" aria-label="Problems without ClearGuide">
              {withoutList.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-slate-500">
                  <X className="w-4 h-4 shrink-0 mt-0.5 text-red-400" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-7">
            <h3 className="text-sm font-bold text-slate-900 mb-5 flex items-center gap-2">
              <span
                className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: 'var(--color-primary-subtle)' }}
              >
                <Check className="w-3 h-3" style={{ color: 'var(--color-primary)' }} aria-hidden="true" />
              </span>
              With ClearGuide
            </h3>
            <ul className="flex flex-col gap-3" aria-label="Benefits with ClearGuide">
              {withList.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-slate-600">
                  <Check className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--color-primary)' }} aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─── Manufacturer Section ──────────────────────────────────────────────── */
const manufacturerBenefits = [
  { text: 'PDF & Word import — convert existing manuals instantly' },
  { text: 'Auto-generated QR codes for every product' },
  { text: 'Real-time analytics: views, searches, and drop-offs' },
  { text: 'Multi-product management from one dashboard' },
]

function ManufacturerSection() {
  return (
    <section id="manufacturers" className="py-20 md:py-28 bg-slate-900" aria-labelledby="mfr-heading">
      <div className="container">
        <div className="grid md:grid-cols-2 gap-14 items-center">

          {/* Left */}
          <div>
            <SectionLabel>
              <span style={{ color: 'var(--color-primary)' }}>For Manufacturers</span>
            </SectionLabel>
            <h2
              id="mfr-heading"
              className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-5 tracking-tight text-balance"
            >
              Seamless integration with your workflow
            </h2>
            <p className="text-slate-400 leading-relaxed text-base mb-8 max-w-md">
              Upload your existing PDF manuals or create new ones from scratch.
              ClearGuide automatically structures content, adds accessibility features,
              and generates AI training data — all in minutes.
            </p>

            <ul className="flex flex-col gap-4 mb-10" aria-label="Manufacturer benefits">
              {manufacturerBenefits.map(({ text }) => (
                <li key={text} className="flex items-start gap-3 text-sm text-slate-300">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                    style={{ backgroundColor: 'rgba(0,196,122,0.2)' }}
                    aria-hidden="true"
                  >
                    <Check className="w-3 h-3" style={{ color: 'var(--color-primary)' }} />
                  </div>
                  {text}
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap gap-3">
              <Link href="/sign-up" className="btn-primary">
                Start for free
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
              <Link
                href="/manufacturer/login"
                className="btn-outline border-slate-700 text-slate-300 hover:border-slate-500 hover:bg-slate-800"
              >
                View demo
              </Link>
            </div>
          </div>

          {/* Right — dashboard mockup */}
          <div className="rounded-2xl border border-slate-700 bg-slate-800 p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-sm font-bold text-white">Analytics Overview</p>
                <p className="text-xs text-slate-500 mt-0.5">Last 7 days</p>
              </div>
              <span
                className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
                style={{ backgroundColor: 'rgba(0,196,122,0.15)', color: '#4ade80' }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
                Live
              </span>
            </div>

            {/* Bar chart mockup */}
            <div
              className="flex items-end gap-2 mb-6"
              style={{ height: '8rem' }}
              role="img"
              aria-label="Bar chart showing increasing manual views over 7 days"
            >
              {[30, 48, 38, 62, 52, 88, 72].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t-md"
                  style={{
                    height: `${h}%`,
                    backgroundColor: i === 5 ? 'var(--color-primary)' : 'rgba(0,196,122,0.25)',
                  }}
                />
              ))}
            </div>

            {/* KPI tiles */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl bg-slate-700/50 p-3 text-center">
                <p className="text-lg font-bold text-white">2.4k</p>
                <p className="text-xs text-slate-400 mt-0.5">Views</p>
              </div>
              <div className="rounded-xl p-3 text-center" style={{ backgroundColor: 'rgba(0,196,122,0.2)' }}>
                <p className="text-lg font-bold" style={{ color: 'var(--color-primary)' }}>24/7</p>
                <p className="text-xs text-emerald-400 mt-0.5">AI Support</p>
              </div>
              <div className="rounded-xl bg-slate-700/50 p-3 text-center">
                <p className="text-lg font-bold text-white">98%</p>
                <p className="text-xs text-slate-400 mt-0.5">Satisfaction</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}

/* ─── Testimonials ──────────────────────────────────────────────────────── */
const testimonials = [
  {
    quote: 'ClearGuide cut our support tickets by 40%. Users actually understand their product now.',
    name: 'Sarah M.',
    role: 'Head of Manufacturing',
    rating: 5,
    company: 'HomeApply Ltd',
    initials: 'SM',
  },
  {
    quote: 'The only manual platform that takes WCAG seriously. The high-contrast mode is flawless.',
    name: 'James T.',
    role: 'Accessibility Lead',
    rating: 5,
    company: 'CiAB',
    initials: 'JT',
  },
  {
    quote: 'I have low vision and this is the first manual I could actually read without help. Amazing.',
    name: 'Priya K.',
    role: 'End User',
    rating: 5,
    company: '',
    initials: 'PK',
  },
]

function Testimonials() {
  return (
    <section className="py-20 md:py-28 bg-slate-50" aria-labelledby="testimonials-heading">
      <div className="container">
        <header className="mb-14">
          <SectionLabel>Testimonials</SectionLabel>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <h2
              id="testimonials-heading"
              className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight text-balance"
            >
              Real results from real users
            </h2>
            <div className="flex items-center gap-2 shrink-0">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className="w-4 h-4"
                  style={{ color: 'var(--color-primary)', fill: 'var(--color-primary)' }}
                  aria-hidden="true"
                />
              ))}
              <span className="text-sm font-semibold text-slate-700 ml-1">5.0</span>
            </div>
          </div>
        </header>

        <div className="grid md:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <article
              key={t.name}
              className={`rounded-2xl p-7 flex flex-col gap-5 border transition-shadow hover:shadow-lg ${
                i === 1
                  ? 'bg-slate-900 border-slate-800'
                  : 'bg-white border-slate-100'
              }`}
            >
              <div className="flex items-center gap-0.5" aria-label={`${t.rating} out of 5 stars`}>
                {Array.from({ length: t.rating }).map((_, idx) => (
                  <Star
                    key={idx}
                    className="w-4 h-4"
                    style={{ color: 'var(--color-primary)', fill: 'var(--color-primary)' }}
                    aria-hidden="true"
                  />
                ))}
              </div>

              <blockquote
                className="text-base leading-relaxed flex-1 font-medium"
                style={{ color: i === 1 ? '#ffffff' : '#1e293b' }}
              >
                &ldquo;{t.quote}&rdquo;
              </blockquote>

              <footer
                className="flex items-center gap-3 pt-4"
                style={{ borderTop: `1px solid ${i === 1 ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}` }}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold shrink-0 tracking-wide"
                  style={{
                    backgroundColor: i === 1 ? 'rgba(0,196,122,0.2)' : 'var(--color-primary-subtle)',
                    color: 'var(--color-primary)',
                  }}
                  aria-hidden="true"
                >
                  {t.initials}
                </div>
                <div>
                  <p className="text-sm font-bold" style={{ color: i === 1 ? '#fff' : '#0f172a' }}>
                    {t.name}
                  </p>
                  <p className="text-xs" style={{ color: i === 1 ? 'rgba(255,255,255,0.4)' : '#64748b' }}>
                    {t.role}{t.company ? `, ${t.company}` : ''}
                  </p>
                </div>
              </footer>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── Pricing ───────────────────────────────────────────────────────────── */
const plans = [
  {
    name: 'Free',
    price: '£0',
    period: '',
    description: 'Perfect for trying out ClearGuide',
    features: ['Up to 3 manuals', 'Core accessibility features', 'QR code generation', 'Community support'],
    cta: 'Get started',
    href: '/sign-up',
    highlight: false,
  },
  {
    name: 'Pro',
    price: '£29',
    period: '/mo',
    description: 'For growing manufacturers',
    features: [
      'Unlimited manuals',
      'Full accessibility suite',
      'AI chat support',
      'Analytics dashboard',
      'Priority support',
    ],
    cta: 'Start free trial',
    href: '/sign-up',
    highlight: true,
  },
  {
    name: 'Enterprise',
    price: '£89',
    period: '/mo',
    description: 'For large-scale operations',
    features: [
      'Everything in Pro',
      'Custom branding & domain',
      'SSO & team management',
      'Dedicated account manager',
    ],
    cta: 'Contact sales',
    href: 'mailto:sales@clearguide.io',
    highlight: false,
  },
]

function Pricing() {
  return (
    <section id="pricing" className="py-20 md:py-28 bg-white" aria-labelledby="pricing-heading">
      <div className="container">
        <header className="mb-14">
          <SectionLabel>Pricing</SectionLabel>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <h2
              id="pricing-heading"
              className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight text-balance"
            >
              Plans that fit your journey
            </h2>
            <p className="text-sm text-slate-400 md:text-right max-w-xs shrink-0">
              All plans include a 14-day free trial. No credit card required.
            </p>
          </div>
        </header>

        <div className="grid md:grid-cols-3 gap-5">
          {plans.map((plan) => (
            <article
              key={plan.name}
              aria-label={`${plan.name} plan`}
              className={`rounded-2xl p-8 flex flex-col gap-6 border relative ${
                plan.highlight ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-100'
              }`}
            >
              {plan.highlight && (
                <div
                  className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-xs font-bold px-4 py-1.5 rounded-full shadow-sm"
                  style={{ backgroundColor: 'var(--color-primary)', color: '#fff' }}
                >
                  Most Popular
                </div>
              )}

              <div>
                <p
                  className="text-xs font-bold uppercase tracking-widest mb-3"
                  style={{ color: plan.highlight ? 'rgba(255,255,255,0.4)' : '#94a3b8' }}
                >
                  {plan.name}
                </p>
                <div className="flex items-baseline gap-1 mb-2">
                  <span
                    className="text-4xl font-bold tabular-nums tracking-tight"
                    style={{ color: plan.highlight ? '#fff' : '#0f172a' }}
                  >
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span
                      className="text-sm"
                      style={{ color: plan.highlight ? 'rgba(255,255,255,0.35)' : '#94a3b8' }}
                    >
                      {plan.period}
                    </span>
                  )}
                </div>
                <p
                  className="text-sm"
                  style={{ color: plan.highlight ? 'rgba(255,255,255,0.45)' : '#64748b' }}
                >
                  {plan.description}
                </p>
              </div>

              <hr style={{ borderColor: plan.highlight ? 'rgba(255,255,255,0.08)' : '#e2e8f0' }} />

              <ul className="flex flex-col gap-3 flex-1" aria-label={`${plan.name} plan features`}>
                {plan.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-center gap-2.5 text-sm"
                    style={{ color: plan.highlight ? 'rgba(255,255,255,0.8)' : '#334155' }}
                  >
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                      style={{ backgroundColor: plan.highlight ? 'rgba(0,196,122,0.2)' : 'var(--color-primary-subtle)' }}
                      aria-hidden="true"
                    >
                      <Check className="w-3 h-3" style={{ color: 'var(--color-primary)' }} />
                    </div>
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href={plan.href}
                className={plan.highlight ? 'btn-primary text-center' : 'btn-outline text-center'}
              >
                {plan.cta}
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── FAQ ───────────────────────────────────────────────────────────────── */
const faqs = [
  {
    q: 'How do I get started with ClearGuide?',
    a: 'Sign up for a free account, upload your first PDF manual, and ClearGuide will automatically convert it into an accessible digital guide within minutes.',
  },
  {
    q: 'Does the platform support multiple languages?',
    a: 'Yes. ClearGuide supports 50+ languages with AI-powered translation. You can publish once and serve every language automatically.',
  },
  {
    q: 'Can I customise the look of my manual?',
    a: 'Pro and Enterprise plans include full custom branding — your logo, colours, and domain.',
  },
  {
    q: 'Is the AI chat available on all plans?',
    a: 'AI chat support is available on the Pro plan and above. Free plan users get full manual access without the chat feature.',
  },
  {
    q: 'How secure is my manual data?',
    a: 'All data is encrypted at rest and in transit. We are SOC 2 Type II compliant and GDPR ready.',
  },
  {
    q: 'What file formats can I upload?',
    a: 'ClearGuide accepts PDF, Word (.docx), and plain text files. Our converter automatically structures the content, adds headings, and generates the accessible digital version.',
  },
  {
    q: 'Can users download a copy of the guide?',
    a: 'Yes. End users can download guides in PDF or DOCX format directly from the viewer — no account required. Manufacturers can control which export formats are available per guide.',
  },
  {
    q: 'Does ClearGuide work on mobile devices?',
    a: 'Absolutely. All guides are fully responsive and optimised for iOS and Android. The QR scan flow is designed specifically for smartphones — no app installation needed.',
  },
  {
    q: 'How does the QR code system work?',
    a: 'When you publish a manual, ClearGuide generates a unique QR code linked to that guide. Print it on packaging or the product itself and users are taken directly to the correct manual when they scan it.',
  },
  {
    q: 'Can I embed video instructions in a guide?',
    a: 'Yes. On Pro and Enterprise plans you can embed YouTube, Vimeo, or self-hosted video clips alongside text and infographic content, giving users a richer, step-by-step experience.',
  },
  {
    q: 'What accessibility standards does ClearGuide meet?',
    a: 'ClearGuide is designed to WCAG 2.2 Level AAA — the highest accessibility standard. This includes keyboard navigation, high-contrast mode, screen-reader support, adjustable text sizes, and full audio descriptions.',
  },
  {
    q: 'Is there an API for integrating ClearGuide with our existing systems?',
    a: 'Enterprise plans include full REST API access, allowing you to push manual updates, fetch analytics data, and automate QR code generation directly from your own product management tools.',
  },
]

function FAQ() {
  return (
    <section id="faq" className="py-20 md:py-28 bg-slate-50" aria-labelledby="faq-heading">
      <div className="container">
        <div className="grid md:grid-cols-[260px_1fr] gap-14 items-start">

          {/* Left sticky */}
          <div className="md:sticky md:top-24">
            <SectionLabel>FAQ</SectionLabel>
            <h2
              id="faq-heading"
              className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight mb-5 tracking-tight text-balance"
            >
              Frequently asked questions
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed mb-7">
              Can&apos;t find what you&apos;re looking for? We&apos;ll get back to you within one business day.
            </p>
            <Link href="/sign-up" className="btn-primary text-sm">
              Contact us
            </Link>
          </div>

          {/* Accordion */}
          <div className="rounded-2xl overflow-hidden border border-slate-100 bg-white divide-y divide-slate-100">
            {faqs.map((faq) => (
              <details key={faq.q} className="group">
                <summary className="flex items-center justify-between gap-4 px-6 py-5 cursor-pointer list-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-400">
                  <span className="text-sm font-semibold text-slate-900">{faq.q}</span>
                  <ChevronDown
                    className="w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 group-open:rotate-180"
                    aria-hidden="true"
                  />
                </summary>
                <p className="px-6 pb-6 text-sm text-slate-500 leading-relaxed">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─── Final CTA ─────────────────────────────────────────────────────────── */
function FinalCTA() {
  return (
    <section className="py-20 md:py-28 bg-slate-900" aria-labelledby="final-cta-heading">
      <div className="container">
        <div className="max-w-2xl mx-auto text-center">
          <div
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold mb-8 border"
            style={{ backgroundColor: 'rgba(0,196,122,0.12)', borderColor: 'rgba(0,196,122,0.3)', color: '#4ade80' }}
          >
            <Zap className="w-3 h-3" aria-hidden="true" />
            Start in under 5 minutes
          </div>

          <h2
            id="final-cta-heading"
            className="text-3xl md:text-5xl font-bold text-white mb-5 leading-tight tracking-tight text-balance"
          >
            Manuals that are actually{' '}
            <em className="not-italic font-bold" style={{ color: 'var(--color-primary)' }}>
              user-friendly
            </em>
          </h2>

          <p className="text-slate-400 text-base mb-10 max-w-md mx-auto leading-relaxed">
            Join thousands of manufacturers delivering better experiences to their users.
            No credit card required.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/sign-up" className="btn-primary">
              Get started free
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
            <Link href="#" className="btn-outline border-slate-700 text-slate-300 hover:border-slate-500 hover:bg-slate-800">
              Book a demo
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─── Footer ────────────────────────────────────────────────────────────── */
const footerCols = [
  {
    heading: 'Product',
    links: [
      { label: 'Features',  href: '#features' },
      { label: 'Pricing',   href: '#pricing'  },
      { label: 'Changelog', href: '#'         },
      { label: 'Roadmap',   href: '#'         },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'About',    href: '#' },
      { label: 'Blog',     href: '#' },
      { label: 'Careers',  href: '#' },
      { label: 'Press',    href: '#' },
    ],
  },
  {
    heading: 'Support',
    links: [
      { label: 'Docs',          href: '#'    },
      { label: 'FAQ',           href: '#faq' },
      { label: 'Contact',       href: '#'    },
      { label: 'Accessibility', href: '#'    },
    ],
  },
]

const socialLinks = [
  { icon: Twitter,  label: 'Twitter',  href: '#' },
  { icon: Linkedin, label: 'LinkedIn', href: '#' },
  { icon: Github,   label: 'GitHub',   href: '#' },
]

function Footer() {
  return (
    <footer role="contentinfo" className="bg-slate-950 py-16">
      <div className="container">
        <div className="grid grid-cols-2 md:grid-cols-[1.5fr_repeat(3,1fr)] gap-10 mb-14">

          {/* Brand block */}
          <div className="col-span-2 md:col-span-1">
            <Link
              href="/"
              className="flex items-center gap-2.5 mb-5 w-fit focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded"
              aria-label="ClearGuide home"
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: 'var(--color-primary)' }}
                aria-hidden="true"
              >
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-bold text-white tracking-tight">
                Clear<span style={{ color: 'var(--color-primary)' }}>Guide</span>
              </span>
            </Link>
            <p className="text-sm max-w-[220px] leading-relaxed text-slate-500 mb-6">
              Making product manuals accessible to everyone, everywhere — one guide at a time.
            </p>
            {/* Social icons */}
            <div className="flex items-center gap-3">
              {socialLinks.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-white hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                >
                  <Icon className="w-4 h-4" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {footerCols.map((col) => (
            <div key={col.heading}>
              <h3 className="text-xs font-bold uppercase tracking-widest mb-5 text-slate-400">
                {col.heading}
              </h3>
              <ul className="flex flex-col gap-3">
                {col.links.map(({ label, href }) => (
                  <li key={label}>
                    <a href={href} className="footer-link text-sm">
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-800">
          <p className="text-xs text-slate-600">
            &copy; {new Date().getFullYear()} ClearGuide. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            {['Privacy', 'Terms', 'Accessibility'].map((label) => (
              <a key={label} href="#" className="footer-link text-xs">
                {label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

/* ─── Page ───���──────────────────────────────────────────────────────────── */
export default function LandingPage() {
  return (
    <>
      <NavBar />
      <main id="main-content">
        <Hero />
        <SeeHowItWorks />
        <WhyClearGuide />
        <BeforeAfter />
        <PlatformFeatures />
        <FindYourGuideSection />
        <Testimonials />
        <ManufacturerSection />
        <Pricing />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </>
  )
}
