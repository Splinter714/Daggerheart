import React, { useState, useCallback, useEffect, useLayoutEffect, useRef } from 'react'
import { Droplet, Activity, CheckCircle, X, Hexagon, Triangle, Gem, Star, Locate, Tag, Diamond, Shield, Circle, Skull, Plus, Minus, Pencil, Check } from 'lucide-react'
import Pips from './Pips'
import ContainerWithTab from './ContainerWithTab'

// Reusable Threshold Tag Component
const ThresholdTag = ({ value }) => (
  <div style={{
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '44px',
    height: '32px',
    zIndex: 3
  }}>
    <svg 
      width="40" 
      height="32" 
      viewBox="0 0 40 32" 
      fill="var(--bg-primary)" 
      stroke="var(--text-secondary)" 
      strokeWidth="1" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      style={{
        position: 'absolute',
        zIndex: 1
      }}
    >
      <path d="M2 2h28l6 14-6 14H2l6-14-6-14z"/>
    </svg>
    <span style={{
      position: 'absolute',
      fontSize: '0.8rem',
      fontWeight: 500,
      color: 'var(--text-primary)',
      textAlign: 'center',
      zIndex: 2,
      left: '50%',
      top: '50%',
      transform: 'translate(-50%, -50%)'
    }}>
      {value}
    </span>
  </div>
)

// Combined Type/Tier Badge Component with Custom SVG
const CombinedTypeTierBadge = ({ type, tier, isEditMode, onUpdate, itemId }) => {
  // Calculate width based on actual text content width
  const getTextWidth = (text) => {
    if (!text) return 0
    // Create a temporary canvas to measure text width
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    context.font = '600 11px system-ui, -apple-system, sans-serif' // Use px instead of rem
    const width = context.measureText(text.toUpperCase()).width
    return width
  }
  
  const textWidth = getTextWidth(type)
  const leftPadding = 4
  const rightPadding = 18 // Fixed right padding to clear diamond
  const typeWidth = Math.max(50, textWidth + leftPadding + rightPadding)
  const totalWidth = typeWidth + 15 // Slightly reduced from 20 to 15
  
  
  if (isEditMode) {
    return (
      <div style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        height: '32px'
      }}>
        {/* Type Select */}
        <select
          value={type || ''}
          onChange={(e) => {
            onUpdate && onUpdate(itemId, { type: e.target.value })
          }}
          style={{
            backgroundColor: 'var(--bg-primary)',
            border: '1px solid var(--text-secondary)',
            color: 'var(--text-primary)',
            fontSize: '0.6875rem',
            fontWeight: '500',
            textTransform: 'uppercase',
            outline: 'none',
            borderRadius: '4px',
            padding: '4px 8px',
            width: '95px',
            height: '24px'
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
        
        {/* Tier Input */}
        <div style={{
          position: 'relative',
          width: '24px',
          height: '24px'
        }}>
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%) rotate(45deg)',
            width: '20px',
            height: '20px',
            backgroundColor: 'var(--bg-primary)',
            border: '1px solid var(--text-secondary)',
            borderRadius: '2px'
          }} />
          <input
            type="text"
            value={tier || ''}
            onChange={(e) => {
              const value = e.target.value.replace(/[^1-4]/g, '')
              if (value.length <= 1) {
                onUpdate && onUpdate(itemId, { tier: value === '' ? '' : parseInt(value) })
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'ArrowUp') {
                e.preventDefault()
                const current = parseInt(tier) || 1
                onUpdate && onUpdate(itemId, { tier: Math.min(current + 1, 4) })
              } else if (e.key === 'ArrowDown') {
                e.preventDefault()
                const current = parseInt(tier) || 1
                onUpdate && onUpdate(itemId, { tier: Math.max(current - 1, 1) })
              }
            }}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              backgroundColor: 'transparent',
              border: 'none',
              color: 'var(--text-primary)',
              fontSize: '0.8rem',
              fontWeight: 600,
              width: '24px',
              height: '24px',
              textAlign: 'center',
              outline: 'none',
              zIndex: 1
            }}
            maxLength="1"
          />
        </div>
      </div>
    )
  }

  return (
    <div style={{
      position: 'relative',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '32px',
      width: `${totalWidth}px`
    }}>
      {/* Custom SVG Badge */}
      <svg 
        width={totalWidth} 
        height="32" 
        viewBox={`0 0 ${totalWidth} 32`}
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 1
        }}
      >
        {/* Rectangle background - extends behind diamond but stops at diamond's center */}
        <rect 
          x="1" 
          y="6" 
          width={typeWidth - 1} 
          height="20" 
          fill="var(--bg-primary)" 
          stroke="var(--text-secondary)" 
          strokeWidth="1" 
          rx="4"
          ry="4"
        />
        {/* Diamond - rounded rectangle rotated 45 degrees */}
        <rect 
          x={typeWidth - 10} 
          y="6" 
          width="20" 
          height="20" 
          fill="var(--bg-primary)" 
          stroke="var(--text-secondary)" 
          strokeWidth="1"
          rx="2"
          ry="2"
          transform={`rotate(45 ${typeWidth - 1} 16)`}
        />
      </svg>
      
      {/* Type Text */}
      <span style={{
        position: 'absolute',
        top: '50%',
        left: '4px',
        transform: 'translateY(-50%)',
        fontSize: '0.6875rem',
        fontWeight: '500',
        textTransform: 'uppercase',
        color: 'var(--text-primary)',
        zIndex: 2,
        pointerEvents: 'none'
      }}>
        {type}
      </span>
      
      {/* Tier Text */}
      <span style={{
        position: 'absolute',
        top: '50%',
        left: `${typeWidth - 0.5}px`,
        transform: 'translate(-50%, -50%)',
        fontSize: '0.8rem',
        fontWeight: 600,
        color: 'white',
        zIndex: 2,
        pointerEvents: 'none',
        textAlign: 'center',
        lineHeight: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '20px',
        height: '20px'
      }}>
        {tier}
      </span>
    </div>
  )
}

// ============================================================================
// Reusable Components
// ============================================================================

