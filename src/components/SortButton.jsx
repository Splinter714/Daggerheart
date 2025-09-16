import React, { useState } from 'react'
import { ArrowUpDown } from 'lucide-react'

const SortButton = ({ adversaries, onSortAdversaries }) => {
  const [isSorting, setIsSorting] = useState(false)

  const handleSort = () => {
    if (!adversaries || adversaries.length === 0) return
    
    setIsSorting(true)
    
    // Sort by type priority first, then by name (including duplicate numbers)
    const sortedAdversaries = [...adversaries].sort((a, b) => {
      // Define type priority order
      const typePriority = {
        'Leader': 1,
        'Bruiser': 2,
        'Horde': 3,
        'Ranged': 4,
        'Standard': 5,
        'Other': 6,
        'Minion': 7
      }
      
      // Primary sort by type priority
      const priorityA = typePriority[a.type] || 6 // Default to 'Other' priority
      const priorityB = typePriority[b.type] || 6 // Default to 'Other' priority
      
      if (priorityA !== priorityB) {
        return priorityA - priorityB
      }
      
      // Secondary sort by name (including duplicate numbers)
      const nameA = a.name || ''
      const nameB = b.name || ''
      
      // Extract base name and duplicate number for robust sorting
      const parseName = (name) => {
        const match = name.match(/^(.*)\s\((\d+)\)$/)
        if (match) {
          return { base: match[1], num: parseInt(match[2]) }
        }
        return { base: name, num: 0 } // Assume 0 for non-duplicated names
      }

      const parsedA = parseName(nameA)
      const parsedB = parseName(nameB)

      if (parsedA.base < parsedB.base) return -1
      if (parsedA.base > parsedB.base) return 1

      return parsedA.num - parsedB.num
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