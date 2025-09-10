// Centralized countdown logic used across the app

/**
 * Determine which trigger controls should be shown based on active countdowns
 */
export function getNeededTriggers(countdowns = []) {
  if (!Array.isArray(countdowns) || countdowns.length === 0) {
    return {
      basicRollTriggers: false,
      simpleFearTriggers: false,
      simpleHopeTriggers: false,
      complexRollTriggers: false,
      restTriggers: false,
    }
  }

  const hasDynamicCountdowns = countdowns.some((c) =>
    c?.type === 'progress' ||
    c?.type === 'consequence' ||
    c?.type === 'dynamic-progress' ||
    c?.type === 'dynamic-consequence'
  )
  const hasLongTermCountdowns = countdowns.some((c) => c?.type === 'long-term')
  const hasSimpleFearCountdowns = countdowns.some((c) => c?.type === 'simple-fear')
  const hasSimpleHopeCountdowns = countdowns.some((c) => c?.type === 'simple-hope')
  const hasStandardCountdowns = countdowns.some((c) => c?.type === 'standard' || !c?.type)

  return {
    basicRollTriggers: hasStandardCountdowns,
    simpleFearTriggers: hasSimpleFearCountdowns && !hasDynamicCountdowns,
    simpleHopeTriggers: hasSimpleHopeCountdowns && !hasDynamicCountdowns,
    complexRollTriggers: hasDynamicCountdowns,
    restTriggers: hasLongTermCountdowns,
  }
}

/**
 * Map a roll outcome into advancement for a given countdown.
 * outcome values include: 'simple-fear', 'simple-hope',
 * 'success-fear', 'success-hope', 'failure-fear', 'failure-hope', 'critical-success'
 */
export function getAdvancementForOutcome(countdown, outcome) {
  const type = countdown?.type || 'standard'

  if (type === 'standard') {
    return 1
  }

  if (type === 'progress' || type === 'dynamic-progress') {
    switch (outcome) {
      case 'success-hope':
        return 2
      case 'success-fear':
        return 1
      case 'critical-success':
        return 3
      default:
        return 0
    }
  }

  if (type === 'consequence' || type === 'dynamic-consequence') {
    switch (outcome) {
      case 'success-fear':
        return 1
      case 'failure-hope':
        return 2
      case 'failure-fear':
        return 3
      default:
        return 0
    }
  }

  if (type === 'simple-fear') {
    return outcome === 'simple-fear' || outcome === 'success-fear' || outcome === 'failure-fear' ? 1 : 0
  }

  if (type === 'simple-hope') {
    return outcome === 'simple-hope' || outcome === 'success-hope' || outcome === 'failure-hope' ? 1 : 0
  }

  return 0
}

/**
 * Advancement for a generic action roll (used for standard countdowns)
 */
export function getAdvancementForActionRoll(countdown) {
  const type = countdown?.type || 'standard'
  return type === 'standard' ? 1 : 0
}

/**
 * Advancement for a rest trigger (long or short) for long-term countdowns
 */
export function getAdvancementForRest(countdown, restType) {
  if (countdown?.type !== 'long-term') return 0
  return restType === 'long' ? 2 : 1
}


