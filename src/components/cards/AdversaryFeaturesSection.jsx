import React from 'react'

const AdversaryFeaturesSection = ({ item, editData, isEditMode, onFeatureChange, onAddFeature, onRemoveFeature }) => {
  const renderFeatures = (features, type) => {
    if (!features || features.length === 0) return null
    
    const validFeatures = features.filter(f => f.name && f.name.trim())
    if (validFeatures.length === 0) return null
    
    if (isEditMode) {
      return (
        <>
          {validFeatures.map((feature, index) => (
            <div key={index} className="feature-edit-row">
              <input
                type="text"
                className="form-input-inline"
                value={feature.name || ''}
                onChange={(e) => onFeatureChange(type.toLowerCase(), index, 'name', e.target.value)}
                placeholder="Feature name"
              />
              <textarea
                className="form-textarea-inline"
                value={feature.description || ''}
                onChange={(e) => onFeatureChange(type.toLowerCase(), index, 'description', e.target.value)}
                placeholder="Feature description"
                rows={2}
              />
              <button
                className="remove-feature-btn"
                onClick={() => onRemoveFeature(type.toLowerCase(), index)}
                title="Remove feature"
              >
                ×
              </button>
            </div>
          ))}
          <button
            className="add-feature-btn"
            onClick={() => onAddFeature(type.toLowerCase())}
            title={`Add ${type} feature`}
          >
            + Add {type}
          </button>
        </>
      )
    }
    
    return (
      <>
        {validFeatures.map((feature, index) => (
          <div key={index} className="feature-text">
            <span className="feature-name">{feature.name}</span>
            <span className="feature-separator"> - </span>
            {feature.description && (
              <span className="feature-description">
                {feature.description.split(/(\*\*.*?\*\*)/).map((part, i) => 
                  part.startsWith('**') && part.endsWith('**') ? 
                    <strong key={i}>{part.slice(2, -2)}</strong> : part
                )}
              </span>
            )}
          </div>
        ))}
      </>
    )
  }

  return (
    <div className="features-section">
      {item.features?.filter(f => f.type === 'Passive').length > 0 && (
        <div className="feature-type-section">
          <div className="feature-type-header">
            <h4>Passives</h4>
            <hr />
          </div>
          {renderFeatures(item.features.filter(f => f.type === 'Passive'), 'Passive')}
        </div>
      )}
      
      {item.features?.filter(f => f.type === 'Action').length > 0 && (
        <div className="feature-type-section">
          <div className="feature-type-header">
            <h4>Actions</h4>
            <hr />
          </div>
          {renderFeatures(item.features.filter(f => f.type === 'Action'), 'Action')}
        </div>
      )}
      
      {item.features?.filter(f => f.type === 'Reaction').length > 0 && (
        <div className="feature-type-section">
          <div className="feature-type-header">
            <h4>Reactions</h4>
            <hr />
          </div>
          {renderFeatures(item.features.filter(f => f.type === 'Reaction'), 'Reaction')}
        </div>
      )}
    </div>
  )
}

export default AdversaryFeaturesSection
