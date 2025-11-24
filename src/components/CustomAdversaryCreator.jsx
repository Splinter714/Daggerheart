import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react'
import GameCard from './GameCard'
import { getDefaultAdversaryValues } from '../data/adversaryDefaults'

// Load adversary data for autocomplete
let adversariesData = { adversaries: [] }
let _dataLoaded = false

const loadCustomContent = () => {
  const customAdversaries = JSON.parse(localStorage.getItem('daggerheart-custom-adversaries') || '[]')
  return { customAdversaries }
}

const loadData = async () => {
  if (_dataLoaded) {
    return
  }
  
  let officialAdversaries = { adversaries: [] }
  let playtestAdv = { adversaries: [] }
  
  try {
    const mod = await import(/* @vite-ignore */ '../data/adversaries.json')
    officialAdversaries = mod?.default || mod
  } catch (e) {
    console.warn('Failed to load adversaries.json:', e)
  }
  
  try {
    const mod = await import(/* @vite-ignore */ '../data/playtest-adversaries.json')
    playtestAdv = mod?.default || mod
  } catch (e) {
    console.warn('Failed to load playtest-adversaries.json:', e)
  }
  
  const { customAdversaries } = loadCustomContent()
  
  adversariesData = {
    ...officialAdversaries,
    adversaries: [
      ...(officialAdversaries.adversaries || []),
      ...(playtestAdv.adversaries || []),
      ...customAdversaries
    ]
  }
  
  _dataLoaded = true
}

