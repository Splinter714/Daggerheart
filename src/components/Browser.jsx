import React, { useMemo, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Filter, Square, CheckSquare } from 'lucide-react'
import GameCard from './GameCard'

// Battle Points costs for different adversary types (from EncounterBuilder)
const BATTLE_POINT_COSTS = {
  'Minion': 1, // per group equal to party size
  'Social': 1,
  'Support': 1,
  'Horde': 2,
  'Ranged': 2,
  'Skulk': 2,
  'Standard': 2,
  'Leader': 3,
  'Bruiser': 4,
  'Solo': 5
}

// Battle Points adjustments (from EncounterBuilder)
const BATTLE_POINT_ADJUSTMENTS = {
  twoOrMoreSolos: -2,
  noBruisersHordesLeadersSolos: 1,
  lowerTierAdversary: 1
}

// Dynamically import JSON data to keep initial bundle smaller
let adversariesData = { adversaries: [] }
let environmentsData = { environments: [] }
let _dataLoaded = false

// Load data asynchronously
const loadData = async () => {
  try {
    const mod = await import(/* @vite-ignore */ '../data/adversaries.json')
    adversariesData = mod?.default || mod
  } catch (e) {
    console.warn('Failed to load adversaries.json:', e)
  }
  try {
    const mod = await import(/* @vite-ignore */ '../data/environments.json')
    environmentsData = mod?.default || mod
  } catch (e) {
    console.warn('Failed to load environments.json:', e)
  }
  _dataLoaded = true
}

