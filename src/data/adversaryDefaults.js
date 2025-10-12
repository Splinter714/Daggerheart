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
// Based on comprehensive "Improvised Statistics by Tier" table
export const typeDefaults = {
  'Minion': {
    difficulty: (tier) => [9, 12, 15, 18][tier - 1],  // 9, 12, 15, 18
    thresholds: (tier) => ({ major: 0, severe: 0 }),   // Always 0 for minions
    hpMax: (tier) => 1,                                // Always 1 HP
    stressMax: (tier) => 1,                            // Always 1 stress
    atk: (tier) => [-1, 0, 1, 2][tier - 1],           // -1, 0, 1, 2
    damage: (tier) => ['2', '5', '8', '11'][tier - 1], // Flat damage: 2, 5, 8, 11
    range: 'Melee'
  },
  'Standard': {
    difficulty: (tier) => [11, 14, 17, 20][tier - 1], // 11, 14, 17, 20
    thresholds: (tier) => ({ major: [7, 10, 20, 25][tier - 1], severe: [12, 20, 32, 45][tier - 1] }),
    hpMax: (tier) => [4, 5, 6, 7][tier - 1],          // 4, 5, 6, 7
    stressMax: (tier) => [3, 3, 4, 4][tier - 1],      // 3, 3, 4, 4
    atk: (tier) => [1, 2, 3, 4][tier - 1],            // 1, 2, 3, 4
    damage: (tier) => ['1d8+1', '2d8+2', '3d8+3', '4d8+4'][tier - 1],
    range: 'Melee'
  },
  'Bruiser': {
    difficulty: (tier) => [11, 14, 17, 20][tier - 1], // 11, 14, 17, 20
    thresholds: (tier) => ({ major: [8, 14, 22, 38][tier - 1], severe: [15, 28, 40, 70][tier - 1] }),
    hpMax: (tier) => [6, 7, 8, 9][tier - 1],          // 6, 7, 8, 9
    stressMax: (tier) => [4, 4, 5, 5][tier - 1],      // 4, 4, 5, 5
    atk: (tier) => [-1, 0, 1, 2][tier - 1],           // -1, 0, 1, 2
    damage: (tier) => ['1d12+2', '2d12+4', '3d12+6', '4d12+8'][tier - 1],
    range: 'Melee'
  },
  'Horde': {
    difficulty: (tier) => [10, 13, 16, 19][tier - 1], // 10, 13, 16, 19
    thresholds: (tier) => ({ major: [7, 10, 20, 25][tier - 1], severe: [12, 20, 32, 45][tier - 1] }),
    hpMax: (tier) => [5, 6, 7, 8][tier - 1],          // 5, 6, 7, 8
    stressMax: (tier) => [3, 3, 4, 4][tier - 1],      // 3, 3, 4, 4
    atk: (tier) => [-1, 0, 1, 2][tier - 1],           // -1, 0, 1, 2
    damage: (tier) => ['1d8+2', '2d8+4', '3d8+6', '4d8+8'][tier - 1],
    range: 'Melee'
  },
  'Leader': {
    difficulty: (tier) => [11, 14, 17, 20][tier - 1], // 11, 14, 17, 20
    thresholds: (tier) => ({ major: [7, 13, 21, 35][tier - 1], severe: [14, 26, 38, 65][tier - 1] }),
    hpMax: (tier) => [5, 6, 7, 8][tier - 1],          // 5, 6, 7, 8
    stressMax: (tier) => [5, 5, 6, 6][tier - 1],      // 5, 5, 6, 6
    atk: (tier) => [2, 4, 6, 8][tier - 1],            // 2, 4, 6, 8
    damage: (tier) => ['1d10+2', '2d10+4', '3d10+6', '4d10+8'][tier - 1],
    range: 'Melee'
  },
  'Ranged': {
    difficulty: (tier) => [10, 13, 16, 19][tier - 1], // 10, 13, 16, 19
    thresholds: (tier) => ({ major: [4, 8, 18, 22][tier - 1], severe: [7, 16, 30, 42][tier - 1] }),
    hpMax: (tier) => [3, 4, 5, 6][tier - 1],          // 3, 4, 5, 6
    stressMax: (tier) => [3, 3, 4, 4][tier - 1],      // 3, 3, 4, 4
    atk: (tier) => [2, 3, 4, 5][tier - 1],            // 2, 3, 4, 5
    damage: (tier) => ['1d8+2', '2d8+4', '3d8+6', '4d8+8'][tier - 1],
    range: 'Close'                                    // Ranged default
  },
  'Skulk': {
    difficulty: (tier) => [12, 15, 18, 21][tier - 1], // 12, 15, 18, 21
    thresholds: (tier) => ({ major: [5, 9, 19, 23][tier - 1], severe: [10, 18, 31, 43][tier - 1] }),
    hpMax: (tier) => [4, 5, 6, 7][tier - 1],          // 4, 5, 6, 7
    stressMax: (tier) => [3, 3, 4, 4][tier - 1],      // 3, 3, 4, 4
    atk: (tier) => [2, 3, 4, 5][tier - 1],            // 2, 3, 4, 5
    damage: (tier) => ['1d6+2', '2d6+4', '3d6+6', '4d6+8'][tier - 1],
    range: 'Melee'
  },
  'Solo': {
    difficulty: (tier) => [12, 15, 18, 21][tier - 1], // 12, 15, 18, 21
    thresholds: (tier) => ({ major: [7, 13, 21, 35][tier - 1], severe: [14, 26, 38, 65][tier - 1] }),
    hpMax: (tier) => [8, 9, 10, 11][tier - 1],        // 8, 9, 10, 11 (very high HP)
    stressMax: (tier) => [5, 5, 6, 6][tier - 1],      // 5, 5, 6, 6 (very high stress)
    atk: (tier) => [3, 5, 7, 9][tier - 1],            // 3, 5, 7, 9
    damage: (tier) => ['1d10+3', '2d10+6', '3d10+9', '4d10+12'][tier - 1],
    range: 'Melee'
  },
  'Support': {
    difficulty: (tier) => [11, 14, 17, 20][tier - 1], // 11, 14, 17, 20
    thresholds: (tier) => ({ major: [5, 9, 19, 23][tier - 1], severe: [10, 18, 31, 43][tier - 1] }),
    hpMax: (tier) => [4, 4, 5, 5][tier - 1],          // 4, 4, 5, 5
    stressMax: (tier) => [4, 4, 5, 5][tier - 1],      // 4, 4, 5, 5
    atk: (tier) => [2, 3, 4, 5][tier - 1],            // 2, 3, 4, 5
    damage: (tier) => ['1d4+2', '2d4+4', '3d4+6', '4d4+8'][tier - 1],
    range: 'Melee'
  },
  'Social': {
    // Use Support stats as baseline (similar utility-focused role)
    difficulty: (tier) => [11, 14, 17, 20][tier - 1], // 11, 14, 17, 20
    thresholds: (tier) => ({ major: [5, 9, 19, 23][tier - 1], severe: [10, 18, 31, 43][tier - 1] }),
    hpMax: (tier) => [4, 4, 5, 5][tier - 1],          // 4, 4, 5, 5
    stressMax: (tier) => [4, 4, 5, 5][tier - 1],      // 4, 4, 5, 5
    atk: (tier) => [2, 3, 4, 5][tier - 1],            // 2, 3, 4, 5
    damage: (tier) => ['1d4+2', '2d4+4', '3d4+6', '4d4+8'][tier - 1],
    range: 'Melee'
  }
}

// Main function to get default adversary values based on tier and type
export const getDefaultAdversaryValues = (tier, type) => {
  const typeValues = typeDefaults[type] || typeDefaults['Standard']

  // Use type-specific values that are calculated based on tier
  return {
    // Type-specific values that vary by tier
    difficulty: typeValues.difficulty(tier),
    thresholds: typeValues.thresholds(tier),
    hpMax: typeValues.hpMax(tier),
    stressMax: typeValues.stressMax(tier),
    atk: typeValues.atk(tier),
    damage: typeValues.damage(tier),
    range: typeValues.range
  }
}
