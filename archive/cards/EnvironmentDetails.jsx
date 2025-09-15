import React from 'react'
import { Badge, DifficultyBadge, TypeBadge } from '../ui/Badges'

const EnvironmentDetails = ({ item, onDelete: _onDelete, onEdit: _onEdit, HeaderRight }) => {
  return (
    <div className="expanded-card environment">
      <div className="expanded-header">
        <h2>{item.name}</h2>
        {HeaderRight ? <HeaderRight /> : null}
      </div>
      <div className="expanded-content">
        <div className="meta-section">
          <div className="meta-row"><span className="meta-label">Type:</span><TypeBadge type={item.type} /></div>
          <div className="meta-row"><span className="meta-label">Tier:</span><Badge variant="tier">Tier {item.tier}</Badge></div>
          <div className="meta-row"><span className="meta-label">Difficulty:</span><DifficultyBadge difficulty={item.difficulty} /></div>
        </div>
        {item.description && (
          <div className="description-section">
            <h3>Description</h3>
            <p>{item.description}</p>
          </div>
        )}
        {item.effects && item.effects.length > 0 && (
          <div className="effects-section">
            <h3>Effects</h3>
            <ul>{item.effects.map((effect, i) => (<li key={i}>{effect}</li>))}</ul>
          </div>
        )}
        {item.hazards && item.hazards.length > 0 && (
          <div className="hazards-section">
            <h3>Hazards</h3>
            <ul>{item.hazards.map((hazard, i) => (<li key={i}>{hazard}</li>))}</ul>
          </div>
        )}
      </div>
    </div>
  )
}

export default EnvironmentDetails


