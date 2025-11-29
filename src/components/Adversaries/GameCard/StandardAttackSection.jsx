import React from 'react'

const StandardAttackSection = ({ item, isEditMode, onUpdate }) => {
  const shouldShow = isEditMode || (item.atk !== undefined && item.weapon)
  if (!shouldShow) return null

  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '-0.25rem',
        }}
      >
        <hr
          style={{
            flex: 1,
            border: 'none',
            borderTop: '1px solid var(--border)',
            margin: 0,
          }}
        />
        <h4
          style={{
            margin: 0,
            fontSize: '0.75rem',
            fontWeight: '500',
            color: 'var(--text-secondary)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginLeft: '0.75rem',
          }}
        >
          Standard Attack
        </h4>
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {isEditMode ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.25rem',
              padding: '0.5rem',
              border: '1px solid var(--border)',
              borderRadius: '4px',
              backgroundColor: 'var(--bg-secondary)',
              marginTop: '0.75rem',
              marginBottom: '0.75rem',
            }}
          >
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <input
                type="text"
                value={item.weapon || ''}
                onChange={(e) => onUpdate && onUpdate(item.id, { weapon: e.target.value })}
                placeholder="Standard attack name"
                style={{
                  flex: 1,
                  padding: '0.25rem 0.5rem',
                  border: '1px solid var(--border)',
                  borderRadius: '4px',
                  backgroundColor: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  fontSize: '0.875rem',
                }}
              />
              <select
                value={item.range || ''}
                onChange={(e) => onUpdate && onUpdate(item.id, { range: e.target.value })}
                style={{
                  flex: 1,
                  padding: '0.25rem 0.5rem',
                  border: '1px solid var(--border)',
                  borderRadius: '4px',
                  backgroundColor: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  fontSize: '0.875rem',
                  appearance: 'none',
                  backgroundImage:
                    "url(\"data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e\")",
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 0.5rem center',
                  backgroundSize: '1rem',
                  paddingRight: '2rem',
                }}
              >
                <option value=""></option>
                <option value="Melee">Melee</option>
                <option value="Very Close">Very Close</option>
                <option value="Close">Close</option>
                <option value="Far">Far</option>
                <option value="Very Far">Very Far</option>
              </select>
              <input
                type="text"
                value={item.damage || ''}
                onChange={(e) => onUpdate && onUpdate(item.id, { damage: e.target.value })}
                placeholder="Damage (e.g., 1d6+2)"
                style={{
                  flex: 1,
                  padding: '0.25rem 0.5rem',
                  border: '1px solid var(--border)',
                  borderRadius: '4px',
                  backgroundColor: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  fontSize: '0.875rem',
                }}
              />
            </div>
          </div>
        ) : (
          <div
            style={{
              fontSize: '0.875rem',
              lineHeight: 1.4,
              color: 'var(--text-secondary)',
            }}
          >
            <span
              style={{
                fontWeight: 600,
                color: 'var(--text-primary)',
                marginBottom: '0.25rem',
                display: 'block',
              }}
            >
              {item.weapon}
            </span>
            <div
              style={{
                marginLeft: '0.25rem',
                color: 'var(--text-secondary)',
                marginBottom: '0.75rem',
              }}
            >
              Make an attack against a target within {item.range || 'Melee'} range. On a success, deal{' '}
              {item.damage || 'damage varies'}.
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default StandardAttackSection

