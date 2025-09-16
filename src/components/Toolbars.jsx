import React from 'react'

const Bar = ({ 
  position = 'top', // 'top' or 'bottom'
  children, 
  onClick,
  className = '',
  style = {}
}) => {
  const isTop = position === 'top'
  
  const baseStyle = {
    background: 'var(--bg-primary)',
    borderTop: isTop ? 'none' : '1px solid var(--border)',
    borderBottom: isTop ? '1px solid var(--border)' : 'none',
    padding: isTop ? '0.25rem 0' : '0.5rem',
    position: 'sticky',
    [isTop ? 'top' : 'bottom']: 0,
    zIndex: isTop ? 10 : 100,
    order: isTop ? 1 : 3,
    flexShrink: 0,
    touchAction: 'manipulation',
    userSelect: 'none',
    display: 'flex',
    flexDirection: isTop ? 'column' : 'row',
    justifyContent: isTop ? 'stretch' : 'center',
    alignItems: isTop ? 'stretch' : 'center',
    gap: isTop ? '0' : '1rem',
    height: isTop ? 'auto' : '60px',
    ...style
  }

  return (
    <div 
      className={className}
      style={baseStyle}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

export default Bar
