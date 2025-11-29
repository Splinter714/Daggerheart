import { useCallback, useEffect, useState } from 'react'

/**
 * Manages opening/closing the right-side browser overlay while keeping the
 * horizontal scroll position stable. Encapsulates the scroll bookkeeping that
 * used to live inline inside DashboardView.
 */
export const useBrowserOverlay = ({ scrollContainerRef, columnWidth, gap, onCloseReset }) => {
  const [browserOpenAtPosition, setBrowserOpenAtPosition] = useState(null)

  const handleOpenBrowser = useCallback(
    (position) => {
      setBrowserOpenAtPosition(position)

      if (scrollContainerRef.current) {
        const container = scrollContainerRef.current
        const currentScroll = container.scrollLeft
        const maxScroll = container.scrollWidth - container.clientWidth
        const wasAtMaxScroll = Math.abs(currentScroll - maxScroll) < 1

        container._scrollBeforeBrowserOpen = currentScroll
        container._scrollWidthBeforeOpen = container.scrollWidth
        container._wasAtMaxScrollBeforeBrowserOpen = wasAtMaxScroll
      }
    },
    [scrollContainerRef]
  )

  const handleCloseBrowser = useCallback(() => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current
      container._scrollBeforeBrowserClose = container.scrollLeft
      container._scrollWidthBeforeClose = container.scrollWidth
    }

    setBrowserOpenAtPosition(null)
    onCloseReset?.()
  }, [scrollContainerRef, onCloseReset])

  useEffect(() => {
    if (!scrollContainerRef.current) return

    if (browserOpenAtPosition !== null) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (!scrollContainerRef.current) return
          const updatedContainer = scrollContainerRef.current

          const wasAtMaxScroll = updatedContainer._wasAtMaxScrollBeforeBrowserOpen
          const scrollBeforeOpen = updatedContainer._scrollBeforeBrowserOpen || 0

          if (wasAtMaxScroll) {
            updatedContainer.scrollLeft = scrollBeforeOpen
          } else {
            updatedContainer.scrollLeft = scrollBeforeOpen
          }

          delete updatedContainer._scrollBeforeBrowserOpen
          delete updatedContainer._wasAtMaxScrollBeforeBrowserOpen
        })
      })
    } else {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (!scrollContainerRef.current) return
          const updatedContainer = scrollContainerRef.current
          const scrollBeforeClose = updatedContainer._scrollBeforeBrowserClose || 0
          const newMaxScroll = updatedContainer.scrollWidth - updatedContainer.clientWidth
          const targetScroll = Math.min(scrollBeforeClose, newMaxScroll)
          updatedContainer.scrollLeft = targetScroll

          delete updatedContainer._scrollBeforeBrowserClose
        })
      })
    }
  }, [browserOpenAtPosition, columnWidth, gap, scrollContainerRef])

  return {
    browserOpenAtPosition,
    handleOpenBrowser,
    handleCloseBrowser
  }
}

