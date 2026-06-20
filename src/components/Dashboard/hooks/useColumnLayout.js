import { useState, useMemo, useLayoutEffect } from 'react'
import { DASHBOARD_GAP } from '../constants'

const getMinColumnWidth = (columnCount) => {
  if (columnCount === 1) return 200
  return 350
}

// effectiveGap: the gap between every column (may be wider than DASHBOARD_GAP when grouping is on).
// edgePadding: the padding-left/right on the scroll container (may be wider than DASHBOARD_GAP when grouping is on).
const calculateColumnLayout = (width, effectiveGap = DASHBOARD_GAP, edgePadding = DASHBOARD_GAP) => {
  if (width <= 0) return { visibleColumns: 1, columnWidth: getMinColumnWidth(1) }

  const availableWidth = width - (edgePadding * 2)
  let layout = { visibleColumns: 1, columnWidth: availableWidth }

  for (let columns = 1; columns <= 5; columns += 1) {
    const totalGapWidth = (columns - 1) * effectiveGap
    const columnWidth = (availableWidth - totalGapWidth) / columns

    if (columnWidth >= getMinColumnWidth(columns)) {
      const totalWidth = columns * columnWidth + totalGapWidth
      if (totalWidth <= availableWidth) {
        layout = { visibleColumns: columns, columnWidth }
      }
    }
  }

  const totalWidth = layout.visibleColumns * layout.columnWidth + (layout.visibleColumns - 1) * effectiveGap
  if (totalWidth > availableWidth) {
    layout = { visibleColumns: 1, columnWidth: availableWidth }
  }

  return layout
}

// visualViewport.width settles more reliably than innerWidth on iOS standalone PWAs,
// and its resize event fires when iOS finishes adjusting the viewport on launch/rotate.
const getWindowWidth = () => {
  if (typeof window === 'undefined') return 0
  return window.visualViewport?.width || window.innerWidth
}

// sideRailWidth: the width of the side rail when it's on the right (0 when on bottom).
// Passing it here lets column COUNT always be computed as-if the rail is on the right,
// so the column switch and the rail placement switch happen at the same window width.
export const useColumnLayout = (scrollContainerRef, effectiveGap = DASHBOARD_GAP, edgePadding = DASHBOARD_GAP, sideRailWidth = 0) => {
  const [windowWidth, setWindowWidth] = useState(getWindowWidth)

  // visibleColumns: always derived from window width minus the side rail, regardless of
  // actual rail position. This keeps the column-count breakpoint and the rail-placement
  // breakpoint identical, since both depend on window.innerWidth - sideRailWidth.
  const visibleColumns = useMemo(
    () => calculateColumnLayout(windowWidth - sideRailWidth, effectiveGap, edgePadding).visibleColumns,
    [windowWidth, sideRailWidth, effectiveGap, edgePadding]
  )

  // containerWidth: derived from windowWidth matching the CSS layout logic.
  // When visibleColumns >= 2, the rail is on the right and adds paddingRight = sideRailWidth.
  // When visibleColumns < 2 (mobile), the rail is at the bottom and doesn't affect width.
  // This avoids a post-mount DOM measurement that would cause a visible flash.
  const containerWidth = visibleColumns >= 2
    ? windowWidth - sideRailWidth
    : windowWidth

  // columnWidth: derived from the container width so columns fill available space.
  const columnWidth = useMemo(() => {
    const availableWidth = containerWidth - edgePadding * 2
    const totalGapWidth = (visibleColumns - 1) * effectiveGap
    const width = (availableWidth - totalGapWidth) / visibleColumns
    return Math.max(width, getMinColumnWidth(visibleColumns))
  }, [containerWidth, visibleColumns, effectiveGap, edgePadding])

  useLayoutEffect(() => {
    const handleResize = () => setWindowWidth(getWindowWidth())

    // Re-read after layout to catch any initial mismatch before the browser paints.
    handleResize()

    window.addEventListener('resize', handleResize)
    document.addEventListener('visibilitychange', handleResize)
    window.visualViewport?.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      document.removeEventListener('visibilitychange', handleResize)
      window.visualViewport?.removeEventListener('resize', handleResize)
    }
  }, [])

  return {
    gap: DASHBOARD_GAP,
    columnWidth,
    visibleColumns,
  }
}

