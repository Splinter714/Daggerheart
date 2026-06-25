import { renderHook, act } from '@testing-library/react'
import { useAdversaryState } from './useAdversaryState'

beforeEach(() => localStorage.clear())

describe('useAdversaryState', () => {
  it('creates a single adversary as one group with one instance', () => {
    const { result } = renderHook(() => useAdversaryState())
    act(() => result.current.createAdversary({ name: 'Goblin', difficulty: 11 }))

    expect(result.current.groups).toHaveLength(1)
    expect(result.current.adversaries).toHaveLength(1)
    expect(result.current.adversaries[0].name).toBe('Goblin')
    expect(result.current.adversaries[0].difficulty).toBe(11)
  })

  it('groups duplicates of the same baseName and numbers them', () => {
    const { result } = renderHook(() => useAdversaryState())
    act(() => result.current.createAdversary({ name: 'Goblin' }))
    act(() => result.current.createAdversary({ name: 'Goblin' }))

    expect(result.current.groups).toHaveLength(1)
    expect(result.current.adversaries.map((a) => a.name)).toEqual(['Goblin', 'Goblin (2)'])
  })

  it('routes an hp update to a single instance, leaving its sibling untouched', () => {
    const { result } = renderHook(() => useAdversaryState())
    act(() => result.current.createAdversary({ name: 'Goblin' }))
    act(() => result.current.createAdversary({ name: 'Goblin' }))

    const firstInstanceId = result.current.groups[0].instances[0].id
    act(() => result.current.updateAdversary(firstInstanceId, { hp: 5 }))

    expect(result.current.groups[0].instances[0].hp).toBe(5)
    expect(result.current.groups[0].instances[1].hp).toBe(0)
  })

  it('routes a template update via the group id to the whole group', () => {
    const { result } = renderHook(() => useAdversaryState())
    act(() => result.current.createAdversary({ name: 'Goblin', difficulty: 11 }))

    const groupId = result.current.groups[0].id
    act(() => result.current.updateAdversary(groupId, { difficulty: 14 }))

    expect(result.current.adversaries[0].difficulty).toBe(14)
  })

  it('deletes an instance and prunes the group once it is empty', () => {
    const { result } = renderHook(() => useAdversaryState())
    act(() => result.current.createAdversary({ name: 'Goblin' }))

    const instanceId = result.current.groups[0].instances[0].id
    act(() => result.current.deleteAdversary(instanceId))

    expect(result.current.groups).toHaveLength(0)
    expect(result.current.adversaries).toHaveLength(0)
  })

  it('migrates the legacy flat-array format into groups', () => {
    const legacy = [
      { id: 'a1', name: 'Goblin', hp: 3, stress: 0, isVisible: true, difficulty: 11 },
      { id: 'a2', name: 'Goblin (2)', hp: 0, stress: 0, isVisible: true, difficulty: 11 },
    ]
    const { result } = renderHook(() => useAdversaryState(legacy))

    expect(result.current.groups).toHaveLength(1)
    expect(result.current.groups[0].baseName).toBe('Goblin')
    expect(result.current.adversaries).toHaveLength(2)
  })
})
