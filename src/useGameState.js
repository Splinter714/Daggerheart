import { useGameState as useGameStateContext } from './GameStateContext';

export const useGameState = () => {
  const context = useGameStateContext();
  
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
