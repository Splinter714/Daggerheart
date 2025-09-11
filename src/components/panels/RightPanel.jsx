import React, { Suspense } from 'react'
import PanelShell from './PanelShell'
import Cards from '../cards/Cards'

const Browser = React.lazy(() => import('../browser/Browser'))
const Creator = React.lazy(() => import('../editor/Creator'))

const RightPanel = ({
  showMockup,
  creatorFormData,
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
  if (showMockup) {
    return (
      <PanelShell className="right-panel-shell preview-right-column">
        <div className="preview-section">
          <Cards
            item={{
              ...creatorFormData,
              id: 'preview',
              hp: 0,
              stress: 0,
              experience: creatorFormData.experience
                .filter(exp => exp.name && exp.name.trim())
                .map(exp => `${exp.name} ${exp.modifier >= 0 ? '+' : ''}${exp.modifier}`),
              features: [
                ...creatorFormData.passiveFeatures.filter(f => f.name && f.name.trim()).map(f => ({ ...f, type: 'Passive' })),
                ...creatorFormData.actionFeatures.filter(f => f.name && f.name.trim()).map(f => ({ ...f, type: 'Action' })),
                ...creatorFormData.reactionFeatures.filter(f => f.name && f.name.trim()).map(f => ({ ...f, type: 'Reaction' }))
              ],
              traits: []
            }}
            type="adversary"
            mode="compact"
            onClick={() => {}}
            onDelete={() => {}}
            onEdit={() => {}}
            onToggleVisibility={() => {}}
            onApplyDamage={() => {}}
            onApplyHealing={() => {}}
            onApplyStressChange={() => {}}
            onIncrement={() => {}}
            onDecrement={() => {}}
            isEditMode={false}
            dragAttributes={null}
            dragListeners={null}
          />
          <Cards
            item={{
              ...creatorFormData,
              id: 'preview',
              hp: 0,
              stress: 0,
              experience: creatorFormData.experience
                .filter(exp => exp.name && exp.name.trim())
                .map(exp => `${exp.name} ${exp.modifier >= 0 ? '+' : ''}${exp.modifier}`),
              features: [
                ...creatorFormData.passiveFeatures.filter(f => f.name && f.name.trim()).map(f => ({ ...f, type: 'Passive' })),
                ...creatorFormData.actionFeatures.filter(f => f.name && f.name.trim()).map(f => ({ ...f, type: 'Action' })),
                ...creatorFormData.reactionFeatures.filter(f => f.name && f.name.trim()).map(f => ({ ...f, type: 'Reaction' }))
              ],
              traits: []
            }}
            type="adversary"
            mode="expanded"
            onClick={() => {}}
            onDelete={() => {}}
            onEdit={() => {}}
            onToggleVisibility={() => {}}
            onApplyDamage={() => {}}
            onApplyHealing={() => {}}
            onApplyStressChange={() => {}}
            onIncrement={() => {}}
            onDecrement={() => {}}
            isEditMode={false}
            dragAttributes={null}
            dragListeners={null}
          />
        </div>
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
          <Suspense fallback={<div style={{padding:'1rem'}}>Loading...</div>}>
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
          </Suspense>
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


