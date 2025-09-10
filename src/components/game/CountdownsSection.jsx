import React from 'react'
import List from '../ui/List'
import InlineCountdownCreator from '../editor/InlineCountdownCreator'
import CountdownTriggerControls from '../controls/CountdownTriggerControls'
import SectionHeader from './SectionHeader'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMoon } from '@fortawesome/free-solid-svg-icons'

const CountdownsSection = ({
  countdowns,
  sectionVisibility,
  toggleSection,
  showInlineCreator,
  onToggleInlineCreator,
  onCreateCountdown,
  fear,
  updateFear,
  triggers,
  handleRollOutcome,
  handleActionRoll,
  showLongTermCountdowns,
  setShowLongTermCountdowns,
  onDeleteItem,
  onEditItem,
  onReorder,
  onItemSelect,
  selectedItem,
  selectedType,
  onIncrement,
  onDecrement,
  isEditMode,
  onRestTrigger
}) => {
  return (
    <div className="game-section campaign-countdowns">
      <SectionHeader
        title="Countdowns"
        isOpen={sectionVisibility.countdowns}
        onToggle={() => toggleSection('countdowns')}
        hasItems={(countdowns && countdowns.length > 0) || false}
        onAddClick={() => onToggleInlineCreator('campaign')}
        addButtonTitle="Add Countdown"
        addButtonAria="Add Countdown"
      />
      {showInlineCreator.campaign && (
        <InlineCountdownCreator source="campaign" onCreateCountdown={onCreateCountdown} />
      )}
      {sectionVisibility.countdowns && countdowns && countdowns.length > 0 && (
        <CountdownTriggerControls
          triggers={triggers}
          fear={fear}
          updateFear={updateFear}
          handleRollOutcome={handleRollOutcome}
          handleActionRoll={handleActionRoll}
          showLongTermCountdowns={showLongTermCountdowns}
          setShowLongTermCountdowns={setShowLongTermCountdowns}
        />
      )}

      {sectionVisibility.countdowns && countdowns && countdowns.filter(c => c.type !== 'long-term').length > 0 && (
        <List
          items={countdowns.filter(c => c.type !== 'long-term')}
          type="countdown"
          onDelete={(id) => onDeleteItem(id, 'countdown')}
          onEdit={(item) => onEditItem(item, 'countdown')}
          onReorder={onReorder}
          onItemSelect={onItemSelect}
          selectedItem={selectedItem}
          selectedType={selectedType}
          onIncrement={onIncrement}
          onDecrement={onDecrement}
          isEditMode={isEditMode}
        />
      )}

      {sectionVisibility.countdowns && showLongTermCountdowns && countdowns && countdowns.filter(c => c.type === 'long-term').length > 0 && (
        <>
          <div className="long-term-rest-controls">
            <button
              className="trigger-btn short-rest"
              onClick={(e) => {
                e.stopPropagation()
                onRestTrigger('short')
              }}
              title="Short Rest"
            >
              <FontAwesomeIcon icon={faMoon} /> Short Rest
            </button>
            <button
              className="trigger-btn long-rest"
              onClick={(e) => {
                e.stopPropagation()
                onRestTrigger('long')
              }}
              title="Long Rest"
            >
              <FontAwesomeIcon icon={faMoon} /> Long Rest
            </button>
          </div>
          <List
            items={countdowns.filter(c => c.type === 'long-term')}
            type="countdown"
            onDelete={(id) => onDeleteItem(id, 'countdown')}
            onEdit={(item) => onEditItem(item, 'countdown')}
            onReorder={onReorder}
            onItemSelect={onItemSelect}
            selectedItem={selectedItem}
            selectedType={selectedType}
            onIncrement={onIncrement}
            onDecrement={onDecrement}
            isEditMode={isEditMode}
          />
        </>
      )}
    </div>
  )
}

export default CountdownsSection


