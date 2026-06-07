import React, { useEffect, useRef, useCallback } from 'react'
import Panel from './Panels'
import GameCard from '../Adversaries/GameCard'
import { DASHBOARD_GAP } from './constants'

// Width of each vertical group divider column (narrow but enough for rotated text)
const DIVIDER_WIDTH = 20

// Count how many group-boundary dividers appear strictly before flat index `i`
// (a boundary is where groupName changes from one value to another non-null value)
function numDividersBefore(flatIndex, groups) {
  if (flatIndex === 0) return 0
  let count = 0
  let lastGN = groups[0]?.groupName ?? null
  for (let i = 1; i < flatIndex; i++) {
    const gn = groups[i]?.groupName ?? null
    if (gn && gn !== lastGN) count++
    lastGN = gn || lastGN  // keep last non-null groupName when transitioning
  }
  return count
}

// Pixel scroll-left of a card at flat index `i`, accounting for any dividers before it
function cardScrollPosition(flatIndex, groups, columnWidth) {
  const divs = numDividersBefore(flatIndex, groups)
  return DASHBOARD_GAP + flatIndex * (columnWidth + DASHBOARD_GAP) + divs * (DIVIDER_WIDTH + DASHBOARD_GAP)
}

const VerticalDivider = ({ groupName }) => (
  <div style={{
    width: DIVIDER_WIDTH,
    flexShrink: 0,
    flexGrow: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingTop: DASHBOARD_GAP,
    paddingBottom: DASHBOARD_GAP,
    scrollSnapAlign: 'none',
    position: 'relative',
  }}>
    {/* Thin vertical line */}
    <div style={{
      position: 'absolute',
      top: DASHBOARD_GAP,
      bottom: DASHBOARD_GAP,
      left: '50%',
      width: 1,
      backgroundColor: 'var(--border)',
      transform: 'translateX(-50%)',
    }} />
    {/* Rotated group label, centered on the line */}
    <div style={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%) rotate(180deg)',
      writingMode: 'vertical-rl',
      textOrientation: 'mixed',
      fontSize: '0.68rem',
      fontWeight: 700,
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
      color: 'var(--text-primary)',
      backgroundColor: 'var(--bg-primary)',
      padding: '8px 2px',
      whiteSpace: 'nowrap',
      userSelect: 'none',
      pointerEvents: 'none',
    }}>
      {groupName}
    </div>
  </div>
)

