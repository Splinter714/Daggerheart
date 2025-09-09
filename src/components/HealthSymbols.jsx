import React from 'react'
import { Droplet, Activity } from 'lucide-react'

const HealthSymbols = ({ 
  value = 0, 
  max = 1, 
  type = 'hp', // 'hp' or 'stress'
  onSymbolClick,
  className = ''
}) => {
  const symbols = Array.from({ length: max }, (_, i) => {
    const isFilled = i < value
    const symbolClass = `countdown-symbol ${isFilled ? 'filled' : 'empty'} ${className}`
    
    const Icon = type === 'hp' ? Droplet : Activity
    const title = type === 'hp' 
      ? (isFilled ? 'Click to heal (reduce damage)' : 'Click to take damage')
      : (isFilled ? 'Click to reduce stress' : 'Click to increase stress')
    
    return (
      <span 
        key={i} 
        className={symbolClass}
        title={title}
        onClick={onSymbolClick ? (e) => {
          e.stopPropagation()
          e.preventDefault()
          onSymbolClick(i, isFilled)
        } : undefined}
        style={{ cursor: onSymbolClick ? 'pointer' : 'default' }}
      >
        <Icon size={16} />
      </span>
    )
  })

  return (
    <div className={`${type}-symbols`}>
      {symbols}
    </div>
  )
}

export default HealthSymbols