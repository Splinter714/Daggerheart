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
  console.log('Creator component called with type =', type, 'item =', item)
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
          {isAdversary && (
            <AdversaryEditForm
              data={formData}
              onChange={handleInputChange}
              onArrayChange={handleArrayChange}
              onAddItem={addArrayItem}
              onRemoveItem={removeArrayItem}
            />
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
      </form>
    </div>
  )
}

export default Creator
