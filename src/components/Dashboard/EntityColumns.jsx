import React, { useEffect, useRef } from 'react'
import Panel from './Panels'
import GameCard from '../Adversaries/GameCard'
import { DASHBOARD_GAP } from './constants'

const SLIDE_PULL_FACTOR = 0.5

// Collect consecutive same-groupName adversary entries into sections.
function buildSections(entityGroups) {
  const sections = []
  let i = 0
  while (i < entityGroups.length) {
    const g = entityGroups[i]
    if (g.groupName && g.type === 'adversary') {
      const entries = [g]
      let j = i + 1
      while (j < entityGroups.length &&
             entityGroups[j].groupName === g.groupName &&
             entityGroups[j].type === 'adversary') {
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

// With uniform effectiveGap between all columns, the scroll position is simply:
function cardScrollPosition(flatIndex, columnWidth, effectiveGap) {
  return DASHBOARD_GAP + flatIndex * (columnWidth + effectiveGap)
}

const GROUP_LABEL_BAR_HEIGHT = 32

const EntityColumns = ({
  entityGroups,
  columnWidth,
  effectiveGap = DASHBOARD_GAP,
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
  const edgePadding = isGrouped ? DASHBOARD_GAP * 2 : DASHBOARD_GAP

  // ─── Slide-in effect: pull off-screen sections toward viewer as you scroll ──

  const rafRef = useRef(null)
  const edgePaddingRef = useRef(edgePadding)
  const isGroupedRef = useRef(isGrouped)
  edgePaddingRef.current = edgePadding
  isGroupedRef.current = isGrouped

  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    // Reset a section to its un-slid state.
    const resetSection = (child) => {
      if (child.dataset.groupWrapper) {
        const cardsRow = child.querySelector('[data-group-cards]')
        const bracket = child.querySelector('[data-group-bracket]')
        const label = child.querySelector('[data-group-label]')
        if (cardsRow) for (const card of cardsRow.children) card.style.transform = ''
        if (bracket) {
          bracket.style.transform = ''
          bracket.style.opacity = ''
        }
        if (label) label.style.transform = ''
      } else if (child.style.transform) {
        child.style.transform = ''
      }
    }

    const clearTransforms = () => {
      for (const child of container.children) {
        if (child.dataset.noSlide) continue
        resetSection(child)
      }
    }

    const compute = () => {
      if (!isGroupedRef.current) { clearTransforms(); return }
      const scrollLeft = container.scrollLeft
      const viewportWidth = container.clientWidth
      const ep = edgePaddingRef.current
      const rightEdge = scrollLeft + viewportWidth - ep

      for (const el of container.children) {
        if (el.dataset.noSlide) continue

        if (el.dataset.groupWrapper) {
          // Grouped section: slide each card independently so they cascade in
          // one after another.
          const wrapperLeft = el.offsetLeft
          const cardsRow = el.querySelector('[data-group-cards]')
          const bracket = el.querySelector('[data-group-bracket]')
          const label = el.querySelector('[data-group-label]')
          const cards = cardsRow ? cardsRow.children : []

          // Read phase — measure each card's slide offset.
          const writes = []
          for (const card of cards) {
            const overshoot = (wrapperLeft + card.offsetLeft + card.offsetWidth) - rightEdge
            const offset = overshoot > 0 ? overshoot * SLIDE_PULL_FACTOR : 0
            writes.push({ card, offset })
          }

          // Write phase
          for (const { card, offset } of writes) {
            card.style.transform = offset > 0 ? `translateX(${offset}px)` : ''
          }
          // The grouper (full-width, so it spills off the right edge while
          // later cards are still offscreen) and the pill both ride in with the
          // first card — no pop/flicker at snap.
          const firstOffset = writes[0] ? writes[0].offset : 0
          const firstTransform = firstOffset > 0 ? `translateX(${firstOffset}px)` : ''
          if (label) label.style.transform = firstTransform
          if (bracket) bracket.style.transform = firstTransform
        } else {
          const overshoot = (el.offsetLeft + el.offsetWidth) - rightEdge
          el.style.transform = overshoot > 0 ? `translateX(${overshoot * SLIDE_PULL_FACTOR}px)` : ''
        }
      }
    }

    const onScroll = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(compute)
    }

    container.addEventListener('scroll', onScroll, { passive: true })
    container.addEventListener('scrollend', compute)
    compute()

    return () => {
      container.removeEventListener('scroll', onScroll)
      container.removeEventListener('scrollend', compute)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      clearTransforms()
    }
  }, [scrollContainerRef])

  // ─── Card panel renderer ────────────────────────────────────────────────────

  const renderCardPanel = (group, flatIndex, cssClass, isFirstInGroup = false, isLastInGroup = false) => {
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
            scrollSnapAlign: 'none', overflow: 'hidden',
            display: 'flex', flexDirection: 'column', alignItems: 'stretch',
            height: '100%', opacity: 0,
            transition: 'width 0.3s ease, padding-top 0.3s ease, padding-bottom 0.3s ease',
          }}
        />
      )
    }

    const isEditing = group.type === 'adversary' && editingAdversaryId &&
      group.instances.some(i => i.id === editingAdversaryId)

    return (
      <Panel
        key={group.type === 'adversary'
          ? `adversary-${group.template?.id || group.baseName}`
          : `${group.type}-${group.baseName}`}
        className={cssClass}
        style={{
          width: `${columnWidth}px`,
          flexShrink: 0, flexGrow: 0, flex: 'none',
          paddingRight: '0',
          paddingTop: isGrouped ? '0' : `${DASHBOARD_GAP}px`,
          paddingBottom: isGrouped ? '0' : `${DASHBOARD_GAP}px`,
          scrollSnapAlign: 'start',
          overflow: isGrouped ? 'auto' : group.type === 'adversary' ? 'visible' : 'hidden',
          display: 'flex', flexDirection: 'column', alignItems: 'stretch',
          height: isGrouped ? '100%' : 'auto',
          scrollMarginLeft: isGrouped && isFirstInGroup ? DASHBOARD_GAP : undefined,
          scrollMarginRight: isGrouped && isLastInGroup ? DASHBOARD_GAP : undefined,
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
          isStockAdversary={isEditing
            ? (!group.template?.source || group.template?.source !== 'Homebrew')
            : false}
          onApplyDamage={group.type === 'adversary'
            ? (id, damage) => {
                const inst = group.instances.find(i => i.id === id)
                if (inst) updateAdversary(id, { hp: Math.min(group.template.hpMax || 1, (inst.hp || 0) + damage) })
              }
            : undefined}
          onApplyHealing={group.type === 'adversary'
            ? (id, healing) => {
                const inst = group.instances.find(i => i.id === id)
                if (inst) updateAdversary(id, { hp: Math.max(0, (inst.hp || 0) - healing) })
              }
            : undefined}
          onApplyStressChange={group.type === 'adversary'
            ? (id, stress) => {
                const inst = group.instances.find(i => i.id === id)
                if (inst) updateAdversary(id, {
                  stress: Math.max(0, Math.min(group.template.stressMax || 6, (inst.stress || 0) + stress)),
                })
              }
            : undefined}
          onUpdate={
            group.type === 'adversary' ? updateAdversary
              : group.type === 'environment' ? updateEnvironment
              : updateCountdown}
          adversaries={adversaries}
          showAddRemoveButtons={browserOpenAtPosition !== null && group.type === 'adversary'}
          onEdit={group.type === 'adversary' ? itemId => handleEditAdversary(itemId) : undefined}
          onAddInstance={group.type === 'adversary'
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
                    const groupIndex = updatedGroups.findIndex(
                      g => g.baseName === group.baseName && g.type === 'adversary')
                    if (groupIndex >= 0) {
                      const cardPosition = cardScrollPosition(groupIndex, columnWidth, effectiveGap)
                      const cardEnd = cardPosition + columnWidth
                      const margin = 10
                      const isVisible = cardPosition >= currentScroll - margin &&
                        cardEnd <= currentScroll + effectiveWidth + margin
                      if (!isVisible) {
                        let targetScroll
                        if (cardEnd > currentScroll + effectiveWidth + margin) {
                          const visibleColumns = Math.round((containerWidth - DASHBOARD_GAP) / (columnWidth + effectiveGap))
                          const prevIdx = Math.max(0, groupIndex - visibleColumns + 2)
                          targetScroll = cardScrollPosition(prevIdx, columnWidth, effectiveGap) - DASHBOARD_GAP
                        } else {
                          targetScroll = cardScrollPosition(groupIndex, columnWidth, effectiveGap) - DASHBOARD_GAP
                        }
                        smoothScrollTo(Math.max(0, targetScroll), 500)
                      }
                    }
                  }))
                }, 50)
              }
            : undefined}
          onRemoveInstance={group.type === 'adversary'
            ? () => {
                const isMinion = group.template?.type === 'Minion'
                const instancesToRemove = isMinion ? pcCount : 1
                const instances = [...group.instances]
                  .sort((a, b) => (b.duplicateNumber || 1) - (a.duplicateNumber || 1))
                if (instances.length === 0) return
                const isLastInstance = Math.max(0, instances.length - instancesToRemove) === 0
                const instancesToDelete = instances.slice(0, instancesToRemove)

                if (isLastInstance && !isGrouped) {
                  const groupIndex = entityGroups.findIndex(
                    g => g.baseName === group.baseName && g.type === 'adversary')
                  const isLeftmostColumn = groupIndex === 0
                  let wasAtMaxScroll = false
                  if (scrollContainerRef.current) {
                    const c = scrollContainerRef.current
                    wasAtMaxScroll = Math.abs(c.scrollLeft - (c.scrollWidth - c.clientWidth)) < 1
                  }
                  setRemovingCardSpacer({ baseName: group.baseName, groupIndex })
                  setSpacerShrinking(false)
                  if (isLeftmostColumn && scrollContainerRef.current) {
                    scrollContainerRef.current.style.scrollSnapType = 'none'
                  }
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
                          const tick = () => {
                            if (!scrollContainerRef.current) return
                            scrollContainerRef.current.scrollLeft =
                              scrollContainerRef.current.scrollWidth - scrollContainerRef.current.clientWidth
                            if (performance.now() - startTime < duration) requestAnimationFrame(tick)
                          }
                          requestAnimationFrame(tick)
                        }
                        setTimeout(() => {
                          setRemovingCardSpacer(null)
                          setSpacerShrinking(false)
                          if (isLeftmostColumn && scrollContainerRef.current) {
                            scrollContainerRef.current.style.scrollSnapType = 'x mandatory'
                          }
                          if (wasAtMaxScroll && scrollContainerRef.current) {
                            scrollContainerRef.current.scrollLeft =
                              scrollContainerRef.current.scrollWidth - scrollContainerRef.current.clientWidth
                          }
                        }, 300)
                      }, 50)
                    }))
                  }))
                } else {
                  instancesToDelete.forEach(inst => deleteAdversary(inst.id))
                }
              }
            : undefined}
        />
      </Panel>
    )
  }

  // ─── Build render items ─────────────────────────────────────────────────────

  const sections = buildSections(entityGroups)
  const items = []

  sections.forEach((section, sectionIndex) => {
    const isFirstSection = sectionIndex === 0
    const isLastSection = sectionIndex === sections.length - 1
    const prevIsGrouped = sectionIndex > 0 && sections[sectionIndex - 1].type === 'grouped'
    const needsDoubleGap = section.type === 'grouped' && prevIsGrouped

    if (section.type === 'grouped') {
      const { groupName, entries, startFlatIndex } = section
      const sectionKey = `group-section-${groupName}-${startFlatIndex}`

      const cards = entries.map((group, i) => {
        const isFirst = isFirstSection && i === 0
        const isLast = isLastSection && i === entries.length - 1
        const cssClass = isFirst ? 'dashboard-column dashboard-column--first'
          : isLast ? 'dashboard-column dashboard-column--last'
          : 'dashboard-column'
        return renderCardPanel(group, startFlatIndex + i, cssClass, i === 0, i === entries.length - 1)
      })

      items.push(
        <div
          key={sectionKey}
          data-group-wrapper
          style={{
            display: 'flex',
            flexDirection: 'column',
            flexShrink: 0,
            flexGrow: 0,
            flex: 'none',
            position: 'relative',
            height: '100%',
          }}
        >
          {/* Bracket: filled rounded box behind cards */}
          <div data-group-bracket style={{
            position: 'absolute',
            top: GROUP_LABEL_BAR_HEIGHT / 2,
            bottom: DASHBOARD_GAP,
            left: -DASHBOARD_GAP,
            right: -DASHBOARD_GAP,
            border: '1px solid var(--bg-secondary)',
            borderRadius: 5,
            backgroundColor: 'var(--bg-secondary)',
            zIndex: -1,
            pointerEvents: 'none',
          }} />

          {/* Label row — sticky pill */}
          <div data-group-label style={{
            height: GROUP_LABEL_BAR_HEIGHT,
            flexShrink: 0,
            order: -1,
            display: 'flex',
            alignItems: 'center',
            paddingLeft: `${DASHBOARD_GAP}px`,
          }}>
            <span style={{
              position: 'sticky',
              left: DASHBOARD_GAP,
              zIndex: 1,
              fontSize: '0.72rem',
              fontWeight: 700,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--text-primary)',
              whiteSpace: 'nowrap',
              userSelect: 'none',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--text-secondary)',
              borderRadius: '3px',
              padding: '2px 8px',
            }}>
              {groupName}
            </span>
          </div>

          {/* Cards row */}
          <div data-group-cards style={{
            display: 'flex',
            flexDirection: 'row',
            gap: `${DASHBOARD_GAP}px`,
            alignItems: 'flex-start',
            height: `calc(100% - ${GROUP_LABEL_BAR_HEIGHT}px - ${DASHBOARD_GAP * 2}px)`,
          }}>
            {cards}
          </div>
        </div>
      )
    } else {
      const { entry: group, flatIndex } = section
      const cssClass = isFirstSection ? 'dashboard-column dashboard-column--first'
        : isLastSection ? 'dashboard-column dashboard-column--last'
        : 'dashboard-column'
      items.push(renderCardPanel(group, flatIndex, cssClass))
    }
  })

  // Spacer for animated card removal (non-grouped mode only)
  if (!isGrouped && removingCardSpacer &&
      !items.some(item => item?.key === `spacer-${removingCardSpacer.baseName}`)) {
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
          scrollSnapAlign: 'none', overflow: 'hidden',
          display: 'flex', flexDirection: 'column', alignItems: 'stretch',
          height: '100%', opacity: 0,
          transition: 'width 0.3s ease, padding-top 0.3s ease, padding-bottom 0.3s ease',
        }}
      />
    )
  }

  return (
    <div
      ref={scrollContainerRef}
      className="dashboard-scroll-container"
      onScroll={onScroll}
      style={{
        gap: `${effectiveGap}px`,
        paddingLeft: `${edgePadding}px`,
        paddingRight: `${edgePadding}px`,
        scrollPaddingLeft: `${DASHBOARD_GAP}px`,
        scrollPaddingRight: `${edgePadding}px`,
      }}
    >
      {items.length > 0 ? items : null}
      {browserOpenAtPosition !== null && (
        <div data-no-slide style={{ width: `${columnWidth}px`, flexShrink: 0, flexGrow: 0, flex: 'none', height: '100%' }} />
      )}
    </div>
  )
}

export default EntityColumns
