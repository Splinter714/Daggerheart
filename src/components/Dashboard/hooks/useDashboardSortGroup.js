import { readFromStorage, writeToStorage } from '../../../state/StorageHelpers'
import { useState, useEffect } from 'react'

const STORAGE_KEY = 'daggerheart-dashboard-sort-group'

const DEFAULTS = {
  sortBy: 'name-asc',
  groupBy: 'none',
}

export function useDashboardSortGroup() {
  const [settings, setSettings] = useState(() => {
    const stored = readFromStorage(STORAGE_KEY)
    return stored ? { ...DEFAULTS, ...stored } : DEFAULTS
  })

  useEffect(() => {
    writeToStorage(STORAGE_KEY, settings)
  }, [settings])

  const setSortBy = (sortBy) => setSettings(s => ({ ...s, sortBy }))
  const setGroupBy = (groupBy) => setSettings(s => ({ ...s, groupBy }))

  return { ...settings, setSortBy, setGroupBy }
}

// Sort comparators for adversary groups (groups have template fields at top level)
function getSortValue(group, sortBy) {
  switch (sortBy) {
    case 'name-asc':
    case 'name-desc':
      return (group.baseName || '').toLowerCase()
    case 'tier':
      return group.tier ?? 0
    case 'type':
      return (group.type || '').toLowerCase()
    case 'hp':
      return group.hpMax ?? 0
    case 'difficulty':
      return group.difficulty ?? 0
    case 'atk':
      return group.atk ?? 0
    case 'threshold-major':
      return group.thresholds?.major ?? group.damageThreshold ?? 0
    default:
      return (group.baseName || '').toLowerCase()
  }
}

export function applySort(adversaryGroups, sortBy) {
  return [...adversaryGroups].sort((a, b) => {
    const av = getSortValue(a, sortBy)
    const bv = getSortValue(b, sortBy)
    if (typeof av === 'string' && typeof bv === 'string') {
      const cmp = av.localeCompare(bv)
      return sortBy === 'name-desc' ? -cmp : cmp
    }
    return sortBy === 'name-desc' ? bv - av : av - bv
  })
}

export function getGroupLabel(group, groupBy) {
  if (groupBy === 'tier') return `Tier ${group.tier ?? '?'}`
  if (groupBy === 'type') return group.type || 'Unknown'
  return null
}
