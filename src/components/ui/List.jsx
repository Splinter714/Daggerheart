import React, { useState, useEffect, useRef } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

import Cards from '../cards/Cards'
import useSwipeDrawer from '../../hooks/useSwipeDrawer'
import usePreventPullToRefresh from '../../hooks/usePreventPullToRefresh'

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
  // onOpenDatabase,
  onApplyDamage,
  onApplyHealing,
  onApplyStressChange,
  // onAdvance, // For countdowns
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
      
      // Auto-scroll behavior removed - no longer needed
    } else {
      // On desktop, use normal item selection
      if (onItemSelect) {
        onItemSelect(item, type)
      }
    }
  }
  
  // Close drawer (resetSwipeState comes from useSwipeDrawer below)
  const closeDrawer = () => {
    setDrawerOpen(false)
    setDrawerItem(null)
    resetSwipeState()
  }

  const {
    drawerOffset,
    setDrawerOffset,
    touchHandlers: { onTouchStart: handleTouchStart, onTouchMove: handleTouchMove, onTouchEnd: handleTouchEnd },
    resetSwipeState,
  } = useSwipeDrawer({
    headerSelector: '.drawer-header',
    bodySelector: '.drawer-body',
    closeThreshold: 100,
    snapThreshold: 30,
    onClose: () => closeDrawer(),
  })

  // Reset drawer offset when drawer opens
  useEffect(() => {
    if (drawerOpen) {
      setDrawerOffset(0)
    }
  }, [drawerOpen, setDrawerOffset])

  // Prevent pull-to-refresh in this drawer instance as well
  const drawerContentRef = useRef(null)
  usePreventPullToRefresh(drawerContentRef, drawerOpen)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      // Configure for better mobile touch support
      activationConstraint: {
        distance: 10, // Slightly more to avoid accidental drags
      },
    }),
    useSensor(TouchSensor, {
      // Better mobile touch support
      activationConstraint: {
        delay: 200, // a bit faster
        tolerance: 8, // allow a little more finger wobble before starting drag
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

  // const handleItemClick = (item) => onItemSelect(item, type)

  // type checks no longer needed locally

  return (
    <div
      onTouchStart={() => { try { document.body.classList.add('dragging') } catch (_e) { /* ignore */ } }}
      onTouchEnd={() => { try { document.body.classList.remove('dragging') } catch (_e) { /* ignore */ } }}
      onTouchCancel={() => { try { document.body.classList.remove('dragging') } catch (_e) { /* ignore */ } }}
    >
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
                onDelete={onDelete}
                onEdit={onEdit}
                onToggleVisibility={onToggleVisibility}
                onApplyDamage={onApplyDamage}
                onApplyHealing={onApplyHealing}
                onApplyStressChange={onApplyStressChange}
                onIncrement={onIncrement}
                onDecrement={onDecrement}
                isEditMode={isEditMode}
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
              transition: drawerOffset ? 'none' : 'transform 0.3s ease'
            }}
            ref={drawerContentRef}
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
  onDelete, 
  onEdit, 
  onToggleVisibility,
  onApplyDamage,
  onApplyHealing,
  onApplyStressChange,
  onIncrement,
  onDecrement,
  isEditMode,
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
      onClick={(_e) => {
        if (!isDragging) {
          onMobileCardClick(item)
        }
      }}
    >
      {/* Always show compact card */}
      <Cards
        item={item}
        type={type}
        mode="compact"
        onClick={(e) => {
          // Don't interfere with parent row click
          if (e && e.stopPropagation) e.stopPropagation()
        }}
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
