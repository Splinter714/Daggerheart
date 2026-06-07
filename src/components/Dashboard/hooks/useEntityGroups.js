import { useCallback, useMemo } from 'react'
import { applySort, getGroupLabel } from './useDashboardSortGroup'

/**
 * Combines adversary groups (already grouped in state) with countdowns into
 * a single list for the rendering layer to treat each as a column.
 * Applies sort and optional grouping to adversary groups.
 *
 * When groupBy is active, every adversary entry carries a `groupName` string
 * so EntityColumns can identify and wrap same-group runs into a single row
 * with a shared sticky header above all the cards.
 */
export const useEntityGroups = (adversaryGroups, countdowns, sortBy = 'name', sortDir = 'asc', groupBy = 'none') => {
  const getEntityGroups = useCallback(() => {
    const groups = []

    const sortedAdversaryGroups = applySort(adversaryGroups, sortBy, sortDir)

    sortedAdversaryGroups.forEach((group) => {
      const groupName = groupBy !== 'none' ? getGroupLabel(group, groupBy) : null

      groups.push({
        type: 'adversary',
        baseName: group.baseName,
        template: group,
        instances: group.instances,
        groupName,
      })
    })

    countdowns.forEach((countdown) => {
      groups.push({
        type: 'countdown',
        baseName: countdown.name,
        template: countdown,
        instances: [countdown],
        groupName: null,
      })
    })

    return groups
  }, [adversaryGroups, countdowns, sortBy, sortDir, groupBy])

  const entityGroups = useMemo(() => getEntityGroups(), [getEntityGroups])

  return { entityGroups, getEntityGroups }
}
