import React from 'react'
import { createPortal } from 'react-dom'
import { Filter, Square, CheckSquare } from 'lucide-react'

const BrowserTableHeader = ({
  sortFields,
  onSort,
  tierFilterRef,
  typeFilterRef,
  isTierFiltered,
  isTypeFiltered,
  tierTooltip,
  typeTooltip,
  showTierDropdown,
  showTypeDropdown,
  onToggleTierDropdown,
  onToggleTypeDropdown,
  itemTiers,
  itemTypes,
  selectedTiers,
  selectedTypes,
  onClearTiers,
  onClearTypes,
  onTierSelect,
  onTypeSelect,
  getDropdownStyle
}) => {
  return (
    <tr>
      <th 
        onClick={() => onSort('name')} 
        className={`sortable ${sortFields[0]?.field === 'name' ? 'active' : ''} ${sortFields[0]?.field === 'name' ? sortFields[0].direction : ''}`}
      >
        Name
      </th>
      <th 
        onClick={() => onSort('tier')} 
        className={`sortable ${sortFields[0]?.field === 'tier' ? 'active' : ''} ${sortFields[0]?.field === 'tier' ? sortFields[0].direction : ''}`}
      >
        <div className="header-with-filter">
          Tier
          <button
            ref={tierFilterRef}
            onClick={(e) => {
              e.stopPropagation()
              onToggleTierDropdown()
            }}
            className={`header-filter-icon ${isTierFiltered ? 'active' : ''}`}
            title={`Filter by Tier: ${tierTooltip}`}
          >
            <Filter size={14} />
            <span className="filter-active-dot" aria-hidden="true" />
          </button>
          {showTierDropdown && createPortal(
            <div
              className="filter-dropdown"
              style={{
                ...getDropdownStyle(tierFilterRef),
                maxHeight: '60vh',
                overflow: 'auto'
              }}
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
            >
              <div 
                className={`filter-option ${selectedTiers.length === 0 ? 'selected' : ''}`} 
                onClick={() => onClearTiers()}
              >
                <span className="check-icon">{selectedTiers.length === 0 ? <CheckSquare size={16}/> : <Square size={16}/>}</span>
                <span className="filter-label">All</span>
              </div>
              {itemTiers.map(tier => {
                const isSelected = selectedTiers.includes(tier.toString())
                return (
                  <div 
                    key={tier} 
                    className={`filter-option ${isSelected ? 'selected' : ''}`}
                    onClick={() => onTierSelect(tier.toString())}
                  >
                    <span className="check-icon">{isSelected ? <CheckSquare size={16}/> : <Square size={16}/>}</span>
                    <span className="filter-label">{tier}</span>
                  </div>
                )
              })}
            </div>,
            document.body
          )}
        </div>
      </th>
      <th 
        onClick={() => onSort('displayType')} 
        className={`sortable ${sortFields[0]?.field === 'displayType' ? 'active' : ''} ${sortFields[0]?.field === 'displayType' ? sortFields[0].direction : ''}`}
      >
        <div className="header-with-filter">
          Type
          <button
            ref={typeFilterRef}
            onClick={(e) => {
              e.stopPropagation()
              onToggleTypeDropdown()
            }}
            className={`header-filter-icon ${isTypeFiltered ? 'active' : ''}`}
            title={`Filter by Type: ${typeTooltip}`}
          >
            <Filter size={14} />
            <span className="filter-active-dot" aria-hidden="true" />
          </button>
          {showTypeDropdown && createPortal(
            <div
              className="filter-dropdown"
              style={{
                ...getDropdownStyle(typeFilterRef),
                maxHeight: '60vh',
                overflow: 'auto'
              }}
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
            >
              <div 
                className={`filter-option ${selectedTypes.length === 0 ? 'selected' : ''}`} 
                onClick={() => onClearTypes()}
              >
                <span className="check-icon">{selectedTypes.length === 0 ? <CheckSquare size={16}/> : <Square size={16}/>}</span>
                <span className="filter-label">All</span>
              </div>
              {itemTypes.map(type => {
                const isSelected = selectedTypes.includes(type)
                return (
                  <div 
                    key={type} 
                    className={`filter-option ${isSelected ? 'selected' : ''}`}
                    onClick={() => onTypeSelect(type)}
                  >
                    <span className="check-icon">{isSelected ? <CheckSquare size={16}/> : <Square size={16}/>}</span>
                    <span className="filter-label">{type}</span>
                  </div>
                )
              })}
            </div>,
            document.body
          )}
        </div>
      </th>
      <th 
        onClick={() => onSort('displayDifficulty')} 
        className={`sortable ${sortFields[0]?.field === 'displayDifficulty' ? 'active' : ''} ${sortFields[0]?.field === 'displayDifficulty' ? sortFields[0].direction : ''}`}
      >
        <div className="header-with-filter">
          Diff
        </div>
      </th>
      <th></th>
    </tr>
  )
}

export default BrowserTableHeader


