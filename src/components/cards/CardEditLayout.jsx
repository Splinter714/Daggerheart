import React from 'react'
import Button from '../controls/Buttons'

const CardEditLayout = ({
  item,
  type,
  editData,
  onChange,
  onSave,
  onCancel,
  children,
  showMetaDetails = true
}) => {
  const isCreating = !item
  return (
    <div className="expanded-card edit-mode">
      <div className="edit-header">
        <h2>{isCreating ? 'Create' : 'Edit'} {type === 'adversary' ? 'Adversary' : type === 'environment' ? 'Environment' : 'Countdown'}</h2>
        <div className="edit-actions">
          <Button action="save" size="sm" onClick={onSave}>Save</Button>
          <Button action="secondary" size="sm" onClick={onCancel}>Cancel</Button>
        </div>
      </div>

      <div className="expanded-content">
        <div className="meta-section">
          <div className="meta-row">
            <span className="meta-label">Name:</span>
            <input
              type="text"
              value={editData.name}
              onChange={(e) => onChange('name', e.target.value)}
              placeholder={`Enter ${type} name`}
              className="form-input"
            />
          </div>
          {showMetaDetails && (
            <>
              <div className="meta-row">
                <span className="meta-label">Tier:</span>
                <select
                  value={editData.tier}
                  onChange={(e) => onChange('tier', parseInt(e.target.value))}
                  className="form-select"
                >
                  {[1, 2, 3, 4, 5].map(tier => (
                    <option key={tier} value={tier}>Tier {tier}</option>
                  ))}
                </select>
              </div>

              <div className="meta-row">
                <span className="meta-label">Type:</span>
                <input
                  type="text"
                  value={editData.type}
                  onChange={(e) => onChange('type', e.target.value)}
                  placeholder="e.g., Beast, Humanoid, Undead"
                  className="form-input"
                />
              </div>

              <div className="meta-row">
                <span className="meta-label">Difficulty:</span>
                <select
                  value={editData.difficulty}
                  onChange={(e) => onChange('difficulty', parseInt(e.target.value))}
                  className="form-select"
                >
                  {[1, 2, 3, 4, 5].map(diff => (
                    <option key={diff} value={diff}>Difficulty {diff}</option>
                  ))}
                </select>
              </div>
            </>
          )}
        </div>

        <div className="description-section">
          <h3>Description</h3>
          <textarea
            value={editData.description}
            onChange={(e) => onChange('description', e.target.value)}
            placeholder={`Describe this ${type}`}
            className="form-textarea"
            rows={3}
          />
        </div>

        {children}
      </div>
    </div>
  )
}

export default CardEditLayout


