import React, { useState, useEffect, useCallback, startTransition } from 'react'
import { useGameState } from '../state/state'
import Pips from './Pips'
import FloatingMenu from './FloatingMenu'
import Bar from './Toolbars'
import GameCard from './GameCard'
import Browser from './Browser'
import PWAInstallPrompt from './PWAInstallPrompt'
import Panel from './Panels'

// Simple Error Boundary for debugging
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-md text-red">
          <h3>Something went wrong:</h3>
          <pre>{this.state.error?.toString()}</pre>
          <button className="btn-base btn-text" onClick={() => this.setState({ hasError: false, error: null })}>
            Try again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

// Main Dashboard View Component
const DashboardContent = () => {
  const { 
    adversaries, 
    environments,
    countdowns,
    fear,
    updateFear,
    createAdversary,
    updateAdversary,
    deleteAdversary,
    createEnvironment,
    updateEnvironment,
    deleteEnvironment,
    createCountdown,
    updateCountdown,
    deleteCountdown,
    advanceCountdown
  } = useGameState()
  
  // Dashboard state
  const [isMobile, setIsMobile] = useState(false)
  const [browserOpen, setBrowserOpen] = useState(false)
  const [browserType, setBrowserType] = useState('adversary')
  const [isEditMode, setIsEditMode] = useState(false)
  const [isClearMode, setIsClearMode] = useState(false)
  const [showLongTermCountdowns, setShowLongTermCountdowns] = useState(true)
  const [lastAddedItemType, setLastAddedItemType] = useState(null)

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      const mediaQuery = window.matchMedia('(max-width: 800px)')
      setIsMobile(mediaQuery.matches)
    }
    
    checkMobile()
    const mediaQuery = window.matchMedia('(max-width: 800px)')
    mediaQuery.addEventListener('change', checkMobile)
    return () => mediaQuery.removeEventListener('change', checkMobile)
  }, [])

  // Browser handlers
  const handleOpenDatabase = (type = 'unified') => {
    let newBrowserType = type
    if (type === 'adversaries') {
      newBrowserType = 'adversary'
    } else if (type === 'environments') {
      newBrowserType = 'environment'
    }
    
    if (browserOpen && browserType === newBrowserType) {
      setBrowserOpen(false)
    } else {
      setBrowserType(newBrowserType)
      setBrowserOpen(true)
    }
  }

  const handleCloseBrowser = useCallback(() => {
    setBrowserOpen(false)
  }, [])

  // Group entities by type for dashboard columns
  const getEntityGroups = () => {
    const groups = {}
    
    // Group adversaries by base name (excluding duplicate numbers)
    adversaries.forEach(adversary => {
      const baseName = adversary.baseName || adversary.name?.replace(/\s+\(\d+\)$/, '') || adversary.name
      if (!groups[baseName]) {
        groups[baseName] = {
          type: 'adversary',
          baseName: baseName,
          instances: []
        }
      }
      groups[baseName].instances.push(adversary)
    })

    // Group environments by name
    environments.forEach(environment => {
      if (!groups[environment.name]) {
        groups[environment.name] = {
          type: 'environment',
          baseName: environment.name,
          instances: []
        }
      }
      groups[environment.name].instances.push(environment)
    })

    // Add countdowns as individual columns
    countdowns.forEach(countdown => {
      groups[`countdown-${countdown.id}`] = {
        type: 'countdown',
        baseName: countdown.name,
        instances: [countdown]
      }
    })

    return Object.values(groups)
  }

  const entityGroups = getEntityGroups()

  // Render a single entity panel
  const renderEntityPanel = (group) => {
    const { type, baseName, instances } = group
    
    return (
      <Panel key={`${type}-${baseName}`} style={{ width: '350px', flexShrink: 0 }}>
        <GameCard
          type={type}
          item={{ 
            ...instances[0], 
            name: baseName,
            // Reset instance-specific state so the expanded card doesn't show defeated state
            hp: 0,
            stress: 0,
            isDead: false
          }} // Use first instance as template but reset state
          mode="expanded"
          instances={instances} // Pass all instances to embed mini-cards
          onApplyDamage={type === 'adversary' ? (id, damage, currentHp, maxHp) => {
            const instance = instances.find(i => i.id === id)
            if (instance) {
              updateAdversary(id, { hp: Math.min(instance.hpMax || 1, (instance.hp || 0) + damage) })
            }
          } : undefined}
          onApplyHealing={type === 'adversary' ? (id, healing, currentHp) => {
            const instance = instances.find(i => i.id === id)
            if (instance) {
              updateAdversary(id, { hp: Math.max(0, (instance.hp || 0) - healing) })
            }
          } : undefined}
          onApplyStressChange={type === 'adversary' ? (id, stress) => {
            console.log('DashboardView onApplyStressChange:', { id, stress })
            updateAdversary(id, { stress: Math.max(0, Math.min(instances.find(i => i.id === id)?.stressMax || 6, (instances.find(i => i.id === id)?.stress || 0) + stress)) })
          } : undefined}
          onUpdate={type === 'adversary' ? updateAdversary : type === 'environment' ? updateEnvironment : updateCountdown}
          adversaries={adversaries}
        />
      </Panel>
    )
  }

  return (
    <div 
      className="app"
      onClick={(e) => {
        // Clear selection when clicking on app background
        if (e.target === e.currentTarget) {
          // Handle any global click behavior here if needed
        }
      }}
    >
      {/* Top Bar with Fear */}
      <Bar position="top">
        <Pips
          type="fear"
          value={fear?.value || 0}
          maxValue={12}
          onChange={updateFear}
          showTooltip={false}
          enableBoundaryClick={true}
          clickContainerWidth="100%"
          centerPips={true}
        />
      </Bar>

      {/* Floating Menu */}
      <FloatingMenu
        adversaries={adversaries}
        environments={environments}
        countdowns={countdowns}
        deleteAdversary={deleteAdversary}
        deleteEnvironment={deleteEnvironment}
        deleteCountdown={deleteCountdown}
        isClearMode={isClearMode}
        setIsClearMode={setIsClearMode}
        sortAdversaries={() => {}} // Disabled for dashboard view
        onOpenDatabase={handleOpenDatabase}
      />

      {/* Main Dashboard Content */}
      <div className="main-content" style={{ 
        display: 'flex', 
        flexDirection: 'row', 
        overflowX: 'auto', 
        gap: '1rem',
        padding: '0 1rem'
      }}>
        {browserOpen ? (
          <Panel style={{ width: '400px', flexShrink: 0 }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              padding: '1rem', 
              borderBottom: '1px solid var(--border)',
              backgroundColor: 'var(--bg-secondary)',
              flexShrink: 0
            }}>
              <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>
                Browse {browserType === 'adversary' ? 'Adversaries' : 'Environments'}
              </h3>
              <button
                onClick={handleCloseBrowser}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-primary)',
                  fontSize: '1.2rem',
                  cursor: 'pointer',
                  padding: '0.25rem',
                  borderRadius: 'var(--radius-sm)',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--bg-hover)'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                title="Close Browser"
              >
                ×
              </button>
            </div>
            <div style={{ flex: 1, padding: '1rem', overflowY: 'auto' }}>
              <Browser
                type={browserType}
                onAddItem={(itemData) => {
                  if (browserType === 'adversary') {
                    createAdversary(itemData)
                    setLastAddedItemType('adversary')
                  } else if (browserType === 'environment') {
                    createEnvironment(itemData)
                    setLastAddedItemType('environment')
                  }
                }}
                onCancel={handleCloseBrowser}
              />
            </div>
          </Panel>
        ) : entityGroups.slice(0, 5).map(renderEntityPanel)}
      </div>
      

      {/* PWA Install Prompt */}
      <PWAInstallPrompt />
    </div>
  )
}

// Dashboard wrapper with providers
const DashboardView = () => {
  return (
    <ErrorBoundary>
      <DashboardContent />
    </ErrorBoundary>
  )
}

export default DashboardView
