import React, { useEffect, useState } from 'react'
import { Pencil, Trash2, Wrench, HelpCircle } from 'lucide-react'

const BottomBar = ({
  isEditMode,
  setIsEditMode,
  showMockup,
  setShowMockup,
  adversaries,
  environments,
  countdowns,
  deleteAdversary,
  deleteEnvironment,
  deleteCountdown
}) => {
  const [deleteFlyoutOpen, setDeleteFlyoutOpen] = useState(false)
  const [helpFlyoutOpen, setHelpFlyoutOpen] = useState(false)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.sidebar-nav-item')) {
        setDeleteFlyoutOpen(false)
        setHelpFlyoutOpen(false)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  const hasAnyItems = (adversaries?.length || 0) > 0 || (environments?.length || 0) > 0 || (countdowns?.length || 0) > 0
  const hasDeadAdversaries = (adversaries || []).some(adv => (adv.hp || 0) >= (adv.hpMax || 1))

  return (
    <nav className={`sidebar-nav`}>
      <button
        className={`sidebar-nav-item ${isEditMode ? 'active' : ''}`}
        onClick={() => setIsEditMode(!isEditMode)}
        title={isEditMode ? 'Exit Edit Mode' : 'Enter Edit Mode'}
      >
        <div className="sidebar-nav-icon">
          <Pencil size={20} />
        </div>
      </button>

      <div
        className={`sidebar-nav-item ${showMockup ? 'active' : ''}`}
        onClick={(e) => {
          e.stopPropagation()
          setShowMockup(!showMockup)
          setDeleteFlyoutOpen(false)
        }}
        title="Show Creator Mockup"
        style={{ cursor: 'pointer' }}
      >
        <div className="sidebar-nav-icon">
          <Wrench size={20} />
        </div>
      </div>

      <div
        className={`sidebar-nav-item ${deleteFlyoutOpen ? 'delete-active' : ''} ${!hasAnyItems ? 'disabled' : ''}`}
        onClick={(e) => {
          e.stopPropagation()
          if (hasAnyItems) {
            setDeleteFlyoutOpen(!deleteFlyoutOpen)
          }
        }}
        title={!hasAnyItems ? 'Nothing to clear' : 'Clear Items'}
        style={{ cursor: !hasAnyItems ? 'not-allowed' : 'pointer' }}
      >
        <div className="sidebar-nav-icon" aria-hidden="true">
          <Trash2 size={20} />
        </div>
        <div className={`flyout-menu ${deleteFlyoutOpen ? 'show' : ''}`}>
          {(adversaries && adversaries.length > 0) && (
            <button className="flyout-menu-item delete-flyout-item" onClick={(e) => { e.stopPropagation(); setDeleteFlyoutOpen(false); adversaries.forEach(item => deleteAdversary(item.id)) }}>
              <div style={{display: 'flex', alignItems: 'center', gap: '0.25rem'}}>
                <span aria-hidden="true">×</span>
                <span>All Adversaries</span>
              </div>
            </button>
          )}
          {(adversaries && adversaries.length > 0 && hasDeadAdversaries) && (
            <button className="flyout-menu-item delete-flyout-item" onClick={(e) => { e.stopPropagation(); setDeleteFlyoutOpen(false); const dead = adversaries.filter(adv => (adv.hp || 0) >= (adv.hpMax || 1)); dead.forEach(item => deleteAdversary(item.id)) }}>
              <div style={{display: 'flex', alignItems: 'center', gap: '0.25rem'}}>
                <span aria-hidden="true">×</span>
                <span>Dead Adversaries</span>
              </div>
            </button>
          )}
          {(environments && environments.length > 0) && (
            <button className="flyout-menu-item delete-flyout-item" onClick={(e) => { e.stopPropagation(); setDeleteFlyoutOpen(false); environments.forEach(item => deleteEnvironment(item.id)) }}>
              <div style={{display: 'flex', alignItems: 'center', gap: '0.25rem'}}>
                <span aria-hidden="true">×</span>
                <span>All Environments</span>
              </div>
            </button>
          )}
          {(countdowns && countdowns.length > 0) && (
            <button className="flyout-menu-item delete-flyout-item" onClick={(e) => { e.stopPropagation(); setDeleteFlyoutOpen(false); countdowns.forEach(countdown => deleteCountdown(countdown.id)) }}>
              <div style={{display: 'flex', alignItems: 'center', gap: '0.25rem'}}>
                <span aria-hidden="true">×</span>
                <span>All Countdowns</span>
              </div>
            </button>
          )}
        </div>
      </div>

      <div
        className={`sidebar-nav-item ${helpFlyoutOpen ? 'help-active' : ''}`}
        onClick={(e) => {
          e.stopPropagation()
          setHelpFlyoutOpen(!helpFlyoutOpen)
          setDeleteFlyoutOpen(false)
        }}
        title="Help & Info"
        style={{ cursor: 'pointer' }}
      >
        <div className="sidebar-nav-icon">
          <HelpCircle size={20} />
        </div>
        <div className={`flyout-menu ${helpFlyoutOpen ? 'show' : ''}`}>
          {/* DPCGL Attribution */}
          <div className="help-attribution">
            <img 
              src="/logos/Darrington Press Community Content Logos/Daggerheart/PNGs/DH_CGL_logos_final_white.png"
              alt="Daggerheart Community Content Logo"
              className="help-logo"
            />
            <div className="help-attribution-text">
              <p>This product includes materials from the Daggerheart System Reference Document 1.0, © Critical Role, LLC, under the terms of the Darrington Press Community Gaming (DPCGL) License.</p>
              <p>More information can be found at <a href="https://www.daggerheart.com" target="_blank" rel="noopener noreferrer">daggerheart.com</a></p>
              <p><em>This project is unofficial and not endorsed by Darrington Press or Critical Role.</em></p>
            </div>
          </div>
          
          <button 
            className="flyout-menu-item help-flyout-item" 
            onClick={(e) => { 
              e.stopPropagation(); 
              setHelpFlyoutOpen(false); 
              window.open('https://github.com/Splinter714/Daggerheart', '_blank')
            }}
          >
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem'}}>
              <span>GitHub</span>
            </div>
          </button>
          <div className="flyout-menu-item help-flyout-item" style={{cursor: 'default', color: 'var(--text-secondary)'}}>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem'}}>
              <span>Version {typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : 'dev'}</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default BottomBar


