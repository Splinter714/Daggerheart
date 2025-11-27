import { useEffect, useCallback, useMemo, useRef } from 'react'

/**
 * Hook that sets up all application keyboard shortcuts
 * 
 * @param {Object} dependencies - All the functions and state needed for shortcuts
 */
export const useAppKeyboardShortcuts = ({
  // Browser controls
  browserOpenAtPosition,
  handleCloseBrowser,
  handleOpenBrowser,
  getEntityGroups,
  // Fear controls
  fear,
    updateFear
  }) => {
  // Track scroll operations to prevent double-triggering
  const scrollInProgressRef = useRef(false)
  const scrollTimeoutRef = useRef(null)
  const currentTargetIndexRef = useRef(null)
  
  // Define all keyboard shortcuts
  const keyboardShortcuts = useMemo(() => ({
    // Browser toggle (Shift+Space - works to open and close, even in input fields)
    'shift+space': () => {
      if (browserOpenAtPosition !== null) {
        handleCloseBrowser()
      } else {
        const groups = getEntityGroups()
        handleOpenBrowser(groups.length)
      }
    },
    // Close browser overlay (works even in input fields)
    'escape': () => {
      if (browserOpenAtPosition !== null) {
        handleCloseBrowser()
      }
    },
    // Fear increment
    '+': () => {
      const currentFear = fear?.value || 0
      const newFear = Math.min(12, currentFear + 1)
      updateFear(newFear)
    },
    '=': () => {
      // Also handle = key (same as + on most keyboards)
      const currentFear = fear?.value || 0
      const newFear = Math.min(12, currentFear + 1)
      updateFear(newFear)
    },
    // Fear decrement
    '-': () => {
      const currentFear = fear?.value || 0
      const newFear = Math.max(0, currentFear - 1)
      updateFear(newFear)
    },
    '_': () => {
      // Also handle _ key (shift+- on most keyboards)
      const currentFear = fear?.value || 0
      const newFear = Math.max(0, currentFear - 1)
      updateFear(newFear)
    }
  }), [
    browserOpenAtPosition,
    handleCloseBrowser,
    handleOpenBrowser,
    getEntityGroups,
    fear,
    updateFear
  ])

  // Keyboard event handler
  const handleKeyDown = useCallback((event) => {
    // Don't handle on mobile
    const isMobile = window.matchMedia('(max-width: 800px)').matches
    if (isMobile) return

    // Handle Shift+Space - check if Shift is held and Space is pressed
    const isSpaceKey = event.key === ' ' || event.key === 'Space' || event.code === 'Space'
    const isShiftSpace = event.shiftKey && isSpaceKey && !event.ctrlKey && !event.metaKey && !event.altKey
    
    if (isShiftSpace) {
      console.log('[Keyboard] Shift+Space detected, toggling browser')
      // Prevent default and stop all propagation to override system shortcuts
      event.preventDefault()
      event.stopPropagation()
      event.stopImmediatePropagation()
      
      // Execute the toggle
      if (browserOpenAtPosition !== null) {
        handleCloseBrowser()
      } else {
        const groups = getEntityGroups()
        handleOpenBrowser(groups.length)
      }
      return
    }

    // Don't handle if user is typing in an input field (except Escape and Shift+Space)
    const activeElement = document.activeElement
    const ignoreTags = ['INPUT', 'TEXTAREA', 'SELECT']
    if (activeElement && ignoreTags.includes(activeElement.tagName)) {
      const isEscape = event.key === 'Escape'
      const isShiftSpaceInInput = event.shiftKey && isSpaceKey && !event.ctrlKey && !event.metaKey && !event.altKey
      if (!isEscape && !isShiftSpaceInInput) return
    }

    // Build key string (e.g., "ctrl+b", "b", "escape")
    const parts = []
    if (event.ctrlKey || event.metaKey) parts.push('ctrl')
    if (event.shiftKey) parts.push('shift')
    if (event.altKey) parts.push('alt')
    
    // Normalize key name
    let key = event.key.toLowerCase()
    if (key === ' ') key = 'space'
    
    parts.push(key)
    const keyCombo = parts.join('+')

    // Check for exact match first
    if (keyboardShortcuts[keyCombo]) {
      event.preventDefault()
      keyboardShortcuts[keyCombo](event)
      return
    }

    // Check for single key match (only if no modifiers)
    if (!event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey) {
      if (keyboardShortcuts[key]) {
        event.preventDefault()
        keyboardShortcuts[key](event)
        return
      }
    }

    // Handle left/right arrow keys for dashboard scrolling (only when browser is closed)
    if (!event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey) {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        // Only scroll dashboard if browser is closed
        if (browserOpenAtPosition === null) {
          // Don't handle if user is typing in an input field
          const activeElement = document.activeElement
          if (activeElement && ['INPUT', 'TEXTAREA', 'SELECT'].includes(activeElement.tagName)) {
            return
          }

          const scrollContainer = document.querySelector('.dashboard-scroll-container')
          if (scrollContainer) {
            event.preventDefault()
            
            console.log('[Keyboard] Dashboard scroll requested:', {
              key: event.key,
              currentScrollLeft: scrollContainer.scrollLeft,
              containerWidth: scrollContainer.clientWidth,
              scrollWidth: scrollContainer.scrollWidth,
              scrollInProgress: scrollInProgressRef.current
            })
            
            // Get all panels (direct children that have scroll-snap-align)
            const panels = Array.from(scrollContainer.children).filter(
              child => getComputedStyle(child).scrollSnapAlign !== 'none'
            )
            
            console.log('[Keyboard] Found panels:', {
              totalPanels: panels.length,
              panelDetails: panels.map((panel, idx) => ({
                index: idx,
                offsetLeft: panel.offsetLeft,
                offsetWidth: panel.offsetWidth,
                scrollSnapAlign: getComputedStyle(panel).scrollSnapAlign
              }))
            })
            
            if (panels.length > 0) {
              // Get current scroll position - use actual current position even if scrolling
              const currentScroll = scrollContainer.scrollLeft
              
              let currentPanelIndex = 0
              let minDistance = Infinity
              
              panels.forEach((panel, index) => {
                const panelOffsetLeft = panel.offsetLeft
                // Calculate distance from scroll position to panel start
                const distance = Math.abs(panelOffsetLeft - currentScroll)
                
                if (distance < minDistance) {
                  minDistance = distance
                  currentPanelIndex = index
                }
              })
              
              console.log('[Keyboard] Panel detection:', {
                currentScroll,
                currentPanelIndex,
                currentPanelOffsetLeft: panels[currentPanelIndex]?.offsetLeft,
                minDistance,
                allPanels: panels.map((p, i) => ({
                  index: i,
                  offsetLeft: p.offsetLeft,
                  distance: Math.abs(p.offsetLeft - currentScroll)
                }))
              })
              
              // Determine next/previous panel index
              const scrollDirection = event.key === 'ArrowLeft' ? -1 : 1
              const nextPanelIndex = currentPanelIndex + scrollDirection
              
              console.log('[Keyboard] Scrolling decision:', {
                scrollDirection,
                currentPanelIndex,
                nextPanelIndex,
                canScroll: nextPanelIndex >= 0 && nextPanelIndex < panels.length
              })
              
              // Scroll to the next/previous panel if it exists
              if (nextPanelIndex >= 0 && nextPanelIndex < panels.length) {
                const targetPanel = panels[nextPanelIndex]
                const targetScrollPosition = targetPanel.offsetLeft
                
                console.log('[Keyboard] Scrolling to panel:', {
                  index: nextPanelIndex,
                  offsetLeft: targetPanel.offsetLeft,
                  offsetWidth: targetPanel.offsetWidth,
                  targetScrollPosition,
                  currentScroll,
                  scrollInProgress: scrollInProgressRef.current
                })
                
                // Clear any existing timeout first
                if (scrollTimeoutRef.current) {
                  clearTimeout(scrollTimeoutRef.current)
                  scrollTimeoutRef.current = null
                }
                
                // Store the target index to track what we're scrolling to
                currentTargetIndexRef.current = nextPanelIndex
                
                // If a scroll is already in progress, smoothly redirect to the new target
                if (scrollInProgressRef.current) {
                  console.log('[Keyboard] Redirecting scroll to new target', {
                    previousTarget: currentTargetIndexRef.current,
                    newTarget: nextPanelIndex,
                    targetScrollPosition
                  })
                  // Smoothly redirect from current position to new target
                  // This creates a smooth transition to the updated endpoint
                  scrollContainer.scrollTo({
                    left: targetScrollPosition,
                    behavior: 'smooth'
                  })
                } else {
                  // New scroll - use scrollIntoView for better scroll-snap alignment
                  scrollInProgressRef.current = true
                  targetPanel.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest',
                    inline: 'start'
                  })
                }
                
                // After scroll completes, verify alignment and correct if needed
                scrollTimeoutRef.current = setTimeout(() => {
                  // Only proceed if this is still the current target
                  if (currentTargetIndexRef.current === nextPanelIndex) {
                    const finalScroll = scrollContainer.scrollLeft
                    const expectedScroll = targetPanel.offsetLeft
                    const misalignment = Math.abs(finalScroll - expectedScroll)
                    
                    // If there's a misalignment (more than 0.5px), correct it
                    // This handles sub-pixel rendering issues
                    if (misalignment > 0.5) {
                      console.log('[Keyboard] Correcting misalignment:', {
                        finalScroll,
                        expectedScroll,
                        misalignment
                      })
                      // Use instant scroll for correction to avoid animation
                      scrollContainer.scrollTo({
                        left: expectedScroll,
                        behavior: 'auto'
                      })
                    }
                    
                    scrollInProgressRef.current = false
                    currentTargetIndexRef.current = null
                    console.log('[Keyboard] Scroll after action:', {
                      newScrollLeft: scrollContainer.scrollLeft,
                      targetScrollPosition,
                      difference: scrollContainer.scrollLeft - currentScroll,
                      actualDifference: scrollContainer.scrollLeft - targetScrollPosition,
                      misalignment
                    })
                  }
                  scrollTimeoutRef.current = null
                }, 600)
              } else {
                console.log('[Keyboard] Cannot scroll - panel index out of bounds')
              }
            } else {
              console.log('[Keyboard] No panels found, using fallback scroll')
              // Fallback: scroll by panel width if we can't find panels
              const firstChild = scrollContainer.firstElementChild
              if (firstChild) {
                const panelWidth = firstChild.offsetWidth
                const scrollDirection = event.key === 'ArrowLeft' ? -1 : 1
                scrollContainer.scrollBy({ 
                  left: panelWidth * scrollDirection, 
                  behavior: 'smooth' 
                })
              }
            }
          } else {
            console.log('[Keyboard] Scroll container not found')
          }
        }
      }
    }
  }, [keyboardShortcuts, browserOpenAtPosition, handleCloseBrowser, handleOpenBrowser, getEntityGroups])

  // Set up keyboard event listeners with capture phase to catch events before system handlers
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown, true)
    return () => {
      document.removeEventListener('keydown', handleKeyDown, true)
    }
  }, [handleKeyDown])
}
