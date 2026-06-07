import { useCallback, useMemo } from 'react'
import { applySort, getGroupLabel } from './useDashboardSortGroup'

/**
 * Combines adversary groups (already grouped in state) with countdowns into
 * a single list for the rendering layer to treat each as a column.
 * Applies sort and optional grouping to adversary groups.
 */
export const useEntityGroups = (adversaryGroups, countdowns, sortBy = 'name', sortDir = 'asc', groupBy = 'none') => {
  const getEntityGroups = useCallback(() => {
    const groups = []

    const sortedAdversaryGroups = applySort(adversaryGroups, sortBy, sortDir)

    let lastGroupLabel = null

    sortedAdversaryGroups.forEach((group) => {
      let groupLabel = null
      if (groupBy !== 'none') {
        const label = getGroupLabel(group, groupBy)
        if (label !== lastGroupLabel) {
          groupLabel = label
          lastGroupLabel = label
        }
      }

      groups.push({
        type: 'adversary',
        baseName: group.baseName,
        template: group,
        instances: group.instances,
        groupLabel,
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
  }, [adversaryGroups, countdowns, sortBy, sortDir, groupBy])

  const entityGroups = useMemo(() => getEntityGroups(), [getEntityGroups])

  return { entityGroups, getEntityGroups }
}
