import React, { useRef, useEffect } from 'react'
import usePreventPullToRefresh from '../../hooks/usePreventPullToRefresh'

const MobileDrawer = ({
  isOpen,
  drawerOffset,
  setDrawerOffset,
  onClose,
  touchHandlers,
  children,
  refreshKey
}) => {
  const { onTouchStart, onTouchMove, onTouchEnd } = touchHandlers
  const contentRef = useRef(null)
  usePreventPullToRefresh(contentRef, isOpen)
  return (
    <div 
      className={`mobile-drawer ${isOpen ? 'open' : ''}`}
      key={`drawer-${refreshKey}`}
    >
      <div className="drawer-backdrop" onClick={onClose} />
      <div 
        className="drawer-content"
        style={{
          transform: isOpen 
            ? `translateY(${drawerOffset}px)` 
            : 'translateY(100%)',
          transition: drawerOffset ? 'none' : 'transform 0.3s ease'
        }}
        ref={contentRef}
        onTouchStart={(e) => {
          // Only stop propagation for swipe gestures, not normal taps
          // Let the swipe handler determine if this is a swipe gesture
          onTouchStart(e)
        }}
        onTouchMove={(e) => {
          // Only stop propagation during active swipes
          onTouchMove(e)
        }}
        onTouchEnd={(e) => {
          // Only stop propagation during active swipes
          onTouchEnd(e)
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

export default MobileDrawer


