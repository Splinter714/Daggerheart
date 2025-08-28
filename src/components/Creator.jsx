import React, { useState, useEffect } from 'react'
import Button from './Buttons'
import Cards from './Cards'
import { Badge, DifficultyBadge, TypeBadge } from './Badges'

const Creator = ({ 
  type, // 'adversary', 'environment', or 'countdown'
  item = null, // If provided, we're editing; if null, we're creating
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
    // Adversary-specific fields
    hpMax: 1,
    stressMax: 0,
    abilities: [],
    traits: [],
    // Environment-specific fields
    effects: [],
    hazards: [],
    // Countdown-specific fields
    max: 5,
    value: 0
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
        hpMax: item.hpMax || 1,
        stressMax: item.stressMax || 0,
        abilities: item.abilities || [],
        traits: item.traits || [],
        effects: item.effects || [],
        hazards: item.hazards || [],
        max: item.max || 5,
        value: item.value || 0
      })
    }
  }, [item])

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
        abilities: formData.abilities.filter(ability => ability.trim()),
        traits: formData.traits.filter(trait => trait.trim())
      }),
      ...(isEnvironment && {
        effects: formData.effects.filter(effect => effect.trim()),
        hazards: formData.hazards.filter(hazard => hazard.trim())
      }),
      ...(isCountdown && {
        max: formData.max,
        value: formData.value
      })
    }

    onSave(itemData)
  }

  const renderArrayField = (field, label, placeholder) => (
    <div className="form-group">
      <label>{label}</label>
      {formData[field].map((value, index) => (
        <div key={index} className="array-input-row">
          <input
            type="text"
            value={value}
            onChange={(e) => handleArrayChange(field, index, e.target.value)}
            placeholder={placeholder}
            className="form-input"
          />
          <Button
            action="delete"
            onClick={() => removeArrayItem(field, index)}
            size="sm"
            title="Remove"
          />
        </div>
      ))}
      <Button
        action="add"
        onClick={() => addArrayItem(field)}
        size="sm"
        title={`Add ${label}`}
      >
        Add {label}
      </Button>
    </div>
  )

  return (
    <div className="creator-container">
      <div className="creator-header">
        <h2>{isEditing ? 'Edit' : 'Create'} {type === 'adversary' ? 'Adversary' : type === 'environment' ? 'Environment' : 'Countdown'}</h2>
        <div className="creator-actions">
          <Button
            action="cancel"
            onClick={onCancel}
            size="sm"
          >
            Cancel
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="creator-form">
        {/* Basic Information */}
        <div className="form-section">
          <h3>Basic Information</h3>
          
          <div className="form-group">
            <label htmlFor="name">Name *</label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder={`Enter ${type} name`}
              className="form-input"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="tier">Tier</label>
              <select
                id="tier"
                value={formData.tier}
                onChange={(e) => handleInputChange('tier', parseInt(e.target.value))}
                className="form-select"
              >
                {[1, 2, 3, 4, 5].map(tier => (
                  <option key={tier} value={tier}>Tier {tier}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="type">Type</label>
              <input
                id="type"
                type="text"
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value)}
                placeholder="e.g., Beast, Humanoid, Undead"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="difficulty">Difficulty</label>
              <select
                id="difficulty"
                value={formData.difficulty}
                onChange={(e) => handleInputChange('difficulty', parseInt(e.target.value))}
                className="form-select"
              >
                {[1, 2, 3, 4, 5].map(diff => (
                  <option key={diff} value={diff}>Difficulty {diff}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder={`Describe this ${type}`}
              className="form-textarea"
              rows={3}
            />
          </div>
        </div>

        {/* Adversary-specific fields */}
        {isAdversary && (
          <div className="form-section">
            <h3>Combat Stats</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="hpMax">Max HP</label>
                <input
                  id="hpMax"
                  type="number"
                  min="1"
                  value={formData.hpMax}
                  onChange={(e) => handleInputChange('hpMax', parseInt(e.target.value))}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="stressMax">Max Stress</label>
                <input
                  id="stressMax"
                  type="number"
                  min="0"
                  value={formData.stressMax}
                  onChange={(e) => handleInputChange('stressMax', parseInt(e.target.value))}
                  className="form-input"
                />
              </div>
            </div>

            {renderArrayField('abilities', 'Abilities', 'Enter ability description')}
            {renderArrayField('traits', 'Traits', 'Enter trait description')}
          </div>
        )}

        {/* Environment-specific fields */}
        {isEnvironment && (
          <div className="form-section">
            <h3>Environment Effects</h3>
            
            {renderArrayField('effects', 'Effects', 'Describe environmental effect')}
            {renderArrayField('hazards', 'Hazards', 'Describe environmental hazard')}
          </div>
        )}

        {/* Countdown-specific fields */}
        {isCountdown && (
          <div className="form-section">
            <h3>Countdown Settings</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="max">Max Value</label>
                <input
                  id="max"
                  type="number"
                  min="1"
                  max="20"
                  value={formData.max}
                  onChange={(e) => handleInputChange('max', parseInt(e.target.value))}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="value">Starting Value</label>
                <input
                  id="value"
                  type="number"
                  min="0"
                  max={formData.max}
                  value={formData.value}
                  onChange={(e) => handleInputChange('value', parseInt(e.target.value))}
                  className="form-input"
                />
              </div>
            </div>


          </div>
        )}

        {/* Preview */}
        <div className="form-section">
          <h3>Preview</h3>
          <div className="preview-card">
            <Cards
              item={formData}
              type={type}
              mode="compact"
              preview={true}
            />
          </div>
        </div>

        {/* Submit */}
        <div className="form-actions">
          <Button
            action="save"
            type="submit"
            size="lg"
          >
            {isEditing ? 'Update' : 'Create'} {type === 'adversary' ? 'Adversary' : 'Environment'}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default Creator
