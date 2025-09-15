import React from 'react'
import Button from '../controls/Buttons'

const CountdownCard = ({ item, mode, onClick, onDelete, onIncrement, onDecrement, _isEditMode, dragAttributes, dragListeners }) => {
  // Calculate how many pips should go on each row for even distribution
  const renderDistributedPips = () => {
    const totalPips = item.max
    
    // Group pips into sets of 5 for all countdowns
    const pipGroups = []
    for (let i = 0; i < totalPips; i += 5) {
      const groupSize = Math.min(5, totalPips - i)
      pipGroups.push(groupSize)
    }
    
    return pipGroups.map((groupSize, groupIndex) => (
      <div key={groupIndex} className="countdown-pip-group">
        {Array.from({ length: groupSize }, (_, i) => {
          const pipIndex = groupIndex * 5 + i
          return (
            <span 
              key={pipIndex} 
              className={`pip-symbol ${pipIndex < (item.value || 0) ? 'filled' : 'empty'}`}
              data-countdown-type={item.type || 'standard'}
              title={`${pipIndex + 1} of ${item.max}`}
            >
              {pipIndex < (item.value || 0) ? '●' : '○'}
            </span>
          )
        })}
      </div>
    ))
  }

  if (mode === 'compact') return renderCompact()
  return renderExpanded()

  function renderCompact() {
    return (
      <div 
        className={`simple-list-row compact countdown ${item.value >= item.max ? 'at-max' : ''} ${dragAttributes && dragListeners ? 'edit-mode' : ''} ${onClick ? 'cursor-pointer' : 'cursor-default'}`}
        data-countdown-type={item.type || 'standard'}
        onClick={() => onClick && onClick(item)}
      >
        {renderDragHandle()}
        <div className="row-content">
          <div className="row-main">
            <h4 className="row-title">{item.name}</h4>
            <div className="pip-symbols">
              {renderDistributedPips()}
            </div>
          </div>
          {renderCardActions()}
        </div>
      </div>
    )
  }

  function renderExpanded() {
    return (
      <div className="expanded-card countdown">
        <div className="expanded-header">
          <h2>{item.name}</h2>
          <div className="header-actions">
            {onDelete && (
              <Button
                action="delete"
                size="sm"
                onClick={() => onDelete(item.id)}
                title="Delete countdown"
              >
                ×
              </Button>
            )}
          </div>
        </div>
        <div className="expanded-content">
          <div className="stats-section">
            <div className="stat-row">
              <span className="stat-label">Progress:</span>
              <div className="stat-controls">
                <Button
                  action="decrement"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    e.preventDefault()
                    if (onDecrement) onDecrement(item.id)
                  }}
                  title="Decrease progress"
                >
                  −
                </Button>
                <span className="stat-value">{item.value || 0}/{item.max}</span>
                {item.value >= item.max && (!item.loop || item.loop === 'none') ? (
                  <Button
                    action="delete"
                    size="sm"
                    immediate={true}
                    onClick={(e) => {
                      e.stopPropagation()
                      e.preventDefault()
                      onDelete && onDelete(item.id)
                    }}
                    title="Delete countdown"
                  >
                    ×
                  </Button>
                ) : (
                  <Button
                    action="increment"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      e.preventDefault()
                      if (onIncrement) onIncrement(item.id)
                    }}
                    title={item.value >= item.max ? "Loop countdown" : "Increase progress"}
                  >
                    {item.value >= item.max ? "⟳" : "+"}
                  </Button>
                )}
              </div>
            </div>
          </div>
          <div className="countdown-symbols-section">
            <h3>Progress</h3>
            <div className="pip-symbols">
              {Array.from({ length: item.max }, (_, i) => (
                <span 
                  key={i} 
                  className={`pip-symbol ${i < (item.value || 0) ? 'filled' : 'empty'}`}
                  data-countdown-type={item.type || 'standard'}
                  title={`${i + 1} of ${item.max}`}
                >
                  {i < (item.value || 0) ? '●' : '○'}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  function renderCardActions() {
    return (
      <div className="card-actions countdown-actions flex gap-sm items-center">
        <div className="countdown-control-buttons flex gap-sm items-center">
          <Button
            action="decrement"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              e.preventDefault()
              if (onDecrement) onDecrement(item.id)
            }}
            title="Decrease progress"
          >
            −
          </Button>
          <Button
            action="increment"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              e.preventDefault()
              if (onIncrement) onIncrement(item.id)
            }}
            title={item.value >= item.max ? (item.loop && item.loop !== 'none' ? "Loop countdown" : "Countdown at max") : "Increase progress"}
          >
            {item.value >= item.max ? (item.loop && item.loop !== 'none' ? "⟳" : "+") : "+"}
          </Button>
          {/* Removed auto-appearing delete button - too dangerous next to increment button */}
        </div>
        <div className="countdown-delete-space">
          {dragAttributes && dragListeners && (
            <Button
              action="delete"
              size="sm"
              immediate={true}
              onClick={(e) => {
                e.stopPropagation()
                e.preventDefault()
                onDelete && onDelete(item.id)
              }}
              title="Delete countdown"
            >
              ×
            </Button>
          )}
        </div>
      </div>
    )
  }

  function renderDragHandle() {
    if (dragAttributes && dragListeners) {
      return (
        <div className="drag-handle" {...dragAttributes} {...dragListeners}>
          ⋮⋮
        </div>
      )
    }
    return null
  }
}

export default CountdownCard


