import React from 'react'

const AdversaryDetails = ({ item, HeaderRight }) => {
  return (
    <div className="expanded-card adversary">
      <div className="expanded-header">
        <h2>{item.name}</h2>
        {HeaderRight ? <HeaderRight /> : null}
      </div>
      <div className="expanded-content">
        {item.motives && (
          <div className="motives-section">
            <h3>Motives & Tactics</h3>
            <p><em>{item.motives}</em></p>
          </div>
        )}
        <div className="core-stats-section">
          <h3>Core Stats</h3>
          <div className="stats-grid">
            <div className="stat-item"><span className="stat-label">Difficulty:</span><span className="stat-value">{item.difficulty}</span></div>
            {item.thresholds && (
              <div className="stat-item"><span className="stat-label">Thresholds:</span><span className="stat-value">{item.thresholds.major}/{item.thresholds.severe}</span></div>
            )}
            <div className="stat-item"><span className="stat-label">ATK:</span><span className="stat-value">+{item.atk}</span></div>
            {item.weapon && (
              <div className="stat-item"><span className="stat-label">Weapon:</span><span className="stat-value">{item.weapon}: {item.range} | {item.damage}</span></div>
            )}
          </div>
        </div>
        {item.experience && item.experience.length > 0 && (
          <div className="experience-section">
            <h3>Experience</h3>
            <p>{item.experience.join(', ')}</p>
          </div>
        )}
        {item.description && (
          <div className="description-section">
            <h3>Description</h3>
            <p><em>{item.description}</em></p>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdversaryDetails
