import React from 'react'
import Button from '../controls/Buttons'
import { Plus, ChevronDown, ChevronRight } from 'lucide-react'

const SectionHeader = ({
  title,
  isOpen,
  onToggle,
  hasItems,
  onAddClick,
  addButtonTitle,
  addButtonAria
}) => {
  return (
    <div className="section-header">
      <div className="section-title-row">
        <button 
          className="section-title-button"
          onClick={onToggle}
          title={isOpen ? 'Collapse section' : 'Expand section'}
        >
          {hasItems ? (
            isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />
          ) : (
            <div className="square-16" />
          )}
          <h3 className="section-title">{title}</h3>
        </button>
        {onAddClick && (
          <Button
            action="add"
            size="sm"
            color="purple"
            onClick={onAddClick}
            title={addButtonTitle}
            aria-label={addButtonAria}
          >
            <Plus size={16} />
          </Button>
        )}
      </div>
    </div>
  )
}

export default SectionHeader


