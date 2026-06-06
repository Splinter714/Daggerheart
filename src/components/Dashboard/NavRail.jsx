import React from 'react'
import { Library, Wand2, Info, ClipboardList } from 'lucide-react'

const RAIL_SIZE = 52

const NAV_ITEMS = [
  { id: 'browse',   Icon: Library,       label: 'Add adversaries'   },
  { id: 'receipt',  Icon: ClipboardList, label: 'Encounter info'    },
  { id: 'create',   Icon: Wand2,         label: 'Create custom'     },
  { id: 'info',     Icon: Info,          label: 'App info'          },
]

const NavRail = ({ placement = 'right', activeId, onAction }) => {
  const isRight = placement === 'right'

  const railStyle = isRight
    ? {
        position: 'fixed',
        top: 0, right: 0, bottom: 0,
        width: `${RAIL_SIZE}px`,
        flexDirection: 'column',
        borderLeft: '1px solid var(--border)',
        paddingTop: '0.5rem',
        paddingBottom: 'env(safe-area-inset-bottom, 0.5rem)',
      }
    : {
        position: 'fixed',
        left: 0, right: 0, bottom: 0,
        height: `${RAIL_SIZE}px`,
        flexDirection: 'row',
        borderTop: '1px solid var(--border)',
        paddingLeft: 'env(safe-area-inset-left, 0)',
        paddingRight: 'env(safe-area-inset-right, 0)',
        paddingBottom: 'env(safe-area-inset-bottom, 0)',
      }

  return (
    <div style={{
      ...railStyle,
      display: 'flex',
      alignItems: 'center',
      justifyContent: isRight ? 'flex-start' : 'space-around',
      gap: isRight ? '0.25rem' : 0,
      backgroundColor: 'var(--bg-primary)',
      zIndex: 100,
    }}>
      {NAV_ITEMS.map(({ id, Icon, label }) => {
        const active = activeId === id
        return (
          <button
            key={id}
            type="button"
            title={label}
            onClick={() => onAction(id)}
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
            }}
            onMouseEnter={e => { if (!active) e.currentTarget.style.color = 'var(--text-primary)' }}
            onMouseLeave={e => { if (!active) e.currentTarget.style.color = active ? 'var(--purple)' : 'var(--text-secondary)' }}
          >
            <Icon size={22} strokeWidth={1.6} />
          </button>
        )
      })}
    </div>
  )
}

export default NavRail
export { RAIL_SIZE }
