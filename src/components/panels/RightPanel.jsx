import React, { Suspense } from 'react'
import PanelShell from './PanelShell'
import Cards from '../cards/Cards'
import Browser from '../browser/Browser'
import AdversaryCreatorMockup from '../editor/AdversaryCreatorMockup'

const Creator = React.lazy(() => import('../editor/Creator'))

const RightPanel = ({
  showMockup,
  creatorFormData,
  setCreatorFormData,
  rightColumnMode,
  databaseType,
  selectedItem,
  selectedType,
  isEditMode,
  createAdversary,
  createEnvironment,
  createCountdown,
  updateAdversary,
  updateEnvironment,
  advanceCountdown,
  onClose,
  onOpenCreator,
  onToggleVisibility,
  onReorder,
  onApplyDamage,
  onApplyHealing,
  onApplyStressChange,
  onExitEditMode
}) => {
  if (showMockup && rightColumnMode === null) {
    return (
      <PanelShell className="right-panel-shell">
        <div className="creator-header">
          <h3>New Adversary</h3>
        </div>
        <AdversaryCreatorMockup 
          formData={creatorFormData}
          setFormData={setCreatorFormData}
        />
      </PanelShell>
    )
  }

  return (
    <PanelShell className="right-panel-shell">
      {rightColumnMode === 'item' && selectedItem && (
        <div className="item-display" onClick={(e) => e.stopPropagation()}>
          <Cards
            item={selectedItem}
            type={selectedType}
            mode="expanded"
            isEditMode={isEditMode}
            onDelete={() => onClose()}
            onEdit={() => onOpenCreator(selectedType)}
            onToggleVisibility={() => onToggleVisibility(selectedItem.id, selectedType, selectedItem.isVisible)}
            onReorder={(newOrder) => onReorder(selectedType, newOrder)}
            onApplyDamage={onApplyDamage}
            onApplyHealing={onApplyHealing}
            onApplyStressChange={onApplyStressChange}
            onAdvance={selectedType === 'countdown' ? advanceCountdown : undefined}
            onSave={(updatedItem) => {
              if (selectedType === 'adversary') {
                updateAdversary(updatedItem.id, updatedItem)
                // Force a re-render by updating the selectedItem reference
                // This ensures the Cards component gets the updated data
                console.log('RightPanel: Updated adversary, should trigger re-render')
              } else if (selectedType === 'environment') {
                updateEnvironment(updatedItem.id, updatedItem)
              }
            }}
            onExitEditMode={() => onExitEditMode && onExitEditMode()}
          />
        </div>
      )}

      {rightColumnMode === 'database' && (
        <div className="database-display" onClick={(e) => e.stopPropagation()}>
          <Browser
            type={databaseType}
            onAddItem={(itemData) => {
              if (databaseType === 'adversary') {
                createAdversary(itemData)
              } else if (databaseType === 'environment') {
                createEnvironment(itemData)
              }
            }}
            onCancel={onClose}
            onCreateCustom={() => onOpenCreator(databaseType)}
          />
        </div>
      )}

      {rightColumnMode === 'creator' && (
        <div className="creator-display" onClick={(e) => e.stopPropagation()}>
          <Suspense fallback={<div style={{padding:'1rem'}}>Loading...</div>}>
            <Creator
              type={databaseType}
              item={null}
              source={databaseType === 'countdown' ? creatorFormData.source : undefined}
              onSave={(itemData) => {
                if (databaseType === 'adversary') {
                  createAdversary(itemData)
                } else if (databaseType === 'environment') {
                  createEnvironment(itemData)
                } else if (databaseType === 'countdown') {
                  createCountdown(itemData)
                }
                onClose()
              }}
              onCancel={onClose}
            />
          </Suspense>
        </div>
      )}
    </PanelShell>
  )
}

export default RightPanel


