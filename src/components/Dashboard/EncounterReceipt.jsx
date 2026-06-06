import React from 'react'
import { Plus, Minus, X } from 'lucide-react'
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

const rowBpCost = (item, quantity, pcCount) => {
  const cost = BATTLE_POINT_COSTS[item.type] || 2
  if (item.type === 'Minion') return Math.ceil(quantity / pcCount) * cost
  return cost * quantity
}

// encounterItems: [{ type: 'adversary', item: {...}, quantity: number }]
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
}) => (
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

      {/* Adversary Rows */}
      {encounterItems.map((encounterItem) => {
        if (encounterItem.type !== 'adversary') return null
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

      {/* Budget / Remaining Rows */}
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
            fontWeight: 600,
            fontSize: '0.9rem',
          }}>
            {spentBattlePoints > availableBattlePoints
              ? `${spentBattlePoints - availableBattlePoints} BP`
              : availableBattlePoints - spentBattlePoints === 0
              ? '0 BP'
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

export default EncounterReceipt
