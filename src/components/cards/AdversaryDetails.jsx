import React from 'react'
import { Droplet, Activity } from 'lucide-react'
import { TypeBadge, DifficultyBadge } from '../ui/Badges'

const AdversaryDetails = ({ item, HeaderRight }) => {
  const renderFeatures = (features) => {
    if (!features || features.length === 0) return null
    
    const validFeatures = features.filter(f => f.name && f.name.trim())
    if (validFeatures.length === 0) return null
    
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
    <div className="expanded-card adversary">
      {/* Header Section */}
      <div className="expanded-header">
        <h2>{item.name}</h2>
        <div className="tier-info">
          Tier {item.tier} {item.type}
        </div>
        {item.description && (
          <div className="description-text">
            {item.description}
          </div>
        )}
        {item.motives && (
          <div className="motives-text">
            <strong>Motives & Tactics:</strong> {item.motives}
          </div>
        )}
      </div>
      
      {/* Core Stats Block */}
      <div className="core-stats-block">
        {/* Primary Stats Row */}
        <div className="stats-row">
          <span className="stat-item">
            <strong>Diff:</strong> {item.difficulty}
          </span>
          <span className="stat-separator">|</span>
          <span className="stat-item">
            <strong>Thresholds:</strong> {item.thresholds?.major || '?'}/{item.thresholds?.severe || '?'}
          </span>
          <span className="stat-separator">|</span>
          <span className="stat-item">
            <strong>HP:</strong> {item.hpMax || 1}
          </span>
          <span className="stat-separator">|</span>
          <span className="stat-item">
            <strong>Stress:</strong> {item.stressMax || 0}
          </span>
        </div>
        
        {/* Combat Stats Row */}
        <div className="stats-row">
          <span className="stat-item">
            <strong>ATK:</strong> +{item.atk || 0}
          </span>
          <span className="stat-separator">|</span>
          <span className="stat-item">
            <strong>{item.weapon || 'Weapon'}:</strong> {item.range || 'Melee'}
          </span>
          <span className="stat-separator">|</span>
          <span className="stat-item">
            {item.damage || '1d6 phy'}
          </span>
        </div>
        
        {/* Experience Row */}
        {item.experience && item.experience.length > 0 && (
          <div className="stats-row">
            <span className="stat-item">
              <strong>Experience:</strong> {item.experience.map(exp => 
                typeof exp === 'string' ? exp : `${exp.name} ${exp.modifier >= 0 ? '+' : ''}${exp.modifier}`
              ).join(', ')}
            </span>
          </div>
        )}
      </div>
      
      {/* Features Section */}
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
    </div>
  )
}

export default AdversaryDetails
