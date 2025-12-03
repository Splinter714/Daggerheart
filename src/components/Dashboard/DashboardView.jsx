import React, { useState, useCallback, useRef } from 'react'
import { useGameState } from '../../state/state'
import { DASHBOARD_GAP } from './constants'
import PWAInstallPrompt from './PWAInstallPrompt'
import EncounterBuilder from './EncounterBuilder'
import { getDefaultAdversaryValues } from '../Adversaries/adversaryDefaults'
import { useAppKeyboardShortcuts } from './useAppKeyboardShortcuts'
import { 
  calculateBaseBattlePoints, 
  calculateSpentBattlePoints, 
  calculateAutomaticAdjustments
} from './BattlePointsCalculator'
import TopBarControls from './TopBarControls'
import BrowserOverlay from './BrowserOverlay'
import EntityColumns from './EntityColumns'
import { useMinionSync } from './hooks/useMinionSync'
import { useColumnLayout } from './hooks/useColumnLayout'
import ErrorBoundary from './ErrorBoundary'
import { useBrowserOverlay } from './hooks/useBrowserOverlay'
import { useSmoothScroll } from './hooks/useSmoothScroll'
import { useEntityGroups } from './hooks/useEntityGroups'
import { useAdversaryAddition } from './hooks/useAdversaryAddition'
import './DashboardView.css'

