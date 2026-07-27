'use client'

import { useEditor } from '@/context/ManualEditorContext'
import { FileUpload, SectionBuilder } from '@/components/SectionBuilder'

export function Step3() {
  const { formData, updateFormData, setStep } = useEditor()
  const method = formData.uploadMethod

  return (
    <section aria-labelledby="step3-title">
      <div className="space-y-1 mb-8">
        <h2 id="step3-title" className="text-xl font-bold" style={{ color: 'var(--color-foreground)' }}>
          Add Content
        </h2>
        <p className="text-sm" style={{ color: 'var(--color-muted-foreground)' }}>
          Upload an existing document or build your manual section by section.
        </p>
      </div>

      {/* Method selector */}
      {!method && (
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            {
              key: 'upload' as const,
              title: 'Upload Document',
              desc: 'Upload an existing PDF or Word file. We\'ll extract the content automatically.',
              icon: '📄',
            },
            {
              key: 'sections' as const,
              title: 'Build Sections',
              desc: 'Write your manual step-by-step with rich text and media attachments.',
              icon: '✏️',
            },
          ].map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => updateFormData({ uploadMethod: opt.key })}
              className="flex flex-col gap-3 p-6 rounded-xl border-2 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              style={{
                borderColor: 'var(--color-border)',
                backgroundColor: 'var(--color-card)',
              }}
            >
              <span className="text-3xl" aria-hidden="true">{opt.icon}</span>
              <div>
                <p className="font-semibold text-sm" style={{ color: 'var(--color-foreground)' }}>
                  {opt.title}
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--color-muted-foreground)' }}>
                  {opt.desc}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Upload method */}
      {method === 'upload' && (
        <div className="space-y-4">
          <FileUpload
            onFile={(name, size, pathname) =>
              updateFormData({ uploadedFileName: name, uploadedFileSize: size, uploadedFilePathname: pathname ?? null })
            }
            currentFileName={formData.uploadedFileName}
            onClear={() => updateFormData({ uploadedFileName: null, uploadedFileSize: null, uploadedFilePathname: null })}
          />
          <button
            type="button"
            onClick={() => updateFormData({ uploadMethod: null, uploadedFileName: null })}
            className="text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
            style={{ color: 'var(--color-muted-foreground)' }}
          >
            &larr; Change method
          </button>
        </div>
      )}

      {/* Sections method */}
      {method === 'sections' && (
        <div className="space-y-4">
          <SectionBuilder
            sections={formData.sections}
            onChange={(sections) => updateFormData({ sections })}
          />
          <button
            type="button"
            onClick={() => updateFormData({ uploadMethod: null, sections: [] })}
            className="text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
            style={{ color: 'var(--color-muted-foreground)' }}
          >
            &larr; Change method
          </button>
        </div>
      )}

      <div className="flex items-center justify-between mt-8">
        <button type="button" onClick={() => setStep(2)} className="btn-outline">
          Back
        </button>
        <button
          type="button"
          onClick={() => setStep(4)}
          disabled={!method}
          className="btn-primary"
        >
          Next: Review & Publish
        </button>
      </div>
    </section>
  )
}
