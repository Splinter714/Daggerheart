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
    // Always prevent default to avoid pull-to-refresh
    e.preventDefault()
    e.stopPropagation()
    
    // Check if touch is on header OR on content when scrolled to top
    const isHeaderTouch = e.target.closest('.drawer-header')
    const drawerBody = e.target.closest('.drawer-body')
    
    // If touching content, check if we're scrolled to the top
    let isContentAtTop = false
    if (drawerBody) {
      isContentAtTop = drawerBody.scrollTop <= 10 // Allow small tolerance
    }
    
    // Only handle swipe-to-dismiss for header touches OR content touches when at top
    if (!isHeaderTouch && !isContentAtTop) {
      // Don't handle swipe-to-dismiss for content touches when not at top
      return
    }
    
    const touchY = e.targetTouches[0].clientY
    setTouchStart(touchY)
    setTouchCurrent(touchY)
    setDrawerOffset(0)
  }
  
  const handleTouchMove = (e) => {
    // Always prevent default to avoid pull-to-refresh
    e.preventDefault()
    e.stopPropagation()
    
    if (!touchStart) return
    
    const currentY = e.targetTouches[0].clientY
    const deltaY = currentY - touchStart
    
    // Only handle swipe-to-dismiss for downward swipes (positive deltaY)
    if (deltaY > 0) {
      setTouchCurrent(currentY)
      setDrawerOffset(deltaY)
    } else if (deltaY < -10) {
      // If swiping up more than 10px, reset the swipe state to prevent scroll
      setTouchStart(null)
      setTouchCurrent(null)
      setDrawerOffset(0)
    }
  }
  
  const handleTouchEnd = (e) => {
    if (!touchStart || !touchCurrent) return
    
    const distance = touchCurrent - touchStart
    
    // Only prevent default if this was a significant downward swipe
    if (distance > 30) {
      e.preventDefault()
      e.stopPropagation()
    }
    
    // If swipe was far enough, smoothly animate downward to close
    if (distance > 100) {
      // Animate drawer offset to full height (smooth downward close)
      setDrawerOffset(window.innerHeight)
      
      // Then close the drawer after the transition completes
      setTimeout(() => {
        closeDrawer()
      }, 300) // Match the CSS transition duration
    }
    // If swipe was significant but not enough to close, snap back smoothly
    else if (distance > 30) {
      setDrawerOffset(0)
    }
    // If swipe was small, just reset
    else if (distance <= 30) {
      setDrawerOffset(0)
    }
    
    setTouchStart(null)
    setTouchCurrent(null)
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
