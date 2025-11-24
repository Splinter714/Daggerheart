import React, { useMemo, useEffect, useRef, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { Filter, Square, CheckSquare, Plus, X } from 'lucide-react'
import GameCard from './GameCard'
import logoImage from '../assets/daggerheart-logo.svg'
import { useGameState } from '../state/state'
import CustomAdversaryCreator from './CustomAdversaryCreator'

// Hook to calculate optimal grid columns based on container width and item count
const useOptimalGridColumns = (itemCount, containerRef) => {
  const [columns, setColumns] = useState('max-content')
  
  const calculateColumns = useCallback(() => {
    if (!containerRef.current || itemCount <= 3) {
      return 'max-content'
    }
    
    const containerWidth = containerRef.current.offsetWidth
    const estimatedItemWidth = 120 // Estimated width per item including gap
    const maxColumns = Math.floor(containerWidth / estimatedItemWidth)
    
    if (maxColumns <= 1) return 'max-content'
    
    // Smart distribution logic
    if (itemCount === 4) return 'max-content max-content'
    if (itemCount === 5) return maxColumns >= 2 ? 'max-content max-content' : 'max-content'
    if (itemCount === 6) return maxColumns >= 2 ? 'max-content max-content' : 'max-content'
    if (itemCount === 7) return maxColumns >= 3 ? 'max-content max-content max-content' : maxColumns >= 2 ? 'max-content max-content' : 'max-content'
    
    // For larger counts, use CSS auto-fit as fallback
    return 'repeat(auto-fit, minmax(80px, max-content))'
  }, [itemCount, containerRef])
  
  useEffect(() => {
    const newColumns = calculateColumns()
    setColumns(newColumns)
    
    // Set up ResizeObserver to recalculate when container size changes
    const resizeObserver = new ResizeObserver(() => {
      const updatedColumns = calculateColumns()
      setColumns(updatedColumns)
    })
    
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current)
    }
    
    return () => {
      resizeObserver.disconnect()
    }
  }, [calculateColumns])
  
  return columns
}

// AdversaryList component that uses the optimal grid columns hook
const AdversaryList = ({ encounter }) => {
  const containerRef = useRef(null)
  const itemCount = encounter.encounterItems?.length || 0
  const gridColumns = useOptimalGridColumns(itemCount, containerRef)
  
  return (
    <div 
      ref={containerRef}
      className="saved-encounter-adversary-list"
      style={{ 
        flex: 1,
        fontSize: '0.8rem',
        color: 'var(--text-secondary)',
        lineHeight: '1.3',
        display: 'grid',
        gridTemplateColumns: gridColumns,
        gap: '0.25rem 1rem',
        gridAutoRows: 'min-content'
      }}>
      {encounter.encounterItems?.length > 0 ? (
        encounter.encounterItems.map((item, index) => {
          const name = item.item.baseName || item.item.name?.replace(/\s+\(\d+\)$/, '') || item.item.name
          return (
            <div key={index} style={{ marginBottom: '0.125rem' }}>
              {item.quantity}x {name}
            </div>
          )
        })
      ) : (
        <div>No adversaries</div>
      )}
    </div>
  )
}

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
let playtestAdversariesData = { adversaries: [] }
let playtestEnvironmentsData = { environments: [] }
let _dataLoaded = false

// Load custom content from localStorage
const loadCustomContent = () => {
  const customAdversaries = JSON.parse(localStorage.getItem('daggerheart-custom-adversaries') || '[]')
  const customEnvironments = JSON.parse(localStorage.getItem('daggerheart-custom-environments') || '[]')
  return { customAdversaries, customEnvironments }
}

// Save custom content to localStorage
const saveCustomContent = (type, content) => {
  if (type === 'adversary') {
    localStorage.setItem('daggerheart-custom-adversaries', JSON.stringify(content))
  } else if (type === 'environment') {
    localStorage.setItem('daggerheart-custom-environments', JSON.stringify(content))
  }
}

// Load data asynchronously
const loadData = async () => {
  // Prevent multiple simultaneous loads
  if (_dataLoaded) {
    return
  }
  
  let officialAdversaries = { adversaries: [] }
  let officialEnvironments = { environments: [] }
  let playtestAdv = { adversaries: [] }
  let playtestEnv = { environments: [] }
  
  try {
    const mod = await import(/* @vite-ignore */ '../data/adversaries.json')
    officialAdversaries = mod?.default || mod
  } catch (e) {
    console.warn('Failed to load adversaries.json:', e)
  }
  
  try {
    const mod = await import(/* @vite-ignore */ '../data/environments.json')
    officialEnvironments = mod?.default || mod
  } catch (e) {
    console.warn('Failed to load environments.json:', e)
  }
  
  try {
    const mod = await import(/* @vite-ignore */ '../data/playtest-adversaries.json')
    playtestAdv = mod?.default || mod
  } catch (e) {
    console.warn('Failed to load playtest-adversaries.json:', e)
  }
  
  try {
    const mod = await import(/* @vite-ignore */ '../data/playtest-environments.json')
    playtestEnv = mod?.default || mod
  } catch (e) {
    console.warn('Failed to load playtest-environments.json:', e)
  }
  
  // Load custom content and merge everything
  const { customAdversaries, customEnvironments } = loadCustomContent()
  
  // Create merged data objects without mutating originals
  adversariesData = {
    ...officialAdversaries,
    adversaries: [
      ...(officialAdversaries.adversaries || []),
      ...(playtestAdv.adversaries || []),
      ...customAdversaries
    ]
  }
  
  environmentsData = {
    ...officialEnvironments,
    environments: [
      ...(officialEnvironments.environments || []),
      ...(playtestEnv.environments || []),
      ...customEnvironments
    ]
  }
  
  _dataLoaded = true
}

