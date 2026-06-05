import { useEffect, useRef } from 'react'

export const useMinionSync = (adversaryGroups, pcCount, createAdversariesBulk, deleteAdversary) => {
  const prevPartySizeRef = useRef(pcCount)

  useEffect(() => {
    const prevPcCount = prevPartySizeRef.current
    if (prevPcCount !== pcCount && prevPcCount > 0) {
      adversaryGroups.forEach((group) => {
        if (group.instances.length === 0) return
        if (group.type !== 'Minion') return  // group.type is the adversary type (Solo, Minion, etc.)

        const currentInstances = group.instances.length
        const currentGroups = Math.ceil(currentInstances / prevPcCount)
        const desiredInstances = currentGroups * pcCount

        if (desiredInstances === currentInstances) return

        if (desiredInstances > currentInstances) {
          const instancesToAdd = desiredInstances - currentInstances
          const newInstances = Array(instancesToAdd).fill(null).map(() => ({ ...group }))
          createAdversariesBulk(newInstances)
        } else {
          const instancesToRemove = currentInstances - desiredInstances
          const sorted = [...group.instances].sort((a, b) => (b.duplicateNumber || 1) - (a.duplicateNumber || 1))
          sorted.slice(0, instancesToRemove).forEach((inst) => deleteAdversary(inst.id))
        }
      })

      prevPartySizeRef.current = pcCount
    } else if (prevPcCount === 0 || prevPartySizeRef.current === 0) {
      prevPartySizeRef.current = pcCount
    }
  }, [adversaryGroups, pcCount, createAdversariesBulk, deleteAdversary])
}
