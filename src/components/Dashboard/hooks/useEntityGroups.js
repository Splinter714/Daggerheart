import { useCallback, useMemo } from 'react'
import { applySort, getGroupLabel } from './useDashboardSortGroup'

/**
 * Combines adversary groups (already grouped in state) with countdowns into
 * a single list for the rendering layer to treat each as a column.
 * Applies sort and optional grouping to adversary groups.
 */
export const useEntityGroups = (adversaryGroups, countdowns, sortBy = 'name-asc', groupBy = 'none') => {
  const getEntityGroups = useCallback(() => {
    const groups = []

    const sortedAdversaryGroups = applySort(adversaryGroups, sortBy)

    let lastGroupLabel = null

    sortedAdversaryGroups.forEach((group) => {
      if (groupBy !== 'none') {
        const label = getGroupLabel(group, groupBy)
        if (label !== lastGroupLabel) {
          groups.push({
            type: 'separator',
            baseName: `separator-${label}-${groups.length}`,
            label,
          })
          lastGroupLabel = label
        }
      }

      groups.push({
        type: 'adversary',
        baseName: group.baseName,
        template: group,
        instances: group.instances,
      })
    })

    countdowns.forEach((countdown) => {
      groups.push({
        type: 'countdown',
        baseName: countdown.name,
        template: countdown,
        instances: [countdown],
      })
    })

    return groups
  }, [adversaryGroups, countdowns, sortBy, groupBy])

  const entityGroups = useMemo(() => getEntityGroups(), [getEntityGroups])

  return { entityGroups, getEntityGroups }
}
