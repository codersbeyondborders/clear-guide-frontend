'use client'

import { useState } from 'react'
import { useEditor } from '@/context/ManualEditorContext'

export function Step1() {
  const { formData, updateFormData, setStep } = useEditor()
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const fields = [
    { id: 'productName',  label: 'Product Name',    placeholder: 'e.g. Smart Coffee Maker', required: true },
    { id: 'productModel', label: 'Product Model',   placeholder: 'e.g. CX-1000',           required: true },
    { id: 'brand',        label: 'Brand / Make',    placeholder: 'e.g. BrewTech',           required: true },
    { id: 'serialNumber', label: 'Serial Number',   placeholder: 'Optional',                required: false },
  ] as const

  type FieldId = typeof fields[number]['id']

  const getValue = (id: FieldId) => formData[id] ?? ''

  const isValid = (id: FieldId) => {
    const f = fields.find((f) => f.id === id)!
    if (!f.required) return true
    return getValue(id).trim().length > 0
  }

  const allValid = fields.every((f) => isValid(f.id))

  const handleBlur = (id: FieldId) => setTouched((t) => ({ ...t, [id]: true }))

  return (
    <section aria-labelledby="step1-title">
      <div className="space-y-1 mb-8">
        <h2 id="step1-title" className="text-xl font-bold" style={{ color: 'var(--color-foreground)' }}>
          Basic Information
        </h2>
        <p className="text-sm" style={{ color: 'var(--color-muted-foreground)' }}>
          Tell us about the product this manual covers.
        </p>
      </div>

      <div className="space-y-5">
        {fields.map((field) => {
          const invalid = touched[field.id] && !isValid(field.id)
          return (
            <div key={field.id} className="space-y-1.5">
              <label
                htmlFor={field.id}
                className="block text-sm font-medium"
                style={{ color: 'var(--color-foreground)' }}
              >
                {field.label}
                {field.required && (
                  <span className="ml-1" style={{ color: 'var(--color-destructive)' }} aria-hidden="true">*</span>
                )}
              </label>
              <input
                id={field.id}
                type="text"
                value={getValue(field.id)}
                onChange={(e) => updateFormData({ [field.id]: e.target.value })}
                onBlur={() => handleBlur(field.id)}
                placeholder={field.placeholder}
                required={field.required}
                aria-required={field.required}
                aria-invalid={invalid}
                aria-describedby={invalid ? `${field.id}-error` : undefined}
                className="auth-input"
                style={invalid ? { borderColor: 'var(--color-destructive)' } : {}}
              />
              {invalid && (
                <p id={`${field.id}-error`} className="text-xs" style={{ color: 'var(--color-destructive)' }}>
                  {field.label} is required.
                </p>
              )}
            </div>
          )
        })}
      </div>

      <div className="flex items-center justify-between mt-8">
        <button
          type="button"
          onClick={() => {
            /* save draft — handled by auto-save in context */
          }}
          className="btn-ghost text-sm"
          style={{ color: 'var(--color-muted-foreground)' }}
        >
          Save as draft
        </button>
        <button
          type="button"
          onClick={() => setStep(2)}
          disabled={!allValid}
          className="btn-primary"
        >
          Next: Language Selection
        </button>
      </div>
    </section>
  )
}
