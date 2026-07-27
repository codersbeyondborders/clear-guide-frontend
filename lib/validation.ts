/**
 * lib/validation.ts
 * Centralised Zod schemas for all API request bodies.
 * Import the schema you need and call .safeParse() in the route handler.
 */

import { z } from 'zod'

// ---------------------------------------------------------------------------
// Reusable primitives
// ---------------------------------------------------------------------------

/** BCP-47 language code — two or five characters, e.g. "en", "zh-TW" */
const langCode = z.string().regex(/^[a-z]{2}(-[A-Z]{2})?$/, {
  message: 'Language must be a valid BCP-47 code (e.g. "en", "fr", "zh-TW")',
})

// ---------------------------------------------------------------------------
// Manual Section (used inside manual create/update)
// ---------------------------------------------------------------------------
export const ManualSectionSchema = z.object({
  id:          z.string().optional(),
  title:       z.string().min(1, 'Section title is required').max(200),
  content:     z.string().max(50_000).default(''),
  imageUrls:   z.array(z.string().url()).max(20).default([]),
  videoUrls:   z.array(z.string().url()).max(10).default([]),
})

// ---------------------------------------------------------------------------
// POST /api/manuals — create manual
// ---------------------------------------------------------------------------
export const CreateManualSchema = z.object({
  productName:     z.string().min(1, 'Product name is required').max(200),
  productModel:    z.string().min(1, 'Product model is required').max(100),
  brand:           z.string().min(1, 'Brand is required').max(100),
  serialNumber:    z.string().max(100).optional().nullable(),
  languages:       z.array(langCode).min(1).max(50).default(['en']),
  status:          z.enum(['draft', 'processing', 'published', 'archived']).default('processing'),
  isPublic:        z.boolean().default(true),
  uploadMethod:    z.enum(['upload', 'sections']).optional(),
  originalFileUrl: z.string().max(2000).optional().nullable(),
  rawFileText:     z.string().max(500_000).optional().nullable(),
  sections:        z.array(ManualSectionSchema).max(100).default([]),
})

export type CreateManualInput = z.infer<typeof CreateManualSchema>

// ---------------------------------------------------------------------------
// PUT /api/manuals/:id — update manual
// ---------------------------------------------------------------------------
export const UpdateManualSchema = z.object({
  productName:  z.string().min(1).max(200).optional(),
  productModel: z.string().min(1).max(100).optional(),
  brand:        z.string().min(1).max(100).optional(),
  serialNumber: z.string().max(100).optional().nullable(),
  languages:    z.array(langCode).min(1).max(50).optional(),
  status:       z.enum(['draft', 'processing', 'published', 'archived']).optional(),
  isPublic:     z.boolean().optional(),
  sections:     z.array(ManualSectionSchema).max(100).optional(),
})

export type UpdateManualInput = z.infer<typeof UpdateManualSchema>

// ---------------------------------------------------------------------------
// POST /api/chat — chat message
// ---------------------------------------------------------------------------
export const ChatRequestSchema = z.object({
  message:  z.string().min(1, 'Message cannot be empty').max(4000),
  manualId: z.string().min(1, 'manualId is required'),
  history:  z
    .array(
      z.object({
        role:    z.enum(['user', 'assistant']),
        content: z.string().max(4000),
      }),
    )
    .max(20)
    .default([]),
  language: langCode.default('en'),
})

export type ChatRequestInput = z.infer<typeof ChatRequestSchema>

// ---------------------------------------------------------------------------
// POST /api/manuals/:id/analytics — record an analytics event
// ---------------------------------------------------------------------------
export const AnalyticsEventSchema = z.object({
  userSessionId:    z.string().min(1).max(100),
  mode:             z.enum(['text', 'infographic', 'video', 'chat']),
  timeSpentSeconds: z.number().int().min(0).max(86_400),
})

export type AnalyticsEventInput = z.infer<typeof AnalyticsEventSchema>

/** Discriminated union result from parseOrError */
export type ParseResult<T> =
  | { success: true; data: T; response?: never }
  | { success: false; data?: never; response: Response }

// ---------------------------------------------------------------------------
// Helper: parse + return a 422 Response on failure
// ---------------------------------------------------------------------------
export function parseOrError<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
): ParseResult<T> {
  const result = schema.safeParse(data)
  if (result.success) {
    return { success: true, data: result.data }
  }
  // Zod 4 uses .issues; Zod 3 uses .errors — support both
  const issues = (result.error as unknown as { issues?: unknown[]; errors?: unknown[] }).issues
    ?? (result.error as unknown as { errors?: unknown[] }).errors
    ?? []
  const details = (issues as Array<{ path: unknown[]; message: string }>).map(e => ({
    field: Array.isArray(e.path) ? e.path.join('.') : String(e.path),
    message: e.message,
  }))
  return {
    success: false,
    response: Response.json(
      { error: 'Validation failed', details },
      { status: 422 },
    ),
  }
}
