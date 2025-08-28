import React, { useState } from 'react'
import Button from './Buttons'
import { Badge, DifficultyBadge, TypeBadge } from './Badges'
import Creator from './Creator'

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
  index = 0,
  onDelete,
  onEdit,
  onToggleVisibility,
  onReorder,
  onApplyDamage,
  onApplyHealing,
  onStressChange,
  onApplyStressChange,
  onIncrement,
  onDecrement,
  onSave,
  onExitEditMode,
  showDragHandle = false,
  isSelected = false,
  onClick,
  preview = false,
  dragAttributes,
  dragListeners,
  isEditMode = false
}) => {
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
        <div 
          className="simple-list-row compact countdown"
          onClick={() => onClick && onClick(item)}
          style={{ cursor: onClick ? 'pointer' : 'default' }}
        >
          {renderDragHandle()}
          <div className="row-content">
            <div className="row-main">
                <h4 className="row-title">{item.name}</h4>
              <div className="countdown-symbols">
                  {Array.from({ length: item.max }, (_, i) => (
                    <span 
                      key={i} 
                      className={`countdown-symbol ${i < (item.value || 0) ? 'filled' : 'empty'}`}
                      title={`${i + 1} of ${item.max}`}
                    >
                      {i < (item.value || 0) ? '●' : '○'}
                    </span>
                  ))}
                </div>
              </div>

            {renderCardActions()}
          </div>
        </div>
      )
    } else if (type === 'adversary') {
      return (
        <div 
          className={`simple-list-row compact adversary ${(item.hp || 0) >= (item.hpMax || 1) ? 'dead' : ''}`}
          onClick={() => onClick && onClick(item)}
          style={{ cursor: onClick ? 'pointer' : 'default' }}
        >
          {renderDragHandle()}
          <div className="row-content">
            <div className="row-main">
              <h4 className="row-title">{item.name}</h4>
              <div className="row-meta">
                {item.type && <span className="type-badge">{item.type}</span>}
                <span className="tier-badge">Tier {item.tier}</span>
                {item.difficulty && (
                  <span className={`difficulty-badge difficulty-${String(item.difficulty).toLowerCase()}`}>
                    {item.difficulty}
                  </span>
                )}
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
                        title={`HP ${i + 1} of ${item.hpMax} (${item.hp || 0} damage taken)`}
                      >
                        {i < (item.hp || 0) ? '●' : '○'}
                      </span>
                    ))}
                  </div>
                  <div className="hp-controls">
                    <Button
                      action="decrement"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        e.preventDefault()
                        onApplyHealing && onApplyHealing(item.id, 1, item.hp)
                      }}
                      title="Heal (reduce damage)"
                    >
                      −
                    </Button>
                    <Button
                      action="increment"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        e.preventDefault()
                        onApplyDamage && onApplyDamage(item.id, 1, item.hp, item.hpMax)
                      }}
                      title="Take damage"
                    >
                      +
                    </Button>
                  </div>
                </div>
                {item.stressMax > 0 && (
                  <div className="stress-section">
                    <div className="stress-symbols">
                      {Array.from({ length: item.stressMax }, (_, i) => (
                        <span 
                          key={i} 
                          className={`countdown-symbol ${i < (item.stress || 0) ? 'filled' : 'empty'}`}
                          title={`Stress ${i + 1} of ${item.stressMax}`}
                        >
                          {i < (item.stress || 0) ? '●' : '○'}
                        </span>
                      ))}
                    </div>
                    <div className="stress-controls">
                      <Button
                        action="decrement"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          e.preventDefault()
                          onApplyStressChange && onApplyStressChange(item.id, -1, item.stress, item.stressMax)
                        }}
                        title="Reduce stress"
                      >
                        −
                      </Button>
                      <Button
                        action="increment"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          e.preventDefault()
                          onApplyStressChange && onApplyStressChange(item.id, 1, item.stress, item.stressMax)
                        }}
                        title="Increase stress"
                      >
                        +
                      </Button>
                    </div>
                  </div>
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
                    title="Delete adversary"
                  >
                    ×
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )
    } else {
      return (
        <div 
          className="simple-list-row compact environment"
          onClick={() => onClick && onClick(item)}
          style={{ cursor: onClick ? 'pointer' : 'default' }}
        >
          {renderDragHandle()}
          <div className="row-content">
            <div className="row-main">
              <h4 className="row-title">{item.name}</h4>
              <div className="row-meta">
                {item.type && <span className="type-badge">{item.type}</span>}
                <span className="tier-badge">Tier {item.tier}</span>
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
        <div className="expanded-card countdown">
          <div className="expanded-header">
            <h2>{item.name}</h2>
            <div className="header-actions">
                <Button
                action="edit"
                  size="sm"
                onClick={() => onEdit && onEdit(item)}
                title="Edit countdown"
              >
                ✏️
              </Button>
              {onDelete && (
                <Button
                  action="delete"
                  size="sm"
                  onClick={() => onDelete(item.id)}
                  title="Delete countdown"
                >
                  ×
                </Button>
              )}
            </div>
          </div>
          
          <div className="expanded-content">
            <div className="stats-section">
              <div className="stat-row">
                <span className="stat-label">Progress:</span>
                <div className="stat-controls">
                  <Button
                    action="decrement"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      e.preventDefault()
                      if (onDecrement) {
                        onDecrement(item.id)
                      }
                    }}
                    title="Decrease progress"
                  >
                    −
                  </Button>
                  <span className="stat-value">{item.value || 0}/{item.max}</span>
                  <Button
                    action="increment"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      e.preventDefault()
                      if (onIncrement) {
                        onIncrement(item.id)
                      }
                    }}
                    title={item.value >= item.max ? "Loop countdown" : "Increase progress"}
                  >
                    {item.value >= item.max ? "⟳" : "+"}
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="countdown-symbols-section">
              <h3>Progress</h3>
              <div className="countdown-symbols">
                {Array.from({ length: item.max }, (_, i) => (
                  <span 
                    key={i} 
                    className={`countdown-symbol ${i < (item.value || 0) ? 'filled' : 'empty'}`}
                    title={`${i + 1} of ${item.max}`}
                  >
                    {i < (item.value || 0) ? '●' : '○'}
                  </span>
                ))}
              </div>
            </div>
            
            {item.description && (
              <div className="description-section">
                <h3>Description</h3>
                <p>{item.description}</p>
              </div>
            )}
          </div>
        </div>
      )
    } else if (type === 'adversary') {
      return (
        <div className="expanded-card adversary">
          <div className="expanded-header">
            <h2>{item.name}</h2>
            <div className="header-actions">
              <Button
                action="edit"
                size="sm"
                onClick={() => onEdit && onEdit(item)}
                title="Edit adversary"
              >
                ✏️
              </Button>
              {onDelete && (
                <Button
                  action="delete"
                  size="sm"
                  onClick={() => onDelete(item.id)}
                  title="Delete adversary"
                >
                  ×
                </Button>
              )}
            </div>
          </div>
          
          <div className="expanded-content">
            <div className="stats-section">
              <div className="stat-row">
                <span className="stat-label">HP (Damage):</span>
                <div className="stat-controls">
                  <Button
                    action="decrement"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      e.preventDefault()
                      onApplyHealing && onApplyHealing(item.id, 1, item.hp)
                    }}
                    title="Heal (reduce damage)"
                  >
                    −
                  </Button>
                  <span className="stat-value">{item.hp}/{item.hpMax}</span>
                  <Button
                    action="increment"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      e.preventDefault()
                      onApplyDamage && onApplyDamage(item.id, 1, item.hp, item.hpMax)
                    }}
                    title="Take damage"
                  >
                    +
                  </Button>
                </div>
              </div>
              
              {item.stressMax > 0 && (
                <div className="stat-row">
                  <span className="stat-label">Stress:</span>
                  <div className="stat-controls">
                    <Button
                      action="decrement"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        e.preventDefault()
                        onApplyStressChange && onApplyStressChange(item.id, -1, item.stress, item.stressMax)
                      }}
                      title="Reduce stress"
                    >
                      −
                    </Button>
                    <span className="stat-value">{item.stress}/{item.stressMax}</span>
                    <Button
                      action="increment"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        e.preventDefault()
                        onApplyStressChange && onApplyStressChange(item.id, 1, item.stress, item.stressMax)
                      }}
                      title="Increase stress"
                    >
                      +
                    </Button>
                  </div>
                </div>
              )}
            </div>
            
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
              >
                ✏️
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
                  min="1"
                  max="20"
                  value={editData.max}
                  onChange={(e) => handleInputChange('max', parseInt(e.target.value))}
                  className="form-input"
                />
              </div>

              <div className="stat-row">
                <span className="stat-label">Starting Value:</span>
                <input
                  type="number"
                  min="0"
                  max={editData.max}
                  value={editData.value}
                  onChange={(e) => handleInputChange('value', parseInt(e.target.value))}
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
                    min="1"
                    value={editData.hpMax}
                    onChange={(e) => handleInputChange('hpMax', parseInt(e.target.value))}
                    className="form-input"
                  />
                </div>

                <div className="stat-row">
                  <span className="stat-label">Max Stress:</span>
                  <input
                    type="number"
                    min="0"
                    value={editData.stressMax}
                    onChange={(e) => handleInputChange('stressMax', parseInt(e.target.value))}
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
              title={item.value >= item.max ? "Loop countdown" : "Increase progress"}
            >
              {item.value >= item.max ? "⟳" : "+"}
            </Button>
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

