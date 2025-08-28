import React from 'react'

// Badge - For tier, type, difficulty, etc.
export const Badge = ({ 
  children, 
  variant = 'default', // 'tier', 'type', 'difficulty', 'default'
  className = '', 
  ...props 
}) => {
  const baseClasses = "px-2 py-1 text-xs rounded-full font-medium"
  
  const variantClasses = {
    tier: "bg-blue-100 text-blue-800 border border-blue-300",
    type: "bg-gray-100 text-gray-800 border border-gray-300",
    difficulty: "bg-green-100 text-green-800 border border-green-300",
    default: "bg-gray-100 text-gray-800 border border-gray-300",
    secondary: "bg-gray-100 text-gray-800 border border-gray-300"
  }
  
  const allClasses = [baseClasses, variantClasses[variant], className]
    .filter(Boolean)
    .join(" ")

  return (
    <span className={allClasses} {...props}>
      {children}
    </span>
  )
}

// DifficultyBadge - Special badge for difficulty with color coding
export const DifficultyBadge = ({ difficulty, className = '', ...props }) => {
  const getDifficultyColor = (diff) => {
    if (diff <= 12) return "bg-green-100 text-green-800 border-green-300"
    if (diff <= 15) return "bg-yellow-100 text-yellow-800 border-yellow-300"
    if (diff <= 18) return "bg-orange-100 text-orange-800 border-orange-300"
    return "bg-red-100 text-red-800 border-red-300"
  }

  const colorClasses = getDifficultyColor(difficulty)
  const baseClasses = "px-2 py-1 text-xs rounded-full font-medium border"

  return (
    <span className={`${baseClasses} ${colorClasses} ${className}`} {...props}>
      {difficulty}
    </span>
  )
}

// TypeBadge - Special badge for adversary types with color coding
export const TypeBadge = ({ type, className = '', ...props }) => {
  const getTypeColor = (typeName) => {
    switch (typeName?.toLowerCase()) {
      case 'solo': return "bg-purple-100 text-purple-800 border-purple-300"
      case 'bruiser': return "bg-red-100 text-red-800 border-red-300"
      case 'horde': return "bg-orange-100 text-orange-800 border-orange-300"
      case 'support': return "bg-blue-100 text-blue-800 border-blue-300"
      case 'leader': return "bg-yellow-100 text-yellow-800 border-yellow-300"
      default: return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  const colorClasses = getTypeColor(type)
  const baseClasses = "px-2 py-1 text-xs rounded-full font-medium border"

  return (
    <span className={`${baseClasses} ${colorClasses} ${className}`} {...props}>
      {type}
    </span>
  )
}
