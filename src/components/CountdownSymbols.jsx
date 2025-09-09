import React from 'react'

const CountdownSymbols = ({ 
  value = 0, 
  max = 5, 
  type = 'standard',
  onClick,
  interactive = false,
  className = ''
}) => {
  const symbols = Array.from({ length: max }, (_, i) => {
    const isFilled = i < value
    const symbolClass = `countdown-symbol ${isFilled ? 'filled' : 'empty'} ${className}`
    
    return (
      <span 
        key={i} 
        className={symbolClass}
        data-countdown-type={type}
        title={`${i + 1} of ${max}`}
        onClick={interactive && onClick ? (e) => {
          e.stopPropagation()
          onClick(i, isFilled)
        } : undefined}
        style={{ 
          cursor: interactive && onClick ? 'pointer' : 'default' 
        }}
      >
        {isFilled ? '●' : '○'}
      </span>
    )
  })

  return (
    <div className="countdown-symbols">
      {symbols}
    </div>
  )
}

export default CountdownSymbols