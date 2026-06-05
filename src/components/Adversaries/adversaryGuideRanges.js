// Stat ranges extracted from adversary-creation-guide.md
// Format: [min, max] for each stat. null = not applicable.

export const guideRanges = {
  Bruiser: {
    1: { difficulty: [12,14], major: [7,9],   severe: [13,15], hp: [5,7],   stress: [3,4], atk: [0,2]   },
    2: { difficulty: [14,16], major: [12,14],  severe: [23,26], hp: [5,7],   stress: [4,6], atk: [2,4]   },
    3: { difficulty: [16,18], major: [19,22],  severe: [35,40], hp: [6,8],   stress: [4,6], atk: [3,5]   },
    4: { difficulty: [18,20], major: [30,37],  severe: [63,70], hp: [7,9],   stress: [4,6], atk: [5,8]   },
  },
  Horde: {
    1: { difficulty: [10,12], major: [5,10],   severe: [8,12],  hp: [4,6],   stress: [2,3], atk: [-2,0]  },
    2: { difficulty: [12,14], major: [10,15],  severe: [16,20], hp: [5,6],   stress: [2,3], atk: [-1,1]  },
    3: { difficulty: [14,16], major: [15,25],  severe: [26,32], hp: [6,7],   stress: [3,4], atk: [0,2]   },
    4: { difficulty: [16,18], major: [20,30],  severe: [35,45], hp: [7,8],   stress: [4,5], atk: [1,3]   },
  },
  Leader: {
    1: { difficulty: [12,14], major: [7,9],   severe: [13,15], hp: [5,7],   stress: [3,4], atk: [2,4]   },
    2: { difficulty: [14,16], major: [12,14],  severe: [23,26], hp: [5,7],   stress: [4,5], atk: [3,5]   },
    3: { difficulty: [17,19], major: [19,22],  severe: [35,40], hp: [6,8],   stress: [5,6], atk: [5,7]   },
    4: { difficulty: [19,21], major: [30,37],  severe: [63,70], hp: [7,9],   stress: [6,8], atk: [8,10]  },
  },
  Minion: {
    1: { difficulty: [10,12], major: null,     severe: null,    hp: [1,1],   stress: [1,1], atk: [-2,0]  },
    2: { difficulty: [12,14], major: null,     severe: null,    hp: [1,1],   stress: [1,1], atk: [-1,1]  },
    3: { difficulty: [14,16], major: null,     severe: null,    hp: [1,1],   stress: [1,2], atk: [0,2]   },
    4: { difficulty: [16,18], major: null,     severe: null,    hp: [1,1],   stress: [1,2], atk: [1,3]   },
  },
  Ranged: {
    1: { difficulty: [10,12], major: [3,5],   severe: [6,9],   hp: [3,4],   stress: [2,3], atk: [1,2]   },
    2: { difficulty: [13,15], major: [5,8],   severe: [13,18], hp: [3,5],   stress: [2,3], atk: [2,5]   },
    3: { difficulty: [15,17], major: [12,15],  severe: [25,30], hp: [4,6],   stress: [3,4], atk: [3,4]   },
    4: { difficulty: [17,19], major: [18,25],  severe: [30,40], hp: [4,6],   stress: [4,5], atk: [4,6]   },
  },
  Skulk: {
    1: { difficulty: [10,12], major: [5,7],   severe: [8,12],  hp: [3,4],   stress: [2,3], atk: [1,2]   },
    2: { difficulty: [12,14], major: [7,9],   severe: [16,20], hp: [3,5],   stress: [3,4], atk: [2,5]   },
    3: { difficulty: [14,16], major: [15,20],  severe: [27,32], hp: [4,6],   stress: [4,5], atk: [3,7]   },
    4: { difficulty: [16,18], major: [20,30],  severe: [35,45], hp: [4,6],   stress: [4,6], atk: [4,8]   },
  },
  Solo: {
    1: { difficulty: [12,14], major: [7,9],   severe: [13,15], hp: [8,10],  stress: [3,4], atk: [3,3]   },
    2: { difficulty: [14,16], major: [12,14],  severe: [23,26], hp: [8,10],  stress: [4,5], atk: [3,4]   },
    3: { difficulty: [17,19], major: [19,22],  severe: [35,40], hp: [10,12], stress: [5,6], atk: [4,7]   },
    4: { difficulty: [19,21], major: [30,37],  severe: [63,70], hp: [10,12], stress: [6,8], atk: [7,10]  },
  },
  Standard: {
    1: { difficulty: [11,13], major: [5,8],   severe: [8,12],  hp: [4,5],   stress: [3,4], atk: [0,2]   },
    2: { difficulty: [13,15], major: [8,12],   severe: [16,20], hp: [5,6],   stress: [3,4], atk: [1,3]   },
    3: { difficulty: [15,17], major: [15,20],  severe: [27,32], hp: [5,6],   stress: [4,5], atk: [2,4]   },
    4: { difficulty: [17,19], major: [25,35],  severe: [35,55], hp: [5,6],   stress: [4,5], atk: [3,5]   },
  },
  Support: {
    1: { difficulty: [12,14], major: [5,8],   severe: [9,12],  hp: [3,4],   stress: [4,5], atk: [0,2]   },
    2: { difficulty: [13,15], major: [8,12],   severe: [16,20], hp: [3,5],   stress: [4,6], atk: [1,3]   },
    3: { difficulty: [15,17], major: [15,20],  severe: [28,35], hp: [4,6],   stress: [5,6], atk: [2,4]   },
    4: { difficulty: [17,19], major: [20,30],  severe: [35,45], hp: [4,6],   stress: [5,6], atk: [3,5]   },
  },
  Social: {
    1: { difficulty: [10,12], major: [3,5],   severe: [6,9],   hp: [3,3],   stress: [2,3], atk: [-4,-1] },
    2: { difficulty: [13,15], major: [5,8],   severe: [13,18], hp: [3,3],   stress: [2,3], atk: [-3,0]  },
    3: { difficulty: [15,17], major: [15,20],  severe: [27,32], hp: [4,4],   stress: [2,3], atk: [-2,2]  },
    4: { difficulty: [17,19], major: [25,35],  severe: [35,50], hp: [4,4],   stress: [2,3], atk: [2,6]   },
  },
}

