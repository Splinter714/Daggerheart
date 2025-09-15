import React from 'react'
import Fear from '../controls/Fear'

const TopBar = ({ fear, updateFear }) => {
  return (
    <div 
      className="top-bar"
      onClick={(event) => {
        const currentFear = fear?.value || 0
        const topBarRect = event.currentTarget.getBoundingClientRect()
        const containerElement = event.currentTarget.querySelector('.container')
        const containerRect = containerElement.getBoundingClientRect()
        const clickX = event.clientX - topBarRect.left
        const containerStartX = containerRect.left - topBarRect.left
        const containerWidth = containerRect.width
        const skullPadding = containerWidth * 0.05
        const effectiveContainerStart = containerStartX + skullPadding
        const effectiveContainerWidth = containerWidth - (2 * skullPadding)
        const boundaryRatio = currentFear / 12
        const boundaryX = effectiveContainerStart + (effectiveContainerWidth * boundaryRatio)
        if (clickX < boundaryX) {
          if (currentFear > 0) {
            updateFear(Math.max(0, currentFear - 1))
          }
        } else {
          if (currentFear < 12) {
            updateFear(Math.min(12, currentFear + 1))
          }
        }
      }}
      style={{ cursor: 'pointer' }}
    >
      <div className="container">
        <Fear />
      </div>
    </div>
  )
}

export default TopBar


