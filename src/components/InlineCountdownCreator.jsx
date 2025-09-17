import React, { useState, useEffect } from 'react'
import { Check, X } from 'lucide-react'

const InlineCountdownCreator = ({ 
  source, // 'adversary', 'environment', or 'campaign'
  onCreateCountdown,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    name: '',
    max: 6, // Start with 6 as default
    type: 'standard',
    loop: 'none'
  })
  const [error, setError] = useState('')

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onCancel && onCancel()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onCancel])

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handlePipClick = (pipIndex) => {
    // Clicking a pip sets the max to that pip number (1-indexed)
    const newMax = pipIndex + 1
    setFormData(prev => ({ ...prev, max: newMax }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.name.trim()) return
    
    const countdownData = {
      name: formData.name.trim(),
      max: formData.max,
      type: formData.type,
      loop: formData.loop,
      source: source
    }
    
    onCreateCountdown(countdownData)
    
    // Reset form
    setFormData({
      name: '',
      max: 6,
      type: 'standard',
      loop: 'none'
    })
  }

  // Render glowing pips for max selection
  const renderGlowingPips = () => {
    const maxPips = 12 // Show up to 12 pips for selection
    return Array.from({ length: maxPips }, (_, i) => {
      const isSelected = i < formData.max
      const isHoverable = true
      
      return (
        <span
          key={i}
          onClick={() => handlePipClick(i)}
          style={{
            fontSize: '1.5rem',
            color: isSelected ? 'var(--red)' : 'var(--text-secondary)',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            filter: isSelected ? 'drop-shadow(0 0 8px var(--red))' : 'none',
            margin: '0 2px',
            display: 'inline-block',
            transform: isSelected ? 'scale(1.1)' : 'scale(1)',
            animation: isSelected ? 'glow 2s ease-in-out infinite alternate' : 'none'
          }}
          onMouseEnter={(e) => {
            if (!isSelected) {
              e.target.style.color = 'var(--red)'
              e.target.style.filter = 'drop-shadow(0 0 4px var(--red))'
              e.target.style.transform = 'scale(1.05)'
            }
          }}
          onMouseLeave={(e) => {
            if (!isSelected) {
              e.target.style.color = 'var(--text-secondary)'
              e.target.style.filter = 'none'
              e.target.style.transform = 'scale(1)'
            }
          }}
          title={`Set max to ${i + 1}`}
        >
          {isSelected ? '●' : '○'}
        </span>
      )
    })
  }

  return (
    <div style={{
      padding: '2rem',
      backgroundColor: 'var(--bg-card)',
      borderRadius: '12px',
      border: '2px solid var(--purple)',
      margin: '0.5rem 0',
      minWidth: '500px',
      maxWidth: '600px'
    }}>
      {/* CSS for glow animation */}
      <style>{`
        @keyframes glow {
          from { filter: drop-shadow(0 0 8px var(--red)); }
          to { filter: drop-shadow(0 0 16px var(--red)); }
        }
      `}</style>
      
      <form onSubmit={handleSubmit} style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem'
      }}>
        {/* Title Input */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem'
        }}>
          <label style={{
            fontSize: '0.875rem',
            fontWeight: '600',
            color: 'var(--text-primary)'
          }}>
            Countdown Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Enter countdown name..."
            style={{
              padding: '0.75rem',
              border: '2px solid var(--border)',
              borderRadius: '8px',
              backgroundColor: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              fontSize: '1rem',
              transition: 'border-color 0.2s ease'
            }}
            required
            autoFocus
            onFocus={(e) => {
              e.target.style.borderColor = 'var(--purple)'
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'var(--border)'
            }}
          />
        </div>

        {/* Live Countdown Preview */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          padding: '1.5rem',
          backgroundColor: 'var(--bg-primary)',
          borderRadius: '8px',
          border: '1px solid var(--border)'
        }}>
          <div style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            color: 'var(--text-primary)',
            textAlign: 'center'
          }}>
            {formData.name || 'Countdown Preview'}
          </div>
          
          {/* Glowing Pips for Max Selection */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '0.25rem',
            flexWrap: 'wrap',
            padding: '1rem',
            backgroundColor: 'var(--gray-dark)',
            borderRadius: '8px',
            border: '2px dashed var(--border)'
          }}>
            <div style={{
              fontSize: '0.875rem',
              color: 'var(--text-secondary)',
              marginBottom: '0.5rem',
              width: '100%',
              textAlign: 'center'
            }}>
              Click pips to set max value ({formData.max})
            </div>
            {renderGlowingPips()}
          </div>
        </div>

        {/* Advanced Options */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.25rem',
            flex: '1',
            minWidth: '120px'
          }}>
            <label style={{
              fontSize: '0.75rem',
              fontWeight: '600',
              color: 'var(--text-secondary)'
            }}>
              Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => handleInputChange('type', e.target.value)}
              style={{
                padding: '0.5rem',
                border: '1px solid var(--border)',
                borderRadius: '4px',
                backgroundColor: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                fontSize: '0.875rem'
              }}
            >
              <option value="standard">Standard</option>
              <option value="progress">Progress</option>
              <option value="consequence">Consequence</option>
              <option value="long-term">Long-term</option>
              <option value="simple-fear">Fear</option>
              <option value="simple-hope">Hope</option>
            </select>
          </div>
          
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.25rem',
            flex: '1',
            minWidth: '120px'
          }}>
            <label style={{
              fontSize: '0.75rem',
              fontWeight: '600',
              color: 'var(--text-secondary)'
            }}>
              Loop
            </label>
            <select
              value={formData.loop}
              onChange={(e) => handleInputChange('loop', e.target.value)}
              style={{
                padding: '0.5rem',
                border: '1px solid var(--border)',
                borderRadius: '4px',
                backgroundColor: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                fontSize: '0.875rem'
              }}
            >
              <option value="none">None</option>
              <option value="loop">Loop</option>
              <option value="increasing">Increasing</option>
              <option value="decreasing">Decreasing</option>
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '0.75rem',
          justifyContent: 'flex-end'
        }}>
          <button
            type="button"
            style={{
              background: 'none',
              border: '1px solid var(--border)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '0.75rem 1.5rem',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s ease',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}
            onClick={onCancel}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = 'var(--gray-dark)'
              e.target.style.color = 'var(--text-primary)'
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent'
              e.target.style.color = 'var(--text-secondary)'
            }}
          >
            <X size={16} />
            Cancel
          </button>
          <button
            type="submit"
            style={{
              background: formData.name.trim() ? 'var(--purple)' : 'var(--gray-dark)',
              border: 'none',
              color: formData.name.trim() ? 'white' : 'var(--text-disabled)',
              cursor: formData.name.trim() ? 'pointer' : 'not-allowed',
              padding: '0.75rem 1.5rem',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s ease',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}
            disabled={!formData.name.trim()}
            onMouseEnter={(e) => {
              if (formData.name.trim()) {
                e.target.style.backgroundColor = 'var(--purple-dark)'
              }
            }}
            onMouseLeave={(e) => {
              if (formData.name.trim()) {
                e.target.style.backgroundColor = 'var(--purple)'
              }
            }}
          >
            <Check size={16} />
            Create Countdown
          </button>
        </div>
        
        {error && (
          <div style={{
            color: 'var(--red)',
            fontSize: '0.75rem',
            textAlign: 'center',
            padding: '0.5rem',
            backgroundColor: 'var(--red-light)',
            borderRadius: '4px'
          }}>
            {error}
          </div>
        )}
      </form>
    </div>
  )
}

export default InlineCountdownCreator
