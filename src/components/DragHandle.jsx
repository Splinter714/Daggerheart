import React from 'react'

const DragHandle = ({ 
  dragAttributes, 
  dragListeners, 
  isEditMode = false 
}) => {
  if (!dragAttributes || !dragListeners || !isEditMode) {
    return null
  }

  return (
    <div 
      className="drag-handle"
      {...dragAttributes}
      {...dragListeners}
      title="Drag to reorder"
    >
      <svg 
        width="16" 
        height="16" 
        viewBox="0 0 24 24" 
        fill="currentColor"
        className="drag-icon"
      >
        <path d="M8 6h8v2H8V6zm0 4h8v2H8v-2zm0 4h8v2H8v-2z"/>
      </svg>
    </div>
  )
}

export default DragHandle