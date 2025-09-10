import React from 'react'
import Button from '../controls/Buttons'

const EnvironmentEditForm = ({ data, onArrayChange, onAddItem, onRemoveItem }) => {
  return (
    <>
      <div className="effects-section">
        <h3>Effects</h3>
        {data.effects.map((effect, index) => (
          <div key={index} className="array-input-row">
            <input
              type="text"
              value={effect}
              onChange={(e) => onArrayChange('effects', index, e.target.value)}
              placeholder="Describe environmental effect"
              className="form-input"
            />
            <Button action="delete" onClick={() => onRemoveItem('effects', index)} size="sm" title="Remove" />
          </div>
        ))}
        <Button action="add" onClick={() => onAddItem('effects')} size="sm" title="Add Effect">Add Effect</Button>
      </div>

      <div className="hazards-section">
        <h3>Hazards</h3>
        {data.hazards.map((hazard, index) => (
          <div key={index} className="array-input-row">
            <input
              type="text"
              value={hazard}
              onChange={(e) => onArrayChange('hazards', index, e.target.value)}
              placeholder="Describe environmental hazard"
              className="form-input"
            />
            <Button action="delete" onClick={() => onRemoveItem('hazards', index)} size="sm" title="Remove" />
          </div>
        ))}
        <Button action="add" onClick={() => onAddItem('hazards')} size="sm" title="Add Hazard">Add Hazard</Button>
      </div>
    </>
  )
}

export default EnvironmentEditForm


