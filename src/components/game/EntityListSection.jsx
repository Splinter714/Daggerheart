import React from 'react'
import List from '../ui/List'
import SectionHeader from './SectionHeader'

const EntityListSection = ({
  title,
  sectionKey,
  sectionVisibility,
  toggleSection,
  items = [],
  onAddClick,
  addButtonTitle,
  addButtonAria,
  listProps
}) => {
  const hasItems = Array.isArray(items) && items.length > 0
  const isOpen = !!sectionVisibility?.[sectionKey]

  return (
    <div className="game-section">
      <SectionHeader
        title={title}
        isOpen={isOpen}
        onToggle={() => toggleSection(sectionKey)}
        hasItems={hasItems}
        onAddClick={onAddClick}
        addButtonTitle={addButtonTitle}
        addButtonAria={addButtonAria}
      />
      {isOpen && hasItems && (
        <List {...listProps} />
      )}
    </div>
  )
}

export default EntityListSection


