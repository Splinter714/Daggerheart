import React, { useState, useEffect } from 'react'
import { Trash2 } from 'lucide-react'

const DeleteClear = ({
  adversaries,
  environments,
  countdowns,
  deleteAdversary,
  deleteEnvironment,
  deleteCountdown,
  isClearMode,
  setIsClearMode
}) => {
  const [deleteFlyoutOpen, setDeleteFlyoutOpen] = useState(false)
  
  const hasAnyItems = (adversaries?.length || 0) > 0 || (environments?.length || 0) > 0 || (countdowns?.length || 0) > 0
  const hasDeadAdversaries = (adversaries || []).some(adv => (adv.hp || 0) >= (adv.hpMax || 1))

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.delete-clear-container')) {
        setDeleteFlyoutOpen(false)
        // Also exit clear mode when clicking outside
        if (isClearMode) {
          setIsClearMode(false)
        }
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [isClearMode])

  // Auto-exit clear mode when no items remain
  useEffect(() => {
    if (isClearMode && !hasAnyItems) {
      setIsClearMode(false)
      setDeleteFlyoutOpen(false)
    }
  }, [isClearMode, hasAnyItems, setIsClearMode])

  const flyoutStyle = {
    position: 'absolute',
    top: '50%',
    right: '100%',
    left: 'auto',
    transform: 'translateY(-50%)',
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    padding: '0.5rem',
    minWidth: '200px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
    zIndex: 1000,
    display: deleteFlyoutOpen ? 'block' : 'none',
    marginRight: '0.5rem'
  }

  const buttonStyle = {
    background: isClearMode ? 'var(--red)' : (deleteFlyoutOpen ? 'var(--red)' : 'none'),
    border: 'none',
    color: isClearMode ? 'white' : (deleteFlyoutOpen ? 'white' : (hasAnyItems ? 'var(--text-primary)' : 'var(--text-secondary)')),
    cursor: hasAnyItems ? 'pointer' : 'not-allowed',
    padding: '0.5rem',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
    opacity: hasAnyItems ? 1 : 0.5,
    minWidth: '44px',
    minHeight: '44px'
  }

  const flyoutItemStyle = {
    background: 'none',
    border: 'none',
    color: 'var(--text-primary)',
    cursor: 'pointer',
    padding: '0.5rem',
    borderRadius: 'var(--radius-sm)',
    width: '100%',
    textAlign: 'left',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    transition: 'background-color 0.2s'
  }

  const flyoutItemHoverStyle = {
    backgroundColor: 'var(--bg-hover)'
  }

  return (
    <div className="delete-clear-container" style={{ position: 'relative' }}>
      <button
        style={buttonStyle}
        onClick={(e) => {
          e.stopPropagation()
          if (hasAnyItems) {
            if (isClearMode) {
              // If already in clear mode, exit clear mode
              setIsClearMode(false)
              setDeleteFlyoutOpen(false)
            } else {
              // Enter clear mode and show flyout
              setIsClearMode(true)
              setDeleteFlyoutOpen(true)
            }
          }
        }}
        title={!hasAnyItems ? 'Nothing to clear' : (isClearMode ? 'Clear Items' : 'Enter Clear Mode')}
      >
        <Trash2 size={20} />
      </button>
      
      <div style={flyoutStyle}>
        {(adversaries && adversaries.length > 0) && (
          <button 
            style={flyoutItemStyle}
            onMouseEnter={(e) => Object.assign(e.target.style, flyoutItemHoverStyle)}
            onMouseLeave={(e) => Object.assign(e.target.style, flyoutItemStyle)}
            onClick={(e) => { 
              e.stopPropagation()
              setDeleteFlyoutOpen(false)
              adversaries.forEach(item => deleteAdversary(item.id))
            }}
          >
            <span>×</span>
            <span>All Adversaries</span>
          </button>
        )}
        
        {(adversaries && adversaries.length > 0 && hasDeadAdversaries) && (
          <button 
            style={flyoutItemStyle}
            onMouseEnter={(e) => Object.assign(e.target.style, flyoutItemHoverStyle)}
            onMouseLeave={(e) => Object.assign(e.target.style, flyoutItemStyle)}
            onClick={(e) => { 
              e.stopPropagation()
              setDeleteFlyoutOpen(false)
              const dead = adversaries.filter(adv => (adv.hp || 0) >= (adv.hpMax || 1))
              dead.forEach(item => deleteAdversary(item.id))
            }}
          >
            <span>×</span>
            <span>Dead Adversaries</span>
          </button>
        )}
        
        {(environments && environments.length > 0) && (
          <button 
            style={flyoutItemStyle}
            onMouseEnter={(e) => Object.assign(e.target.style, flyoutItemHoverStyle)}
            onMouseLeave={(e) => Object.assign(e.target.style, flyoutItemStyle)}
            onClick={(e) => { 
              e.stopPropagation()
              setDeleteFlyoutOpen(false)
              environments.forEach(item => deleteEnvironment(item.id))
            }}
          >
            <span>×</span>
            <span>All Environments</span>
          </button>
        )}
        
        {(countdowns && countdowns.length > 0) && (
          <button 
            style={flyoutItemStyle}
            onMouseEnter={(e) => Object.assign(e.target.style, flyoutItemHoverStyle)}
            onMouseLeave={(e) => Object.assign(e.target.style, flyoutItemStyle)}
            onClick={(e) => { 
              e.stopPropagation()
              setDeleteFlyoutOpen(false)
              countdowns.forEach(countdown => deleteCountdown(countdown.id))
            }}
          >
            <span>×</span>
            <span>All Countdowns</span>
          </button>
        )}
      </div>
    </div>
  )
}

export default DeleteClear
