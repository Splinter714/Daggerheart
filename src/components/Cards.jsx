import React, { useState } from 'react'
import { Droplet, Activity, CheckCircle, Pencil } from 'lucide-react'
import Button from './Buttons'
import { Badge, DifficultyBadge, TypeBadge } from './Badges'
// import Creator from './Creator'
import CountdownCard from './cards/CountdownCard'

// Add Item Button Component
const AddItemButton = ({ type, onClick, hasItems = false }) => {
  return (
    <div 
      className={`add-item-button ${hasItems ? 'has-items' : ''}`}
      onClick={onClick}
      title={`Add ${type}`}
    >
      <div className="add-item-content">
        <span className="add-item-icon">+</span>
        <span className="add-item-text">add {type}</span>
      </div>
    </div>
  )
}

const Cards = ({ 
  item, 
  type, // 'countdown', 'adversary', or 'environment'
  mode = 'compact', // 'compact' or 'expanded'
  _index = 0,
  onDelete,
  onEdit,
  onApplyDamage,
  onApplyHealing,
  onApplyStressChange,
  onIncrement,
  onDecrement,
  onSave,
  onExitEditMode,
  onClick,
  dragAttributes,
  dragListeners,
  isEditMode = false
}) => {
  const [showDamageInput, setShowDamageInput] = useState(false)
  const [damageValue, setDamageValue] = useState('')
  
  // Edit mode state - moved to top level to avoid conditional hook calls
  function getDefaultData() {
    if (type === 'countdown') {
      return { name: '', description: '', max: 5, value: 0 }
    } else if (type === 'adversary') {
      return { name: '', description: '', type: '', tier: 1, difficulty: 1, hpMax: 1, stressMax: 0, abilities: [], traits: [] }
    } else {
      return { name: '', description: '', type: '', tier: 1, difficulty: 1, effects: [], hazards: [] }
    }
  }

  // Ensure all required arrays are initialized
  function getInitialData() {
    const defaultData = getDefaultData()
    if (item) {
      // When editing, ensure all required arrays exist
      return {
        ...defaultData,
        ...item,
        abilities: item.abilities || [],
        traits: item.traits || [],
        effects: item.effects || [],
        hazards: item.hazards || []
      }
    }
    return defaultData
  }
  
  const [editData, setEditData] = useState(getInitialData())

  // Render based on mode
  switch (mode) {
    case 'compact':
      return renderCompact()
    case 'expanded':
      return renderExpanded()
    default:
      return renderCompact()
  }

  function renderCompact() {
    if (type === 'countdown') {
      return (
        <CountdownCard
          item={item}
          mode={mode}
          onClick={onClick}
          onDelete={onDelete}
          onIncrement={onIncrement}
          onDecrement={onDecrement}
          isEditMode={isEditMode}
          dragAttributes={dragAttributes}
          dragListeners={dragListeners}
        />
      )
    } else if (type === 'adversary') {
      return (
        <div 
          className={`simple-list-row compact adversary ${(item.hp || 0) >= (item.hpMax || 1) ? 'dead' : ''} ${dragAttributes && dragListeners ? 'edit-mode' : ''}`}
          onClick={() => onClick && onClick(item)}
          style={{ cursor: onClick ? 'pointer' : 'default' }}
        >
          {renderDragHandle()}
          <div className="row-content">
            <div className="row-main">
              <h4 className="row-title">{item.name}</h4>
              <div className="row-meta">
                {item.type && <TypeBadge type={item.type} />}
              </div>
            </div>
            <div className="card-actions countdown-actions">
              <div className="countdown-control-buttons">
                <div className="hp-section">
                  <div className="hp-symbols">
                    {Array.from({ length: item.hpMax || 1 }, (_, i) => (
                      <span 
                        key={i} 
                        className={`countdown-symbol ${i < (item.hp || 0) ? 'filled' : 'empty'}`}
                        title={i < (item.hp || 0) ? 'Click to heal (reduce damage)' : 'Click to take damage'}
                        onClick={(e) => {
                          e.stopPropagation()
                          e.preventDefault()
                          if (i < (item.hp || 0)) {
                            // Clicking a filled heart heals (reduces damage)
                            onApplyHealing && onApplyHealing(item.id, 1, item.hp)
                          } else {
                            // Clicking an empty heart takes damage
                            onApplyDamage && onApplyDamage(item.id, 1, item.hp, item.hpMax)
                          }
                        }}
                        style={{ cursor: 'pointer' }}
                      >
                        <Droplet size={16} />
                      </span>
                    ))}
                  </div>
                </div>
                {item.stressMax > 0 && (
                  <div className="stress-section">
                    <div className="stress-symbols">
                      {Array.from({ length: item.stressMax }, (_, i) => (
                        <span 
                          key={i} 
                          className={`countdown-symbol ${i < (item.stress || 0) ? 'filled' : 'empty'}`}
                          title={i < (item.stress || 0) ? 'Click to reduce stress' : 'Click to increase stress'}
                          onClick={(e) => {
                            e.stopPropagation()
                            e.preventDefault()
                            if (i < (item.stress || 0)) {
                              // Clicking a filled lightning bolt reduces stress
                              onApplyStressChange && onApplyStressChange(item.id, -1, item.stress, item.stressMax)
                            } else {
                              // Clicking an empty lightning bolt increases stress
                              onApplyStressChange && onApplyStressChange(item.id, 1, item.stress, item.stressMax)
                            }
                          }}
                          style={{ cursor: 'pointer' }}
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
                    style={{ cursor: ((item.thresholds && item.thresholds.major && item.thresholds.severe) || item.type === 'Minion') ? 'pointer' : 'default' }}
                    title={(item.thresholds && item.thresholds.major && item.thresholds.severe) ? `Click to enter damage (thresholds: ${item.thresholds.major}/${item.thresholds.severe})` : item.type === 'Minion' ? 'Click to enter damage (minion mechanics)' : ''}
                  >
                    <DifficultyBadge difficulty={item.difficulty} />
                  </div>
                </div>
              )}
              <div className="countdown-delete-space">
                {/* Only show delete button in edit mode */}
                {dragAttributes && dragListeners && (
                  <Button
                    action="delete"
                    size="sm"
                    immediate={true}
                    onClick={(e) => {
                      e.stopPropagation()
                      e.preventDefault()
                      onDelete && onDelete(item.id)
                    }}
                    title="Delete adversary"
                  >
                    ×
                  </Button>
                )}
              </div>
            </div>
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
    } else {
      return (
        <div 
          className={`simple-list-row compact environment ${dragAttributes && dragListeners ? 'edit-mode' : ''}`}
          onClick={() => onClick && onClick(item)}
          style={{ cursor: onClick ? 'pointer' : 'default' }}
        >
          {renderDragHandle()}
          <div className="row-content">
            <div className="row-main">
              <h4 className="row-title">{item.name}</h4>
              <div className="row-meta">
                {item.type && <TypeBadge type={item.type} />}
              </div>
            </div>
            {renderCardActions()}
          </div>
        </div>
      )
    }
  }

  function renderExpanded() {
    if (isEditMode) {
      return renderExpandedEdit()
    } else {
      return renderExpandedDisplay()
    }
  }

  function renderExpandedDisplay() {
    if (type === 'countdown') {
      return (
        <CountdownCard
          item={item}
          mode={mode}
          onDelete={onDelete}
          onIncrement={onIncrement}
          onDecrement={onDecrement}
        />
      )
    } else if (type === 'adversary') {
      return (
        <div className="adversary-details">
          {/* Motives & Tactics */}
          {item.motives && (
            <div className="motives-section">
              <h3>Motives & Tactics</h3>
              <p><em>{item.motives}</em></p>
            </div>
          )}

          {/* Core Stats */}
          <div className="core-stats-section">
            <h3>Core Stats</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-label">Difficulty:</span>
                <span className="stat-value">{item.difficulty}</span>
              </div>
              {item.thresholds && (
                <div className="stat-item">
                  <span className="stat-label">Thresholds:</span>
                  <span className="stat-value">{item.thresholds.major}/{item.thresholds.severe}</span>
                </div>
              )}
              <div className="stat-item">
                <span className="stat-label">ATK:</span>
                <span className="stat-value">+{item.atk}</span>
              </div>
              {item.weapon && (
                <div className="stat-item">
                  <span className="stat-label">Weapon:</span>
                  <span className="stat-value">{item.weapon}: {item.range} | {item.damage}</span>
                </div>
              )}
            </div>
          </div>

          {/* Experience */}
          {item.experience && item.experience.length > 0 && (
            <div className="experience-section">
              <h3>Experience</h3>
              <p>{item.experience.join(', ')}</p>
            </div>
          )}

          {/* Description */}
          {item.description && (
            <div className="description-section">
              <h3>Description</h3>
              <p><em>{item.description}</em></p>
            </div>
          )}
          
          {/* Features */}
          {item.features && item.features.length > 0 && (
            <div className="features-section">
              <h3>Features</h3>
              {(() => {
                // Group features by type
                const featuresByType = item.features.reduce((acc, feature) => {
                  const type = feature.type || 'Other';
                  if (!acc[type]) acc[type] = [];
                  acc[type].push(feature);
                  return acc;
                }, {});

                // Define order for types
                const typeOrder = ['Passive', 'Action', 'Reaction', 'Other'];
                
                return typeOrder.map(type => {
                  if (!featuresByType[type]) return null;
                  
                  return (
                    <div key={type} className="feature-type-group">
                      <h4 className="feature-type-title">{type}</h4>
                      {featuresByType[type].map((feature, i) => {
                        return (
                          <div key={i} className="feature-item">
                            <div className="feature-header">
                              <span className="feature-name"><strong>{feature.name}</strong></span>
                            </div>
                            <div className="feature-description">
                              {renderInteractiveDescription(feature.description)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                }).filter(Boolean);
              })()}
            </div>
          )}

          {/* Legacy abilities/traits for backwards compatibility */}
          {item.abilities && item.abilities.length > 0 && (
            <div className="abilities-section">
              <h3>Abilities</h3>
              <ul>
                {item.abilities.map((ability, i) => (
                  <li key={i}>{ability}</li>
                ))}
              </ul>
            </div>
          )}
          
          {item.traits && item.traits.length > 0 && (
            <div className="traits-section">
              <h3>Traits</h3>
              <ul>
                {item.traits.map((trait, i) => (
                  <li key={i}>{trait}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )
    } else {
      return (
        <div className="expanded-card environment">
          <div className="expanded-header">
            <h2>{item.name}</h2>
            <div className="header-actions">
              <Button
                action="edit"
                size="sm"
                onClick={() => onEdit && onEdit(item)}
                title="Edit environment"
                aria-label="Edit environment"
              >
                <Pencil size={16} />
              </Button>
              {onDelete && (
                <Button
                  action="delete"
                  size="sm"
                  onClick={() => onDelete(item.id)}
                  title="Delete environment"
                >
                  ×
                </Button>
              )}
            </div>
          </div>
          
          <div className="expanded-content">
            <div className="meta-section">
              <div className="meta-row">
                <span className="meta-label">Type:</span>
                <TypeBadge type={item.type} />
              </div>
              <div className="meta-row">
                <span className="meta-label">Tier:</span>
                <Badge variant="tier">Tier {item.tier}</Badge>
              </div>
              <div className="meta-row">
                <span className="meta-label">Difficulty:</span>
                <DifficultyBadge difficulty={item.difficulty} />
              </div>
            </div>
            
            {item.description && (
              <div className="description-section">
                <h3>Description</h3>
                <p>{item.description}</p>
              </div>
            )}
            
            {item.effects && item.effects.length > 0 && (
              <div className="effects-section">
                <h3>Effects</h3>
                <ul>
                  {item.effects.map((effect, i) => (
                    <li key={i}>{effect}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {item.hazards && item.hazards.length > 0 && (
              <div className="hazards-section">
                <h3>Hazards</h3>
                <ul>
                  {item.hazards.map((hazard, i) => (
                    <li key={i}>{hazard}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )
    }
  }

  function renderExpandedEdit() {
    const isCreating = !item

    function handleInputChange(field, value) {
      setEditData(prev => ({
        ...prev,
        [field]: value
      }))
    }

    function handleArrayChange(field, index, value) {
      setEditData(prev => ({
        ...prev,
        [field]: prev[field].map((item, i) => i === index ? value : item)
      }))
    }

    function addArrayItem(field) {
      setEditData(prev => ({
        ...prev,
        [field]: [...prev[field], '']
      }))
    }

    function removeArrayItem(field, index) {
      setEditData(prev => ({
        ...prev,
        [field]: prev[field].filter((_, i) => i !== index)
      }))
    }

    function handleSave() {
      if (!editData.name.trim()) {
        alert('Name is required')
        return
      }
      
      const itemData = {
        ...editData,
        name: editData.name.trim(),
        description: editData.description.trim(),
        ...(type === 'adversary' && {
          hp: 0,
          hpMax: editData.hpMax,
          stress: 0,
          stressMax: editData.stressMax,
          abilities: editData.abilities.filter(ability => ability.trim()),
          traits: editData.traits.filter(trait => trait.trim())
        }),
        ...(type === 'environment' && {
          effects: editData.effects.filter(effect => effect.trim()),
          hazards: editData.hazards.filter(hazard => hazard.trim())
        }),
        ...(type === 'countdown' && {
          max: editData.max,
          value: editData.value
        })
      }
      
      onSave && onSave(itemData)
    }

    return (
      <div className="expanded-card edit-mode">
        <div className="edit-header">
          <h2>{isCreating ? 'Create' : 'Edit'} {type === 'adversary' ? 'Adversary' : type === 'environment' ? 'Environment' : 'Countdown'}</h2>
          <div className="edit-actions">
            <Button
              action="save"
              size="sm"
              onClick={handleSave}
            >
              Save
            </Button>
            <Button
              action="secondary"
              size="sm"
              onClick={() => onExitEditMode && onExitEditMode()}
            >
              Cancel
            </Button>
          </div>
        </div>
        
        <div className="expanded-content">
          {/* Basic Information */}
          <div className="meta-section">
            <div className="meta-row">
              <span className="meta-label">Name:</span>
              <input
                type="text"
                value={editData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder={`Enter ${type} name`}
                className="form-input"
              />
            </div>

            <div className="meta-row">
              <span className="meta-label">Tier:</span>
              <select
                value={editData.tier}
                onChange={(e) => handleInputChange('tier', parseInt(e.target.value))}
                className="form-select"
              >
                {[1, 2, 3, 4, 5].map(tier => (
                  <option key={tier} value={tier}>Tier {tier}</option>
                ))}
              </select>
            </div>

            <div className="meta-row">
              <span className="meta-label">Type:</span>
              <input
                type="text"
                value={editData.type}
                onChange={(e) => handleInputChange('type', e.target.value)}
                placeholder="e.g., Beast, Humanoid, Undead"
                className="form-input"
              />
            </div>

            <div className="meta-row">
              <span className="meta-label">Difficulty:</span>
              <select
                value={editData.difficulty}
                onChange={(e) => handleInputChange('difficulty', parseInt(e.target.value))}
                className="form-select"
              >
                {[1, 2, 3, 4, 5].map(diff => (
                  <option key={diff} value={diff}>Difficulty {diff}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Description section - always show, same structure as display mode */}
          <div className="description-section">
            <h3>Description</h3>
            <textarea
              value={editData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder={`Describe this ${type}`}
              className="form-textarea"
              rows={3}
            />
          </div>

          {/* Type-specific fields */}
          {type === 'countdown' && (
            <div className="stats-section">
              <h3>Countdown Settings</h3>
              
              <div className="stat-row">
                <span className="stat-label">Max Value:</span>
                <input
                  type="number"
                  inputMode="numeric"
                  enterKeyHint="done"
                  min="1"
                  max="20"
                  value={editData.max}
                  onChange={(e) => handleInputChange('max', parseInt(e.target.value) || 5)}
                  className="form-input"
                />
              </div>

              <div className="stat-row">
                <span className="stat-label">Starting Value:</span>
                <input
                  type="number"
                  inputMode="numeric"
                  enterKeyHint="done"
                  min="0"
                  max={editData.max}
                  value={editData.value}
                  onChange={(e) => handleInputChange('value', parseInt(e.target.value) || 0)}
                  className="form-input"
                />
              </div>
            </div>
          )}

          {type === 'adversary' && (
            <>
              <div className="stats-section">
                <h3>Combat Stats</h3>
                
                <div className="stat-row">
                  <span className="stat-label">Max HP:</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    enterKeyHint="done"
                    min="1"
                    value={editData.hpMax}
                    onChange={(e) => handleInputChange('hpMax', parseInt(e.target.value) || 1)}
                    className="form-input"
                  />
                </div>

                <div className="stat-row">
                  <span className="stat-label">Max Stress:</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    enterKeyHint="done"
                    min="0"
                    value={editData.stressMax}
                    onChange={(e) => handleInputChange('stressMax', parseInt(e.target.value) || 0)}
                    className="form-input"
                  />
                </div>
              </div>

              {/* Abilities section - same structure as display mode */}
              <div className="abilities-section">
                <h3>Abilities</h3>
                {editData.abilities.map((ability, index) => (
                  <div key={index} className="array-input-row">
                    <input
                      type="text"
                      value={ability}
                      onChange={(e) => handleArrayChange('abilities', index, e.target.value)}
                      placeholder="Enter ability description"
                      className="form-input"
                    />
                    <Button
                      action="delete"
                      onClick={() => removeArrayItem('abilities', index)}
                      size="sm"
                      title="Remove"
                    />
                  </div>
                ))}
                <Button
                  action="add"
                  onClick={() => addArrayItem('abilities')}
                  size="sm"
                  title="Add Ability"
                >
                  Add Ability
                </Button>
              </div>

              {/* Traits section - same structure as display mode */}
              <div className="traits-section">
                <h3>Traits</h3>
                {editData.traits.map((trait, index) => (
                  <div key={index} className="array-input-row">
                    <input
                      type="text"
                      value={trait}
                      onChange={(e) => handleArrayChange('traits', index, e.target.value)}
                      placeholder="Enter trait description"
                      className="form-input"
                    />
                    <Button
                      action="delete"
                      onClick={() => removeArrayItem('traits', index)}
                      size="sm"
                      title="Remove"
                    />
                  </div>
                ))}
                <Button
                  action="add"
                  onClick={() => addArrayItem('traits')}
                  size="sm"
                  title="Add Trait"
                >
                  Add Trait
                </Button>
              </div>
            </>
          )}

          {type === 'environment' && (
            <>
              {/* Effects section - same structure as display mode */}
              <div className="effects-section">
                <h3>Effects</h3>
                {editData.effects.map((effect, index) => (
                  <div key={index} className="array-input-row">
                    <input
                      type="text"
                      value={effect}
                      onChange={(e) => handleArrayChange('effects', index, e.target.value)}
                      placeholder="Describe environmental effect"
                      className="form-input"
                    />
                    <Button
                      action="delete"
                      onClick={() => removeArrayItem('effects', index)}
                      size="sm"
                      title="Remove"
                    />
                  </div>
                ))}
                <Button
                  action="add"
                  onClick={() => addArrayItem('effects')}
                  size="sm"
                  title="Add Effect"
                >
                  Add Effect
                </Button>
              </div>

              {/* Hazards section - same structure as display mode */}
              <div className="hazards-section">
                <h3>Hazards</h3>
                {editData.hazards.map((hazard, index) => (
                  <div key={index} className="array-input-row">
                    <input
                      type="text"
                      value={hazard}
                      onChange={(e) => handleArrayChange('hazards', index, e.target.value)}
                      placeholder="Describe environmental hazard"
                      className="form-input"
                    />
                    <Button
                      action="delete"
                      onClick={() => removeArrayItem('hazards', index)}
                      size="sm"
                      title="Remove"
                    />
                  </div>
                ))}
                <Button
                  action="add"
                  onClick={() => addArrayItem('hazards')}
                  size="sm"
                  title="Add Hazard"
                >
                  Add Hazard
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    )
  }

  // Helper function to render card actions
  function renderCardActions() {
    if (type === 'countdown') {
      return (
        <div className="card-actions countdown-actions">
          <div className="countdown-control-buttons">
            <Button
              action="decrement"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                e.preventDefault()
                console.log('Decrement button clicked, onDecrement function:', onDecrement)
                if (onDecrement) {
                  console.log('Calling onDecrement with id:', item.id)
                  onDecrement(item.id)
                } else {
                  console.log('onDecrement is undefined!')
                }
              }}
              title="Decrease progress"
            >
              −
            </Button>
            <Button
              action="increment"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                e.preventDefault()
                console.log('Increment button clicked, onIncrement function:', onIncrement, 'current countdown value:', item.value, 'max:', item.max)
                if (onIncrement) {
                  console.log('Calling onIncrement with id:', item.id)
                  onIncrement(item.id)
                } else {
                  console.log('onIncrement is undefined!')
                }
              }}
              title={item.value >= item.max ? (item.loop && item.loop !== 'none' ? "Loop countdown" : "Countdown at max") : "Increase progress"}
            >
              {item.value >= item.max ? (item.loop && item.loop !== 'none' ? "⟳" : "+") : "+"}
            </Button>
            {item.value >= item.max && (!item.loop || item.loop === 'none') && (
              <Button
                action="delete"
                size="sm"
                immediate={true}
                onClick={(e) => {
                  e.stopPropagation()
                  e.preventDefault()
                  onDelete && onDelete(item.id)
                }}
                title="Delete countdown"
              >
                ×
              </Button>
            )}
          </div>
          <div className="countdown-delete-space">
            {/* Only show delete button in edit mode */}
            {dragAttributes && dragListeners && (
              <Button
                action="delete"
                size="sm"
                immediate={true}
                onClick={(e) => {
                  e.stopPropagation()
                  e.preventDefault()
                  onDelete && onDelete(item.id)
                }}
                title="Delete countdown"
              >
                ×
              </Button>
            )}
          </div>
        </div>
      )
    } else {
      return (
        <div className="card-actions">
          {isEditMode && (
            <Button
              action="delete"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                e.preventDefault()
                onDelete && onDelete(item.id)
              }}
              title="Delete"
            >
              ×
            </Button>
          )}
        </div>
      )
    }
  }

  // Helper function to roll dice
  // (helper rollDice removed; not used)

  // Helper function to format trigger conditions for display
  // (formatTriggerCondition removed; not used)

  // Helper function to parse countdown details from context
  // (parseCountdownDetails removed; not used)

  // Helper function to check if a mechanic should be interactive based on context
  // (checkIfInteractive removed; not used)

  // Helper function to render descriptions with highlighted words
  function renderInteractiveDescription(description) {
    if (!description) return null;
    
    // Word highlighting with specific colors for core mechanics only
    const wordColors = {
      'fear': '#dc267f',      // Pink/magenta for fear
      'stress': '#f59e0b',    // Amber for stress  
      'hope': '#22c55e',      // Green for hope
      'countdown': '#22c55e'  // Green for countdown
    };
    
    let processedText = description;
    
    Object.keys(wordColors).forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      const color = wordColors[word];
      processedText = processedText.replace(regex, `<span class="highlighted-word" style="color: ${color}; background: ${color}20; border: 1px solid ${color}50;">${word}</span>`);
    });
    
    return <span dangerouslySetInnerHTML={{ __html: processedText }} />;
  }

  // Helper function to render drag handle
  function renderDragHandle() {
    if (dragAttributes && dragListeners) {
      return (
        <div className="drag-handle" {...dragAttributes} {...dragListeners}>
          ⋮⋮
        </div>
      )
    }
    return null
  }
}

export { AddItemButton }
export default Cards

