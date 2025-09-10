import React, { useMemo, useEffect, useRef } from 'react'
// removed unused imports after split
import useBrowser from '../../hooks/useBrowser'
import BrowserHeader from './BrowserHeader'
import BrowserTableHeader from './BrowserTableHeader'
import BrowserRow from './BrowserRow'
// Dynamically import JSON data to keep initial bundle smaller
let adversariesData = { adversaries: [] }
let environmentsData = { environments: [] }

// Load data asynchronously
const loadData = async () => {
  try {
    const mod = await import(/* @vite-ignore */ '../../data/adversaries.json')
    adversariesData = mod?.default || mod
  } catch (e) {
    console.warn('Failed to load adversaries.json dynamically:', e)
  }
  try {
    const mod = await import(/* @vite-ignore */ '../../data/environments.json')
    environmentsData = mod?.default || mod
  } catch (e) {
    console.warn('Failed to load environments.json dynamically:', e)
  }
}

// Load data immediately
loadData()

const Browser = ({ 
  type, // 'adversary' or 'environment'
  onAddItem, 
  onCancel, 
  onCreateCustom
}) => {
  console.log('Browser component rendered with props:', { type, onAddItem, onCancel, onCreateCustom })
  console.log('Browser component is being used, not List component')
  
  const {
    searchTerm, setSearchTerm,
    selectedTiers, setSelectedTiers,
    selectedTypes, setSelectedTypes,
    sortFields, setSortFields,
    showTierDropdown, setShowTierDropdown,
    showTypeDropdown, setShowTypeDropdown,
    tierFilterRef, typeFilterRef,
    expandedCard, setExpandedCard,
    handleSort, handleFilter,
    tierTooltip, typeTooltip, isTierFiltered, isTypeFiltered,
    handleTierSelect, handleTypeSelect,
    getDropdownStyle
  } = useBrowser(type)
  
  // expandedCard handled by hook
  
  // (mobile detection removed)
  
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
  
  // persistence handled by hook
  
  // (persisted via usePersistentState)

  // filters load handled by hook

  // (moved below itemTypes/itemTiers)

  // Use imported data directly - only the relevant type
  const adversaryData = adversariesData.adversaries || []
  const environmentData = environmentsData.environments || []
  
  // Select data based on type
  const currentData = type === 'adversary' ? adversaryData : environmentData
  const dataType = type === 'adversary' ? 'adversary' : 'environment'

  // Close dropdowns on outside interaction (capture phase to bypass local stopPropagation)
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
  }, [itemTypes, itemTiers, selectedTypes, selectedTiers, setSelectedTypes, setSelectedTiers])

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

  // handlers and tooltips provided by hook

  // dropdown style provided by hook

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
      // Allow events to bubble so buttons/inputs work inside mobile drawer
    >
      {/* Fixed Header Row */}
      <BrowserHeader
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onCreateCustom={onCreateCustom}
        type={type}
      />

      {/* Scrollable Content */}
      <div className="browser-content">

        <table className="browser-table">
          <thead>
            <BrowserTableHeader
              sortFields={sortFields}
              onSort={handleSort}
              tierFilterRef={tierFilterRef}
              typeFilterRef={typeFilterRef}
              isTierFiltered={isTierFiltered}
              isTypeFiltered={isTypeFiltered}
              tierTooltip={tierTooltip}
              typeTooltip={typeTooltip}
              showTierDropdown={showTierDropdown}
              showTypeDropdown={showTypeDropdown}
              onToggleTierDropdown={() => handleFilter('tier')}
              onToggleTypeDropdown={() => handleFilter('type')}
              itemTiers={itemTiers}
              itemTypes={itemTypes}
              selectedTiers={selectedTiers}
              selectedTypes={selectedTypes}
              onClearTiers={() => setSelectedTiers([])}
              onClearTypes={() => setSelectedTypes([])}
              onTierSelect={(tier) => handleTierSelect(tier)}
              onTypeSelect={(v) => handleTypeSelect(v)}
              getDropdownStyle={getDropdownStyle}
            />
          </thead>
          <tbody>
            {filteredAndSortedItems.map((item) => (
              <BrowserRow
                key={item.id}
                item={item}
                isExpanded={expandedCard?.id === item.id}
                onToggleExpand={handleCardClick}
                onAdd={handleAddFromDatabase}
                fallbackType={type === 'adversary' ? 'adversary' : 'environment'}
              />
            ))}
          </tbody>
        </table>
      </div>

    </div>
  )
}

export default Browser