// Custom hook for browser functionality - all logic inline
const useBrowser = (type, encounterItems = [], pcCount = 4, playerTier = 1) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortFields, setSortFields] = useState([{ field: 'tier', direction: 'asc' }, { field: 'name', direction: 'asc' }])
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Advanced filtering state
  const [selectedTiers, setSelectedTiers] = useState([])
  const [selectedTypes, setSelectedTypes] = useState([])
  const [showTierDropdown, setShowTierDropdown] = useState(false)
  const [showTypeDropdown, setShowTypeDropdown] = useState(false)
  
  // Refs for dropdown positioning
  const tierFilterRef = useRef(null)
  const typeFilterRef = useRef(null)

  useEffect(() => {
    const initializeData = async () => {
      await loadData()
      setLoading(false)
      
      // Set data after loading is complete
      let sourceData = []
      if (type === 'adversary') {
        sourceData = adversariesData.adversaries || []
      } else if (type === 'environment') {
        sourceData = environmentsData.environments || []
      }
      
      setData(sourceData)
    }
    
    initializeData()
  }, [type])

  // Get unique values for filtering
  const getUniqueValues = (field) => {
    const values = data.map(item => item[field]).filter(Boolean)
    return [...new Set(values)].sort((a, b) => {
      // Sort numbers numerically, strings alphabetically
      if (typeof a === 'number' && typeof b === 'number') {
        return a - b
      }
      return String(a).localeCompare(String(b))
    })
  }

  const uniqueTiers = getUniqueValues('tier')
  const uniqueTypes = getUniqueValues('type')

  const filteredAndSortedData = useMemo(() => {
    let filtered = data.filter(item => {
      // Search filter
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase())
      
      // Tier filter
      const matchesTier = selectedTiers.length === 0 || selectedTiers.includes(item.tier.toString())
      
      // Type filter
      const matchesType = selectedTypes.length === 0 || selectedTypes.includes(item.type)
      
      return matchesSearch && matchesTier && matchesType
    })

    // Apply multi-level sorting (like archived version)
    filtered.sort((a, b) => {
      for (const sort of sortFields) {
        const { field, direction } = sort
        let aValue = a[field]
        let bValue = b[field]
        
        if (field === 'tier') {
          aValue = parseInt(aValue) || 0
          bValue = parseInt(bValue) || 0
        } else if (field === 'cost') {
          // Calculate dynamic cost for sorting
          const calculateDynamicCost = (item) => {
            if (type !== 'adversary') return 0
            
            const baseCost = BATTLE_POINT_COSTS[item.type] || 2
            let automaticAdjustment = 0
            
            // Count current adversaries by type
            const currentSoloCount = encounterItems.filter(encounterItem => 
              encounterItem.type === 'adversary' && encounterItem.item.type === 'Solo' && encounterItem.quantity > 0
            ).reduce((sum, encounterItem) => sum + encounterItem.quantity, 0)
            
            const currentMajorThreatCount = encounterItems.filter(encounterItem => 
              encounterItem.type === 'adversary' && ['Bruiser', 'Horde', 'Leader', 'Solo'].includes(encounterItem.item.type) && encounterItem.quantity > 0
            ).reduce((sum, encounterItem) => sum + encounterItem.quantity, 0)
            
            // Calculate automatic adjustments
            if (item.type === 'Solo') {
              // If this would be the 2nd Solo, add 2 BP (penalty for 2+ Solos)
              if (currentSoloCount === 1) {
                automaticAdjustment += 2
              }
            }
            
            if (['Bruiser', 'Horde', 'Leader', 'Solo'].includes(item.type)) {
              // If this is the first Major Threat, add 1 BP (automatic adjustment for lack of Major Threats)
              if (currentMajorThreatCount === 0) {
                automaticAdjustment += 1
              }
            }
            
            // Lower tier adjustment
            if (item.tier < playerTier) {
              automaticAdjustment += 1
            }
            
            return baseCost + automaticAdjustment
          }
          
          aValue = calculateDynamicCost(a)
          bValue = calculateDynamicCost(b)
        } else if (field === 'difficulty') {
          // Handle difficulty sorting - numeric difficulties first, then special cases
          const aNum = parseInt(aValue)
          const bNum = parseInt(bValue)
          
          if (!isNaN(aNum) && !isNaN(bNum)) {
            // Both are numeric
            aValue = aNum
            bValue = bNum
          } else if (!isNaN(aNum) && isNaN(bNum)) {
            // a is numeric, b is not - numeric comes first
            aValue = aNum
            bValue = 999 // High number to sort after numeric difficulties
          } else if (isNaN(aNum) && !isNaN(bNum)) {
            // b is numeric, a is not - numeric comes first
            aValue = 999 // High number to sort after numeric difficulties
            bValue = bNum
          } else {
            // Both are non-numeric, sort alphabetically
            aValue = String(aValue || '').toLowerCase()
            bValue = String(bValue || '').toLowerCase()
          }
        } else if (typeof aValue === 'string' && typeof bValue === 'string') {
          aValue = aValue.toLowerCase()
          bValue = bValue.toLowerCase()
        } else {
          // Handle non-string values by converting to strings
          aValue = String(aValue || '').toLowerCase()
          bValue = String(bValue || '').toLowerCase()
        }
        
        if (direction === 'asc') {
          if (aValue > bValue) return 1
          if (aValue < bValue) return -1
        } else {
          if (aValue < bValue) return 1
          if (aValue > bValue) return -1
        }
        // If equal, continue to next sort level
      }
      return 0
    })

    return filtered
  }, [data, searchTerm, sortFields, selectedTiers, selectedTypes, encounterItems, pcCount, playerTier])

  const handleSort = (field) => {
    setSortFields(prev => {
      // Check if this field is already in the sort fields
      const existingIndex = prev.findIndex(sort => sort.field === field)
      
      if (existingIndex >= 0) {
        // Field exists - check if it's the primary field
        if (existingIndex === 0) {
          // It's the primary field - toggle direction
          const newSortFields = [...prev]
          newSortFields[0] = {
            ...newSortFields[0],
            direction: newSortFields[0].direction === 'asc' ? 'desc' : 'asc'
          }
          return newSortFields
        } else {
          // It's not the primary field - move it to primary position and reset to asc
          const newSortFields = [...prev]
          const existingSort = newSortFields.splice(existingIndex, 1)[0]
          return [{ field, direction: 'asc' }, ...newSortFields]
        }
      } else {
        // Field doesn't exist - add it as new primary sort
        return [{ field, direction: 'asc' }, ...prev]
      }
    })
  }


  const handleTierSelect = (tier) => {
    if (tier === 'clear') {
      setSelectedTiers([])
    } else {
      setSelectedTiers(prev => 
        prev.includes(tier) 
          ? prev.filter(t => t !== tier)
          : [...prev, tier]
      )
    }
    // Don't close dropdown - allow multiple selections
  }

  const handleTypeSelect = (type) => {
    if (type === 'clear') {
      setSelectedTypes([])
    } else {
      setSelectedTypes(prev => 
        prev.includes(type) 
          ? prev.filter(t => t !== type)
          : [...prev, type]
      )
    }
    // Don't close dropdown - allow multiple selections
  }

  const isTierFiltered = selectedTiers.length > 0
  const isTypeFiltered = selectedTypes.length > 0

  // Close dropdowns on outside click
  useEffect(() => {
    const handleGlobalDown = (event) => {
      const inDropdown = event.target.closest('.filter-dropdown')
      const onFilterButton = event.target.closest('.header-filter-icon')
      if (inDropdown || onFilterButton) return
      setShowTierDropdown(false)
      setShowTypeDropdown(false)
    }
    const handleKey = (event) => {
      if (event.key === 'Escape') {
        setShowTierDropdown(false)
        setShowTypeDropdown(false)
      }
    }

    document.addEventListener('pointerdown', handleGlobalDown, true)
    document.addEventListener('mousedown', handleGlobalDown, true)
    document.addEventListener('touchstart', handleGlobalDown, true)
    document.addEventListener('click', handleGlobalDown, true)
    document.addEventListener('keydown', handleKey, true)
    return () => {
      document.removeEventListener('pointerdown', handleGlobalDown, true)
      document.removeEventListener('mousedown', handleGlobalDown, true)
      document.removeEventListener('touchstart', handleGlobalDown, true)
      document.removeEventListener('click', handleGlobalDown, true)
      document.removeEventListener('keydown', handleKey, true)
    }
  }, [setShowTierDropdown, setShowTypeDropdown])

  // Get dropdown positioning
  const getDropdownStyle = (ref) => {
    if (!ref.current) return {}
    const rect = ref.current.getBoundingClientRect()
    return {
      position: 'fixed',
      top: rect.bottom + 4,
      left: rect.left - 100, // Align with left side of column instead of button
      zIndex: 99999
    }
  }

  return {
    searchTerm,
    setSearchTerm,
    sortFields,
    handleSort,
    filteredAndSortedData,
    loading,
    // Advanced filtering
    selectedTiers,
    selectedTypes,
    showTierDropdown,
    setShowTierDropdown,
    showTypeDropdown,
    setShowTypeDropdown,
    tierFilterRef,
    typeFilterRef,
    uniqueTiers,
    uniqueTypes,
    handleTierSelect,
    handleTypeSelect,
    isTierFiltered,
    isTypeFiltered,
    getDropdownStyle
  }
}

