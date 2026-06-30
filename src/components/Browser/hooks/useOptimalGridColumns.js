import { useState, useCallback, useEffect } from 'react'

// Optimal grid columns from container width + item count. Extracted from Browser.jsx (Phase 4).
export const useOptimalGridColumns = (itemCount, containerRef) => {
  const [columns, setColumns] = useState('max-content')
  
  const calculateColumns = useCallback(() => {
    if (!containerRef.current || itemCount <= 3) {
      return 'max-content'
    }
    
    const containerWidth = containerRef.current.offsetWidth
    const estimatedItemWidth = 120 // Estimated width per item including gap
    const maxColumns = Math.floor(containerWidth / estimatedItemWidth)
    
    if (maxColumns <= 1) return 'max-content'
    
    // Smart distribution logic
    if (itemCount === 4) return 'max-content max-content'
    if (itemCount === 5) return maxColumns >= 2 ? 'max-content max-content' : 'max-content'
    if (itemCount === 6) return maxColumns >= 2 ? 'max-content max-content' : 'max-content'
    if (itemCount === 7) return maxColumns >= 3 ? 'max-content max-content max-content' : maxColumns >= 2 ? 'max-content max-content' : 'max-content'
    
    // For larger counts, use CSS auto-fit as fallback
    return 'repeat(auto-fit, minmax(80px, max-content))'
  }, [itemCount, containerRef])
  
  useEffect(() => {
    const newColumns = calculateColumns()
    setColumns(newColumns)
    
    // Set up ResizeObserver to recalculate when container size changes
    const resizeObserver = new ResizeObserver(() => {
      const updatedColumns = calculateColumns()
      setColumns(updatedColumns)
    })
    
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current)
    }
    
    return () => {
      resizeObserver.disconnect()
    }
  }, [calculateColumns])
  
  return columns
}
