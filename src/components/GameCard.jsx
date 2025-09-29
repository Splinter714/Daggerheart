import React, { useState, useCallback, useEffect } from 'react'
import { Droplet, Activity, CheckCircle, X, Hexagon, Triangle, Gem, Star, Locate, Tag, Diamond, Shield, Circle } from 'lucide-react'

// Reusable Threshold Tag Component
const ThresholdTag = ({ value }) => (
  <div style={{
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '36px',
    height: '24px'
  }}>
    <svg 
      width="32" 
      height="24" 
      viewBox="0 0 32 24" 
      fill="none" 
      stroke="var(--text-secondary)" 
      strokeWidth="1" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      style={{
        position: 'absolute'
      }}
    >
      <path d="M2 2h20l4 10-4 10H2l4-10-4-10z"/>
    </svg>
    <span style={{
      position: 'absolute',
      fontSize: '0.7rem',
      fontWeight: 500,
      color: 'var(--text-primary)',
      textAlign: 'center',
      zIndex: 1,
      left: '45%',
      top: '50%',
      transform: 'translate(-50%, -50%)'
    }}>
      {value}
    </span>
  </div>
)

// ============================================================================
// UTILITIES
// ============================================================================

function generateId(prefix) {
  const base = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
  return prefix ? `${prefix}-${base}` : base
}




// ============================================================================
// STYLES - All CSS consolidated into inline styles
// ============================================================================

const styles = {
  // Transition definitions - centralized
  transitions: {
    hoverIn: 'all 0.1s ease',        // Fast hover-in
    hoverOut: 'all 0.3s ease',       // Graceful hover-out
  },

  // Container styles
  card: {
    backgroundColor: 'var(--bg-card)',
    borderRadius: '8px',
    padding: '8px',
    cursor: 'pointer',
    transition: 'all 0.1s ease',
    position: 'relative'
  },
  cardHover: {
    backgroundColor: 'var(--bg-card-hover)'
  },
  cardDead: {
    opacity: 0.6,
    backgroundColor: 'var(--gray-800)',
    borderColor: 'var(--border)'
  },
  cardAtMax: {
    backgroundColor: 'var(--success)',
    borderColor: 'var(--success)'
  },

  // Layout styles
  rowMain: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px'
  },
  rowTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: 'var(--text-primary)',
    margin: 0
  },
  rowMeta: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center'
  },

  // Badge styles
  badge: {
    padding: '2px 6px',
    borderRadius: '3px',
    fontSize: '10px',
    fontWeight: '600',
    textTransform: 'uppercase'
  },
  typeBadge: {
    backgroundColor: 'var(--purple)',
    color: 'var(--text-primary)'
  },
  tierBadge: {
    backgroundColor: 'var(--info)',
    color: 'var(--text-primary)'
  },

  // Damage input styles
  damageInputPopup: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    borderRadius: '8px'
  },
  damageInputContent: {
    backgroundColor: 'var(--gray-900)',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'var(--border)',
    borderRadius: '8px',
    padding: '8px',
    display: 'flex',
    flexDirection: 'row',
    gap: '8px',
    minWidth: '200px',
    alignItems: 'center',
    position: 'absolute',
    right: '1rem',
    top: '50%',
    transform: 'translateY(-50%)'
  },
  damageInput: {
    backgroundColor: 'var(--gray-900)',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'var(--border)',
    borderRadius: '4px',
    padding: '4px 6px',
    color: 'var(--text-primary)',
    fontSize: '16px',
    width: '80px',
    textAlign: 'center'
  },
  damageIndicators: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
    justifyContent: 'center'
  },
  damageDrop: {
    fontSize: '16px',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    transition: 'color 0.1s ease'
  },
  applyButton: {
    backgroundColor: 'var(--gray-600)',
    color: 'white',
    borderWidth: '0',
    borderStyle: 'none',
    borderRadius: '4px',
    padding: '4px 8px',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'background-color 0.1s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '32px',
    minHeight: '32px'
  }
}

// ============================================================================
// HOOKS
// ============================================================================

