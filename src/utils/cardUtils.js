// Utility functions for card components

// Helper function to roll dice
export function rollDice(numDice, dieSize) {
  let total = 0
  for (let i = 0; i < numDice; i++) {
    total += Math.floor(Math.random() * dieSize) + 1
  }
  return total
}

// Helper function to format trigger conditions for display
export function formatTriggerCondition(triggerCondition) {
  if (!triggerCondition) return ''
  
  // Convert camelCase to readable format
  return triggerCondition
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim()
}

// Helper function to parse countdown details from context
export function parseCountdownDetails(details, featureName) {
  if (!details) return null
  
  // Look for countdown patterns in the details
  const countdownPatterns = [
    /countdown\s+(\d+)/i,
    /(\d+)\s+countdown/i,
    /advance\s+(\d+)/i,
    /(\d+)\s+advance/i
  ]
  
  for (const pattern of countdownPatterns) {
    const match = details.match(pattern)
    if (match) {
      return {
        type: 'countdown',
        value: parseInt(match[1]),
        source: featureName,
        description: details
      }
    }
  }
  
  return null
}

// Helper function to check if a mechanic should be interactive based on context
export function checkIfInteractive(match, description, type) {
  if (!match || !description) return false
  
  // Check if the description contains interactive keywords
  const interactiveKeywords = [
    'roll', 'dice', 'd20', 'd12', 'd10', 'd8', 'd6', 'd4',
    'damage', 'heal', 'stress', 'countdown', 'advance'
  ]
  
  const lowerDescription = description.toLowerCase()
  return interactiveKeywords.some(keyword => lowerDescription.includes(keyword))
}

// Helper function to render descriptions with highlighted words
export function renderInteractiveDescription(description) {
  if (!description) return ''
  
  // Define patterns for interactive elements
  const patterns = [
    { pattern: /\b(\d+d\d+)\b/g, className: 'dice-roll' },
    { pattern: /\b(countdown|advance)\b/gi, className: 'countdown-keyword' },
    { pattern: /\b(damage|heal|stress)\b/gi, className: 'mechanic-keyword' }
  ]
  
  let result = description
  
  patterns.forEach(({ pattern, className }) => {
    result = result.replace(pattern, `<span class="${className}">$1</span>`)
  })
  
  return result
}

// Helper function to get default data for different card types
export function getDefaultData(type) {
  if (type === 'countdown') {
    return { name: '', description: '', max: 5, value: 0 }
  } else if (type === 'adversary') {
    return { 
      name: '', 
      description: '', 
      type: '', 
      tier: 1, 
      difficulty: 1, 
      hpMax: 1, 
      stressMax: 0, 
      abilities: [], 
      traits: [] 
    }
  } else {
    return { 
      name: '', 
      description: '', 
      type: '', 
      tier: 1, 
      difficulty: 1, 
      effects: [], 
      hazards: [] 
    }
  }
}

// Helper function to ensure all required arrays are initialized
export function getInitialData(item, type) {
  const defaultData = getDefaultData(type)
  if (item) {
    // When editing, ensure all required arrays exist
    return {
      ...defaultData,
      ...item,
      abilities: item.abilities || [],
      traits: item.traits || [],
      effects: item.effects || [],
      hazards: item.hazards || []
    }
  }
  return defaultData
}