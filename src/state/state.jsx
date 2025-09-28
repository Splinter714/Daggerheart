import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

// Simple ID generator
function generateId(prefix) {
  const base = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
  return prefix ? `${prefix}-${base}` : base
}

const GameStateContext = createContext();

// Generic localStorage utility functions
function readFromStorage(key) {
  if (typeof localStorage === 'undefined') return null
  try {
    const raw = localStorage.getItem(key)
    return raw == null ? null : JSON.parse(raw)
  } catch (e) {
    return null
  }
}

function writeToStorage(key, value) {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (e) {
    // ignore quota errors
  }
}

export const GameStateProvider = ({ children }) => {
  const [gameState, setGameState] = useState({
    fear: { value: 0, visible: false },
    countdowns: [],
    adversaries: [],
    environments: [],
    partySize: 4,
    savedEncounters: [],
    currentEncounterName: 'Encounter'
  });
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Custom content state
  const [customContent, setCustomContent] = useState({
    adversaries: [],
    environments: []
  });

  // Load state from localStorage on mount
  useEffect(() => {
    const savedState = readFromStorage('daggerheart-game-state');
    if (savedState) {
      try {
        // Only set state if it's not empty OR if there are saved encounters
        if (savedState.adversaries?.length > 0 || savedState.environments?.length > 0 || savedState.countdowns?.length > 0 || savedState.savedEncounters?.length > 0) {
          setGameState(savedState);
        }
      } catch (error) {
        console.error('Failed to load saved state:', error);
      }
    }
    
    // Load custom content from localStorage
    const customAdversaries = readFromStorage('daggerheart-custom-adversaries') || [];
    const customEnvironments = readFromStorage('daggerheart-custom-environments') || [];
    setCustomContent({
      adversaries: customAdversaries,
      environments: customEnvironments
    });
    
    setIsLoaded(true);
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    writeToStorage('daggerheart-game-state', gameState);
  }, [gameState]);

  // Fear management
  const updateFear = (value) => {
    setGameState(prev => ({
      ...prev,
      fear: { ...prev.fear, value }
    }));
  };

  const toggleFearVisibility = () => {
    setGameState(prev => ({
      ...prev,
      fear: { ...prev.fear, visible: !prev.fear.visible }
    }));
  };

  // Party size management
  const updatePartySize = (size) => {
    setGameState(prev => ({
      ...prev,
      partySize: Math.max(1, size)
    }));
  };

  // Current encounter name management
  const updateCurrentEncounterName = (name) => {
    setGameState(prev => ({
      ...prev,
      currentEncounterName: name || 'Encounter'
    }));
  };

  // Saved encounters management
  const saveEncounter = (encounterData) => {
    // If encounterData has an ID, update existing encounter
    if (encounterData.id) {
      setGameState(prev => ({
        ...prev,
        savedEncounters: (prev.savedEncounters || []).map(encounter => 
          encounter.id === encounterData.id 
            ? {
                ...encounter,
                name: encounterData.name || encounter.name,
                encounterItems: encounterData.encounterItems || encounter.encounterItems,
                partySize: encounterData.partySize || encounter.partySize,
                battlePointsAdjustments: encounterData.battlePointsAdjustments || encounter.battlePointsAdjustments,
                updatedAt: new Date().toISOString()
              }
            : encounter
        )
      }));
      return encounterData.id;
    } else {
      // Create new encounter
      const newEncounter = {
        id: generateId('encounter'),
        name: encounterData.name || 'Encounter',
        createdAt: new Date().toISOString(),
        encounterItems: encounterData.encounterItems || [],
        partySize: encounterData.partySize || 4,
        battlePointsAdjustments: encounterData.battlePointsAdjustments || {}
      };
      
      setGameState(prev => ({
        ...prev,
        savedEncounters: [...(prev.savedEncounters || []), newEncounter]
      }));
      
      return newEncounter.id;
    }
  };

  const loadEncounter = (encounterId) => {
    const encounter = (gameState.savedEncounters || []).find(e => e.id === encounterId);
    return encounter;
  };

  const saveEncounterAs = (encounterData) => {
    // Always create a new encounter, even if encounterData has an ID
    const newEncounter = {
      id: generateId('encounter'),
      name: encounterData.name || `Encounter ${Date.now()}`,
      createdAt: new Date().toISOString(),
      encounterItems: encounterData.encounterItems || [],
      partySize: encounterData.partySize || 4,
      battlePointsAdjustments: encounterData.battlePointsAdjustments || {}
    };
    
    setGameState(prev => ({
      ...prev,
      savedEncounters: [...(prev.savedEncounters || []), newEncounter]
    }));
    
    return newEncounter.id;
  };

  const deleteEncounter = (encounterId) => {
    setGameState(prev => ({
      ...prev,
      savedEncounters: (prev.savedEncounters || []).filter(e => e.id !== encounterId)
    }));
  };

  // Build action groups from modular files
  const gameStateRef = useRef(gameState)
  useEffect(() => { gameStateRef.current = gameState }, [gameState])
  const getGameState = () => gameStateRef.current

  // Simple action functions
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

  const createAdversary = (adversaryData) => {
    const uniqueId = generateId('adv')
    const existingAdversaries = gameState.adversaries || []
    const baseName = adversaryData.baseName || adversaryData.name?.replace(/\s+\(\d+\)$/, '') || adversaryData.name || 'Unknown'
    const sameNameAdversaries = existingAdversaries.filter(adv => adv.baseName === baseName)
    
    let duplicateNumber = 1
    if (sameNameAdversaries.length === 0) {
      duplicateNumber = 1
    } else {
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

  const createAdversariesBulk = (adversaryDataArray) => {
    const newAdversaries = []
    const baseNameCounts = {}
    
    adversaryDataArray.forEach(adversaryData => {
      const baseName = adversaryData.baseName || adversaryData.name?.replace(/\s+\(\d+\)$/, '') || adversaryData.name || 'Unknown'
      
      // Count existing adversaries with this base name
      const existingAdversaries = gameState.adversaries || []
      const sameNameAdversaries = existingAdversaries.filter(adv => adv.baseName === baseName)
      const existingCount = sameNameAdversaries.length
      
      // Count how many we've already created in this batch
      const batchCount = baseNameCounts[baseName] || 0
      
      const duplicateNumber = existingCount + batchCount + 1
      baseNameCounts[baseName] = batchCount + 1
      
      const newAdversary = {
        ...adversaryData,
        id: generateId('adv'),
        baseName: baseName,
        duplicateNumber: duplicateNumber,
        name: `${baseName} (${duplicateNumber})`,
        hp: 0,
        stress: 0,
        isVisible: true
      }
      
      newAdversaries.push(newAdversary)
    })
    
    setGameState(prev => ({ ...prev, adversaries: [...prev.adversaries, ...newAdversaries] }))
  }

  const updateAdversary = (id, updates) => {
    setGameState(prev => ({
      ...prev,
      adversaries: prev.adversaries.map(a => {
        if (a.id === id) {
          const updated = { ...a, ...updates }
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

  const clearAllAdversaries = () => {
    setGameState(prev => ({
      ...prev,
      adversaries: []
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

  const bulkReorderAdversaries = (newOrder) => {
    setGameState(prev => ({
      ...prev,
      adversaries: newOrder
    }))
  }

  const createEnvironment = (environmentData) => {
    const uniqueId = generateId('env')
    const existing = gameState.environments || []
    const same = existing.filter(env => env.name.replace(/\s+\(\d+\)$/, '') === environmentData.name)
    let displayName = environmentData.name || 'Unknown'
    if (same.length === 0) {
      displayName = environmentData.name
    } else if (same.length === 1) {
      const first = same[0]
      const firstBase = first.name.replace(/\s+\(\d+\)$/, '')
      const updated = gameState.environments.map(env => env.id === first.id ? { ...env, name: `${firstBase} (1)` } : env)
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

  // Custom content management
  const addCustomAdversary = (adversaryData) => {
    const newAdversary = {
      ...adversaryData,
      id: generateId('custom-adv'),
      source: adversaryData.source || 'Homebrew',
      isCustom: true
    }
    
    setCustomContent(prev => ({
      ...prev,
      adversaries: [...prev.adversaries, newAdversary]
    }))
    
    // Also save to localStorage
    writeToStorage('daggerheart-custom-adversaries', [...customContent.adversaries, newAdversary])
    
    return newAdversary.id
  }

  const addCustomEnvironment = (environmentData) => {
    const newEnvironment = {
      ...environmentData,
      id: generateId('custom-env'),
      source: environmentData.source || 'Homebrew',
      isCustom: true
    }
    
    setCustomContent(prev => ({
      ...prev,
      environments: [...prev.environments, newEnvironment]
    }))
    
    // Also save to localStorage
    writeToStorage('daggerheart-custom-environments', [...customContent.environments, newEnvironment])
    
    return newEnvironment.id
  }

  const updateCustomAdversary = (id, updates) => {
    setCustomContent(prev => ({
      ...prev,
      adversaries: prev.adversaries.map(adv => 
        adv.id === id ? { ...adv, ...updates } : adv
      )
    }))
    
    // Also update localStorage
    const updatedAdversaries = customContent.adversaries.map(adv => 
      adv.id === id ? { ...adv, ...updates } : adv
    )
    writeToStorage('daggerheart-custom-adversaries', updatedAdversaries)
  }

  const updateCustomEnvironment = (id, updates) => {
    setCustomContent(prev => ({
      ...prev,
      environments: prev.environments.map(env => 
        env.id === id ? { ...env, ...updates } : env
      )
    }))
    
    // Also update localStorage
    const updatedEnvironments = customContent.environments.map(env => 
      env.id === id ? { ...env, ...updates } : env
    )
    writeToStorage('daggerheart-custom-environments', updatedEnvironments)
  }

  const deleteCustomAdversary = (id) => {
    setCustomContent(prev => ({
      ...prev,
      adversaries: prev.adversaries.filter(adv => adv.id !== id)
    }))
    
    // Also update localStorage
    const updatedAdversaries = customContent.adversaries.filter(adv => adv.id !== id)
    writeToStorage('daggerheart-custom-adversaries', updatedAdversaries)
  }

  const deleteCustomEnvironment = (id) => {
    setCustomContent(prev => ({
      ...prev,
      environments: prev.environments.filter(env => env.id !== id)
    }))
    
    // Also update localStorage
    const updatedEnvironments = customContent.environments.filter(env => env.id !== id)
    writeToStorage('daggerheart-custom-environments', updatedEnvironments)
  }

  const value = {
    gameState,
    isLoaded,
    customContent,
    // Fear actions
    updateFear,
    toggleFearVisibility,
    // Party size actions
    updatePartySize,
    // Current encounter name actions
    updateCurrentEncounterName,
    // Saved encounters actions
    saveEncounter,
    saveEncounterAs,
    loadEncounter,
    deleteEncounter,
    // Countdown actions
    createCountdown,
    updateCountdown,
    deleteCountdown,
    advanceCountdown,
    incrementCountdown,
    decrementCountdown,
    reorderCountdowns,
    // Adversary actions
    createAdversary,
    createAdversariesBulk,
    updateAdversary,
    deleteAdversary,
    clearAllAdversaries,
    reorderAdversaries,
    bulkReorderAdversaries,
    // Environment actions
    createEnvironment,
    updateEnvironment,
    deleteEnvironment,
    reorderEnvironments,
    // Custom content actions
    addCustomAdversary,
    addCustomEnvironment,
    updateCustomAdversary,
    updateCustomEnvironment,
    deleteCustomAdversary,
    deleteCustomEnvironment,
  };

  return (
    <GameStateContext.Provider value={value}>
      {children}
    </GameStateContext.Provider>
  );
};

export const useGameState = () => {
  const context = useContext(GameStateContext);
  
  // If context is not available yet, return default values
  if (!context) {
    console.warn('useGameState: Context not available yet, returning defaults');
    return {
      // State
      fear: { value: 0, visible: false },
      countdowns: [],
      adversaries: [],
      environments: [],
      partySize: 4,
      savedEncounters: [],
      
      // Actions (no-op functions)
      updateFear: () => {},
      toggleFearVisibility: () => {},
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
      reorderCountdowns: () => {},
      createAdversary: () => {},
      updateAdversary: () => {},
      deleteAdversary: () => {},
      clearAllAdversaries: () => {},
      reorderAdversaries: () => {},
      createEnvironment: () => {},
      updateEnvironment: () => {},
      deleteEnvironment: () => {},
      reorderEnvironments: () => {},
      
      // Computed values
      hasCountdowns: false,
      hasAdversaries: false,
      hasEnvironments: false,
      
      // Helper functions
      getCountdownById: () => null,
      getAdversaryById: () => null,
      getEnvironmentById: () => null,
    };
  }
  
  // Destructure commonly used values for convenience
  const { gameState, customContent, ...actions } = context;
  
  // Ensure gameState exists and has the expected structure
  if (!gameState) {
    console.warn('useGameState: gameState not available, returning defaults');
    return {
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
      toggleFearVisibility: () => {},
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
      reorderCountdowns: () => {},
      createAdversary: () => {},
      updateAdversary: () => {},
      deleteAdversary: () => {},
      clearAllAdversaries: () => {},
      reorderAdversaries: () => {},
      createEnvironment: () => {},
      updateEnvironment: () => {},
      deleteEnvironment: () => {},
      reorderEnvironments: () => {},
      addCustomAdversary: () => {},
      addCustomEnvironment: () => {},
      updateCustomAdversary: () => {},
      updateCustomEnvironment: () => {},
      deleteCustomAdversary: () => {},
      deleteCustomEnvironment: () => {},
      
      // Computed values
      hasCountdowns: false,
      hasAdversaries: false,
      hasEnvironments: false,
      
      // Helper functions
      getCountdownById: () => null,
      getAdversaryById: () => null,
      getEnvironmentById: () => null,
    };
  }
  
  const { fear, countdowns, adversaries, environments, partySize, savedEncounters } = gameState;
  
  return {
    // Include the full gameState for components that need it
    gameState,
    
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
  };
};

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
