import React, { useState, useMemo, useEffect } from 'react'
import Button from './Buttons'
import Cards from './Cards'
import { Swords, TreePine, ArrowLeft, Plus } from 'lucide-react'
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
  const [filterCategory, setFilterCategory] = useState('')
  const [filterTier, setFilterTier] = useState('')
  const [filterType, setFilterType] = useState('')
  const [sortField, setSortField] = useState('tier')
  const [sortDirection, setSortDirection] = useState('asc')
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)
  const [showTierDropdown, setShowTierDropdown] = useState(false)
  const [showTypeDropdown, setShowTypeDropdown] = useState(false)
  
  // Track which card is expanded
  const [expandedCard, setExpandedCard] = useState(null)

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

  // Get unique categories for filter
  const categories = useMemo(() => {
    return [dataType === 'adversary' ? 'Adversary' : 'Environment']
  }, [dataType])

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
      
      const matchesCategory = filterCategory === '' || item.category === filterCategory
      const matchesTier = filterTier === '' || item.tier.toString() === filterTier
      const matchesType = filterType === '' || item.displayType === filterType
      
      return matchesSearch && matchesCategory && matchesTier && matchesType
    })

    // Sort items
    filtered.sort((a, b) => {
      let aValue = a[sortField]
      let bValue = b[sortField]
      
      if (sortField === 'tier') {
        aValue = parseInt(aValue) || 0
        bValue = parseInt(bValue) || 0
      } else if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      } else {
        // Handle non-string values by converting to strings
        aValue = String(aValue || '').toLowerCase()
        bValue = String(bValue || '').toLowerCase()
      }
      
      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    return filtered
  }, [unifiedData, searchTerm, filterCategory, filterTier, filterType, sortField, sortDirection])

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const handleFilter = (filterType) => {
    if (filterType === 'category') {
      setShowCategoryDropdown(!showCategoryDropdown)
      setShowTierDropdown(false)
      setShowTypeDropdown(false)
    } else if (filterType === 'tier') {
      setShowTierDropdown(!showTierDropdown)
      setShowCategoryDropdown(false)
      setShowTypeDropdown(false)
    } else if (filterType === 'type') {
      setShowTypeDropdown(!showTypeDropdown)
      setShowCategoryDropdown(false)
      setShowTierDropdown(false)
    }
  }

  const handleAddFromDatabase = (itemData) => {
    console.log('Browser handleAddFromDatabase called with:', itemData)
    
    // Add the item to the game state
    if (onAddItem) {
      onAddItem(itemData)
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
          onClick={() => handleFilter('category')}
          size="sm"
          title={`Filter by Category: ${filterCategory || 'All'}`}
        >
          Category {filterCategory || 'All'}
        </Button>
        
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
      </div>

      {/* Filter Dropdowns */}
      {showCategoryDropdown && (
        <div className="filter-dropdown">
          <div className="filter-option" onClick={() => { setFilterCategory(''); setShowCategoryDropdown(false) }}>
            All Categories
          </div>
          {categories.map(category => (
            <div 
              key={category} 
              className="filter-option" 
              onClick={() => { setFilterCategory(category); setShowCategoryDropdown(false) }}
            >
              {category}
            </div>
          ))}
        </div>
      )}

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

      {/* Items Table */}
      <div className="browser-table-container">
        <table className="browser-table">
          <thead>
            <tr>
              <th 
                onClick={() => handleSort('name')} 
                className={`sortable ${sortField === 'name' ? 'active' : ''} ${sortField === 'name' ? sortDirection : ''}`}
              >
                Name
              </th>
              <th 
                onClick={() => handleSort('tier')} 
                className={`sortable ${sortField === 'tier' ? 'active' : ''} ${sortField === 'tier' ? sortDirection : ''}`}
              >
                #
              </th>
              <th 
                onClick={() => handleSort('displayType')} 
                className={`sortable ${sortField === 'displayType' ? 'active' : ''} ${sortField === 'displayType' ? sortDirection : ''}`}
              >
                Type
              </th>
              <th 
                onClick={() => handleSort('displayDifficulty')} 
                className={`sortable ${sortField === 'displayDifficulty' ? 'active' : ''} ${sortField === 'displayDifficulty' ? sortDirection : ''}`}
              >
                ⚔
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
                
                {/* Inline Expanded Card View - Both Desktop and Mobile */}
                {expandedCard?.id === item.id && (
                  <tr className="expanded-card-row">
                    <td colSpan={5} className="expanded-card-cell">
                      <div className="expanded-card-container">
                        <Cards
                          item={expandedCard}
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