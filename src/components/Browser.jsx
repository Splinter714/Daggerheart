import React, { useState, useMemo, useEffect, useRef } from 'react'
import Button from './Buttons'
import Cards from './Cards'
import { Swords, TreePine } from 'lucide-react'
import adversariesData from '../data/adversaries.json'
import environmentsData from '../data/environments.json'

const Browser = ({ 
  onAddItem, 
  onCancel, 
  onCreateCustom,
  onCreateCountdown
}) => {
  console.log('Browser component received props:', { onAddItem, onCancel, onCreateCustom, onCreateCountdown })
  
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterTier, setFilterTier] = useState('')
  const [filterType, setFilterType] = useState('')
  const [sortField, setSortField] = useState('tier')
  const [sortDirection, setSortDirection] = useState('asc')
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)
  const [showTierDropdown, setShowTierDropdown] = useState(false)
  const [showTypeDropdown, setShowTypeDropdown] = useState(false)
  
  // Countdown creator state
  const [showCountdownCreator, setShowCountdownCreator] = useState(false)
  const [newCountdown, setNewCountdown] = useState({
    name: '',
    value: '',
    description: '',
    type: 'standard',
    loop: 'none'
  })
  const [countdownError, setCountdownError] = useState('')
  
  // Track which card is expanded
  const [expandedCard, setExpandedCard] = useState(null)
  
  // Ref for the countdown name input to focus after creation
  const countdownNameInputRef = useRef(null)

  // Use imported data directly
  const adversaryData = adversariesData.adversaries || []
  const environmentData = environmentsData.environments || []

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
    const adversaries = adversaryData.map(item => ({
      ...item,
      category: 'Adversary',
      displayType: item.type,
      displayDifficulty: item.difficulty === 'Special (see Relative Strength)' ? 'Relative' : item.difficulty
    }))
    
    const environments = environmentData.map(item => ({
      ...item,
      category: 'Environment',
      displayType: item.type,
      displayDifficulty: item.difficulty === 'Special (see Relative Strength)' ? 'Relative' : item.difficulty
    }))
    
    return [...adversaries, ...environments]
  }, [adversaryData, environmentData])

  // Get unique categories for filter
  const categories = useMemo(() => {
    return ['Adversary', 'Environment']
  }, [])

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

    // Sort: First by tier, then type, then name
    filtered.sort((a, b) => {
      // Primary sort: Tier (numeric)
      const aTier = Number(a.tier) || 0
      const bTier = Number(b.tier) || 0
      if (aTier !== bTier) {
        return aTier - bTier
      }
      
      // Secondary sort: Type (string)
      const aType = (a.displayType || '').toLowerCase()
      const bType = (b.displayType || '').toLowerCase()
      if (aType !== bType) {
        return aType.localeCompare(bType)
      }
      
      // Tertiary sort: Name (string)
      const aName = (a.name || '').toLowerCase()
      const bName = (b.name || '').toLowerCase()
      return aName.localeCompare(bName)
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

  const handleFilter = (field) => {
    // Quick filter: cycle through common values for that field
    if (field === 'category') {
      const currentIndex = categories.indexOf(filterCategory)
      const nextIndex = (currentIndex + 1) % (categories.length + 1)
      setFilterCategory(nextIndex === 0 ? '' : categories[nextIndex - 1])
    } else if (field === 'tier') {
      const currentIndex = itemTiers.indexOf(filterTier)
      const nextIndex = (currentIndex + 1) % (itemTiers.length + 1)
      setFilterTier(nextIndex === 0 ? '' : itemTiers[nextIndex - 1])
    } else if (field === 'type') {
      const currentIndex = itemTypes.indexOf(filterType)
      const nextIndex = (currentIndex + 1) % (itemTypes.length + 1)
      setFilterType(nextIndex === 0 ? '' : itemTypes[nextIndex - 1])
    }
  }

  const handleCardClick = (item) => {
    if (expandedCard?.id === item.id) {
      setExpandedCard(null)
    } else {
      setExpandedCard(item)
    }
  }

  const handleAddFromDatabase = (itemData) => {
    console.log('handleAddFromDatabase called with:', itemData)
    
    // Convert the database item format to our game format
    const newItem = {
      id: Date.now().toString(), // Generate new ID for the game instance
      name: itemData.name,
      tier: itemData.tier,
      type: itemData.displayType,
      difficulty: itemData.displayDifficulty,
      description: itemData.description,
      visible: true,
      category: itemData.category, // Include the category for routing
      // Add game-specific properties
      ...(itemData.category === 'Adversary' && {
        hp: 0, // Start with 0 HP (undamaged)
        hpMax: itemData.hpMax,
        stress: 0,
        stressMax: itemData.stressMax || 0,
        abilities: itemData.abilities || [],
        traits: itemData.traits || []
      }),
      ...(itemData.category === 'Environment' && {
        effects: itemData.effects || [],
        hazards: itemData.hazards || []
      })
    }
    
    console.log('Converted newItem:', newItem)
    console.log('Calling onAddItem with:', newItem)
    
    onAddItem(newItem)
    setExpandedCard(null)
  }

  // Determine if we're showing filtered results
  const hasCategoryFilter = filterCategory !== ''
  const hasTierFilter = filterTier !== ''
  const hasTypeFilter = filterType !== ''

  return (
    <div className="browser-container">
      {/* Header */}
      <div className="browser-header">
        <h2>Database Browser</h2>
        <div className="browser-actions">
          <Button
            action="add"
            onClick={onCreateCustom}
            size="sm"
          >
            Create Custom
          </Button>
          <Button
            action="cancel"
            onClick={onCancel}
            size="sm"
          >
            Close
          </Button>
        </div>
      </div>

      {/* Countdown Creator */}
      <div className="countdown-creator-horizontal">
        <div className="countdown-creator-header">
          <span className="countdown-creator-label">Create Countdown</span>
        </div>
        <form 
          className="countdown-form-horizontal"
          onSubmit={(e) => {
            e.preventDefault()
            setCountdownError('') // Clear any previous errors
            
            // Validate the countdown data
            if (!newCountdown.name.trim()) {
              setCountdownError('Countdown name is required')
              return
            }
            
            if (newCountdown.name.trim().length > 25) {
              setCountdownError('Countdown name cannot exceed 25 characters')
              return
            }
            
            const value = parseInt(newCountdown.value)
            if (!value || value < 1) {
              setCountdownError('Countdown value must be at least 1')
              return
            }
            
            if (value > 20) {
              setCountdownError('Countdown value cannot exceed 20')
              return
            }
            
            if (onCreateCountdown) {
              const countdownData = {
                name: newCountdown.name.trim(),
                max: value,
                description: newCountdown.description.trim(),
                type: newCountdown.type,
                loop: newCountdown.loop
              }
              console.log('Browser sending countdown data:', countdownData)
              onCreateCountdown(countdownData)
              setNewCountdown({
                name: '',
                value: '',
                description: '',
                type: 'standard',
                loop: 'none'
              })
              setCountdownError('') // Clear any previous errors
              // Focus the name input for quick creation of multiple countdowns
              setTimeout(() => {
                countdownNameInputRef.current?.focus()
              }, 0)
            }
          }}
        >
          <div className="name-input-container">
            <input
              ref={countdownNameInputRef}
              type="text"
              placeholder="Name"
              value={newCountdown.name}
              maxLength={25}
              onChange={(e) => setNewCountdown(prev => ({ ...prev, name: e.target.value }))}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  const form = e.target.closest('form')
                  if (form) {
                    const submitButton = form.querySelector('button[type="submit"]')
                    if (submitButton) {
                      submitButton.click()
                    }
                  }
                }
              }}
              className="input-compact"
              required
            />
            <div className="char-counter">
              {newCountdown.name.length}/25
            </div>
          </div>
          <input
            type="number"
            placeholder="Value"
            value={newCountdown.value}
            onChange={(e) => {
              const inputValue = e.target.value
              
              // Real-time validation and correction
              if (inputValue && parseInt(inputValue) > 20) {
                // Update both error and corrected value simultaneously
                setCountdownError('Countdown value cannot exceed 20')
                setNewCountdown(prev => ({ ...prev, value: '20' }))
              } else {
                // Clear any previous value-related errors and update the value
                if (countdownError && countdownError.includes('value')) {
                  setCountdownError('')
                }
                setNewCountdown(prev => ({ ...prev, value: inputValue }))
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                const form = e.target.closest('form')
                if (form) {
                  const submitButton = form.querySelector('button[type="submit"]')
                  if (submitButton) {
                    submitButton.click()
                  }
                }
              }
            }}
            className="input-compact"
            required
            min="1"
            max="20"
          />
          <input
            type="text"
            placeholder="Description"
            value={newCountdown.description}
            onChange={(e) => setNewCountdown(prev => ({ ...prev, description: e.target.value }))}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                const form = e.target.closest('form')
                if (form) {
                  const submitButton = form.querySelector('button[type="submit"]')
                  if (submitButton) {
                    submitButton.click()
                  }
                }
              }
            }}
            className="input-compact"
          />
          <select
            value={newCountdown.type}
            onChange={(e) => setNewCountdown(prev => ({ ...prev, type: e.target.value }))}
            className="input-compact"
          >
            <option value="standard">Standard</option>
            <option value="dynamic-consequence">Dynamic Consequence</option>
            <option value="dynamic-progress">Dynamic Progress</option>
            <option value="long-term">Long-term</option>
          </select>
          <select
            value={newCountdown.loop}
            onChange={(e) => setNewCountdown(prev => ({ ...prev, loop: e.target.value }))}
            className="input-compact"
          >
            <option value="none">No Loop</option>
            <option value="loop">Loop</option>
            <option value="increasing">Increasing</option>
            <option value="decreasing">Decreasing</option>
          </select>
          <Button
            action="add"
            size="sm"
            type="submit"
          >
            Create
          </Button>
        </form>
        
        {/* Error display */}
        {countdownError && (
          <div className="countdown-error">
            <span className="error-text">{countdownError}</span>
          </div>
        )}
      </div>

      {/* Search and Filters */}
      <div className="browser-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-controls">
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
      </div>

      {/* Results Table */}
      <div className="browser-results">
        <table className="browser-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('name')} className="sortable">
                Name
                {sortField === 'name' && (
                  <span className="sort-indicator">
                    {sortDirection === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
              <th onClick={() => handleSort('type')} className="sortable">
                Type
                {sortField === 'type' && (
                  <span className="sort-indicator">
                    {sortDirection === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
              <th onClick={() => handleSort('tier')} className="sortable">
                Tier
                {sortField === 'tier' && (
                  <span className="sort-indicator">
                    {sortDirection === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
              <th onClick={() => handleSort('difficulty')} className="sortable">
                Difficulty
                {sortField === 'difficulty' && (
                  <span className="sort-indicator">
                    {sortDirection === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
              <th>Add</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedItems.map((item) => (
              <React.Fragment key={item.id}>
                <tr className="browser-row" onClick={() => handleCardClick(item)}>
                  <td className="item-name">
                    {item.name}
                  </td>
                  <td className="item-type">
                    <span className="type-content">
                      <span className="category-icon">
                        {item.category === 'Adversary' ? (
                          <Swords size={16} title="Adversary" />
                        ) : (
                          <TreePine size={16} title="Environment" />
                        )}
                      </span>
                      <span className="type-text">{item.displayType || '-'}</span>
                    </span>
                  </td>
                  <td className="tier-column">Tier {item.tier}</td>
                  <td>{item.displayDifficulty || '-'}</td>

                  <td className="item-add-button" onClick={(e) => e.stopPropagation()}>
                    <Button
                      action="add"
                      size="sm"
                      onClick={() => handleAddFromDatabase(item)}
                      title={`Add ${item.name} to game`}
                    >
                      +
                    </Button>
                  </td>
                </tr>
                
                {/* Inline Expanded Card View */}
                {expandedCard?.id === item.id && (
                  <tr className="expanded-card-row">
                    <td colSpan={5} className="expanded-card-cell">
                      <div className="expanded-card-container">
                        <Cards
                          item={expandedCard}
                          type={expandedCard.category.toLowerCase()}
                          mode="expanded"
                          onItemClick={() => handleAddFromDatabase(expandedCard)}
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

      {/* Empty State */}
      {filteredAndSortedItems.length === 0 && (
        <div className="empty-state">
          <p>No items found matching your criteria.</p>
          <Button
            action="add"
            onClick={() => {
              setSearchTerm('')
              setFilterCategory('')
              setFilterTier('')
              setFilterType('')
            }}
            size="sm"
          >
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  )
}

export default Browser
