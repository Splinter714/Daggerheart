import React from 'react'

// All highlights get underline only — no color change (text stays as-is)
const HIGHLIGHT = { textDecoration: 'underline' }

// Rules in order — longer/more specific patterns first
const RULES = [
  // Trigger clauses — "When/If"
  { regex: /(?:^|(?<=[.!?]\s))(?:When|If)\b/g, style: HIGHLIGHT },
  // Frequency limiter — "Once per scene/turn/round/encounter"
  { regex: /\bOnce per (?:scene|turn|round|encounter)\b/gi, style: HIGHLIGHT },
  // "You must spend/mark" — GM cost even though it uses "must"
  { regex: /\byou must\s+(?:spend|mark)\s+(?:a\s+|an\s+|\d+\s+)?(?:fear|stress|hp)\b/gi, style: HIGHLIGHT },
  // GM cost phrases — "Spend [X] Fear" always GM; "Mark/Spend [X] Stress/HP" only when NOT preceded
  // by "must " (which signals a cost forced onto players instead)
  { regex: /(?<!must\s)\bspend\s+(?:a\s+|an\s+|\d+\s+)?(?:fear|stress|hp)\b/gi, style: HIGHLIGHT },
  { regex: /(?<!must\s)\bmark\s+(?:a\s+|an\s+|\d+\s+)?(?:stress|hp)\b/gi, style: HIGHLIGHT },
  // GM outcomes
  { regex: /\byou gain\s+(?:a\s+|\d+d?\d*\s+)?fear\b/gi, style: HIGHLIGHT },
  { regex: /\blose\s+a\s+hope\b/gi, style: HIGHLIGHT },
  { regex: /\bclear\s+(?:a\s+|\d+\s+)?(?:hp|stress)\b/gi, style: HIGHLIGHT },
  // Dice notation
  { regex: /\d+d\d+(?:[+-]\d+)?/g, style: HIGHLIGHT },
]

const COMBINED = new RegExp(
  RULES.map(r => `(${r.regex.source})`).join('|'),
  'gi'
)

export function highlightCardText(text) {
  if (!text || typeof text !== 'string') return text

  const parts = []
  let lastIndex = 0
  let match

  COMBINED.lastIndex = 0
  while ((match = COMBINED.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index))
    }

    const ruleIndex = match.slice(1).findIndex(g => g !== undefined)
    parts.push(
      <span key={match.index} style={RULES[ruleIndex].style}>
        {match[0]}
      </span>
    )

    lastIndex = COMBINED.lastIndex
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex))
  }

  return parts.length > 0 ? parts : text
}
