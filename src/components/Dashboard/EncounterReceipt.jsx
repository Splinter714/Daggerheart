import React, { useState } from 'react'
import { Plus, Minus, X, ChevronDown, ChevronUp, ArrowUp, ArrowDown } from 'lucide-react'
import { BATTLE_POINT_ADJUSTMENTS, BATTLE_POINT_COSTS } from './BattlePointsCalculator'

const btnStyle = (danger) => ({
  background: danger ? 'var(--danger)' : 'var(--bg-secondary)',
  border: danger ? 'none' : '1px solid var(--border)',
  color: danger ? 'white' : 'var(--text-primary)',
  borderRadius: '3px',
  padding: '0',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: '18px',
  height: '18px',
  fontSize: '0.7rem',
  position: 'absolute',
  top: '50%',
  transform: 'translateY(-50%)',
})

const itemRowStyle = {
  display: 'flex',
  alignItems: 'center',
  padding: '0.25rem 0',
  borderBottom: '1px solid var(--border)',
  flexShrink: 0,
}

const MANUAL_ADJUSTMENTS = [
  { key: 'lessDifficult',   label: 'Less Difficult',   value: BATTLE_POINT_ADJUSTMENTS.lessDifficult   },
  { key: 'increasedDamage', label: 'Increased Damage',  value: BATTLE_POINT_ADJUSTMENTS.increasedDamage },
  { key: 'moreDangerous',   label: 'More Dangerous',    value: BATTLE_POINT_ADJUSTMENTS.moreDangerous   },
]

const SORT_OPTIONS = [
  { value: 'name',       label: 'Name'      },
  { value: 'tier',       label: 'Tier'      },
  { value: 'type',       label: 'Type'      },
  { value: 'hp',         label: 'HP'        },
  { value: 'difficulty', label: 'Difficulty'},
  { value: 'atk',        label: 'Attack'    },
  { value: 'threshold',  label: 'Threshold' },
]

const GROUP_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: 'type', label: 'Type' },
  { value: 'tier', label: 'Tier' },
]

const rowBpCost = (item, quantity, pcCount) => {
  const cost = BATTLE_POINT_COSTS[item.type] || 2
  if (item.type === 'Minion') return Math.ceil(quantity / pcCount) * cost
  return cost * quantity
}

const sortItems = (items, sortBy, sortDir) => {
  if (!sortBy || sortBy === 'none') return items
  return [...items].sort((a, b) => {
    const ai = a.item, bi = b.item
    let va, vb
    switch (sortBy) {
      case 'name':      va = ai.name || ''; vb = bi.name || ''; break
      case 'tier':      va = ai.tier || 0;  vb = bi.tier || 0;  break
      case 'type':      va = ai.type || ''; vb = bi.type || ''; break
      case 'hp':        va = ai.hpMax || 0; vb = bi.hpMax || 0; break
      case 'difficulty':va = ai.difficulty || 0; vb = bi.difficulty || 0; break
      case 'atk':       va = ai.atk || 0;   vb = bi.atk || 0;   break
      case 'threshold': va = ai.thresholds?.major || 0; vb = bi.thresholds?.major || 0; break
      default: return 0
    }
    if (typeof va === 'string') return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va)
    return sortDir === 'asc' ? va - vb : vb - va
  })
}

const groupItems = (items, groupBy) => {
  if (!groupBy || groupBy === 'none') return [{ key: null, items }]
  const map = {}
  const order = []
  items.forEach(item => {
    const key = String(groupBy === 'type' ? item.item.type : item.item.tier) || '—'
    if (!map[key]) { map[key] = []; order.push(key) }
    map[key].push(item)
  })
  return order.map(key => ({ key, items: map[key] }))
}

const sectionLabel = {
  fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.08em',
  textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '0.35rem',
}

const optRow = (selected) => ({
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  gap: '0.4rem', padding: '0.2rem 0.4rem', borderRadius: '5px', cursor: 'pointer',
  background: selected ? 'color-mix(in srgb, var(--purple) 12%, transparent)' : 'transparent',
  color: selected ? 'var(--purple)' : 'var(--text-primary)',
  fontSize: '0.8rem', userSelect: 'none',
})

const dot = (selected) => ({
  width: 12, height: 12, borderRadius: '50%', flexShrink: 0,
  border: `2px solid ${selected ? 'var(--purple)' : 'var(--border)'}`,
  backgroundColor: selected ? 'var(--purple)' : 'transparent',
  transition: 'background 0.1s, border-color 0.1s',
})

