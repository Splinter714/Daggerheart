import { generateId } from '../../utils/ids'

export const buildAdversaryActions = (getGameState, setGameState) => {
  const createAdversary = (adversaryData) => {
    const uniqueId = generateId('adv')
    const existingAdversaries = getGameState().adversaries || []
    const baseName = adversaryData.name || 'Unknown'
    const sameNameAdversaries = existingAdversaries.filter(adv => adv.baseName === baseName)
    
    let duplicateNumber = 1
    if (sameNameAdversaries.length === 0) {
      duplicateNumber = 1
    } else {
      // Find the next available number
      const usedNumbers = sameNameAdversaries.map(adv => adv.duplicateNumber || 1)
      let next = 1
      while (usedNumbers.includes(next)) next++
      duplicateNumber = next
    }

    const newAdversary = {
      ...adversaryData,
      id: uniqueId,
      baseName: baseName,
      duplicateNumber: duplicateNumber,
      name: `${baseName} (${duplicateNumber})`,
      hp: 0,
      stress: 0,
      isVisible: true
    }
    setGameState(prev => ({ ...prev, adversaries: [...prev.adversaries, newAdversary] }))
  }

  const updateAdversary = (id, updates) => {
    setGameState(prev => ({
      ...prev,
      adversaries: prev.adversaries.map(a => {
        if (a.id === id) {
          const updated = { ...a, ...updates }
          
          // If baseName is being updated, recalculate the display name
          if (updates.baseName !== undefined) {
            const baseName = updates.baseName
            const duplicateNumber = updated.duplicateNumber || 1
            updated.name = duplicateNumber === 1 ? baseName : `${baseName} (${duplicateNumber})`
          }
          
          return updated
        }
        return a
      })
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


