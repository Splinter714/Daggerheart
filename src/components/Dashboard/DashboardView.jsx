import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import { useGameState } from '../../state/state'
import { DASHBOARD_GAP } from './constants'
import PWAInstallPrompt from './PWAInstallPrompt'
import { useAppKeyboardShortcuts } from './useAppKeyboardShortcuts'
import {
  calculateBaseBattlePoints,
  calculateSpentBattlePoints,
  calculateAutomaticAdjustments,
  calculateAvailableBattlePoints,
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
import { useDashboardSortGroup } from './hooks/useDashboardSortGroup'
import NavRail, { RAIL_SIZE } from './NavRail'
import SortGroupPopover from './SortGroupPopover'
import './DashboardView.css'

// Main Dashboard View Component
const DashboardContent = () => {
  const {
    adversaries,
    adversaryGroups,
    environments,
    countdowns,
    fear,
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
    updateEnvironment,
    updateCountdown,
  } = useGameState()

  const pcCount = partySize || 4

  // Dashboard state
  const [adversaryCreatorOpen, setAdversaryCreatorOpen] = useState(false)
  const [bpAdjustments, setBpAdjustments] = useState({ lessDifficult: false, increasedDamage: false, moreDangerous: false })
  const [editingAdversaryId, setEditingAdversaryId] = useState(null)
  const [browserActiveTab, setBrowserActiveTab] = useState('adversaries')
  const [selectedCustomAdversaryId, setSelectedCustomAdversaryId] = useState(null)
  const [rightColumnMode, setRightColumnMode] = useState('browser') // 'browser' | 'info' | 'receipt'
  const [sortGroupOpen, setSortGroupOpen] = useState(false)
  const sortGroupButtonRef = useRef(null)
  const { sortBy, sortDir, groupBy, setSortBy, setGroupBy } = useDashboardSortGroup()

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

  // Count group→group boundaries so useColumnLayout can shrink columnWidth to compensate
  // for the extra DASHBOARD_GAP margin added between adjacent group sections.
  const numGroupBoundaries = useMemo(() => {
    if (groupBy === 'none') return 0
    let count = 0
    let prev = null
    for (const g of entityGroups) {
      if (g.groupName && prev && g.groupName !== prev) count++
      if (g.groupName) prev = g.groupName
    }
    return count
  }, [entityGroups, groupBy])

  const { columnWidth } = useColumnLayout(scrollContainerRef, numGroupBoundaries * DASHBOARD_GAP)

  const { browserOpenAtPosition, handleOpenBrowser, handleCloseBrowser } = useBrowserOverlay({
    scrollContainerRef,
    columnWidth,
    onCloseReset: () => { setBrowserActiveTab('adversaries'); setRightColumnMode('browser') }
  })

  const smoothScrollTo = useSmoothScroll(scrollContainerRef)

  const { entityGroups, getEntityGroups } = useEntityGroups(adversaryGroups, countdowns, sortBy, sortDir, groupBy)

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
  const availableBattlePoints = calculateAvailableBattlePoints(pcCount, bpAdjustments) + automaticAdjustments
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
      if (rightColumnOpen && rightColumnMode === 'browser') {
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

  // On mobile the creator uses the right-column slot; on desktop it's a centered modal.
  // NavRail stays visible in both cases on desktop; on mobile it shows above the creator column.
  const showNavRail = true

  return (
    <div
      ref={dashboardRootRef}
      className="app dashboard-root"
      style={{ '--dashboard-gap': `${DASHBOARD_GAP}px`, ...railPadding }}
    >
      {/* Main Dashboard Content */}
      <div className="dashboard-main">
        {rightColumnOpen && (isNarrow ? (
          <div style={{ position: 'absolute', inset: 0, zIndex: 99, backgroundColor: 'var(--bg-primary)' }} />
        ) : (
          <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: `${columnWidth + DASHBOARD_GAP}px`, zIndex: 99, backgroundColor: 'var(--bg-primary)' }} />
        ))}
        {rightColumnOpen && (
          <RightColumn
            mode={rightColumnMode}
            columnWidth={columnWidth}
            onClose={handleCloseBrowser}
            browserActiveTab={browserActiveTab}
            onTabChange={setBrowserActiveTab}
selectedCustomAdversaryId={selectedCustomAdversaryId}
            onSelectCustomAdversary={setSelectedCustomAdversaryId}
            onAddAdversaryFromBrowser={handleAddAdversaryFromBrowser}
            pcCount={pcCount}
            updatePartySize={updatePartySize}
            adversaryGroups={adversaryGroups}
            createAdversary={createAdversary}
            createAdversariesBulk={createAdversariesBulk}
            deleteAdversary={deleteAdversary}
            bpAdjustments={bpAdjustments}
            onChangeBpAdjustments={setBpAdjustments}
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

      {/* Custom Adversary Creator */}
      {adversaryCreatorOpen && (
        isNarrow ? (
          // Mobile: column slot (same mechanism as RightColumn, full viewport width)
          <div style={{
            position: 'fixed',
            top: 0, right: 0, bottom: `${RAIL_SIZE}px`, left: 0,
            zIndex: 200,
            backgroundColor: 'var(--bg-primary)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}>
            <CustomAdversaryCreator
              onSave={(adversaryData, id) => {
                if (id) { updateCustomAdversary(id, adversaryData) } else { addCustomAdversary(adversaryData) }
                setAdversaryCreatorOpen(false)
              }}
              onAddToEncounter={(adversaryData) => {
                createAdversary({ ...adversaryData })
                setAdversaryCreatorOpen(false)
              }}
              onCancelEdit={() => setAdversaryCreatorOpen(false)}
              embedded={false}
              autoFocus
            />
          </div>
        ) : (
          // Desktop: centered modal with backdrop
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 200, backgroundColor: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}
            onClick={() => setAdversaryCreatorOpen(false)}
          >
            <div
              style={{ width: 'min(92vw, 960px)', height: 'min(90vh, 820px)', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: '12px', boxShadow: '0 16px 48px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
              onClick={(e) => e.stopPropagation()}
            >
              <CustomAdversaryCreator
                onSave={(adversaryData, id) => {
                  if (id) { updateCustomAdversary(id, adversaryData) } else { addCustomAdversary(adversaryData) }
                  setAdversaryCreatorOpen(false)
                }}
                onCancelEdit={() => setAdversaryCreatorOpen(false)}
                embedded={false}
                autoFocus
              />
            </div>
          </div>
        )
      )}


      <PWAInstallPrompt />

      {showNavRail && (
        <NavRail
          placement={navPlacement}
          activeId={navActiveId}
          onAction={handleNavAction}
          sortActive={groupBy !== 'none' || sortBy !== 'name' || sortDir !== 'asc'}
          sortButtonRef={sortGroupButtonRef}
          onSortToggle={() => setSortGroupOpen(v => !v)}
        />
      )}
      {sortGroupOpen && (
        <SortGroupPopover
          anchorRef={sortGroupButtonRef}
          placement={navPlacement}
          sortBy={sortBy}
          sortDir={sortDir}
          groupBy={groupBy}
          onSortBy={setSortBy}
          onGroupBy={setGroupBy}
          onClose={() => setSortGroupOpen(false)}
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
