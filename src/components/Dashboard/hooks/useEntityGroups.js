import { useCallback, useMemo } from 'react'

/**
 * Groups dashboard entities (adversaries + countdowns) so the rendering layer
 * can treat each group as a column. Previously this logic lived inline in
 * DashboardView; pulling it into a hook keeps the view component focused on UI.
 */
export const useEntityGroups = (adversaries, countdowns) => {
  const getEntityGroups = useCallback(() => {
    const groups = {}

    adversaries.forEach((adversary) => {
      const baseName = adversary.baseName || adversary.name?.replace(/\s+\(\d+\)$/, '') || adversary.name
      if (!groups[baseName]) {
        groups[baseName] = {
          type: 'adversary',
          baseName,
          instances: []
        }
      }
      groups[baseName].instances.push(adversary)
    })

    countdowns.forEach((countdown) => {
      groups[`countdown-${countdown.id}`] = {
        type: 'countdown',
        baseName: countdown.name,
        instances: [countdown]
      }
    })

    return Object.values(groups)
  }, [adversaries, countdowns])

  const entityGroups = useMemo(() => getEntityGroups(), [getEntityGroups])

  return { entityGroups, getEntityGroups }
}

