import React from 'react'

const BasicInfo = ({ type, name, onNameChange }) => {
  return (
    <div className="form-section">
      <h3>Basic Information</h3>
      <div className="form-group">
        <label htmlFor="name">Name *</label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder={`Enter ${type} name`}
          className="form-input"
          required
        />
      </div>
    </div>
  )
}

export default BasicInfo


