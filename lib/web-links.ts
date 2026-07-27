/**
 * lib/web-links.ts
 *
 * Pure helper that builds a list of external "deep link" search URLs from a set
 * of device specs. Used by the non-validated / open-source finding flow (3.2)
 * so users can jump to the wider web (Google, Reddit, YouTube, iFixit, and the
 * manufacturer's own support search) when we don't have the product in-system.
 *
 * No network calls — this only constructs URLs.
 */

export interface DeviceSpecs {
  brand?: string | null
  model?: string | null
  productType?: string | null
  keywords?: string | null
}

export interface WebLink {
  id: string
  label: string
  description: string
  url: string
}

/** Joins the meaningful spec fields into a single search phrase. */
export function specsToQuery(specs: DeviceSpecs, extra = ''): string {
  const parts = [specs.brand, specs.model, specs.productType, specs.keywords, extra]
    .map(p => (p ?? '').trim())
    .filter(Boolean)
  // De-dupe words while preserving order (e.g. brand repeated in model).
  const seen = new Set<string>()
  const words: string[] = []
  for (const part of parts) {
    for (const word of part.split(/\s+/)) {
      const key = word.toLowerCase()
      if (!seen.has(key)) {
        seen.add(key)
        words.push(word)
      }
    }
  }
  return words.join(' ')
}

/**
 * Generic, spec-less resources shown when we have nothing to search for
 * (e.g. the vision service was unavailable). Gives the user a useful starting
 * point instead of an empty open-source panel.
 */
function genericWebLinks(): WebLink[] {
  return [
    {
      id: 'google-generic',
      label: 'Search Google',
      description: 'Search the web for your device by name or model number.',
      url: 'https://www.google.com/search?q=device+user+manual',
    },
    {
      id: 'youtube-generic',
      label: 'YouTube repair videos',
      description: 'Browse step-by-step repair and setup walkthroughs.',
      url: 'https://www.youtube.com/results?search_query=device+repair+how+to',
    },
    {
      id: 'ifixit-generic',
      label: 'iFixit guides',
      description: 'Community repair guides and part diagrams.',
      url: 'https://www.ifixit.com/',
    },
  ]
}

/**
 * Builds the array of external search deep-links.
 * Falls back to generic resources when there is nothing meaningful to search
 * for, so the open-source flow is never a dead end.
 */
export function buildWebLinks(specs: DeviceSpecs): WebLink[] {
  const base = specsToQuery(specs)
  if (!base) return genericWebLinks()

  const enc = (s: string) => encodeURIComponent(s)

  const links: WebLink[] = [
    {
      id: 'google-manual',
      label: 'Google — user manual',
      description: 'Find the official manual or setup guide on the web.',
      url: `https://www.google.com/search?q=${enc(`${base} user manual pdf`)}`,
    },
    {
      id: 'google-fix',
      label: 'Google — troubleshooting',
      description: 'Search for common problems and fixes.',
      url: `https://www.google.com/search?q=${enc(`${base} troubleshooting fix`)}`,
    },
    {
      id: 'reddit',
      label: 'Reddit discussions',
      description: 'See how others solved similar issues.',
      url: `https://www.google.com/search?q=${enc(`${base} site:reddit.com`)}`,
    },
    {
      id: 'youtube',
      label: 'YouTube repair videos',
      description: 'Watch step-by-step repair walkthroughs.',
      url: `https://www.youtube.com/results?search_query=${enc(`${base} repair how to`)}`,
    },
    {
      id: 'ifixit',
      label: 'iFixit guides',
      description: 'Community repair guides and part diagrams.',
      url: `https://www.ifixit.com/Search?query=${enc(base)}`,
    },
  ]

  // Manufacturer support search only makes sense when we know the brand.
  const brand = (specs.brand ?? '').trim()
  if (brand) {
    links.push({
      id: 'manufacturer',
      label: `${brand} support`,
      description: 'Look for official support pages from the manufacturer.',
      url: `https://www.google.com/search?q=${enc(`${brand} official support ${specs.model ?? ''}`)}`,
    })
  }

  return links
}
