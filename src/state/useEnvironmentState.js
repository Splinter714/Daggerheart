// Environment state management module
import { useState, useEffect, useRef } from 'react'
import { generateId, readFromStorage, writeToStorage } from './StorageHelpers'

export function useEnvironmentState(initialEnvironments = []) {
  const [environments, setEnvironments] = useState(initialEnvironments)
  const isInitialMount = useRef(true)

  // Save to storage whenever environments change (but skip initial mount)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }
    const savedState = readFromStorage('daggerheart-game-state') || {}
    writeToStorage('daggerheart-game-state', {
      ...savedState,
      environments
    })
  }, [environments])

  const createEnvironment = (environmentData) => {
    const uniqueId = generateId('env')
    const existing = environments || []
    const same = existing.filter(env => env.name.replace(/\s+\(\d+\)$/, '') === environmentData.name)
    let displayName = environmentData.name || 'Unknown'
    if (same.length === 0) {
      displayName = environmentData.name
    } else if (same.length === 1) {
      const first = same[0]
      const firstBase = first.name.replace(/\s+\(\d+\)$/, '')
      const updated = environments.map(env => env.id === first.id ? { ...env, name: `${firstBase} (1)` } : env)
      setEnvironments(updated)
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
    setEnvironments(prev => [...prev, newEnv])
  }

  const updateEnvironment = (id, updates) => {
    setEnvironments(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e))
  }

  const deleteEnvironment = (id) => {
    setEnvironments(prev => prev.filter(e => e.id !== id))
  }

  return {
    environments,
    createEnvironment,
    updateEnvironment,
    deleteEnvironment
  }
}

