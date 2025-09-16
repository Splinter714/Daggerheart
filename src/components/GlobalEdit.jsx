import React from 'react'
import { Pencil } from 'lucide-react'

const GlobalEdit = ({ 
  isEditMode, 
  setIsEditMode,
  style = {}
}) => {
  const baseStyle = {
    backgroundColor: isEditMode ? 'var(--purple)' : 'transparent',
    border: 'none',
    borderRadius: 'var(--radius-md)',
    padding: '0.75rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    color: isEditMode ? '#fff' : 'var(--text-primary)',
    fontSize: '0.875rem',
    fontWeight: 600,
    minWidth: '40px',
    ...style
  }

  const handleClick = () => {
    setIsEditMode(!isEditMode)
  }

  return (
    <button
      style={baseStyle}
      onClick={handleClick}
      title={isEditMode ? 'Exit Edit Mode' : 'Enter Edit Mode'}
      onMouseEnter={(e) => {
        if (!isEditMode) {
          e.target.style.backgroundColor = 'var(--bg-secondary)'
        }
      }}
      onMouseLeave={(e) => {
        if (!isEditMode) {
          e.target.style.backgroundColor = 'transparent'
        }
      }}
    >
      <Pencil size={16} />
    </button>
  )
}

export default GlobalEdit
