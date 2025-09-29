import React, { useState, useEffect, useRef, useCallback } from 'react'
import { X, Plus, Minus, Users, Calculator } from 'lucide-react'
import Browser from './Browser'
import { useGameState } from '../state/state'

// Battle Points calculation based on Daggerheart rules
const calculateBaseBattlePoints = (pcCount) => (3 * pcCount) + 2

// Battle Points costs for different adversary types
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

// Battle Points adjustments
const BATTLE_POINT_ADJUSTMENTS = {
  lessDifficult: -1,
  twoOrMoreSolos: -2,
  increasedDamage: -2,
  lowerTierAdversary: 1,
  noBruisersHordesLeadersSolos: 1,
  moreDangerous: 2
}

const EncounterBuilder = ({ 
  isOpen, 
  onClose, 
  onAddAdversary,
  onAddAdversariesBulk,
  onAddEnvironment,
  onDeleteAdversary,
  onDeleteEnvironment,
  onDeleteCountdown,
  adversaries = [],
  environments = [],
  countdowns = [],
  savedEncounters = [],
  onSaveEncounter,
  onLoadEncounter,
  onDeleteEncounter
}) => {
  // Get party size and current encounter name from global state
  const { partySize, updatePartySize, currentEncounterName, updateCurrentEncounterName } = useGameState()
  const pcCount = partySize
  const setPcCount = updatePartySize
  
  // Encounter state
  const [battlePointsAdjustments, setBattlePointsAdjustments] = useState({
    lessDifficult: false,
    increasedDamage: false,
    moreDangerous: false
  })
  
  const [encounterItems, setEncounterItems] = useState([])
  const [encounterName, setEncounterName] = useState(currentEncounterName || 'Encounter')
  const [activeTab, setActiveTab] = useState('adversaries')
  const [loadedEncounterId, setLoadedEncounterId] = useState(null) // Track which encounter is loaded
  const [originalEncounterData, setOriginalEncounterData] = useState(null) // Track original data for change detection
  
  // Sync encounter name with global state
  useEffect(() => {
    if (isOpen && !loadedEncounterId) {
      setEncounterName(currentEncounterName || 'Encounter')
    }
  }, [isOpen, loadedEncounterId, currentEncounterName])
  
  // Check if current encounter has changes from original
  const hasChanges = () => {
    if (!originalEncounterData) return false
    
    return (
      encounterName !== originalEncounterData.name ||
      JSON.stringify(encounterItems) !== JSON.stringify(originalEncounterData.encounterItems) ||
      pcCount !== originalEncounterData.partySize ||
      JSON.stringify(battlePointsAdjustments) !== JSON.stringify(originalEncounterData.battlePointsAdjustments)
    )
  }
  
  // Check if there are any meaningful changes to preserve (items added, name changed, etc.)
  const hasMeaningfulChanges = () => {
    // If we have encounter items, there are changes
    if (encounterItems.length > 0) return true
    
    // If name is not the default "Encounter", there are changes
    if ((encounterName || '').trim() !== 'Encounter') return true
    
    // If we have a loaded encounter and there are changes (excluding party size), there are changes
    if (loadedEncounterId && hasChanges()) {
      // Check if changes are more than just party size differences
      if (originalEncounterData) {
        const currentItems = encounterItems.length
        const originalItems = originalEncounterData.encounterItems?.length || 0
        
        // If encounter items changed, that's meaningful
        if (currentItems !== originalItems) return true
        
        // If encounter name changed, that's meaningful
        if ((encounterName || '').trim() !== (originalEncounterData.name || '')) return true
        
        // If battle points adjustments changed, that's meaningful
        const currentAdjustments = JSON.stringify(battlePointsAdjustments)
        const originalAdjustments = JSON.stringify(originalEncounterData.battlePointsAdjustments || {})
        if (currentAdjustments !== originalAdjustments) return true
        
        // Party size changes alone are not meaningful
        return false
      }
      return true
    }
    
    return false
  }
  
  // Reusable button component for receipt actions
  const ReceiptButton = ({ onClick, children, variant = 'secondary', isConfirmation = false }) => {
    const isDanger = variant === 'danger' || (variant === 'secondary' && isConfirmation)
    const isPurple = variant === 'purple'
    
    return (
      <button
        onClick={onClick}
        style={{
          background: isDanger ? 'var(--danger)' : isPurple ? 'var(--purple)' : 'var(--bg-secondary)',
          border: isPurple ? 'none' : '1px solid var(--border)',
          color: isDanger || isPurple ? 'white' : 'var(--text-primary)',
          padding: '0.375rem 0.75rem',
          borderRadius: '4px',
          cursor: 'pointer',
          transition: 'background-color 0.2s',
          width: '70px',
          fontSize: '0.875rem'
        }}
      >
        {children}
      </button>
    )
  }
  
  // Track previous PC count to calculate group changes
  const prevPcCountRef = React.useRef(pcCount)
  
  // Function to find matching saved encounter by content only (for auto-loading)
  const findMatchingEncounterByContent = useCallback((items) => {
    if (!items || items.length === 0) return null
    
    // Try to find exact match by content only
    const matchingEncounter = savedEncounters.find(encounter => {
      if (encounter.encounterItems?.length !== items.length) return false
      
      // Check if all encounter items match by comparing base properties
      const normalizeItem = (item) => ({
        type: item.type,
        quantity: item.quantity,
        item: {
          name: item.item.baseName || item.item.name?.replace(/\s+\(\d+\)$/, '') || item.item.name,
          type: item.item.type,
          tier: item.item.tier
        }
      })
      
      const normalizedEncounterItems = encounter.encounterItems?.map(normalizeItem).sort((a, b) => 
        a.item.name.localeCompare(b.item.name) || a.item.type.localeCompare(b.item.type)
      )
      const normalizedCurrentItems = items.map(normalizeItem).sort((a, b) => 
        a.item.name.localeCompare(b.item.name) || a.item.type.localeCompare(b.item.type)
      )
      
      return JSON.stringify(normalizedEncounterItems) === JSON.stringify(normalizedCurrentItems)
    })
    
    return matchingEncounter || null
  }, [savedEncounters])

  // Load existing adversaries when encounter builder opens (only on initial open)
  React.useEffect(() => {
    if (isOpen && adversaries.length > 0 && encounterItems.length === 0) {
      // Group adversaries by base name and add them to encounter items
      const groupedAdversaries = {}
      adversaries.forEach(adversary => {
        const baseName = adversary.baseName || adversary.name?.replace(/\s+\(\d+\)$/, '') || adversary.name
        if (!groupedAdversaries[baseName]) {
          groupedAdversaries[baseName] = {
            type: 'adversary',
            item: adversary,
            quantity: 0
          }
        }
        groupedAdversaries[baseName].quantity += 1
      })
      
      // Convert to array and set encounter items
      const existingItems = Object.values(groupedAdversaries)
      setEncounterItems(existingItems)
      
      // Check if this matches a saved encounter and load it
      const matchingEncounter = findMatchingEncounterByContent(existingItems)
      if (matchingEncounter && !loadedEncounterId) {
        setLoadedEncounterId(matchingEncounter.id)
        setOriginalEncounterData({
          name: matchingEncounter.name || '',
          encounterItems: matchingEncounter.encounterItems || [],
          partySize: matchingEncounter.partySize || 4,
          battlePointsAdjustments: matchingEncounter.battlePointsAdjustments || {
            lessDifficult: false,
            increasedDamage: false,
            moreDangerous: false
          }
        })
        // Update the encounter name to match the saved encounter
        setEncounterName(matchingEncounter.name || 'Encounter')
        updateCurrentEncounterName(matchingEncounter.name || 'Encounter')
      }
    } else if (isOpen && adversaries.length === 0 && encounterItems.length === 0) {
      // Only clear encounter items when no adversaries exist AND no encounter items exist
      // This prevents clearing encounter items that have quantity 0 items
      setEncounterItems([])
    }
  }, [isOpen, findMatchingEncounterByContent, loadedEncounterId, updateCurrentEncounterName]) // Added dependencies
  
  // Calculate automatic adjustments based on encounter composition
  const automaticAdjustments = React.useMemo(() => {
    let adjustments = 0
    
    // Check for 2 or more Solo adversaries (only count those with quantity > 0)
    const soloCount = encounterItems
      .filter(item => item.type === 'adversary' && item.item.type === 'Solo' && item.quantity > 0)
      .reduce((sum, item) => sum + item.quantity, 0)
    if (soloCount >= 2) {
      adjustments += BATTLE_POINT_ADJUSTMENTS.twoOrMoreSolos
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
      adjustments += BATTLE_POINT_ADJUSTMENTS.noBruisersHordesLeadersSolos
    }
    
    
    return adjustments
  }, [encounterItems])
  
  // Calculate available battle points
  const baseBattlePoints = calculateBaseBattlePoints(pcCount)
  const manualAdjustments = Object.entries(battlePointsAdjustments)
    .filter(([_, enabled]) => enabled)
    .reduce((sum, [key, _]) => sum + BATTLE_POINT_ADJUSTMENTS[key], 0)
  const availableBattlePoints = baseBattlePoints + manualAdjustments + automaticAdjustments
  
  // Calculate spent battle points
  const spentBattlePoints = encounterItems.reduce((total, item) => {
    if (item.type === 'adversary') {
      const cost = BATTLE_POINT_COSTS[item.item.type] || 2 // Default to Standard cost
      
      // For Minions: quantity is already stored in groups (pcCount each)
      if (item.item.type === 'Minion') {
        return total + (Math.ceil(item.quantity / pcCount) * cost)
      }
      
      return total + (cost * item.quantity)
    }
    return total // Environments don't cost battle points
  }, 0)
  
  const remainingBattlePoints = availableBattlePoints - spentBattlePoints
  
  
  // Adjust minion quantities when PC count changes
  React.useEffect(() => {
    const prevPcCount = prevPcCountRef.current
    
    if (prevPcCount !== pcCount) {
      setEncounterItems(prev => prev.map(encounterItem => {
        if (encounterItem.type === 'adversary' && encounterItem.item.type === 'Minion') {
          // Calculate how many groups we had with the previous PC count
          const currentGroups = Math.ceil(encounterItem.quantity / prevPcCount)
          // Adjust quantity to maintain the same number of groups with new PC count
          const newQuantity = currentGroups * pcCount
          
          return {
            ...encounterItem,
            quantity: newQuantity
          }
        }
        return encounterItem
      }))
      
      // Update the ref for next time
      prevPcCountRef.current = pcCount
    }
  }, [pcCount])
  
  // Handle adding items to encounter with real-time sync
  const handleAddToEncounter = (itemData, type) => {
    const existingIndex = encounterItems.findIndex(
      item => item.item.id === itemData.id && item.type === type
    )
    
    // Special handling for Minions: add in increments of party size
    const incrementAmount = (itemData.type === 'Minion') ? pcCount : 1
    
    let newEncounterItems
    if (existingIndex >= 0) {
      // Increase quantity of existing item
      newEncounterItems = encounterItems.map((item, index) => 
        index === existingIndex 
          ? { ...item, quantity: item.quantity + incrementAmount }
          : item
      )
    } else {
      // Add new item
      newEncounterItems = [...encounterItems, {
        item: itemData,
        type: type,
        quantity: incrementAmount
      }]
    }
    
    // Update local state
    setEncounterItems(newEncounterItems)
    
    // Apply changes immediately to global state
    applyEncounterToGlobalState(newEncounterItems)
  }
  
  // Apply encounter items to global state in real-time
  const applyEncounterToGlobalState = (items) => {
    // Calculate the difference between current dashboard and desired encounter
    const currentAdversaries = adversaries || []
    const desiredAdversaries = []
    
    // Build desired adversary list from encounter items
    items.forEach(encounterItem => {
      for (let i = 0; i < encounterItem.quantity; i++) {
        if (encounterItem.type === 'adversary') {
          desiredAdversaries.push(encounterItem.item)
        }
      }
    })
    
    // Group current adversaries by base name
    const currentGroups = {}
    currentAdversaries.forEach(adv => {
      const baseName = adv.baseName || adv.name?.replace(/\s+\(\d+\)$/, '') || adv.name
      if (!currentGroups[baseName]) {
        currentGroups[baseName] = []
      }
      currentGroups[baseName].push(adv)
    })
    
    // Group desired adversaries by base name
    const desiredGroups = {}
    desiredAdversaries.forEach(adv => {
      const baseName = adv.baseName || adv.name?.replace(/\s+\(\d+\)$/, '') || adv.name
      if (!desiredGroups[baseName]) {
        desiredGroups[baseName] = []
      }
      desiredGroups[baseName].push(adv)
    })
    
    // Calculate what needs to be added or removed
    const adversariesToAdd = []
    const adversariesToRemove = []
    
    // Check each desired group
    Object.keys(desiredGroups).forEach(baseName => {
      const currentCount = currentGroups[baseName]?.length || 0
      const desiredCount = desiredGroups[baseName].length
      
      if (desiredCount > currentCount) {
        // Need to add more
        const toAdd = desiredCount - currentCount
        for (let i = 0; i < toAdd; i++) {
          adversariesToAdd.push(desiredGroups[baseName][0]) // Use first item as template
        }
      } else if (desiredCount < currentCount) {
        // Need to remove some - remove highest numbered ones first
        const toRemove = currentCount - desiredCount
        const currentGroup = currentGroups[baseName]
        
        // Sort by duplicate number (highest first)
        const sortedGroup = [...currentGroup].sort((a, b) => {
          const aNum = a.duplicateNumber || 1
          const bNum = b.duplicateNumber || 1
          return bNum - aNum // Descending order (highest first)
        })
        
        for (let i = 0; i < toRemove; i++) {
          adversariesToRemove.push(sortedGroup[i].id)
        }
      }
    })
    
    // Check for adversaries that should be completely removed
    Object.keys(currentGroups).forEach(baseName => {
      if (!desiredGroups[baseName]) {
        // This adversary type is not in the desired encounter, remove all (highest numbered first)
        const currentGroup = currentGroups[baseName]
        const sortedGroup = [...currentGroup].sort((a, b) => {
          const aNum = a.duplicateNumber || 1
          const bNum = b.duplicateNumber || 1
          return bNum - aNum // Descending order (highest first)
        })
        
        sortedGroup.forEach(adv => {
          adversariesToRemove.push(adv.id)
        })
      }
    })
    
    // Remove adversaries that are no longer needed
    adversariesToRemove.forEach(id => {
      onDeleteAdversary(id)
    })
    
    // Add new adversaries
    if (adversariesToAdd.length > 0) {
      onAddAdversariesBulk(adversariesToAdd)
    }
  }

  // Handle removing items from encounter with real-time sync
  const handleRemoveFromEncounter = (itemId, itemType) => {
    const newEncounterItems = (() => {
      const existingIndex = encounterItems.findIndex(
        item => item.item.id === itemId && item.type === itemType
      )
      
      if (existingIndex >= 0) {
        const item = encounterItems[existingIndex]
        
        // If quantity is already 0, this is the second click - remove entirely
        if (item.quantity === 0) {
          return encounterItems.filter((_, index) => index !== existingIndex)
        }
        
        // First click or subsequent clicks - decrease quantity
        // Special handling for Minions: remove in increments of party size
        const decrementAmount = (item.item.type === 'Minion') ? pcCount : 1
        const newQuantity = Math.max(0, item.quantity - decrementAmount)
        
        // Decrease quantity (can go to 0)
        return encounterItems.map((encounterItem, index) => 
          index === existingIndex 
            ? { ...encounterItem, quantity: newQuantity }
            : encounterItem
        )
      }
      return encounterItems
    })()
    
    // Update local state
    setEncounterItems(newEncounterItems)
    
    // Apply changes immediately to global state
    applyEncounterToGlobalState(newEncounterItems)
  }
  
  // Handle battle points adjustment changes
  const handleAdjustmentChange = (adjustment, value) => {
    setBattlePointsAdjustments(prev => ({
      ...prev,
      [adjustment]: value
    }))
  }
  

  // Function to find matching saved encounter based on current data
  const findMatchingEncounter = useCallback(() => {
    // Don't match blank encounters - they're not meaningful
    if (encounterItems.length === 0) return null
    
    const finalName = (encounterName || '').trim() || 'Encounter'
    
    // Try to find exact match by name and content
    const matchingEncounter = savedEncounters.find(encounter => {
      if (encounter.name !== finalName) return false
      if (encounter.encounterItems?.length !== encounterItems.length) return false
      
      // Check if all encounter items match
      const encounterItemsStr = JSON.stringify(encounter.encounterItems?.sort())
      const currentItemsStr = JSON.stringify([...encounterItems].sort())
      
      return encounterItemsStr === currentItemsStr
    })
    
    return matchingEncounter?.id || null
  }, [savedEncounters, encounterName, encounterItems])

  // Auto-save function that saves to current encounter or creates new one
  const autoSave = useCallback(() => {
    // Use current name as-is (allow empty names)
    let finalName = (encounterName || '').trim()
    
    // Try to find matching encounter if we don't have a loaded ID
    let targetEncounterId = loadedEncounterId
    if (!targetEncounterId) {
      targetEncounterId = findMatchingEncounter()
    }
    
    // If encounter is empty and has default/empty name, delete the encounter if it exists
    if (encounterItems.length === 0 && (!finalName || finalName === 'Encounter') && targetEncounterId) {
      onDeleteEncounter(targetEncounterId)
      setLoadedEncounterId(null)
      setOriginalEncounterData(null)
      return
    }
    
    const encounterData = {
      name: finalName,
      encounterItems: encounterItems,
      partySize: pcCount,
      battlePointsAdjustments: battlePointsAdjustments
    }
    
    // If we have a target encounter, update it; otherwise create new
    if (targetEncounterId) {
      encounterData.id = targetEncounterId
      const savedId = onSaveEncounter(encounterData)
      setLoadedEncounterId(savedId) // Keep the same ID
    } else {
      const newId = onSaveEncounter(encounterData)
      setLoadedEncounterId(newId) // Set the new ID
    }
    
    // Store current state as original for change detection
    setOriginalEncounterData({
      name: finalName,
      encounterItems: encounterItems,
      partySize: pcCount,
      battlePointsAdjustments: battlePointsAdjustments
    })
  }, [encounterItems, encounterName, pcCount, battlePointsAdjustments, loadedEncounterId, onSaveEncounter, findMatchingEncounter, onDeleteEncounter])

  // Auto-save effect - save whenever encounter items change
  useEffect(() => {
    // Only auto-save if we have a loaded encounter and there are changes
    if (loadedEncounterId && hasChanges()) {
      const timeoutId = setTimeout(() => {
        autoSave()
      }, 2000) // Debounce auto-save by 2 seconds
      
      return () => clearTimeout(timeoutId)
    } else if (!loadedEncounterId && encounterItems.length > 0 && encounterName && encounterName.trim() !== '') {
      // Only auto-save new encounters when they have items AND a valid name
      const timeoutId = setTimeout(() => {
        autoSave()
      }, 2000) // Debounce auto-save by 2 seconds
      
      return () => clearTimeout(timeoutId)
    }
  }, [encounterItems, loadedEncounterId, encounterName, battlePointsAdjustments, pcCount]) // Removed autoSave from dependencies

  // Create a new blank encounter
  const handleNew = () => {
    // Only create new encounter if there are meaningful changes to preserve
    if (!hasMeaningfulChanges()) return
    
    // Clear all encounter items
    setEncounterItems([])
    
    // Reset encounter name to default
    setEncounterName('Encounter')
    updateCurrentEncounterName('Encounter')
    
    // Clear loaded encounter tracking
    setLoadedEncounterId(null)
    setOriginalEncounterData(null)
    
    // Clear all adversaries from global state
    adversaries.forEach(adversary => {
      onDeleteAdversary(adversary.id)
    })
    
    // Clear all environments from global state
    environments.forEach(environment => {
      onDeleteEnvironment(environment.id)
    })
    
    // Clear all countdowns from global state
    countdowns.forEach(countdown => {
      onDeleteCountdown(countdown.id)
    })
    
    // Don't create an encounter immediately - let auto-save handle it when user adds items
    // This prevents the conflict where we create then immediately delete the encounter
  }


  // Load encounter
  const handleLoadEncounter = (encounterId) => {
    const encounter = onLoadEncounter(encounterId)
    if (encounter) {
      const loadedItems = encounter.encounterItems || []
      setEncounterItems(loadedItems)
      setPcCount(encounter.partySize || 4)
      setBattlePointsAdjustments(encounter.battlePointsAdjustments || {
        lessDifficult: false,
        increasedDamage: false,
        moreDangerous: false
      })
      setEncounterName(encounter.name || '')
      updateCurrentEncounterName(encounter.name || '')
      setLoadedEncounterId(encounterId)
      
      // Store original data for change detection
      setOriginalEncounterData({
        name: encounter.name || '',
        encounterItems: encounter.encounterItems || [],
        partySize: encounter.partySize || 4,
        battlePointsAdjustments: encounter.battlePointsAdjustments || {
          lessDifficult: false,
          increasedDamage: false,
          moreDangerous: false
        }
      })
      
      // Apply the loaded encounter immediately to global state
      applyEncounterToGlobalState(loadedItems)
    }
  }

  // Delete encounter
  const handleDeleteEncounter = (encounterId) => {
    onDeleteEncounter(encounterId)
    
    // If we're deleting the currently loaded encounter, clear the receipt
    if (loadedEncounterId === encounterId) {
      setEncounterItems([])
      setEncounterName('Encounter')
      updateCurrentEncounterName('Encounter')
      setLoadedEncounterId(null)
      setOriginalEncounterData(null)
      
      // Clear all adversaries from global state
      adversaries.forEach(adversary => {
        onDeleteAdversary(adversary.id)
      })
      
      // Clear all environments from global state
      environments.forEach(environment => {
        onDeleteEnvironment(environment.id)
      })
      
      // Clear all countdowns from global state
      countdowns.forEach(countdown => {
        onDeleteCountdown(countdown.id)
      })
    }
  }

  
  if (!isOpen) return null
  
  return (
    <div 
      onClick={onClose}
      className="encounter-builder-modal"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(8px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '12px'
      }}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: 'var(--bg-primary)',
          border: '2px solid var(--border)',
          borderRadius: '12px',
          width: '100%',
          maxWidth: '1200px',
          height: 'calc(100vh - 24px)',
          maxHeight: '800px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
        }}
      >
      {/* Unified Top Bar - Tabs on Left, Receipt Buttons on Right */}
      <div className="encounter-top-bar" style={{
        flex: '0 0 auto',
        display: 'flex',
        alignItems: 'center',
        height: '39px',
        backgroundColor: 'var(--bg-primary)'
      }}>
        {/* Left Side - Tabs (same width as browser below) */}
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center'
        }}>
          <button
            onClick={() => setActiveTab('adversaries')}
            style={{
              flex: 1,
              background: activeTab === 'adversaries' ? 'var(--gray-900)' : 'transparent',
              border: 'none',
              borderBottom: '1px solid var(--border)',
              color: 'var(--text-primary)',
              padding: '0.75rem 1rem',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: activeTab === 'adversaries' ? '500' : '400',
              transition: 'all 0.2s ease',
              position: 'relative',
              borderRight: '1px solid var(--border)'
            }}
          >
            Adversaries
          </button>
          <button
            onClick={() => setActiveTab('encounters')}
            style={{
              flex: 1,
              background: activeTab === 'encounters' ? 'var(--gray-900)' : 'transparent',
              border: 'none',
              borderBottom: '1px solid var(--border)',
              color: 'var(--text-primary)',
              padding: '0.75rem 1rem',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: activeTab === 'encounters' ? '500' : '400',
              transition: 'all 0.2s ease',
              position: 'relative',
              borderRight: '1px solid var(--border)'
            }}
          >
            Encounters
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            style={{
              flex: 1,
              background: activeTab === 'custom' ? 'var(--gray-900)' : 'transparent',
              border: 'none',
              borderBottom: '1px solid var(--border)',
              color: 'var(--text-primary)',
              padding: '0.75rem 1rem',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: activeTab === 'custom' ? '500' : '400',
              transition: 'all 0.2s ease',
              position: 'relative'
            }}
          >
            Custom Adversary
          </button>
        </div>
        
                {/* Right Side - Encounter Name Field */}
                <div className="encounter-receipt-buttons" style={{
                  flex: '0 0 350px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'center',
                  borderLeft: '1px solid var(--border)',
                  height: '100%',
                  padding: '1rem 0.75rem'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    width: '100%'
                  }}>
                    <input
                      type="text"
                      value={encounterName}
                      onChange={(e) => {
                        setEncounterName(e.target.value)
                        updateCurrentEncounterName(e.target.value)
                      }}
                      placeholder="Encounter Name"
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        border: '1px solid var(--border)',
                        borderRadius: '4px',
                        backgroundColor: 'var(--bg-primary)',
                        color: 'var(--text-primary)',
                        fontSize: '16px',
                        textAlign: 'left',
                        outline: 'none',
                        transition: 'all 0.2s ease'
                      }}
                    />
                    <ReceiptButton 
                      onClick={handleNew}
                      variant="secondary"
                      style={{ 
                        whiteSpace: 'nowrap', 
                        minWidth: 'fit-content', 
                        flexShrink: 0,
                        opacity: hasMeaningfulChanges() ? 1 : 0.5,
                        cursor: hasMeaningfulChanges() ? 'pointer' : 'not-allowed'
                      }}
                    >
                      New
                    </ReceiptButton>
                  </div>
                </div>
      </div>

      {/* Main Content Area */}
      <div className="encounter-builder-content" style={{
        flex: 1,
        display: 'flex',
        overflow: 'hidden'
      }}>
        {/* Left Panel - Browser Content Below Tabs */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          borderTop: '1px solid var(--border)'
        }}>
          <Browser
            type="adversary"
            onAddItem={(itemData) => handleAddToEncounter(itemData, 'adversary')}
            encounterItems={encounterItems}
            pcCount={pcCount}
            showContainer={false}
            savedEncounters={savedEncounters}
            onLoadEncounter={handleLoadEncounter}
            onDeleteEncounter={handleDeleteEncounter}
            activeTab={activeTab}
          />
        </div>
        
        {/* Right Panel - Receipt Below Buttons */}
        <div className="encounter-right-panel" style={{
          flex: '0 0 350px',
          borderLeft: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
          }}>
            
            {/* Battle Points Calculator Content */}
            <div className="receipt-content" style={{ 
              padding: '1rem', 
              display: 'flex',
              flexDirection: 'column',
              height: '100%'
            }}>
              {/* Receipt Items - Scrollable */}
              <div style={{ 
                flex: 1,
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'flex-start',
                overflowY: 'auto',
                marginBottom: '0.75rem'
              }}>
                
                  {/* Party Members Row */}
                <div className="receipt-item" style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0.25rem 0',
                  borderBottom: '1px solid var(--border)',
                  flexShrink: 0
                }}>
                  <div className="receipt-controls" style={{ width: '60px', textAlign: 'center', position: 'relative' }}>
                    <button
                      onClick={() => setPcCount(Math.max(1, pcCount - 1))}
                      style={{
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border)',
                        color: 'var(--text-primary)',
                        borderRadius: '3px',
                        padding: '0',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minWidth: '18px',
                        height: '18px',
                        fontSize: '0.7rem',
                        position: 'absolute',
                        left: '0',
                        top: '50%',
                        transform: 'translateY(-50%)'
                      }}
                    >
                      <Minus size={10} />
                    </button>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                      {pcCount}
                    </span>
                    <button
                      onClick={() => setPcCount(pcCount + 1)}
                      style={{
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border)',
                        color: 'var(--text-primary)',
                        borderRadius: '3px',
                        padding: '0',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minWidth: '18px',
                        height: '18px',
                        fontSize: '0.7rem',
                        position: 'absolute',
                        right: '0',
                        top: '50%',
                        transform: 'translateY(-50%)'
                      }}
                    >
                      <Plus size={10} />
                    </button>
                  </div>
                  <div style={{ flex: 1, marginLeft: '1rem' }}>
                    <span style={{ color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                      Party Size
                    </span>
                  </div>
                  <div style={{ width: '120px', textAlign: 'right' }}>
                  </div>
                </div>
                
                {/* Individual Adversary Items */}
                {encounterItems.map((encounterItem) => {
                  if (encounterItem.type !== 'adversary') return null
                  
                  return (
                    <div key={`${encounterItem.item.id}-${encounterItem.type}`} className="receipt-item" style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '0.25rem 0',
                      borderBottom: '1px solid var(--border)',
                      flexShrink: 0
                    }}>
                      <div className="receipt-controls" style={{ width: '60px', textAlign: 'center', position: 'relative' }}>
                        <button
                          onClick={() => handleRemoveFromEncounter(encounterItem.item.id, encounterItem.type)}
                          style={{
                            background: encounterItem.quantity === 0 ? 'var(--danger)' : 'var(--bg-secondary)',
                            border: encounterItem.quantity === 0 ? 'none' : '1px solid var(--border)',
                            color: encounterItem.quantity === 0 ? 'white' : 'var(--text-primary)',
                            borderRadius: '3px',
                            padding: '0',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minWidth: '18px',
                            height: '18px',
                            fontSize: '0.7rem',
                            position: 'absolute',
                            left: '0',
                            top: '50%',
                            transform: 'translateY(-50%)'
                          }}
                        >
                          {encounterItem.quantity === 0 ? <X size={10} /> : <Minus size={10} />}
                        </button>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                          {encounterItem.quantity}
                        </span>
                        <button
                          onClick={() => handleAddToEncounter(encounterItem.item, encounterItem.type)}
                          style={{
                            background: 'var(--bg-secondary)',
                            border: '1px solid var(--border)',
                            color: 'var(--text-primary)',
                            borderRadius: '3px',
                            padding: '0',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minWidth: '18px',
                            height: '18px',
                            fontSize: '0.7rem',
                            position: 'absolute',
                            right: '0',
                            top: '50%',
                            transform: 'translateY(-50%)'
                          }}
                        >
                          <Plus size={10} />
                        </button>
                      </div>
                      <div style={{ flex: 1, marginLeft: '1rem' }}>
                        <span style={{ color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                          {encounterItem.item.baseName || encounterItem.item.name?.replace(/\s+\(\d+\)$/, '') || encounterItem.item.name}
                        </span>
                      </div>
                      <div style={{ width: '80px', textAlign: 'right' }}>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                          {encounterItem.item.type}
                        </span>
                      </div>
                    </div>
                  )
                })}

                {/* Balance Row - moved to bottom */}
                <div className="receipt-item" style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0.25rem 0',
                  borderBottom: '1px solid var(--border)',
                  flexShrink: 0
                }}>
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                    <span style={{ color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                      Balance
                    </span>
                  </div>
                  <div style={{ width: '120px', textAlign: 'right', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                    <span style={{
                      color: spentBattlePoints > availableBattlePoints ? 'var(--danger)' : 
                             spentBattlePoints === availableBattlePoints ? 'var(--purple)' : 
                             'var(--success)',
                      fontWeight: 600
                    }}>
                      {spentBattlePoints > availableBattlePoints ? 
                        `+${spentBattlePoints - availableBattlePoints}` : 
                        availableBattlePoints - spentBattlePoints === 0 ? 
                          '0' : 
                          `-${availableBattlePoints - spentBattlePoints}`
                      }
                    </span>
                  </div>
                </div>
            </div>
            
            </div>
            
            {/* Encounter Name Field - Below Receipt in Vertical Mode */}
            <div className="encounter-receipt-buttons-vertical" style={{
              display: 'none', // Hidden by default, shown in vertical mode via CSS
              padding: '0.75rem',
              borderTop: '1px solid var(--border)',
              backgroundColor: 'var(--bg-primary)'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                width: '100%'
              }}>
                <input
                  type="text"
                  value={encounterName}
                  onChange={(e) => {
                    setEncounterName(e.target.value)
                    updateCurrentEncounterName(e.target.value)
                  }}
                  placeholder="Encounter Name"
                  style={{
                    flex: 1,
                    padding: '0.5rem',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                    backgroundColor: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    fontSize: '0.875rem'
                  }}
                />
                <ReceiptButton 
                  onClick={handleNew}
                  variant="secondary"
                  style={{ 
                    whiteSpace: 'nowrap', 
                    minWidth: 'fit-content', 
                    flexShrink: 0,
                    opacity: hasMeaningfulChanges() ? 1 : 0.5,
                    cursor: hasMeaningfulChanges() ? 'pointer' : 'not-allowed'
                  }}
                >
                  New
                </ReceiptButton>
              </div>
            </div>
            
          </div>

        </div>
      </div>
    </div>
  )
}

export default EncounterBuilder