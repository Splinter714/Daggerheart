import React from 'react'
import Pips from '../../Shared/Pips'
import { CARD_SPACE } from './constants'

const ThresholdTag = ({ value }) => (
  <div
    style={{
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '44px',
      height: '32px',
      zIndex: 3,
    }}
  >
    <svg
      width="40"
      height="32"
      viewBox="0 0 40 32"
      fill="var(--bg-primary)"
      stroke="var(--text-secondary)"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ position: 'absolute', zIndex: 1 }}
    >
      <path d="M2 2h28l6 14-6 14H2l6-14-6-14z" />
    </svg>
    <span
      style={{
        position: 'absolute',
        fontSize: '0.8rem',
        fontWeight: 500,
        color: 'var(--text-primary)',
        textAlign: 'center',
        zIndex: 2,
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
      }}
    >
      {value}
    </span>
  </div>
)

const StatusSection = ({
  item,
  instances = [],
  isEditMode,
  type,
  onUpdate,
  onApplyDamage,
  onApplyHealing,
  onApplyStressChange,
}) => {
  const shouldShowStatus =
    (instances && instances.length > 0) || (item.type !== 'Minion' && (item.thresholds || isEditMode))
  if (!shouldShowStatus) return null

  const renderInstanceRow = (instance) => {
    const isInstanceDead = (instance.hp || 0) >= (instance.hpMax || 1)
    return (
      <div key={instance.id} data-instance-id={instance.id}>
        <div
          style={{
            backgroundColor: isInstanceDead ? 'var(--gray-900)' : 'var(--bg-primary)',
            borderRadius: '6px',
            paddingTop: 0,
            paddingBottom: 0,
            paddingLeft: CARD_SPACE,
            paddingRight: CARD_SPACE,
            border: '1px solid',
            borderColor: isInstanceDead ? 'color-mix(in srgb, var(--gray-600) 40%, transparent)' : 'var(--text-secondary)',
            display: 'flex',
            justifyContent: 'flex-start',
            alignItems: 'center',
            gap: CARD_SPACE,
            opacity: isInstanceDead ? 0.7 : 1,
            position: 'relative',
            transition: 'all 0.2s ease',
            minHeight: '40px',
          }}
        >
          {isInstanceDead && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: `repeating-linear-gradient(
                          45deg,
                          transparent 0px,
                          transparent 8px,
                          var(--gray-600) 9px,
                          var(--gray-600) 9px
                        )`,
                pointerEvents: 'none',
                zIndex: 1,
                borderRadius: '4px',
              }}
            />
          )}
          <div
            style={{
              backgroundColor: isInstanceDead ? 'var(--gray-900)' : 'var(--bg-card)',
              border: '1px solid',
              borderColor: isInstanceDead ? 'color-mix(in srgb, var(--gray-600) 40%, transparent)' : 'var(--text-secondary)',
              borderRadius: '50%',
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              paddingTop: '1px',
              flexShrink: 0,
              opacity: isInstanceDead ? 0.5 : 1,
            }}
          >
            <span
              style={{
                fontSize: '0.8rem',
                fontWeight: 600,
                color: isInstanceDead ? 'var(--gray-400)' : 'var(--text-primary)',
              }}
            >
              {instance.duplicateNumber || 1}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.125rem' }}>
            <div style={{ opacity: isInstanceDead ? 0.3 : 1 }}>
              <Pips
                type="adversaryHP"
                value={instance.hp || 0}
                maxValue={instance.hpMax || 1}
                onPipClick={(index, isFilled) => {
                  if (onApplyDamage && type === 'adversary') {
                    const currentHp = instance.hp || 0
                    const maxHp = instance.hpMax || 1
                    if (isFilled) {
                      onApplyHealing?.(instance.id, 1, currentHp)
                    } else if (currentHp < maxHp) {
                      onApplyDamage(instance.id, 1, currentHp, maxHp)
                    }
                  }
                }}
                containerStyle={{ height: 'auto', padding: '0' }}
                pipStyle={{ fontSize: '1rem', width: '1.25rem', height: '1.25rem' }}
                size="lg"
                showTooltip={false}
              />
            </div>

            {instance.stressMax > 0 && (
              <div style={{ opacity: isInstanceDead ? 0.3 : 1 }}>
                <Pips
                  type="adversaryStress"
                  value={instance.stress || 0}
                  maxValue={instance.stressMax}
                  onPipClick={(index, isFilled) => {
                    if (onApplyStressChange && type === 'adversary') {
                      onApplyStressChange(instance.id, isFilled ? -1 : 1)
                    }
                  }}
                  containerStyle={{ height: 'auto', padding: '0' }}
                  pipStyle={{ fontSize: '1rem', width: '1.25rem', height: '1.25rem' }}
                  size="lg"
                  showTooltip={false}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  const renderThresholds = () => {
    if (item.type === 'Minion' || (!item.thresholds && !isEditMode)) return null
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          paddingTop: '1px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            paddingTop: '1px',
            position: 'relative',
          }}
        >
          <svg
            width="300"
            height="36"
            viewBox="0 0 300 36"
            style={{
              position: 'absolute',
              zIndex: 1,
            }}
          >
            <rect x="20" y="6" width="260" height="24" fill="var(--bg-primary)" stroke="var(--text-secondary)" strokeWidth="1" rx="4" />
          </svg>
          <div
            style={{
              position: 'relative',
              zIndex: 2,
              display: 'flex',
              alignItems: 'center',
              gap: CARD_SPACE,
            }}
          >
            {isEditMode ? (
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.8rem' }}>
                <ThresholdInput label="Minor" value={item.thresholds?.major} onChange={(val) => updateThreshold('major', val, onUpdate, item)} />
                <ThresholdInput label="Major" value={item.thresholds?.severe} onChange={(val) => updateThreshold('severe', val, onUpdate, item)} />
              </div>
            ) : (
              <>
                <ThresholdLabel text="Minor" />
                <ThresholdTag value={item.thresholds?.major || 7} />
                <ThresholdLabel text="Major" />
                <ThresholdTag value={item.thresholds?.severe || 14} />
                <ThresholdLabel text="Severe" />
              </>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: CARD_SPACE,
        paddingLeft: CARD_SPACE,
        paddingRight: CARD_SPACE,
        marginTop: CARD_SPACE,  // Space from Features section
      }}
    >
      <SectionHeader title="Status" />
      {isEditMode ? (
        <EditableVitals item={item} onUpdate={onUpdate} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: CARD_SPACE }}>
          {instances.map((instance) => renderInstanceRow(instance))}
        </div>
      )}
      {renderThresholds()}
    </div>
  )
}