// Functions to manage custom content
// Note: addCustomAdversary is now imported from useGameState

const addCustomEnvironment = (environmentData) => {
  const { customEnvironments } = loadCustomContent()
  const newEnvironment = {
    ...environmentData,
    id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
    source: environmentData.source || 'Homebrew'
  }
  const updatedEnvironments = [...customEnvironments, newEnvironment]
  saveCustomContent('environment', updatedEnvironments)
  
  // Reset flag and reload data to include the new custom environment
  _dataLoaded = false
  loadData()
  
  return newEnvironment.id
}

const updateCustomContent = (type, id, updates) => {
  const { customAdversaries, customEnvironments } = loadCustomContent()
  
  if (type === 'adversary') {
    const updatedAdversaries = customAdversaries.map(adv => 
      adv.id === id ? { ...adv, ...updates } : adv
    )
    saveCustomContent('adversary', updatedAdversaries)
  } else if (type === 'environment') {
    const updatedEnvironments = customEnvironments.map(env => 
      env.id === id ? { ...env, ...updates } : env
    )
    saveCustomContent('environment', updatedEnvironments)
  }
  
  // Reset flag and reload data to reflect changes
  _dataLoaded = false
  loadData()
}

const deleteCustomContent = (type, id) => {
  const { customAdversaries, customEnvironments } = loadCustomContent()
  
  if (type === 'adversary') {
    const updatedAdversaries = customAdversaries.filter(adv => adv.id !== id)
    saveCustomContent('adversary', updatedAdversaries)
  } else if (type === 'environment') {
    const updatedEnvironments = customEnvironments.filter(env => env.id !== id)
    saveCustomContent('environment', updatedEnvironments)
  }
  
  // Reset flag and reload data to reflect changes
  _dataLoaded = false
  loadData()
}

// Functions to manage playtest content (for development/admin use)
const addPlaytestAdversary = (adversaryData) => {
  // Note: This would typically be done by updating the playtest-adversaries.json file directly
  // This function is here for completeness but playtest content is usually managed via file updates
  console.warn('addPlaytestAdversary: Playtest content should be managed by updating playtest-adversaries.json directly')
}

const addPlaytestEnvironment = (environmentData) => {
  // Note: This would typically be done by updating the playtest-environments.json file directly
  // This function is here for completeness but playtest content is usually managed via file updates
  console.warn('addPlaytestEnvironment: Playtest content should be managed by updating playtest-environments.json directly')
}

