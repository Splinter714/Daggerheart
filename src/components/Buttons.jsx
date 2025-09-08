import React, { useState } from 'react'

/**
 * Button - A flexible button component with size, shape, action, and color variants
 * 
 * COLOR SYSTEM:
 * - Colors are automatically determined by the 'action' prop (semantic mapping):
 *   • add/save/confirm → Blue (btn-success) - Positive actions
 *   • edit/view/filter/increment/decrement → Gray (btn-secondary) - Informational/Adjustment actions
 *   • delete/remove → Gray initially, Red during confirmation - Destructive actions
 *   • close → Gray (btn-secondary) - Close actions (non-destructive)
 *   • default → Blue (btn-primary) - Primary actions
 * 
 * - You can override colors with the 'variant' prop:
 *   • <Button action="add" variant="danger">Add</Button> → Red button despite being "add"
 * 
 * DELETE BEHAVIOR:
 * - All delete/remove/bulk-clear actions use two-click confirmation
 * - First click: Button with original text/icon (normal color)
 * - Second click: Red button with "×" confirmation icon (maintains original dimensions)
 * - Auto-resets after 3 seconds if not confirmed
 * - Close actions do NOT use confirmation (they're non-destructive)
 * 
 * CORNER ROUNDING:
 * - Standard buttons: 4px rounded corners (--btn-border-radius)
 * - Compact buttons: 2px rounded corners (--btn-border-radius-compact)  
 * 
 * Examples:
 * <Button action="add" size="md" onClick={handleAddHP} />
 * <Button action="edit" size="md" onClick={handleEdit}>Edit</Button>
 * <Button action="delete" size="sm" onClick={handleDelete}>×</Button>
 * <Button action="increment" size="sm" onClick={handleIncrease}>+</Button>
 * <Button action="decrement" size="sm" onClick={handleDecrease}>−</Button>
 * 
 * NOTE: All increment/decrement buttons automatically get consistent sizing
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
    const baseClasses = 'btn'
    
    // Map actions to button variants
    let variantClass = 'btn-primary' // default
    
    // If variant is explicitly set, use it
    if (variant && variant !== 'default') {
      variantClass = `btn-${variant}`
    } else {
      // Otherwise, map actions to semantic button types
      if (action === 'delete' || action === 'remove' || action === 'bulk-clear') {
        // Delete buttons start neutral, turn red only during confirmation
        // Exception: immediate delete actions (like filled countdowns) are always red
        variantClass = (isConfirming || immediate) ? 'btn-danger' : 'btn-secondary'
      } else if (action === 'close') {
        variantClass = 'btn-secondary'     // Close actions (non-destructive)
      } else if (action === 'edit' || action === 'view' || action === 'filter' || action === 'increment' || action === 'decrement') {
        variantClass = 'btn-secondary'     // Informational/adjustment actions
      } else if (action === 'confirm' || action === 'add' || action === 'save') {
        variantClass = 'btn-success'       // Positive actions
      } else if (action === 'toggle' || action === 'cancel') {
        variantClass = 'btn-secondary'     // State changes
      } else if (action === 'success' || action === 'critical') {
        variantClass = 'btn-success'       // Success outcomes
      } else if (action === 'failure') {
        variantClass = 'btn-danger'        // Failure outcomes
      } else if (action === 'rest' || action === 'action') {
        variantClass = 'btn-secondary'     // Rest and action triggers
      }
    }
    
    // Map sizes
    let sizeClass = 'btn-md' // default
    if (size === 'sm') sizeClass = 'btn-sm'
    if (size === 'lg') sizeClass = 'btn-lg'
    if (size === 'xl') sizeClass = 'btn-xl'
    
                // Special classes for confirmation state
      const confirmingClass = isConfirming ? 'confirming' : ''
    
      return [
        baseClasses,
        variantClass,
        sizeClass,
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
  type, 
  count, 
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
