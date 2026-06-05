import { useCallback, useMemo } from 'react'

/**
 * Combines adversary groups (already grouped in state) with countdowns into
 * a single list for the rendering layer to treat each as a column.
 */
export const useEntityGroups = (adversaryGroups, countdowns) => {
  const getEntityGroups = useCallback(() => {
    const groups = []

    adversaryGroups.forEach((group) => {
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
  }, [adversaryGroups, countdowns])

  const entityGroups = useMemo(() => getEntityGroups(), [getEntityGroups])

  return { entityGroups, getEntityGroups }
}
