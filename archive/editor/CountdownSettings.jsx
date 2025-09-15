import React from 'react'
import Button from '../controls/Buttons'

const CountdownSettings = ({
  name,
  description,
  max,
  countdownType,
  loop,
  onNameChange,
  onDescriptionChange,
  onMaxChange,
  onTypeChange,
  onLoopChange,
}) => {
  return (
    <div className="form-section countdown-compact">
      <div className="countdown-stack">
        <input
          type="text"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="Countdown name"
          className="form-input"
          required
        />
        <input
          type="text"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Description (optional)"
          className="form-input"
        />
        <div className="countdown-row">
          <input
            type="number"
            inputMode="numeric"
            enterKeyHint="done"
            min="1"
            max="20"
            value={max}
            onChange={(e) => onMaxChange(parseInt(e.target.value))}
            placeholder="Max value"
            className="form-input"
          />
          <select
            value={countdownType}
            onChange={(e) => onTypeChange(e.target.value)}
            className="form-input"
          >
            <option value="standard">Standard</option>
            <option value="progress">Progress</option>
            <option value="consequence">Consequence</option>
            <option value="long-term">Long-term</option>
            <option value="simple-fear">Simple Fear</option>
            <option value="simple-hope">Simple Hope</option>
          </select>
          <select
            value={loop}
            onChange={(e) => onLoopChange(e.target.value)}
            className="form-input"
          >
            <option value="none">None</option>
            <option value="loop">Loop</option>
            <option value="increasing">Increasing</option>
            <option value="decreasing">Decreasing</option>
          </select>
          <Button action="save" type="submit" size="md">Create</Button>
        </div>
      </div>
    </div>
  )
}

export default CountdownSettings


