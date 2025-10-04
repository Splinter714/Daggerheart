import React, { useState, useMemo } from 'react'
import { Search, X } from 'lucide-react'
import { useGameState } from '../state/state'
import { BrowserRow } from './Browser'

const CustomAdversaryBrowser = ({ onSelectAdversary, selectedAdversaryId, onEditAdversary, onExportCustomAdversaries, onImportCustomAdversaries }) => {
  const { customContent, deleteCustomAdversary } = useGameState()
  const [searchTerm, setSearchTerm] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState(null) // Track which adversary is in delete confirmation state

  // Filter custom adversaries based on search
  const filteredAdversaries = useMemo(() => {
    if (!customContent?.adversaries) return []
    
    return customContent.adversaries.filter(adv => {
      const matchesSearch = !searchTerm || 
        adv.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        adv.type?.toLowerCase().includes(searchTerm.toLowerCase())
      
      return matchesSearch
    })
  }, [customContent?.adversaries, searchTerm])

  // Sort by name
  const sortedAdversaries = useMemo(() => {
    return [...filteredAdversaries].sort((a, b) => 
      (a.name || '').localeCompare(b.name || '')
    )
  }, [filteredAdversaries])

  const handleDeleteClick = (e, id) => {
    e.stopPropagation()
    if (deleteConfirm === id) {
      // Second click - actually delete
      deleteCustomAdversary(id)
      setDeleteConfirm(null)
      // Clear selection if we deleted the selected adversary
      if (selectedAdversaryId === id && onSelectAdversary) {
        onSelectAdversary(null)
      }
    } else {
      // First click - show confirmation
      setDeleteConfirm(id)
      // Clear after 3 seconds if not confirmed
      setTimeout(() => setDeleteConfirm(null), 3000)
    }
  }

  const handleRowClick = (adversary) => {
    if (onSelectAdversary) {
      // Toggle preview - close if same adversary clicked again
      if (selectedAdversaryId && selectedAdversaryId === adversary.id) {
        onSelectAdversary(null)
      } else {
        onSelectAdversary(adversary.id)
      }
    }
  }

  const handleEditClick = (e, adversary) => {
    e.stopPropagation()
    if (onEditAdversary) {
      onEditAdversary(adversary)
    }
  }

  const styles = {
    container: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      height: '100%'
    },
    header: {
      padding: '1rem',
      borderBottom: '1px solid var(--border)',
      backgroundColor: 'var(--bg-primary)',
      flexShrink: 0
    },
    searchContainer: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem'
    },
    searchInput: {
      flex: 1,
      padding: '0.5rem 2.5rem 0.5rem 2.5rem',
      border: '1px solid var(--border)',
      borderRadius: '6px',
      backgroundColor: 'var(--bg-secondary)',
      color: 'var(--text-primary)',
      fontSize: '0.875rem',
      outline: 'none',
      transition: 'border-color 0.2s ease'
    },
    searchIcon: {
      position: 'absolute',
      left: '0.75rem',
      color: 'var(--text-secondary)',
      pointerEvents: 'none'
    },
    clearButton: {
      position: 'absolute',
      right: '0.75rem',
      background: 'none',
      border: 'none',
      color: 'var(--text-secondary)',
      cursor: 'pointer',
      padding: '0.25rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'color 0.2s ease'
    },
    tableContainer: {
      flex: 1,
      overflowY: 'auto',
      overflowX: 'auto'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      fontSize: '0.875rem'
    },
    th: {
      position: 'sticky',
      top: 0,
      backgroundColor: 'var(--bg-primary)',
      padding: '0.75rem 1rem',
      textAlign: 'left',
      fontWeight: 600,
      color: 'var(--text-primary)',
      borderBottom: '2px solid var(--border)',
      whiteSpace: 'nowrap',
      zIndex: 10
    },
    emptyState: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '3rem 1rem',
      textAlign: 'center',
      color: 'var(--text-secondary)'
    }
  }

  return (
    <div style={styles.container}>
      {/* Header with Search and Export/Import */}
      <div style={styles.header}>
        <div style={styles.searchContainer}>
          <div style={{ ...styles.searchContainer, flex: 1 }}>
            <Search size={16} style={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search custom adversaries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                style={styles.clearButton}
                onMouseEnter={(e) => e.target.style.color = 'var(--text-primary)'}
                onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}
              >
                <X size={16} />
              </button>
            )}
          </div>
          
          {/* Export/Import Buttons */}
          <button
            onClick={onExportCustomAdversaries}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-primary)',
              fontSize: '0.875rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = 'var(--bg-hover)'
              e.target.style.borderColor = 'var(--purple)'
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'var(--bg-secondary)'
              e.target.style.borderColor = 'var(--border)'
            }}
          >
            <span>↓</span>
            Export
          </button>
          
          <button
            onClick={() => document.getElementById('import-file-input').click()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-primary)',
              fontSize: '0.875rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = 'var(--bg-hover)'
              e.target.style.borderColor = 'var(--purple)'
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'var(--bg-secondary)'
              e.target.style.borderColor = 'var(--border)'
            }}
          >
            <span>↑</span>
            Import
          </button>
          <input
            id="import-file-input"
            type="file"
            accept=".json"
            onChange={onImportCustomAdversaries}
            style={{ display: 'none' }}
          />
        </div>
      </div>

      {/* Table */}
      <div style={styles.tableContainer}>
        {sortedAdversaries.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }}>📝</div>
            <div style={{ fontSize: '1rem', fontWeight: 500, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
              {searchTerm ? 'No adversaries found' : 'No custom adversaries yet'}
            </div>
            <div style={{ fontSize: '0.875rem' }}>
              {searchTerm ? 'Try adjusting your search' : 'Create your first custom adversary in the "Create Adversary" tab'}
            </div>
          </div>
        ) : (
          <table style={styles.table}>
            <thead style={{ position: 'sticky', top: 0, zIndex: 10, backgroundColor: 'var(--bg-primary)' }}>
              <tr>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Type</th>
                <th style={styles.th}>Tier</th>
                <th style={styles.th}>Difficulty</th>
                <th style={styles.th}>HP</th>
                <th style={styles.th}>Stress</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedAdversaries.map((adversary) => (
                <BrowserRow
                  key={adversary.id}
                  item={adversary}
                  onAdd={() => {}} // No add functionality for custom adversaries
                  type="adversary"
                  onRowClick={() => handleRowClick(adversary)}
                  encounterItems={[]}
                  pcCount={4}
                  playerTier={1}
                  remainingBudget={0}
                  costFilter="all"
                  onAdversaryClick={() => handleRowClick(adversary)}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default CustomAdversaryBrowser

