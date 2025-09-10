import React from 'react'
import Button from '../../controls/Buttons'

const AdversaryEditForm = ({ data, onChange, onArrayChange, onAddItem, onRemoveItem }) => {
  return (
    <>
      <div className="stats-section">
        <h3>Combat Stats</h3>
        <div className="stat-row">
          <span className="stat-label">Max HP:</span>
          <input
            type="number"
            inputMode="numeric"
            enterKeyHint="done"
            min="1"
            value={data.hpMax}
            onChange={(e) => onChange('hpMax', parseInt(e.target.value) || 1)}
            className="form-input"
          />
        </div>
        <div className="stat-row">
          <span className="stat-label">Max Stress:</span>
          <input
            type="number"
            inputMode="numeric"
            enterKeyHint="done"
            min="0"
            value={data.stressMax}
            onChange={(e) => onChange('stressMax', parseInt(e.target.value) || 0)}
            className="form-input"
          />
        </div>
      </div>

      <div className="abilities-section">
        <h3>Abilities</h3>
        {data.abilities.map((ability, index) => (
          <div key={index} className="array-input-row">
            <input
              type="text"
              value={ability}
              onChange={(e) => onArrayChange('abilities', index, e.target.value)}
              placeholder="Enter ability description"
              className="form-input"
            />
            <Button action="delete" onClick={() => onRemoveItem('abilities', index)} size="sm" title="Remove" />
          </div>
        ))}
        <Button action="add" onClick={() => onAddItem('abilities')} size="sm" title="Add Ability">Add Ability</Button>
      </div>

      <div className="traits-section">
        <h3>Traits</h3>
        {data.traits.map((trait, index) => (
          <div key={index} className="array-input-row">
            <input
              type="text"
              value={trait}
              onChange={(e) => onArrayChange('traits', index, e.target.value)}
              placeholder="Enter trait description"
              className="form-input"
            />
            <Button action="delete" onClick={() => onRemoveItem('traits', index)} size="sm" title="Remove" />
          </div>
        ))}
        <Button action="add" onClick={() => onAddItem('traits')} size="sm" title="Add Trait">Add Trait</Button>
      </div>
    </>
  )
}

export default AdversaryEditForm


