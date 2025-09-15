import React from 'react'

const CombatStats = ({ hpMax, stressMax, onHpMaxChange, onStressMaxChange }) => {
  return (
    <div className="stats-section">
      <h3>Combat Stats</h3>
      <div className="stat-row">
        <span className="stat-label">Max HP:</span>
        <input
          type="number"
          inputMode="numeric"
          enterKeyHint="done"
          min="1"
          value={hpMax}
          onChange={(e) => onHpMaxChange(parseInt(e.target.value) || 1)}
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
          value={stressMax}
          onChange={(e) => onStressMaxChange(parseInt(e.target.value) || 0)}
          className="form-input"
        />
      </div>
    </div>
  )
}

export default CombatStats


