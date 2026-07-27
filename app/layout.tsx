import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/context/ThemeContext'
import { AuthProvider } from '@/context/AuthContext'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
  weight: ['400', '500', '600', '700', '800'],
})

export const metadata: Metadata = {
  title: {
    default: 'ClearGuide — Accessible AI-Powered Product Manuals',
    template: '%s — ClearGuide',
  },
  description:
    'Replace paper manuals with accessible, AI-powered digital guides. High-contrast mode, multi-language, QR integration, and instant AI chat support.',
  keywords: ['product manual', 'accessible manual', 'AI guide', 'manufacturer tool', 'QR manual'],
  openGraph: {
    title: 'ClearGuide — Accessible AI-Powered Product Manuals',
    description: 'Create and share accessible product manuals with AI-powered support.',
    type: 'website',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#ffffff',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} font-sans scroll-smooth bg-background`} suppressHydrationWarning>
      <body className="font-sans antialiased bg-white text-slate-900">
        {/* Skip to main content — WCAG 2.4.1 */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:rounded-lg focus:text-sm focus:font-semibold focus:shadow-lg"
          style={{ backgroundColor: 'var(--color-primary)', color: '#ffffff' }}
        >
          Skip to main content
        </a>
        <ThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
