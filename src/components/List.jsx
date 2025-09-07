import React, { useState } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

import { BulkClearButton } from './Buttons'
import Button from './Buttons'
import Cards from './Cards'
import { AddItemButton } from './Cards'

const List = ({ 
  items, 
  type, // 'countdown', 'adversary', or 'environment'
  onDelete, 
  onEdit, 
  onToggleVisibility, 
  onReorder,
  onItemSelect,
  selectedItem,
  selectedType,
  onOpenDatabase,
  onApplyDamage,
  onApplyHealing,
  onApplyStressChange,
  onAdvance, // For countdowns
  onIncrement, // For countdowns
  onDecrement, // For countdowns
  isEditMode = false
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      // Configure for better mobile touch support
      activationConstraint: {
        distance: 8, // Require 8px movement before drag starts
      },
    }),
    useSensor(TouchSensor, {
      // Better mobile touch support
      activationConstraint: {
        delay: 250, // 250ms delay before drag starts
        tolerance: 5, // 5px tolerance for touch movement
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event) => {
    const { active, over } = event

    if (active.id !== over.id) {
      const oldIndex = items.findIndex(item => item.id === active.id)
      const newIndex = items.findIndex(item => item.id === over.id)
      onReorder([oldIndex, newIndex])
    }
  }

  const handleItemClick = (item) => {
    console.log('Item clicked:', item.name, 'Type:', type)
    onItemSelect(item, type)
  }

  const isCountdown = type === 'countdown'
  const isAdversary = type === 'adversary'
  const isEnvironment = type === 'environment'

  return (
    <div>
      {/* List Container */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={items.map(item => item.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="list-container">
            {items.map((item) => (
              <SortableItem
                key={item.id}
                item={item}
                type={type}
                isSelected={selectedItem?.id === item.id && selectedType === type}
                onItemClick={handleItemClick}
                onDelete={onDelete}
                onEdit={onEdit}
                onToggleVisibility={onToggleVisibility}
                onApplyDamage={onApplyDamage}
                onApplyHealing={onApplyHealing}
                onApplyStressChange={onApplyStressChange}
                onIncrement={onIncrement}
                onDecrement={onDecrement}
                isEditMode={isEditMode}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  )
}

// Sortable Item Component
const SortableItem = ({ 
  item, 
  type, 
  isSelected, 
  onItemClick, 
  onDelete, 
  onEdit, 
  onToggleVisibility,
  onApplyDamage,
  onApplyHealing,
  onApplyStressChange,
  onIncrement,
  onDecrement,
  isEditMode
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`sortable-item ${isSelected ? 'selected' : ''}`}
    >
      <Cards
        item={item}
        type={type}
        mode="compact"
        onClick={onItemClick}
        onDelete={onDelete}
        onEdit={onEdit}
        onToggleVisibility={onToggleVisibility}
        onApplyDamage={onApplyDamage}
        onApplyHealing={onApplyHealing}
        onApplyStressChange={onApplyStressChange}
        onIncrement={onIncrement}
        onDecrement={onDecrement}
        isEditMode={isEditMode}
        dragAttributes={isEditMode ? attributes : null}
        dragListeners={isEditMode ? listeners : null}
      />
    </div>
  )
}

export default List
