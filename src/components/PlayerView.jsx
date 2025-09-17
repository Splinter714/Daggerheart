import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSkull } from '@fortawesome/free-solid-svg-icons'

const PlayerView = ({ fear, countdowns, adversaries }) => {
  return (
    <>
      {/* Fear Display - Full Screen */}
      <div style={{
        position: 'fixed',
        top: '50%',
        left: 0,
        right: 0,
        transform: 'translateY(-50%)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 1rem',
        zIndex: 1
      }}>
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            style={{
              flex: '1',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              fontSize: '3rem',
              color: i < (fear?.value || 0) ? 'var(--purple)' : 'var(--gray-dark)',
              fontWeight: 600,
              transition: 'color 0.3s ease'
            }}
          >
            <FontAwesomeIcon icon={faSkull} />
          </div>
        ))}
      </div>

      {/* Countdowns Display */}
      {countdowns.length > 0 && (
        <div style={{
          position: 'fixed',
          bottom: '2rem',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          maxWidth: '600px',
          width: '90%',
          zIndex: 1
        }}>
          <h2 style={{
            margin: 0,
            fontSize: '1.5rem',
            fontWeight: '600',
            color: 'var(--text-primary)',
            textAlign: 'center'
          }}>
            Countdowns
          </h2>
          {countdowns.map((countdown) => (
            <div key={countdown.id} style={{
              padding: '1rem',
              backgroundColor: 'var(--bg-card)',
              borderRadius: '8px',
              border: '1px solid var(--border)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              {/* Countdown Title */}
              <h3 style={{
                margin: 0,
                fontSize: '1.25rem',
                fontWeight: '600',
                color: 'var(--text-primary)',
                textAlign: 'center'
              }}>
                {countdown.name}
              </h3>
              
              {/* Countdown Pips - Same style as GM view */}
              <div style={{
                display: 'flex',
                gap: '4px',
                alignItems: 'center',
                padding: '2px'
              }}>
                {(() => {
                  const totalPips = countdown.max || 6
                  const pipGroups = []
                  for (let i = 0; i < totalPips; i += 5) {
                    const groupSize = Math.min(5, totalPips - i)
                    pipGroups.push(groupSize)
                  }
                  
                  return pipGroups.map((groupSize, groupIndex) => (
                    <div key={groupIndex} style={{
                      display: 'flex',
                      gap: '4px',
                      marginBottom: '4px'
                    }}>
                      {Array.from({ length: groupSize }, (_, i) => {
                        const pipIndex = groupIndex * 5 + i
                        return (
                          <span 
                            key={pipIndex} 
                            style={{
                              fontSize: '16px',
                              transition: 'color 0.1s ease',
                              color: pipIndex < (countdown.value || 0) ? 'var(--red)' : 'var(--text-secondary)'
                            }}
                          >
                            {pipIndex < (countdown.value || 0) ? '●' : '○'}
                          </span>
                        )
                      })}
                    </div>
                  ))
                })()}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}

export default PlayerView
