import React, { useState, useEffect } from 'react'
import CardEditLayout from '../cards/CardEditLayout'
import AdversaryEditForm from './forms/AdversaryEditForm'
import EnvironmentEditForm from './forms/EnvironmentEditForm'
import CountdownEditForm from './forms/CountdownEditForm'

const Creator = ({ 
  type, // 'adversary', 'environment', or 'countdown'
  item = null, // If provided, we're editing; if null, we're creating
  source = 'campaign', // Source for countdowns: 'adversary', 'environment', or 'campaign'
  onSave, 
  onCancel 
}) => {
  const isEditing = !!item
  const isAdversary = type === 'adversary'
  const isEnvironment = type === 'environment'
  const isCountdown = type === 'countdown'

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    tier: 1,
    type: '',
    difficulty: 1,
    description: '',
    motives: '',
    source: source, // Set source from prop
    // Adversary-specific fields
    hpMax: 1,
    stressMax: 0,
    passiveFeatures: [{ name: '', description: '' }],
    actionFeatures: [{ name: '', description: '' }],
    reactionFeatures: [{ name: '', description: '' }],
    thresholds: { major: 0, severe: 0 },
    atk: 0,
    weapon: 'Weapon',
    range: 'Melee',
    damage: '1d6 phy',
    // Environment-specific fields
    effects: [],
    hazards: [],
    // Countdown-specific fields
    max: 5,
    value: 0,
    countdownType: 'standard',
    loop: 'none'
  })

  // Initialize form with item data if editing
  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name || '',
        tier: item.tier || 1,
        type: item.type || '',
        difficulty: item.difficulty || 1,
        description: item.description || '',
        motives: item.motives || '',
        source: item.source || source, // Use item source or fallback to prop
        hpMax: item.hpMax || 1,
        stressMax: item.stressMax || 0,
        passiveFeatures: item.passiveFeatures || item.features?.filter(f => f.type === 'Passive') || [{ name: '', description: '' }],
        actionFeatures: item.actionFeatures || item.features?.filter(f => f.type === 'Action') || [{ name: '', description: '' }],
        reactionFeatures: item.reactionFeatures || item.features?.filter(f => f.type === 'Reaction') || [{ name: '', description: '' }],
        thresholds: item.thresholds || { major: 0, severe: 0 },
        atk: item.atk || 0,
        weapon: item.weapon || 'Weapon',
        range: item.range || 'Melee',
        damage: item.damage || '1d6 phy',
        effects: item.effects || [],
        hazards: item.hazards || [],
        max: item.max || 5,
        value: item.value || 0,
        countdownType: item.type || 'standard',
        loop: item.loop || 'none'
      })
    }
  }, [item, source])

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleArrayChange = (field, index, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }))
  }

  const addArrayItem = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }))
  }

  const removeArrayItem = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Validate required fields
    if (!formData.name.trim()) {
      alert('Name is required')
      return
    }

    // Create the item data
    const itemData = {
      ...formData,
      name: formData.name.trim(),
      description: formData.description.trim(),
      // Add game-specific properties
      ...(isAdversary && {
        hp: 0, // Start with 0 HP (no damage taken)
        hpMax: formData.hpMax,
        stress: 0, // Start with no stress
        stressMax: formData.stressMax,
        thresholds: formData.thresholds,
        atk: formData.atk,
        weapon: formData.weapon,
        range: formData.range,
        damage: formData.damage,
        features: [
          ...formData.passiveFeatures.filter(f => f.name.trim()).map(f => ({ ...f, type: 'Passive' })),
          ...formData.actionFeatures.filter(f => f.name.trim()).map(f => ({ ...f, type: 'Action' })),
          ...formData.reactionFeatures.filter(f => f.name.trim()).map(f => ({ ...f, type: 'Reaction' }))
        ]
      }),
      ...(isEnvironment && {
        effects: formData.effects.filter(effect => effect.trim()),
        hazards: formData.hazards.filter(hazard => hazard.trim())
      }),
      ...(isCountdown && {
        max: formData.max,
        value: formData.value,
        type: formData.countdownType,
        loop: formData.loop
      })
    }

    onSave(itemData)
  }

  return (
    <div className="creator-container">
      <form onSubmit={handleSubmit} className="creator-form">
        {isAdversary ? (
          <div className="expanded-card adversary">
            {/* Header Section */}
            <div className="expanded-header">
              <div className="edit-header-row">
                <input
                  type="text"
                  className="form-input-inline"
                  value={formData.name || ''}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Adversary name"
                />
                <div className="edit-actions">
                  <button 
                    className="save-button"
                    onClick={handleSubmit}
                    type="button"
                  >
                    Save
                  </button>
                  <button 
                    className="cancel-button"
                    onClick={onCancel}
                    type="button"
                  >
                    Cancel
                  </button>
                </div>
              </div>
              <div className="edit-header-controls">
                <select
                  className="form-select-inline-small"
                  value={formData.tier || 1}
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
                  value={formData.type || ''}
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
                value={formData.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Description"
                rows={2}
              />
              <div className="motives-row">
                <span className="motives-label">Motives & Tactics:</span>
                <div className="motives-field">
                  <textarea
                    className="inline-field"
                    value={formData.motives || ''}
                    onChange={(e) => handleInputChange('motives', e.target.value)}
                    placeholder="Motives & Tactics"
                    rows={1}
                  />
                </div>
              </div>
            </div>
            
            {/* Core Stats Block */}
            <div className="core-stats-block">
              {/* Primary Stats Row */}
              <div className="stats-row">
                <span className="stat-item">
                  <strong>Diff:</strong> 
                  <input
                    type="number"
                    className="form-input-inline-small"
                    value={formData.difficulty || ''}
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
                    value={formData.thresholds?.major || ''}
                    onChange={(e) => handleInputChange('thresholds', { ...formData.thresholds, major: e.target.value === '' ? '' : parseInt(e.target.value) })}
                    min="1"
                    max="20"
                  />
                  /
                  <input
                    type="number"
                    className="form-input-inline-small"
                    value={formData.thresholds?.severe || ''}
                    onChange={(e) => handleInputChange('thresholds', { ...formData.thresholds, severe: e.target.value === '' ? '' : parseInt(e.target.value) })}
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
                    value={formData.hpMax || ''}
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
                    value={formData.stressMax || ''}
                    onChange={(e) => handleInputChange('stressMax', e.target.value === '' ? '' : parseInt(e.target.value))}
                    min="1"
                    max="10"
                  />
                </span>
              </div>
              
              {/* Combat Stats Row */}
              <div className="stats-row">
                <span className="stat-item">
                  <strong>ATK:</strong> 
                  <input
                    type="number"
                    className="form-input-inline-small"
                    value={formData.atk || ''}
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
                      value={formData.weapon || ''}
                      onChange={(e) => handleInputChange('weapon', e.target.value)}
                      placeholder="Weapon"
                    />
                  </strong>: 
                  <select
                    className="form-select-inline-small"
                    data-field="range"
                    value={formData.range || ''}
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
                    value={formData.damage || ''}
                    onChange={(e) => handleInputChange('damage', e.target.value)}
                    placeholder="1d12+2 phy"
                  />
                </span>
              </div>
            </div>
            
            {/* Features Section */}
            <div className="features-section">
              <AdversaryEditForm
                data={formData}
                onChange={handleInputChange}
                onArrayChange={handleArrayChange}
                onAddItem={addArrayItem}
                onRemoveItem={removeArrayItem}
              />
            </div>
          </div>
        ) : (
          <CardEditLayout
            item={item}
            type={type}
            editData={formData}
            onChange={handleInputChange}
            onSave={handleSubmit}
            onCancel={onCancel}
            showMetaDetails={!isCountdown}
          >
            {isCountdown && (
              <CountdownEditForm data={formData} onChange={handleInputChange} />
            )}
            {isEnvironment && (
              <EnvironmentEditForm
                data={formData}
                onArrayChange={handleArrayChange}
                onAddItem={addArrayItem}
                onRemoveItem={removeArrayItem}
              />
            )}
          </CardEditLayout>
        )}
      </form>
    </div>
  )
}

export default Creator
