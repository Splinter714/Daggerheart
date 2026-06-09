import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef, useCallback } from 'react'
import GameCard from './GameCard'
import FeaturesSection from './GameCard/FeaturesSection'
import ExperienceSection from './GameCard/ExperienceSection'
import { getDefaultAdversaryValues } from './adversaryDefaults'
import { getGuideRange, guideRanges, formatRange, formatAtkRange, isInRange, getDamagePools } from './adversaryGuideRanges'
import { typeGuide, stressFearGuide } from './adversaryTypeGuide'
import { DASHBOARD_GAP } from '../Dashboard/constants'

// Load adversary data for autocomplete
let adversariesData = { adversaries: [] }
let _dataLoaded = false

const loadData = async () => {
  if (_dataLoaded) return

  let officialAdversaries = { adversaries: [] }
  let playtestAdv = { adversaries: [] }

  try {
    const mod = await import(/* @vite-ignore */ './adversaries.json')
    officialAdversaries = mod?.default || mod
  } catch (e) {
    console.warn('Failed to load adversaries.json:', e)
  }

  try {
    const mod = await import(/* @vite-ignore */ './playtest-adversaries.json')
    playtestAdv = mod?.default || mod
  } catch (e) {
    console.warn('Failed to load playtest-adversaries.json:', e)
  }

  adversariesData = {
    adversaries: [
      ...(officialAdversaries.adversaries || []),
      ...(playtestAdv.adversaries || []),
    ],
  }
  _dataLoaded = true
}

// ─── Shared style helpers ───────────────────────────────────────────────────

const inputStyle = {
  width: '100%',
  padding: '0.4rem 0.6rem',
  border: '1px solid var(--border)',
  borderRadius: '5px',
  backgroundColor: 'var(--bg-secondary)',
  color: 'var(--text-primary)',
  fontSize: '1rem',
  outline: 'none',
  boxSizing: 'border-box',
}

const labelStyle = {
  fontSize: '0.7rem',
  fontWeight: '600',
  color: 'var(--text-secondary)',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  marginBottom: '0.3rem',
  display: 'block',
}

const sectionStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.3rem',
}

const TYPES = ['Standard', 'Bruiser', 'Horde', 'Leader', 'Minion', 'Ranged', 'Skulk', 'Solo', 'Support', 'Social']

// ─── Module-level helpers (MUST stay outside the component to avoid remounting on every render) ───

const reorder = (arr, from, to) => {
  if (from === to) return arr
  const r = [...arr]
  const [item] = r.splice(from, 1)
  r.splice(to, 0, item)
  return r
}

const DragHandle = () => (
  <div style={{ cursor: 'grab', color: 'var(--text-secondary)', padding: '0.3rem 0.2rem', flexShrink: 0, userSelect: 'none', fontSize: '1rem' }} title="Drag to reorder">⠿</div>
)

const PanelHeader = ({ label, children }) => (
  <div style={{
    flex: '0 0 auto', padding: '0.45rem 0.75rem',
    borderBottom: '1px solid var(--border)',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-secondary)',
    textTransform: 'uppercase', letterSpacing: '0.6px',
  }}>
    <span>{label}</span>
    {children}
  </div>
)

const AddBtn = ({ label, onClick }) => (
  <button type="button" onClick={onClick} style={{
    marginTop: '0.4rem', padding: '0.25rem 0.6rem',
    background: 'transparent', border: '1px dashed var(--border)',
    borderRadius: '5px', color: 'var(--text-secondary)',
    fontSize: '0.78rem', cursor: 'pointer', width: '100%', textAlign: 'left',
  }}>+ {label}</button>
)

const GuidanceHeading = ({ children }) => (
  <div style={{
    fontSize: '0.68rem', fontWeight: '700', color: 'var(--text-secondary)',
    textTransform: 'uppercase', letterSpacing: '0.6px',
    paddingBottom: '0.3rem', borderBottom: '1px solid var(--border)',
    marginBottom: '0.5rem',
  }}>{children}</div>
)

// ─── InfoPopover ─────────────────────────────────────────────────────────────

// align: 'left' anchors popover to the left edge of the button (default)
//        'right' anchors to the right edge — use for fields near the right of the form
const InfoPopover = ({ children, align = 'left', minWidth = 220 }) => {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    document.addEventListener('touchstart', handler)
    return () => { document.removeEventListener('mousedown', handler); document.removeEventListener('touchstart', handler) }
  }, [open])

  const popoverPos = align === 'right'
    ? { top: '36px', right: 0, left: 'auto', transform: 'none' }
    : { top: '36px', left: 0, right: 'auto', transform: 'none' }

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-flex' }}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        style={{
          width: '44px', height: '44px',
          border: 'none', background: 'transparent',
          cursor: 'pointer', padding: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
          marginTop: '-12px', marginRight: '-12px', marginBottom: '-12px', marginLeft: 0,
        }}
      >
        <span style={{
          width: '20px', height: '20px',
          borderRadius: '50%',
          border: `1px solid ${open ? 'var(--purple)' : 'var(--border)'}`,
          background: open ? 'var(--purple)' : 'var(--bg-secondary)',
          color: open ? 'white' : 'var(--text-secondary)',
          fontSize: '0.65rem', fontWeight: 700,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          pointerEvents: 'none', flexShrink: 0,
        }}>i</span>
      </button>
      {open && (
        <div style={{
          position: 'absolute', ...popoverPos,
          minWidth: `${minWidth}px`, maxWidth: `${Math.max(minWidth, 320)}px`,
          backgroundColor: 'var(--bg-primary)',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          padding: '0.75rem',
          zIndex: 200,
          boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
          fontSize: '0.78rem', lineHeight: 1.5, color: 'var(--text-secondary)',
        }}>
          {children}
        </div>
      )}
    </div>
  )
}

