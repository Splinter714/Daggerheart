import React, { useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSkull } from '@fortawesome/free-solid-svg-icons'
import { joinSession, checkSessionExists } from '../firebase/sessionService'

const PlayerView = ({ fear = { value: 0 }, countdowns = [], adversaries = [], onSessionChange }) => {
  const [sessionId, setSessionId] = useState('')
  const [isJoining, setIsJoining] = useState(false)
  const [error, setError] = useState('')
  const [isConnected, setIsConnected] = useState(false)

  // Check if we're already in a session (from URL)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const urlSessionId = urlParams.get('sessionId')
    
    if (urlSessionId) {
      setSessionId(urlSessionId)
      handleJoinSession(urlSessionId)
    }
  }, [])

  const handleJoinSession = async (sessionIdToJoin = sessionId) => {
    if (!sessionIdToJoin.trim()) {
      setError('Please enter a session ID')
      return
    }

    setIsJoining(true)
    setError('')

    try {
      const exists = await checkSessionExists(sessionIdToJoin)
      if (!exists) {
        setError('Session not found')
        return
      }

      // Join the session
      const cleanup = joinSession(sessionIdToJoin, (newGameState) => {
        onSessionChange(sessionIdToJoin, 'player', newGameState)
      })

      setSessionId(sessionIdToJoin)
      setIsConnected(true)
      
      // Store cleanup function for later use
      window.sessionCleanup = cleanup
      
    } catch (err) {
      console.error('Failed to join Firebase session:', err)
      
      // Fallback: For now, just connect with the session ID
      // In a real implementation, you'd want to implement URL-based state sharing
      setError('Firebase not configured. Session joining not available in fallback mode.')
      console.log('Using fallback mode - session joining not implemented')
    } finally {
      setIsJoining(false)
    }
  }

  const handleLeaveSession = () => {
    if (window.sessionCleanup) {
      window.sessionCleanup()
      window.sessionCleanup = null
    }
    
    setSessionId('')
    setIsConnected(false)
    setError('')
    
    onSessionChange(null, null)
  }

  return (
    <>
      {/* Session Join Interface */}
      {!isConnected ? (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'var(--bg-card)',
          padding: '2rem',
          borderRadius: '8px',
          border: '1px solid var(--border)',
          textAlign: 'center',
          maxWidth: '400px',
          width: '90%',
          zIndex: 1000
        }}>
          <h3 style={{
            margin: '0 0 1rem 0',
            color: 'var(--text-primary)',
            fontSize: '1.25rem'
          }}>
            Join Game Session
          </h3>
          
          {error && (
            <div style={{
              color: 'var(--red)',
              fontSize: '0.875rem',
              marginBottom: '1rem',
              padding: '0.5rem',
              backgroundColor: 'var(--bg-primary)',
              borderRadius: '4px',
              border: '1px solid var(--red)'
            }}>
              {error}
            </div>
          )}
          
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            marginBottom: '1rem'
          }}>
            <input
              type="text"
              value={sessionId}
              onChange={(e) => setSessionId(e.target.value.toUpperCase())}
              placeholder="Enter Session ID"
              style={{
                flex: 1,
                padding: '0.75rem',
                border: '1px solid var(--border)',
                borderRadius: '4px',
                backgroundColor: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                fontSize: '1rem'
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleJoinSession()
                }
              }}
            />
            <button
              onClick={() => handleJoinSession()}
              disabled={isJoining || !sessionId.trim()}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: 'var(--blue)',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: isJoining || !sessionId.trim() ? 'not-allowed' : 'pointer',
                opacity: isJoining || !sessionId.trim() ? 0.5 : 1,
                fontSize: '1rem'
              }}
            >
              {isJoining ? 'Joining...' : 'Join'}
            </button>
          </div>
          
          <div style={{
            fontSize: '0.875rem',
            color: 'var(--text-secondary)'
          }}>
            Ask your GM for the Session ID
          </div>
        </div>
      ) : (
        <>
          {/* Session Status */}
          <div style={{
            position: 'fixed',
            top: '1rem',
            right: '1rem',
            backgroundColor: 'var(--bg-card)',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            border: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            zIndex: 100
          }}>
            <div style={{
              fontSize: '0.875rem',
              color: 'var(--text-primary)',
              fontFamily: 'monospace'
            }}>
              Session: {sessionId}
            </div>
            <button
              onClick={handleLeaveSession}
              style={{
                background: 'var(--red)',
                color: 'white',
                border: 'none',
                padding: '0.25rem 0.5rem',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.75rem'
              }}
            >
              Leave
            </button>
          </div>
          
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
      {countdowns && countdowns.length > 0 && (
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
          {countdowns && countdowns.map((countdown, index) => (
            <div key={countdown?.id || `countdown-${index}`} style={{
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
                {countdown.name || 'Unnamed Countdown'}
              </h3>
              
              {/* Countdown Pips - Same style as GM view */}
              <div style={{
                display: 'flex',
                gap: '4px',
                alignItems: 'center',
                padding: '2px'
              }}>
                {(() => {
                  const totalPips = countdown?.max || 6
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
                              color: pipIndex < (countdown?.value || 0) ? 'var(--red)' : 'var(--text-secondary)'
                            }}
                          >
                            {pipIndex < (countdown?.value || 0) ? '●' : '○'}
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
      )}
    </>
  )
}

export default PlayerView
