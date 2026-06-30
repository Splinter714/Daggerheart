import React, { useState, useEffect } from 'react'
import { getDamagePools } from './adversaryGuideRanges'
import { inputStyle } from './customCreatorConstants'

// Damage dice selector — dropdown of pool presets with optional custom text entry.
// Extracted verbatim from CustomAdversaryCreator.jsx (Phase 4).
export const selectArrowBg = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%23888'/%3E%3C/svg%3E")`

export const DamageSelector = ({ damage, type, tier, onChange }) => {
  const pools = getDamagePools(type, tier)
  const isPreset = pools?.includes(damage) ?? false
  const [customMode, setCustomMode] = useState(!isPreset && damage !== '')

  useEffect(() => {
    if (isPreset) setCustomMode(false)
  }, [isPreset])

  if (!pools) {
    return (
      <input type="text" value={damage} onChange={e => onChange(e.target.value)}
        placeholder="e.g. 1d8+2" style={{ ...inputStyle, minHeight: '44px', fontFamily: 'monospace' }} />
    )
  }

  const showCustom = customMode || (!isPreset && damage !== '')
  const selectValue = showCustom ? '__custom__' : (isPreset ? damage : '')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
      <select
        value={selectValue}
        onChange={e => {
          if (e.target.value === '__custom__') { setCustomMode(true) }
          else { setCustomMode(false); onChange(e.target.value) }
        }}
        style={{
          ...inputStyle, minHeight: '44px',
          appearance: 'none', WebkitAppearance: 'none',
          backgroundImage: selectArrowBg,
          backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.65rem center', paddingRight: '2rem',
          fontFamily: 'monospace',
        }}
      >
        {!damage && <option value="" disabled>Select damage…</option>}
        {pools.map(p => <option key={p} value={p}>{p}</option>)}
        <option value="__custom__">Custom…</option>
      </select>
      {showCustom && (
        <input type="text" value={damage} onChange={e => onChange(e.target.value)}
          placeholder="e.g. 1d8+2"
          style={{ ...inputStyle, minHeight: '44px', fontFamily: 'monospace' }}
          autoFocus={customMode} />
      )}
    </div>
  )
}

export default DamageSelector
