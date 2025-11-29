import React, { createContext, useContext, useState, useEffect } from 'react'
import { readFromStorage, writeToStorage } from './StorageHelpers'
import { useAdversaryState } from './useAdversaryState'
import { useCountdownState } from './useCountdownState'
import { useEnvironmentState } from './useEnvironmentState'
import { useEncounterState } from './useEncounterState'
import { useGameSettingsState } from './useGameSettingsState'
import { useCustomContentState } from './useCustomContentState'

const GameStateContext = createContext()

export const GameStateProvider = ({ children }) => {
  const [isLoaded, setIsLoaded] = useState(false)
  
  // Load initial state from storage once
  const [initialState, setInitialState] = useState(() => {
    const savedState = readFromStorage('daggerheart-game-state')
    return savedState || {
      fear: { value: 0, visible: false },
      countdowns: [],
      adversaries: [],
      environments: [],
      partySize: 4,
      savedEncounters: [],
      currentEncounterName: 'Encounter'
    }
  })

  // Initialize all domain state modules with loaded values
  const gameSettings = useGameSettingsState(initialState.fear, initialState.partySize)
  const adversaryState = useAdversaryState(initialState.adversaries || [])
  const countdownState = useCountdownState(initialState.countdowns || [])
  const environmentState = useEnvironmentState(initialState.environments || [])
  const encounterState = useEncounterState(
    initialState.savedEncounters || [],
    initialState.currentEncounterName || 'Encounter'
  )
  const customContentState = useCustomContentState()

  // Mark as loaded after initial render
  useEffect(() => {
    setIsLoaded(true)
  }, [])

  // Compose gameState object for backward compatibility
  const gameState = {
    fear: gameSettings.fear,
    countdowns: countdownState.countdowns,
    adversaries: adversaryState.adversaries,
    environments: environmentState.environments,
    partySize: gameSettings.partySize,
    savedEncounters: encounterState.savedEncounters,
    currentEncounterName: encounterState.currentEncounterName
  }

  const value = {
    gameState,
    isLoaded,
    customContent: customContentState.customContent,
    // Fear actions
    updateFear: gameSettings.updateFear,
    // Party size actions
    updatePartySize: gameSettings.updatePartySize,
    // Current encounter name actions
    updateCurrentEncounterName: encounterState.updateCurrentEncounterName,
    // Saved encounters actions
    saveEncounter: encounterState.saveEncounter,
    loadEncounter: encounterState.loadEncounter,
    deleteEncounter: encounterState.deleteEncounter,
    // Countdown actions
    createCountdown: countdownState.createCountdown,
    updateCountdown: countdownState.updateCountdown,
    deleteCountdown: countdownState.deleteCountdown,
    advanceCountdown: countdownState.advanceCountdown,
    incrementCountdown: countdownState.incrementCountdown,
    decrementCountdown: countdownState.decrementCountdown,
    // Adversary actions
    createAdversary: adversaryState.createAdversary,
    createAdversariesBulk: adversaryState.createAdversariesBulk,
    updateAdversary: adversaryState.updateAdversary,
    deleteAdversary: adversaryState.deleteAdversary,
    // Environment actions
    createEnvironment: environmentState.createEnvironment,
    updateEnvironment: environmentState.updateEnvironment,
    deleteEnvironment: environmentState.deleteEnvironment,
    // Custom content actions
    addCustomAdversary: customContentState.addCustomAdversary,
    updateCustomAdversary: customContentState.updateCustomAdversary,
    deleteCustomAdversary: customContentState.deleteCustomAdversary,
  }

  return (
    <GameStateContext.Provider value={value}>
      {children}
    </GameStateContext.Provider>
  )
}

