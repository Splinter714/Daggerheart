import React from 'react'
import { Library, Wand2, Info, ClipboardList, ArrowUpDown } from 'lucide-react'

const RAIL_SIZE = 52

const NAV_ITEMS = [
  { id: 'browse',   Icon: Library,       label: 'Add adversaries'   },
  { id: 'receipt',  Icon: ClipboardList, label: 'Encounter info'    },
  { id: 'create',   Icon: Wand2,         label: 'Create custom'     },
  { id: 'info',     Icon: Info,          label: 'App info'          },
]

const isPWA = window.matchMedia('(display-mode: standalone)').matches ||
              window.navigator.standalone === true ||
              document.referrer.includes('android-app://')

const NavRail = ({ placement = 'right', activeId, onAction, sortActive, sortButtonRef, onSortToggle }) => {
  const isRight = placement === 'right'

  const renderButton = ({ id, Icon, label, active, onClick, btnRef }) => (
    <button
      key={id}
      ref={btnRef}
      type="button"
      title={label}
      onClick={onClick}
      style={{
        width: isRight ? `${RAIL_SIZE - 8}px` : '52px',
        height: isRight ? '44px' : `${RAIL_SIZE - 8}px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: active ? 'color-mix(in srgb, var(--purple) 15%, transparent)' : 'transparent',
        border: 'none',
        borderRadius: '8px',
        color: active ? 'var(--purple)' : 'var(--text-secondary)',
        cursor: 'pointer',
        flexShrink: 0,
        transition: 'color 0.15s, background 0.15s',
        position: 'relative',
      }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.color = 'var(--text-primary)' }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.color = active ? 'var(--purple)' : 'var(--text-secondary)' }}
    >
      <Icon size={22} strokeWidth={1.6} />
    </button>
  )

  const buttons = (
    <>
      {NAV_ITEMS.map(({ id, Icon, label }) => {
        const active = activeId === id
        return renderButton({ id, Icon, label, active, onClick: () => onAction(id) })
      })}
      {renderButton({
        id: 'sort',
        Icon: ArrowUpDown,
        label: 'Sort & group',
        active: sortActive,
        onClick: onSortToggle,
        btnRef: sortButtonRef,
      })}
    </>
  )

  if (isRight) {
    return (
      <div style={{
        position: 'fixed',
        top: 0, right: 0, bottom: 0,
        width: `${RAIL_SIZE}px`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        gap: '0.25rem',
        borderLeft: '1px solid var(--border)',
        paddingTop: '0.5rem',
        paddingBottom: 'env(safe-area-inset-bottom, 0.5rem)',
        backgroundColor: 'var(--bg-primary)',
        zIndex: 100,
      }}>
        {buttons}
      </div>
    )
  }

  // Bottom placement: outer wrapper auto-sizes to children so border-box
  // doesn't compress the button row; spacer div handles PWA home-indicator gap.
  return (
    <div style={{
      position: 'fixed',
      left: 0, right: 0, bottom: 0,
      display: 'flex',
      flexDirection: 'column',
      borderTop: '1px solid var(--border)',
      backgroundColor: 'var(--bg-primary)',
      zIndex: 100,
    }}>
      <div style={{
        height: `${RAIL_SIZE}px`,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        paddingLeft: 'env(safe-area-inset-left, 0)',
        paddingRight: 'env(safe-area-inset-right, 0)',
      }}>
        {buttons}
      </div>
      {isPWA && <div aria-hidden="true" style={{ height: '2rem', flexShrink: 0 }} />}
    </div>
  )
}

export default NavRail
export { RAIL_SIZE, isPWA }