// Reorder Controls Component
const ReorderControls = ({ feature, featureType, item, onUpdate, handleFeatureDeleteClick, deleteConfirmations, getFeatureKey }) => {
  const handleUpClick = () => {
    try {
      const features = item?.features || []
      const newFeatures = [...features]
      const typeFeatures = newFeatures.filter(f => f.type === featureType)
      const currentIndex = typeFeatures.findIndex(f => f === feature)
      if (currentIndex > 0 && currentIndex < typeFeatures.length) {
        // Find indices in the full array
        const currentFeature = typeFeatures[currentIndex]
        const previousFeature = typeFeatures[currentIndex - 1]
        
        if (currentFeature && previousFeature) {
          const sourceIndex = newFeatures.findIndex(f => f === currentFeature)
          const targetIndex = newFeatures.findIndex(f => f === previousFeature)
          
          if (sourceIndex >= 0 && targetIndex >= 0) {
            // Swap the features
            newFeatures[sourceIndex] = previousFeature
            newFeatures[targetIndex] = currentFeature
            
            onUpdate && onUpdate(item.id, { features: newFeatures })
          }
        }
      }
    } catch (error) {
      console.error(`Error in ${featureType.toLowerCase()} up button:`, error)
    }
  }

  const handleDownClick = () => {
    try {
      const features = item?.features || []
      const newFeatures = [...features]
      const typeFeatures = newFeatures.filter(f => f.type === featureType)
      const currentIndex = typeFeatures.findIndex(f => f === feature)
      if (currentIndex < typeFeatures.length - 1 && currentIndex >= 0) {
        // Find indices in the full array
        const currentFeature = typeFeatures[currentIndex]
        const nextFeature = typeFeatures[currentIndex + 1]
        
        if (currentFeature && nextFeature) {
          const sourceIndex = newFeatures.findIndex(f => f === currentFeature)
          const targetIndex = newFeatures.findIndex(f => f === nextFeature)
          
          if (sourceIndex >= 0 && targetIndex >= 0) {
            // Swap the features
            newFeatures[sourceIndex] = nextFeature
            newFeatures[targetIndex] = currentFeature
            
            onUpdate && onUpdate(item.id, { features: newFeatures })
          }
        }
      }
    } catch (error) {
      console.error(`Error in ${featureType.toLowerCase()} down button:`, error)
    }
  }

  // Generate base filtering expression
  const filterExpr = f => f.type === featureType
  const filterExprWithName = f => f.type === featureType && f.name.trim()
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', alignSelf: 'stretch' }}>
      <button
        onClick={handleUpClick}
        disabled={(item.features || []).filter(filterExpr).findIndex(f => f === feature) === 0}
        tabIndex="-1"
        style={{
          width: '22px',
          height: '22px',
          padding: '0',
          border: '1px solid var(--border)',
          borderRadius: '3px',
          backgroundColor: 'var(--gray-700)',
          color: ((item.features || []).filter(filterExprWithName).length >= 2 && 
                   (item.features || []).filter(filterExpr).findIndex(f => f === feature) !== 0 &&
                   feature.name.trim()) 
                 ? 'white' : 'var(--text-secondary)',
          cursor: ((item.features || []).filter(filterExprWithName).length >= 2 && 
                    (item.features || []).filter(filterExpr).findIndex(f => f === feature) !== 0 &&
                    feature.name.trim())
                 ? 'pointer' : 'not-allowed',
          fontSize: '14px',
          lineHeight: '1',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '22px',
          maxHeight: '22px'
        }}>
        ↑
      </button>

      {/* Delete Button */}
      <button
        onClick={() => handleFeatureDeleteClick(feature)}
        disabled={!feature.name.trim() && !feature.description.trim()}
        style={{
          width: '22px',
          height: '22px',
          padding: '0',
          border: '1px solid var(--border)',
          borderRadius: '3px',
          backgroundColor: deleteConfirmations[getFeatureKey(feature)] ? 'var(--danger)' : 'var(--gray-700)',
          color: (!feature.name.trim() && !feature.description.trim()) ? 'var(--text-secondary)' : 'white',
          cursor: (!feature.name.trim() && !feature.description.trim()) ? 'not-allowed' : 'pointer',
          opacity: (!feature.name.trim() && !feature.description.trim()) ? 0.5 : 1,
          fontWeight: '600',
          fontSize: '12px',
          lineHeight: '1',
          transition: 'background-color 0.2s',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '22px',
          maxHeight: '22px'
        }}
      >
        ×
      </button>

      <button
        onClick={handleDownClick}
        disabled={(item.features || []).filter(filterExpr).findIndex(f => f === feature) === (item.features || []).filter(filterExpr).length - 1}
        style={{
          width: '22px',
          height: '22px',
          padding: '0',
          border: '1px solid var(--border)',
          borderRadius: '3px',
          backgroundColor: 'var(--gray-700)',
          color: ((item.features || []).filter(filterExprWithName).length >= 2 && 
                   (item.features || []).filter(filterExpr).findIndex(f => f === feature) < (item.features || []).filter(filterExpr).length - 1 &&
                   (item.features || []).filter(filterExpr)[(item.features || []).filter(filterExpr).findIndex(f => f === feature) + 1]?.name.trim() &&
                   feature.name.trim())
                 ? 'white' : 'var(--text-secondary)',
          cursor: ((item.features || []).filter(filterExprWithName).length >= 2 && 
                    (item.features || []).filter(filterExpr).findIndex(f => f === feature) < (item.features || []).filter(filterExpr).length - 1 &&
                    (item.features || []).filter(filterExpr)[(item.features || []).filter(filterExpr).findIndex(f => f === feature) + 1]?.name.trim() &&
                    feature.name.trim())
                 ? 'pointer' : 'not-allowed',
          fontSize: '14px',
          lineHeight: '1',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '22px',
          maxHeight: '22px'
        }}>
        ↓
      </button>
    </div>
  )
}

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
  showAddRemoveButtons = false, // Show +/- buttons when browser is open
  onAddInstance = null, // Handler for adding an instance
  onRemoveInstance = null, // Handler for removing an instance
  onEdit = null, // Handler for editing this adversary
  showCustomCreator = false, // Show CustomAdversaryCreator instead of normal card content
  onSaveCustomAdversary = null, // Handler for saving custom adversary
  onCancelEdit = null, // Handler for canceling edit
  isStockAdversary = false, // Whether this is a stock adversary (needs Save As)
}) => {
  // Ref for the scrollable content container
  const scrollableContentRef = useRef(null)
  const previousInstancesLengthRef = useRef(instances.length)
  const previousScrollHeightRef = useRef(null)
  const previousScrollTopRef = useRef(null)
  const scrollAnimationFrameRef = useRef(null) // Track ongoing scroll animation
  const temporaryPaddingRef = useRef(null) // Ref for temporary padding spacer
  const [temporaryPaddingHeight, setTemporaryPaddingHeight] = useState(0) // Height of temporary padding
  
  // Track scroll state continuously
  useEffect(() => {
    const scrollContainer = scrollableContentRef.current
    if (!scrollContainer) return
    
    const updateScrollState = () => {
      previousScrollHeightRef.current = scrollContainer.scrollHeight
      previousScrollTopRef.current = scrollContainer.scrollTop
    }
    
    // Update on scroll
    scrollContainer.addEventListener('scroll', updateScrollState, { passive: true })
    
    // Also update periodically to catch any programmatic changes
    const interval = setInterval(updateScrollState, 100)
    
    // MutationObserver removed - useLayoutEffect handles scroll animations now
    
    return () => {
      scrollContainer.removeEventListener('scroll', updateScrollState)
      clearInterval(interval)
    }
  }, [])
  
  // Capture scroll state before instances change (cleanup runs before next effect)
  useEffect(() => {
    return () => {
      // This cleanup runs before the next effect, so we capture state before DOM update
      if (scrollableContentRef.current) {
        previousScrollHeightRef.current = scrollableContentRef.current.scrollHeight
        previousScrollTopRef.current = scrollableContentRef.current.scrollTop
      }
    }
  }, [instances.length, instances])
  
  // State for two-stage delete functionality
  const [deleteConfirmations, setDeleteConfirmations] = useState({})
  
  // Smooth scroll when instances are added or removed
  // DISABLED: No automatic vertical scrolling when instances are added/removed
  useLayoutEffect(() => {
    const currentLength = instances.length
    const previousLength = previousInstancesLengthRef.current
    
    // Update ref but don't perform any scrolling
    previousInstancesLengthRef.current = currentLength
    return
    
    if (currentLength !== previousLength && scrollableContentRef.current) {
      // Use the stored previous scroll state (captured in cleanup before DOM update)
      const oldScrollHeight = previousScrollHeightRef.current
      const oldScrollTop = previousScrollTopRef.current
      
      if (!oldScrollHeight || oldScrollTop === null) {
        // Fallback if state wasn't captured
        previousInstancesLengthRef.current = currentLength
        return
      }
      
      const scrollContainer = scrollableContentRef.current
      const newScrollHeight = scrollContainer.scrollHeight
      const clientHeight = scrollContainer.clientHeight
      
      // Handle instance removal with smooth scroll
      if (currentLength < previousLength) {
        // Instance removed
        const oldMaxScroll = oldScrollHeight - clientHeight
        const wasAtBottom = oldScrollTop >= oldMaxScroll - 10 // Within 10px of bottom
        
        if (wasAtBottom && newScrollHeight > clientHeight) {
          // Cancel any ongoing animation from previous removal
          if (scrollAnimationFrameRef.current) {
            cancelAnimationFrame(scrollAnimationFrameRef.current)
            scrollAnimationFrameRef.current = null
          }
          
          // Calculate height difference - this is the space we need to maintain
          // If there's already temporary padding, we need to account for it
          // The oldScrollHeight might include the padding, so we need to subtract it
          const existingPadding = temporaryPaddingHeight
          const actualOldHeight = oldScrollHeight - existingPadding
          const heightDifference = actualOldHeight - newScrollHeight
          
          // Add temporary padding to maintain scrollable space
          // If there's existing padding, add to it (for rapid removals)
          setTemporaryPaddingHeight(existingPadding + heightDifference)
          
          // Wait for padding to be applied, then animate
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              if (!scrollContainer) return
              
              // Calculate the scroll position we should be at
              // oldScrollTop was relative to oldScrollHeight (which may have included existing padding)
              // We want to maintain the same visual position
              // If there was existing padding, oldScrollHeight included it, so oldScrollTop is already correct
              // We just need to use oldScrollTop directly since the padding maintains the same scrollHeight
              const newPadding = existingPadding + heightDifference
              
              // Restore old scroll position (padding maintains the height, so position stays the same)
              scrollContainer.scrollTop = oldScrollTop
              void scrollContainer.offsetHeight
              
              // Calculate target scroll position (new bottom without padding)
              const targetScroll = newScrollHeight - clientHeight
              const currentScroll = scrollContainer.scrollTop
              const distance = targetScroll - currentScroll
              
              // Only animate if there's meaningful distance to travel
              if (Math.abs(distance) > 0.5) {
                const duration = 400
                const startTime = performance.now()
                const startScroll = currentScroll
                
                const animateScroll = (currentTime) => {
                  if (!scrollContainer) {
                    scrollAnimationFrameRef.current = null
                    return
                  }
                  
                  const elapsed = currentTime - startTime
                  const progress = Math.min(elapsed / duration, 1)
                  
                  // Optimized easing calculation
                  const oneMinusProgress = 1 - progress
                  const easeOut = 1 - (oneMinusProgress * oneMinusProgress * oneMinusProgress)
                  
                  // Target is the new bottom (without padding)
                  const currentTarget = targetScroll
                  const currentDistance = currentTarget - startScroll
                  const newScroll = startScroll + (currentDistance * easeOut)
                  
                  scrollContainer.scrollTop = newScroll
                  
                  if (progress < 1) {
                    scrollAnimationFrameRef.current = requestAnimationFrame(animateScroll)
                  } else {
                    scrollContainer.scrollTop = currentTarget
                    scrollAnimationFrameRef.current = null
                    // Remove temporary padding after animation completes
                    setTemporaryPaddingHeight(0)
                  }
                }
                
                scrollAnimationFrameRef.current = requestAnimationFrame(animateScroll)
              } else {
                // No distance to travel, just remove padding
                setTemporaryPaddingHeight(0)
              }
            })
          })
        }
      } else if (currentLength > previousLength) {
        // Instance added: scroll to bottom
        const targetScroll = newScrollHeight - clientHeight
        const startScroll = scrollContainer.scrollTop
        const distance = targetScroll - startScroll
        
        if (Math.abs(distance) > 0.5) {
          // Cancel any ongoing animation for additions
          if (scrollAnimationFrameRef.current) {
            cancelAnimationFrame(scrollAnimationFrameRef.current)
            scrollAnimationFrameRef.current = null
          }
          
          const duration = 400
          const startTime = performance.now()
          
          const animateScroll = (currentTime) => {
            if (!scrollContainer) {
              scrollAnimationFrameRef.current = null
              return
            }
            
            const elapsed = currentTime - startTime
            const progress = Math.min(elapsed / duration, 1)
            
            // Optimized easing calculation
            const oneMinusProgress = 1 - progress
            const easeOut = 1 - (oneMinusProgress * oneMinusProgress * oneMinusProgress)
            
            const newScroll = startScroll + (distance * easeOut)
            scrollContainer.scrollTop = newScroll
            
            if (progress < 1) {
              scrollAnimationFrameRef.current = requestAnimationFrame(animateScroll)
            } else {
              scrollContainer.scrollTop = targetScroll
              scrollAnimationFrameRef.current = null
            }
          }
          
          scrollAnimationFrameRef.current = requestAnimationFrame(animateScroll)
        }
      }
      
      // Update the ref
      previousInstancesLengthRef.current = currentLength
    } else {
      // Update ref even if we didn't scroll
      previousInstancesLengthRef.current = currentLength
    }
  }, [instances.length, instances]) // Include instances in deps to catch reference changes
  
  // Helper function to generate unique keys for feature confirmations
  const getFeatureKey = (feature) => {
    const typeFeatures = (item.features || []).filter(f => f.type === feature.type)
    const featureIndex = typeFeatures.findIndex(f => f === feature)
    return `${feature.type}-${featureIndex}-${feature.name || 'blank'}`
  }
  
  // Helper function to generate unique keys for experience confirmations
  const getExperienceKey = (exp, index) => {
    return `experience-${index}-${typeof exp === 'string' ? exp : exp.name || 'blank'}`
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
  
  // Handle two-stage delete for experiences
  const handleExperienceDeleteClick = (expToDelete, index) => {
    const experienceKey = getExperienceKey(expToDelete, index)
    
    if (deleteConfirmations[experienceKey]) {
      // Second click - actually delete
      const newExp = [...(item.experience || [])]
      newExp.splice(index, 1)
      onUpdate && onUpdate(item.id, { experience: newExp })
      
      setDeleteConfirmations(prev => {
        const newState = { ...prev }
        delete newState[experienceKey]
        return newState
      })
    } else {
      // First click - show confirmation state
      setDeleteConfirmations(prev => ({
        ...prev,
        [experienceKey]: true
      }))
      
      // Auto-reset after 3 seconds
      setTimeout(() => {
        setDeleteConfirmations(prev => {
          const newState = { ...prev }
          delete newState[experienceKey]
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
      const { marginTop, ...cardStyleWithoutMargin } = cardStyle
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
    const isEditMode = effectiveMode === 'edit' || showCustomCreator
    
    // Determine if tab should be shown
    const shouldShowTab = ((showAddRemoveButtons && type === 'adversary') || (showCustomCreator && type === 'adversary'))
    
    // Build tab content
    const tabContent = shouldShowTab ? (
      showCustomCreator ? (
        // Edit mode buttons: Save and Cancel
        <>
          <button
            onClick={(e) => {
              e.stopPropagation()
              if (onSaveCustomAdversary) {
                onSaveCustomAdversary(item, item.id)
                if (onCancelEdit) onCancelEdit()
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
              e.target.style.opacity = '0.9'
            }}
            onMouseLeave={(e) => {
              e.target.style.opacity = '1'
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
                e.target.style.backgroundColor = 'var(--bg-hover)'
                e.target.style.borderColor = 'var(--purple)'
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'var(--bg-secondary)'
                e.target.style.borderColor = 'var(--border)'
              }}
              title="Cancel"
            >
              <X size={16} />
              <span>Cancel</span>
            </button>
          )}
        </>
      ) : (
        // Normal mode buttons: Add/Remove/Edit
        <>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onRemoveInstance && onRemoveInstance(item.id)
            }}
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
              borderRadius: '4px',
              padding: '0',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              fontSize: '0.7rem',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = 'var(--bg-hover)'
              e.target.style.borderColor = 'var(--purple)'
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'var(--bg-secondary)'
              e.target.style.borderColor = 'var(--border)'
            }}
            title="Remove one"
          >
            <Minus size={16} />
          </button>
          <span style={{ 
            color: 'var(--text-primary)', 
            fontSize: '1rem',
            fontWeight: '500',
            minWidth: '24px',
            textAlign: 'center'
          }}>
            {instances.length}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onAddInstance && onAddInstance(item)
            }}
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
              borderRadius: '4px',
              padding: '0',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              fontSize: '0.7rem',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = 'var(--purple)'
              e.target.style.borderColor = 'var(--purple)'
              e.target.style.color = 'white'
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'var(--bg-secondary)'
              e.target.style.borderColor = 'var(--border)'
              e.target.style.color = 'var(--text-primary)'
            }}
            title="Add another"
          >
            <Plus size={16} />
          </button>
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onEdit(item.id)
              }}
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
                borderRadius: '4px',
                padding: '0',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px',
                fontSize: '0.7rem',
                transition: 'all 0.2s ease',
                marginLeft: '0.25rem'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'var(--purple)'
                e.target.style.borderColor = 'var(--purple)'
                e.target.style.color = 'white'
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'var(--bg-secondary)'
                e.target.style.borderColor = 'var(--border)'
                e.target.style.color = 'var(--text-primary)'
              }}
              title="Edit"
            >
              <Pencil size={16} />
            </button>
          )}
        </>
      )
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
                  type="text"
                  value={item.name || ''}
                  onChange={(e) => {
                    onUpdate && onUpdate(item.id, { name: e.target.value })
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
                <CombinedTypeTierBadge 
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
                          const atkValue = typeof item.atk === 'string' ? parseInt(item.atk.replace(/[^0-9\-]/g, '')) : (item.atk || 0)
                          return atkValue >= 0 ? `+${atkValue}` : atkValue.toString()
                        })()}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9+\-]/g, '')
                          if (value.length <= 4) {
                            // Parse the value to store as number
                            const numericValue = parseInt(value.replace(/[^0-9\-]/g, '')) || 0
                            onUpdate && onUpdate(item.id, { atk: numericValue })
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'ArrowUp') {
                            e.preventDefault()
                            const current = typeof item.atk === 'string' ? parseInt(item.atk.replace(/[^0-9\-]/g, '')) : (item.atk || 0)
                            const newValue = current + 1
                            onUpdate && onUpdate(item.id, { atk: newValue })
                          } else if (e.key === 'ArrowDown') {
                            e.preventDefault()
                            const current = typeof item.atk === 'string' ? parseInt(item.atk.replace(/[^0-9\-]/g, '')) : (item.atk || 0)
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
                          const atkValue = typeof item.atk === 'string' ? parseInt(item.atk.replace(/[^0-9\-]/g, '')) : item.atk
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
            <div style={{ paddingTop: '0' }}>
                {isEditMode ? (
                  <div style={{ display: 'flex', flexDirection: 'column', marginTop: '-0.25rem' }}>
                    {(() => {
                      const experiences = item.experience || []
                      // Ensure at least one empty experience in edit mode
                      const experiencesToShow = experiences.length === 0 
                        ? [{ name: '', modifier: 1 }]
                        : experiences
                      
                      return experiencesToShow.map((exp, index) => (
                        <div key={index} style={{ 
                          position: 'relative',
                          marginBottom: '0.5rem'
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
                            width: '24px',
                            height: '24px'
                          }}>
                            <input
                              type="text"
                              value={typeof exp === 'object' ? (exp.modifier >= 1 ? `+${exp.modifier}` : '+1') : '+1'}
                              onChange={(e) => {
                                const newExp = [...(item.experience || [])]
                                const modifier = parseInt(e.target.value.replace(/[^0-9+-]/g, '')) || 1
                                const clampedModifier = Math.max(1, modifier)
                                newExp[index] = { name: typeof exp === 'string' ? exp : exp.name || '', modifier: clampedModifier }
                                onUpdate && onUpdate(item.id, { experience: newExp })
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'ArrowUp') {
                                  e.preventDefault()
                                  const newExp = [...(item.experience || [])]
                                  const currentModifier = typeof exp === 'object' ? Math.max(1, exp.modifier) : 1
                                  newExp[index] = { 
                                    name: typeof exp === 'string' ? exp : exp.name || '', 
                                    modifier: currentModifier + 1 
                                  }
                                  onUpdate && onUpdate(item.id, { experience: newExp })
                                } else if (e.key === 'ArrowDown') {
                                  e.preventDefault()
                                  const newExp = [...(item.experience || [])]
                                  const currentModifier = typeof exp === 'object' ? Math.max(1, exp.modifier) : 1
                                  newExp[index] = { 
                                    name: typeof exp === 'string' ? exp : exp.name || '', 
                                    modifier: Math.max(1, currentModifier - 1)
                                  }
                                  onUpdate && onUpdate(item.id, { experience: newExp })
                                }
                              }}
                              style={{
                                width: '24px',
                                height: '24px',
                                border: '1px solid var(--text-secondary)',
                                borderRadius: '4px',
                                backgroundColor: 'transparent',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                paddingTop: '1px',
                                fontSize: '0.8rem',
                                fontWeight: 600,
                                color: 'var(--text-primary)',
                                textAlign: 'center',
                                outline: 'none'
                              }}
                            />
                          </div>
                          
                          <div style={{
                            marginLeft: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                          }}>
                            <input
                              type="text"
                              value={typeof exp === 'string' ? exp : exp.name || ''}
                              onChange={(e) => {
                                const newExp = [...(item.experience || [])]
                                const currentModifier = typeof exp === 'object' ? exp.modifier : 1
                                newExp[index] = { name: e.target.value, modifier: currentModifier }
                                
                                // Auto-add new experience if this was the last experience and name is filled
                                const lastExperience = newExp[newExp.length - 1]
                                if (lastExperience && lastExperience.name.trim()) {
                                  newExp.push({ name: '', modifier: 1 })
                                }
                                
                                onUpdate && onUpdate(item.id, { experience: newExp })
                              }}
                              placeholder="Experience name"
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
                            
                            {/* Control Buttons */}
                            <div style={{ display: 'flex', gap: '0.125rem' }}>
                              {/* Up Button */}
                              <button
                                onClick={() => {
                                  const newExp = [...(item.experience || [])]
                                  const currentExpName = typeof exp === 'string' ? exp.trim() : exp.name?.trim()
                                  const prevExp = newExp[index - 1]
                                  const prevExpName = typeof prevExp === 'string' ? prevExp.trim() : prevExp.name?.trim()
                                  
                                  if (index > 0 && index < newExp.length && currentExpName && prevExpName) {
                                    // Swap with previous experience
                                    newExp[index] = prevExp
                                    newExp[index - 1] = exp
                                    onUpdate && onUpdate(item.id, { experience: newExp })
                                  }
                                }}
                                disabled={index === 0 || !(typeof exp === 'string' ? exp.trim() : exp.name?.trim()) || !(typeof experiencesToShow[index - 1] === 'string' ? experiencesToShow[index - 1].trim() : experiencesToShow[index - 1].name?.trim())}
                                style={{
                                  width: '22px',
                                  height: '22px',
                                  padding: '0',
                                  border: '1px solid var(--border)',
                                  borderRadius: '3px',
                                  backgroundColor: (index === 0 || !(typeof exp === 'string' ? exp.trim() : exp.name?.trim()) || !(typeof experiencesToShow[index - 1] === 'string' ? experiencesToShow[index - 1].trim() : experiencesToShow[index - 1].name?.trim())) ? 'var(--gray-800)' : 'var(--gray-700)',
                                  color: (index === 0 || !(typeof exp === 'string' ? exp.trim() : exp.name?.trim()) || !(typeof experiencesToShow[index - 1] === 'string' ? experiencesToShow[index - 1].trim() : experiencesToShow[index - 1].name?.trim())) ? 'var(--text-secondary)' : 'white',
                                  cursor: (index === 0 || !(typeof exp === 'string' ? exp.trim() : exp.name?.trim()) || !(typeof experiencesToShow[index - 1] === 'string' ? experiencesToShow[index - 1].trim() : experiencesToShow[index - 1].name?.trim())) ? 'not-allowed' : 'pointer',
                                  opacity: (index === 0 || !(typeof exp === 'string' ? exp.trim() : exp.name?.trim()) || !(typeof experiencesToShow[index - 1] === 'string' ? experiencesToShow[index - 1].trim() : experiencesToShow[index - 1].name?.trim())) ? 0.5 : 1,
                                  fontWeight: '600',
                                  fontSize: '12px',
                                  lineHeight: '1',
                                  transition: 'background-color 0.2s',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                                title="Move up"
                              >
                                ↑
                              </button>
                              
                              {/* Down Button */}
                              <button
                                onClick={() => {
                                  const newExp = [...(item.experience || [])]
                                  const currentExpName = typeof exp === 'string' ? exp.trim() : exp.name?.trim()
                                  const nextExp = newExp[index + 1]
                                  const nextExpName = typeof nextExp === 'string' ? nextExp.trim() : nextExp.name?.trim()
                                  
                                  if (index < newExp.length - 1 && index >= 0 && currentExpName && nextExpName) {
                                    // Swap with next experience
                                    newExp[index] = nextExp
                                    newExp[index + 1] = exp
                                    onUpdate && onUpdate(item.id, { experience: newExp })
                                  }
                                }}
                                disabled={index === experiencesToShow.length - 1 || !(typeof exp === 'string' ? exp.trim() : exp.name?.trim()) || !(typeof experiencesToShow[index + 1] === 'string' ? experiencesToShow[index + 1].trim() : experiencesToShow[index + 1].name?.trim())}
                                style={{
                                  width: '22px',
                                  height: '22px',
                                  padding: '0',
                                  border: '1px solid var(--border)',
                                  borderRadius: '3px',
                                  backgroundColor: (index === experiencesToShow.length - 1 || !(typeof exp === 'string' ? exp.trim() : exp.name?.trim()) || !(typeof experiencesToShow[index + 1] === 'string' ? experiencesToShow[index + 1].trim() : experiencesToShow[index + 1].name?.trim())) ? 'var(--gray-800)' : 'var(--gray-700)',
                                  color: (index === experiencesToShow.length - 1 || !(typeof exp === 'string' ? exp.trim() : exp.name?.trim()) || !(typeof experiencesToShow[index + 1] === 'string' ? experiencesToShow[index + 1].trim() : experiencesToShow[index + 1].name?.trim())) ? 'var(--text-secondary)' : 'white',
                                  cursor: (index === experiencesToShow.length - 1 || !(typeof exp === 'string' ? exp.trim() : exp.name?.trim()) || !(typeof experiencesToShow[index + 1] === 'string' ? experiencesToShow[index + 1].trim() : experiencesToShow[index + 1].name?.trim())) ? 'not-allowed' : 'pointer',
                                  opacity: (index === experiencesToShow.length - 1 || !(typeof exp === 'string' ? exp.trim() : exp.name?.trim()) || !(typeof experiencesToShow[index + 1] === 'string' ? experiencesToShow[index + 1].trim() : experiencesToShow[index + 1].name?.trim())) ? 0.5 : 1,
                                  fontWeight: '600',
                                  fontSize: '12px',
                                  lineHeight: '1',
                                  transition: 'background-color 0.2s',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                                title="Move down"
                              >
                                ↓
                              </button>
                              
                              {/* Delete Button */}
                              <button
                                onClick={() => handleExperienceDeleteClick(exp, index)}
                                disabled={!(typeof exp === 'string' ? exp.trim() : exp.name?.trim())}
                                style={{
                                  width: '22px',
                                  height: '22px',
                                  padding: '0',
                                  border: '1px solid var(--border)',
                                  borderRadius: '3px',
                                  backgroundColor: deleteConfirmations[getExperienceKey(exp, index)] ? 'var(--danger)' : (!(typeof exp === 'string' ? exp.trim() : exp.name?.trim()) ? 'var(--gray-800)' : 'var(--gray-700)'),
                                  color: (!(typeof exp === 'string' ? exp.trim() : exp.name?.trim()) ? 'var(--text-secondary)' : 'white'),
                                  cursor: (!(typeof exp === 'string' ? exp.trim() : exp.name?.trim()) ? 'not-allowed' : 'pointer'),
                                  opacity: (!(typeof exp === 'string' ? exp.trim() : exp.name?.trim()) ? 0.5 : 1),
                                  fontWeight: '600',
                                  fontSize: '12px',
                                  lineHeight: '1',
                                  transition: 'background-color 0.2s',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                                title={deleteConfirmations[getExperienceKey(exp, index)] ? "Click again to confirm delete" : "Delete experience"}
                              >
                                ×
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    })()}
                  </div>
                ) : (
              <div style={{
                fontSize: '0.875rem',
                  lineHeight: 1.4,
                color: 'var(--text-secondary)'
              }}>
                  {item.experience && item.experience.length > 0 ? (
                    item.experience.map((exp, index) => {
                      if (typeof exp === 'string') {
                        // Handle string format - try to parse bonus from the end
                        const match = exp.match(/^(.+?)\s*([+-]?\d+)$/)
                        if (match) {
                          const [, name, bonus] = match
                          return (
                            <div key={index} style={{ 
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
                                width: '24px',
                                height: '24px'
                              }}>
                                <div style={{
                                  width: '24px',
                                  height: '24px',
                                  border: '1px solid var(--text-secondary)',
                                  borderRadius: '4px',
                                  backgroundColor: 'transparent',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
            paddingTop: '1px'
                                }}>
                                  <span style={{
                                    fontSize: '0.8rem',
                                    fontWeight: 600,
                                    color: 'var(--text-primary)'
                                  }}>
                                    {bonus}
                                  </span>
                                </div>
                              </div>
                              <span style={{ marginLeft: '32px' }}>{name}</span>
                            </div>
                          )
                        } else {
                          // No bonus found, just show the string
                          return (
                  <div key={index} style={{ marginBottom: '0.25rem' }}>
                              {exp}
                  </div>
                          )
                        }
                      } else {
                        // Handle object format
                        return (
                          <div key={index} style={{ 
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
                              width: '24px',
                              height: '24px'
                            }}>
                              <div style={{
                                width: '24px',
                                height: '24px',
                                border: '1px solid var(--text-secondary)',
                                borderRadius: '4px',
                                backgroundColor: 'transparent',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
            paddingTop: '1px'
                              }}>
                                <span style={{
                                  fontSize: '0.8rem',
                                  fontWeight: 600,
                                  color: 'var(--text-primary)'
                                }}>
                                  {exp.modifier >= 0 ? '+' : ''}{exp.modifier}
                                </span>
              </div>
                            </div>
                            <span style={{ marginLeft: '32px' }}>{exp.name}</span>
                          </div>
                        )
                      }
                    })
                  ) : null}
              </div>
            )}
            </div>
          </div>
        )}


        {/* Features Section - Organized by Type */}
        {((item.features && item.features.length > 0) || isEditMode) && (
          <div style={{
            padding: '0 8px 8px 8px'
          }}>
            {/* Standard Attack */}
            {((item.atk !== undefined && item.weapon) || isEditMode) && (
              <div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '-0.25rem'
                }}>
                  <hr style={{
                    flex: 1,
                    border: 'none',
                    borderTop: '1px solid var(--border)',
                    margin: 0
                  }} />
                  <h4 style={{
                    margin: 0,
                    fontSize: '0.75rem',
                    fontWeight: '500',
                    color: 'var(--text-secondary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    marginLeft: '0.75rem'
                  }}>
                    Standard Attack
                  </h4>
                </div>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  {/* Standard Attack - Show in view mode or edit mode */}
                  {isEditMode ? (
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.25rem',
                      padding: '0.5rem',
                      border: '1px solid var(--border)',
                      borderRadius: '4px',
                      backgroundColor: 'var(--bg-secondary)',
                      marginTop: '0.75rem',
                      marginBottom: '0.75rem'
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
                          <option value=""></option>
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
                      color: 'var(--text-secondary)',
                    }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem', display: 'block' }}>
                        {item.weapon}
                      </span>
                      <div style={{ marginLeft: '0.25rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                        Make an attack against a target within {item.range || 'Melee'} range. On a success, deal {item.damage || 'damage varies'}.
                      </div>
                    </div>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            {(item.features.filter(f => f.type === 'Action').length > 0 || isEditMode) && (
              <div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '-0.25rem'
                }}>
                  <hr style={{
                    flex: 1,
                    border: 'none',
                    borderTop: '1px solid var(--border)',
                    margin: 0
                  }} />
                  <h4 style={{
                    margin: 0,
                    fontSize: '0.75rem',
                    fontWeight: '500',
                    color: 'var(--text-secondary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    marginLeft: '0.75rem'
                  }}>
                    Actions
                  </h4>
                </div>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  {/* Actions */}
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
                            gap: '0.25rem',
                            margin: '0.5rem 0',
                            padding: '0.5rem',
                            border: '1px solid var(--border)',
                            borderRadius: '4px',
                            backgroundColor: 'var(--bg-secondary)',
                            alignItems: 'stretch'
                          }}>
                            {/* Content column */}
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                              {/* Row 1: Name Input */}
                              <input
                              type="text"
                              value={feature.name || ''}
                              autoComplete="off"
                              autoCorrect="off"
                              autoCapitalize="off"
                              spellCheck="false"
                              data-lpignore="true"
                              data-form-type="other"
                              name={`feature-name-${feature.type.toLowerCase()}`}
                              onChange={(e) => {
                                const newFeatures = [...(item.features || [])]
                                const actionIndex = newFeatures.findIndex(f => f.type === 'Action' && f === feature)
                                if (actionIndex >= 0) {
                                  newFeatures[actionIndex] = { ...newFeatures[actionIndex], name: e.target.value }
                                } else {
                                  newFeatures.push({ type: 'Action', name: e.target.value, description: feature.description || '' })
                                }
                                
                                // Auto-add new action if this was the last action and name is filled
                                const actionFeatures = newFeatures.filter(f => f.type === 'Action')
                                const lastAction = actionFeatures[actionFeatures.length - 1]
                                if (lastAction && lastAction.name.trim()) {
                                  newFeatures.push({ type: 'Action', name: '', description: '' })
                                }
                                
                                onUpdate && onUpdate(item.id, { features: newFeatures })
                              }}
                              placeholder="Action name"
                              style={{
                                padding: '0.5rem',
                                border: '1px solid var(--border)',
                                borderRadius: '4px',
                                backgroundColor: 'var(--bg-primary)',
                                color: 'var(--text-primary)',
                                fontSize: '0.875rem',
                                transition: 'background-color 0.2s'
                              }}
                            />
                              {/* Row 2: Description Textarea */}
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
                                
                                // Auto-add new action if this was the last action and name is filled
                                const actionFeatures = newFeatures.filter(f => f.type === 'Action')
                                const lastAction = actionFeatures[actionFeatures.length - 1]
                                if (lastAction && lastAction.name.trim()) {
                                  newFeatures.push({ type: 'Action', name: '', description: '' })
                                }
                                
                                onUpdate && onUpdate(item.id, { features: newFeatures })
                              }}
                              onInput={(e) => {
                                // Store the original height before resetting
                                const originalHeight = e.target.offsetHeight
                                
                                // Reset to auto to measure natural height
                                e.target.style.height = 'auto'
                                const naturalHeight = e.target.scrollHeight
                                
                                // Only use natural height if it's larger than original, otherwise keep original
                                const finalHeight = naturalHeight > originalHeight ? naturalHeight : originalHeight
                                e.target.style.height = finalHeight + 'px'
                              }}
                              placeholder="Action description"
                              rows={1}
                              style={{
                                padding: '0.5rem',
                                border: '1px solid var(--border)',
                                borderRadius: '4px',
                                backgroundColor: 'var(--bg-primary)',
                                color: 'var(--text-primary)',
                                fontSize: '0.875rem',
                                resize: 'none',
                                overflow: 'hidden',
                                minHeight: '2rem'
                              }}
                            />
                            </div>
                            
                            {/* Controls column */}
                            <ReorderControls 
                              feature={feature} 
                              featureType="Action" 
                              item={item} 
                              onUpdate={onUpdate}
                              handleFeatureDeleteClick={handleFeatureDeleteClick}
                              deleteConfirmations={deleteConfirmations}
                              getFeatureKey={getFeatureKey}
                            />
                          </div>
                        )
                      }
                      return (
                    <div key={index} style={{
                      fontSize: '0.875rem',
                      lineHeight: 1.4,
                      color: 'var(--text-secondary)',
                    }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem', display: 'block' }}>
                        {feature.name}
                      </span>
                      {feature.description && (
                        <div style={{ marginLeft: '0.25rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                          {feature.description}
                        </div>
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
              <div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '-0.25rem'
                }}>
                  <hr style={{
                    flex: 1,
                    border: 'none',
                    borderTop: '1px solid var(--border)',
                    margin: 0
                  }} />
                  <h4 style={{
                    margin: 0,
                    fontSize: '0.75rem',
                    fontWeight: '500',
                    color: 'var(--text-secondary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    marginLeft: '0.75rem'
                  }}>
                    Passives
                  </h4>
                </div>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column'
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
                            gap: '0.25rem',
                            margin: '0.5rem 0',
                            padding: '0.5rem',
                            border: '1px solid var(--border)',
                            borderRadius: '4px',
                            backgroundColor: 'var(--bg-secondary)',
                            alignItems: 'stretch'
                          }}>
                            {/* Content column */}
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                              {/* Row 1: Name Input */}
                              <input
                                type="text"
                                value={feature.name || ''}
                                autoComplete="off"
                                autoCorrect="off"
                                autoCapitalize="off"
                                spellCheck="false"
                                onChange={(e) => {
                                  const newFeatures = [...(item.features || [])]
                                  const passiveIndex = newFeatures.findIndex(f => f.type === 'Passive' && f === feature)
                                  if (passiveIndex >= 0) {
                                    newFeatures[passiveIndex] = { ...newFeatures[passiveIndex], name: e.target.value }
                                  } else {
                                    newFeatures.push({ type: 'Passive', name: e.target.value, description: feature.description || '' })
                                  }
                                  
                                  // Auto-add new passive if this was the last passive and name is filled
                                  const passiveFeatures = newFeatures.filter(f => f.type === 'Passive')
                                  const lastPassive = passiveFeatures[passiveFeatures.length - 1]
                                  if (lastPassive && lastPassive.name.trim()) {
                                    newFeatures.push({ type: 'Passive', name: '', description: '' })
                                  }
                                  
                                  onUpdate && onUpdate(item.id, { features: newFeatures })
                                }}
                                placeholder="Passive name"
                                style={{
                                  padding: '0.5rem',
                                  border: '1px solid var(--border)',
                                  borderRadius: '4px',
                                  backgroundColor: 'var(--bg-primary)',
                                  color: 'var(--text-primary)',
                                  fontSize: '0.875rem',
                                  transition: 'background-color 0.2s'
                                }}
                              />
                              {/* Row 2: Description Textarea */}
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
                                  
                                  // Auto-add new passive if this was the last passive and name is filled
                                  const passiveFeatures = newFeatures.filter(f => f.type === 'Passive')
                                  const lastPassive = passiveFeatures[passiveFeatures.length - 1]
                                  if (lastPassive && lastPassive.name.trim()) {
                                    newFeatures.push({ type: 'Passive', name: '', description: '' })
                                  }
                                  
                                  onUpdate && onUpdate(item.id, { features: newFeatures })
                                }}
                                onInput={(e) => {
                                  // Store the original height before resetting
                                  const originalHeight = e.target.offsetHeight
                                  
                                  // Reset to auto to measure natural height
                                  e.target.style.height = 'auto'
                                  const naturalHeight = e.target.scrollHeight
                                  
                                  // Only use natural height if it's larger than original, otherwise keep original
                                  const finalHeight = naturalHeight > originalHeight ? naturalHeight : originalHeight
                                  e.target.style.height = finalHeight + 'px'
                                }}
                                placeholder="Passive description"
                                rows={1}
                                style={{
                                  padding: '0.5rem',
                                  border: '1px solid var(--border)',
                                  borderRadius: '4px',
                                  backgroundColor: 'var(--bg-primary)',
                                  color: 'var(--text-primary)',
                                  fontSize: '0.875rem',
                                  resize: 'none',
                                  overflow: 'hidden',
                                  minHeight: '2rem'
                                }}
                              />
                            </div>
                            
                            {/* Controls column */}
                            <ReorderControls 
                              feature={feature} 
                              featureType="Passive" 
                              item={item} 
                              onUpdate={onUpdate}
                              handleFeatureDeleteClick={handleFeatureDeleteClick}
                              deleteConfirmations={deleteConfirmations}
                              getFeatureKey={getFeatureKey}
                            />
                          </div>
                        )
                      }
                      return (
                    <div key={index} style={{
                      fontSize: '0.875rem',
                      lineHeight: 1.4,
                      color: 'var(--text-secondary)',
                    }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem', display: 'block' }}>
                        {feature.name}
                      </span>
                      {feature.description && (
                        <div style={{ marginLeft: '0.25rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                          {feature.description}
                        </div>
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
              <div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '-0.25rem'
                }}>
                  <hr style={{
                    flex: 1,
                    border: 'none',
                    borderTop: '1px solid var(--border)',
                    margin: 0
                  }} />
                  <h4 style={{
                    margin: 0,
                    fontSize: '0.75rem',
                    fontWeight: '500',
                    color: 'var(--text-secondary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    marginLeft: '0.75rem'
                  }}>
                    Reactions
                  </h4>
                </div>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column'
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
                            gap: '0.25rem',
                            margin: '0.5rem 0',
                            padding: '0.5rem',
                            border: '1px solid var(--border)',
                            borderRadius: '4px',
                            backgroundColor: 'var(--bg-secondary)',
                            alignItems: 'stretch'
                          }}>
                            {/* Content column */}
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                              {/* Row 1: Name Input */}
                              <input
                                type="text"
                                value={feature.name || ''}
                                autoComplete="off"
                                autoCorrect="off"
                                autoCapitalize="off"
                                spellCheck="false"
                                onChange={(e) => {
                                  const newFeatures = [...(item.features || [])]
                                  const reactionIndex = newFeatures.findIndex(f => f.type === 'Reaction' && f === feature)
                                  if (reactionIndex >= 0) {
                                    newFeatures[reactionIndex] = { ...newFeatures[reactionIndex], name: e.target.value }
                                  } else {
                                    newFeatures.push({ type: 'Reaction', name: e.target.value, description: feature.description || '' })
                                  }
                                  
                                  // Auto-add new reaction if this was the last reaction and name is filled
                                  const reactionFeatures = newFeatures.filter(f => f.type === 'Reaction')
                                  const lastReaction = reactionFeatures[reactionFeatures.length - 1]
                                  if (lastReaction && lastReaction.name.trim()) {
                                    newFeatures.push({ type: 'Reaction', name: '', description: '' })
                                  }
                                  
                                  onUpdate && onUpdate(item.id, { features: newFeatures })
                                }}
                                placeholder="Reaction name"
                                style={{
                                  padding: '0.5rem',
                                  border: '1px solid var(--border)',
                                  borderRadius: '4px',
                                  backgroundColor: 'var(--bg-primary)',
                                  color: 'var(--text-primary)',
                                  fontSize: '0.875rem',
                                  transition: 'background-color 0.2s'
                                }}
                              />
                              {/* Row 2: Description Textarea */}
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
                                  
                                  // Auto-add new reaction if this was the last reaction and name is filled
                                  const reactionFeatures = newFeatures.filter(f => f.type === 'Reaction')
                                  const lastReaction = reactionFeatures[reactionFeatures.length - 1]
                                  if (lastReaction && lastReaction.name.trim()) {
                                    newFeatures.push({ type: 'Reaction', name: '', description: '' })
                                  }
                                  
                                  onUpdate && onUpdate(item.id, { features: newFeatures })
                                }}
                                onInput={(e) => {
                                  // Store the original height before resetting
                                  const originalHeight = e.target.offsetHeight
                                  
                                  // Reset to auto to measure natural height
                                  e.target.style.height = 'auto'
                                  const naturalHeight = e.target.scrollHeight
                                  
                                  // Only use natural height if it's larger than original, otherwise keep original
                                  const finalHeight = naturalHeight > originalHeight ? naturalHeight : originalHeight
                                  e.target.style.height = finalHeight + 'px'
                                }}
                                placeholder="Reaction description"
                                rows={1}
                                style={{
                                  padding: '0.5rem',
                                  border: '1px solid var(--border)',
                                  borderRadius: '4px',
                                  backgroundColor: 'var(--bg-primary)',
                                  color: 'var(--text-primary)',
                                  fontSize: '0.875rem',
                                  resize: 'none',
                                  overflow: 'hidden',
                                  minHeight: '2rem'
                                }}
                              />
                            </div>
                            
                            {/* Controls column */}
                            <ReorderControls 
                              feature={feature} 
                              featureType="Reaction" 
                              item={item} 
                              onUpdate={onUpdate}
                              handleFeatureDeleteClick={handleFeatureDeleteClick}
                              deleteConfirmations={deleteConfirmations}
                              getFeatureKey={getFeatureKey}
                            />
                          </div>
                        )
                      }
                      return (
                    <div key={index} style={{
                      fontSize: '0.875rem',
                      lineHeight: 1.4,
                      color: 'var(--text-secondary)',
                    }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem', display: 'block' }}>
                        {feature.name}
                      </span>
                      {feature.description && (
                        <div style={{ marginLeft: '0.25rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                          {feature.description}
                        </div>
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

        {/* Status Section */}
        {((instances && instances.length > 0) || (item.type !== 'Minion' && (item.thresholds || isEditMode))) && (
          <div style={{
            padding: '0 8px'
          }}>
            {/* Status Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '0.25rem'
            }}>
              <hr style={{
                flex: 1,
                border: 'none',
                borderTop: '1px solid var(--border)',
                margin: 0
              }} />
              <h4 style={{
                margin: 0,
                fontSize: '0.75rem',
                fontWeight: '500',
                color: 'var(--text-secondary)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginLeft: '0.75rem'
              }}>
                Status
              </h4>
            </div>

            {/* Instances */}
            {isEditMode ? (
              <div style={{ marginBottom: '0.5rem' }}>
                <div style={{
                  padding: '0.75rem',
                  backgroundColor: 'var(--bg-secondary)',
                  borderRadius: '8px',
                  border: '1px solid var(--border)'
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {/* HP Row */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input
                        type="number"
                        value={item.hpMax || ''}
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 1
                          onUpdate && onUpdate(item.id, { hpMax: value })
                        }}
                        min="1"
                        max="99"
                        style={{
                          width: '40px',
                          padding: '0.25rem 0.25rem',
                          border: '1px solid var(--border)',
                          borderRadius: '4px',
                          backgroundColor: 'var(--bg-primary)',
                          color: 'var(--text-primary)',
                          fontSize: '0.875rem',
                          textAlign: 'center'
                        }}
                      />
                      <Pips
                        type="adversaryHP"
                        value={0}
                        maxValue={item.hpMax || 1}
                        showTooltip={false}
                      />
                      <span style={{ 
                        fontSize: '0.75rem', 
                        color: 'var(--text-secondary)', 
                        textTransform: 'uppercase',
                        minWidth: '40px'
                      }}>
                        HP
                      </span>
                    </div>
                    
                    {/* Stress Row */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input
                        type="number"
                        value={item.stressMax || ''}
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 1
                          onUpdate && onUpdate(item.id, { stressMax: value })
                        }}
                        min="1"
                        max="99"
                        style={{
                          width: '40px',
                          padding: '0.25rem 0.25rem',
                          border: '1px solid var(--border)',
                          borderRadius: '4px',
                          backgroundColor: 'var(--bg-primary)',
                          color: 'var(--text-primary)',
                          fontSize: '0.875rem',
                          textAlign: 'center'
                        }}
                      />
                      <Pips
                        type="adversaryStress"
                        value={0}
                        maxValue={item.stressMax || 1}
                        showTooltip={false}
                      />
                      <span style={{ 
                        fontSize: '0.75rem', 
                        color: 'var(--text-secondary)', 
                        textTransform: 'uppercase',
                        minWidth: '40px'
                      }}>
                        Stress
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : instances && instances.length > 0 && (
              instances.map((instance, index) => {
              const isInstanceDead = (instance.hp || 0) >= (instance.hpMax || 1)
              return (
              <div key={instance.id} data-instance-id={instance.id} style={{ marginBottom: '0.5rem' }}>
                <div
                  key={instance.id}
                  style={{
                    backgroundColor: isInstanceDead ? 'var(--gray-900)' : 'var(--bg-primary)',
                    borderRadius: '6px',
                    padding: '0.25rem 0.5rem',
                    border: '1px solid',
                    borderColor: isInstanceDead ? 'color-mix(in srgb, var(--gray-600) 40%, transparent)' : 'var(--text-secondary)',
                    display: 'flex',
                    justifyContent: 'flex-start',
                    alignItems: 'center',
                    gap: '0.5rem',
                    opacity: isInstanceDead ? 0.7 : 1,
                    position: 'relative',
                    transition: 'all 0.2s ease',
                    minHeight: '40px'
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
                    </>
                  )}
                  {/* Number section - Circular badge */}
                  <div style={{
                    backgroundColor: isInstanceDead ? 'var(--gray-900)' : 'var(--bg-card)',
                    border: '1px solid',
                    borderColor: isInstanceDead ? 'color-mix(in srgb, var(--gray-600) 40%, transparent)' : 'var(--text-secondary)',
                    borderRadius: '50%',
                    width: '24px',
                    height: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
            paddingTop: '1px',
                    flexShrink: 0,
                    opacity: isInstanceDead ? 0.5 : 1
                  }}>
                    <span style={{
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      color: isInstanceDead ? 'var(--gray-400)' : 'var(--text-primary)'
                    }}>
                      {instance.duplicateNumber || 1}
                    </span>
                  </div>

                  {/* HP and Stress pips - Using Pips component */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: '0.125rem'
                  }}>
                    {/* HP Row */}
                    <div style={{ opacity: isInstanceDead ? 0.3 : 1 }}>
                      <Pips
                        type="adversaryHP"
                        value={instance.hp || 0}
                        maxValue={instance.hpMax || 1}
                        onPipClick={(index, isFilled) => {
                          if (onApplyDamage && type === 'adversary') {
                            const currentHp = instance.hp || 0
                            const maxHp = instance.hpMax || 1
                            if (isFilled) {
                              // Clicking a filled pip = heal (reduce damage)
                              if (onApplyHealing) {
                                onApplyHealing(instance.id, 1, currentHp)
                              }
                            } else {
                              // Clicking an empty pip = take damage
                              if (currentHp < maxHp) {
                                onApplyDamage(instance.id, 1, currentHp, maxHp)
                              }
                            }
                          }
                        }}
                        containerStyle={{
                          height: 'auto',
                          padding: '0'
                        }}
                        pipStyle={{
                          fontSize: '1rem',
                          width: '1.25rem',
                          height: '1.25rem'
                        }}
                        size="lg"
                        showTooltip={false}
                      />
                    </div>

                    {/* Stress Row */}
                    {instance.stressMax > 0 && (
                      <div style={{ opacity: isInstanceDead ? 0.3 : 1 }}>
                        <Pips
                          type="adversaryStress"
                          value={instance.stress || 0}
                          maxValue={instance.stressMax}
                          onPipClick={(index, isFilled) => {
                            if (onApplyStressChange && type === 'adversary') {
                              if (isFilled) {
                                // Clicking a filled pip = reduce stress
                                onApplyStressChange(instance.id, -1)
                              } else {
                                // Clicking an empty pip = increase stress
                                onApplyStressChange(instance.id, 1)
                              }
                            }
                          }}
                          containerStyle={{
                            height: 'auto',
                            padding: '0'
                          }}
                          pipStyle={{
                            fontSize: '1rem',
                            width: '1.25rem',
                            height: '1.25rem'
                          }}
                          size="lg"
                          showTooltip={false}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
              )
            })
            )}

            {/* Damage Thresholds Badge */}
            {item.type !== 'Minion' && (item.thresholds || isEditMode) && (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
            paddingTop: '1px',
                marginTop: '0.5rem',
                marginBottom: '0.5rem'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
            paddingTop: '1px',
                  position: 'relative'
                }}>
                  {/* Pill-shaped Threshold Container */}
                  <div style={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
            paddingTop: '1px',
                    height: '36px'
                  }}>
                    {/* Custom pill background that sits behind rhombuses */}
                    <svg 
                      width="300" 
                      height="36" 
                      viewBox="0 0 300 36" 
                      style={{
                        position: 'absolute',
                        zIndex: 1
                      }}
                    >
                      <rect 
                        x="20" 
                        y="6" 
                        width="260" 
                        height="24" 
                        fill="var(--bg-primary)" 
                        stroke="var(--text-secondary)" 
                        strokeWidth="1" 
                        rx="4"
                      />
                    </svg>
                    {/* Content positioned above the background */}
                    <div style={{
                      position: 'relative',
                      zIndex: 2,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      {isEditMode ? (
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.8rem' }}>
                          <span style={{ color: 'var(--text-primary)', fontSize: '0.6875rem', fontWeight: '500', textTransform: 'uppercase' }}>Minor</span>
                          <input
                            type="number"
                            min="1"
                            max="99"
                            value={item.thresholds?.major || ''}
                            onChange={(e) => {
                              const value = e.target.value
                              if (value === '' || (parseInt(value) >= 1 && parseInt(value) <= 99)) {
                                onUpdate && onUpdate(item.id, { thresholds: { ...item.thresholds, major: value === '' ? null : parseInt(value) } })
                              }
                            }}
                            style={{
                              width: '30px',
                              padding: '0.125rem 0.25rem',
                              border: '1px solid var(--border)',
                              borderRadius: '4px',
                              backgroundColor: 'var(--bg-primary)',
                              color: 'var(--text-primary)',
                              fontSize: '0.8rem',
                              textAlign: 'center'
                            }}
                          />
                          <span style={{ color: 'var(--text-primary)', fontSize: '0.6875rem', fontWeight: '500', textTransform: 'uppercase' }}>Major</span>
                          <input
                            type="number"
                            min="1"
                            max="99"
                            value={item.thresholds?.severe || ''}
                            onChange={(e) => {
                              const value = e.target.value
                              if (value === '' || (parseInt(value) >= 1 && parseInt(value) <= 99)) {
                                onUpdate && onUpdate(item.id, { thresholds: { ...item.thresholds, severe: value === '' ? null : parseInt(value) } })
                              }
                            }}
                            style={{
                              width: '30px',
                              padding: '0.125rem 0.25rem',
                              border: '1px solid var(--border)',
                              borderRadius: '4px',
                              backgroundColor: 'var(--bg-primary)',
                              color: 'var(--text-primary)',
                              fontSize: '0.8rem',
                              textAlign: 'center'
                            }}
                          />
                          <span style={{ color: 'var(--text-primary)', fontSize: '0.6875rem', fontWeight: '500', textTransform: 'uppercase' }}>Severe</span>
                        </div>
                      ) : (
                        <>
                          {/* Minor Threshold */}
                          <span style={{
                            color: 'var(--text-primary)',
                            fontSize: '0.6875rem',
                            fontWeight: '500',
                            textTransform: 'uppercase'
                          }}>
                            Minor
                          </span>
                          
                          {/* Major Threshold Number */}
                          <ThresholdTag value={item.thresholds?.major || 7} />
                          
                          {/* Major Threshold */}
                          <span style={{
                            color: 'var(--text-primary)',
                            fontSize: '0.6875rem',
                            fontWeight: '500',
                            textTransform: 'uppercase'
                          }}>
                            Major
                          </span>
                          
                          {/* Severe Threshold Number */}
                          <ThresholdTag value={item.thresholds?.severe || 14} />
                          
                          {/* Severe Threshold */}
                          <span style={{
                            color: 'var(--text-primary)',
                            fontSize: '0.6875rem',
                            fontWeight: '500',
                            textTransform: 'uppercase'
                          }}>
                            Severe
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Description Section */}
        {(isEditMode || (mode === 'expanded' && item.description && item.description.trim())) && (
          <div style={{
            padding: '0 8px',
            textAlign: 'center'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '-0.25rem'
            }}>
              <hr style={{
                flex: 1,
                border: 'none',
                borderTop: '1px solid var(--border)',
                margin: 0
              }} />
              <h4 style={{
                margin: 0,
                fontSize: '0.75rem',
                fontWeight: '500',
                color: 'var(--text-secondary)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginLeft: '0.75rem'
              }}>
                Description
              </h4>
            </div>
            {isEditMode ? (
              <textarea
                style={{
                  width: '100%',
                  minHeight: '100px',
                  padding: '0.5rem',
                  border: '1px solid var(--border)',
                  borderRadius: '0.5rem',
                  backgroundColor: 'var(--bg-primary)',
                  color: 'white',
                  fontSize: '0.875rem',
                  lineHeight: 1.5,
                  resize: 'none',
                  overflow: 'hidden',
                  fontFamily: 'inherit',
                  marginTop: '0.75rem',
                  marginBottom: '0.75rem'
                }}
                value={item.description}
                onChange={(e) => {
                  // Auto-resize textarea
                  e.target.style.height = 'auto'
                  e.target.style.height = e.target.scrollHeight + 'px'
                  
                  onUpdate && onUpdate(item.id, { description: e.target.value })
                }}
                placeholder="Description..."
              />
            ) : (
              <div style={{
                fontSize: '0.875rem',
                fontStyle: 'italic',
                color: 'var(--text-secondary)',
                lineHeight: 1.4,
                whiteSpace: 'pre-wrap',
                padding: '0.5rem 0'
              }}>
                {item.description}
              </div>
            )}
          </div>
        )}

          {/* Temporary padding spacer for smooth scroll animation on instance removal */}
          {temporaryPaddingHeight > 0 && (
            <div 
              ref={temporaryPaddingRef}
              style={{
                height: temporaryPaddingHeight,
                width: '100%',
                flexShrink: 0
              }}
            />
          )}

          </div>

          {/* Damage Input Popup for Adversaries */}
          {renderDamageInput()}
        </div>
      </ContainerWithTab>
    )
  }

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

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
