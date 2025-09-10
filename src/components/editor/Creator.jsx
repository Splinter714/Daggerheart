import React, { useState, useEffect } from 'react'
import Button from '../controls/Buttons'
import Cards from '../cards/Cards'
import ArrayFieldList from './ArrayFieldList'
// BasicInfo now covered by CardEditLayout name input
import DetailsSection from './DetailsSection'
import CountdownSettings from './CountdownSettings'
import CombatStats from './CombatStats'
import EnvironmentEffects from './EnvironmentEffects'
import CardEditLayout from '../cards/CardEditLayout'
// import { Badge, DifficultyBadge, TypeBadge } from './Badges'

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
    source: source, // Set source from prop
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
        source: item.source || source, // Use item source or fallback to prop
        hpMax: item.hpMax || 1,
        stressMax: item.stressMax || 0,
        abilities: item.abilities || [],
        traits: item.traits || [],
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
        value: formData.value,
        type: formData.countdownType,
        loop: formData.loop
      })
    }

    onSave(itemData)
  }

  const renderArrayField = (field, label, placeholder) => (
    <ArrayFieldList
      label={label}
      values={formData[field]}
      placeholder={placeholder}
      onChange={(index, value) => handleArrayChange(field, index, value)}
      onRemove={(index) => removeArrayItem(field, index)}
      onAdd={() => addArrayItem(field)}
    />
  )

  return (
    <div className="creator-container">
      <div className="creator-header">
        {!isCountdown && (
          <>
            <h2>{isEditing ? 'Edit' : 'Create'} {type === 'adversary' ? 'Adversary' : 'Environment'}</h2>
            <div className="creator-actions">
              <Button
                action="cancel"
                onClick={onCancel}
                size="sm"
              >
                Cancel
              </Button>
            </div>
          </>
        )}
      </div>

      <form onSubmit={handleSubmit} className="creator-form">
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
            <CountdownSettings
              name={formData.name}
              description={formData.description}
              max={formData.max}
              countdownType={formData.countdownType}
              loop={formData.loop}
              onNameChange={(value) => handleInputChange('name', value)}
              onDescriptionChange={(value) => handleInputChange('description', value)}
              onMaxChange={(value) => handleInputChange('max', value)}
              onTypeChange={(value) => handleInputChange('countdownType', value)}
              onLoopChange={(value) => handleInputChange('loop', value)}
            />
          )}
          {isAdversary && (
            <>
              <DetailsSection
                tier={formData.tier}
                typeValue={formData.type}
                difficulty={formData.difficulty}
                onTierChange={(value) => handleInputChange('tier', value)}
                onTypeChange={(value) => handleInputChange('type', value)}
                onDifficultyChange={(value) => handleInputChange('difficulty', value)}
              />
              <CombatStats
                hpMax={formData.hpMax}
                stressMax={formData.stressMax}
                onHpMaxChange={(value) => handleInputChange('hpMax', value)}
                onStressMaxChange={(value) => handleInputChange('stressMax', value)}
              />
              {renderArrayField('abilities', 'Abilities', 'Enter ability description')}
              {renderArrayField('traits', 'Traits', 'Enter trait description')}
            </>
          )}
          {isEnvironment && (
            <>
              <DetailsSection
                tier={formData.tier}
                typeValue={formData.type}
                difficulty={formData.difficulty}
                onTierChange={(value) => handleInputChange('tier', value)}
                onTypeChange={(value) => handleInputChange('type', value)}
                onDifficultyChange={(value) => handleInputChange('difficulty', value)}
              />
              <EnvironmentEffects
                effects={formData.effects}
                hazards={formData.hazards}
                onEffectChange={(index, value) => handleArrayChange('effects', index, value)}
                onAddEffect={() => addArrayItem('effects')}
                onRemoveEffect={(index) => removeArrayItem('effects', index)}
                onHazardChange={(index, value) => handleArrayChange('hazards', index, value)}
                onAddHazard={() => addArrayItem('hazards')}
                onRemoveHazard={(index) => removeArrayItem('hazards', index)}
              />
            </>
          )}
          {!isCountdown && (
            <div className="form-section">
              <h3>Preview</h3>
              <div className="preview-card">
                <Cards item={formData} type={type} mode="compact" preview={true} />
              </div>
            </div>
          )}
          {!isCountdown && (
            <div className="form-actions">
              <Button action="save" type="submit" size="lg">
                {isEditing ? 'Update' : 'Create'} {type === 'adversary' ? 'Adversary' : 'Environment'}
              </Button>
            </div>
          )}
        </CardEditLayout>
      </form>
    </div>
  )
}

export default Creator
