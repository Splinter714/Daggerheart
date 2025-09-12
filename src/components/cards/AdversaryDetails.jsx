import React, { useState } from 'react'
import { Droplet, Activity, CheckCircle } from 'lucide-react'
import { TypeBadge, DifficultyBadge } from '../ui/Badges'

const AdversaryDetails = ({ item, HeaderRight, onApplyDamage, onApplyHealing, onApplyStressChange, isEditMode, onSave, onCancel }) => {
  const [showDamageInput, setShowDamageInput] = useState(false)
  const [damageValue, setDamageValue] = useState('')
  
  // Edit mode state
  const [editData, setEditData] = useState(item)
  const [descriptionHeight, setDescriptionHeight] = useState('auto')
  const [motivesHeight, setMotivesHeight] = useState('auto')

  // Update edit data when item changes
  React.useEffect(() => {
    console.log('AdversaryDetails: Item prop changed:', item)
    setEditData(item)
  }, [item])

  // Recalculate description height on window resize
  React.useEffect(() => {
    const recalculateHeight = () => {
      if (editData.description) {
        // Try to find the actual textarea element first (when in edit mode)
        let actualTextarea = document.querySelector('.expanded-header .form-textarea-inline')
        
        // If not found, try to find any form-textarea-inline element to get base styles
        if (!actualTextarea) {
          actualTextarea = document.querySelector('.form-textarea-inline')
        }
        
        // If still not found, create a temporary element to get computed styles
        if (!actualTextarea) {
          const tempDiv = document.createElement('div')
          tempDiv.className = 'expanded-header'
          const tempTextarea = document.createElement('textarea')
          tempTextarea.className = 'form-textarea-inline'
          tempDiv.appendChild(tempTextarea)
          document.body.appendChild(tempDiv)
          actualTextarea = tempTextarea
        }
        
        const computedStyle = window.getComputedStyle(actualTextarea)
        
        // Create a temporary textarea with the same styles
        const tempTextarea = document.createElement('textarea')
        tempTextarea.style.cssText = `
          position: absolute;
          top: -9999px;
          left: -9999px;
          width: ${computedStyle.width};
          padding: ${computedStyle.padding};
          border: ${computedStyle.border};
          border-radius: ${computedStyle.borderRadius};
          font-family: ${computedStyle.fontFamily};
          font-size: ${computedStyle.fontSize};
          line-height: ${computedStyle.lineHeight};
          font-weight: ${computedStyle.fontWeight};
          font-style: ${computedStyle.fontStyle};
          box-sizing: ${computedStyle.boxSizing};
          resize: none;
          overflow: hidden;
          white-space: pre-wrap;
          word-wrap: break-word;
        `
        tempTextarea.value = editData.description
        document.body.appendChild(tempTextarea)
        
        const newHeight = tempTextarea.scrollHeight + 'px'
        document.body.removeChild(tempTextarea)
        
        // Clean up temporary element if we created one
        if (!document.querySelector('.expanded-header .form-textarea-inline') && !document.querySelector('.form-textarea-inline')) {
          const tempDiv = actualTextarea.parentElement
          if (tempDiv && tempDiv.className === 'expanded-header') {
            document.body.removeChild(tempDiv)
          }
        }
        
        setDescriptionHeight(newHeight)
      }
    }

    // Calculate initial height if description exists, or set default height
    if (editData.description && descriptionHeight === 'auto') {
      // Use setTimeout to ensure the DOM is ready
      setTimeout(recalculateHeight, 0)
    } else if (descriptionHeight === 'auto') {
      // Let browser calculate natural single-line height
      setDescriptionHeight('auto')
    }

    // Add resize listener
    window.addEventListener('resize', recalculateHeight)
    
    return () => {
      window.removeEventListener('resize', recalculateHeight)
    }
  }, [editData.description, descriptionHeight])

  // Ensure height is applied when switching to edit mode
  React.useEffect(() => {
    if (isEditMode && editData.description && descriptionHeight !== 'auto') {
      // Use setTimeout to ensure the textarea is rendered
      setTimeout(() => {
        const textarea = document.querySelector('.expanded-header .form-textarea-inline')
        if (textarea) {
          textarea.style.height = descriptionHeight
        }
      }, 0)
    }
  }, [isEditMode, editData.description, descriptionHeight])

  // Recalculate motives height on window resize
  React.useEffect(() => {
    const recalculateMotivesHeight = () => {
      if (editData.motives) {
        // Try to find the actual motives input element first (when in edit mode)
        let actualInput = document.querySelector('.motives-field .inline-field')
        
        // If not found, try to find any inline-field element to get base styles
        if (!actualInput) {
          actualInput = document.querySelector('.inline-field')
        }
        
        // If still not found, create a temporary element to get computed styles
        if (!actualInput) {
          const tempDiv = document.createElement('div')
          tempDiv.className = 'motives-field'
          const tempTextarea = document.createElement('textarea')
          tempTextarea.className = 'inline-field'
          tempDiv.appendChild(tempTextarea)
          document.body.appendChild(tempDiv)
          actualInput = tempTextarea
        }
        
        const computedStyle = window.getComputedStyle(actualInput)
        
        // Create a temporary textarea with the same styles
        const tempTextarea = document.createElement('textarea')
        tempTextarea.style.cssText = `
          position: absolute;
          top: -9999px;
          left: -9999px;
          width: ${computedStyle.width};
          padding: ${computedStyle.padding};
          border: ${computedStyle.border};
          border-radius: ${computedStyle.borderRadius};
          font-family: ${computedStyle.fontFamily};
          font-size: ${computedStyle.fontSize};
          line-height: ${computedStyle.lineHeight};
          font-weight: ${computedStyle.fontWeight};
          font-style: ${computedStyle.fontStyle};
          box-sizing: ${computedStyle.boxSizing};
          resize: none;
          overflow: hidden;
          white-space: pre-wrap;
          word-wrap: break-word;
        `
        tempTextarea.value = editData.motives
        document.body.appendChild(tempTextarea)
        
        const newHeight = tempTextarea.scrollHeight + 'px'
        document.body.removeChild(tempTextarea)
        
        // Clean up temporary element if we created one
        if (!document.querySelector('.motives-field .inline-field') && !document.querySelector('.inline-field')) {
          const tempDiv = actualInput.parentElement
          if (tempDiv && tempDiv.className === 'motives-field') {
            document.body.removeChild(tempDiv)
          }
        }
        
        setMotivesHeight(newHeight)
        
        // Also update any existing container heights
        const containers = document.querySelectorAll('.motives-field')
        containers.forEach(container => {
          container.style.height = newHeight
        })
      }
    }

    // Calculate initial height if motives exists, or set default height
    if (editData.motives && motivesHeight === 'auto') {
      // Use setTimeout to ensure the DOM is ready
      setTimeout(recalculateMotivesHeight, 0)
    } else if (motivesHeight === 'auto') {
      // Let browser calculate natural single-line height
      setMotivesHeight('auto')
    }

    // Add resize listener
    window.addEventListener('resize', recalculateMotivesHeight)
    
    return () => {
      window.removeEventListener('resize', recalculateMotivesHeight)
    }
  }, [editData.motives, motivesHeight])

  // Ensure motives height is applied when switching to edit mode
  React.useEffect(() => {
    if (isEditMode && editData.motives && motivesHeight !== 'auto') {
      // Use setTimeout to ensure the textarea is rendered
      setTimeout(() => {
        const textarea = document.querySelector('.motives-field .inline-field')
        if (textarea) {
          textarea.style.height = motivesHeight
          // Also update the container height
          const container = textarea.parentElement
          if (container) {
            container.style.height = motivesHeight
          }
        }
      }, 0)
    }
  }, [isEditMode, editData.motives, motivesHeight])

  const handleInputChange = (field, value) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleFeatureChange = (type, index, field, value) => {
    setEditData(prev => ({
      ...prev,
      [`${type}Features`]: prev[`${type}Features`].map((feature, i) => 
        i === index ? { ...feature, [field]: value } : feature
      )
    }))
  }

  const handleSave = () => {
    console.log('AdversaryDetails: Saving data:', editData)
    onSave(editData)
  }

  const renderFeatures = (features, type) => {
    if (!features || features.length === 0) return null
    
    const validFeatures = features.filter(f => f.name && f.name.trim())
    if (validFeatures.length === 0) return null
    
    if (isEditMode) {
      return (
        <>
          {validFeatures.map((feature, index) => (
            <div key={index} className="feature-edit-row">
              <input
                type="text"
                className="form-input-inline"
                value={feature.name || ''}
                onChange={(e) => handleFeatureChange(type.toLowerCase(), index, 'name', e.target.value)}
                placeholder="Feature name"
              />
              <textarea
                className="form-textarea-inline"
                value={feature.description || ''}
                onChange={(e) => handleFeatureChange(type.toLowerCase(), index, 'description', e.target.value)}
                placeholder="Feature description"
                rows={2}
              />
            </div>
          ))}
        </>
      )
    }
    
    return (
      <>
        {validFeatures.map((feature, index) => (
          <div key={index} className="feature-text">
            <span className="feature-name">{feature.name}</span>
            <span className="feature-separator"> - </span>
            {feature.description && (
              <span className="feature-description">
                {feature.description.split(/(\*\*.*?\*\*)/).map((part, i) => 
                  part.startsWith('**') && part.endsWith('**') ? 
                    <strong key={i}>{part.slice(2, -2)}</strong> : part
                )}
              </span>
            )}
          </div>
        ))}
      </>
    )
  }

  return (
    <div className="expanded-card adversary">
      {/* Header Section */}
      <div className="expanded-header">
        {isEditMode ? (
          <>
            <div className="edit-header-row">
              <input
                type="text"
                className="form-input-inline"
                value={editData.name || ''}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Adversary name"
              />
              <div className="edit-actions">
                <button 
                  className="save-button"
                  onClick={handleSave}
                >
                  Save
                </button>
                <button 
                  className="cancel-button"
                  onClick={onCancel}
                >
                  Cancel
                </button>
              </div>
            </div>
            <div className="edit-header-controls">
              <select
                className="form-select-inline-small"
                value={editData.tier || 1}
                onChange={(e) => handleInputChange('tier', parseInt(e.target.value))}
              >
                <option value={1}>Tier 1</option>
                <option value={2}>Tier 2</option>
                <option value={3}>Tier 3</option>
                <option value={4}>Tier 4</option>
              </select>
              <select
                className="form-select-inline-small"
                data-type="type"
                value={editData.type || ''}
                onChange={(e) => handleInputChange('type', e.target.value)}
              >
                <option value="">Type</option>
                <option value="Solo">Solo</option>
                <option value="Bruiser">Bruiser</option>
                <option value="Horde">Horde</option>
                <option value="Minion">Minion</option>
                <option value="Ranged">Ranged</option>
                <option value="Standard">Standard</option>
                <option value="Leader">Leader</option>
                <option value="Skulk">Skulk</option>
                <option value="Social">Social</option>
                <option value="Support">Support</option>
              </select>
            </div>
            <textarea
              className="form-textarea-inline"
              value={editData.description || ''}
              onChange={(e) => {
                handleInputChange('description', e.target.value)
                // Auto-resize textarea and save height
                e.target.style.height = 'auto'
                const newHeight = e.target.scrollHeight + 'px'
                e.target.style.height = newHeight
                setDescriptionHeight(newHeight)
              }}
              placeholder="Description"
              style={{ height: descriptionHeight }}
            />
            <div className="motives-row">
              <span className="motives-label">Motives & Tactics:</span>
              <div className="motives-field" style={{ height: motivesHeight }}>
                <textarea
                  className="inline-field"
                  value={editData.motives || ''}
                  onChange={(e) => {
                    handleInputChange('motives', e.target.value)
                    // Auto-resize textarea and save height
                    e.target.style.height = 'auto'
                    const newHeight = e.target.scrollHeight + 'px'
                    e.target.style.height = newHeight
                    setMotivesHeight(newHeight)
                    
                    // Update the container height to match
                    const container = e.target.parentElement
                    if (container) {
                      container.style.height = newHeight
                    }
                  }}
                  placeholder="Motives & Tactics"
                  style={{ height: motivesHeight }}
                />
              </div>
            </div>
          </>
        ) : (
          <>
            <h2>{item.name}</h2>
            <div className="tier-type-badges">
              <span className="tier-badge">Tier {item.tier}</span>
              <span className="type-badge">{item.type}</span>
            </div>
            {item.description && (
              <div className="description-text" style={{ height: descriptionHeight }}>
                {item.description}
              </div>
            )}
            {item.motives && (
              <div className="motives-row">
                <span className="motives-label">Motives & Tactics:</span>
                <div className="motives-field" style={{ height: motivesHeight }}>
                  <textarea
                    className="inline-field"
                    value={item.motives || ""}
                    readOnly
                    aria-readonly="true"
                    tabIndex={-1}
                    style={{ height: motivesHeight }}
                  />
                </div>
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Core Stats Block */}
      <div className="core-stats-block">
        {/* Primary Stats Row */}
        <div className="stats-row">
          {isEditMode ? (
            <>
              <span className="stat-item">
                <strong>Diff:</strong> 
                <input
                  type="number"
                  className="form-input-inline-small"
                  value={editData.difficulty || ''}
                  onChange={(e) => handleInputChange('difficulty', e.target.value === '' ? '' : parseInt(e.target.value))}
                  min="1"
                  max="21"
                />
              </span>
              <span className="stat-separator">|</span>
              <span className="stat-item">
                <strong>Thresholds:</strong> 
                <input
                  type="number"
                  className="form-input-inline-small"
                  value={editData.thresholds?.major || ''}
                  onChange={(e) => handleInputChange('thresholds', { ...editData.thresholds, major: e.target.value === '' ? '' : parseInt(e.target.value) })}
                  min="1"
                  max="20"
                />
                /
                <input
                  type="number"
                  className="form-input-inline-small"
                  value={editData.thresholds?.severe || ''}
                  onChange={(e) => handleInputChange('thresholds', { ...editData.thresholds, severe: e.target.value === '' ? '' : parseInt(e.target.value) })}
                  min="1"
                  max="25"
                />
              </span>
              <span className="stat-separator">|</span>
              <span className="stat-item">
                <strong>HP:</strong> 
                <input
                  type="number"
                  className="form-input-inline-small"
                  value={editData.hpMax || ''}
                  onChange={(e) => handleInputChange('hpMax', e.target.value === '' ? '' : parseInt(e.target.value))}
                  min="1"
                  max="12"
                />
              </span>
              <span className="stat-separator">|</span>
              <span className="stat-item">
                <strong>Stress:</strong> 
                <input
                  type="number"
                  className="form-input-inline-small"
                  value={editData.stressMax || ''}
                  onChange={(e) => handleInputChange('stressMax', e.target.value === '' ? '' : parseInt(e.target.value))}
                  min="1"
                  max="10"
                />
              </span>
            </>
          ) : (
            <>
              <span className="stat-item">
                <strong>Diff:</strong> 
                <input
                  type="number"
                  className="form-input-inline-small"
                  value={item.difficulty || ''}
                  readOnly
                  aria-readonly="true"
                  tabIndex={-1}
                />
              </span>
              <span className="stat-separator">|</span>
              <span className="stat-item">
                <strong>Thresholds:</strong> 
                <input
                  type="number"
                  className="form-input-inline-small"
                  value={item.thresholds?.major || ''}
                  readOnly
                  aria-readonly="true"
                  tabIndex={-1}
                />
                /
                <input
                  type="number"
                  className="form-input-inline-small"
                  value={item.thresholds?.severe || ''}
                  readOnly
                  aria-readonly="true"
                  tabIndex={-1}
                />
              </span>
              <span className="stat-separator">|</span>
              <span className="stat-item">
                <strong>HP:</strong> 
                <input
                  type="number"
                  className="form-input-inline-small"
                  value={item.hpMax || ''}
                  readOnly
                  aria-readonly="true"
                  tabIndex={-1}
                />
              </span>
              <span className="stat-separator">|</span>
              <span className="stat-item">
                <strong>Stress:</strong> 
                <input
                  type="number"
                  className="form-input-inline-small"
                  value={item.stressMax || ''}
                  readOnly
                  aria-readonly="true"
                  tabIndex={-1}
                />
              </span>
            </>
          )}
        </div>
        
        {/* Combat Stats Row */}
        <div className="stats-row">
          {isEditMode ? (
            <>
              <span className="stat-item">
                <strong>ATK:</strong> 
                <input
                  type="number"
                  className="form-input-inline-small"
                  value={editData.atk || ''}
                  onChange={(e) => handleInputChange('atk', e.target.value === '' ? '' : parseInt(e.target.value))}
                  min="-10"
                  max="10"
                />
              </span>
              <span className="stat-separator">|</span>
              <span className="stat-item">
                <strong>
                  <input
                    type="text"
                    className="form-input-inline-small"
                    value={editData.weapon || ''}
                    onChange={(e) => handleInputChange('weapon', e.target.value)}
                    placeholder="Weapon"
                  />
                </strong>: 
                <select
                  className="form-select-inline-small"
                  data-field="range"
                  value={editData.range || ''}
                  onChange={(e) => handleInputChange('range', e.target.value)}
                >
                  <option value="">Select Range</option>
                  <option value="Melee">Melee</option>
                  <option value="Very Close">Very Close</option>
                  <option value="Close">Close</option>
                  <option value="Far">Far</option>
                  <option value="Very Far">Very Far</option>
                </select>
              </span>
              <span className="stat-separator">|</span>
              <span className="stat-item">
                <input
                  type="text"
                  className="form-input-inline-small"
                  value={editData.damage || ''}
                  onChange={(e) => handleInputChange('damage', e.target.value)}
                  placeholder="1d12+2 phy"
                />
              </span>
            </>
          ) : (
            <>
              <span className="stat-item">
                <strong>ATK:</strong> 
                <input
                  type="number"
                  className="form-input-inline-small"
                  value={item.atk || ''}
                  readOnly
                  aria-readonly="true"
                  tabIndex={-1}
                />
              </span>
              <span className="stat-separator">|</span>
              <span className="stat-item">
                <strong>
                  <input
                    type="text"
                    className="form-input-inline-small"
                    value={item.weapon || ''}
                    readOnly
                    aria-readonly="true"
                    tabIndex={-1}
                  />
                </strong>: 
                <select
                  className="form-select-inline-small"
                  data-field="range"
                  value={item.range || ''}
                  disabled
                  tabIndex={-1}
                >
                  <option value="">Select Range</option>
                  <option value="Melee">Melee</option>
                  <option value="Very Close">Very Close</option>
                  <option value="Close">Close</option>
                  <option value="Far">Far</option>
                  <option value="Very Far">Very Far</option>
                </select>
              </span>
              <span className="stat-separator">|</span>
              <span className="stat-item">
                <input
                  type="text"
                  className="form-input-inline-small"
                  value={item.damage || ''}
                  readOnly
                  aria-readonly="true"
                  tabIndex={-1}
                />
              </span>
            </>
          )}
        </div>
        
        {/* Experience Row */}
        {item.experience && item.experience.length > 0 && (
          <div className="stats-row">
            <span className="stat-item">
              <strong>Experience:</strong> {item.experience.map(exp => 
                typeof exp === 'string' ? exp : `${exp.name} ${exp.modifier >= 0 ? '+' : ''}${exp.modifier}`
              ).join(', ')}
            </span>
          </div>
        )}
      </div>
      
      {/* Interactive Controls Section */}
      <div className="interactive-controls-section">
        <div className="controls-row">
          {/* HP Controls */}
          <div className="control-group hp-controls">
            <div className="control-label">HP</div>
            <div 
              className="hp-symbols"
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
              style={{ cursor: 'pointer', padding: '4px' }}
            >
              {Array.from({ length: item.hpMax || 1 }, (_, i) => (
                <span
                  key={i}
                  className={`countdown-symbol ${i < (item.hp || 0) ? 'filled' : 'empty'}`}
                  title={i < (item.hp || 0) ? 'Click to heal (reduce damage)' : 'Click to take damage'}
                  style={{ cursor: 'pointer' }}
                >
                  <Droplet size={20} />
                </span>
              ))}
            </div>
          </div>

          {/* Stress Controls */}
          {item.stressMax > 0 && (
            <div className="control-group stress-controls">
              <div className="control-label">Stress</div>
              <div 
                className="stress-symbols"
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
                style={{ cursor: 'pointer', padding: '4px' }}
              >
                {Array.from({ length: item.stressMax }, (_, i) => (
                  <span
                    key={i}
                    className={`countdown-symbol ${i < (item.stress || 0) ? 'filled' : 'empty'}`}
                    title={i < (item.stress || 0) ? 'Click to reduce stress' : 'Click to increase stress'}
                    style={{ cursor: 'pointer' }}
                  >
                    <Activity size={20} />
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Damage Input */}
          {item.difficulty && ((item.thresholds && item.thresholds.major && item.thresholds.severe) || item.type === 'Minion') && (
            <div className="control-group damage-controls">
              <div className="control-label">Damage</div>
              <div 
                onClick={(e) => {
                  e.stopPropagation()
                  if ((item.thresholds && item.thresholds.major && item.thresholds.severe) || item.type === 'Minion') {
                    setShowDamageInput(true)
                    setDamageValue(item.type === 'Minion' ? '1' : '')
                  }
                }}
                style={{ cursor: ((item.thresholds && item.thresholds.major && item.thresholds.severe) || item.type === 'Minion') ? 'pointer' : 'default' }}
                title={(item.thresholds && item.thresholds.major && item.thresholds.severe) ? `Click to enter damage (thresholds: ${item.thresholds.major}/${item.thresholds.severe})` : item.type === 'Minion' ? 'Click to enter damage (minion mechanics)' : ''}
              >
                <DifficultyBadge difficulty={item.difficulty} />
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Features Section */}
      <div className="features-section">
        {item.features?.filter(f => f.type === 'Passive').length > 0 && (
          <div className="feature-type-section">
            <div className="feature-type-header">
              <h4>Passives</h4>
              <hr />
            </div>
            {renderFeatures(item.features.filter(f => f.type === 'Passive'), 'Passive')}
          </div>
        )}
        
        {item.features?.filter(f => f.type === 'Action').length > 0 && (
          <div className="feature-type-section">
            <div className="feature-type-header">
              <h4>Actions</h4>
              <hr />
            </div>
            {renderFeatures(item.features.filter(f => f.type === 'Action'), 'Action')}
          </div>
        )}
        
        {item.features?.filter(f => f.type === 'Reaction').length > 0 && (
          <div className="feature-type-section">
            <div className="feature-type-header">
              <h4>Reactions</h4>
              <hr />
            </div>
            {renderFeatures(item.features.filter(f => f.type === 'Reaction'), 'Reaction')}
          </div>
        )}
      </div>
      
      {/* Damage Input Popup */}
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
                className="damage-submit-btn"
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

export default AdversaryDetails
