import { ref, set, onValue, off, push, remove } from 'firebase/database';
import { database } from './config';

// Generate a random session ID
export const generateSessionId = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

// Create a new game session
export const createSession = async (gameState) => {
  const sessionId = generateSessionId();
  const sessionRef = ref(database, `sessions/${sessionId}`);
  
  await set(sessionRef, {
    gameState,
    createdAt: Date.now(),
    lastUpdated: Date.now()
  });
  
  return sessionId;
};

// Join an existing session with connection monitoring
export const joinSession = (sessionId, onStateChange) => {
  const sessionRef = ref(database, `sessions/${sessionId}`);
  
  console.log('Joining session:', sessionId);
  console.log('Firebase database URL:', database.app.options.databaseURL);
  console.log('Session reference path:', sessionRef.path);
  
  let lastUpdateTime = Date.now();
  let connectionCheckInterval;
  
  // Listen for changes to the session
  const unsubscribe = onValue(sessionRef, (snapshot) => {
    console.log('Firebase update received for session:', sessionId);
    console.log('Snapshot exists:', snapshot.exists());
    console.log('Snapshot data:', snapshot.val());
    lastUpdateTime = Date.now();
    
    const data = snapshot.val();
    if (data && data.gameState) {
      console.log('Updating player state with:', data.gameState);
      onStateChange(data.gameState);
    } else {
      console.log('No gameState in Firebase data:', data);
    }
  }, (error) => {
    console.error('Firebase listener error:', error);
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      details: error.details
    });
  });
  
  // Monitor connection health
  const startConnectionMonitoring = () => {
    connectionCheckInterval = setInterval(() => {
      const timeSinceLastUpdate = Date.now() - lastUpdateTime;
      console.log('Connection check - time since last update:', timeSinceLastUpdate + 'ms');
      
      // If no updates for 30 seconds, try to reconnect
      if (timeSinceLastUpdate > 30000) {
        console.warn('No updates received for 30 seconds, connection may be stale');
        // Could implement reconnection logic here
      }
    }, 10000); // Check every 10 seconds
  };
  
  startConnectionMonitoring();
  
  return () => {
    console.log('Cleaning up Firebase listener for session:', sessionId);
    if (connectionCheckInterval) {
      clearInterval(connectionCheckInterval);
    }
    off(sessionRef);
  };
};

// Update session state (GM only)
export const updateSession = async (sessionId, gameState) => {
  const sessionRef = ref(database, `sessions/${sessionId}`);
  
  console.log('GM updating session:', sessionId, 'with state:', gameState);
  console.log('Firebase database URL:', database.app.options.databaseURL);
  console.log('Session reference path:', sessionRef.path);
  
  try {
    await set(sessionRef, {
      gameState,
      lastUpdated: Date.now()
    });
    console.log('GM update successful for session:', sessionId);
    console.log('Updated data:', { gameState, lastUpdated: Date.now() });
  } catch (error) {
    console.error('GM update failed for session:', sessionId, error);
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      details: error.details
    });
    throw error;
  }
};

// Delete a session
export const deleteSession = async (sessionId) => {
  const sessionRef = ref(database, `sessions/${sessionId}`);
  await remove(sessionRef);
};

// Check if a session exists
export const checkSessionExists = async (sessionId) => {
  const sessionRef = ref(database, `sessions/${sessionId}`);
  
  console.log('Checking if session exists:', sessionId);
  console.log('Session reference path:', sessionRef.path);
  
  return new Promise((resolve, reject) => {
    onValue(sessionRef, (snapshot) => {
      console.log('Session check result:', snapshot.exists());
      console.log('Session data:', snapshot.val());
      resolve(snapshot.exists());
    }, { onlyOnce: true }, (error) => {
      console.error('Error checking session existence:', error);
      reject(error);
    });
  });
};
