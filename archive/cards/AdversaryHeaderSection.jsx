import React, { useState } from 'react'
import { Droplet, Activity, CheckCircle } from 'lucide-react'
import { TypeBadge, DifficultyBadge } from '../ui/Badges'
import Button from '../controls/Buttons'

const AdversaryHeaderSection = ({ item, editData, isEditMode, onInputChange, onSave, onCancel, onApplyDamage, onApplyHealing, onApplyStressChange, onDelete }) => {
  const baseName = item.baseName || item.name?.replace(/\s+\(\d+\)$/, '') || ''
  const duplicateNumber = item.duplicateNumber || (item.name?.match(/\((\d+)\)$/) ? parseInt(item.name.match(/\((\d+)\)$/)[1]) : 1)
  const [showDamageInput, setShowDamageInput] = useState(false)
  const [damageValue, setDamageValue] = useState('')
  
  return (
    <div className="expanded-header">
      <div className="row-content">
        {isEditMode ? (
          <>
            <div className="row-main">
              <div className="name-edit-group">
                <input
                  type="text"
                  className="form-input-inline"
                  value={editData.baseName || ''}
                  onChange={(e) => onInputChange('baseName', e.target.value)}
                  placeholder="Adversary name"
                />
                <span className="duplicate-number-display">({duplicateNumber})</span>
              </div>
              <div className="row-meta">
                <div className="tier-type-row">
                  <select
                    className="form-select-inline-small"
                    value={editData.tier || ''}
                    onChange={(e) => onInputChange('tier', parseInt(e.target.value))}
                  >
                    <option value={1}>Tier 1</option>
                    <option value={2}>Tier 2</option>
                    <option value={3}>Tier 3</option>
                    <option value={4}>Tier 4</option>
                    <option value={5}>Tier 5</option>
                  </select>
                  <select
                    className="form-select-inline-small"
                    value={editData.type || ''}
                    onChange={(e) => onInputChange('type', e.target.value)}
                  >
                    <option value="">Select Type</option>
                    <option value="Minion">Minion</option>
                    <option value="Solo">Solo</option>
                    <option value="Elite">Elite</option>
                    <option value="Boss">Boss</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="card-actions countdown-actions">
              <div className="countdown-control-buttons">
                <div className="hp-section">
                  <div 
                    className="hp-symbols cursor-pointer p-2px"
                    onClick={(e) => {
                      e.stopPropagation()
                      e.preventDefault()
                      const currentHp = item.hp || 0
                      const hpMax = item.hpMax || 1
                      const symbolsRect = e.currentTarget.getBoundingClientRect()
                      const clickX = e.clientX - symbolsRect.left
                      const symbolWidth = symbolsRect.width / hpMax
                      const clickedIndex = Math.floor(clickX / symbolWidth)
                      
                      if (clickedIndex < currentHp) {
                        // Clicked on filled pip - heal (reduce damage)
                        onApplyHealing && onApplyHealing(item.id, 1, item.hp)
                      } else {
                        // Clicked on empty pip - take damage
                        onApplyDamage && onApplyDamage(item.id, 1, item.hp, item.hpMax)
                      }
                    }}
                  >
                    {Array.from({ length: item.hpMax || 1 }, (_, i) => (
                      <span
                        key={i}
                        className={`pip-symbol ${i < (item.hp || 0) ? 'filled' : 'empty'} cursor-pointer`}
                        title={i < (item.hp || 0) ? 'Click to heal (reduce damage)' : 'Click to take damage'}
                      >
                        <Droplet size={16} />
                      </span>
                    ))}
                  </div>
                </div>
                {item.stressMax > 0 && (
                  <div className="stress-section">
                    <div 
                    className="stress-symbols cursor-pointer p-2px"
                    onClick={(e) => {
                      e.stopPropagation()
                      e.preventDefault()
                      const currentStress = item.stress || 0
                      const stressMax = item.stressMax || 1
                      const symbolsRect = e.currentTarget.getBoundingClientRect()
                      const clickX = e.clientX - symbolsRect.left
                      const symbolWidth = symbolsRect.width / stressMax
                      const clickedIndex = Math.floor(clickX / symbolWidth)
                      
                      if (clickedIndex < currentStress) {
                        // Clicked on filled pip - reduce stress
                        onApplyStressChange && onApplyStressChange(item.id, -1, item.stress, item.stressMax)
                      } else {
                        // Clicked on empty pip - increase stress
                        onApplyStressChange && onApplyStressChange(item.id, 1, item.stress, item.stressMax)
                      }
                    }}
                    >
                      {Array.from({ length: item.stressMax }, (_, i) => (
                        <span
                          key={i}
                            className={`pip-symbol ${i < (item.stress || 0) ? 'filled' : 'empty'} cursor-pointer`}
                            title={i < (item.stress || 0) ? 'Click to reduce stress' : 'Click to increase stress'}
                        >
                          <Activity size={16} />
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {item.difficulty && (
                <div className="difficulty-section">
                  <div 
                    onClick={(e) => {
                      e.stopPropagation()
                      if ((item.thresholds && item.thresholds.major && item.thresholds.severe) || item.type === 'Minion') {
                        setShowDamageInput(true)
                        setDamageValue(item.type === 'Minion' ? '1' : '')
                      }
                    }}
                    className={((item.thresholds && item.thresholds.major && item.thresholds.severe) || item.type === 'Minion') ? 'cursor-pointer' : 'cursor-default'}
                    title={(item.thresholds && item.thresholds.major && item.thresholds.severe) ? `Click to enter damage (thresholds: ${item.thresholds.major}/${item.thresholds.severe})` : item.type === 'Minion' ? 'Click to enter damage (minion mechanics)' : ''}
                  >
                    <DifficultyBadge difficulty={item.difficulty} />
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="row-main">
              <h4 className="row-title">
                {baseName} ({duplicateNumber})
              </h4>
              <div className="row-meta">
                <div className="tier-type-row">
                  <span className="tier-text">Tier {item.tier}</span>
                  {item.type && <TypeBadge type={item.type} />}
                </div>
              </div>
            </div>
            <div className="card-actions countdown-actions">
              <div className="countdown-control-buttons">
                <div className="hp-section">
                  <div 
                    className="hp-symbols cursor-pointer p-2px"
                    onClick={(e) => {
                      e.stopPropagation()
                      e.preventDefault()
                      const currentHp = item.hp || 0
                      const hpMax = item.hpMax || 1
                      const symbolsRect = e.currentTarget.getBoundingClientRect()
                      const clickX = e.clientX - symbolsRect.left
                      const symbolWidth = symbolsRect.width / hpMax
                      const clickedIndex = Math.floor(clickX / symbolWidth)
                      
                      if (clickedIndex < currentHp) {
                        // Clicked on filled pip - heal (reduce damage)
                        onApplyHealing && onApplyHealing(item.id, 1, item.hp)
                      } else {
                        // Clicked on empty pip - take damage
                        onApplyDamage && onApplyDamage(item.id, 1, item.hp, item.hpMax)
                      }
                    }}
                  >
                    {Array.from({ length: item.hpMax || 1 }, (_, i) => (
                      <span
                        key={i}
                        className={`pip-symbol ${i < (item.hp || 0) ? 'filled' : 'empty'} cursor-pointer`}
                        title={i < (item.hp || 0) ? 'Click to heal (reduce damage)' : 'Click to take damage'}
                      >
                        <Droplet size={16} />
                      </span>
                    ))}
                  </div>
                </div>
                {item.stressMax > 0 && (
                  <div className="stress-section">
                    <div 
                    className="stress-symbols cursor-pointer p-2px"
                    onClick={(e) => {
                      e.stopPropagation()
                      e.preventDefault()
                      const currentStress = item.stress || 0
                      const stressMax = item.stressMax || 1
                      const symbolsRect = e.currentTarget.getBoundingClientRect()
                      const clickX = e.clientX - symbolsRect.left
                      const symbolWidth = symbolsRect.width / stressMax
                      const clickedIndex = Math.floor(clickX / symbolWidth)
                      
                      if (clickedIndex < currentStress) {
                        // Clicked on filled pip - reduce stress
                        onApplyStressChange && onApplyStressChange(item.id, -1, item.stress, item.stressMax)
                      } else {
                        // Clicked on empty pip - increase stress
                        onApplyStressChange && onApplyStressChange(item.id, 1, item.stress, item.stressMax)
                      }
                    }}
                    >
                      {Array.from({ length: item.stressMax }, (_, i) => (
                        <span
                          key={i}
                            className={`pip-symbol ${i < (item.stress || 0) ? 'filled' : 'empty'} cursor-pointer`}
                            title={i < (item.stress || 0) ? 'Click to reduce stress' : 'Click to increase stress'}
                        >
                          <Activity size={16} />
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {item.difficulty && (
                <div className="difficulty-section">
                  <div 
                    onClick={(e) => {
                      e.stopPropagation()
                      if ((item.thresholds && item.thresholds.major && item.thresholds.severe) || item.type === 'Minion') {
                        setShowDamageInput(true)
                        setDamageValue(item.type === 'Minion' ? '1' : '')
                      }
                    }}
                    className={((item.thresholds && item.thresholds.major && item.thresholds.severe) || item.type === 'Minion') ? 'cursor-pointer' : 'cursor-default'}
                    title={(item.thresholds && item.thresholds.major && item.thresholds.severe) ? `Click to enter damage (thresholds: ${item.thresholds.major}/${item.thresholds.severe})` : item.type === 'Minion' ? 'Click to enter damage (minion mechanics)' : ''}
                  >
                    <DifficultyBadge difficulty={item.difficulty} />
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
      
      {/* Damage Input Popup - exact same as compact card */}
      {showDamageInput && ((item.thresholds && item.thresholds.major && item.thresholds.severe) || item.type === 'Minion') && (
        <div 
          className="damage-input-popup"
          onClick={(e) => {
            // Prevent event propagation to underlying card
            e.stopPropagation()
            
            // Close if clicking outside the input content
            if (e.target === e.currentTarget) {
              setShowDamageInput(false)
              setDamageValue('')
            }
          }}
        >
          <div 
            className="damage-input-content"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              type="number"
              inputMode="numeric"
              enterKeyHint="done"
              placeholder="Damage"
              min={item.type === 'Minion' ? "1" : "0"}
              value={damageValue}
              onChange={(e) => setDamageValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const damage = parseInt(damageValue)
                  if (damage > 0) {
                    if (item.type === 'Minion') {
                      // For minions, apply the raw damage amount (minion mechanics handle the rest)
                      onApplyDamage && onApplyDamage(item.id, damage, item.hp, item.hpMax)
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
                      onApplyDamage && onApplyDamage(item.id, hpDamage, item.hp, item.hpMax)
                    }
                    setShowDamageInput(false)
                    setDamageValue('')
                  }
                } else if (e.key === 'Escape') {
                  setShowDamageInput(false)
                  setDamageValue('')
                }
              }}
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
                className="btn-base btn-text"
                onClick={(e) => {
                  e.stopPropagation()
                  const damage = parseInt(damageValue)
                  if (damage > 0) {
                    if (item.type === 'Minion') {
                      // For minions, apply the raw damage amount (minion mechanics handle the rest)
                      onApplyDamage && onApplyDamage(item.id, damage, item.hp, item.hpMax)
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
                      onApplyDamage && onApplyDamage(item.id, hpDamage, item.hp, item.hpMax)
                    }
                    setShowDamageInput(false)
                    setDamageValue('')
                  }
                }}
                title="Apply damage"
                disabled={!damageValue || parseInt(damageValue) < 1}
              >
                <CheckCircle size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdversaryHeaderSection
