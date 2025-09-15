import React, { useState } from 'react'

/**
 * Button - A flexible button component using the simplified 2-type system
 * 
 * BUTTON TYPES:
 * - btn-text: Standard text-based buttons (purple background, white text)
 * - btn-icon: Small square icon-only buttons (customizable colors via data-color)
 * 
 * SIZE LOGIC:
 * - size="sm" + single character/symbol → btn-icon (e.g., +, −, ×)
 * - size="sm" + longer text → btn-text (e.g., "Save", "Cancel")
 * - size="md"/"lg" → always btn-text
 * 
 * COLOR OPTIONS (for icon buttons):
 * - color="purple" → Purple background, white text
 * - color="red" → Red background, white text
 * - color="gray" → Gray background, white text
 * - color={null} → Default gray background (no data-color attribute)
 * 
 * DELETE BEHAVIOR:
 * - All delete/remove/bulk-clear actions use two-click confirmation
 * - First click: Button with original text/icon (normal color)
 * - Second click: Red button with "×" confirmation icon (maintains original dimensions)
 * - Auto-resets after 3 seconds if not confirmed
 * - Close actions do NOT use confirmation (they're non-destructive)
 * 
 * Examples:
 * <Button action="add" size="md" onClick={handleAddHP}>Add Item</Button>
 * <Button action="edit" size="sm" onClick={handleEdit}>Edit</Button>
 * <Button action="delete" size="sm" onClick={handleDelete}>×</Button>
 * <Button action="increment" size="sm" color="purple" onClick={handleIncrease}>+</Button>
 * <Button action="decrement" size="sm" color="gray" onClick={handleDecrease}>−</Button>
 */
const Button = ({
  children,
  onClick,
  action = 'default',
  immediate = false, // Bypass confirmation for immediate actions
  size = 'md',
  variant = 'default',
  disabled = false,
  className = '',
  title = '',
  type = 'button',
  color = null, // Color for icon buttons: 'purple', 'red', 'gold', 'gray', 'gray-dark', 'white'
  ...props
}) => {
  const [isConfirming, setIsConfirming] = useState(false)

  // Handle confirmation logic for destructive actions
  const handleDestructiveClick = (e) => {
    if ((action === 'delete' || action === 'remove' || action === 'bulk-clear') && !isConfirming && !immediate) {
      setIsConfirming(true)
      // Auto-reset after 3 seconds
      setTimeout(() => setIsConfirming(false), 3000)
      return
    }
    
    if (onClick) {
      onClick(e)
      setIsConfirming(false)
    }
  }

  // Get button content based on action and confirmation state
  const getButtonContent = () => {
    if ((action === 'delete' || action === 'remove' || action === 'bulk-clear') && isConfirming) {
      // Show × for confirmation
      return '×'
    }
    return children
  }

  // Get button classes
  const getButtonClasses = () => {
    const baseClasses = 'btn-base'
    
    // Determine button type based on size and content
    let buttonType = 'btn-text' // default for text buttons
    
    // Small buttons with single characters/symbols OR React components are icon buttons
    const isIconContent = (children && typeof children === 'string' && children.length <= 2) ||
                         (children && typeof children === 'object' && children.type) // React component
    
    if (size === 'sm' && isIconContent) {
      buttonType = 'btn-icon'
    }
    
    // Special classes for confirmation state
    const confirmingClass = isConfirming ? 'confirming' : ''
    
    return [
      baseClasses,
      buttonType,
      confirmingClass,
      className
    ].filter(Boolean).join(' ')
  }

  // Get button title
  const getButtonTitle = () => {
    if (action === 'delete' || action === 'remove' || action === 'bulk-clear') {
      return isConfirming ? 'Click × to confirm deletion' : title
    }
    return title
  }

  return (
    <button
      className={getButtonClasses()}
      onClick={handleDestructiveClick}
      disabled={disabled}
      title={getButtonTitle()}
      type={type}
      data-action={action}
      data-size={size}
      data-color={color}
      {...props}
    >
      {getButtonContent()}
    </button>
  )
}

/**
 * BulkClearButton - Specialized button for bulk operations with confirmation
 */
export const BulkClearButton = ({ 
  type: _type, 
  count: _count, 
  onConfirm, 
  title, 
  label,
  disabled = false
}) => {
  return (
    <Button
      action="bulk-clear"
      onClick={onConfirm}
      title={title}
      size="sm"
      disabled={disabled}
    >
      {label}
    </Button>
  )
}

export default Button
