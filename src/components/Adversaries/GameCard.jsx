import React, { useState, useEffect, useRef } from 'react'
import { X, Hexagon, Locate, Check } from 'lucide-react'
import ContainerWithTab from '../Dashboard/ContainerWithTab'
import CustomAdversaryCreator from './CustomAdversaryCreator'
import FeaturesSection from './GameCard/FeaturesSection'
import StandardAttackSection from './GameCard/StandardAttackSection'
import StatusSection from './GameCard/StatusSection'
import DescriptionSection from './GameCard/DescriptionSection'
import TypeTierBadge from './GameCard/TypeTierBadge'
import ExperienceSection from './GameCard/ExperienceSection'
import TabButtons from './GameCard/TabButtons'
import useCardScroll from './GameCard/hooks/useCardScroll'
// ============================================================================
// Reusable Components
// ============================================================================

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
    position: 'relative',
    border: 'none' // Border is handled by ContainerWithTab
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
    fontSize: '0.6875rem',
    fontWeight: '500',
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
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const GameCard = ({
  item,
  type, // 'adversary'
  mode = 'expanded', // 'expanded', 'edit'
  onClick,
  onApplyDamage,
  onApplyHealing,
  onApplyStressChange,
  onUpdate,
  adversaries = [], // All adversaries for duplicate checking
  isSelected = false, // Whether this card is currently selected
  instances = [], // All instances to embed as mini-cards in expanded view
  isEmbedded = false, // Whether this is an embedded card (removes border)
  onAddInstance = null, // Handler for adding an instance
  onRemoveInstance = null, // Handler for removing an instance
  onEdit = null, // Handler for editing this adversary
  showCustomCreator = false, // Show CustomAdversaryCreator instead of normal card content
  onSaveCustomAdversary = null, // Handler for saving custom adversary
  onCancelEdit = null, // Handler for canceling edit
  isStockAdversary = false, // Whether this is a stock adversary (needs Save As)
}) => {
  const { scrollableContentRef } = useCardScroll(instances)
  const nameInputRef = useRef(null) // Ref for name input in edit mode
  const customCreatorRef = useRef(null) // Ref for CustomAdversaryCreator when showCustomCreator is true
  
  // State for two-stage delete functionality
  const [deleteConfirmations, setDeleteConfirmations] = useState({})
  
  // Auto-focus name input when entering edit mode for newly created custom adversary
  useEffect(() => {
    if (showCustomCreator && nameInputRef.current) {
      // Delay to ensure DOM is ready and scroll has completed (scroll animation is 600ms)
      const timeoutId = setTimeout(() => {
        nameInputRef.current?.focus()
        nameInputRef.current?.select() // Select text if any
      }, 650) // Wait for scroll animation to complete
      
      return () => clearTimeout(timeoutId)
    }
  }, [showCustomCreator])
  // Helper function to generate unique keys for feature confirmations
  const getFeatureKey = (feature) => {
    const typeFeatures = (item.features || []).filter(f => f.type === feature.type)
    const featureIndex = typeFeatures.findIndex(f => f === feature)
    return `${feature.type}-${featureIndex}-${feature.name || 'blank'}`
  }
  
  // Helper function to generate unique keys for experience confirmations
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
  // Debug logging removed - selection styling working correctly

  // ============================================================================
  // STYLING LOGIC
  // ============================================================================

  const getCardStyle = (isExpanded = false) => {
    let cardStyle = { ...styles.card }
    
    // Use instant transitions for selection changes
    if (isSelected) {
      cardStyle.transition = 'none' // Instant for selection
    } else {
      cardStyle.transition = styles.transitions.hoverOut
    }
    
    // Remove top margin for expanded cards
    if (isExpanded) {
      const { marginTop: _marginTop, ...cardStyleWithoutMargin } = cardStyle
      cardStyle = cardStyleWithoutMargin
    }
    
    // Apply hover effects when selected
    if (isSelected) {
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
    
    // Apply border hover effect when selected
    if (isSelected) {
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


  // ============================================================================
  // EXPANDED VIEW RENDERERS
  // ============================================================================

  const renderExpandedAdversary = () => {
    const isDead = (item.hp || 0) >= (item.hpMax || 1)
    const isEditMode = effectiveMode === 'edit' || showCustomCreator
    
    // Determine if tab should be shown - always show for adversaries
    const shouldShowTab = (type === 'adversary')
    
    // Build tab content
    const tabContent = shouldShowTab ? (
      <TabButtons
        showCustomCreator={showCustomCreator}
        onSaveCustomAdversary={onSaveCustomAdversary}
        item={item}
        onCancelEdit={onCancelEdit}
        onRemoveInstance={onRemoveInstance}
        onAddInstance={onAddInstance}
        instances={instances}
        onEdit={onEdit}
      />
    ) : null

    return (
      <ContainerWithTab
        tabContent={tabContent}
        showTab={shouldShowTab}
        tabBorderColor={isSelected ? 'var(--purple)' : 'var(--border)'}
        containerBackgroundColor={isDead ? 'var(--gray-900)' : getCardStyle(true).backgroundColor}
        containerBorderColor={isDead ? 'color-mix(in srgb, var(--gray-600) 40%, transparent)' : (isSelected ? 'var(--purple)' : 'var(--border)')}
        containerBorderRadius="8px"
        containerOverflow="hidden"
        containerStyle={{
          padding: 0,
          opacity: isDead ? 0.7 : 1,
          height: 'auto',
          // When tab is visible, reserve space for it (120px for bars + padding)
          // When tab is not visible, add back the tab height (52px) to extend lower
          maxHeight: shouldShowTab ? 'calc(100vh - 120px)' : 'calc(100vh - 68px)',
          minHeight: 0
        }}
      >
      <div 
        className={getCardClassName()}
        style={{
          ...getCardStyle(true),
          padding: 0,
          display: 'flex',
          flexDirection: 'column',
            position: 'relative',
            height: '100%',
            minHeight: 0,
            border: 'none', // Border is handled by ContainerWithTab
            borderRadius: 0 // Border radius is handled by ContainerWithTab
        }}
        onClick={onClick}
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
            flexDirection: 'column',
            position: 'relative',
            zIndex: isDead ? 1 : 'auto',
            padding: '2px',
            gap: 0
          }}>
            {/* Name and Badge row */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            minHeight: '40px'
          }}>
            {isEditMode ? (
              <input
                  ref={nameInputRef}
                type="text"
                value={item.name || ''}
                onChange={(e) => {
                    if (onUpdate && item.id) {
                      onUpdate(item.id, { name: e.target.value })
                    }
                }}
                style={{
                  backgroundColor: 'var(--bg-primary)',
                  border: '1px solid var(--border)',
                  borderRadius: '4px',
                  color: 'var(--text-primary)',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  padding: '0.5rem',
                  width: '100%',
                  maxWidth: '300px',
                  paddingRight: '0.625rem'
                }}
                placeholder="Name"
              />
            ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
            <h4 style={{
              ...styles.rowTitle,
                    color: isDead ? 'color-mix(in srgb, var(--gray-400) 80%, transparent)' : styles.rowTitle.color,
              textAlign: 'left',
              margin: 0,
              fontSize: '1.1rem',
                    paddingRight: '6px',
                    flex: 1
            }}>
              {item.name?.replace(/\s+\(\d+\)$/, '') || item.name}
            </h4>
                </div>
            )}
            
            {/* Combined Type/Tier Badge */}
            {(item.type || item.tier || isEditMode) && (
              <TypeTierBadge
                type={item.type}
                tier={item.tier}
                isEditMode={isEditMode}
                onUpdate={onUpdate}
                itemId={item.id}
              />
            )}
            </div>
          </div>
        </div>

        {/* Expandable Content Section - Scrollable */}
                  <div 
          ref={scrollableContentRef}
          style={{
          borderRadius: '0 0 8px 8px',
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          minHeight: 0 // Allow flex child to shrink below content size
        }}
        className="invisible-scrollbar"
        >





        {/* Motives */}
        {(item.motives || isEditMode) && (
            <div style={{
              padding: '0.5rem 8px',
              textAlign: 'center'
          }}>
            {isEditMode ? (
              <input
                type="text"
                value={item.motives || ''}
                onChange={(e) => onUpdate && onUpdate(item.id, { motives: e.target.value })}
                placeholder="Motives..."
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid var(--border)',
                  borderRadius: '4px',
                  backgroundColor: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  fontSize: '0.875rem',
                  textAlign: 'center'
                }}
              />
            ) : (
                      <div style={{
                fontSize: '0.875rem',
                fontStyle: 'italic',
                color: 'var(--text-secondary)',
                lineHeight: 1.4,
                textAlign: 'center'
              }}>
                {item.motives}{item.motives && !item.motives.endsWith('.') ? '.' : ''}
                    </div>
            )}
                </div>
              )}

        {/* Stats and Experiences - Two Column Layout */}
        {((item.difficulty || item.atk !== undefined || (item.thresholds && item.type !== 'Minion') || (item.experience && item.experience.length > 0)) || isEditMode) && (
          <div style={{
            padding: '0.5rem 8px',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1rem'
          }}>
            {/* Left Column - Stats */}
                <div style={{
              display: 'flex',
              flexDirection: 'column'
            }}>
              {/* Difficulty */}
              {(item.difficulty || isEditMode) && (
                <div style={{
                  position: 'relative',
                  marginBottom: '0.75rem'
                }}>
                  <div style={{
                    position: 'absolute',
                    left: 0,
                    top: '50%',
                    transform: 'translateY(-50%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
            paddingTop: '1px',
                    width: '36px'
                }}>
                    <Hexagon 
                      size={32} 
                    strokeWidth={1}
                    style={{
                        color: 'var(--text-secondary)',
                        transform: 'rotate(0deg)'
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
                          transform: 'translate(-50%, -45%)',
                          backgroundColor: 'transparent',
                          border: 'none',
                          color: 'white',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          width: '20px',
                          height: '20px',
                          textAlign: 'center',
                          outline: 'none'
                        }}
                        maxLength="2"
                      />
                    ) : (
                  <span style={{
                    position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -45%)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: 'white',
                    pointerEvents: 'none'
                  }}>
                        {item.difficulty}
                  </span>
                    )}
                  </div>
                  <div style={{
                    fontSize: '0.875rem',
                    lineHeight: 1.4,
                    color: 'var(--text-secondary)',
                    marginLeft: '44px'
                  }}>
                    Difficulty
                  </div>
                </div>
              )}

              {/* Attack Modifier */}
              {(item.atk !== undefined || isEditMode) && (
                  <div style={{
                  position: 'relative',
                  marginBottom: '0.75rem'
                }}>
                  <div style={{
                    position: 'absolute',
                    left: 0,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
            paddingTop: '1px',
                    width: '36px'
                  }}>
                    <Locate 
                      size={38} 
                      strokeWidth={1}
                      style={{ 
                        color: 'var(--text-secondary)',
                        transform: 'rotate(45deg)'
                      }} 
                    />
                    {isEditMode ? (
                      <input
                        type="text"
                        value={(() => {
                          // If it's a string with dice notation, display as-is
                          if (typeof item.atk === 'string' && item.atk.includes('d')) {
                            return item.atk
                          }
                          // Otherwise, treat as number
                          const atkValue = typeof item.atk === 'string' ? parseInt(item.atk.replace(/[^0-9-]/g, '')) : (item.atk || 0)
                          return atkValue >= 0 ? `+${atkValue}` : atkValue.toString()
                        })()}
                        onChange={(e) => {
                          const value = e.target.value
                          // Allow dice notation (contains 'd') or numeric values
                          if (value.includes('d')) {
                            // Store dice notation as string
                            onUpdate && onUpdate(item.id, { atk: value })
                          } else {
                            // Handle numeric values
                            const cleanValue = value.replace(/[^0-9+-]/g, '')
                            if (cleanValue.length <= 4) {
                              const numericValue = parseInt(cleanValue.replace(/[^0-9-]/g, '')) || 0
                              onUpdate && onUpdate(item.id, { atk: numericValue })
                            }
                          }
                        }}
                        onKeyDown={(e) => {
                          // Only allow arrow key increment/decrement for numeric values
                          if (typeof item.atk === 'string' && item.atk.includes('d')) {
                            return // Don't allow increment/decrement for dice notation
                          }
                          if (e.key === 'ArrowUp') {
                            e.preventDefault()
                            const current = typeof item.atk === 'string' ? parseInt(item.atk.replace(/[^0-9-]/g, '')) : (item.atk || 0)
                            const newValue = current + 1
                            onUpdate && onUpdate(item.id, { atk: newValue })
                          } else if (e.key === 'ArrowDown') {
                            e.preventDefault()
                            const current = typeof item.atk === 'string' ? parseInt(item.atk.replace(/[^0-9-]/g, '')) : (item.atk || 0)
                            const newValue = current - 1
                            onUpdate && onUpdate(item.id, { atk: newValue })
                          }
                        }}
                        style={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -45%)',
                          backgroundColor: 'transparent',
                          border: 'none',
                          color: 'white',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          width: '20px',
                          height: '20px',
                          textAlign: 'center',
                          outline: 'none'
                        }}
                        maxLength="3"
                      />
                    ) : (
                      <span style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -45%)',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        color: 'white',
                        pointerEvents: 'none'
                      }}>
                        {(() => {
                          // If it's a string with dice notation (contains 'd'), display as-is
                          if (typeof item.atk === 'string' && item.atk.includes('d')) {
                            return item.atk
                          }
                          // Otherwise, treat as number
                          const atkValue = typeof item.atk === 'string' ? parseInt(item.atk.replace(/[^0-9-]/g, '')) : item.atk
                          return atkValue >= 0 ? `+${atkValue}` : atkValue
                        })()}
                      </span>
                    )}
                  </div>
                <div style={{
                  fontSize: '0.875rem',
                    lineHeight: 1.4,
                    color: 'var(--text-secondary)',
                    marginLeft: '44px'
                  }}>
                    Attack
                </div>
              </div>
            )}
            
                </div>

            {/* Right Column - Experiences */}
            <ExperienceSection
                              item={item} 
              isEditMode={isEditMode}
                              onUpdate={onUpdate}
                              deleteConfirmations={deleteConfirmations}
              setDeleteConfirmations={setDeleteConfirmations}
            />
                        </div>
                      )}
        <StandardAttackSection item={item} isEditMode={isEditMode} onUpdate={onUpdate} />

        <FeaturesSection
                              item={item} 
          isEditMode={isEditMode}
                              onUpdate={onUpdate}
                              handleFeatureDeleteClick={handleFeatureDeleteClick}
                              deleteConfirmations={deleteConfirmations}
                              getFeatureKey={getFeatureKey}
                            />

        <StatusSection
                              item={item} 
          instances={instances}
          isEditMode={isEditMode}
          type={type}
                              onUpdate={onUpdate}
          onApplyDamage={onApplyDamage}
          onApplyHealing={onApplyHealing}
          onApplyStressChange={onApplyStressChange}
        />

        <DescriptionSection item={item} isEditMode={isEditMode} mode={mode} onUpdate={onUpdate} />

            </div>

      </div>
      </ContainerWithTab>
    )
  }

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  // When showCustomCreator is true, render CustomAdversaryCreator instead
  if (showCustomCreator && (type === 'adversary' || type === 'adversaries')) {
    const shouldShowTab = (type === 'adversary')
    
    const tabContent = shouldShowTab ? (
      // Tab buttons: Save and Cancel
      <>
        <button
          onClick={(e) => {
            e.stopPropagation()
            if (customCreatorRef.current?.handleSave) {
              customCreatorRef.current.handleSave()
            }
          }}
          style={{
            background: 'var(--purple)',
            border: '1px solid var(--purple)',
            color: 'white',
            borderRadius: '4px',
            padding: '0.375rem 0.75rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.375rem',
            fontSize: '0.875rem',
            fontWeight: '500',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '0.9'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '1'
          }}
          title="Save"
        >
          <Check size={16} />
          <span>Save</span>
        </button>
        {onCancelEdit && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onCancelEdit()
            }}
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
              borderRadius: '4px',
              padding: '0.375rem 0.75rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.375rem',
              fontSize: '0.875rem',
              fontWeight: '500',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-hover)'
              e.currentTarget.style.borderColor = 'var(--purple)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'
              e.currentTarget.style.borderColor = 'var(--border)'
            }}
            title="Cancel"
          >
            <X size={16} />
            <span>Cancel</span>
          </button>
        )}
      </>
    ) : null

    return (
      <ContainerWithTab
        tabContent={tabContent}
        containerStyle={{
          padding: 0,
          height: 'auto',
          maxHeight: shouldShowTab ? 'calc(100vh - 120px)' : 'calc(100vh - 68px)',
          minHeight: 0
        }}
      >
        <CustomAdversaryCreator
          ref={customCreatorRef}
          editingAdversary={item}
          onSave={onSaveCustomAdversary}
          onCancelEdit={onCancelEdit}
          isStockAdversary={isStockAdversary}
          embedded={true}
          hideEmbeddedButtons={true} // Hide embedded buttons, use tab buttons instead
          allAdversaries={adversaries}
          autoFocus={!item.baseName || item.baseName.trim() === '' || item.baseName === 'Unknown'} // Auto-focus when creating new (empty baseName)
        />
      </ContainerWithTab>
    )
  }

  // When showCustomCreator is true, use edit mode instead
  // This eliminates the double container issue
  const effectiveMode = showCustomCreator ? 'edit' : mode

  // Render expanded view for adversaries
  if ((effectiveMode === 'expanded' || effectiveMode === 'edit') && (type === 'adversary' || type === 'adversaries')) {
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
