import React, { useState, useMemo } from 'react'
import { Search, X, Trash2 } from 'lucide-react'
import { useGameState } from '../state/state'

const CustomAdversaryBrowser = ({ onSelectAdversary, selectedAdversaryId }) => {
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
      onSelectAdversary(adversary.id)
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
      gap: '0.5rem'
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
    td: {
      padding: '0.75rem 1rem',
      borderBottom: '1px solid var(--border)',
      color: 'var(--text-secondary)'
    },
    row: {
      cursor: 'pointer',
      transition: 'background-color 0.1s ease'
    },
    actionButton: {
      background: 'none',
      border: 'none',
      color: 'var(--text-secondary)',
      cursor: 'pointer',
      padding: '0.25rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'color 0.2s ease',
      borderRadius: '4px'
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
      {/* Header with Search */}
      <div style={styles.header}>
        <div style={styles.searchContainer}>
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
        
        <div style={{ 
          marginTop: '0.75rem', 
          fontSize: '0.875rem', 
          color: 'var(--text-secondary)' 
        }}>
          {sortedAdversaries.length} custom {sortedAdversaries.length === 1 ? 'adversary' : 'adversaries'}
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
            <thead>
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
                <tr
                  key={adversary.id}
                  style={{
                    ...styles.row,
                    backgroundColor: selectedAdversaryId === adversary.id ? 'var(--bg-hover)' : 'transparent'
                  }}
                  onClick={() => handleRowClick(adversary)}
                  onMouseEnter={(e) => {
                    if (selectedAdversaryId !== adversary.id) {
                      e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedAdversaryId !== adversary.id) {
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }
                  }}
                >
                  <td style={{ ...styles.td, fontWeight: 500, color: 'var(--text-primary)' }}>
                    {adversary.name || 'Unnamed'}
                  </td>
                  <td style={styles.td}>{adversary.type || '-'}</td>
                  <td style={styles.td}>{adversary.tier || '-'}</td>
                  <td style={styles.td}>{adversary.difficulty || '-'}</td>
                  <td style={styles.td}>{adversary.hpMax || '-'}</td>
                  <td style={styles.td}>{adversary.stressMax || '-'}</td>
                  <td style={{ ...styles.td, display: 'flex', gap: '0.5rem' }}>
                    <button
                      style={{
                        ...styles.actionButton,
                        backgroundColor: deleteConfirm === adversary.id ? 'var(--red)' : 'transparent',
                        color: deleteConfirm === adversary.id ? 'white' : 'var(--text-secondary)'
                      }}
                      onClick={(e) => handleDeleteClick(e, adversary.id)}
                      onMouseEnter={(e) => {
                        if (deleteConfirm !== adversary.id) {
                          e.target.style.color = 'var(--red)'
                          e.target.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (deleteConfirm !== adversary.id) {
                          e.target.style.color = 'var(--text-secondary)'
                          e.target.style.backgroundColor = 'transparent'
                        }
                      }}
                      title={deleteConfirm === adversary.id ? 'Click again to confirm delete' : 'Delete adversary'}
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

    </div>
  )
}

export default CustomAdversaryBrowser

