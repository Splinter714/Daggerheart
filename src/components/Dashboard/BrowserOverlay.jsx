import React from 'react'
import { Plus, Minus, X } from 'lucide-react'
import ContainerWithTab from './ContainerWithTab'
import Browser from '../Browser/Browser'

const BrowserOverlay = ({
  isOpen,
  columnWidth,
  gap,
  onClose,
  onCreateCustomAdversary,
  pcCount,
  updatePartySize,
  availableBattlePoints,
  spentBattlePoints,
  browserActiveTab,
  onTabChange,
  savedEncounters,
  loadEncounter,
  deleteEncounter,
  selectedCustomAdversaryId,
  onSelectCustomAdversary,
  onAddAdversaryFromBrowser,
}) => {
  if (!isOpen) return null

  return (
    <div
      style={{
        position: 'absolute',
        top: `${gap}px`,
        right: `${gap}px`,
        bottom: `${gap}px`,
        width: `${columnWidth}px`,
        zIndex: 100,
        overflow: 'visible',
      }}
    >
      <ContainerWithTab
        tabContent={
          <>
            <button
              onClick={onCreateCustomAdversary}
              style={{
                padding: '0.375rem 0.75rem',
                backgroundColor: 'var(--purple)',
                border: 'none',
                color: 'white',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'opacity 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.9'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1'
              }}
            >
              <Plus size={16} />
              <span>Add Custom</span>
            </button>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <span style={{ color: 'var(--text-primary)', fontSize: '0.875rem', fontWeight: '500' }}>
                Party Size:
              </span>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  border: '1px solid var(--border)',
                  borderRadius: '4px',
                  padding: '0.125rem 0.25rem',
                  backgroundColor: 'var(--bg-secondary)',
                }}
              >
                <button
                  onClick={() => updatePartySize(Math.max(1, pcCount - 1))}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: '18px',
                    height: '18px',
                    fontSize: '0.7rem',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'var(--purple)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--text-primary)'
                  }}
                >
                  <Minus size={12} />
                </button>
                <span
                  style={{
                    color: 'var(--text-primary)',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    minWidth: '1.5rem',
                    textAlign: 'center',
                  }}
                >
                  {pcCount}
                </span>
                <button
                  onClick={() => updatePartySize(pcCount + 1)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: '18px',
                    height: '18px',
                    fontSize: '0.7rem',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'var(--purple)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--text-primary)'
                  }}
                >
                  <Plus size={12} />
                </button>
              </div>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <span style={{ color: 'var(--text-primary)', fontSize: '0.875rem', fontWeight: '500' }}>
                Balance:
              </span>
              <span
                style={{
                  color:
                    spentBattlePoints > availableBattlePoints
                      ? 'var(--danger)'
                      : spentBattlePoints === availableBattlePoints
                      ? 'var(--purple)'
                      : 'var(--success)',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                }}
              >
                {spentBattlePoints > availableBattlePoints
                  ? `+${spentBattlePoints - availableBattlePoints}`
                  : availableBattlePoints - spentBattlePoints === 0
                  ? '0'
                  : `-${availableBattlePoints - spentBattlePoints}`}
              </span>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  padding: '0.25rem',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'color 0.2s ease',
                  flexShrink: 0,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
                title="Close browser"
              >
                <X size={16} />
              </button>
            )}
          </>
        }
        showTab={true}
        tabBackgroundColor="var(--bg-primary)"
        tabBorderColor="var(--border)"
        tabJustifyContent="space-between"
        containerBackgroundColor="var(--bg-primary)"
        containerBorderColor="var(--border)"
        containerBorderRadius="8px"
        containerBoxShadow="-4px 0 12px rgba(0, 0, 0, 0.3)"
        containerOverflow="hidden"
        reserveTabSpace={true}
        containerStyle={{
          height: '100%',
        }}
      >
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            minWidth: 0,
          }}
        >
          <Browser
            type="adversary"
            onAddItem={onAddAdversaryFromBrowser}
            showContainer={false}
            activeTab={browserActiveTab}
            onTabChange={onTabChange}
            pcCount={pcCount}
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
        </div>
      </ContainerWithTab>
    </div>
  )
}

export default BrowserOverlay

