import React from 'react'
import Panel from './Panels'
import GameCard from '../Adversaries/GameCard'

const EntityColumns = ({
  entityGroups,
  columnWidth,
  gap,
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
}) => {
  return (
    <div ref={scrollContainerRef} className="dashboard-scroll-container" onScroll={onScroll}>
      {entityGroups.length === 0
        ? null
        : (() => {
            const items = []

            entityGroups.forEach((group) => {
              const isSpacerPosition =
                removingCardSpacer && removingCardSpacer.baseName === group.baseName && group.type === 'adversary'

              if (isSpacerPosition) {
                items.push(
                  <Panel
                    key={`spacer-${removingCardSpacer.baseName}`}
                    style={{
                      width: spacerShrinking ? '0px' : `${columnWidth}px`,
                      flexShrink: 0,
                      flexGrow: 0,
                      flex: 'none',
                      paddingRight: '0',
                      paddingTop: spacerShrinking ? '0px' : `${gap}px`,
                      paddingBottom: spacerShrinking ? '0px' : `${gap}px`,
                      scrollSnapAlign: 'none',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'stretch',
                      height: '100%',
                      opacity: 0,
                      transition: 'width 0.3s ease, padding-top 0.3s ease, padding-bottom 0.3s ease',
                    }}
                  />,
                )
                return
              }

              items.push(
                <Panel
                  key={`${group.type}-${group.baseName}`}
                  style={{
                    width: `${columnWidth}px`,
                    flexShrink: 0,
                    flexGrow: 0,
                    flex: 'none',
                    paddingRight: '0',
                    paddingTop: `${group.type === 'adversary' ? gap + 52 : gap}px`,
                    paddingBottom: `${gap}px`,
                    scrollSnapAlign: 'start',
                    overflow: group.type === 'adversary' ? 'visible' : 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'stretch',
                    height: 'auto',
                    opacity: newCards.has(`${group.type}-${group.baseName}`) ? 0 : 1,
                    transition: 'opacity 0.2s ease',
                  }}
                >
                  <GameCard
                    type={group.type}
                    item={{
                      ...group.instances[0],
                      name: group.instances[0]?.name || group.baseName,
                      hp: 0,
                      stress: 0,
                      isDead: false,
                    }}
                    mode="expanded"
                    instances={group.instances}
                    showCustomCreator={
                      group.type === 'adversary' && editingAdversaryId && group.instances.some((i) => i.id === editingAdversaryId)
                    }
                    onSaveCustomAdversary={
                      group.type === 'adversary' && editingAdversaryId && group.instances.some((i) => i.id === editingAdversaryId)
                        ? handleSaveCustomAdversary
                        : undefined
                    }
                    onCancelEdit={
                      group.type === 'adversary' && editingAdversaryId && group.instances.some((i) => i.id === editingAdversaryId)
                        ? handleCancelEdit
                        : undefined
                    }
                    isStockAdversary={
                      group.type === 'adversary' && editingAdversaryId && group.instances.some((i) => i.id === editingAdversaryId)
                        ? !group.instances[0]?.source || group.instances[0]?.source !== 'Homebrew'
                        : false
                    }
                    onApplyDamage={
                      group.type === 'adversary'
                        ? (id, damage) => {
                            const instance = group.instances.find((i) => i.id === id)
                            if (instance) {
                              updateAdversary(id, { hp: Math.min(instance.hpMax || 1, (instance.hp || 0) + damage) })
                            }
                          }
                        : undefined
                    }
                    onApplyHealing={
                      group.type === 'adversary'
                        ? (id, healing) => {
                            const instance = group.instances.find((i) => i.id === id)
                            if (instance) {
                              updateAdversary(id, { hp: Math.max(0, (instance.hp || 0) - healing) })
                            }
                          }
                        : undefined
                    }
                    onApplyStressChange={
                      group.type === 'adversary'
                        ? (id, stress) =>
                            updateAdversary(id, {
                              stress: Math.max(
                                0,
                                Math.min(
                                  group.instances.find((i) => i.id === id)?.stressMax || 6,
                                  (group.instances.find((i) => i.id === id)?.stress || 0) + stress,
                                ),
                              ),
                            })
                        : undefined
                    }
                    onUpdate={
                      group.type === 'adversary'
                        ? updateAdversary
                        : group.type === 'environment'
                        ? updateEnvironment
                        : updateCountdown
                    }
                    adversaries={adversaries}
                    showAddRemoveButtons={browserOpenAtPosition !== null && group.type === 'adversary'}
                    onEdit={group.type === 'adversary' ? (itemId) => handleEditAdversary(itemId) : undefined}
                    onAddInstance={
                      group.type === 'adversary'
                        ? (item) => {
                            const isMinion = item.type === 'Minion'
                            const instancesToAdd = isMinion ? pcCount : 1

                            if (isMinion && instancesToAdd > 1) {
                              const instancesArray = Array(instancesToAdd)
                                .fill(null)
                                .map(() => ({ ...item }))
                              createAdversariesBulk(instancesArray)
                            } else {
                              createAdversary(item)
                            }

                            setTimeout(() => {
                              requestAnimationFrame(() => {
                                requestAnimationFrame(() => {
                                  if (!scrollContainerRef.current) return
                                  const container = scrollContainerRef.current
                                  const currentScroll = container.scrollLeft
                                  const containerWidth = container.clientWidth
                                  const effectiveWidth =
                                    browserOpenAtPosition !== null ? containerWidth - (columnWidth + gap) : containerWidth

                                  const updatedGroups = getEntityGroups()
                                  const groupIndex = updatedGroups.findIndex(
                                    (g) => g.baseName === group.baseName && g.type === 'adversary',
                                  )
                                  if (groupIndex >= 0) {
                                    // Account for left padding: gap + groupIndex * (columnWidth + gap)
                                    const cardPosition = gap + groupIndex * (columnWidth + gap)
                                    const cardEnd = cardPosition + columnWidth
                                    const margin = 10
                                    const isVisible =
                                      cardPosition >= currentScroll - margin &&
                                      cardEnd <= currentScroll + effectiveWidth + margin

                                    if (!isVisible) {
                                      smoothScrollTo(cardPosition, 500)
                                    }
                                  }
                                })
                              })
                            }, 50)
                          }
                        : undefined
                    }
                    onRemoveInstance={
                      group.type === 'adversary'
                        ? () => {
                            const firstInstance = group.instances[0]
                            const isMinion = firstInstance?.type === 'Minion'
                            const instancesToRemove = isMinion ? pcCount : 1
                            const instances = group.instances.sort((a, b) => {
                              const aNum = a.duplicateNumber || 1
                              const bNum = b.duplicateNumber || 1
                              return bNum - aNum
                            })
                            const instancesAfterRemoval = Math.max(0, instances.length - instancesToRemove)
                            const isLastInstance = instancesAfterRemoval === 0

                            if (instances.length === 0) {
                              return
                            }

                            const instancesToDelete = instances.slice(0, instancesToRemove)

                            if (isLastInstance) {
                              const groupIndex = entityGroups.findIndex(
                                (g) => g.baseName === group.baseName && g.type === 'adversary',
                              )
                              const isLeftmostColumn = groupIndex === 0
                              let wasAtMaxScroll = false

                              if (scrollContainerRef.current) {
                                const container = scrollContainerRef.current
                                const currentScroll = container.scrollLeft
                                const maxScroll = container.scrollWidth - container.clientWidth
                                wasAtMaxScroll = Math.abs(currentScroll - maxScroll) < 1
                              }

                              setRemovingCardSpacer({ baseName: group.baseName, groupIndex })
                              setSpacerShrinking(false)

                              if (isLeftmostColumn && scrollContainerRef.current) {
                                scrollContainerRef.current.style.scrollSnapType = 'none'
                              }

                              requestAnimationFrame(() => {
                                requestAnimationFrame(() => {
                                  if (scrollContainerRef.current) {
                                    scrollContainerRef.current.offsetHeight
                                  }

                                  instancesToDelete.forEach((instance) => {
                                    deleteAdversary(instance.id)
                                  })

                                  requestAnimationFrame(() => {
                                    requestAnimationFrame(() => {
                                      if (scrollContainerRef.current) {
                                        scrollContainerRef.current.offsetHeight
                                      }

                                      setTimeout(() => {
                                        setSpacerShrinking(true)

                                        if (wasAtMaxScroll && scrollContainerRef.current) {
                                          const startTime = performance.now()
                                          const duration = 300

                                          const maintainScroll = () => {
                                            if (!scrollContainerRef.current) return
                                            const container = scrollContainerRef.current
                                            const newMaxScroll = container.scrollWidth - container.clientWidth
                                            container.scrollLeft = newMaxScroll

                                            if (performance.now() - startTime < duration) {
                                              requestAnimationFrame(maintainScroll)
                                            }
                                          }

                                          requestAnimationFrame(maintainScroll)
                                        }

                                        setTimeout(() => {
                                          setRemovingCardSpacer(null)
                                          setSpacerShrinking(false)

                                          if (isLeftmostColumn && scrollContainerRef.current) {
                                            scrollContainerRef.current.style.scrollSnapType = 'x mandatory'
                                          }

                                          if (wasAtMaxScroll && scrollContainerRef.current) {
                                            const container = scrollContainerRef.current
                                            container.scrollLeft = container.scrollWidth - container.clientWidth
                                          }
                                        }, 300)
                                      }, 50)
                                    })
                                  })
                                })
                              })
                            } else {
                              instancesToDelete.forEach((instance) => {
                                deleteAdversary(instance.id)
                              })
                            }
                          }
                        : undefined
                    }
                  />
                </Panel>,
              )
            })

            if (removingCardSpacer && !items.some((item) => item?.key === `spacer-${removingCardSpacer.baseName}`)) {
              const insertIndex = Math.min(removingCardSpacer.groupIndex, items.length)
              items.splice(
                insertIndex,
                0,
                <Panel
                  key={`spacer-${removingCardSpacer.baseName}`}
                  style={{
                    width: spacerShrinking ? '0px' : `${columnWidth}px`,
                    flexShrink: 0,
                    flexGrow: 0,
                    flex: 'none',
                    paddingRight: '0',
                    paddingTop: spacerShrinking ? '0px' : `${gap}px`,
                    paddingBottom: spacerShrinking ? '0px' : `${gap}px`,
                    scrollSnapAlign: 'none',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'stretch',
                    height: '100%',
                    opacity: 0,
                    transition: 'width 0.3s ease, padding-top 0.3s ease, padding-bottom 0.3s ease',
                  }}
                />,
              )
            }

            return items
          })()}
      {browserOpenAtPosition !== null && (
        <div
          style={{
            width: `${columnWidth}px`,
            flexShrink: 0,
            flexGrow: 0,
            flex: 'none',
            height: '100%',
          }}
        />
      )}
    </div>
  )
}

export default EntityColumns

