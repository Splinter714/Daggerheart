import React from 'react'
import { Pencil } from 'lucide-react'

const GlobalEdit = ({ 
  isEditMode, 
  setIsEditMode,
  disabled = false,
  style = {}
}) => {
  const baseStyle = {
    backgroundColor: isEditMode ? 'var(--purple)' : 'transparent',
    border: 'none',
    borderRadius: 'var(--radius-md)',
    padding: '0.75rem',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    color: isEditMode ? '#fff' : (disabled ? 'var(--text-secondary)' : 'var(--text-primary)'),
    fontSize: '0.875rem',
    fontWeight: 600,
    minWidth: '40px',
    opacity: disabled ? 0.5 : 1,
    ...style
  }

  const handleClick = () => {
    if (!disabled) {
      setIsEditMode(!isEditMode)
    }
  }

  return (
    <button
      style={baseStyle}
      onClick={handleClick}
      title={isEditMode ? 'Exit Edit Mode' : 'Enter Edit Mode'}
      onMouseEnter={(e) => {
        if (!isEditMode && !disabled) {
          e.target.style.backgroundColor = 'var(--bg-secondary)'
        }
      }}
      onMouseLeave={(e) => {
        if (!isEditMode && !disabled) {
          e.target.style.backgroundColor = 'transparent'
        }
      }}
    >
      <Pencil size={16} />
    </button>
  )
}

export default GlobalEdit
