import { useState, useEffect, useRef } from 'react'
import usePersistentState from './usePersistentState'

export default function useBrowser(type) {
  const [searchTerm, setSearchTerm] = usePersistentState(`browser-search-${type}`, '')
  const [selectedTiers, setSelectedTiers] = usePersistentState(`browser-filters-tiers-${type}`, [])
  const [selectedTypes, setSelectedTypes] = usePersistentState(`browser-filters-types-${type}`, [])
  const getInitialSortState = () => {
    const savedSort = localStorage.getItem(`browser-sort-${type}`)
    if (savedSort) {
      try { return JSON.parse(savedSort) } catch (e) { return null }
    }
    return [
      { field: 'tier', direction: 'asc' },
      { field: 'displayType', direction: 'asc' },
      { field: 'displayDifficulty', direction: 'asc' }
    ]
  }
  const [sortFields, setSortFields] = usePersistentState(`browser-sort-${type}`, getInitialSortState())
  const [showTierDropdown, setShowTierDropdown] = useState(false)
  const [showTypeDropdown, setShowTypeDropdown] = useState(false)
  const tierFilterRef = useRef(null)
  const typeFilterRef = useRef(null)
  const [expandedCard, setExpandedCard] = useState(() => {
    const saved = localStorage.getItem(`browser-expanded-${type}`)
    if (saved) {
      try { return JSON.parse(saved) } catch (e) { return null }
    }
    return null
  })
  useEffect(() => {
    if (expandedCard) {
      localStorage.setItem(`browser-expanded-${type}`, JSON.stringify({ id: expandedCard.id }))
    } else {
      localStorage.removeItem(`browser-expanded-${type}`)
    }
  }, [expandedCard, type])


  const handleSort = (field) => {
    setSortFields(prev => {
      if (prev[0]?.field === field) {
        return [{ field, direction: prev[0].direction === 'asc' ? 'desc' : 'asc' }, ...prev.slice(1)]
      }
      const filtered = prev.filter(s => s.field !== field)
      return [{ field, direction: 'asc' }, ...filtered]
    })
  }

  const handleFilter = (filterType) => {
    if (filterType === 'tier') { setShowTierDropdown(!showTierDropdown); setShowTypeDropdown(false) }
    else if (filterType === 'type') { setShowTypeDropdown(!showTypeDropdown); setShowTierDropdown(false) }
  }

  const tierTooltip = selectedTiers.length === 0 ? 'All' : `${selectedTiers.length} selected`
  const typeTooltip = selectedTypes.length === 0 ? 'All' : `${selectedTypes.length} selected`
  const isTierFiltered = selectedTiers.length > 0
  const isTypeFiltered = selectedTypes.length > 0

  const handleTierSelect = (tier) => {
    setSelectedTiers(prev => prev.includes(tier) ? prev.filter(t => t !== tier) : [...prev, tier])
  }
  const handleTypeSelect = (t) => {
    setSelectedTypes(prev => prev.includes(t) ? prev.filter(v => v !== t) : [...prev, t])
  }

  const getDropdownStyle = (buttonRef) => {
    if (!buttonRef?.current) return {}
    const thEl = buttonRef.current.closest('th') || buttonRef.current
    const rect = thEl.getBoundingClientRect()
    const gutter = 8
    const left = Math.max(gutter, rect.left)
    const rightGutter = 8
    const maxLeft = window.innerWidth - rightGutter
    const clampedLeft = Math.min(left, maxLeft)
    // Position below the header cell, independent of scroll containers
    return { position: 'fixed', top: rect.bottom + 4, left: clampedLeft, zIndex: 99999 }
  }

  return {
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
  }
}


