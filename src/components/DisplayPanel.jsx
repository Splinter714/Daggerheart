import React from 'react'
import { useGameState } from '../useGameState'

const DisplayPanel = ({ isPreview = false }) => {
  const { fear, countdowns } = useGameState()

  // Handle case where gameState might be undefined during initial render
  if (!fear || !countdowns) {
    return (
      <div className={`${isPreview ? 'preview-mode' : 'app'}`}>
        <div className="text-center p-8 text-gray-500">
          Loading game state...
        </div>
      </div>
    )
  }

  return (
    <div className={`${isPreview ? 'preview-mode' : 'app'}`}>
      {/* Only show full header when not in preview mode */}
      {!isPreview && (
        <header className="header">
          <div className="container">
            <div className="header-content">
              <div className="logo">🎲 Daggerheart</div>
              <span className="mode-indicator mode-display">Player Display</span>
            </div>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className="main-content">
        <div className="container">
          {/* Fear Level Display */}
          <section className="fear-section">
            <h2 className="section-title">Current Fear Level</h2>
            <div className="fear-display">
              <span className="fear-icon">💀</span>
              <span className="fear-value">{fear}</span>
            </div>
          </section>

          {/* Countdowns Display */}
          <section className="countdowns-section">
            <h2 className="section-title">Active Countdowns</h2>
            {countdowns.length === 0 ? (
              <p className="no-countdowns">No active countdowns</p>
            ) : (
              <div className="countdowns-grid">
                {countdowns.map((countdown) => (
                  <div key={countdown.id} className="countdown-card">
                    <div className="countdown-header">
                      <h3 className="countdown-name">{countdown.name}</h3>
                      <span className="countdown-type">{countdown.type}</span>
                    </div>
                    <div className="countdown-timer">
                      <span className="time-remaining">{countdown.timeRemaining}</span>
                      <span className="time-unit">seconds</span>
                    </div>
                    {countdown.description && (
                      <p className="countdown-description">{countdown.description}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  )
}

export default DisplayPanel
