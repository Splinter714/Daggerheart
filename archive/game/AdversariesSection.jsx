import React from 'react'
import EntityListSection from './EntityListSection'

const AdversariesSection = ({
  adversaries,
  sectionVisibility,
  toggleSection,
  onOpenDatabase,
  onDeleteItem,
  onEditItem,
  onToggleVisibility,
  onReorder,
  onItemSelect,
  selectedItem,
  selectedType,
  onApplyDamage,
  onApplyHealing,
  onApplyStressChange,
  isEditMode
}) => {
  return (
    <div className="adversaries-section">
      <EntityListSection
        title="Adversaries"
        sectionKey="adversaries"
        sectionVisibility={sectionVisibility}
        toggleSection={toggleSection}
        items={adversaries}
        onAddClick={() => onOpenDatabase('adversary')}
        addButtonTitle="Browse Adversaries"
        addButtonAria="Browse Adversaries"
        listProps={{
          items: adversaries,
          type: 'adversary',
          onDelete: (id) => onDeleteItem(id, 'adversary'),
          onEdit: (item) => onEditItem(item, 'adversary'),
          onToggleVisibility,
          onReorder,
          onItemSelect,
          selectedItem,
          selectedType,
          onOpenDatabase,
          onApplyDamage,
          onApplyHealing,
          onApplyStressChange,
          isEditMode
        }}
      />
    </div>
  )
}

export default AdversariesSection


