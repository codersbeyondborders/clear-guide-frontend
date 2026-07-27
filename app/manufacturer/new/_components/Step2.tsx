'use client'

import { useEditor } from '@/context/ManualEditorContext'
import { LanguagePicker } from '@/components/LanguagePicker'

export function Step2() {
  const { formData, updateFormData, setStep } = useEditor()

  return (
    <section aria-labelledby="step2-title">
      <div className="space-y-1 mb-8">
        <h2 id="step2-title" className="text-xl font-bold" style={{ color: 'var(--color-foreground)' }}>
          Language Selection
        </h2>
        <p className="text-sm" style={{ color: 'var(--color-muted-foreground)' }}>
          Choose which languages your manual will be available in. English is always included.
        </p>
      </div>

      <LanguagePicker
        selected={formData.languages}
        onChange={(langs) => updateFormData({ languages: langs })}
      />

      <div className="flex items-center justify-between mt-8">
        <button
          type="button"
          onClick={() => setStep(1)}
          className="btn-outline"
        >
          Back
        </button>
        <button
          type="button"
          onClick={() => setStep(3)}
          className="btn-primary"
        >
          Next: Content
        </button>
      </div>
    </section>
  )
}
