import React from 'react'

const CompactCardShell = ({
  className = '',
  item,
  onClick,
  dragAttributes,
  dragListeners,
  children,
}) => {
  const showDrag = !!(dragAttributes && dragListeners)
  return (
    <div
      className={`simple-list-row compact ${className} ${showDrag ? 'edit-mode' : ''}`}
      onClick={(_e) => {
        if (onClick) onClick(item)
      }}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      {showDrag && (
        <div className="drag-handle" {...dragAttributes} {...dragListeners}>⋮⋮</div>
      )}
      <div className="row-content">
        {children}
      </div>
    </div>
  )
}

export default CompactCardShell


