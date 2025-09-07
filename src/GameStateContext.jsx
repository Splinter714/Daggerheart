import React, { createContext, useContext, useState, useEffect } from 'react';

const GameStateContext = createContext();

export const useGameState = () => {
  const context = useContext(GameStateContext);
  if (!context) {
    throw new Error('useGameState must be used within a GameStateProvider');
  }
  return context;
};

export const GameStateProvider = ({ children }) => {
  const [gameState, setGameState] = useState({
    fear: { value: 0, visible: false },
    countdowns: [],
    adversaries: [],
    environments: []
  });

  // Load state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem('daggerheart-game-state');
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        setGameState(parsedState);
      } catch (error) {
        console.error('Failed to load saved state:', error);
      }
    }
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('daggerheart-game-state', JSON.stringify(gameState));
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

  // Countdown management
  const createCountdown = (countdownData) => {
    const newCountdown = {
      id: Date.now().toString(),
      name: countdownData.name || 'Countdown',
      max: parseInt(countdownData.max) || 1,
      value: 0,
      description: countdownData.description || '',
      visible: true,
      type: countdownData.type || 'standard',
      loop: countdownData.loop || 'none'
    };
    
    setGameState(prev => ({
      ...prev,
      countdowns: [...prev.countdowns, newCountdown]
    }));
  };

  const updateCountdown = (id, updates) => {
    setGameState(prev => ({
      ...prev,
      countdowns: prev.countdowns.map(countdown =>
        countdown.id === id ? { ...countdown, ...updates } : countdown
      )
    }));
  };

  const deleteCountdown = (id) => {
    setGameState(prev => ({
      ...prev,
      countdowns: prev.countdowns.filter(countdown => countdown.id !== id)
    }));
  };

  const advanceCountdown = (id, newValue) => {
    setGameState(prev => ({
      ...prev,
      countdowns: prev.countdowns.map(countdown => {
        if (countdown.id === id) {
          let finalValue = newValue;
          
          // Handle different loop types
          if (countdown.loop === 'loop') {
            if (finalValue > countdown.max) {
              finalValue = 1;
            } else if (finalValue < 0) {
              finalValue = countdown.max;
            }
          } else if (countdown.loop === 'increasing') {
            if (finalValue > countdown.max) {
              return { ...countdown, max: countdown.max + 1, value: 1 };
            } else if (finalValue < 0) {
              return { ...countdown, max: Math.max(1, countdown.max - 1), value: 1 };
            }
            finalValue = Math.max(0, finalValue);
          } else if (countdown.loop === 'decreasing') {
            if (finalValue > countdown.max) {
              return { ...countdown, max: Math.max(1, countdown.max - 1), value: 1 };
            } else if (finalValue < 0) {
              return { ...countdown, max: countdown.max + 1, value: 1 };
            }
            finalValue = Math.min(countdown.max, finalValue);
          } else {
            finalValue = Math.max(0, Math.min(finalValue, countdown.max));
          }
          
          return { ...countdown, value: finalValue };
        }
        return countdown;
      })
    }));
  };

  const incrementCountdown = (id) => {
    setGameState(prev => ({
      ...prev,
      countdowns: prev.countdowns.map(countdown => {
        if (countdown.id === id) {
          let newValue = countdown.value + 1;
          
          if (countdown.loop === 'loop') {
            if (newValue > countdown.max) {
              newValue = 1;
            }
          } else if (countdown.loop === 'increasing') {
            if (newValue > countdown.max) {
              return { ...countdown, max: countdown.max + 1, value: 1 };
            }
          } else if (countdown.loop === 'decreasing') {
            if (newValue > countdown.max) {
              return { ...countdown, max: Math.max(1, countdown.max - 1), value: 1 };
            }
          } else {
            newValue = Math.min(newValue, countdown.max);
          }
          
          return { ...countdown, value: newValue };
        }
        return countdown;
      })
    }));
  };

  const decrementCountdown = (id) => {
    setGameState(prev => ({
      ...prev,
      countdowns: prev.countdowns.map(countdown => {
        if (countdown.id === id) {
          let newValue = countdown.value - 1;
          
          if (countdown.loop === 'loop') {
            if (newValue < 0) {
              newValue = countdown.max;
            }
          } else if (countdown.loop === 'increasing') {
            if (newValue < 0) {
              return { ...countdown, max: Math.max(1, countdown.max - 1), value: countdown.max };
            }
            newValue = Math.max(0, newValue);
          } else if (countdown.loop === 'decreasing') {
            if (newValue < 0) {
              return { ...countdown, max: countdown.max + 1, value: 1 };
            }
          } else {
            newValue = Math.max(0, newValue);
          }
          
          return { ...countdown, value: newValue };
        }
        return countdown;
      })
    }));
  };

  const reorderCountdowns = (newOrder) => {
    setGameState(prev => {
      const [oldIndex, newIndex] = newOrder;
      const newCountdowns = [...prev.countdowns];
      const [movedItem] = newCountdowns.splice(oldIndex, 1);
      newCountdowns.splice(newIndex, 0, movedItem);
      
      return {
        ...prev,
        countdowns: newCountdowns
      };
    });
  };

  // Adversary management
  const createAdversary = (adversaryData) => {
    // Generate unique ID with timestamp and random component
    const uniqueId = `adv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    // Check for existing adversaries with the same name to add numbering
    const existingAdversaries = gameState.adversaries || []
    const sameNameAdversaries = existingAdversaries.filter(adv => {
      // Extract base name (without existing number suffix)
      const baseName = adv.name.replace(/\s+\(\d+\)$/, '')
      return baseName === adversaryData.name
    })
    
    let displayName = adversaryData.name || 'Unknown'
    
    if (sameNameAdversaries.length === 0) {
      // First adversary of this type - no suffix needed
      displayName = adversaryData.name
    } else if (sameNameAdversaries.length === 1) {
      // Second adversary - first one gets (1), new one gets (2)
      const firstAdversary = sameNameAdversaries[0]
      const firstAdversaryBaseName = firstAdversary.name.replace(/\s+\(\d+\)$/, '')
      
      // Update the first adversary to have (1) suffix
      const updatedAdversaries = gameState.adversaries.map(adv => 
        adv.id === firstAdversary.id 
          ? { ...adv, name: `${firstAdversaryBaseName} (1)` }
          : adv
      )
      
      // Update the game state with the renamed first adversary
      setGameState(prev => ({
        ...prev,
        adversaries: updatedAdversaries
      }))
      
      // New adversary gets (2)
      displayName = `${adversaryData.name} (2)`
    } else {
      // Find the next available number
      const usedNumbers = sameNameAdversaries.map(adv => {
        const match = adv.name.match(/\((\d+)\)$/)
        return match ? parseInt(match[1]) : null
      }).filter(num => num !== null)
      
      // Find the first unused number starting from 1
      let nextNumber = 1
      while (usedNumbers.includes(nextNumber)) {
        nextNumber++
      }
      
      displayName = `${adversaryData.name} (${nextNumber})`
    }
    
    const newAdversary = {
      // Start with all properties from adversaryData
      ...adversaryData,
      // Override with our specific values to ensure correct initialization
      id: uniqueId,
      name: displayName,
      hp: 0, // Force HP to be 0 (all icons empty)
      stress: 0, // Force stress to be 0
      isVisible: true
    };
    
    setGameState(prev => ({
      ...prev,
      adversaries: [...prev.adversaries, newAdversary]
    }));
  };

  const updateAdversary = (id, updates) => {
    setGameState(prev => ({
      ...prev,
      adversaries: prev.adversaries.map(adversary =>
        adversary.id === id ? { ...adversary, ...updates } : adversary
      )
    }));
  };

  const deleteAdversary = (id) => {
    setGameState(prev => ({
      ...prev,
      adversaries: prev.adversaries.filter(adversary => adversary.id !== id)
    }));
  };

  const reorderAdversaries = (newOrder) => {
    setGameState(prev => {
      const [oldIndex, newIndex] = newOrder;
      const newAdversaries = [...prev.adversaries];
      const [movedItem] = newAdversaries.splice(oldIndex, 1);
      newAdversaries.splice(newIndex, 0, movedItem);
      
      return {
        ...prev,
        adversaries: newAdversaries
      };
    });
  };

  // Environment management
  const createEnvironment = (environmentData) => {
    const newEnvironment = {
      id: `env-${Date.now()}`,
      name: environmentData.name || 'Unknown',
      type: environmentData.type || 'Unknown',
      tier: environmentData.tier || 1,
      difficulty: environmentData.difficulty || 'Medium',
      description: environmentData.description || '',
      impulses: environmentData.impulses || [],
      features: environmentData.features || [],
      isVisible: true,
      ...environmentData
    };
    
    setGameState(prev => ({
      ...prev,
      environments: [...prev.environments, newEnvironment]
    }));
  };

  const updateEnvironment = (id, updates) => {
    setGameState(prev => ({
      ...prev,
      environments: prev.environments.map(environment =>
        environment.id === id ? { ...environment, ...updates } : environment
      )
    }));
  };

  const deleteEnvironment = (id) => {
    setGameState(prev => ({
      ...prev,
      environments: prev.environments.filter(environment => environment.id !== id)
    }));
  };

  const reorderEnvironments = (newOrder) => {
    setGameState(prev => {
      const [oldIndex, newIndex] = newOrder;
      const newEnvironments = [...prev.environments];
      const [movedItem] = newEnvironments.splice(oldIndex, 1);
      newEnvironments.splice(newIndex, 0, movedItem);
      
      return {
        ...prev,
        environments: newEnvironments
      };
    });
  };

  const value = {
    gameState,
    // Fear actions
    updateFear,
    toggleFearVisibility,
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