// Custom hook for browser functionality - all logic inline
const useBrowser = (type, encounterItems = [], pcCount = 4, playerTier = 1, filterCustom = false) => {
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

  // Function to refresh data
  const refreshData = useCallback(async () => {
    _dataLoaded = false
    await loadData()
    
    // Update data after reload
    let sourceData = []
    if (type === 'adversary') {
      if (filterCustom) {
        // Filter to only custom adversaries
        sourceData = (adversariesData.adversaries || []).filter(adv => adv.source === 'Homebrew' || adv.id?.startsWith('custom-'))
      } else {
        sourceData = adversariesData.adversaries || []
      }
    } else if (type === 'environment') {
      sourceData = environmentsData.environments || []
    }
    
    setData(sourceData)
  }, [type, filterCustom])

  // Refresh data when filterCustom changes
  useEffect(() => {
    refreshData()
  }, [filterCustom, refreshData])

  const uniqueTiers = getUniqueValues('tier')
  const uniqueTypes = getUniqueValues('type')

  const filteredAndSortedData = useMemo(() => {
    let filtered = data.filter(item => {
      // Search filter
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase())
      
      // Tier filter
      const matchesTier = selectedTiers.length === 0 || 
        (selectedTiers.includes('party-tier') ? item.tier === playerTier : selectedTiers.includes(item.tier.toString()))
      
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
        // if (item.tier < playerTier) {
        //   automaticAdjustment += 1
        // }
            
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
    } else if (tier === 'party-tier') {
      // Special case: only show party tier
      setSelectedTiers(['party-tier'])
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
    refreshData,    // Advanced filtering
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
    <div style={styles.browserHeader}>
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

// Browser Button Row Component
const BrowserButtonRow = ({ showCustomToggle = false, onToggleCustom, filterCustom = false, onExportCustomAdversaries, onImportCustomAdversaries }) => {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      padding: '0.75rem 1rem',
      backgroundColor: 'var(--bg-secondary)',
      borderBottom: '1px solid var(--border)',
      flexShrink: 0
    }}>
      {/* Custom Toggle Button */}
      {showCustomToggle && (
        <button
          onClick={() => onToggleCustom && onToggleCustom(!filterCustom)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            backgroundColor: filterCustom ? 'var(--purple)' : 'var(--bg-primary)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            color: filterCustom ? 'white' : 'var(--text-primary)',
            fontSize: '0.875rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            whiteSpace: 'nowrap'
          }}
          onMouseEnter={(e) => {
            if (!filterCustom) {
              e.target.style.backgroundColor = 'var(--bg-hover)'
              e.target.style.borderColor = 'var(--purple)'
            }
          }}
          onMouseLeave={(e) => {
            if (!filterCustom) {
              e.target.style.backgroundColor = 'var(--bg-primary)'
              e.target.style.borderColor = 'var(--border)'
            }
          }}
        >
          <span>{filterCustom ? '✓' : '○'}</span>
          Custom Only
        </button>
      )}
      
      {/* Export/Import Buttons - Always Visible */}
      <button
        onClick={onExportCustomAdversaries}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.5rem 1rem',
          backgroundColor: 'var(--bg-primary)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          color: 'var(--text-primary)',
          fontSize: '0.875rem',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          whiteSpace: 'nowrap'
        }}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = 'var(--bg-hover)'
          e.target.style.borderColor = 'var(--purple)'
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = 'var(--bg-primary)'
          e.target.style.borderColor = 'var(--border)'
        }}
      >
        <span>↓</span>
        Export
      </button>
      
      <button
        onClick={() => document.getElementById('import-file-input').click()}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.5rem 1rem',
          backgroundColor: 'var(--bg-primary)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          color: 'var(--text-primary)',
          fontSize: '0.875rem',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          whiteSpace: 'nowrap'
        }}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = 'var(--bg-hover)'
          e.target.style.borderColor = 'var(--purple)'
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = 'var(--bg-primary)'
          e.target.style.borderColor = 'var(--border)'
        }}
      >
        <span>↑</span>
        Import
      </button>
      
      <input
        id="import-file-input"
        type="file"
        accept=".csv,.json"
        onChange={onImportCustomAdversaries}
        style={{ display: 'none' }}
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
  getDropdownStyle,
  // Cost filter props
  costFilter,
  showCostDropdown,
  setShowCostDropdown,
  costFilterRef,
  handleCostFilterSelect,
  isCostFiltered
}) => {
  const [hoveredColumn, setHoveredColumn] = useState(null)

  const getColumns = () => {
    if (type === 'adversary') {
      return [
        { key: 'name', label: 'Name' },
        { key: 'tier', label: 'Tier', hasFilter: true },
        { key: 'type', label: 'Type', hasFilter: true },
        { key: 'cost', label: 'Cost', hasFilter: true },
        { key: 'difficulty', label: 'Diff' }
      ]
    } else if (type === 'environment') {
      return [
        { key: 'name', label: 'Name' },
        { key: 'tier', label: 'Tier', hasFilter: true },
        { key: 'type', label: 'Type', hasFilter: true },
        { key: 'difficulty', label: 'Diff' }
      ]
    }
    return []
  }

  const columns = getColumns()

  const renderCostFilterDropdown = () => {
    if (!showCostDropdown) return null

    const costFilterOptions = [
      { value: 'all', label: 'All' },
      { value: 'auto-grey', label: 'Auto Grey' },
      { value: 'auto-hide', label: 'Auto Hide' }
    ]

    return createPortal(
      <div 
        className="filter-dropdown"
        style={{
          ...styles.filterDropdown,
          ...getDropdownStyle(costFilterRef),
          maxHeight: '60vh',
          overflow: 'auto'
        }}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        {costFilterOptions.map(option => {
          const isSelected = costFilter === option.value
          return (
            <div
              key={option.value}
              style={{
                ...styles.filterOption,
                ...(isSelected ? styles.filterOptionSelected : {})
              }}
              onClick={() => handleCostFilterSelect(option.value)}
            >
              <span style={styles.checkIcon}>
                {isSelected ? <CheckSquare size={16}/> : <Square size={16}/>}
              </span>
              <span style={styles.filterLabel}>{option.label}</span>
            </div>
          )
        })}
      </div>,
      document.body
    )
  }

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
        {filterType === 'tier' && (
          <div 
            style={{
              ...styles.filterOption,
              ...(selected.includes('party-tier') ? styles.filterOptionSelected : {})
            }}
            onClick={() => onSelect('party-tier')}
          >
            <span style={styles.checkIcon}>
              {selected.includes('party-tier') ? <CheckSquare size={16}/> : <Square size={16}/>}
            </span>
            <span style={styles.filterLabel}>Party Tier</span>
          </div>
        )}
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
            ...(column.key === 'difficulty' ? { width: '40px', minWidth: '40px', maxWidth: '40px' } : {}),
            ...(column.key === 'cost' ? { width: '50px', minWidth: '50px', maxWidth: '50px' } : {})
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
                ref={column.key === 'tier' ? tierFilterRef : column.key === 'type' ? typeFilterRef : costFilterRef}
                style={{
                  ...styles.headerFilterIcon,
                  ...(column.key === 'tier' && isTierFiltered ? styles.headerFilterIconActive : {}),
                  ...(column.key === 'type' && isTypeFiltered ? styles.headerFilterIconActive : {}),
                  ...(column.key === 'cost' && isCostFiltered ? styles.headerFilterIconActive : {})
                }}
                className="header-filter-icon"
                onClick={(e) => {
                  e.stopPropagation()
                  if (column.key === 'tier') {
                    setShowTierDropdown(!showTierDropdown)
                    setShowTypeDropdown(false)
                    setShowCostDropdown(false)
                  } else if (column.key === 'type') {
                    setShowTypeDropdown(!showTypeDropdown)
                    setShowTierDropdown(false)
                    setShowCostDropdown(false)
                  } else if (column.key === 'cost') {
                    setShowCostDropdown(!showCostDropdown)
                    setShowTierDropdown(false)
                    setShowTypeDropdown(false)
                  }
                }}
              >
                <Filter size={14} />
                {(column.key === 'tier' && isTierFiltered) || (column.key === 'type' && isTypeFiltered) || (column.key === 'cost' && isCostFiltered) ? (
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
          {column.key === 'cost' && renderCostFilterDropdown()}
        </th>
      ))}
    </tr>
  )
}

