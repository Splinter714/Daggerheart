import React from 'react'

// Small shared UI atoms for the custom adversary creator. Extracted verbatim
// from CustomAdversaryCreator.jsx (Phase 4). AddBtn/GuidanceHeading are kept
// even though nothing currently renders them (pre-existing dead code, moved
// as-is to stay behavior-identical).
export const DragHandle = () => (
  <div style={{ cursor: 'grab', color: 'var(--text-secondary)', padding: '0.3rem 0.2rem', flexShrink: 0, userSelect: 'none', fontSize: '1rem' }} title="Drag to reorder">⠿</div>
)

export const PanelHeader = ({ label, children }) => (
  <div style={{
    flex: '0 0 auto', padding: '0.45rem 0.75rem',
    borderBottom: '1px solid var(--border)',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)',
    textTransform: 'uppercase', letterSpacing: '0.5px',
  }}>
    <span>{label}</span>
    {children}
  </div>
)

export const AddBtn = ({ label, onClick }) => (
  <button type="button" onClick={onClick} style={{
    marginTop: '0.4rem', padding: '0.25rem 0.6rem',
    background: 'transparent', border: '1px dashed var(--border)',
    borderRadius: '0.25rem', color: 'var(--text-secondary)',
    fontSize: '0.75rem', cursor: 'pointer', width: '100%', textAlign: 'left',
  }}>+ {label}</button>
)

export const GuidanceHeading = ({ children }) => (
  <div style={{
    fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-secondary)',
    textTransform: 'uppercase', letterSpacing: '0.5px',
    paddingBottom: '0.3rem', borderBottom: '1px solid var(--border)',
    marginBottom: '0.5rem',
  }}>{children}</div>
)
