/**
 * lib/sanitize.ts
 *
 * Input sanitisation helpers using `sanitize-html`.
 *
 * Two levels of sanitisation are available:
 *
 * 1. `sanitizeRichContent(html)` — allows a small, safe set of block and
 *    inline HTML tags (bold, italic, lists, headings). Use for section content
 *    that may contain user-authored markup.
 *
 * 2. `sanitizePlainText(str)` — strips ALL HTML tags and collapses excessive
 *    whitespace. Use for product names, brands, model numbers, and any other
 *    short text field where HTML is never expected.
 *
 * Both functions are synchronous and safe to call in Server Components,
 * Route Handlers, and Server Actions.
 */

import sanitizeHtml from 'sanitize-html'

// ---------------------------------------------------------------------------
// Allowed tag + attribute whitelist for rich section content
// ---------------------------------------------------------------------------
const RICH_ALLOWED_TAGS = [
  'p', 'br',
  'h1', 'h2', 'h3', 'h4',
  'strong', 'b', 'em', 'i', 'u', 's', 'mark',
  'ul', 'ol', 'li',
  'blockquote', 'pre', 'code',
  'table', 'thead', 'tbody', 'tr', 'th', 'td',
  'a',
]

const RICH_ALLOWED_ATTRS: sanitizeHtml.IOptions['allowedAttributes'] = {
  // Allow href on <a> but only safe protocols
  a: ['href', 'title', 'target', 'rel'],
  // Allow colspan/rowspan on table cells
  th: ['colspan', 'rowspan'],
  td: ['colspan', 'rowspan'],
}

const RICH_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: RICH_ALLOWED_TAGS,
  allowedAttributes: RICH_ALLOWED_ATTRS,
  // Enforce safe link protocols — strips javascript:, data:, etc.
  allowedSchemes: ['http', 'https', 'mailto'],
  // Force noopener/noreferrer on target=_blank links
  transformTags: {
    a: (tagName, attribs) => ({
      tagName,
      attribs: {
        ...attribs,
        ...(attribs.target === '_blank'
          ? { rel: 'noopener noreferrer' }
          : {}),
      },
    }),
  },
}

/**
 * Sanitise rich HTML content — keeps safe structural tags but removes
 * scripts, event handlers, iframes, and all unsafe attributes.
 */
export function sanitizeRichContent(input: string): string {
  if (!input) return ''
  return sanitizeHtml(input, RICH_OPTIONS)
}

// ---------------------------------------------------------------------------
// Plain text sanitiser — strips ALL tags
// ---------------------------------------------------------------------------
const PLAIN_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [],
  allowedAttributes: {},
  disallowedTagsMode: 'discard',
}

/**
 * Strip all HTML from a plain-text field and collapse whitespace.
 * Use for product names, brands, serial numbers, and model numbers.
 */
export function sanitizePlainText(input: string): string {
  if (!input) return ''
  return sanitizeHtml(input, PLAIN_OPTIONS)
    .replace(/\s+/g, ' ')
    .trim()
}

// ---------------------------------------------------------------------------
// Convenience: sanitise a full CreateManualInput object in-place
// ---------------------------------------------------------------------------
export function sanitizeManualInput<
  T extends {
    productName: string
    productModel: string
    brand: string
    serialNumber?: string | null
    sections?: Array<{ title: string; content: string }>
  },
>(input: T): T {
  return {
    ...input,
    productName:  sanitizePlainText(input.productName),
    productModel: sanitizePlainText(input.productModel),
    brand:        sanitizePlainText(input.brand),
    serialNumber: input.serialNumber ? sanitizePlainText(input.serialNumber) : input.serialNumber,
    sections: input.sections?.map(s => ({
      ...s,
      title:   sanitizePlainText(s.title),
      content: sanitizeRichContent(s.content),
    })),
  }
}
