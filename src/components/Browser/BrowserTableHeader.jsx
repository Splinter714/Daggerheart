import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import { Filter, Square, CheckSquare } from 'lucide-react'
import { styles } from './Browser.styles'

// Browser Table Header Component — extracted from Browser.jsx (Phase 4).
const BrowserTableHeader = ({ 
  sortFields, 
  onSort, 
  type,
  // Advanced filtering props
  uniqueTiers,
  uniqueTypes,
  selectedTiers,
  selectedTypes,
  showTierDropdown,
  setShowTierDropdown,
  showTypeDropdown,
  setShowTypeDropdown,
  tierFilterRef,
  typeFilterRef,
  handleTierSelect,
  handleTypeSelect,
  isTierFiltered,
  isTypeFiltered,
  getDropdownStyle,
}) => {
  const [hoveredColumn, setHoveredColumn] = useState(null)

  const getColumns = () => {
    if (type === 'adversary') {
      return [
        { key: 'name', label: 'Name' },
        { key: 'tier', label: 'Tier', hasFilter: true },
        { key: 'type', label: 'Type', hasFilter: true },
        { key: 'source', label: 'Src' }
      ]
    } else if (type === 'environment') {
      return [
        { key: 'name', label: 'Name' },
        { key: 'tier', label: 'Tier', hasFilter: true },
        { key: 'type', label: 'Type', hasFilter: true },
        { key: 'source', label: 'Src' }
      ]
    }
    return []
  }

  const columns = getColumns()

  const renderFilterDropdown = (filterType, values, selected, onSelect, isOpen, setIsOpen, filterRef, isFiltered) => {
    if (!isOpen) return null

    const handleClear = () => {
      if (filterType === 'tier') {
        // Clear tier selection
        onSelect('clear')
      } else if (filterType === 'type') {
        // Clear type selection  
        onSelect('clear')
      }
    }

    return createPortal(
      <div 
        className="filter-dropdown"
        style={{
          ...styles.filterDropdown,
          ...getDropdownStyle(filterRef),
          maxHeight: '60vh',
          overflow: 'auto'
        }}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <div 
          style={{
            ...styles.filterOption,
            ...(selected.length === 0 ? styles.filterOptionSelected : {})
          }}
          onClick={handleClear}
        >
          <span style={styles.checkIcon}>
            {selected.length === 0 ? <CheckSquare size={16}/> : <Square size={16}/>}
          </span>
          <span style={styles.filterLabel}>All</span>
        </div>
        {values.map(value => {
          const isSelected = selected.includes(value.toString())
          return (
            <div
              key={value}
              style={{
                ...styles.filterOption,
                ...(isSelected ? styles.filterOptionSelected : {})
              }}
              onClick={() => onSelect(value.toString())}
            >
              <span style={styles.checkIcon}>
                {isSelected ? <CheckSquare size={16}/> : <Square size={16}/>}
              </span>
              <span style={styles.filterLabel}>{value}</span>
            </div>
          )
        })}
      </div>,
      document.body
    )
  }

  return (
    <tr style={styles.tableHeader}>
      {columns.map(column => (
        <th
          key={column.key}
          style={{
            ...styles.tableHeaderCell,
            ...(hoveredColumn === column.key ? styles.tableHeaderCellHover : {}),
            position: 'relative',
            // Apply column-specific widths
            ...(column.key === 'name' ? { width: 'auto', minWidth: '0' } : {}),
            ...(column.key === 'tier' ? { width: '40px', minWidth: '40px', maxWidth: '40px' } : {}),
            ...(column.key === 'type' ? { width: '80px', minWidth: '80px', maxWidth: '80px' } : {}),
            ...(column.key === 'source' ? { width: '40px', minWidth: '40px', maxWidth: '40px' } : {})
          }}
          onClick={() => onSort(column.key)}
          onMouseEnter={() => setHoveredColumn(column.key)}
          onMouseLeave={() => setHoveredColumn(null)}
        >
          {column.hasFilter ? (
            <div style={styles.headerWithFilter}>
              <span 
                style={{ cursor: 'pointer' }}
                onClick={(e) => {
                  e.stopPropagation()
                  onSort(column.key)
                }}
              >
                {column.label}
              </span>
              <button
                ref={column.key === 'tier' ? tierFilterRef : typeFilterRef}
                style={{
                  ...styles.headerFilterIcon,
                  ...(column.key === 'tier' && isTierFiltered ? styles.headerFilterIconActive : {}),
                  ...(column.key === 'type' && isTypeFiltered ? styles.headerFilterIconActive : {}),
                }}
                className="header-filter-icon"
                onClick={(e) => {
                  e.stopPropagation()
                  if (column.key === 'tier') {
                    setShowTierDropdown(!showTierDropdown)
                    setShowTypeDropdown(false)
                  } else if (column.key === 'type') {
                    setShowTypeDropdown(!showTypeDropdown)
                    setShowTierDropdown(false)
                  }
                }}
              >
                <Filter size={14} />
                {(column.key === 'tier' && isTierFiltered) || (column.key === 'type' && isTypeFiltered) ? (
                  <span style={styles.filterActiveDot}></span>
                ) : null}
              </button>
            </div>
          ) : (
            column.label
          )}
          
          {/* Filter dropdowns */}
          {column.key === 'tier' && renderFilterDropdown(
            'tier', uniqueTiers, selectedTiers, handleTierSelect,
            showTierDropdown, setShowTierDropdown, tierFilterRef, isTierFiltered
          )}
          {column.key === 'type' && renderFilterDropdown(
            'type', uniqueTypes, selectedTypes, handleTypeSelect,
            showTypeDropdown, setShowTypeDropdown, typeFilterRef, isTypeFiltered
          )}
        </th>
      ))}
    </tr>
  )
}

export default BrowserTableHeader
