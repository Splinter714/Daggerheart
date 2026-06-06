import React, { useState, useCallback, useRef, useEffect } from 'react'
import { useGameState } from '../../state/state'
import { DASHBOARD_GAP } from './constants'
import PWAInstallPrompt from './PWAInstallPrompt'
import EncounterBuilder from './EncounterBuilder'
import { useAppKeyboardShortcuts } from './useAppKeyboardShortcuts'
import {
  calculateBaseBattlePoints,
  calculateSpentBattlePoints,
  calculateAutomaticAdjustments
} from './BattlePointsCalculator'
import RightColumn from './RightColumn'
import EntityColumns from './EntityColumns'
import CustomAdversaryCreator from '../Adversaries/CustomAdversaryCreator'
import { useMinionSync } from './hooks/useMinionSync'
import { useColumnLayout } from './hooks/useColumnLayout'
import ErrorBoundary from './ErrorBoundary'
import { useBrowserOverlay } from './hooks/useBrowserOverlay'
import { useSmoothScroll } from './hooks/useSmoothScroll'
import { useEntityGroups } from './hooks/useEntityGroups'
import { useAdversaryAddition } from './hooks/useAdversaryAddition'
import NavRail, { RAIL_SIZE } from './NavRail'
import './DashboardView.css'

// Main Dashboard View Component
const DashboardContent = () => {
  const {
    adversaries,
    adversaryGroups,
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
  const [adversaryCreatorOpen, setAdversaryCreatorOpen] = useState(false)
  const [editingAdversaryId, setEditingAdversaryId] = useState(null)
  const [browserActiveTab, setBrowserActiveTab] = useState('adversaries')
  const [selectedCustomAdversaryId, setSelectedCustomAdversaryId] = useState(null)
  const [rightColumnMode, setRightColumnMode] = useState('browser') // 'browser' | 'info' | 'receipt'

  // Narrow screen detection for NavRail placement
  const [isNarrow, setIsNarrow] = useState(false)
  const dashboardRootRef = useRef(null)
  useEffect(() => {
    const el = dashboardRootRef.current
    if (!el) return
    const observer = new ResizeObserver(([entry]) => {
      setIsNarrow(entry.contentRect.width < 760)
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // Column layout state
  const [newCards, setNewCards] = useState(new Set())
  const [removingCardSpacer, setRemovingCardSpacer] = useState(null)
  const [spacerShrinking, setSpacerShrinking] = useState(false)
  const scrollContainerRef = useRef(null)

  useMinionSync(adversaryGroups, pcCount, createAdversariesBulk, deleteAdversary)

  const { columnWidth } = useColumnLayout(scrollContainerRef)

  const { browserOpenAtPosition, handleOpenBrowser, handleCloseBrowser } = useBrowserOverlay({
    scrollContainerRef,
    columnWidth,
    onCloseReset: () => { setBrowserActiveTab('adversaries'); setRightColumnMode('browser') }
  })

  const smoothScrollTo = useSmoothScroll(scrollContainerRef)

  const handleCloseEncounterBuilder = useCallback(() => {
    setEncounterBuilderOpen(false)
  }, [])

  const { entityGroups, getEntityGroups } = useEntityGroups(adversaryGroups, countdowns)

  const openRightColumn = useCallback((mode) => {
    setRightColumnMode(mode)
    handleOpenBrowser(entityGroups.length)
  }, [handleOpenBrowser, entityGroups])

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

  const navPlacement = isNarrow ? 'bottom' : 'right'
  const railPadding = isNarrow
    ? { paddingBottom: `${RAIL_SIZE}px` }
    : { paddingRight: `${RAIL_SIZE}px` }

  const rightColumnOpen = browserOpenAtPosition !== null

  const navActiveId = adversaryCreatorOpen
    ? 'create'
    : rightColumnOpen
    ? rightColumnMode === 'receipt' ? 'receipt' : rightColumnMode === 'info' ? 'info' : 'browse'
    : null

  const handleNavAction = useCallback((id) => {
    if (id === 'browse') {
      if (rightColumnOpen && rightColumnMode === 'browse') {
        handleCloseBrowser()
      } else {
        setAdversaryCreatorOpen(false)
        setRightColumnMode('browser')
        if (!rightColumnOpen) handleOpenBrowser(entityGroups.length)
      }
    } else if (id === 'create') {
      handleCloseBrowser()
      setAdversaryCreatorOpen(v => !v)
    } else if (id === 'receipt') {
      if (rightColumnOpen && rightColumnMode === 'receipt') {
        handleCloseBrowser()
      } else {
        setAdversaryCreatorOpen(false)
        openRightColumn('receipt')
      }
    } else if (id === 'info') {
      if (rightColumnOpen && rightColumnMode === 'info') {
        handleCloseBrowser()
      } else {
        setAdversaryCreatorOpen(false)
        openRightColumn('info')
      }
    }
  }, [rightColumnOpen, rightColumnMode, handleCloseBrowser, handleOpenBrowser, openRightColumn, entityGroups])

  // On mobile, hide NavRail when creator is open (creator has its own bottom tab bar)
  const showNavRail = !(isNarrow && adversaryCreatorOpen)

  return (
    <div
      ref={dashboardRootRef}
      className="app dashboard-root"
      style={{ '--dashboard-gap': `${DASHBOARD_GAP}px`, ...railPadding }}
    >
      {/* Main Dashboard Content */}
      <div className="dashboard-main">
        {rightColumnOpen && (
          <RightColumn
            mode={rightColumnMode}
            columnWidth={columnWidth}
            onClose={handleCloseBrowser}
            browserActiveTab={browserActiveTab}
            onTabChange={setBrowserActiveTab}
            savedEncounters={savedEncounters}
            loadEncounter={loadEncounter}
            deleteEncounter={deleteEncounter}
            selectedCustomAdversaryId={selectedCustomAdversaryId}
            onSelectCustomAdversary={setSelectedCustomAdversaryId}
            onAddAdversaryFromBrowser={handleAddAdversaryFromBrowser}
            pcCount={pcCount}
            updatePartySize={updatePartySize}
            availableBattlePoints={availableBattlePoints}
            spentBattlePoints={spentBattlePoints}
          />
        )}
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
          onOpenBrowser={() => {
            if (!rightColumnOpen) openRightColumn('browser')
          }}
        />
      </div>

      {/* Custom Adversary Creator — full-screen takeover */}
      {adversaryCreatorOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, backgroundColor: 'var(--bg-primary)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
            <CustomAdversaryCreator
              onSave={(adversaryData, id) => {
                if (id) {
                  updateCustomAdversary(id, adversaryData)
                } else {
                  addCustomAdversary(adversaryData)
                }
                setAdversaryCreatorOpen(false)
              }}
              onCancelEdit={() => setAdversaryCreatorOpen(false)}
              embedded={false}
              autoFocus
            />
          </div>
        </div>
      )}

      {/* Encounter Builder Modal */}
      <EncounterBuilder
        isOpen={encounterBuilderOpen}
        onClose={handleCloseEncounterBuilder}
        onAddAdversary={(itemData) => { createAdversary(itemData) }}
        onAddAdversariesBulk={(adversariesArray) => { createAdversariesBulk(adversariesArray) }}
        onAddEnvironment={(itemData) => { createEnvironment(itemData) }}
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

      <PWAInstallPrompt />

      {showNavRail && (
        <NavRail
          placement={navPlacement}
          activeId={navActiveId}
          onAction={handleNavAction}
        />
      )}
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
