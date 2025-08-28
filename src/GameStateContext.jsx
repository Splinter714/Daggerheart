import React, { createContext, useContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const GameStateContext = createContext();

export const useGameState = () => {
  const context = useContext(GameStateContext);
  if (!context) {
    throw new Error('useGameState must be used within a GameStateProvider');
  }
  return context;
};

export const GameStateProvider = ({ children }) => {

  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [gameState, setGameState] = useState({
    fear: { value: 0, visible: false },
    countdowns: [],
    adversaries: [],
    environments: []
  });

  useEffect(() => {
    // Initialize Socket.IO connection
    // Use the current hostname so it works on both localhost and network IP
    const serverUrl = window.location.hostname === 'localhost' 
      ? 'http://localhost:3000' 
      : `http://${window.location.hostname}:3000`;
    
    const newSocket = io(serverUrl);
    setSocket(newSocket);

    // Listen for connection events
    newSocket.on('connect', () => {
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    // Listen for state updates
    newSocket.on('stateUpdate', (newState) => {
      console.log('Received state update from server:', newState);
      setGameState(newState);
    });

    // Cleanup on unmount
    return () => {
      newSocket.close();
    };
  }, []);

  // Fear management
  const updateFear = (value) => {
    if (socket) {
      socket.emit('updateFear', { value });
    }
  };

  const toggleFearVisibility = () => {
    if (socket) {
      socket.emit('toggleFearVisibility');
    }
  };

  // Countdown management
  const createCountdown = (countdownData) => {
    if (socket) {
      socket.emit('createCountdown', countdownData);
    }
  };

  const updateCountdown = (id, updates) => {
    if (socket) {
      socket.emit('updateCountdown', { id, ...updates });
    }
  };

  const deleteCountdown = (id) => {
    if (socket) {
      socket.emit('deleteCountdown', { id });
    }
  };

  const advanceCountdown = (id, newValue) => {
    if (socket) {
      socket.emit('advanceCountdown', { id, value: newValue });
    }
  };

  const incrementCountdown = (id) => {
    console.log('GameStateContext incrementCountdown called with id:', id)
    if (socket) {
      console.log('Emitting incrementCountdown socket event')
      socket.emit('incrementCountdown', { id });
    } else {
      console.log('Socket not available')
    }
  };

  const decrementCountdown = (id) => {
    console.log('GameStateContext decrementCountdown called with id:', id)
    if (socket) {
      console.log('Emitting decrementCountdown socket event')
      socket.emit('decrementCountdown', { id });
    } else {
      console.log('Socket not available')
    }
  };

  const reorderCountdowns = (newOrder) => {
    // Optimistic update - update local state immediately
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
    
    // Send to server
    if (socket) {
      socket.emit('reorderCountdowns', { order: newOrder });
    }
  };

  // Adversary management
  const createAdversary = (adversaryData) => {
    if (socket) {
      socket.emit('createAdversary', adversaryData);
    }
  };

  const updateAdversary = (id, updates) => {
    if (socket) {
      socket.emit('updateAdversary', { id, ...updates });
    }
  };

  const deleteAdversary = (id) => {
    if (socket) {
      socket.emit('deleteAdversary', { id });
    }
  };

  const reorderAdversaries = (newOrder) => {
    // Optimistic update - update local state immediately
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
    
    // Send to server
    if (socket) {
      socket.emit('reorderAdversaries', { order: newOrder });
    }
  };

  // Environment management
  const createEnvironment = (environmentData) => {
    if (socket) {
      socket.emit('createEnvironment', environmentData);
    }
  };

  const updateEnvironment = (id, updates) => {
    if (socket) {
      socket.emit('updateEnvironment', { id, ...updates });
    }
  };

  const deleteEnvironment = (id) => {
    if (socket) {
      socket.emit('deleteEnvironment', { id });
    }
  };

  const reorderEnvironments = (newOrder) => {
    // Optimistic update - update local state immediately
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
    
    // Send to server
    if (socket) {
      socket.emit('reorderEnvironments', { order: newOrder });
    }
  };

  const value = {
    socket,
    isConnected,
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
