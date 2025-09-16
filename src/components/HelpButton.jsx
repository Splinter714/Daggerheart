import React, { useEffect, useState } from 'react'
import { HelpCircle } from 'lucide-react'
import logoImage from '../assets/daggerheart-logo.svg'

const HelpButton = () => {
  const [helpFlyoutOpen, setHelpFlyoutOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.help-button')) {
        setHelpFlyoutOpen(false)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  // Mobile detection using CSS media query (zoom-independent)
  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 800px)')
    const handleMediaChange = (e) => setIsMobile(e.matches)
    
    // Set initial value
    setIsMobile(mediaQuery.matches)
    
    mediaQuery.addEventListener('change', handleMediaChange)
    return () => mediaQuery.removeEventListener('change', handleMediaChange)
  }, [])

  return (
    <div
      className="help-button"
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0.5rem',
        color: 'var(--text-primary)',
        borderRadius: 'var(--radius-md)',
        cursor: 'pointer',
        transition: 'background-color 0.2s ease',
        minWidth: '44px',
        minHeight: '44px',
        backgroundColor: helpFlyoutOpen ? 'var(--purple)' : 'transparent'
      }}
      onMouseEnter={(e) => {
        if (!helpFlyoutOpen) {
          e.target.style.backgroundColor = 'var(--bg-secondary)'
        }
      }}
      onMouseLeave={(e) => {
        if (!helpFlyoutOpen) {
          e.target.style.backgroundColor = 'transparent'
        }
      }}
      onClick={(e) => {
        e.stopPropagation()
        setHelpFlyoutOpen(!helpFlyoutOpen)
      }}
      title="Help & Info"
    >
      <div style={{
        width: '20px',
        height: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'inherit'
      }}>
        <HelpCircle size={20} />
      </div>
      <div style={{
        position: 'absolute',
        bottom: '100%',
        left: '50%',
        right: 'auto',
        transform: 'translateX(-50%)',
        background: 'var(--bg-primary)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
        zIndex: 1000,
        opacity: helpFlyoutOpen ? 1 : 0,
        visibility: helpFlyoutOpen ? 'visible' : 'hidden',
        transition: 'opacity 0.2s ease, visibility 0.2s ease, transform 0.2s ease',
        pointerEvents: helpFlyoutOpen ? 'auto' : 'none',
        minWidth: '280px',
        maxWidth: isMobile ? 'calc(100vw - 2rem)' : '320px',
        marginBottom: isMobile ? '0.5rem' : '0'
      }}>
        {/* DPCGL Attribution */}
        <div style={{
          padding: '0.75rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          background: 'var(--bg-primary)',
          maxWidth: '280px'
        }}>
            <img 
              src={logoImage}
              alt="Daggerheart Community Content Logo"
              style={{
                width: '100%',
                maxWidth: '200px',
                height: 'auto',
                margin: '0 auto 0.75rem auto',
                display: 'block'
              }}
              onError={(e) => {
                console.error('Failed to load Daggerheart logo:', e.target.src);
                e.target.style.display = 'none';
                // Fallback to text if logo fails
                const fallbackDiv = document.createElement('div');
                fallbackDiv.style.cssText = 'text-align: center; margin-bottom: 0.75rem; font-size: 1.5rem; font-weight: bold; color: var(--purple);';
                fallbackDiv.textContent = '⚔️ DAGGERHEART ⚔️';
                e.target.parentNode.insertBefore(fallbackDiv, e.target);
              }}
              onLoad={() => {
                // Logo loaded successfully
              }}
            />
          <div style={{
            fontSize: '0.7rem',
            lineHeight: 1.3,
            color: 'var(--text-secondary)',
            textAlign: 'left',
            wordWrap: 'break-word',
            overflowWrap: 'break-word'
          }}>
            <p>This product includes materials from the Daggerheart System Reference Document 1.0, © Critical Role, LLC, under the terms of the Darrington Press Community Gaming (DPCGL) License.</p>
            <p>More information can be found at <a href="https://www.daggerheart.com" target="_blank" rel="noopener noreferrer">daggerheart.com</a></p>
            <p><em>This project is unofficial and not endorsed by Darrington Press or Critical Role.</em></p>
          </div>
        </div>
        
        <button 
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            padding: '0.25rem 1rem',
            color: 'var(--text-primary)',
            border: 'none',
            background: 'none',
            width: '100%',
            textAlign: 'left',
            cursor: 'pointer',
            transition: 'background-color 0.2s ease',
            fontSize: '0.875rem',
            minHeight: '32px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = 'var(--gray-dark)'
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'transparent'
          }}
          onClick={(e) => { 
            e.stopPropagation(); 
            setHelpFlyoutOpen(false); 
            window.open('https://github.com/Splinter714/Daggerheart', '_blank')
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.25rem'
          }}>
            <span>GitHub</span>
          </div>
        </button>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          padding: '0.25rem 1rem',
          color: 'var(--text-secondary)',
          border: 'none',
          background: 'none',
          width: '100%',
          textAlign: 'left',
          cursor: 'default',
          fontSize: '0.875rem',
          minHeight: '32px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.25rem'
          }}>
            <span>Version {typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : 'dev'}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HelpButton