const CustomAdversaryCreator = forwardRef(({ 
  onSave, 
  onRefresh, 
  onAddItem, 
  editingAdversary, 
  onCancelEdit,
  isStockAdversary = false, // Whether editing a stock adversary (needs Save As)
  autoFocus = false, // Auto-focus name field
  allAdversaries = [], // All adversaries for autocomplete (from Browser data or state)
  embedded = false, // Whether this is embedded in a card (affects styling)
  hideEmbeddedButtons = false // Hide embedded save/cancel buttons when using external buttons
}, ref) => {
  const nameInputRef = useRef(null)
  const gameCardNameInputRef = useRef(null)
  const [formData, setFormData] = useState(() => {
    const defaults = getDefaultAdversaryValues(1, 'Standard')
    return {
      name: '',
      tier: 1,
      type: 'Standard',
      description: '',
      motives: '',
      difficulty: defaults.difficulty,
      thresholds: defaults.thresholds,
      hpMax: defaults.hpMax,
      stressMax: defaults.stressMax,
      atk: defaults.atk,
      weapon: '',
      range: defaults.range,
      damage: defaults.damage,
      experience: [],
      features: []
    }
  })
  
  const [isSaving, setIsSaving] = useState(false)
  const [statsPulledFromExisting, setStatsPulledFromExisting] = useState(false) // Track if stats were pulled
  const [nameSuggestions, setNameSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [adversaryData, setAdversaryData] = useState([]) // All adversaries for autocomplete

  // Load adversary data for autocomplete
  useEffect(() => {
    const initializeData = async () => {
      await loadData()
      // Use provided allAdversaries if available, otherwise use loaded data
      if (allAdversaries.length > 0) {
        setAdversaryData(allAdversaries)
      } else {
        setAdversaryData(adversariesData.adversaries || [])
      }
    }
    initializeData()
  }, [allAdversaries])

  // Auto-focus name field
  useEffect(() => {
    if (autoFocus) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        if (editingAdversary && gameCardNameInputRef.current) {
          // When editing, focus the GameCard's name input
          gameCardNameInputRef.current?.focus()
          gameCardNameInputRef.current?.select()
        } else if (nameInputRef.current) {
          // When creating new, focus CustomAdversaryCreator's name input
          nameInputRef.current?.focus()
        }
      }, 650) // Delay to match scroll animation
    }
  }, [autoFocus, editingAdversary])

  // Initialize form data when editing
  useEffect(() => {
    if (editingAdversary) {
      // Use baseName if available, otherwise strip duplicate number from name
      const baseName = editingAdversary.baseName || editingAdversary.name?.replace(/\s+\(\d+\)$/, '') || editingAdversary.name || ''
      setFormData({
        name: baseName,
        tier: editingAdversary.tier || 1,
        type: editingAdversary.type || 'Standard',
        description: editingAdversary.description || '',
        motives: editingAdversary.motives || '',
        difficulty: editingAdversary.difficulty || 11,
        thresholds: editingAdversary.thresholds || { major: 7, severe: 12 },
        hpMax: editingAdversary.hpMax || 3,
        stressMax: editingAdversary.stressMax || 1,
        atk: editingAdversary.atk || 1,
        weapon: editingAdversary.weapon || '',
        range: editingAdversary.range || 'Melee',
        damage: editingAdversary.damage || '',
        experience: editingAdversary.experience || [],
        features: editingAdversary.features || []
      })
      setStatsPulledFromExisting(false) // Reset when editing existing
    } else {
      // Reset to default when not editing
      const defaults = getDefaultAdversaryValues(1, 'Standard')
      setFormData({
        name: '',
        tier: 1,
        type: 'Standard',
        description: '',
        motives: '',
        difficulty: defaults.difficulty,
        thresholds: defaults.thresholds,
        hpMax: defaults.hpMax,
        stressMax: defaults.stressMax,
        atk: defaults.atk,
        weapon: '',
        range: defaults.range,
        damage: defaults.damage,
        experience: [],
        features: []
      })
      setStatsPulledFromExisting(false)
    }
  }, [editingAdversary])

  // Update defaults when tier or type changes (only if stats were NOT pulled from existing)
  useEffect(() => {
    if (!editingAdversary && !statsPulledFromExisting) {
      const newDefaults = getDefaultAdversaryValues(formData.tier, formData.type)
      setFormData(prev => ({
        ...prev,
        difficulty: newDefaults.difficulty,
        thresholds: newDefaults.thresholds,
        hpMax: newDefaults.hpMax,
        stressMax: newDefaults.stressMax,
        atk: newDefaults.atk,
        range: newDefaults.range,
        damage: newDefaults.damage
      }))
    }
  }, [formData.tier, formData.type, editingAdversary, statsPulledFromExisting])

  // Handle name input with autocomplete
  const handleNameChange = (value) => {
    setFormData(prev => ({ ...prev, name: value }))
    
    // Show suggestions if there's text
    if (value.trim().length > 0) {
      const matches = adversaryData
        .filter(adv => {
          const baseName = adv.name?.replace(/\s+\(\d+\)$/, '') || adv.name || ''
          return baseName.toLowerCase().includes(value.toLowerCase())
        })
        .slice(0, 5) // Limit to 5 suggestions
      
      setNameSuggestions(matches)
      setShowSuggestions(matches.length > 0)
    } else {
      setNameSuggestions([])
      setShowSuggestions(false)
    }
  }

  // Pull stats from selected adversary
  const handleSelectAdversary = (adversary) => {
    const baseName = adversary.name?.replace(/\s+\(\d+\)$/, '') || adversary.name || ''
    setFormData(prev => ({
      ...prev,
      name: baseName, // Use base name without duplicate number
      tier: adversary.tier || prev.tier,
      type: adversary.type || prev.type,
      description: adversary.description || prev.description,
      motives: adversary.motives || prev.motives,
      difficulty: adversary.difficulty || prev.difficulty,
      thresholds: adversary.thresholds || prev.thresholds,
      hpMax: adversary.hpMax || prev.hpMax,
      stressMax: adversary.stressMax || prev.stressMax,
      atk: adversary.atk !== undefined ? adversary.atk : prev.atk,
      weapon: adversary.weapon || prev.weapon,
      range: adversary.range || prev.range,
      damage: adversary.damage || prev.damage,
      experience: adversary.experience || prev.experience,
      features: adversary.features ? [...adversary.features] : prev.features
    }))
    setStatsPulledFromExisting(true) // Mark that stats were pulled
    setNameSuggestions([])
    setShowSuggestions(false)
    nameInputRef.current?.focus()
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // If name field is cleared, reset statsPulledFromExisting
    if (field === 'name' && !value.trim()) {
      setStatsPulledFromExisting(false)
    }
  }

  const handleThresholdChange = (threshold, value) => {
    setFormData(prev => ({
      ...prev,
      thresholds: {
        ...prev.thresholds,
        [threshold]: parseInt(value) || 0
      }
    }))
  }

  const handleSave = async () => {
    if (!formData.name.trim()) {
      alert('Please enter a name for the adversary')
      return
    }

    setIsSaving(true)
    try {
      // Filter out blank experiences (name is blank and modifier is 0)
      const filterBlankExperiences = (experiences) => {
        return (experiences || []).filter(exp => 
          exp.name && exp.name.trim() !== '' || (exp.modifier !== undefined && exp.modifier !== 0)
        )
      }
      
      const baseName = formData.name.trim() || 'Unknown'
      const filteredExperience = filterBlankExperiences(formData.experience || [])
      
      const adversaryData = {
        ...formData,
        experience: filteredExperience,
        baseName: baseName,
        name: baseName, // Will be updated by createAdversary/updateAdversary with duplicate number
        hp: editingAdversary ? editingAdversary.hp : 0,
        stress: editingAdversary ? editingAdversary.stress : 0,
        source: 'Homebrew'
      }
      
      if (editingAdversary) {
        if (isStockAdversary) {
          // Save As Custom - create new custom copy
          // Remove id and name (will be set by createAdversary)
          const { id, name, ...dataToSave } = adversaryData
          await onSave(dataToSave)
          alert('Custom adversary created successfully!')
        } else {
          // Update existing custom adversary
          // Remove name - updateAdversary will recalculate it from baseName and duplicateNumber
          const { name, ...dataToUpdate } = adversaryData
          await onSave(dataToUpdate, editingAdversary.id)
          alert('Adversary updated successfully!')
        }
        if (onCancelEdit) {
          onCancelEdit()
        }
      } else {
        // Create new adversary
        await onSave(adversaryData)
        
        // Refresh the browser data to show the new adversary
        if (onRefresh) {
          await onRefresh()
        }
        
        // Reset form
        const defaults = getDefaultAdversaryValues(1, 'Standard')
        setFormData({
          name: '',
          tier: 1,
          type: 'Standard',
          description: '',
          motives: '',
          difficulty: defaults.difficulty,
          thresholds: defaults.thresholds,
          hpMax: defaults.hpMax,
          stressMax: defaults.stressMax,
          atk: defaults.atk,
          weapon: '',
          range: defaults.range,
          damage: defaults.damage,
          experience: [],
          features: []
        })
        setStatsPulledFromExisting(false)
        
        alert('Custom adversary created successfully!')
      }
    } catch (error) {
      console.error('Error saving adversary:', error)
      alert('Error saving adversary. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  // Expose handleSave via ref
  useImperativeHandle(ref, () => ({
    handleSave,
    isSaving,
    canSave: formData.name.trim().length > 0
  }))

  // Create a mock adversary object for the GameCard
  const mockAdversary = {
    ...formData,
    id: 'new-adversary',
    hp: 0,
    stress: 0,
    source: 'Homebrew'
  }

  // Determine save button text
  const getSaveButtonText = () => {
    if (isSaving) {
      if (editingAdversary) {
        return isStockAdversary ? 'Creating...' : 'Saving...'
      }
      return 'Creating...'
    }
    if (editingAdversary) {
      return isStockAdversary ? 'Save As Custom' : 'Save'
    }
    return 'Create'
  }

  // Always return just content, no container
  return (
    <>
      {/* Header */}
      {!embedded && (
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem'
          }}>
            <h2 style={{
              color: 'var(--text-primary)',
              fontSize: '1.5rem',
              fontWeight: '600',
              margin: 0
            }}>
              {editingAdversary 
                ? (isStockAdversary ? 'Edit Adversary (Save As Custom)' : 'Edit Custom Adversary')
                : 'Create Custom Adversary'}
            </h2>
            <button
              onClick={handleSave}
              disabled={isSaving || !formData.name.trim()}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: isSaving || !formData.name.trim() ? 'var(--gray-600)' : 'var(--purple)',
                border: 'none',
                color: 'white',
                borderRadius: '8px',
                cursor: isSaving || !formData.name.trim() ? 'not-allowed' : 'pointer',
                fontSize: '1rem',
                fontWeight: '600',
                opacity: isSaving || !formData.name.trim() ? 0.6 : 1
              }}
            >
              {getSaveButtonText()}
            </button>
          </div>
        )}
        
        {/* Embedded header with save button */}
        {embedded && !hideEmbeddedButtons && (
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            marginBottom: '0.5rem',
            padding: '0.5rem',
            borderBottom: '1px solid var(--border)'
          }}>
            <button
              onClick={handleSave}
              disabled={isSaving || !formData.name.trim()}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: isSaving || !formData.name.trim() ? 'var(--gray-600)' : 'var(--purple)',
                border: 'none',
                color: 'white',
                borderRadius: '6px',
                cursor: isSaving || !formData.name.trim() ? 'not-allowed' : 'pointer',
                fontSize: '0.875rem',
                fontWeight: '600',
                opacity: isSaving || !formData.name.trim() ? 0.6 : 1,
                marginRight: '0.5rem'
              }}
            >
              {getSaveButtonText()}
            </button>
            {onCancelEdit && (
              <button
                onClick={onCancelEdit}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: 'transparent',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '600'
                }}
              >
                Cancel
              </button>
            )}
          </div>
        )}

        {/* Name input with autocomplete - show when creating new (not editing) */}
        {!editingAdversary && (
          <div style={{ marginBottom: '1rem', position: 'relative' }}>
            <input
              ref={nameInputRef}
              type="text"
              value={formData.name}
              onChange={(e) => {
                const value = e.target.value
                setFormData(prev => ({ ...prev, name: value }))
                handleNameChange(value)
              }}
              placeholder="Adversary name"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                backgroundColor: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                fontSize: '1rem',
                outline: 'none'
              }}
            />
            {showSuggestions && nameSuggestions.length > 0 && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                backgroundColor: 'var(--bg-primary)',
                border: '1px solid var(--border)',
                borderRadius: '0 0 8px 8px',
                borderTop: 'none',
                maxHeight: '200px',
                overflowY: 'auto',
                zIndex: 1000,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
              }}>
                {nameSuggestions.map((adv, idx) => {
                  const baseName = adv.baseName || adv.name?.replace(/\s+\(\d+\)$/, '') || adv.name
                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          name: baseName,
                          tier: adv.tier || prev.tier,
                          type: adv.type || prev.type,
                          difficulty: adv.difficulty || prev.difficulty,
                          thresholds: adv.thresholds || prev.thresholds,
                          hpMax: adv.hpMax || prev.hpMax,
                          stressMax: adv.stressMax || prev.stressMax,
                          atk: adv.atk || prev.atk,
                          range: adv.range || prev.range,
                          damage: adv.damage || prev.damage
                        }))
                        setShowSuggestions(false)
                        setStatsPulledFromExisting(true)
                        if (nameInputRef.current) {
                          nameInputRef.current.blur()
                        }
                      }}
                      style={{
                        padding: '0.75rem',
                        cursor: 'pointer',
                        borderBottom: idx < nameSuggestions.length - 1 ? '1px solid var(--border)' : 'none',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = 'var(--bg-secondary)'
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'transparent'
                      }}
                      onMouseDown={(e) => e.preventDefault()} // Prevent onBlur from firing
                    >
                      <div style={{ fontWeight: '600' }}>{baseName}</div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        {adv.type} • Tier {adv.tier}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

      {/* Editable Adversary Card */}
      <GameCard
        item={mockAdversary}
        type="adversary"
        mode="edit"
        nameInputRef={editingAdversary ? gameCardNameInputRef : undefined}
        autoFocusNameInput={autoFocus && editingAdversary}
        onUpdate={(id, updates) => {
          setFormData(prev => ({ ...prev, ...updates }))
        }}
      />
    </>
  )
})

CustomAdversaryCreator.displayName = 'CustomAdversaryCreator'

export default CustomAdversaryCreator