export const useGameState = () => {
  const context = useContext(GameStateContext)
  
  // If context is not available yet, return default values
  if (!context) {
    console.warn('useGameState: Context not available yet, returning defaults')
    return {
      // Loading state
      isLoaded: false,
      
      // State
      fear: { value: 0, visible: false },
      countdowns: [],
      adversaries: [],
      environments: [],
      partySize: 4,
      savedEncounters: [],
      customContent: { adversaries: [], environments: [] },
      
      // Actions (no-op functions)
      updateFear: () => {},
      updatePartySize: () => {},
      updateCurrentEncounterName: () => {},
      saveEncounter: () => {},
      loadEncounter: () => {},
      deleteEncounter: () => {},
      createCountdown: () => {},
      updateCountdown: () => {},
      deleteCountdown: () => {},
      advanceCountdown: () => {},
      incrementCountdown: () => {},
      decrementCountdown: () => {},
      createAdversary: () => {},
      updateAdversary: () => {},
      deleteAdversary: () => {},
      createEnvironment: () => {},
      updateEnvironment: () => {},
      deleteEnvironment: () => {},
      addCustomAdversary: () => {},
      updateCustomAdversary: () => {},
      deleteCustomAdversary: () => {},
      
      // Computed values
      hasCountdowns: false,
      hasAdversaries: false,
      hasEnvironments: false,
      
      // Helper functions
      getCountdownById: () => null,
      getAdversaryById: () => null,
      getEnvironmentById: () => null,
    }
  }
  
  const { gameState, customContent, ...actions } = context
  
  // Ensure gameState exists and has the expected structure
  if (!gameState) {
    console.warn('useGameState: gameState not available, returning defaults')
    return {
      // Loading state
      isLoaded: context.isLoaded || false,
      
      // State
      fear: { value: 0, visible: false },
      countdowns: [],
      adversaries: [],
      environments: [],
      partySize: 4,
      savedEncounters: [],
      customContent: { adversaries: [], environments: [] },
      
      // Actions (no-op functions)
      updateFear: () => {},
      updatePartySize: () => {},
      updateCurrentEncounterName: () => {},
      saveEncounter: () => {},
      loadEncounter: () => {},
      deleteEncounter: () => {},
      createCountdown: () => {},
      updateCountdown: () => {},
      deleteCountdown: () => {},
      advanceCountdown: () => {},
      incrementCountdown: () => {},
      decrementCountdown: () => {},
      createAdversary: () => {},
      updateAdversary: () => {},
      deleteAdversary: () => {},
      createEnvironment: () => {},
      updateEnvironment: () => {},
      deleteEnvironment: () => {},
      addCustomAdversary: () => {},
      updateCustomAdversary: () => {},
      deleteCustomAdversary: () => {},
      
      // Computed values
      hasCountdowns: false,
      hasAdversaries: false,
      hasEnvironments: false,
      
      // Helper functions
      getCountdownById: () => null,
      getAdversaryById: () => null,
      getEnvironmentById: () => null,
    }
  }
  
  const { fear, countdowns, adversaries, environments, partySize, savedEncounters } = gameState
  
  return {
    // Include the full gameState for components that need it
    gameState,
    
    // Loading state
    isLoaded: context.isLoaded,
    
    // State
    fear,
    countdowns,
    adversaries,
    environments,
    partySize,
    savedEncounters,
    customContent,
    
    // Actions
    ...actions,
    
    // Computed values
    hasCountdowns: countdowns.length > 0,
    hasAdversaries: adversaries.length > 0,
    hasEnvironments: environments.length > 0,
    
    // Helper functions
    getCountdownById: (id) => countdowns.find(c => c.id === id),
    getAdversaryById: (id) => adversaries.find(a => a.id === id),
    getEnvironmentById: (id) => environments.find(e => e.id === id),
  }
}

// Generic persistent state hook for other use cases
export const usePersistentState = (key, defaultValue) => {
  const [state, setState] = useState(() => {
    const stored = readFromStorage(key)
    return stored == null ? defaultValue : stored
  })

  // When key changes, reload from storage (or default)
  useEffect(() => {
    const stored = readFromStorage(key)
    setState(stored == null ? defaultValue : stored)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  useEffect(() => {
    writeToStorage(key, state)
  }, [key, state])

  return [state, setState]
}
