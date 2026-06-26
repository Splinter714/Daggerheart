import { useRef } from 'react'
import { useOptimalGridColumns } from './hooks/useOptimalGridColumns'

// AdversaryList component that uses the optimal grid columns hook
const AdversaryList = ({ encounter }) => {
  const containerRef = useRef(null)
  const itemCount = encounter.encounterItems?.length || 0
  const gridColumns = useOptimalGridColumns(itemCount, containerRef)
  
  return (
    <div 
      ref={containerRef}
      className="saved-encounter-adversary-list"
      style={{ 
        flex: 1,
        fontSize: '0.8rem',
        color: 'var(--text-secondary)',
        lineHeight: '1.3',
        display: 'grid',
        gridTemplateColumns: gridColumns,
        gap: '0.25rem 1rem',
        gridAutoRows: 'min-content'
      }}>
      {encounter.encounterItems?.length > 0 ? (
        encounter.encounterItems.map((item, index) => {
          const name = item.item.baseName || item.item.name?.replace(/\s+\(\d+\)$/, '') || item.item.name
          return (
            <div key={index} style={{ marginBottom: '0.125rem' }}>
              {item.quantity}x {name}
            </div>
          )
        })
      ) : (
        <div>No adversaries</div>
      )}
    </div>
  )
}

export default AdversaryList
