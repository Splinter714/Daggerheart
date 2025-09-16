import React, { useState, useCallback, useEffect } from 'react'
import { Droplet, Activity, CheckCircle, X, Plus, Minus, Shield, Hexagon } from 'lucide-react'
import Pips from './Pips'

// ============================================================================
// UTILITIES
// ============================================================================

function generateId(prefix) {
  const base = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
  return prefix ? `${prefix}-${base}` : base
}

// ============================================================================
// BUSINESS LOGIC - All domain actions consolidated
// ============================================================================

export const buildAdversaryActions = (getGameState, setGameState) => {
  const createAdversary = (adversaryData) => {
    const uniqueId = generateId('adv')
    const existingAdversaries = getGameState().adversaries || []
    const baseName = adversaryData.name || 'Unknown'
    const sameNameAdversaries = existingAdversaries.filter(adv => adv.baseName === baseName)
    
    let duplicateNumber = 1
    if (sameNameAdversaries.length === 0) {
      duplicateNumber = 1
    } else {
      // Find the next available number
      const usedNumbers = sameNameAdversaries.map(adv => adv.duplicateNumber || 1)
      let next = 1
      while (usedNumbers.includes(next)) next++
      duplicateNumber = next
    }

    const newAdversary = {
      ...adversaryData,
      id: uniqueId,
      baseName: baseName,
      duplicateNumber: duplicateNumber,
      name: `${baseName} (${duplicateNumber})`,
      hp: 0,
      stress: 0,
      isVisible: true
    }
    setGameState(prev => ({ ...prev, adversaries: [...prev.adversaries, newAdversary] }))
  }

  const updateAdversary = (id, updates) => {
    setGameState(prev => ({
      ...prev,
      adversaries: prev.adversaries.map(a => {
        if (a.id === id) {
          const updated = { ...a, ...updates }
          
          // If baseName is being updated, recalculate the display name
          if (updates.baseName !== undefined) {
            const baseName = updates.baseName
            const duplicateNumber = updated.duplicateNumber || 1
            updated.name = duplicateNumber === 1 ? baseName : `${baseName} (${duplicateNumber})`
          }
          
          return updated
        }
        return a
      })
    }))
  }

  const deleteAdversary = (id) => {
    setGameState(prev => ({
      ...prev,
      adversaries: prev.adversaries.filter(a => a.id !== id)
    }))
  }

  const reorderAdversaries = (newOrder) => {
    setGameState(prev => {
      const [oldIndex, newIndex] = newOrder
      const next = [...prev.adversaries]
      const [moved] = next.splice(oldIndex, 1)
      next.splice(newIndex, 0, moved)
      return { ...prev, adversaries: next }
    })
  }

  return { createAdversary, updateAdversary, deleteAdversary, reorderAdversaries }
}

export const buildCountdownActions = (setGameState) => {
  const createCountdown = (countdownData) => {
    const newCountdown = {
      id: generateId('countdown'),
      name: countdownData.name || 'Countdown',
      max: parseInt(countdownData.max) || 1,
      value: 0,
      visible: true,
      type: countdownData.type || 'standard',
      loop: countdownData.loop || 'none',
      source: countdownData.source || 'campaign'
    }
    setGameState(prev => ({ ...prev, countdowns: [...prev.countdowns, newCountdown] }))
  }

  const updateCountdown = (id, updates) => {
    setGameState(prev => ({
      ...prev,
      countdowns: prev.countdowns.map(c => c.id === id ? { ...c, ...updates } : c)
    }))
  }

  const deleteCountdown = (id) => {
    setGameState(prev => ({
      ...prev,
      countdowns: prev.countdowns.filter(c => c.id !== id)
    }))
  }

  const advanceCountdown = (id, newValue) => {
    setGameState(prev => ({
      ...prev,
      countdowns: prev.countdowns.map(countdown => {
        if (countdown.id !== id) return countdown
        let finalValue = newValue
        if (countdown.loop === 'loop') {
          if (finalValue > countdown.max) {
            // For loop countdowns, wrap to the overflow amount
            finalValue = ((finalValue - 1) % countdown.max) + 1
          } else if (finalValue < 0) {
            finalValue = countdown.max
          }
        } else if (countdown.loop === 'increasing') {
          if (finalValue > countdown.max) return { ...countdown, max: countdown.max + 1, value: 1 }
          else if (finalValue < 0) return { ...countdown, max: Math.max(1, countdown.max - 1), value: 1 }
          finalValue = Math.max(0, finalValue)
        } else if (countdown.loop === 'decreasing') {
          if (finalValue > countdown.max) return { ...countdown, max: Math.max(1, countdown.max - 1), value: 1 }
          else if (finalValue < 0) return { ...countdown, max: countdown.max + 1, value: 1 }
          finalValue = Math.min(countdown.max, finalValue)
        } else {
          finalValue = Math.max(0, Math.min(finalValue, countdown.max))
        }
        return { ...countdown, value: finalValue }
      })
    }))
  }

  const incrementCountdown = (id, amount = 1) => {
    setGameState(prev => ({
      ...prev,
      countdowns: prev.countdowns.map(countdown => {
        if (countdown.id !== id) return countdown
        let newValue = countdown.value + amount
        if (countdown.loop === 'loop') {
          if (newValue > countdown.max) {
            // For loop countdowns, wrap to the overflow amount
            newValue = ((newValue - 1) % countdown.max) + 1
          }
        } else if (countdown.loop === 'increasing') {
          if (newValue > countdown.max) return { ...countdown, max: countdown.max + 1, value: 1 }
        } else if (countdown.loop === 'decreasing') {
          if (newValue > countdown.max) return { ...countdown, max: Math.max(1, countdown.max - 1), value: 1 }
        } else {
          newValue = Math.min(newValue, countdown.max)
        }
        return { ...countdown, value: newValue }
      })
    }))
  }

  const decrementCountdown = (id) => {
    setGameState(prev => ({
      ...prev,
      countdowns: prev.countdowns.map(countdown => {
        if (countdown.id !== id) return countdown
        let newValue = countdown.value - 1
        if (countdown.loop === 'loop') {
          if (newValue < 0) newValue = countdown.max
        } else if (countdown.loop === 'increasing') {
          if (newValue < 0) return { ...countdown, max: Math.max(1, countdown.max - 1), value: countdown.max }
          newValue = Math.max(0, newValue)
        } else if (countdown.loop === 'decreasing') {
          if (newValue < 0) return { ...countdown, max: countdown.max + 1, value: 1 }
        } else {
          newValue = Math.max(0, newValue)
        }
        return { ...countdown, value: newValue }
      })
    }))
  }

  const reorderCountdowns = (newOrder) => {
    setGameState(prev => {
      const [oldIndex, newIndex] = newOrder
      const newCountdowns = [...prev.countdowns]
      const [movedItem] = newCountdowns.splice(oldIndex, 1)
      newCountdowns.splice(newIndex, 0, movedItem)
      return { ...prev, countdowns: newCountdowns }
    })
  }

  return {
    createCountdown,
    updateCountdown,
    deleteCountdown,
    advanceCountdown,
    incrementCountdown,
    decrementCountdown,
    reorderCountdowns
  }
}

export const buildEnvironmentActions = (getGameState, setGameState) => {
  const createEnvironment = (environmentData) => {
    const uniqueId = generateId('env')
    const existing = getGameState().environments || []
    const same = existing.filter(env => env.name.replace(/\s+\(\d+\)$/, '') === environmentData.name)
    let displayName = environmentData.name || 'Unknown'
    if (same.length === 0) {
      displayName = environmentData.name
    } else if (same.length === 1) {
      const first = same[0]
      const firstBase = first.name.replace(/\s+\(\d+\)$/, '')
      const updated = getGameState().environments.map(env => env.id === first.id ? { ...env, name: `${firstBase} (1)` } : env)
      setGameState(prev => ({ ...prev, environments: updated }))
      displayName = `${environmentData.name} (2)`
    } else {
      const used = same.map(env => {
        const match = env.name.match(/\((\d+)\)$/)
        return match ? parseInt(match[1]) : null
      }).filter(n => n !== null)
      let next = 1
      while (used.includes(next)) next++
      displayName = `${environmentData.name} (${next})`
    }

    const newEnv = {
      ...environmentData,
      id: uniqueId,
      name: displayName,
      isVisible: true
    }
    setGameState(prev => ({ ...prev, environments: [...prev.environments, newEnv] }))
  }

  const updateEnvironment = (id, updates) => {
    setGameState(prev => ({
      ...prev,
      environments: prev.environments.map(e => e.id === id ? { ...e, ...updates } : e)
    }))
  }

  const deleteEnvironment = (id) => {
    setGameState(prev => ({
      ...prev,
      environments: prev.environments.filter(e => e.id !== id)
    }))
  }

  const reorderEnvironments = (newOrder) => {
    setGameState(prev => {
      const [oldIndex, newIndex] = newOrder
      const next = [...prev.environments]
      const [moved] = next.splice(oldIndex, 1)
      next.splice(newIndex, 0, moved)
      return { ...prev, environments: next }
    })
  }

  return { createEnvironment, updateEnvironment, deleteEnvironment, reorderEnvironments }
}

// ============================================================================
// COUNTDOWN ENGINE - Centralized countdown logic
// ============================================================================

