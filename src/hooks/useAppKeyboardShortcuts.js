import { useEffect, useCallback, useMemo } from 'react'

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
  }, [keyboardShortcuts, browserOpenAtPosition, handleCloseBrowser, handleOpenBrowser, getEntityGroups])

  // Set up keyboard event listeners with capture phase to catch events before system handlers
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown, true)
    return () => {
      document.removeEventListener('keydown', handleKeyDown, true)
    }
  }, [handleKeyDown])
}
