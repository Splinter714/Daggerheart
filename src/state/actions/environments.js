import { generateId } from '../../utils/ids'

export const buildEnvironmentActions = (getGameState, setGameState) => {
  const createEnvironment = (environmentData) => {
    const uniqueId = generateId('env')
    const existing = getGameState().environments || []
    const same = existing.filter(env => env.name.replace(/\s+\(\d+\)$/, '') === environmentData.name)
    let displayName = environmentData.name || 'Unknown'
    if (same.length === 0) {
      displayName = environmentData.name
    } else if (same.length === 1) {
      const first = same[0]
      const firstBase = first.name.replace(/\s+\(\d+\)$/, '')
      const updated = getGameState().environments.map(env => env.id === first.id ? { ...env, name: `${firstBase} (1)` } : env)
      setGameState(prev => ({ ...prev, environments: updated }))
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
    setGameState(prev => ({ ...prev, environments: [...prev.environments, newEnv] }))
  }

  const updateEnvironment = (id, updates) => {
    setGameState(prev => ({
      ...prev,
      environments: prev.environments.map(e => e.id === id ? { ...e, ...updates } : e)
    }))
  }

  const deleteEnvironment = (id) => {
    setGameState(prev => ({
      ...prev,
      environments: prev.environments.filter(e => e.id !== id)
    }))
  }

  const reorderEnvironments = (newOrder) => {
    setGameState(prev => {
      const [oldIndex, newIndex] = newOrder
      const next = [...prev.environments]
      const [moved] = next.splice(oldIndex, 1)
      next.splice(newIndex, 0, moved)
      return { ...prev, environments: next }
    })
  }

  return { createEnvironment, updateEnvironment, deleteEnvironment, reorderEnvironments }
}


