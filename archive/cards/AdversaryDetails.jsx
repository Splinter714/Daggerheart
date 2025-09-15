import React, { useState } from 'react'
import AdversaryHeaderSection from './AdversaryHeaderSection'
import AdversaryDescriptionSection from './AdversaryDescriptionSection'
import AdversaryCoreStatsSection from './AdversaryCoreStatsSection'
import AdversaryFeaturesSection from './AdversaryFeaturesSection'

const AdversaryDetails = ({ item, HeaderRight, onApplyDamage, onApplyHealing, onApplyStressChange, isEditMode, onSave, onCancel, onDelete }) => {
  // Edit mode state
  const [editData, setEditData] = useState(item)
  const [descriptionHeight, setDescriptionHeight] = useState('auto')
  const [motivesHeight, setMotivesHeight] = useState('auto')

  // Update edit data when item changes
  React.useEffect(() => {
    console.log('AdversaryDetails: Item prop changed:', item)
    setEditData(item)
  }, [item])

  // Recalculate description height on window resize
  React.useEffect(() => {
    const recalculateHeight = () => {
      if (editData.description) {
        // Try to find the actual textarea element first (when in edit mode)
        let actualTextarea = document.querySelector('.expanded-header .form-textarea-inline')
        
        // If not found, try to find any form-textarea-inline element to get base styles
        if (!actualTextarea) {
          actualTextarea = document.querySelector('.form-textarea-inline')
        }
        
        // If still not found, create a temporary element to get computed styles
        if (!actualTextarea) {
          const tempDiv = document.createElement('div')
          tempDiv.className = 'expanded-header'
          const tempTextarea = document.createElement('textarea')
          tempTextarea.className = 'form-textarea-inline'
          tempDiv.appendChild(tempTextarea)
          document.body.appendChild(tempDiv)
          actualTextarea = tempTextarea
        }
        
        const computedStyle = window.getComputedStyle(actualTextarea)
        
        // Create a temporary textarea with the same styles
        const tempTextarea = document.createElement('textarea')
        tempTextarea.style.cssText = `
          position: absolute;
          top: -9999px;
          left: -9999px;
          width: ${computedStyle.width};
          padding: ${computedStyle.padding};
          border: ${computedStyle.border};
          border-radius: ${computedStyle.borderRadius};
          font-family: ${computedStyle.fontFamily};
          font-size: ${computedStyle.fontSize};
          line-height: ${computedStyle.lineHeight};
          font-weight: ${computedStyle.fontWeight};
          font-style: ${computedStyle.fontStyle};
          box-sizing: ${computedStyle.boxSizing};
          resize: none;
          overflow: hidden;
          white-space: pre-wrap;
          word-wrap: break-word;
        `
        tempTextarea.value = editData.description
        document.body.appendChild(tempTextarea)
        
        const newHeight = tempTextarea.scrollHeight + 'px'
        document.body.removeChild(tempTextarea)
        
        // Clean up temporary element if we created one
        if (!document.querySelector('.expanded-header .form-textarea-inline') && !document.querySelector('.form-textarea-inline')) {
          const tempDiv = actualTextarea.parentElement
          if (tempDiv && tempDiv.className === 'expanded-header') {
            document.body.removeChild(tempDiv)
          }
        }
        
        setDescriptionHeight(newHeight)
      }
    }

    // Calculate initial height if description exists, or set default height
    if (editData.description && descriptionHeight === 'auto') {
      // Use setTimeout to ensure the DOM is ready
      setTimeout(recalculateHeight, 0)
    } else if (descriptionHeight === 'auto') {
      // Let browser calculate natural single-line height
      setDescriptionHeight('auto')
    }

    // Add resize listener
    window.addEventListener('resize', recalculateHeight)
    
    return () => {
      window.removeEventListener('resize', recalculateHeight)
    }
  }, [editData.description, descriptionHeight])

  // Ensure height is applied when switching to edit mode
  React.useEffect(() => {
    if (isEditMode && editData.description && descriptionHeight !== 'auto') {
      // Use setTimeout to ensure the textarea is rendered
      setTimeout(() => {
        const textarea = document.querySelector('.expanded-header .form-textarea-inline')
        if (textarea) {
          textarea.style.height = descriptionHeight
        }
      }, 0)
    }
  }, [isEditMode, editData.description, descriptionHeight])

  // Recalculate motives height on window resize
  React.useEffect(() => {
    const recalculateMotivesHeight = () => {
      if (editData.motives) {
        // Try to find the actual motives input element first (when in edit mode)
        let actualInput = document.querySelector('.motives-field .inline-field')
        
        // If not found, try to find any inline-field element to get base styles
        if (!actualInput) {
          actualInput = document.querySelector('.inline-field')
        }
        
        // If still not found, create a temporary element to get computed styles
        if (!actualInput) {
          const tempDiv = document.createElement('div')
          tempDiv.className = 'motives-field'
          const tempTextarea = document.createElement('textarea')
          tempTextarea.className = 'inline-field'
          tempDiv.appendChild(tempTextarea)
          document.body.appendChild(tempDiv)
          actualInput = tempTextarea
        }
        
        const computedStyle = window.getComputedStyle(actualInput)
        
        // Create a temporary textarea with the same styles
        const tempTextarea = document.createElement('textarea')
        tempTextarea.style.cssText = `
          position: absolute;
          top: -9999px;
          left: -9999px;
          width: ${computedStyle.width};
          padding: ${computedStyle.padding};
          border: ${computedStyle.border};
          border-radius: ${computedStyle.borderRadius};
          font-family: ${computedStyle.fontFamily};
          font-size: ${computedStyle.fontSize};
          line-height: ${computedStyle.lineHeight};
          font-weight: ${computedStyle.fontWeight};
          font-style: ${computedStyle.fontStyle};
          box-sizing: ${computedStyle.boxSizing};
          resize: none;
          overflow: hidden;
          white-space: pre-wrap;
          word-wrap: break-word;
        `
        tempTextarea.value = editData.motives
        document.body.appendChild(tempTextarea)
        
        const newHeight = tempTextarea.scrollHeight + 'px'
        document.body.removeChild(tempTextarea)
        
        // Clean up temporary element if we created one
        if (!document.querySelector('.motives-field .inline-field') && !document.querySelector('.inline-field')) {
          const tempDiv = actualInput.parentElement
          if (tempDiv && tempDiv.className === 'motives-field') {
            document.body.removeChild(tempDiv)
          }
        }
        
        setMotivesHeight(newHeight)
        
        // Also update any existing container heights
        const containers = document.querySelectorAll('.motives-field')
        containers.forEach(container => {
          container.style.height = newHeight
        })
      }
    }

    // Calculate initial height if motives exists, or set default height
    if (editData.motives && motivesHeight === 'auto') {
      // Use setTimeout to ensure the DOM is ready
      setTimeout(recalculateMotivesHeight, 0)
    } else if (motivesHeight === 'auto') {
      // Let browser calculate natural single-line height
      setMotivesHeight('auto')
    }

    // Add resize listener
    window.addEventListener('resize', recalculateMotivesHeight)
    
    return () => {
      window.removeEventListener('resize', recalculateMotivesHeight)
    }
  }, [editData.motives, motivesHeight])

  // Ensure motives height is applied when switching to edit mode
  React.useEffect(() => {
    if (isEditMode && editData.motives && motivesHeight !== 'auto') {
      // Use setTimeout to ensure the textarea is rendered
      setTimeout(() => {
        const textarea = document.querySelector('.motives-field .inline-field')
        if (textarea) {
          textarea.style.height = motivesHeight
          // Also update the container height
          const container = textarea.parentElement
          if (container) {
            container.style.height = motivesHeight
          }
        }
      }, 0)
    }
  }, [isEditMode, editData.motives, motivesHeight])

  const handleInputChange = (field, value) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleFeatureChange = (type, index, field, value) => {
    setEditData(prev => ({
      ...prev,
      features: prev.features.map((feature, i) => {
        if (feature.type === type) {
          const typeFeatures = prev.features.filter(f => f.type === type)
          const typeIndex = typeFeatures.findIndex(f => f === feature)
          if (typeIndex === index) {
            return { ...feature, [field]: value }
          }
        }
        return feature
      })
    }))
  }

  const handleAddFeature = (type) => {
    setEditData(prev => ({
      ...prev,
      features: [...prev.features, { type: type, name: '', description: '' }]
    }))
  }

  const handleRemoveFeature = (type, index) => {
    setEditData(prev => ({
      ...prev,
      features: prev.features.filter((feature, i) => {
        if (feature.type === type) {
          const typeFeatures = prev.features.filter(f => f.type === type)
          const typeIndex = typeFeatures.findIndex(f => f === feature)
          return typeIndex !== index
        }
        return true
      })
    }))
  }

  const handleAddExperience = () => {
    setEditData(prev => ({
      ...prev,
      experience: [...(prev.experience || []), { name: '', modifier: 0 }]
    }))
  }

  const handleRemoveExperience = (index) => {
    setEditData(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index)
    }))
  }

  const handleExperienceChange = (index, field, value) => {
    setEditData(prev => ({
      ...prev,
      experience: prev.experience.map((exp, i) => 
        i === index ? { ...exp, [field]: value } : exp
      )
    }))
  }

  const handleSave = () => {
    console.log('AdversaryDetails: Saving data:', editData)
    onSave(editData)
  }

  const handleDelete = () => {
    onDelete && onDelete(item.id)
  }

  return (
    <div className="expanded-card adversary">
      <AdversaryHeaderSection 
        item={item}
        editData={editData}
        isEditMode={isEditMode}
        onInputChange={handleInputChange}
        onSave={handleSave}
        onCancel={onCancel}
        onApplyDamage={onApplyDamage}
        onApplyHealing={onApplyHealing}
        onApplyStressChange={onApplyStressChange}
        onDelete={handleDelete}
      />
      
      <AdversaryDescriptionSection 
        item={item}
        editData={editData}
        isEditMode={isEditMode}
        onInputChange={handleInputChange}
        descriptionHeight={descriptionHeight}
        motivesHeight={motivesHeight}
        onDescriptionResize={setDescriptionHeight}
        onMotivesResize={setMotivesHeight}
      />
      
      <AdversaryCoreStatsSection 
        item={item}
        editData={editData}
        isEditMode={isEditMode}
        onInputChange={handleInputChange}
        onExperienceChange={handleExperienceChange}
        onAddExperience={handleAddExperience}
        onRemoveExperience={handleRemoveExperience}
      />
      
      <AdversaryFeaturesSection 
        item={item}
        editData={editData}
        isEditMode={isEditMode}
        onFeatureChange={handleFeatureChange}
        onAddFeature={handleAddFeature}
        onRemoveFeature={handleRemoveFeature}
      />
    </div>
  )
}

export default AdversaryDetails
