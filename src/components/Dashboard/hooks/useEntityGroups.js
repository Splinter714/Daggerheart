import { useCallback, useMemo } from 'react'
import { applySort, getGroupLabel } from './useDashboardSortGroup'

/**
 * Builds the ordered list of entity groups (environments + adversaries) for
 * the rendering layer. Environments always appear first with a fixed groupName
 * of "environment: [type]". Adversaries follow with optional grouping.
 */
export const useEntityGroups = (adversaryGroups, environments = [], sortBy = 'name', sortDir = 'asc', groupBy = 'none') => {
  const getEntityGroups = useCallback(() => {
    // Environments always come first, sorted by type then name, always grouped
    const envGroups = [...environments]
      .sort((a, b) => {
        const tc = (a.type || '').localeCompare(b.type || '')
        return tc !== 0 ? tc : (a.name || '').localeCompare(b.name || '')
      })
      .map((env) => ({
        type: 'environment',
        baseName: env.name,
        template: env,
        instances: [env],
        groupName: `environment: ${(env.type || 'unknown').toLowerCase()}`,
      }))

    const sortedAdversaryGroups = applySort(adversaryGroups, sortBy, sortDir, groupBy)
    const advGroups = sortedAdversaryGroups.map((group) => ({
      type: 'adversary',
      baseName: group.baseName,
      template: group,
      instances: group.instances,
      groupName: groupBy !== 'none' ? getGroupLabel(group, groupBy) : null,
    }))

    return [...envGroups, ...advGroups]
  }, [adversaryGroups, environments, sortBy, sortDir, groupBy])

  const entityGroups = useMemo(() => getEntityGroups(), [getEntityGroups])

  return { entityGroups, getEntityGroups }
}
