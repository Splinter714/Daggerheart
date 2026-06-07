import React from 'react'

const WHITE = { color: 'var(--text-primary)' }
const WHITE_UNDERLINE = { color: 'var(--text-primary)', textDecoration: 'underline' }

// Rules in order — longer/more specific patterns first
const RULES = [
  // Trigger clauses — "When [condition]" up to (not including) the comma — white only
  { regex: /\b(?:When|If)\b/g, style: WHITE_UNDERLINE },
  // Frequency limiter — "Once per scene/turn/round/encounter" — white only
  { regex: /\bOnce per (?:scene|turn|round|encounter)\b/gi, style: WHITE },
  // "You must spend/mark" — GM cost even though it uses "must"
  { regex: /\byou must\s+(?:spend|mark)\s+(?:a\s+|an\s+|\d+\s+)?(?:fear|stress|hp)\b/gi, style: WHITE_UNDERLINE },
  // GM cost phrases — "Spend [X] Fear" always GM; "Mark/Spend [X] Stress/HP" only when NOT preceded
  // by "must " (which signals a cost forced onto players instead)
  { regex: /(?<!must\s)\bspend\s+(?:a\s+|an\s+|\d+\s+)?(?:fear|stress|hp)\b/gi, style: WHITE_UNDERLINE },
  { regex: /(?<!must\s)\bmark\s+(?:a\s+|an\s+|\d+\s+)?(?:stress|hp)\b/gi, style: WHITE_UNDERLINE },
  // GM outcomes — white only (no underline)
  { regex: /\byou gain\s+(?:a\s+|\d+d?\d*\s+)?fear\b/gi, style: WHITE },
  { regex: /\blose\s+a\s+hope\b/gi, style: WHITE },
  { regex: /\bclear\s+(?:a\s+|\d+\s+)?(?:hp|stress)\b/gi, style: WHITE },
  // Dice notation — white only
  { regex: /\d+d\d+(?:[+-]\d+)?/g, style: WHITE },
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
