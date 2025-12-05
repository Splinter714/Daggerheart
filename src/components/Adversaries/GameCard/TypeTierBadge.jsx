import React from 'react'
import { CARD_SPACE_H, CARD_SPACE_V } from './constants'

/**
 * Compact badge showing the adversary type and tier. This was originally
 * defined inline inside GameCard; extracting it keeps the main component
 * focused on layout logic.
 */
const TypeTierBadge = ({ type, tier, isEditMode, onUpdate, itemId }) => {
  const getTextWidth = (text) => {
    if (!text) return 0
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    context.font = '600 11px system-ui, -apple-system, sans-serif'
    return context.measureText(text.toUpperCase()).width
  }

  const textWidth = getTextWidth(type)
  const leftPadding = 4
  const rightPadding = 18
  const typeWidth = Math.max(50, textWidth + leftPadding + rightPadding)
  const totalWidth = typeWidth + 15

  if (isEditMode) {
    return (
      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          gap: CARD_SPACE_H,
          height: '32px'
        }}
      >
        <select
          value={type || ''}
          onChange={(e) => {
            onUpdate && onUpdate(itemId, { type: e.target.value })
          }}
          style={{
            backgroundColor: 'var(--bg-primary)',
            border: '1px solid var(--text-secondary)',
            color: 'var(--text-primary)',
            fontSize: '0.6875rem',
            fontWeight: '500',
            textTransform: 'uppercase',
            outline: 'none',
            borderRadius: '4px',
            padding: `${CARD_SPACE_V} ${CARD_SPACE_H}`,
            width: '95px',
            height: '24px'
          }}
        >
          <option value="Standard">Standard</option>
          <option value="Solo">Solo</option>
          <option value="Bruiser">Bruiser</option>
          <option value="Horde">Horde</option>
          <option value="Minion">Minion</option>
          <option value="Ranged">Ranged</option>
          <option value="Leader">Leader</option>
          <option value="Skulk">Skulk</option>
          <option value="Social">Social</option>
          <option value="Support">Support</option>
        </select>

        <div
          style={{
            position: 'relative',
            width: '24px',
            height: '24px'
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%) rotate(45deg)',
              width: '20px',
              height: '20px',
              backgroundColor: 'var(--bg-primary)',
              border: '1px solid var(--text-secondary)',
              borderRadius: '2px'
            }}
          />
          <input
            type="text"
            value={tier || ''}
            onChange={(e) => {
              const value = e.target.value.replace(/[^1-4]/g, '')
              if (value.length <= 1) {
                onUpdate && onUpdate(itemId, { tier: value === '' ? '' : parseInt(value) })
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'ArrowUp') {
                e.preventDefault()
                const current = parseInt(tier) || 1
                onUpdate && onUpdate(itemId, { tier: Math.min(current + 1, 4) })
              } else if (e.key === 'ArrowDown') {
                e.preventDefault()
                const current = parseInt(tier) || 1
                onUpdate && onUpdate(itemId, { tier: Math.max(current - 1, 1) })
              }
            }}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              backgroundColor: 'transparent',
              border: 'none',
              color: 'var(--text-primary)',
              fontSize: '0.8rem',
              fontWeight: 600,
              width: '24px',
              height: '24px',
              textAlign: 'center',
              outline: 'none',
              zIndex: 1
            }}
            maxLength="1"
          />
        </div>
      </div>
    )
  }

  return (
    <div
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '32px',
        width: `${totalWidth}px`
      }}
    >
      <svg
        width={totalWidth}
        height="32"
        viewBox={`0 0 ${totalWidth} 32`}
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 1
        }}
      >
        <rect
          x="1"
          y="6"
          width={typeWidth - 1}
          height="20"
          fill="var(--bg-primary)"
          stroke="var(--text-secondary)"
          strokeWidth="1"
          rx="4"
          ry="4"
        />
        <rect
          x={typeWidth - 10}
          y="6"
          width="20"
          height="20"
          fill="var(--bg-primary)"
          stroke="var(--text-secondary)"
          strokeWidth="1"
          rx="2"
          ry="2"
          transform={`rotate(45 ${typeWidth - 1} 16)`}
        />
      </svg>

      <span
        style={{
          position: 'absolute',
          top: '50%',
          left: '4px',
          transform: 'translateY(-50%)',
          fontSize: '0.6875rem',
          fontWeight: '500',
          textTransform: 'uppercase',
          color: 'var(--text-primary)',
          zIndex: 2,
          pointerEvents: 'none'
        }}
      >
        {type}
      </span>

      <span
        style={{
          position: 'absolute',
          top: '50%',
          left: `${typeWidth - 0.5}px`,
          transform: 'translate(-50%, -50%)',
          fontSize: '0.8rem',
          fontWeight: 600,
          color: 'white',
          zIndex: 2,
          pointerEvents: 'none',
          textAlign: 'center',
          lineHeight: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '20px',
          height: '20px'
        }}
      >
        {tier}
      </span>
    </div>
  )
}

export default TypeTierBadge

