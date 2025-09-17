import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';

const QRCodeDisplay = ({ sessionId, isVisible, onClose }) => {
  const [qrCodeDataURL, setQrCodeDataURL] = useState('');

  useEffect(() => {
    if (sessionId && isVisible) {
      // Create the URL for players to join
      const joinUrl = `${window.location.origin}${window.location.pathname}?sessionId=${sessionId}&playerView=true`;
      
      // Generate QR code
      QRCode.toDataURL(joinUrl, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      }).then(setQrCodeDataURL).catch(console.error);
    }
  }, [sessionId, isVisible]);

  // Handle Escape key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isVisible) {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isVisible, onClose]);

  if (!isVisible || !qrCodeDataURL) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        pointerEvents: 'auto'
      }}
      onClick={(e) => {
        // Close when clicking the backdrop
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div style={{
        backgroundColor: 'var(--bg-card)',
        padding: '2rem',
        borderRadius: '8px',
        border: '1px solid var(--border)',
        textAlign: 'center',
        maxWidth: '90vw',
        maxHeight: '90vh',
        position: 'relative'
      }}>
        {/* Close X button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          style={{
            position: 'absolute',
            top: '0.5rem',
            right: '0.5rem',
            background: 'var(--red)',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '2rem',
            height: '2rem',
            cursor: 'pointer',
            fontSize: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold'
          }}
          title="Close"
        >
          ×
        </button>
        
        <h3 style={{
          margin: '0 0 1rem 0',
          color: 'var(--text-primary)',
          fontSize: '1.25rem'
        }}>
          Join Session
        </h3>
        
        <div style={{
          marginBottom: '1rem'
        }}>
          <img 
            src={qrCodeDataURL} 
            alt="QR Code to join session"
            style={{
              width: '256px',
              height: '256px',
              border: '1px solid var(--border)',
              borderRadius: '4px'
            }}
          />
        </div>
        
        <div style={{
          fontSize: '0.875rem',
          color: 'var(--text-secondary)',
          marginBottom: '1rem',
          fontFamily: 'monospace',
          backgroundColor: 'var(--bg-primary)',
          padding: '0.5rem',
          borderRadius: '4px',
          border: '1px solid var(--border)'
        }}>
          Session ID: {sessionId}
        </div>
        
        <div style={{
          fontSize: '0.75rem',
          color: 'var(--text-secondary)',
          marginBottom: '1rem'
        }}>
          Players can scan this QR code or enter the Session ID manually
        </div>
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: 'var(--red)',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.875rem'
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default QRCodeDisplay;
