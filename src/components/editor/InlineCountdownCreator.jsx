import React, { useState } from 'react'
import { Check } from 'lucide-react'

const InlineCountdownCreator = ({ 
  source, // 'adversary', 'environment', or 'campaign'
  onCreateCountdown
}) => {
  const [formData, setFormData] = useState({
    name: '',
    max: 5,
    type: 'standard',
    loop: 'none'
  })

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.name.trim()) return
    
    const countdownData = {
      name: formData.name.trim(),
      max: formData.max,
      type: formData.type,
      loop: formData.loop,
      source: source
    }
    
    onCreateCountdown(countdownData)
    
    // Reset form
    setFormData({
      name: '',
      max: 5,
      type: 'standard',
      loop: 'none'
    })
  }

  return (
    <div className="inline-countdown-creator">
      <form onSubmit={handleSubmit} className="inline-countdown-form">
        <div className="inline-countdown-main-row">
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Countdown name"
            className="inline-input"
            required
            autoFocus
          />
          
          <input
            type="number"
            inputMode="numeric"
            enterKeyHint="done"
            min="1"
            max="20"
            value={formData.max}
            onChange={(e) => handleInputChange('max', parseInt(e.target.value) || 1)}
            className="inline-number"
          />
          
          <select
            value={formData.type}
            onChange={(e) => handleInputChange('type', e.target.value)}
            className="inline-select"
          >
            <option value="standard">Standard</option>
            <option value="progress">Progress</option>
            <option value="consequence">Consequence</option>
            <option value="long-term">Long-term</option>
            <option value="simple-fear">Fear</option>
            <option value="simple-hope">Hope</option>
          </select>
          
          <select
            value={formData.loop}
            onChange={(e) => handleInputChange('loop', e.target.value)}
            className="inline-select"
          >
            <option value="none">None</option>
            <option value="loop">Loop</option>
            <option value="increasing">Increasing</option>
            <option value="decreasing">Decreasing</option>
          </select>
          
          <div className="inline-countdown-actions">
            <button
              type="submit"
              className="inline-btn save"
              title="Create Countdown"
              disabled={!formData.name.trim()}
            >
              <Check size={14} />
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default InlineCountdownCreator
