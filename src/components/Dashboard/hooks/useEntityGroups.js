import { useCallback, useMemo } from 'react'
import { applySort, getGroupLabel } from './useDashboardSortGroup'

/**
 * Builds the ordered list of adversary groups for the rendering layer to treat
 * each as a column. Applies sort and optional grouping to adversary groups.
 *
 * When groupBy is active, every adversary entry carries a `groupName` string
 * so EntityColumns can identify and wrap same-group runs into a single row
 * with a shared sticky header above all the cards.
 */
export const useEntityGroups = (adversaryGroups, sortBy = 'name', sortDir = 'asc', groupBy = 'none') => {
  const getEntityGroups = useCallback(() => {
    const sortedAdversaryGroups = applySort(adversaryGroups, sortBy, sortDir, groupBy)

    return sortedAdversaryGroups.map((group) => ({
      type: 'adversary',
      baseName: group.baseName,
      template: group,
      instances: group.instances,
      groupName: groupBy !== 'none' ? getGroupLabel(group, groupBy) : null,
    }))
  }, [adversaryGroups, sortBy, sortDir, groupBy])

  const entityGroups = useMemo(() => getEntityGroups(), [getEntityGroups])

  return { entityGroups, getEntityGroups }
}
