import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react'
import GameCard from './GameCard'
import FeaturesSection from './GameCard/FeaturesSection'
import ExperienceSection from './GameCard/ExperienceSection'
import { getDefaultAdversaryValues } from './adversaryDefaults'
import { getGuideRange, guideRanges, formatRange, formatAtkRange, isInRange, getDamagePools } from './adversaryGuideRanges'
import { typeGuide, stressFearGuide } from './adversaryTypeGuide'

// Load adversary data for autocomplete
let adversariesData = { adversaries: [] }
let _dataLoaded = false

const loadData = async () => {
  if (_dataLoaded) return

  let officialAdversaries = { adversaries: [] }
  let playtestAdv = { adversaries: [] }

  try {
    const mod = await import(/* @vite-ignore */ './adversaries.json')
    officialAdversaries = mod?.default || mod
  } catch (e) {
    console.warn('Failed to load adversaries.json:', e)
  }

  try {
    const mod = await import(/* @vite-ignore */ './playtest-adversaries.json')
    playtestAdv = mod?.default || mod
  } catch (e) {
    console.warn('Failed to load playtest-adversaries.json:', e)
  }

  adversariesData = {
    adversaries: [
      ...(officialAdversaries.adversaries || []),
      ...(playtestAdv.adversaries || []),
    ],
  }
  _dataLoaded = true
}

// ─── Shared style helpers ───────────────────────────────────────────────────

const inputStyle = {
  width: '100%',
  padding: '0.4rem 0.6rem',
  border: '1px solid var(--border)',
  borderRadius: '5px',
  backgroundColor: 'var(--bg-secondary)',
  color: 'var(--text-primary)',
  fontSize: '0.875rem',
  outline: 'none',
  boxSizing: 'border-box',
}

const labelStyle = {
  fontSize: '0.7rem',
  fontWeight: '600',
  color: 'var(--text-secondary)',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  marginBottom: '0.3rem',
  display: 'block',
}

const sectionStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.3rem',
}

const TYPES = ['Standard', 'Bruiser', 'Horde', 'Leader', 'Minion', 'Ranged', 'Skulk', 'Solo', 'Support', 'Social']

// ─── Main component ──────────────────────────────────────────────────────────

