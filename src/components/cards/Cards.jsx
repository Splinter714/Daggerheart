import React, { useState } from 'react'
import { Pencil } from 'lucide-react'
import Button from '../controls/Buttons'
import AdversaryEditForm from '../editor/forms/AdversaryEditForm'
import EnvironmentEditForm from '../editor/forms/EnvironmentEditForm'
import CountdownEditForm from '../editor/forms/CountdownEditForm'
// badges used within detail subcomponents now
import AdversaryDetails from './AdversaryDetails'
import EnvironmentDetails from './EnvironmentDetails'
// import Creator from './Creator'
import CountdownCard from './CountdownCard'
import CountdownDetails from './CountdownDetails'
import EnvironmentCard from './EnvironmentCard'
import AdversaryCard from './AdversaryCard'
import CardEditLayout from './CardEditLayout'

// Add Item Button Component
const AddItemButton = ({ type, onClick, hasItems = false }) => {
  return (
    <div 
      className={`add-item-button ${hasItems ? 'has-items' : ''}`}
      onClick={onClick}
      title={`Add ${type}`}
    >
      <div className="add-item-content">
        <span className="add-item-icon">+</span>
        <span className="add-item-text">add {type}</span>
      </div>
    </div>
  )
}

const Cards = ({ 
  item, 
  type, // 'countdown', 'adversary', or 'environment'
  mode = 'compact', // 'compact' or 'expanded'
  _index = 0,
  onDelete,
  onEdit,
  onApplyDamage: _onApplyDamage,
  onApplyHealing: _onApplyHealing,
  onApplyStressChange: _onApplyStressChange,
  onIncrement,
  onDecrement,
  onSave,
  onExitEditMode,
  onClick,
  dragAttributes,
  dragListeners,
  isEditMode = false
}) => {
  // local editor state retained for expanded edit; not used in compact routes
  const [_showDamageInput, _setShowDamageInput] = useState(false)
  const [_damageValue, _setDamageValue] = useState('')
  
  // Edit mode state - moved to top level to avoid conditional hook calls
  function getDefaultData() {
    if (type === 'countdown') {
      return { name: '', description: '', max: 5, value: 0 }
    } else if (type === 'adversary') {
      return { 
        name: '', 
        description: '', 
        type: '', 
        tier: 1, 
        difficulty: 1, 
        hpMax: 1, 
        stressMax: 0, 
        passiveFeatures: [{ name: '', description: '' }], 
        actionFeatures: [{ name: '', description: '' }], 
        reactionFeatures: [{ name: '', description: '' }],
        thresholds: { major: 0, severe: 0 },
        atk: 0,
        weapon: 'Weapon',
        range: 'Melee',
        damage: '1d6 phy'
      }
    } else {
      return { name: '', description: '', type: '', tier: 1, difficulty: 1, effects: [], hazards: [] }
    }
  }

  // Ensure all required arrays are initialized
  function getInitialData() {
    const defaultData = getDefaultData()
    if (item) {
      // When editing, ensure all required arrays exist
      return {
        ...defaultData,
        ...item,
        passiveFeatures: item.passiveFeatures || item.features?.filter(f => f.type === 'Passive') || [{ name: '', description: '' }],
        actionFeatures: item.actionFeatures || item.features?.filter(f => f.type === 'Action') || [{ name: '', description: '' }],
        reactionFeatures: item.reactionFeatures || item.features?.filter(f => f.type === 'Reaction') || [{ name: '', description: '' }],
        thresholds: item.thresholds || { major: 0, severe: 0 },
        atk: item.atk || 0,
        weapon: item.weapon || 'Weapon',
        range: item.range || 'Melee',
        damage: item.damage || '1d6 phy',
        effects: item.effects || [],
        hazards: item.hazards || []
      }
    }
    return defaultData
  }
  
  const [editData, setEditData] = useState(getInitialData())

  // Render based on mode
  switch (mode) {
    case 'compact':
      return renderCompact()
    case 'expanded':
      return renderExpanded()
    default:
      return renderCompact()
  }

  function renderCompact() {
    if (type === 'countdown') {
      return (
        <CountdownCard
          item={item}
          mode={mode}
          onClick={onClick}
          onDelete={onDelete}
          onIncrement={onIncrement}
          onDecrement={onDecrement}
          isEditMode={isEditMode}
          dragAttributes={dragAttributes}
          dragListeners={dragListeners}
        />
      )
    } else if (type === 'adversary') {
      return (
        <AdversaryCard
          item={item}
          mode={mode}
          onClick={onClick}
          onDelete={onDelete}
          onApplyDamage={_onApplyDamage}
          onApplyHealing={_onApplyHealing}
          onApplyStressChange={_onApplyStressChange}
          dragAttributes={dragAttributes}
          dragListeners={dragListeners}
        />
      )
    } else {
      return (
        <EnvironmentCard
          item={item}
          mode={mode}
          onClick={onClick}
          onDelete={onDelete}
          onEdit={onEdit}
          dragAttributes={dragAttributes}
          dragListeners={dragListeners}
          isEditMode={isEditMode}
        />
      )
    }
  }

  function renderExpanded() {
    if (isEditMode && type !== 'adversary') {
      return renderExpandedEdit()
    } else {
      return renderExpandedDisplay()
    }
  }

  function renderExpandedDisplay() {
    if (type === 'countdown') {
      return (
        <CountdownDetails
          item={item}
          onDelete={onDelete}
          onIncrement={onIncrement}
          onDecrement={onDecrement}
        />
      )
    } else if (type === 'adversary') {
      return (<AdversaryDetails 
        item={item} 
        onApplyDamage={_onApplyDamage}
        onApplyHealing={_onApplyHealing}
        onApplyStressChange={_onApplyStressChange}
        isEditMode={isEditMode}
        onSave={onSave}
        onCancel={onExitEditMode}
      />)
    } else {
      const HeaderRight = () => (
        <div className="header-actions">
          <Button action="edit" size="sm" onClick={() => onEdit && onEdit(item)} title="Edit environment" aria-label="Edit environment">
            <Pencil size={16} />
          </Button>
          {onDelete && (
            <Button action="delete" size="sm" onClick={() => onDelete(item.id)} title="Delete environment">×</Button>
          )}
        </div>
      )
      return (<EnvironmentDetails item={item} HeaderRight={HeaderRight} />)
    }
  }

  function renderExpandedEdit() {
    function handleInputChange(field, value) {
      setEditData(prev => ({
        ...prev,
        [field]: value
      }))
    }

    function handleArrayChange(field, index, value) {
      setEditData(prev => ({
        ...prev,
        [field]: prev[field].map((item, i) => i === index ? value : item)
      }))
    }

    function addArrayItem(field) {
      setEditData(prev => ({
        ...prev,
        [field]: [...prev[field], '']
      }))
    }

    function removeArrayItem(field, index) {
      setEditData(prev => ({
        ...prev,
        [field]: prev[field].filter((_, i) => i !== index)
      }))
    }

    function handleSave() {
      if (!editData.name.trim()) {
        alert('Name is required')
        return
      }
      
      const itemData = {
        ...editData,
        name: editData.name.trim(),
        description: editData.description.trim(),
        ...(type === 'adversary' && {
          hp: 0,
          hpMax: editData.hpMax,
          stress: 0,
          stressMax: editData.stressMax,
          thresholds: editData.thresholds,
          atk: editData.atk,
          weapon: editData.weapon,
          range: editData.range,
          damage: editData.damage,
          features: [
            ...editData.passiveFeatures.filter(f => f.name.trim()).map(f => ({ ...f, type: 'Passive' })),
            ...editData.actionFeatures.filter(f => f.name.trim()).map(f => ({ ...f, type: 'Action' })),
            ...editData.reactionFeatures.filter(f => f.name.trim()).map(f => ({ ...f, type: 'Reaction' }))
          ]
        }),
        ...(type === 'environment' && {
          effects: editData.effects.filter(effect => effect.trim()),
          hazards: editData.hazards.filter(hazard => hazard.trim())
        }),
        ...(type === 'countdown' && {
          max: editData.max,
          value: editData.value
        })
      }
      
      onSave && onSave(itemData)
    }

    return (
      <CardEditLayout
        item={item}
        type={type}
        editData={editData}
        onChange={handleInputChange}
        onSave={handleSave}
        onCancel={() => onExitEditMode && onExitEditMode()}
      >
        {type === 'countdown' && (
          <CountdownEditForm data={editData} onChange={handleInputChange} />
        )}
        {type === 'adversary' && (
          <AdversaryEditForm
            data={editData}
            onChange={handleInputChange}
            onArrayChange={handleArrayChange}
            onAddItem={addArrayItem}
            onRemoveItem={removeArrayItem}
          />
        )}
        {type === 'environment' && (
          <EnvironmentEditForm
            data={editData}
            onArrayChange={handleArrayChange}
            onAddItem={addArrayItem}
            onRemoveItem={removeArrayItem}
          />
        )}
      </CardEditLayout>
    )
  }

  // compact rendering delegated to subcomponents; no shared actions needed

  // description highlighting removed from this file; can be added in details components if needed

  // drag handle delegated to subcomponents
}

export { AddItemButton }
export default Cards

