import { useCallback } from 'react'

/**
 * Provides a smooth horizontal scrolling helper tied to the dashboard scroll
 * container. Keeps the existing easing curve and scroll-snap toggling logic
 * that lived inline in DashboardView.
 */
export const useSmoothScroll = (scrollContainerRef) => {
  return useCallback(
    (targetScrollLeft, duration = 500) => {
      if (!scrollContainerRef.current) {
        return
      }

      const container = scrollContainerRef.current
      const startScrollLeft = container.scrollLeft
      const distance = targetScrollLeft - startScrollLeft

      if (Math.abs(distance) < 1) {
        return
      }

      if (container._horizontalScrollAnimationId) {
        cancelAnimationFrame(container._horizontalScrollAnimationId)
        container._horizontalScrollAnimationId = null
      }

      const computedStyle = window.getComputedStyle(container)
      const hasScrollSnap = computedStyle.scrollSnapType !== 'none'

      if (hasScrollSnap) {
        container.style.scrollSnapType = 'none'
      }

      const startTime = performance.now()

      const animateScroll = (currentTime) => {
        const elapsed = currentTime - startTime
        const progress = Math.min(elapsed / duration, 1)

        const oneMinusProgress = 1 - progress
        const easeOut = 1 - oneMinusProgress * oneMinusProgress * oneMinusProgress

        if (container) {
          const newScrollLeft = startScrollLeft + distance * easeOut
          container.scrollLeft = newScrollLeft
        }

        if (progress < 1) {
          container._horizontalScrollAnimationId = requestAnimationFrame(animateScroll)
        } else if (container) {
          container.scrollLeft = targetScrollLeft
          container._horizontalScrollAnimationId = null
        }
      }

      container._horizontalScrollAnimationId = requestAnimationFrame(animateScroll)
    },
    [scrollContainerRef]
  )
}

