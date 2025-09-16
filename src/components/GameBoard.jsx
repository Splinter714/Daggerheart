import React, { useState, useEffect } from 'react'
import { ChevronDown, Plus, Moon } from 'lucide-react'
import { useGameState, usePersistentState } from '../state/state'
import GameCard from './GameCard'

// Generic list component - can be customized per element type
const ElementList = ({ 
  items, 
  onDelete, 
  onEdit, 
  onToggleVisibility, 
  onReorder, 
  onItemSelect, 
  selectedItem, 
  selectedType, 
  onApplyDamage, 
  onApplyHealing, 
  onApplyStressChange, 
  onIncrement, 
  onDecrement, 
  isEditMode,
  isClearMode,
  elementType,
  adversaries = [] // Pass adversaries for duplicate checking
}) => {
  // Don't render anything for empty sections
  if (!items || items.length === 0) {
    return null
  }

  const renderCard = (item) => {
    const isSelected = selectedItem && selectedItem.id === item.id && selectedType === elementType
    console.log('Card selection check:', { 
      itemId: item.id, 
      selectedItemId: selectedItem?.id, 
      selectedType, 
      elementType, 
      isSelected 
    })
    const commonProps = {
      item,
      mode: 'compact',
      onClick: () => onItemSelect(item, elementType),
      onDelete: isClearMode ? onDelete : undefined,
      dragAttributes: isEditMode ? { draggable: true } : null,
      dragListeners: isEditMode ? {
        onDragStart: (e) => {
          e.dataTransfer.setData('text/plain', item.id)
        }
      } : null,
      adversaries, // Pass adversaries for duplicate checking
      isSelected, // Pass selection state
      isEditMode: isEditMode || isClearMode // Pass edit mode state
    }

    switch (elementType) {
      case 'adversaries':
        return (
          <GameCard
            key={item.id}
            {...commonProps}
            type="adversary"
            onApplyDamage={onApplyDamage}
            onApplyHealing={onApplyHealing}
            onApplyStressChange={onApplyStressChange}
          />
        )
      case 'environments':
        return (
          <GameCard
            key={item.id}
            {...commonProps}
            type="environment"
            onEdit={onEdit}
          />
        )
      case 'countdowns':
        return (
          <GameCard
            key={item.id}
            {...commonProps}
            type="countdown"
            onIncrement={onIncrement}
            onDecrement={onDecrement}
          />
        )
      default:
        return null
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {items.map(renderCard)}
    </div>
  )
}

const GameBoardElementSection = ({
  // Configuration
  elementType, // 'adversaries', 'environments', 'countdowns'
  title, // 'Adversaries', 'Environments', 'Countdowns'
  sectionKey, // 'adversaries', 'environments', 'countdowns'
  
  // Data
  items = [],
  sectionVisibility,
  toggleSection,
  adversaries = [], // All adversaries for duplicate checking
  
  // Actions
  onOpenDatabase,
  onDeleteItem,
  onEditItem,
  onToggleVisibility,
  onReorder,
  onItemSelect,
  
  // Selection state
  selectedItem,
  selectedType,
  isEditMode,
  isClearMode,
  
  // Element-specific props (optional)
  onApplyDamage,
  onApplyHealing,
  onApplyStressChange,
  onIncrement,
  onDecrement,
  
  // Countdown-specific props (optional)
  showInlineCreator,
  onToggleInlineCreator,
  onCreateCountdown,
  fear,
  updateFear,
  handleRollOutcome,
  handleActionRoll,
  showLongTermCountdowns,
  setShowLongTermCountdowns,
  onRestTrigger,
  triggers
}) => {
  const hasItems = items && items.length > 0
  const isOpen = !!sectionVisibility?.[sectionKey]


  return (
    <div style={{marginBottom: '0.75rem'}}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: '0.25rem',
        position: 'relative'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          position: 'relative',
          width: '100%'
        }}>
          <button 
            onClick={() => toggleSection(sectionKey)}
            title={hasItems ? (isOpen ? 'Collapse section' : 'Expand section') : 'No items to expand'}
            disabled={!hasItems}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              background: 'none',
              border: 'none',
              color: hasItems ? 'var(--text-primary)' : 'var(--text-secondary)',
              cursor: hasItems ? 'pointer' : 'default',
              padding: '0.125rem 0.25rem',
              fontSize: 'inherit',
              fontWeight: 'inherit',
              transition: 'opacity 0.2s ease',
              borderRadius: 'var(--radius-sm)',
              opacity: hasItems ? 1 : 0.6
            }}
          >
            {hasItems ? (
              <div style={{
                width: '16px',
                height: '16px',
                transition: 'transform 0.2s ease',
                transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)'
              }}>
                <ChevronDown size={16} />
              </div>
            ) : (
              <div style={{width: '16px', height: '16px', flexShrink: 0}} />
            )}
            <h3 style={{
              fontSize: 'var(--text-base)',
              fontWeight: 600,
              color: 'var(--text-primary)',
              margin: 0,
              padding: 0,
              lineHeight: 1.2,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              whiteSpace: 'nowrap',
              width: '140px', // Fixed width for consistent button positioning
              flexShrink: 0,
              textAlign: 'left'
            }}>{title}</h3>
          </button>
          <button
            className="btn-icon"
            data-color="purple"
            onClick={() => onOpenDatabase(elementType)}
            title={`Browse ${title}`}
            aria-label={`Browse ${title}`}
          >
            <Plus size={16} />
          </button>
        </div>
      </div>
      
      {/* Countdown-specific inline creator */}
      {elementType === 'countdowns' && showInlineCreator?.campaign && (
        <div className="inline-countdown-creator">
          <p>Inline Countdown Creator - Coming Soon</p>
          <button className="btn-text" onClick={() => onToggleInlineCreator('campaign')}>Cancel</button>
        </div>
      )}
      
      {/* Countdown-specific trigger controls */}
      {elementType === 'countdowns' && isOpen && items && items.length > 0 && (
        <div className="countdown-trigger-controls">
          <p>Countdown Trigger Controls - Coming Soon</p>
        </div>
      )}

      {/* Main content */}
      {isOpen && (
        <ElementList
          items={items}
          onDelete={(id) => onDeleteItem(id, elementType)}
          onEdit={(item) => onEditItem(item, elementType)}
          onToggleVisibility={onToggleVisibility}
          onReorder={onReorder}
          onItemSelect={onItemSelect}
          selectedItem={selectedItem}
          selectedType={selectedType}
          onApplyDamage={onApplyDamage}
          onApplyHealing={onApplyHealing}
          onApplyStressChange={onApplyStressChange}
          onIncrement={onIncrement}
          onDecrement={onDecrement}
          isEditMode={isEditMode}
          isClearMode={isClearMode}
          elementType={elementType}
          adversaries={adversaries}
        />
      )}

      {/* Countdown-specific long-term controls */}
      {elementType === 'countdowns' && isOpen && showLongTermCountdowns && items && items.filter(c => c.type === 'long-term').length > 0 && (
        <>
          <div className="long-term-rest-controls">
            <button
              className="btn-text"
              onClick={(e) => {
                e.stopPropagation()
                onRestTrigger('short')
              }}
              title="Short Rest"
            >
              <Moon size={16} /> Short Rest
            </button>
            <button
              className="btn-text"
              onClick={(e) => {
                e.stopPropagation()
                onRestTrigger('long')
              }}
              title="Long Rest"
            >
              <Moon size={16} /> Long Rest
            </button>
          </div>
          <ElementList
            items={items.filter(c => c.type === 'long-term')}
            onDelete={(id) => onDeleteItem(id, elementType)}
            onEdit={(item) => onEditItem(item, elementType)}
            onReorder={onReorder}
            onItemSelect={onItemSelect}
            selectedItem={selectedItem}
            selectedType={selectedType}
            onIncrement={onIncrement}
            onDecrement={onDecrement}
            isEditMode={isEditMode}
            isClearMode={isClearMode}
            elementType={elementType}
          />
        </>
      )}
    </div>
  )
}

