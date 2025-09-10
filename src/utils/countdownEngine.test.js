import { describe, it, expect } from 'vitest'
import { getNeededTriggers, getAdvancementForOutcome, getAdvancementForActionRoll, getAdvancementForRest } from './countdownEngine'

describe('countdownEngine', () => {
  it('computes needed triggers', () => {
    const c = [{ type: 'standard' }, { type: 'long-term' }, { type: 'simple-fear' }]
    const t = getNeededTriggers(c)
    expect(t.basicRollTriggers).toBe(true)
    expect(t.restTriggers).toBe(true)
    expect(t.simpleFearTriggers).toBe(true)
  })

  it('advances progress and consequence correctly', () => {
    expect(getAdvancementForOutcome({ type: 'progress' }, 'success-hope')).toBe(2)
    expect(getAdvancementForOutcome({ type: 'progress' }, 'success-fear')).toBe(1)
    expect(getAdvancementForOutcome({ type: 'consequence' }, 'failure-fear')).toBe(3)
  })

  it('advances simple fear/hope by 1 on matching outcomes', () => {
    expect(getAdvancementForOutcome({ type: 'simple-fear' }, 'success-fear')).toBe(1)
    expect(getAdvancementForOutcome({ type: 'simple-hope' }, 'success-hope')).toBe(1)
  })

  it('action roll advances only standard countdowns', () => {
    expect(getAdvancementForActionRoll({ type: 'standard' })).toBe(1)
    expect(getAdvancementForActionRoll({ type: 'progress' })).toBe(0)
  })

  it('rest advances long-term by 1 or 2', () => {
    expect(getAdvancementForRest({ type: 'long-term' }, 'short')).toBe(1)
    expect(getAdvancementForRest({ type: 'long-term' }, 'long')).toBe(2)
    expect(getAdvancementForRest({ type: 'standard' }, 'long')).toBe(0)
  })
})


