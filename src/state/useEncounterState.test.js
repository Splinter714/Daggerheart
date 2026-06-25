import { renderHook, act } from '@testing-library/react'
import { useEncounterState } from './useEncounterState'

beforeEach(() => localStorage.clear())

describe('useEncounterState', () => {
  it('saves a new encounter and returns its id', () => {
    const { result } = renderHook(() => useEncounterState())
    let id
    act(() => {
      id = result.current.saveEncounter({ name: 'Ambush', encounterItems: [{ x: 1 }] })
    })

    expect(id).toBeTruthy()
    expect(result.current.savedEncounters).toHaveLength(1)
    expect(result.current.savedEncounters[0].name).toBe('Ambush')
    expect(result.current.savedEncounters[0].encounterItems).toEqual([{ x: 1 }])
  })

  it('updates an existing encounter when given its id', () => {
    const { result } = renderHook(() => useEncounterState())
    let id
    act(() => {
      id = result.current.saveEncounter({ name: 'Ambush' })
    })
    act(() => result.current.saveEncounter({ id, name: 'Ambush v2' }))

    expect(result.current.savedEncounters).toHaveLength(1)
    expect(result.current.savedEncounters[0].name).toBe('Ambush v2')
  })

  it('loads an encounter by id', () => {
    const { result } = renderHook(() => useEncounterState())
    let id
    act(() => {
      id = result.current.saveEncounter({ name: 'Ambush' })
    })

    expect(result.current.loadEncounter(id)?.name).toBe('Ambush')
  })

  it('deletes an encounter', () => {
    const { result } = renderHook(() => useEncounterState())
    let id
    act(() => {
      id = result.current.saveEncounter({ name: 'Ambush' })
    })
    act(() => result.current.deleteEncounter(id))

    expect(result.current.savedEncounters).toHaveLength(0)
  })

  it('falls back to "Encounter" for an empty name', () => {
    const { result } = renderHook(() => useEncounterState())
    act(() => result.current.updateCurrentEncounterName(''))

    expect(result.current.currentEncounterName).toBe('Encounter')
  })
})
