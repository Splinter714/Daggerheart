import React, { useEffect, useRef, useCallback } from 'react'
import Panel from './Panels'
import GameCard from '../Adversaries/GameCard'
import { DASHBOARD_GAP } from './constants'

// Collect consecutive adversary entries with the same groupName into sections.
function buildSections(entityGroups) {
  const sections = []
  let i = 0
  while (i < entityGroups.length) {
    const g = entityGroups[i]
    if (g.groupName && g.type === 'adversary') {
      const entries = [g]
      let j = i + 1
      while (j < entityGroups.length && entityGroups[j].groupName === g.groupName && entityGroups[j].type === 'adversary') {
        entries.push(entityGroups[j])
        j++
      }
      sections.push({ type: 'grouped', groupName: g.groupName, entries, startFlatIndex: i })
      i = j
    } else {
      sections.push({ type: 'solo', entry: g, flatIndex: i })
      i++
    }
  }
  return sections
}

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
  // Map of sectionKey → { el (label DOM node), startFlatIndex, count }
  const labelInfoRef = useRef({})

  // Reposition all group labels so each is centered over its visible cards.
  // Called on scroll and whenever layout changes (columns, entityGroups).
  const updateLabelPositions = useCallback(() => {
    const container = scrollContainerRef.current
    if (!container) return
    const viewportLeft = container.scrollLeft
    const viewportRight = viewportLeft + container.clientWidth

    Object.values(labelInfoRef.current).forEach(({ el, startFlatIndex, count }) => {
      if (!el) return
      const groupStart = DASHBOARD_GAP + startFlatIndex * (columnWidth + DASHBOARD_GAP)
      const groupWidth = count * columnWidth + (count - 1) * DASHBOARD_GAP
      const groupEnd = groupStart + groupWidth

      // Intersection of group with viewport, relative to the group wrapper
      const visibleLeft = Math.max(groupStart, viewportLeft) - groupStart
      const visibleRight = Math.min(groupEnd, viewportRight) - groupStart
      const centerX = (visibleLeft + visibleRight) / 2

      // Clamp so the label never bleeds outside the group wrapper
      const halfLabel = el.offsetWidth / 2
      const clamped = Math.max(halfLabel, Math.min(groupWidth - halfLabel, centerX))

      el.style.left = `${clamped}px`
      // No CSS transition — immediate repositioning as user scrolls
    })
  }, [columnWidth, scrollContainerRef])

  // Attach scroll listener and run once on mount / when layout changes
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return
    updateLabelPositions()
    container.addEventListener('scroll', updateLabelPositions, { passive: true })
    return () => container.removeEventListener('scroll', updateLabelPositions)
  }, [updateLabelPositions, entityGroups])

  const registerLabel = (key, startFlatIndex, count) => (el) => {
    if (el) {
      labelInfoRef.current[key] = { el, startFlatIndex, count }
    } else {
      delete labelInfoRef.current[key]
    }
  }

  // Render a card Panel for a single entity group entry
  const renderCardPanel = (group, flatIndex, cssClass, insideGroup = false) => {
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
          // Cards inside a group wrapper get no top padding — the label area provides it
          paddingTop: insideGroup ? '0' : `${DASHBOARD_GAP}px`,
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
                        const cardPosition = DASHBOARD_GAP + groupIndex * (columnWidth + DASHBOARD_GAP)
                        const cardEnd = cardPosition + columnWidth
                        const margin = 10
                        const isVisible = cardPosition >= currentScroll - margin && cardEnd <= currentScroll + effectiveWidth + margin
                        if (!isVisible) {
                          let targetScroll
                          if (cardEnd > currentScroll + effectiveWidth + margin) {
                            const visibleColumns = Math.round((containerWidth - DASHBOARD_GAP) / (columnWidth + DASHBOARD_GAP))
                            targetScroll = (groupIndex - visibleColumns + 2) * (columnWidth + DASHBOARD_GAP)
                          } else {
                            targetScroll = groupIndex * (columnWidth + DASHBOARD_GAP)
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
                    setRemovingCardSpacer({ baseName: group.baseName, groupIndex })
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

  const sections = buildSections(entityGroups)
  const items = []

  sections.forEach((section, sectionIndex) => {
    const isFirstSection = sectionIndex === 0
    const isLastSection = sectionIndex === sections.length - 1

    if (section.type === 'grouped') {
      const { groupName, entries, startFlatIndex } = section
      const sectionKey = `group-section-${groupName}-${startFlatIndex}`
      const count = entries.length

      const cards = entries.map((group, i) => {
        const isFirst = isFirstSection && i === 0
        const isLast = isLastSection && i === entries.length - 1
        const cssClass = isFirst ? 'dashboard-column dashboard-column--first'
          : isLast ? 'dashboard-column dashboard-column--last'
          : 'dashboard-column'
        return renderCardPanel(group, startFlatIndex + i, cssClass, true)
      })

      items.push(
        <div
          key={sectionKey}
          style={{
            display: 'flex',
            flexDirection: 'column',
            flexShrink: 0,
            flexGrow: 0,
            flex: 'none',
          }}
        >
          {/* Label area: bracket line + centered label. Label position set by scroll handler. */}
          <div style={{ position: 'relative', height: DASHBOARD_GAP + 24, flexShrink: 0 }}>
            {/* Horizontal line spanning full group width */}
            <div style={{
              position: 'absolute',
              left: 0, right: 0,
              top: '50%',
              height: 1,
              backgroundColor: 'var(--border)',
              pointerEvents: 'none',
            }} />
            {/* Left bracket cap */}
            <div style={{
              position: 'absolute',
              left: 0, top: '50%',
              transform: 'translateY(-50%)',
              width: 1, height: 12,
              backgroundColor: 'var(--border)',
              pointerEvents: 'none',
            }} />
            {/* Right bracket cap */}
            <div style={{
              position: 'absolute',
              right: 0, top: '50%',
              transform: 'translateY(-50%)',
              width: 1, height: 12,
              backgroundColor: 'var(--border)',
              pointerEvents: 'none',
            }} />
            {/* Label text: positioned by JS, centered over visible portion */}
            <span
              ref={registerLabel(sectionKey, startFlatIndex, count)}
              style={{
                position: 'absolute',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                backgroundColor: 'var(--bg-primary)',
                padding: '0 8px',
                fontSize: '0.72rem',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--text-primary)',
                whiteSpace: 'nowrap',
                pointerEvents: 'none',
                userSelect: 'none',
              }}
            >
              {groupName}
            </span>
          </div>

          {/* Cards row */}
          <div style={{ display: 'flex', flexDirection: 'row', gap: `${DASHBOARD_GAP}px`, alignItems: 'stretch' }}>
            {cards}
          </div>
        </div>
      )
    } else {
      const { entry: group, flatIndex } = section
      const cssClass = isFirstSection ? 'dashboard-column dashboard-column--first'
        : isLastSection ? 'dashboard-column dashboard-column--last'
        : 'dashboard-column'
      items.push(renderCardPanel(group, flatIndex, cssClass, false))
    }
  })

  // Spacer for animated card removal (non-grouped mode only)
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
