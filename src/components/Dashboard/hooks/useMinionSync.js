import { useEffect, useRef } from 'react'

const buildAdversaryGroups = (adversaries = []) => {
  return adversaries.reduce((result, adversary) => {
    const baseName = adversary.baseName || adversary.name?.replace(/\s+\(\d+\)$/, '') || adversary.name || 'Unknown'
    if (!result[baseName]) {
      result[baseName] = {
        type: 'adversary',
        baseName,
        instances: [],
      }
    }
    result[baseName].instances.push(adversary)
    return result
  }, {})
}

export const useMinionSync = (adversaries, pcCount, createAdversariesBulk, deleteAdversary) => {
  const prevPartySizeRef = useRef(pcCount)

  useEffect(() => {
    const prevPcCount = prevPartySizeRef.current
    if (prevPcCount !== pcCount && prevPcCount > 0) {
      const groups = buildAdversaryGroups(adversaries)
      Object.values(groups).forEach((group) => {
        if (group.type !== 'adversary' || group.instances.length === 0) return
        const firstInstance = group.instances[0]
        if (firstInstance.type !== 'Minion') return

        const currentInstances = group.instances.length
        const currentGroups = Math.ceil(currentInstances / prevPcCount)
        const desiredInstances = currentGroups * pcCount

        if (desiredInstances === currentInstances) return

        if (desiredInstances > currentInstances) {
          const instancesToAdd = desiredInstances - currentInstances
          const newInstances = Array(instancesToAdd)
            .fill(null)
            .map(() => ({ ...firstInstance }))
          createAdversariesBulk(newInstances)
        } else {
          const instancesToRemove = currentInstances - desiredInstances
          const instancesToDelete = group.instances.slice(-instancesToRemove)
          instancesToDelete.forEach((instance) => deleteAdversary(instance.id))
        }
      })

      prevPartySizeRef.current = pcCount
    } else if (prevPcCount === 0 || prevPartySizeRef.current === 0) {
      prevPartySizeRef.current = pcCount
    }
  }, [adversaries, pcCount, createAdversariesBulk, deleteAdversary])
}