export const formatRange = (range) => {
  if (!range) return 'none'
  if (range[0] === range[1]) return `${range[0]}`
  return `${range[0]}–${range[1]}`
}

export const formatAtkRange = (range) => {
  if (!range) return 'none'
  const fmt = (n) => n >= 0 ? `+${n}` : `${n}`
  if (range[0] === range[1]) return fmt(range[0])
  return `${fmt(range[0])} to ${fmt(range[1])}`
}

export const getGuideRange = (type, tier) => {
  return guideRanges[type]?.[tier] || null
}

// Potential dice pool options per type/tier, directly from adversary-creation-guide.md
// Minions use flat damage values instead of dice.
export const damagePools = {
  Bruiser:  { 1: ['1d12+2','1d10+4','1d8+6'],        2: ['2d12+3','2d10+2','2d8+6'],        3: ['3d12+1','3d10+4','3d8+8'],       4: ['4d12+15','4d10+10','4d8+12']  },
  Horde:    { 1: ['1d10+2','1d8+3','1d6+4'],          2: ['2d10+2','2d8+6','2d6+3'],          3: ['3d10+2','3d8+4','3d6+6'],        4: ['4d10+4','4d8+8','4d6+10']     },
  Leader:   { 1: ['1d12+1','1d10+3','1d8+5'],         2: ['2d12+1','2d10+3','2d8+6'],         3: ['3d10+1','3d8+8'],                4: ['4d12+6','4d10+8','4d8+10']    },
  Minion:   { 1: ['1','2','3'],                        2: ['2','3','4'],                        3: ['5','6','7','8'],                 4: ['10','11','12']                },
  Ranged:   { 1: ['1d12+1','1d10+3','1d8+5'],         2: ['2d12+1','2d10+3','2d8+6'],         3: ['3d10+1','3d8+8'],                4: ['4d12+6','4d10+8','4d8+10']    },
  Skulk:    { 1: ['1d8+3','1d6+2','1d4+4'],           2: ['2d8+3','2d6+3','2d4+6'],           3: ['3d8+4','3d6+5','3d4+10'],        4: ['4d12+10','4d10+4','4d6+10']   },
  Solo:     { 1: ['1d20','1d12+2','1d10+4'],          2: ['2d20+3','2d10+2','2d8+6'],         3: ['3d20','3d12+6','3d10+8'],        4: ['4d12+15','4d10+10','4d8+12']  },
  Standard: { 1: ['1d8+1','1d6+2','1d4+4'],           2: ['2d8+2','2d6+3','2d4+4'],           3: ['3d8+2','3d6+3','2d12+2'],        4: ['4d10+2','4d8+4','4d6+10']     },
  Support:  { 1: ['1d8','1d6+2','1d4+4'],             2: ['2d8+1','2d6+2','2d4+3'],           3: ['3d8','3d6+3','2d12+1'],          4: ['3d10+3','4d8+4','4d6+8']      },
  Social:   { 1: ['1d6+1','1d4+1'],                   2: ['2d6+2','1d4+3'],                   3: ['3d6+3','3d4+6'],                 4: ['4d8+5','4d6+4','4d4+8']       },
}

export const getDamagePools = (type, tier) => damagePools[type]?.[tier] ?? null

export const isInRange = (value, range) => {
  if (!range || value === undefined || value === null || value === '') return true
  const num = Number(value)
  if (isNaN(num)) return true
  return num >= range[0] && num <= range[1]
}
