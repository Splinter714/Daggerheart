import { useEffect } from 'react'

/**
 * Prevents iOS/Android pull-to-refresh when drawer content is short
 * or when the scrollable area is at its top.
 *
 * Attaches non-passive touch listeners to the drawer content container
 * and conditionally calls preventDefault on downward moves from the top.
 */
export default function usePreventPullToRefresh(containerRef, enabled = true) {
  useEffect(() => {
    const containerEl = containerRef?.current
    if (!containerEl || !enabled) return

    let startY = 0
    let guardPTR = false
    let scrollEl = null

    const resolveScrollEl = () => {
      // Prefer inner content scroll areas first, then drawer body, else container
      return (
        containerEl.querySelector('.expanded-content') ||
        containerEl.querySelector('.browser-content') ||
        containerEl.querySelector('.drawer-body') ||
        containerEl
      )
    }

    const onTouchStart = (e) => {
      const t = e.targetTouches && e.targetTouches[0]
      if (!t) return
      scrollEl = resolveScrollEl()
      const isScrollable = scrollEl && scrollEl.scrollHeight > scrollEl.clientHeight
      const atTop = !isScrollable || scrollEl.scrollTop <= 0
      // Only consider preventing PTR if the gesture begins at the top or content isn't scrollable
      guardPTR = !!atTop
      startY = t.clientY
    }

    const onTouchMove = (e) => {
      if (!guardPTR) return
      const t = e.targetTouches && e.targetTouches[0]
      if (!t) return
      const dy = t.clientY - startY
      // Downward move from the top should be prevented to block PTR
      if (dy > 0) {
        try { e.preventDefault() } catch {}
      }
    }

    const onTouchEnd = () => {
      guardPTR = false
    }

    // Non-passive to allow preventDefault on iOS Safari
    containerEl.addEventListener('touchstart', onTouchStart, { passive: true })
    containerEl.addEventListener('touchmove', onTouchMove, { passive: false })
    containerEl.addEventListener('touchend', onTouchEnd, { passive: true })

    return () => {
      containerEl.removeEventListener('touchstart', onTouchStart)
      containerEl.removeEventListener('touchmove', onTouchMove)
      containerEl.removeEventListener('touchend', onTouchEnd)
    }
  }, [containerRef, enabled])
}