// Browser Header Component
const BrowserHeader = ({ searchTerm, onSearchChange, type }) => {
  return (
    <div style={styles.browserHeader}>
      <input
        type="text"
        placeholder="Search"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        style={styles.searchInput}
      />
    </div>
  )
}

// Browser Table Header Component
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
  getDropdownStyle
}) => {
  const [hoveredColumn, setHoveredColumn] = useState(null)

  const getColumns = () => {
    if (type === 'adversary') {
      return [
        { key: 'name', label: 'Name' },
        { key: 'tier', label: 'Tier', hasFilter: true },
        { key: 'type', label: 'Type', hasFilter: true },
        { key: 'difficulty', label: 'Diff' },
        { key: 'cost', label: 'Cost' },
        { key: 'action', label: '' } // Empty label for action column
      ]
    } else if (type === 'environment') {
      return [
        { key: 'name', label: 'Name' },
        { key: 'tier', label: 'Tier', hasFilter: true },
        { key: 'type', label: 'Type', hasFilter: true },
        { key: 'difficulty', label: 'Diff' },
        { key: 'action', label: '' } // Empty label for action column
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
            ...(column.key === 'tier' ? { width: '80px', minWidth: '80px', maxWidth: '80px' } : {}),
            ...(column.key === 'type' ? { width: '100px', minWidth: '100px', maxWidth: '100px' } : {}),
            ...(column.key === 'difficulty' ? { width: '40px', minWidth: '40px', maxWidth: '40px' } : {}),
            ...(column.key === 'cost' ? { width: '50px', minWidth: '50px', maxWidth: '50px' } : {}),
            ...(column.key === 'action' ? { width: '40px', minWidth: '40px', maxWidth: '40px' } : {})
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
                  ...(column.key === 'type' && isTypeFiltered ? styles.headerFilterIconActive : {})
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

// Browser Row Component
const BrowserRow = ({ item, onAdd, type, onRowClick, encounterItems = [], pcCount = 4, playerTier = 1, remainingBudget = 0 }) => {
  const [isHovered, setIsHovered] = useState(false)

  const handleAdd = () => {
    onAdd(item)
  }

  // Calculate dynamic cost including automatic adjustments
  const calculateDynamicCost = () => {
    if (type !== 'adversary') return null
    
    const baseCost = BATTLE_POINT_COSTS[item.type] || 2
    let automaticAdjustment = 0
    
    // Count current adversaries by type
    const currentSoloCount = encounterItems.filter(encounterItem => 
      encounterItem.type === 'adversary' && encounterItem.item.type === 'Solo' && encounterItem.quantity > 0
    ).reduce((sum, encounterItem) => sum + encounterItem.quantity, 0)
    
    const currentMajorThreatCount = encounterItems.filter(encounterItem => 
      encounterItem.type === 'adversary' && ['Bruiser', 'Horde', 'Leader', 'Solo'].includes(encounterItem.item.type) && encounterItem.quantity > 0
    ).reduce((sum, encounterItem) => sum + encounterItem.quantity, 0)
    
    // Calculate automatic adjustments
    if (item.type === 'Solo') {
      // If this would be the 2nd Solo, add 2 BP (penalty for 2+ Solos)
      if (currentSoloCount === 1) {
        automaticAdjustment += 2
      }
    }
    
    if (['Bruiser', 'Horde', 'Leader', 'Solo'].includes(item.type)) {
      // If this is the first Major Threat, add 1 BP (automatic adjustment for lack of Major Threats)
      if (currentMajorThreatCount === 0) {
        automaticAdjustment += 1
      }
    }
    
    // Lower tier adjustment
    if (item.tier < playerTier) {
      automaticAdjustment += 1
    }
    
    return baseCost + automaticAdjustment
  }

  const renderContent = () => {
    if (type === 'adversary') {
      const dynamicCost = calculateDynamicCost()
      const baseCost = BATTLE_POINT_COSTS[item.type] || 2
      const exceedsBudget = dynamicCost > remainingBudget
      
      // De-emphasized styling for rows that exceed budget
      const deEmphasizedStyle = exceedsBudget ? {
        opacity: 0.5,
        color: 'var(--text-secondary)'
      } : {}
      
      return (
        <>
          <td style={{...styles.rowCell, width: 'auto', minWidth: '0', textAlign: 'left', ...deEmphasizedStyle}}>{item.name}</td>
          <td style={{...styles.rowCell, width: '80px', minWidth: '80px', maxWidth: '80px', textAlign: 'center', ...deEmphasizedStyle}}>{item.tier}</td>
          <td style={{...styles.rowCell, width: '100px', minWidth: '100px', maxWidth: '100px', textAlign: 'center', ...deEmphasizedStyle}}>{item.type}</td>
          <td style={{...styles.rowCell, width: '40px', minWidth: '40px', maxWidth: '40px', textAlign: 'center', ...deEmphasizedStyle}}>{item.difficulty}</td>
          <td style={{...styles.rowCell, width: '50px', minWidth: '50px', maxWidth: '50px', textAlign: 'center', ...deEmphasizedStyle}}>
            {dynamicCost}
          </td>
        </>
      )
    } else if (type === 'environment') {
      return (
        <>
          <td style={{...styles.rowCell, width: 'auto', minWidth: '0', textAlign: 'left'}}>{item.name}</td>
          <td style={{...styles.rowCell, width: '80px', minWidth: '80px', maxWidth: '80px', textAlign: 'center'}}>{item.tier}</td>
          <td style={{...styles.rowCell, width: '100px', minWidth: '100px', maxWidth: '100px', textAlign: 'center'}}>{item.type}</td>
          <td style={{...styles.rowCell, width: '40px', minWidth: '40px', maxWidth: '40px', textAlign: 'center'}}>{item.difficulty}</td>
        </>
      )
    }
    return null
  }

  return (
    <>
      <tr 
        style={{
          ...styles.row,
          ...(isHovered ? styles.rowHover : {})
        }}
        onClick={() => onRowClick && onRowClick(item, type)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {renderContent()}
        <td style={{ 
          width: '40px', 
          minWidth: '40px', 
          maxWidth: '40px', 
          textAlign: 'center', 
          padding: '0', 
          margin: '0', 
          border: 'none', 
          verticalAlign: 'middle',
          boxSizing: 'border-box',
          overflow: 'visible',
          textOverflow: 'unset',
          whiteSpace: 'nowrap'
        }}>
          <button
            style={styles.addButton}
            onClick={(e) => {
              e.stopPropagation()
              handleAdd()
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'var(--bg-secondary)'
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'var(--purple)'
            }}
          >
            +
          </button>
        </td>
      </tr>
    </>
  )
}

// Main Browser Component
const Browser = ({ type, onAddItem, onCancel, onRowClick, encounterItems = [], pcCount = 4, playerTier = 1 }) => {
  const {
    searchTerm,
    setSearchTerm,
    sortFields,
    handleSort,
    filteredAndSortedData,
    loading,
    // Advanced filtering
    selectedTiers,
    selectedTypes,
    showTierDropdown,
    setShowTierDropdown,
    showTypeDropdown,
    setShowTypeDropdown,
    tierFilterRef,
    typeFilterRef,
    uniqueTiers,
    uniqueTypes,
    handleTierSelect,
    handleTypeSelect,
    isTierFiltered,
    isTypeFiltered,
    getDropdownStyle
  } = useBrowser(type, encounterItems, pcCount, playerTier)

  // Calculate remaining battle points budget
  const calculateRemainingBudget = () => {
    const baseBattlePoints = (3 * pcCount) + 2
    const spentBattlePoints = encounterItems.reduce((total, item) => {
      if (item.type === 'adversary') {
        const cost = BATTLE_POINT_COSTS[item.item.type] || 2
        if (item.item.type === 'Minion') {
          // Minions cost 1 BP per group equal to party size
          const groups = Math.ceil(item.quantity / pcCount)
          return total + (groups * cost)
        } else {
          return total + (item.quantity * cost)
        }
      }
      return total
    }, 0)
    
    // Calculate automatic adjustments (same logic as EncounterBuilder)
    let automaticAdjustments = 0
    
    // Check for 2 or more Solo adversaries (only count those with quantity > 0)
    const soloCount = encounterItems
      .filter(item => item.type === 'adversary' && item.item.type === 'Solo' && item.quantity > 0)
      .reduce((sum, item) => sum + item.quantity, 0)
    if (soloCount >= 2) {
      automaticAdjustments += BATTLE_POINT_ADJUSTMENTS.twoOrMoreSolos
    }
    
    // Check if no Bruisers, Hordes, Leaders, or Solos (only count those with quantity > 0)
    const hasBruisers = encounterItems.some(item => 
      item.type === 'adversary' && item.item.type === 'Bruiser' && item.quantity > 0
    )
    const hasHordes = encounterItems.some(item => 
      item.type === 'adversary' && item.item.type === 'Horde' && item.quantity > 0
    )
    const hasLeaders = encounterItems.some(item => 
      item.type === 'adversary' && item.item.type === 'Leader' && item.quantity > 0
    )
    const hasSolos = encounterItems.some(item => 
      item.type === 'adversary' && item.item.type === 'Solo' && item.quantity > 0
    )
    
    if (!hasBruisers && !hasHordes && !hasLeaders && !hasSolos) {
      automaticAdjustments += BATTLE_POINT_ADJUSTMENTS.noBruisersHordesLeadersSolos
    }
    
    // Check for lower tier adversaries (only count those with quantity > 0)
    const hasLowerTierAdversaries = encounterItems.some(item => 
      item.type === 'adversary' && item.item.tier && item.item.tier < playerTier && item.quantity > 0
    )
    if (hasLowerTierAdversaries) {
      automaticAdjustments += BATTLE_POINT_ADJUSTMENTS.lowerTierAdversary
    }
    
    const availableBattlePoints = baseBattlePoints + automaticAdjustments
    return availableBattlePoints - spentBattlePoints
  }

  const remainingBudget = calculateRemainingBudget()

  if (loading) {
    return (
      <div style={styles.browser}>
        <div style={styles.loading}>Loading...</div>
      </div>
    )
  }

  return (
    <div style={styles.browserWrapper}>
      {/* Fixed Header Row */}
      <BrowserHeader
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        type={type}
      />

      {/* Scrollable Content with Sticky Header */}
      <div className="browser-content" style={styles.browserContent}>
        <table style={styles.browserTable}>
          <thead>
            <BrowserTableHeader
              sortFields={sortFields}
              onSort={handleSort}
              type={type}
              uniqueTiers={uniqueTiers}
              uniqueTypes={uniqueTypes}
              selectedTiers={selectedTiers}
              selectedTypes={selectedTypes}
              showTierDropdown={showTierDropdown}
              setShowTierDropdown={setShowTierDropdown}
              showTypeDropdown={showTypeDropdown}
              setShowTypeDropdown={setShowTypeDropdown}
              tierFilterRef={tierFilterRef}
              typeFilterRef={typeFilterRef}
              handleTierSelect={handleTierSelect}
              handleTypeSelect={handleTypeSelect}
              isTierFiltered={isTierFiltered}
              isTypeFiltered={isTypeFiltered}
              getDropdownStyle={getDropdownStyle}
            />
          </thead>
          <tbody>
            {filteredAndSortedData.map(item => (
              <BrowserRow
                key={item.id}
                item={item}
                onAdd={onAddItem}
                type={type}
                onRowClick={onRowClick}
                encounterItems={encounterItems}
                pcCount={pcCount}
                playerTier={playerTier}
                remainingBudget={remainingBudget}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// All styles in one place - comprehensive styles from all CSS files
const styles = {
  browserWrapper: {
    display: 'flex',
    flexDirection: 'column',
    background: 'var(--bg-primary)',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border)',
    overflow: 'hidden',
    height: '100%',
    width: '100%', // Ensure wrapper uses full width
    position: 'relative' // Ensure proper positioning context
  },
  browserContent: {
    flex: 1,
    overflowY: 'auto',
    overflowX: 'visible',
    padding: 0,
    width: '100%' // Ensure content uses full width
  },
  tableHeaderContainer: {
    flexShrink: 0, // Prevent header from shrinking
    position: 'sticky',
    top: 0,
    zIndex: 15,
    backgroundColor: 'var(--bg-secondary)'
  },
  browserTable: {
    width: '100%',
    minWidth: '100%', // Ensure it uses full width
    borderCollapse: 'collapse',
    tableLayout: 'fixed', // Fixed layout for precise control
    background: 'var(--bg-primary)',
    margin: 0
  },
  browserHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px',
    borderBottom: '1px solid var(--border)',
    backgroundColor: 'var(--gray-900)',
    flexShrink: 0, // Prevent header from shrinking
    position: 'sticky',
    top: 0,
    zIndex: 20
  },
  browserTitle: {
    margin: 0,
    color: 'var(--text-primary)',
    fontSize: '18px',
    fontWeight: '600'
  },
  closeButton: {
    background: 'none',
    border: 'none',
    color: 'var(--text-primary)',
    fontSize: '24px',
    cursor: 'pointer',
    padding: '4px 8px',
    borderRadius: '4px',
    transition: 'background-color 0.2s'
  },
  searchInput: {
    flex: 1,
    padding: '8px 12px',
    border: '1px solid var(--border)',
    borderRadius: '4px',
    backgroundColor: 'var(--bg-primary)',
    color: 'var(--text-primary)',
    fontSize: '14px',
    marginRight: '12px',
    transition: 'all 0.2s ease'
  },
  searchInputFocus: {
    outline: 'none',
    borderColor: 'var(--purple)',
    boxShadow: '0 0 0 3px rgba(139, 92, 246, 0.1)'
  },
  tableHeader: {
    background: 'var(--gray-900)',
    borderBottom: '1px solid var(--border)',
    boxShadow: '0 1px 0 var(--border)',
    position: 'sticky',
    top: '0',
    zIndex: 10
  },
  tableHeaderCell: {
    backgroundColor: 'var(--gray-900)',
    fontWeight: '700',
    borderBottom: '1px solid var(--border)',
    cursor: 'pointer',
    userSelect: 'none',
    minWidth: '100px',
    whiteSpace: 'nowrap',
    padding: '4px 4px', // Reduced padding to match archived version
    color: 'var(--text-primary)',
    textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
    boxShadow: '0 1px 0 var(--border)',
    transition: 'background-color 0.2s',
    position: 'sticky',
    top: '0',
    zIndex: 10
  },
  tableHeaderCellHover: {
    backgroundColor: 'var(--bg-hover)'
  },
  sortIndicator: {
    fontSize: '12px',
    color: 'var(--text-secondary)'
  },
  tableBody: {
    flex: 1,
    overflowY: 'auto',
    padding: '8px',
    backgroundColor: 'var(--bg-primary)'
  },
  row: {
    height: '35px',
    borderBottom: '1px solid var(--border)',
    transition: 'background-color 0.2s ease',
    cursor: 'pointer',
    backgroundColor: 'var(--gray-900)'
  },
  rowHover: {
    backgroundColor: 'var(--bg-secondary)'
  },
  expandedRow: {
    backgroundColor: 'var(--bg-secondary)'
  },
  rowCell: {
    padding: '4px 4px', // Reduced padding to match archived version
    verticalAlign: 'middle',
    color: 'var(--text-primary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    borderBottom: '1px solid var(--border)'
  },
  rowCellName: {
    fontWeight: '500',
    minWidth: '150px'
  },
  rowCellCenter: {
    textAlign: 'center',
    justifyContent: 'center',
    minWidth: '80px'
  },
  rowActions: {
    width: '80px',
    textAlign: 'center',
    padding: '4px 8px',
    borderBottom: '1px solid var(--border)'
  },
  addButton: {
    width: '2rem', // Increased from 1.5rem to 2rem (32px) for better tap target
    height: '2rem', // Increased from 1.5rem to 2rem (32px) for better tap target
    border: '1px solid var(--purple)',
    borderRadius: 'var(--radius-sm)',
    background: 'var(--purple)',
    color: 'white',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px', // Increased from 14px to 16px
    fontWeight: '500'
  },
  expandedContent: {
    padding: '0',
    backgroundColor: 'var(--bg-secondary)',
    borderBottom: '1px solid var(--border)'
  },
  // Column-specific widths (matching archived version)
  columnName: {
    width: 'auto', // Name column gets remaining space
    minWidth: '0',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    paddingLeft: '8px', // Increased left padding for name column
    textAlign: 'left'
  },
  columnTier: {
    width: '80px', // Tier column - increased width to accommodate filter button
    textAlign: 'center',
    overflow: 'visible', // Don't hide text
    textOverflow: 'unset' // No ellipsis for text
  },
  columnType: {
    width: '100px', // Type column - fit "Type" header
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    textAlign: 'center' // Center the type content
  },
  columnDifficulty: {
    width: '40px', // Diff column - minimal width for "Diff" header
    textAlign: 'center',
    overflow: 'visible', // Don't hide text
    textOverflow: 'unset' // No ellipsis for text
  },
  columnAction: {
    width: '32px', // Add button column - increased to accommodate 32px button
    minWidth: '24px',
    maxWidth: '24px',
    textAlign: 'center',
    padding: '0', // Remove cell padding
    margin: '0', // Remove cell margins
    border: 'none', // Remove cell borders
    verticalAlign: 'middle',
    color: 'var(--text-primary)',
    whiteSpace: 'nowrap',
    overflow: 'visible',
    textOverflow: 'unset'
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '200px',
    color: 'var(--text-primary)',
    fontSize: '16px'
  },
  // Mobile responsive styles
  mobileBrowser: {
    width: '95vw',
    height: '90vh',
    maxWidth: 'none'
  },
  mobileSearchInput: {
    fontSize: '16px' // Prevent zoom on iOS
  },
  // Filter dropdown styles
  headerWithFilter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
    position: 'relative'
  },
  headerFilterIcon: {
    background: 'none',
    border: 'none',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    padding: '2px 4px',
    borderRadius: 'var(--radius-sm)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
    position: 'relative'
  },
  headerFilterIconActive: {
    color: 'var(--purple)'
  },
  filterIcon: {
    fontSize: '12px'
  },
  filterActiveDot: {
    position: 'absolute',
    left: '50%',
    top: '2px',
    transform: 'translateX(-50%)',
    width: '4px',
    height: '4px',
    borderRadius: '50%',
    background: 'var(--purple)',
    pointerEvents: 'none'
  },
  filterDropdown: {
    position: 'absolute',
    top: '100%',
    left: '0',
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
    zIndex: 99999,
    marginTop: '4px',
    overflow: 'hidden',
    width: 'max-content',
    minWidth: '120px',
    maxWidth: '200px'
  },
  filterOption: {
    padding: '8px 12px',
    cursor: 'pointer',
    color: 'var(--text-primary)',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    transition: 'background-color 0.2s ease',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  filterOptionSelected: {
    backgroundColor: 'var(--bg-hover)'
  },
  checkIcon: {
    width: '16px',
    height: '16px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--text-secondary)',
    fontSize: '12px'
  },
  filterLabel: {
    flex: 1
  }
}

export default Browser