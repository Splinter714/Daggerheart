import React, { useEffect } from 'react'
import adversariesData from '../../data/adversaries.json'

const AdversaryCreatorMockup = ({ formData, setFormData }) => {
  // Ensure formData has all required properties with defaults
  const safeFormData = {
    name: '',
    type: 'Minion',
    difficulty: '',
    hp: 0,
    stressMax: 0,
    stressCurrent: 0,
    hpCurrent: 0,
    passiveFeatures: [{ name: '', description: '' }],
    actionFeatures: [{ name: '', description: '' }],
    reactionFeatures: [{ name: '', description: '' }],
    experience: [{ name: '', modifier: 0 }],
    ...formData
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleFeatureChange = (type, index, field, value) => {
    setFormData(prev => ({
      ...prev,
      [`${type}Features`]: (prev[`${type}Features`] || [{ name: '', description: '' }]).map((feature, i) => 
        i === index ? { ...feature, [field]: value } : feature
      )
    }))
  }

  const removeFeature = (type, index) => {
    // Don't allow removing the last feature of any type
    if (safeFormData[`${type}Features`].length <= 1) return
    
    setFormData(prev => ({
      ...prev,
      [`${type}Features`]: (prev[`${type}Features`] || [{ name: '', description: '' }]).filter((_, i) => i !== index)
    }))
  }

  const handleExperienceChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      experience: prev.experience.map((exp, i) => 
        i === index ? { ...exp, [field]: value } : exp
      )
    }))
  }

  const removeExperience = (index) => {
    // Don't allow removing the last experience
    if (safeFormData.experience.length <= 1) return
    
    setFormData(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index)
    }))
  }

  // Auto-add empty experience when last one has content
  useEffect(() => {
    const experience = safeFormData.experience || []
    if (experience.length === 0) return
    
    const lastExp = experience[experience.length - 1]
    if (lastExp && lastExp.name && lastExp.name.trim() && lastExp.modifier !== 0) {
      setFormData(prev => ({
        ...prev,
        experience: [...(prev.experience || []), { name: '', modifier: 0 }]
      }))
    }
  }, [safeFormData.experience, setFormData])

  // Auto-add empty features when last one has content for each type
  useEffect(() => {
    const featureTypes = ['passive', 'action', 'reaction']
    
    featureTypes.forEach(type => {
      const features = safeFormData[`${type}Features`] || []
      if (features.length === 0) return
      
      const lastFeature = features[features.length - 1]
      if (lastFeature && lastFeature.name && lastFeature.name.trim() && lastFeature.description && lastFeature.description.trim()) {
        setFormData(prev => ({
          ...prev,
          [`${type}Features`]: [...(prev[`${type}Features`] || []), { name: '', description: '' }]
        }))
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safeFormData.passiveFeatures, safeFormData.actionFeatures, safeFormData.reactionFeatures, setFormData])

  const renderFeatureSection = (type, title) => {
    const features = safeFormData[`${type}Features`] || [{ name: '', description: '' }]
    
    return (
      <div className="form-section">
        <h4>{title}</h4>
        {features.map((feature, index) => (
          <div key={index} className="feature-form">
            <div className="form-row">
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Feature name"
                  value={feature.name || ''}
                  onChange={(e) => handleFeatureChange(type, index, 'name', e.target.value)}
                />
              </div>
              {features.length > 1 && (
                <button
                  className="remove-button-small"
                  onClick={() => removeFeature(type, index)}
                  title="Remove feature"
                >
                  ×
                </button>
              )}
            </div>
            <div className="form-group">
              <textarea
                placeholder="Feature description"
                value={feature.description || ''}
                onChange={(e) => handleFeatureChange(type, index, 'description', e.target.value)}
                rows={3}
              />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="creator-form">
      {/* Basic Information */}
      <div className="form-section">
        <div className="form-row">
          <div className="form-group">
            <input
              type="text"
              placeholder="Adversary name"
              value={safeFormData.name || ''}
              onChange={(e) => handleInputChange('name', e.target.value)}
            />
          </div>
          <div className="form-group">
            <select
              value={safeFormData.tier || 1}
              onChange={(e) => handleInputChange('tier', parseInt(e.target.value))}
            >
              <option value={1}>Tier 1</option>
              <option value={2}>Tier 2</option>
              <option value={3}>Tier 3</option>
              <option value={4}>Tier 4</option>
            </select>
          </div>
          <div className="form-group">
            <select
              value={safeFormData.type || ''}
              onChange={(e) => handleInputChange('type', e.target.value)}
            >
              <option value="">Type</option>
              {Object.values(adversariesData.adversaryTypes).map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <input
              type="number"
              inputMode="numeric"
              enterKeyHint="done"
              placeholder="Difficulty"
              min="1"
              max="21"
              value={safeFormData.difficulty || ''}
              onChange={(e) => handleInputChange('difficulty', e.target.value === '' ? '' : parseInt(e.target.value))}
            />
          </div>
          <div className="form-group">
            <input
              type="number"
              inputMode="numeric"
              enterKeyHint="done"
              placeholder="Max HP"
              min="1"
              max="12"
              value={safeFormData.hpMax || ''}
              onChange={(e) => handleInputChange('hpMax', e.target.value === '' ? '' : parseInt(e.target.value))}
            />
          </div>
          <div className="form-group">
            <input
              type="number"
              inputMode="numeric"
              enterKeyHint="done"
              placeholder="Max Stress"
              min="1"
              max="10"
              value={safeFormData.stressMax || ''}
              onChange={(e) => handleInputChange('stressMax', e.target.value === '' ? '' : parseInt(e.target.value))}
            />
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <input
              type="number"
              inputMode="numeric"
              enterKeyHint="done"
              placeholder="Major Threshold"
              min="1"
              max="20"
              value={safeFormData.thresholds?.major || ''}
              onChange={(e) => handleInputChange('thresholds', { ...safeFormData.thresholds, major: e.target.value === '' ? '' : parseInt(e.target.value) })}
            />
          </div>
          <div className="form-group">
            <input
              type="number"
              inputMode="numeric"
              enterKeyHint="done"
              placeholder="Severe Threshold"
              min="1"
              max="25"
              value={safeFormData.thresholds?.severe || ''}
              onChange={(e) => handleInputChange('thresholds', { ...safeFormData.thresholds, severe: e.target.value === '' ? '' : parseInt(e.target.value) })}
            />
          </div>
          <div className="form-group">
            <input
              type="number"
              inputMode="numeric"
              enterKeyHint="done"
              placeholder="ATK Bonus"
              min="0"
              max="10"
              value={safeFormData.atk || ''}
              onChange={(e) => handleInputChange('atk', e.target.value === '' ? '' : parseInt(e.target.value))}
            />
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <input
              type="text"
              placeholder="Weapon"
              value={safeFormData.weapon || ''}
              onChange={(e) => handleInputChange('weapon', e.target.value)}
            />
          </div>
          <div className="form-group">
            <select
              value={safeFormData.range || ''}
              onChange={(e) => handleInputChange('range', e.target.value)}
            >
              <option value="">Range</option>
              <option value="Melee">Melee</option>
              <option value="Very Close">Very Close</option>
              <option value="Close">Close</option>
              <option value="Far">Far</option>
              <option value="Very Far">Very Far</option>
            </select>
          </div>
          <div className="form-group">
            <input
              type="text"
              placeholder="Damage (e.g., 1d12+2 phy)"
              value={safeFormData.damage || ''}
              onChange={(e) => handleInputChange('damage', e.target.value)}
            />
          </div>
        </div>
        
        <div className="form-group">
          <textarea
            placeholder="Description"
            value={safeFormData.description || ''}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={2}
          />
        </div>
        
        <div className="motives-row">
          <span className="motives-label">Motives & Tactics:</span>
          <input
            type="text"
            className="inline-field"
            placeholder="Motives & Tactics (e.g., Burrow, drag away, feed, reposition)"
            value={safeFormData.motives || ''}
            onChange={(e) => handleInputChange('motives', e.target.value)}
          />
        </div>
      </div>

      {/* Experience */}
      <div className="form-section">
        <h4>Experience</h4>
        {safeFormData.experience.map((exp, index) => (
          <div key={index} className="experience-form">
            <div className="form-row">
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Experience name"
                  value={exp.name || ''}
                  onChange={(e) => handleExperienceChange(index, 'name', e.target.value)}
                />
              </div>
              <div className="form-group">
                <input
                  type="number"
                  inputMode="numeric"
                  enterKeyHint="done"
                  placeholder="Modifier"
                  value={exp.modifier || ''}
                  onChange={(e) => handleExperienceChange(index, 'modifier', e.target.value === '' ? 0 : parseInt(e.target.value))}
                />
              </div>
              {safeFormData.experience.length > 1 && (
                <button
                  className="remove-button-small"
                  onClick={() => removeExperience(index)}
                  title="Remove experience"
                >
                  ×
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Features */}
      {renderFeatureSection('passive', 'Passive Features')}
      {renderFeatureSection('action', 'Action Features')}
      {renderFeatureSection('reaction', 'Reaction Features')}
    </div>
  )
}

export default AdversaryCreatorMockup