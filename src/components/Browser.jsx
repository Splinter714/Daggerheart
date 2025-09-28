import React, { useMemo, useEffect, useRef, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { Filter, Square, CheckSquare, Plus, X } from 'lucide-react'
import GameCard from './GameCard'

// Custom Adversary Creator Component
const CustomAdversaryCreator = ({ onSave, onRefresh }) => {
  const [formData, setFormData] = useState({
    name: '',
    tier: 1,
    type: 'Standard',
    description: '',
    motives: '',
    difficulty: 11,
    thresholds: { major: 7, severe: 12 },
    hpMax: 3,
    stressMax: 1,
    atk: 1,
    weapon: '',
    range: 'Melee',
    damage: '',
    experience: [],
    features: []
  })
  
  const [newExperience, setNewExperience] = useState('')
  const [newFeature, setNewFeature] = useState({ name: '', type: 'Action', description: '' })
  const [isSaving, setIsSaving] = useState(false)

  const adversaryTypes = ['Standard', 'Solo', 'Bruiser', 'Horde', 'Minion', 'Ranged', 'Leader', 'Skulk', 'Social', 'Support']
  const ranges = ['Melee', 'Very Close', 'Close', 'Medium', 'Long', 'Very Long']
  const featureTypes = ['Action', 'Passive', 'Reaction']

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
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

  const addExperience = () => {
    if (newExperience.trim()) {
      setFormData(prev => ({
        ...prev,
        experience: [...prev.experience, newExperience.trim()]
      }))
      setNewExperience('')
    }
  }

  const removeExperience = (index) => {
    setFormData(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index)
    }))
  }

  const addFeature = () => {
    if (newFeature.name.trim() && newFeature.description.trim()) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, { ...newFeature, name: newFeature.name.trim(), description: newFeature.description.trim() }]
      }))
      setNewFeature({ name: '', type: 'Action', description: '' })
    }
  }

  const removeFeature = (index) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
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
        hp: 0,
        stress: 0,
        source: 'Homebrew'
      }
      
      await onSave(adversaryData)
      
      // Refresh the browser data to show the new adversary
      if (onRefresh) {
        await onRefresh()
      }
      
      // Reset form
      setFormData({
        name: '',
        tier: 1,
        type: 'Standard',
        description: '',
        motives: '',
        difficulty: 11,
        thresholds: { major: 7, severe: 12 },
        hpMax: 3,
        stressMax: 1,
        atk: 1,
        weapon: '',
        range: 'Melee',
        damage: '',
        experience: [],
        features: []
      })
      
      alert('Custom adversary created successfully!')
    } catch (error) {
      console.error('Error saving adversary:', error)
      alert('Error saving adversary. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const inputStyle = {
    padding: '0.5rem',
    border: '1px solid var(--border)',
    borderRadius: '4px',
    backgroundColor: 'var(--bg-primary)',
    color: 'var(--text-primary)',
    fontSize: '0.875rem',
    width: '100%'
  }

  const labelStyle = {
    display: 'block',
    marginBottom: '0.25rem',
    fontSize: '0.875rem',
    fontWeight: '500',
    color: 'var(--text-primary)'
  }

  const sectionStyle = {
    marginBottom: '1.5rem',
    padding: '1rem',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    backgroundColor: 'var(--bg-secondary)'
  }

  return (
    <div style={{
      flex: 1,
      overflowY: 'auto',
      padding: '1rem'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        <h2 style={{
          color: 'var(--text-primary)',
          marginBottom: '1.5rem',
          fontSize: '1.5rem',
          fontWeight: '600'
        }}>
          Create Custom Adversary
        </h2>

        {/* Basic Information */}
        <div style={sectionStyle}>
          <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem', fontSize: '1.1rem' }}>
            Basic Information
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={labelStyle}>Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                style={inputStyle}
                placeholder="Adversary name"
              />
            </div>
            <div>
              <label style={labelStyle}>Type</label>
              <select
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value)}
                style={inputStyle}
              >
                {adversaryTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={labelStyle}>Tier</label>
              <select
                value={formData.tier}
                onChange={(e) => handleInputChange('tier', parseInt(e.target.value))}
                style={inputStyle}
              >
                <option value={1}>Tier 1</option>
                <option value={2}>Tier 2</option>
                <option value={3}>Tier 3</option>
                <option value={4}>Tier 4</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Difficulty</label>
              <input
                type="number"
                value={formData.difficulty}
                onChange={(e) => handleInputChange('difficulty', parseInt(e.target.value) || 0)}
                style={inputStyle}
                min="1"
                max="30"
              />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
              placeholder="Brief description of the adversary"
            />
          </div>

          <div>
            <label style={labelStyle}>Motives</label>
            <input
              type="text"
              value={formData.motives}
              onChange={(e) => handleInputChange('motives', e.target.value)}
              style={inputStyle}
              placeholder="e.g., Hunt, defend, escape, feed"
            />
          </div>
        </div>

        {/* Combat Stats */}
        <div style={sectionStyle}>
          <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem', fontSize: '1.1rem' }}>
            Combat Stats
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={labelStyle}>HP Max</label>
              <input
                type="number"
                value={formData.hpMax}
                onChange={(e) => handleInputChange('hpMax', parseInt(e.target.value) || 0)}
                style={inputStyle}
                min="1"
                max="20"
              />
            </div>
            <div>
              <label style={labelStyle}>Stress Max</label>
              <input
                type="number"
                value={formData.stressMax}
                onChange={(e) => handleInputChange('stressMax', parseInt(e.target.value) || 0)}
                style={inputStyle}
                min="0"
                max="10"
              />
            </div>
            <div>
              <label style={labelStyle}>Attack Modifier</label>
              <input
                type="number"
                value={formData.atk}
                onChange={(e) => handleInputChange('atk', parseInt(e.target.value) || 0)}
                style={inputStyle}
                min="-5"
                max="10"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={labelStyle}>Major Threshold</label>
              <input
                type="number"
                value={formData.thresholds.major}
                onChange={(e) => handleThresholdChange('major', e.target.value)}
                style={inputStyle}
                min="1"
                max="50"
              />
            </div>
            <div>
              <label style={labelStyle}>Severe Threshold</label>
              <input
                type="number"
                value={formData.thresholds.severe}
                onChange={(e) => handleThresholdChange('severe', e.target.value)}
                style={inputStyle}
                min="1"
                max="50"
              />
            </div>
            <div>
              <label style={labelStyle}>Range</label>
              <select
                value={formData.range}
                onChange={(e) => handleInputChange('range', e.target.value)}
                style={inputStyle}
              >
                {ranges.map(range => (
                  <option key={range} value={range}>{range}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={labelStyle}>Weapon</label>
              <input
                type="text"
                value={formData.weapon}
                onChange={(e) => handleInputChange('weapon', e.target.value)}
                style={inputStyle}
                placeholder="e.g., Claws, Sword, Bow"
              />
            </div>
            <div>
              <label style={labelStyle}>Damage</label>
              <input
                type="text"
                value={formData.damage}
                onChange={(e) => handleInputChange('damage', e.target.value)}
                style={inputStyle}
                placeholder="e.g., 1d8+3 phy"
              />
            </div>
          </div>
        </div>

        {/* Experience */}
        <div style={sectionStyle}>
          <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem', fontSize: '1.1rem' }}>
            Experience
          </h3>
          
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <input
              type="text"
              value={newExperience}
              onChange={(e) => setNewExperience(e.target.value)}
              style={inputStyle}
              placeholder="e.g., Keen Senses +2"
              onKeyPress={(e) => e.key === 'Enter' && addExperience()}
            />
            <button
              onClick={addExperience}
              style={{
                padding: '0.5rem',
                backgroundColor: 'var(--purple)',
                border: 'none',
                color: 'white',
                borderRadius: '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Plus size={16} />
            </button>
          </div>

          {formData.experience.map((exp, index) => (
            <div key={index} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '0.5rem',
              padding: '0.5rem',
              backgroundColor: 'var(--bg-primary)',
              borderRadius: '4px',
              border: '1px solid var(--border)'
            }}>
              <span style={{ flex: 1, color: 'var(--text-primary)' }}>{exp}</span>
              <button
                onClick={() => removeExperience(index)}
                style={{
                  padding: '0.25rem',
                  backgroundColor: 'var(--danger)',
                  border: 'none',
                  color: 'white',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>

        {/* Features */}
        <div style={sectionStyle}>
          <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem', fontSize: '1.1rem' }}>
            Features
          </h3>
          
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <input
                type="text"
                value={newFeature.name}
                onChange={(e) => setNewFeature(prev => ({ ...prev, name: e.target.value }))}
                style={inputStyle}
                placeholder="Feature name"
              />
              <select
                value={newFeature.type}
                onChange={(e) => setNewFeature(prev => ({ ...prev, type: e.target.value }))}
                style={inputStyle}
              >
                {featureTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <textarea
              value={newFeature.description}
              onChange={(e) => setNewFeature(prev => ({ ...prev, description: e.target.value }))}
              style={{ ...inputStyle, minHeight: '60px', resize: 'vertical' }}
              placeholder="Feature description"
            />
            <button
              onClick={addFeature}
              style={{
                marginTop: '0.5rem',
                padding: '0.5rem 1rem',
                backgroundColor: 'var(--purple)',
                border: 'none',
                color: 'white',
                borderRadius: '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <Plus size={16} />
              Add Feature
            </button>
          </div>

          {formData.features.map((feature, index) => (
            <div key={index} style={{
              marginBottom: '1rem',
              padding: '1rem',
              backgroundColor: 'var(--bg-primary)',
              borderRadius: '4px',
              border: '1px solid var(--border)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <div>
                  <strong style={{ color: 'var(--text-primary)' }}>{feature.name}</strong>
                  <span style={{ 
                    marginLeft: '0.5rem', 
                    padding: '0.25rem 0.5rem', 
                    backgroundColor: 'var(--purple)', 
                    color: 'white', 
                    borderRadius: '3px', 
                    fontSize: '0.75rem' 
                  }}>
                    {feature.type}
                  </span>
                </div>
                <button
                  onClick={() => removeFeature(index)}
                  style={{
                    padding: '0.25rem',
                    backgroundColor: 'var(--danger)',
                    border: 'none',
                    color: 'white',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <X size={14} />
                </button>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Save Button */}
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <button
            onClick={handleSave}
            disabled={isSaving || !formData.name.trim()}
            style={{
              padding: '1rem 2rem',
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
            {isSaving ? 'Creating...' : 'Create Adversary'}
          </button>
        </div>
      </div>
    </div>
  )
}

// Hook to calculate optimal grid columns based on container width and item count
const useOptimalGridColumns = (itemCount, containerRef) => {
  const [columns, setColumns] = useState('max-content')
  
  const calculateColumns = useCallback(() => {
    if (!containerRef.current || itemCount <= 3) {
      return 'max-content'
    }
    
    const containerWidth = containerRef.current.offsetWidth
    const estimatedItemWidth = 120 // Estimated width per item including gap
    const maxColumns = Math.floor(containerWidth / estimatedItemWidth)
    
    if (maxColumns <= 1) return 'max-content'
    
    // Smart distribution logic
    if (itemCount === 4) return 'max-content max-content'
    if (itemCount === 5) return maxColumns >= 2 ? 'max-content max-content' : 'max-content'
    if (itemCount === 6) return maxColumns >= 2 ? 'max-content max-content' : 'max-content'
    if (itemCount === 7) return maxColumns >= 3 ? 'max-content max-content max-content' : maxColumns >= 2 ? 'max-content max-content' : 'max-content'
    
    // For larger counts, use CSS auto-fit as fallback
    return 'repeat(auto-fit, minmax(80px, max-content))'
  }, [itemCount, containerRef])
  
  useEffect(() => {
    const newColumns = calculateColumns()
    setColumns(newColumns)
    
    // Set up ResizeObserver to recalculate when container size changes
    const resizeObserver = new ResizeObserver(() => {
      const updatedColumns = calculateColumns()
      setColumns(updatedColumns)
    })
    
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current)
    }
    
    return () => {
      resizeObserver.disconnect()
    }
  }, [calculateColumns])
  
  return columns
}

// AdversaryList component that uses the optimal grid columns hook
const AdversaryList = ({ encounter }) => {
  const containerRef = useRef(null)
  const itemCount = encounter.encounterItems?.length || 0
  const gridColumns = useOptimalGridColumns(itemCount, containerRef)
  
  return (
    <div 
      ref={containerRef}
      className="saved-encounter-adversary-list"
      style={{ 
        flex: 1,
        fontSize: '0.8rem',
        color: 'var(--text-secondary)',
        lineHeight: '1.3',
        display: 'grid',
        gridTemplateColumns: gridColumns,
        gap: '0.25rem 1rem',
        gridAutoRows: 'min-content'
      }}>
      {encounter.encounterItems?.length > 0 ? (
        encounter.encounterItems.map((item, index) => {
          const name = item.item.baseName || item.item.name?.replace(/\s+\(\d+\)$/, '') || item.item.name
          return (
            <div key={index} style={{ marginBottom: '0.125rem' }}>
              {item.quantity}x {name}
            </div>
          )
        })
      ) : (
        <div>No adversaries</div>
      )}
    </div>
  )
}

// Battle Points costs for different adversary types (from EncounterBuilder)
const BATTLE_POINT_COSTS = {
  'Minion': 1, // per group equal to party size
  'Social': 1,
  'Support': 1,
  'Horde': 2,
  'Ranged': 2,
  'Skulk': 2,
  'Standard': 2,
  'Leader': 3,
  'Bruiser': 4,
  'Solo': 5
}

// Battle Points adjustments (from EncounterBuilder)
const BATTLE_POINT_ADJUSTMENTS = {
  twoOrMoreSolos: -2,
  noBruisersHordesLeadersSolos: 1,
  lowerTierAdversary: 1
}

// Dynamically import JSON data to keep initial bundle smaller
let adversariesData = { adversaries: [] }
let environmentsData = { environments: [] }
let playtestAdversariesData = { adversaries: [] }
let playtestEnvironmentsData = { environments: [] }
let _dataLoaded = false

// Load custom content from localStorage
const loadCustomContent = () => {
  const customAdversaries = JSON.parse(localStorage.getItem('daggerheart-custom-adversaries') || '[]')
  const customEnvironments = JSON.parse(localStorage.getItem('daggerheart-custom-environments') || '[]')
  return { customAdversaries, customEnvironments }
}

// Save custom content to localStorage
const saveCustomContent = (type, content) => {
  if (type === 'adversary') {
    localStorage.setItem('daggerheart-custom-adversaries', JSON.stringify(content))
  } else if (type === 'environment') {
    localStorage.setItem('daggerheart-custom-environments', JSON.stringify(content))
  }
}

// Load data asynchronously
const loadData = async () => {
  // Prevent multiple simultaneous loads
  if (_dataLoaded) {
    return
  }
  
  let officialAdversaries = { adversaries: [] }
  let officialEnvironments = { environments: [] }
  let playtestAdv = { adversaries: [] }
  let playtestEnv = { environments: [] }
  
  try {
    const mod = await import(/* @vite-ignore */ '../data/adversaries.json')
    officialAdversaries = mod?.default || mod
  } catch (e) {
    console.warn('Failed to load adversaries.json:', e)
  }
  
  try {
    const mod = await import(/* @vite-ignore */ '../data/environments.json')
    officialEnvironments = mod?.default || mod
  } catch (e) {
    console.warn('Failed to load environments.json:', e)
  }
  
  try {
    const mod = await import(/* @vite-ignore */ '../data/playtest-adversaries.json')
    playtestAdv = mod?.default || mod
  } catch (e) {
    console.warn('Failed to load playtest-adversaries.json:', e)
  }
  
  try {
    const mod = await import(/* @vite-ignore */ '../data/playtest-environments.json')
    playtestEnv = mod?.default || mod
  } catch (e) {
    console.warn('Failed to load playtest-environments.json:', e)
  }
  
  // Load custom content and merge everything
  const { customAdversaries, customEnvironments } = loadCustomContent()
  
  // Create merged data objects without mutating originals
  adversariesData = {
    ...officialAdversaries,
    adversaries: [
      ...(officialAdversaries.adversaries || []),
      ...(playtestAdv.adversaries || []),
      ...customAdversaries
    ]
  }
  
  environmentsData = {
    ...officialEnvironments,
    environments: [
      ...(officialEnvironments.environments || []),
      ...(playtestEnv.environments || []),
      ...customEnvironments
    ]
  }
  
  _dataLoaded = true
  console.log(`Loaded ${adversariesData.adversaries.length} adversaries and ${environmentsData.environments.length} environments`)
}

// Functions to manage custom content
const addCustomAdversary = (adversaryData) => {
  const { customAdversaries } = loadCustomContent()
  const newAdversary = {
    ...adversaryData,
    id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
    source: adversaryData.source || 'Homebrew'
  }
  const updatedAdversaries = [...customAdversaries, newAdversary]
  saveCustomContent('adversary', updatedAdversaries)
  
  // Reset flag and reload data to include the new custom adversary
  _dataLoaded = false
  loadData()
  
  return newAdversary.id
}

const addCustomEnvironment = (environmentData) => {
  const { customEnvironments } = loadCustomContent()
  const newEnvironment = {
    ...environmentData,
    id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
    source: environmentData.source || 'Homebrew'
  }
  const updatedEnvironments = [...customEnvironments, newEnvironment]
  saveCustomContent('environment', updatedEnvironments)
  
  // Reset flag and reload data to include the new custom environment
  _dataLoaded = false
  loadData()
  
  return newEnvironment.id
}

const updateCustomContent = (type, id, updates) => {
  const { customAdversaries, customEnvironments } = loadCustomContent()
  
  if (type === 'adversary') {
    const updatedAdversaries = customAdversaries.map(adv => 
      adv.id === id ? { ...adv, ...updates } : adv
    )
    saveCustomContent('adversary', updatedAdversaries)
  } else if (type === 'environment') {
    const updatedEnvironments = customEnvironments.map(env => 
      env.id === id ? { ...env, ...updates } : env
    )
    saveCustomContent('environment', updatedEnvironments)
  }
  
  // Reset flag and reload data to reflect changes
  _dataLoaded = false
  loadData()
}

const deleteCustomContent = (type, id) => {
  const { customAdversaries, customEnvironments } = loadCustomContent()
  
  if (type === 'adversary') {
    const updatedAdversaries = customAdversaries.filter(adv => adv.id !== id)
    saveCustomContent('adversary', updatedAdversaries)
  } else if (type === 'environment') {
    const updatedEnvironments = customEnvironments.filter(env => env.id !== id)
    saveCustomContent('environment', updatedEnvironments)
  }
  
  // Reset flag and reload data to reflect changes
  _dataLoaded = false
  loadData()
}

// Functions to manage playtest content (for development/admin use)
const addPlaytestAdversary = (adversaryData) => {
  // Note: This would typically be done by updating the playtest-adversaries.json file directly
  // This function is here for completeness but playtest content is usually managed via file updates
  console.warn('addPlaytestAdversary: Playtest content should be managed by updating playtest-adversaries.json directly')
}

const addPlaytestEnvironment = (environmentData) => {
  // Note: This would typically be done by updating the playtest-environments.json file directly
  // This function is here for completeness but playtest content is usually managed via file updates
  console.warn('addPlaytestEnvironment: Playtest content should be managed by updating playtest-environments.json directly')
}

// Custom hook for browser functionality - all logic inline
const useBrowser = (type, encounterItems = [], pcCount = 4, playerTier = 1) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortFields, setSortFields] = useState([{ field: 'tier', direction: 'asc' }, { field: 'name', direction: 'asc' }])
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Advanced filtering state
  const [selectedTiers, setSelectedTiers] = useState([])
  const [selectedTypes, setSelectedTypes] = useState([])
  const [showTierDropdown, setShowTierDropdown] = useState(false)
  const [showTypeDropdown, setShowTypeDropdown] = useState(false)
  
  // Refs for dropdown positioning
  const tierFilterRef = useRef(null)
  const typeFilterRef = useRef(null)

  useEffect(() => {
    const initializeData = async () => {
      await loadData()
      setLoading(false)
      
      // Set data after loading is complete
      let sourceData = []
      if (type === 'adversary') {
        sourceData = adversariesData.adversaries || []
      } else if (type === 'environment') {
        sourceData = environmentsData.environments || []
      }
      
      setData(sourceData)
    }
    
    initializeData()
  }, [type])

  // Function to refresh data
  const refreshData = useCallback(async () => {
    _dataLoaded = false
    await loadData()
    
    // Update data after reload
    let sourceData = []
    if (type === 'adversary') {
      sourceData = adversariesData.adversaries || []
    } else if (type === 'environment') {
      sourceData = environmentsData.environments || []
    }
    
    setData(sourceData)
  }, [type])

  // Get unique values for filtering
  const getUniqueValues = (field) => {
    const values = data.map(item => item[field]).filter(Boolean)
    return [...new Set(values)].sort((a, b) => {
      // Sort numbers numerically, strings alphabetically
      if (typeof a === 'number' && typeof b === 'number') {
        return a - b
      }
      return String(a).localeCompare(String(b))
    })
  }

  const uniqueTiers = getUniqueValues('tier')
  const uniqueTypes = getUniqueValues('type')

  const filteredAndSortedData = useMemo(() => {
    let filtered = data.filter(item => {
      // Search filter
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase())
      
      // Tier filter
      const matchesTier = selectedTiers.length === 0 || 
        (selectedTiers.includes('party-tier') ? item.tier === playerTier : selectedTiers.includes(item.tier.toString()))
      
      // Type filter
      const matchesType = selectedTypes.length === 0 || selectedTypes.includes(item.type)
      
      return matchesSearch && matchesTier && matchesType
    })

    // Apply multi-level sorting (like archived version)
    filtered.sort((a, b) => {
      for (const sort of sortFields) {
        const { field, direction } = sort
        let aValue = a[field]
        let bValue = b[field]
        
        if (field === 'tier') {
          aValue = parseInt(aValue) || 0
          bValue = parseInt(bValue) || 0
        } else if (field === 'cost') {
          // Calculate dynamic cost for sorting
          const calculateDynamicCost = (item) => {
            if (type !== 'adversary') return 0
            
            const baseCost = BATTLE_POINT_COSTS[item.type] || 2
            let automaticAdjustment = 0
            
            // Count current adversaries by type
            const currentSoloCount = encounterItems.filter(encounterItem => 
              encounterItem.type === 'adversary' && encounterItem.item.type === 'Solo' && encounterItem.quantity > 0
            ).reduce((sum, encounterItem) => sum + encounterItem.quantity, 0)
            
            const currentMajorThreatCount = encounterItems.filter(encounterItem => 
              encounterItem.type === 'adversary' && ['Bruiser', 'Horde', 'Leader', 'Solo'].includes(encounterItem.item.type) && encounterItem.quantity > 0
            ).reduce((sum, encounterItem) => sum + encounterItem.quantity, 0)
            
            // Calculate automatic adjustments
            if (item.type === 'Solo') {
              // If this would be the 2nd Solo, add 2 BP (penalty for 2+ Solos)
              if (currentSoloCount === 1) {
                automaticAdjustment += 2
              }
            }
            
            if (['Bruiser', 'Horde', 'Leader', 'Solo'].includes(item.type)) {
              // If this is the first Major Threat, add 1 BP (automatic adjustment for lack of Major Threats)
              if (currentMajorThreatCount === 0) {
                automaticAdjustment += 1
              }
            }
            
        // Lower tier adjustment
        // if (item.tier < playerTier) {
        //   automaticAdjustment += 1
        // }
            
            return baseCost + automaticAdjustment
          }
          
          aValue = calculateDynamicCost(a)
          bValue = calculateDynamicCost(b)
        } else if (field === 'difficulty') {
          // Handle difficulty sorting - numeric difficulties first, then special cases
          const aNum = parseInt(aValue)
          const bNum = parseInt(bValue)
          
          if (!isNaN(aNum) && !isNaN(bNum)) {
            // Both are numeric
            aValue = aNum
            bValue = bNum
          } else if (!isNaN(aNum) && isNaN(bNum)) {
            // a is numeric, b is not - numeric comes first
            aValue = aNum
            bValue = 999 // High number to sort after numeric difficulties
          } else if (isNaN(aNum) && !isNaN(bNum)) {
            // b is numeric, a is not - numeric comes first
            aValue = 999 // High number to sort after numeric difficulties
            bValue = bNum
          } else {
            // Both are non-numeric, sort alphabetically
            aValue = String(aValue || '').toLowerCase()
            bValue = String(bValue || '').toLowerCase()
          }
        } else if (typeof aValue === 'string' && typeof bValue === 'string') {
          aValue = aValue.toLowerCase()
          bValue = bValue.toLowerCase()
        } else {
          // Handle non-string values by converting to strings
          aValue = String(aValue || '').toLowerCase()
          bValue = String(bValue || '').toLowerCase()
        }
        
        if (direction === 'asc') {
          if (aValue > bValue) return 1
          if (aValue < bValue) return -1
        } else {
          if (aValue < bValue) return 1
          if (aValue > bValue) return -1
        }
        // If equal, continue to next sort level
      }
      return 0
    })

    return filtered
  }, [data, searchTerm, sortFields, selectedTiers, selectedTypes, encounterItems, pcCount, playerTier])

  const handleSort = (field) => {
    setSortFields(prev => {
      // Check if this field is already in the sort fields
      const existingIndex = prev.findIndex(sort => sort.field === field)
      
      if (existingIndex >= 0) {
        // Field exists - check if it's the primary field
        if (existingIndex === 0) {
          // It's the primary field - toggle direction
          const newSortFields = [...prev]
          newSortFields[0] = {
            ...newSortFields[0],
            direction: newSortFields[0].direction === 'asc' ? 'desc' : 'asc'
          }
          return newSortFields
        } else {
          // It's not the primary field - move it to primary position and reset to asc
          const newSortFields = [...prev]
          const existingSort = newSortFields.splice(existingIndex, 1)[0]
          return [{ field, direction: 'asc' }, ...newSortFields]
        }
      } else {
        // Field doesn't exist - add it as new primary sort
        return [{ field, direction: 'asc' }, ...prev]
      }
    })
  }

  const handleTierSelect = (tier) => {
    if (tier === 'clear') {
      setSelectedTiers([])
    } else if (tier === 'party-tier') {
      // Special case: only show party tier
      setSelectedTiers(['party-tier'])
    } else {
      setSelectedTiers(prev => 
        prev.includes(tier) 
          ? prev.filter(t => t !== tier)
          : [...prev, tier]
      )
    }
    // Don't close dropdown - allow multiple selections
  }

  const handleTypeSelect = (type) => {
    if (type === 'clear') {
      setSelectedTypes([])
    } else {
      setSelectedTypes(prev => 
        prev.includes(type) 
          ? prev.filter(t => t !== type)
          : [...prev, type]
      )
    }
    // Don't close dropdown - allow multiple selections
  }

  const isTierFiltered = selectedTiers.length > 0
  const isTypeFiltered = selectedTypes.length > 0

  // Close dropdowns on outside click
  useEffect(() => {
    const handleGlobalDown = (event) => {
      const inDropdown = event.target.closest('.filter-dropdown')
      const onFilterButton = event.target.closest('.header-filter-icon')
      if (inDropdown || onFilterButton) return
      setShowTierDropdown(false)
      setShowTypeDropdown(false)
    }
    const handleKey = (event) => {
      if (event.key === 'Escape') {
        setShowTierDropdown(false)
        setShowTypeDropdown(false)
      }
    }

    document.addEventListener('pointerdown', handleGlobalDown, true)
    document.addEventListener('mousedown', handleGlobalDown, true)
    document.addEventListener('touchstart', handleGlobalDown, true)
    document.addEventListener('click', handleGlobalDown, true)
    document.addEventListener('keydown', handleKey, true)
    return () => {
      document.removeEventListener('pointerdown', handleGlobalDown, true)
      document.removeEventListener('mousedown', handleGlobalDown, true)
      document.removeEventListener('touchstart', handleGlobalDown, true)
      document.removeEventListener('click', handleGlobalDown, true)
      document.removeEventListener('keydown', handleKey, true)
    }
  }, [setShowTierDropdown, setShowTypeDropdown])

  // Get dropdown positioning
  const getDropdownStyle = (ref) => {
    if (!ref.current) return {}
    const rect = ref.current.getBoundingClientRect()
    return {
      position: 'fixed',
      top: rect.bottom + 4,
      left: rect.left - 100, // Align with left side of column instead of button
      zIndex: 99999
    }
  }

  return {
    searchTerm,
    setSearchTerm,
    sortFields,
    handleSort,
    filteredAndSortedData,
    loading,
    refreshData,
    // Advanced filtering
    selectedTiers,
    selectedTypes,
    showTierDropdown,
    setShowTierDropdown,
    showTypeDropdown,
    setShowTypeDropdown,
    tierFilterRef,
    typeFilterRef,
    uniqueTiers,
    uniqueTypes,
    handleTierSelect,
    handleTypeSelect,
    isTierFiltered,
    isTypeFiltered,
    getDropdownStyle
  }
}

// Browser Header Component
const BrowserHeader = ({ searchTerm, onSearchChange, type, partyControls }) => {
  return (
    <div style={styles.browserHeader}>
      <input
        type="text"
        placeholder="Search"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        style={styles.searchInput}
      />
      {partyControls && (
        <div style={styles.partyControls}>
          {partyControls}
        </div>
      )}
    </div>
  )
}

// Browser Table Header Component
const BrowserTableHeader = ({ 
  sortFields, 
  onSort, 
  type,
  // Advanced filtering props
  uniqueTiers,
  uniqueTypes,
  selectedTiers,
  selectedTypes,
  showTierDropdown,
  setShowTierDropdown,
  showTypeDropdown,
  setShowTypeDropdown,
  tierFilterRef,
  typeFilterRef,
  handleTierSelect,
  handleTypeSelect,
  isTierFiltered,
  isTypeFiltered,
  getDropdownStyle,
  // Cost filter props
  costFilter,
  showCostDropdown,
  setShowCostDropdown,
  costFilterRef,
  handleCostFilterSelect,
  isCostFiltered
}) => {
  const [hoveredColumn, setHoveredColumn] = useState(null)

  const getColumns = () => {
    if (type === 'adversary') {
      return [
        { key: 'name', label: 'Name' },
        { key: 'tier', label: 'Tier', hasFilter: true },
        { key: 'type', label: 'Type', hasFilter: true },
        { key: 'cost', label: 'Cost', hasFilter: true },
        { key: 'difficulty', label: 'Diff' },
        { key: 'action', label: '' } // Empty label for action column
      ]
    } else if (type === 'environment') {
      return [
        { key: 'name', label: 'Name' },
        { key: 'tier', label: 'Tier', hasFilter: true },
        { key: 'type', label: 'Type', hasFilter: true },
        { key: 'difficulty', label: 'Diff' },
        { key: 'action', label: '' } // Empty label for action column
      ]
    }
    return []
  }

  const columns = getColumns()

  const renderCostFilterDropdown = () => {
    if (!showCostDropdown) return null

    const costFilterOptions = [
      { value: 'all', label: 'All' },
      { value: 'auto-grey', label: 'Auto Grey' },
      { value: 'auto-hide', label: 'Auto Hide' }
    ]

    return createPortal(
      <div 
        className="filter-dropdown"
        style={{
          ...styles.filterDropdown,
          ...getDropdownStyle(costFilterRef),
          maxHeight: '60vh',
          overflow: 'auto'
        }}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        {costFilterOptions.map(option => {
          const isSelected = costFilter === option.value
          return (
            <div
              key={option.value}
              style={{
                ...styles.filterOption,
                ...(isSelected ? styles.filterOptionSelected : {})
              }}
              onClick={() => handleCostFilterSelect(option.value)}
            >
              <span style={styles.checkIcon}>
                {isSelected ? <CheckSquare size={16}/> : <Square size={16}/>}
              </span>
              <span style={styles.filterLabel}>{option.label}</span>
            </div>
          )
        })}
      </div>,
      document.body
    )
  }

  const renderFilterDropdown = (filterType, values, selected, onSelect, isOpen, setIsOpen, filterRef, isFiltered) => {
    if (!isOpen) return null

    const handleClear = () => {
      if (filterType === 'tier') {
        // Clear tier selection
        onSelect('clear')
      } else if (filterType === 'type') {
        // Clear type selection  
        onSelect('clear')
      }
    }

    return createPortal(
      <div 
        className="filter-dropdown"
        style={{
          ...styles.filterDropdown,
          ...getDropdownStyle(filterRef),
          maxHeight: '60vh',
          overflow: 'auto'
        }}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <div 
          style={{
            ...styles.filterOption,
            ...(selected.length === 0 ? styles.filterOptionSelected : {})
          }}
          onClick={handleClear}
        >
          <span style={styles.checkIcon}>
            {selected.length === 0 ? <CheckSquare size={16}/> : <Square size={16}/>}
          </span>
          <span style={styles.filterLabel}>All</span>
        </div>
        {filterType === 'tier' && (
          <div 
            style={{
              ...styles.filterOption,
              ...(selected.includes('party-tier') ? styles.filterOptionSelected : {})
            }}
            onClick={() => onSelect('party-tier')}
          >
            <span style={styles.checkIcon}>
              {selected.includes('party-tier') ? <CheckSquare size={16}/> : <Square size={16}/>}
            </span>
            <span style={styles.filterLabel}>Party Tier</span>
          </div>
        )}
        {values.map(value => {
          const isSelected = selected.includes(value.toString())
          return (
            <div
              key={value}
              style={{
                ...styles.filterOption,
                ...(isSelected ? styles.filterOptionSelected : {})
              }}
              onClick={() => onSelect(value.toString())}
            >
              <span style={styles.checkIcon}>
                {isSelected ? <CheckSquare size={16}/> : <Square size={16}/>}
              </span>
              <span style={styles.filterLabel}>{value}</span>
            </div>
          )
        })}
      </div>,
      document.body
    )
  }

  return (
    <tr style={styles.tableHeader}>
      {columns.map(column => (
        <th
          key={column.key}
          style={{
            ...styles.tableHeaderCell,
            ...(hoveredColumn === column.key ? styles.tableHeaderCellHover : {}),
            position: 'relative',
            // Apply column-specific widths
            ...(column.key === 'name' ? { width: 'auto', minWidth: '0' } : {}),
            ...(column.key === 'tier' ? { width: '40px', minWidth: '40px', maxWidth: '40px' } : {}),
            ...(column.key === 'type' ? { width: '80px', minWidth: '80px', maxWidth: '80px' } : {}),
            ...(column.key === 'difficulty' ? { width: '40px', minWidth: '40px', maxWidth: '40px' } : {}),
            ...(column.key === 'cost' ? { width: '50px', minWidth: '50px', maxWidth: '50px' } : {}),
            ...(column.key === 'action' ? { width: '40px', minWidth: '40px', maxWidth: '40px' } : {})
          }}
          onClick={() => onSort(column.key)}
          onMouseEnter={() => setHoveredColumn(column.key)}
          onMouseLeave={() => setHoveredColumn(null)}
        >
          {column.hasFilter ? (
            <div style={styles.headerWithFilter}>
              <span 
                style={{ cursor: 'pointer' }}
                onClick={(e) => {
                  e.stopPropagation()
                  onSort(column.key)
                }}
              >
                {column.label}
              </span>
              <button
                ref={column.key === 'tier' ? tierFilterRef : column.key === 'type' ? typeFilterRef : costFilterRef}
                style={{
                  ...styles.headerFilterIcon,
                  ...(column.key === 'tier' && isTierFiltered ? styles.headerFilterIconActive : {}),
                  ...(column.key === 'type' && isTypeFiltered ? styles.headerFilterIconActive : {}),
                  ...(column.key === 'cost' && isCostFiltered ? styles.headerFilterIconActive : {})
                }}
                className="header-filter-icon"
                onClick={(e) => {
                  e.stopPropagation()
                  if (column.key === 'tier') {
                    setShowTierDropdown(!showTierDropdown)
                    setShowTypeDropdown(false)
                    setShowCostDropdown(false)
                  } else if (column.key === 'type') {
                    setShowTypeDropdown(!showTypeDropdown)
                    setShowTierDropdown(false)
                    setShowCostDropdown(false)
                  } else if (column.key === 'cost') {
                    setShowCostDropdown(!showCostDropdown)
                    setShowTierDropdown(false)
                    setShowTypeDropdown(false)
                  }
                }}
              >
                <Filter size={14} />
                {(column.key === 'tier' && isTierFiltered) || (column.key === 'type' && isTypeFiltered) || (column.key === 'cost' && isCostFiltered) ? (
                  <span style={styles.filterActiveDot}></span>
                ) : null}
              </button>
            </div>
          ) : (
            column.label
          )}
          
          {/* Filter dropdowns */}
          {column.key === 'tier' && renderFilterDropdown(
            'tier', uniqueTiers, selectedTiers, handleTierSelect,
            showTierDropdown, setShowTierDropdown, tierFilterRef, isTierFiltered
          )}
          {column.key === 'type' && renderFilterDropdown(
            'type', uniqueTypes, selectedTypes, handleTypeSelect,
            showTypeDropdown, setShowTypeDropdown, typeFilterRef, isTypeFiltered
          )}
          {column.key === 'cost' && renderCostFilterDropdown()}
        </th>
      ))}
    </tr>
  )
}

// Browser Row Component
const BrowserRow = ({ item, onAdd, type, onRowClick, encounterItems = [], pcCount = 4, playerTier = 1, remainingBudget = 0, costFilter = 'auto-grey', onAdversaryClick }) => {
  const [isHovered, setIsHovered] = useState(false)

  const handleAdd = () => {
    onAdd(item)
  }

  // Calculate dynamic cost including automatic adjustments
  const calculateDynamicCost = () => {
    if (type !== 'adversary') return null
    
    const baseCost = BATTLE_POINT_COSTS[item.type] || 2
    let automaticAdjustment = 0
    
    // Count current adversaries by type
    const currentSoloCount = encounterItems.filter(encounterItem => 
      encounterItem.type === 'adversary' && encounterItem.item.type === 'Solo' && encounterItem.quantity > 0
    ).reduce((sum, encounterItem) => sum + encounterItem.quantity, 0)
    
    const currentMajorThreatCount = encounterItems.filter(encounterItem => 
      encounterItem.type === 'adversary' && ['Bruiser', 'Horde', 'Leader', 'Solo'].includes(encounterItem.item.type) && encounterItem.quantity > 0
    ).reduce((sum, encounterItem) => sum + encounterItem.quantity, 0)
    
    // Calculate automatic adjustments
    if (item.type === 'Solo') {
      // If this would be the 2nd Solo, add 2 BP (penalty for 2+ Solos)
      if (currentSoloCount === 1) {
        automaticAdjustment += 2
      }
    }
    
    if (['Bruiser', 'Horde', 'Leader', 'Solo'].includes(item.type)) {
      // If this is the first Major Threat, add 1 BP (automatic adjustment for lack of Major Threats)
      if (currentMajorThreatCount === 0) {
        automaticAdjustment += 1
      }
    }
    
        // Lower tier adjustment
        // if (item.tier < playerTier) {
        //   automaticAdjustment += 1
        // }
    
    return baseCost + automaticAdjustment
  }

  const renderContent = () => {
    if (type === 'adversary') {
      const dynamicCost = calculateDynamicCost()
      const baseCost = BATTLE_POINT_COSTS[item.type] || 2
      const exceedsBudget = dynamicCost > remainingBudget || remainingBudget <= 0
      
      // Apply cost filter logic
      if (costFilter === 'auto-hide' && exceedsBudget) {
        return null // Hide the row completely
      }
      
      // De-emphasized styling for rows that exceed budget (only for auto-grey mode)
      const deEmphasizedStyle = (costFilter === 'auto-grey' && exceedsBudget) ? {
        opacity: 0.5,
        color: 'var(--text-secondary)'
      } : {}
      
      return (
        <>
          <td style={{...styles.rowCell, width: 'auto', minWidth: '0', textAlign: 'left', ...deEmphasizedStyle}}>
            <div style={{ 
              overflow: 'hidden', 
              textOverflow: 'ellipsis', 
              whiteSpace: 'nowrap',
              maxWidth: '100%'
            }}>
              <div style={{ fontWeight: '600' }}>{item.name}</div>
              {item.description && (
                <div style={{ 
                  fontSize: '0.85rem', 
                  color: 'var(--text-secondary)', 
                  marginTop: '0.125rem',
                  overflow: 'hidden', 
                  textOverflow: 'ellipsis', 
                  whiteSpace: 'nowrap'
                }}>
                  {item.description}
                </div>
              )}
            </div>
          </td>
          <td style={{...styles.rowCell, width: '40px', minWidth: '40px', maxWidth: '40px', textAlign: 'center', ...deEmphasizedStyle}}>{item.tier}</td>
          <td style={{...styles.rowCell, width: '80px', minWidth: '80px', maxWidth: '80px', textAlign: 'center', ...deEmphasizedStyle}}>{item.type}</td>
          <td style={{...styles.rowCell, width: '50px', minWidth: '50px', maxWidth: '50px', textAlign: 'center', ...deEmphasizedStyle}}>
            {dynamicCost}
          </td>
          <td style={{...styles.rowCell, width: '40px', minWidth: '40px', maxWidth: '40px', textAlign: 'center', ...deEmphasizedStyle}}>{item.difficulty}</td>
        </>
      )
    } else if (type === 'environment') {
      return (
        <>
          <td style={{...styles.rowCell, width: 'auto', minWidth: '0', textAlign: 'left'}}>{item.name}</td>
          <td style={{...styles.rowCell, width: '80px', minWidth: '80px', maxWidth: '80px', textAlign: 'center'}}>{item.tier}</td>
          <td style={{...styles.rowCell, width: '100px', minWidth: '100px', maxWidth: '100px', textAlign: 'center'}}>{item.type}</td>
          <td style={{...styles.rowCell, width: '40px', minWidth: '40px', maxWidth: '40px', textAlign: 'center'}}>{item.difficulty}</td>
        </>
      )
    }
    return null
  }

  const content = renderContent()
  
  // If renderContent returns null (auto-hide mode), don't render the row
  if (content === null) {
    return null
  }

  return (
    <>
      <tr 
        style={{
          ...styles.row,
          ...(isHovered ? styles.rowHover : {})
        }}
        onClick={() => {
          if (type === 'adversary' && onAdversaryClick) {
            onAdversaryClick(item)
          } else if (onRowClick) {
            onRowClick(item, type)
          }
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {content}
        <td style={{ 
          width: '40px', 
          minWidth: '40px', 
          maxWidth: '40px', 
          textAlign: 'center', 
          padding: '0', 
          margin: '0', 
          border: 'none', 
          verticalAlign: 'middle',
          boxSizing: 'border-box',
          overflow: 'visible',
          textOverflow: 'unset',
          whiteSpace: 'nowrap'
        }}>
          <button
            style={styles.addButton}
            onClick={(e) => {
              e.stopPropagation()
              handleAdd()
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'var(--bg-secondary)'
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'var(--purple)'
            }}
          >
            +
          </button>
        </td>
      </tr>
    </>
  )
}

// Main Browser Component
const Browser = ({ type, onAddItem, onCancel = null, onRowClick, encounterItems = [], pcCount = 4, playerTier = 1, partyControls = null, showContainer = true, savedEncounters = [], onLoadEncounter, onDeleteEncounter, activeTab = 'adversaries' }) => {
  const [costFilter, setCostFilter] = useState('all') // 'all', 'auto-grey', 'auto-hide'
  const [showCostDropdown, setShowCostDropdown] = useState(false)
  const [selectedAdversary, setSelectedAdversary] = useState(null)
  const [deleteConfirmations, setDeleteConfirmations] = useState({}) // Track which encounters are in delete confirmation state
  const deleteTimeouts = useRef({}) // Track timeouts for each encounter
  const costFilterRef = useRef(null)
  
  // Handle two-stage delete
  const handleDeleteClick = (encounterId) => {
    if (deleteConfirmations[encounterId]) {
      // Second click - actually delete (no popup confirmation)
      onDeleteEncounter && onDeleteEncounter(encounterId)
      setDeleteConfirmations(prev => {
        const newState = { ...prev }
        delete newState[encounterId]
        return newState
      })
      // Clear any existing timeout
      if (deleteTimeouts.current[encounterId]) {
        clearTimeout(deleteTimeouts.current[encounterId])
        delete deleteTimeouts.current[encounterId]
      }
    } else {
      // First click - show confirmation state
      setDeleteConfirmations(prev => ({
        ...prev,
        [encounterId]: true
      }))
      
      // Clear any existing timeout for this encounter
      if (deleteTimeouts.current[encounterId]) {
        clearTimeout(deleteTimeouts.current[encounterId])
      }
      
      // Set timeout to revert after 3 seconds
      deleteTimeouts.current[encounterId] = setTimeout(() => {
        setDeleteConfirmations(prev => {
          const newState = { ...prev }
          delete newState[encounterId]
          return newState
        })
        delete deleteTimeouts.current[encounterId]
      }, 3000)
    }
  }
  
  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      Object.values(deleteTimeouts.current).forEach(timeout => {
        clearTimeout(timeout)
      })
    }
  }, [])
  
  const {
    searchTerm,
    setSearchTerm,
    sortFields,
    handleSort,
    filteredAndSortedData,
    loading,
    refreshData,
    // Advanced filtering
    selectedTiers,
    selectedTypes,
    showTierDropdown,
    setShowTierDropdown,
    showTypeDropdown,
    setShowTypeDropdown,
    tierFilterRef,
    typeFilterRef,
    uniqueTiers,
    uniqueTypes,
    handleTierSelect,
    handleTypeSelect,
    isTierFiltered,
    isTypeFiltered,
    getDropdownStyle
  } = useBrowser(type, encounterItems, pcCount, playerTier)

  // Calculate remaining battle points budget
  const calculateRemainingBudget = () => {
    const baseBattlePoints = (3 * pcCount) + 2
    const spentBattlePoints = encounterItems.reduce((total, item) => {
      if (item.type === 'adversary') {
        const cost = BATTLE_POINT_COSTS[item.item.type] || 2
        if (item.item.type === 'Minion') {
          // Minions cost 1 BP per group equal to party size
          const groups = Math.ceil(item.quantity / pcCount)
          return total + (groups * cost)
        } else {
          return total + (item.quantity * cost)
        }
      }
      return total
    }, 0)
    
    // Calculate automatic adjustments (same logic as EncounterBuilder)
    let automaticAdjustments = 0
    
    // Check for 2 or more Solo adversaries (only count those with quantity > 0)
    const soloCount = encounterItems
      .filter(item => item.type === 'adversary' && item.item.type === 'Solo' && item.quantity > 0)
      .reduce((sum, item) => sum + item.quantity, 0)
    if (soloCount >= 2) {
      automaticAdjustments += BATTLE_POINT_ADJUSTMENTS.twoOrMoreSolos
    }
    
    // Check if no Bruisers, Hordes, Leaders, or Solos (only count those with quantity > 0)
    const hasBruisers = encounterItems.some(item => 
      item.type === 'adversary' && item.item.type === 'Bruiser' && item.quantity > 0
    )
    const hasHordes = encounterItems.some(item => 
      item.type === 'adversary' && item.item.type === 'Horde' && item.quantity > 0
    )
    const hasLeaders = encounterItems.some(item => 
      item.type === 'adversary' && item.item.type === 'Leader' && item.quantity > 0
    )
    const hasSolos = encounterItems.some(item => 
      item.type === 'adversary' && item.item.type === 'Solo' && item.quantity > 0
    )
    
    if (!hasBruisers && !hasHordes && !hasLeaders && !hasSolos) {
      automaticAdjustments += BATTLE_POINT_ADJUSTMENTS.noBruisersHordesLeadersSolos
    }
    
    // Check for lower tier adversaries (only count those with quantity > 0)
    // const hasLowerTierAdversaries = encounterItems.some(item => 
    //   item.type === 'adversary' && item.item.tier && item.item.tier < playerTier && item.quantity > 0
    // )
    // if (hasLowerTierAdversaries) {
    //   automaticAdjustments += BATTLE_POINT_ADJUSTMENTS.lowerTierAdversary
    // }
    
    const availableBattlePoints = baseBattlePoints + automaticAdjustments
    return availableBattlePoints - spentBattlePoints
  }

  const remainingBudget = calculateRemainingBudget()

  const handleCostFilterSelect = (filter) => {
    setCostFilter(filter)
    setShowCostDropdown(false)
  }

  const isCostFiltered = costFilter !== 'all'

  if (loading) {
    return (
      <div style={styles.browser}>
        <div style={styles.loading}>Loading...</div>
      </div>
    )
  }

  return (
    <>
      <div style={showContainer ? styles.browserWrapper : styles.browserWrapperNoContainer}>
      {/* Fixed Header Row */}

      {activeTab === 'adversaries' && (
        <>
          <BrowserHeader
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            type={type}
            partyControls={partyControls}
          />

          {/* Scrollable Content with Sticky Header */}
          <div className="browser-content invisible-scrollbar" style={styles.browserContent}>
        <table style={styles.browserTable}>
          <thead style={{ position: 'sticky', top: 0, zIndex: 10, backgroundColor: 'var(--bg-primary)' }}>
            <BrowserTableHeader
              sortFields={sortFields}
              onSort={handleSort}
              type={type}
              uniqueTiers={uniqueTiers}
              uniqueTypes={uniqueTypes}
              selectedTiers={selectedTiers}
              selectedTypes={selectedTypes}
              showTierDropdown={showTierDropdown}
              setShowTierDropdown={setShowTierDropdown}
              showTypeDropdown={showTypeDropdown}
              setShowTypeDropdown={setShowTypeDropdown}
              tierFilterRef={tierFilterRef}
              typeFilterRef={typeFilterRef}
              handleTierSelect={handleTierSelect}
              handleTypeSelect={handleTypeSelect}
              isTierFiltered={isTierFiltered}
              isTypeFiltered={isTypeFiltered}
              getDropdownStyle={getDropdownStyle}
              // Cost filter props
              costFilter={costFilter}
              showCostDropdown={showCostDropdown}
              setShowCostDropdown={setShowCostDropdown}
              costFilterRef={costFilterRef}
              handleCostFilterSelect={handleCostFilterSelect}
              isCostFiltered={isCostFiltered}
            />
          </thead>
          <tbody>
            {filteredAndSortedData.map(item => (
              <BrowserRow
                key={item.id}
                item={item}
                onAdd={onAddItem}
                type={type}
                onRowClick={onRowClick}
                encounterItems={encounterItems}
                pcCount={pcCount}
                playerTier={playerTier}
                remainingBudget={remainingBudget}
                costFilter={costFilter}
                onAdversaryClick={(adversary) => {
                  if (type === 'adversary') {
                    setSelectedAdversary(adversary)
                  }
                }}
              />
            ))}
          </tbody>
        </table>
      </div>
        </>
      )}

      {activeTab === 'encounters' && (
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1rem'
        }}>
          {savedEncounters.length === 0 ? (
            <div style={{
              color: 'var(--text-secondary)',
              fontSize: '0.9rem',
              textAlign: 'center',
              padding: '2rem 1rem'
            }}>
              No saved encounters yet
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {savedEncounters.map((encounter) => (
                <div
                  key={encounter.id}
                  onClick={() => onLoadEncounter && onLoadEncounter(encounter.id)}
                  className="saved-encounter-card"
                  style={{
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    padding: '8px',
                    backgroundColor: 'var(--bg-card)',
                    transition: 'background-color 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    cursor: 'pointer'
                  }}
                >
                  {/* Tier, Party Size, and Balance (stacked vertically) */}
                  <div style={{ 
                    minWidth: '100px',
                    borderRight: '1px solid var(--text-secondary)',
                    paddingRight: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    minHeight: '60px'
                  }}>
                    <div style={{
                      fontSize: '0.8rem',
                      color: 'var(--text-primary)',
                      marginBottom: '0.25rem'
                    }}>
                      Tier: {(() => {
                        const tiers = encounter.encounterItems
                          ?.filter(item => item.type === 'adversary')
                          ?.map(item => item.item.tier)
                          ?.filter(tier => tier !== undefined && tier !== null)
                          ?.sort((a, b) => a - b) || []
                        
                        if (tiers.length === 0) return 'N/A'
                        if (tiers.length === 1) return tiers[0]
                        
                        const uniqueTiers = [...new Set(tiers)]
                        if (uniqueTiers.length === 1) return uniqueTiers[0]
                        
                        return `${Math.min(...uniqueTiers)}-${Math.max(...uniqueTiers)}`
                      })()}
                    </div>
                    <div style={{
                      fontSize: '0.8rem',
                      color: 'var(--text-primary)',
                      marginBottom: '0.25rem'
                    }}>
                      Party Size: {encounter.partySize || 4}
                    </div>
                    <div style={{
                      fontSize: '0.8rem',
                      color: 'var(--text-primary)'
                    }}>
                      Balance: {(() => {
                        const partySize = encounter.partySize || 4
                        const baseBattlePoints = (3 * partySize) + 2
                        
                        // Calculate automatic adjustments (same logic as EncounterBuilder)
                        let automaticAdjustments = 0
                        const encounterItems = encounter.encounterItems || []
                        
                        // Check for 2 or more Solo adversaries
                        const soloCount = encounterItems
                          .filter(item => item.type === 'adversary' && item.item.type === 'Solo' && item.quantity > 0)
                          .reduce((sum, item) => sum + item.quantity, 0)
                        if (soloCount >= 2) {
                          automaticAdjustments += BATTLE_POINT_ADJUSTMENTS.twoOrMoreSolos
                        }
                        
                        // Check if no Bruisers, Hordes, Leaders, or Solos
                        const hasBruisers = encounterItems.some(item => 
                          item.type === 'adversary' && item.item.type === 'Bruiser' && item.quantity > 0
                        )
                        const hasHordes = encounterItems.some(item => 
                          item.type === 'adversary' && item.item.type === 'Horde' && item.quantity > 0
                        )
                        const hasLeaders = encounterItems.some(item => 
                          item.type === 'adversary' && item.item.type === 'Leader' && item.quantity > 0
                        )
                        const hasSolos = encounterItems.some(item => 
                          item.type === 'adversary' && item.item.type === 'Solo' && item.quantity > 0
                        )
                        
                        if (!hasBruisers && !hasHordes && !hasLeaders && !hasSolos) {
                          automaticAdjustments += BATTLE_POINT_ADJUSTMENTS.noBruisersHordesLeadersSolos
                        }
                        
                        const availableBattlePoints = baseBattlePoints + automaticAdjustments
                        
                        const spentBattlePoints = encounterItems.reduce((total, item) => {
                          if (item.type === 'adversary') {
                            const cost = BATTLE_POINT_COSTS[item.item.type] || 2
                            if (item.item.type === 'Minion') {
                              const groups = Math.ceil(item.quantity / partySize)
                              return total + (groups * cost)
                            } else {
                              return total + (item.quantity * cost)
                            }
                          }
                          return total
                        }, 0)
                        
                        if (spentBattlePoints > availableBattlePoints) {
                          return `+${spentBattlePoints - availableBattlePoints}`
                        } else if (spentBattlePoints === availableBattlePoints) {
                          return '0'
                        } else {
                          return `-${availableBattlePoints - spentBattlePoints}`
                        }
                      })()}
                    </div>
                  </div>
                  
                  {/* Encounter Name */}
                  <div style={{ 
                    minWidth: '120px',
                    borderRight: '1px solid var(--text-secondary)',
                    paddingRight: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    minHeight: '60px'
                  }}>
                    <div style={{
                      fontWeight: '500',
                      color: 'var(--text-primary)',
                      fontSize: '0.9rem',
                      wordWrap: 'break-word',
                      wordBreak: 'break-word',
                      width: '150px',
                      maxWidth: '150px'
                    }}>
                      {encounter.name}
                    </div>
                  </div>
                  
                  {/* Adversary List */}
                  <AdversaryList encounter={encounter} />
                  
                  {/* Delete Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation() // Prevent card click
                      handleDeleteClick(encounter.id)
                    }}
                    style={{
                      background: deleteConfirmations[encounter.id] ? 'var(--danger)' : 'var(--gray-600)',
                      border: 'none',
                      color: 'white',
                      padding: '0.4rem 0.8rem',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      minWidth: '60px',
                      transition: 'background-color 0.2s'
                    }}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'custom' && (
        <CustomAdversaryCreator 
          onSave={addCustomAdversary}
          onRefresh={refreshData}
        />
      )}
    </div>
    
    {/* Adversary Card Modal */}
    {selectedAdversary && (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(8px)',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem'
      }}
      onClick={() => setSelectedAdversary(null)}
      >
        <div 
          style={{
            maxWidth: '600px',
            width: '90vw',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <GameCard
            item={selectedAdversary}
            type="adversary"
            mode="expanded"
            onClose={() => setSelectedAdversary(null)}
          />
        </div>
      </div>
    )}
    </>
  )
}

// All styles in one place - comprehensive styles from all CSS files
const styles = {
  browserWrapper: {
    display: 'flex',
    flexDirection: 'column',
    background: 'var(--bg-primary)',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border)',
    overflow: 'hidden',
    height: '100%',
    width: '100%', // Ensure wrapper uses full width
    position: 'relative' // Ensure proper positioning context
  },
  browserWrapperNoContainer: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    height: '100%',
    width: '100%',
    position: 'relative'
  },
  browserContent: {
    flex: 1,
    overflowY: 'auto',
    overflowX: 'visible',
    padding: 0,
    width: '100%', // Ensure content uses full width
    scrollbarWidth: 'none', // Firefox
    msOverflowStyle: 'none' // IE/Edge
  },
  tableHeaderContainer: {
    flexShrink: 0, // Prevent header from shrinking
    position: 'sticky',
    top: 0,
    zIndex: 15,
    backgroundColor: 'var(--bg-secondary)'
  },
  browserTable: {
    width: '100%',
    minWidth: '100%', // Ensure it uses full width
    borderCollapse: 'collapse',
    tableLayout: 'fixed', // Fixed layout for precise control
    background: 'var(--bg-primary)',
    margin: 0
  },
  browserHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px',
    borderBottom: '1px solid var(--border)',
    backgroundColor: 'var(--gray-900)',
    flexShrink: 0, // Prevent header from shrinking
    position: 'sticky',
    top: 0,
    zIndex: 20
  },
  browserTitle: {
    margin: 0,
    color: 'var(--text-primary)',
    fontSize: '18px',
    fontWeight: '600'
  },
  closeButton: {
    background: 'none',
    border: 'none',
    color: 'var(--text-primary)',
    fontSize: '24px',
    cursor: 'pointer',
    padding: '4px 8px',
    borderRadius: '4px',
    transition: 'background-color 0.2s'
  },
  searchInput: {
    flex: 1,
    padding: '8px 12px',
    border: '1px solid var(--border)',
    borderRadius: '4px',
    backgroundColor: 'var(--bg-primary)',
    color: 'var(--text-primary)',
    fontSize: '16px',
    marginRight: '12px',
    transition: 'all 0.2s ease'
  },
  partyControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexShrink: 0
  },
  searchInputFocus: {
    outline: 'none',
    borderColor: 'var(--purple)',
    boxShadow: '0 0 0 3px rgba(139, 92, 246, 0.1)'
  },
  tableHeader: {
    background: 'var(--gray-900)',
    borderBottom: '1px solid var(--border)',
    boxShadow: '0 1px 0 var(--border)',
    position: 'sticky',
    top: '0',
    zIndex: 10
  },
  tableHeaderCell: {
    backgroundColor: 'var(--gray-900)',
    fontWeight: '700',
    borderBottom: '1px solid var(--border)',
    cursor: 'pointer',
    userSelect: 'none',
    minWidth: '100px',
    whiteSpace: 'nowrap',
    padding: '4px 4px', // Reduced padding to match archived version
    color: 'var(--text-primary)',
    textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
    boxShadow: '0 1px 0 var(--border)',
    transition: 'background-color 0.2s',
    position: 'sticky',
    top: '0',
    zIndex: 10
  },
  tableHeaderCellHover: {
    backgroundColor: 'var(--bg-hover)'
  },
  sortIndicator: {
    fontSize: '12px',
    color: 'var(--text-secondary)'
  },
  tableBody: {
    flex: 1,
    overflowY: 'auto',
    padding: '8px',
    backgroundColor: 'var(--bg-primary)'
  },
  row: {
    height: '35px',
    borderBottom: '1px solid var(--border)',
    transition: 'background-color 0.2s ease',
    cursor: 'pointer',
    backgroundColor: 'var(--gray-900)'
  },
  rowHover: {
    backgroundColor: 'var(--bg-secondary)'
  },
  expandedRow: {
    backgroundColor: 'var(--bg-secondary)'
  },
  rowCell: {
    padding: '4px 4px', // Reduced padding to match archived version
    verticalAlign: 'middle',
    color: 'var(--text-primary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    borderBottom: '1px solid var(--border)'
  },
  rowCellName: {
    fontWeight: '500',
    minWidth: '150px'
  },
  rowCellCenter: {
    textAlign: 'center',
    justifyContent: 'center',
    minWidth: '80px'
  },
  rowActions: {
    width: '80px',
    textAlign: 'center',
    padding: '4px 8px',
    borderBottom: '1px solid var(--border)'
  },
  addButton: {
    width: '2rem', // Increased from 1.5rem to 2rem (32px) for better tap target
    height: '2rem', // Increased from 1.5rem to 2rem (32px) for better tap target
    border: '1px solid var(--purple)',
    borderRadius: 'var(--radius-sm)',
    background: 'var(--purple)',
    color: 'white',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px', // Increased from 14px to 16px
    fontWeight: '500'
  },
  expandedContent: {
    padding: '0',
    backgroundColor: 'var(--bg-secondary)',
    borderBottom: '1px solid var(--border)'
  },
  // Column-specific widths (matching archived version)
  columnName: {
    width: 'auto', // Name column gets remaining space
    minWidth: '0',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    paddingLeft: '8px', // Increased left padding for name column
    textAlign: 'left'
  },
  columnTier: {
    width: '80px', // Tier column - increased width to accommodate filter button
    textAlign: 'center',
    overflow: 'visible', // Don't hide text
    textOverflow: 'unset' // No ellipsis for text
  },
  columnType: {
    width: '100px', // Type column - fit "Type" header
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    textAlign: 'center' // Center the type content
  },
  columnDifficulty: {
    width: '40px', // Diff column - minimal width for "Diff" header
    textAlign: 'center',
    overflow: 'visible', // Don't hide text
    textOverflow: 'unset' // No ellipsis for text
  },
  columnAction: {
    width: '32px', // Add button column - increased to accommodate 32px button
    minWidth: '24px',
    maxWidth: '24px',
    textAlign: 'center',
    padding: '0', // Remove cell padding
    margin: '0', // Remove cell margins
    border: 'none', // Remove cell borders
    verticalAlign: 'middle',
    color: 'var(--text-primary)',
    whiteSpace: 'nowrap',
    overflow: 'visible',
    textOverflow: 'unset'
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '200px',
    color: 'var(--text-primary)',
    fontSize: '16px'
  },
  // Mobile responsive styles
  mobileBrowser: {
    width: '95vw',
    height: '90vh',
    maxWidth: 'none'
  },
  mobileSearchInput: {
    fontSize: '16px' // Prevent zoom on iOS
  },
  // Filter dropdown styles
  headerWithFilter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0px',
    position: 'relative'
  },
  headerFilterIcon: {
    background: 'none',
    border: 'none',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    padding: '2px 4px',
    borderRadius: 'var(--radius-sm)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
    position: 'relative',
    marginLeft: '-2px'
  },
  headerFilterIconActive: {
    color: 'var(--purple)'
  },
  filterIcon: {
    fontSize: '12px'
  },
  filterActiveDot: {
    position: 'absolute',
    left: '50%',
    top: '2px',
    transform: 'translateX(-50%)',
    width: '4px',
    height: '4px',
    borderRadius: '50%',
    background: 'var(--purple)',
    pointerEvents: 'none'
  },
  filterDropdown: {
    position: 'fixed',
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
    zIndex: 99999,
    marginTop: '4px',
    overflow: 'hidden',
    width: 'max-content',
    minWidth: '120px',
    maxWidth: '200px'
  },
  filterOption: {
    padding: '8px 12px',
    cursor: 'pointer',
    color: 'var(--text-primary)',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    transition: 'background-color 0.2s ease',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  filterOptionSelected: {
    backgroundColor: 'var(--bg-hover)'
  },
  checkIcon: {
    width: '16px',
    height: '16px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--text-secondary)',
    fontSize: '12px'
  },
  filterLabel: {
    flex: 1
  }
}

// Export custom content management functions
export { 
  addCustomAdversary, 
  addCustomEnvironment, 
  updateCustomContent, 
  deleteCustomContent,
  loadCustomContent,
  saveCustomContent,
  addPlaytestAdversary,
  addPlaytestEnvironment
}

export default Browser