export function getNeededTriggers(countdowns = []) {
  if (!Array.isArray(countdowns) || countdowns.length === 0) {
    return {
      basicRollTriggers: false,
      simpleFearTriggers: false,
      simpleHopeTriggers: false,
      complexRollTriggers: false,
      restTriggers: false,
    }
  }

  const hasDynamicCountdowns = countdowns.some((c) =>
    c?.type === 'progress' ||
    c?.type === 'consequence' ||
    c?.type === 'dynamic-progress' ||
    c?.type === 'dynamic-consequence'
  )
  const hasLongTermCountdowns = countdowns.some((c) => c?.type === 'long-term')
  const hasSimpleFearCountdowns = countdowns.some((c) => c?.type === 'simple-fear')
  const hasSimpleHopeCountdowns = countdowns.some((c) => c?.type === 'simple-hope')
  const hasStandardCountdowns = countdowns.some((c) => c?.type === 'standard' || !c?.type)

  return {
    basicRollTriggers: hasStandardCountdowns,
    simpleFearTriggers: hasSimpleFearCountdowns && !hasDynamicCountdowns,
    simpleHopeTriggers: hasSimpleHopeCountdowns && !hasDynamicCountdowns,
    complexRollTriggers: hasDynamicCountdowns,
    restTriggers: hasLongTermCountdowns,
  }
}

export function getAdvancementForOutcome(countdown, outcome) {
  const type = countdown?.type || 'standard'

  if (type === 'standard') {
    return 1
  }

  if (type === 'progress' || type === 'dynamic-progress') {
    switch (outcome) {
      case 'success-hope':
        return 2
      case 'success-fear':
        return 1
      case 'critical-success':
        return 3
      default:
        return 0
    }
  }

  if (type === 'consequence' || type === 'dynamic-consequence') {
    switch (outcome) {
      case 'success-fear':
        return 1
      case 'failure-hope':
        return 2
      case 'failure-fear':
        return 3
      default:
        return 0
    }
  }

  if (type === 'simple-fear') {
    return outcome === 'simple-fear' || outcome === 'success-fear' || outcome === 'failure-fear' ? 1 : 0
  }

  if (type === 'simple-hope') {
    return outcome === 'simple-hope' || outcome === 'success-hope' || outcome === 'failure-hope' || outcome === 'critical-success' ? 1 : 0
  }

  return 0
}

export function getAdvancementForActionRoll(countdown) {
  const type = countdown?.type || 'standard'
  return type === 'standard' ? 1 : 0
}

export function getAdvancementForRest(countdown, restType) {
  if (countdown?.type !== 'long-term') return 0
  return restType === 'long' ? 2 : 1
}

// ============================================================================
// ADVERSARY HANDLERS - Consolidated adversary interaction logic
// ============================================================================

export function useAdversaryHandlers({ adversaries, updateAdversary, deleteAdversary, selectedItem, setSelectedItem }) {
  const handleAdversaryDamage = useCallback((id, damage, currentHp, maxHp) => {
    const target = adversaries.find(adv => adv.id === id)
    if (!target) return
    const isMinion = target.type === 'Minion'
    const minionFeature = target.features?.find(f => f.name?.startsWith('Minion ('))
    const threshold = minionFeature ? parseInt(minionFeature.name.match(/\((\d+)\)/)?.[1] || '1') : 1
    if (isMinion) {
      deleteAdversary(id)
      const additional = Math.floor(damage / threshold)
      if (additional > 0) {
        const sameType = adversaries.filter(adv => adv.type === 'Minion' && adv.id !== id && adv.name === target.name)
        for (let i = 0; i < Math.min(additional, sameType.length); i++) {
          deleteAdversary(sameType[i].id)
        }
      }
      return
    }
    const newHp = Math.min(currentHp + damage, maxHp)
    if (selectedItem && selectedItem.id === id) {
      setSelectedItem(prev => ({ ...prev, hp: newHp }))
    }
    updateAdversary(id, { hp: newHp })
  }, [adversaries, updateAdversary, deleteAdversary, selectedItem, setSelectedItem])

  const handleAdversaryHealing = useCallback((id, healing, currentHp) => {
    const newHp = Math.max(0, currentHp - healing)
    if (selectedItem && selectedItem.id === id) {
      setSelectedItem(prev => ({ ...prev, hp: newHp }))
    }
    updateAdversary(id, { hp: newHp })
  }, [updateAdversary, selectedItem, setSelectedItem])

  const handleAdversaryStressChange = useCallback((id, stressDelta, currentStress, maxStress) => {
    const adv = adversaries.find(a => a.id === id)
    if (!adv) return
    let newStress = currentStress + stressDelta
    let newHp = adv.hp || 0
    if (newStress > maxStress) {
      const overflow = newStress - maxStress
      newStress = maxStress
      newHp = Math.min(adv.hpMax || 0, newHp + overflow)
    }
    newStress = Math.max(0, newStress)
    if (selectedItem && selectedItem.id === id) {
      setSelectedItem(prev => ({ ...prev, stress: newStress, hp: newHp }))
    }
    updateAdversary(id, { stress: newStress, hp: newHp })
  }, [adversaries, updateAdversary, selectedItem, setSelectedItem])

  return { handleAdversaryDamage, handleAdversaryHealing, handleAdversaryStressChange }
}

// ============================================================================
// STYLES - All CSS consolidated into inline styles
// ============================================================================

const styles = {
  // Transition definitions - centralized
  transitions: {
    hoverIn: 'all 0.1s ease',        // Fast hover-in
    hoverOut: 'all 0.3s ease',       // Graceful hover-out
    colorIn: 'color 0.1s ease',
    colorOut: 'color 0.3s ease',
    backgroundIn: 'background-color 0.1s ease',
    backgroundOut: 'background-color 0.3s ease'
  },

  // Container styles
  card: {
    backgroundColor: 'var(--bg-card)',
    borderRadius: '8px',
    padding: '12px',
    cursor: 'pointer',
    transition: 'all 0.1s ease',
    position: 'relative'
  },
  cardHover: {
    backgroundColor: 'var(--bg-card-hover)'
  },
  cardDead: {
    opacity: 0.6,
    backgroundColor: 'var(--gray-800)',
    borderColor: 'var(--border)'
  },
  cardAtMax: {
    backgroundColor: 'var(--success)',
    borderColor: 'var(--success)'
  },

  // Layout styles
  rowMain: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px'
  },
  rowTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: 'var(--text-primary)',
    margin: 0
  },
  rowMeta: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center'
  },
  cardActions: {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: '12px'
  },
  controlButtons: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center'
  },

  // Pip styles
  pipSymbols: {
    display: 'flex',
    gap: '4px',
    alignItems: 'center',
    cursor: 'pointer',
    padding: '2px'
  },
  pipSymbol: {
    fontSize: '16px',
    transition: 'color 0.1s ease'
  },
  pipGroup: {
    display: 'flex',
    gap: '4px',
    marginBottom: '4px'
  },

  // Badge styles
  badge: {
    padding: '2px 6px',
    borderRadius: '3px',
    fontSize: '10px',
    fontWeight: '600',
    textTransform: 'uppercase'
  },
  typeBadge: {
    backgroundColor: 'var(--purple)',
    color: 'var(--text-primary)'
  },
  difficultyBadge: {
    backgroundColor: 'var(--gray-500)',
    color: 'var(--text-primary)',
    cursor: 'pointer',
    transition: 'background-color 0.1s ease'
  },
  tierBadge: {
    backgroundColor: 'var(--info)',
    color: 'var(--text-primary)'
  },

  // Base form input styles
  inputBase: {
    padding: '8px',
    borderColor: 'var(--gray-500)',
    backgroundColor: 'var(--gray-900)',
    color: 'var(--text-primary)',
    fontSize: '14px',
    transition: 'all 0.2s ease'
  },
  inputBaseFocus: {
    outline: 'none',
    borderColor: 'var(--purple)',
    boxShadow: '0 0 0 2px rgba(79, 70, 229, 0.1)'
  },
  inputBaseDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed'
  },

  // Button styles
  button: {
    backgroundColor: 'var(--danger)',
    color: 'var(--text-primary)',
    borderWidth: '0',
    borderStyle: 'none',
    borderRadius: '4px',
    padding: '4px 8px',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'background-color 0.1s ease'
  },
  incrementButton: {
    backgroundColor: 'var(--success)',
    color: 'var(--text-primary)',
    borderWidth: '0',
    borderStyle: 'none',
    borderRadius: '4px',
    padding: '4px 8px',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'background-color 0.1s ease'
  },
  decrementButton: {
    backgroundColor: 'var(--warning)',
    color: 'var(--text-primary)',
    borderWidth: '0',
    borderStyle: 'none',
    borderRadius: '4px',
    padding: '4px 8px',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'background-color 0.1s ease'
  },

  // Damage input styles
  damageInputPopup: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    borderRadius: '8px'
  },
  damageInputContent: {
    backgroundColor: 'var(--gray-900)',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'var(--border)',
    borderRadius: '8px',
    padding: '8px',
    display: 'flex',
    flexDirection: 'row',
    gap: '8px',
    minWidth: '200px',
    alignItems: 'center',
    position: 'absolute',
    right: '1rem',
    top: '50%',
    transform: 'translateY(-50%)'
  },
  damageInput: {
    backgroundColor: 'var(--gray-900)',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'var(--border)',
    borderRadius: '4px',
    padding: '4px 6px',
    color: 'var(--text-primary)',
    fontSize: '12px',
    width: '80px',
    textAlign: 'center'
  },
  damageIndicators: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
    justifyContent: 'center'
  },
  damageDrop: {
    fontSize: '16px',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    transition: 'color 0.1s ease'
  },
  applyButton: {
    backgroundColor: 'var(--gray-600)',
    color: 'white',
    borderWidth: '0',
    borderStyle: 'none',
    borderRadius: '4px',
    padding: '4px 8px',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'background-color 0.1s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '32px',
    minHeight: '32px'
  }
}

// ============================================================================
// HOOKS
// ============================================================================

