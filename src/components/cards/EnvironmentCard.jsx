import React from 'react'
import Button from '../controls/Buttons'
import { Badge, DifficultyBadge, TypeBadge } from '../ui/Badges'
import { Pencil } from 'lucide-react'
import CompactCardShell from './CompactCardShell'

const EnvironmentCard = ({ item, mode, onClick, onDelete, onEdit, dragAttributes, dragListeners, isEditMode: _isEditMode }) => {
  if (mode === 'compact') return renderCompact()
  return renderExpanded()

  function renderCompact() {
    return (
      <CompactCardShell
        className="environment"
        item={item}
        onClick={onClick}
        dragAttributes={dragAttributes}
        dragListeners={dragListeners}
      >
        <div className="row-main">
          <h4 className="row-title">{item.name}</h4>
          <div className="row-meta">{item.type && <TypeBadge type={item.type} />}</div>
        </div>
      </CompactCardShell>
    )
  }

  function renderExpanded() {
    return (
      <div className="expanded-card environment">
        <div className="expanded-header">
          <h2>{item.name}</h2>
          <div className="header-actions">
            <Button action="edit" size="sm" onClick={() => onEdit && onEdit(item)} title="Edit environment" aria-label="Edit environment">
              <Pencil size={16} />
            </Button>
            {onDelete && (
              <Button action="delete" size="sm" onClick={() => onDelete(item.id)} title="Delete environment">
                ×
              </Button>
            )}
          </div>
        </div>
        <div className="expanded-content">
          <div className="meta-section">
            <div className="meta-row">
              <span className="meta-label">Type:</span>
              <TypeBadge type={item.type} />
            </div>
            <div className="meta-row">
              <span className="meta-label">Tier:</span>
              <Badge variant="tier">Tier {item.tier}</Badge>
            </div>
            <div className="meta-row">
              <span className="meta-label">Difficulty:</span>
              <DifficultyBadge difficulty={item.difficulty} />
            </div>
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
              <ul>
                {item.effects.map((effect, i) => (
                  <li key={i}>{effect}</li>
                ))}
              </ul>
            </div>
          )}
          {item.hazards && item.hazards.length > 0 && (
            <div className="hazards-section">
              <h3>Hazards</h3>
              <ul>
                {item.hazards.map((hazard, i) => (
                  <li key={i}>{hazard}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    )}

  // drag handle handled by CompactCardShell
}

export default EnvironmentCard


