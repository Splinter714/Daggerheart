/**
 * Dashboard layout constants
 * Centralized spacing and sizing values for consistent layout calculations
 */

export const DASHBOARD_GAP = 12 // Base spacing unit (12px) used for gaps, padding, and margins
export const TAB_HEIGHT = 48 // Total height of tab component including padding and borders

// Shared panel chrome — matches adversary card border thickness
export const PANEL_BORDER = '2px solid var(--border)'
export const PANEL_BORDER_RADIUS = '8px'
export const PANEL_BOX_SHADOW = '-4px 0 12px rgba(0,0,0,0.3)'

// Canonical adversary type order (descending BP cost, then user-specified tiebreaker)
export const TYPE_ORDER = ['Colossus', 'Solo', 'Bruiser', 'Leader', 'Horde', 'Standard', 'Ranged', 'Skulk', 'Support', 'Minion', 'Social']
