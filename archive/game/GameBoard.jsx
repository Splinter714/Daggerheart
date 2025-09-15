import React, { useState, useEffect } from 'react'
import usePersistentState from '../../hooks/usePersistentState'
import { useGameState } from '../../state/useGameState'
import CountdownsSection from './CountdownsSection'
import EnvironmentsSection from './EnvironmentsSection'
import AdversariesSection from './AdversariesSection'
// icons and controls moved into section components
import { 
  getAdvancementForRest
} from '../../utils/countdownEngine'

const LeftPanel = ({
  onItemSelect,
  selectedItem,
  selectedType,
  onOpenDatabase,
  onOpenCreator,
  isEditMode,
  // onEditModeChange,
  showLongTermCountdowns,
  fear,
  updateFear,
  handleRollOutcome: handleRollOutcomeProp,
  handleActionRoll: handleActionRollProp,
  setShowLongTermCountdowns,
  lastAddedItemType
}) => {
  
  const { 
    adversaries, 
    environments,
    // createAdversary,
    updateAdversary,
    deleteAdversary,
    reorderAdversaries,
    // createEnvironment,
    updateEnvironment,
    deleteEnvironment,
    reorderEnvironments,
    countdowns,
    createCountdown,
    // updateCountdown,
    deleteCountdown,
    reorderCountdowns,
    // advanceCountdown,
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

  // (persisted via usePersistentState)

  // Auto-expand section when items are added from browser
  useEffect(() => {
    if (lastAddedItemType) {
      if (lastAddedItemType === 'environment') {
        setSectionVisibility(prev => ({ ...prev, environments: true }))
      } else if (lastAddedItemType === 'adversary') {
        setSectionVisibility(prev => ({ ...prev, adversaries: true }))
      }
    }
  }, [lastAddedItemType, setSectionVisibility])

  // Toggle section visibility
  const toggleSection = (section) => {
    setSectionVisibility(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  // Determine which triggers are needed based on active countdowns
  const getNeededTriggers = () => {
    if (!countdowns || countdowns.length === 0) return { 
      basicRollTriggers: false, 
      simpleFearTriggers: false,
      simpleHopeTriggers: false,
      complexRollTriggers: false, 
      restTriggers: false 
    }
    
    const hasDynamicCountdowns = countdowns.some(c => 
      c.type === 'progress' || c.type === 'consequence' || 
      c.type === 'dynamic-progress' || c.type === 'dynamic-consequence'
    )
    const hasLongTermCountdowns = countdowns.some(c => c.type === 'long-term')
    const hasSimpleFearCountdowns = countdowns.some(c => c.type === 'simple-fear')
    const hasSimpleHopeCountdowns = countdowns.some(c => c.type === 'simple-hope')
    const hasStandardCountdowns = countdowns.some(c => c.type === 'standard' || !c.type)
    
    return {
      basicRollTriggers: hasStandardCountdowns,
      simpleFearTriggers: hasSimpleFearCountdowns && !hasDynamicCountdowns,
      simpleHopeTriggers: hasSimpleHopeCountdowns && !hasDynamicCountdowns,
      complexRollTriggers: hasDynamicCountdowns,
      restTriggers: hasLongTermCountdowns
    }
  }

  const handleEditItem = (item, type) => {
    onOpenCreator(type)
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
    countdowns.forEach((countdown) => {
      const advancement = getAdvancementForRest(countdown, restType)
      if (advancement > 0) {
        incrementCountdown(countdown.id, advancement)
      }
    })
  }

  return (
    <>
      <CountdownsSection
        countdowns={countdowns}
        sectionVisibility={sectionVisibility}
        toggleSection={toggleSection}
        showInlineCreator={showInlineCreator}
        onToggleInlineCreator={handleToggleInlineCreator}
        onCreateCountdown={handleCreateCountdown}
        fear={fear}
        updateFear={updateFear}
        triggers={getNeededTriggers()}
        handleRollOutcome={handleRollOutcomeProp}
        handleActionRoll={handleActionRollProp}
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
      />

      <EnvironmentsSection
        environments={environments}
        sectionVisibility={sectionVisibility}
        toggleSection={toggleSection}
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
      />

      <AdversariesSection
        adversaries={adversaries}
        sectionVisibility={sectionVisibility}
        toggleSection={toggleSection}
        onOpenDatabase={handleOpenDatabase}
        onDeleteItem={handleDeleteItem}
        onEditItem={handleEditItem}
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
      />
    </>
  )
}

export default LeftPanel
