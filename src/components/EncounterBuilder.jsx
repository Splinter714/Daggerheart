import React, { useState, useEffect } from 'react'
import { X, Plus, Minus, Users, Calculator } from 'lucide-react'
import Browser from './Browser'

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
  onAddEnvironment,
  adversaries = [],
  environments = []
}) => {
  // Encounter state
  const [pcCount, setPcCount] = useState(4)
  const [playerTier, setPlayerTier] = useState(1)
  const [battlePointsAdjustments, setBattlePointsAdjustments] = useState({
    lessDifficult: false,
    increasedDamage: false,
    moreDangerous: false
  })
  
  const [encounterItems, setEncounterItems] = useState([])
  const [selectedType, setSelectedType] = useState('adversary')
  
  // Track previous PC count to calculate group changes
  const prevPcCountRef = React.useRef(pcCount) // 'adversary' or 'environment'
  
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
    
    // Check for lower tier adversaries (only count those with quantity > 0)
    const hasLowerTierAdversaries = encounterItems.some(item => 
      item.type === 'adversary' && item.item.tier && item.item.tier < playerTier && item.quantity > 0
    )
    if (hasLowerTierAdversaries) {
      adjustments += BATTLE_POINT_ADJUSTMENTS.lowerTierAdversary
    }
    
    return adjustments
  }, [encounterItems, playerTier])
  
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
  
  // Handle adding items to encounter
  const handleAddToEncounter = (itemData, type) => {
    const existingIndex = encounterItems.findIndex(
      item => item.item.id === itemData.id && item.type === type
    )
    
    // Special handling for Minions: add in increments of party size
    const incrementAmount = (itemData.type === 'Minion') ? pcCount : 1
    
    if (existingIndex >= 0) {
      // Increase quantity of existing item
      setEncounterItems(prev => prev.map((item, index) => 
        index === existingIndex 
          ? { ...item, quantity: item.quantity + incrementAmount }
          : item
      ))
    } else {
      // Add new item
      setEncounterItems(prev => [...prev, {
        item: itemData,
        type: type,
        quantity: incrementAmount
      }])
    }
  }
  
  // Handle removing items from encounter
  const handleRemoveFromEncounter = (itemId, itemType) => {
    setEncounterItems(prev => {
      const existingIndex = prev.findIndex(
        item => item.item.id === itemId && item.type === itemType
      )
      
      if (existingIndex >= 0) {
        const item = prev[existingIndex]
        // Special handling for Minions: remove in increments of party size
        const decrementAmount = (item.item.type === 'Minion') ? pcCount : 1
        
        if (item.quantity > 0) {
          // Decrease quantity (can go to 0)
          return prev.map((encounterItem, index) => 
            index === existingIndex 
              ? { ...encounterItem, quantity: Math.max(0, encounterItem.quantity - decrementAmount) }
              : encounterItem
          )
        } else {
          // Remove entirely when quantity is 0
          return prev.filter((_, index) => index !== existingIndex)
        }
      }
      return prev
    })
  }
  
  // Handle battle points adjustment changes
  const handleAdjustmentChange = (adjustment, value) => {
    setBattlePointsAdjustments(prev => ({
      ...prev,
      [adjustment]: value
    }))
  }
  
  // Create the encounter
  const handleCreateEncounter = () => {
    encounterItems.forEach(encounterItem => {
      for (let i = 0; i < encounterItem.quantity; i++) {
        if (encounterItem.type === 'adversary') {
          onAddAdversary(encounterItem.item)
        } else if (encounterItem.type === 'environment') {
          onAddEnvironment(encounterItem.item)
        }
      }
    })
    
    // Reset and close
    setEncounterItems([])
    onClose()
  }
  
  if (!isOpen) return null
  
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <div style={{
        backgroundColor: 'var(--bg-primary)',
        border: '2px solid var(--border)',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '1200px',
        height: '90vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1rem',
          borderBottom: '1px solid var(--border)',
          backgroundColor: 'var(--bg-secondary)',
          flexShrink: 0
        }}>
          <h2 style={{ 
            margin: 0, 
            color: 'var(--text-primary)',
            fontSize: '1.5rem',
            fontWeight: 600
          }}>
            Encounter Builder
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-primary)',
              fontSize: '1.5rem',
              cursor: 'pointer',
              padding: '0.5rem',
              borderRadius: 'var(--radius-sm)',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--bg-hover)'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            title="Close Encounter Builder"
          >
            <X size={24} />
          </button>
        </div>
        
        {/* Main Content */}
        <div style={{
          display: 'flex',
          flex: 1,
          overflow: 'hidden'
        }}>
          {/* Left Panel - Encounter Browser */}
          <div style={{
            width: '300px',
            borderRight: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: 'var(--bg-secondary)'
          }}>
            {/* Encounter Browser Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '1rem',
              borderBottom: '1px solid var(--border)',
              backgroundColor: 'var(--bg-secondary)'
            }}>
              <h3 style={{ 
                margin: 0, 
                color: 'var(--text-primary)',
                fontSize: '1.1rem'
              }}>
                Saved Encounters
              </h3>
            </div>
            
            {/* Encounter List */}
            <div style={{
              flex: 1,
              padding: '1rem',
              overflowY: 'auto'
            }}>
              <div style={{
                textAlign: 'center',
                color: 'var(--text-secondary)',
                fontStyle: 'italic',
                padding: '2rem 0'
              }}>
                No saved encounters yet
              </div>
            </div>
          </div>
          
          {/* Center Panel - Adversary/Environment Browser */}
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            {/* Browser Tabs */}
            <div style={{
              display: 'flex',
              borderBottom: '1px solid var(--border)',
              backgroundColor: 'var(--bg-secondary)'
            }}>
              <button
                onClick={() => setSelectedType('adversary')}
                style={{
                  background: selectedType === 'adversary' ? 'var(--bg-primary)' : 'transparent',
                  border: 'none',
                  color: 'var(--text-primary)',
                  padding: '1rem',
                  cursor: 'pointer',
                  borderBottom: selectedType === 'adversary' ? '2px solid var(--purple)' : '2px solid transparent',
                  transition: 'all 0.2s'
                }}
              >
                Adversaries
              </button>
              <button
                onClick={() => setSelectedType('environment')}
                style={{
                  background: selectedType === 'environment' ? 'var(--bg-primary)' : 'transparent',
                  border: 'none',
                  color: 'var(--text-primary)',
                  padding: '1rem',
                  cursor: 'pointer',
                  borderBottom: selectedType === 'environment' ? '2px solid var(--purple)' : '2px solid transparent',
                  transition: 'all 0.2s'
                }}
              >
                Environments
              </button>
            </div>
            
            {/* Browser Content */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
              <Browser
                type={selectedType}
                onAddItem={(itemData) => handleAddToEncounter(itemData, selectedType)}
                onCancel={onClose}
                encounterItems={encounterItems}
                pcCount={pcCount}
                playerTier={playerTier}
              />
            </div>
          </div>
          
          {/* Right Panel - Battle Points Calculator */}
          <div style={{
            width: '350px',
            borderLeft: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: 'var(--bg-secondary)'
          }}>
            {/* Battle Points Calculator Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '1rem',
              borderBottom: '1px solid var(--border)',
              backgroundColor: 'var(--bg-secondary)'
            }}>
              <Calculator size={20} />
              <h3 style={{ 
                margin: 0, 
                color: 'var(--text-primary)',
                fontSize: '1.1rem'
              }}>
                Battle Points Calculator
              </h3>
            </div>
            
            {/* Battle Points Calculator Content */}
            <div style={{ padding: '1rem', overflowY: 'auto' }}>
              {/* Battle Points Receipt */}
              <div style={{
                background: 'var(--bg-primary)',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                padding: '1rem'
              }}>
                <h4 style={{
                  margin: '0 0 1rem 0',
                  color: 'var(--text-primary)',
                  fontSize: '1rem',
                  textAlign: 'center'
                }}>
                  Battle Points Calculation
                </h4>
                
                {/* Receipt Items */}
                <div style={{ marginBottom: '0.75rem' }}>
                  {/* Player Tier Row */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0.25rem 0',
                    borderBottom: '1px solid var(--border)'
                  }}>
                    <div style={{ flex: 1 }}>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        Party Tier
                      </span>
                    </div>
                    <div style={{ width: '70px', textAlign: 'center', position: 'relative' }}>
                      <button
                        onClick={() => setPlayerTier(Math.max(1, playerTier - 1))}
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
                        ({playerTier})
                      </span>
                      <button
                        onClick={() => setPlayerTier(Math.min(4, playerTier + 1))}
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
                    <div style={{ width: '60px', textAlign: 'right' }}>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        
                      </span>
                    </div>
                  </div>
                  
                  {/* Party Size Row */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0.25rem 0',
                    borderBottom: '1px solid var(--border)'
                  }}>
                    <div style={{ flex: 1 }}>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        Party Size
                      </span>
                    </div>
                    <div style={{ width: '70px', textAlign: 'center', position: 'relative' }}>
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
                        ({pcCount})
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
                    <div style={{ width: '60px', textAlign: 'right' }}>
                      <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                        +{calculateBaseBattlePoints(pcCount)}
                      </span>
                    </div>
                  </div>
                  
                  {/* Individual Adversary Costs */}
                  {encounterItems.map((encounterItem) => {
                    if (encounterItem.type !== 'adversary') return null
                    const cost = BATTLE_POINT_COSTS[encounterItem.item.type] || 2
                    
                    // Special handling for Minions: cost is per group equal to PC count
                    const totalCost = encounterItem.item.type === 'Minion' 
                      ? Math.ceil(encounterItem.quantity / pcCount) * cost
                      : cost * encounterItem.quantity
                    
                    return (
                      <div key={`${encounterItem.item.id}-${encounterItem.type}`} style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '0.25rem 0',
                        borderBottom: '1px solid var(--border)'
                      }}>
                        <div style={{ flex: 1 }}>
                          <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                            {encounterItem.item.name}
                          </span>
                        </div>
                        <div style={{ width: '70px', textAlign: 'center', position: 'relative' }}>
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
                            (×{encounterItem.quantity})
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
                        <div style={{ width: '60px', textAlign: 'right' }}>
                          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                            -{totalCost}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                  
                  {/* Automatic Adjustments */}
                  {automaticAdjustments !== 0 && (() => {
                    const reasons = []
                    if (encounterItems.filter(item => item.type === 'adversary' && item.item.type === 'Solo' && item.quantity > 0).reduce((sum, item) => sum + item.quantity, 0) >= 2) {
                      reasons.push('2+ Solo')
                    }
                    if (!encounterItems.some(item => item.type === 'adversary' && ['Bruiser', 'Horde', 'Leader', 'Solo'].includes(item.item.type) && item.quantity > 0)) {
                      reasons.push('no major threats')
                    }
                    if (encounterItems.some(item => item.type === 'adversary' && item.item.tier && item.item.tier < playerTier && item.quantity > 0)) {
                      reasons.push('Lower tier adversaries')
                    }
                    
                    return (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '0.25rem 0',
                        borderBottom: '1px solid var(--border)'
                      }}>
                        <div style={{ flex: 1 }}>
                          <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                            {reasons.join(', ')}
                          </span>
                        </div>
                        <div style={{ width: '70px', textAlign: 'center' }}></div>
                        <div style={{ width: '60px', textAlign: 'right' }}>
                          <span style={{
                            color: 'var(--text-primary)',
                            fontWeight: 600
                          }}>
                            {automaticAdjustments >= 0 ? '+' : ''}{automaticAdjustments}
                          </span>
                        </div>
                      </div>
                    )
                  })()}
                </div>
                
                {/* Points Remaining */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0.25rem 0',
                  borderBottom: '1px solid var(--border)'
                }}>
                  <div style={{ flex: 1 }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                      Remaining Budget
                    </span>
                  </div>
                  <div style={{ width: '70px', textAlign: 'center' }}></div>
                  <div style={{ width: '60px', textAlign: 'right' }}>
                    <span style={{
                      color: remainingBattlePoints < 0 ? 'var(--danger)' : 'var(--text-primary)',
                      fontWeight: 600
                    }}>
                      {remainingBattlePoints}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '0.5rem',
          padding: '1rem',
          borderTop: '1px solid var(--border)',
          backgroundColor: 'var(--bg-secondary)'
        }}>
          <button
            onClick={onClose}
            style={{
              background: 'var(--bg-primary)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--bg-hover)'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--bg-primary)'}
          >
            Cancel
          </button>
          <button
            onClick={handleCreateEncounter}
            disabled={encounterItems.length === 0}
            style={{
              background: encounterItems.length === 0 ? 'var(--gray-600)' : 'var(--purple)',
              border: 'none',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              cursor: encounterItems.length === 0 ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              opacity: encounterItems.length === 0 ? 0.6 : 1
            }}
            onMouseEnter={(e) => {
              if (encounterItems.length > 0) {
                e.target.style.backgroundColor = 'var(--purple-dark)'
              }
            }}
            onMouseLeave={(e) => {
              if (encounterItems.length > 0) {
                e.target.style.backgroundColor = 'var(--purple)'
              }
            }}
          >
            Create Encounter
          </button>
        </div>
      </div>
    </div>
  )
}

export default EncounterBuilder
