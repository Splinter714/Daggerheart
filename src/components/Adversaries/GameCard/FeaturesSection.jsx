import React from 'react'
import ReorderControls from './ReorderControls'

const FeatureDivider = ({ title }) => (
  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '-0.25rem' }}>
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
        marginLeft: '0.75rem',
      }}
    >
      {title}
    </h4>
  </div>
)

const FeaturesSection = ({ item, isEditMode, onUpdate, handleFeatureDeleteClick, deleteConfirmations, getFeatureKey }) => {
  if (!((item.features && item.features.length > 0) || isEditMode)) return null

  const renderFeatureEditor = (feature, placeholder, type) => (
    <div
      key={feature.id || `${type}-${feature.name}-${feature.description}-${Math.random()}`}
      style={{
        display: 'flex',
        gap: '0.25rem',
        margin: '0.5rem 0',
        padding: '0.5rem',
        border: '1px solid var(--border)',
        borderRadius: '4px',
        backgroundColor: 'var(--bg-secondary)',
        alignItems: 'stretch',
      }}
    >
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <input
          type="text"
          value={feature.name || ''}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
          data-lpignore="true"
          data-form-type="other"
          name={`feature-name-${type.toLowerCase()}`}
          onChange={(e) => {
            const newFeatures = [...(item.features || [])]
            const featureIndex = newFeatures.findIndex((f) => f.type === type && f === feature)
            if (featureIndex >= 0) {
              newFeatures[featureIndex] = { ...newFeatures[featureIndex], name: e.target.value }
            } else {
              newFeatures.push({ type, name: e.target.value, description: feature.description || '' })
            }

            const typeFeatures = newFeatures.filter((f) => f.type === type)
            const lastFeature = typeFeatures[typeFeatures.length - 1]
            if (lastFeature && lastFeature.name.trim()) {
              newFeatures.push({ type, name: '', description: '' })
            }

            onUpdate && onUpdate(item.id, { features: newFeatures })
          }}
          placeholder={`${placeholder} name`}
          style={{
            padding: '0.5rem',
            border: '1px solid var(--border)',
            borderRadius: '4px',
            backgroundColor: 'var(--bg-primary)',
            color: 'var(--text-primary)',
            fontSize: '0.875rem',
            transition: 'background-color 0.2s',
          }}
        />
        <textarea
          value={feature.description || ''}
          onChange={(e) => {
            const newFeatures = [...(item.features || [])]
            const featureIndex = newFeatures.findIndex((f) => f.type === type && f === feature)
            if (featureIndex >= 0) {
              newFeatures[featureIndex] = { ...newFeatures[featureIndex], description: e.target.value }
            } else {
              newFeatures.push({ type, name: feature.name || '', description: e.target.value })
            }

            const typeFeatures = newFeatures.filter((f) => f.type === type)
            const lastFeature = typeFeatures[typeFeatures.length - 1]
            if (lastFeature && lastFeature.name.trim()) {
              newFeatures.push({ type, name: '', description: '' })
            }

            onUpdate && onUpdate(item.id, { features: newFeatures })
          }}
          placeholder={`${placeholder} description`}
          style={{
            padding: '0.5rem',
            border: '1px solid var(--border)',
            borderRadius: '4px',
            backgroundColor: 'var(--bg-primary)',
            color: 'var(--text-primary)',
            fontSize: '0.875rem',
            minHeight: '4.5rem',
            resize: 'vertical',
          }}
        />
      </div>
      <ReorderControls
        feature={feature}
        featureType={type}
        item={item}
        onUpdate={onUpdate}
        handleFeatureDeleteClick={handleFeatureDeleteClick}
        deleteConfirmations={deleteConfirmations}
        getFeatureKey={getFeatureKey}
      />
    </div>
  )

  const renderFeatureList = (features, placeholder) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.75rem' }}>
      {features.map((feature, index) => (
        <div key={`${feature.type}-${index}`} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{feature.name}</span>
          </div>
          <div style={{ fontSize: '0.85rem', lineHeight: 1.4, color: 'var(--text-secondary)' }}>
            {feature.description || placeholder}
          </div>
        </div>
      ))}
    </div>
  )

  const renderFeatureCategory = (type, title) => {
    const features = (item.features || []).filter((f) => f.type === type)
    const hasFeatures = features.length > 0

    if (!hasFeatures && !isEditMode) return null

    const featuresToShow = isEditMode && features.length === 0 ? [{ type, name: '', description: '' }] : features
    return (
      <div>
        <FeatureDivider title={title} />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {isEditMode
            ? featuresToShow.map((feature) => renderFeatureEditor(feature, title.slice(0, -1), type))
            : renderFeatureList(featuresToShow, `Describe the ${title.toLowerCase()}`)}
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: '0 8px 8px 8px' }}>
      {renderFeatureCategory('Action', 'Actions')}
      {renderFeatureCategory('Passive', 'Passives')}
      {renderFeatureCategory('Reaction', 'Reactions')}
    </div>
  )
}

export default FeaturesSection

