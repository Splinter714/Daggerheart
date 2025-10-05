// Adversary Default Values
// Source: Daggerheart SRD 1.0 - "Improvising Adversaries" section
// These defaults are derived from the official "Improvised Statistics by Tier" table

// Tier-based defaults from the SRD guidance
// These values come directly from the "Improvised Statistics by Tier" table in the SRD
export const tierDefaults = {
  1: {
    difficulty: 11,           // SRD: "difficulty: 11"
    thresholds: { major: 7, severe: 12 },  // SRD: "Major 7/Severe 12"
    attackModifier: 1          // SRD: "attack_modifier: +1"
  },
  2: {
    difficulty: 14,           // SRD: "difficulty: 14"
    thresholds: { major: 10, severe: 20 }, // SRD: "Major 10/Severe 20"
    attackModifier: 2          // SRD: "attack_modifier: +2"
  },
  3: {
    difficulty: 17,           // SRD: "difficulty: 17"
    thresholds: { major: 20, severe: 32 }, // SRD: "Major 20/Severe 32"
    attackModifier: 3          // SRD: "attack_modifier: +3"
  },
  4: {
    difficulty: 20,           // SRD: "difficulty: 20"
    thresholds: { major: 25, severe: 45 }, // SRD: "Major 25/Severe 45"
    attackModifier: 4          // SRD: "attack_modifier: +4"
  }
}

// Type-based defaults for HP, stress, and other characteristics
// These are derived from SRD guidance and analysis of existing adversaries
// SRD mentions: "When moving adversaries from Tiers 1-2 to Tiers 3-4, consider raising HP and Stress by 1-3 points"
export const typeDefaults = {
  'Minion': {
    // SRD: "Give flat damage value (1-5) for standard attack"
    // Minions are meant to be weak, disposable enemies
    hpMax: (tier) => Math.max(1, tier - 1),  // Very low HP, minimum 1
    stressMax: 0,                   // No stress - they're too weak
    damage: (tier) => `${tier}d4+${tier}`,     // Low damage dice
    range: 'Melee'
  },
  'Standard': {
    // Baseline adversary type - balanced stats
    hpMax: (tier) => tier + 1,                // Moderate HP
    stressMax: 1,                   // Standard stress
    damage: (tier) => `${tier}d6+${tier + 1}`, // Standard damage progression
    range: 'Melee'
  },
  'Bruiser': {
    // SRD: "Bruiser" type - meant to be tanky, high damage
    hpMax: (tier) => tier + 3,                // High HP for tanking
    stressMax: 1,                   // Standard stress (not evasive)
    damage: (tier) => `${tier + 1}d6+${tier + 2}`, // Higher damage than standard
    range: 'Melee'
  },
  'Skulk': {
    // Evasive, hard to hit but fragile
    hpMax: (tier) => tier,                    // Low HP
    stressMax: 2,                   // High stress (evasive)
    damage: (tier) => `${tier}d4+${tier}`,     // Lower damage (hit and run)
    range: 'Melee'
  },
  'Ranged': {
    // Similar to Standard but with range
    hpMax: (tier) => tier + 1,                // Moderate HP
    stressMax: 1,                   // Standard stress
    damage: (tier) => `${tier}d6+${tier + 1}`, // Standard damage
    range: 'Close'                  // Default to Close range
  },
  'Horde': {
    // SRD: "Standard attack should deal high damage"
    hpMax: (tier) => tier + 2,                // Higher HP (group toughness)
    stressMax: 1,                   // Standard stress
    damage: (tier) => `${tier + 1}d6+${tier + 2}`, // High damage as per SRD
    range: 'Melee'
  },
  'Support': {
    // Utility-focused, not frontline fighters
    hpMax: (tier) => tier,                    // Low HP
    stressMax: 2,                   // High stress (evasive)
    damage: (tier) => `${tier}d4+${tier}`,     // Lower damage
    range: 'Melee'
  },
  'Social': {
    // Similar to Support - utility focused
    hpMax: (tier) => tier,                    // Low HP
    stressMax: 2,                   // High stress (evasive)
    damage: (tier) => `${tier}d4+${tier}`,     // Lower damage
    range: 'Melee'
  },
  'Leader': {
    // Commanding presence, higher stats
    hpMax: (tier) => tier + 2,                // Higher HP
    stressMax: 2,                   // Higher stress (commanding)
    damage: (tier) => `${tier}d6+${tier + 2}`, // Higher damage
    range: 'Melee'
  },
  'Solo': {
    // SRD: "Give high damage, high HP, and features that let them act more frequently"
    hpMax: (tier) => tier * 2 + 2,           // Very high HP (boss-like)
    stressMax: 3,                   // Very high stress
    damage: (tier) => `${tier + 1}d8+${tier + 3}`, // Very high damage
    range: 'Melee'
  }
}

// Main function to get default adversary values based on tier and type
export const getDefaultAdversaryValues = (tier, type) => {
  const tierValues = tierDefaults[tier] || tierDefaults[1]
  const typeValues = typeDefaults[type] || typeDefaults['Standard']

  // Combine tier and type defaults, with type taking precedence for overlapping fields
  // This ensures we get the right balance of tier-appropriate stats and type-specific characteristics
  return {
    ...tierValues,
    // Calculate dynamic values based on tier
    hpMax: typeValues.hpMax(tier),
    stressMax: typeValues.stressMax,
    atk: tierValues.attackModifier,
    damage: typeValues.damage(tier),
    range: typeValues.range,
    // Ensure we have all required fields with fallbacks
    thresholds: tierValues.thresholds,
    difficulty: tierValues.difficulty
  }
}
