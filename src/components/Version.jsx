/* global __APP_VERSION__ */
import React from 'react'

const Version = () => {
  const version = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : 'dev'
  
  return (
    <div className="version-display">
      v{version}
    </div>
  )
}

export default Version
