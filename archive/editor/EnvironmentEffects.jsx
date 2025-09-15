import React from 'react'
import Button from '../controls/Buttons'

const EnvironmentEffects = ({
  effects,
  hazards,
  onEffectChange,
  onAddEffect,
  onRemoveEffect,
  onHazardChange,
  onAddHazard,
  onRemoveHazard,
}) => {
  return (
    <div className="form-section">
      <h3>Environment Effects</h3>
      <div className="effects-section">
        <h4>Effects</h4>
        {effects.map((effect, index) => (
          <div key={index} className="array-input-row">
            <input
              type="text"
              value={effect}
              onChange={(e) => onEffectChange(index, e.target.value)}
              placeholder="Describe environmental effect"
              className="form-input"
            />
            <Button action="delete" onClick={() => onRemoveEffect(index)} size="sm" title="Remove" />
          </div>
        ))}
        <Button action="add" onClick={onAddEffect} size="sm" title="Add Effect">Add Effect</Button>
      </div>

      <div className="hazards-section">
        <h4>Hazards</h4>
        {hazards.map((hazard, index) => (
          <div key={index} className="array-input-row">
            <input
              type="text"
              value={hazard}
              onChange={(e) => onHazardChange(index, e.target.value)}
              placeholder="Describe environmental hazard"
              className="form-input"
            />
            <Button action="delete" onClick={() => onRemoveHazard(index)} size="sm" title="Remove" />
          </div>
        ))}
        <Button action="add" onClick={onAddHazard} size="sm" title="Add Hazard">Add Hazard</Button>
      </div>
    </div>
  )
}

export default EnvironmentEffects


