import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { buildCountdownActions } from './actions/countdowns'
import { buildAdversaryActions } from './actions/adversaries'
import { buildEnvironmentActions } from './actions/environments'

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
    reorderAdversaries
  } = adversaryActions

  const {
    createEnvironment,
    updateEnvironment,
    deleteEnvironment,
    reorderEnvironments
  } = environmentActions

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