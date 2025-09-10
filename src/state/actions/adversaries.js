import { generateId } from '../../utils/ids'

export const buildAdversaryActions = (getGameState, setGameState) => {
  const createAdversary = (adversaryData) => {
    const uniqueId = generateId('adv')
    const existingAdversaries = getGameState().adversaries || []
    const sameNameAdversaries = existingAdversaries.filter(adv => adv.name.replace(/\s+\(\d+\)$/, '') === adversaryData.name)
    let displayName = adversaryData.name || 'Unknown'
    if (sameNameAdversaries.length === 0) {
      displayName = adversaryData.name
    } else if (sameNameAdversaries.length === 1) {
      const first = sameNameAdversaries[0]
      const firstBase = first.name.replace(/\s+\(\d+\)$/, '')
      const updated = getGameState().adversaries.map(adv => adv.id === first.id ? { ...adv, name: `${firstBase} (1)` } : adv)
      setGameState(prev => ({ ...prev, adversaries: updated }))
      displayName = `${adversaryData.name} (2)`
    } else {
      const usedNumbers = sameNameAdversaries.map(adv => {
        const match = adv.name.match(/\((\d+)\)$/)
        return match ? parseInt(match[1]) : null
      }).filter(n => n !== null)
      let next = 1
      while (usedNumbers.includes(next)) next++
      displayName = `${adversaryData.name} (${next})`
    }

    const newAdversary = {
      ...adversaryData,
      id: uniqueId,
      name: displayName,
      hp: 0,
      stress: 0,
      isVisible: true
    }
    setGameState(prev => ({ ...prev, adversaries: [...prev.adversaries, newAdversary] }))
  }

  const updateAdversary = (id, updates) => {
    setGameState(prev => ({
      ...prev,
      adversaries: prev.adversaries.map(a => a.id === id ? { ...a, ...updates } : a)
    }))
  }

  const deleteAdversary = (id) => {
    setGameState(prev => ({
      ...prev,
      adversaries: prev.adversaries.filter(a => a.id !== id)
    }))
  }

  const reorderAdversaries = (newOrder) => {
    setGameState(prev => {
      const [oldIndex, newIndex] = newOrder
      const next = [...prev.adversaries]
      const [moved] = next.splice(oldIndex, 1)
      next.splice(newIndex, 0, moved)
      return { ...prev, adversaries: next }
    })
  }

  return { createAdversary, updateAdversary, deleteAdversary, reorderAdversaries }
}


