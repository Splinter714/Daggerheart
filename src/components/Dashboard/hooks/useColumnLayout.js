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

const getInitialWidth = () => {
  if (typeof window === 'undefined') return 0
  return window.innerWidth
}

export const useColumnLayout = (scrollContainerRef, effectiveGap = DASHBOARD_GAP, edgePadding = DASHBOARD_GAP) => {
  // Start with window width estimate to avoid weird initial render - will be measured accurately in useLayoutEffect
  const [containerWidth, setContainerWidth] = useState(getInitialWidth)

  const layout = useMemo(() => calculateColumnLayout(containerWidth, effectiveGap, edgePadding), [containerWidth, effectiveGap, edgePadding])

  useLayoutEffect(() => {
    const measureWidth = () => {
      if (scrollContainerRef.current) {
        // Use clientWidth to exclude padding, matching the calculation logic
        setContainerWidth(scrollContainerRef.current.clientWidth)
      } else if (typeof window !== 'undefined') {
        setContainerWidth(window.innerWidth)
      }
    }

    measureWidth()
    const handleResize = () => measureWidth()
    window.addEventListener('resize', handleResize)

    let resizeObserver
    if (typeof ResizeObserver !== 'undefined' && scrollContainerRef.current) {
      resizeObserver = new ResizeObserver(() => {
        // Use clientWidth to exclude padding, matching the initial measurement
        if (scrollContainerRef.current) {
          setContainerWidth(scrollContainerRef.current.clientWidth)
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
  }, [scrollContainerRef])

  return {
    gap: DASHBOARD_GAP,
    columnWidth: layout.columnWidth,
    visibleColumns: layout.visibleColumns,
  }
}