const CustomAdversaryCreator = forwardRef(({
  onSave,
  onRefresh,
  onAddItem,
  editingAdversary,
  onCancelEdit,
  isStockAdversary = false,
  autoFocus = false,
  allAdversaries = [],
  embedded = false,
  hideEmbeddedButtons = false,
}, ref) => {
  const nameInputRef = useRef(null)
  const gameCardNameInputRef = useRef(null)

  const [formData, setFormData] = useState(() => {
    const defaults = getDefaultAdversaryValues(1, 'Standard')
    return {
      name: '', tier: 1, type: 'Standard',
      description: '', motives: '',
      difficulty: defaults.difficulty,
      thresholds: defaults.thresholds,
      hpMax: defaults.hpMax,
      stressMax: defaults.stressMax,
      atk: defaults.atk,
      weapon: '', range: defaults.range, damage: defaults.damage,
      experience: [], features: [],
    }
  })

  const [isSaving, setIsSaving] = useState(false)
  const [statsPulledFromExisting, setStatsPulledFromExisting] = useState(false)
  const [nameSuggestions, setNameSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [adversaryData, setAdversaryData] = useState([])
  const [deleteConfirmations, setDeleteConfirmations] = useState({})

  // ── Data loading ────────────────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      await loadData()
      if (allAdversaries.length > 0) {
        setAdversaryData(allAdversaries)
      } else {
        setAdversaryData(adversariesData.adversaries || [])
      }
    }
    init()
  }, [allAdversaries])

  // ── Auto-focus ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (autoFocus) {
      setTimeout(() => {
        if (editingAdversary && gameCardNameInputRef.current) {
          gameCardNameInputRef.current?.focus()
          gameCardNameInputRef.current?.select()
        } else if (nameInputRef.current) {
          nameInputRef.current?.focus()
        }
      }, 650)
    }
  }, [autoFocus, editingAdversary])

  // ── Initialize from editingAdversary ────────────────────────────────────────
  useEffect(() => {
    if (editingAdversary) {
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
        features: editingAdversary.features || [],
      })
      setStatsPulledFromExisting(false)
    } else {
      const defaults = getDefaultAdversaryValues(1, 'Standard')
      setFormData({
        name: '', tier: 1, type: 'Standard',
        description: '', motives: '',
        difficulty: defaults.difficulty,
        thresholds: defaults.thresholds,
        hpMax: defaults.hpMax, stressMax: defaults.stressMax,
        atk: defaults.atk, weapon: '', range: defaults.range, damage: defaults.damage,
        experience: [], features: [],
      })
      setStatsPulledFromExisting(false)
    }
  }, [editingAdversary])

  // ── Auto-fill defaults when tier/type change (new adversary only) ───────────
  useEffect(() => {
    if (!editingAdversary && !statsPulledFromExisting) {
      const d = getDefaultAdversaryValues(formData.tier, formData.type)
      setFormData(prev => ({
        ...prev,
        difficulty: d.difficulty, thresholds: d.thresholds,
        hpMax: d.hpMax, stressMax: d.stressMax,
        atk: d.atk, range: d.range, damage: d.damage,
      }))
    }
  }, [formData.tier, formData.type, editingAdversary, statsPulledFromExisting])

  // ── Autocomplete ────────────────────────────────────────────────────────────
  const handleNameChange = (value) => {
    setFormData(prev => ({ ...prev, name: value }))
    if (value.trim().length > 0) {
      const matches = adversaryData
        .filter(adv => {
          const base = adv.name?.replace(/\s+\(\d+\)$/, '') || adv.name || ''
          return base.toLowerCase().includes(value.toLowerCase())
        })
        .slice(0, 5)
      setNameSuggestions(matches)
      setShowSuggestions(matches.length > 0)
    } else {
      setNameSuggestions([])
      setShowSuggestions(false)
      setStatsPulledFromExisting(false)
    }
  }

  // Task #5 fix: pull ALL fields from template adversary
  const handleSelectAdversary = (adv) => {
    const baseName = adv.baseName || adv.name?.replace(/\s+\(\d+\)$/, '') || adv.name || ''
    setFormData(prev => ({
      ...prev,
      name: baseName,
      tier: adv.tier || prev.tier,
      type: adv.type || prev.type,
      description: adv.description || prev.description,
      motives: adv.motives || prev.motives,
      difficulty: adv.difficulty || prev.difficulty,
      thresholds: adv.thresholds || prev.thresholds,
      hpMax: adv.hpMax || prev.hpMax,
      stressMax: adv.stressMax || prev.stressMax,
      atk: adv.atk !== undefined ? adv.atk : prev.atk,
      weapon: adv.weapon || prev.weapon,
      range: adv.range || prev.range,
      damage: adv.damage || prev.damage,
      experience: adv.experience ? [...adv.experience] : prev.experience,
      features: adv.features ? [...adv.features] : prev.features,
    }))
    setStatsPulledFromExisting(true)
    setNameSuggestions([])
    setShowSuggestions(false)
    nameInputRef.current?.focus()
  }

  // ── Feature delete helpers (for form-level FeaturesSection) ─────────────────
  const getFeatureKey = (feature) => {
    const typeFeatures = (formData.features || []).filter(f => f.type === feature.type)
    const idx = typeFeatures.findIndex(f => f === feature)
    return `${feature.type}-${idx}-${feature.name || 'blank'}`
  }

  const handleFeatureDeleteClick = (featureToDelete) => {
    const key = getFeatureKey(featureToDelete)
    if (deleteConfirmations[key]) {
      setFormData(prev => ({ ...prev, features: prev.features.filter(f => f !== featureToDelete) }))
      setDeleteConfirmations(prev => { const n = { ...prev }; delete n[key]; return n })
    } else {
      setDeleteConfirmations(prev => ({ ...prev, [key]: true }))
      setTimeout(() => setDeleteConfirmations(prev => { const n = { ...prev }; delete n[key]; return n }), 3000)
    }
  }

  // onUpdate adapter for FeaturesSection / ExperienceSection
  const handleFormUpdate = (_id, updates) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  // ── Save logic ──────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!formData.name.trim()) return

    setIsSaving(true)
    try {
      const filterBlank = (exps) =>
        (exps || []).filter(e => (e.name && e.name.trim() !== '') || (e.modifier !== undefined && e.modifier !== 0))

      const baseName = formData.name.trim()
      const data = {
        ...formData,
        baseName,
        name: baseName,
        experience: filterBlank(formData.experience),
        hp: editingAdversary ? editingAdversary.hp : 0,
        stress: editingAdversary ? editingAdversary.stress : 0,
        source: 'Homebrew',
      }

      if (editingAdversary) {
        if (isStockAdversary) {
          const { id, name, ...dataToSave } = data
          await onSave(dataToSave)
        } else {
          await onSave({ ...data, name: data.baseName }, editingAdversary.id)
        }
        onCancelEdit?.()
      } else {
        await onSave(data)
        if (onRefresh) await onRefresh()
        const defaults = getDefaultAdversaryValues(1, 'Standard')
        setFormData({
          name: '', tier: 1, type: 'Standard',
          description: '', motives: '',
          difficulty: defaults.difficulty, thresholds: defaults.thresholds,
          hpMax: defaults.hpMax, stressMax: defaults.stressMax,
          atk: defaults.atk, weapon: '', range: defaults.range, damage: defaults.damage,
          experience: [], features: [],
        })
        setStatsPulledFromExisting(false)
      }
    } catch (err) {
      console.error('Error saving adversary:', err)
    } finally {
      setIsSaving(false)
    }
  }

  useImperativeHandle(ref, () => ({
    handleSave,
    isSaving,
    canSave: formData.name.trim().length > 0,
  }))

  const getSaveButtonText = () => {
    if (isSaving) return editingAdversary ? (isStockAdversary ? 'Creating...' : 'Saving...') : 'Creating...'
    if (editingAdversary) return isStockAdversary ? 'Save As Custom' : 'Save'
    return 'Create'
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // THREE-PANEL LAYOUT (embedded={false})
  // Left: card preview  |  Center: form  |  Right: guidance
  // ─────────────────────────────────────────────────────────────────────────────

  if (!embedded) {
    const guideRange = getGuideRange(formData.type, formData.tier)
    const isMinion = formData.type === 'Minion'
    const guide = typeGuide[formData.type]

    const formItem = { ...formData, id: 'creator-form', hp: 0, stress: 0, source: 'Homebrew' }
    const previewInstances = [{ ...formItem }]

    // Stat stepper: [−] [editable value] [+] with guide range hint and out-of-range highlight
    const StatField = ({ label, field, subfield, rangeKey, disabled }) => {
      const raw = subfield ? formData[field]?.[subfield] : formData[field]
      const range = guideRange?.[rangeKey]
      const outOfRange = !disabled && !isInRange(raw, range)
      const color = disabled ? 'var(--text-secondary)' : outOfRange ? 'var(--orange, #e67e22)' : 'var(--border)'

      const set = (val) => {
        if (subfield) {
          setFormData(prev => ({ ...prev, [field]: { ...prev[field], [subfield]: val } }))
        } else {
          setFormData(prev => ({ ...prev, [field]: val }))
        }
      }

      const stepBtn = (delta) => (
        <button
          type="button"
          disabled={disabled}
          onClick={() => set((parseInt(raw) || 0) + delta)}
          style={{
            width: '26px', height: '26px', flexShrink: 0,
            border: `1px solid ${color}`,
            borderRadius: delta < 0 ? '4px 0 0 4px' : '0 4px 4px 0',
            background: 'var(--bg-secondary)',
            color: disabled ? 'var(--text-secondary)' : 'var(--text-primary)',
            fontSize: '1rem', lineHeight: 1, cursor: disabled ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: disabled ? 0.4 : 1,
          }}
        >{delta < 0 ? '−' : '+'}</button>
      )

      return (
        <div style={sectionStyle}>
          <label style={labelStyle}>{label}</label>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {stepBtn(-1)}
            <input
              type="number"
              value={raw ?? ''}
              disabled={disabled}
              onChange={e => set(e.target.value === '' ? '' : parseInt(e.target.value) || 0)}
              style={{
                ...inputStyle,
                borderRadius: 0,
                borderLeft: 'none', borderRight: 'none',
                textAlign: 'center',
                opacity: disabled ? 0.4 : 1,
                borderColor: color,
                width: '100%',
                minWidth: 0,
              }}
            />
            {stepBtn(1)}
          </div>
          {range && !disabled && (
            <span style={{ fontSize: '0.68rem', color: outOfRange ? 'var(--orange, #e67e22)' : 'var(--text-secondary)', marginTop: '1px' }}>
              {formatRange(range)}
            </span>
          )}
        </div>
      )
    }

    // Guidance section heading
    const GuidanceHeading = ({ children }) => (
      <div style={{
        fontSize: '0.68rem', fontWeight: '700', color: 'var(--text-secondary)',
        textTransform: 'uppercase', letterSpacing: '0.6px',
        paddingBottom: '0.3rem', borderBottom: '1px solid var(--border)',
        marginBottom: '0.5rem',
      }}>
        {children}
      </div>
    )

    return (
      <div style={{ display: 'flex', height: '100%', minHeight: 0, overflow: 'hidden' }}>

        {/* ── LEFT: Card Preview ────────────────────────────────────────────── */}
        <div style={{
          width: '340px', flexShrink: 0,
          overflowY: 'auto', borderRight: '1px solid var(--border)',
          padding: '0.75rem', boxSizing: 'border-box',
        }}>
          <GameCard
            item={formItem}
            type="adversary"
            mode="expanded"
            instances={previewInstances}
            showAddRemoveButtons={false}
            onUpdate={() => {}}
          />
        </div>

        {/* ── CENTER: Form ──────────────────────────────────────────────────── */}
        <div style={{ flex: 1, overflowY: 'auto', minHeight: 0, borderRight: '1px solid var(--border)' }}>
          <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem' }}>
              <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                {editingAdversary ? (isStockAdversary ? 'Edit (Save As Custom)' : 'Edit Adversary') : 'Create Adversary'}
              </h2>
              <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                {onCancelEdit && (
                  <button onClick={onCancelEdit} style={{
                    padding: '0.4rem 0.875rem', background: 'transparent',
                    border: '1px solid var(--border)', borderRadius: '5px',
                    color: 'var(--text-primary)', fontSize: '0.875rem', cursor: 'pointer',
                  }}>Cancel</button>
                )}
                <button
                  onClick={handleSave}
                  disabled={isSaving || !formData.name.trim()}
                  style={{
                    padding: '0.4rem 1rem',
                    background: isSaving || !formData.name.trim() ? 'var(--gray-600)' : 'var(--purple)',
                    border: 'none', borderRadius: '5px', color: 'white',
                    fontSize: '0.875rem', fontWeight: '600',
                    cursor: isSaving || !formData.name.trim() ? 'not-allowed' : 'pointer',
                    opacity: isSaving || !formData.name.trim() ? 0.6 : 1,
                  }}
                >{getSaveButtonText()}</button>
              </div>
            </div>

            {/* Name */}
            <div style={{ ...sectionStyle, position: 'relative' }}>
              <label style={labelStyle}>Name</label>
              <input
                ref={nameInputRef}
                type="text"
                value={formData.name}
                onChange={e => handleNameChange(e.target.value)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                placeholder="Adversary name — or search to import from an existing one"
                style={inputStyle}
              />
              {showSuggestions && nameSuggestions.length > 0 && (
                <div style={{
                  position: 'absolute', top: '100%', left: 0, right: 0,
                  backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border)',
                  borderTop: 'none', borderRadius: '0 0 6px 6px',
                  maxHeight: '180px', overflowY: 'auto', zIndex: 100,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                }}>
                  {nameSuggestions.map((adv, idx) => {
                    const base = adv.baseName || adv.name?.replace(/\s+\(\d+\)$/, '') || adv.name
                    return (
                      <div
                        key={idx}
                        onMouseDown={e => e.preventDefault()}
                        onClick={() => handleSelectAdversary(adv)}
                        style={{
                          padding: '0.5rem 0.75rem', cursor: 'pointer',
                          borderBottom: idx < nameSuggestions.length - 1 ? '1px solid var(--border)' : 'none',
                        }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{base}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{adv.type} · Tier {adv.tier}</div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Tier + Type */}
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <div style={sectionStyle}>
                <label style={labelStyle}>Tier</label>
                <div style={{ display: 'flex', gap: '0.3rem' }}>
                  {[1, 2, 3, 4].map(t => (
                    <button key={t} onClick={() => setFormData(prev => ({ ...prev, tier: t }))} style={{
                      width: '34px', height: '34px', border: '1px solid var(--border)', borderRadius: '5px',
                      background: formData.tier === t ? 'var(--purple)' : 'var(--bg-secondary)',
                      color: formData.tier === t ? 'white' : 'var(--text-primary)',
                      fontWeight: formData.tier === t ? '700' : '400',
                      fontSize: '0.875rem', cursor: 'pointer',
                    }}>{t}</button>
                  ))}
                </div>
              </div>
              <div style={{ ...sectionStyle, flex: 1 }}>
                <label style={labelStyle}>Type</label>
                <select
                  value={formData.type}
                  onChange={e => setFormData(prev => ({ ...prev, type: e.target.value }))}
                  style={{ ...inputStyle, height: '34px' }}
                >
                  {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            {/* Combat Stats */}
            <div style={sectionStyle}>
              <label style={{ ...labelStyle, marginBottom: '0.5rem' }}>Combat Stats</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                <StatField label="Difficulty" field="difficulty" rangeKey="difficulty" />
                <StatField label="Major Threshold" field="thresholds" subfield="major" rangeKey="major" disabled={isMinion} />
                <StatField label="Severe Threshold" field="thresholds" subfield="severe" rangeKey="severe" disabled={isMinion} />
                <StatField label="HP Max" field="hpMax" rangeKey="hp" />
                <StatField label="Stress Max" field="stressMax" rangeKey="stress" />
                <StatField label="ATK Modifier" field="atk" rangeKey="atk" />
              </div>
            </div>

            {/* Standard Attack */}
            <div style={sectionStyle}>
              <label style={{ ...labelStyle, marginBottom: '0.5rem' }}>Standard Attack</label>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '0.5rem' }}>
                <div style={sectionStyle}>
                  <label style={labelStyle}>Weapon / Attack name</label>
                  <input type="text" value={formData.weapon}
                    onChange={e => setFormData(prev => ({ ...prev, weapon: e.target.value }))}
                    placeholder="e.g. Greataxe" style={inputStyle} />
                </div>
                <div style={sectionStyle}>
                  <label style={labelStyle}>Range</label>
                  <select value={formData.range}
                    onChange={e => setFormData(prev => ({ ...prev, range: e.target.value }))}
                    style={inputStyle}>
                    {['Melee', 'Very Close', 'Close', 'Far', 'Very Far'].map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div style={sectionStyle}>
                  <label style={labelStyle}>Damage</label>
                  <input type="text" value={formData.damage}
                    onChange={e => setFormData(prev => ({ ...prev, damage: e.target.value }))}
                    placeholder="e.g. 1d8+2" style={inputStyle} />
                  {(() => {
                    const pools = getDamagePools(formData.type, formData.tier)
                    if (!pools) return null
                    return (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginTop: '0.3rem' }}>
                        {pools.map((pool, i) => {
                          const active = formData.damage === pool
                          return (
                            <button
                              key={i}
                              type="button"
                              onClick={() => setFormData(prev => ({ ...prev, damage: pool }))}
                              style={{
                                padding: '0.15rem 0.45rem',
                                background: active ? 'var(--purple)' : 'var(--bg-secondary)',
                                border: `1px solid ${active ? 'var(--purple)' : 'var(--border)'}`,
                                borderRadius: '4px',
                                color: active ? 'white' : 'var(--text-secondary)',
                                fontSize: '0.72rem',
                                fontFamily: 'monospace',
                                cursor: 'pointer',
                                transition: 'all 0.1s ease',
                              }}
                            >
                              {pool}
                            </button>
                          )
                        })}
                      </div>
                    )
                  })()}
                </div>
              </div>
            </div>

            {/* Description + Motives */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div style={sectionStyle}>
                <label style={labelStyle}>Description</label>
                <textarea value={formData.description}
                  onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Appearance and background..." rows={3}
                  style={{ ...inputStyle, resize: 'vertical', minHeight: '72px', fontFamily: 'inherit' }} />
              </div>
              <div style={sectionStyle}>
                <label style={labelStyle}>Motives & Tactics</label>
                <textarea value={formData.motives}
                  onChange={e => setFormData(prev => ({ ...prev, motives: e.target.value }))}
                  placeholder="What drives them, how they fight..." rows={3}
                  style={{ ...inputStyle, resize: 'vertical', minHeight: '72px', fontFamily: 'inherit' }} />
              </div>
            </div>

            {/* Experiences */}
            <div style={sectionStyle}>
              <label style={{ ...labelStyle, marginBottom: '0.5rem' }}>Experiences</label>
              <ExperienceSection
                item={formItem} isEditMode={true} onUpdate={handleFormUpdate}
                deleteConfirmations={deleteConfirmations} setDeleteConfirmations={setDeleteConfirmations}
              />
            </div>

            {/* Features */}
            <div style={{ ...sectionStyle, paddingBottom: '1rem' }}>
              <label style={{ ...labelStyle, marginBottom: '0.5rem' }}>Features</label>
              <FeaturesSection
                item={formItem} isEditMode={true} onUpdate={handleFormUpdate}
                handleFeatureDeleteClick={handleFeatureDeleteClick}
                deleteConfirmations={deleteConfirmations} getFeatureKey={getFeatureKey}
              />
            </div>

          </div>
        </div>

        {/* ── RIGHT: Guidance ───────────────────────────────────────────────── */}
        <div style={{
          width: '280px', flexShrink: 0,
          overflowY: 'auto', padding: '1rem',
          boxSizing: 'border-box',
          display: 'flex', flexDirection: 'column', gap: '1.25rem',
          fontSize: '0.8rem', lineHeight: 1.5, color: 'var(--text-secondary)',
        }}>

          {/* Role overview */}
          {guide && (
            <div>
              <GuidanceHeading>{formData.type}</GuidanceHeading>
              <p style={{ margin: '0 0 0.5rem' }}>{guide.summary}</p>
              {guide.damageDie && (
                <p style={{ margin: 0 }}>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Damage die: </span>
                  {guide.damageDie}
                </p>
              )}
              {guide.notes && (
                <p style={{ margin: '0.4rem 0 0', fontStyle: 'italic' }}>{guide.notes}</p>
              )}
            </div>
          )}

          {/* Stat ranges — all four tiers for the current type */}
          <div>
            <GuidanceHeading>Stat Ranges</GuidanceHeading>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
              <thead>
                <tr>
                  {['T', 'Diff', 'Maj', 'Sev', 'HP', 'Str', 'ATK'].map(h => (
                    <th key={h} style={{
                      textAlign: 'left', paddingBottom: '0.25rem',
                      color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.68rem',
                      borderBottom: '1px solid var(--border)',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4].map(t => {
                  const r = guideRanges[formData.type]?.[t]
                  if (!r) return null
                  const isCurrentTier = t === formData.tier
                  const cellStyle = {
                    padding: '0.2rem 0.1rem',
                    color: isCurrentTier ? 'var(--text-primary)' : 'var(--text-secondary)',
                    fontWeight: isCurrentTier ? 600 : 400,
                    backgroundColor: isCurrentTier ? 'color-mix(in srgb, var(--purple) 12%, transparent)' : 'transparent',
                  }
                  return (
                    <tr key={t}>
                      <td style={{ ...cellStyle, borderRadius: '3px 0 0 3px' }}>{t}</td>
                      <td style={cellStyle}>{formatRange(r.difficulty)}</td>
                      <td style={cellStyle}>{r.major ? formatRange(r.major) : '—'}</td>
                      <td style={cellStyle}>{r.severe ? formatRange(r.severe) : '—'}</td>
                      <td style={cellStyle}>{formatRange(r.hp)}</td>
                      <td style={cellStyle}>{formatRange(r.stress)}</td>
                      <td style={{ ...cellStyle, borderRadius: '0 3px 3px 0' }}>{formatAtkRange(r.atk)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Suggested experiences */}
          {guide?.experiences?.length > 0 && (
            <div>
              <GuidanceHeading>Suggested Experiences</GuidanceHeading>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                {guide.experiences.map((exp, i) => (
                  <span key={i} style={{
                    padding: '0.15rem 0.5rem',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border)',
                    borderRadius: '4px', fontSize: '0.75rem',
                    color: 'var(--text-primary)',
                  }}>{exp}</span>
                ))}
              </div>
            </div>
          )}

          {/* Common features */}
          {guide?.features?.length > 0 && (
            <div>
              <GuidanceHeading>Common Features</GuidanceHeading>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {guide.features.map((f, i) => (
                  <div key={i}>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.78rem' }}>
                      {f.name}
                      <span style={{ fontWeight: 400, color: 'var(--text-secondary)', marginLeft: '0.4rem', fontSize: '0.72rem' }}>
                        {f.type}
                      </span>
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '0.1rem' }}>{f.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* When to use Stress / Fear */}
          <div>
            <GuidanceHeading>Mark Stress to…</GuidanceHeading>
            <ul style={{ margin: 0, paddingLeft: '1.1rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
              {stressFearGuide.stress.map((s, i) => <li key={i}>{s}</li>)}
            </ul>
          </div>

          <div>
            <GuidanceHeading>Spend Fear to…</GuidanceHeading>
            <ul style={{ margin: 0, paddingLeft: '1.1rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
              {stressFearGuide.fear.map((f, i) => <li key={i}>{f}</li>)}
            </ul>
          </div>

          <div style={{ padding: '0.5rem 0.6rem', background: 'var(--bg-secondary)', borderRadius: '5px', fontSize: '0.75rem', fontStyle: 'italic' }}>
            <span style={{ fontWeight: 600, fontStyle: 'normal', color: 'var(--text-primary)' }}>Momentum + Fear: </span>
            {stressFearGuide.momentumNote}
          </div>

        </div>

      </div>
    )
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // EMBEDDED LAYOUT (inside a GameCard via showCustomCreator)
  // ─────────────────────────────────────────────────────────────────────────────

  const mockAdversary = { ...formData, id: 'new-adversary', hp: 0, stress: 0, source: 'Homebrew' }

  return (
    <>
      {!hideEmbeddedButtons && (
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          marginBottom: '0.5rem',
          padding: '0.5rem',
          borderBottom: '1px solid var(--border)',
          gap: '0.5rem',
        }}>
          <button
            onClick={handleSave}
            disabled={isSaving || !formData.name.trim()}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: isSaving || !formData.name.trim() ? 'var(--gray-600)' : 'var(--purple)',
              border: 'none', color: 'white', borderRadius: '6px',
              cursor: isSaving || !formData.name.trim() ? 'not-allowed' : 'pointer',
              fontSize: '0.875rem', fontWeight: '600',
              opacity: isSaving || !formData.name.trim() ? 0.6 : 1,
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
                borderRadius: '6px', cursor: 'pointer',
                fontSize: '0.875rem', fontWeight: '600',
              }}
            >
              Cancel
            </button>
          )}
        </div>
      )}

      {!editingAdversary && (
        <div style={{ marginBottom: '1rem', position: 'relative' }}>
          <input
            ref={nameInputRef}
            type="text"
            value={formData.name}
            onChange={e => handleNameChange(e.target.value)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            placeholder="Adversary name"
            style={{
              width: '100%', padding: '0.75rem',
              border: '1px solid var(--border)', borderRadius: '8px',
              backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)',
              fontSize: '1rem', outline: 'none',
            }}
          />
          {showSuggestions && nameSuggestions.length > 0 && (
            <div style={{
              position: 'absolute', top: '100%', left: 0, right: 0,
              backgroundColor: 'var(--bg-primary)',
              border: '1px solid var(--border)',
              borderRadius: '0 0 8px 8px', borderTop: 'none',
              maxHeight: '200px', overflowY: 'auto',
              zIndex: 1000, boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            }}>
              {nameSuggestions.map((adv, idx) => {
                const base = adv.baseName || adv.name?.replace(/\s+\(\d+\)$/, '') || adv.name
                return (
                  <div
                    key={idx}
                    onMouseDown={e => e.preventDefault()}
                    onClick={() => handleSelectAdversary(adv)}
                    style={{
                      padding: '0.75rem', cursor: 'pointer',
                      borderBottom: idx < nameSuggestions.length - 1 ? '1px solid var(--border)' : 'none',
                    }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <div style={{ fontWeight: 600 }}>{base}</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      {adv.type} · Tier {adv.tier}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      <GameCard
        item={mockAdversary}
        type="adversary"
        mode="edit"
        nameInputRef={editingAdversary ? gameCardNameInputRef : undefined}
        autoFocusNameInput={autoFocus && editingAdversary}
        onUpdate={(id, updates) => setFormData(prev => ({ ...prev, ...updates }))}
      />
    </>
  )
})

CustomAdversaryCreator.displayName = 'CustomAdversaryCreator'
export default CustomAdversaryCreator
