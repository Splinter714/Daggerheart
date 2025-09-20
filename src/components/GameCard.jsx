import React, { useState, useCallback, useEffect } from 'react'
import { Droplet, Activity, CheckCircle, X, Hexagon, Triangle, Gem, Star, Locate, Tag } from 'lucide-react'

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
    padding: '12px',
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
    fontSize: '12px',
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
  type, // 'adversary', 'environment'
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
    
    if (type === 'countdown' && (item.value || 0) >= item.max) {
      cardStyle = { ...cardStyle, ...styles.cardAtMax }
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
      const duplicateNumber = item.duplicateNumber || (item.name?.match(/\((\d+)\)$/) ? parseInt(item.name.match(/\((\d+)\)$/)[1]) : 1)
      
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
    
    if (type === 'environment' && item.tier) {
      badges.push(
        <span key="tier" style={{ ...styles.badge, ...styles.tierBadge }}>
          Tier {item.tier}
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
          padding: '12px',
          flexShrink: 0,
          backgroundColor: 'var(--bg-card)',
          borderRadius: '8px 8px 0 0',
          position: 'relative',
          zIndex: isDead ? 1 : 'auto',
          borderBottomColor: isSelected ? 'var(--purple)' : 'var(--border)'
        }}>
          {/* Centered Name Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
            zIndex: isDead ? 1 : 'auto'
          }}>
            <h4 style={{
              ...styles.rowTitle,
              color: isDead ? 'color-mix(in srgb, var(--gray-400) 80%, transparent)' : styles.rowTitle.color,
              textAlign: 'center',
              margin: 0
            }}>
              {item.name?.replace(/\s+\(\d+\)$/, '') || item.name}
            </h4>
          </div>
        </div>

        {/* Expandable Content Section */}
        <div style={{
          padding: '12px',
          borderRadius: '0 0 8px 8px'
        }}>




        {/* Core Stats Section */}
        <div style={{
          marginBottom: '1rem',
          padding: '0 0 0.75rem 0',
          borderBottom: '1px solid var(--border)'
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            fontSize: '0.875rem'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              flexWrap: 'wrap'
            }}>
              {/* Difficulty Hex Badge */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <div style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '32px',
                  height: '32px'
                }}>
                  <Hexagon 
                    size={32} 
                    style={{ 
                      color: 'var(--text-primary)',
                      transform: 'rotate(0deg)'
                    }} 
                  />
                  <span style={{
                    position: 'absolute',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    textAlign: 'center'
                  }}>
                    {item.difficulty || '~'}
                  </span>
                </div>
                <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                  Difficulty
                </span>
              </div>
            </div>
            {(item.atk !== undefined || item.weapon || item.damage) && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                flexWrap: 'wrap'
              }}>
                {item.atk !== undefined && (
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
                    <span style={{
                      position: 'absolute',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: 'white',
                      pointerEvents: 'none'
                    }}>
                      {item.atk >= 0 ? '+' : ''}{item.atk}
                    </span>
                  </div>
                )}
                {item.weapon && (
                  <span><strong>{item.weapon}:</strong> {item.range || 'Melee'}</span>
                )}
                {item.damage && (
                  <span><strong>Damage:</strong> {item.damage}</span>
                )}
              </div>
            )}
            {item.experience && item.experience.length > 0 && (
              <div>
                <strong>Experience:</strong> {item.experience.map(exp => 
                  typeof exp === 'string' ? exp : `${exp.name} ${exp.modifier >= 0 ? '+' : ''}${exp.modifier}`
                ).join(', ')}
              </div>
            )}
          </div>
        </div>


        {/* Features Section - Organized by Type */}
        {item.features && item.features.length > 0 && (
          <div style={{
            marginBottom: '1rem'
          }}>
            {/* Passives */}
            {item.features.filter(f => f.type === 'Passive').length > 0 && (
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
                  {item.features.filter(f => f.type === 'Passive').map((feature, index) => (
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
                  ))}
                </div>
              </div>
            )}


            {/* Actions */}
            {item.features.filter(f => f.type === 'Action').length > 0 && (
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
                  {item.features.filter(f => f.type === 'Action').map((feature, index) => {
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
                  })}
                </div>
              </div>
            )}

            {/* Reactions */}
            {item.features.filter(f => f.type === 'Reaction').length > 0 && (
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
                  {item.features.filter(f => f.type === 'Reaction').map((feature, index) => (
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
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        </div>

        {/* Damage Thresholds Section - Hidden for Minions */}
        {item.type !== 'Minion' && item.thresholds && (
          <div style={{
            marginTop: '1rem',
            padding: '0.75rem 0',
            borderTop: '1px solid var(--border)'
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
        )}

        {/* Condensed Cards for All Instances - At Bottom */}
        {instances && instances.length > 0 && (
          <div style={{
            marginTop: '1rem',
            borderTop: '1px solid var(--border)'
          }}>
            {instances.map((instance, index) => (
              <div key={instance.id}>
                <div
                  key={instance.id}
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    borderRadius: '4px',
                    padding: '8px',
                    border: '1px solid var(--border)',
                    marginBottom: '4px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  {/* Left side - Number section */}
                  <div style={{
                    backgroundColor: 'var(--bg-secondary)',
                    borderRadius: '3px',
                    padding: '2px 6px',
                    border: '1px solid var(--border)',
                    minWidth: '24px',
                    textAlign: 'center'
                  }}>
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: 'var(--text-primary)'
                    }}>
                      {instance.duplicateNumber || instance.name?.match(/\((\d+)\)/)?.[1] || '1'}
                    </span>
                  </div>

                  {/* Center - HP and Stress pips */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '2px',
                    flex: 1
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
                            <Droplet size={12} />
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
                              <Activity size={12} />
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Motives Section */}
        {item.motives && (
          <div style={{
            marginTop: '1rem',
            padding: '0.75rem 0',
            borderTop: '1px solid var(--border)'
          }}>
            <h3 style={{
              fontSize: '1rem',
              fontWeight: 600,
              color: 'var(--text-primary)',
              margin: '0 0 0.5rem 0'
            }}>
              Motives
            </h3>
            {isEditMode ? (
              <textarea
                style={{
                  width: '100%',
                  minHeight: '80px',
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
                value={item.motives}
                onChange={(e) => {
                  onUpdate && onUpdate(item.id, { motives: e.target.value })
                }}
                placeholder="Enter adversary motives..."
              />
            ) : (
              <p style={{
                fontSize: '0.875rem',
                lineHeight: 1.5,
                color: 'var(--text-secondary)',
                margin: 0,
                whiteSpace: 'pre-wrap'
              }}>
                {item.motives}
              </p>
            )}
          </div>
        )}

        {/* Description Section */}
        {item.description && (
          <div style={{
            marginTop: '1rem',
            padding: '0.75rem 0',
            borderTop: '1px solid var(--border)'
          }}>
            <h3 style={{
              fontSize: '1rem',
              fontWeight: 600,
              color: 'var(--text-primary)',
              margin: '0 0 0.5rem 0'
            }}>
              Description
            </h3>
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
              <p style={{
                fontSize: '0.875rem',
                lineHeight: 1.5,
                color: 'var(--text-secondary)',
                margin: 0,
                whiteSpace: 'pre-wrap'
              }}>
                {item.description}
              </p>
            )}
          </div>
        )}

        {/* Damage Input Popup for Adversaries */}
        {renderDamageInput()}
      </div>
    )
  }

  // ============================================================================
  // EXPANDED ENVIRONMENT RENDERER
  // ============================================================================

  const renderExpandedEnvironment = () => {
    const showDrag = false // Temporarily disabled drag handles
    const isEditMode = mode === 'edit'

    return (
      <div 
        className={getCardClassName()}
        style={{
          ...getCardStyle(true),
          padding: 0,
          minHeight: '400px',
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
        {/* Fixed Header Section - Similar to Adversary View */}
        <div className="border-b" style={{
          padding: '12px',
          flexShrink: 0,
          backgroundColor: 'var(--bg-card)',
          borderRadius: '8px 8px 0 0',
          position: 'relative'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            {/* Left side - Name, Type, and Tier */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: '0.25rem'
            }}>
              <h2 style={{
                fontSize: '1rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
                margin: 0
              }}>
                {item.name}
              </h2>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}>
                {item.tier && (
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    color: 'var(--text-secondary)',
                    letterSpacing: '0.5px'
                  }}>
                    Tier {item.tier}
                  </span>
                )}
                {item.type && (
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    color: 'var(--text-secondary)',
                    letterSpacing: '0.5px'
                  }}>
                    {item.type}
                  </span>
                )}
              </div>
            </div>

            {/* Right side - Difficulty and Delete */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              {/* Difficulty Badge */}
              {item.difficulty && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative'
                }}>
                  <Hexagon 
                    size={32}
                    strokeWidth={1}
                    style={{
                      color: 'var(--text-secondary)'
                    }}
                  />
                  <span style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: 'white',
                    pointerEvents: 'none'
                  }}>
                    {item.difficulty}
                  </span>
                </div>
              )}

              {/* Delete Button */}
              {showDrag && (
                <button
                  className="border rounded-sm"
                  style={{
                    background: 'var(--red)',
                    borderColor: 'var(--red)',
                    padding: '0.25rem',
                    minWidth: '1.5rem',
                    height: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.1s ease',
                    color: 'white',
                    fontSize: '1rem'
                  }}
                  onClick={(e) => {
                    e.stopPropagation()
                    e.preventDefault()
                    onDelete && onDelete(item.id)
                  }}
                  onMouseEnter={(e) => e.target.style.background = 'var(--red-dark)'}
                  onMouseLeave={(e) => e.target.style.background = 'var(--red)'}
                  title="Delete environment"
                >
                  ×
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '12px',
          borderRadius: '0 0 8px 8px'
        }}>
          {/* Description Section */}
          {item.description && (
            <div style={{
              marginBottom: '1rem',
              padding: '0 0 0.75rem 0',
              borderBottom: '1px solid var(--border)'
            }}>
              <h3 style={{
                fontSize: '1rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
                margin: '0 0 0.5rem 0'
              }}>
                Description
              </h3>
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
                  placeholder="Enter environment description..."
                />
              ) : (
                <p style={{
                  fontSize: '0.875rem',
                  lineHeight: 1.5,
                  color: 'var(--text-secondary)',
                  margin: 0,
                  whiteSpace: 'pre-wrap'
                }}>
                  {item.description}
                </p>
              )}
            </div>
          )}

          {/* Impulses Section */}
          {item.impulses && (
            <div style={{
              marginBottom: '1rem',
              padding: '0 0 0.75rem 0',
              borderBottom: '1px solid var(--border)'
            }}>
              <h3 style={{
                fontSize: '1rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
                margin: '0 0 0.5rem 0'
              }}>
                Impulses
              </h3>
              <p style={{
                fontSize: '0.875rem',
                lineHeight: 1.5,
                color: 'var(--text-secondary)',
                margin: 0,
                whiteSpace: 'pre-wrap'
              }}>
                {item.impulses}
              </p>
            </div>
          )}

          {/* Core Stats Section */}
          <div style={{
            marginBottom: '1rem',
            padding: '0 0 0.75rem 0',
            borderBottom: '1px solid var(--border)'
          }}>
            <h3 style={{
              fontSize: '1rem',
              fontWeight: 600,
              color: 'var(--text-primary)',
              margin: '0 0 0.5rem 0'
            }}>
              Core Stats
            </h3>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              fontSize: '0.875rem'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                flexWrap: 'wrap',
                fontSize: '0.875rem'
              }}>
                {/* Difficulty Hex Badge */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <div style={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '32px',
                    height: '32px'
                  }}>
                    <Hexagon 
                      size={32} 
                      style={{ 
                        color: 'var(--text-primary)',
                        transform: 'rotate(0deg)'
                      }} 
                    />
                    <span style={{
                      position: 'absolute',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      textAlign: 'center'
                    }}>
                      {item.difficulty || '~'}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                    Difficulty
                  </span>
                </div>
                <span><strong>Type:</strong> {item.type}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span><strong>Tier:</strong></span>
                  {/* Tier in Star */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative'
                  }}>
                    <Star 
                      size={32} 
                      strokeWidth={1}
                      style={{
                        color: 'var(--text-secondary)'
                      }}
                    />
                    <span style={{
                      position: 'absolute',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: 'white',
                      pointerEvents: 'none'
                    }}>
                      {item.tier}
                    </span>
                  </div>
                </div>
              </div>
              {item.potentialAdversaries && item.potentialAdversaries.length > 0 && (
                <div>
                  <strong>Potential Adversaries:</strong>
                  <div style={{
                    marginTop: '0.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.125rem'
                  }}>
                    {item.potentialAdversaries.map((adversary, index) => (
                      <div key={index} style={{
                        fontSize: '0.75rem',
                        color: 'var(--text-secondary)',
                        marginLeft: '0.5rem'
                      }}>
                        • {adversary}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Features Section - Organized by Type */}
          {item.features && item.features.length > 0 && (
            <div style={{
              marginBottom: '1rem'
            }}>
              {/* Passives */}
              {item.features.filter(f => f.type === 'Passive').length > 0 && (
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
                    gap: '0.75rem'
                  }}>
                    {item.features.filter(f => f.type === 'Passive').map((feature, index) => (
                      <div key={index} style={{
                        fontSize: '0.875rem',
                        lineHeight: 1.4,
                        color: 'var(--text-secondary)'
                      }}>
                        <div style={{ 
                          fontWeight: 600, 
                          color: 'white',
                          marginBottom: '0.25rem'
                        }}>
                          {feature.name}
                        </div>
                        <div style={{ marginBottom: '0.25rem' }}>
                          {feature.description}
                        </div>
                        {feature.details && feature.details.length > 0 && (
                          <div style={{ marginLeft: '0.5rem' }}>
                            <strong>Details:</strong>
                            <ul style={{ 
                              margin: '0.25rem 0 0 0', 
                              paddingLeft: '1rem',
                              fontSize: '0.75rem'
                            }}>
                              {feature.details.map((detail, detailIndex) => (
                                <li key={detailIndex}>{detail}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {feature.prompts && feature.prompts.length > 0 && (
                          <div style={{ marginLeft: '0.5rem' }}>
                            <strong>Prompts:</strong>
                            <ul style={{ 
                              margin: '0.25rem 0 0 0', 
                              paddingLeft: '1rem',
                              fontSize: '0.75rem'
                            }}>
                              {feature.prompts.map((prompt, promptIndex) => (
                                <li key={promptIndex} style={{ fontStyle: 'italic' }}>
                                  "{prompt}"
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              {item.features.filter(f => f.type === 'Action').length > 0 && (
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
                    gap: '0.75rem'
                  }}>
                    {item.features.filter(f => f.type === 'Action').map((feature, index) => (
                      <div key={index} style={{
                        fontSize: '0.875rem',
                        lineHeight: 1.4,
                        color: 'var(--text-secondary)'
                      }}>
                        <div style={{ 
                          fontWeight: 600, 
                          color: 'white',
                          marginBottom: '0.25rem'
                        }}>
                          {feature.name}
                        </div>
                        <div style={{ marginBottom: '0.25rem' }}>
                          {feature.description}
                        </div>
                        {feature.details && feature.details.length > 0 && (
                          <div style={{ marginLeft: '0.5rem' }}>
                            <strong>Details:</strong>
                            <ul style={{ 
                              margin: '0.25rem 0 0 0', 
                              paddingLeft: '1rem',
                              fontSize: '0.75rem'
                            }}>
                              {feature.details.map((detail, detailIndex) => (
                                <li key={detailIndex}>{detail}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {feature.prompts && feature.prompts.length > 0 && (
                          <div style={{ marginLeft: '0.5rem' }}>
                            <strong>Prompts:</strong>
                            <ul style={{ 
                              margin: '0.25rem 0 0 0', 
                              paddingLeft: '1rem',
                              fontSize: '0.75rem'
                            }}>
                              {feature.prompts.map((prompt, promptIndex) => (
                                <li key={promptIndex} style={{ fontStyle: 'italic' }}>
                                  "{prompt}"
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reactions */}
              {item.features.filter(f => f.type === 'Reaction').length > 0 && (
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
                    gap: '0.75rem'
                  }}>
                    {item.features.filter(f => f.type === 'Reaction').map((feature, index) => (
                      <div key={index} style={{
                        fontSize: '0.875rem',
                        lineHeight: 1.4,
                        color: 'var(--text-secondary)'
                      }}>
                        <div style={{ 
                          fontWeight: 600, 
                          color: 'white',
                          marginBottom: '0.25rem'
                        }}>
                          {feature.name}
                        </div>
                        <div style={{ marginBottom: '0.25rem' }}>
                          {feature.description}
                        </div>
                        {feature.details && feature.details.length > 0 && (
                          <div style={{ marginLeft: '0.5rem' }}>
                            <strong>Details:</strong>
                            <ul style={{ 
                              margin: '0.25rem 0 0 0', 
                              paddingLeft: '1rem',
                              fontSize: '0.75rem'
                            }}>
                              {feature.details.map((detail, detailIndex) => (
                                <li key={detailIndex}>{detail}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {feature.prompts && feature.prompts.length > 0 && (
                          <div style={{ marginLeft: '0.5rem' }}>
                            <strong>Prompts:</strong>
                            <ul style={{ 
                              margin: '0.25rem 0 0 0', 
                              paddingLeft: '1rem',
                              fontSize: '0.75rem'
                            }}>
                              {feature.prompts.map((prompt, promptIndex) => (
                                <li key={promptIndex} style={{ fontStyle: 'italic' }}>
                                  "{prompt}"
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            )}



          {/* Condensed Cards for All Instances - At Bottom */}
          {instances && instances.length > 0 && (
            <div style={{
              marginTop: '1rem',
              borderTop: '1px solid var(--border)'
            }}>
              {instances.map((instance, index) => (
                <div key={instance.id}>
                  <div
                    key={instance.id}
        style={{
                      backgroundColor: 'var(--bg-secondary)',
                      borderRadius: '4px',
                      padding: '8px',
                      border: '1px solid var(--border)',
                      marginBottom: '4px',
          display: 'flex',
                      justifyContent: 'space-between',
          alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    {/* Left side - Number section */}
                    <div style={{
                      backgroundColor: 'var(--bg-secondary)',
                      borderRadius: '3px',
                      padding: '2px 6px',
                      border: '1px solid var(--border)',
                      minWidth: '24px',
                      textAlign: 'center'
                    }}>
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                        color: 'var(--text-primary)'
                  }}>
                        {instance.duplicateNumber || instance.name?.match(/\((\d+)\)/)?.[1] || '1'}
                  </span>
            </div>

                    {/* Center - Instance info */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
                      justifyContent: 'center',
                      flex: 1
                    }}>
              <span style={{
                fontSize: '0.75rem',
                fontWeight: 500,
                    color: 'var(--text-secondary)'
                      }}>
                        Instance {index + 1}
                </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
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

  // Render expanded view for environments
  if ((mode === 'expanded' || mode === 'edit') && (type === 'environment' || type === 'environments')) {
    return renderExpandedEnvironment()
  }

  // For unsupported types, show coming soon message
    const hasExpandedRenderer = (type === 'adversary' || type === 'adversaries' || type === 'environment' || type === 'environments')
    
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

