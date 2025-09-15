import React from 'react'
import { Shield } from 'lucide-react'

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

// DifficultyBadge - Special badge for difficulty with shield icon
export const DifficultyBadge = ({ difficulty, className = '', ...props }) => {
  const getDifficultyColor = (diff) => {
    if (diff <= 12) return "text-green-600"
    if (diff <= 15) return "text-yellow-600"
    if (diff <= 18) return "text-orange-600"
    return "text-red-600"
  }

  const colorClass = getDifficultyColor(difficulty)

  return (
    <span className={`difficulty-shield ${colorClass} ${className}`} {...props}>
      <Shield size={24} strokeWidth={1.5} />
      <span className="difficulty-number">{difficulty}</span>
    </span>
  )
}

// TypeBadge - Special badge for adversary types with color coding
export const TypeBadge = ({ type, className = '', ...props }) => {
  return (
    <span 
      className={`text-xs font-normal text-muted ${className}`}
      {...props}
    >
      {type}
    </span>
  )
}
