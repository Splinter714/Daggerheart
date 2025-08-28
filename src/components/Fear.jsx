import React, { useState } from 'react'
import { useGameState } from '../useGameState'
import Button from './Buttons'
import { Flame } from 'lucide-react'

const Fear = () => {
  const { fear, updateFear, toggleFearVisibility } = useGameState()
  const safeFear = fear || { value: 0, visible: false }

  const fearSpendingOptions = [
    {
      id: 1,
      title: "Activate Ability",
      description: "Spend 1 fear to activate a powerful ability or feature"
    },
    {
      id: 2,
      title: "Reroll",
      description: "Spend 1 fear to reroll a failed action roll"
    },
    {
      id: 3,
      title: "Advance Countdown",
      description: "Spend 1 fear to advance a countdown or trigger an effect"
    }
  ]

  const handleSpendFear = () => {
    // For now, just decrease fear by 1
    // In a full implementation, this would open a menu to choose what to spend it on
    updateFear(Math.max(0, (safeFear.value || 0) - 1))
  }

  const handleFearChange = (newValue) => {
    updateFear(newValue)
  }

  return (
    <div className="fear-section">
      <div className="fear-controls">
        <div className="fear-tooltip">
          <span className="fear-label cursor-help">
            Fear
          </span>
          <div className="fear-tooltip-content">
            <div className="fear-tooltip-title">Click a filled skull to spend fear:</div>
            {fearSpendingOptions.map((option) => (
              <div key={option.id} className="fear-tooltip-option">
                <strong>{option.title}:</strong> {option.description}
              </div>
            ))}
          </div>
        </div>
        
        <div className="fear-skulls">
          {[...Array(12)].map((_, i) => (
            <span 
              key={i} 
              className={`fear-skull ${i < (safeFear.value || 0) ? 'filled' : ''}`}
              title={i < (safeFear.value || 0) ? 'Click to spend fear' : ''}
              onClick={i < (safeFear.value || 0) ? handleSpendFear : undefined}
              style={{ 
                cursor: i < (safeFear.value || 0) ? 'pointer' : 'default',
                opacity: i < (safeFear.value || 0) ? 1 : 0.3
              }}
            >
              <Flame size={24} />
            </span>
          ))}
        </div>
        
        <div className="fear-buttons">
          <Button 
            action="decrement"
            size="compact"
            onClick={() => handleFearChange(Math.max(0, (safeFear.value || 0) - 1))}
            disabled={(safeFear.value || 0) <= 0}
            title="Decrease fear"
          >
            -
          </Button>
          <Button 
            action="add"
            size="compact"
            onClick={() => handleFearChange(Math.min(12, (safeFear.value || 0) + 1))}
            disabled={(safeFear.value || 0) >= 12}
            title="Increase fear"
          >
            +
          </Button>
        </div>
      </div>
    </div>
  )
}

export default Fear
