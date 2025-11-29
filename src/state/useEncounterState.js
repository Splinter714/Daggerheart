// Encounter state management module
import { useState, useEffect, useRef } from 'react'
import { generateId, readFromStorage, writeToStorage } from './StorageHelpers'

export function useEncounterState(initialSavedEncounters = [], initialEncounterName = 'Encounter') {
  const [savedEncounters, setSavedEncounters] = useState(initialSavedEncounters)
  const [currentEncounterName, setCurrentEncounterName] = useState(initialEncounterName)
  const isInitialMount = useRef(true)

  // Save to storage whenever encounters change (but skip initial mount)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }
    const savedState = readFromStorage('daggerheart-game-state') || {}
    writeToStorage('daggerheart-game-state', {
      ...savedState,
      savedEncounters,
      currentEncounterName
    })
  }, [savedEncounters, currentEncounterName])

  const saveEncounter = (encounterData) => {
    // If encounterData has an ID, update existing encounter
    if (encounterData.id) {
      setSavedEncounters(prev => prev.map(encounter => 
        encounter.id === encounterData.id 
          ? {
              ...encounter,
              name: encounterData.name || encounter.name,
              encounterItems: encounterData.encounterItems || encounter.encounterItems,
              partySize: encounterData.partySize || encounter.partySize,
              battlePointsAdjustments: encounterData.battlePointsAdjustments || encounter.battlePointsAdjustments,
              updatedAt: new Date().toISOString()
            }
          : encounter
      ))
      return encounterData.id
    } else {
      // Create new encounter
      const newEncounter = {
        id: generateId('encounter'),
        name: encounterData.name || 'Encounter',
        createdAt: new Date().toISOString(),
        encounterItems: encounterData.encounterItems || [],
        partySize: encounterData.partySize || 4,
        battlePointsAdjustments: encounterData.battlePointsAdjustments || {}
      }
      
      setSavedEncounters(prev => [...prev, newEncounter])
      return newEncounter.id
    }
  }

  const loadEncounter = (encounterId) => {
    return savedEncounters.find(e => e.id === encounterId)
  }

  const deleteEncounter = (encounterId) => {
    setSavedEncounters(prev => prev.filter(e => e.id !== encounterId))
  }

  const updateCurrentEncounterName = (name) => {
    setCurrentEncounterName(name || 'Encounter')
  }

  return {
    savedEncounters,
    currentEncounterName,
    saveEncounter,
    loadEncounter,
    deleteEncounter,
    updateCurrentEncounterName
  }
}

