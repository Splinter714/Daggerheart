import React from 'react'
import { CARD_SPACE } from './constants'

const DescriptionSection = ({ item, isEditMode, mode, onUpdate }) => {
  const shouldShow = isEditMode || (mode === 'expanded' && item.description && item.description.trim())
  if (!shouldShow) return null

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: CARD_SPACE,
        paddingLeft: CARD_SPACE,
        paddingRight: CARD_SPACE,
        marginTop: CARD_SPACE,  // Space from Status section
        textAlign: 'center',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: CARD_SPACE,
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
          }}
        >
          Description
        </h4>
      </div>
      {isEditMode ? (
        <textarea
          style={{
            width: '100%',
            minHeight: '100px',
            padding: CARD_SPACE,
            border: '1px solid var(--border)',
            borderRadius: '0.5rem',
            backgroundColor: 'var(--bg-primary)',
            color: 'white',
            fontSize: '0.875rem',
            lineHeight: 1.5,
            resize: 'none',
            overflow: 'hidden',
            fontFamily: 'inherit',
          }}
          value={item.description}
          onChange={(e) => {
            e.target.style.height = 'auto'
            e.target.style.height = e.target.scrollHeight + 'px'
            onUpdate && onUpdate(item.id, { description: e.target.value })
          }}
          placeholder="Description..."
        />
      ) : (
        <div
          style={{
            fontSize: '0.875rem',
            fontStyle: 'italic',
            color: 'var(--text-secondary)',
            lineHeight: 1.4,
            whiteSpace: 'pre-wrap',
            padding: `${CARD_SPACE} 0`,
          }}
        >
          {item.description}
        </div>
      )}
    </div>
  )
}

export default DescriptionSection

