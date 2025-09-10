import { useEffect, useState } from 'react'

function readFromStorage(key) {
  if (typeof localStorage === 'undefined') return null
  try {
    const raw = localStorage.getItem(key)
    return raw == null ? null : JSON.parse(raw)
  } catch (e) {
    return null
  }
}

function writeToStorage(key, value) {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (e) {
    // ignore quota errors
  }
}

export default function usePersistentState(key, defaultValue) {
  const [state, setState] = useState(() => {
    const stored = readFromStorage(key)
    return stored == null ? defaultValue : stored
  })

  // When key changes, reload from storage (or default)
  useEffect(() => {
    const stored = readFromStorage(key)
    setState(stored == null ? defaultValue : stored)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  useEffect(() => {
    writeToStorage(key, state)
  }, [key, state])

  return [state, setState]
}


