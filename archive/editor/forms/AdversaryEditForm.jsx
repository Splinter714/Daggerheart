import React from 'react'
import Button from '../../controls/Buttons'

const AdversaryEditForm = ({ data, onChange, onArrayChange, onAddItem, onRemoveItem }) => {
  return (
    <>
      {/* Passives Section */}
      <div className="feature-type-section">
        <div className="feature-type-header">
          <h4>Passives</h4>
          <hr />
        </div>
        {data.passiveFeatures && data.passiveFeatures.map((feature, index) => (
          <div key={index} className="feature-edit-row">
            <input
              type="text"
              value={feature.name}
              onChange={(e) => onArrayChange('passiveFeatures', index, { ...feature, name: e.target.value })}
              placeholder="Feature name"
              className="form-input-inline"
            />
            <span className="feature-separator"> - </span>
            <input
              type="text"
              value={feature.description}
              onChange={(e) => onArrayChange('passiveFeatures', index, { ...feature, description: e.target.value })}
              placeholder="Feature description"
              className="form-input-inline"
            />
            <Button action="delete" onClick={() => onRemoveItem('passiveFeatures', index)} size="sm" title="Remove" />
          </div>
        ))}
        <Button action="add" onClick={() => onAddItem('passiveFeatures')} size="sm" title="Add Passive">Add Passive</Button>
      </div>

      {/* Actions Section */}
      <div className="feature-type-section">
        <div className="feature-type-header">
          <h4>Actions</h4>
          <hr />
        </div>
        {data.actionFeatures && data.actionFeatures.map((feature, index) => (
          <div key={index} className="feature-edit-row">
            <input
              type="text"
              value={feature.name}
              onChange={(e) => onArrayChange('actionFeatures', index, { ...feature, name: e.target.value })}
              placeholder="Feature name"
              className="form-input-inline"
            />
            <span className="feature-separator"> - </span>
            <input
              type="text"
              value={feature.description}
              onChange={(e) => onArrayChange('actionFeatures', index, { ...feature, description: e.target.value })}
              placeholder="Feature description"
              className="form-input-inline"
            />
            <Button action="delete" onClick={() => onRemoveItem('actionFeatures', index)} size="sm" title="Remove" />
          </div>
        ))}
        <Button action="add" onClick={() => onAddItem('actionFeatures')} size="sm" title="Add Action">Add Action</Button>
      </div>

      {/* Reactions Section */}
      <div className="feature-type-section">
        <div className="feature-type-header">
          <h4>Reactions</h4>
          <hr />
        </div>
        {data.reactionFeatures && data.reactionFeatures.map((feature, index) => (
          <div key={index} className="feature-edit-row">
            <input
              type="text"
              value={feature.name}
              onChange={(e) => onArrayChange('reactionFeatures', index, { ...feature, name: e.target.value })}
              placeholder="Feature name"
              className="form-input-inline"
            />
            <span className="feature-separator"> - </span>
            <input
              type="text"
              value={feature.description}
              onChange={(e) => onArrayChange('reactionFeatures', index, { ...feature, description: e.target.value })}
              placeholder="Feature description"
              className="form-input-inline"
            />
            <Button action="delete" onClick={() => onRemoveItem('reactionFeatures', index)} size="sm" title="Remove" />
          </div>
        ))}
        <Button action="add" onClick={() => onAddItem('reactionFeatures')} size="sm" title="Add Reaction">Add Reaction</Button>
      </div>
    </>
  )
}

export default AdversaryEditForm


