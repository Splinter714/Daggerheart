import React from 'react'
import { useGameState } from '../useGameState'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSkull } from '@fortawesome/free-solid-svg-icons'

const Fear = () => {
  const { fear, updateFear } = useGameState()
  const safeFear = fear || { value: 0, visible: false }

  const handleFearSlotClick = (slotIndex) => {
    const currentFear = safeFear.value || 0
    
    if (slotIndex < currentFear) {
      // Clicking a filled slot decreases fear by 1
      updateFear(Math.max(0, currentFear - 1))
    } else {
      // Clicking an empty slot increases fear by 1
      updateFear(Math.min(12, currentFear + 1))
    }
  }

  return (
    <div className="fear-section">
      <div className="fear-controls">
        <div className="fear-tooltip">
          <div className="fear-tooltip-content">
            <div className="fear-tooltip-title">Click skulls to adjust fear:</div>
            <div className="fear-tooltip-option">
              <strong>Empty skull:</strong> Click to increase fear by 1
            </div>
            <div className="fear-tooltip-option">
              <strong>Filled skull:</strong> Click to decrease fear by 1
            </div>
          </div>
        </div>
        
        <div className="fear-skulls">
          {[...Array(12)].map((_, i) => (
            <span 
              key={i} 
              className={`fear-skull ${i < (safeFear.value || 0) ? 'filled' : ''}`}
              title={i < (safeFear.value || 0) ? 'Click to decrease fear' : 'Click to increase fear'}
              onClick={() => handleFearSlotClick(i)}
              style={{ 
                cursor: 'pointer',
                opacity: i < (safeFear.value || 0) ? 1 : 0.3
              }}
            >
              <FontAwesomeIcon icon={faSkull} size="lg" />
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Fear
