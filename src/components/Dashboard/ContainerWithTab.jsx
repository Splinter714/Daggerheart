import React from 'react'

/**
 * ContainerWithTab - A reusable component that provides a container with an optional tab above it
 * Used for both adversary cards and browser overlay to ensure consistent styling and behavior
 * 
 * @param {ReactNode} tabContent - Content to render in the tab (buttons, text, etc.)
 * @param {ReactNode} children - Content to render in the main container
 * @param {object} containerStyle - Additional styles for the container (merged with default container styles)
 * @param {object} tabStyle - Additional styles for the tab
 * @param {boolean} showTab - Whether to show the tab (default: true if tabContent is provided)
 * @param {string} tabBackgroundColor - Background color for the tab (default: 'var(--bg-primary)')
 * @param {string} tabBorderColor - Border color for the tab (default: 'var(--border)')
 * @param {string} tabJustifyContent - Justify content for tab ('center' or 'space-between')
 * @param {string} containerBackgroundColor - Background color for the container
 * @param {string} containerBorderColor - Border color for the container
 * @param {string} containerBorderRadius - Border radius for the container (default: '8px')
 * @param {string} containerBoxShadow - Box shadow for the container
 * @param {string} containerOverflow - Overflow for the container (default: 'hidden' for content, but wrapper allows tab to extend)
 */
const TAB_HEIGHT = 52

const ContainerWithTab = ({
  tabContent,
  children,
  containerStyle = {},
  tabStyle = {},
  showTab = true,
  tabBackgroundColor = 'var(--bg-primary)',
  tabBorderColor = 'var(--border)',
  tabJustifyContent = 'center',
  containerBackgroundColor,
  containerBorderColor,
  containerBorderRadius = '8px',
  containerBoxShadow,
  containerOverflow = 'hidden',
  reserveTabSpace = false,
  style: wrapperCustomStyle = {},
  ...restProps
}) => {
  // Build container styles - merge defaults with provided styles
  const defaultContainerStyles = {
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    height: '100%',
    width: '100%',
    borderRadius: containerBorderRadius,
    overflow: containerOverflow
  }

  // Add optional container styles if provided
  if (containerBackgroundColor) {
    defaultContainerStyles.backgroundColor = containerBackgroundColor
  }
  if (containerBorderColor) {
    defaultContainerStyles.border = `2px solid ${containerBorderColor}`
  }
  if (containerBoxShadow) {
    defaultContainerStyles.boxShadow = containerBoxShadow
  }

  const wrapperStyle = {
    position: 'relative',
    overflow: 'visible', // Allow tab to extend above
    height: '100%',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    boxSizing: 'border-box'
  }

  const tabTopPosition = reserveTabSpace ? '0' : `-${TAB_HEIGHT}px`
  
  // When reserveTabSpace is true, container should start after tab space
  const containerMarginTop = reserveTabSpace && showTab && tabContent ? `${TAB_HEIGHT}px` : '0'

  return (
    <div 
      style={{ ...wrapperStyle, ...wrapperCustomStyle }}
      {...restProps}
    >
      {/* Tab - positioned above container */}
      {showTab && tabContent && (
        <div style={{ 
          position: 'absolute',
          top: tabTopPosition,
          left: '7px',
          right: '7px',
          width: 'calc(100% - 14px)',
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem', 
          justifyContent: tabJustifyContent,
          flexShrink: 0,
          zIndex: 0, // Lower than container so container border renders on top
          padding: '0.5rem 0.75rem',
          paddingBottom: 'calc(0.5rem + 4px)', // Extend padding so border extends down
          minHeight: `${TAB_HEIGHT}px`, // Ensure consistent height regardless of content
          backgroundColor: tabBackgroundColor,
          border: `1.5px solid ${tabBorderColor}`,
          borderBottom: 'none',
          borderRadius: '8px 8px 0 0',
          boxSizing: 'border-box',
          marginBottom: '-4px', // Overlap to extend borders down to meet container
          ...tabStyle
        }}>
          {tabContent}
        </div>
      )}
      
      {/* Container with styling */}
      <div style={{
        ...defaultContainerStyles,
        ...containerStyle,
        zIndex: 1, // Ensure container border renders above tab background
        marginTop: containerMarginTop // Start container after tab space when reserved
      }}>
        {children}
      </div>
    </div>
  )
}

export default ContainerWithTab

