import React from 'react'
import Button from '../controls/Buttons'

const ArrayFieldList = ({
  label,
  values = [],
  placeholder = '',
  onChange, // (index, value)
  onRemove, // (index)
  onAdd, // ()
}) => {
  return (
    <div className="form-section">
      <h3>{label}</h3>
      {values.map((value, index) => (
        <div key={index} className="array-input-row">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange && onChange(index, e.target.value)}
            placeholder={placeholder}
            className="form-input"
          />
          <Button
            action="delete"
            onClick={() => onRemove && onRemove(index)}
            size="sm"
            title="Remove"
          />
        </div>
      ))}
      <Button
        action="add"
        onClick={() => onAdd && onAdd()}
        size="sm"
        title={`Add ${label}`}
      >
        Add {label}
      </Button>
    </div>
  )
}

export default ArrayFieldList


