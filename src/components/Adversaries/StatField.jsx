import React from 'react'
import { formatRange, formatAtkRange, getGuideRange, isInRange, guideRanges } from './adversaryGuideRanges'
import { inputStyle, labelStyle, sectionStyle } from './customCreatorConstants'
import { InfoPopover } from './InfoPopover'

// STAT_COLS and StatField extracted verbatim from CustomAdversaryCreator.jsx (Phase 4).
const STAT_COLS = [
  { key: 'difficulty', label: 'Diff',  fmt: r => formatRange(r.difficulty) },
  { key: 'major',      label: 'Maj',   fmt: r => r.major  ? formatRange(r.major)  : '—' },
  { key: 'severe',     label: 'Sev',   fmt: r => r.severe ? formatRange(r.severe) : '—' },
  { key: 'hp',         label: 'HP',    fmt: r => formatRange(r.hp) },
  { key: 'stress',     label: 'Stress', fmt: r => formatRange(r.stress) },
  { key: 'atk',        label: 'ATK',   fmt: r => formatAtkRange(r.atk) },
]

export const StatField = ({ label, field, subfield, rangeKey, disabled, formData, setFormData, adversaryType, currentTier }) => {
  const raw = subfield ? formData[field]?.[subfield] : formData[field]
  const guideRange = getGuideRange(adversaryType, currentTier)
  const range = guideRange?.[rangeKey]
  const outOfRange = !disabled && !isInRange(raw, range)
  const color = disabled ? 'var(--text-secondary)' : outOfRange ? 'var(--danger)' : 'var(--border)'

  const set = (val) => {
    if (subfield) {
      setFormData(prev => ({ ...prev, [field]: { ...prev[field], [subfield]: val } }))
    } else {
      setFormData(prev => ({ ...prev, [field]: val }))
    }
  }

  const stepBtn = (delta) => (
    <button type="button" disabled={disabled} onClick={() => set((parseInt(raw) || 0) + delta)} style={{
      width: '44px', height: '44px', flexShrink: 0,
      border: `1px solid ${color}`,
      borderRadius: delta < 0 ? '0.25rem 0 0 0.25rem' : '0 0.25rem 0.25rem 0',
      background: 'var(--bg-secondary)',
      color: disabled ? 'var(--text-secondary)' : 'var(--text-primary)',
      fontSize: '1rem', lineHeight: 1, cursor: disabled ? 'not-allowed' : 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      opacity: disabled ? 0.4 : 1,
    }}>{delta < 0 ? '−' : '+'}</button>
  )

  return (
    <div style={sectionStyle}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.3rem' }}>
        <span style={{ ...labelStyle, marginBottom: 0, lineHeight: 1, display: 'flex', alignItems: 'center' }}>{label}</span>
        <span style={{ visibility: disabled ? 'hidden' : 'visible', display: 'flex', alignItems: 'center' }}>
          <InfoPopover minWidth={320}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'center', paddingBottom: '0.2rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.66rem', borderBottom: '1px solid var(--border)', paddingRight: '0.4rem' }}>T</th>
                  {STAT_COLS.map(c => (
                    <th key={c.key} style={{
                      textAlign: 'center', paddingBottom: '0.2rem',
                      color: 'var(--text-secondary)',
                      fontWeight: 600,
                      fontSize: '0.66rem', borderBottom: '1px solid var(--border)',
                      paddingRight: '0.35rem',
                    }}>{c.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[1,2,3,4].map(t => {
                  const r = guideRanges[adversaryType]?.[t]
                  if (!r) return null
                  const curRow = t === currentTier
                  return (
                    <tr key={t}>
                      <td style={{ padding: '0.18rem 0.4rem 0.18rem 0', textAlign: 'center', color: 'var(--text-secondary)' }}>{t}</td>
                      {STAT_COLS.map((c) => {
                        const highlight = curRow && c.key === rangeKey
                        return (
                          <td key={c.key} style={{
                            padding: '0.18rem 0.35rem 0.18rem 0',
                            textAlign: 'center',
                            color: highlight ? 'var(--text-primary)' : 'var(--text-secondary)',
                            fontWeight: highlight ? 700 : 400,
                          }}>{c.fmt(r)}</td>
                        )
                      })}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </InfoPopover>
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {stepBtn(-1)}
        <input
          type="number"
          value={raw ?? ''}
          disabled={disabled}
          onChange={e => set(e.target.value === '' ? '' : parseInt(e.target.value) || 0)}
          style={{
            ...inputStyle, borderRadius: 0, borderLeft: 'none', borderRight: 'none',
            textAlign: 'center', opacity: disabled ? 0.4 : 1, borderColor: color,
            width: '100%', minWidth: 0,
          }}
        />
        {stepBtn(1)}
      </div>
    </div>
  )
}


export default StatField