// colHeaders and colKeys must stay in sync with the table rendered in the popover
const STAT_COLS = [
  { key: 'difficulty', label: 'Diff',  fmt: r => formatRange(r.difficulty) },
  { key: 'major',      label: 'Maj',   fmt: r => r.major  ? formatRange(r.major)  : '—' },
  { key: 'severe',     label: 'Sev',   fmt: r => r.severe ? formatRange(r.severe) : '—' },
  { key: 'hp',         label: 'HP',    fmt: r => formatRange(r.hp) },
  { key: 'stress',     label: 'Str',   fmt: r => formatRange(r.stress) },
  { key: 'atk',        label: 'ATK',   fmt: r => formatAtkRange(r.atk) },
]

const StatField = ({ label, field, subfield, rangeKey, disabled, formData, setFormData, adversaryType, currentTier }) => {
  const raw = subfield ? formData[field]?.[subfield] : formData[field]
  const guideRange = getGuideRange(adversaryType, currentTier)
  const range = guideRange?.[rangeKey]
  const outOfRange = !disabled && !isInRange(raw, range)
  const color = disabled ? 'var(--text-secondary)' : outOfRange ? 'var(--orange, #e67e22)' : 'var(--border)'

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
      borderRadius: delta < 0 ? '4px 0 0 4px' : '0 4px 4px 0',
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
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.73rem', whiteSpace: 'nowrap' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', paddingBottom: '0.2rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.65rem', borderBottom: '1px solid var(--border)', paddingRight: '0.4rem' }}>T</th>
                  {STAT_COLS.map(c => (
                    <th key={c.key} style={{
                      textAlign: 'left', paddingBottom: '0.2rem',
                      color: 'var(--text-secondary)',
                      fontWeight: 600,
                      fontSize: '0.65rem', borderBottom: '1px solid var(--border)',
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
                      <td style={{ padding: '0.18rem 0.4rem 0.18rem 0', color: curRow ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: curRow ? 600 : 400 }}>{t}</td>
                      {STAT_COLS.map((c, ci) => {
                        const highlight = curRow && c.key === rangeKey
                        return (
                          <td key={c.key} style={{
                            padding: '0.18rem 0.35rem 0.18rem 0',
                            color: highlight ? '#fff' : curRow ? 'var(--text-primary)' : 'var(--text-secondary)',
                            fontWeight: highlight ? 700 : curRow ? 600 : 400,
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

const FeatureList = ({ featureType, label, formData, setFormData, dragFromRef, guideFeatures }) => {
  const allFeatures = formData.features || []
  const items = allFeatures.filter(f => f.type === featureType)
  const indices = allFeatures.reduce((acc, f, i) => { if (f.type === featureType) acc.push(i); return acc }, [])

  const addItem = () => setFormData(prev => ({ ...prev, features: [...(prev.features || []), { type: featureType, name: '', description: '' }] }))

  const addGuideFeature = (f) => setFormData(prev => ({
    ...prev,
    features: [...(prev.features || []), { type: featureType, name: f.name, description: f.desc || '' }]
  }))

  return (
    <div style={sectionStyle}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.35rem' }}>
        <label style={{ ...labelStyle, marginBottom: 0, lineHeight: 1, display: 'flex', alignItems: 'center' }}>{label}</label>
        <InfoPopover>
          {guideFeatures?.length > 0 ? (
            <>
              <div style={{ fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Common {label}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {guideFeatures.map((f, i) => (
                  <div key={i}>
                    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '0.5rem' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.78rem' }}>{f.name}</span>
                      <button type="button" onClick={() => addGuideFeature(f)} style={{
                        padding: '0.2rem 0.5rem', minHeight: '36px', flexShrink: 0,
                        background: 'var(--purple)', border: 'none', borderRadius: '3px',
                        color: 'white', fontSize: '0.68rem', cursor: 'pointer',
                      }}>Add</button>
                    </div>
                    {f.desc && <div style={{ fontSize: '0.73rem', marginTop: '0.1rem' }}>{f.desc}</div>}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              {featureType === 'Action' && 'Things the adversary does on its turn — attacks, abilities, special moves.'}
              {featureType === 'Passive' && 'Ongoing abilities that are always active and affect how the adversary works.'}
              {featureType === 'Reaction' && 'Abilities triggered by specific events, such as taking damage or an ally acting.'}
            </div>
          )}
        </InfoPopover>
        <button type="button" onClick={addItem} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.1rem', lineHeight: 1, padding: '0.3rem 0.4rem', minWidth: '44px', minHeight: '44px' }} title={`Add ${label.slice(0, -1)}`}>+</button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        {items.map((feat, localIdx) => {
          const globalIdx = indices[localIdx]
          return (
            <div
              key={`${featureType}-${localIdx}`}
              draggable
              onDragStart={() => { dragFromRef.current = localIdx }}
              onDragOver={e => e.preventDefault()}
              onDrop={() => {
                if (dragFromRef.current === null) return
                const newItems = reorder(items, dragFromRef.current, localIdx)
                const order = ['Action', 'Passive', 'Reaction']
                const rebuilt = order.flatMap(t => t === featureType ? newItems : allFeatures.filter(f => f.type === t))
                setFormData(prev => ({ ...prev, features: rebuilt }))
                dragFromRef.current = null
              }}
              style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '5px', padding: '0.4rem 0.5rem' }}
            >
              <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
                <DragHandle />
                <input
                  type="text"
                  value={feat.name || ''}
                  onChange={e => {
                    const next = [...allFeatures]
                    next[globalIdx] = { ...next[globalIdx], name: e.target.value }
                    setFormData(prev => ({ ...prev, features: next }))
                  }}
                  placeholder={`${label.slice(0, -1)} name`}
                  style={{ ...inputStyle, flex: 1, background: 'transparent', border: '1px solid transparent', borderRadius: '4px' }}
                  onFocus={e => e.target.style.borderColor = 'var(--border)'}
                  onBlur={e => e.target.style.borderColor = 'transparent'}
                />
                <button type="button" onClick={() => {
                  const next = allFeatures.filter((_, i) => i !== globalIdx)
                  setFormData(prev => ({ ...prev, features: next }))
                }} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.6rem 0.5rem', fontSize: '1rem', flexShrink: 0, minWidth: '44px', minHeight: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
              </div>
              <textarea
                value={feat.description || ''}
                onChange={e => {
                  const next = [...allFeatures]
                  next[globalIdx] = { ...next[globalIdx], description: e.target.value }
                  setFormData(prev => ({ ...prev, features: next }))
                }}
                placeholder="Description..."
                rows={2}
                style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit', minHeight: '48px', background: 'transparent', border: '1px solid transparent', borderRadius: '4px' }}
                onFocus={e => e.target.style.borderColor = 'var(--border)'}
                onBlur={e => e.target.style.borderColor = 'transparent'}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Damage selector — dropdown of pool presets with optional custom text entry ─

const selectArrowBg = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%23888'/%3E%3C/svg%3E")`

const DamageSelector = ({ damage, type, tier, onChange }) => {
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

// ─── Type selector dropdown (extracted to avoid useState inside IIFE) ────────

const TypeSelector = ({ selectedType, onTypeChange }) => {
  const [typeOpen, setTypeOpen] = useState(false)
  const tGuide = typeGuide[selectedType]
  return (
    <div style={{ position: 'relative' }}>
      <button type="button" onClick={() => setTypeOpen(v => !v)} style={{
        width: '100%', textAlign: 'left',
        background: 'var(--bg-secondary)',
        border: `1px solid ${typeOpen ? 'var(--purple)' : 'var(--border)'}`,
        borderRadius: typeOpen ? '5px 5px 0 0' : '5px',
        padding: '0.4rem 0.6rem',
        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem',
        minHeight: '44px',
      }}>
        <span style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--text-primary)' }}>{selectedType}</span>
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.7rem', flexShrink: 0 }}>{typeOpen ? '▲' : '▼'}</span>
      </button>
      {typeOpen && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50,
          border: '1px solid var(--purple)', borderTop: 'none',
          borderRadius: '0 0 5px 5px',
          backgroundColor: 'var(--bg-primary)',
          maxHeight: '260px', overflowY: 'auto',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        }}>
          {TYPES.map(t => {
            const tg = typeGuide[t]
            const isSelected = selectedType === t
            return (
              <button key={t} type="button" onClick={() => { onTypeChange(t); setTypeOpen(false) }} style={{
                width: '100%', textAlign: 'left',
                background: isSelected ? 'color-mix(in srgb, var(--purple) 10%, transparent)' : 'transparent',
                border: 'none', borderBottom: '1px solid var(--border)',
                padding: '0.4rem 0.6rem', cursor: 'pointer', minHeight: '44px',
              }}>
                <div style={{ fontWeight: 700, fontSize: '0.82rem', color: isSelected ? 'var(--purple)' : 'var(--text-primary)', marginBottom: tg?.summary ? '0.1rem' : 0 }}>{t}</div>
                {tg?.summary && <div style={{ fontSize: '0.71rem', color: 'var(--text-secondary)', lineHeight: 1.35 }}>{tg.summary}</div>}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Main component ──────────────────────────────────────────────────────────

const CustomAdversaryCreator = forwardRef(({
  onSave,
  onRefresh,
  onAddItem,
  onAddToEncounter,
  editingAdversary,
  onCancelEdit,
  isStockAdversary = false,
  autoFocus = false,
  allAdversaries = [],
  embedded = false,
  hideEmbeddedButtons = false,
  columnWidth = null,
}, ref) => {
  const nameInputRef = useRef(null)
  const gameCardNameInputRef = useRef(null)
  const dragFromRef = useRef(null)

  const [formData, setFormData] = useState(() => {
    const defaults = getDefaultAdversaryValues(1, 'Standard')
    return {
      name: '', tier: 1, type: 'Standard',
      description: '', motives: '',
      difficulty: defaults.difficulty,
      thresholds: defaults.thresholds,
      hpMax: defaults.hpMax,
      stressMax: defaults.stressMax,
      atk: defaults.atk,
      weapon: '', range: defaults.range, damage: defaults.damage,
      experience: [], features: [],
    }
  })

  const [isSaving, setIsSaving] = useState(false)
  const [statsPulledFromExisting, setStatsPulledFromExisting] = useState(false)
  const [nameSuggestions, setNameSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [adversaryData, setAdversaryData] = useState([])
  const [deleteConfirmations, setDeleteConfirmations] = useState({})

  // activeTab / isNarrow — only meaningful when !embedded, but hooks must be unconditional
  const [activeTab, setActiveTab] = useState('build')
  const containerRef = useRef(null)
  const [isNarrow, setIsNarrow] = useState(false)

  useEffect(() => {
    if (embedded) return
    const el = containerRef.current
    if (!el) return
    const observer = new ResizeObserver(([entry]) => {
      setIsNarrow(entry.contentRect.width < 700)
    })
    observer.observe(el)
    setIsNarrow(el.offsetWidth < 700)
    return () => observer.disconnect()
  }, [embedded])

  // ── Data loading ────────────────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      await loadData()
      if (allAdversaries.length > 0) {
        setAdversaryData(allAdversaries)
      } else {
        setAdversaryData(adversariesData.adversaries || [])
      }
    }
    init()
  }, [allAdversaries])

  // ── Auto-focus ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (autoFocus) {
      setTimeout(() => {
        if (editingAdversary && gameCardNameInputRef.current) {
          gameCardNameInputRef.current?.focus()
          gameCardNameInputRef.current?.select()
        } else if (nameInputRef.current) {
          nameInputRef.current?.focus()
        }
      }, 650)
    }
  }, [autoFocus, editingAdversary])

  // ── Initialize from editingAdversary ────────────────────────────────────────
  useEffect(() => {
    if (editingAdversary) {
      const baseName = editingAdversary.baseName || editingAdversary.name?.replace(/\s+\(\d+\)$/, '') || editingAdversary.name || ''
      setFormData({
        name: baseName,
        tier: editingAdversary.tier || 1,
        type: editingAdversary.type || 'Standard',
        description: editingAdversary.description || '',
        motives: editingAdversary.motives || '',
        difficulty: editingAdversary.difficulty || 11,
        thresholds: editingAdversary.thresholds || { major: 7, severe: 12 },
        hpMax: editingAdversary.hpMax || 3,
        stressMax: editingAdversary.stressMax || 1,
        atk: editingAdversary.atk || 1,
        weapon: editingAdversary.weapon || '',
        range: editingAdversary.range || 'Melee',
        damage: editingAdversary.damage || '',
        experience: editingAdversary.experience || [],
        features: editingAdversary.features || [],
      })
      setStatsPulledFromExisting(false)
    } else {
      const defaults = getDefaultAdversaryValues(1, 'Standard')
      setFormData({
        name: '', tier: 1, type: 'Standard',
        description: '', motives: '',
        difficulty: defaults.difficulty,
        thresholds: defaults.thresholds,
        hpMax: defaults.hpMax, stressMax: defaults.stressMax,
        atk: defaults.atk, weapon: '', range: defaults.range, damage: defaults.damage,
        experience: [], features: [],
      })
      setStatsPulledFromExisting(false)
    }
  }, [editingAdversary])

  // ── Handlers that batch tier/type changes with new defaults to avoid flicker ─
  const handleTierChange = useCallback((t) => {
    setFormData(prev => {
      if (!editingAdversary && !statsPulledFromExisting) {
        const d = getDefaultAdversaryValues(t, prev.type)
        return { ...prev, tier: t, difficulty: d.difficulty, thresholds: d.thresholds, hpMax: d.hpMax, stressMax: d.stressMax, atk: d.atk, range: d.range, damage: d.damage }
      }
      return { ...prev, tier: t }
    })
  }, [editingAdversary, statsPulledFromExisting])

  const handleTypeChange = useCallback((t) => {
    setFormData(prev => {
      if (!editingAdversary && !statsPulledFromExisting) {
        const d = getDefaultAdversaryValues(prev.tier, t)
        return { ...prev, type: t, difficulty: d.difficulty, thresholds: d.thresholds, hpMax: d.hpMax, stressMax: d.stressMax, atk: d.atk, range: d.range, damage: d.damage }
      }
      return { ...prev, type: t }
    })
  }, [editingAdversary, statsPulledFromExisting])

  // ── Autocomplete ────────────────────────────────────────────────────────────
  const handleNameChange = (value) => {
    setFormData(prev => ({ ...prev, name: value }))
    if (value.trim().length > 0) {
      const matches = adversaryData
        .filter(adv => {
          const base = adv.name?.replace(/\s+\(\d+\)$/, '') || adv.name || ''
          return base.toLowerCase().includes(value.toLowerCase())
        })
        .slice(0, 5)
      setNameSuggestions(matches)
      setShowSuggestions(matches.length > 0)
    } else {
      setNameSuggestions([])
      setShowSuggestions(false)
      setStatsPulledFromExisting(false)
    }
  }

  // Task #5 fix: pull ALL fields from template adversary
  const handleSelectAdversary = (adv) => {
    const baseName = adv.baseName || adv.name?.replace(/\s+\(\d+\)$/, '') || adv.name || ''
    setFormData(prev => ({
      ...prev,
      name: baseName,
      tier: adv.tier || prev.tier,
      type: adv.type || prev.type,
      description: adv.description || prev.description,
      motives: adv.motives || prev.motives,
      difficulty: adv.difficulty || prev.difficulty,
      thresholds: adv.thresholds || prev.thresholds,
      hpMax: adv.hpMax || prev.hpMax,
      stressMax: adv.stressMax || prev.stressMax,
      atk: adv.atk !== undefined ? adv.atk : prev.atk,
      weapon: adv.weapon || prev.weapon,
      range: adv.range || prev.range,
      damage: adv.damage || prev.damage,
      experience: adv.experience ? [...adv.experience] : prev.experience,
      features: adv.features ? [...adv.features] : prev.features,
    }))
    setStatsPulledFromExisting(true)
    setNameSuggestions([])
    setShowSuggestions(false)
    nameInputRef.current?.focus()
  }

  // ── Feature delete helpers (for form-level FeaturesSection) ─────────────────
  const getFeatureKey = (feature) => {
    const typeFeatures = (formData.features || []).filter(f => f.type === feature.type)
    const idx = typeFeatures.findIndex(f => f === feature)
    return `${feature.type}-${idx}-${feature.name || 'blank'}`
  }

  const handleFeatureDeleteClick = (featureToDelete) => {
    const key = getFeatureKey(featureToDelete)
    if (deleteConfirmations[key]) {
      setFormData(prev => ({ ...prev, features: prev.features.filter(f => f !== featureToDelete) }))
      setDeleteConfirmations(prev => { const n = { ...prev }; delete n[key]; return n })
    } else {
      setDeleteConfirmations(prev => ({ ...prev, [key]: true }))
      setTimeout(() => setDeleteConfirmations(prev => { const n = { ...prev }; delete n[key]; return n }), 3000)
    }
  }

  // onUpdate adapter for FeaturesSection / ExperienceSection
  const handleFormUpdate = (_id, updates) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  // ── Save logic ──────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!formData.name.trim()) return

    setIsSaving(true)
    try {
      const filterBlank = (exps) =>
        (exps || []).filter(e => (e.name && e.name.trim() !== '') || (e.modifier !== undefined && e.modifier !== 0))

      const baseName = formData.name.trim()
      const data = {
        ...formData,
        baseName,
        name: baseName,
        experience: filterBlank(formData.experience),
        hp: editingAdversary ? editingAdversary.hp : 0,
        stress: editingAdversary ? editingAdversary.stress : 0,
        source: 'Homebrew',
      }

      if (editingAdversary) {
        if (isStockAdversary) {
          const { id, name, ...dataToSave } = data
          await onSave(dataToSave)
        } else {
          await onSave({ ...data, name: data.baseName }, editingAdversary.id)
        }
        onCancelEdit?.()
      } else {
        await onSave(data)
        if (onRefresh) await onRefresh()
        const defaults = getDefaultAdversaryValues(1, 'Standard')
        setFormData({
          name: '', tier: 1, type: 'Standard',
          description: '', motives: '',
          difficulty: defaults.difficulty, thresholds: defaults.thresholds,
          hpMax: defaults.hpMax, stressMax: defaults.stressMax,
          atk: defaults.atk, weapon: '', range: defaults.range, damage: defaults.damage,
          experience: [], features: [],
        })
        setStatsPulledFromExisting(false)
      }
    } catch (err) {
      console.error('Error saving adversary:', err)
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveAs = async () => {
    if (!formData.name.trim()) return
    setIsSaving(true)
    try {
      const filterBlank = (exps) =>
        (exps || []).filter(e => (e.name && e.name.trim() !== '') || (e.modifier !== undefined && e.modifier !== 0))
      const baseName = formData.name.trim()
      const data = {
        ...formData, baseName, name: baseName,
        experience: filterBlank(formData.experience),
        hp: 0, stress: 0, source: 'Homebrew',
      }
      const { id, ...dataToSave } = data
      await onSave(dataToSave)
      onCancelEdit?.()
    } catch (err) {
      console.error('Error saving adversary as new:', err)
    } finally {
      setIsSaving(false)
    }
  }

  const handleAddToEncounter = async () => {
    if (!formData.name.trim() || !onAddToEncounter) return
    setIsSaving(true)
    try {
      const filterBlank = (exps) =>
        (exps || []).filter(e => (e.name && e.name.trim() !== '') || (e.modifier !== undefined && e.modifier !== 0))
      const baseName = formData.name.trim()
      const data = {
        ...formData, baseName, name: baseName,
        experience: filterBlank(formData.experience),
        hp: 0, stress: 0, source: 'Homebrew',
      }
      await onAddToEncounter(data)
      onCancelEdit?.()
    } catch (err) {
      console.error('Error adding adversary to encounter:', err)
    } finally {
      setIsSaving(false)
    }
  }

  useImperativeHandle(ref, () => ({
    handleSave,
    isSaving,
    canSave: formData.name.trim().length > 0,
  }))

  // ─────────────────────────────────────────────────────────────────────────────
  // RESPONSIVE LAYOUT (embedded={false})
  // Narrow  (<760px): single panel, tabs to switch between Build / Preview / Guide
  // Wide   (≥760px): Build (flex:2) + visible side panels; tab pills toggle them
  // ─────────────────────────────────────────────────────────────────────────────

  if (!embedded) {
    const isMinion = formData.type === 'Minion'
    const guide = typeGuide[formData.type]

    const formItem = { ...formData, id: 'creator-form', hp: 0, stress: 0, source: 'Homebrew', name: formData.name || 'Name', weapon: formData.weapon || 'Attack' }
    const previewInstances = [{ ...formItem }]

    const canAct = !isSaving && !!formData.name.trim()
    const disabledStyle = { opacity: 0.5, cursor: 'not-allowed' }

    const ActionBar = () => (
      <div style={{
        flex: '0 0 auto',
        display: 'flex', alignItems: 'center',
        padding: '0.5rem 0.75rem',
        borderBottom: '1px solid var(--border)',
        gap: '0.5rem',
      }}>
        {/* Preview toggle — narrow only */}
        {isNarrow && (
          <button
            onClick={() => setActiveTab(v => v === 'build' ? 'preview' : 'build')}
            style={{
              padding: '0.3rem 0.7rem', minHeight: '44px',
              background: activeTab === 'preview' ? 'color-mix(in srgb, var(--purple) 15%, transparent)' : 'transparent',
              border: `1px solid ${activeTab === 'preview' ? 'var(--purple)' : 'var(--border)'}`,
              borderRadius: '5px',
              color: activeTab === 'preview' ? 'var(--purple)' : 'var(--text-secondary)',
              fontSize: '0.8rem', cursor: 'pointer', whiteSpace: 'nowrap',
            }}
          >{activeTab === 'preview' ? '← Build' : 'Preview'}</button>
        )}

        <div style={{ flex: 1 }} />

        {onCancelEdit && (
          <button onClick={onCancelEdit} style={{
            padding: '0.3rem 0.7rem', minHeight: '44px',
            background: 'transparent',
            border: '1px solid var(--border)', borderRadius: '5px',
            color: 'var(--text-primary)', fontSize: '0.875rem', cursor: 'pointer',
          }}>Cancel</button>
        )}

        {/* Save As New — only when editing a homebrew adversary */}
        {editingAdversary && !isStockAdversary && (
          <button
            onClick={handleSaveAs}
            disabled={!canAct}
            style={{
              padding: '0.3rem 0.7rem', minHeight: '44px',
              background: 'transparent',
              border: '1px solid var(--border)', borderRadius: '5px',
              color: 'var(--text-primary)', fontSize: '0.875rem', cursor: canAct ? 'pointer' : 'not-allowed',
              ...(canAct ? {} : disabledStyle),
            }}
          >Save As New</button>
        )}

        {/* Add to Encounter — only when creating new (not editing) */}
        {!editingAdversary && onAddToEncounter && (
          <button
            onClick={handleAddToEncounter}
            disabled={!canAct}
            style={{
              padding: '0.3rem 0.7rem', minHeight: '44px',
              background: 'transparent',
              border: '1px solid var(--border)', borderRadius: '5px',
              color: 'var(--text-primary)', fontSize: '0.875rem', cursor: canAct ? 'pointer' : 'not-allowed',
              ...(canAct ? {} : disabledStyle),
            }}
          >Add to Encounter</button>
        )}

        {/* Primary save button */}
        <button
          onClick={handleSave}
          disabled={!canAct}
          style={{
            padding: '0.3rem 0.9rem', minHeight: '44px',
            background: canAct ? 'var(--purple)' : 'var(--gray-600)',
            border: 'none', borderRadius: '5px', color: 'white',
            fontSize: '0.875rem', fontWeight: '600',
            cursor: canAct ? 'pointer' : 'not-allowed',
            ...(canAct ? {} : disabledStyle),
          }}
        >
          {isSaving
            ? (editingAdversary ? (isStockAdversary ? 'Creating...' : 'Saving...') : 'Saving...')
            : (editingAdversary ? (isStockAdversary ? 'Save As Custom' : 'Save') : 'Save')}
        </button>
      </div>
    )

    const cardStyle = {
      flex: 1, minWidth: 0,
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
      backgroundColor: 'var(--bg-primary)',
      border: '1px solid var(--border)',
      borderRadius: '8px',
      boxShadow: '-4px 0 12px rgba(0,0,0,0.3)',
    }

    const formScrollContent = (
      <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
        <div style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>

              {/* Name */}
              <div style={{ ...sectionStyle, position: 'relative' }}>
                <label style={labelStyle}>Name</label>
                <input
                  ref={nameInputRef}
                  type="text" value={formData.name}
                  onChange={e => handleNameChange(e.target.value)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                  placeholder="Name — or search to import from existing"
                  style={inputStyle}
                />
                {showSuggestions && nameSuggestions.length > 0 && (
                  <div style={{
                    position: 'absolute', top: '100%', left: 0, right: 0,
                    backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border)',
                    borderTop: 'none', borderRadius: '0 0 6px 6px',
                    maxHeight: '180px', overflowY: 'auto', zIndex: 100,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                  }}>
                    {nameSuggestions.map((adv, idx) => {
                      const base = adv.baseName || adv.name?.replace(/\s+\(\d+\)$/, '') || adv.name
                      return (
                        <div key={idx} onMouseDown={e => e.preventDefault()} onClick={() => handleSelectAdversary(adv)}
                          style={{ padding: '0.5rem 0.75rem', cursor: 'pointer', borderBottom: idx < nameSuggestions.length - 1 ? '1px solid var(--border)' : 'none' }}
                          onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
                          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{base}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{adv.type} · Tier {adv.tier}</div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Tier + Type */}
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <div style={sectionStyle}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.3rem', minHeight: '20px' }}>
                    <span style={{ ...labelStyle, marginBottom: 0, lineHeight: 1, display: 'flex', alignItems: 'center' }}>Tier</span>
                    <InfoPopover>
                      <div style={{ fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.4rem', color: 'var(--text-primary)' }}>PC Levels by Tier</div>
                      {[['1','1'],['2','2–4'],['3','5–7'],['4','8–10']].map(([t, lvls]) => (
                        <div key={t} style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', padding: '0.15rem 0', color: parseInt(t) === formData.tier ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: parseInt(t) === formData.tier ? 600 : 400, backgroundColor: parseInt(t) === formData.tier ? 'color-mix(in srgb, var(--purple) 10%, transparent)' : 'transparent', borderRadius: '3px', paddingLeft: '0.2rem', paddingRight: '0.2rem' }}>
                          <span>Lvl {lvls}</span><span>Tier {t}</span>
                        </div>
                      ))}
                    </InfoPopover>
                  </div>
                  <div style={{ display: 'flex' }}>
                    {[1, 2, 3, 4].map((t, i) => (
                      <button key={t} onClick={() => handleTierChange(t)} style={{
                        flex: 1, minWidth: '44px', height: '44px',
                        border: '1px solid var(--border)',
                        borderLeft: i > 0 ? 'none' : '1px solid var(--border)',
                        borderRadius: i === 0 ? '5px 0 0 5px' : i === 3 ? '0 5px 5px 0' : '0',
                        background: formData.tier === t ? 'var(--purple)' : 'var(--bg-secondary)',
                        color: formData.tier === t ? 'white' : 'var(--text-primary)',
                        fontWeight: formData.tier === t ? '700' : '400',
                        fontSize: '0.875rem', cursor: 'pointer',
                      }}>{t}</button>
                    ))}
                  </div>
                </div>
                <div style={{ ...sectionStyle, flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', minHeight: '20px', marginBottom: '0.3rem' }}>
                    <span style={{ ...labelStyle, marginBottom: 0, lineHeight: 1, display: 'flex', alignItems: 'center' }}>Type</span>
                  </div>
                  <TypeSelector selectedType={formData.type} onTypeChange={handleTypeChange} />
                </div>
              </div>

              {/* Description + Motives */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div style={sectionStyle}>
                  <label style={labelStyle}>Description</label>
                  <textarea value={formData.description} onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))} placeholder="Appearance and background..." rows={2} style={{ ...inputStyle, resize: 'vertical', minHeight: '52px', fontFamily: 'inherit' }} />
                </div>
                <div style={sectionStyle}>
                  <label style={labelStyle}>Motives & Tactics</label>
                  <textarea value={formData.motives} onChange={e => setFormData(prev => ({ ...prev, motives: e.target.value }))} placeholder="What drives them, how they fight..." rows={2} style={{ ...inputStyle, resize: 'vertical', minHeight: '52px', fontFamily: 'inherit' }} />
                </div>
              </div>

              {/* Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <StatField label="Difficulty" field="difficulty" rangeKey="difficulty" formData={formData} setFormData={setFormData} adversaryType={formData.type} currentTier={formData.tier} />
                <StatField label="Attack Modifier" field="atk" rangeKey="atk" formData={formData} setFormData={setFormData} adversaryType={formData.type} currentTier={formData.tier} />
                <StatField label="HP" field="hpMax" rangeKey="hp" formData={formData} setFormData={setFormData} adversaryType={formData.type} currentTier={formData.tier} />
                <StatField label="Stress" field="stressMax" rangeKey="stress" formData={formData} setFormData={setFormData} adversaryType={formData.type} currentTier={formData.tier} />
                <StatField label="Major Threshold" field="thresholds" subfield="major" rangeKey="major" disabled={isMinion} formData={formData} setFormData={setFormData} adversaryType={formData.type} currentTier={formData.tier} />
                <StatField label="Severe Threshold" field="thresholds" subfield="severe" rangeKey="severe" disabled={isMinion} formData={formData} setFormData={setFormData} adversaryType={formData.type} currentTier={formData.tier} />
              </div>

              {/* Standard Attack fields */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '0.5rem' }}>
                <div style={sectionStyle}>
                  <div style={{ display: 'flex', alignItems: 'center', minHeight: '20px', marginBottom: '0.3rem' }}>
                    <span style={{ ...labelStyle, marginBottom: 0, lineHeight: 1, display: 'flex', alignItems: 'center' }}>Standard Attack</span>
                  </div>
                  <input type="text" value={formData.weapon} onChange={e => setFormData(prev => ({ ...prev, weapon: e.target.value }))} placeholder="e.g. Greataxe" style={{ ...inputStyle, minHeight: '44px' }} />
                </div>
                <div style={sectionStyle}>
                  <div style={{ display: 'flex', alignItems: 'center', minHeight: '20px', marginBottom: '0.3rem' }}>
                    <span style={{ ...labelStyle, marginBottom: 0, lineHeight: 1, display: 'flex', alignItems: 'center' }}>Range</span>
                  </div>
                  <select value={formData.range} onChange={e => setFormData(prev => ({ ...prev, range: e.target.value }))} style={{ ...inputStyle, minHeight: '44px', appearance: 'none', WebkitAppearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%23888'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.65rem center', paddingRight: '2rem' }}>
                    {['Melee', 'Very Close', 'Close', 'Far', 'Very Far'].map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div style={sectionStyle}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.3rem', minHeight: '20px' }}>
                    <span style={{ ...labelStyle, marginBottom: 0, lineHeight: 1, display: 'flex', alignItems: 'center' }}>Damage</span>
                    <span style={{ visibility: guide?.damageDie ? 'visible' : 'hidden', display: 'flex', alignItems: 'center' }}>
                      <InfoPopover align="right">
                        <div style={{ fontWeight: 700, fontSize: '0.72rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Damage Die</div>
                        <div>{guide?.damageDie}</div>
                      </InfoPopover>
                    </span>
                  </div>
                  <DamageSelector
                    damage={formData.damage}
                    type={formData.type}
                    tier={formData.tier}
                    onChange={v => setFormData(prev => ({ ...prev, damage: v }))}
                  />
                </div>
              </div>

              {/* Experiences */}
              <div style={sectionStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.35rem' }}>
                  <label style={{ ...labelStyle, marginBottom: 0, lineHeight: 1, display: 'flex', alignItems: 'center' }}>Experiences</label>
                  <InfoPopover>
                    {guide?.experiences?.length > 0 ? (
                      <>
                        <div style={{ fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
                          Suggested — Tier {formData.tier} (+{Math.min(formData.tier + 1, 3)})
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                          {guide.experiences.map((exp, i) => (
                            <button key={i} type="button"
                              onClick={() => {
                                const bonus = Math.min(formData.tier + 1, 3)
                                setFormData(prev => ({ ...prev, experience: [...(prev.experience || []), { name: exp, modifier: bonus }] }))
                              }}
                              style={{
                                padding: '0.2rem 0.5rem',
                                background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                                borderRadius: '4px', fontSize: '0.75rem',
                                color: 'var(--text-primary)', cursor: 'pointer',
                              }}>{exp}</button>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        Experiences represent things this adversary is particularly skilled at. Each experience has a name and a bonus modifier (+1 to +3) added to relevant rolls.
                      </div>
                    )}
                  </InfoPopover>
                  <button type="button" onClick={() => {
                    const bonus = Math.min(formData.tier + 1, 3)
                    setFormData(prev => ({ ...prev, experience: [...(prev.experience || []), { name: '', modifier: bonus }] }))
                  }} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.1rem', lineHeight: 1, padding: '0.3rem 0.4rem', minWidth: '44px', minHeight: '44px' }} title="Add experience">+</button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  {(formData.experience || []).map((exp, i) => (
                    <div
                      key={i}
                      draggable
                      onDragStart={() => { dragFromRef.current = i }}
                      onDragOver={e => e.preventDefault()}
                      onDrop={() => {
                        if (dragFromRef.current === null) return
                        setFormData(prev => ({ ...prev, experience: reorder(prev.experience, dragFromRef.current, i) }))
                        dragFromRef.current = null
                      }}
                      style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}
                    >
                      <DragHandle />
                      <input
                        type="text"
                        value={typeof exp === 'string' ? exp : (exp.name || '')}
                        onChange={e => {
                          const next = [...(formData.experience || [])]
                          next[i] = { name: e.target.value, modifier: typeof exp === 'object' ? (exp.modifier || 0) : 0 }
                          setFormData(prev => ({ ...prev, experience: next }))
                        }}
                        placeholder="Experience name"
                        style={{ ...inputStyle, flex: 1 }}
                      />
                      {/* Bonus stepper */}
                      <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                        <button type="button" onClick={() => {
                          const next = [...(formData.experience || [])]
                          const cur = typeof exp === 'object' ? (exp.modifier || 0) : 0
                          next[i] = { name: typeof exp === 'object' ? (exp.name || '') : exp, modifier: Math.max(0, cur - 1) }
                          setFormData(prev => ({ ...prev, experience: next }))
                        }} style={{ width: '44px', height: '44px', border: '1px solid var(--border)', borderRadius: '4px 0 0 4px', background: 'var(--bg-secondary)', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '0.875rem' }}>−</button>
                        <div style={{ width: '44px', height: '44px', border: '1px solid var(--border)', borderLeft: 'none', borderRight: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', color: 'var(--text-primary)', background: 'var(--bg-secondary)', fontFamily: 'monospace' }}>
                          +{typeof exp === 'object' ? (exp.modifier || 0) : 0}
                        </div>
                        <button type="button" onClick={() => {
                          const next = [...(formData.experience || [])]
                          const cur = typeof exp === 'object' ? (exp.modifier || 0) : 0
                          next[i] = { name: typeof exp === 'object' ? (exp.name || '') : exp, modifier: Math.min(6, cur + 1) }
                          setFormData(prev => ({ ...prev, experience: next }))
                        }} style={{ width: '44px', height: '44px', border: '1px solid var(--border)', borderRadius: '0 4px 4px 0', background: 'var(--bg-secondary)', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '0.875rem' }}>+</button>
                      </div>
                      <button type="button" onClick={() => {
                        const next = (formData.experience || []).filter((_, j) => j !== i)
                        setFormData(prev => ({ ...prev, experience: next }))
                      }} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1rem', padding: '0.6rem 0.5rem', flexShrink: 0, minWidth: '36px', minHeight: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Features */}
              <FeatureList
                featureType="Action" label="Actions"
                formData={formData} setFormData={setFormData} dragFromRef={dragFromRef}
                guideFeatures={guide?.features?.filter(f => f.type === 'Action')}
              />
              <FeatureList
                featureType="Passive" label="Passives"
                formData={formData} setFormData={setFormData} dragFromRef={dragFromRef}
                guideFeatures={guide?.features?.filter(f => f.type === 'Passive')}
              />
              <div style={{ paddingBottom: '1rem' }}>
                <FeatureList
                  featureType="Reaction" label="Reactions"
                  formData={formData} setFormData={setFormData} dragFromRef={dragFromRef}
                  guideFeatures={guide?.features?.filter(f => f.type === 'Reaction')}
                />
              </div>

            </div>
        </div>
    )

    const previewContent = (
      <>
        <PanelHeader label="Preview" />
        <div style={{ flex: 1, overflowY: 'auto', padding: '0.75rem' }}>
          <GameCard
            item={formItem}
            type="adversary"
            mode="expanded"
            instances={previewInstances}
            showAddRemoveButtons={false}
            onUpdate={() => {}}
          />
        </div>
      </>
    )

    // Desktop panel mode: render two sibling absolute panels inside dashboard-main,
    // exactly like RightColumn but one for the form and one for the preview.
    if (columnWidth !== null) {
      const panelStyle = {
        position: 'absolute',
        top: `${DASHBOARD_GAP}px`,
        bottom: `${DASHBOARD_GAP}px`,
        width: `${columnWidth}px`,
        zIndex: 100,
        backgroundColor: 'var(--bg-primary)',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        boxShadow: '-4px 0 12px rgba(0,0,0,0.3)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }
      return (
        <>
          <div style={{ ...panelStyle, right: `${DASHBOARD_GAP + columnWidth + DASHBOARD_GAP}px` }}>
            {ActionBar()}
            {formScrollContent}
          </div>
          <div style={{ ...panelStyle, right: `${DASHBOARD_GAP}px` }}>
            {previewContent}
          </div>
        </>
      )
    }

    if (isNarrow) {
      return (
        <div ref={containerRef} style={{ display: 'flex', height: '100%', minHeight: 0, overflow: 'hidden', padding: '8px' }}>
          <div style={{ ...cardStyle, flex: 1 }}>
            {ActionBar()}
            {activeTab === 'build'
              ? formScrollContent
              : <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>{previewContent}</div>
            }
          </div>
        </div>
      )
    }

    // Wide: two equal card panels side by side
    return (
      <div ref={containerRef} style={{ display: 'flex', flexDirection: 'row', width: '100%', height: '100%', overflow: 'hidden', gap: '12px' }}>
        <div style={cardStyle}>
          {ActionBar()}
          {formScrollContent}
        </div>
        <div style={cardStyle}>
          {previewContent}
        </div>
      </div>
    )
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // EMBEDDED LAYOUT (inside a GameCard via showCustomCreator)
  // ─────────────────────────────────────────────────────────────────────────────

  const mockAdversary = { ...formData, id: 'new-adversary', hp: 0, stress: 0, source: 'Homebrew' }

  return (
    <>
      {!hideEmbeddedButtons && (
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          marginBottom: '0.5rem',
          padding: '0.5rem',
          borderBottom: '1px solid var(--border)',
          gap: '0.5rem',
        }}>
          <button
            onClick={handleSave}
            disabled={isSaving || !formData.name.trim()}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: isSaving || !formData.name.trim() ? 'var(--gray-600)' : 'var(--purple)',
              border: 'none', color: 'white', borderRadius: '6px',
              cursor: isSaving || !formData.name.trim() ? 'not-allowed' : 'pointer',
              fontSize: '0.875rem', fontWeight: '600',
              opacity: isSaving || !formData.name.trim() ? 0.6 : 1,
            }}
          >
            {isSaving
              ? (editingAdversary ? (isStockAdversary ? 'Creating...' : 'Saving...') : 'Saving...')
              : (editingAdversary ? (isStockAdversary ? 'Save As Custom' : 'Save') : 'Save')}
          </button>
          {onCancelEdit && (
            <button
              onClick={onCancelEdit}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: 'transparent',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
                borderRadius: '6px', cursor: 'pointer',
                fontSize: '0.875rem', fontWeight: '600',
              }}
            >
              Cancel
            </button>
          )}
        </div>
      )}

      {!editingAdversary && (
        <div style={{ marginBottom: '1rem', position: 'relative' }}>
          <input
            ref={nameInputRef}
            type="text"
            value={formData.name}
            onChange={e => handleNameChange(e.target.value)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            placeholder="Adversary name"
            style={{
              width: '100%', padding: '0.75rem',
              border: '1px solid var(--border)', borderRadius: '8px',
              backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)',
              fontSize: '1rem', outline: 'none',
            }}
          />
          {showSuggestions && nameSuggestions.length > 0 && (
            <div style={{
              position: 'absolute', top: '100%', left: 0, right: 0,
              backgroundColor: 'var(--bg-primary)',
              border: '1px solid var(--border)',
              borderRadius: '0 0 8px 8px', borderTop: 'none',
              maxHeight: '200px', overflowY: 'auto',
              zIndex: 1000, boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            }}>
              {nameSuggestions.map((adv, idx) => {
                const base = adv.baseName || adv.name?.replace(/\s+\(\d+\)$/, '') || adv.name
                return (
                  <div
                    key={idx}
                    onMouseDown={e => e.preventDefault()}
                    onClick={() => handleSelectAdversary(adv)}
                    style={{
                      padding: '0.75rem', cursor: 'pointer',
                      borderBottom: idx < nameSuggestions.length - 1 ? '1px solid var(--border)' : 'none',
                    }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <div style={{ fontWeight: 600 }}>{base}</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      {adv.type} · Tier {adv.tier}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      <GameCard
        item={mockAdversary}
        type="adversary"
        mode="edit"
        nameInputRef={editingAdversary ? gameCardNameInputRef : undefined}
        autoFocusNameInput={autoFocus && editingAdversary}
        onUpdate={(id, updates) => setFormData(prev => ({ ...prev, ...updates }))}
      />
    </>
  )
})

CustomAdversaryCreator.displayName = 'CustomAdversaryCreator'
export default CustomAdversaryCreator
