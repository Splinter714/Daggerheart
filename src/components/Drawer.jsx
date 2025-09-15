import React, { useState, useCallback, useEffect } from 'react'

/**
 * Reusable swipe-to-dismiss gesture handler for bottom drawers.
 * - Intercepts touches on a header area OR when the scrollable body is scrolled to top
 * - Calls onClose when the swipe distance exceeds closeThreshold
 */
function useSwipeDrawer({
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

const Drawer = ({
  isOpen,
  onClose,
  children
}) => {
  const {
    drawerOffset,
    setDrawerOffset,
    touchHandlers,
    resetSwipeState,
  } = useSwipeDrawer({
    headerSelector: '.drawer-header',
    closeThreshold: 100,
    snapThreshold: 30,
    onClose,
  })

  // Reset swipe state when drawer closes
  useEffect(() => {
    if (!isOpen) {
      resetSwipeState()
    }
  }, [isOpen, resetSwipeState])

  return (
    <div className={`mobile-drawer ${isOpen ? 'open' : ''}`}>
      <div className="drawer-backdrop" onClick={onClose} />
      <div 
        className="drawer-content"
        style={{
          transform: isOpen 
            ? `translateY(${drawerOffset}px)` 
            : 'translateY(100%)',
          transition: drawerOffset ? 'none' : 'transform 0.25s cubic-bezier(0.4, 0.0, 0.2, 1)'
        }}
        onTouchStart={(e) => {
          // Only stop propagation for swipe gestures, not normal taps
          // Let the swipe handler determine if this is a swipe gesture
          touchHandlers.onTouchStart(e)
        }}
        onTouchMove={(e) => {
          // Only stop propagation during active swipes
          touchHandlers.onTouchMove(e)
        }}
        onTouchEnd={(e) => {
          // Only stop propagation during active swipes
          touchHandlers.onTouchEnd(e)
        }}
        onClick={(e) => {
          // Allow clicks inside without closing; backdrop handles outside clicks
          e.stopPropagation()
        }}
      >
        <div className="drawer-header" onClick={() => {
          setDrawerOffset(window.innerHeight)
          setTimeout(() => {
            onClose()
          }, 300)
        }}>
          <div className="drawer-handle" />
        </div>
        <div className="drawer-body">
          {children}
        </div>
      </div>
    </div>
  )
}

export default Drawer
