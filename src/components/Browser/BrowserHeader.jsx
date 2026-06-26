import React, { useEffect, useRef } from 'react'
import { styles } from './Browser.styles'

// Browser Header Component — extracted from Browser.jsx (Phase 4).
const BrowserHeader = ({ searchTerm, onSearchChange, type, partyControls, showCustomToggle = false, onToggleCustom, filterCustom = false, onExportCustomAdversaries, onImportCustomAdversaries, autoFocus = false, onClose = null, placeholder = "Search" }) => {
  const searchInputRef = useRef(null)
  
  useEffect(() => {
    if (autoFocus && searchInputRef.current) {
      // Small delay to ensure the browser is fully rendered
      setTimeout(() => {
        searchInputRef.current?.focus()
      }, 100)
    }
  }, [autoFocus])
  
  return (
    <div className="browser-header" style={styles.browserHeader}>
      <div style={{ display: 'flex', alignItems: 'center', flex: 1, gap: '0.5rem' }}>
      <input
          ref={searchInputRef}
        type="text"
          placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
          style={{ ...styles.searchInput, flex: 1, marginRight: 0 }}
      />
        
      </div>
      
      {partyControls && (
        <div style={styles.partyControls}>
          {partyControls}
        </div>
      )}
    </div>
  )
}

export default BrowserHeader
