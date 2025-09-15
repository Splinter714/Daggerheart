import React, { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
  faSkull, 
  faHeart, 
  faFire,
  faClock 
} from '@fortawesome/free-solid-svg-icons'
import { Droplet, Activity } from 'lucide-react'

const PIP_TYPES = {
  fear: {
    icon: faSkull,
    maxValue: 12,
    containerStyle: {
      display: 'flex',
      gap: '0.125rem',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      height: '100%',
      padding: '0.125rem',
      maxWidth: 'none'
    },
    pipStyle: {
      fontSize: 'var(--text-lg)',
      fontWeight: 600,
      transition: 'color 0.2s ease',
      height: '1.5rem',
      width: '1.5rem',
      display: 'inline-block',
      textAlign: 'center',
      lineHeight: '1.5rem',
      flexShrink: 0,
      imageRendering: 'crisp-edges'
    },
    filledColor: 'var(--purple)',
    emptyColor: 'var(--gray-dark)',
    tooltipTitle: 'Click anywhere in header to adjust fear:',
    tooltipInstructions: [
      { text: 'Left of boundary:', description: 'Click to decrease fear by 1' },
      { text: 'Right of boundary:', description: 'Click to increase fear by 1' }
    ]
  },
  hp: {
    icon: faHeart,
    maxValue: 20,
    containerStyle: {
      display: 'inline-block',
      width: 'auto',
      height: '100%',
      padding: '0.125rem',
      textAlign: 'center'
    },
    pipStyle: {
      fontSize: 'var(--text-sm)',
      fontWeight: 600,
      transition: 'color 0.2s ease',
      height: '1.5rem',
      width: '1.5rem',
      display: 'inline-block',
      textAlign: 'center',
      lineHeight: '1.5rem',
      flexShrink: 0
    },
    filledColor: 'var(--red)',
    emptyColor: 'var(--text-secondary)',
    tooltipTitle: 'Click anywhere to adjust HP:',
    tooltipInstructions: [
      { text: 'Left of boundary:', description: 'Click to decrease HP by 1' },
      { text: 'Right of boundary:', description: 'Click to increase HP by 1' }
    ]
  },
  stress: {
    icon: faFire,
    maxValue: 12,
    containerStyle: {
      display: 'inline-block',
      width: 'auto',
      height: '100%',
      padding: '0.125rem',
      textAlign: 'center'
    },
    pipStyle: {
      fontSize: 'var(--text-sm)',
      fontWeight: 600,
      transition: 'color 0.2s ease',
      height: '1.5rem',
      width: '1.5rem',
      display: 'inline-block',
      textAlign: 'center',
      lineHeight: '1.5rem',
      flexShrink: 0
    },
    filledColor: 'var(--gold)',
    emptyColor: 'var(--text-secondary)',
    tooltipTitle: 'Click anywhere to adjust stress:',
    tooltipInstructions: [
      { text: 'Left of boundary:', description: 'Click to decrease stress by 1' },
      { text: 'Right of boundary:', description: 'Click to increase stress by 1' }
    ]
  },
  countdown: {
    icon: faClock,
    maxValue: 6,
    containerStyle: {
      display: 'inline-block',
      width: 'auto',
      height: '100%',
      padding: '0.125rem',
      textAlign: 'center'
    },
    pipStyle: {
      fontSize: 'var(--text-sm)',
      fontWeight: 600,
      transition: 'color 0.2s ease',
      height: '1.5rem',
      width: '1.5rem',
      display: 'inline-block',
      textAlign: 'center',
      lineHeight: '1.5rem',
      flexShrink: 0
    },
    filledColor: 'var(--text-secondary)', // Default gray
    emptyColor: 'var(--text-secondary)',
    tooltipTitle: 'Click anywhere to adjust countdown:',
    tooltipInstructions: [
      { text: 'Left of boundary:', description: 'Click to decrease countdown by 1' },
      { text: 'Right of boundary:', description: 'Click to increase countdown by 1' }
    ]
  },
  // Dot-based pips
  hpDots: {
    maxValue: 20,
    containerStyle: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '2px',
      justifyContent: 'center',
      alignItems: 'center',
      maxWidth: '120px'
    },
    pipStyle: {
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      border: '1px solid var(--border)',
      transition: 'all 0.2s ease'
    },
    filledStyle: {
      background: 'var(--red)',
      borderColor: 'var(--red)',
      boxShadow: '0 0 4px rgba(239, 68, 68, 0.5)'
    },
    emptyStyle: {
      background: 'var(--bg-primary)',
      borderColor: 'var(--border)'
    },
    isDots: true,
    tooltipTitle: 'Click anywhere to adjust HP:',
    tooltipInstructions: [
      { text: 'Left of boundary:', description: 'Click to decrease HP by 1' },
      { text: 'Right of boundary:', description: 'Click to increase HP by 1' }
    ]
  },
  stressDots: {
    maxValue: 12,
    containerStyle: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '2px',
      justifyContent: 'center',
      alignItems: 'center',
      maxWidth: '120px'
    },
    pipStyle: {
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      border: '1px solid var(--border)',
      transition: 'all 0.2s ease'
    },
    filledStyle: {
      background: 'var(--purple)',
      borderColor: 'var(--purple)',
      boxShadow: '0 0 4px rgba(139, 92, 246, 0.5)'
    },
    emptyStyle: {
      background: 'var(--bg-primary)',
      borderColor: 'var(--border)'
    },
    isDots: true,
    tooltipTitle: 'Click anywhere to adjust stress:',
    tooltipInstructions: [
      { text: 'Left of boundary:', description: 'Click to decrease stress by 1' },
      { text: 'Right of boundary:', description: 'Click to increase stress by 1' }
    ]
  },
  // Adversary-specific pips (for re-implementing archive components)
  adversaryHP: {
    icon: Droplet,
    maxValue: 20,
    containerStyle: {
      display: 'flex',
      gap: '0.125rem',
      flexWrap: 'wrap',
      alignContent: 'flex-start',
      rowGap: '0.125rem',
      maxWidth: '100%'
    },
    pipStyle: {
      fontSize: 'var(--text-sm)',
      fontWeight: 600,
      transition: 'all 0.2s ease',
      cursor: 'pointer'
    },
    filledColor: 'var(--red)',
    emptyColor: 'var(--text-secondary)',
    tooltipTitle: 'Click to adjust HP:',
    tooltipInstructions: [
      { text: 'Filled pip:', description: 'Click to heal (reduce damage)' },
      { text: 'Empty pip:', description: 'Click to take damage' }
    ]
  },
  adversaryStress: {
    icon: Activity,
    maxValue: 12,
    containerStyle: {
      display: 'flex',
      gap: '0.125rem',
      flexWrap: 'wrap',
      alignContent: 'flex-start',
      rowGap: '0.125rem',
      maxWidth: '100%'
    },
    pipStyle: {
      fontSize: 'var(--text-sm)',
      fontWeight: 600,
      transition: 'all 0.2s ease',
      cursor: 'pointer'
    },
    filledColor: 'var(--gold)',
    emptyColor: 'var(--text-secondary)',
    tooltipTitle: 'Click to adjust stress:',
    tooltipInstructions: [
      { text: 'Filled pip:', description: 'Click to reduce stress' },
      { text: 'Empty pip:', description: 'Click to increase stress' }
    ]
  },
  countdownDistributed: {
    icon: faClock,
    maxValue: 6,
    containerStyle: {
      display: 'inline-block',
      width: 'auto',
      height: '100%',
      padding: '0.125rem',
      textAlign: 'center'
    },
    pipStyle: {
      fontSize: 'var(--text-sm)',
      fontWeight: 600,
      transition: 'color 0.2s ease',
      height: '1.5rem',
      width: '1.5rem',
      display: 'inline-block',
      textAlign: 'center',
      lineHeight: '1.5rem',
      flexShrink: 0
    },
    filledColor: 'var(--text-secondary)', // Will be overridden by countdownType
    emptyColor: 'var(--text-secondary)',
    tooltipTitle: 'Countdown progress:',
    tooltipInstructions: [
      { text: 'Progress:', description: 'Current countdown value' }
    ]
  }
}

