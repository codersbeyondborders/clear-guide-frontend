'use client'

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface Section {
  id: string
  title: string
  content: string
  imageUrls: string[]
  videoUrls: string[]
}

export interface EditorFormData {
  productName: string
  productModel: string
  brand: string
  serialNumber: string
  languages: string[]
  uploadMethod: 'upload' | 'sections' | null
  uploadedFileName: string | null
  uploadedFileSize: number | null
  uploadedFilePathname: string | null
  sections: Section[]
  status: 'draft' | 'published'
  /** Whether a published manual is listed publicly in the Products Forum. */
  isPublic: boolean
}

interface EditorContextValue {
  step: 1 | 2 | 3 | 4
  formData: EditorFormData
  manualId: string | null
  setStep: (step: 1 | 2 | 3 | 4) => void
  updateFormData: (patch: Partial<EditorFormData>) => void
  setManualId: (id: string) => void
}

// ---------------------------------------------------------------------------
// Default state
// ---------------------------------------------------------------------------
const DEFAULT_FORM: EditorFormData = {
  productName: '',
  productModel: '',
  brand: '',
  serialNumber: '',
  languages: ['en'],
  uploadMethod: null,
  uploadedFileName: null,
  uploadedFileSize: null,
  uploadedFilePathname: null,
  sections: [],
  status: 'draft',
  isPublic: true,
}

const LS_KEY = 'clearguide_editor_draft'

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------
const EditorContext = createContext<EditorContextValue | null>(null)

export function useEditor() {
  const ctx = useContext(EditorContext)
  if (!ctx) throw new Error('useEditor must be used inside ManualEditorProvider')
  return ctx
}

export function ManualEditorProvider({
  children,
  initialData,
  initialId,
}: {
  children: React.ReactNode
  initialData?: Partial<EditorFormData>
  initialId?: string
}) {
  const [step, setStepState] = useState<1 | 2 | 3 | 4>(1)
  const [manualId, setManualId] = useState<string | null>(initialId ?? null)
  const [formData, setFormData] = useState<EditorFormData>(() => {
    // If we have server-provided initial data (edit mode), use it directly
    if (initialData && Object.keys(initialData).length > 0) {
      return { ...DEFAULT_FORM, ...initialData }
    }
    // Otherwise try to restore draft from localStorage
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(LS_KEY)
        if (saved) return { ...DEFAULT_FORM, ...JSON.parse(saved) }
      } catch { /* ignore parse errors */ }
    }
    return DEFAULT_FORM
  })

  // Auto-save draft to localStorage on every change
  useEffect(() => {
    if (!initialData) {
      try {
        localStorage.setItem(LS_KEY, JSON.stringify(formData))
      } catch { /* ignore */ }
    }
  }, [formData, initialData])

  const updateFormData = useCallback((patch: Partial<EditorFormData>) => {
    setFormData((prev) => ({ ...prev, ...patch }))
  }, [])

  const setStep = useCallback((s: 1 | 2 | 3 | 4) => {
    setStepState(s)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  return (
    <EditorContext.Provider value={{ step, formData, manualId, setStep, updateFormData, setManualId }}>
      {children}
    </EditorContext.Provider>
  )
}
