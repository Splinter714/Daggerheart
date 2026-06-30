import React, { useState } from 'react'
import { BookOpen, Hammer, Trash2 } from 'lucide-react'
import { styles } from './Browser.styles'
import { BATTLE_POINT_COSTS } from '../Dashboard/BattlePointsCalculator'

// Browser Row Component — extracted from Browser.jsx (Phase 4).
const BrowserRow = ({ item, onAdd, type, onRowClick, encounterItems = [], pcCount = 4, playerTier = 1, remainingBudget = 0, isFocused = false, rowRef = null, onDeleteCustomAdversary = null, isDeleteConfirmed = false }) => {
  const [isHovered, setIsHovered] = useState(false)

  const handleAdd = () => {
    onAdd(item)
  }

  // Calculate dynamic cost including automatic adjustments
  const calculateDynamicCost = () => {
    if (type !== 'adversary') return null
    
    const baseCost = BATTLE_POINT_COSTS[item.type] || 2
    let automaticAdjustment = 0
    
    // Count current adversaries by type
    const currentSoloCount = encounterItems.filter(encounterItem => 
      encounterItem.type === 'adversary' && encounterItem.item.type === 'Solo' && encounterItem.quantity > 0
    ).reduce((sum, encounterItem) => sum + encounterItem.quantity, 0)
    
    const currentMajorThreatCount = encounterItems.filter(encounterItem => 
      encounterItem.type === 'adversary' && ['Bruiser', 'Horde', 'Leader', 'Solo'].includes(encounterItem.item.type) && encounterItem.quantity > 0
    ).reduce((sum, encounterItem) => sum + encounterItem.quantity, 0)
    
    // Calculate automatic adjustments
    if (item.type === 'Solo') {
      // If this would be the 2nd Solo, add 2 BP (penalty for 2+ Solos)
      if (currentSoloCount === 1) {
        automaticAdjustment += 2
      }
    }
    
    if (['Bruiser', 'Horde', 'Leader', 'Solo'].includes(item.type)) {
      // If this is the first Major Threat, add 1 BP (automatic adjustment for lack of Major Threats)
      if (currentMajorThreatCount === 0) {
        automaticAdjustment += 1
      }
    }
    
        // Lower tier adjustment
        // if (item.tier < playerTier) {
        //   automaticAdjustment += 1
        // }
    
    return baseCost + automaticAdjustment
  }

  const renderContent = () => {
    if (type === 'adversary') {
      const dynamicCost = calculateDynamicCost()
      const baseCost = BATTLE_POINT_COSTS[item.type] || 2
      const exceedsBudget = dynamicCost > remainingBudget || remainingBudget <= 0
      
      const deEmphasizedStyle = {}
      
      // If there's a description or motives, return array of two rows
      if (item.description || item.motives) {
        return [
          // First row: name, tier, type, source (with rowspan)
          [
            <td key="name" style={{...styles.rowCell, width: 'auto', minWidth: '0', textAlign: 'left', ...deEmphasizedStyle, borderBottom: 'none', padding: '0.25rem 0.25rem 0 0.5rem', outline: 'none'}}>
              <div style={{ 
                overflow: 'hidden', 
                textOverflow: 'ellipsis', 
                whiteSpace: 'nowrap',
                maxWidth: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <div style={{ 
                  flex: 1,
                  minWidth: 0,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  <div style={{ fontWeight: '600' }}>{item.name || item.baseName || ''}</div>
                </div>
              </div>
            </td>,
            <td key="tier" style={{...styles.rowCell, width: '40px', minWidth: '40px', maxWidth: '40px', textAlign: 'center', ...deEmphasizedStyle, borderBottom: 'none', padding: '0.25rem 0.25rem 0 0.25rem', outline: 'none'}}>{item.tier}</td>,
            <td key="type" style={{...styles.rowCell, width: '80px', minWidth: '80px', maxWidth: '80px', textAlign: 'center', ...deEmphasizedStyle, borderBottom: 'none', padding: '0.25rem 0.25rem 0 0.25rem', outline: 'none'}}>{item.type}</td>,
            <td key="source" style={{...styles.rowCell, width: '40px', minWidth: '40px', maxWidth: '40px', textAlign: 'center', ...deEmphasizedStyle, borderBottom: 'none', outline: 'none'}} rowSpan={2}>
              {(item.source === 'Homebrew' || item.isCustom) ? (
                (isHovered || isFocused || isDeleteConfirmed) && onDeleteCustomAdversary ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onDeleteCustomAdversary(item.id)
                    }}
                    style={{
                      background: isDeleteConfirmed ? 'var(--danger)' : 'var(--bg-secondary)',
                      border: '1px solid var(--border)',
                      borderRadius: '4px',
                      padding: '0.25rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: isDeleteConfirmed ? 'var(--text-primary)' : 'var(--danger)',
                      transition: 'all 0.2s ease',
                      flexShrink: 0,
                      width: '24px',
                      height: '24px',
                      margin: '0 auto'
                    }}
                    title={isDeleteConfirmed ? 'Click again to confirm delete' : 'Delete custom adversary'}
                  >
                    <Trash2 size={14} />
                  </button>
                ) : (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '24px',
                    height: '24px',
                    margin: '0 auto'
                  }}>
                    <Hammer 
                      size={14} 
                      style={{ 
                        color: 'var(--text-secondary)',
                        opacity: 0.7
                      }} 
                      title="Custom adversary"
                    />
                  </div>
                )
              ) : (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '24px',
                  height: '24px',
                  margin: '0 auto'
                }}>
                  <BookOpen 
                    size={14} 
                    style={{ 
                      color: 'var(--text-secondary)',
                      opacity: 0.7
                    }} 
                    title="Stock adversary"
                  />
                </div>
              )}
            </td>
          ],
          // Second row: description spanning name, tier, type
          [
            <td key="desc" colSpan={3} style={{...styles.rowCell, textAlign: 'left', ...deEmphasizedStyle, padding: '0 0.25rem 0.25rem 0.5rem', borderTop: 'none', borderBottom: 'none', outline: 'none'}}>
              <div style={{
                fontSize: '0.85rem',
                color: 'var(--text-secondary)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {item.isColossus ? (item.segmentsSummary || '') : (item.description || item.motives || '')}
              </div>
            </td>
          ]
        ]
      }
      
      // Single row (no description)
      return (
        <>
          <td style={{...styles.rowCell, width: 'auto', minWidth: '0', textAlign: 'left', ...deEmphasizedStyle, paddingLeft: '0.5rem'}}>
            <div style={{ 
              overflow: 'hidden', 
              textOverflow: 'ellipsis', 
              whiteSpace: 'nowrap',
              maxWidth: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <div style={{ 
                flex: 1,
                minWidth: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                <div style={{ fontWeight: '600' }}>{item.name || item.baseName || ''}</div>
              </div>
            </div>
          </td>
          <td style={{...styles.rowCell, width: '40px', minWidth: '40px', maxWidth: '40px', textAlign: 'center', ...deEmphasizedStyle}}>{item.tier}</td>
          <td style={{...styles.rowCell, width: '80px', minWidth: '80px', maxWidth: '80px', textAlign: 'center', ...deEmphasizedStyle}}>{item.type}</td>
          <td style={{...styles.rowCell, width: '40px', minWidth: '40px', maxWidth: '40px', textAlign: 'center', ...deEmphasizedStyle}}>
            {(item.source === 'Homebrew' || item.isCustom) ? (
              (isHovered || isFocused || isDeleteConfirmed) && onDeleteCustomAdversary ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onDeleteCustomAdversary(item.id)
                  }}
                  style={{
                    background: isDeleteConfirmed ? 'var(--danger)' : 'var(--bg-secondary)',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                    padding: '0.25rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isDeleteConfirmed ? 'var(--text-primary)' : 'var(--danger)',
                    transition: 'all 0.2s ease',
                    flexShrink: 0,
                    width: '24px',
                    height: '24px',
                    margin: '0 auto'
                  }}
                  title={isDeleteConfirmed ? 'Click again to confirm delete' : 'Delete custom adversary'}
                >
                  <Trash2 size={14} />
                </button>
              ) : (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '24px',
                  height: '24px',
                  margin: '0 auto'
                }}>
                  <Hammer 
                    size={14} 
                    style={{ 
                      color: 'var(--text-secondary)',
                      opacity: 0.7
                    }} 
                    title="Custom adversary"
                  />
                </div>
              )
            ) : (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '24px',
                height: '24px',
                margin: '0 auto'
              }}>
                <BookOpen 
                  size={14} 
                  style={{ 
                    color: 'var(--text-secondary)',
                    opacity: 0.7
                  }} 
                  title="Stock adversary"
                />
              </div>
            )}
          </td>
        </>
      )
    } else if (type === 'environment') {
      const sourceCell = (
        <td key="source" style={{...styles.rowCell, width: '40px', minWidth: '40px', maxWidth: '40px', textAlign: 'center', borderBottom: 'none', outline: 'none'}} rowSpan={item.description ? 2 : 1}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px', margin: '0 auto' }}>
            <BookOpen size={14} style={{ color: 'var(--text-secondary)', opacity: 0.7 }} title={item.source || 'SRD'} />
          </div>
        </td>
      )

      if (item.description) {
        return [
          [
            <td key="name" style={{...styles.rowCell, width: 'auto', minWidth: '0', textAlign: 'left', borderBottom: 'none', padding: '0.25rem 0.25rem 0 0.5rem', outline: 'none'}}>
              <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>
                <div style={{ fontWeight: '600' }}>{item.name || ''}</div>
              </div>
            </td>,
            <td key="tier" style={{...styles.rowCell, width: '40px', minWidth: '40px', maxWidth: '40px', textAlign: 'center', borderBottom: 'none', padding: '0.25rem 0.25rem 0 0.25rem', outline: 'none'}}>{item.tier}</td>,
            <td key="type" style={{...styles.rowCell, width: '80px', minWidth: '80px', maxWidth: '80px', textAlign: 'center', borderBottom: 'none', padding: '0.25rem 0.25rem 0 0.25rem', outline: 'none'}}>{item.type}</td>,
            sourceCell,
          ],
          [
            <td key="desc" colSpan={3} style={{...styles.rowCell, textAlign: 'left', padding: '0 0.25rem 0.25rem 0.5rem', borderTop: 'none', borderBottom: 'none', outline: 'none'}}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {item.description}
              </div>
            </td>
          ]
        ]
      }

      return (
        <>
          <td style={{...styles.rowCell, width: 'auto', minWidth: '0', textAlign: 'left', paddingLeft: '0.5rem'}}>
            <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              <div style={{ fontWeight: '600' }}>{item.name || ''}</div>
            </div>
          </td>
          <td style={{...styles.rowCell, width: '40px', minWidth: '40px', maxWidth: '40px', textAlign: 'center'}}>{item.tier}</td>
          <td style={{...styles.rowCell, width: '80px', minWidth: '80px', maxWidth: '80px', textAlign: 'center'}}>{item.type}</td>
          {sourceCell}
        </>
      )
    }
    return null
  }

  const content = renderContent()
  
  // If renderContent returns null (auto-hide mode), don't render the row
  if (content === null) {
    return null
  }

  // If content is an array (multiple rows), render them separately
  if (Array.isArray(content)) {
    return (
      <>
        {content.map((rowContent, index) => (
          <tr 
            key={index}
            ref={index === 0 ? rowRef : null}
            style={{
              ...styles.row,
              ...(isHovered ? styles.rowHover : {}),
              ...(isFocused ? styles.rowFocused : {}),
              ...(index === 0 ? { borderBottom: 'none' } : {}),
              ...(index === 1 ? { borderTop: 'none', height: 'auto', outline: 'none' } : {})
            }}
            onClick={() => {
              if (type === 'adversary' || type === 'environment') {
                handleAdd()
              } else if (onRowClick) {
                onRowClick(item, type)
              }
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {rowContent}
          </tr>
        ))}
      </>
    )
  }

  // Single row (no description or non-adversary type)
  return (
    <>
      <tr 
        ref={rowRef}
        style={{
          ...styles.row,
          ...(isHovered ? styles.rowHover : {}),
          ...(isFocused ? styles.rowFocused : {})
        }}
        onClick={() => {
          if (type === 'adversary' || type === 'environment') {
            handleAdd()
          } else if (onRowClick) {
            onRowClick(item, type)
          }
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {content}
      </tr>
    </>
  )
}

export default BrowserRow