const Pips = ({ 
  type = 'fear', 
  value = 0, 
  maxValue, 
  onChange, 
  size = 'lg',
  showTooltip = true,
  containerStyle = {},
  pipStyle = {},
  countdownType = null, // For countdown type-based colors
  distributedGroups = null, // For distributed countdown pips (e.g., [5, 3] for groups of 5 and 3)
  onPipClick = null, // Individual pip click handler
  enableBoundaryClick = false, // Enable boundary-based clicking (like fear pips)
  clickContainerWidth = 'auto', // Width of the clickable container ('auto', '100%', or specific value)
  centerPips = true // Whether to center pips within the click container
}) => {
  const [showTooltipState, setShowTooltip] = useState(false)
  
  // Get pip configuration
  const config = PIP_TYPES[type] || PIP_TYPES.fear
  const effectiveMaxValue = maxValue || config.maxValue
  const safeValue = Math.max(0, Math.min(effectiveMaxValue, value))
  
  // Handle countdown type-based colors
  let filledColor = config.filledColor
  if (type === 'countdown' && countdownType) {
    if (['progress', 'dynamic-progress', 'simple-hope'].includes(countdownType)) {
      filledColor = 'var(--gold)'
    } else if (['consequence', 'dynamic-consequence', 'simple-fear'].includes(countdownType)) {
      filledColor = 'var(--purple)'
    } else if (['long-term', 'standard'].includes(countdownType)) {
      filledColor = 'var(--text-secondary)'
    }
  }
  
  // Handle click on individual pip
  const handlePipClick = (index, isFilled) => {
    if (onPipClick) {
      onPipClick(index, isFilled)
    } else if (onChange) {
      const newValue = index + 1
      onChange(newValue)
    }
  }

  // Handle boundary-based clicking (like fear pips)
  const handleBoundaryClick = (event) => {
    if (!enableBoundaryClick || !onChange || onPipClick) return
    
    const outerRect = event.currentTarget.getBoundingClientRect()
    const containerElement = event.currentTarget.querySelector('.pip-container')
    
    // Debug: make sure we found the container
    if (!containerElement) {
      console.warn('Could not find .pip-container element')
      return
    }
    
    const containerRect = containerElement.getBoundingClientRect()
    const clickX = event.clientX - containerRect.left
    
    // Handle clicks outside the pip container (relative to pip container)
    if (clickX < 0) {
      // Click left of all pips = decrement
      if (safeValue > 0) {
        onChange(safeValue - 1)
      }
      return
    }
    
    if (clickX > containerRect.width) {
      // Click right of all pips = increment
      if (safeValue < effectiveMaxValue) {
        onChange(safeValue + 1)
      }
      return
    }
    
    // Click within pip container - use boundary logic based on pip container width only
    const containerWidth = containerRect.width
    const skullPadding = containerWidth * 0.05
    const effectiveContainerWidth = containerWidth - (2 * skullPadding)
    const clickXWithinContainer = clickX - skullPadding
    
    // Calculate boundary at the end of the last filled pip
    const boundaryRatio = safeValue / effectiveMaxValue
    const boundaryXWithinContainer = effectiveContainerWidth * boundaryRatio
    
    if (clickXWithinContainer < boundaryXWithinContainer) {
      // Click left of boundary = decrement
      if (safeValue > 0) {
        onChange(safeValue - 1)
      }
    } else {
      // Click right of boundary = increment
      if (safeValue < effectiveMaxValue) {
        onChange(safeValue + 1)
      }
    }
  }

  // Generate pip groups for distributed countdowns
  const generatePipGroups = () => {
    if (!distributedGroups || type !== 'countdownDistributed') {
      return [{ start: 0, end: effectiveMaxValue, groupIndex: 0 }]
    }
    
    let currentIndex = 0
    return distributedGroups.map((groupSize, groupIndex) => {
      const group = { start: currentIndex, end: currentIndex + groupSize, groupIndex }
      currentIndex += groupSize
      return group
    })
  }

  const pipGroups = generatePipGroups()
  
  // Render pips content
  const renderPips = () => (
    <>
      {pipGroups.map((group) => (
        <div key={group.groupIndex} style={{ display: 'inline-block' }}>
          {[...Array(group.end - group.start)].map((_, i) => {
            const pipIndex = group.start + i
            const isFilled = pipIndex < safeValue
            
            if (config.isDots) {
              // Dot-based pips
              return (
                <div
                  key={pipIndex}
                  style={{
                    ...config.pipStyle,
                    ...(isFilled ? config.filledStyle : config.emptyStyle),
                    ...pipStyle,
                    cursor: (onChange || onPipClick) ? 'pointer' : 'default'
                  }}
                  onClick={!enableBoundaryClick ? () => handlePipClick(pipIndex, isFilled) : undefined}
                  title={`${pipIndex + 1} of ${effectiveMaxValue}`}
                />
              )
            } else {
              // Symbol-based pips
              const IconComponent = config.icon
              const isFontAwesome = IconComponent && typeof IconComponent === 'object' && IconComponent.iconName
              
              return (
                <span 
                  key={pipIndex} 
                  className={`fear-pip ${isFilled ? 'filled' : 'empty'}`}
                  style={{ 
                    ...config.pipStyle,
                    color: isFilled ? filledColor : config.emptyColor,
                    cursor: (onChange || onPipClick) ? 'pointer' : 'default',
                    ...pipStyle
                  }}
                  onClick={!enableBoundaryClick ? () => handlePipClick(pipIndex, isFilled) : undefined}
                  title={`${pipIndex + 1} of ${effectiveMaxValue}`}
                >
                  {isFontAwesome ? (
                    <FontAwesomeIcon icon={IconComponent} size={size} />
                  ) : (
                    <IconComponent size={16} />
                  )}
                </span>
              )
            }
          })}
        </div>
      ))}
      
      {showTooltip && (
        <div style={{ 
          position: 'relative',
          cursor: 'help',
          pointerEvents: 'none'
        }}>
          <div style={{
            position: 'absolute',
            bottom: '100%',
            left: '50%',
            transform: showTooltipState ? 'translateX(-50%) translateY(-5px)' : 'translateX(-50%)',
            background: 'rgba(15, 23, 42, 0.95)',
            border: '1px solid var(--gray)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-md)',
            minWidth: '250px',
            zIndex: 1000,
            opacity: showTooltipState ? 1 : 0,
            visibility: showTooltipState ? 'visible' : 'hidden',
            transition: 'all 0.2s ease',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)'
          }}>
            <div style={{
              fontWeight: 600,
              color: '#e2e8f0',
              marginBottom: '0.75rem',
              fontSize: 'var(--text-sm)'
            }}>{config.tooltipTitle}</div>
            {config.tooltipInstructions.map((instruction, idx) => (
              <div key={idx} style={{
                marginBottom: '0.5rem',
                fontSize: '0.8rem',
                color: '#cbd5e1',
                lineHeight: 1.4
              }}>
                <strong style={{ color: '#e2e8f0' }}>{instruction.text}</strong> {instruction.description}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
  
  // Always use two-layer structure: click container + pip container
  return (
    <div 
      style={{
        width: clickContainerWidth,
        height: '100%',
        cursor: (onChange || onPipClick) ? 'pointer' : 'default',
        touchAction: 'manipulation',
        userSelect: 'none',
        display: centerPips ? 'flex' : 'block',
        alignItems: centerPips ? 'center' : 'stretch',
        justifyContent: centerPips ? 'center' : 'flex-start',
        ...containerStyle
      }}
      onClick={enableBoundaryClick ? handleBoundaryClick : undefined}
      onMouseEnter={() => setShowTooltip(showTooltip)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div className="pip-container" style={{
        ...config.containerStyle,
        display: 'inline-block',
        width: 'auto',
        height: '100%',
        padding: '0.125rem',
        textAlign: 'center'
      }}>
        {renderPips()}
      </div>
    </div>
  )
}

export default Pips