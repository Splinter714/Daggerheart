import { useState, useCallback } from 'react'

/**
 * Reusable swipe-to-dismiss gesture handler for bottom drawers.
 * - Intercepts touches on a header area OR when the scrollable body is scrolled to top
 * - Calls onClose when the swipe distance exceeds closeThreshold
 */
export default function useSwipeDrawer({
  headerSelector = '.drawer-header',
  bodySelector = '.drawer-body',
  closeThreshold = 100,
  snapThreshold = 30,
  onClose,
} = {}) {
  const [touchStart, setTouchStart] = useState(null)
  const [touchCurrent, setTouchCurrent] = useState(null)
  const [drawerOffset, setDrawerOffset] = useState(0)

  const onTouchStart = useCallback((e) => {
    const target = e.target
    const isHeaderTouch = headerSelector ? target.closest(headerSelector) : false
    const bodyEl = bodySelector ? target.closest(bodySelector) : null
    let isBodyAtTop = false
    if (bodyEl) {
      isBodyAtTop = bodyEl.scrollTop <= 10
    }

    if (!isHeaderTouch && !isBodyAtTop) {
      // Let normal scrolling occur
      return
    }

    e.preventDefault()
    e.stopPropagation()
    const y = e.targetTouches?.[0]?.clientY ?? 0
    setTouchStart(y)
    setTouchCurrent(y)
    setDrawerOffset(0)
  }, [headerSelector, bodySelector])

  const onTouchMove = useCallback((e) => {
    if (touchStart == null) return
    const y = e.targetTouches?.[0]?.clientY ?? 0
    const delta = y - touchStart
    if (delta > 0) {
      e.preventDefault()
      e.stopPropagation()
      setTouchCurrent(y)
      setDrawerOffset(delta)
    } else if (delta < 0) {
      // Reset so normal upward scroll can occur
      setTouchStart(null)
      setTouchCurrent(null)
      setDrawerOffset(0)
    }
  }, [touchStart])

  const onTouchEnd = useCallback((e) => {
    if (touchStart == null || touchCurrent == null) return
    const distance = touchCurrent - touchStart
    e.preventDefault()
    e.stopPropagation()

    if (distance > closeThreshold) {
      setDrawerOffset(window.innerHeight)
      if (typeof onClose === 'function') {
        setTimeout(() => onClose(), 300)
      }
    } else if (distance > snapThreshold) {
      setDrawerOffset(0)
      setTimeout(() => {
        setTouchStart(null)
        setTouchCurrent(null)
      }, 50)
    } else {
      setDrawerOffset(0)
      setTouchStart(null)
      setTouchCurrent(null)
    }
  }, [touchStart, touchCurrent, closeThreshold, snapThreshold, onClose])

  const resetSwipeState = useCallback(() => {
    setDrawerOffset(0)
    setTouchStart(null)
    setTouchCurrent(null)
  }, [])

  return {
    drawerOffset,
    setDrawerOffset,
    touchHandlers: {
      onTouchStart,
      onTouchMove,
      onTouchEnd,
    },
    resetSwipeState,
  }
}