const EntityColumns = ({
  entityGroups,
  columnWidth,
  scrollContainerRef,
  onScroll,
  newCards,
  removingCardSpacer,
  spacerShrinking,
  browserOpenAtPosition,
  editingAdversaryId,
  handleSaveCustomAdversary,
  handleCancelEdit,
  updateAdversary,
  updateEnvironment,
  updateCountdown,
  adversaries,
  handleEditAdversary,
  createAdversary,
  createAdversariesBulk,
  pcCount,
  smoothScrollTo,
  getEntityGroups,
  deleteAdversary,
  setRemovingCardSpacer,
  setSpacerShrinking,
  onOpenBrowser,
}) => {
  const isGrouped = entityGroups.some(g => g.groupName)

  const renderCardPanel = (group, flatIndex, cssClass, currentDivCount) => {
    const isSpacerPosition =
      !isGrouped &&
      removingCardSpacer &&
      removingCardSpacer.baseName === group.baseName &&
      group.type === 'adversary'

    if (isSpacerPosition) {
      return (
        <Panel
          key={`spacer-${removingCardSpacer.baseName}`}
          style={{
            width: spacerShrinking ? '0px' : `${columnWidth}px`,
            flexShrink: 0, flexGrow: 0, flex: 'none',
            paddingRight: '0',
            paddingTop: spacerShrinking ? '0px' : `${DASHBOARD_GAP}px`,
            paddingBottom: spacerShrinking ? '0px' : `${DASHBOARD_GAP}px`,
            scrollSnapAlign: 'none',
            overflow: 'hidden',
            display: 'flex', flexDirection: 'column', alignItems: 'stretch',
            height: '100%', opacity: 0,
            transition: 'width 0.3s ease, padding-top 0.3s ease, padding-bottom 0.3s ease',
          }}
        />
      )
    }

    const isEditing = group.type === 'adversary' && editingAdversaryId && group.instances.some(i => i.id === editingAdversaryId)

    return (
      <Panel
        key={group.type === 'adversary' ? `adversary-${group.template?.id || group.baseName}` : `${group.type}-${group.baseName}`}
        className={cssClass}
        style={{
          width: `${columnWidth}px`,
          flexShrink: 0, flexGrow: 0, flex: 'none',
          paddingRight: '0',
          paddingTop: `${DASHBOARD_GAP}px`,
          paddingBottom: `${DASHBOARD_GAP}px`,
          scrollSnapAlign: 'start',
          overflow: group.type === 'adversary' ? 'visible' : 'hidden',
          display: 'flex', flexDirection: 'column', alignItems: 'stretch',
          height: 'auto',
          opacity: newCards.has(`${group.type}-${group.baseName}`) ? 0 : 1,
          transition: 'opacity 0.2s ease',
        }}
      >
        <GameCard
          type={group.type}
          item={
            group.type === 'adversary'
              ? { ...group.template, name: group.baseName, hp: 0, stress: 0, isDead: false }
              : { ...group.instances[0], name: group.instances[0]?.name || group.baseName }
          }
          mode="expanded"
          instances={
            group.type === 'adversary'
              ? [...group.instances]
                  .sort((a, b) => (a.duplicateNumber || 1) - (b.duplicateNumber || 1))
                  .map(inst => ({ ...inst, hpMax: group.template.hpMax, stressMax: group.template.stressMax }))
              : group.instances
          }
          showCustomCreator={isEditing}
          onSaveCustomAdversary={isEditing ? handleSaveCustomAdversary : undefined}
          onCancelEdit={isEditing ? handleCancelEdit : undefined}
          isStockAdversary={isEditing ? (!group.template?.source || group.template?.source !== 'Homebrew') : false}
          onApplyDamage={
            group.type === 'adversary'
              ? (id, damage) => {
                  const instance = group.instances.find(i => i.id === id)
                  if (instance) updateAdversary(id, { hp: Math.min(group.template.hpMax || 1, (instance.hp || 0) + damage) })
                }
              : undefined
          }
          onApplyHealing={
            group.type === 'adversary'
              ? (id, healing) => {
                  const instance = group.instances.find(i => i.id === id)
                  if (instance) updateAdversary(id, { hp: Math.max(0, (instance.hp || 0) - healing) })
                }
              : undefined
          }
          onApplyStressChange={
            group.type === 'adversary'
              ? (id, stress) => {
                  const instance = group.instances.find(i => i.id === id)
                  if (instance) updateAdversary(id, {
                    stress: Math.max(0, Math.min(group.template.stressMax || 6, (instance.stress || 0) + stress)),
                  })
                }
              : undefined
          }
          onUpdate={
            group.type === 'adversary' ? updateAdversary
              : group.type === 'environment' ? updateEnvironment
              : updateCountdown
          }
          adversaries={adversaries}
          showAddRemoveButtons={browserOpenAtPosition !== null && group.type === 'adversary'}
          onEdit={group.type === 'adversary' ? itemId => handleEditAdversary(itemId) : undefined}
          onAddInstance={
            group.type === 'adversary'
              ? item => {
                  const isMinion = item.type === 'Minion'
                  const instancesToAdd = isMinion ? pcCount : 1
                  if (isMinion && instancesToAdd > 1) {
                    createAdversariesBulk(Array(instancesToAdd).fill(null).map(() => ({ ...item })))
                  } else {
                    createAdversary(item)
                  }
                  setTimeout(() => {
                    requestAnimationFrame(() => requestAnimationFrame(() => {
                      if (!scrollContainerRef.current) return
                      const container = scrollContainerRef.current
                      const currentScroll = container.scrollLeft
                      const containerWidth = container.clientWidth
                      const effectiveWidth = browserOpenAtPosition !== null
                        ? containerWidth - columnWidth - DASHBOARD_GAP
                        : containerWidth
                      const updatedGroups = getEntityGroups()
                      const groupIndex = updatedGroups.findIndex(g => g.baseName === group.baseName && g.type === 'adversary')
                      if (groupIndex >= 0) {
                        // Use divider-aware position formula
                        const cardPosition = cardScrollPosition(groupIndex, updatedGroups, columnWidth)
                        const cardEnd = cardPosition + columnWidth
                        const margin = 10
                        const isVisible = cardPosition >= currentScroll - margin && cardEnd <= currentScroll + effectiveWidth + margin
                        if (!isVisible) {
                          let targetScroll
                          if (cardEnd > currentScroll + effectiveWidth + margin) {
                            const visibleColumns = Math.round((containerWidth - DASHBOARD_GAP) / (columnWidth + DASHBOARD_GAP))
                            targetScroll = cardScrollPosition(Math.max(0, groupIndex - visibleColumns + 2), updatedGroups, columnWidth)
                          } else {
                            targetScroll = cardScrollPosition(groupIndex, updatedGroups, columnWidth) - DASHBOARD_GAP
                          }
                          smoothScrollTo(Math.max(0, targetScroll), 500)
                        }
                      }
                    }))
                  }, 50)
                }
              : undefined
          }
          onRemoveInstance={
            group.type === 'adversary'
              ? () => {
                  const isMinion = group.template?.type === 'Minion'
                  const instancesToRemove = isMinion ? pcCount : 1
                  const instances = [...group.instances].sort((a, b) => (b.duplicateNumber || 1) - (a.duplicateNumber || 1))
                  if (instances.length === 0) return
                  const isLastInstance = Math.max(0, instances.length - instancesToRemove) === 0
                  const instancesToDelete = instances.slice(0, instancesToRemove)

                  if (isLastInstance && !isGrouped) {
                    const groupIndex = entityGroups.findIndex(g => g.baseName === group.baseName && g.type === 'adversary')
                    const isLeftmostColumn = groupIndex === 0
                    let wasAtMaxScroll = false
                    if (scrollContainerRef.current) {
                      const c = scrollContainerRef.current
                      wasAtMaxScroll = Math.abs(c.scrollLeft - (c.scrollWidth - c.clientWidth)) < 1
                    }
                    // items-array index = flat index + number of dividers before it
                    const itemsIndex = groupIndex + numDividersBefore(groupIndex, entityGroups)
                    setRemovingCardSpacer({ baseName: group.baseName, groupIndex: itemsIndex })
                    setSpacerShrinking(false)
                    if (isLeftmostColumn && scrollContainerRef.current) scrollContainerRef.current.style.scrollSnapType = 'none'
                    requestAnimationFrame(() => requestAnimationFrame(() => {
                      if (scrollContainerRef.current) scrollContainerRef.current.offsetHeight
                      instancesToDelete.forEach(inst => deleteAdversary(inst.id))
                      requestAnimationFrame(() => requestAnimationFrame(() => {
                        if (scrollContainerRef.current) scrollContainerRef.current.offsetHeight
                        setTimeout(() => {
                          setSpacerShrinking(true)
                          if (wasAtMaxScroll && scrollContainerRef.current) {
                            const startTime = performance.now()
                            const duration = 300
                            const maintainScroll = () => {
                              if (!scrollContainerRef.current) return
                              scrollContainerRef.current.scrollLeft = scrollContainerRef.current.scrollWidth - scrollContainerRef.current.clientWidth
                              if (performance.now() - startTime < duration) requestAnimationFrame(maintainScroll)
                            }
                            requestAnimationFrame(maintainScroll)
                          }
                          setTimeout(() => {
                            setRemovingCardSpacer(null)
                            setSpacerShrinking(false)
                            if (isLeftmostColumn && scrollContainerRef.current) scrollContainerRef.current.style.scrollSnapType = 'x mandatory'
                            if (wasAtMaxScroll && scrollContainerRef.current) {
                              scrollContainerRef.current.scrollLeft = scrollContainerRef.current.scrollWidth - scrollContainerRef.current.clientWidth
                            }
                          }, 300)
                        }, 50)
                      }))
                    }))
                  } else {
                    instancesToDelete.forEach(inst => deleteAdversary(inst.id))
                  }
                }
              : undefined
          }
        />
      </Panel>
    )
  }

  // Build the flat items array, injecting vertical dividers between groups
  const items = []
  let lastGroupName = null
  let divCount = 0

  entityGroups.forEach((group, index) => {
    const isFirst = index === 0
    const isLast = index === entityGroups.length - 1
    const cssClass = isFirst ? 'dashboard-column dashboard-column--first'
      : isLast ? 'dashboard-column dashboard-column--last'
      : 'dashboard-column'

    // Inject a divider before each new group boundary (not before the very first group)
    if (group.groupName && group.groupName !== lastGroupName) {
      if (lastGroupName !== null) {
        items.push(<VerticalDivider key={`divider-${group.groupName}-${index}`} groupName={group.groupName} />)
        divCount++
      }
      lastGroupName = group.groupName
    } else if (!group.groupName) {
      lastGroupName = null
    }

    items.push(renderCardPanel(group, index, cssClass, divCount))
  })

  // Spacer for animated card removal (only when groupBy is off so no dividers exist)
  if (!isGrouped && removingCardSpacer && !items.some(item => item?.key === `spacer-${removingCardSpacer.baseName}`)) {
    const insertIndex = Math.min(removingCardSpacer.groupIndex, items.length)
    items.splice(insertIndex, 0,
      <Panel
        key={`spacer-${removingCardSpacer.baseName}`}
        className="dashboard-column"
        style={{
          width: spacerShrinking ? '0px' : `${columnWidth}px`,
          flexShrink: 0, flexGrow: 0, flex: 'none',
          paddingRight: '0',
          paddingTop: spacerShrinking ? '0px' : `${DASHBOARD_GAP}px`,
          paddingBottom: spacerShrinking ? '0px' : `${DASHBOARD_GAP}px`,
          scrollSnapAlign: 'none',
          overflow: 'hidden',
          display: 'flex', flexDirection: 'column', alignItems: 'stretch',
          height: '100%', opacity: 0,
          transition: 'width 0.3s ease, padding-top 0.3s ease, padding-bottom 0.3s ease',
        }}
      />
    )
  }

  return (
    <div ref={scrollContainerRef} className="dashboard-scroll-container" onScroll={onScroll}>
      {items.length > 0 ? items : null}
      {browserOpenAtPosition !== null && (
        <div style={{ width: `${columnWidth}px`, flexShrink: 0, flexGrow: 0, flex: 'none', height: '100%' }} />
      )}
    </div>
  )
}

export default EntityColumns
