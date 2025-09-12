import React from 'react'
import Button from '../controls/Buttons'

const CardEditLayout = ({
  item,
  type,
  editData,
  onChange,
  onSave,
  onCancel,
  children,
  showMetaDetails = true
}) => {
  const isCreating = !item
  
  // For adversaries, use the new layout that matches expanded card
  console.log('CardEditLayout: type =', type, 'isCreating =', isCreating, 'item =', item)
  if (type === 'adversary') {
    return (
      <div className="expanded-card adversary edit-mode" style={{backgroundColor: '#ff0000', border: '5px solid red', minHeight: '200px', zIndex: 9999}}>
        {/* Header Section - matches expanded card */}
        <div className="expanded-header">
          <div className="edit-header-controls">
            <h2>{isCreating ? 'Create Adversary' : `Edit ${editData.name}`}</h2>
            <div className="edit-actions">
              <Button action="save" size="sm" onClick={onSave}>Save</Button>
              <Button action="secondary" size="sm" onClick={onCancel}>Cancel</Button>
            </div>
          </div>
          <div className="tier-info">
            <select
              value={editData.tier}
              onChange={(e) => onChange('tier', parseInt(e.target.value))}
              className="form-select-inline"
            >
              {[1, 2, 3, 4, 5].map(tier => (
                <option key={tier} value={tier}>Tier {tier}</option>
              ))}
            </select>
            <input
              type="text"
              value={editData.type}
              onChange={(e) => onChange('type', e.target.value)}
              placeholder="Type"
              className="form-input-inline"
            />
          </div>
          <div className="description-text">
            <textarea
              value={editData.description}
              onChange={(e) => onChange('description', e.target.value)}
              placeholder="Description"
              className="form-textarea-inline"
              rows={2}
            />
          </div>
        </div>
        
        {/* Core Stats Block - matches expanded card */}
        <div className="core-stats-block">
          {/* Primary Stats Row */}
          <div className="stats-row">
            <span className="stat-item">
              <strong>Diff:</strong> 
              <select
                value={editData.difficulty}
                onChange={(e) => onChange('difficulty', parseInt(e.target.value))}
                className="form-select-inline-small"
              >
                {[1, 2, 3, 4, 5].map(diff => (
                  <option key={diff} value={diff}>{diff}</option>
                ))}
              </select>
            </span>
            <span className="stat-separator">|</span>
            <span className="stat-item">
              <strong>Thresholds:</strong> 
              <input
                type="number"
                value={editData.thresholds?.major || ''}
                onChange={(e) => onChange('thresholds', { ...editData.thresholds, major: parseInt(e.target.value) || 0 })}
                placeholder="Major"
                className="form-input-inline-small"
              />
              /
              <input
                type="number"
                value={editData.thresholds?.severe || ''}
                onChange={(e) => onChange('thresholds', { ...editData.thresholds, severe: parseInt(e.target.value) || 0 })}
                placeholder="Severe"
                className="form-input-inline-small"
              />
            </span>
            <span className="stat-separator">|</span>
            <span className="stat-item">
              <strong>HP:</strong> 
              <input
                type="number"
                value={editData.hpMax || 1}
                onChange={(e) => onChange('hpMax', parseInt(e.target.value) || 1)}
                className="form-input-inline-small"
              />
            </span>
            <span className="stat-separator">|</span>
            <span className="stat-item">
              <strong>Stress:</strong> 
              <input
                type="number"
                value={editData.stressMax || 0}
                onChange={(e) => onChange('stressMax', parseInt(e.target.value) || 0)}
                className="form-input-inline-small"
              />
            </span>
          </div>
          
          {/* Combat Stats Row */}
          <div className="stats-row">
            <span className="stat-item">
              <strong>ATK:</strong> 
              <input
                type="number"
                value={editData.atk || ''}
                onChange={(e) => onChange('atk', e.target.value === '' ? '' : parseInt(e.target.value))}
                className="form-input-inline-small"
                min="-10"
                max="10"
              />
            </span>
            <span className="stat-separator">|</span>
            <span className="stat-item">
              <strong>
                <input
                  type="text"
                  value={editData.weapon || 'Weapon'}
                  onChange={(e) => onChange('weapon', e.target.value)}
                  placeholder="Weapon"
                  className="form-input-inline-small"
                />
              </strong> 
              <select
                value={editData.range || 'Melee'}
                onChange={(e) => onChange('range', e.target.value)}
                className="form-select-inline-small"
              >
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
                value={editData.damage || '1d6 phy'}
                onChange={(e) => onChange('damage', e.target.value)}
                placeholder="1d6 phy"
                className="form-input-inline-small"
              />
            </span>
          </div>
        </div>

        {/* Features Section - matches expanded card */}
        <div className="features-section">
          {children}
        </div>
      </div>
    )
  }

  // Original layout for non-adversary types
  return (
    <div className="expanded-card edit-mode" style={{backgroundColor: '#00ff00', border: '5px solid green', minHeight: '200px', zIndex: 9999}}>
      <div className="edit-header">
        <h2>{isCreating ? 'Create' : 'Edit'} {type === 'adversary' ? 'Adversary' : type === 'environment' ? 'Environment' : 'Countdown'}</h2>
        <div className="edit-actions">
          <Button action="save" size="sm" onClick={onSave}>Save</Button>
          <Button action="secondary" size="sm" onClick={onCancel}>Cancel</Button>
        </div>
      </div>

      <div className="expanded-content">
        <div className="meta-section">
          <div className="meta-row">
            <span className="meta-label">Name:</span>
            <input
              type="text"
              value={editData.name}
              onChange={(e) => onChange('name', e.target.value)}
              placeholder={`Enter ${type} name`}
              className="form-input"
            />
          </div>
          {showMetaDetails && (
            <>
              <div className="meta-row">
                <span className="meta-label">Tier:</span>
                <select
                  value={editData.tier}
                  onChange={(e) => onChange('tier', parseInt(e.target.value))}
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
                  onChange={(e) => onChange('type', e.target.value)}
                  placeholder="e.g., Beast, Humanoid, Undead"
                  className="form-input"
                />
              </div>

              <div className="meta-row">
                <span className="meta-label">Difficulty:</span>
                <select
                  value={editData.difficulty}
                  onChange={(e) => onChange('difficulty', parseInt(e.target.value))}
                  className="form-select"
                >
                  {[1, 2, 3, 4, 5].map(diff => (
                    <option key={diff} value={diff}>Difficulty {diff}</option>
                  ))}
                </select>
              </div>
            </>
          )}
        </div>

        <div className="description-section">
          <h3>Description</h3>
          <textarea
            value={editData.description}
            onChange={(e) => onChange('description', e.target.value)}
            placeholder={`Describe this ${type}`}
            className="form-textarea"
            rows={3}
          />
        </div>

        {children}
      </div>
    </div>
  )
}

export default CardEditLayout


