import React, { useState, useMemo, useEffect, useRef } from 'react'
import usePersistentState from '../hooks/usePersistentState'
import Button from './Buttons'
import Cards from './Cards'
import { Swords, TreePine, Plus, Star, Skull, Filter, Square, CheckSquare } from 'lucide-react'
// Dynamically import JSON data to keep initial bundle smaller
let adversariesData = { adversaries: [] }
let environmentsData = { environments: [] }
try {
  adversariesData = await import(/* @vite-ignore */ '../data/adversaries.json')
} catch (e) {
  console.warn('Failed to load adversaries.json dynamically:', e)
}
try {
  environmentsData = await import(/* @vite-ignore */ '../data/environments.json')
} catch (e) {
  console.warn('Failed to load environments.json dynamically:', e)
}

const Browser = ({ 
  type, // 'adversary' or 'environment'
  onAddItem, 
  onCancel, 
  onCreateCustom
}) => {
  console.log('Browser component rendered with props:', { type, onAddItem, onCancel, onCreateCustom })
  console.log('Browser component is being used, not List component')
  
  const [searchTerm, setSearchTerm] = usePersistentState(`browser-search-${type}`, '')
  // Load selected filter arrays from localStorage per type
  const getInitialSelectedFilters = () => {
    const saved = localStorage.getItem(`browser-filters-${type}`)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        return {
          tiers: Array.isArray(parsed.tiers) ? parsed.tiers : [],
          types: Array.isArray(parsed.types) ? parsed.types : []
        }
      } catch (e) {
        console.warn('Failed to parse saved selected filters:', e)
      }
    }
    return { tiers: [], types: [] }
  }
  
  // Multi-select filter states
  const [selectedTiers, setSelectedTiers] = usePersistentState(`browser-filters-tiers-${type}`, getInitialSelectedFilters().tiers)
  const [selectedTypes, setSelectedTypes] = usePersistentState(`browser-filters-types-${type}`, getInitialSelectedFilters().types)
  // Load initial sort state synchronously to prevent jitter
  const getInitialSortState = () => {
    const savedSort = localStorage.getItem(`browser-sort-${type}`)
    if (savedSort) {
      try {
        return JSON.parse(savedSort)
      } catch (e) {
        console.warn('Failed to parse saved sort state:', e)
      }
    }
    // Default sort: tier, type, difficulty
    return [
      { field: 'tier', direction: 'asc' },
      { field: 'displayType', direction: 'asc' },
      { field: 'displayDifficulty', direction: 'asc' }
    ]
  }

  const [sortFields, setSortFields] = usePersistentState(`browser-sort-${type}`, getInitialSortState())
  const [showTierDropdown, setShowTierDropdown] = useState(false)
  const [showTypeDropdown, setShowTypeDropdown] = useState(false)
  
  // Refs for filter buttons
  const tierFilterRef = useRef(null)
  const typeFilterRef = useRef(null)
  
  // Load expanded card state from localStorage
  const getInitialExpandedCard = () => {
    const savedExpanded = localStorage.getItem(`browser-expanded-${type}`)
    if (savedExpanded) {
      try {
        const parsed = JSON.parse(savedExpanded)
        // Find the card in current data
        const currentData = type === 'adversary' ? adversariesData.adversaries : environmentsData.environments
        return currentData.find(item => item.id === parsed.id) || null
      } catch (e) {
        console.warn('Failed to parse saved expanded card state:', e)
      }
    }
    return null
  }
  
  // Track which card is expanded
  const [expandedCard, setExpandedCard] = useState(getInitialExpandedCard)
  
  // Mobile detection
  const [isMobile, setIsMobile] = useState(false)
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 800)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])
  
  // Track the current type to detect changes
  const currentTypeRef = useRef(type)
  
  // Handle type changes without useEffect to prevent jitter
  if (currentTypeRef.current !== type) {
    currentTypeRef.current = type
    
    const savedSort = localStorage.getItem(`browser-sort-${type}`)
    if (savedSort) {
      try {
        const parsed = JSON.parse(savedSort)
        setSortFields(parsed)
      } catch (e) {
        console.warn('Failed to parse saved sort state:', e)
        // Reset to default if parsing fails
        setSortFields([
          { field: 'tier', direction: 'asc' },
          { field: 'displayType', direction: 'asc' },
          { field: 'displayDifficulty', direction: 'asc' }
        ])
      }
    } else {
      // No saved state, use default
      setSortFields([
        { field: 'tier', direction: 'asc' },
        { field: 'displayType', direction: 'asc' },
        { field: 'displayDifficulty', direction: 'asc' }
      ])
    }
  }

  // (persisted via usePersistentState)
  
  // Save expanded card state to localStorage whenever it changes
  useEffect(() => {
    if (expandedCard) {
      localStorage.setItem(`browser-expanded-${type}`, JSON.stringify({ id: expandedCard.id }))
    } else {
      localStorage.removeItem(`browser-expanded-${type}`)
    }
  }, [expandedCard, type])
  
  // (persisted via usePersistentState)

  // When switching data type, load its saved filters
  useEffect(() => {
    const saved = localStorage.getItem(`browser-filters-${type}`)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setSelectedTiers(Array.isArray(parsed.tiers) ? parsed.tiers : [])
        setSelectedTypes(Array.isArray(parsed.types) ? parsed.types : [])
      } catch (e) {
        setSelectedTiers([])
        setSelectedTypes([])
      }
    } else {
      setSelectedTiers([])
      setSelectedTypes([])
    }
  }, [type])

  // (moved below itemTypes/itemTiers)

  // Use imported data directly - only the relevant type
  const adversaryData = adversariesData.adversaries || []
  const environmentData = environmentsData.environments || []
  
  // Select data based on type
  const currentData = type === 'adversary' ? adversaryData : environmentData
  const dataType = type === 'adversary' ? 'adversary' : 'environment'

  // Close dropdowns when clicking anywhere outside the dropdown or filter buttons
  useEffect(() => {
    const handleClickOutside = (event) => {
      const clickedInsideDropdown = event.target.closest('.filter-dropdown')
      const clickedFilterButton = event.target.closest('.header-filter-icon')
      if (!clickedInsideDropdown && !clickedFilterButton) {
        setShowTierDropdown(false)
        setShowTypeDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Combine and prepare data for unified view
  const unifiedData = useMemo(() => {
    const items = currentData.map(item => ({
      ...item,
      category: dataType === 'adversary' ? 'Adversary' : 'Environment',
      displayType: item.type,
      displayDifficulty: item.difficulty === 'Special (see Relative Strength)' ? 'Relative' : item.difficulty
    }))
    
    return items
  }, [currentData, dataType])

  // Get unique types for filter
  const itemTypes = useMemo(() => {
    const types = [...new Set(unifiedData.map(item => item.displayType).filter(Boolean))]
    return types.sort()
  }, [unifiedData])

  // Get unique tiers for filter
  const itemTiers = useMemo(() => {
    const tiers = [...new Set(unifiedData.map(item => item.tier).filter(Boolean))]
    return tiers.sort((a, b) => a - b)
  }, [unifiedData])

  // Reconcile saved filters with available data to avoid empty results
  useEffect(() => {
    // Types
    if (selectedTypes.length > 0) {
      const validTypes = new Set(itemTypes)
      const nextTypes = selectedTypes.filter(t => validTypes.has(t))
      if (nextTypes.length !== selectedTypes.length) {
        setSelectedTypes(nextTypes.length > 0 ? nextTypes : [])
      }
    }
    // Tiers (compare as strings)
    if (selectedTiers.length > 0) {
      const validTiers = new Set(itemTiers.map(t => String(t)))
      const nextTiers = selectedTiers.filter(t => validTiers.has(String(t)))
      if (nextTiers.length !== selectedTiers.length) {
        setSelectedTiers(nextTiers.length > 0 ? nextTiers : [])
      }
    }
  }, [itemTypes, itemTiers])

  // Sort and filter items
  const filteredAndSortedItems = useMemo(() => {
    let filtered = unifiedData.filter(item => {
      const matchesSearch = searchTerm === '' || 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
      
      const matchesTier = selectedTiers.length === 0 || selectedTiers.includes(item.tier.toString())
      const matchesType = selectedTypes.length === 0 || selectedTypes.includes(item.displayType)
      
      return matchesSearch && matchesTier && matchesType
    })

    // Apply multi-level sorting
    filtered.sort((a, b) => {
      for (const sort of sortFields) {
        const { field, direction } = sort
        let aValue = a[field]
        let bValue = b[field]
        
        if (field === 'tier') {
          aValue = parseInt(aValue) || 0
          bValue = parseInt(bValue) || 0
        } else if (field === 'displayDifficulty') {
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
  }, [unifiedData, searchTerm, selectedTiers, selectedTypes, sortFields])

  const handleSort = (field) => {
    setSortFields(prevSortFields => {
      // Check if this field is already the primary sort
      if (prevSortFields[0]?.field === field) {
        // Toggle direction of primary sort
        return [{ field, direction: prevSortFields[0].direction === 'asc' ? 'desc' : 'asc' }, ...prevSortFields.slice(1)]
      } else {
        // Remove this field from existing sorts and add as new primary
        const filteredSorts = prevSortFields.filter(sort => sort.field !== field)
        return [{ field, direction: 'asc' }, ...filteredSorts]
      }
    })
  }

  const handleFilter = (filterType) => {
    if (filterType === 'tier') {
      setShowTierDropdown(!showTierDropdown)
      setShowTypeDropdown(false)
    } else if (filterType === 'type') {
      setShowTypeDropdown(!showTypeDropdown)
      setShowTierDropdown(false)
    }
  }

  // Tooltip helpers for filter buttons
  const tierTooltip = selectedTiers.length === 0 ? 'All' : `${selectedTiers.length} selected`
  const typeTooltip = selectedTypes.length === 0 ? 'All' : `${selectedTypes.length} selected`
  const isTierFiltered = selectedTiers.length > 0
  const isTypeFiltered = selectedTypes.length > 0

  // Multi-select handlers
  const handleTierSelect = (tier) => {
    setSelectedTiers(prev => {
      if (prev.includes(tier)) {
        return prev.filter(t => t !== tier)
      } else {
        return [...prev, tier]
      }
    })
  }

  const handleTypeSelect = (type) => {
    setSelectedTypes(prev => {
      if (prev.includes(type)) {
        return prev.filter(t => t !== type)
      } else {
        return [...prev, type]
      }
    })
  }

  // Calculate dropdown position based on the header cell (th); let CSS size it to content
  const getDropdownStyle = (buttonRef) => {
    if (!buttonRef?.current) return {}
    const thEl = buttonRef.current.closest('th')
    if (!thEl) return {}
    const thRect = thEl.getBoundingClientRect()
    const gutter = 8
    const left = Math.max(gutter, thRect.left)
    return {
      position: 'fixed',
      top: thRect.bottom + 4,
      left,
      zIndex: 99999
    }
  }

  const handleAddFromDatabase = (itemData) => {
    console.log('Browser handleAddFromDatabase called with:', itemData)
    
    // Add the item to the game state
    if (onAddItem) {
      onAddItem(itemData, type)
    }
  }

  const handleCardClick = (item) => {
    console.log('Browser handleCardClick called:', item.name)
    if (expandedCard?.id === item.id) {
      setExpandedCard(null)
      console.log('Collapsing card')
    } else {
      setExpandedCard(item)
      console.log('Expanding card:', item.name, 'expandedCard state:', expandedCard)
    }
  }

  return (
    <div 
      className="browser-wrapper"
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      onMouseUp={(e) => e.stopPropagation()}
    >
      {/* Fixed Header Row */}
      <div className="browser-header">
        <input
          type="text"
          placeholder="Search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="browser-search-input"
        />
        
        <Button
          action="add"
          onClick={() => onCreateCustom && onCreateCustom(type)}
          size="sm"
          className="browser-create-btn"
        >
          Create
        </Button>
      </div>

      {/* Scrollable Content */}
      <div className="browser-content">

        <table className="browser-table">
          <thead>
            <tr>
              <th 
                onClick={() => handleSort('name')} 
                className={`sortable ${sortFields[0]?.field === 'name' ? 'active' : ''} ${sortFields[0]?.field === 'name' ? sortFields[0].direction : ''}`}
              >
                Name
              </th>
              <th 
                onClick={() => handleSort('tier')} 
                className={`sortable ${sortFields[0]?.field === 'tier' ? 'active' : ''} ${sortFields[0]?.field === 'tier' ? sortFields[0].direction : ''}`}
              >
                <div className="header-with-filter">
                  Tier
                  <button
                    ref={tierFilterRef}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleFilter('tier')
                    }}
                    className={`header-filter-icon ${isTierFiltered ? 'active' : ''}`}
                    title={`Filter by Tier: ${tierTooltip}`}
                  >
                    <Filter size={14} />
                    <span className="filter-active-dot" aria-hidden="true" />
                  </button>
                  {showTierDropdown && (
                    <div 
                      className="filter-dropdown" 
                      style={getDropdownStyle(tierFilterRef)}
                      onMouseDown={(e) => e.stopPropagation()}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div 
                        className={`filter-option ${selectedTiers.length === 0 ? 'selected' : ''}`} 
                        onClick={() => setSelectedTiers([])}
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
                            onClick={() => handleTierSelect(tier.toString())}
                          >
                            <span className="check-icon">{isSelected ? <CheckSquare size={16}/> : <Square size={16}/>}</span>
                            <span className="filter-label">{tier}</span>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </th>
              <th 
                onClick={() => handleSort('displayType')} 
                className={`sortable ${sortFields[0]?.field === 'displayType' ? 'active' : ''} ${sortFields[0]?.field === 'displayType' ? sortFields[0].direction : ''}`}
              >
                <div className="header-with-filter">
                  Type
                  <button
                    ref={typeFilterRef}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleFilter('type')
                    }}
                    className={`header-filter-icon ${isTypeFiltered ? 'active' : ''}`}
                    title={`Filter by Type: ${typeTooltip}`}
                  >
                    <Filter size={14} />
                    <span className="filter-active-dot" aria-hidden="true" />
                  </button>
                  {showTypeDropdown && (
                    <div 
                      className="filter-dropdown" 
                      style={getDropdownStyle(typeFilterRef)}
                      onMouseDown={(e) => e.stopPropagation()}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div 
                        className={`filter-option ${selectedTypes.length === 0 ? 'selected' : ''}`} 
                        onClick={() => setSelectedTypes([])}
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
                            onClick={() => handleTypeSelect(type)}
                          >
                            <span className="check-icon">{isSelected ? <CheckSquare size={16}/> : <Square size={16}/>}</span>
                            <span className="filter-label">{type}</span>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </th>
              <th 
                onClick={() => handleSort('displayDifficulty')} 
                className={`sortable ${sortFields[0]?.field === 'displayDifficulty' ? 'active' : ''} ${sortFields[0]?.field === 'displayDifficulty' ? sortFields[0].direction : ''}`}
              >
                <div className="header-with-filter">
                  Diff
                </div>
              </th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedItems.map((item) => (
              <React.Fragment key={item.id}>
                <tr 
                  className="browser-row"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    handleCardClick(item)
                  }}
                >
                  <td className="column-name" data-label="Name">{item.name}</td>
                  <td className="column-tier" data-label="Tier">{item.tier}</td>
                  <td className="column-type" data-label="Type">{item.displayType}</td>
                  <td className="column-description" data-label="Difficulty">{item.displayDifficulty}</td>
                  <td className="column-action" data-label="Add">
                    <Button
                      action="add"
                      size="sm"
                      className="table-add-btn"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleAddFromDatabase(item)
                      }}
                    >
                      <Plus size={14} />
                    </Button>
                  </td>
                </tr>
                
                {/* Condensed Card View - Both Desktop and Mobile */}
                {expandedCard?.id === item.id && (
                  <tr className="condensed-card-row">
                    <td colSpan={5} className="condensed-card-cell">
                      <div className="condensed-card-container">
                        <Cards
                          item={{
                            ...expandedCard,
                            hp: 0, // Show as healthy (0 HP) in browser preview
                            stress: 0 // Show as no stress in browser preview
                          }}
                          type={expandedCard.category?.toLowerCase() || (type === 'adversary' ? 'adversary' : 'environment')}
                          mode="compact"
                        />
                      </div>
                    </td>
                  </tr>
                )}
                
                {/* Inline Expanded Card View - Both Desktop and Mobile */}
                {expandedCard?.id === item.id && (
                  <tr className="expanded-card-row">
                    <td colSpan={5} className="expanded-card-cell">
                      <div className="expanded-card-container">
                        <Cards
                          item={{
                            ...expandedCard,
                            hp: 0, // Show as healthy (0 HP) in browser preview
                            stress: 0 // Show as no stress in browser preview
                          }}
                          type={expandedCard.category?.toLowerCase() || (type === 'adversary' ? 'adversary' : 'environment')}
                          mode="expanded"
                        />
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  )
}

export default Browser