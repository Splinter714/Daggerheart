import React, { useEffect } from 'react'
import adversariesData from '../../data/adversaries.json'

const AdversaryCreatorMockup = ({ formData, setFormData }) => {
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleFeatureChange = (type, index, field, value) => {
    setFormData(prev => ({
      ...prev,
      [`${type}Features`]: prev[`${type}Features`].map((feature, i) => 
        i === index ? { ...feature, [field]: value } : feature
      )
    }))
  }

  const removeFeature = (type, index) => {
    // Don't allow removing the last feature of any type
    if (formData[`${type}Features`].length <= 1) return
    
    setFormData(prev => ({
      ...prev,
      [`${type}Features`]: prev[`${type}Features`].filter((_, i) => i !== index)
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
    if (formData.experience.length <= 1) return
    
    setFormData(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index)
    }))
  }

  // Auto-add empty experience when last one has content
  useEffect(() => {
    const lastExp = formData.experience[formData.experience.length - 1]
    if (lastExp && lastExp.name.trim() && lastExp.modifier !== 0) {
      setFormData(prev => ({
        ...prev,
        experience: [...prev.experience, { name: '', modifier: 0 }]
      }))
    }
  }, [formData.experience, setFormData])

  // Auto-add empty features when last one has content for each type
  useEffect(() => {
    const featureTypes = ['passive', 'action', 'reaction']
    
    featureTypes.forEach(type => {
      const lastFeature = formData[`${type}Features`][formData[`${type}Features`].length - 1]
      if (lastFeature && lastFeature.name.trim() && lastFeature.description.trim()) {
        setFormData(prev => ({
          ...prev,
          [`${type}Features`]: [...prev[`${type}Features`], { name: '', description: '' }]
        }))
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.passiveFeatures, formData.actionFeatures, formData.reactionFeatures, setFormData])

  const renderFeatureSection = (type, title) => {
    const features = formData[`${type}Features`]
    
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
              value={formData.name || ''}
              onChange={(e) => handleInputChange('name', e.target.value)}
            />
          </div>
          <div className="form-group">
            <select
              value={formData.tier || 1}
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
              value={formData.type || ''}
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
              value={formData.difficulty || ''}
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
              value={formData.hpMax || ''}
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
              value={formData.stressMax || ''}
              onChange={(e) => handleInputChange('stressMax', e.target.value === '' ? '' : parseInt(e.target.value))}
            />
          </div>
        </div>
      </div>

      {/* Experience */}
      <div className="form-section">
        <h4>Experience</h4>
        {formData.experience.map((exp, index) => (
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
              {formData.experience.length > 1 && (
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