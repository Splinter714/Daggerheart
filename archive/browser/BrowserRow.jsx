import React from 'react'
import Button from '../controls/Buttons'
import { Plus } from 'lucide-react'
import Cards from '../cards/Cards'

const BrowserRow = ({ item, isExpanded, onToggleExpand, onAdd, fallbackType }) => {
  const cardType = item.category?.toLowerCase() || fallbackType
  const expandedItem = {
    ...item,
    hp: 0,
    stress: 0
  }

  return (
    <>
      <tr 
        className="browser-row"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          onToggleExpand(item)
        }}
      >
        <td className="column-name" data-label="Name">{item.name}</td>
        <td className="column-tier" data-label="Tier">{item.tier}</td>
        <td className="column-type" data-label="Type">{item.displayType}</td>
        <td className="column-description" data-label="Difficulty">{item.displayDifficulty}</td>
        <td className="column-action" data-label="Add">
          <Button
            action="add"
            size="sm"
            color="purple"
            onClick={(e) => {
              e.stopPropagation()
              onAdd(item)
            }}
            aria-label={`Add ${item.name}`}
          >
            <Plus size={14} />
          </Button>
        </td>
      </tr>

      {isExpanded && (
        <tr className="condensed-card-row">
          <td colSpan={5} className="condensed-card-cell">
            <div className="condensed-card-container">
              <Cards item={expandedItem} type={cardType} mode="compact" />
            </div>
          </td>
        </tr>
      )}

      {isExpanded && (
        <tr className="expanded-card-row">
          <td colSpan={5} className="expanded-card-cell">
            <div className="expanded-card-container">
              <Cards item={expandedItem} type={cardType} mode="expanded" />
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

export default BrowserRow