const SectionHeader = ({ title }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: CARD_SPACE,
    }}
  >
    <hr
      style={{
        flex: 1,
        border: 'none',
        borderTop: '1px solid var(--border)',
        margin: 0,
      }}
    />
    <h4
      style={{
        margin: 0,
        fontSize: '0.75rem',
        fontWeight: '500',
        color: 'var(--text-secondary)',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
      }}
    >
      {title}
    </h4>
  </div>
)

const EditableVitals = ({ item, onUpdate }) => (
  <div>
    <div
      style={{
        padding: CARD_SPACE,
        backgroundColor: 'var(--bg-secondary)',
        borderRadius: '8px',
        border: '1px solid var(--border)',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: CARD_SPACE }}>
        <VitalRow
          label="HP"
          pipType="adversaryHP"
          value={item.hpMax || ''}
          onChange={(value) => onUpdate && onUpdate(item.id, { hpMax: value })}
        />
        <VitalRow
          label="Stress"
          pipType="adversaryStress"
          value={item.stressMax || ''}
          onChange={(value) => onUpdate && onUpdate(item.id, { stressMax: value })}
        />
      </div>
    </div>
  </div>
)

const VitalRow = ({ label, pipType, value, onChange }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: CARD_SPACE }}>
    <input
      type="number"
      value={value}
      onChange={(e) => {
        const parsed = parseInt(e.target.value) || 1
        onChange(parsed)
      }}
      min="1"
      max="99"
      style={{
        width: '40px',
        padding: CARD_SPACE,
        border: '1px solid var(--border)',
        borderRadius: '4px',
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--text-primary)',
        fontSize: '0.875rem',
        textAlign: 'center',
      }}
    />
    <Pips type={pipType} value={0} maxValue={value || 1} showTooltip={false} />
    <span
      style={{
        fontSize: '0.75rem',
        color: 'var(--text-secondary)',
        textTransform: 'uppercase',
        minWidth: '40px',
      }}
    >
      {label}
    </span>
  </div>
)

const ThresholdLabel = ({ text }) => (
  <span
    style={{
      color: 'var(--text-primary)',
      fontSize: '0.6875rem',
      fontWeight: '500',
      textTransform: 'uppercase',
    }}
  >
    {text}
  </span>
)

const ThresholdInput = ({ label, value, onChange }) => (
  <>
    <ThresholdLabel text={label} />
    <input
      type="number"
      min="1"
      max="99"
      value={value || ''}
      onChange={(e) => {
        const inputValue = e.target.value
        if (inputValue === '' || (parseInt(inputValue) >= 1 && parseInt(inputValue) <= 99)) {
          onChange(inputValue === '' ? null : parseInt(inputValue))
        }
      }}
      style={{
        width: '30px',
        padding: CARD_SPACE,
        border: '1px solid var(--border)',
        borderRadius: '4px',
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--text-primary)',
        fontSize: '0.8rem',
        textAlign: 'center',
      }}
    />
  </>
)

const updateThreshold = (field, value, onUpdate, item) => {
  onUpdate &&
    onUpdate(item.id, {
      thresholds: { ...item.thresholds, [field]: value },
    })
}

export default StatusSection

