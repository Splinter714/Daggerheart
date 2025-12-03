import { useCallback } from 'react'
import { DASHBOARD_GAP } from '../constants'

/**
 * Returns the monster addition handler that used to live inline in
 * DashboardView. Keeping it here makes the parent component far easier to scan
 * while preserving the scroll/animation behavior.
 */
export const useAdversaryAddition = ({
  entityGroups,
  pcCount,
  scrollContainerRef,
  createAdversariesBulk,
  createAdversary,
  setNewCards,
  getEntityGroups,
  smoothScrollTo,
  browserOpenAtPosition,
  columnWidth
}) => {
  return useCallback(
    (itemData) => {
      const baseName = itemData.baseName || itemData.name?.replace(/\s+\(\d+\)$/, '') || itemData.name
      const existingGroup = entityGroups.find((g) => g.baseName === baseName && g.type === 'adversary')
      const isNewAdversary = !existingGroup

      const isMinion = itemData.type === 'Minion'
      const instancesToAdd = isMinion ? pcCount : 1

      const scrollWidthBeforeAdd = scrollContainerRef.current?.scrollWidth ?? 0
      const scrollLeftBeforeAdd = scrollContainerRef.current?.scrollLeft ?? 0

      const container = scrollContainerRef.current
      if (container && isNewAdversary) {
        const computedStyle = window.getComputedStyle(container)
        if (computedStyle.scrollSnapType !== 'none') {
          container.style.scrollSnapType = 'none'
        }
      }

      if (isMinion && instancesToAdd > 1) {
        const minionArray = Array(instancesToAdd)
          .fill(null)
          .map(() => ({ ...itemData }))
        createAdversariesBulk(minionArray)
      } else {
        createAdversary(itemData)
      }

      if (isNewAdversary) {
        const cardKey = `adversary-${baseName}`
        setNewCards((prev) => new Set(prev).add(cardKey))
        setTimeout(() => {
          setNewCards((prev) => {
            const next = new Set(prev)
            next.delete(cardKey)
            return next
          })
        }, 10)
      }

      setTimeout(() => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            if (!scrollContainerRef.current) return

            const container = scrollContainerRef.current
            if (container.scrollWidth <= container.clientWidth) {
              return
            }

            if (isNewAdversary) {
              const initialScrollWidth = container.scrollWidth
              setTimeout(() => {
                if (!scrollContainerRef.current) return
                const updatedContainer = scrollContainerRef.current

                const maybeScroll = () => {
                  if (!scrollContainerRef.current) return
                  const finalContainer = scrollContainerRef.current
                  const maxScroll = finalContainer.scrollWidth - finalContainer.clientWidth
                  const distance = maxScroll - scrollLeftBeforeAdd
                  const scrollWidthIncreased = finalContainer.scrollWidth > scrollWidthBeforeAdd

                  if (scrollWidthIncreased && Math.abs(distance) < 1) {
                    smoothScrollTo(maxScroll + 10, 500)
                  } else if (Math.abs(distance) > 1) {
                    smoothScrollTo(maxScroll, 500)
                  }
                }

                if (updatedContainer.scrollWidth !== initialScrollWidth) {
                  requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                      maybeScroll()
                    })
                  })
                } else {
                  maybeScroll()
                }
              }, 10)
            } else {
              const updatedGroups = getEntityGroups()
              const groupIndex = updatedGroups.findIndex((g) => g.baseName === baseName && g.type === 'adversary')
              if (groupIndex >= 0) {
                const container = scrollContainerRef.current
                const currentScroll = container.scrollLeft
                const containerWidth = container.clientWidth
                const effectiveWidth =
                  browserOpenAtPosition !== null ? containerWidth - (columnWidth + DASHBOARD_GAP) : containerWidth

                // Account for left padding: DASHBOARD_GAP + groupIndex * (columnWidth + DASHBOARD_GAP)
                const cardPosition = DASHBOARD_GAP + groupIndex * (columnWidth + DASHBOARD_GAP)
                const cardEnd = cardPosition + columnWidth
                const margin = 10
                const isVisible = cardPosition >= currentScroll - margin && cardEnd <= currentScroll + effectiveWidth + margin

                if (!isVisible) {
                  smoothScrollTo(cardPosition, 500)
                }
              }
            }
          })
        })
      }, 50)
    },
    [
      browserOpenAtPosition,
      columnWidth,
      createAdversariesBulk,
      createAdversary,
      entityGroups,
      getEntityGroups,
      pcCount,
      scrollContainerRef,
      setNewCards,
      smoothScrollTo
    ]
  )
}

