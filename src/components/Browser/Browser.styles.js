// Static style objects for the Browser tree. Extracted verbatim from Browser.jsx
// in the Phase 4 split — behavior-identical, no logic here.
export const styles = {
  browserWrapper: {
    display: 'flex',
    flexDirection: 'column',
    background: 'var(--bg-primary)',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border)',
    overflow: 'hidden',
    height: '100%',
    width: '100%', // Ensure wrapper uses full width
    position: 'relative' // Ensure proper positioning context
  },
  browserWrapperNoContainer: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden', // Clip header to container's rounded border
    height: '100%',
    width: '100%',
    position: 'relative'
  },
  browserContent: {
    flex: 1,
    overflowY: 'auto',
    overflowX: 'visible',
    padding: 0,
    width: '100%', // Ensure content uses full width
    scrollbarWidth: 'none', // Firefox
    msOverflowStyle: 'none', // IE/Edge
    borderRadius: '0 0 8px 8px' // Clip content to bottom rounded corners, matching GameCard
  },
  tableHeaderContainer: {
    flexShrink: 0, // Prevent header from shrinking
    position: 'sticky',
    top: 0,
    zIndex: 15,
    backgroundColor: 'var(--bg-secondary)'
  },
  browserTable: {
    width: '100%',
    minWidth: '100%', // Ensure it uses full width
    borderCollapse: 'collapse',
    tableLayout: 'fixed', // Fixed layout for precise control
    background: 'var(--bg-primary)',
    margin: 0
  },
  browserHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px',
    borderBottom: '1px solid var(--border)',
    backgroundColor: 'var(--bg-primary)',
    flexShrink: 0,
    position: 'sticky',
    top: 0,
    zIndex: 20
  },
  browserTitle: {
    margin: 0,
    color: 'var(--text-primary)',
    fontSize: '18px',
    fontWeight: '600'
  },
  closeButton: {
    background: 'none',
    border: 'none',
    color: 'var(--text-primary)',
    fontSize: '24px',
    cursor: 'pointer',
    padding: '4px 8px',
    borderRadius: '4px',
    transition: 'background-color 0.2s'
  },
  searchInput: {
    flex: 1,
    padding: '8px 12px',
    border: '1px solid var(--border)',
    borderRadius: '4px',
    backgroundColor: 'var(--bg-primary)',
    color: 'var(--text-primary)',
    fontSize: '16px',
    marginRight: '12px',
    transition: 'all 0.2s ease'
  },
  partyControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexShrink: 0
  },
  searchInputFocus: {
    outline: 'none',
    borderColor: 'var(--purple)',
    boxShadow: '0 0 0 3px rgba(139, 92, 246, 0.1)'
  },
  tableHeader: {
    background: 'var(--bg-primary)',
    borderBottom: '1px solid var(--border)',
    boxShadow: '0 1px 0 var(--border)',
    position: 'sticky',
    top: '0',
    zIndex: 10
  },
  tableHeaderCell: {
    backgroundColor: 'var(--bg-primary)',
    fontWeight: '700',
    borderBottom: '1px solid var(--border)',
    cursor: 'pointer',
    userSelect: 'none',
    minWidth: '100px',
    whiteSpace: 'nowrap',
    padding: '4px 4px', // Reduced padding to match archived version
    color: 'var(--text-primary)',
    textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
    boxShadow: '0 1px 0 var(--border)',
    transition: 'background-color 0.2s',
    position: 'sticky',
    top: '0',
    zIndex: 10
  },
  tableHeaderCellHover: {
    backgroundColor: 'var(--bg-hover)'
  },
  sortIndicator: {
    fontSize: '12px',
    color: 'var(--text-secondary)'
  },
  tableBody: {
    flex: 1,
    overflowY: 'auto',
    padding: '8px',
    backgroundColor: 'var(--bg-primary)'
  },
  row: {
    height: 'auto',
    minHeight: '35px',
    borderBottom: '1px solid var(--border)',
    transition: 'background-color 0.2s ease',
    cursor: 'pointer',
    backgroundColor: 'var(--bg-primary)'
  },
  rowHover: {
    backgroundColor: 'var(--bg-secondary)'
  },
  rowFocused: {
    backgroundColor: 'var(--bg-secondary)',
    boxShadow: 'inset 0 0 0 2px var(--purple)'
  },
  expandedRow: {
    backgroundColor: 'var(--bg-secondary)'
  },
  rowCell: {
    padding: '4px 4px', // Reduced padding to match archived version
    verticalAlign: 'middle',
    color: 'var(--text-primary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    borderBottom: '1px solid var(--border)'
  },
  rowCellName: {
    fontWeight: '500',
    minWidth: '150px'
  },
  rowCellCenter: {
    textAlign: 'center',
    justifyContent: 'center',
    minWidth: '80px'
  },
  rowActions: {
    width: '80px',
    textAlign: 'center',
    padding: '4px 8px',
    borderBottom: '1px solid var(--border)'
  },
  addButton: {
    width: '2rem', // Increased from 1.5rem to 2rem (32px) for better tap target
    height: '2rem', // Increased from 1.5rem to 2rem (32px) for better tap target
    border: '1px solid var(--purple)',
    borderRadius: 'var(--radius-sm)',
    background: 'var(--purple)',
    color: 'white',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px', // Increased from 14px to 16px
    fontWeight: '500'
  },
  expandedContent: {
    padding: '0',
    backgroundColor: 'var(--bg-secondary)',
    borderBottom: '1px solid var(--border)'
  },
  // Column-specific widths (matching archived version)
  columnName: {
    width: 'auto', // Name column gets remaining space
    minWidth: '0',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    paddingLeft: '8px', // Increased left padding for name column
    textAlign: 'left'
  },
  columnTier: {
    width: '80px', // Tier column - increased width to accommodate filter button
    textAlign: 'center',
    overflow: 'visible', // Don't hide text
    textOverflow: 'unset' // No ellipsis for text
  },
  columnType: {
    width: '100px', // Type column - fit "Type" header
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    textAlign: 'center' // Center the type content
  },
  columnDifficulty: {
    width: '40px', // Diff column - minimal width for "Diff" header
    textAlign: 'center',
    overflow: 'visible', // Don't hide text
    textOverflow: 'unset' // No ellipsis for text
  },
  columnAction: {
    width: '32px', // Add button column - increased to accommodate 32px button
    minWidth: '24px',
    maxWidth: '24px',
    textAlign: 'center',
    padding: '0', // Remove cell padding
    margin: '0', // Remove cell margins
    border: 'none', // Remove cell borders
    verticalAlign: 'middle',
    color: 'var(--text-primary)',
    whiteSpace: 'nowrap',
    overflow: 'visible',
    textOverflow: 'unset'
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '200px',
    color: 'var(--text-primary)',
    fontSize: '16px'
  },
  // Mobile responsive styles
  mobileBrowser: {
    width: '95vw',
    height: '90vh',
    maxWidth: 'none'
  },
  mobileSearchInput: {
    fontSize: '16px' // Prevent zoom on iOS
  },
  // Filter dropdown styles
  headerWithFilter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0px',
    position: 'relative'
  },
  headerFilterIcon: {
    background: 'none',
    border: 'none',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    padding: '2px 4px',
    borderRadius: 'var(--radius-sm)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
    position: 'relative',
    marginLeft: '-2px'
  },
  headerFilterIconActive: {
    color: 'var(--purple)'
  },
  filterIcon: {
    fontSize: '12px'
  },
  filterActiveDot: {
    position: 'absolute',
    left: '50%',
    top: '2px',
    transform: 'translateX(-50%)',
    width: '4px',
    height: '4px',
    borderRadius: '50%',
    background: 'var(--purple)',
    pointerEvents: 'none'
  },
  filterDropdown: {
    position: 'fixed',
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
    zIndex: 99999,
    marginTop: '4px',
    overflow: 'hidden',
    width: 'max-content',
    minWidth: '120px',
    maxWidth: '200px'
  },
  filterOption: {
    padding: '8px 12px',
    cursor: 'pointer',
    color: 'var(--text-primary)',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    transition: 'background-color 0.2s ease',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  filterOptionSelected: {
    backgroundColor: 'var(--bg-hover)'
  },
  checkIcon: {
    width: '16px',
    height: '16px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--text-secondary)',
    fontSize: '12px'
  },
  filterLabel: {
    flex: 1
  }
}
