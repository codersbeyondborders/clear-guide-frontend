'use client'

import { Minus, Plus, Contrast, Volume2, VolumeX } from 'lucide-react'
import { useAccessibility } from '@/context/AccessibilityContext'

interface AccessibilityControlsProps {
  availableLanguages?: string[]
  manualId?: string
  className?: string
}

const LANGUAGE_LABELS: Record<string, string> = {
  en: 'English', fr: 'Français', de: 'Deutsch', es: 'Español', it: 'Italiano',
  pt: 'Português', nl: 'Nederlands', pl: 'Polski', ja: '日本語', ko: '한국어',
  zh: '中文', ar: 'العربية', hi: 'हिन्दी', ru: 'Русский', sv: 'Svenska', tr: 'Türkçe',
}

export function AccessibilityControls({ availableLanguages = ['en'], className = '' }: AccessibilityControlsProps) {
  const { highContrast, fontSize, ttsEnabled, language, toggleHighContrast, increaseFontSize, decreaseFontSize, toggleTTS, setLanguage } = useAccessibility()

  const hc = highContrast
  const btnBase = `flex items-center justify-center rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 ${hc ? 'focus-visible:outline-yellow-400' : 'focus-visible:outline-primary'}`
  const btnIdle = hc ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700 border border-yellow-400/40' : 'bg-card text-foreground hover:bg-card-hover border border-border'
  const btnActive = hc ? 'bg-yellow-400 text-black' : 'bg-primary-subtle text-primary border border-primary/30'

  return (
    <div
      className={`flex items-center gap-2 flex-wrap ${className}`}
      role="toolbar"
      aria-label="Accessibility controls"
    >
      {/* Language selector */}
      {availableLanguages.length > 1 && (
        <label className="sr-only" htmlFor="a11y-lang-select">Display language</label>
      )}
      {availableLanguages.length > 1 && (
        <select
          id="a11y-lang-select"
          value={language}
          onChange={e => setLanguage(e.target.value)}
          className={`h-9 px-3 rounded-lg text-sm font-medium border transition-colors focus:outline-none focus:ring-2 ${
            hc
              ? 'bg-black text-yellow-400 border-yellow-400 focus:ring-yellow-400'
              : 'bg-card text-foreground border-border focus:ring-primary'
          }`}
          aria-label="Select display language"
        >
          {availableLanguages.map(lang => (
            <option key={lang} value={lang}>
              {LANGUAGE_LABELS[lang] ?? lang.toUpperCase()}
            </option>
          ))}
        </select>
      )}

      {/* Font size decrease */}
      <button
        onClick={decreaseFontSize}
        disabled={fontSize === 'sm'}
        aria-label="Decrease font size"
        className={`${btnBase} w-9 h-9 ${btnIdle} disabled:opacity-40 disabled:cursor-not-allowed`}
      >
        <Minus className="w-4 h-4" aria-hidden="true" />
      </button>

      {/* Font size increase */}
      <button
        onClick={increaseFontSize}
        disabled={fontSize === 'xl'}
        aria-label="Increase font size"
        className={`${btnBase} w-9 h-9 ${btnIdle} disabled:opacity-40 disabled:cursor-not-allowed`}
      >
        <Plus className="w-4 h-4" aria-hidden="true" />
      </button>

      {/* High contrast toggle */}
      <button
        onClick={toggleHighContrast}
        aria-label={highContrast ? 'Disable high contrast mode' : 'Enable high contrast mode'}
        aria-pressed={highContrast}
        className={`${btnBase} w-9 h-9 ${highContrast ? btnActive : btnIdle}`}
      >
        <Contrast className="w-4 h-4" aria-hidden="true" />
      </button>

      {/* TTS toggle */}
      <button
        onClick={toggleTTS}
        aria-label={ttsEnabled ? 'Disable text-to-speech' : 'Enable text-to-speech'}
        aria-pressed={ttsEnabled}
        className={`${btnBase} w-9 h-9 ${ttsEnabled ? btnActive : btnIdle}`}
      >
        {ttsEnabled
          ? <Volume2 className="w-4 h-4" aria-hidden="true" />
          : <VolumeX className="w-4 h-4" aria-hidden="true" />
        }
      </button>
    </div>
  )
}
