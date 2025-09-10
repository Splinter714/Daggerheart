import React from 'react'
import Button from '../controls/Buttons'

const BrowserHeader = ({ searchTerm, onSearchChange, onCreateCustom, type }) => {
  return (
    <div className="browser-header">
      <input
        type="text"
        placeholder="Search"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="browser-search-input"
      />

      <Button
        action="add"
        onClick={() => onCreateCustom && onCreateCustom(type)}
        size="sm"
        className="browser-create-btn"
        aria-label="Create custom"
      >
        Create
      </Button>
    </div>
  )
}

export default BrowserHeader


