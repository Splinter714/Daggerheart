import React, { useState, useEffect, useRef } from 'react'
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

const CustomAdversaryCreator = ({ 
  onSave, 
  onRefresh, 
  onAddItem, 
  editingAdversary, 
  onCancelEdit,
  isStockAdversary = false, // Whether editing a stock adversary (needs Save As)
  autoFocus = false, // Auto-focus name field
  allAdversaries = [], // All adversaries for autocomplete (from Browser data or state)
  embedded = false // Whether this is embedded in a card (affects styling)
}) => {
  const nameInputRef = useRef(null)
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
    if (autoFocus && nameInputRef.current) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        nameInputRef.current?.focus()
      }, 100)
    }
  }, [autoFocus])

  // Initialize form data when editing
  useEffect(() => {
    if (editingAdversary) {
      setFormData({
        name: editingAdversary.name || '',
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
      const adversaryData = {
        ...formData,
        hp: editingAdversary ? editingAdversary.hp : 0,
        stress: editingAdversary ? editingAdversary.stress : 0,
        source: 'Homebrew'
      }
      
      if (editingAdversary) {
        if (isStockAdversary) {
          // Save As Custom - create new custom copy
          await onSave(adversaryData)
          alert('Custom adversary created successfully!')
        } else {
          // Update existing custom adversary
          adversaryData.id = editingAdversary.id
          await onSave(adversaryData, editingAdversary.id)
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

  return (
    <div style={{
      flex: 1,
      overflowY: 'auto',
      padding: embedded ? '0.5rem' : '1rem',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-start',
      height: '100%'
    }}>
      <div style={{
        maxWidth: embedded ? '100%' : '600px',
        width: '100%'
      }}>
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
        {embedded && (
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
          <div style={{
            position: 'relative',
            marginBottom: '1rem'
          }}>
            <input
              ref={nameInputRef}
              type="text"
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Type adversary name to pull stats, or enter type/tier manually"
              style={{
                width: '100%',
                padding: '0.75rem',
                fontSize: '1rem',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                backgroundColor: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                outline: 'none'
              }}
              onBlur={() => {
                // Delay hiding suggestions to allow click
                setTimeout(() => setShowSuggestions(false), 200)
              }}
            />
            {showSuggestions && nameSuggestions.length > 0 && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                marginTop: '4px',
                maxHeight: '200px',
                overflowY: 'auto',
                zIndex: 1000,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
              }}>
                {nameSuggestions.map((adv, idx) => {
                  const baseName = adv.name?.replace(/\s+\(\d+\)$/, '') || adv.name || 'Unknown'
                  return (
                    <div
                      key={adv.id || idx}
                      onClick={() => handleSelectAdversary(adv)}
                      style={{
                        padding: '0.75rem',
                        cursor: 'pointer',
                        borderBottom: idx < nameSuggestions.length - 1 ? '1px solid var(--border)' : 'none',
                        color: 'var(--text-primary)'
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
          onUpdate={(id, updates) => {
            setFormData(prev => ({ ...prev, ...updates }))
          }}
        />
      </div>
    </div>
  )
}

export default CustomAdversaryCreator

