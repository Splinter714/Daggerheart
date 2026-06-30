import React, { useState } from 'react'
import { TYPES } from './customCreatorConstants'
import { typeGuide } from './adversaryTypeGuide'

// Type dropdown for the custom adversary creator. Extracted verbatim from
// CustomAdversaryCreator.jsx (Phase 4).
export const TypeSelector = ({ selectedType, onTypeChange }) => {
  const [typeOpen, setTypeOpen] = useState(false)
  const tGuide = typeGuide[selectedType]
  return (
    <div style={{ position: 'relative' }}>
      <button type="button" onClick={() => setTypeOpen(v => !v)} style={{
        width: '100%', textAlign: 'left',
        background: 'var(--bg-secondary)',
        border: `1px solid ${typeOpen ? 'var(--purple)' : 'var(--border)'}`,
        borderRadius: typeOpen ? '0.25rem 0.25rem 0 0' : '0.25rem',
        padding: '0.4rem 0.6rem',
        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem',
        minHeight: '44px',
      }}>
        <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>{selectedType}</span>
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', flexShrink: 0 }}>{typeOpen ? '▲' : '▼'}</span>
      </button>
      {typeOpen && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50,
          border: '1px solid var(--purple)', borderTop: 'none',
          borderRadius: '0 0 0.25rem 0.25rem',
          backgroundColor: 'var(--bg-primary)',
          maxHeight: '260px', overflowY: 'auto',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        }}>
          {TYPES.map(t => {
            const tg = typeGuide[t]
            const isSelected = selectedType === t
            return (
              <button key={t} type="button" onClick={() => { onTypeChange(t); setTypeOpen(false) }} style={{
                width: '100%', textAlign: 'left',
                background: isSelected ? 'color-mix(in srgb, var(--purple) 15%, transparent)' : 'transparent',
                border: 'none', borderBottom: '1px solid var(--border)',
                padding: '0.4rem 0.6rem', cursor: 'pointer', minHeight: '44px',
              }}>
                <div style={{ fontWeight: 600, fontSize: '0.85rem', color: isSelected ? 'var(--purple)' : 'var(--text-primary)', marginBottom: tg?.summary ? '0.1rem' : 0 }}>{t}</div>
                {tg?.summary && <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.35 }}>{tg.summary}</div>}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default TypeSelector
