import { readFromStorage, writeToStorage } from '../../../state/StorageHelpers'
import { useState, useEffect } from 'react'

const STORAGE_KEY = 'daggerheart-dashboard-sort-group'

const DEFAULTS = {
  sortBy: 'name',
  sortDir: 'asc',
  groupBy: 'none',
}

export function useDashboardSortGroup() {
  const [settings, setSettings] = useState(() => {
    const stored = readFromStorage(STORAGE_KEY)
    if (!stored) return DEFAULTS
    // Migrate old format (sortBy: 'name-asc') to new format
    if (stored.sortBy && stored.sortBy.includes('-')) {
      const [field, dir] = stored.sortBy.split('-')
      return { ...DEFAULTS, sortBy: field, sortDir: dir || 'asc', groupBy: stored.groupBy || 'none' }
    }
    return { ...DEFAULTS, ...stored }
  })

  useEffect(() => {
    writeToStorage(STORAGE_KEY, settings)
  }, [settings])

  // Clicking the same field toggles direction; clicking a new field starts ascending
  const setSortBy = (field) => setSettings(s => ({
    ...s,
    sortBy: field,
    sortDir: s.sortBy === field ? (s.sortDir === 'asc' ? 'desc' : 'asc') : 'asc',
  }))

  const setGroupBy = (groupBy) => setSettings(s => ({ ...s, groupBy }))

  return { ...settings, setSortBy, setGroupBy }
}

const SORT_FIELD_KEY = {
  name: 'baseName',
  tier: 'tier',
  type: 'type',
  hp: 'hpMax',
  difficulty: 'difficulty',
  atk: 'atk',
  threshold: null, // handled specially
}

function getSortValue(group, sortBy) {
  switch (sortBy) {
    case 'name': return (group.baseName || '').toLowerCase()
    case 'tier': return group.tier ?? 0
    case 'type': return (group.type || '').toLowerCase()
    case 'hp': return group.hpMax ?? 0
    case 'difficulty': return group.difficulty ?? 0
    case 'atk': return group.atk ?? 0
    case 'threshold': return group.thresholds?.major ?? group.damageThreshold ?? 0
    default: return (group.baseName || '').toLowerCase()
  }
}

export function applySort(adversaryGroups, sortBy, sortDir) {
  return [...adversaryGroups].sort((a, b) => {
    const av = getSortValue(a, sortBy)
    const bv = getSortValue(b, sortBy)
    let cmp
    if (typeof av === 'string' && typeof bv === 'string') {
      cmp = av.localeCompare(bv)
    } else {
      cmp = av - bv
    }
    return sortDir === 'desc' ? -cmp : cmp
  })
}

export function getGroupLabel(group, groupBy) {
  if (groupBy === 'tier') return `Tier ${group.tier ?? '?'}`
  if (groupBy === 'type') return group.type || 'Unknown'
  return null
}