const GameBoard = ({
  onItemSelect,
  selectedItem,
  selectedType,
  onOpenDatabase,
  isEditMode,
  isClearMode,
  showLongTermCountdowns,
  fear,
  updateFear,
  handleRollOutcome,
  handleActionRoll,
  setShowLongTermCountdowns,
  lastAddedItemType
}) => {
  console.log('GameBoard received props:', { selectedItem, selectedType })
  
  const { 
    adversaries, 
    environments,
    updateAdversary,
    deleteAdversary,
    reorderAdversaries,
    updateEnvironment,
    deleteEnvironment,
    reorderEnvironments,
    countdowns,
    createCountdown,
    deleteCountdown,
    reorderCountdowns,
    incrementCountdown,
    decrementCountdown
  } = useGameState()

  // State for inline countdown creator
  const [showInlineCreator, setShowInlineCreator] = useState({
    adversary: false,
    environment: false,
    campaign: false
  })

  // State for collapsible sections - initialize from localStorage
  const [sectionVisibility, setSectionVisibility] = usePersistentState('sectionVisibility', {
    countdowns: false,
    environments: false,
    adversaries: false
  })


  // Auto-expand section when items are added from browser
  useEffect(() => {
    if (lastAddedItemType) {
      if (lastAddedItemType === 'environment') {
        setSectionVisibility(prev => ({ ...prev, environments: true }))
      } else if (lastAddedItemType === 'adversary') {
        setSectionVisibility(prev => ({ ...prev, adversaries: true }))
      } else if (lastAddedItemType === 'countdown') {
        setSectionVisibility(prev => ({ ...prev, countdowns: true }))
      }
    }
  }, [lastAddedItemType, setSectionVisibility])

  // Toggle section visibility
  const toggleSection = (section) => {
    // Only allow toggling if the section has items
    const sectionItems = section === 'adversaries' ? adversaries : 
                        section === 'environments' ? environments : 
                        section === 'countdowns' ? countdowns : []
    
    if (sectionItems && sectionItems.length > 0) {
      setSectionVisibility(prev => ({
        ...prev,
        [section]: !prev[section]
      }))
    }
  }

  const handleEditItem = (item, type) => {
    // TODO: Implement edit mode using GameCard with mode="edit"
  }

  const handleToggleInlineCreator = (source) => {
    setShowInlineCreator(prev => ({ ...prev, [source]: !prev[source] }))
  }

  const handleCreateCountdown = (countdownData) => {
    createCountdown(countdownData)
    // Hide the creator for the appropriate source
    setShowInlineCreator(prev => ({ ...prev, [countdownData.source]: false }))
    // Auto-expand countdowns section when adding a countdown
    setSectionVisibility(prev => ({ ...prev, countdowns: true }))
  }

  // Wrapper function for opening database (no auto-expand)
  const handleOpenDatabase = (type) => {
    onOpenDatabase(type)
  }

  const handleDeleteItem = (id, type) => {
    if (type === 'environment') {
      deleteEnvironment(id)
    } else if (type === 'adversary') {
      deleteAdversary(id)
    } else if (type === 'countdown') {
      deleteCountdown(id)
    }
    
    // If the deleted item was selected, clear the selection
    if (selectedItem && selectedItem.id === id) {
      onItemSelect(null, null)
    }
  }

  const handleRestTrigger = (restType) => {
    // This will be implemented when we have the countdown engine
  }

  return (
    <div style={{
      flex: 1,
      overflowY: 'auto'
    }}>
      {/* Temporarily disabled countdowns section */}
      {/* <GameBoardElementSection
        elementType="countdowns"
        title="Countdowns"
        sectionKey="countdowns"
        items={countdowns}
        sectionVisibility={sectionVisibility}
        toggleSection={toggleSection}
        adversaries={adversaries}
          showInlineCreator={showInlineCreator}
          onToggleInlineCreator={handleToggleInlineCreator}
          onCreateCountdown={handleCreateCountdown}
          fear={fear}
          updateFear={updateFear}
          handleRollOutcome={handleRollOutcome}
          handleActionRoll={handleActionRoll}
          showLongTermCountdowns={showLongTermCountdowns}
          setShowLongTermCountdowns={setShowLongTermCountdowns}
          onDeleteItem={handleDeleteItem}
          onEditItem={handleEditItem}
          onReorder={reorderCountdowns}
          onItemSelect={onItemSelect}
          selectedItem={selectedItem}
          selectedType={selectedType}
          onIncrement={incrementCountdown}
          onDecrement={decrementCountdown}
          isEditMode={isEditMode}
          onRestTrigger={handleRestTrigger}
        /> */}

        {/* Temporarily disabled environments section */}
        {/* <GameBoardElementSection
          elementType="environments"
          title="Environments"
          sectionKey="environments"
          items={environments}
          sectionVisibility={sectionVisibility}
          toggleSection={toggleSection}
          adversaries={adversaries}
          onOpenDatabase={handleOpenDatabase}
          onDeleteItem={handleDeleteItem}
          onEditItem={handleEditItem}
          onToggleVisibility={(id) => {
            const env = environments.find(e => e.id === id)
            if (env) {
              updateEnvironment(id, { isVisible: !env.isVisible })
            }
          }}
          onReorder={reorderEnvironments}
          onItemSelect={onItemSelect}
          selectedItem={selectedItem}
          selectedType={selectedType}
          isEditMode={isEditMode}
        /> */}

        {/* Adversaries section - no header, just cards and add button */}
        <div style={{marginBottom: '0.75rem'}}>
          {/* Always show adversaries list */}
          <ElementList
            items={adversaries}
            onDelete={(id) => handleDeleteItem(id, 'adversary')}
            onEdit={(item) => handleEditItem(item, 'adversary')}
            onToggleVisibility={(id) => {
              const adv = adversaries.find(a => a.id === id)
              if (adv) {
                updateAdversary(id, { isVisible: !adv.isVisible })
              }
            }}
            onReorder={reorderAdversaries}
            onItemSelect={onItemSelect}
            selectedItem={selectedItem}
            selectedType={selectedType}
            onApplyDamage={(id, amount, currentHp, maxHp) => {
              const newHp = Math.min(maxHp, currentHp + amount)
              updateAdversary(id, { hp: newHp })
            }}
            onApplyHealing={(id, amount, currentHp) => {
              const adv = adversaries.find(a => a.id === id)
              if (adv) {
                const newHp = Math.max(0, currentHp - amount)
                updateAdversary(id, { hp: newHp })
              }
            }}
            onApplyStressChange={(id, amount) => {
              const adv = adversaries.find(a => a.id === id)
              if (adv) {
                let newStress = adv.stress + amount
                let newHp = adv.hp || 0
                if (newStress > adv.stressMax) {
                  const overflow = newStress - adv.stressMax
                  newStress = adv.stressMax
                  newHp = Math.min(adv.hpMax, newHp + overflow)
                } else if (newStress < 0) {
                  newStress = 0
                }
                updateAdversary(id, { stress: newStress, hp: newHp })
              }
            }}
            isEditMode={isEditMode}
            isClearMode={isClearMode}
            elementType="adversaries"
            adversaries={adversaries}
          />
          
          {/* Add Adversary Button - styled like a translucent card, positioned below all adversaries */}
          <div
            className="border rounded-lg"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderRadius: '8px',
              padding: '12px',
              marginTop: '0.5rem',
              cursor: 'pointer',
              transition: 'all 0.1s ease',
              position: 'relative',
              border: '2px dashed var(--border)',
              opacity: 0.8,
              background: 'var(--bg-card)'
            }}
            onClick={() => onOpenDatabase('adversaries')}
            onMouseEnter={(e) => {
              e.target.style.opacity = '1'
              e.target.style.borderColor = 'var(--border-hover)'
            }}
            onMouseLeave={(e) => {
              e.target.style.opacity = '0.8'
              e.target.style.borderColor = 'var(--border)'
            }}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '0.5rem',
              position: 'relative'
            }}>
              {/* Left side - Add text */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: '0.25rem'
              }}>
                <h4 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: 'var(--text-secondary)',
                  margin: 0
                }}>
                  Add Adversary
                </h4>
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  color: 'var(--text-secondary)',
                  letterSpacing: '0.5px'
                }}>
                  Click to browse
                </span>
              </div>

              {/* Right side - Plus icon */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                border: '1px dashed var(--text-secondary)',
                color: 'var(--text-secondary)'
              }}>
                <Plus size={16} />
              </div>
            </div>
          </div>
        </div>
    </div>
  )
}

export default GameBoard
