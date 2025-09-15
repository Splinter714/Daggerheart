import React from 'react'

const PanelShell = ({ className = '', children }) => {
  return (
    <div className={`panel-shell ${className}`}>
      {children}
    </div>
  )
}

export default PanelShell