// Browser Row Component
const BrowserRow = ({ item, onAdd, type, onRowClick, encounterItems = [], pcCount = 4, playerTier = 1, remainingBudget = 0, costFilter = 'auto-grey' }) => {
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
        // if (item.tier < playerTier) {
        //   automaticAdjustment += 1
        // }
    
    return baseCost + automaticAdjustment
  }

  const renderContent = () => {
    if (type === 'adversary') {
      const dynamicCost = calculateDynamicCost()
      const baseCost = BATTLE_POINT_COSTS[item.type] || 2
      const exceedsBudget = dynamicCost > remainingBudget || remainingBudget <= 0
      
      // Apply cost filter logic
      if (costFilter === 'auto-hide' && exceedsBudget) {
        return null // Hide the row completely
      }
      
      // De-emphasized styling for rows that exceed budget (only for auto-grey mode)
      const deEmphasizedStyle = (costFilter === 'auto-grey' && exceedsBudget) ? {
        opacity: 0.5,
        color: 'var(--text-secondary)'
      } : {}
      
      return (
        <>
          <td style={{...styles.rowCell, width: 'auto', minWidth: '0', textAlign: 'left', ...deEmphasizedStyle}}>
            <div style={{ 
              overflow: 'hidden', 
              textOverflow: 'ellipsis', 
              whiteSpace: 'nowrap',
              maxWidth: '100%'
            }}>
              <div style={{ fontWeight: '600' }}>{item.name}</div>
              {item.description && (
                <div style={{ 
                  fontSize: '0.85rem', 
                  color: 'var(--text-secondary)', 
                  marginTop: '0.125rem',
                  overflow: 'hidden', 
                  textOverflow: 'ellipsis', 
                  whiteSpace: 'nowrap'
                }}>
                  {item.description}
                </div>
              )}
            </div>
          </td>
          <td style={{...styles.rowCell, width: '40px', minWidth: '40px', maxWidth: '40px', textAlign: 'center', ...deEmphasizedStyle}}>{item.tier}</td>
          <td style={{...styles.rowCell, width: '80px', minWidth: '80px', maxWidth: '80px', textAlign: 'center', ...deEmphasizedStyle}}>{item.type}</td>
          <td style={{...styles.rowCell, width: '50px', minWidth: '50px', maxWidth: '50px', textAlign: 'center', ...deEmphasizedStyle}}>
            {dynamicCost}
          </td>
          <td style={{...styles.rowCell, width: '40px', minWidth: '40px', maxWidth: '40px', textAlign: 'center', ...deEmphasizedStyle}}>{item.difficulty}</td>
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

  const content = renderContent()
  
  // If renderContent returns null (auto-hide mode), don't render the row
  if (content === null) {
    return null
  }

  return (
    <>
      <tr 
        style={{
          ...styles.row,
          ...(isHovered ? styles.rowHover : {})
        }}
        onClick={() => {
          if (type === 'adversary') {
            handleAdd()
          } else if (onRowClick) {
            onRowClick(item, type)
          }
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {content}
      </tr>
    </>
  )
}

// Main Browser Component
const Browser = ({ type, onAddItem, onCancel = null, onRowClick, encounterItems = [], pcCount = 4, playerTier = 1, partyControls = null, showContainer = true, savedEncounters = [], onLoadEncounter, onDeleteEncounter, activeTab = 'adversaries', selectedCustomAdversaryId, onSelectCustomAdversary, onTabChange, selectedAdversary, onSelectAdversary, filterCustom = false, showCustomToggle = false, onToggleCustom, onExportCustomAdversaries, onImportCustomAdversaries, autoFocus = false, hideImportExport = false, onClose = null, searchPlaceholder = "Search" }) => {
  const { addCustomAdversary, updateCustomAdversary, customContent } = useGameState()
  const [editingAdversary, setEditingAdversary] = useState(null)
  const [costFilter, setCostFilter] = useState('all') // 'all', 'auto-grey', 'auto-hide'
  const [showCostDropdown, setShowCostDropdown] = useState(false)
  const [deleteConfirmations, setDeleteConfirmations] = useState({}) // Track which encounters are in delete confirmation state
  const deleteTimeouts = useRef({}) // Track timeouts for each encounter
  const costFilterRef = useRef(null)
  
  // Export custom adversaries to CSV file
  const handleExportCustomAdversaries = () => {
    try {
      const adversaries = customContent.adversaries || []
      
      if (adversaries.length === 0) {
        alert('No custom adversaries to export.')
        return
      }
      
      // Define CSV headers
      const headers = [
        'name', 'tier', 'type', 'difficulty', 'threshold_major', 'threshold_severe',
        'hp_max', 'stress_max', 'atk', 'weapon', 'range', 'damage',
        'description', 'motives'
      ]
      
      // Convert adversaries to CSV rows
      const rows = adversaries.map(adv => [
        adv.name || '',
        adv.tier || '',
        adv.type || '',
        adv.difficulty || '',
        adv.thresholds?.major || '',
        adv.thresholds?.severe || '',
        adv.hpMax || '',
        adv.stressMax || '',
        adv.atk || '',
        adv.weapon || '',
        adv.range || '',
        adv.damage || '',
        adv.description || '',
        adv.motives || ''
      ])
      
      // Escape CSV values (handle commas, quotes, newlines)
      const escapeCSV = (value) => {
        const str = String(value)
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`
        }
        return str
      }
      
      // Build CSV content
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(escapeCSV).join(','))
      ].join('\n')
      
      // Create and download file
      const dataBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(dataBlob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = `daggerheart-custom-adversaries-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      console.log(`Exported ${adversaries.length} custom adversaries to CSV`)
    } catch (error) {
      console.error('Failed to export custom adversaries:', error)
      alert('Failed to export custom adversaries. Please try again.')
    }
  }
  
  // Import custom adversaries from CSV file
  const handleImportCustomAdversaries = (event) => {
    const file = event.target.files[0]
    if (!file) return
    
    // Check file type
    const isCSV = file.name.endsWith('.csv')
    const isJSON = file.name.endsWith('.json')
    
    if (!isCSV && !isJSON) {
      alert('Please upload a CSV or JSON file.')
      event.target.value = ''
      return
    }
    
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        let importedAdversaries = []
        
        if (isCSV) {
          // Parse CSV
          const csvText = e.target.result
          const lines = csvText.split('\n').filter(line => line.trim())
          
          if (lines.length < 2) {
            throw new Error('CSV file is empty or invalid.')
          }
          
          // Parse header row
          const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''))
          
          // Parse data rows
          for (let i = 1; i < lines.length; i++) {
            const values = []
            let current = ''
            let inQuotes = false
            
            // Handle CSV parsing with quoted values
            for (let j = 0; j < lines[i].length; j++) {
              const char = lines[i][j]
              const nextChar = lines[i][j + 1]
              
              if (char === '"' && inQuotes && nextChar === '"') {
                current += '"'
                j++ // Skip next quote
              } else if (char === '"') {
                inQuotes = !inQuotes
              } else if (char === ',' && !inQuotes) {
                values.push(current.trim())
                current = ''
              } else {
                current += char
              }
            }
            values.push(current.trim())
            
            // Map values to adversary object
            const adversary = {
              name: values[headers.indexOf('name')] || '',
              tier: parseInt(values[headers.indexOf('tier')]) || 1,
              type: values[headers.indexOf('type')] || 'Standard',
              difficulty: parseInt(values[headers.indexOf('difficulty')]) || 11,
              thresholds: {
                major: parseInt(values[headers.indexOf('threshold_major')]) || 7,
                severe: parseInt(values[headers.indexOf('threshold_severe')]) || 12
              },
              hpMax: parseInt(values[headers.indexOf('hp_max')]) || 3,
              stressMax: parseInt(values[headers.indexOf('stress_max')]) || 1,
              atk: parseInt(values[headers.indexOf('atk')]) || 1,
              weapon: values[headers.indexOf('weapon')] || '',
              range: values[headers.indexOf('range')] || 'Melee',
              damage: values[headers.indexOf('damage')] || '',
              description: values[headers.indexOf('description')] || '',
              motives: values[headers.indexOf('motives')] || '',
              source: 'Homebrew'
            }
            
            if (adversary.name) {
              importedAdversaries.push(adversary)
            }
          }
        } else if (isJSON) {
          // Parse JSON (legacy format support)
          const importData = JSON.parse(e.target.result)
          
          if (!importData.customAdversaries || !Array.isArray(importData.customAdversaries)) {
            throw new Error('Invalid JSON format. Expected customAdversaries array.')
          }
          
          importedAdversaries = importData.customAdversaries
        }
        
        // Check for duplicates and merge
        const existingAdversaries = customContent.adversaries || []
        const mergedAdversaries = [...existingAdversaries]
        
        let addedCount = 0
        let skippedCount = 0
        
        importedAdversaries.forEach(importedAdv => {
          // Check if adversary with same name already exists
          const exists = existingAdversaries.some(existing => 
            existing.name === importedAdv.name && existing.source === importedAdv.source
          )
          
          if (!exists) {
            // Generate new ID to avoid conflicts
            const newAdversary = {
              ...importedAdv,
              id: `custom-adv-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
              hp: 0,
              stress: 0
            }
            mergedAdversaries.push(newAdversary)
            addedCount++
          } else {
            skippedCount++
          }
        })
        
        // Update the custom content
        if (addedCount > 0) {
          // Update localStorage directly
          localStorage.setItem('daggerheart-custom-adversaries', JSON.stringify(mergedAdversaries))
          
          // Force a page reload to update the state
          window.location.reload()
          
          alert(`Import successful! Added ${addedCount} new adversaries${skippedCount > 0 ? `, skipped ${skippedCount} duplicates` : ''}.`)
        } else {
          alert('No new adversaries were added. All imported adversaries already exist.')
        }
        
      } catch (error) {
        console.error('Failed to import custom adversaries:', error)
        alert(`Failed to import custom adversaries: ${error.message}`)
      }
    }
    
    reader.readAsText(file)
    // Reset the input so the same file can be selected again
    event.target.value = ''
  }
  
  // Handle editing custom adversaries
  const handleEditAdversary = (adversary) => {
    setEditingAdversary(adversary)
    // Switch to create tab
    if (onTabChange) {
      onTabChange('create')
    }
  }

  const handleCancelEdit = () => {
    setEditingAdversary(null)
  }

  const handleSaveAdversary = async (adversaryData, id) => {
    if (id) {
      // Update existing adversary
      updateCustomAdversary(id, adversaryData)
    } else {
      // Create new adversary
      addCustomAdversary(adversaryData)
    }
  }
  
  // Handle two-stage delete
  const handleDeleteClick = (encounterId) => {
    if (deleteConfirmations[encounterId]) {
      // Second click - actually delete (no popup confirmation)
      onDeleteEncounter && onDeleteEncounter(encounterId)
      setDeleteConfirmations(prev => {
        const newState = { ...prev }
        delete newState[encounterId]
        return newState
      })
      // Clear any existing timeout
      if (deleteTimeouts.current[encounterId]) {
        clearTimeout(deleteTimeouts.current[encounterId])
        delete deleteTimeouts.current[encounterId]
      }
    } else {
      // First click - show confirmation state
      setDeleteConfirmations(prev => ({
        ...prev,
        [encounterId]: true
      }))
      
      // Clear any existing timeout for this encounter
      if (deleteTimeouts.current[encounterId]) {
        clearTimeout(deleteTimeouts.current[encounterId])
      }
      
      // Set timeout to revert after 3 seconds
      deleteTimeouts.current[encounterId] = setTimeout(() => {
        setDeleteConfirmations(prev => {
          const newState = { ...prev }
          delete newState[encounterId]
          return newState
        })
        delete deleteTimeouts.current[encounterId]
      }, 3000)
    }
  }
  
  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      Object.values(deleteTimeouts.current).forEach(timeout => {
        clearTimeout(timeout)
      })
    }
  }, [])
  
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
  } = useBrowser(type, encounterItems, pcCount, playerTier, filterCustom)

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
    // const hasLowerTierAdversaries = encounterItems.some(item => 
    //   item.type === 'adversary' && item.item.tier && item.item.tier < playerTier && item.quantity > 0
    // )
    // if (hasLowerTierAdversaries) {
    //   automaticAdjustments += BATTLE_POINT_ADJUSTMENTS.lowerTierAdversary
    // }
    
    const availableBattlePoints = baseBattlePoints + automaticAdjustments
    return availableBattlePoints - spentBattlePoints
  }

  const remainingBudget = calculateRemainingBudget()

  const handleCostFilterSelect = (filter) => {
    setCostFilter(filter)
    setShowCostDropdown(false)
  }

  const isCostFiltered = costFilter !== 'all'

  if (loading) {
    return (
      <div style={styles.browser}>
        <div style={styles.loading}>Loading...</div>
      </div>
    )
  }

  return (
    <>
      <div style={showContainer ? styles.browserWrapper : styles.browserWrapperNoContainer}>
      {/* Fixed Header Row */}

      {activeTab === 'adversaries' && (
        <>
          <BrowserHeader
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            type={type}
            partyControls={partyControls}
            autoFocus={autoFocus}
            onClose={onClose}
            placeholder={searchPlaceholder}
          />
          
          {!hideImportExport && (
          <BrowserButtonRow
            showCustomToggle={showCustomToggle}
            onToggleCustom={onToggleCustom}
            filterCustom={filterCustom}
            onExportCustomAdversaries={handleExportCustomAdversaries}
            onImportCustomAdversaries={handleImportCustomAdversaries}
          />
          )}

          {/* Scrollable Content with Sticky Header */}
          <div className="browser-content invisible-scrollbar" style={styles.browserContent}>
        <table style={styles.browserTable}>
          <thead style={{ position: 'sticky', top: 0, zIndex: 10, backgroundColor: 'var(--bg-primary)' }}>
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
              // Cost filter props
              costFilter={costFilter}
              showCostDropdown={showCostDropdown}
              setShowCostDropdown={setShowCostDropdown}
              costFilterRef={costFilterRef}
              handleCostFilterSelect={handleCostFilterSelect}
              isCostFiltered={isCostFiltered}
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
                costFilter={costFilter}
              />
            ))}
          </tbody>
        </table>
      </div>
        </>
      )}

      {activeTab === 'encounters' && (
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1rem'
        }}>
          {savedEncounters.length === 0 ? (
            <div style={{
              color: 'var(--text-secondary)',
              fontSize: '0.9rem',
              textAlign: 'center',
              padding: '2rem 1rem'
            }}>
              No saved encounters yet
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {savedEncounters.map((encounter) => (
                <div
                  key={encounter.id}
                  onClick={() => onLoadEncounter && onLoadEncounter(encounter.id)}
                  className="saved-encounter-card"
                  style={{
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    padding: '8px',
                    backgroundColor: 'var(--bg-card)',
                    transition: 'background-color 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    cursor: 'pointer'
                  }}
                >
                  {/* Tier, Party Size, and Balance (stacked vertically) */}
                  <div style={{ 
                    minWidth: '100px',
                    borderRight: '1px solid var(--text-secondary)',
                    paddingRight: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    minHeight: '60px'
                  }}>
                    <div style={{
                      fontSize: '0.8rem',
                      color: 'var(--text-primary)',
                      marginBottom: '0.25rem'
                    }}>
                      Tier: {(() => {
                        const tiers = encounter.encounterItems
                          ?.filter(item => item.type === 'adversary')
                          ?.map(item => item.item.tier)
                          ?.filter(tier => tier !== undefined && tier !== null)
                          ?.sort((a, b) => a - b) || []
                        
                        if (tiers.length === 0) return 'N/A'
                        if (tiers.length === 1) return tiers[0]
                        
                        const uniqueTiers = [...new Set(tiers)]
                        if (uniqueTiers.length === 1) return uniqueTiers[0]
                        
                        return `${Math.min(...uniqueTiers)}-${Math.max(...uniqueTiers)}`
                      })()}
                    </div>
                    <div style={{
                      fontSize: '0.8rem',
                      color: 'var(--text-primary)',
                      marginBottom: '0.25rem'
                    }}>
                      Party Size: {encounter.partySize || 4}
                    </div>
                    <div style={{
                      fontSize: '0.8rem',
                      color: 'var(--text-primary)'
                    }}>
                      Balance: {(() => {
                        const partySize = encounter.partySize || 4
                        const baseBattlePoints = (3 * partySize) + 2
                        
                        // Calculate automatic adjustments (same logic as EncounterBuilder)
                        let automaticAdjustments = 0
                        const encounterItems = encounter.encounterItems || []
                        
                        // Check for 2 or more Solo adversaries
                        const soloCount = encounterItems
                          .filter(item => item.type === 'adversary' && item.item.type === 'Solo' && item.quantity > 0)
                          .reduce((sum, item) => sum + item.quantity, 0)
                        if (soloCount >= 2) {
                          automaticAdjustments += BATTLE_POINT_ADJUSTMENTS.twoOrMoreSolos
                        }
                        
                        // Check if no Bruisers, Hordes, Leaders, or Solos
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
                        
                        const availableBattlePoints = baseBattlePoints + automaticAdjustments
                        
                        const spentBattlePoints = encounterItems.reduce((total, item) => {
                          if (item.type === 'adversary') {
                            const cost = BATTLE_POINT_COSTS[item.item.type] || 2
                            if (item.item.type === 'Minion') {
                              const groups = Math.ceil(item.quantity / partySize)
                              return total + (groups * cost)
                            } else {
                              return total + (item.quantity * cost)
                            }
                          }
                          return total
                        }, 0)
                        
                        if (spentBattlePoints > availableBattlePoints) {
                          return `+${spentBattlePoints - availableBattlePoints}`
                        } else if (spentBattlePoints === availableBattlePoints) {
                          return '0'
                        } else {
                          return `-${availableBattlePoints - spentBattlePoints}`
                        }
                      })()}
                    </div>
                  </div>
                  
                  {/* Encounter Name */}
                  <div style={{ 
                    minWidth: '120px',
                    borderRight: '1px solid var(--text-secondary)',
                    paddingRight: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    minHeight: '60px'
                  }}>
                    <div style={{
                      fontWeight: '500',
                      color: 'var(--text-primary)',
                      fontSize: '0.9rem',
                      wordWrap: 'break-word',
                      wordBreak: 'break-word',
                      width: '150px',
                      maxWidth: '150px'
                    }}>
                      {encounter.name}
                    </div>
                  </div>
                  
                  {/* Adversary List */}
                  <AdversaryList encounter={encounter} />
                  
                  {/* Delete Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation() // Prevent card click
                      handleDeleteClick(encounter.id)
                    }}
                    style={{
                      background: deleteConfirmations[encounter.id] ? 'var(--danger)' : 'var(--gray-600)',
                      border: 'none',
                      color: 'white',
                      padding: '0.4rem 0.8rem',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      minWidth: '60px',
                      transition: 'background-color 0.2s'
                    }}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'create' && (
        <div style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: '1rem',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          height: '100%',
          minHeight: 0
        }}>
          <div style={{
            maxWidth: '600px',
            width: '100%',
            height: 'auto',
            display: 'flex',
            flexDirection: 'column',
            padding: '0',
            overflowY: 'visible',
            overflowX: 'hidden',
            minHeight: 0
          }}>
        <CustomAdversaryCreator 
          onSave={handleSaveAdversary}
          onRefresh={() => {}} // No need to refresh since state updates automatically
          onAddItem={onAddItem}
          editingAdversary={editingAdversary}
          onCancelEdit={handleCancelEdit}
              embedded={false}
        />
          </div>
        </div>
      )}


      {activeTab === 'info' && (
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '2rem'
        }}>
          {/* DPCGL Attribution */}
          <div style={{
            marginBottom: '2rem',
            textAlign: 'center'
          }}>
            <img 
              src={logoImage}
              alt="Daggerheart Community Content Logo"
              style={{
                width: '100%',
                maxWidth: '300px',
                height: 'auto',
                margin: '0 auto 1.5rem auto',
                display: 'block'
              }}
              onError={(e) => {
                console.error('Failed to load Daggerheart logo:', e.target.src);
                e.target.style.display = 'none';
              }}
            />
            <div style={{
              fontSize: '0.875rem',
              lineHeight: 1.6,
              color: 'var(--text-secondary)',
              textAlign: 'left',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              <p style={{ marginTop: 0 }}>This product includes materials from the Daggerheart System Reference Document 1.0, © Critical Role, LLC, under the terms of the Darrington Press Community Gaming (DPCGL) License.</p>
              <p>More information can be found at <a href="https://www.daggerheart.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--purple)', textDecoration: 'underline' }}>daggerheart.com</a></p>
              <p style={{ marginBottom: 0 }}><em>This project is unofficial and not endorsed by Darrington Press or Critical Role.</em></p>
            </div>
          </div>
          
          {/* Links */}
          <div style={{
            maxWidth: '600px',
            margin: '0 auto',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            overflow: 'hidden'
          }}>
            <button 
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem 1.5rem',
                color: 'var(--text-primary)',
                border: 'none',
                background: 'var(--bg-secondary)',
                width: '100%',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'background-color 0.2s ease',
                fontSize: '0.875rem',
                borderBottom: '1px solid var(--border)'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'var(--bg-hover)'
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'var(--bg-secondary)'
              }}
              onClick={(e) => { 
                e.stopPropagation();
                window.open('https://github.com/Splinter714/Daggerheart', '_blank')
              }}
            >
              <span>View on GitHub</span>
              <span>→</span>
            </button>
            
            {/* Version */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem 1.5rem',
              color: 'var(--text-secondary)',
              background: 'var(--bg-secondary)',
              fontSize: '0.875rem'
            }}>
              Version {typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : 'dev'}
            </div>
          </div>
        </div>
      )}
    </div>
    </>
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
  browserWrapperNoContainer: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden', // Clip header to container's rounded border
    height: '100%',
    width: '100%',
    position: 'relative'
  },
  browserContent: {
    flex: 1,
    overflowY: 'auto',
    overflowX: 'visible',
    padding: 0,
    width: '100%', // Ensure content uses full width
    scrollbarWidth: 'none', // Firefox
    msOverflowStyle: 'none', // IE/Edge
    borderRadius: '0 0 8px 8px' // Clip content to bottom rounded corners, matching GameCard
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
    fontSize: '16px',
    marginRight: '12px',
    transition: 'all 0.2s ease'
  },
  partyControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexShrink: 0
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
    gap: '0px',
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
    position: 'relative',
    marginLeft: '-2px'
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
    position: 'fixed',
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

// Export custom content management functions
export { 
  addCustomEnvironment, 
  updateCustomContent, 
  deleteCustomContent,
  loadCustomContent,
  saveCustomContent,
  addPlaytestAdversary,
  addPlaytestEnvironment
}

export default Browser
export { BrowserRow }