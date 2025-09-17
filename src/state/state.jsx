import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { buildCountdownActions, buildAdversaryActions, buildEnvironmentActions } from '../components/GameCard'

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
    environments: []
  });

  // Player view state - local to each tab, not synced
  const [playerView, setPlayerView] = useState(() => {
    // Check URL parameter for player view
    const urlParams = new URLSearchParams(window.location.search)
    return urlParams.get('playerView') === 'true'
  });

  // Load state from localStorage on mount
  useEffect(() => {
    const savedState = readFromStorage('daggerheart-game-state');
    if (savedState) {
      try {
        // Only set state if it's not empty
        if (savedState.adversaries?.length > 0 || savedState.environments?.length > 0 || savedState.countdowns?.length > 0) {
          setGameState(savedState);
        }
      } catch (error) {
        console.error('Failed to load saved state:', error);
      }
    }
  }, []);

  // Cross-tab synchronization using storage events
  useEffect(() => {
    const handleStorageChange = (e) => {
      // Only respond to changes from other tabs (not our own changes)
      if (e.key === 'daggerheart-game-state' && e.newValue && e.storageArea === localStorage) {
        try {
          const newState = JSON.parse(e.newValue);
          // Only update if the new state is different from current state
          setGameState(prevState => {
            if (JSON.stringify(prevState) !== JSON.stringify(newState)) {
              console.log('Syncing state from other tab:', newState);
              return newState;
            }
            return prevState;
          });
        } catch (error) {
          console.error('Failed to sync state from other tab:', error);
        }
      }
    };

    // Listen for storage changes from other tabs
    window.addEventListener('storage', handleStorageChange);
    
    // Cleanup listener on unmount
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
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

  const togglePlayerView = () => {
    setPlayerView(prev => !prev);
  };

  // Build action groups from modular files
  const gameStateRef = useRef(gameState)
  useEffect(() => { gameStateRef.current = gameState }, [gameState])
  const getGameState = () => gameStateRef.current

  const countdownActions = buildCountdownActions(setGameState)
  const adversaryActions = buildAdversaryActions(getGameState, setGameState)
  const environmentActions = buildEnvironmentActions(getGameState, setGameState)

  const {
    createCountdown,
    updateCountdown,
    deleteCountdown,
    advanceCountdown,
    incrementCountdown,
    decrementCountdown,
    reorderCountdowns
  } = countdownActions

  const {
    createAdversary,
    updateAdversary,
    deleteAdversary,
    reorderAdversaries,
    bulkReorderAdversaries
  } = adversaryActions

  const {
    createEnvironment,
    updateEnvironment,
    deleteEnvironment,
    reorderEnvironments
  } = environmentActions

  const value = {
    gameState,
    playerView,
    // Fear actions
    updateFear,
    toggleFearVisibility,
    // Player view toggle
    togglePlayerView,
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
    updateAdversary,
    deleteAdversary,
    reorderAdversaries,
    bulkReorderAdversaries,
    // Environment actions
    createEnvironment,
    updateEnvironment,
    deleteEnvironment,
    reorderEnvironments,
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
      
      // Actions (no-op functions)
      updateFear: () => {},
      toggleFearVisibility: () => {},
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
  const { gameState, ...actions } = context;
  
  // Ensure gameState exists and has the expected structure
  if (!gameState) {
    console.warn('useGameState: gameState not available, returning defaults');
    return {
      // State
      fear: { value: 0, visible: false },
      countdowns: [],
      adversaries: [],
      environments: [],
      
      // Actions (no-op functions)
      updateFear: () => {},
      toggleFearVisibility: () => {},
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
  
  const { fear, countdowns, adversaries, environments } = gameState;
  
  return {
    // Include the full gameState for components that need it
    gameState,
    
    // State
    fear,
    countdowns,
    adversaries,
    environments,
    
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
