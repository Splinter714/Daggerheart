import React, { useState, useEffect } from 'react'
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
  // Mobile detection
  const [isMobile, setIsMobile] = useState(false)
  
  // Mobile drawer state
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerItem, setDrawerItem] = useState(null)
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 800)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])
  
  // Handle mobile card tap - open drawer
  const handleMobileCardClick = (item) => {
    if (isMobile) {
      setDrawerItem(item)
      setDrawerOpen(true)
      
      // Focus the tapped card in the main view
      const cardElement = document.querySelector(`[data-item-id="${item.id}"]`)
      if (cardElement) {
        cardElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        })
      }
    } else {
      // On desktop, use normal item selection
      onItemSelect(item, type)
    }
  }
  
  // Close drawer
  const closeDrawer = () => {
    setDrawerOpen(false)
    setDrawerItem(null)
    // Reset drawer state when closing
    setDrawerOffset(0)
    setTouchStart(null)
    setTouchCurrent(null)
  }

  // Reset drawer offset when drawer opens
  useEffect(() => {
    if (drawerOpen) {
      setDrawerOffset(0)
    }
  }, [drawerOpen])
  
  // Touch gesture handling for drawer
  const [touchStart, setTouchStart] = useState(null)
  const [touchCurrent, setTouchCurrent] = useState(null)
  const [drawerOffset, setDrawerOffset] = useState(0)
  
  const handleTouchStart = (e) => {
    // EXPANDED CARD DRAWER STRATEGY: Prioritize scrolling, only handle swipe-to-dismiss on header
    
    // Only handle swipe-to-dismiss for header touches
    const isHeaderTouch = e.target.closest('.drawer-header')
    
    if (!isHeaderTouch) {
      // For all non-header touches, allow normal scrolling
      // Don't prevent default - let the browser handle scrolling
      return
    }
    
    // Only for header touches, handle swipe-to-dismiss
    e.preventDefault()
    e.stopPropagation()
    
    const touchY = e.targetTouches[0].clientY
    setTouchStart(touchY)
    setTouchCurrent(touchY)
    setDrawerOffset(0)
  }
  
  const handleTouchMove = (e) => {
    if (!touchStart) return
    
    // EXPANDED CARD DRAWER STRATEGY: Only handle header swipe gestures
    const currentY = e.targetTouches[0].clientY
    const deltaY = currentY - touchStart
    
    // Only handle downward swipes for swipe-to-dismiss
    if (deltaY > 0) {
      e.preventDefault()
      e.stopPropagation()
      setTouchCurrent(currentY)
      setDrawerOffset(deltaY)
    }
    // For upward swipes, reset state to allow normal scrolling
    else if (deltaY < 0) {
      setTouchStart(null)
      setTouchCurrent(null)
      setDrawerOffset(0)
    }
  }
  
  const handleTouchEnd = (e) => {
    if (!touchStart || !touchCurrent) return
    
    // EXPANDED CARD DRAWER STRATEGY: Handle header swipe gestures only
    const distance = touchCurrent - touchStart
    
    // Always prevent default for header swipe gestures
    e.preventDefault()
    e.stopPropagation()
    
    // If swipe was far enough, smoothly animate downward to close
    if (distance > 100) {
      setDrawerOffset(window.innerHeight)
      setTimeout(() => {
        closeDrawer()
      }, 300)
    }
    // If swipe was significant but not enough to close, snap back smoothly
    else if (distance > 30) {
      setDrawerOffset(0)
      setTimeout(() => {
        setTouchStart(null)
        setTouchCurrent(null)
      }, 50)
    }
    // If swipe was small, just reset
    else {
      setDrawerOffset(0)
      setTouchStart(null)
      setTouchCurrent(null)
    }
  }
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
                isMobile={isMobile}
                onMobileCardClick={handleMobileCardClick}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      
      {/* Mobile Bottom Drawer */}
      {isMobile && (
        <div className={`mobile-drawer ${drawerOpen ? 'open' : ''}`}>
          <div className="drawer-backdrop" onClick={closeDrawer} />
          <div 
            className="drawer-content"
            style={{
              transform: drawerOpen 
                ? `translateY(${drawerOffset}px)` 
                : 'translateY(100%)',
              transition: touchStart ? 'none' : 'transform 0.3s ease'
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div className="drawer-header" onClick={() => {
              // Use same smooth closing animation as swipe-to-close
              setDrawerOffset(window.innerHeight)
              setTimeout(() => {
                closeDrawer()
              }, 300)
            }}>
              <div className="drawer-handle" />
            </div>
            <div className="drawer-body">
              {drawerItem && (
                <Cards
                  item={drawerItem}
                  type={type}
                  mode="expanded"
                  onDelete={onDelete}
                  onEdit={onEdit}
                  onToggleVisibility={onToggleVisibility}
                  onApplyDamage={onApplyDamage}
                  onApplyHealing={onApplyHealing}
                  onApplyStressChange={onApplyStressChange}
                  onIncrement={onIncrement}
                  onDecrement={onDecrement}
                  isEditMode={isEditMode}
                  dragAttributes={null}
                  dragListeners={null}
                />
              )}
            </div>
          </div>
        </div>
      )}
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
  isEditMode,
  isMobile,
  onMobileCardClick
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
      data-item-id={item.id}
    >
      {/* Always show compact card */}
      <Cards
        item={item}
        type={type}
        mode="compact"
        onClick={() => onMobileCardClick(item)}
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
