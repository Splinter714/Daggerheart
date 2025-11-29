import React, { useState, useEffect, useLayoutEffect, useCallback, useMemo, useRef } from 'react'
import { useGameState } from '../../state/state'
import PWAInstallPrompt from './PWAInstallPrompt'
import EncounterBuilder from './EncounterBuilder'
import { Plus, X, Minus, Pencil } from 'lucide-react'
import CustomAdversaryCreator from '../Adversaries/CustomAdversaryCreator'
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
  const [encounterBuilderOpen, setEncounterBuilderOpen] = useState(false)
  const [browserOpenAtPosition, setBrowserOpenAtPosition] = useState(null) // null or index where browser should appear
  const [editingAdversaryId, setEditingAdversaryId] = useState(null) // ID of adversary being edited, or null
  const [creatingCustomAdversary, setCreatingCustomAdversary] = useState(false) // Whether creating a new custom adversary
  const [browserActiveTab, setBrowserActiveTab] = useState('adversaries') // Active tab in browser overlay
  const [selectedCustomAdversaryId, setSelectedCustomAdversaryId] = useState(null) // Selected custom adversary in browser
  
  // Column layout state
  const getInitialContainerWidth = () => {
    if (typeof window === 'undefined') return 0
    return window.innerWidth
  }
  const [containerWidth, setContainerWidth] = useState(getInitialContainerWidth)
  const [newCards, setNewCards] = useState(new Set()) // Track newly added cards for fade-in animation
  const [removingCardSpacer, setRemovingCardSpacer] = useState(null) // Track card being removed with spacer: { baseName, groupIndex }
  const [spacerShrinking, setSpacerShrinking] = useState(false) // Track if spacer should shrink
  const scrollContainerRef = useRef(null)
  const prevPartySizeRef = useRef(pcCount)

  // Adjust minion quantities when party size changes
  useEffect(() => {
    const prevPcCount = prevPartySizeRef.current
    
    if (prevPcCount !== pcCount && prevPcCount > 0) {
      // Group adversaries by base name to get minion groups
      const groups = {}
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
      
      Object.values(groups).forEach(group => {
        if (group.type === 'adversary' && group.instances.length > 0) {
          const firstInstance = group.instances[0]
          
          // Only adjust minions
          if (firstInstance.type === 'Minion') {
            const currentInstanceCount = group.instances.length
            // Calculate how many groups we had with the previous party size
            const currentGroups = Math.ceil(currentInstanceCount / prevPcCount)
            // Calculate new instance count to maintain the same number of groups
            const newInstanceCount = currentGroups * pcCount
            
            if (newInstanceCount !== currentInstanceCount) {
              if (newInstanceCount > currentInstanceCount) {
                // Need to add instances
                const instancesToAdd = newInstanceCount - currentInstanceCount
                const newInstances = Array(instancesToAdd).fill(null).map(() => ({ ...firstInstance }))
                createAdversariesBulk(newInstances)
              } else {
                // Need to remove instances
                const instancesToRemove = currentInstanceCount - newInstanceCount
                // Remove from the end
                const instancesToDelete = group.instances.slice(-instancesToRemove)
                instancesToDelete.forEach(instance => {
                  deleteAdversary(instance.id)
                })
              }
            }
          }
        }
      })
      
      // Update the ref for next time
      prevPartySizeRef.current = pcCount
    } else if (prevPcCount === 0 || prevPartySizeRef.current === 0) {
      // First render - just set the ref
      prevPartySizeRef.current = pcCount
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pcCount]) // Only run when pcCount changes. Uses current adversaries, createAdversariesBulk, deleteAdversary from closure

  // Column layout calculations - dynamic sizing to always show full columns
  const gap = 12
  const getMinColumnWidth = (columnCount) => {
    if (columnCount === 1) return 200  // Smaller minimum for single column
    return 350  // Higher minimum for multiple columns
  }
  
  const calculateColumnLayout = (width) => {
    if (width <= 0) return { visibleColumns: 1, columnWidth: getMinColumnWidth(1) }
    
    const padding = gap * 2
    // Don't reserve space for browser overlay - it overlays on top
    const availableWidth = width - padding
    
    // Try different column counts to find the best fit
    let layout = { visibleColumns: 1, columnWidth: availableWidth }
    
    for (let columns = 1; columns <= 5; columns++) {
      const totalGapWidth = (columns - 1) * gap
      const columnWidth = (availableWidth - totalGapWidth) / columns
      
      if (columnWidth >= getMinColumnWidth(columns)) {
        const totalWidth = columns * columnWidth + totalGapWidth
        if (totalWidth <= availableWidth) {
          layout = { visibleColumns: columns, columnWidth }
        }
      }
    }
    
    // Ensure we never exceed the available width
    const totalWidth = layout.visibleColumns * layout.columnWidth + (layout.visibleColumns - 1) * gap
    if (totalWidth > availableWidth) {
      layout = { visibleColumns: 1, columnWidth: availableWidth }
    }
    
    return layout
  }
  
  const { visibleColumns, columnWidth } = calculateColumnLayout(containerWidth)
  
  // Handle container resize - measure actual scroll container width
  useLayoutEffect(() => {
    const measureWidth = () => {
      if (scrollContainerRef.current) {
        setContainerWidth(scrollContainerRef.current.clientWidth)
      } else if (typeof window !== 'undefined') {
        setContainerWidth(window.innerWidth)
      }
    }

    measureWidth()

    const handleResize = () => {
      measureWidth()
    }

    window.addEventListener('resize', handleResize)

    let resizeObserver
    if (typeof ResizeObserver !== 'undefined' && scrollContainerRef.current) {
      resizeObserver = new ResizeObserver((entries) => {
        const entry = entries[0]
        if (entry) {
          setContainerWidth(entry.contentRect.width)
        }
      })
      resizeObserver.observe(scrollContainerRef.current)
    }

    return () => {
      window.removeEventListener('resize', handleResize)
      if (resizeObserver) {
        resizeObserver.disconnect()
      }
    }
  }, [])

  // Encounter Builder handlers
  const handleOpenEncounterBuilder = () => {
    setEncounterBuilderOpen(true)
  }

  const handleCloseEncounterBuilder = useCallback(() => {
    setEncounterBuilderOpen(false)
  }, [])

  // Handle opening browser at a specific position
  const handleOpenBrowser = useCallback((position) => {
    // Capture scroll position before opening browser
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current
      const currentScroll = container.scrollLeft
      const maxScroll = container.scrollWidth - container.clientWidth
      const wasAtMaxScroll = Math.abs(currentScroll - maxScroll) < 1 // Within 1px of max
      
      console.log('[BROWSER_OPEN] Capturing scroll state:', {
        currentScroll,
        maxScroll,
        scrollWidth: container.scrollWidth,
        clientWidth: container.clientWidth,
        wasAtMaxScroll,
        position
      })
      
      // Store scroll state on container
      container._scrollBeforeBrowserOpen = currentScroll
      container._scrollWidthBeforeOpen = container.scrollWidth
      container._wasAtMaxScrollBeforeBrowserOpen = wasAtMaxScroll
    }
    setBrowserOpenAtPosition(position)
  }, [])

  // Log spacer state changes
  useEffect(() => {
    if (browserOpenAtPosition !== null) {
      console.log('[SPACER] Spacer added, dimensions:', {
        width: columnWidth + gap,
        columnWidth,
        gap
      })
    } else {
      console.log('[SPACER] Spacer removed')
    }
  }, [browserOpenAtPosition, columnWidth, gap])

  // Adjust scroll position when browser opens/closes to prevent shift
  useEffect(() => {
    if (!scrollContainerRef.current) return
    
    const container = scrollContainerRef.current
    
    console.log('[SCROLL_ADJUST] useEffect triggered, browserOpenAtPosition:', browserOpenAtPosition, 'columnWidth:', columnWidth, 'gap:', gap)
    
    if (browserOpenAtPosition !== null) {
      // Browser is opening - wait for DOM to update with spacer
      console.log('[BROWSER_OPEN] useEffect triggered, waiting for DOM update...')
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (!scrollContainerRef.current) return
          const updatedContainer = scrollContainerRef.current
          
          const wasAtMaxScroll = updatedContainer._wasAtMaxScrollBeforeBrowserOpen
          const scrollBeforeOpen = updatedContainer._scrollBeforeBrowserOpen || 0
          const currentScroll = updatedContainer.scrollLeft
          const newMaxScroll = updatedContainer.scrollWidth - updatedContainer.clientWidth
          
          console.log('[BROWSER_OPEN] After DOM update:', {
            wasAtMaxScroll,
            scrollBeforeOpen,
            currentScroll,
            newMaxScroll,
            scrollWidth: updatedContainer.scrollWidth,
            clientWidth: updatedContainer.clientWidth,
            scrollDelta: currentScroll - scrollBeforeOpen,
            expectedSpacerWidth: columnWidth + gap,
            actualWidthIncrease: updatedContainer.scrollWidth - (updatedContainer._scrollWidthBeforeOpen || updatedContainer.scrollWidth)
          })
          
          if (wasAtMaxScroll) {
            // User was at max scroll - maintain same scroll position
            // Content doesn't move, only scrollable area expands, so we should NOT scroll
            console.log('[BROWSER_OPEN] Was at max scroll, maintaining position to prevent shift:', scrollBeforeOpen)
            updatedContainer.scrollLeft = scrollBeforeOpen
            console.log('[BROWSER_OPEN] After maintaining position, scrollLeft:', updatedContainer.scrollLeft)
          } else {
            // Not at max scroll - maintain same scroll position (content doesn't move)
            console.log('[BROWSER_OPEN] Not at max scroll, maintaining position:', scrollBeforeOpen)
            updatedContainer.scrollLeft = scrollBeforeOpen
          }
          
          // Clean up
          delete updatedContainer._scrollBeforeBrowserOpen
          delete updatedContainer._wasAtMaxScrollBeforeBrowserOpen
        })
      })
    } else {
      // Browser is closing - wait for DOM to update (spacer removed)
      console.log('[BROWSER_CLOSE] useEffect triggered, waiting for DOM update...')
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (!scrollContainerRef.current) return
          const updatedContainer = scrollContainerRef.current
          const scrollBeforeClose = updatedContainer._scrollBeforeBrowserClose || 0
          const currentScroll = updatedContainer.scrollLeft
          const newMaxScroll = updatedContainer.scrollWidth - updatedContainer.clientWidth
          
          console.log('[BROWSER_CLOSE] After DOM update:', {
            scrollBeforeClose,
            currentScroll,
            newMaxScroll,
            scrollWidth: updatedContainer.scrollWidth,
            clientWidth: updatedContainer.clientWidth,
            scrollDelta: currentScroll - scrollBeforeClose,
            expectedSpacerWidth: columnWidth + gap,
            actualWidthDecrease: (updatedContainer._scrollWidthBeforeClose || updatedContainer.scrollWidth) - updatedContainer.scrollWidth
          })
          
          // Clamp to new max scroll (spacer removed, so max scroll is lower)
          const targetScroll = Math.min(scrollBeforeClose, newMaxScroll)
          console.log('[BROWSER_CLOSE] Setting scroll to:', targetScroll, '(min of', scrollBeforeClose, 'and', newMaxScroll, ')')
          updatedContainer.scrollLeft = targetScroll
          console.log('[BROWSER_CLOSE] After adjustment, scrollLeft:', updatedContainer.scrollLeft)
          
          // Clean up
          delete updatedContainer._scrollBeforeBrowserClose
        })
      })
    }
  }, [browserOpenAtPosition, columnWidth, gap])

  // Handle closing browser
  const handleCloseBrowser = useCallback(() => {
    // Capture scroll position before closing browser
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current
      const currentScroll = container.scrollLeft
      const maxScroll = container.scrollWidth - container.clientWidth
      
      console.log('[BROWSER_CLOSE] Capturing scroll state:', {
        currentScroll,
        maxScroll,
        scrollWidth: container.scrollWidth,
        clientWidth: container.clientWidth
      })
      
      container._scrollBeforeBrowserClose = currentScroll
      container._scrollWidthBeforeClose = container.scrollWidth
    }
    setBrowserOpenAtPosition(null)
    setBrowserActiveTab('adversaries') // Reset to adversaries tab when closing
  }, [])

  // Smooth scroll helper
  const smoothScrollTo = useCallback((targetScrollLeft, duration = 500, reason = 'unknown') => {
    if (!scrollContainerRef.current) {
      return
    }
    
    const container = scrollContainerRef.current
    const startScrollLeft = container.scrollLeft
    const distance = targetScrollLeft - startScrollLeft
    
    // If distance is very small, skip animation
    if (Math.abs(distance) < 1) {
      return
    }
    
    // Cancel any ongoing horizontal scroll animation
    if (container._horizontalScrollAnimationId) {
      cancelAnimationFrame(container._horizontalScrollAnimationId)
      container._horizontalScrollAnimationId = null
    }
    
    // Temporarily disable scroll-snap to allow smooth scrolling
    const computedStyle = window.getComputedStyle(container)
    const hasScrollSnap = computedStyle.scrollSnapType !== 'none'
    const originalScrollSnapType = hasScrollSnap ? 'x mandatory' : null
    
    if (hasScrollSnap) {
      container.style.scrollSnapType = 'none'
    }
    
    const startTime = performance.now()
    
    const animateScroll = (currentTime) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      // Optimized easing calculation - cache (1 - progress)
      const oneMinusProgress = 1 - progress
      const easeOut = 1 - (oneMinusProgress * oneMinusProgress * oneMinusProgress)
      
      if (container) {
        const newScrollLeft = startScrollLeft + (distance * easeOut)
        container.scrollLeft = newScrollLeft
      }
      
      if (progress < 1) {
        container._horizontalScrollAnimationId = requestAnimationFrame(animateScroll)
      } else {
        // Ensure we're exactly at target
        if (container) {
          container.scrollLeft = targetScrollLeft
          container._horizontalScrollAnimationId = null
        }
        // Don't re-enable scroll-snap here - let handleScroll re-enable it when user scrolls
        // This prevents jitter and interference with subsequent programmatic scrolls
      }
    }
    
    container._horizontalScrollAnimationId = requestAnimationFrame(animateScroll)
    
    // Return cleanup function
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
      if (hasScrollSnap && container) {
        container.style.scrollSnapType = originalScrollSnapType || ''
      }
    }
  }, [])

  // Group entities by type for dashboard columns
  const getEntityGroups = useCallback(() => {
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
  }, [adversaries, countdowns])

  const entityGroups = getEntityGroups()

  // Keyboard shortcuts
  useAppKeyboardShortcuts({
    browserOpenAtPosition,
    handleCloseBrowser,
    handleOpenBrowser,
    getEntityGroups,
    fear,
    updateFear
  })

  // Handle adding adversary from browser
  const handleAddAdversaryFromBrowser = useCallback((itemData) => {
    // Check if this adversary already exists BEFORE adding
    const baseName = itemData.baseName || itemData.name?.replace(/\s+\(\d+\)$/, '') || itemData.name
    const existingGroup = entityGroups.find(g => g.baseName === baseName && g.type === 'adversary')
    const isNewAdversary = !existingGroup
    
    // Special handling for Minions: add in increments of party size
    const isMinion = itemData.type === 'Minion'
    const instancesToAdd = isMinion ? pcCount : 1
    
    const addTimestamp = performance.now()
    // Capture scrollWidth BEFORE adding the adversary, so we can detect if it increased
    const scrollWidthBeforeAdd = scrollContainerRef.current?.scrollWidth ?? 0
    const scrollLeftBeforeAdd = scrollContainerRef.current?.scrollLeft ?? 0
    
    // Disable scroll-snap BEFORE adding the adversary to prevent browser auto-scrolling
    // when new content is added
    const container = scrollContainerRef.current
    let scrollSnapWasDisabled = false
    if (container && isNewAdversary) {
      const computedStyle = window.getComputedStyle(container)
      if (computedStyle.scrollSnapType !== 'none') {
        container.style.scrollSnapType = 'none'
        scrollSnapWasDisabled = true
      }
    }
    
    // Create multiple instances for minions, single instance for others
    if (isMinion && instancesToAdd > 1) {
      const minionArray = Array(instancesToAdd).fill(null).map(() => ({ ...itemData }))
      createAdversariesBulk(minionArray)
    } else {
      createAdversary(itemData)
    }
    
    // If it's a new adversary, mark it for fade-in animation
    if (isNewAdversary) {
      const cardKey = `adversary-${baseName}`
      // Start with opacity 0, then fade in
      setNewCards(prev => new Set(prev).add(cardKey))
      // After a brief moment, remove from newCards to trigger fade-in
      setTimeout(() => {
        setNewCards(prev => {
          const next = new Set(prev)
          next.delete(cardKey)
          return next
        })
      }, 10) // Very short delay to ensure initial render at opacity 0
    }
    
    // Smooth scroll after DOM updates - wait for React to render
    setTimeout(() => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (!scrollContainerRef.current) return
          
          // Ensure container is ready and has correct dimensions
          const container = scrollContainerRef.current
          if (container.scrollWidth <= container.clientWidth) {
            // No scrolling needed
            return
          }
          
          if (isNewAdversary) {
            // New adversary - scroll far right
            // Wait for DOM to update, then check if scrollWidth has stabilized
            const initialScrollWidth = container.scrollWidth
            setTimeout(() => {
              if (!scrollContainerRef.current) return
              const updatedContainer = scrollContainerRef.current
              
              // Check if scrollWidth has changed - if so, wait a bit more
              const currentScrollWidth = updatedContainer.scrollWidth
              if (currentScrollWidth !== initialScrollWidth) {
                // scrollWidth is still updating, wait another frame
                requestAnimationFrame(() => {
                  requestAnimationFrame(() => {
                    if (!scrollContainerRef.current) return
                    const finalContainer = scrollContainerRef.current
                    const maxScroll = finalContainer.scrollWidth - finalContainer.clientWidth
                    const currentScroll = finalContainer.scrollLeft
                    // Calculate distance from the scroll position BEFORE adding the adversary
                    const distance = maxScroll - scrollLeftBeforeAdd
                    const scrollWidthIncreased = finalContainer.scrollWidth > scrollWidthBeforeAdd
                    // Always scroll if scrollWidth increased (new content added), even if current position is at max
                    // If scrollWidth increased but we're already at maxScroll, scroll slightly past to ensure distance > 1
                    if (scrollWidthIncreased && Math.abs(distance) < 1) {
                      // Scroll slightly past maxScroll to ensure animation triggers (browser will clamp)
                      smoothScrollTo(maxScroll + 10, 500, 'new-adversary')
                    } else if (Math.abs(distance) > 1) {
                      smoothScrollTo(maxScroll, 500, 'new-adversary')
                    }
                  })
                })
              } else {
                // scrollWidth is stable, proceed
                const maxScroll = updatedContainer.scrollWidth - updatedContainer.clientWidth
                const currentScroll = updatedContainer.scrollLeft
                // Calculate distance from the scroll position BEFORE adding the adversary
                const distance = maxScroll - scrollLeftBeforeAdd
                const scrollWidthIncreased = updatedContainer.scrollWidth > scrollWidthBeforeAdd
                // Always scroll if scrollWidth increased (new content added), even if current position is at max
                // If scrollWidth increased but we're already at maxScroll, scroll slightly past to ensure distance > 1
                if (scrollWidthIncreased && Math.abs(distance) < 1) {
                  // Scroll slightly past maxScroll to ensure animation triggers (browser will clamp)
                  smoothScrollTo(maxScroll + 10, 500, 'new-adversary')
                } else if (Math.abs(distance) > 1) {
                  smoothScrollTo(maxScroll, 500, 'new-adversary')
                }
              }
            }, 10)
          } else {
            // Existing adversary - scroll to that card only if it's not already visible
            // Recalculate groups after addition to get correct index
            const updatedGroups = getEntityGroups()
            const groupIndex = updatedGroups.findIndex(g => g.baseName === baseName && g.type === 'adversary')
            if (groupIndex >= 0) {
              const container = scrollContainerRef.current
              const currentScroll = container.scrollLeft
              const containerWidth = container.clientWidth
              
              // Account for browser overlay covering part of the viewport
              const effectiveWidth = browserOpenAtPosition !== null 
                ? containerWidth - (columnWidth + gap) // Overlay takes up one column width
                : containerWidth
              
              // Calculate scroll position - each panel is (columnWidth + gap) wide
              const cardPosition = groupIndex * (columnWidth + gap)
              const cardEnd = cardPosition + columnWidth + gap // Full panel width
              
              // Check if card is fully visible (accounting for overlay)
              const margin = 10 // Small margin for visibility check
              const isVisible = cardPosition >= (currentScroll - margin) && cardEnd <= (currentScroll + effectiveWidth + margin)
              
              if (!isVisible) {
                // Card is not visible, scroll to it
                smoothScrollTo(cardPosition, 500)
              }
            }
            
            // Vertical scrolling disabled - instances are added/removed without auto-scrolling
          }
        })
      })
    }, 50) // Small delay to ensure React has rendered
  }, [createAdversary, entityGroups, columnWidth, gap, smoothScrollTo, getEntityGroups, browserOpenAtPosition])

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
                  const container = scrollContainerRef.current
                  const groupIndex = updatedGroups.findIndex(g => 
                    g.instances.some(i => i.id === newAdversary.id)
                  )
                  if (groupIndex >= 0) {
                    const cardPosition = groupIndex * (columnWidth + gap)
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
  }, [createAdversary, getEntityGroups, columnWidth, gap, smoothScrollTo, editingAdversaryId])

  // Handle editing an adversary
  const handleEditAdversary = useCallback((adversaryId) => {
    setEditingAdversaryId(adversaryId)
    setCreatingCustomAdversary(false)
  }, [])

  // Handle canceling edit/create
  const handleCancelEdit = useCallback(() => {
    setEditingAdversaryId(null)
    setCreatingCustomAdversary(false)
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
      setCreatingCustomAdversary(false)
      // Browser will auto-refresh via useEffect watching customContent
      return newId
    }
  }, [editingAdversaryId, adversaries, customContent, createAdversary, updateAdversary, addCustomAdversary, updateCustomAdversary])

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
      <div className="main-content" style={{ 
        position: 'relative',
        width: '100%'
      }}>
        <BrowserOverlay
          isOpen={browserOpenAtPosition !== null}
          columnWidth={columnWidth}
          gap={gap}
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
          gap={gap}
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
