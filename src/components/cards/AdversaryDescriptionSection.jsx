import React from 'react'

const AdversaryDescriptionSection = ({ item, editData, isEditMode, onInputChange, descriptionHeight, motivesHeight, onDescriptionResize, onMotivesResize }) => {
  const handleDescriptionChange = (e) => {
    onInputChange('description', e.target.value)
    
    // Auto-resize textarea
    const textarea = e.target
    textarea.style.height = 'auto'
    const scrollHeight = textarea.scrollHeight
    const lineHeight = parseInt(window.getComputedStyle(textarea).lineHeight)
    const minHeight = lineHeight
    
    // Set height to content height or minimum single line height
    const newHeight = Math.max(scrollHeight, minHeight) + 'px'
    textarea.style.height = newHeight
    onDescriptionResize(newHeight)
  }

  const handleMotivesChange = (e) => {
    onInputChange('motives', e.target.value)
    
    // Auto-resize textarea
    const textarea = e.target
    textarea.style.height = 'auto'
    const scrollHeight = textarea.scrollHeight
    const lineHeight = parseInt(window.getComputedStyle(textarea).lineHeight)
    const minHeight = lineHeight
    
    // Set height to content height or minimum single line height
    const newHeight = Math.max(scrollHeight, minHeight) + 'px'
    textarea.style.height = newHeight
    onMotivesResize(newHeight)
    
    // Update the container height to match
    const container = textarea.parentElement
    if (container) {
      container.style.height = newHeight
    }
  }

  return (
    <div className="description-motives-section">
      {isEditMode ? (
        <>
          <textarea
            className="form-textarea-inline"
            value={editData.description || ''}
            onChange={handleDescriptionChange}
            placeholder="Description"
            style={{ height: descriptionHeight }}
          />
          <div className="motives-row">
            <span className="motives-label">Motives & Tactics:</span>
            <div className="motives-field" style={{ height: motivesHeight }}>
              <textarea
                className="inline-field"
                value={editData.motives || ''}
                onChange={handleMotivesChange}
                placeholder="Motives & Tactics"
                style={{ height: motivesHeight }}
              />
            </div>
          </div>
        </>
      ) : (
        <>
          {item.description && (
            <div className="description-text" style={{ height: descriptionHeight }}>
              {item.description}
            </div>
          )}
          {item.motives && (
            <div className="motives-row">
              <span className="motives-label">Motives & Tactics:</span>
              <div className="motives-field" style={{ height: motivesHeight }}>
                <textarea
                  className="inline-field"
                  value={item.motives || ""}
                  readOnly
                  aria-readonly="true"
                  tabIndex={-1}
                  style={{ height: motivesHeight }}
                />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default AdversaryDescriptionSection
