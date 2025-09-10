import React from 'react'

const DetailsSection = ({
  tier,
  typeValue,
  difficulty,
  onTierChange,
  onTypeChange,
  onDifficultyChange,
}) => {
  return (
    <div className="form-section">
      <h3>Details</h3>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="tier">Tier</label>
          <select
            id="tier"
            value={tier}
            onChange={(e) => onTierChange(parseInt(e.target.value))}
            className="form-select"
          >
            {[1, 2, 3, 4, 5].map((t) => (
              <option key={t} value={t}>
                Tier {t}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="type">Type</label>
          <input
            id="type"
            type="text"
            value={typeValue}
            onChange={(e) => onTypeChange(e.target.value)}
            placeholder="e.g., Beast, Humanoid, Undead"
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label htmlFor="difficulty">Difficulty</label>
          <select
            id="difficulty"
            value={difficulty}
            onChange={(e) => onDifficultyChange(parseInt(e.target.value))}
            className="form-select"
          >
            {[1, 2, 3, 4, 5].map((d) => (
              <option key={d} value={d}>
                Difficulty {d}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}

export default DetailsSection


