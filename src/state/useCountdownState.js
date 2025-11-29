// Countdown state management module
import { useState, useEffect, useRef } from 'react'
import { generateId, readFromStorage, writeToStorage } from './StorageHelpers'

export function useCountdownState(initialCountdowns = []) {
  const [countdowns, setCountdowns] = useState(initialCountdowns)
  const isInitialMount = useRef(true)

  // Save to storage whenever countdowns change (but skip initial mount)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }
    const savedState = readFromStorage('daggerheart-game-state') || {}
    writeToStorage('daggerheart-game-state', {
      ...savedState,
      countdowns
    })
  }, [countdowns])

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
    setCountdowns(prev => [...prev, newCountdown])
  }

  const updateCountdown = (id, updates) => {
    setCountdowns(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c))
  }

  const deleteCountdown = (id) => {
    setCountdowns(prev => prev.filter(c => c.id !== id))
  }

  const advanceCountdown = (id, newValue) => {
    setCountdowns(prev => prev.map(countdown => {
      if (countdown.id !== id) return countdown
      let finalValue = newValue
      if (countdown.loop === 'loop') {
        if (finalValue > countdown.max) {
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
    }))
  }

  const incrementCountdown = (id, amount = 1) => {
    setCountdowns(prev => prev.map(countdown => {
      if (countdown.id !== id) return countdown
      let newValue = countdown.value + amount
      if (countdown.loop === 'loop') {
        if (newValue > countdown.max) {
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
    }))
  }

  const decrementCountdown = (id) => {
    setCountdowns(prev => prev.map(countdown => {
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
    }))
  }

  return {
    countdowns,
    createCountdown,
    updateCountdown,
    deleteCountdown,
    advanceCountdown,
    incrementCountdown,
    decrementCountdown
  }
}

