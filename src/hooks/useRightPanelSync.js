import { useEffect } from 'react'

export default function useRightPanelSync({
  selectedItem,
  selectedType,
  countdowns,
  adversaries,
  environments,
  setSelectedItem,
  handleCloseRightColumn
}) {
  useEffect(() => {
    if (!selectedItem) return
    if (selectedType === 'countdown' && countdowns) {
      const updated = countdowns.find(c => c.id === selectedItem.id)
      if (updated) {
        if (
          updated.value !== selectedItem.value ||
          updated.max !== selectedItem.max ||
          updated.description !== selectedItem.description
        ) {
          setSelectedItem(updated)
        }
      } else {
        handleCloseRightColumn()
      }
    } else if (selectedType === 'adversary' && adversaries) {
      const updated = adversaries.find(a => a.id === selectedItem.id)
      if (updated) {
        if (
          updated.hp !== selectedItem.hp ||
          updated.stress !== selectedItem.stress ||
          updated.isVisible !== selectedItem.isVisible
        ) {
          setSelectedItem(updated)
        }
      } else {
        handleCloseRightColumn()
      }
    } else if (selectedType === 'environment' && environments) {
      const updated = environments.find(e => e.id === selectedItem.id)
      if (updated) {
        if (updated.isVisible !== selectedItem.isVisible) {
          setSelectedItem(updated)
        }
      } else {
        handleCloseRightColumn()
      }
    }
  }, [selectedItem, selectedType, countdowns, adversaries, environments, setSelectedItem, handleCloseRightColumn])
}