const EncounterReceipt = ({
  encounterItems,
  pcCount,
  onChangePcCount,
  onAdd,
  onRemove,
  bpAdjustments = {},
  onChangeBpAdjustments,
  availableBattlePoints,
  spentBattlePoints,
  sortBy = 'name',
  sortDir = 'asc',
  groupBy = 'none',
  onSortBy,
  onGroupBy,
}) => {
  const [sortOpen, setSortOpen] = useState(false)

  const adversaryItems = encounterItems.filter(i => i.type === 'adversary')
  const sorted = sortItems(adversaryItems, sortBy, sortDir)
  const groups = groupItems(sorted, groupBy)

  const currentSortLabel = SORT_OPTIONS.find(o => o.value === sortBy)?.label || 'Name'

  return (
    <div className="receipt-content" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', overflowY: 'auto', marginBottom: '0.75rem' }}>

        {/* Party Size Row */}
        <div className="receipt-item" style={itemRowStyle}>
          <div className="receipt-controls" style={{ width: '60px', textAlign: 'center', position: 'relative' }}>
            <button onClick={() => onChangePcCount(Math.max(1, pcCount - 1))} style={{ ...btnStyle(false), left: '0' }}>
              <Minus size={10} />
            </button>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{pcCount}</span>
            <button onClick={() => onChangePcCount(pcCount + 1)} style={{ ...btnStyle(false), right: '0' }}>
              <Plus size={10} />
            </button>
          </div>
          <div style={{ flex: 1, marginLeft: '1rem' }}>
            <span style={{ color: 'var(--text-primary)', fontSize: '0.9rem' }}>Party Size</span>
          </div>
        </div>

        {/* Sort & Group Controls */}
        <div style={{ borderBottom: '1px solid var(--border)', marginBottom: '0.1rem' }}>
          <button
            type="button"
            onClick={() => setSortOpen(v => !v)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: 'transparent', border: 'none', cursor: 'pointer',
              padding: '0.35rem 0', color: 'var(--text-secondary)',
            }}
          >
            <span style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              Sort & Group
              <span style={{ color: 'var(--text-secondary)', fontWeight: 400, fontSize: '0.72rem' }}>
                {currentSortLabel} {sortDir === 'asc' ? '↑' : '↓'}
                {groupBy !== 'none' && ` · ${GROUP_OPTIONS.find(o => o.value === groupBy)?.label}`}
              </span>
            </span>
            {sortOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>

          {sortOpen && (
            <div style={{ paddingBottom: '0.6rem', display: 'flex', gap: '1rem' }}>
              {/* Sort */}
              <div style={{ flex: 1 }}>
                <div style={sectionLabel}>Sort by</div>
                {SORT_OPTIONS.map(({ value, label }) => {
                  const sel = sortBy === value
                  return (
                    <div key={value} style={optRow(sel)} onClick={() => onSortBy(value)}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <div style={dot(sel)} />{label}
                      </div>
                      {sel && (sortDir === 'asc'
                        ? <ArrowUp size={11} strokeWidth={2.5} />
                        : <ArrowDown size={11} strokeWidth={2.5} />)}
                    </div>
                  )
                })}
              </div>
              {/* Group */}
              <div style={{ minWidth: '68px' }}>
                <div style={sectionLabel}>Group</div>
                {GROUP_OPTIONS.map(({ value, label }) => (
                  <div key={value} style={optRow(groupBy === value)} onClick={() => onGroupBy(value)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <div style={dot(groupBy === value)} />{label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Adversary Rows (sorted + grouped) */}
        {groups.map(({ key, items }) => (
          <React.Fragment key={key ?? '__all'}>
            {key !== null && (
              <div style={{ padding: '0.3rem 0 0.1rem', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                {groupBy === 'tier' ? `Tier ${key}` : key}
              </div>
            )}
            {items.map((encounterItem) => {
              const isZero = encounterItem.quantity === 0
              return (
                <div key={`${encounterItem.item.id}-${encounterItem.type}`} className="receipt-item" style={itemRowStyle}>
                  <div className="receipt-controls" style={{ width: '60px', textAlign: 'center', position: 'relative' }}>
                    <button onClick={() => onRemove(encounterItem.item.id, encounterItem.type)} style={{ ...btnStyle(isZero), left: '0' }}>
                      {isZero ? <X size={10} /> : <Minus size={10} />}
                    </button>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{encounterItem.quantity}</span>
                    <button onClick={() => onAdd(encounterItem.item, encounterItem.type)} style={{ ...btnStyle(false), right: '0' }}>
                      <Plus size={10} />
                    </button>
                  </div>
                  <div style={{ flex: 1, marginLeft: '1rem' }}>
                    <div style={{ color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                      {encounterItem.item.name || encounterItem.item.baseName}
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>{encounterItem.item.type}</div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                      {rowBpCost(encounterItem.item, encounterItem.quantity, pcCount)} BP
                    </span>
                  </div>
                </div>
              )
            })}
          </React.Fragment>
        ))}

        {/* Budget / Remaining */}
        <div className="receipt-item" style={itemRowStyle}>
          <div style={{ flex: 1 }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Budget</span>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{availableBattlePoints} BP</span>
          </div>
        </div>
        <div className="receipt-item" style={{ ...itemRowStyle, borderBottom: 'none' }}>
          <div style={{ flex: 1 }}>
            <span style={{ color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: 600 }}>
              {spentBattlePoints > availableBattlePoints ? 'Over Budget' : 'Remaining'}
            </span>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <span style={{
              color: spentBattlePoints > availableBattlePoints ? 'var(--danger)'
                   : spentBattlePoints === availableBattlePoints ? 'var(--purple)'
                   : 'var(--success)',
              fontWeight: 600, fontSize: '0.9rem',
            }}>
              {spentBattlePoints > availableBattlePoints
                ? `${spentBattlePoints - availableBattlePoints} BP`
                : `${availableBattlePoints - spentBattlePoints} BP`}
            </span>
          </div>
        </div>

        {/* Manual BP Adjustments */}
        {onChangeBpAdjustments && (
          <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border)', paddingTop: '0.75rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Adjustments
            </div>
            {MANUAL_ADJUSTMENTS.map(({ key, label, value }) => (
              <label key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.2rem 0', cursor: 'pointer', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', color: bpAdjustments[key] ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{label}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
                  <span style={{ fontSize: '0.75rem', color: value > 0 ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>
                    {value > 0 ? `+${value}` : value} BP
                  </span>
                  <input
                    type="checkbox"
                    checked={!!bpAdjustments[key]}
                    onChange={(e) => onChangeBpAdjustments(prev => ({ ...prev, [key]: e.target.checked }))}
                    style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: 'var(--purple)' }}
                  />
                </div>
              </label>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}

export default EncounterReceipt
