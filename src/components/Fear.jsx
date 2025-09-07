import React from 'react'
import { useGameState } from '../useGameState'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSkull } from '@fortawesome/free-solid-svg-icons'

const Fear = () => {
  const { fear, updateFear } = useGameState()
  const safeFear = fear || { value: 0, visible: false }

  // Return just the visual elements, we'll handle clicks in the parent
  return (
    <div className="fear-section">
      <div className="fear-controls">
        <div className="fear-skulls">
          {[...Array(12)].map((_, i) => (
            <span 
              key={i} 
              className={`fear-skull ${i < (safeFear.value || 0) ? 'filled' : ''}`}
              style={{ 
                opacity: i < (safeFear.value || 0) ? 1 : 0.3
              }}
            >
              <FontAwesomeIcon icon={faSkull} size="lg" />
            </span>
          ))}
        </div>
      </div>
      
      <div className="fear-tooltip" style={{ pointerEvents: 'none' }}>
        <div className="fear-tooltip-content">
          <div className="fear-tooltip-title">Click anywhere in header to adjust fear:</div>
          <div className="fear-tooltip-option">
            <strong>Left of boundary:</strong> Click to decrease fear by 1
          </div>
          <div className="fear-tooltip-option">
            <strong>Right of boundary:</strong> Click to increase fear by 1
          </div>
        </div>
      </div>
    </div>
  )
}

export default Fear
