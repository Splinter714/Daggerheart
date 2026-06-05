// Adversary default values derived from adversaryGuideRanges.js
// Numeric stats = Math.ceil((min + max) / 2) of the guide range for that type/tier.
// Damage strings and weapon range are not in the guide ranges and are kept here directly.

import { guideRanges, damagePools } from './adversaryGuideRanges'

// Round up the midpoint of a [min, max] range pair. Returns 0 for null ranges.
const avg = (range) => {
  if (!range) return 0
  return Math.ceil((range[0] + range[1]) / 2)
}

// Damage default: first option from the guide's dice pool list for that type/tier.
// This ensures the prefilled value always matches one of the button options in the creator.

// Default weapon range per type.
const weaponRange = {
  Minion:   'Melee',
  Standard: 'Melee',
  Bruiser:  'Melee',
  Horde:    'Melee',
  Leader:   'Melee',
  Ranged:   'Close',
  Skulk:    'Melee',
  Solo:     'Melee',
  Support:  'Melee',
  Social:   'Melee',
}

export const getDefaultAdversaryValues = (tier, type) => {
  const r = guideRanges[type]?.[tier] ?? guideRanges['Standard'][tier]

  return {
    difficulty:  avg(r.difficulty),
    thresholds: {
      major:  avg(r.major),
      severe: avg(r.severe),
    },
    hpMax:      avg(r.hp),
    stressMax:  avg(r.stress),
    atk:        avg(r.atk),
    damage:     damagePools[type]?.[tier]?.[0] ?? damagePools['Standard'][tier][0],
    range:      weaponRange[type] ?? 'Melee',
  }
}
