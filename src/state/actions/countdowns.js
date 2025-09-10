export const buildCountdownActions = (setGameState) => {
  const createCountdown = (countdownData) => {
    const newCountdown = {
      id: Date.now().toString(),
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


