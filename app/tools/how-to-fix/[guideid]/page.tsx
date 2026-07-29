'use client'

import { useParams, useRouter } from 'next/navigation'
import useSWR from 'swr'
import { ArrowLeft, Loader2, AlertTriangle, Wrench, ShieldAlert, CheckCircle2 } from 'lucide-react'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function GuideViewerPage() {
  const params = useParams()
  const router = useRouter()
  const guideid = params.guideid as string

  const { data: response, error, isLoading } = useSWR(
    guideid ? `/api/ifixit/guides/${guideid}` : null,
    fetcher
  )

  const guide = response?.data?.transformed_content
  const canonicalUrl = response?.data?.canonical_url
  const expiresAt = response?.data?.expires_at

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    )
  }

  if (error || !guide) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4 text-center">
        <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Guide Not Found</h1>
        <p className="text-slate-600 mb-6">We couldn't load this repair guide. It may be temporarily unavailable.</p>
        <button 
          onClick={() => router.back()}
          className="px-6 py-2 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors"
        >
          Go Back
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      {/* Top Navigation */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors font-medium text-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Search
          </button>
        </div>
      </div>

      {/* Hero Header */}
      <header className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wide mb-6">
          <Wrench className="w-3.5 h-3.5" />
          {guide.category} • {guide.difficulty || 'Unknown Difficulty'}
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 leading-tight mb-4">
          {guide.title}
        </h1>
        <p className="text-lg md:text-xl text-slate-600 max-w-3xl leading-relaxed">
          {guide.summary}
        </p>
      </header>

      <main className="max-w-4xl mx-auto px-4 space-y-8">
        
        {/* Checklists (Tools & Safety) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tools Checklist */}
          <section className="bg-white rounded-2xl p-6 ring-1 ring-slate-200 shadow-sm">
            <div className="flex items-center gap-2 mb-4 text-emerald-700">
              <Wrench className="w-5 h-5" />
              <h2 className="text-lg font-bold">Required Tools</h2>
            </div>
            {guide.tools && guide.tools.length > 0 ? (
              <ul className="space-y-3">
                {guide.tools.map((tool: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-slate-700 font-medium">{tool}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-slate-500 text-sm italic">No specific tools listed.</p>
            )}
          </section>

          {/* Safety Warnings */}
          <section className="bg-amber-50 rounded-2xl p-6 ring-1 ring-amber-200/50 shadow-sm">
            <div className="flex items-center gap-2 mb-4 text-amber-700">
              <ShieldAlert className="w-5 h-5" />
              <h2 className="text-lg font-bold">Safety Checklist</h2>
            </div>
            {guide.safety_warnings && guide.safety_warnings.length > 0 ? (
              <ul className="space-y-3">
                {guide.safety_warnings.map((warning: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-3 bg-white/60 p-3 rounded-lg ring-1 ring-amber-200/50">
                    <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <span className="text-amber-900 text-sm font-medium leading-snug" dangerouslySetInnerHTML={{ __html: warning }} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-amber-700 text-sm italic">No automated safety warnings detected. Please proceed with standard caution.</p>
            )}
          </section>
        </div>

        {/* Step-by-Step Viewer */}
        <section className="mt-12 space-y-12">
          <h2 className="text-2xl font-extrabold text-slate-900 border-b border-slate-200 pb-4">
            Instructions
          </h2>
          {guide.steps && guide.steps.length > 0 ? (
            <div className="space-y-16">
              {guide.steps.map((step: any, idx: number) => (
                <article key={step.step_id || idx} className="scroll-mt-24">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg shrink-0">
                      {idx + 1}
                    </div>
                    {step.title && (
                      <h3 className="text-xl font-bold text-slate-900">{step.title}</h3>
                    )}
                  </div>
                  
                  {/* Step Images */}
                  {step.media && step.media.data && step.media.data.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                      {step.media.data.map((mediaItem: any, mIdx: number) => (
                        <div key={mIdx} className="rounded-xl overflow-hidden ring-1 ring-slate-200 shadow-sm bg-white">
                          <img 
                            src={mediaItem.standard} 
                            alt={`Step ${idx + 1} illustration`} 
                            className="w-full h-auto object-cover"
                            loading="lazy"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Step Text Lines */}
                  <div className="pl-14 space-y-4">
                    {step.lines.map((line: string, lIdx: number) => (
                      <div 
                        key={lIdx} 
                        className="text-lg text-slate-700 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: line }}
                      />
                    ))}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 italic">This guide does not contain any step-by-step instructions.</p>
          )}
        </section>

      </main>

      {/* Mandatory Attribution Footer (CC BY-NC-SA) */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900 text-slate-300 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] border-t border-slate-800">
        <div className="max-w-4xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white">Open Educational Resource.</span>
            <span>Community modifications licensed under CC BY-NC-SA 3.0.</span>
          </div>
          <a 
            href={canonicalUrl || "https://www.ifixit.com"} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-emerald-400 font-bold transition-colors shadow-sm"
          >
            Powered by iFixit &rarr;
          </a>
        </div>
      </div>
    </div>
  )
}
