import { useRef, useEffect, useLayoutEffect } from 'react'

/**
 * Handles scroll-state bookkeeping for the GameCard detail pane so that
 * programmatic additions/removals keep the scroll position feeling natural.
 */
export const useCardScroll = (instances) => {
  const scrollableContentRef = useRef(null)
  const previousInstancesLengthRef = useRef(instances.length)
  const previousScrollHeightRef = useRef(null)
  const previousScrollTopRef = useRef(null)
  const scrollAnimationFrameRef = useRef(null)

  useEffect(() => {
    const scrollContainer = scrollableContentRef.current
    if (!scrollContainer) return

    const updateScrollState = () => {
      previousScrollHeightRef.current = scrollContainer.scrollHeight
      previousScrollTopRef.current = scrollContainer.scrollTop
    }

    scrollContainer.addEventListener('scroll', updateScrollState, { passive: true })
    const interval = setInterval(updateScrollState, 100)

    return () => {
      scrollContainer.removeEventListener('scroll', updateScrollState)
      clearInterval(interval)
      if (scrollAnimationFrameRef.current) {
        cancelAnimationFrame(scrollAnimationFrameRef.current)
        scrollAnimationFrameRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    return () => {
      const scrollContainer = scrollableContentRef.current
      if (scrollContainer) {
        previousScrollHeightRef.current = scrollContainer.scrollHeight
        previousScrollTopRef.current = scrollContainer.scrollTop
      }
    }
  }, [instances.length, instances])

  useLayoutEffect(() => {
    const currentLength = instances.length
    const previousLength = previousInstancesLengthRef.current
    const scrollContainer = scrollableContentRef.current

    if (!scrollContainer) {
      previousInstancesLengthRef.current = currentLength
      return
    }

    if (currentLength !== previousLength) {
      const oldScrollHeight = previousScrollHeightRef.current
      const oldScrollTop = previousScrollTopRef.current

      if (!oldScrollHeight || oldScrollTop === null) {
        previousInstancesLengthRef.current = currentLength
        return
      }

      const newScrollHeight = scrollContainer.scrollHeight
      const clientHeight = scrollContainer.clientHeight

      if (currentLength > previousLength) {
        const targetScroll = newScrollHeight - clientHeight
        const startScroll = scrollContainer.scrollTop
        const distance = targetScroll - startScroll

        if (Math.abs(distance) > 0.5) {
          if (scrollAnimationFrameRef.current) {
            cancelAnimationFrame(scrollAnimationFrameRef.current)
            scrollAnimationFrameRef.current = null
          }

          const duration = 400
          const startTime = performance.now()

          const animateScroll = (currentTime) => {
            const elapsed = currentTime - startTime
            const progress = Math.min(elapsed / duration, 1)
            const oneMinusProgress = 1 - progress
            const easeOut = 1 - (oneMinusProgress * oneMinusProgress * oneMinusProgress)
            const newScroll = startScroll + distance * easeOut
            scrollContainer.scrollTop = newScroll

            if (progress < 1) {
              scrollAnimationFrameRef.current = requestAnimationFrame(animateScroll)
            } else {
              scrollContainer.scrollTop = targetScroll
              scrollAnimationFrameRef.current = null
            }
          }

          scrollAnimationFrameRef.current = requestAnimationFrame(animateScroll)
        }
      }
    }

    previousInstancesLengthRef.current = currentLength
  }, [instances.length, instances])

  return {
    scrollableContentRef
  }
}

export default useCardScroll

