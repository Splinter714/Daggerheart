import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSkull, faMoon, faFire, faDice } from '@fortawesome/free-solid-svg-icons'

const CountdownTriggerControls = ({
  triggers,
  fear,
  updateFear,
  handleRollOutcome,
  handleActionRoll,
  showLongTermCountdowns,
  setShowLongTermCountdowns,
}) => {
  return (
    <div className="countdown-trigger-controls">
      {/* Basic Roll */}
      {triggers.basicRollTriggers && (
        <button
          className="trigger-btn basic-roll"
          onClick={(e) => {
            e.stopPropagation()
            handleActionRoll()
          }}
          title="Action Roll"
        >
          <FontAwesomeIcon icon={faDice} /> Roll
        </button>
      )}

      {/* Simple Fear/Hope */}
      {triggers.simpleFearTriggers && (
        <button
          className="trigger-btn simple-fear"
          onClick={(e) => {
            e.stopPropagation()
            const currentFear = fear?.value || 0
            if (currentFear < 12) updateFear(currentFear + 1)
            handleRollOutcome('simple-fear')
          }}
          title="Roll with Fear"
        >
          <FontAwesomeIcon icon={faSkull} /> Fear
        </button>
      )}
      {triggers.simpleHopeTriggers && (
        <button
          className="trigger-btn simple-hope"
          onClick={(e) => {
            e.stopPropagation()
            handleRollOutcome('simple-hope')
          }}
          title="Roll with Hope"
        >
          <FontAwesomeIcon icon={faFire} /> Hope
        </button>
      )}

      {/* Complex outcomes */}
      {triggers.complexRollTriggers && (
        <>
          <button
            className="trigger-btn fail-fear"
            onClick={(e) => {
              e.stopPropagation()
              const currentFear = fear?.value || 0
              if (currentFear < 12) updateFear(currentFear + 1)
              handleRollOutcome('failure-fear')
            }}
            title="Failure + Fear"
          >
            <FontAwesomeIcon icon={faSkull} /> Failure
          </button>
          <button
            className="trigger-btn fail-hope"
            onClick={(e) => {
              e.stopPropagation()
              handleRollOutcome('failure-hope')
            }}
            title="Failure + Hope"
          >
            <FontAwesomeIcon icon={faFire} /> Failure
          </button>
          <button
            className="trigger-btn success-fear"
            onClick={(e) => {
              e.stopPropagation()
              const currentFear = fear?.value || 0
              if (currentFear < 12) updateFear(currentFear + 1)
              handleRollOutcome('success-fear')
            }}
            title="Success + Fear"
          >
            <FontAwesomeIcon icon={faSkull} /> Success
          </button>
          <button
            className="trigger-btn success-hope"
            onClick={(e) => {
              e.stopPropagation()
              handleRollOutcome('success-hope')
            }}
            title="Success + Hope"
          >
            <FontAwesomeIcon icon={faFire} /> Success
          </button>
          <button
            className="trigger-btn critical-success"
            onClick={(e) => {
              e.stopPropagation()
              handleRollOutcome('critical-success')
            }}
            title="Critical Success"
          >
            <FontAwesomeIcon icon={faFire} /> Crit
          </button>
        </>
      )}

      {/* Toggle Long-term */}
      {triggers.restTriggers && (
        <button
          className="trigger-btn toggle-long-term"
          onClick={(e) => {
            e.stopPropagation()
            setShowLongTermCountdowns(!showLongTermCountdowns)
          }}
          title={showLongTermCountdowns ? 'Hide Long-term Countdowns' : 'Show Long-term Countdowns'}
        >
          <FontAwesomeIcon icon={faMoon} /> {showLongTermCountdowns ? 'Hide' : 'Show'}
        </button>
      )}
    </div>
  )
}

export default CountdownTriggerControls


