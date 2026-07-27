'use client'

import { Check } from 'lucide-react'

// BCP-47 language codes + display names + flag emojis (text only, no image)
export const SUPPORTED_LANGUAGES: { code: string; name: string; region: string }[] = [
  { code: 'en', name: 'English',    region: 'US' },
  { code: 'fr', name: 'French',     region: 'FR' },
  { code: 'de', name: 'German',     region: 'DE' },
  { code: 'es', name: 'Spanish',    region: 'ES' },
  { code: 'it', name: 'Italian',    region: 'IT' },
  { code: 'pt', name: 'Portuguese', region: 'PT' },
  { code: 'nl', name: 'Dutch',      region: 'NL' },
  { code: 'pl', name: 'Polish',     region: 'PL' },
  { code: 'ru', name: 'Russian',    region: 'RU' },
  { code: 'zh', name: 'Chinese',    region: 'CN' },
  { code: 'ja', name: 'Japanese',   region: 'JP' },
  { code: 'ko', name: 'Korean',     region: 'KR' },
  { code: 'ar', name: 'Arabic',     region: 'SA' },
  { code: 'hi', name: 'Hindi',      region: 'IN' },
  { code: 'tr', name: 'Turkish',    region: 'TR' },
  { code: 'sv', name: 'Swedish',    region: 'SE' },
]

interface LanguagePickerProps {
  selected: string[]
  onChange: (langs: string[]) => void
}

export function LanguagePicker({ selected, onChange }: LanguagePickerProps) {
  const toggle = (code: string) => {
    if (code === 'en') return // English is always selected
    if (selected.includes(code)) {
      onChange(selected.filter((l) => l !== code))
    } else {
      onChange([...selected, code])
    }
  }

  const FLAG: Record<string, string> = {
    US: '🇺🇸', ES: '🇪🇸', FR: '🇫🇷', DE: '🇩🇪', IT: '🇮🇹',
    PT: '🇵🇹', CN: '🇨🇳', JP: '🇯🇵', SA: '🇸🇦', IN: '🇮🇳',
    KR: '🇰🇷', NL: '🇳🇱', PL: '🇵🇱', RU: '🇷🇺', TR: '🇹🇷', SE: '🇸🇪',
  }

  return (
    <div className="space-y-4">
      {/* Language grid — matches New Manual style exactly */}
      <div
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5"
        role="group"
        aria-label="Select languages"
      >
        {SUPPORTED_LANGUAGES.map((lang) => {
          const isSelected = selected.includes(lang.code)
          const isDisabled = lang.code === 'en'
          return (
            <button
              key={lang.code}
              type="button"
              role="checkbox"
              aria-checked={isSelected}
              aria-label={lang.name}
              disabled={isDisabled}
              onClick={() => toggle(lang.code)}
              className="relative flex items-center gap-2 px-3 py-2.5 rounded-xl border text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              style={{
                borderColor: isSelected ? 'var(--color-primary)' : 'var(--color-border)',
                backgroundColor: isSelected ? 'var(--color-primary-subtle)' : 'var(--color-card)',
                cursor: isDisabled ? 'default' : 'pointer',
              }}
            >
              <span className="text-base" aria-hidden="true">
                {FLAG[lang.region] ?? '🌐'}
              </span>
              <span className="text-sm font-medium truncate flex-1" style={{ color: 'var(--color-foreground)' }}>
                {lang.name}
              </span>
              {isSelected && (
                <span
                  className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                  aria-hidden="true"
                >
                  <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