// Main Dashboard View Component
const DashboardContent = () => {
  const { 
    adversaries, 
    environments,
    countdowns,
    fear,
    savedEncounters,
    partySize,
    customContent,
    updatePartySize,
    updateFear,
    createAdversary,
    createAdversariesBulk,
    updateAdversary,
    deleteAdversary,
    addCustomAdversary,
    updateCustomAdversary,
    createEnvironment,
    updateEnvironment,
    deleteEnvironment,
    updateCountdown,
    deleteCountdown,
    saveEncounter,
    loadEncounter,
    deleteEncounter
  } = useGameState()
  
  const pcCount = partySize || 4
  
  // Dashboard state
  const [encounterBuilderOpen, setEncounterBuilderOpen] = useState(false)
  const [editingAdversaryId, setEditingAdversaryId] = useState(null) // ID of adversary being edited, or null
  const [browserActiveTab, setBrowserActiveTab] = useState('adversaries') // Active tab in browser overlay
  const [selectedCustomAdversaryId, setSelectedCustomAdversaryId] = useState(null) // Selected custom adversary in browser
  
  // Column layout state
  const [newCards, setNewCards] = useState(new Set()) // Track newly added cards for fade-in animation
  const [removingCardSpacer, setRemovingCardSpacer] = useState(null) // Track card being removed with spacer: { baseName, groupIndex }
  const [spacerShrinking, setSpacerShrinking] = useState(false) // Track if spacer should shrink
  const scrollContainerRef = useRef(null)

  useMinionSync(adversaries, pcCount, createAdversariesBulk, deleteAdversary)

  const { columnWidth } = useColumnLayout(scrollContainerRef)

  const { browserOpenAtPosition, handleOpenBrowser, handleCloseBrowser } = useBrowserOverlay({
    scrollContainerRef,
    columnWidth,
    onCloseReset: () => setBrowserActiveTab('adversaries')
  })

  const smoothScrollTo = useSmoothScroll(scrollContainerRef)

  const handleCloseEncounterBuilder = useCallback(() => {
    setEncounterBuilderOpen(false)
  }, [])


  const { entityGroups, getEntityGroups } = useEntityGroups(adversaries, countdowns)

  // Keyboard shortcuts
  useAppKeyboardShortcuts({
    browserOpenAtPosition,
    handleCloseBrowser,
    handleOpenBrowser,
    getEntityGroups,
    fear,
    updateFear
  })

  const handleAddAdversaryFromBrowser = useAdversaryAddition({
    entityGroups,
    pcCount,
    scrollContainerRef,
    createAdversariesBulk,
    createAdversary,
    setNewCards,
    getEntityGroups,
    smoothScrollTo,
    browserOpenAtPosition,
    columnWidth
  })

  // Handle creating a new custom adversary
  const handleCreateCustomAdversary = useCallback(() => {
    // Create a blank custom adversary and add it to the dashboard
    // Use default stats based on tier and type
    const tier = 1
    const type = 'Standard'
    const defaultStats = getDefaultAdversaryValues(tier, type)
    
    const defaults = {
      name: '',
      baseName: '',
      tier: tier,
      type: type,
      description: '',
      motives: '',
      difficulty: defaultStats.difficulty,
      thresholds: defaultStats.thresholds,
      hpMax: defaultStats.hpMax,
      stressMax: defaultStats.stressMax,
      atk: defaultStats.atk,
      weapon: '',
      range: defaultStats.range,
      damage: defaultStats.damage,
      experience: [],
      features: [],
      source: 'Homebrew',
      hp: 0,
      stress: 0,
      isVisible: true
    }
    
    // Create the adversary
    createAdversary(defaults)
    
    // After a brief delay, find the newly created adversary and set it to edit mode
    // We look for an adversary with empty/Unknown name and Homebrew source
    setTimeout(() => {
      const updatedGroups = getEntityGroups()
      // Find the adversary with empty name and Homebrew source (the one we just created)
      for (const group of updatedGroups) {
        if (group.type === 'adversary') {
          const newAdversary = group.instances.find(i => 
            i.source === 'Homebrew' && 
            (!i.baseName || i.baseName.trim() === '' || i.baseName === 'Unknown')
          )
          if (newAdversary && !editingAdversaryId) {
            setEditingAdversaryId(newAdversary.id)
            
            // Scroll to the new card
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                if (scrollContainerRef.current) {
                  const groupIndex = updatedGroups.findIndex(g => 
                    g.instances.some(i => i.id === newAdversary.id)
                  )
                  if (groupIndex >= 0) {
                    // Account for left padding: DASHBOARD_GAP + groupIndex * (columnWidth + DASHBOARD_GAP)
                    const cardPosition = DASHBOARD_GAP + groupIndex * (columnWidth + DASHBOARD_GAP)
                    smoothScrollTo(cardPosition, 600, 'new-custom-adversary')
                  }
                }
              })
            })
            break
          }
        }
      }
    }, 100) // Small delay to ensure state has updated
  }, [createAdversary, getEntityGroups, columnWidth, smoothScrollTo, editingAdversaryId])

  // Handle editing an adversary
  const handleEditAdversary = useCallback((adversaryId) => {
    setEditingAdversaryId(adversaryId)
  }, [])

  // Handle canceling edit/create
  const handleCancelEdit = useCallback(() => {
    setEditingAdversaryId(null)
  }, [])

  // Handle saving custom adversary (create or update)
  const handleSaveCustomAdversary = useCallback(async (adversaryData, id) => {
    if (id) {
      // Find the adversary being edited to check if it's a custom adversary
      const editingAdversary = adversaries.find(a => a.id === id)
      const isCustomAdversary = editingAdversary?.source === 'Homebrew' || editingAdversary?.isCustom
      
      if (isCustomAdversary) {
        // Find the custom content entry by customContentId stored in dashboard instance, or by original baseName
        const customContentId = editingAdversary?.customContentId
        const originalBaseName = editingAdversary?.baseName // Original baseName before potential change
        const customAdversary = customContentId 
          ? customContent?.adversaries?.find(adv => adv.id === customContentId)
          : customContent?.adversaries?.find(adv => 
              adv.baseName === originalBaseName && (adv.source === 'Homebrew' || adv.isCustom)
            )
        
        if (customAdversary) {
          // Update custom adversary in custom content storage (for browser)
          // Ensure name is set for custom content (use baseName, no duplicate numbers)
          const customContentData = {
            ...adversaryData,
            name: adversaryData.baseName || adversaryData.name
          }
          updateCustomAdversary(customAdversary.id, customContentData)
          
          // Update all instances on dashboard with the same baseName (or customContentId)
          const baseName = adversaryData.baseName || editingAdversary?.baseName
          adversaries.forEach(adv => {
            if (adv.customContentId === customContentId || 
                (adv.baseName === baseName && (adv.source === 'Homebrew' || adv.isCustom))) {
              updateAdversary(adv.id, { 
                ...adversaryData, 
                customContentId: customAdversary.id // Ensure customContentId is set
              })
            }
          })
        } else {
          // Not found in custom content - might be a new custom adversary, add it
          // Ensure name is set for custom content
          const customContentData = {
            ...adversaryData,
            name: adversaryData.baseName || adversaryData.name
          }
          const newCustomId = addCustomAdversary(customContentData)
          
          // Update all instances on dashboard with the same baseName to include customContentId
          const baseName = adversaryData.baseName || editingAdversary?.baseName
          adversaries.forEach(adv => {
            if (adv.baseName === baseName && (adv.source === 'Homebrew' || adv.isCustom)) {
              updateAdversary(adv.id, { 
                ...adversaryData, 
                customContentId: newCustomId 
              })
            }
          })
        }
      } else {
        // Stock adversary - create new custom copy (Save As)
        // Find all instances of this stock adversary to replace them
        const originalBaseName = editingAdversary?.baseName
        const stockInstances = adversaries.filter(adv => {
          // Match by baseName
          const matchesBaseName = adv.baseName === originalBaseName
          // Stock adversaries don't have source='Homebrew' or isCustom=true
          const isStock = !adv.source || (adv.source !== 'Homebrew' && !adv.isCustom)
          return matchesBaseName && isStock
        })
        
        // Ensure name is set for custom content
        const customContentData = {
          ...adversaryData,
          name: adversaryData.baseName || adversaryData.name
        }
        const customId = addCustomAdversary(customContentData)
        
        // Delete all stock instances
        stockInstances.forEach(stockInstance => {
          deleteAdversary(stockInstance.id)
        })
        
        // Create new custom instances to replace them (same quantity)
        // Use setTimeout to ensure deletes complete before creating new ones
        setTimeout(() => {
          const instancesToCreate = stockInstances.map(() => ({
            ...adversaryData,
            source: 'Homebrew',
            isCustom: true,
            customContentId: customId,
            hp: 0,
            stress: 0
          }))
          
          if (instancesToCreate.length > 0) {
            createAdversariesBulk(instancesToCreate)
          }
        }, 0)
      }
      setEditingAdversaryId(null)
      // Browser will auto-refresh via useEffect watching customContent
    } else if (editingAdversaryId) {
      // Editing a stock adversary without id passed - create new custom copy
      // Ensure name is set for custom content
      const customContentData = {
        ...adversaryData,
        name: adversaryData.baseName || adversaryData.name
      }
      const customId = addCustomAdversary(customContentData)
      const newId = createAdversary({ 
        ...adversaryData, 
        source: 'Homebrew', 
        isCustom: true,
        customContentId: customId 
      })
      setEditingAdversaryId(null)
      // Browser will auto-refresh via useEffect watching customContent
      return newId
    } else {
      // Creating new custom adversary from blank
      // First save to custom content storage
      // Ensure name is set for custom content
      const customContentData = {
        ...adversaryData,
        name: adversaryData.baseName || adversaryData.name
      }
      const customId = addCustomAdversary(customContentData)
      // Then create instance on dashboard (createAdversary will generate its own ID)
      const newId = createAdversary({ 
        ...adversaryData, 
        source: 'Homebrew', 
        isCustom: true,
        customContentId: customId 
      })
      // Browser will auto-refresh via useEffect watching customContent
      return newId
    }
  }, [
    editingAdversaryId,
    adversaries,
    customContent,
    createAdversary,
    updateAdversary,
    addCustomAdversary,
    updateCustomAdversary,
    createAdversariesBulk,
    deleteAdversary
  ])

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
  const automaticAdjustments = calculateAutomaticAdjustments(encounterItems)
  const availableBattlePoints = calculateBaseBattlePoints(pcCount) + automaticAdjustments
  const spentBattlePoints = calculateSpentBattlePoints(encounterItems, pcCount)

  // Scroll handling - just track position, let CSS handle snapping
  const scrollTimeoutRef = useRef(null)
  
  const handleScroll = useCallback((e) => {
    // Clear existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current)
    }
    
    // After scrolling stops, ensure scroll-snap is enabled
    scrollTimeoutRef.current = setTimeout(() => {
      const container = e.target
      if (container && container.style.scrollSnapType === 'none') {
        container.style.scrollSnapType = 'x mandatory'
      }
    }, 150) // Wait 150ms after last scroll event
  }, [])

  // Remove auto-open encounter builder logic - replaced with empty state button

  return (
    <div 
      className="app dashboard-root"
      style={{ '--dashboard-gap': `${DASHBOARD_GAP}px` }}
      onClick={(e) => {
        // Clear selection when clicking on app background
        if (e.target === e.currentTarget) {
          // Handle any global click behavior here if needed
        }
      }}
    >

      <TopBarControls
        fearValue={fear?.value || 0}
        onUpdateFear={updateFear}
        isBrowserOpen={browserOpenAtPosition !== null}
        onToggleBrowser={() => {
              if (browserOpenAtPosition !== null) {
                handleCloseBrowser()
              } else {
                handleOpenBrowser(entityGroups.length)
              }
            }}
      />

      {/* Main Dashboard Content */}
      <div className="dashboard-main">
        <BrowserOverlay
          isOpen={browserOpenAtPosition !== null}
          columnWidth={columnWidth}
          onClose={handleCloseBrowser}
          onCreateCustomAdversary={handleCreateCustomAdversary}
                  pcCount={pcCount}
          updatePartySize={updatePartySize}
          availableBattlePoints={availableBattlePoints}
          spentBattlePoints={spentBattlePoints}
          browserActiveTab={browserActiveTab}
          onTabChange={setBrowserActiveTab}
                  savedEncounters={savedEncounters}
          loadEncounter={loadEncounter}
          deleteEncounter={deleteEncounter}
                  selectedCustomAdversaryId={selectedCustomAdversaryId}
                  onSelectCustomAdversary={setSelectedCustomAdversaryId}
          onAddAdversaryFromBrowser={handleAddAdversaryFromBrowser}
                />
        <EntityColumns
          entityGroups={entityGroups}
          columnWidth={columnWidth}
          scrollContainerRef={scrollContainerRef}
          onScroll={handleScroll}
          newCards={newCards}
          removingCardSpacer={removingCardSpacer}
          spacerShrinking={spacerShrinking}
          browserOpenAtPosition={browserOpenAtPosition}
          editingAdversaryId={editingAdversaryId}
          handleSaveCustomAdversary={handleSaveCustomAdversary}
          handleCancelEdit={handleCancelEdit}
          updateAdversary={updateAdversary}
          updateEnvironment={updateEnvironment}
          updateCountdown={updateCountdown}
              adversaries={adversaries}
          handleEditAdversary={handleEditAdversary}
          createAdversary={createAdversary}
          createAdversariesBulk={createAdversariesBulk}
          pcCount={pcCount}
          smoothScrollTo={smoothScrollTo}
          getEntityGroups={getEntityGroups}
          deleteAdversary={deleteAdversary}
          setRemovingCardSpacer={setRemovingCardSpacer}
          setSpacerShrinking={setSpacerShrinking}
                />
      </div>

      {/* Encounter Builder Modal */}
      <EncounterBuilder
        isOpen={encounterBuilderOpen}
        onClose={handleCloseEncounterBuilder}
        onAddAdversary={(itemData) => {
          createAdversary(itemData)
        }}
        onAddAdversariesBulk={(adversariesArray) => {
          createAdversariesBulk(adversariesArray)
        }}
        onAddEnvironment={(itemData) => {
          createEnvironment(itemData)
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
  const { isLoaded } = useGameState()

  if (!isLoaded) {
    return (
      <div className="app loading-state">
        <div className="loading-placeholder" aria-hidden="true" />
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <DashboardContent />
    </ErrorBoundary>
  )
}

export default DashboardView
