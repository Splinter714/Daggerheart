import { useState, useMemo, useLayoutEffect } from 'react'
import { DASHBOARD_GAP } from '../constants'

const getMinColumnWidth = (columnCount) => {
  if (columnCount === 1) return 200
  return 280
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

const getWindowWidth = () => (typeof window === 'undefined' ? 0 : window.innerWidth)

// sideRailWidth: the width of the side rail when it's on the right (0 when on bottom).
// Passing it here lets column COUNT always be computed as-if the rail is on the right,
// so the column switch and the rail placement switch happen at the same window width.
export const useColumnLayout = (scrollContainerRef, effectiveGap = DASHBOARD_GAP, edgePadding = DASHBOARD_GAP, sideRailWidth = 0) => {
  const [containerWidth, setContainerWidth] = useState(getWindowWidth)
  const [windowWidth, setWindowWidth] = useState(getWindowWidth)

  // visibleColumns: always derived from window width minus the side rail, regardless of
  // actual rail position. This keeps the column-count breakpoint and the rail-placement
  // breakpoint identical, since both depend on window.innerWidth - sideRailWidth.
  const visibleColumns = useMemo(
    () => calculateColumnLayout(windowWidth - sideRailWidth, effectiveGap, edgePadding).visibleColumns,
    [windowWidth, sideRailWidth, effectiveGap, edgePadding]
  )

  // columnWidth: derived from the actual container width so columns fill the available space
  // correctly regardless of which side the rail is on.
  const columnWidth = useMemo(() => {
    const availableWidth = containerWidth - edgePadding * 2
    const totalGapWidth = (visibleColumns - 1) * effectiveGap
    const width = (availableWidth - totalGapWidth) / visibleColumns
    return Math.max(width, getMinColumnWidth(visibleColumns))
  }, [containerWidth, visibleColumns, effectiveGap, edgePadding])

  useLayoutEffect(() => {
    const measureContainer = () => {
      if (scrollContainerRef.current) {
        setContainerWidth(scrollContainerRef.current.clientWidth)
      }
    }
    const handleResize = () => {
      setWindowWidth(window.innerWidth)
      measureContainer()
    }

    measureContainer()
    window.addEventListener('resize', handleResize)

    let resizeObserver
    if (typeof ResizeObserver !== 'undefined' && scrollContainerRef.current) {
      resizeObserver = new ResizeObserver(measureContainer)
      resizeObserver.observe(scrollContainerRef.current)
    }

    return () => {
      window.removeEventListener('resize', handleResize)
      if (resizeObserver) resizeObserver.disconnect()
    }
  }, [scrollContainerRef])

  return {
    gap: DASHBOARD_GAP,
    columnWidth,
    visibleColumns,
  }
}

