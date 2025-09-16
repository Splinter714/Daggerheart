import React, { useState } from 'react'
import { ArrowUpDown } from 'lucide-react'

const SortButton = ({ adversaries, onSortAdversaries }) => {
  const [isSorting, setIsSorting] = useState(false)

  const handleSort = () => {
    if (!adversaries || adversaries.length === 0) return
    
    setIsSorting(true)
    
    // Sort by type first, then by name (including duplicate numbers)
    const sortedAdversaries = [...adversaries].sort((a, b) => {
      // First sort by type
      const typeA = a.type || ''
      const typeB = b.type || ''
      
      if (typeA !== typeB) {
        return typeA.localeCompare(typeB)
      }
      
      // If types are the same, sort by name (including duplicate numbers)
      const nameA = a.name || ''
      const nameB = b.name || ''
      
      return nameA.localeCompare(nameB)
    })
    
    // Apply the sorted order
    onSortAdversaries(sortedAdversaries)
    
    // Reset sorting state after a brief delay
    setTimeout(() => {
      setIsSorting(false)
    }, 500)
  }

  const hasAdversaries = adversaries && adversaries.length > 0

  return (
    <button
      style={{
        width: '48px',
        height: '48px',
        borderRadius: '50%',
        background: isSorting ? 'var(--purple)' : 'var(--bg-secondary)',
        border: '1px solid var(--border)',
        color: isSorting ? 'white' : 'var(--text-primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: hasAdversaries ? 'pointer' : 'not-allowed',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
        transition: 'all 0.2s ease',
        position: 'relative',
        pointerEvents: 'auto',
        opacity: hasAdversaries ? 1 : 0.5
      }}
      onClick={handleSort}
      disabled={!hasAdversaries}
      title={hasAdversaries ? 'Sort adversaries by type and name' : 'No adversaries to sort'}
    >
      <ArrowUpDown size={20} />
    </button>
  )
}

export default SortButton