import { useState, useCallback } from 'react'

/**
 * Reusable swipe-to-dismiss gesture handler for bottom drawers.
 * - Intercepts touches on a header area OR when the scrollable body is scrolled to top
 * - Calls onClose when the swipe distance exceeds closeThreshold
 */
export default function useSwipeDrawer({
  headerSelector = '.drawer-header',
  closeThreshold = 100,
  snapThreshold = 30,
  onClose,
} = {}) {
  const [touchStart, setTouchStart] = useState(null)
  const [touchCurrent, setTouchCurrent] = useState(null)
  const [drawerOffset, setDrawerOffset] = useState(0)
  const [isSwiping, setIsSwiping] = useState(false)

  const onTouchStart = useCallback((e) => {
    // Only allow swipe-to-close from header/handle area
    const target = e.target
    const isHeaderTouch = headerSelector ? target.closest(headerSelector) : false
    
    if (!isHeaderTouch) {
      // Let normal scrolling occur in content areas
      return
    }

    const y = e.targetTouches?.[0]?.clientY ?? 0
    setTouchStart(y)
    setTouchCurrent(y)
    setDrawerOffset(0)
    setIsSwiping(false)
  }, [headerSelector])

  const onTouchMove = useCallback((e) => {
    if (touchStart == null) return
    const y = e.targetTouches?.[0]?.clientY ?? 0
    const delta = y - touchStart
    const ACTIVATION_DELTA = 6
    if (!isSwiping && Math.abs(delta) > ACTIVATION_DELTA) {
      setIsSwiping(true)
    }

    if (isSwiping) {
      e.preventDefault()
      e.stopPropagation()
      setTouchCurrent(y)
      setDrawerOffset(Math.max(0, delta))
    }
  }, [touchStart, isSwiping])

  const onTouchEnd = useCallback((e) => {
    if (touchStart == null || touchCurrent == null) return
    const distance = touchCurrent - touchStart
    if (isSwiping) {
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
          setIsSwiping(false)
        }, 50)
      } else {
        setDrawerOffset(0)
        setTouchStart(null)
        setTouchCurrent(null)
        setIsSwiping(false)
      }
    } else {
      // Not swiping: let tap/click go through
      setDrawerOffset(0)
      setTouchStart(null)
      setTouchCurrent(null)
      setIsSwiping(false)
    }
  }, [touchStart, touchCurrent, isSwiping, closeThreshold, snapThreshold, onClose])

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


