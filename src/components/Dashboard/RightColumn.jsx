import React from 'react'
import { X, Plus, Minus } from 'lucide-react'
import Browser from '../Browser/Browser'
import { DASHBOARD_GAP } from './constants'
import logoImage from '../../assets/daggerheart-logo.svg'

// Shared header bar used by info and receipt modes
const ColumnHeader = ({ title, onClose }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
    <span style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{title}</span>
    <button
      type="button"
      onClick={onClose}
      style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', borderRadius: '4px' }}
    >
      <X size={16} />
    </button>
  </div>
)

const InfoContent = () => (
  <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem' }}>
    <img
      src={logoImage}
      alt="Daggerheart Community Content Logo"
      style={{ width: '100%', maxWidth: '220px', height: 'auto', display: 'block', margin: '0 auto 1.25rem' }}
      onError={(e) => { e.target.style.display = 'none' }}
    />
    <div style={{ fontSize: '0.85rem', lineHeight: 1.6, color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
      <p style={{ marginTop: 0 }}>
        This product includes materials from the Daggerheart System Reference Document 1.0, © Critical Role, LLC, under the terms of the Darrington Press Community Gaming (DPCGL) License.
      </p>
      <p>
        More information can be found at{' '}
        <a href="https://www.daggerheart.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--purple)', textDecoration: 'underline' }}>
          daggerheart.com
        </a>
      </p>
      <p style={{ marginBottom: 0 }}>
        <em>This project is unofficial and not endorsed by Darrington Press or Critical Role.</em>
      </p>
    </div>
    <div style={{ border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
      <button
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.8rem 1rem', color: 'var(--text-primary)', border: 'none', borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)', width: '100%', textAlign: 'left', cursor: 'pointer', fontSize: '0.85rem' }}
        onClick={() => window.open('https://github.com/Splinter714/Daggerheart', '_blank')}
      >
        <span>View on GitHub</span>
        <span>→</span>
      </button>
      <div style={{ padding: '0.8rem 1rem', color: 'var(--text-secondary)', background: 'var(--bg-secondary)', fontSize: '0.85rem', textAlign: 'center' }}>
        Version {typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : 'dev'}
      </div>
    </div>
  </div>
)

const ReceiptContent = ({ pcCount, updatePartySize, availableBattlePoints, spentBattlePoints }) => {
  const remaining = availableBattlePoints - spentBattlePoints
  const balanceColor = remaining < 0 ? 'var(--danger)' : remaining === 0 ? 'var(--purple)' : 'var(--success)'
  const balanceLabel = remaining < 0 ? `Over by ${-remaining}` : remaining === 0 ? 'Balanced' : `${remaining} remaining`

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <span style={{ color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: 500 }}>Party Size</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button type="button" onClick={() => updatePartySize(Math.max(1, pcCount - 1))}
            style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-primary)', cursor: 'pointer' }}>
            <Minus size={14} />
          </button>
          <span style={{ color: 'var(--text-primary)', fontSize: '1rem', fontWeight: 600, minWidth: '1.5rem', textAlign: 'center' }}>{pcCount}</span>
          <button type="button" onClick={() => updatePartySize(pcCount + 1)}
            style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-primary)', cursor: 'pointer' }}>
            <Plus size={14} />
          </button>
        </div>
      </div>

      <div style={{ border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
        {[
          { label: 'Available BP', value: availableBattlePoints, color: 'var(--text-primary)' },
          { label: 'Spent BP',     value: spentBattlePoints,    color: 'var(--text-primary)' },
          { label: 'Balance',      value: balanceLabel,         color: balanceColor },
        ].map(({ label, value, color }, i, arr) => (
          <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.65rem 1rem', backgroundColor: 'var(--bg-secondary)', borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{label}</span>
            <span style={{ color, fontWeight: 600, fontSize: '0.85rem' }}>{value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// mode: 'browser' | 'info' | 'receipt'
const RightColumn = ({
  mode,
  columnWidth,
  onClose,
  browserActiveTab,
  onTabChange,
  savedEncounters,
  loadEncounter,
  deleteEncounter,
  selectedCustomAdversaryId,
  onSelectCustomAdversary,
  onAddAdversaryFromBrowser,
  pcCount,
  updatePartySize,
  availableBattlePoints,
  spentBattlePoints,
}) => (
  <div style={{
    position: 'absolute',
    top: `${DASHBOARD_GAP}px`,
    right: `${DASHBOARD_GAP}px`,
    bottom: `${DASHBOARD_GAP}px`,
    width: `${columnWidth}px`,
    zIndex: 100,
    backgroundColor: 'var(--bg-primary)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    boxShadow: '-4px 0 12px rgba(0,0,0,0.3)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  }}>
    {mode === 'browser' && (
      <Browser
        type="adversary"
        onAddItem={onAddAdversaryFromBrowser}
        showContainer={false}
        activeTab={browserActiveTab}
        onTabChange={onTabChange}
        savedEncounters={savedEncounters}
        onLoadEncounter={loadEncounter}
        onDeleteEncounter={deleteEncounter}
        selectedCustomAdversaryId={selectedCustomAdversaryId}
        onSelectCustomAdversary={onSelectCustomAdversary}
        autoFocus={true}
        hideImportExport={true}
        onClose={onClose}
        searchPlaceholder="Search adversaries"
      />
    )}

    {mode === 'info' && (
      <>
        <ColumnHeader title="About" onClose={onClose} />
        <InfoContent />
      </>
    )}

    {mode === 'receipt' && (
      <>
        <ColumnHeader title="Encounter Info" onClose={onClose} />
        <ReceiptContent
          pcCount={pcCount}
          updatePartySize={updatePartySize}
          availableBattlePoints={availableBattlePoints}
          spentBattlePoints={spentBattlePoints}
        />
      </>
    )}
  </div>
)

export default RightColumn
