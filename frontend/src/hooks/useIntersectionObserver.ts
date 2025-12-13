import { useEffect, useRef, useState } from 'react'

interface UseIntersectionObserverOptions {
  threshold?: number | number[]
  rootMargin?: string
  enabled?: boolean
}

/**
 * Custom hook for detecting when an element enters the viewport.
 * 
 * Uses IntersectionObserver API to efficiently track viewport visibility.
 * Triggers a callback when the element crosses the visibility threshold.
 * 
 * @param options.threshold - Visibility threshold (0 to 1). Default: 0.5 (50% visible)
 * @param options.rootMargin - Margin around the root element. Default: '0px'
 * @param options.enabled - Whether observation is enabled. Default: true
 * @returns Object with ref to attach to element and isIntersecting state
 * 
 * @example
 * const { ref, isIntersecting } = useIntersectionObserver({ threshold: 0.5 })
 * 
 * useEffect(() => {
 *   if (isIntersecting) {
 *     // Element is now visible in viewport
 *   }
 * }, [isIntersecting])
 * 
 * return <div ref={ref}>Content</div>
 */
export function useIntersectionObserver(
  options: UseIntersectionObserverOptions = {}
) {
  const { threshold = 0.5, rootMargin = '0px', enabled = true } = options
  const [isIntersecting, setIsIntersecting] = useState(false)
  const elementRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const element = elementRef.current
    if (!element || !enabled) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting)
      },
      {
        threshold,
        rootMargin,
      }
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [threshold, rootMargin, enabled])

  return { ref: elementRef, isIntersecting }
}
