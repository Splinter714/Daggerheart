import React from 'react'
import EntityListSection from './EntityListSection'

const EnvironmentsSection = ({
  environments,
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
  isEditMode
}) => {
  return (
    <EntityListSection
      title="Environments"
      sectionKey="environments"
      sectionVisibility={sectionVisibility}
      toggleSection={toggleSection}
      items={environments}
      onAddClick={() => onOpenDatabase('environment')}
      addButtonTitle="Browse Environments"
      addButtonAria="Browse Environments"
      listProps={{
        items: environments,
        type: 'environment',
        onDelete: (id) => onDeleteItem(id, 'environment'),
        onEdit: (item) => onEditItem(item, 'environment'),
        onToggleVisibility,
        onReorder,
        onItemSelect,
        selectedItem,
        selectedType,
        onOpenDatabase,
        isEditMode
      }}
    />
  )
}

export default EnvironmentsSection


