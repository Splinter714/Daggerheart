import React from 'react'

const AdversaryCoreStatsSection = ({ item, editData, isEditMode, onInputChange, onExperienceChange, onAddExperience, onRemoveExperience }) => {
  return (
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
                onChange={(e) => onInputChange('difficulty', e.target.value === '' ? '' : parseInt(e.target.value))}
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
                onChange={(e) => onInputChange('thresholds', { ...editData.thresholds, major: e.target.value === '' ? '' : parseInt(e.target.value) })}
                min="1"
                max="20"
              />
              /
              <input
                type="number"
                className="form-input-inline-small"
                value={editData.thresholds?.severe || ''}
                onChange={(e) => onInputChange('thresholds', { ...editData.thresholds, severe: e.target.value === '' ? '' : parseInt(e.target.value) })}
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
                onChange={(e) => onInputChange('hpMax', e.target.value === '' ? '' : parseInt(e.target.value))}
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
                onChange={(e) => onInputChange('stressMax', e.target.value === '' ? '' : parseInt(e.target.value))}
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
                onChange={(e) => onInputChange('atk', e.target.value === '' ? '' : parseInt(e.target.value))}
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
                  onChange={(e) => onInputChange('weapon', e.target.value)}
                  placeholder="Weapon"
                />
              </strong>: 
              <select
                className="form-select-inline-small"
                data-field="range"
                value={editData.range || ''}
                onChange={(e) => onInputChange('range', e.target.value)}
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
                onChange={(e) => onInputChange('damage', e.target.value)}
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
          {isEditMode ? (
            <>
              <span className="stat-item">
                <strong>Experience:</strong>
                <div className="experience-list">
                  {item.experience.map((exp, index) => (
                    <div key={index} className="experience-item">
                      <input
                        type="text"
                        className="form-input-inline-small"
                        value={typeof exp === 'string' ? exp : exp.name || ''}
                        onChange={(e) => onExperienceChange(index, 'name', e.target.value)}
                        placeholder="Experience name"
                      />
                      {typeof exp === 'object' && (
                        <>
                          <input
                            type="number"
                            className="form-input-inline-small"
                            value={exp.modifier || ''}
                            onChange={(e) => onExperienceChange(index, 'modifier', parseInt(e.target.value) || 0)}
                            placeholder="Modifier"
                            min="-10"
                            max="10"
                          />
                          <button
                            className="remove-experience-btn"
                            onClick={() => onRemoveExperience(index)}
                            title="Remove experience"
                          >
                            ×
                          </button>
                        </>
                      )}
                    </div>
                  ))}
                  <button
                    className="add-experience-btn"
                    onClick={() => onAddExperience()}
                    title="Add experience"
                  >
                    + Add Experience
                  </button>
                </div>
              </span>
            </>
          ) : (
            <span className="stat-item">
              <strong>Experience:</strong> {item.experience.map(exp => 
                typeof exp === 'string' ? exp : `${exp.name} ${exp.modifier >= 0 ? '+' : ''}${exp.modifier}`
              ).join(', ')}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

export default AdversaryCoreStatsSection
