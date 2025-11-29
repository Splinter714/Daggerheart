import React from 'react'

const DescriptionSection = ({ item, isEditMode, mode, onUpdate }) => {
  const shouldShow = isEditMode || (mode === 'expanded' && item.description && item.description.trim())
  if (!shouldShow) return null

  return (
    <div
      style={{
        padding: '0 8px',
        textAlign: 'center',
      }}
    >
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
          Description
        </h4>
      </div>
      {isEditMode ? (
        <textarea
          style={{
            width: '100%',
            minHeight: '100px',
            padding: '0.5rem',
            border: '1px solid var(--border)',
            borderRadius: '0.5rem',
            backgroundColor: 'var(--bg-primary)',
            color: 'white',
            fontSize: '0.875rem',
            lineHeight: 1.5,
            resize: 'none',
            overflow: 'hidden',
            fontFamily: 'inherit',
            marginTop: '0.75rem',
            marginBottom: '0.75rem',
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
            padding: '0.5rem 0',
          }}
        >
          {item.description}
        </div>
      )}
    </div>
  )
}

export default DescriptionSection

