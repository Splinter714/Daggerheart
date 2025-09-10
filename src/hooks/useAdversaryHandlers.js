import { useCallback } from 'react'

export default function useAdversaryHandlers({ adversaries, updateAdversary, deleteAdversary, setSelectedItem }) {
  const handleAdversaryDamage = useCallback((id, damage, currentHp, maxHp) => {
    const target = adversaries.find(adv => adv.id === id)
    if (!target) return
    const isMinion = target.type === 'Minion'
    const minionFeature = target.features?.find(f => f.name?.startsWith('Minion ('))
    const threshold = minionFeature ? parseInt(minionFeature.name.match(/\((\d+)\)/)?.[1] || '1') : 1
    if (isMinion) {
      deleteAdversary(id)
      const additional = Math.floor(damage / threshold)
      if (additional > 0) {
        const sameType = adversaries.filter(adv => adv.type === 'Minion' && adv.id !== id && adv.name === target.name)
        for (let i = 0; i < Math.min(additional, sameType.length); i++) {
          deleteAdversary(sameType[i].id)
        }
      }
      return
    }
    const newHp = Math.min(currentHp + damage, maxHp)
    if (setSelectedItem && setSelectedItem.id === id) {
      setSelectedItem(prev => ({ ...prev, hp: newHp }))
    }
    updateAdversary(id, { hp: newHp })
  }, [adversaries, updateAdversary, deleteAdversary, setSelectedItem])

  const handleAdversaryHealing = useCallback((id, healing, currentHp) => {
    const newHp = Math.max(0, currentHp - healing)
    if (setSelectedItem && setSelectedItem.id === id) {
      setSelectedItem(prev => ({ ...prev, hp: newHp }))
    }
    updateAdversary(id, { hp: newHp })
  }, [updateAdversary, setSelectedItem])

  const handleAdversaryStressChange = useCallback((id, stressDelta, currentStress, maxStress) => {
    const adv = adversaries.find(a => a.id === id)
    if (!adv) return
    let newStress = currentStress + stressDelta
    let newHp = adv.hp || 0
    if (newStress > maxStress) {
      const overflow = newStress - maxStress
      newStress = maxStress
      newHp = Math.min(adv.hpMax || 0, newHp + overflow)
    }
    newStress = Math.max(0, newStress)
    if (setSelectedItem && setSelectedItem.id === id) {
      setSelectedItem(prev => ({ ...prev, stress: newStress, hp: newHp }))
    }
    updateAdversary(id, { stress: newStress, hp: newHp })
  }, [adversaries, updateAdversary, setSelectedItem])

  return { handleAdversaryDamage, handleAdversaryHealing, handleAdversaryStressChange }
}


