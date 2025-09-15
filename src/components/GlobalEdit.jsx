import React from 'react'
import { Pencil } from 'lucide-react'

const GlobalEdit = ({ 
  isEditMode, 
  setIsEditMode,
  style = {}
}) => {
  const baseStyle = {
    backgroundColor: isEditMode ? 'var(--purple)' : 'var(--bg-secondary)',
    border: '1px solid var(--border)',
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
    minWidth: '120px',
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
          e.target.style.backgroundColor = 'var(--bg-tertiary)'
        }
      }}
      onMouseLeave={(e) => {
        if (!isEditMode) {
          e.target.style.backgroundColor = 'var(--bg-secondary)'
        }
      }}
    >
      <Pencil size={16} />
      {isEditMode ? 'Exit Edit' : 'Edit Mode'}
    </button>
  )
}

export default GlobalEdit