// Adversary-specific logic
const useAdversaryLogic = (item, onApplyDamage, onApplyHealing, onApplyStressChange) => {
  const [showDamageInput, setShowDamageInput] = useState(false)
  const [damageValue, setDamageValue] = useState('')

  // Close damage input when clicking outside
  useEffect(() => {
    if (showDamageInput) {
      const handleClickOutside = (event) => {
        if (!event.target.closest('.damage-input-popup')) {
          setShowDamageInput(false)
          setDamageValue('')
        }
      }
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [showDamageInput])

  const handleHpClick = (e) => {
    e.stopPropagation()
    e.preventDefault()
    const currentHp = item.hp || 0
    const hpMax = item.hpMax || 1
    const symbolsRect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - symbolsRect.left
    const symbolWidth = symbolsRect.width / hpMax
    const clickedIndex = Math.floor(clickX / symbolWidth)
    
    if (clickedIndex < currentHp) {
      onApplyHealing && onApplyHealing(item.id, 1, item.hp)
    } else {
      onApplyDamage && onApplyDamage(item.id, 1, item.hp, item.hpMax)
    }
  }

  const handleStressClick = (e) => {
    e.stopPropagation()
    e.preventDefault()
    const currentStress = item.stress || 0
    const stressMax = item.stressMax || 1
    const symbolsRect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - symbolsRect.left
    const symbolWidth = symbolsRect.width / stressMax
    const clickedIndex = Math.floor(clickX / symbolWidth)
    
    if (clickedIndex < currentStress) {
      onApplyStressChange && onApplyStressChange(item.id, -1, item.stress, item.stressMax)
    } else {
      onApplyStressChange && onApplyStressChange(item.id, 1, item.stress, item.stressMax)
    }
  }

  const handleDifficultyClick = (e) => {
    e.stopPropagation()
    if ((item.thresholds && item.thresholds.major && item.thresholds.severe) || item.type === 'Minion') {
      setShowDamageInput(true)
      setDamageValue(item.type === 'Minion' ? '1' : '')
    }
  }

  const applyDamage = () => {
    const damage = parseInt(damageValue)
    if (damage > 0) {
      if (item.type === 'Minion') {
        onApplyDamage && onApplyDamage(item.id, damage, item.hp, item.hpMax)
      } else {
        let hpDamage = 0
        if (damage >= item.thresholds.severe) {
          hpDamage = 3
        } else if (damage >= item.thresholds.major) {
          hpDamage = 2
        } else if (damage >= 1) {
          hpDamage = 1
        }
        onApplyDamage && onApplyDamage(item.id, hpDamage, item.hp, item.hpMax)
      }
      setShowDamageInput(false)
      setDamageValue('')
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      applyDamage()
    } else if (e.key === 'Escape') {
      setShowDamageInput(false)
      setDamageValue('')
    }
  }

  return {
    showDamageInput,
    damageValue,
    setDamageValue,
    setShowDamageInput,
    handleHpClick,
    handleStressClick,
    handleDifficultyClick,
    applyDamage,
    handleKeyDown
  }
}


// ============================================================================
// MAIN COMPONENT
// ============================================================================

const GameCard = ({
  item,
  type, // 'adversary'
  mode = 'expanded', // 'expanded', 'edit'
  onClick,
  onDelete,
  onApplyDamage,
  onApplyHealing,
  onApplyStressChange,
  onUpdate,
  adversaries = [], // All adversaries for duplicate checking
  isSelected = false, // Whether this card is currently selected
  isEditMode = false, // Whether the app is in edit mode
  instances = [], // All instances to embed as mini-cards in expanded view
  isEmbedded = false, // Whether this is an embedded card (removes border)
}) => {
  // State for two-stage delete functionality
  const [deleteConfirmations, setDeleteConfirmations] = useState({})
  
  // Helper function to generate unique keys for feature confirmations
  const getFeatureKey = (feature) => {
    const typeFeatures = (item.features || []).filter(f => f.type === feature.type)
    const featureIndex = typeFeatures.findIndex(f => f === feature)
    return `${feature.type}-${featureIndex}-${feature.name || 'blank'}`
  }
  
  // Handle two-stage delete for features
  const handleFeatureDeleteClick = (featureToDelete) => {
    const featureKey = getFeatureKey(featureToDelete)
    
    if (deleteConfirmations[featureKey]) {
      // Second click - actually delete
      const newFeatures = item.features.filter(f => f !== featureToDelete)
      onUpdate && onUpdate(item.id, { features: newFeatures })
      
      setDeleteConfirmations(prev => {
        const newState = { ...prev }
        delete newState[featureKey]
        return newState
      })
    } else {
      // First click - show confirmation state
      setDeleteConfirmations(prev => ({
        ...prev,
        [featureKey]: true
      }))
      
      // Auto-reset after 3 seconds
      setTimeout(() => {
        setDeleteConfirmations(prev => {
          const newState = { ...prev }
          delete newState[featureKey]
          return newState
        })
      }, 3000)
    }
  }

  // Get adversary-specific logic
  const adversaryLogic = useAdversaryLogic(item, onApplyDamage, onApplyHealing, onApplyStressChange)
  
  // Create fallback handlers for when logic is not applicable to current type
  const handleDifficultyClick = (type === 'adversary' || type === 'adversaries') ? adversaryLogic.handleDifficultyClick : (() => {
    console.warn('adversaryLogic.handleDifficultyClick not available for type:', type)
  })

  // Hover state management
  const [isHovered, setIsHovered] = useState(false)
  
  // Debug logging removed - selection styling working correctly

  // Transition management with different speeds for hover in/out
  const handleMouseEnter = () => {
    setIsHovered(true)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
  }

  // ============================================================================
  // STYLING LOGIC
  // ============================================================================

  const getCardStyle = (isExpanded = false) => {
    let cardStyle = { ...styles.card }
    
    // Use appropriate transition speed based on hover state
    // Selection changes should be instant, hover changes should be smooth
    if (isSelected) {
      cardStyle.transition = 'none' // Instant for selection
    } else {
      cardStyle.transition = isHovered ? styles.transitions.hoverIn : styles.transitions.hoverOut
    }
    
    // Remove top margin for expanded cards
    if (isExpanded) {
      const { marginTop, ...cardStyleWithoutMargin } = cardStyle
      cardStyle = cardStyleWithoutMargin
    }
    
    // Apply hover effects for expanded cards or when selected
    if ((isHovered && mode !== 'expanded') || isSelected) {
      cardStyle = { ...cardStyle, ...styles.cardHover }
    }
    
    if (type === 'adversary' && (item.hp || 0) >= (item.hpMax || 1)) {
      cardStyle = { ...cardStyle, ...styles.cardDead }
    }
    
    
    return cardStyle
  }

  const getCardClassName = () => {
    if (isEmbedded) {
      return '' // No border or rounded corners for embedded cards
    }
    
    let className = 'border rounded-lg'
    
    // Apply border hover effect for hovered cards or when selected
    if ((isHovered && mode !== 'expanded') || isSelected) {
      className += ' border-hover'
    }
    
    return className
  }

  // ============================================================================
  // RENDERING HELPERS
  // ============================================================================

  const renderTitle = () => {
    if (type === 'adversary' || type === 'adversaries') {
      const baseName = item.baseName || item.name?.replace(/\s+\(\d+\)$/, '') || ''
      const duplicateNumber = item.duplicateNumber || 1
      
      // Check if there are other adversaries with the same base name
      // Include the current item in the check to ensure accurate duplicate detection
      const allAdversaries = [...adversaries]
      if (!adversaries.some(adv => adv.id === item.id)) {
        allAdversaries.push(item)
      }
      const sameNameAdversaries = allAdversaries.filter(adv => adv.baseName === baseName)
      const hasDuplicates = sameNameAdversaries.length > 1
      
      
      
      
      // Show duplicate number if there are actually duplicates (including the first one)
      if (hasDuplicates) {
        return `${baseName} (${duplicateNumber})`
      } else {
        return baseName
      }
    }
    return item.name
  }

  const renderMeta = () => {
    const badges = []
    
    if (item.type) {
      badges.push(
        <span key="type" style={{ ...styles.badge, ...styles.typeBadge }}>
          {item.type}
        </span>
      )
    }
    
    
    return badges
  }


  const renderDamageInput = () => {
    if (type !== 'adversary' || !adversaryLogic.showDamageInput || !((item.thresholds && item.thresholds.major && item.thresholds.severe) || item.type === 'Minion')) {
      return null
    }

    return (
      <div 
        className="damage-input-popup"
        style={styles.damageInputPopup}
        onClick={(e) => {
          e.stopPropagation()
          if (e.target === e.currentTarget) {
            if (type === 'adversary' || type === 'adversaries') {
              adversaryLogic.setShowDamageInput(false)
              adversaryLogic.setDamageValue('')
            }
          }
        }}
      >
        <div 
          className="border rounded-lg"
          style={{
            ...styles.damageInputContent,
            borderColor: 'var(--border)'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <input
            type="number"
            inputMode="numeric"
            enterKeyHint="done"
            placeholder="dmg"
            min={item.type === 'Minion' ? "0" : "0"}
            value={(type === 'adversary' || type === 'adversaries') ? adversaryLogic.damageValue : ''}
            onChange={(e) => {
              if (type === 'adversary' || type === 'adversaries') {
                adversaryLogic.setDamageValue(e.target.value)
              }
            }}
            onKeyDown={(type === 'adversary' || type === 'adversaries') ? adversaryLogic.handleKeyDown : undefined}
            className="border rounded-sm"
            style={{
              ...styles.damageInput,
              borderColor: 'var(--border)'
            }}
            autoFocus
          />
          <div style={styles.damageIndicators}>
            {item.type === 'Minion' ? (
              (() => {
                const damage = parseInt((type === 'adversary' || type === 'adversaries') ? adversaryLogic.damageValue : '0') || 0
                const minionFeature = item.features?.find(f => f.name?.startsWith('Minion ('))
                const minionThreshold = minionFeature ? parseInt(minionFeature.name.match(/\((\d+)\)/)?.[1] || '1') : 1
                const additionalMinions = Math.floor(damage / minionThreshold)
                
                if (damage >= minionThreshold && additionalMinions > 0) {
                  return (
                    <span 
                      style={{
                        ...styles.damageDrop,
                        color: 'var(--red)'
                      }}
                      title={`${damage} damage can defeat ${additionalMinions + 1} minion${additionalMinions + 1 !== 1 ? 's' : ''} (1 + ${additionalMinions} additional)`}
                    >
                      +{additionalMinions} additional minion(s)
                    </span>
                  )
                } else {
                  return (
                    <span 
                      style={styles.damageDrop}
                      title={`${damage} damage defeats this minion only`}
                    >
                      +0 additional minion(s)
                    </span>
                  )
                }
              })()
            ) : (
              [1, 2, 3].map((level) => {
                const damage = parseInt((type === 'adversary' || type === 'adversaries') ? adversaryLogic.damageValue : '0') || 0
                let isActive = false
                if (level === 1 && damage >= 1) isActive = true
                if (level === 2 && damage >= item.thresholds.major) isActive = true
                if (level === 3 && damage >= item.thresholds.severe) isActive = true
                
                return (
                  <span 
                    key={level}
                    style={{
                      ...styles.damageDrop,
                      color: isActive ? 'var(--red)' : 'var(--text-secondary)'
                    }}
                    onClick={(e) => {
                      e.stopPropagation()
                      if (type === 'adversary' || type === 'adversaries') {
                        if (level === 1) {
                          adversaryLogic.setDamageValue('1')
                        } else if (level === 2) {
                          adversaryLogic.setDamageValue(item.thresholds.major.toString())
                        } else if (level === 3) {
                          adversaryLogic.setDamageValue(item.thresholds.severe.toString())
                        }
                      }
                    }}
                    title={`Click to set damage to ${level === 1 ? '1' : level === 2 ? item.thresholds.major : item.thresholds.severe}`}
                  >
                    <Droplet size={16} />
                  </span>
                )
              })
            )}
            <button
              style={{
                ...styles.applyButton,
                backgroundColor: 'var(--gray-600)'
              }}
              onClick={(e) => {
                e.stopPropagation()
                if (type === 'adversary' || type === 'adversaries') {
                  if (!adversaryLogic.damageValue || parseInt(adversaryLogic.damageValue) < 1) {
                    // Close damage input if no damage entered
                    adversaryLogic.setShowDamageInput(false)
                    adversaryLogic.setDamageValue('')
                  } else {
                    // Apply damage if damage entered
                    adversaryLogic.applyDamage()
                  }
                }
              }}
              title={(!adversaryLogic.damageValue || parseInt(adversaryLogic.damageValue) < 1) ? 'Close damage input' : 'Apply damage'}
            >
              {(!adversaryLogic.damageValue || parseInt(adversaryLogic.damageValue) < 1) ? <X size={16} /> : <CheckCircle size={16} />}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ============================================================================
  // EXPANDED VIEW RENDERERS
  // ============================================================================

  const renderExpandedAdversary = () => {
    const showDrag = false // Temporarily disabled drag handles
    const isDead = (item.hp || 0) >= (item.hpMax || 1)
    const isEditMode = mode === 'edit'
    

    return (
      <div 
        className={getCardClassName()}
        style={{
          ...getCardStyle(true),
          padding: 0,
          minHeight: '400px',
          opacity: isDead ? 0.7 : 1,
          backgroundColor: isDead ? 'var(--gray-900)' : getCardStyle(true).backgroundColor,
          borderColor: isDead ? 'color-mix(in srgb, var(--gray-600) 40%, transparent)' : (isSelected ? 'var(--purple)' : (isHovered && mode !== 'expanded' ? 'var(--border-hover)' : 'var(--border)')),
          borderWidth: isSelected ? '2px' : '2px',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative'
        }}
        onClick={onClick}
        {...(mode !== 'expanded' && {
          onMouseEnter: handleMouseEnter,
          onMouseLeave: handleMouseLeave
        })}
      >
        {/* DEFEATED overlay */}
        {isDead && (
          <>
            {/* Diagonal striping pattern */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `repeating-linear-gradient(
                45deg,
                transparent,
                transparent 8px,
                var(--gray-600) 1px,
                var(--gray-600) 9px
              )`,
              pointerEvents: 'none',
              zIndex: 9999
            }} />
            {/* DEFEATED text */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              color: 'var(--text-secondary)',
              fontSize: '1rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              zIndex: 10000,
              pointerEvents: 'none',
              textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)',
              backgroundColor: 'var(--gray-900)',
              padding: '0.25rem 0.5rem',
              borderRadius: '0.5rem',
              border: '0.5px solid var(--gray-600)'
            }}>
              DEFEATED
            </div>
          </>
        )}
        {/* Fixed Header Section - Identical to Compact View */}
        <div className="border-b" style={{
          padding: '8px',
          flexShrink: 0,
          backgroundColor: 'var(--bg-card)',
          borderRadius: '8px 8px 0 0',
          position: 'relative',
          zIndex: isDead ? 1 : 'auto',
          borderBottomColor: isSelected ? 'var(--purple)' : 'var(--border)'
        }}>
          {/* Header with Name and Badges */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'relative',
            zIndex: isDead ? 1 : 'auto'
          }}>
            {isEditMode ? (
              <input
                type="text"
                value={item.name || ''}
                onChange={(e) => {
                  onUpdate && onUpdate(item.id, { name: e.target.value })
                }}
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border)',
                  borderRadius: '4px',
                  color: 'var(--text-primary)',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  padding: '0.5rem',
                  width: '100%',
                  maxWidth: '300px'
                }}
                placeholder="Adversary name"
              />
            ) : (
            <h4 style={{
              ...styles.rowTitle,
              color: isDead ? 'color-mix(in srgb, var(--gray-400) 80%, transparent)' : styles.rowTitle.color,
              textAlign: 'left',
              margin: 0,
              fontSize: '1.1rem'
            }}>
              {item.name?.replace(/\s+\(\d+\)$/, '') || item.name}
            </h4>
            )}
            
            {/* Badges on the right */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}>
              {/* Type Badge */}
              {(item.type || isEditMode) && (
                <div>
                  {isEditMode ? (
                    <select
                      value={item.type || ''}
                      onChange={(e) => {
                        onUpdate && onUpdate(item.id, { type: e.target.value })
                      }}
                      style={{
                        backgroundColor: 'var(--purple)',
                        border: '1px solid var(--border)',
                        borderRadius: '3px',
                        color: 'var(--text-primary)',
                        fontSize: '10px',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        padding: '2px 6px',
                        outline: 'none'
                      }}
                    >
                      <option value="Standard">Standard</option>
                      <option value="Solo">Solo</option>
                      <option value="Bruiser">Bruiser</option>
                      <option value="Horde">Horde</option>
                      <option value="Minion">Minion</option>
                      <option value="Ranged">Ranged</option>
                      <option value="Leader">Leader</option>
                      <option value="Skulk">Skulk</option>
                      <option value="Social">Social</option>
                      <option value="Support">Support</option>
                    </select>
                  ) : (
                    <span style={{ ...styles.badge, ...styles.typeBadge }}>
                      {item.type}
                    </span>
                  )}
                </div>
              )}

              {/* Difficulty Badge */}
              {(item.difficulty || isEditMode) && (
                <div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative'
                }}>
                    <Shield 
                      size={28} 
                      strokeWidth={1}
                    style={{ 
                        color: 'var(--text-secondary)'
                      }} 
                    />
                    {isEditMode ? (
                      <input
                        type="text"
                        value={item.difficulty || ''}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9]/g, '')
                          if (value.length <= 2) {
                            onUpdate && onUpdate(item.id, { difficulty: parseInt(value) || 0 })
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'ArrowUp') {
                            e.preventDefault()
                            const current = parseInt(item.difficulty) || 0
                            onUpdate && onUpdate(item.id, { difficulty: Math.min(current + 1, 99) })
                          } else if (e.key === 'ArrowDown') {
                            e.preventDefault()
                            const current = parseInt(item.difficulty) || 0
                            onUpdate && onUpdate(item.id, { difficulty: Math.max(current - 1, 0) })
                          }
                        }}
                        style={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          backgroundColor: 'transparent',
                          border: 'none',
                          color: 'white',
                          fontSize: '0.625rem',
                          fontWeight: 600,
                          width: '20px',
                          textAlign: 'center',
                          outline: 'none'
                        }}
                        placeholder="10"
                        maxLength="2"
                      />
                    ) : (
                  <span style={{
                    position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                    fontSize: '0.625rem',
                    fontWeight: 600,
                    color: 'white',
                    pointerEvents: 'none'
                  }}>
                    {item.difficulty}
                  </span>
                    )}
                  </div>
                </div>
              )}
              
              {/* Attack Modifier Badge */}
              {(item.atk !== undefined || isEditMode) && (
                <div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative'
                }}>
                  <Locate 
                      size={32} 
                    strokeWidth={1}
                    style={{
                      color: 'var(--text-secondary)'
                    }}
                  />
                    {isEditMode ? (
                      <input
                        type="text"
                        value={item.atk || ''}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9+\-d]/g, '')
                          if (value.length <= 3) {
                            onUpdate && onUpdate(item.id, { atk: value })
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'ArrowUp') {
                            e.preventDefault()
                            const current = parseInt(item.atk) || 0
                            onUpdate && onUpdate(item.id, { atk: current >= 0 ? `+${current + 1}` : `${current + 1}` })
                          } else if (e.key === 'ArrowDown') {
                            e.preventDefault()
                            const current = parseInt(item.atk) || 0
                            onUpdate && onUpdate(item.id, { atk: current > 0 ? `+${current - 1}` : `${current - 1}` })
                          }
                        }}
                        style={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          backgroundColor: 'transparent',
                          border: 'none',
                          color: 'white',
                          fontSize: '0.625rem',
                          fontWeight: 600,
                          width: '20px',
                          textAlign: 'center',
                          outline: 'none'
                        }}
                        placeholder="+1"
                        maxLength="3"
                      />
                    ) : (
                  <span style={{
                    position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                    fontSize: '0.625rem',
                    fontWeight: 600,
                    color: 'white',
                    pointerEvents: 'none'
                  }}>
                    {item.atk >= 0 ? '+' : ''}{item.atk}
                  </span>
                    )}
                  </div>
                </div>
              )}

              {/* Tier Badge */}
              {(item.tier || isEditMode) && (
                <div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative'
                  }}>
                    <Diamond 
                      size={28} 
                      strokeWidth={1}
                      style={{ 
                        color: 'var(--text-secondary)'
                      }} 
                    />
                    {isEditMode ? (
                      <input
                        type="text"
                        value={item.tier || ''}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^1-4]/g, '')
                          if (value.length <= 1) {
                            onUpdate && onUpdate(item.id, { tier: value === '' ? '' : parseInt(value) })
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'ArrowUp') {
                            e.preventDefault()
                            const current = parseInt(item.tier) || 1
                            onUpdate && onUpdate(item.id, { tier: Math.min(current + 1, 4) })
                          } else if (e.key === 'ArrowDown') {
                            e.preventDefault()
                            const current = parseInt(item.tier) || 1
                            onUpdate && onUpdate(item.id, { tier: Math.max(current - 1, 1) })
                          }
                        }}
                        style={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          backgroundColor: 'transparent',
                          border: 'none',
                          color: 'white',
                          fontSize: '0.625rem',
                          fontWeight: 600,
                          width: '20px',
                          textAlign: 'center',
                          outline: 'none'
                        }}
                        maxLength="1"
                      />
                    ) : (
                      <span style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        fontSize: '0.625rem',
                        fontWeight: 600,
                        color: 'white',
                        pointerEvents: 'none'
                      }}>
                        {item.tier}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Expandable Content Section */}
        <div style={{
          borderRadius: '0 0 8px 8px'
        }}>





        {/* Motives and Experiences Section */}
        {(item.motives || (item.experience && item.experience.length > 0) || isEditMode) && (
          <div style={{
            padding: '0.75rem 8px',
            marginBottom: '1rem'
          }}>
            {/* Motives */}
            {(item.motives || isEditMode) && (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                marginBottom: (item.experience && item.experience.length > 0) || isEditMode ? '1rem' : '0'
              }}>
                <div style={{
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  marginBottom: '0.5rem'
                }}>
                  Motives
                </div>
                {isEditMode ? (
                  <textarea
                    value={item.motives || ''}
                    onChange={(e) => onUpdate && onUpdate(item.id, { motives: e.target.value })}
                    placeholder="Enter motives (e.g., Hunt, defend, patrol)"
                    rows={2}
                    style={{
                      padding: '0.5rem',
                      border: '1px solid var(--border)',
                      borderRadius: '4px',
                      backgroundColor: 'var(--bg-primary)',
                      color: 'var(--text-primary)',
                      fontSize: '0.875rem',
                      resize: 'vertical'
                    }}
                  />
                ) : (
              <div style={{
                fontSize: '0.875rem',
                lineHeight: 1.5,
                    color: 'var(--text-secondary)'
              }}>
                {item.motives}
              </div>
            )}
              </div>
            )}
            
            {/* Experience */}
            {(item.experience && item.experience.length > 0 || isEditMode) && (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem'
              }}>
                <div style={{
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  marginBottom: '0.5rem'
                }}>
                  Experience
                </div>
                {isEditMode ? (
                  <textarea
                    value={(item.experience || []).join(', ') || ''}
                    onChange={(e) => {
                      const experienceArray = e.target.value.split(',').map(exp => exp.trim()).filter(exp => exp.length > 0)
                      onUpdate && onUpdate(item.id, { experience: experienceArray })
                    }}
                    placeholder="Enter experience tags (e.g., Battle Hardened +3, Keen Senses +2)"
                    rows={2}
                    style={{
                      padding: '0.5rem',
                      border: '1px solid var(--border)',
                      borderRadius: '4px',
                      backgroundColor: 'var(--bg-primary)',
                      color: 'var(--text-primary)',
                      fontSize: '0.875rem',
                      resize: 'vertical'
                    }}
                  />
                ) : (
              <div style={{
                fontSize: '0.875rem',
                lineHeight: 1.5,
                color: 'var(--text-secondary)'
              }}>
                {item.experience.map(exp => 
                  typeof exp === 'string' ? exp : `${exp.name} ${exp.modifier >= 0 ? '+' : ''}${exp.modifier}`
                ).join(', ')}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Features Section - Organized by Type */}
        {((item.features && item.features.length > 0) || isEditMode) && (
          <div style={{
            marginBottom: '1rem',
            padding: '0 8px'
          }}>
            {/* Actions */}
            {(((item.atk !== undefined && item.weapon) || item.features.filter(f => f.type === 'Action').length > 0) || isEditMode) && (
              <div style={{ marginBottom: '1rem' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  marginBottom: '0.75rem'
                }}>
                  <hr style={{
                    flex: 1,
                    border: 'none',
                    borderTop: '1px solid var(--border)',
                    margin: 0
                  }} />
                  <h4 style={{
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: 'white',
                    margin: 0,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    textAlign: 'center',
                    minWidth: '80px'
                  }}>
                    Actions
                  </h4>
                  <hr style={{
                    flex: 1,
                    border: 'none',
                    borderTop: '1px solid var(--border)',
                    margin: 0
                  }} />
                </div>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem'
                }}>
                  {/* Standard Attack - Show in view mode or edit mode */}
                  {isEditMode ? (
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem',
                      padding: '0.5rem',
                      border: '1px solid var(--border)',
                      borderRadius: '4px',
                      backgroundColor: 'var(--bg-secondary)'
                    }}>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <input
                          type="text"
                          value={item.weapon || ''}
                          onChange={(e) => onUpdate && onUpdate(item.id, { weapon: e.target.value })}
                          placeholder="Standard attack name"
                          style={{
                            flex: 1,
                            padding: '0.25rem 0.5rem',
                            border: '1px solid var(--border)',
                            borderRadius: '4px',
                            backgroundColor: 'var(--bg-primary)',
                            color: 'var(--text-primary)',
                            fontSize: '0.875rem'
                          }}
                        />
                        <select
                          value={item.range || ''}
                          onChange={(e) => onUpdate && onUpdate(item.id, { range: e.target.value })}
                          style={{
                            flex: 1,
                            padding: '0.25rem 0.5rem',
                            border: '1px solid var(--border)',
                            borderRadius: '4px',
                            backgroundColor: 'var(--bg-primary)',
                            color: 'var(--text-primary)',
                            fontSize: '0.875rem',
                            appearance: 'none',
                            backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23666\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6,9 12,15 18,9\'%3e%3c/polyline%3e%3c/svg%3e")',
                            backgroundRepeat: 'no-repeat',
                            backgroundPosition: 'right 0.5rem center',
                            backgroundSize: '1rem',
                            paddingRight: '2rem'
                          }}
                        >
                          <option value="">Range</option>
                          <option value="Melee">Melee</option>
                          <option value="Very Close">Very Close</option>
                          <option value="Close">Close</option>
                          <option value="Far">Far</option>
                          <option value="Very Far">Very Far</option>
                        </select>
                        <input
                          type="text"
                          value={item.damage || ''}
                          onChange={(e) => onUpdate && onUpdate(item.id, { damage: e.target.value })}
                          placeholder="Damage (e.g., 1d6+2)"
                          style={{
                            flex: 1,
                            padding: '0.25rem 0.5rem',
                            border: '1px solid var(--border)',
                            borderRadius: '4px',
                            backgroundColor: 'var(--bg-primary)',
                            color: 'var(--text-primary)',
                            fontSize: '0.875rem'
                          }}
                        />
                      </div>
                    </div>
                  ) : (
                    item.atk !== undefined && item.weapon && (
                    <div style={{
                      fontSize: '0.875rem',
                      lineHeight: 1.4,
                      color: 'var(--text-secondary)'
                    }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {item.weapon} (Standard)
                      </span>
                      <span> - Make an attack against a target within {item.range || 'Melee'} range. On a success, deal {item.damage || 'damage varies'}.</span>
                    </div>
                    )
                  )}
                  
                  {/* Other Actions */}
                  {(() => {
                    const actionFeatures = item.features.filter(f => f.type === 'Action')
                    // Ensure at least one empty action feature in edit mode
                    const featuresToShow = isEditMode && actionFeatures.length === 0 
                      ? [{ type: 'Action', name: '', description: '' }]
                      : actionFeatures
                    
                    return featuresToShow.map((feature, index) => {
                      if (isEditMode) {
                        return (
                          <div key={index} style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.5rem',
                            padding: '0.5rem',
                            border: '1px solid var(--border)',
                            borderRadius: '4px',
                            backgroundColor: 'var(--bg-secondary)'
                          }}>
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                              {/* Up/Down Controls */}
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                <button
                                  onClick={() => {
                                    const newFeatures = [...(item.features || [])]
                                    const actionFeatures = newFeatures.filter(f => f.type === 'Action')
                                    const currentIndex = actionFeatures.findIndex(f => f === feature)
                                    if (currentIndex > 0) {
                                      let sourceArrayIndex = newFeatures.findIndex(f => f.type === 'Action' && f === actionFeatures[currentIndex])
                                      let targetArrayIndex = newFeatures.findIndex(f => f.type === 'Action' && f === actionFeatures[currentIndex - 1])
                                      [newFeatures[sourceArrayIndex], newFeatures[targetArrayIndex]] = [newFeatures[targetArrayIndex], newFeatures[sourceArrayIndex]]
                                      onUpdate && onUpdate(item.id, { features: newFeatures })
                                    }
                                  }}
                                  disabled={(item.features || []).filter(f => f.type === 'Action').findIndex(f => f === feature) === 0}
                                  style={{
                                    width: '16px',
                                    height: '16px',
                                    padding: '0',
                                    border: 'none',
                                    backgroundColor: 'transparent',
                                    color: ((item.features || []).filter(f => f.type === 'Action' && f.name.trim()).length >= 2 && 
                                             (item.features || []).filter(f => f.type === 'Action').findIndex(f => f === feature) !== 0 &&
                                             feature.name.trim()) 
                                           ? 'white' : 'var(--text-secondary)',
                                    cursor: ((item.features || []).filter(f => f.type === 'Action' && f.name.trim()).length >= 2 && 
                                              (item.features || []).filter(f => f.type === 'Action').findIndex(f => f === feature) !== 0 &&
                                              feature.name.trim())
                                           ? 'pointer' : 'not-allowed',
                                    fontSize: '10px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                  }}
                                >
                                  ↑
                                </button>

                                <button
                                  onClick={() => {
                                    const newFeatures = [...(item.features || [])]
                                    const actionFeatures = newFeatures.filter(f => f.type === 'Action')
                                    const currentIndex = actionFeatures.findIndex(f => f === feature)
                                    if (currentIndex < actionFeatures.length - 1) {
                                      let sourceArrayIndex = newFeatures.findIndex(f => f.type === 'Action' && f === actionFeatures[currentIndex])
                                      let targetArrayIndex = newFeatures.findIndex(f => f.type === 'Action' && f === actionFeatures[currentIndex + 1])
                                      [newFeatures[sourceArrayIndex], newFeatures[targetArrayIndex]] = [newFeatures[targetArrayIndex], newFeatures[sourceArrayIndex]]
                                      onUpdate && onUpdate(item.id, { features: newFeatures })
                                    }
                                  }}
                                  disabled={(item.features || []).filter(f => f.type === 'Action').findIndex(f => f === feature) === (item.features || []).filter(f => f.type === 'Action').length - 1}
                                  style={{
                                    width: '16px',
                                    height: '16px',
                                    padding: '0',
                                    border: 'none',
                                    backgroundColor: 'transparent',
                                    color: ((item.features || []).filter(f => f.type === 'Action' && f.name.trim()).length >= 2 && 
                                             (item.features || []).filter(f => f.type === 'Action').findIndex(f => f === feature) < (item.features || []).filter(f => f.type === 'Action').length - 1 &&
                                             (item.features || []).filter(f => f.type === 'Action')[(item.features || []).filter(f => f.type === 'Action').findIndex(f => f === feature) + 1]?.name.trim() &&
                                             feature.name.trim())
                                           ? 'white' : 'var(--text-secondary)',
                                    cursor: ((item.features || []).filter(f => f.type === 'Action' && f.name.trim()).length >= 2 && 
                                              (item.features || []).filter(f => f.type === 'Action').findIndex(f => f === feature) < (item.features || []).filter(f => f.type === 'Action').length - 1 &&
                                              (item.features || []).filter(f => f.type === 'Action')[(item.features || []).filter(f => f.type === 'Action').findIndex(f => f === feature) + 1]?.name.trim() &&
                                              feature.name.trim())
                                           ? 'pointer' : 'not-allowed',
                                    fontSize: '10px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                  }}
                                >
                                  ↓
                                </button>
                              </div>

                              <input
                                type="text"
                                value={feature.name || ''}
                                onChange={(e) => {
                                  const newFeatures = [...(item.features || [])]
                                  const actionIndex = newFeatures.findIndex(f => f.type === 'Action' && f === feature)
                                  if (actionIndex >= 0) {
                                    newFeatures[actionIndex] = { ...newFeatures[actionIndex], name: e.target.value }
                                  } else {
                                    newFeatures.push({ type: 'Action', name: e.target.value, description: feature.description || '' })
                                  }
                                  
                                  // Auto-add new action if this was the last action and both name and description are filled
                                  const actionFeatures = newFeatures.filter(f => f.type === 'Action')
                                  const lastAction = actionFeatures[actionFeatures.length - 1]
                                  if (lastAction && lastAction.name.trim() && lastAction.description.trim()) {
                                    newFeatures.push({ type: 'Action', name: '', description: '' })
                                  }
                                  
                                  onUpdate && onUpdate(item.id, { features: newFeatures })
                                }}
                                placeholder="Action name"
                                style={{
                                  flex: 1,
                                  padding: '0.25rem 0.5rem',
                                  border: '1px solid var(--border)',
                                  borderRadius: '4px',
                                  backgroundColor: 'var(--bg-primary)',
                                  color: 'var(--text-primary)',
                                  fontSize: '0.875rem',
                                  transition: 'background-color 0.2s'
                                }}
                              />
                              <button
                                onClick={() => handleFeatureDeleteClick(feature)}
                                disabled={!feature.name.trim() && !feature.description.trim()}
                                style={{
                                  padding: '0.25rem 0.5rem',
                                  border: '1px solid var(--border)',
                                  borderRadius: '4px',
                                  backgroundColor: deleteConfirmations[getFeatureKey(feature)] ? 'var(--danger)' : 'var(--bg-primary)',
                                  color: (!feature.name.trim() && !feature.description.trim()) ? 'var(--text-secondary)' : 'white',
                                  cursor: (!feature.name.trim() && !feature.description.trim()) ? 'not-allowed' : 'pointer',
                                  opacity: (!feature.name.trim() && !feature.description.trim()) ? 0.5 : 1,
                                  fontSize: '0.875rem',
                                  transition: 'background-color 0.2s'
                                }}
                              >
                                ×
                              </button>
                            </div>
                            <textarea
                              value={feature.description || ''}
                              onChange={(e) => {
                                const newFeatures = [...(item.features || [])]
                                const actionIndex = newFeatures.findIndex(f => f.type === 'Action' && f === feature)
                                if (actionIndex >= 0) {
                                  newFeatures[actionIndex] = { ...newFeatures[actionIndex], description: e.target.value }
                                } else {
                                  newFeatures.push({ type: 'Action', name: feature.name || '', description: e.target.value })
                                }
                                
                                // Auto-add new action if this was the last action and both name and description are filled
                                const actionFeatures = newFeatures.filter(f => f.type === 'Action')
                                const lastAction = actionFeatures[actionFeatures.length - 1]
                                if (lastAction && lastAction.name.trim() && lastAction.description.trim()) {
                                  newFeatures.push({ type: 'Action', name: '', description: '' })
                                }
                                
                                onUpdate && onUpdate(item.id, { features: newFeatures })
                              }}
                              placeholder="Action description"
                              rows={2}
                              style={{
                                padding: '0.25rem 0.5rem',
                                border: '1px solid var(--border)',
                                borderRadius: '4px',
                                backgroundColor: 'var(--bg-primary)',
                                color: 'var(--text-primary)',
                                fontSize: '0.875rem',
                                resize: 'vertical'
                              }}
                            />
                          </div>
                        )
                      }
                    return (
                    <div key={index} style={{
                      fontSize: '0.875rem',
                      lineHeight: 1.4,
                      color: 'var(--text-secondary)'
                    }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {feature.name}
                      </span>
                      {feature.description && (
                        <span> - {feature.description}</span>
                      )}
                    </div>
                    );
                    })
                  })()}
                </div>
              </div>
            )}

            {/* Passives */}
            {(item.features.filter(f => f.type === 'Passive').length > 0 || isEditMode) && (
              <div style={{ marginBottom: '1rem' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  marginBottom: '0.75rem'
                }}>
                  <hr style={{
                    flex: 1,
                    border: 'none',
                    borderTop: '1px solid var(--border)',
                    margin: 0
                  }} />
                  <h4 style={{
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: 'white',
                    margin: 0,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    textAlign: 'center',
                    minWidth: '80px'
                  }}>
                    Passives
                  </h4>
                  <hr style={{
                    flex: 1,
                    border: 'none',
                    borderTop: '1px solid var(--border)',
                    margin: 0
                  }} />
                </div>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem'
                }}>
                  {(() => {
                    const passiveFeatures = item.features.filter(f => f.type === 'Passive')
                    // Ensure at least one empty passive feature in edit mode
                    const featuresToShow = isEditMode && passiveFeatures.length === 0 
                      ? [{ type: 'Passive', name: '', description: '' }]
                      : passiveFeatures
                    
                    return featuresToShow.map((feature, index) => {
                      if (isEditMode) {
                        return (
                          <div key={index} style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.5rem',
                            padding: '0.5rem',
                            border: '1px solid var(--border)',
                            borderRadius: '4px',
                            backgroundColor: 'var(--bg-secondary)'
                          }}>
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                              {/* Up/Down Controls */}
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                <button
                                  onClick={() => {
                                    const newFeatures = [...(item.features || [])]
                                    const passiveFeatures = newFeatures.filter(f => f.type === 'Passive')
                                    const currentIndex = passiveFeatures.findIndex(f => f === feature)
                                    if (currentIndex > 0) {
                                      let sourceArrayIndex = newFeatures.findIndex(f => f.type === 'Passive' && f === passiveFeatures[currentIndex])
                                      let targetArrayIndex = newFeatures.findIndex(f => f.type === 'Passive' && f === passiveFeatures[currentIndex - 1])
                                      [newFeatures[sourceArrayIndex], newFeatures[targetArrayIndex]] = [newFeatures[targetArrayIndex], newFeatures[sourceArrayIndex]]
                                      onUpdate && onUpdate(item.id, { features: newFeatures })
                                    }
                                  }}
                                  disabled={(item.features || []).filter(f => f.type === 'Passive').findIndex(f => f === feature) === 0}
                                  style={{
                                    width: '16px',
                                    height: '16px',
                                    padding: '0',
                                    border: 'none',
                                    backgroundColor: 'transparent',
                                    color: ((item.features || []).filter(f => f.type === 'Passive' && f.name.trim()).length >= 2 && 
                                             (item.features || []).filter(f => f.type === 'Passive').findIndex(f => f === feature) !== 0 &&
                                             feature.name.trim()) 
                                           ? 'white' : 'var(--text-secondary)',
                                    cursor: ((item.features || []).filter(f => f.type === 'Passive' && f.name.trim()).length >= 2 && 
                                              (item.features || []).filter(f => f.type === 'Passive').findIndex(f => f === feature) !== 0 &&
                                              feature.name.trim())
                                           ? 'pointer' : 'not-allowed',
                                    fontSize: '10px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                  }}
                                >
                                  ↑
                                </button>

                                <button
                                  onClick={() => {
                                    const newFeatures = [...(item.features || [])]
                                    const passiveFeatures = newFeatures.filter(f => f.type === 'Passive')
                                    const currentIndex = passiveFeatures.findIndex(f => f === feature)
                                    if (currentIndex < passiveFeatures.length - 1) {
                                      let sourceArrayIndex = newFeatures.findIndex(f => f.type === 'Passive' && f === passiveFeatures[currentIndex])
                                      let targetArrayIndex = newFeatures.findIndex(f => f.type === 'Passive' && f === passiveFeatures[currentIndex + 1])
                                      [newFeatures[sourceArrayIndex], newFeatures[targetArrayIndex]] = [newFeatures[targetArrayIndex], newFeatures[sourceArrayIndex]]
                                      onUpdate && onUpdate(item.id, { features: newFeatures })
                                    }
                                  }}
                                  disabled={(item.features || []).filter(f => f.type === 'Passive').findIndex(f => f === feature) === (item.features || []).filter(f => f.type === 'Passive').length - 1}
                                  style={{
                                    width: '16px',
                                    height: '16px',
                                    padding: '0',
                                    border: 'none',
                                    backgroundColor: 'transparent',
                                    color: ((item.features || []).filter(f => f.type === 'Passive' && f.name.trim()).length >= 2 && 
                                             (item.features || []).filter(f => f.type === 'Passive').findIndex(f => f === feature) < (item.features || []).filter(f => f.type === 'Passive').length - 1 &&
                                             (item.features || []).filter(f => f.type === 'Passive')[(item.features || []).filter(f => f.type === 'Passive').findIndex(f => f === feature) + 1]?.name.trim() &&
                                             feature.name.trim())
                                           ? 'white' : 'var(--text-secondary)',
                                    cursor: ((item.features || []).filter(f => f.type === 'Passive' && f.name.trim()).length >= 2 && 
                                              (item.features || []).filter(f => f.type === 'Passive').findIndex(f => f === feature) < (item.features || []).filter(f => f.type === 'Passive').length - 1 &&
                                              (item.features || []).filter(f => f.type === 'Passive')[(item.features || []).filter(f => f.type === 'Passive').findIndex(f => f === feature) + 1]?.name.trim() &&
                                              feature.name.trim())
                                           ? 'pointer' : 'not-allowed',
                                    fontSize: '10px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                  }}
                                >
                                  ↓
                                </button>
                              </div>

                              <input
                                type="text"
                                value={feature.name || ''}
                                onChange={(e) => {
                                  const newFeatures = [...(item.features || [])]
                                  const passiveIndex = newFeatures.findIndex(f => f.type === 'Passive' && f === feature)
                                  if (passiveIndex >= 0) {
                                    newFeatures[passiveIndex] = { ...newFeatures[passiveIndex], name: e.target.value }
                                  } else {
                                    newFeatures.push({ type: 'Passive', name: e.target.value, description: feature.description || '' })
                                  }
                                  
                                  // Auto-add new passive if this was the last passive and both name and description are filled
                                  const passiveFeatures = newFeatures.filter(f => f.type === 'Passive')
                                  const lastPassive = passiveFeatures[passiveFeatures.length - 1]
                                  if (lastPassive && lastPassive.name.trim() && lastPassive.description.trim()) {
                                    newFeatures.push({ type: 'Passive', name: '', description: '' })
                                  }
                                  
                                  onUpdate && onUpdate(item.id, { features: newFeatures })
                                }}
                                placeholder="Passive name"
                                style={{
                                  flex: 1,
                                  padding: '0.25rem 0.5rem',
                                  border: '1px solid var(--border)',
                                  borderRadius: '4px',
                                  backgroundColor: 'var(--bg-primary)',
                                  color: 'var(--text-primary)',
                                  fontSize: '0.875rem',
                                  transition: 'background-color 0.2s'
                                }}
                              />
                              <button
                                onClick={() => handleFeatureDeleteClick(feature)}
                               disabled={!feature.name.trim() && !feature.description.trim()}
                                style={{
                                  padding: '0.25rem 0.5rem',
                                  border: '1px solid var(--border)',
                                  borderRadius: '4px',
                                  backgroundColor: deleteConfirmations[getFeatureKey(feature)] ? 'var(--danger)' : 'var(--bg-primary)',
                                  color: (!feature.name.trim() && !feature.description.trim()) ? 'var(--text-secondary)' : 'white',
                                  cursor: (!feature.name.trim() && !feature.description.trim()) ? 'not-allowed' : 'pointer',
                                  opacity: (!feature.name.trim() && !feature.description.trim()) ? 0.5 : 1,
                                  fontSize: '0.875rem',
                                  transition: 'background-color 0.2s'
                                }}
                              >
                                ×
                              </button>
                            </div>
                            <textarea
                              value={feature.description || ''}
                              onChange={(e) => {
                                const newFeatures = [...(item.features || [])]
                                const passiveIndex = newFeatures.findIndex(f => f.type === 'Passive' && f === feature)
                                if (passiveIndex >= 0) {
                                  newFeatures[passiveIndex] = { ...newFeatures[passiveIndex], description: e.target.value }
                                } else {
                                  newFeatures.push({ type: 'Passive', name: feature.name || '', description: e.target.value })
                                }
                                
                                // Auto-add new passive if this was the last passive and both name and description are filled
                                const passiveFeatures = newFeatures.filter(f => f.type === 'Passive')
                                const lastPassive = passiveFeatures[passiveFeatures.length - 1]
                                if (lastPassive && lastPassive.name.trim() && lastPassive.description.trim()) {
                                  newFeatures.push({ type: 'Passive', name: '', description: '' })
                                }
                                
                                onUpdate && onUpdate(item.id, { features: newFeatures })
                              }}
                              placeholder="Passive description"
                              rows={2}
                              style={{
                                padding: '0.25rem 0.5rem',
                                border: '1px solid var(--border)',
                                borderRadius: '4px',
                                backgroundColor: 'var(--bg-primary)',
                                color: 'var(--text-primary)',
                                fontSize: '0.875rem',
                                resize: 'vertical'
                              }}
                            />
                          </div>
                        )
                      }
                      return (
                    <div key={index} style={{
                      fontSize: '0.875rem',
                      lineHeight: 1.4,
                      color: 'var(--text-secondary)'
                    }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {feature.name}
                      </span>
                      {feature.description && (
                        <span> - {feature.description}</span>
                      )}
                    </div>
                      )
                    })
                  })()}
                </div>
              </div>
            )}

            {/* Reactions */}
            {(item.features.filter(f => f.type === 'Reaction').length > 0 || isEditMode) && (
              <div style={{ marginBottom: '1rem' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  marginBottom: '0.75rem'
                }}>
                  <hr style={{
                    flex: 1,
                    border: 'none',
                    borderTop: '1px solid var(--border)',
                    margin: 0
                  }} />
                  <h4 style={{
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: 'white',
                    margin: 0,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    textAlign: 'center',
                    minWidth: '80px'
                  }}>
                    Reactions
                  </h4>
                  <hr style={{
                    flex: 1,
                    border: 'none',
                    borderTop: '1px solid var(--border)',
                    margin: 0
                  }} />
                </div>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem'
                }}>
                  {(() => {
                    const reactionFeatures = item.features.filter(f => f.type === 'Reaction')
                    // Ensure at least one empty reaction feature in edit mode
                    const featuresToShow = isEditMode && reactionFeatures.length === 0 
                      ? [{ type: 'Reaction', name: '', description: '' }]
                      : reactionFeatures
                    
                    return featuresToShow.map((feature, index) => {
                      if (isEditMode) {
                        return (
                          <div key={index} style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.5rem',
                            padding: '0.5rem',
                            border: '1px solid var(--border)',
                            borderRadius: '4px',
                            backgroundColor: 'var(--bg-secondary)'
                          }}>
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                              {/* Up/Down Controls */}
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                <button
                                  onClick={() => {
                                    const newFeatures = [...(item.features || [])]
                                    const reactionFeatures = newFeatures.filter(f => f.type === 'Reaction')
                                    const currentIndex = reactionFeatures.findIndex(f => f === feature)
                                    if (currentIndex > 0) {
                                      let sourceArrayIndex = newFeatures.findIndex(f => f.type === 'Reaction' && f === reactionFeatures[currentIndex])
                                      let targetArrayIndex = newFeatures.findIndex(f => f.type === 'Reaction' && f === reactionFeatures[currentIndex - 1])
                                      [newFeatures[sourceArrayIndex], newFeatures[targetArrayIndex]] = [newFeatures[targetArrayIndex], newFeatures[sourceArrayIndex]]
                                      onUpdate && onUpdate(item.id, { features: newFeatures })
                                    }
                                  }}
                                  disabled={(item.features || []).filter(f => f.type === 'Reaction').findIndex(f => f === feature) === 0}
                                  style={{
                                    width: '16px',
                                    height: '16px',
                                    padding: '0',
                                    border: 'none',
                                    backgroundColor: 'transparent',
                                    color: ((item.features || []).filter(f => f.type === 'Reaction' && f.name.trim()).length >= 2 && 
                                             (item.features || []).filter(f => f.type === 'Reaction').findIndex(f => f === feature) !== 0 &&
                                             feature.name.trim()) 
                                           ? 'white' : 'var(--text-secondary)',
                                    cursor: ((item.features || []).filter(f => f.type === 'Reaction' && f.name.trim()).length >= 2 && 
                                              (item.features || []).filter(f => f.type === 'Reaction').findIndex(f => f === feature) !== 0 &&
                                              feature.name.trim())
                                           ? 'pointer' : 'not-allowed',
                                    fontSize: '10px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                  }}
                                >
                                  ↑
                                </button>

                                <button
                                  onClick={() => {
                                    const newFeatures = [...(item.features || [])]
                                    const reactionFeatures = newFeatures.filter(f => f.type === 'Reaction')
                                    const currentIndex = reactionFeatures.findIndex(f => f === feature)
                                    if (currentIndex < reactionFeatures.length - 1) {
                                      let sourceArrayIndex = newFeatures.findIndex(f => f.type === 'Reaction' && f === reactionFeatures[currentIndex])
                                      let targetArrayIndex = newFeatures.findIndex(f => f.type === 'Reaction' && f === reactionFeatures[currentIndex + 1])
                                      [newFeatures[sourceArrayIndex], newFeatures[targetArrayIndex]] = [newFeatures[targetArrayIndex], newFeatures[sourceArrayIndex]]
                                      onUpdate && onUpdate(item.id, { features: newFeatures })
                                    }
                                  }}
                                  disabled={(item.features || []).filter(f => f.type === 'Reaction').findIndex(f => f === feature) === (item.features || []).filter(f => f.type === 'Reaction').length - 1}
                                  style={{
                                    width: '16px',
                                    height: '16px',
                                    padding: '0',
                                    border: 'none',
                                    backgroundColor: 'transparent',
                                    color: ((item.features || []).filter(f => f.type === 'Reaction' && f.name.trim()).length >= 2 && 
                                             (item.features || []).filter(f => f.type === 'Reaction').findIndex(f => f === feature) < (item.features || []).filter(f => f.type === 'Reaction').length - 1 &&
                                             (item.features || []).filter(f => f.type === 'Reaction')[(item.features || []).filter(f => f.type === 'Reaction').findIndex(f => f === feature) + 1]?.name.trim() &&
                                             feature.name.trim())
                                           ? 'white' : 'var(--text-secondary)',
                                    cursor: ((item.features || []).filter(f => f.type === 'Reaction' && f.name.trim()).length >= 2 && 
                                              (item.features || []).filter(f => f.type === 'Reaction').findIndex(f => f === feature) < (item.features || []).filter(f => f.type === 'Reaction').length - 1 &&
                                              (item.features || []).filter(f => f.type === 'Reaction')[(item.features || []).filter(f => f.type === 'Reaction').findIndex(f => f === feature) + 1]?.name.trim() &&
                                              feature.name.trim())
                                           ? 'pointer' : 'not-allowed',
                                    fontSize: '10px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                  }}
                                >
                                  ↓
                                </button>
                              </div>

                              <input
                                type="text"
                                value={feature.name || ''}
                                onChange={(e) => {
                                  const newFeatures = [...(item.features || [])]
                                  const reactionIndex = newFeatures.findIndex(f => f.type === 'Reaction' && f === feature)
                                  if (reactionIndex >= 0) {
                                    newFeatures[reactionIndex] = { ...newFeatures[reactionIndex], name: e.target.value }
                                  } else {
                                    newFeatures.push({ type: 'Reaction', name: e.target.value, description: feature.description || '' })
                                  }
                                  
                                  // Auto-add new reaction if this was the last reaction and both name and description are filled
                                  const reactionFeatures = newFeatures.filter(f => f.type === 'Reaction')
                                  const lastReaction = reactionFeatures[reactionFeatures.length - 1]
                                  if (lastReaction && lastReaction.name.trim() && lastReaction.description.trim()) {
                                    newFeatures.push({ type: 'Reaction', name: '', description: '' })
                                  }
                                  
                                  onUpdate && onUpdate(item.id, { features: newFeatures })
                                }}
                                placeholder="Reaction name"
                                style={{
                                  flex: 1,
                                  padding: '0.25rem 0.5rem',
                                  border: '1px solid var(--border)',
                                  borderRadius: '4px',
                                  backgroundColor: 'var(--bg-primary)',
                                  color: 'var(--text-primary)',
                                  fontSize: '0.875rem',
                                  transition: 'background-color 0.2s'
                                }}
                              />
                              <button
                                onClick={() => handleFeatureDeleteClick(feature)}
                                disabled={!feature.name.trim() && !feature.description.trim()}
                                style={{
                                  padding: '0.25rem 0.5rem',
                                  border: '1px solid var(--border)',
                                  borderRadius: '4px',
                                  backgroundColor: deleteConfirmations[getFeatureKey(feature)] ? 'var(--danger)' : 'var(--bg-primary)',
                                  color: (!feature.name.trim() && !feature.description.trim()) ? 'var(--text-secondary)' : 'white',
                                  cursor: (!feature.name.trim() && !feature.description.trim()) ? 'not-allowed' : 'pointer',
                                  opacity: (!feature.name.trim() && !feature.description.trim()) ? 0.5 : 1,
                                  fontSize: '0.875rem',
                                  transition: 'background-color 0.2s'
                                }}
                              >
                                ×
                              </button>
                            </div>
                            <textarea
                              value={feature.description || ''}
                              onChange={(e) => {
                                const newFeatures = [...(item.features || [])]
                                const reactionIndex = newFeatures.findIndex(f => f.type === 'Reaction' && f === feature)
                                if (reactionIndex >= 0) {
                                  newFeatures[reactionIndex] = { ...newFeatures[reactionIndex], description: e.target.value }
                                } else {
                                  newFeatures.push({ type: 'Reaction', name: feature.name || '', description: e.target.value })
                                }
                                
                                // Auto-add new reaction if this was the last reaction and both name and description are filled
                                const reactionFeatures = newFeatures.filter(f => f.type === 'Reaction')
                                const lastReaction = reactionFeatures[reactionFeatures.length - 1]
                                if (lastReaction && lastReaction.name.trim() && lastReaction.description.trim()) {
                                  newFeatures.push({ type: 'Reaction', name: '', description: '' })
                                }
                                
                                onUpdate && onUpdate(item.id, { features: newFeatures })
                              }}
                              placeholder="Reaction description"
                              rows={2}
                              style={{
                                padding: '0.25rem 0.5rem',
                                border: '1px solid var(--border)',
                                borderRadius: '4px',
                                backgroundColor: 'var(--bg-primary)',
                                color: 'var(--text-primary)',
                                fontSize: '0.875rem',
                                resize: 'vertical'
                              }}
                            />
                          </div>
                        )
                      }
                      return (
                    <div key={index} style={{
                      fontSize: '0.875rem',
                      lineHeight: 1.4,
                      color: 'var(--text-secondary)'
                    }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {feature.name}
                      </span>
                      {feature.description && (
                        <span> - {feature.description}</span>
                      )}
                    </div>
                      )
                    })
                  })()}
                </div>
              </div>
            )}
          </div>
        )}

        </div>

        {/* Status Section */}
        {item.type !== 'Minion' && item.thresholds && (
          <div style={{
            marginBottom: '1rem',
            padding: '0 8px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '0.75rem'
            }}>
              <hr style={{
                flex: 1,
                border: 'none',
                borderTop: '1px solid var(--border)',
                margin: 0
              }} />
              <h4 style={{
                fontSize: '0.875rem',
                fontWeight: 600,
                color: 'white',
                margin: 0,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                textAlign: 'center',
                minWidth: '80px'
              }}>
                Status
              </h4>
              <hr style={{
                flex: 1,
                border: 'none',
                borderTop: '1px solid var(--border)',
                margin: 0
              }} />
            </div>
            <div style={{
              padding: '0.75rem 0 0 0'
            }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              fontSize: '0.875rem'
            }}>
              {/* HP Pip 1 */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '2px',
                marginTop: '-3px'
              }}>
                <Droplet 
                  size={16} 
                  style={{ 
                    color: 'var(--red)'
                  }} 
                />
              </div>

              {/* Threshold 1 */}
              <ThresholdTag value={item.thresholds.major || '7'} />

              {/* HP Pip 2 */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '2px',
                marginTop: '-3px'
              }}>
                <Droplet 
                  size={16} 
                  style={{ 
                    color: 'var(--red)'
                  }} 
                />
                <Droplet 
                  size={16} 
                  style={{ 
                    color: 'var(--red)'
                  }} 
                />
              </div>

              {/* Threshold 2 */}
              <ThresholdTag value={item.thresholds.severe || '14'} />

              {/* HP Pip 3 */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '2px',
                marginTop: '-3px'
              }}>
                <Droplet 
                  size={16} 
                  style={{ 
                    color: 'var(--red)'
                  }} 
                />
                <Droplet 
                  size={16} 
                  style={{ 
                    color: 'var(--red)'
                  }} 
                />
                <Droplet 
                  size={16} 
                  style={{ 
                    color: 'var(--red)'
                  }} 
                />
              </div>
            </div>
            </div>
          </div>
        )}

        {/* Condensed Cards for All Instances */}
        {instances && instances.length > 0 && (
          <div style={{
            marginTop: '1rem',
            borderTop: '1px solid var(--border)'
          }}>
            {instances.map((instance, index) => {
              const isInstanceDead = (instance.hp || 0) >= (instance.hpMax || 1)
              return (
              <div key={instance.id}>
                <div
                  key={instance.id}
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    borderRadius: '4px',
                    padding: '4px',
                    border: '1px solid var(--border)',
                    marginBottom: '4px',
                    display: 'flex',
                    justifyContent: 'flex-start',
                    alignItems: 'center',
                    gap: '8px',
                    opacity: isInstanceDead ? 0.7 : 1,
                    backgroundColor: isInstanceDead ? 'var(--gray-900)' : 'var(--bg-secondary)',
                    borderColor: isInstanceDead ? 'color-mix(in srgb, var(--gray-600) 40%, transparent)' : 'var(--border)',
                    position: 'relative'
                  }}
                >
                  {/* DEFEATED overlay for instances */}
                  {isInstanceDead && (
                    <>
                      {/* Diagonal striping pattern */}
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: `repeating-linear-gradient(
                          45deg,
                          transparent 0px,
                          transparent 8px,
                          var(--gray-600) 9px,
                          var(--gray-600) 9px
                        )`,
                        pointerEvents: 'none',
                        zIndex: 1,
                        borderRadius: '4px'
                      }} />
                      {/* DEFEATED text */}
                      <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        color: 'var(--text-secondary)',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        zIndex: 2,
                        backgroundColor: 'var(--gray-900)',
                        padding: '0.125rem 0.25rem',
                        borderRadius: '0.25rem',
                        border: '0.5px solid var(--gray-600)'
                      }}>
                        DEFEATED
                      </div>
                    </>
                  )}
                  {/* Number section - Fixed width for double digits */}
                  <div style={{
                    backgroundColor: 'var(--bg-secondary)',
                    borderRadius: '6px',
                    border: '1px solid var(--border-hover)',
                    width: '32px',
                    textAlign: 'center',
                    flexShrink: 0,
                    padding: '2px'
                  }}>
                    <span style={{
                      fontSize: '1rem',
                      fontWeight: 600,
                      color: 'var(--text-primary)'
                    }}>
                      {instance.duplicateNumber || 1}
                    </span>
                  </div>

                  {/* HP and Stress pips - Immediately after number */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: '2px'
                  }}>
                    {/* HP Row */}
                    <div 
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        cursor: 'pointer'
                      }}
                      onClick={(e) => {
                        e.stopPropagation()
                        if (!onApplyDamage || type !== 'adversary') return
                        
                        const outerRect = e.currentTarget.getBoundingClientRect()
                        const containerElement = e.currentTarget.querySelector('.pip-container')
                        
                        if (!containerElement) {
                          return
                        }
                        
                        const containerRect = containerElement.getBoundingClientRect()
                        const clickX = e.clientX - containerRect.left
                        const currentHp = instance.hp || 0
                        const maxHp = instance.hpMax || 1
                        
                        // Handle clicks outside the pip container (relative to pip container)
                        if (clickX < 0) {
                          // Click left of all pips = decrement (heal)
                          if (currentHp > 0 && onApplyHealing) {
                            onApplyHealing(instance.id, 1, currentHp)
                          }
                          return
                        }
                        
                        if (clickX > containerRect.width) {
                          // Click right of all pips = increment (damage)
                          if (currentHp < maxHp) {
                            onApplyDamage(instance.id, 1, currentHp, maxHp)
                          }
                          return
                        }
                        
                        // Click within pip container - use boundary logic based on pip container width only
                        const containerWidth = containerRect.width
                        const pipPadding = containerWidth * 0.05
                        const effectiveContainerWidth = containerWidth - (2 * pipPadding)
                        const clickXWithinContainer = clickX - pipPadding
                        
                        // Calculate boundary at the end of the last filled pip
                        const boundaryRatio = currentHp / maxHp
                        const boundaryXWithinContainer = effectiveContainerWidth * boundaryRatio
                        
                        if (clickXWithinContainer < boundaryXWithinContainer) {
                          // Click left of boundary = decrement (heal)
                          if (currentHp > 0 && onApplyHealing) {
                            onApplyHealing(instance.id, 1, currentHp)
                          }
                        } else {
                          // Click right of boundary = increment (damage)
                          if (currentHp < maxHp) {
                            onApplyDamage(instance.id, 1, currentHp, maxHp)
                          }
                        }
                      }}
                    >
                      <div 
                        className="pip-container"
                        style={{
                          display: 'flex',
                          gap: '2px',
                          alignItems: 'center'
                        }}
                      >
                        {Array.from({ length: instance.hpMax || 1 }, (_, i) => (
                          <span
                            key={i}
                            style={{
                              fontSize: '0.75rem',
                              color: i < (instance.hp || 0) ? 'var(--red)' : 'var(--text-secondary)',
                              transition: 'all 0.1s ease'
                            }}
                          >
                            <Droplet size={16} />
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Stress Row */}
                    {instance.stressMax > 0 && (
                      <div 
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          cursor: 'pointer'
                        }}
                        onClick={(e) => {
                          e.stopPropagation()
                          if (!onApplyStressChange || type !== 'adversary') return
                          
                          const outerRect = e.currentTarget.getBoundingClientRect()
                          const containerElement = e.currentTarget.querySelector('.pip-container')
                          
                          if (!containerElement) {
                            return
                          }
                          
                          const containerRect = containerElement.getBoundingClientRect()
                          const clickX = e.clientX - containerRect.left
                          const currentStress = instance.stress || 0
                          const maxStress = instance.stressMax
                          
                          // Handle clicks outside the pip container (relative to pip container)
                          if (clickX < 0) {
                            // Click left of all pips = decrement
                            if (currentStress > 0) {
                              onApplyStressChange(instance.id, -1)
                            }
                            return
                          }
                          
                          if (clickX > containerRect.width) {
                            // Click right of all pips = increment
                            if (currentStress < maxStress) {
                              onApplyStressChange(instance.id, 1)
                            }
                            return
                          }
                          
                          // Click within pip container - use boundary logic based on pip container width only
                          const containerWidth = containerRect.width
                          const pipPadding = containerWidth * 0.05
                          const effectiveContainerWidth = containerWidth - (2 * pipPadding)
                          const clickXWithinContainer = clickX - pipPadding
                          
                          // Calculate boundary at the end of the last filled pip
                          const boundaryRatio = currentStress / maxStress
                          const boundaryXWithinContainer = effectiveContainerWidth * boundaryRatio
                          
                          if (clickXWithinContainer < boundaryXWithinContainer) {
                            // Click left of boundary = decrement
                            if (currentStress > 0) {
                              onApplyStressChange(instance.id, -1)
                            }
                          } else {
                            // Click right of boundary = increment
                            if (currentStress < maxStress) {
                              onApplyStressChange(instance.id, 1)
                            }
                          }
                        }}
                      >
                        <div 
                          className="pip-container"
                          style={{
                            display: 'flex',
                            gap: '2px',
                            alignItems: 'center'
                          }}
                        >
                          {Array.from({ length: instance.stressMax }, (_, i) => (
                            <span
                              key={i}
                              style={{
                                fontSize: '0.75rem',
                                color: i < (instance.stress || 0) ? 'var(--gold)' : 'var(--text-secondary)',
                                transition: 'all 0.1s ease'
                              }}
                            >
                              <Activity size={16} />
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              )
            })}
          </div>
        )}

        {/* Description Section */}
        {(item.description || isEditMode) && (
          <div style={{
            marginBottom: '1rem',
            padding: '0 8px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '0.75rem'
            }}>
              <hr style={{
                flex: 1,
                border: 'none',
                borderTop: '1px solid var(--border)',
                margin: 0
              }} />
              <h4 style={{
                fontSize: '0.875rem',
                fontWeight: 600,
                color: 'white',
                margin: 0,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                textAlign: 'center',
                minWidth: '80px'
              }}>
                Description
              </h4>
              <hr style={{
                flex: 1,
                border: 'none',
                borderTop: '1px solid var(--border)',
                margin: 0
              }} />
            </div>
            {isEditMode ? (
              <textarea
                style={{
                  width: '100%',
                  minHeight: '100px',
                  padding: '0.5rem',
                  border: '1px solid var(--border)',
                  borderRadius: '0.5rem',
                  backgroundColor: 'var(--bg-secondary)',
                  color: 'white',
                  fontSize: '0.875rem',
                  lineHeight: 1.5,
                  resize: 'vertical',
                  fontFamily: 'inherit'
                }}
                value={item.description}
                onChange={(e) => {
                  onUpdate && onUpdate(item.id, { description: e.target.value })
                }}
                placeholder="Enter adversary description..."
              />
            ) : (
              <div style={{
                fontSize: '0.875rem',
                lineHeight: 1.5,
                color: 'var(--text-secondary)',
                whiteSpace: 'pre-wrap'
              }}>
                {item.description}
              </div>
            )}
          </div>
        )}

        {/* Damage Input Popup for Adversaries */}
        {renderDamageInput()}
      </div>
    )
  }

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  // Render expanded view for adversaries
  if ((mode === 'expanded' || mode === 'edit') && (type === 'adversary' || type === 'adversaries')) {
    return renderExpandedAdversary()
  }

  // For unsupported types, show coming soon message
    const hasExpandedRenderer = (type === 'adversary' || type === 'adversaries')
    
    if (!hasExpandedRenderer) {
      return (
        <div className={getCardClassName()} style={getCardStyle(true)}>
          <div style={styles.rowMain}>
            <h4 style={styles.rowTitle}>{renderTitle()}</h4>
            <div style={styles.rowMeta}>{renderMeta()}</div>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '12px', margin: 0 }}>
            Expanded view coming soon for {type}
          </p>
        </div>
      )
  }

  // Default fallback - should not reach here
  return null
}

export default GameCard
