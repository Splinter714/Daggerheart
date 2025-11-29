// Shared data loading utilities for adversaries and environments
// Loads official, playtest, and custom content and merges them

export let adversariesData = { adversaries: [] }
export let environmentsData = { environments: [] }
let _dataLoaded = false

// Load custom content from localStorage
export function loadCustomContent() {
  const customAdversaries = JSON.parse(localStorage.getItem('daggerheart-custom-adversaries') || '[]')
  const customEnvironments = JSON.parse(localStorage.getItem('daggerheart-custom-environments') || '[]')
  return { customAdversaries, customEnvironments }
}

// Save custom content to localStorage
export function saveCustomContent(type, content) {
  if (type === 'adversary') {
    localStorage.setItem('daggerheart-custom-adversaries', JSON.stringify(content))
  } else if (type === 'environment') {
    localStorage.setItem('daggerheart-custom-environments', JSON.stringify(content))
  }
}

// Load all data asynchronously (official + playtest + custom)
export async function loadData() {
  // Prevent multiple simultaneous loads
  if (_dataLoaded) {
    return { adversariesData, environmentsData }
  }
  
  let officialAdversaries = { adversaries: [] }
  let officialEnvironments = { environments: [] }
  let playtestAdv = { adversaries: [] }
  let playtestEnv = { environments: [] }
  
  try {
    const mod = await import(/* @vite-ignore */ '../Adversaries/adversaries.json')
    officialAdversaries = mod?.default || mod
  } catch (e) {
    console.warn('Failed to load adversaries.json:', e)
  }
  
  try {
    const mod = await import(/* @vite-ignore */ '../Environments/environments.json')
    officialEnvironments = mod?.default || mod
  } catch (e) {
    console.warn('Failed to load environments.json:', e)
  }
  
  try {
    const mod = await import(/* @vite-ignore */ '../Adversaries/playtest-adversaries.json')
    playtestAdv = mod?.default || mod
  } catch (e) {
    console.warn('Failed to load playtest-adversaries.json:', e)
  }
  
  try {
    const mod = await import(/* @vite-ignore */ '../Environments/playtest-environments.json')
    playtestEnv = mod?.default || mod
  } catch (e) {
    console.warn('Failed to load playtest-environments.json:', e)
  }
  
  // Load custom content and merge everything
  const { customAdversaries, customEnvironments } = loadCustomContent()
  
  // Create merged data objects without mutating originals
  adversariesData = {
    ...officialAdversaries,
    adversaries: [
      ...(officialAdversaries.adversaries || []),
      ...(playtestAdv.adversaries || []),
      ...customAdversaries
    ]
  }
  
  environmentsData = {
    ...officialEnvironments,
    environments: [
      ...(officialEnvironments.environments || []),
      ...(playtestEnv.environments || []),
      ...customEnvironments
    ]
  }
  
  _dataLoaded = true
  return { adversariesData, environmentsData }
}

// Force reload data (useful after custom content changes)
export function reloadData() {
  _dataLoaded = false
  return loadData()
}

// Get current data (returns cached if loaded, otherwise loads)
export async function getData() {
  if (!_dataLoaded) {
    await loadData()
  }
  return { adversariesData, environmentsData }
}

// Update custom content and reload data
export function updateCustomContent(type, id, updates) {
  const { customAdversaries, customEnvironments } = loadCustomContent()
  
  if (type === 'adversary') {
    const updatedAdversaries = customAdversaries.map(adv => 
      adv.id === id ? { ...adv, ...updates } : adv
    )
    saveCustomContent('adversary', updatedAdversaries)
  } else if (type === 'environment') {
    const updatedEnvironments = customEnvironments.map(env => 
      env.id === id ? { ...env, ...updates } : env
    )
    saveCustomContent('environment', updatedEnvironments)
  }
  
  // Reload data to reflect changes
  return reloadData()
}

// Delete custom content and reload data
export function deleteCustomContent(type, id) {
  const { customAdversaries, customEnvironments } = loadCustomContent()
  
  if (type === 'adversary') {
    const updatedAdversaries = customAdversaries.filter(adv => adv.id !== id)
    saveCustomContent('adversary', updatedAdversaries)
  } else if (type === 'environment') {
    const updatedEnvironments = customEnvironments.filter(env => env.id !== id)
    saveCustomContent('environment', updatedEnvironments)
  }
  
  // Reload data to reflect changes
  return reloadData()
}

