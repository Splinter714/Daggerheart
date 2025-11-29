// Adversary state management module
import { useState, useEffect, useRef } from 'react'
import { generateId, readFromStorage, writeToStorage } from './StorageHelpers'

export function useAdversaryState(initialAdversaries = []) {
  const [adversaries, setAdversaries] = useState(initialAdversaries)
  const isInitialMount = useRef(true)

  // Save to storage whenever adversaries change (but skip initial mount)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }
    const savedState = readFromStorage('daggerheart-game-state') || {}
    writeToStorage('daggerheart-game-state', {
      ...savedState,
      adversaries
    })
  }, [adversaries])

  const createAdversary = (adversaryData) => {
    const uniqueId = generateId('adv')
    const baseName = adversaryData.baseName || adversaryData.name?.replace(/\s+\(\d+\)$/, '') || adversaryData.name || 'Unknown'
    const sameNameAdversaries = adversaries.filter(adv => adv.baseName === baseName)
    
    let duplicateNumber = 1
    if (sameNameAdversaries.length > 0) {
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
    setAdversaries(prev => [...prev, newAdversary])
  }

  const createAdversariesBulk = (adversaryDataArray) => {
    const newAdversaries = []
    const baseNameCounts = {}
    
    adversaryDataArray.forEach(adversaryData => {
      const baseName = adversaryData.baseName || adversaryData.name?.replace(/\s+\(\d+\)$/, '') || adversaryData.name || 'Unknown'
      
      const sameNameAdversaries = adversaries.filter(adv => adv.baseName === baseName)
      const existingCount = sameNameAdversaries.length
      const batchCount = baseNameCounts[baseName] || 0
      const duplicateNumber = existingCount + batchCount + 1
      baseNameCounts[baseName] = batchCount + 1
      
      const newAdversary = {
        ...adversaryData,
        id: generateId('adv'),
        baseName: baseName,
        duplicateNumber: duplicateNumber,
        name: `${baseName} (${duplicateNumber})`,
        hp: 0,
        stress: 0,
        isVisible: true
      }
      
      newAdversaries.push(newAdversary)
    })
    
    setAdversaries(prev => [...prev, ...newAdversaries])
  }

  const updateAdversary = (id, updates) => {
    setAdversaries(prev => prev.map(a => {
      if (a.id === id) {
        const updated = { ...a, ...updates }
        if (updates.baseName !== undefined) {
          const baseName = updates.baseName
          const duplicateNumber = updated.duplicateNumber || 1
          updated.name = duplicateNumber === 1 ? baseName : `${baseName} (${duplicateNumber})`
        }
        return updated
      }
      return a
    }))
  }

  const deleteAdversary = (id) => {
    setAdversaries(prev => prev.filter(a => a.id !== id))
  }

  return {
    adversaries,
    createAdversary,
    createAdversariesBulk,
    updateAdversary,
    deleteAdversary
  }
}

