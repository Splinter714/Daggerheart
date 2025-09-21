import React from 'react'

const Panel = ({ 
  side = 'left', // 'left' or 'right'
  children, 
  className = '',
  style = {}
}) => {
  const isLeft = side === 'left'
  
  const baseStyle = {
    flex: 1,
    minWidth: 0,
    background: 'var(--bg-primary)',
    overflowY: 'auto',
    overflowX: isLeft ? 'auto' : 'hidden', // Right panel prevents horizontal spill
    display: isLeft ? 'block' : 'flex',
    flexDirection: isLeft ? 'initial' : 'column',
    height: '100%',
    padding: isLeft ? '8px 0 8px 0' : '0 8px 0 0', // Zero left padding on mobile, no top/bottom padding on right panel
    ...style
  }

  return (
    <div 
      className={className}
      style={baseStyle}
    >
      {children}
    </div>
  )
}

export default Panel
