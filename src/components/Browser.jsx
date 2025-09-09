import React, { useState, useMemo, useEffect, useRef } from 'react'
import Button from './Buttons'
import Cards from './Cards'
import { Swords, TreePine, ArrowLeft, Plus, Star, Skull } from 'lucide-react'
import adversariesData from '../data/adversaries.json'
import environmentsData from '../data/environments.json'

const Browser = ({ 
  type, // 'adversary' or 'environment'
  onAddItem, 
  onCancel, 
  onCreateCustom
}) => {
  console.log('Browser component rendered with props:', { type, onAddItem, onCancel, onCreateCustom })
  console.log('Browser component is being used, not List component')
  
  const [searchTerm, setSearchTerm] = useState('')
  // Load filter state from localStorage
  const getInitialFilterState = () => {
    const savedFilters = localStorage.getItem(`browser-filters-${type}`)
    if (savedFilters) {
      try {
        return JSON.parse(savedFilters)
      } catch (e) {
        console.warn('Failed to parse saved filter state:', e)
      }
    }
    return { tier: '', type: '' }
  }
  
  const [filterTier, setFilterTier] = useState(getInitialFilterState().tier)
  const [filterType, setFilterType] = useState(getInitialFilterState().type)
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

  const [sortFields, setSortFields] = useState(getInitialSortState)
  const [showTierDropdown, setShowTierDropdown] = useState(false)
  const [showTypeDropdown, setShowTypeDropdown] = useState(false)
  
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

  // Save sort state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(`browser-sort-${type}`, JSON.stringify(sortFields))
  }, [sortFields, type])
  
  // Save expanded card state to localStorage whenever it changes
  useEffect(() => {
    if (expandedCard) {
      localStorage.setItem(`browser-expanded-${type}`, JSON.stringify({ id: expandedCard.id }))
    } else {
      localStorage.removeItem(`browser-expanded-${type}`)
    }
  }, [expandedCard, type])
  
  // Save filter state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(`browser-filters-${type}`, JSON.stringify({ 
      tier: filterTier, 
      type: filterType 
    }))
  }, [filterTier, filterType, type])

  // Use imported data directly - only the relevant type
  const adversaryData = adversariesData.adversaries || []
  const environmentData = environmentsData.environments || []
  
  // Select data based on type
  const currentData = type === 'adversary' ? adversaryData : environmentData
  const dataType = type === 'adversary' ? 'adversary' : 'environment'

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('th')) {
        setShowCategoryDropdown(false)
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

  // Sort and filter items
  const filteredAndSortedItems = useMemo(() => {
    let filtered = unifiedData.filter(item => {
      const matchesSearch = searchTerm === '' || 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
      
      const matchesTier = filterTier === '' || item.tier.toString() === filterTier
      const matchesType = filterType === '' || item.displayType === filterType
      
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
  }, [unifiedData, searchTerm, filterTier, filterType, sortFields])

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
      {/* Back Arrow, Search, and Custom Button Row */}
      <div className="browser-top-row">
        <Button
          action="secondary"
          onClick={onCancel}
          size="sm"
          className="browser-back-btn"
        >
          <ArrowLeft size={16} />
        </Button>
        
        <input
          type="text"
          placeholder={`Search ${type === 'adversary' ? 'adversaries' : 'environments'}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="browser-search-input"
        />
        
        <Button
          action="add"
          onClick={() => onCreateCustom && onCreateCustom(type)}
          size="sm"
          className="browser-add-btn"
        >
          <Plus size={16} />
        </Button>
      </div>

      {/* Filter Controls */}
      <div className="browser-filters">
        <Button
          action="filter"
          onClick={() => handleFilter('tier')}
          size="sm"
          title={`Filter by Tier: ${filterTier || 'All'}`}
        >
          Tier {filterTier || 'All'}
        </Button>
        
        <Button
          action="filter"
          onClick={() => handleFilter('type')}
          size="sm"
          title={`Filter by Type: ${filterType || 'All'}`}
        >
          Type {filterType || 'All'}
        </Button>

        {/* Filter Dropdowns */}
        {showTierDropdown && (
          <div className="filter-dropdown">
            <div className="filter-option" onClick={() => { setFilterTier(''); setShowTierDropdown(false) }}>
              All Tiers
            </div>
            {itemTiers.map(tier => (
              <div 
                key={tier} 
                className="filter-option" 
                onClick={() => { setFilterTier(tier.toString()); setShowTierDropdown(false) }}
              >
                Tier {tier}
              </div>
            ))}
          </div>
        )}

        {showTypeDropdown && (
          <div className="filter-dropdown">
            <div className="filter-option" onClick={() => { setFilterType(''); setShowTypeDropdown(false) }}>
              All Types
            </div>
            {itemTypes.map(type => (
              <div 
                key={type} 
                className="filter-option" 
                onClick={() => { setFilterType(type); setShowTypeDropdown(false) }}
              >
                {type}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Items Table */}
      <div className="browser-table-container">
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
                <Star size={16} />
              </th>
              <th 
                onClick={() => handleSort('displayType')} 
                className={`sortable ${sortFields[0]?.field === 'displayType' ? 'active' : ''} ${sortFields[0]?.field === 'displayType' ? sortFields[0].direction : ''}`}
              >
                Type
              </th>
              <th 
                onClick={() => handleSort('displayDifficulty')} 
                className={`sortable ${sortFields[0]?.field === 'displayDifficulty' ? 'active' : ''} ${sortFields[0]?.field === 'displayDifficulty' ? sortFields[0].direction : ''}`}
              >
                <Skull size={16} />
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
                          type={expandedCard.category.toLowerCase()}
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
                          type={expandedCard.category.toLowerCase()}
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