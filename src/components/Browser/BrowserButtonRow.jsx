import React from 'react'

// Browser Button Row Component — extracted from Browser.jsx (Phase 4). Pure presentational.
const BrowserButtonRow = ({ showCustomToggle = false, onToggleCustom, filterCustom = false, onExportCustomAdversaries, onImportCustomAdversaries }) => {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      padding: '0.75rem 1rem',
      backgroundColor: 'var(--bg-secondary)',
      borderBottom: '1px solid var(--border)',
      flexShrink: 0
    }}>
      {/* Custom Toggle Button */}
      {showCustomToggle && (
        <button
          onClick={() => onToggleCustom && onToggleCustom(!filterCustom)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            backgroundColor: filterCustom ? 'var(--purple)' : 'var(--bg-primary)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            color: filterCustom ? 'white' : 'var(--text-primary)',
            fontSize: '0.875rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            whiteSpace: 'nowrap'
          }}
          onMouseEnter={(e) => {
            if (!filterCustom) {
              e.target.style.backgroundColor = 'var(--bg-hover)'
              e.target.style.borderColor = 'var(--purple)'
            }
          }}
          onMouseLeave={(e) => {
            if (!filterCustom) {
              e.target.style.backgroundColor = 'var(--bg-primary)'
              e.target.style.borderColor = 'var(--border)'
            }
          }}
        >
          <span>{filterCustom ? '✓' : '○'}</span>
          Custom Only
        </button>
      )}
      
      {/* Export/Import Buttons - Always Visible */}
      <button
        onClick={onExportCustomAdversaries}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.5rem 1rem',
          backgroundColor: 'var(--bg-primary)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          color: 'var(--text-primary)',
          fontSize: '0.875rem',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          whiteSpace: 'nowrap'
        }}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = 'var(--bg-hover)'
          e.target.style.borderColor = 'var(--purple)'
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = 'var(--bg-primary)'
          e.target.style.borderColor = 'var(--border)'
        }}
      >
        <span>↓</span>
        Export
      </button>
      
      <button
        onClick={() => document.getElementById('import-file-input').click()}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.5rem 1rem',
          backgroundColor: 'var(--bg-primary)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          color: 'var(--text-primary)',
          fontSize: '0.875rem',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          whiteSpace: 'nowrap'
        }}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = 'var(--bg-hover)'
          e.target.style.borderColor = 'var(--purple)'
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = 'var(--bg-primary)'
          e.target.style.borderColor = 'var(--border)'
        }}
      >
        <span>↑</span>
        Import
      </button>
      
      <input
        id="import-file-input"
        type="file"
        accept=".csv,.json"
        onChange={onImportCustomAdversaries}
        style={{ display: 'none' }}
      />
    </div>
  )
}

export default BrowserButtonRow
