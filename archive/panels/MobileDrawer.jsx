import React from 'react'

const MobileDrawer = ({
  isOpen,
  drawerOffset,
  setDrawerOffset,
  onClose,
  touchHandlers,
  children
}) => {
  const { onTouchStart, onTouchMove, onTouchEnd } = touchHandlers
  return (
    <div 
      className={`mobile-drawer ${isOpen ? 'open' : ''}`}
    >
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


