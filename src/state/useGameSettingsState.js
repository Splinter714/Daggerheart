// Game settings state management module (fear, party size)
import { useState, useEffect, useRef } from 'react'
import { readFromStorage, writeToStorage } from './StorageHelpers'

export function useGameSettingsState(initialFear = { value: 0, visible: false }, initialPartySize = 4) {
  const [fear, setFear] = useState(initialFear)
  const [partySize, setPartySize] = useState(initialPartySize)
  const isInitialMount = useRef(true)

  // Save to storage whenever settings change (but skip initial mount)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }
    const savedState = readFromStorage('daggerheart-game-state') || {}
    writeToStorage('daggerheart-game-state', {
      ...savedState,
      fear,
      partySize
    })
  }, [fear, partySize])

  const updateFear = (value) => {
    setFear(prev => ({ ...prev, value }))
  }

  const updatePartySize = (size) => {
    setPartySize(Math.max(1, size))
  }

  return {
    fear,
    partySize,
    updateFear,
    updatePartySize
  }
}

