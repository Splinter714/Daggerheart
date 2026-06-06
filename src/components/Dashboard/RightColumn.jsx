import React from 'react'
import Browser from '../Browser/Browser'
import EncounterReceipt from './EncounterReceipt'
import { DASHBOARD_GAP } from './constants'
import logoImage from '../../assets/daggerheart-logo.svg'

const ColumnHeader = ({ title }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
    <span style={{ fontWeight: 600, fontSize: '1.05rem', color: 'var(--text-primary)', letterSpacing: '0.01em' }}>{title}</span>
  </div>
)

const InfoContent = () => (
  <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem' }}>
    <img src={logoImage} alt="Daggerheart Community Content Logo"
      style={{ width: '100%', maxWidth: '220px', height: 'auto', display: 'block', margin: '0 auto 1.25rem' }}
      onError={(e) => { e.target.style.display = 'none' }} />
    <div style={{ fontSize: '0.85rem', lineHeight: 1.6, color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
      <p style={{ marginTop: 0 }}>This product includes materials from the Daggerheart System Reference Document 1.0, © Critical Role, LLC, under the terms of the Darrington Press Community Gaming (DPCGL) License.</p>
      <p>More information can be found at{' '}<a href="https://www.daggerheart.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--purple)', textDecoration: 'underline' }}>daggerheart.com</a></p>
      <p style={{ marginBottom: 0 }}><em>This project is unofficial and not endorsed by Darrington Press or Critical Role.</em></p>
    </div>
    <div style={{ border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
      <button style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.8rem 1rem', color: 'var(--text-primary)', border: 'none', borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)', width: '100%', textAlign: 'left', cursor: 'pointer', fontSize: '0.85rem' }}
        onClick={() => window.open('https://github.com/Splinter714/Daggerheart', '_blank')}>
        <span>View on GitHub</span><span>→</span>
      </button>
      <div style={{ padding: '0.8rem 1rem', color: 'var(--text-secondary)', background: 'var(--bg-secondary)', fontSize: '0.85rem', textAlign: 'center' }}>
        Version {typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : 'dev'}
      </div>
    </div>
  </div>
)

// Convert live adversaryGroups into the encounterItems format EncounterReceipt expects
const groupsToEncounterItems = (adversaryGroups, pcCount) =>
  adversaryGroups.map((group) => {
    const isMinion = group.template?.type === 'Minion'
    const qty = isMinion ? Math.round(group.instances.length / pcCount) : group.instances.length
    return { type: 'adversary', item: { ...group.template, id: group.template?.id || group.baseName, name: group.baseName }, quantity: qty }
  })

// mode: 'browser' | 'info' | 'receipt'
const RightColumn = ({
  mode, columnWidth, onClose,
  browserActiveTab, onTabChange,
  selectedCustomAdversaryId, onSelectCustomAdversary,
  onAddAdversaryFromBrowser,
  pcCount, updatePartySize,
  adversaryGroups, createAdversary, createAdversariesBulk, deleteAdversary,
  bpAdjustments, onChangeBpAdjustments,
  availableBattlePoints, spentBattlePoints,
}) => {
  const encounterItems = groupsToEncounterItems(adversaryGroups, pcCount)

  const handleAdd = (item) => {
    const group = adversaryGroups.find(g => g.template?.id === item.id || g.baseName === item.baseName)
    const isMinion = item.type === 'Minion'
    if (isMinion) {
      createAdversariesBulk(Array(pcCount).fill(null).map(() => ({ ...item })))
    } else {
      createAdversary({ ...item })
    }
  }

  const handleRemove = (itemId) => {
    const group = adversaryGroups.find(g => g.template?.id === itemId || g.baseName === itemId)
    if (!group) return
    const isMinion = group.template?.type === 'Minion'
    const removeCount = isMinion ? pcCount : 1
    const sorted = [...group.instances].sort((a, b) => (b.duplicateNumber || 1) - (a.duplicateNumber || 1))
    sorted.slice(0, removeCount).forEach(inst => deleteAdversary(inst.id))
  }

  return (
    <div style={{
      position: 'absolute',
      top: `${DASHBOARD_GAP}px`, right: `${DASHBOARD_GAP}px`, bottom: `${DASHBOARD_GAP}px`,
      width: `${columnWidth}px`,
      zIndex: 100,
      backgroundColor: 'var(--bg-primary)',
      border: '1px solid var(--border)',
      borderRadius: '8px',
      boxShadow: '-4px 0 12px rgba(0,0,0,0.3)',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>
      {mode === 'browser' && (
        <>
          <ColumnHeader title="Adversaries" />
          <Browser
            type="adversary"
            onAddItem={onAddAdversaryFromBrowser}
            showContainer={false}
            activeTab={browserActiveTab}
            onTabChange={onTabChange}
            selectedCustomAdversaryId={selectedCustomAdversaryId}
            onSelectCustomAdversary={onSelectCustomAdversary}
            autoFocus={true}
            hideImportExport={true}
            onClose={null}
            searchPlaceholder="Search adversaries"
          />
        </>
      )}

      {mode === 'info' && <InfoContent />}

      {mode === 'receipt' && (
        <>
          <ColumnHeader title="Encounter" />
          <EncounterReceipt
            encounterItems={encounterItems}
            pcCount={pcCount}
            onChangePcCount={updatePartySize}
            onAdd={handleAdd}
            onRemove={handleRemove}
            bpAdjustments={bpAdjustments}
            onChangeBpAdjustments={onChangeBpAdjustments}
            availableBattlePoints={availableBattlePoints}
            spentBattlePoints={spentBattlePoints}
          />
        </>
      )}
    </div>
  )
}

export default RightColumn
