const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Game state
let gameState = {
  fear: { value: 0, visible: false },
  countdowns: [],
  adversaries: [],
  environments: []
};

// Load state from file
function loadState() {
  try {
    if (fs.existsSync('state.json')) {
      const data = fs.readFileSync('state.json', 'utf8');
      gameState = JSON.parse(data);
      console.log('Game state loaded from state.json');
    }
  } catch (error) {
    console.error('Failed to load state:', error);
  }
}

// Save state to file
function saveState() {
  try {
    fs.writeFileSync('state.json', JSON.stringify(gameState, null, 2));
  } catch (error) {
    console.error('Failed to save state:', error);
  }
}

// Broadcast state to all clients
function broadcastState() {
  io.emit('stateUpdate', gameState);
}

// Load state on startup
loadState();

// Auto-save every 3 seconds
setInterval(saveState, 3000);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  // Send current state to new client
  socket.emit('stateUpdate', gameState);
  
  // Fear management
  socket.on('updateFear', (data) => {
    if (typeof data.value === 'number' && data.value >= 0 && data.value <= 12) {
      gameState.fear.value = data.value;
      broadcastState();
    }
  });

  socket.on('toggleFearVisibility', () => {
    gameState.fear.visible = !gameState.fear.visible;
    broadcastState();
  });

  // Countdown management
  socket.on('createCountdown', (data) => {
    console.log('Server received createCountdown:', data);
    const maxValue = parseInt(data.max);
    console.log('Parsed maxValue:', maxValue);
    if (maxValue >= 1 && maxValue <= 20) {
      const newCountdown = {
        id: Date.now().toString(),
        name: data.name || 'Countdown',
        max: maxValue,
        value: 0, // Start at 0 (empty)
        description: data.description || '',
        visible: true, // Make it visible by default
        type: data.type || 'standard',
        loop: data.loop || 'none'
      };
      console.log('Created new countdown:', newCountdown);
      gameState.countdowns.push(newCountdown);
      console.log('Current countdowns:', gameState.countdowns);
      broadcastState();
    } else {
      console.log('Invalid maxValue:', maxValue, 'must be between 1 and 20');
    }
  });

  socket.on('updateCountdown', (data) => {
    const { id, ...updates } = data;
    const countdown = gameState.countdowns.find(c => c.id === id);
    if (countdown) {
      Object.assign(countdown, updates);
      broadcastState();
    }
  });

  socket.on('deleteCountdown', (data) => {
    const index = gameState.countdowns.findIndex(c => c.id === data.id);
    if (index !== -1) {
      gameState.countdowns.splice(index, 1);
      broadcastState();
    }
  });

  socket.on('advanceCountdown', (data) => {
    console.log('Server received advanceCountdown:', data);
    const countdown = gameState.countdowns.find(c => c.id === data.id);
    if (countdown && typeof data.value === 'number') {
      console.log('Updating countdown:', countdown.id, 'from', countdown.value, 'to', data.value);
      
      // Handle different loop types
      let newValue = data.value;
      
      if (countdown.loop === 'loop') {
        // Loop: reset to 1 when reaching max, or wrap around
        if (newValue > countdown.max) {
          newValue = 1;
        } else if (newValue < 0) {
          newValue = countdown.max;
        }
      } else if (countdown.loop === 'increasing') {
        // Increasing: when exceeding max, increment max by 1 and reset to 1
        if (newValue > countdown.max) {
          countdown.max += 1;
          newValue = 1; // Reset to 1 when max increases
          console.log('Increasing: max exceeded, incrementing max to:', countdown.max, 'and resetting value to 1');
        } else if (newValue < 0) {
          // Increasing: when going below 0, decrement max by 1 and reset to 1
          countdown.max = Math.max(1, countdown.max - 1);
          newValue = 1; // Reset to 1 when max decreases
          console.log('Increasing: min exceeded, decrementing max to:', countdown.max, 'and resetting value to 1');
        } else {
          console.log('Increasing: allowing value within current max');
        }
        newValue = Math.max(0, newValue);
              } else if (countdown.loop === 'decreasing') {
        // Decreasing: when exceeding max, decrement max by 1 and reset to 1
        if (newValue > countdown.max) {
          countdown.max = Math.max(1, countdown.max - 1);
          newValue = 1; // Reset to 1 when max decreases
          console.log('Decreasing: max exceeded, decrementing max to:', countdown.max, 'and resetting value to 1');
        } else if (newValue < 0) {
          // Decreasing: when going below 0, increment max by 1 and reset to 1
          countdown.max += 1;
          newValue = 1; // Reset to 1 when max increases
          console.log('Decreasing: min exceeded, incrementing max to:', countdown.max, 'and resetting value to 1');
        } else {
          console.log('Decreasing: allowing value within current range');
        }
        newValue = Math.min(countdown.max, newValue);
      } else {
        // No loop: clamp to valid range
        newValue = Math.max(0, Math.min(newValue, countdown.max));
      }
      
      countdown.value = newValue;
      console.log('Countdown updated with loop logic:', countdown);
      broadcastState();
    } else {
      console.log('Invalid advanceCountdown data:', { data, countdown: !!countdown, valueType: typeof data.value });
    }
  });

  socket.on('incrementCountdown', (data) => {
    console.log('Server received incrementCountdown:', data);
    const countdown = gameState.countdowns.find(c => c.id === data.id);
    if (countdown) {
      console.log('Found countdown:', countdown.name, 'current value:', countdown.value, 'max:', countdown.max, 'loop:', countdown.loop);
      let newValue = countdown.value + 1;
      
      // Handle different loop types
      if (countdown.loop === 'loop') {
        // Loop: reset to 1 when reaching max
        if (newValue > countdown.max) {
          newValue = 1;
          console.log('Loop: resetting to 1');
        }
      } else if (countdown.loop === 'increasing') {
        // Increasing: when exceeding max, increment max by 1 and reset to 1
        if (newValue > countdown.max) {
          countdown.max += 1;
          newValue = 1; // Reset to 1 when max increases
          console.log('Increasing: max exceeded, incrementing max to:', countdown.max, 'and resetting value to 1');
        } else {
          console.log('Increasing: allowing value within current max');
        }
        // Allow values down to 0
      } else if (countdown.loop === 'decreasing') {
        // Decreasing: when exceeding max, decrement max by 1 and reset to 1
        if (newValue > countdown.max) {
          countdown.max = Math.max(1, countdown.max - 1);
          newValue = 1; // Reset to 1 when max decreases
          console.log('Decreasing: max exceeded, decrementing max to:', countdown.max, 'and resetting value to 1');
        } else {
          console.log('Decreasing: allowing value within current max');
        }
      } else {
        // No loop: clamp to max
        newValue = Math.min(newValue, countdown.max);
        console.log('No loop: clamping to max');
      }
      
      countdown.value = newValue;
      console.log('Countdown incremented with loop logic:', countdown);
      broadcastState();
    } else {
      console.log('Countdown not found for id:', data.id);
    }
  });

  socket.on('decrementCountdown', (data) => {
    console.log('Server received decrementCountdown:', data);
    const countdown = gameState.countdowns.find(c => c.id === data.id);
    if (countdown) {
      console.log('Found countdown:', countdown.name, 'current value:', countdown.value, 'max:', countdown.max, 'loop:', countdown.loop);
      let newValue = countdown.value - 1;
      
      // Handle different loop types
      if (countdown.loop === 'loop') {
        // Loop: wrap around to max when going below 0
        if (newValue < 0) {
          newValue = countdown.max;
          console.log('Loop: wrapping to max');
        }
      } else if (countdown.loop === 'increasing') {
        // Increasing: when going below 0, decrement max by 1 and reset to max
        if (newValue < 0) {
          countdown.max = Math.max(1, countdown.max - 1);
          newValue = countdown.max; // Reset to new max when max decreases
          console.log('Increasing: min exceeded, decrementing max to:', countdown.max, 'and resetting value to max');
        } else {
          console.log('Increasing: allowing values down to 0');
        }
        newValue = Math.max(0, newValue);
      } else if (countdown.loop === 'decreasing') {
        // Decreasing: when exceeding max, decrement max by 1 and reset to 1
        if (newValue > countdown.max) {
          countdown.max = Math.max(1, countdown.max - 1);
          newValue = 1; // Reset to 1 when max decreases
          console.log('Decreasing: max exceeded, decrementing max to:', countdown.max, 'and resetting value to 1');
        } else if (newValue < 0) {
          // Decreasing: when going below 0, increment max by 1 and reset to 1
          countdown.max += 1;
          newValue = 1; // Reset to 1 when max increases
          console.log('Decreasing: min exceeded, incrementing max to:', countdown.max, 'and resetting value to 1');
        } else {
          console.log('Decreasing: allowing value within current range');
        }
        // No clamping needed - loop logic handles all cases
      } else {
        // No loop: clamp to 0
        newValue = Math.max(0, newValue);
        console.log('No loop: clamping to 0');
      }
      
      countdown.value = newValue;
      console.log('Countdown decremented with loop logic:', countdown);
      broadcastState();
    } else {
      console.log('Countdown not found for id:', data.id);
    }
  });

  socket.on('reorderCountdowns', (data) => {
    console.log('Server received reorderCountdowns:', data);
    const { order } = data;
    if (order && order.length === 2) {
      const [oldIndex, newIndex] = order;
      console.log('Reordering countdowns:', { oldIndex, newIndex, countdownsLength: gameState.countdowns.length });
      if (oldIndex >= 0 && oldIndex < gameState.countdowns.length &&
          newIndex >= 0 && newIndex < gameState.countdowns.length) {
        const [movedItem] = gameState.countdowns.splice(oldIndex, 1);
        gameState.countdowns.splice(newIndex, 0, movedItem);
        console.log('Countdowns reordered successfully:', gameState.countdowns.map(c => c.name));
        broadcastState();
      } else {
        console.log('Invalid indices for countdown reordering:', { oldIndex, newIndex, countdownsLength: gameState.countdowns.length });
      }
    } else {
      console.log('Invalid order data for countdown reordering:', order);
    }
  });

  // Adversary management
  socket.on('createAdversary', (data) => {
    const newAdversary = {
      id: `adv-${Date.now()}`,
      name: data.name || 'Unknown',
      type: data.type || 'Unknown',
      tier: data.tier || 1,
      difficulty: data.difficulty || 'Medium',
      hp: data.hpMax || 1,
      hpMax: data.hpMax || 1,
      stress: 0,
      stressMax: data.stressMax || 0,
      description: data.description || '',
      isVisible: true,
      ...data
    };
    gameState.adversaries.push(newAdversary);
    broadcastState();
  });

  socket.on('updateAdversary', (data) => {
    const { id, ...updates } = data;
    const adversary = gameState.adversaries.find(a => a.id === id);
    if (adversary) {
      Object.assign(adversary, updates);
      broadcastState();
    }
  });

  socket.on('deleteAdversary', (data) => {
    const index = gameState.adversaries.findIndex(a => a.id === data.id);
    if (index !== -1) {
      gameState.adversaries.splice(index, 1);
      broadcastState();
    }
  });

  socket.on('reorderAdversaries', (data) => {
    const { order } = data;
    if (order && order.length === 2) {
      const [oldIndex, newIndex] = order;
      if (oldIndex >= 0 && oldIndex < gameState.adversaries.length &&
          newIndex >= 0 && newIndex < gameState.adversaries.length) {
        const [movedItem] = gameState.adversaries.splice(oldIndex, 1);
        gameState.adversaries.splice(newIndex, 0, movedItem);
        broadcastState();
      }
    }
  });

  // Environment management
  socket.on('createEnvironment', (data) => {
    const newEnvironment = {
      id: `env-${Date.now()}`,
      name: data.name || 'Unknown',
      type: data.type || 'Unknown',
      tier: data.tier || 1,
      difficulty: data.difficulty || 'Medium',
      description: data.description || '',
      impulses: data.impulses || [],
      features: data.features || [],
      isVisible: true,
      ...data
    };
    gameState.environments.push(newEnvironment);
    broadcastState();
  });

  socket.on('updateEnvironment', (data) => {
    const { id, ...updates } = data;
    const environment = gameState.environments.find(e => e.id === id);
    if (environment) {
      Object.assign(environment, updates);
      broadcastState();
    }
  });

  socket.on('deleteEnvironment', (data) => {
    const index = gameState.environments.findIndex(e => e.id === data.id);
    if (index !== -1) {
      gameState.environments.splice(index, 1);
      broadcastState();
    }
  });

  socket.on('reorderEnvironments', (data) => {
    const { order } = data;
    if (order && order.length === 2) {
      const [oldIndex, newIndex] = order;
      if (oldIndex >= 0 && oldIndex < gameState.environments.length &&
          newIndex >= 0 && newIndex < gameState.environments.length) {
        const [movedItem] = gameState.environments.splice(oldIndex, 1);
        gameState.environments.splice(newIndex, 0, movedItem);
        broadcastState();
      }
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Start server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Server accessible at:`);
  console.log(`  Local: http://localhost:${PORT}`);
  console.log(`  Network: http://0.0.0.0:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
