import React from 'react'

const MergedStatBadge = ({ label, value, shape }) => {
  const isHex = shape === 'hex'
  const W = 78
  const cx = 60
  const pillW = 60
  return (
    <svg width={`${(W / 34 * 1.5).toFixed(3)}em`} height="1.5em" viewBox={`0 0 ${W} 34`} style={{ display: 'block', alignSelf: 'center', flexShrink: 0 }}>
      <rect x="0.5" y="6.5" width={pillW} height="21" rx="4" fill="black" stroke="var(--text-secondary)" strokeWidth="1" />
      {isHex ? (
        <g transform="translate(42,-1) scale(1.5)" fill="black" stroke="var(--text-secondary)" strokeWidth="0.67" strokeLinejoin="round" strokeLinecap="round">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
        </g>
      ) : (
        <g transform="translate(35.4,-7.6) scale(2.05)" stroke="var(--text-secondary)" strokeWidth="0.47" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12.78 4.78 L19.22 11.22 Q20 12 19.22 12.78 L12.78 19.22 Q12 20 11.22 19.22 L4.78 12.78 Q4 12 4.78 11.22 L11.22 4.78 Q12 4 12.78 4.78 Z" fill="black" />
          <g transform="rotate(45 12 12)">
            <line x1="12" y1="3.5" x2="12" y2="6.34" />
            <line x1="20.5" y1="12" x2="17.66" y2="12" />
            <line x1="12" y1="20.5" x2="12" y2="17.66" />
            <line x1="3.5" y1="12" x2="6.34" y2="12" />
          </g>
        </g>
      )}
      <text x="7" y="17" dy="0.35em" fill="white" fontSize="15" fontWeight="500" fontFamily="inherit" textAnchor="start">{label}</text>
      <text x={cx} y="17" dy="0.35em" fill="white" fontSize="17" fontWeight="500" fontFamily="inherit" textAnchor="middle">{value}</text>
    </svg>
  )
}

export default MergedStatBadge
