import React, { useState, useEffect, useCallback, startTransition, useRef } from 'react'
import { useGameState } from '../state/state'
import Pips from './Pips'
import Bar from './Toolbars'
import GameCard from './GameCard'
import Browser from './Browser'
import ContainerWithTab from './ContainerWithTab'
import PWAInstallPrompt from './PWAInstallPrompt'
import Panel from './Panels'
import EncounterBuilder from './EncounterBuilder'
import { Plus, X, Minus, Pencil } from 'lucide-react'
import CustomAdversaryCreator from './CustomAdversaryCreator'
import { getDefaultAdversaryValues } from '../data/adversaryDefaults'

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
  const [isMobile, setIsMobile] = useState(false)
  const [encounterBuilderOpen, setEncounterBuilderOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [isClearMode, setIsClearMode] = useState(false)
  const [showLongTermCountdowns, setShowLongTermCountdowns] = useState(true)
  const [lastAddedItemType, setLastAddedItemType] = useState(null)
  const [browserOpenAtPosition, setBrowserOpenAtPosition] = useState(null) // null or index where browser should appear
  const [editingAdversaryId, setEditingAdversaryId] = useState(null) // ID of adversary being edited, or null
  const [creatingCustomAdversary, setCreatingCustomAdversary] = useState(false) // Whether creating a new custom adversary
  const [browserActiveTab, setBrowserActiveTab] = useState('adversaries') // Active tab in browser overlay
  const [selectedCustomAdversaryId, setSelectedCustomAdversaryId] = useState(null) // Selected custom adversary in browser
  
  // Column layout state
  const [containerWidth, setContainerWidth] = useState(0)
  const [scrollPosition, setScrollPosition] = useState(0)
  const [isScrolling, setIsScrolling] = useState(false)
  const [removingCards, setRemovingCards] = useState(new Set()) // Track cards being removed for animation
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
    // Always reserve space for browser overlay (one column width + gap) even when closed
    // Use iterative calculation to account for browser overlay width depending on columnWidth
    let availableWidth = width - padding
    let browserOverlayWidth = 0
    let bestLayout = { visibleColumns: 1, columnWidth: availableWidth }
    
    // Iterate until browser overlay width stabilizes (usually converges in 2-3 iterations)
    for (let iteration = 0; iteration < 5; iteration++) {
      const widthForCards = availableWidth - browserOverlayWidth
      
      // Try different column counts to find the best fit
      let layout = { visibleColumns: 1, columnWidth: widthForCards }
      
      for (let columns = 1; columns <= 5; columns++) {
        const totalGapWidth = (columns - 1) * gap
        const columnWidth = (widthForCards - totalGapWidth) / columns
        
        if (columnWidth >= getMinColumnWidth(columns)) {
          const totalWidth = columns * columnWidth + totalGapWidth
          if (totalWidth <= widthForCards) {
            layout = { visibleColumns: columns, columnWidth }
          }
        }
      }
      
      // Ensure we never exceed the available width
      const totalWidth = layout.visibleColumns * layout.columnWidth + (layout.visibleColumns - 1) * gap
      if (totalWidth > widthForCards) {
        layout = { visibleColumns: 1, columnWidth: widthForCards }
      }
      
      // Calculate new browser overlay width
      const newBrowserOverlayWidth = layout.columnWidth + gap
      
      // Check if converged (browser overlay width hasn't changed significantly)
      if (Math.abs(newBrowserOverlayWidth - browserOverlayWidth) < 0.1) {
        return layout
      }
      
      browserOverlayWidth = newBrowserOverlayWidth
      bestLayout = layout
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

  const handleCloseEncounterBuilder = useCallback(() => {
    setEncounterBuilderOpen(false)
  }, [])

  // Handle opening browser at a specific position
  const handleOpenBrowser = useCallback((position) => {
    // Check if user is scrolled all the way right before opening browser
    let wasAtMaxScroll = false
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current
      const currentScroll = container.scrollLeft
      const maxScroll = container.scrollWidth - container.clientWidth
      wasAtMaxScroll = Math.abs(currentScroll - maxScroll) < 1 // Within 1px of max
      
      // Store this state on the container
      if (wasAtMaxScroll) {
        container._wasAtMaxScrollOnBrowserOpen = true
      }
    }
    setBrowserOpenAtPosition(position)
  }, [])

  // Adjust scroll position when browser opens to prevent shift when spacer is added
  useEffect(() => {
    if (browserOpenAtPosition !== null && scrollContainerRef.current) {
      const container = scrollContainerRef.current
      const wasAtMaxScroll = container._wasAtMaxScrollOnBrowserOpen
      
      if (wasAtMaxScroll) {
        // Wait for DOM to update with the spacer, then adjust scroll
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            if (scrollContainerRef.current) {
              const container = scrollContainerRef.current
              const spacerWidth = columnWidth + gap
              const newMaxScroll = container.scrollWidth - container.clientWidth
              // Set scroll to new max (which includes the spacer)
              container.scrollLeft = newMaxScroll
              // Clean up the flag
              container._wasAtMaxScrollOnBrowserOpen = false
            }
          })
        })
      }
    }
  }, [browserOpenAtPosition, columnWidth, gap])

  // Handle closing browser
  const handleCloseBrowser = useCallback(() => {
    setBrowserOpenAtPosition(null)
    setBrowserActiveTab('adversaries') // Reset to adversaries tab when closing
  }, [])

  // Smooth scroll helper
  const smoothScrollTo = useCallback((targetScrollLeft, duration = 500, reason = 'unknown') => {
    console.log('[HORIZONTAL_SCROLL] smoothScrollTo called:', { targetScrollLeft, duration, reason, timestamp: performance.now() })
    
    if (!scrollContainerRef.current) {
      console.log('[HORIZONTAL_SCROLL] No container ref, aborting')
      return
    }
    
    const container = scrollContainerRef.current
    const startScrollLeft = container.scrollLeft
    const distance = targetScrollLeft - startScrollLeft
    
    console.log('[HORIZONTAL_SCROLL] Scroll params:', { startScrollLeft, targetScrollLeft, distance, containerWidth: container.clientWidth, scrollWidth: container.scrollWidth })
    
    // If distance is very small, skip animation
    if (Math.abs(distance) < 1) {
      console.log('[HORIZONTAL_SCROLL] Distance too small, skipping animation')
      return
    }
    
    // Cancel any ongoing horizontal scroll animation
    if (container._horizontalScrollAnimationId) {
      console.log('[HORIZONTAL_SCROLL] Canceling existing animation')
      cancelAnimationFrame(container._horizontalScrollAnimationId)
      container._horizontalScrollAnimationId = null
    }
    
    // Temporarily disable scroll-snap to allow smooth scrolling
    const computedStyle = window.getComputedStyle(container)
    const hasScrollSnap = computedStyle.scrollSnapType !== 'none'
    const originalScrollSnapType = hasScrollSnap ? 'x mandatory' : null
    
    console.log('[HORIZONTAL_SCROLL] Scroll-snap state:', { hasScrollSnap, originalScrollSnapType })
    
    if (hasScrollSnap) {
      container.style.scrollSnapType = 'none'
    }
    
    const startTime = performance.now()
    console.log('[HORIZONTAL_SCROLL] Starting animation at:', startTime)
    
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
        console.log('[HORIZONTAL_SCROLL] Animation complete, final scrollLeft:', container.scrollLeft)
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
        console.log('[ADVERSARY_ADD] Disabled scroll-snap before adding adversary to prevent auto-scroll')
      }
    }
    
    console.log('[ADVERSARY_ADD] handleAddAdversaryFromBrowser called:', {
      baseName,
      isNewAdversary,
      isMinion,
      instancesToAdd,
      timestamp: addTimestamp,
      currentScroll: scrollLeftBeforeAdd,
      scrollWidth: scrollWidthBeforeAdd,
      scrollSnapDisabled: scrollSnapWasDisabled
    })
    
    // Create multiple instances for minions, single instance for others
    if (isMinion && instancesToAdd > 1) {
      const minionArray = Array(instancesToAdd).fill(null).map(() => ({ ...itemData }))
      createAdversariesBulk(minionArray)
    } else {
      createAdversary(itemData)
    }
    setLastAddedItemType('adversary')
    
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
                    console.log('[HORIZONTAL_SCROLL] New adversary added, scrollWidth stabilized:', { maxScroll, scrollWidth: finalContainer.scrollWidth, clientWidth: finalContainer.clientWidth, scrollWidthBeforeAdd, scrollLeftBeforeAdd, currentScroll, scrollChanged: currentScroll !== scrollLeftBeforeAdd, scrollWidthIncreased, distance })
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
                console.log('[HORIZONTAL_SCROLL] New adversary added, scrollWidth stable:', { maxScroll, scrollWidth: updatedContainer.scrollWidth, clientWidth: updatedContainer.clientWidth, scrollWidthBeforeAdd, scrollLeftBeforeAdd, currentScroll, scrollChanged: currentScroll !== scrollLeftBeforeAdd, scrollWidthIncreased, distance })
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
        // Stock adversary - create new custom copy
        // Ensure name is set for custom content
        const customContentData = {
          ...adversaryData,
          name: adversaryData.baseName || adversaryData.name
        }
        const customId = addCustomAdversary(customContentData)
        // Update the instance on dashboard to reference the new custom adversary
        updateAdversary(id, { 
          ...adversaryData, 
          source: 'Homebrew', 
          isCustom: true,
          customContentId: customId 
        })
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
  const scrollTimeoutRef = useRef(null)
  
  const handleScroll = useCallback((e) => {
    setScrollPosition(e.target.scrollLeft)
    
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

  // Touch gesture handling - simplified
  const handleTouchStart = useCallback(() => {
    setIsScrolling(true)
  }, [])

  const handleTouchEnd = useCallback(() => {
    setTimeout(() => setIsScrolling(false), 100)
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
            title={browserOpenAtPosition !== null ? 'Close Browser' : 'Add Adversaries'}
            style={{
              width: '36px',
              height: '36px',
              padding: 0,
              backgroundColor: browserOpenAtPosition !== null ? 'var(--purple)' : 'transparent',
              border: '1px solid var(--border)',
              borderRadius: '50%',
              color: browserOpenAtPosition !== null ? 'white' : 'var(--text-primary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
              flexShrink: 0
            }}
            onMouseEnter={(e) => {
              if (browserOpenAtPosition === null) {
                e.target.style.borderColor = 'var(--purple)'
                e.target.style.backgroundColor = 'var(--bg-secondary)'
              }
            }}
            onMouseLeave={(e) => {
              if (browserOpenAtPosition === null) {
                e.target.style.borderColor = 'var(--border)'
                e.target.style.backgroundColor = 'transparent'
              }
            }}
          >
            <Plus size={18} />
          </button>
        </div>
      </Bar>

      {/* Main Dashboard Content */}
      <div className="main-content" style={{ 
        position: 'relative',
        width: '100%'
      }}>
        {/* Browser Overlay - appears on top when open */}
        {browserOpenAtPosition !== null && (
          <div style={{
            position: 'absolute',
            top: `${gap}px`, // Start at gap - tab extends above
            right: `${gap}px`,
            bottom: `${gap}px`,
            width: `${columnWidth}px`,
            zIndex: 100,
            overflow: 'visible' // Allow tab to extend above
          }}>
            <ContainerWithTab
              tabContent={
                <>
                  {/* Add Custom button */}
                  <button
                    onClick={handleCreateCustomAdversary}
                    style={{
                      padding: '0.375rem 0.75rem',
                      backgroundColor: 'var(--purple)',
                      border: 'none',
                      color: 'white',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      transition: 'opacity 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.opacity = '0.9'
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.opacity = '1'
                    }}
                  >
                    <Plus size={16} />
                    <span>Add Custom</span>
                  </button>
                  {/* Party Size Controls */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <span style={{ color: 'var(--text-primary)', fontSize: '0.875rem', fontWeight: '500' }}>
                      Party Size:
                    </span>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.25rem',
                      border: '1px solid var(--border)',
                      borderRadius: '4px',
                      padding: '0.125rem 0.25rem',
                      backgroundColor: 'var(--bg-secondary)'
                    }}>
                      <button
                        onClick={() => updatePartySize(Math.max(1, pcCount - 1))}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--text-primary)',
                          cursor: 'pointer',
                          padding: '0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          minWidth: '18px',
                          height: '18px',
                          fontSize: '0.7rem'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.color = 'var(--purple)'
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.color = 'var(--text-primary)'
                        }}
                      >
                        <Minus size={12} />
                      </button>
                      <span style={{ 
                        color: 'var(--text-primary)', 
                        fontSize: '0.875rem', 
                        fontWeight: '500',
                        minWidth: '1.5rem',
                        textAlign: 'center'
                      }}>
                        {pcCount}
                      </span>
                      <button
                        onClick={() => updatePartySize(pcCount + 1)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--text-primary)',
                          cursor: 'pointer',
                          padding: '0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          minWidth: '18px',
                          height: '18px',
                          fontSize: '0.7rem'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.color = 'var(--purple)'
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.color = 'var(--text-primary)'
                        }}
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                  {/* Balance display */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <span style={{ color: 'var(--text-primary)', fontSize: '0.875rem', fontWeight: '500' }}>
                      Balance:
                    </span>
                    <span style={{
                      color: spentBattlePoints > availableBattlePoints ? 'var(--danger)' : 
                             spentBattlePoints === availableBattlePoints ? 'var(--purple)' : 
                             'var(--success)',
                      fontWeight: 600,
                      fontSize: '0.875rem'
                    }}>
                      {spentBattlePoints > availableBattlePoints ? 
                        `+${spentBattlePoints - availableBattlePoints}` : 
                        availableBattlePoints - spentBattlePoints === 0 ? 
                          '0' : 
                          `-${availableBattlePoints - spentBattlePoints}`
                      }
                    </span>
                  </div>
                  {/* Close button */}
                  {handleCloseBrowser && (
                    <button
                      onClick={handleCloseBrowser}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer',
                        padding: '0.25rem',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'color 0.2s ease',
                        flexShrink: 0
                      }}
                      onMouseEnter={(e) => e.target.style.color = 'var(--text-primary)'}
                      onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}
                      title="Close browser"
                    >
                      <X size={16} />
                    </button>
                  )}
                </>
              }
              showTab={true}
              tabBackgroundColor="var(--bg-primary)"
              tabBorderColor="var(--border)"
              tabJustifyContent="space-between"
              containerBackgroundColor="var(--bg-primary)"
              containerBorderColor="var(--border)"
              containerBorderRadius="8px"
              containerBoxShadow="-4px 0 12px rgba(0, 0, 0, 0.3)"
              containerOverflow="hidden"
              reserveTabSpace={true}
              containerStyle={{
                height: '100%' // Ensure container fills wrapper
              }}
            >
              <div style={{ 
                flex: 1, 
                overflowY: 'auto', 
                overflowX: 'hidden', 
                minHeight: 0, 
                display: 'flex', 
                flexDirection: 'column',
                width: '100%',
                minWidth: 0
              }}>
                <Browser
                  type="adversary"
                  onAddItem={handleAddAdversaryFromBrowser}
                  showContainer={false}
                  activeTab={browserActiveTab}
                  onTabChange={setBrowserActiveTab}
                  pcCount={pcCount}
                  savedEncounters={savedEncounters}
                  onLoadEncounter={loadEncounter}
                  onDeleteEncounter={deleteEncounter}
                  selectedCustomAdversaryId={selectedCustomAdversaryId}
                  onSelectCustomAdversary={setSelectedCustomAdversaryId}
                  autoFocus={true}
                  hideImportExport={true}
                  onClose={handleCloseBrowser}
                  searchPlaceholder="Search adversaries"
                />
              </div>
            </ContainerWithTab>
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
            padding: `0 ${gap}px 0 0`, // Only right padding to avoid double padding on left
            scrollSnapType: 'x mandatory',
            height: '100%',
            width: '100%'
          }}
          onScroll={handleScroll}
        >
        {entityGroups.length === 0 ? null : (
          // Normal entity groups display
          (() => {
            const items = []
            
            entityGroups.forEach((group, index) => {
              // Check if this card should be replaced with a spacer
              // Match by baseName since groupIndex becomes invalid after removal
              const isSpacerPosition = removingCardSpacer && removingCardSpacer.baseName === group.baseName && group.type === 'adversary'
              
              if (isSpacerPosition) {
                // Render spacer instead of card
                items.push(
                  <Panel 
                    key={`spacer-${removingCardSpacer.baseName}`}
                    style={{ 
                      width: spacerShrinking ? '0px' : `${columnWidth + gap}px`, // Start at full width, shrink to 0
                      flexShrink: 0,
                      flexGrow: 0,
                      flex: 'none',
                      paddingLeft: spacerShrinking ? '0px' : `${gap}px`,
                      paddingRight: '0',
                      paddingTop: spacerShrinking ? '0px' : `${gap}px`,
                      paddingBottom: spacerShrinking ? '0px' : `${gap}px`,
                      scrollSnapAlign: 'none',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'stretch',
                      height: '100%',
                      opacity: 0,
                      transition: 'width 0.3s ease, padding-left 0.3s ease, padding-top 0.3s ease, padding-bottom 0.3s ease'
                    }}
                  />
                )
                return // Skip rendering the card
              }
              
              // Render the card normally
              items.push(
            <Panel 
              key={`${group.type}-${group.baseName}`}
              style={{ 
                width: `${columnWidth + gap}px`, // Include padding in width
                flexShrink: 0,
                flexGrow: 0,
                flex: 'none',
                paddingLeft: `${gap}px`, // Space before each card
                paddingRight: '0',
                paddingTop: `${group.type === 'adversary' ? gap + 52 : gap}px`, // Extra space for buttons above card (always reserve space for tab buttons)
                paddingBottom: `${gap}px`, // Space below each card
                scrollSnapAlign: 'start',
                overflow: group.type === 'adversary' ? 'visible' : 'hidden', // Allow tab buttons above card to be visible
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'stretch', // Ensure card stretches to full width
                height: 'auto', // Let Panel size to card content
                opacity: newCards.has(`${group.type}-${group.baseName}`) ? 0 : 1,
                transition: newCards.has(`${group.type}-${group.baseName}`) ? 'opacity 0.2s ease' : 'opacity 0.2s ease'
              }}
            >
            <GameCard
              type={group.type}
              item={{ 
                ...group.instances[0], 
                name: group.instances[0]?.name || group.baseName,
                // Reset instance-specific state so the expanded card doesn't show defeated state
                hp: 0,
                stress: 0,
                isDead: false
              }} // Use first instance as template but reset state
              mode="expanded"
              instances={group.instances} // Pass all instances to embed mini-cards
              showCustomCreator={group.type === 'adversary' && editingAdversaryId && group.instances.some(i => i.id === editingAdversaryId)}
              onSaveCustomAdversary={group.type === 'adversary' && editingAdversaryId && group.instances.some(i => i.id === editingAdversaryId) ? handleSaveCustomAdversary : undefined}
              onCancelEdit={group.type === 'adversary' && editingAdversaryId && group.instances.some(i => i.id === editingAdversaryId) ? handleCancelEdit : undefined}
              isStockAdversary={group.type === 'adversary' && editingAdversaryId && group.instances.some(i => i.id === editingAdversaryId) ? 
                (!group.instances[0]?.source || group.instances[0]?.source !== 'Homebrew') : false}
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
              onEdit={group.type === 'adversary' ? (itemId) => handleEditAdversary(itemId) : undefined}
              onAddInstance={group.type === 'adversary' ? (item) => {
                // Special handling for Minions: add in increments of party size
                const isMinion = item.type === 'Minion'
                const instancesToAdd = isMinion ? pcCount : 1
                
                // Add instances
                if (isMinion && instancesToAdd > 1) {
                  const instancesArray = Array(instancesToAdd).fill(null).map(() => ({ ...item }))
                  createAdversariesBulk(instancesArray)
                } else {
                  createAdversary(item)
                }
                
                // Horizontal scroll to card only if it's not already visible
                setTimeout(() => {
                  requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                      if (scrollContainerRef.current) {
                        const container = scrollContainerRef.current
                        const currentScroll = container.scrollLeft
                        const containerWidth = container.clientWidth
                        
                        // Account for browser overlay covering part of the viewport
                        const effectiveWidth = browserOpenAtPosition !== null 
                          ? containerWidth - (columnWidth + gap) // Overlay takes up one column width
                          : containerWidth
                        
                        // Recalculate groups after addition to get correct index
                        const updatedGroups = getEntityGroups()
                        const groupIndex = updatedGroups.findIndex(g => g.baseName === group.baseName && g.type === 'adversary')
                        if (groupIndex >= 0) {
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
                      }
                    })
                  })
                }, 50) // Small delay to ensure React has rendered
              } : undefined}
              onRemoveInstance={group.type === 'adversary' ? (itemId) => {
                // Get the first instance to check type
                const firstInstance = group.instances[0]
                const isMinion = firstInstance?.type === 'Minion'
                // Special handling for Minions: remove in increments of party size
                const instancesToRemove = isMinion ? pcCount : 1
                
                // Sort instances by duplicate number (highest first)
                const instances = group.instances.sort((a, b) => {
                  const aNum = a.duplicateNumber || 1
                  const bNum = b.duplicateNumber || 1
                  return bNum - aNum
                })
                
                // Determine how many instances we'll have after removal
                const instancesAfterRemoval = Math.max(0, instances.length - instancesToRemove)
                const isLastInstance = instancesAfterRemoval === 0
                
                if (instances.length > 0) {
                  // Remove the specified number of instances (highest numbered ones)
                  const instancesToDelete = instances.slice(0, instancesToRemove)
                  
                  if (isLastInstance) {
                    // Add temporary spacer before removing to prevent browser auto-scroll
                    const groupIndex = entityGroups.findIndex(g => g.baseName === group.baseName && g.type === 'adversary')
                    // Set spacer BEFORE removing so it's in place when card disappears
                    setRemovingCardSpacer({ baseName: group.baseName, groupIndex })
                    setSpacerShrinking(false) // Start at full width
                    
                    // Wait for React to render spacer, then remove the adversaries
                    requestAnimationFrame(() => {
                      requestAnimationFrame(() => {
                        instancesToDelete.forEach(instance => {
                          deleteAdversary(instance.id)
                        })
                        
                        // After card is removed, start shrinking spacer
                        requestAnimationFrame(() => {
                          requestAnimationFrame(() => {
                            setSpacerShrinking(true) // Trigger shrink animation
                            
                            // Remove spacer after animation completes
                            setTimeout(() => {
                              setRemovingCardSpacer(null)
                              setSpacerShrinking(false)
                            }, 300) // Match CSS transition duration
                          })
                        })
                      })
                    })
                  } else {
                    // Not last instance - remove the specified number of instances
                    instancesToDelete.forEach(instance => {
                      deleteAdversary(instance.id)
                    })
                  }
                }
              } : undefined}
            />
          </Panel>
              )
            })
            
            // If spacer wasn't matched (card already removed), insert it at the stored index
            if (removingCardSpacer && !items.some(item => item?.key === `spacer-${removingCardSpacer.baseName}`)) {
              // Insert spacer at the original groupIndex position
              const insertIndex = Math.min(removingCardSpacer.groupIndex, items.length)
              items.splice(insertIndex, 0,
                <Panel 
                  key={`spacer-${removingCardSpacer.baseName}`}
                  style={{ 
                    width: spacerShrinking ? '0px' : `${columnWidth + gap}px`,
                    flexShrink: 0,
                    flexGrow: 0,
                    flex: 'none',
                    paddingLeft: spacerShrinking ? '0px' : `${gap}px`,
                    paddingRight: '0',
                    paddingTop: spacerShrinking ? '0px' : `${gap}px`,
                    paddingBottom: spacerShrinking ? '0px' : `${gap}px`,
                    scrollSnapAlign: 'none',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'stretch',
                    height: '100%',
                    opacity: 0,
                    transition: 'width 0.3s ease, padding-left 0.3s ease, padding-top 0.3s ease, padding-bottom 0.3s ease'
                  }}
                />
              )
            }
            
            return items
          })()
        )}
        {/* Blank spacer column to allow scrolling one more column width - only when browser is open */}
        {browserOpenAtPosition !== null && (
          <div style={{
            width: `${columnWidth + gap}px`,
            flexShrink: 0,
            flexGrow: 0,
            flex: 'none',
            height: '100%'
          }} />
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
