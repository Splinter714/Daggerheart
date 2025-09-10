import React from 'react'
import { Droplet, Activity } from 'lucide-react'
import Button from '../controls/Buttons'
import { TypeBadge, DifficultyBadge } from '../ui/Badges'
import CompactCardShell from './CompactCardShell'

const AdversaryCard = ({
  item,
  mode,
  onClick,
  onDelete,
  onApplyDamage,
  onApplyHealing,
  onApplyStressChange,
  dragAttributes,
  dragListeners,
}) => {
  if (mode !== 'compact') return null

  return (
    <CompactCardShell
      className={`adversary ${(item.hp || 0) >= (item.hpMax || 1) ? 'dead' : ''}`}
      item={item}
      onClick={onClick}
      dragAttributes={dragAttributes}
      dragListeners={dragListeners}
    >
      <div className="row-main">
        <h4 className="row-title">{item.name}</h4>
        <div className="row-meta">
          {item.type && <TypeBadge type={item.type} />}
        </div>
      </div>
      <div className="card-actions countdown-actions">
          <div className="countdown-control-buttons">
            <div className="hp-section">
              <div className="hp-symbols">
                {Array.from({ length: item.hpMax || 1 }, (_, i) => (
                  <span
                    key={i}
                    className={`countdown-symbol ${i < (item.hp || 0) ? 'filled' : 'empty'}`}
                    title={i < (item.hp || 0) ? 'Click to heal (reduce damage)' : 'Click to take damage'}
                    onClick={(e) => {
                      e.stopPropagation()
                      e.preventDefault()
                      if (i < (item.hp || 0)) {
                        onApplyHealing && onApplyHealing(item.id, 1, item.hp)
                      } else {
                        onApplyDamage && onApplyDamage(item.id, 1, item.hp, item.hpMax)
                      }
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    <Droplet size={16} />
                  </span>
                ))}
              </div>
            </div>
            {item.stressMax > 0 && (
              <div className="stress-section">
                <div className="stress-symbols">
                  {Array.from({ length: item.stressMax }, (_, i) => (
                    <span
                      key={i}
                      className={`countdown-symbol ${i < (item.stress || 0) ? 'filled' : 'empty'}`}
                      title={i < (item.stress || 0) ? 'Click to reduce stress' : 'Click to increase stress'}
                      onClick={(e) => {
                        e.stopPropagation()
                        e.preventDefault()
                        if (i < (item.stress || 0)) {
                          onApplyStressChange && onApplyStressChange(item.id, -1, item.stress, item.stressMax)
                        } else {
                          onApplyStressChange && onApplyStressChange(item.id, 1, item.stress, item.stressMax)
                        }
                      }}
                      style={{ cursor: 'pointer' }}
                    >
                      <Activity size={16} />
                    </span>
                  ))}
                </div>
              </div>
            )}
            {item.difficulty && (
              <div className="difficulty-section">
                <div 
                  className="difficulty-shield-container"
                  onClick={(e) => {
                    e.stopPropagation()
                    e.preventDefault()
                    // Open damage input for difficulty-based damage
                    // For minion types, use minion logic (damage = difficulty)
                    // For other types, use regular damage input
                    const damageAmount = item.type === 'Minion' ? item.difficulty : 1
                    onApplyDamage && onApplyDamage(item.id, damageAmount, item.hp, item.hpMax)
                  }}
                  style={{ cursor: 'pointer' }}
                  title={`Click to apply ${item.type === 'Minion' ? item.difficulty : 1} damage`}
                >
                  <DifficultyBadge difficulty={item.difficulty} />
                </div>
              </div>
            )}
          </div>
          <div className="countdown-delete-space">
            {dragAttributes && dragListeners && (
              <Button
                action="delete"
                size="sm"
                immediate={true}
                onClick={(e) => {
                  e.stopPropagation()
                  e.preventDefault()
                  onDelete && onDelete(item.id)
                }}
                title="Delete adversary"
              >
                ×
              </Button>
            )}
          </div>
      </div>
    </CompactCardShell>
  )
}

export default AdversaryCard


