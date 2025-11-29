// Shared storage utilities for all state modules

export function readFromStorage(key) {
  if (typeof localStorage === 'undefined') return null
  try {
    const raw = localStorage.getItem(key)
    return raw == null ? null : JSON.parse(raw)
  } catch (e) {
    return null
  }
}

export function writeToStorage(key, value) {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (e) {
    // ignore quota errors
  }
}

export function generateId(prefix) {
  const base = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
  return prefix ? `${prefix}-${base}` : base
}

