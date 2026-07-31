import { useEffect, useRef } from 'react'

export function useAnalyticsTimeTracker(manualId: string, mode: string) {
  const startTimeRef = useRef<number>(Date.now())
  const accumulatedTimeRef = useRef<number>(0)
  const isVisibleRef = useRef<boolean>(true)

  useEffect(() => {
    // Record start time on mount
    startTimeRef.current = Date.now()
    isVisibleRef.current = document.visibilityState === 'visible'

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Resumed
        startTimeRef.current = Date.now()
        isVisibleRef.current = true
      } else {
        // Hidden/Paused
        if (isVisibleRef.current) {
          accumulatedTimeRef.current += Date.now() - startTimeRef.current
        }
        isVisibleRef.current = false
      }
    }

    const handleBeforeUnload = () => {
      // Add any remaining time if still visible
      if (isVisibleRef.current) {
        accumulatedTimeRef.current += Date.now() - startTimeRef.current
        isVisibleRef.current = false
      }

      const totalTimeSeconds = Math.floor(accumulatedTimeRef.current / 1000)
      
      // Only track if meaningful time was spent (e.g., > 1s)
      if (totalTimeSeconds > 0 && manualId) {
        // Ensure session id exists
        let sessionId = sessionStorage.getItem('cg_session_id')
        if (!sessionId) {
          sessionId = Math.random().toString(36).substring(2)
          sessionStorage.setItem('cg_session_id', sessionId)
        }

        const payload = JSON.stringify({
          userSessionId: sessionId,
          mode,
          timeSpentSeconds: totalTimeSeconds,
          device: /mobile|android|iphone|phone/i.test(navigator.userAgent.toLowerCase()) 
            ? 'mobile' 
            : /ipad|tablet/i.test(navigator.userAgent.toLowerCase()) ? 'tablet' : 'desktop',
          language: navigator.language || 'en-US'
        })

        // Use sendBeacon for reliable delivery during page unload
        // Need to hit the correct analytics endpoint
        // Gateway endpoint is /api/manuals/:id/analytics/events or /api/public...? Wait, from page.tsx it was POST /api/manuals/${manualId}/analytics/events
        navigator.sendBeacon(`/api/manuals/${manualId}/analytics/events`, payload)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('beforeunload', handleBeforeUnload)
      handleBeforeUnload() // ensure we track if unmounted via SPA navigation
    }
  }, [manualId, mode])
}
