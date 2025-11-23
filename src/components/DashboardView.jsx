import React, { useState, useEffect, useCallback, startTransition, useRef } from 'react'
import { useGameState } from '../state/state'
import Pips from './Pips'
import FloatingMenu from './FloatingMenu'
import Bar from './Toolbars'
import GameCard from './GameCard'
import Browser from './Browser'
import PWAInstallPrompt from './PWAInstallPrompt'
import Panel from './Panels'
import EncounterBuilder from './EncounterBuilder'
import { Plus, X, Minus } from 'lucide-react'

// Battle Points calculation (from EncounterBuilder)
const calculateBaseBattlePoints = (pcCount) => (3 * pcCount) + 2

const BATTLE_POINT_COSTS = {
  'Minion': 1,
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

const BATTLE_POINT_ADJUSTMENTS = {
  twoOrMoreSolos: -2,
  noBruisersHordesLeadersSolos: 1
}

// Simple Error Boundary for debugging
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-md text-red">
          <h3>Something went wrong:</h3>
          <pre>{this.state.error?.toString()}</pre>
          <button className="btn-base btn-text" onClick={() => this.setState({ hasError: false, error: null })}>
            Try again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

// Main Dashboard View Component
const DashboardContent = () => {
  const { 
    adversaries, 
    environments,
    countdowns,
    fear,
    savedEncounters,
    partySize,
    updateFear,
    createAdversary,
    createAdversariesBulk,
    updateAdversary,
    deleteAdversary,
    createEnvironment,
    updateEnvironment,
    deleteEnvironment,
    createCountdown,
    updateCountdown,
    deleteCountdown,
    advanceCountdown,
    saveEncounter,
    loadEncounter,
    deleteEncounter
  } = useGameState()
  
  const pcCount = partySize || 4
  
  // Dashboard state
  const [isMobile, setIsMobile] = useState(false)
  const [encounterBuilderOpen, setEncounterBuilderOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [isClearMode, setIsClearMode] = useState(false)
  const [showLongTermCountdowns, setShowLongTermCountdowns] = useState(true)
  const [lastAddedItemType, setLastAddedItemType] = useState(null)
  const [browserOpenAtPosition, setBrowserOpenAtPosition] = useState(null) // null or index where browser should appear
  
  // Column layout state
  const [containerWidth, setContainerWidth] = useState(0)
  const [scrollPosition, setScrollPosition] = useState(0)
  const [isScrolling, setIsScrolling] = useState(false)
  const scrollContainerRef = useRef(null)

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      const mediaQuery = window.matchMedia('(max-width: 800px)')
      setIsMobile(mediaQuery.matches)
    }
    
    checkMobile()
    const mediaQuery = window.matchMedia('(max-width: 800px)')
    mediaQuery.addEventListener('change', checkMobile)
    return () => mediaQuery.removeEventListener('change', checkMobile)
  }, [])

  // Column layout calculations - dynamic sizing to always show full columns
  const gap = 12
  const getMinColumnWidth = (columnCount) => {
    if (columnCount === 1) return 200  // Smaller minimum for single column
    return 350  // Higher minimum for multiple columns
  }
  
  const calculateColumnLayout = (width) => {
    if (width <= 0) return { visibleColumns: 1, columnWidth: getMinColumnWidth(1) }
    
    const padding = gap * 2
    const availableWidth = width - padding
    
    // Try different column counts to find the best fit
    let bestLayout = { visibleColumns: 1, columnWidth: availableWidth }
    
    for (let columns = 1; columns <= 5; columns++) {
      const totalGapWidth = (columns - 1) * gap
      const columnWidth = (availableWidth - totalGapWidth) / columns
      
      // Check if this column width meets our minimum requirement AND fits perfectly
      if (columnWidth >= getMinColumnWidth(columns)) {
        // Calculate the total width this layout would take
        const totalWidth = columns * columnWidth + totalGapWidth
        
        // Only use this layout if it fits exactly within available width
        if (totalWidth <= availableWidth) {
          // Prefer more columns (narrower panels) - keep the last valid layout
          bestLayout = { visibleColumns: columns, columnWidth }
        }
      }
    }
    
    // Ensure we never exceed the available width
    const totalWidth = bestLayout.visibleColumns * bestLayout.columnWidth + (bestLayout.visibleColumns - 1) * gap
    if (totalWidth > availableWidth) {
      // Fall back to fewer columns
      bestLayout = { visibleColumns: 1, columnWidth: availableWidth }
    }
    
    return bestLayout
  }
  
  const { visibleColumns, columnWidth } = calculateColumnLayout(containerWidth)
  
  // Handle container resize
  useEffect(() => {
    const handleResize = () => {
      setContainerWidth(window.innerWidth)
    }
    
    handleResize() // Initial calculation
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Encounter Builder handlers
  const handleOpenEncounterBuilder = () => {
    setEncounterBuilderOpen(true)
  }

  const handleToggleEncounterBuilder = () => {
    setEncounterBuilderOpen(!encounterBuilderOpen)
  }

  const handleCloseEncounterBuilder = useCallback(() => {
    setEncounterBuilderOpen(false)
  }, [])

  // Handle opening browser at a specific position
  const handleOpenBrowser = useCallback((position) => {
    setBrowserOpenAtPosition(position)
  }, [])

  // Handle closing browser
  const handleCloseBrowser = useCallback(() => {
    setBrowserOpenAtPosition(null)
  }, [])

  // Handle adding adversary from browser
  const handleAddAdversaryFromBrowser = useCallback((itemData) => {
    createAdversary(itemData)
    setLastAddedItemType('adversary')
    // Browser stays open as overlay, no need to manage scroll position
  }, [createAdversary])

  // Convert adversaries to encounter items format for battle points calculation
  const getEncounterItems = useCallback(() => {
    const grouped = {}
    adversaries.forEach(adversary => {
      const baseName = adversary.baseName || adversary.name?.replace(/\s+\(\d+\)$/, '') || adversary.name
      if (!grouped[baseName]) {
        grouped[baseName] = {
          type: 'adversary',
          item: adversary,
          quantity: 0
        }
      }
      grouped[baseName].quantity += 1
    })
    return Object.values(grouped)
  }, [adversaries])

  // Calculate battle points for balance display
  const encounterItems = getEncounterItems()
  const baseBattlePoints = calculateBaseBattlePoints(pcCount)
  
  // Calculate automatic adjustments
  const soloCount = encounterItems
    .filter(item => item.item.type === 'Solo' && item.quantity > 0)
    .reduce((sum, item) => sum + item.quantity, 0)
  const hasMajorThreats = encounterItems.some(item => 
    item.item.type && ['Bruiser', 'Horde', 'Leader', 'Solo'].includes(item.item.type) && item.quantity > 0
  )
  
  let automaticAdjustments = 0
  if (soloCount >= 2) {
    automaticAdjustments += BATTLE_POINT_ADJUSTMENTS.twoOrMoreSolos
  }
  if (!hasMajorThreats) {
    automaticAdjustments += BATTLE_POINT_ADJUSTMENTS.noBruisersHordesLeadersSolos
  }
  
  const availableBattlePoints = baseBattlePoints + automaticAdjustments
  
  const spentBattlePoints = encounterItems.reduce((total, item) => {
    if (item.type === 'adversary') {
      const cost = BATTLE_POINT_COSTS[item.item.type] || 2
      if (item.item.type === 'Minion') {
        return total + (Math.ceil(item.quantity / pcCount) * cost)
      }
      return total + (cost * item.quantity)
    }
    return total
  }, 0)

  // Scroll handling - just track position, let CSS handle snapping
  const handleScroll = useCallback((e) => {
    setScrollPosition(e.target.scrollLeft)
  }, [])

  // Touch gesture handling - simplified
  const handleTouchStart = useCallback(() => {
    setIsScrolling(true)
  }, [])

  const handleTouchEnd = useCallback(() => {
    setTimeout(() => setIsScrolling(false), 100)
  }, [])

  // Group entities by type for dashboard columns
  const getEntityGroups = () => {
    const groups = {}
    
    // Group adversaries by base name (excluding duplicate numbers)
    adversaries.forEach(adversary => {
      const baseName = adversary.baseName || adversary.name?.replace(/\s+\(\d+\)$/, '') || adversary.name
      if (!groups[baseName]) {
        groups[baseName] = {
          type: 'adversary',
          baseName: baseName,
          instances: []
        }
      }
      groups[baseName].instances.push(adversary)
    })

    // TODO: Group environments by name (not yet implemented)
    // environments.forEach(environment => {
    //   if (!groups[environment.name]) {
    //     groups[environment.name] = {
    //       type: 'environment',
    //       baseName: environment.name,
    //       instances: []
    //     }
    //   }
    //   groups[environment.name].instances.push(environment)
    // })

    // Add countdowns as individual columns
    countdowns.forEach(countdown => {
      groups[`countdown-${countdown.id}`] = {
        type: 'countdown',
        baseName: countdown.name,
        instances: [countdown]
      }
    })

    return Object.values(groups)
  }

  const entityGroups = getEntityGroups()

  // Remove auto-open encounter builder logic - replaced with empty state button

  // Calculate total width needed for all columns
  const totalColumns = entityGroups.length
  const totalWidth = totalColumns * columnWidth + (totalColumns - 1) * gap + (gap * 2)

  return (
    <div 
      className="app"
      onClick={(e) => {
        // Clear selection when clicking on app background
        if (e.target === e.currentTarget) {
          // Handle any global click behavior here if needed
        }
      }}
    >

      {/* Top Bar with Fear and Add Adversaries Button */}
      <Bar position="top">
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          width: '100%',
          justifyContent: 'space-between',
          padding: '0 1rem'
        }}>
          <Pips
            type="fear"
            value={fear?.value || 0}
            maxValue={12}
            onChange={updateFear}
            showTooltip={false}
            enableBoundaryClick={true}
            clickContainerWidth="100%"
            centerPips={true}
          />
          <button
            onClick={() => {
              if (browserOpenAtPosition !== null) {
                handleCloseBrowser()
              } else {
                handleOpenBrowser(entityGroups.length)
              }
            }}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: browserOpenAtPosition !== null ? 'var(--purple)' : 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              color: browserOpenAtPosition !== null ? 'white' : 'var(--text-primary)',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s ease',
              flexShrink: 0
            }}
            onMouseEnter={(e) => {
              if (browserOpenAtPosition === null) {
                e.target.style.borderColor = 'var(--purple)'
                e.target.style.backgroundColor = 'var(--bg-hover)'
              }
            }}
            onMouseLeave={(e) => {
              if (browserOpenAtPosition === null) {
                e.target.style.borderColor = 'var(--border)'
                e.target.style.backgroundColor = 'var(--bg-secondary)'
              }
            }}
          >
            <Plus size={16} />
            <span>Add Adversaries</span>
          </button>
        </div>
      </Bar>

      {/* Floating Menu */}
      <FloatingMenu
        onToggle={handleToggleEncounterBuilder}
        isOpen={encounterBuilderOpen}
      />

      {/* Main Dashboard Content */}
      <div className="main-content" style={{ 
        position: 'relative',
        width: '100%'
      }}>
        {/* Browser Overlay - appears on top when open */}
        {browserOpenAtPosition !== null && (
          <div style={{
            position: 'absolute',
            top: `${gap}px`,
            right: `${gap}px`,
            bottom: `${gap}px`,
            width: `${columnWidth}px`,
            backgroundColor: 'var(--bg-primary)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            zIndex: 100,
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '-4px 0 12px rgba(0, 0, 0, 0.3)',
            overflow: 'hidden'
          }}>
            <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', minHeight: 0, display: 'flex', flexDirection: 'column' }}>
              <Browser
                type="adversary"
                onAddItem={handleAddAdversaryFromBrowser}
                showContainer={false}
                activeTab="adversaries"
                autoFocus={true}
                hideImportExport={true}
                onClose={handleCloseBrowser}
                searchPlaceholder="Search adversaries"
              />
            </div>
            
            {/* Balance display at bottom */}
            <div style={{
              flexShrink: 0,
              borderTop: '1px solid var(--border)',
              backgroundColor: 'var(--bg-primary)',
              padding: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span style={{ color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: '500' }}>
                Balance
              </span>
              <span style={{
                color: spentBattlePoints > availableBattlePoints ? 'var(--danger)' : 
                       spentBattlePoints === availableBattlePoints ? 'var(--purple)' : 
                       'var(--success)',
                fontWeight: 600,
                fontSize: '0.9rem'
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
        )}
        <div 
          ref={scrollContainerRef}
          className="dashboard-scroll-container" 
          style={{ 
            display: 'flex', 
            flexDirection: 'row', 
            overflowX: 'auto', 
            overflowY: 'hidden',
            padding: `0 ${gap}px`,
            scrollSnapType: 'x mandatory',
            height: '100%',
            width: '100%'
          }}
          onScroll={handleScroll}
        >
        {entityGroups.length === 0 ? (
          // Empty state when no entities exist
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            width: '100%',
            padding: '2rem'
          }}>
            <button
              onClick={handleOpenEncounterBuilder}
              style={{
                backgroundColor: 'transparent',
                color: 'var(--text-secondary)',
                border: '2px dashed var(--border)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem 2rem',
                fontSize: '1rem',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.borderColor = 'var(--purple)'
                e.target.style.color = 'var(--purple)'
              }}
              onMouseLeave={(e) => {
                e.target.style.borderColor = 'var(--border)'
                e.target.style.color = 'var(--text-secondary)'
              }}
            >
              Create Encounter
            </button>
          </div>
        ) : (
          // Normal entity groups display
          entityGroups.map((group, index) => (
          <Panel 
            key={`${group.type}-${group.baseName}`}
            className="invisible-scrollbar"
            style={{ 
              width: `${columnWidth + gap}px`, // Include padding in width
              flexShrink: 0,
              flexGrow: 0,
              flex: 'none',
              paddingLeft: `${gap}px`, // Space before each card
              paddingRight: '0',
              paddingTop: `${gap}px`, // Space above each card
              paddingBottom: `${gap}px`, // Space below each card
              scrollSnapAlign: 'start',
              overflowY: 'auto',
              overflowX: 'hidden'
            }}
          >
            <GameCard
              type={group.type}
              item={{ 
                ...group.instances[0], 
                name: group.baseName,
                // Reset instance-specific state so the expanded card doesn't show defeated state
                hp: 0,
                stress: 0,
                isDead: false
              }} // Use first instance as template but reset state
              mode="expanded"
              instances={group.instances} // Pass all instances to embed mini-cards
              onApplyDamage={group.type === 'adversary' ? (id, damage, currentHp, maxHp) => {
                const instance = group.instances.find(i => i.id === id)
                if (instance) {
                  updateAdversary(id, { hp: Math.min(instance.hpMax || 1, (instance.hp || 0) + damage) })
                }
              } : undefined}
              onApplyHealing={group.type === 'adversary' ? (id, healing, currentHp) => {
                const instance = group.instances.find(i => i.id === id)
                if (instance) {
                  updateAdversary(id, { hp: Math.max(0, (instance.hp || 0) - healing) })
                }
              } : undefined}
              onApplyStressChange={group.type === 'adversary' ? (id, stress) => updateAdversary(id, { stress: Math.max(0, Math.min(group.instances.find(i => i.id === id)?.stressMax || 6, (group.instances.find(i => i.id === id)?.stress || 0) + stress)) }) : undefined}
              onUpdate={group.type === 'adversary' ? updateAdversary : group.type === 'environment' ? updateEnvironment : updateCountdown}
              adversaries={adversaries}
              showAddRemoveButtons={browserOpenAtPosition !== null && group.type === 'adversary'}
              onAddInstance={group.type === 'adversary' ? (item) => createAdversary(item) : undefined}
              onRemoveInstance={group.type === 'adversary' ? (itemId) => {
                // Find highest numbered instance and remove it
                const instances = group.instances.sort((a, b) => {
                  const aNum = a.duplicateNumber || 1
                  const bNum = b.duplicateNumber || 1
                  return bNum - aNum
                })
                if (instances.length > 0) {
                  deleteAdversary(instances[0].id)
                }
              } : undefined}
            />
          </Panel>
        ))
        )}
        </div>
      </div>

      {/* Encounter Builder Modal */}
      <EncounterBuilder
        isOpen={encounterBuilderOpen}
        onClose={handleCloseEncounterBuilder}
        onAddAdversary={(itemData) => {
          createAdversary(itemData)
          setLastAddedItemType('adversary')
        }}
        onAddAdversariesBulk={(adversariesArray) => {
          createAdversariesBulk(adversariesArray)
          setLastAddedItemType('adversary')
        }}
        onAddEnvironment={(itemData) => {
          createEnvironment(itemData)
          setLastAddedItemType('environment')
        }}
        onDeleteAdversary={deleteAdversary}
        onDeleteEnvironment={deleteEnvironment}
        onDeleteCountdown={deleteCountdown}
        adversaries={adversaries}
        environments={environments}
        countdowns={countdowns}
        savedEncounters={savedEncounters}
        onSaveEncounter={saveEncounter}
        onLoadEncounter={loadEncounter}
        onDeleteEncounter={deleteEncounter}
      />

      {/* PWA Install Prompt */}
      <PWAInstallPrompt />
    </div>
  )
}

// Dashboard wrapper with providers
const DashboardView = () => {
  return (
    <ErrorBoundary>
      <DashboardContent />
    </ErrorBoundary>
  )
}

export default DashboardView
