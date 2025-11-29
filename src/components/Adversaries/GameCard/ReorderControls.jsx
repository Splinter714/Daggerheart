import React from 'react'

const ReorderControls = ({
  feature,
  featureType,
  item,
  onUpdate,
  handleFeatureDeleteClick,
  deleteConfirmations,
  getFeatureKey,
}) => {
  const getFeaturesByType = () => (item.features || []).filter((f) => f.type === featureType)
  const filterExpr = (f) => f.type === featureType
  const filterExprWithName = (f) => f.type === featureType && f.name.trim()

  const handleSwap = (direction) => {
    try {
      const features = item?.features || []
      const newFeatures = [...features]
      const typeFeatures = getFeaturesByType()
      const currentIndex = typeFeatures.findIndex((f) => f === feature)

      if (direction === 'up' && currentIndex > 0) {
        const currentFeature = typeFeatures[currentIndex]
        const previousFeature = typeFeatures[currentIndex - 1]
        swapFeatures(newFeatures, currentFeature, previousFeature)
      } else if (direction === 'down' && currentIndex < typeFeatures.length - 1 && currentIndex >= 0) {
        const currentFeature = typeFeatures[currentIndex]
        const nextFeature = typeFeatures[currentIndex + 1]
        swapFeatures(newFeatures, currentFeature, nextFeature)
      }
    } catch (error) {
      console.error(`Error in ${featureType.toLowerCase()} ${direction} button:`, error)
    }
  }

  const swapFeatures = (features, source, target) => {
    if (!source || !target) return
    const sourceIndex = features.findIndex((f) => f === source)
    const targetIndex = features.findIndex((f) => f === target)

    if (sourceIndex >= 0 && targetIndex >= 0) {
      features[sourceIndex] = target
      features[targetIndex] = source
      onUpdate && onUpdate(item.id, { features })
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', alignSelf: 'stretch' }}>
      <button
        onClick={() => handleSwap('up')}
        disabled={getFeaturesByType().findIndex((f) => f === feature) === 0}
        tabIndex="-1"
        style={{
          width: '22px',
          height: '22px',
          padding: 0,
          border: '1px solid var(--border)',
          borderRadius: '3px',
          backgroundColor: 'var(--gray-700)',
          color:
            filterExprWithName(feature) &&
            getFeaturesByType().findIndex((f) => f === feature) !== 0 &&
            feature.name.trim()
              ? 'white'
              : 'var(--text-secondary)',
          cursor:
            filterExprWithName(feature) &&
            getFeaturesByType().findIndex((f) => f === feature) !== 0 &&
            feature.name.trim()
              ? 'pointer'
              : 'not-allowed',
          fontSize: '14px',
          lineHeight: '1',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '22px',
          maxHeight: '22px',
        }}
      >
        ↑
      </button>

      <button
        onClick={() => handleFeatureDeleteClick(feature)}
        disabled={!feature.name.trim() && !feature.description.trim()}
        style={{
          width: '22px',
          height: '22px',
          padding: 0,
          border: '1px solid var(--border)',
          borderRadius: '3px',
          backgroundColor: deleteConfirmations[getFeatureKey(feature)] ? 'var(--danger)' : 'var(--gray-700)',
          color: !feature.name.trim() && !feature.description.trim() ? 'var(--text-secondary)' : 'white',
          cursor: !feature.name.trim() && !feature.description.trim() ? 'not-allowed' : 'pointer',
          opacity: !feature.name.trim() && !feature.description.trim() ? 0.5 : 1,
          fontWeight: '600',
          fontSize: '12px',
          lineHeight: '1',
          transition: 'background-color 0.2s',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '22px',
          maxHeight: '22px',
        }}
      >
        ×
      </button>

      <button
        onClick={() => handleSwap('down')}
        disabled={getFeaturesByType().findIndex((f) => f === feature) === getFeaturesByType().length - 1}
        style={{
          width: '22px',
          height: '22px',
          padding: 0,
          border: '1px solid var(--border)',
          borderRadius: '3px',
          backgroundColor: 'var(--gray-700)',
          color:
            filterExprWithName(feature) &&
            getFeaturesByType().findIndex((f) => f === feature) < getFeaturesByType().length - 1 &&
            feature.name.trim()
              ? 'white'
              : 'var(--text-secondary)',
          cursor:
            filterExprWithName(feature) &&
            getFeaturesByType().findIndex((f) => f === feature) < getFeaturesByType().length - 1 &&
            feature.name.trim()
              ? 'pointer'
              : 'not-allowed',
          fontSize: '14px',
          lineHeight: '1',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '22px',
          maxHeight: '22px',
        }}
      >
        ↓
      </button>
    </div>
  )
}

export default ReorderControls