// Adversary-specific logic
const useAdversaryLogic = (item, onApplyDamage, onApplyHealing, onApplyStressChange) => {
  const [showDamageInput, setShowDamageInput] = useState(false)
  const [damageValue, setDamageValue] = useState('')

  // Close damage input when clicking outside
  useEffect(() => {
    if (showDamageInput) {
      const handleClickOutside = (event) => {
        if (!event.target.closest('.damage-input-popup')) {
          setShowDamageInput(false)
          setDamageValue('')
        }
      }
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [showDamageInput])

  const handleHpClick = (e) => {
    e.stopPropagation()
    e.preventDefault()
    const currentHp = item.hp || 0
    const hpMax = item.hpMax || 1
    const symbolsRect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - symbolsRect.left
    const symbolWidth = symbolsRect.width / hpMax
    const clickedIndex = Math.floor(clickX / symbolWidth)
    
    if (clickedIndex < currentHp) {
      onApplyHealing && onApplyHealing(item.id, 1, item.hp)
    } else {
      onApplyDamage && onApplyDamage(item.id, 1, item.hp, item.hpMax)
    }
  }

  const handleStressClick = (e) => {
    e.stopPropagation()
    e.preventDefault()
    const currentStress = item.stress || 0
    const stressMax = item.stressMax || 1
    const symbolsRect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - symbolsRect.left
    const symbolWidth = symbolsRect.width / stressMax
    const clickedIndex = Math.floor(clickX / symbolWidth)
    
    if (clickedIndex < currentStress) {
      onApplyStressChange && onApplyStressChange(item.id, -1, item.stress, item.stressMax)
    } else {
      onApplyStressChange && onApplyStressChange(item.id, 1, item.stress, item.stressMax)
    }
  }

  const handleDifficultyClick = (e) => {
    e.stopPropagation()
    if ((item.thresholds && item.thresholds.major && item.thresholds.severe) || item.type === 'Minion') {
      setShowDamageInput(true)
      setDamageValue(item.type === 'Minion' ? '1' : '')
    }
  }

  const applyDamage = () => {
    const damage = parseInt(damageValue)
    if (damage > 0) {
      if (item.type === 'Minion') {
        onApplyDamage && onApplyDamage(item.id, damage, item.hp, item.hpMax)
      } else {
        let hpDamage = 0
        if (damage >= item.thresholds.severe) {
          hpDamage = 3
        } else if (damage >= item.thresholds.major) {
          hpDamage = 2
        } else if (damage >= 1) {
          hpDamage = 1
        }
        onApplyDamage && onApplyDamage(item.id, hpDamage, item.hp, item.hpMax)
      }
      setShowDamageInput(false)
      setDamageValue('')
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      applyDamage()
    } else if (e.key === 'Escape') {
      setShowDamageInput(false)
      setDamageValue('')
    }
  }

  return {
    showDamageInput,
    damageValue,
    setDamageValue,
    setShowDamageInput,
    handleHpClick,
    handleStressClick,
    handleDifficultyClick,
    applyDamage,
    handleKeyDown
  }
}

// Countdown-specific logic
const useCountdownLogic = (item, onIncrement, onDecrement) => {
  const renderDistributedPips = () => {
    const totalPips = item.max
    const pipGroups = []
    for (let i = 0; i < totalPips; i += 5) {
      const groupSize = Math.min(5, totalPips - i)
      pipGroups.push(groupSize)
    }
    
    return pipGroups.map((groupSize, groupIndex) => (
      <div key={groupIndex} style={styles.pipGroup}>
        {Array.from({ length: groupSize }, (_, i) => {
          const pipIndex = groupIndex * 5 + i
          return (
            <span 
              key={pipIndex} 
              style={{
                ...styles.pipSymbol,
                color: pipIndex < (item.value || 0) ? 'var(--red)' : 'var(--text-secondary)'
              }}
              title={`${pipIndex + 1} of ${item.max}`}
            >
              {pipIndex < (item.value || 0) ? '●' : '○'}
            </span>
          )
        })}
      </div>
    ))
  }

  return { renderDistributedPips }
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const GameCard = ({
  item,
  type, // 'adversary', 'environment', 'countdown'
  mode = 'compact', // 'compact', 'expanded', 'edit'
  onClick,
  onDelete,
  onApplyDamage,
  onApplyHealing,
  onApplyStressChange,
  onUpdate,
  onIncrement,
  onDecrement,
  dragAttributes,
  dragListeners,
  adversaries = [], // All adversaries for duplicate checking
  isSelected = false, // Whether this card is currently selected
  isEditMode = false, // Whether the app is in edit mode
}) => {
  // Get type-specific logic - always call hooks to maintain consistent hook order
  const adversaryLogic = useAdversaryLogic(item, onApplyDamage, onApplyHealing, onApplyStressChange)
  const countdownLogic = useCountdownLogic(item, onIncrement, onDecrement)
  
  // Create fallback handlers for when logic is not applicable to current type
  const handleDifficultyClick = (type === 'adversary' || type === 'adversaries') ? adversaryLogic.handleDifficultyClick : (() => {
    console.warn('adversaryLogic.handleDifficultyClick not available for type:', type)
  })

  // Hover state management
  const [isHovered, setIsHovered] = useState(false)
  
  // Debug logging removed - selection styling working correctly

  // Transition management with different speeds for hover in/out
  const handleMouseEnter = () => {
    setIsHovered(true)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
  }

  // ============================================================================
  // STYLING LOGIC
  // ============================================================================

  const getCardStyle = (isExpanded = false) => {
    let cardStyle = { ...styles.card }
    
    // Use appropriate transition speed based on hover state
    // Selection changes should be instant, hover changes should be smooth
    if (isSelected) {
      cardStyle.transition = 'none' // Instant for selection
    } else {
      cardStyle.transition = isHovered ? styles.transitions.hoverIn : styles.transitions.hoverOut
    }
    
    // Remove top margin for expanded cards
    if (isExpanded) {
      const { marginTop, ...cardStyleWithoutMargin } = cardStyle
      cardStyle = cardStyleWithoutMargin
    }
    
    // Apply hover effects for expanded cards or when selected
    if ((isHovered && mode !== 'expanded') || isSelected) {
      cardStyle = { ...cardStyle, ...styles.cardHover }
    }
    
    if (type === 'adversary' && (item.hp || 0) >= (item.hpMax || 1)) {
      cardStyle = { ...cardStyle, ...styles.cardDead }
    }
    
    if (type === 'countdown' && (item.value || 0) >= item.max) {
      cardStyle = { ...cardStyle, ...styles.cardAtMax }
    }
    
    return cardStyle
  }

  const getCardClassName = () => {
    let className = 'border rounded-lg'
    
    // Apply border hover effect for hovered cards or when selected
    if ((isHovered && mode !== 'expanded') || isSelected) {
      className += ' border-hover'
    }
    
    return className
  }

  // ============================================================================
  // RENDERING HELPERS
  // ============================================================================

  const renderTitle = () => {
    if (type === 'adversary' || type === 'adversaries') {
      const baseName = item.baseName || item.name?.replace(/\s+\(\d+\)$/, '') || ''
      const duplicateNumber = item.duplicateNumber || (item.name?.match(/\((\d+)\)$/) ? parseInt(item.name.match(/\((\d+)\)$/)[1]) : 1)
      
      // Check if there are other adversaries with the same base name
      // Include the current item in the check to ensure accurate duplicate detection
      const allAdversaries = [...adversaries]
      if (!adversaries.some(adv => adv.id === item.id)) {
        allAdversaries.push(item)
      }
      const sameNameAdversaries = allAdversaries.filter(adv => adv.baseName === baseName)
      const hasDuplicates = sameNameAdversaries.length > 1
      
      
      
      
      // Show duplicate number if there are actually duplicates (including the first one)
      if (hasDuplicates) {
        return `${baseName} (${duplicateNumber})`
      } else {
        return baseName
      }
    }
    return item.name
  }

  const renderMeta = () => {
    const badges = []
    
    if (item.type) {
      badges.push(
        <span key="type" style={{ ...styles.badge, ...styles.typeBadge }}>
          {item.type}
        </span>
      )
    }
    
    if (type === 'environment' && item.tier) {
      badges.push(
        <span key="tier" style={{ ...styles.badge, ...styles.tierBadge }}>
          Tier {item.tier}
        </span>
      )
    }
    
    return badges
  }

  const renderAdversaryContent = () => (
    <div style={styles.cardActions}>
      <div style={styles.controlButtons}>
        {/* HP Pips */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div 
            style={{
              display: 'flex',
              gap: '0.25rem',
              alignItems: 'center',
              cursor: 'pointer',
              padding: '0.125rem',
              borderRadius: '0.5rem',
              transition: 'all 0.2s ease'
            }}
            onClick={(type === 'adversary' || type === 'adversaries') ? adversaryLogic.handleHpClick : undefined}
            onMouseEnter={(e) => e.target.style.background = 'var(--gray-800)'}
            onMouseLeave={(e) => e.target.style.background = 'transparent'}
          >
            {Array.from({ length: item.hpMax || 1 }, (_, i) => (
              <span
                key={i}
                style={{
                  fontSize: '1rem',
                  transition: 'color 0.1s ease',
                  cursor: 'pointer',
                  color: i < (item.hp || 0) ? 'var(--red)' : 'var(--text-secondary)'
                }}
                title={i < (item.hp || 0) ? 'Click to heal (reduce damage)' : 'Click to take damage'}
              >
                <Droplet size={16} />
              </span>
            ))}
          </div>
        </div>

        {/* Stress Pips */}
        {item.stressMax > 0 && (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div 
              style={{
                display: 'flex',
                gap: '0.25rem',
                alignItems: 'center',
                cursor: 'pointer',
                padding: '0.125rem',
                borderRadius: '0.5rem',
                transition: 'all 0.2s ease'
              }}
              onClick={(type === 'adversary' || type === 'adversaries') ? adversaryLogic.handleStressClick : undefined}
              onMouseEnter={(e) => e.target.style.background = 'var(--gray-800)'}
              onMouseLeave={(e) => e.target.style.background = 'transparent'}
            >
              {Array.from({ length: item.stressMax }, (_, i) => (
                <span
                  key={i}
                  style={{
                    fontSize: '1rem',
                    transition: 'color 0.1s ease',
                    cursor: 'pointer',
                    color: i < (item.stress || 0) ? 'var(--gold)' : 'var(--text-secondary)'
                  }}
                  title={i < (item.stress || 0) ? 'Click to reduce stress' : 'Click to increase stress'}
                >
                  <Activity size={16} />
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Difficulty Badge */}
        {item.difficulty && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div 
              onClick={(type === 'adversary' || type === 'adversaries') ? adversaryLogic.handleDifficultyClick : undefined}
              style={{
                cursor: ((item.thresholds && item.thresholds.major && item.thresholds.severe) || item.type === 'Minion') ? 'pointer' : 'default'
              }}
              title={(item.thresholds && item.thresholds.major && item.thresholds.severe) ? `Click to enter damage (thresholds: ${item.thresholds.major}/${item.thresholds.severe})` : item.type === 'Minion' ? 'Click to enter damage (minion mechanics)' : ''}
            >
              <div className="border rounded-sm" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                background: 'var(--gray-900)',
                borderColor: 'var(--border)',
                padding: '0.25rem 0.5rem',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.background = 'var(--gray-800)'}
              onMouseLeave={(e) => e.target.style.background = 'var(--gray-900)'}
              >
                <span style={{
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)'
                }}>
                  {item.difficulty}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete Button */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {/* Temporarily disabled drag handles */}
        {false && dragAttributes && dragListeners && (
          <button
            style={{
              background: 'var(--gray-800)',
              border: '0.5px solid var(--gray-600)',
              borderRadius: '0.5rem',
              padding: '0.25rem',
              minWidth: '1.5rem',
              height: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.1s ease',
              color: 'var(--text-primary)',
              fontSize: '1rem'
            }}
            onClick={(e) => {
              e.stopPropagation()
              e.preventDefault()
              onDelete && onDelete(item.id)
            }}
            onMouseEnter={(e) => e.target.style.background = 'var(--gray-700)'}
            onMouseLeave={(e) => e.target.style.background = 'var(--gray-800)'}
            title="Delete adversary"
          >
            ×
          </button>
        )}
      </div>
    </div>
  )

  const renderEnvironmentContent = () => (
    // Environments are simple - just show type and tier badges
    null
  )

  const renderCountdownContent = () => (
    <>
      <button
        style={styles.decrementButton}
        onClick={(e) => {
          e.stopPropagation()
          e.preventDefault()
          onDecrement && onDecrement(item.id)
        }}
        title="Decrease progress"
      >
        <Minus size={16} />
      </button>
      <button
        style={styles.incrementButton}
        onClick={(e) => {
          e.stopPropagation()
          e.preventDefault()
          onIncrement && onIncrement(item.id)
        }}
        title={item.value >= item.max ? (item.loop && item.loop !== 'none' ? "Loop countdown" : "Countdown at max") : "Increase progress"}
      >
        {item.value >= item.max ? (item.loop && item.loop !== 'none' ? "⟳" : <Plus size={16} />) : <Plus size={16} />}
      </button>
    </>
  )

  const renderTypeSpecificContent = () => {
    switch (type) {
      case 'adversary':
        return renderAdversaryContent()
      case 'environment':
        return renderEnvironmentContent()
      case 'countdown':
        return renderCountdownContent()
      default:
        return null
    }
  }

  const renderProgressPips = () => {
    if (type === 'countdown') {
      return (
        <div style={styles.pipSymbols}>
          {type === 'countdown' ? countdownLogic.renderDistributedPips() : null}
        </div>
      )
    }
    return null
  }

  const renderDamageInput = () => {
    if (type !== 'adversary' || !adversaryLogic.showDamageInput || !((item.thresholds && item.thresholds.major && item.thresholds.severe) || item.type === 'Minion')) {
      return null
    }

    return (
      <div 
        className="damage-input-popup"
        style={styles.damageInputPopup}
        onClick={(e) => {
          e.stopPropagation()
          if (e.target === e.currentTarget) {
            if (type === 'adversary' || type === 'adversaries') {
              adversaryLogic.setShowDamageInput(false)
              adversaryLogic.setDamageValue('')
            }
          }
        }}
      >
        <div 
          className="border rounded-lg"
          style={{
            ...styles.damageInputContent,
            borderColor: 'var(--border)'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <input
            type="number"
            inputMode="numeric"
            enterKeyHint="done"
            placeholder="dmg"
            min={item.type === 'Minion' ? "0" : "0"}
            value={(type === 'adversary' || type === 'adversaries') ? adversaryLogic.damageValue : ''}
            onChange={(e) => {
              if (type === 'adversary' || type === 'adversaries') {
                adversaryLogic.setDamageValue(e.target.value)
              }
            }}
            onKeyDown={(type === 'adversary' || type === 'adversaries') ? adversaryLogic.handleKeyDown : undefined}
            className="border rounded-sm"
            style={{
              ...styles.damageInput,
              borderColor: 'var(--border)'
            }}
            autoFocus
          />
          <div style={styles.damageIndicators}>
            {item.type === 'Minion' ? (
              (() => {
                const damage = parseInt((type === 'adversary' || type === 'adversaries') ? adversaryLogic.damageValue : '0') || 0
                const minionFeature = item.features?.find(f => f.name?.startsWith('Minion ('))
                const minionThreshold = minionFeature ? parseInt(minionFeature.name.match(/\((\d+)\)/)?.[1] || '1') : 1
                const additionalMinions = Math.floor(damage / minionThreshold)
                
                if (damage >= minionThreshold && additionalMinions > 0) {
                  return (
                    <span 
                      style={{
                        ...styles.damageDrop,
                        color: 'var(--red)'
                      }}
                      title={`${damage} damage can defeat ${additionalMinions + 1} minion${additionalMinions + 1 !== 1 ? 's' : ''} (1 + ${additionalMinions} additional)`}
                    >
                      +{additionalMinions} additional minion(s)
                    </span>
                  )
                } else {
                  return (
                    <span 
                      style={styles.damageDrop}
                      title={`${damage} damage defeats this minion only`}
                    >
                      +0 additional minion(s)
                    </span>
                  )
                }
              })()
            ) : (
              [1, 2, 3].map((level) => {
                const damage = parseInt((type === 'adversary' || type === 'adversaries') ? adversaryLogic.damageValue : '0') || 0
                let isActive = false
                if (level === 1 && damage >= 1) isActive = true
                if (level === 2 && damage >= item.thresholds.major) isActive = true
                if (level === 3 && damage >= item.thresholds.severe) isActive = true
                
                return (
                  <span 
                    key={level}
                    style={{
                      ...styles.damageDrop,
                      color: isActive ? 'var(--red)' : 'var(--text-secondary)'
                    }}
                    onClick={(e) => {
                      e.stopPropagation()
                      if (type === 'adversary' || type === 'adversaries') {
                        if (level === 1) {
                          adversaryLogic.setDamageValue('1')
                        } else if (level === 2) {
                          adversaryLogic.setDamageValue(item.thresholds.major.toString())
                        } else if (level === 3) {
                          adversaryLogic.setDamageValue(item.thresholds.severe.toString())
                        }
                      }
                    }}
                    title={`Click to set damage to ${level === 1 ? '1' : level === 2 ? item.thresholds.major : item.thresholds.severe}`}
                  >
                    <Droplet size={16} />
                  </span>
                )
              })
            )}
            <button
              style={{
                ...styles.applyButton,
                backgroundColor: 'var(--gray-600)'
              }}
              onClick={(e) => {
                e.stopPropagation()
                if (type === 'adversary' || type === 'adversaries') {
                  if (!adversaryLogic.damageValue || parseInt(adversaryLogic.damageValue) < 1) {
                    // Close damage input if no damage entered
                    adversaryLogic.setShowDamageInput(false)
                    adversaryLogic.setDamageValue('')
                  } else {
                    // Apply damage if damage entered
                    adversaryLogic.applyDamage()
                  }
                }
              }}
              title={(!adversaryLogic.damageValue || parseInt(adversaryLogic.damageValue) < 1) ? 'Close damage input' : 'Apply damage'}
            >
              {(!adversaryLogic.damageValue || parseInt(adversaryLogic.damageValue) < 1) ? <X size={16} /> : <CheckCircle size={16} />}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ============================================================================
  // EXPANDED VIEW RENDERERS
  // ============================================================================

  const renderExpandedAdversary = () => {
    const showDrag = false // Temporarily disabled drag handles
    const isDead = (item.hp || 0) >= (item.hpMax || 1)
    const isEditMode = mode === 'edit'
    

    return (
      <div 
        className={getCardClassName()}
        style={{
          ...getCardStyle(true),
          padding: 0,
          minHeight: '400px',
          opacity: isDead ? 0.7 : 1,
          backgroundColor: isDead ? 'var(--gray-900)' : getCardStyle(true).backgroundColor,
          borderColor: isDead ? 'color-mix(in srgb, var(--gray-600) 40%, transparent)' : (isSelected ? 'var(--purple)' : (isHovered && mode !== 'expanded' ? 'var(--border-hover)' : 'var(--border)')),
          borderWidth: isSelected ? '2px' : '2px',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative'
        }}
        {...dragAttributes}
        {...dragListeners}
        onClick={onClick}
        {...(mode !== 'expanded' && {
          onMouseEnter: handleMouseEnter,
          onMouseLeave: handleMouseLeave
        })}
      >
        {/* DEFEATED overlay */}
        {isDead && (
          <>
            {/* Diagonal striping pattern */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `repeating-linear-gradient(
                45deg,
                transparent,
                transparent 8px,
                var(--gray-600) 1px,
                var(--gray-600) 9px
              )`,
              pointerEvents: 'none',
              zIndex: 9999
            }} />
            {/* DEFEATED text */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              color: 'var(--text-secondary)',
              fontSize: '1rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              zIndex: 10000,
              pointerEvents: 'none',
              textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)',
              backgroundColor: 'var(--gray-900)',
              padding: '0.25rem 0.5rem',
              borderRadius: '0.5rem',
              border: '0.5px solid var(--gray-600)'
            }}>
              DEFEATED
            </div>
          </>
        )}
        {/* Fixed Header Section - Identical to Compact View */}
        <div className="border-b" style={{
          padding: '12px',
          flexShrink: 0,
          backgroundColor: 'var(--bg-card)',
          borderRadius: '8px 8px 0 0',
          position: 'relative',
          zIndex: isDead ? 1 : 'auto',
          borderBottomColor: isSelected ? 'var(--purple)' : 'var(--border)'
        }}>
          {/* Main Row - Name/Type on left, HP/Stress/Difficulty on right */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            position: 'relative',
            zIndex: isDead ? 1 : 'auto'
          }}>
            {/* Left side - Name and Type (takes remaining space) */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: '0.25rem',
              flex: '1 1 0%',
              minWidth: 0
            }}>
              <h4 style={{
                ...styles.rowTitle,
                color: isDead ? 'color-mix(in srgb, var(--gray-400) 80%, transparent)' : styles.rowTitle.color
              }}>
                {renderTitle()}
              </h4>
              {/* Type badge removed for compact adversary view */}
            </div>

            {/* Right side - HP pips, Stress pips, Difficulty, Delete (fixed minimum width) */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              flex: '0 0 auto',
              minWidth: 'fit-content'
            }}>
            {/* Control Buttons Group - HP and Stress stacked vertically */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.125rem',
              alignItems: 'flex-end',
              padding: '0.25rem', // Add padding to cover the gap between HP and stress
              margin: '-0.25rem' // Negative margin to offset visual padding
            }}>
              {/* HP Pips */}
              <Pips
                type="adversaryHP"
                value={item.hp || 0}
                maxValue={item.hpMax || 1}
                onChange={(newValue) => {
                  const currentHp = item.hp || 0
                  if (newValue > currentHp) {
                    // Increase HP = take damage
                    onApplyDamage && onApplyDamage(item.id, newValue - currentHp, item.hp, item.hpMax)
                  } else if (newValue < currentHp) {
                    // Decrease HP = heal
                    onApplyHealing && onApplyHealing(item.id, currentHp - newValue, item.hp)
                  }
                }}
                containerStyle={{
                  cursor: 'pointer',
                  padding: '0.5rem 0.25rem', // Expanded padding for generous tap target
                  borderRadius: '0.125rem',
                  transition: 'all 0.2s ease'
                }}
                pipStyle={{
                  fontSize: '0.75rem'
                }}
                showTooltip={false}
                enableBoundaryClick={true}
              />

              {/* Stress Pips */}
              {item.stressMax > 0 && (
                <Pips
                  type="adversaryStress"
                  value={item.stress || 0}
                  maxValue={item.stressMax}
                  onChange={(newValue) => {
                    const currentStress = item.stress || 0
                    const stressChange = newValue - currentStress
                    onApplyStressChange && onApplyStressChange(item.id, stressChange, item.stress)
                  }}
                  containerStyle={{
                    cursor: 'pointer',
                    padding: '0.0625rem',
                    borderRadius: '0.125rem',
                    transition: 'all 0.2s ease'
                  }}
                  pipStyle={{
                    fontSize: '0.75rem'
                  }}
                  showTooltip={false}
                  enableBoundaryClick={true}
                />
              )}
            </div>

            {/* Difficulty and Type Badge Group */}
            <div 
              onClick={adversaryLogic.handleDifficultyClick}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.25rem',
                cursor: ((item.thresholds && item.thresholds.major && item.thresholds.severe) || item.type === 'Minion') ? 'pointer' : 'default',
                padding: '0.5rem', // Generous tap target but invisible
                margin: '-0.5rem', // Negative margin to offset visual padding
                borderRadius: '0.25rem',
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if ((item.thresholds && item.thresholds.major && item.thresholds.severe) || item.type === 'Minion') {
                  e.target.style.backgroundColor = 'var(--gray-800)'
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent'
              }}
              title={(item.thresholds && item.thresholds.major && item.thresholds.severe) ? `Click to enter damage (thresholds: ${item.thresholds.major}/${item.thresholds.severe})` : item.type === 'Minion' ? 'Click to enter damage (minion mechanics)' : ''}
            >
              {/* Type Badge */}
              {item.type && (
                <span style={{
                  fontSize: '0.625rem',
                  fontWeight: 500,
                  color: isDead ? 'color-mix(in srgb, var(--gray-400) 80%, transparent)' : 'var(--text-secondary)',
                  letterSpacing: '0.5px',
                  textAlign: 'center',
                  lineHeight: 1,
                  width: '50px', // Increased width to accommodate "Standard" (8 chars)
                  display: 'block',
                  paddingLeft: 0 // Remove any left padding
                }}>
                  {item.type}
                </span>
              )}

              {/* Difficulty Badge */}
              {item.difficulty && (
                <div 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative'
                  }}
                >
                  <Hexagon 
                    size={32} 
                    strokeWidth={1}
                    style={{
                      color: 'var(--text-secondary)',
                      transform: 'rotate(30deg)'
                    }}
                  />
                  <span style={{
                    position: 'absolute',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: 'white',
                    pointerEvents: 'none'
                  }}>
                    {item.difficulty}
                  </span>
                </div>
              )}
            </div>

            {/* Delete Button */}
            {showDrag && (
              <button
                className="border rounded-sm"
                style={{
                  background: 'var(--red)',
                  borderColor: 'var(--red)',
                  padding: '0.25rem',
                  minWidth: '1.5rem',
                  height: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.1s ease',
                  color: 'white',
                  fontSize: '1rem'
                }}
                onClick={(e) => {
                  e.stopPropagation()
                  e.preventDefault()
                  onDelete && onDelete(item.id)
                }}
                onMouseEnter={(e) => e.target.style.background = 'var(--red-dark)'}
                onMouseLeave={(e) => e.target.style.background = 'var(--red)'}
                title="Delete item"
              >
                ×
              </button>
            )}
          </div>
        </div>
        </div>

        {/* Scrollable Content Area */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '12px',
          borderRadius: '0 0 8px 8px',
          position: 'relative',
          zIndex: isDead ? 1 : 'auto'
        }}>
          {/* Tier and Type Information */}
          {(item.tier || item.type) && (
            <div style={{
              marginBottom: '1rem',
              paddingBottom: '0.75rem',
              borderBottom: '1px solid var(--border)'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                {item.tier && (
                  <span style={{
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: isDead ? 'color-mix(in srgb, var(--gray-400) 80%, transparent)' : 'var(--text-secondary)',
                    letterSpacing: '0.5px',
                    padding: '0.25rem 0.5rem',
                    backgroundColor: 'var(--gray-800)',
                    borderRadius: '0.25rem',
                    border: '1px solid var(--border)'
                  }}>
                    Tier {item.tier}
                  </span>
                )}
                {item.type && (
                  <span style={{
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: isDead ? 'color-mix(in srgb, var(--gray-400) 80%, transparent)' : 'var(--text-secondary)',
                    letterSpacing: '0.5px',
                    padding: '0.25rem 0.5rem',
                    backgroundColor: 'var(--gray-800)',
                    borderRadius: '0.25rem',
                    border: '1px solid var(--border)'
                  }}>
                    {item.type}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Description Section */}
        {item.description && (
          <div style={{
            marginBottom: '1rem',
            paddingBottom: '0.75rem',
            borderBottom: '1px solid var(--border)'
          }}>
            <h3 style={{
              fontSize: '1rem',
              fontWeight: 600,
              color: 'var(--text-primary)',
              margin: '0 0 0.5rem 0'
            }}>
              Description
            </h3>
            {isEditMode ? (
              <textarea
                style={{
                  width: '100%',
                  minHeight: '100px',
                  padding: '0.5rem',
                  border: '1px solid var(--border)',
                  borderRadius: '0.5rem',
                  backgroundColor: 'var(--bg-secondary)',
                  color: 'white',
                  fontSize: '0.875rem',
                  lineHeight: 1.5,
                  resize: 'vertical',
                  fontFamily: 'inherit'
                }}
                value={item.description}
                onChange={(e) => {
                  onUpdate && onUpdate(item.id, { description: e.target.value })
                }}
                placeholder="Enter adversary description..."
              />
            ) : (
              <p style={{
                fontSize: '0.875rem',
                lineHeight: 1.5,
                color: 'var(--text-secondary)',
                margin: 0,
                whiteSpace: 'pre-wrap'
              }}>
                {item.description}
              </p>
            )}
          </div>
        )}

        {/* Motives Section */}
        {item.motives && (
          <div style={{
            marginBottom: '1rem',
            paddingBottom: '0.75rem',
            borderBottom: '1px solid var(--border)'
          }}>
            <h3 style={{
              fontSize: '1rem',
              fontWeight: 600,
              color: 'var(--text-primary)',
              margin: '0 0 0.5rem 0'
            }}>
              Motives
            </h3>
            {isEditMode ? (
              <textarea
                style={{
                  width: '100%',
                  minHeight: '80px',
                  padding: '0.5rem',
                  border: '1px solid var(--border)',
                  borderRadius: '0.5rem',
                  backgroundColor: 'var(--bg-secondary)',
                  color: 'white',
                  fontSize: '0.875rem',
                  lineHeight: 1.5,
                  resize: 'vertical',
                  fontFamily: 'inherit'
                }}
                value={item.motives}
                onChange={(e) => {
                  onUpdate && onUpdate(item.id, { motives: e.target.value })
                }}
                placeholder="Enter adversary motives..."
              />
            ) : (
              <p style={{
                fontSize: '0.875rem',
                lineHeight: 1.5,
                color: 'var(--text-secondary)',
                margin: 0,
                whiteSpace: 'pre-wrap'
              }}>
                {item.motives}
              </p>
            )}
          </div>
        )}

        {/* Core Stats Section */}
        <div style={{
          marginBottom: '1rem',
          paddingBottom: '0.75rem',
          borderBottom: '1px solid var(--border)'
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            fontSize: '0.875rem'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              flexWrap: 'wrap'
            }}>
              <span><strong>Difficulty:</strong> {item.difficulty}</span>
              {item.thresholds && (
                <span><strong>Thresholds:</strong> {item.thresholds.major}/{item.thresholds.severe}</span>
              )}
              <span><strong>HP:</strong> {item.hpMax}</span>
              {item.stressMax > 0 && (
                <span><strong>Stress:</strong> {item.stressMax}</span>
              )}
            </div>
            {(item.atk !== undefined || item.weapon || item.damage) && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                flexWrap: 'wrap'
              }}>
                {item.atk !== undefined && (
                  <span><strong>ATK:</strong> {item.atk >= 0 ? '+' : ''}{item.atk}</span>
                )}
                {item.weapon && (
                  <span><strong>{item.weapon}:</strong> {item.range || 'Melee'}</span>
                )}
                {item.damage && (
                  <span><strong>Damage:</strong> {item.damage}</span>
                )}
              </div>
            )}
            {item.experience && item.experience.length > 0 && (
              <div>
                <strong>Experience:</strong> {item.experience.map(exp => 
                  typeof exp === 'string' ? exp : `${exp.name} ${exp.modifier >= 0 ? '+' : ''}${exp.modifier}`
                ).join(', ')}
              </div>
            )}
          </div>
        </div>

        {/* Features Section - Organized by Type */}
        {item.features && item.features.length > 0 && (
          <div style={{
            marginBottom: '1rem'
          }}>
            {/* Passives */}
            {item.features.filter(f => f.type === 'Passive').length > 0 && (
              <div style={{ marginBottom: '1rem' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  marginBottom: '0.75rem'
                }}>
                  <h4 style={{
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: 'white',
                    margin: 0,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Passives
                  </h4>
                  <hr style={{
                    flex: 1,
                    border: 'none',
                    borderTop: '1px solid var(--border)',
                    margin: 0
                  }} />
                </div>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem'
                }}>
                  {item.features.filter(f => f.type === 'Passive').map((feature, index) => (
                    <div key={index} style={{
                      fontSize: '0.875rem',
                      lineHeight: 1.4,
                      color: 'var(--text-secondary)'
                    }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {feature.name}
                      </span>
                      {feature.description && (
                        <>
                          <span> - </span>
                          <span>{feature.description}</span>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            {item.features.filter(f => f.type === 'Action').length > 0 && (
              <div style={{ marginBottom: '1rem' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  marginBottom: '0.75rem'
                }}>
                  <h4 style={{
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: 'white',
                    margin: 0,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Actions
                  </h4>
                  <hr style={{
                    flex: 1,
                    border: 'none',
                    borderTop: '1px solid var(--border)',
                    margin: 0
                  }} />
                </div>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem'
                }}>
                  {item.features.filter(f => f.type === 'Action').map((feature, index) => (
                    <div key={index} style={{
                      fontSize: '0.875rem',
                      lineHeight: 1.4,
                      color: 'var(--text-secondary)'
                    }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {feature.name}
                      </span>
                      {feature.description && (
                        <>
                          <span> - </span>
                          <span>{feature.description}</span>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reactions */}
            {item.features.filter(f => f.type === 'Reaction').length > 0 && (
              <div style={{ marginBottom: '1rem' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  marginBottom: '0.75rem'
                }}>
                  <h4 style={{
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: 'white',
                    margin: 0,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Reactions
                  </h4>
                  <hr style={{
                    flex: 1,
                    border: 'none',
                    borderTop: '1px solid var(--border)',
                    margin: 0
                  }} />
                </div>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem'
                }}>
                  {item.features.filter(f => f.type === 'Reaction').map((feature, index) => (
                    <div key={index} style={{
                      fontSize: '0.875rem',
                      lineHeight: 1.4,
                      color: 'var(--text-secondary)'
                    }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {feature.name}
                      </span>
                      {feature.description && (
                        <>
                          <span> - </span>
                          <span>{feature.description}</span>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        </div>

        {/* Damage Input Popup for Adversaries */}
        {renderDamageInput()}
      </div>
    )
  }

  // ============================================================================
  // EXPANDED ENVIRONMENT RENDERER
  // ============================================================================

  const renderExpandedEnvironment = () => {
    const showDrag = false // Temporarily disabled drag handles
    const isEditMode = mode === 'edit'

    return (
      <div 
        className={getCardClassName()}
        style={{
          ...getCardStyle(true),
          padding: 0,
          minHeight: '400px',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative'
        }}
        {...dragAttributes}
        {...dragListeners}
        onClick={onClick}
        {...(mode !== 'expanded' && {
          onMouseEnter: handleMouseEnter,
          onMouseLeave: handleMouseLeave
        })}
      >
        {/* Fixed Header Section - Similar to Adversary View */}
        <div className="border-b" style={{
          padding: '12px',
          flexShrink: 0,
          backgroundColor: 'var(--bg-card)',
          borderRadius: '8px 8px 0 0',
          position: 'relative'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            {/* Left side - Name, Type, and Tier */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: '0.25rem'
            }}>
              <h2 style={{
                fontSize: '1rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
                margin: 0
              }}>
                {item.name}
              </h2>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}>
                {item.tier && (
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    color: 'var(--text-secondary)',
                    letterSpacing: '0.5px'
                  }}>
                    Tier {item.tier}
                  </span>
                )}
                {item.type && (
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    color: 'var(--text-secondary)',
                    letterSpacing: '0.5px'
                  }}>
                    {item.type}
                  </span>
                )}
              </div>
            </div>

            {/* Right side - Difficulty and Delete */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              {/* Difficulty Badge */}
              {item.difficulty && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative'
                }}>
                  <Hexagon 
                    size={32}
                    strokeWidth={1}
                    style={{
                      color: 'var(--text-secondary)'
                    }}
                  />
                  <span style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: 'white',
                    pointerEvents: 'none'
                  }}>
                    {item.difficulty}
                  </span>
                </div>
              )}

              {/* Delete Button */}
              {showDrag && (
                <button
                  className="border rounded-sm"
                  style={{
                    background: 'var(--red)',
                    borderColor: 'var(--red)',
                    padding: '0.25rem',
                    minWidth: '1.5rem',
                    height: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.1s ease',
                    color: 'white',
                    fontSize: '1rem'
                  }}
                  onClick={(e) => {
                    e.stopPropagation()
                    e.preventDefault()
                    onDelete && onDelete(item.id)
                  }}
                  onMouseEnter={(e) => e.target.style.background = 'var(--red-dark)'}
                  onMouseLeave={(e) => e.target.style.background = 'var(--red)'}
                  title="Delete environment"
                >
                  ×
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '12px',
          borderRadius: '0 0 8px 8px'
        }}>
          {/* Description Section */}
          {item.description && (
            <div style={{
              marginBottom: '1rem',
              paddingBottom: '0.75rem',
              borderBottom: '1px solid var(--border)'
            }}>
              <h3 style={{
                fontSize: '1rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
                margin: '0 0 0.5rem 0'
              }}>
                Description
              </h3>
              {isEditMode ? (
                <textarea
                  style={{
                    width: '100%',
                    minHeight: '100px',
                    padding: '0.5rem',
                    border: '1px solid var(--border)',
                    borderRadius: '0.5rem',
                    backgroundColor: 'var(--bg-secondary)',
                    color: 'white',
                    fontSize: '0.875rem',
                    lineHeight: 1.5,
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                  value={item.description}
                  onChange={(e) => {
                    onUpdate && onUpdate(item.id, { description: e.target.value })
                  }}
                  placeholder="Enter environment description..."
                />
              ) : (
                <p style={{
                  fontSize: '0.875rem',
                  lineHeight: 1.5,
                  color: 'var(--text-secondary)',
                  margin: 0,
                  whiteSpace: 'pre-wrap'
                }}>
                  {item.description}
                </p>
              )}
            </div>
          )}

          {/* Impulses Section */}
          {item.impulses && (
            <div style={{
              marginBottom: '1rem',
              paddingBottom: '0.75rem',
              borderBottom: '1px solid var(--border)'
            }}>
              <h3 style={{
                fontSize: '1rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
                margin: '0 0 0.5rem 0'
              }}>
                Impulses
              </h3>
              <p style={{
                fontSize: '0.875rem',
                lineHeight: 1.5,
                color: 'var(--text-secondary)',
                margin: 0,
                whiteSpace: 'pre-wrap'
              }}>
                {item.impulses}
              </p>
            </div>
          )}

          {/* Core Stats Section */}
          <div style={{
            marginBottom: '1rem',
            paddingBottom: '0.75rem',
            borderBottom: '1px solid var(--border)'
          }}>
            <h3 style={{
              fontSize: '1rem',
              fontWeight: 600,
              color: 'var(--text-primary)',
              margin: '0 0 0.5rem 0'
            }}>
              Core Stats
            </h3>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              fontSize: '0.875rem'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                flexWrap: 'wrap'
              }}>
                <span><strong>Difficulty:</strong> {item.difficulty || '~'}</span>
                <span><strong>Type:</strong> {item.type}</span>
                <span><strong>Tier:</strong> {item.tier}</span>
              </div>
              {item.potentialAdversaries && item.potentialAdversaries.length > 0 && (
                <div>
                  <strong>Potential Adversaries:</strong>
                  <div style={{
                    marginTop: '0.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.125rem'
                  }}>
                    {item.potentialAdversaries.map((adversary, index) => (
                      <div key={index} style={{
                        fontSize: '0.75rem',
                        color: 'var(--text-secondary)',
                        marginLeft: '0.5rem'
                      }}>
                        • {adversary}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Features Section - Organized by Type */}
          {item.features && item.features.length > 0 && (
            <div style={{
              marginBottom: '1rem'
            }}>
              {/* Passives */}
              {item.features.filter(f => f.type === 'Passive').length > 0 && (
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    marginBottom: '0.75rem'
                  }}>
                    <h4 style={{
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: 'white',
                      margin: 0,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      Passives
                    </h4>
                    <hr style={{
                      flex: 1,
                      border: 'none',
                      borderTop: '1px solid var(--border)',
                      margin: 0
                    }} />
                  </div>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem'
                  }}>
                    {item.features.filter(f => f.type === 'Passive').map((feature, index) => (
                      <div key={index} style={{
                        fontSize: '0.875rem',
                        lineHeight: 1.4,
                        color: 'var(--text-secondary)'
                      }}>
                        <div style={{ 
                          fontWeight: 600, 
                          color: 'white',
                          marginBottom: '0.25rem'
                        }}>
                          {feature.name}
                        </div>
                        <div style={{ marginBottom: '0.25rem' }}>
                          {feature.description}
                        </div>
                        {feature.details && feature.details.length > 0 && (
                          <div style={{ marginLeft: '0.5rem' }}>
                            <strong>Details:</strong>
                            <ul style={{ 
                              margin: '0.25rem 0 0 0', 
                              paddingLeft: '1rem',
                              fontSize: '0.75rem'
                            }}>
                              {feature.details.map((detail, detailIndex) => (
                                <li key={detailIndex}>{detail}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {feature.prompts && feature.prompts.length > 0 && (
                          <div style={{ marginLeft: '0.5rem' }}>
                            <strong>Prompts:</strong>
                            <ul style={{ 
                              margin: '0.25rem 0 0 0', 
                              paddingLeft: '1rem',
                              fontSize: '0.75rem'
                            }}>
                              {feature.prompts.map((prompt, promptIndex) => (
                                <li key={promptIndex} style={{ fontStyle: 'italic' }}>
                                  "{prompt}"
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              {item.features.filter(f => f.type === 'Action').length > 0 && (
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    marginBottom: '0.75rem'
                  }}>
                    <h4 style={{
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: 'white',
                      margin: 0,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      Actions
                    </h4>
                    <hr style={{
                      flex: 1,
                      border: 'none',
                      borderTop: '1px solid var(--border)',
                      margin: 0
                    }} />
                  </div>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem'
                  }}>
                    {item.features.filter(f => f.type === 'Action').map((feature, index) => (
                      <div key={index} style={{
                        fontSize: '0.875rem',
                        lineHeight: 1.4,
                        color: 'var(--text-secondary)'
                      }}>
                        <div style={{ 
                          fontWeight: 600, 
                          color: 'white',
                          marginBottom: '0.25rem'
                        }}>
                          {feature.name}
                        </div>
                        <div style={{ marginBottom: '0.25rem' }}>
                          {feature.description}
                        </div>
                        {feature.details && feature.details.length > 0 && (
                          <div style={{ marginLeft: '0.5rem' }}>
                            <strong>Details:</strong>
                            <ul style={{ 
                              margin: '0.25rem 0 0 0', 
                              paddingLeft: '1rem',
                              fontSize: '0.75rem'
                            }}>
                              {feature.details.map((detail, detailIndex) => (
                                <li key={detailIndex}>{detail}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {feature.prompts && feature.prompts.length > 0 && (
                          <div style={{ marginLeft: '0.5rem' }}>
                            <strong>Prompts:</strong>
                            <ul style={{ 
                              margin: '0.25rem 0 0 0', 
                              paddingLeft: '1rem',
                              fontSize: '0.75rem'
                            }}>
                              {feature.prompts.map((prompt, promptIndex) => (
                                <li key={promptIndex} style={{ fontStyle: 'italic' }}>
                                  "{prompt}"
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reactions */}
              {item.features.filter(f => f.type === 'Reaction').length > 0 && (
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    marginBottom: '0.75rem'
                  }}>
                    <h4 style={{
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: 'white',
                      margin: 0,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      Reactions
                    </h4>
                    <hr style={{
                      flex: 1,
                      border: 'none',
                      borderTop: '1px solid var(--border)',
                      margin: 0
                    }} />
                  </div>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem'
                  }}>
                    {item.features.filter(f => f.type === 'Reaction').map((feature, index) => (
                      <div key={index} style={{
                        fontSize: '0.875rem',
                        lineHeight: 1.4,
                        color: 'var(--text-secondary)'
                      }}>
                        <div style={{ 
                          fontWeight: 600, 
                          color: 'white',
                          marginBottom: '0.25rem'
                        }}>
                          {feature.name}
                        </div>
                        <div style={{ marginBottom: '0.25rem' }}>
                          {feature.description}
                        </div>
                        {feature.details && feature.details.length > 0 && (
                          <div style={{ marginLeft: '0.5rem' }}>
                            <strong>Details:</strong>
                            <ul style={{ 
                              margin: '0.25rem 0 0 0', 
                              paddingLeft: '1rem',
                              fontSize: '0.75rem'
                            }}>
                              {feature.details.map((detail, detailIndex) => (
                                <li key={detailIndex}>{detail}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {feature.prompts && feature.prompts.length > 0 && (
                          <div style={{ marginLeft: '0.5rem' }}>
                            <strong>Prompts:</strong>
                            <ul style={{ 
                              margin: '0.25rem 0 0 0', 
                              paddingLeft: '1rem',
                              fontSize: '0.75rem'
                            }}>
                              {feature.prompts.map((prompt, promptIndex) => (
                                <li key={promptIndex} style={{ fontStyle: 'italic' }}>
                                  "{prompt}"
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  // Render expanded view for adversaries
  if ((mode === 'expanded' || mode === 'edit') && (type === 'adversary' || type === 'adversaries')) {
    return renderExpandedAdversary()
  }

  // Render expanded view for environments
  if ((mode === 'expanded' || mode === 'edit') && (type === 'environment' || type === 'environments')) {
    return renderExpandedEnvironment()
  }

  // For other modes, show coming soon message for unsupported types
  if (mode !== 'compact') {
    // Check if we have an expanded renderer for this type
    const hasExpandedRenderer = (type === 'adversary' || type === 'adversaries' || type === 'environment' || type === 'environments')
    
    if (!hasExpandedRenderer) {
      return (
        <div className={getCardClassName()} style={getCardStyle(true)}>
          <div style={styles.rowMain}>
            <h4 style={styles.rowTitle}>{renderTitle()}</h4>
            <div style={styles.rowMeta}>{renderMeta()}</div>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '12px', margin: 0 }}>
            Expanded view coming soon for {type}
          </p>
        </div>
      )
    }
  }

  // For adversaries, use the improved compact layout
  if (type === 'adversary' || type === 'adversaries') {
    const showDrag = false // Temporarily disabled drag handles
    const isDead = (item.hp || 0) >= (item.hpMax || 1)
    
    return (
      <div
        className={getCardClassName()}
        style={{
          ...getCardStyle(),
          opacity: isDead ? 0.7 : 1,
          backgroundColor: isDead ? 'var(--gray-900)' : getCardStyle().backgroundColor,
          borderColor: isDead ? 'color-mix(in srgb, var(--gray-600) 40%, transparent)' : (isSelected ? 'var(--purple)' : (isHovered && mode !== 'expanded' ? 'var(--border-hover)' : 'var(--border)')),
          paddingLeft: showDrag ? '2.25rem' : '0.75rem',
          position: 'relative'
        }}
        onClick={onClick}
        {...(mode !== 'expanded' && {
          onMouseEnter: handleMouseEnter,
          onMouseLeave: handleMouseLeave
        })}
        {...dragAttributes}
        {...dragListeners}
      >
        {/* DEFEATED overlay */}
        {isDead && (
          <>
            {/* Diagonal striping pattern */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `repeating-linear-gradient(
                45deg,
                transparent,
                transparent 8px,
                var(--gray-600) 1px,
                var(--gray-600) 9px
              )`,
              pointerEvents: 'none',
              zIndex: 9999
            }} />
            {/* DEFEATED text */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              color: 'var(--text-secondary)',
              fontSize: '1rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              zIndex: 10000,
              pointerEvents: 'none',
              textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)',
              backgroundColor: 'var(--gray-900)',
              padding: '0.25rem 0.5rem',
              borderRadius: '0.5rem',
              border: '0.5px solid var(--gray-600)'
            }}>
              DEFEATED
            </div>
          </>
        )}
        {showDrag && (
          <div 
            style={{
              position: 'absolute',
              left: '0.5rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-secondary)',
              cursor: 'grab',
              fontSize: '0.875rem',
              lineHeight: 1,
              padding: '0.25rem',
              borderRadius: '0.5rem',
              transition: 'all 0.2s ease',
              zIndex: 10
            }}
            {...dragAttributes} 
            {...dragListeners}
          >
            ⋮⋮
          </div>
        )}
        
        {/* Main Row - Name/Type on left, HP/Stress/Difficulty on right */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          position: 'relative',
          zIndex: isDead ? 1 : 'auto'
        }}>
          {/* Left side - Name and Type (takes remaining space) */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: '0.25rem',
            flex: '1 1 0%',
            minWidth: 0
          }}>
            <h4 style={{
              ...styles.rowTitle,
              color: isDead ? 'color-mix(in srgb, var(--gray-400) 80%, transparent)' : styles.rowTitle.color
            }}>
              {renderTitle()}
            </h4>
            {/* Type badge removed for compact adversary view */}
          </div>

          {/* Right side - HP pips, Stress pips, Difficulty, Delete (fixed minimum width) */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem', // Reduced from 0.5rem to 0.25rem
            flex: '0 0 auto',
            minWidth: '200px', // Fixed minimum width for consistent spacing
            justifyContent: 'flex-end' // Align content to the right edge
          }}>
            {/* Control Buttons Group - HP and Stress stacked vertically */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.125rem',
              alignItems: 'flex-end',
              padding: '0.25rem', // Add padding to cover the gap between HP and stress
              margin: '-0.25rem' // Negative margin to offset visual padding
            }}>
              {/* HP Pips */}
              <Pips
                type="adversaryHP"
                value={item.hp || 0}
                maxValue={item.hpMax || 1}
                onChange={(newValue) => {
                  const currentHp = item.hp || 0
                  if (newValue > currentHp) {
                    // Increase HP = take damage
                    onApplyDamage && onApplyDamage(item.id, newValue - currentHp, item.hp, item.hpMax)
                  } else if (newValue < currentHp) {
                    // Decrease HP = heal
                    onApplyHealing && onApplyHealing(item.id, currentHp - newValue, item.hp)
                  }
                }}
                containerStyle={{
                  cursor: 'pointer',
                  padding: '0.5rem 0.25rem', // Expanded padding for generous tap target
                  borderRadius: '0.125rem',
                  transition: 'all 0.2s ease'
                }}
                pipStyle={{
                  fontSize: '0.75rem'
                }}
                showTooltip={false}
                enableBoundaryClick={true}
              />

              {/* Stress Pips */}
              {item.stressMax > 0 && (
                <Pips
                  type="adversaryStress"
                  value={item.stress || 0}
                  maxValue={item.stressMax}
                  onChange={(newValue) => {
                    const currentStress = item.stress || 0
                    const stressChange = newValue - currentStress
                    onApplyStressChange && onApplyStressChange(item.id, stressChange, item.stress)
                  }}
                  containerStyle={{
                    cursor: 'pointer',
                    padding: '0.0625rem',
                    borderRadius: '0.125rem',
                    transition: 'all 0.2s ease'
                  }}
                  pipStyle={{
                    fontSize: '0.75rem'
                  }}
                  showTooltip={false}
                  enableBoundaryClick={true}
                />
              )}
            </div>

            {/* Difficulty and Type Badge Group */}
            <div 
              onClick={adversaryLogic.handleDifficultyClick}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.25rem',
                cursor: ((item.thresholds && item.thresholds.major && item.thresholds.severe) || item.type === 'Minion') ? 'pointer' : 'default',
                padding: '0.5rem', // Generous tap target but invisible
                margin: '-0.5rem', // Negative margin to offset visual padding
                borderRadius: '0.25rem',
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if ((item.thresholds && item.thresholds.major && item.thresholds.severe) || item.type === 'Minion') {
                  e.target.style.backgroundColor = 'var(--gray-800)'
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent'
              }}
              title={(item.thresholds && item.thresholds.major && item.thresholds.severe) ? `Click to enter damage (thresholds: ${item.thresholds.major}/${item.thresholds.severe})` : item.type === 'Minion' ? 'Click to enter damage (minion mechanics)' : ''}
            >
              {/* Type Badge */}
              {item.type && (
                <span style={{
                  fontSize: '0.625rem',
                  fontWeight: 500,
                  color: isDead ? 'color-mix(in srgb, var(--gray-400) 80%, transparent)' : 'var(--text-secondary)',
                  letterSpacing: '0.5px',
                  textAlign: 'center',
                  lineHeight: 1,
                  width: '50px', // Increased width to accommodate "Standard" (8 chars)
                  display: 'block',
                  paddingLeft: 0 // Remove any left padding
                }}>
                  {item.type}
                </span>
              )}

              {/* Difficulty Badge */}
              {item.difficulty && (
                <div 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative'
                  }}
                >
                  <Hexagon 
                    size={32} 
                    strokeWidth={1}
                    style={{
                      color: 'var(--text-secondary)',
                      transform: 'rotate(30deg)'
                    }}
                  />
                  <span style={{
                    position: 'absolute',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: 'white',
                    pointerEvents: 'none'
                  }}>
                    {item.difficulty}
                  </span>
                </div>
              )}
            </div>

            {/* Delete Button */}
            {console.log('Delete button check:', { onDelete: !!onDelete, isEditMode, shouldShow: onDelete && isEditMode })}
            {onDelete && isEditMode && (
              <button
                className="border rounded-sm"
                style={{
                  background: 'var(--red)',
                  borderColor: 'var(--red)',
                  padding: '0.25rem',
                  minWidth: '1.5rem',
                  height: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.1s ease',
                  color: 'white',
                  fontSize: '1rem'
                }}
                onClick={(e) => {
                  e.stopPropagation()
                  e.preventDefault()
                  onDelete && onDelete(item.id)
                }}
                onMouseEnter={(e) => e.target.style.background = 'var(--red-dark)'}
                onMouseLeave={(e) => e.target.style.background = 'var(--red)'}
                title="Delete item"
              >
                ×
              </button>
            )}
          </div>
        </div>
        
        {/* Damage Input Popup for Adversaries */}
        {renderDamageInput()}
      </div>
    )
  }

  // For environments, use a custom compact layout similar to adversaries
  if (type === 'environment' || type === 'environments') {
    const showDrag = false // Temporarily disabled drag handles
    
    return (
      <div
        className={getCardClassName()}
        style={{
          ...getCardStyle(),
          paddingLeft: showDrag ? '2.25rem' : '0.75rem',
          position: 'relative'
        }}
        onClick={onClick}
        {...(mode !== 'expanded' && {
          onMouseEnter: handleMouseEnter,
          onMouseLeave: handleMouseLeave
        })}
        {...dragAttributes}
        {...dragListeners}
      >
        {showDrag && (
          <div 
            style={{
              position: 'absolute',
              left: '0.5rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-secondary)',
              cursor: 'grab',
              fontSize: '0.875rem',
              lineHeight: 1,
              padding: '0.25rem',
              borderRadius: '0.5rem',
              transition: 'all 0.2s ease',
              zIndex: 10
            }}
            {...dragAttributes} 
            {...dragListeners}
          >
            ⋮⋮
          </div>
        )}
        
        {/* Main Row - Name/Type/Tier on left, Delete on right */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '0.5rem',
          position: 'relative'
        }}>
          {/* Left side - Name, Tier, and Type */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: '0.25rem'
          }}>
            <h4 style={styles.rowTitle}>
              {renderTitle()}
            </h4>
            {item.type && (
              <span style={{
                fontSize: '0.75rem',
                fontWeight: 500,
                color: 'var(--text-secondary)',
                letterSpacing: '0.5px'
              }}>
                {item.type}
              </span>
            )}
          </div>

          {/* Right side - Difficulty and Delete */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            {/* Difficulty Badge */}
            {item.difficulty && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
              }}>
                <Hexagon 
                  size={32}
                  strokeWidth={1}
                  style={{
                    color: 'var(--text-secondary)'
                  }}
                />
                <span style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: 'white',
                  pointerEvents: 'none'
                }}>
                  {item.difficulty}
                </span>
              </div>
            )}

            {/* Type Badge */}
            {item.type && (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.125rem'
              }}>
                <span style={{
                  fontSize: '0.625rem',
                  fontWeight: 500,
                  color: isDead ? 'color-mix(in srgb, var(--gray-400) 80%, transparent)' : 'var(--text-secondary)',
                  letterSpacing: '0.5px',
                  textAlign: 'center',
                  lineHeight: 1,
                  width: '50px', // Increased width to accommodate "Standard" (8 chars)
                  display: 'block',
                  paddingLeft: 0 // Remove any left padding
                }}>
                  {item.type}
                </span>
              </div>
            )}

            {/* Delete Button */}
            {console.log('Delete button check:', { onDelete: !!onDelete, isEditMode, shouldShow: onDelete && isEditMode })}
            {onDelete && isEditMode && (
              <button
                className="border rounded-sm"
                style={{
                  background: 'var(--red)',
                  borderColor: 'var(--red)',
                  padding: '0.25rem',
                  minWidth: '1.5rem',
                  height: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.1s ease',
                  color: 'white',
                  fontSize: '1rem'
                }}
                onClick={(e) => {
                  e.stopPropagation()
                  e.preventDefault()
                  onDelete && onDelete(item.id)
                }}
                onMouseEnter={(e) => e.target.style.background = 'var(--red-dark)'}
                onMouseLeave={(e) => e.target.style.background = 'var(--red)'}
                title="Delete environment"
              >
                ×
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  // For other types, use the original layout
  return (
    <div
      className={getCardClassName()}
      style={getCardStyle()}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...dragAttributes}
      {...dragListeners}
    >
      {/* Header */}
      <div style={styles.rowMain}>
        <h4 style={styles.rowTitle}>
          {renderTitle()}
        </h4>
        <div style={styles.rowMeta}>
          {renderMeta()}
        </div>
      </div>

      {/* Progress pips for countdowns */}
      {renderProgressPips()}

      {/* Actions */}
      <div style={styles.cardActions}>
        <div style={styles.controlButtons}>
          {renderTypeSpecificContent()}
        </div>

        <div style={{ display: 'flex', alignItems: 'center' }}>
          {/* Temporarily disabled drag handles */}
        {false && dragAttributes && dragListeners && (
            <button
              style={styles.button}
              onClick={(e) => {
                e.stopPropagation()
                e.preventDefault()
                onDelete && onDelete(item.id)
              }}
              title={`Delete ${type}`}
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>
      
      {/* Damage Input Popup for Adversaries */}
      {renderDamageInput()}
    </div>
  )
}

export default GameCard
