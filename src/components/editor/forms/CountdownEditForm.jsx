import React from 'react'

const CountdownEditForm = ({ data, onChange }) => {
  return (
    <div className="stats-section">
      <h3>Countdown Settings</h3>
      <div className="stat-row">
        <span className="stat-label">Max Value:</span>
        <input
          type="number"
          inputMode="numeric"
          enterKeyHint="done"
          min="1"
          max="20"
          value={data.max}
          onChange={(e) => onChange('max', parseInt(e.target.value) || 5)}
          className="form-input"
        />
      </div>
      <div className="stat-row">
        <span className="stat-label">Starting Value:</span>
        <input
          type="number"
          inputMode="numeric"
          enterKeyHint="done"
          min="0"
          max={data.max}
          value={data.value}
          onChange={(e) => onChange('value', parseInt(e.target.value) || 0)}
          className="form-input"
        />
      </div>
    </div>
  )
}

export default CountdownEditForm


