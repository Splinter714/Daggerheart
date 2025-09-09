import React, { useState } from 'react'
import { Droplet, CheckCircle } from 'lucide-react'
import Button from './Buttons'

const DamageInputPopup = ({ 
  item, 
  onApplyDamage, 
  onClose 
}) => {
  const [damageValue, setDamageValue] = useState(item.type === 'Minion' ? '1' : '')

  const handleSubmit = (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    const damage = parseInt(damageValue) || 0
    if (damage > 0) {
      if (item.type === 'Minion') {
        // For minions, apply the raw damage amount (minion mechanics handle the rest)
        onApplyDamage(item.id, damage, item.hp, item.hpMax)
      } else {
        // Calculate HP damage based on damage thresholds for regular adversaries
        let hpDamage = 0
        if (damage >= item.thresholds.severe) {
          hpDamage = 3 // Severe damage
        } else if (damage >= item.thresholds.major) {
          hpDamage = 2 // Major damage
        } else if (damage >= 1) {
          hpDamage = 1 // Minor damage
        }
        onApplyDamage(item.id, hpDamage, item.hp, item.hpMax)
      }
      onClose()
    }
  }

  const handleCancel = (e) => {
    e.preventDefault()
    e.stopPropagation()
    onClose()
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e)
    } else if (e.key === 'Escape') {
      handleCancel(e)
    }
  }

  if (!item) return null

  return (
    <div 
      className="damage-input-popup"
      onClick={(e) => {
        // Close if clicking outside the input content
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
    >
      <div className="damage-input-content">
        <input
          type="number"
          placeholder="Damage"
          min={item.type === 'Minion' ? "1" : "0"}
          value={damageValue}
          onChange={(e) => setDamageValue(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
        />
        <div className="damage-indicators">
          {item.type === 'Minion' ? (
            // Minion damage indicator - show how many additional minions can be defeated
            (() => {
              const damage = parseInt(damageValue) || 0
              const minionFeature = item.features?.find(f => f.name?.startsWith('Minion ('))
              const minionThreshold = minionFeature ? parseInt(minionFeature.name.match(/\((\d+)\)/)?.[1] || '1') : 1
              const additionalMinions = Math.floor(damage / minionThreshold)
              
              // Only show additional minions if we've hit the threshold
              if (damage >= minionThreshold && additionalMinions > 0) {
                return (
                  <span 
                    className="damage-drop minion-additional active"
                    title={`${damage} damage can defeat ${additionalMinions + 1} minion${additionalMinions + 1 !== 1 ? 's' : ''} (1 + ${additionalMinions} additional)`}
                  >
                    +{additionalMinions} additional minion(s)
                  </span>
                )
              } else {
                // Show placeholder to prevent layout shift
                return (
                  <span 
                    className="damage-drop minion-placeholder"
                    title={`${damage} damage defeats this minion only`}
                  >
                    +0 additional minion(s)
                  </span>
                )
              }
            })()
          ) : (
            // Regular adversary damage indicators
            [1, 2, 3].map((level) => {
              const damage = parseInt(damageValue) || 0
              let isActive = false
              if (level === 1 && damage >= 1) isActive = true
              if (level === 2 && damage >= item.thresholds.major) isActive = true
              if (level === 3 && damage >= item.thresholds.severe) isActive = true
              
              return (
                <span 
                  key={level}
                  className={`damage-drop ${isActive ? 'active' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation()
                    // Set the input value to the threshold amount for this level
                    if (level === 1) {
                      setDamageValue('1')
                    } else if (level === 2) {
                      setDamageValue(item.thresholds.major.toString())
                    } else if (level === 3) {
                      setDamageValue(item.thresholds.severe.toString())
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
            className="damage-submit-btn"
            onClick={handleSubmit}
            title="Apply damage"
            disabled={!damageValue || parseInt(damageValue) < 1}
          >
            <CheckCircle size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default DamageInputPopup