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
    padding: '1rem', // Symmetrical padding on all sides
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
