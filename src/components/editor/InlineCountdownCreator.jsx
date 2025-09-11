import React, { useState, useEffect } from 'react'
import { Check, X } from 'lucide-react'

const InlineCountdownCreator = ({ 
  source, // 'adversary', 'environment', or 'campaign'
  onCreateCountdown,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    name: '',
    max: '',
    type: 'standard',
    loop: 'none'
  })
  const [error, setError] = useState('')

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onCancel && onCancel()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onCancel])

  const validateMaxValue = (value) => {
    const numValue = parseInt(value)
    if (numValue > 100) {
      setError('Maximum value is 100')
      setFormData(prev => ({ ...prev, max: '100' }))
      setTimeout(() => setError(''), 2000)
      return false
    }
    return true
  }

  const handleInputChange = (field, value) => {
    if (field === 'max') {
      if (!validateMaxValue(value)) {
        return
      }
      setError('') // Clear error when valid value is entered
    }
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleKeyDown = (e) => {
    if (e.target.name === 'max' || e.target.className.includes('inline-number')) {
      const currentValue = parseInt(e.target.value) || 0
      
      // Handle arrow keys and other increment strategies
      if (e.key === 'ArrowUp' && currentValue >= 100) {
        e.preventDefault()
        validateMaxValue('101') // Trigger validation
        return
      }
      
      if (e.key === 'ArrowDown' && currentValue <= 1) {
        e.preventDefault()
        setFormData(prev => ({ ...prev, max: '1' }))
        return
      }
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.name.trim()) return
    
    const maxValue = parseInt(formData.max) || 1
    const clampedMax = Math.min(Math.max(maxValue, 1), 100) // Clamp between 1 and 100
    
    const countdownData = {
      name: formData.name.trim(),
      max: clampedMax,
      type: formData.type,
      loop: formData.loop,
      source: source
    }
    
    onCreateCountdown(countdownData)
    
    // Reset form
    setFormData({
      name: '',
      max: '',
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
            placeholder="Name"
            className="inline-input"
            required
            autoFocus
          />
          
          <div className="inline-number-container">
              <input
                type="number"
                inputMode="numeric"
                enterKeyHint="done"
                min="1"
                max="100"
                value={formData.max}
                onChange={(e) => handleInputChange('max', e.target.value)}
                onKeyDown={handleKeyDown}
                className="inline-number"
                placeholder="Count"
                title="Max value: 100"
              />
            {error && (
              <div className="error-popup">
                <div className="error-message">{error}</div>
              </div>
            )}
          </div>
          
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
              type="button"
              className="inline-btn cancel"
              title="Cancel"
              onClick={onCancel}
            >
              <X size={14} />
            </button>
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
