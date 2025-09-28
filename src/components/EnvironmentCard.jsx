import React, { useState } from 'react'
import { Hexagon, Star } from 'lucide-react'

const EnvironmentCard = ({
  item,
  mode = 'expanded',
  onClick,
  onDelete,
  onUpdate,
  instances = [],
  isSelected = false,
  isEditMode = false,
}) => {
  // Hover state management
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseEnter = () => {
    setIsHovered(true)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
  }

  // Styling logic
  const getCardStyle = (isExpanded = false) => {
    let cardStyle = {
      backgroundColor: 'var(--bg-card)',
      borderRadius: '8px',
      padding: '8px',
      cursor: 'pointer',
      transition: 'all 0.1s ease',
      position: 'relative'
    }
    
    if (isSelected) {
      cardStyle.transition = 'none'
    } else {
      cardStyle.transition = isHovered ? 'all 0.1s ease' : 'all 0.3s ease'
    }
    
    if (isExpanded) {
      const { marginTop, ...cardStyleWithoutMargin } = cardStyle
      cardStyle = cardStyleWithoutMargin
    }
    
    if ((isHovered && mode !== 'expanded') || isSelected) {
      cardStyle = { ...cardStyle, backgroundColor: 'var(--bg-card-hover)' }
    }
    
    return cardStyle
  }

  const getCardClassName = () => {
    let className = 'border rounded-lg'
    
    if ((isHovered && mode !== 'expanded') || isSelected) {
      className += ' border-hover'
    }
    
    return className
  }

  const showDrag = false // Temporarily disabled drag handles
  const isEditMode = mode === 'edit'

  return (
    <div 
      className={getCardClassName()}
      style={{
        ...getCardStyle(true),
        padding: 0,
        minHeight: '400px',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative'
      }}
      onClick={onClick}
      {...(mode !== 'expanded' && {
        onMouseEnter: handleMouseEnter,
        onMouseLeave: handleMouseLeave
      })}
    >
      {/* Fixed Header Section */}
      <div className="border-b" style={{
        padding: '8px',
        flexShrink: 0,
        backgroundColor: 'var(--bg-card)',
        borderRadius: '8px 8px 0 0',
        position: 'relative'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          {/* Left side - Name, Type, and Tier */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: '0.25rem'
          }}>
            <h2 style={{
              fontSize: '1rem',
              fontWeight: 600,
              color: 'var(--text-primary)',
              margin: 0
            }}>
              {item.name}
            </h2>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}>
              {item.tier && (
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  color: 'var(--text-secondary)',
                  letterSpacing: '0.5px'
                }}>
                  Tier {item.tier}
                </span>
              )}
              {item.type && (
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  color: 'var(--text-secondary)',
                  letterSpacing: '0.5px'
                }}>
                  {item.type}
                </span>
              )}
            </div>
          </div>

          {/* Right side - Difficulty and Delete */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            {/* Difficulty Badge */}
            {item.difficulty && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
              }}>
                <Hexagon 
                  size={32}
                  strokeWidth={1}
                  style={{
                    color: 'var(--text-secondary)'
                  }}
                />
                <span style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: 'white',
                  pointerEvents: 'none'
                }}>
                  {item.difficulty}
                </span>
              </div>
            )}

            {/* Delete Button */}
            {showDrag && (
              <button
                className="border rounded-sm"
                style={{
                  background: 'var(--red)',
                  borderColor: 'var(--red)',
                  padding: '0.25rem',
                  minWidth: '1.5rem',
                  height: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.1s ease',
                  color: 'white',
                  fontSize: '1rem'
                }}
                onClick={(e) => {
                  e.stopPropagation()
                  e.preventDefault()
                  onDelete && onDelete(item.id)
                }}
                onMouseEnter={(e) => e.target.style.background = 'var(--red-dark)'}
                onMouseLeave={(e) => e.target.style.background = 'var(--red)'}
                title="Delete environment"
              >
                ×
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        borderRadius: '0 0 8px 8px'
      }}>
        {/* Description Section */}
        {item.description && (
          <div style={{
            marginBottom: '1rem',
            padding: '0 8px 0.75rem 8px',
            borderBottom: '1px solid var(--border)'
          }}>
            <h3 style={{
              fontSize: '1rem',
              fontWeight: 600,
              color: 'var(--text-primary)',
              margin: '0 0 0.5rem 0'
            }}>
              Description
            </h3>
            {isEditMode ? (
              <textarea
                style={{
                  width: '100%',
                  minHeight: '100px',
                  padding: '0.5rem',
                  border: '1px solid var(--border)',
                  borderRadius: '0.5rem',
                  backgroundColor: 'var(--bg-secondary)',
                  color: 'white',
                  fontSize: '0.875rem',
                  lineHeight: 1.5,
                  resize: 'vertical',
                  fontFamily: 'inherit'
                }}
                value={item.description}
                onChange={(e) => {
                  onUpdate && onUpdate(item.id, { description: e.target.value })
                }}
                placeholder="Enter environment description..."
              />
            ) : (
              <p style={{
                fontSize: '0.875rem',
                lineHeight: 1.5,
                color: 'var(--text-secondary)',
                margin: 0,
                whiteSpace: 'pre-wrap'
              }}>
                {item.description}
              </p>
            )}
          </div>
        )}

        {/* Impulses Section */}
        {item.impulses && (
          <div style={{
            marginBottom: '1rem',
            padding: '0 8px 0.75rem 8px',
            borderBottom: '1px solid var(--border)'
          }}>
            <h3 style={{
              fontSize: '1rem',
              fontWeight: 600,
              color: 'var(--text-primary)',
              margin: '0 0 0.5rem 0'
            }}>
              Impulses
            </h3>
            <p style={{
              fontSize: '0.875rem',
              lineHeight: 1.5,
              color: 'var(--text-secondary)',
              margin: 0,
              whiteSpace: 'pre-wrap'
            }}>
              {item.impulses}
            </p>
          </div>
        )}

        {/* Core Stats Section */}
        <div style={{
          marginBottom: '1rem',
          padding: '0 8px 0.75rem 8px',
          borderBottom: '1px solid var(--border)'
        }}>
          <h3 style={{
            fontSize: '1rem',
            fontWeight: 600,
            color: 'var(--text-primary)',
            margin: '0 0 0.5rem 0'
          }}>
            Core Stats
          </h3>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            fontSize: '0.875rem'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              flexWrap: 'wrap',
              fontSize: '0.875rem'
            }}>
              {/* Difficulty Hex Badge */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <div style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '32px',
                  height: '32px'
                }}>
                  <Hexagon 
                    size={32} 
                    style={{ 
                      color: 'var(--text-primary)',
                      transform: 'rotate(0deg)'
                    }} 
                  />
                  <span style={{
                    position: 'absolute',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    textAlign: 'center'
                  }}>
                    {item.difficulty || '~'}
                  </span>
                </div>
                <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                  Difficulty
                </span>
              </div>
              <span><strong>Type:</strong> {item.type}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span><strong>Tier:</strong></span>
                {/* Tier in Star */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative'
                }}>
                  <Star 
                    size={32} 
                    strokeWidth={1}
                    style={{
                      color: 'var(--text-secondary)'
                    }}
                  />
                  <span style={{
                    position: 'absolute',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: 'white',
                    pointerEvents: 'none'
                  }}>
                    {item.tier}
                  </span>
                </div>
              </div>
            </div>
            {item.potentialAdversaries && item.potentialAdversaries.length > 0 && (
              <div>
                <strong>Potential Adversaries:</strong>
                <div style={{
                  marginTop: '0.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.125rem'
                }}>
                  {item.potentialAdversaries.map((adversary, index) => (
                    <div key={index} style={{
                      fontSize: '0.75rem',
                      color: 'var(--text-secondary)',
                      marginLeft: '0.5rem'
                    }}>
                      • {adversary}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Features Section - Organized by Type */}
        {item.features && item.features.length > 0 && (
          <div style={{
            marginBottom: '1rem',
            padding: '0 8px'
          }}>
            {/* Passives */}
            {item.features.filter(f => f.type === 'Passive').length > 0 && (
              <div style={{ marginBottom: '1rem' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  marginBottom: '0.75rem'
                }}>
                  <hr style={{
                    flex: 1,
                    border: 'none',
                    borderTop: '1px solid var(--border)',
                    margin: 0
                  }} />
                  <h4 style={{
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: 'white',
                    margin: 0,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    textAlign: 'center',
                    minWidth: '80px'
                  }}>
                    Passives
                  </h4>
                  <hr style={{
                    flex: 1,
                    border: 'none',
                    borderTop: '1px solid var(--border)',
                    margin: 0
                  }} />
                </div>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem'
                }}>
                  {item.features.filter(f => f.type === 'Passive').map((feature, index) => (
                    <div key={index} style={{
                      fontSize: '0.875rem',
                      lineHeight: 1.4,
                      color: 'var(--text-secondary)'
                    }}>
                      <div style={{ 
                        fontWeight: 600, 
                        color: 'white',
                        marginBottom: '0.25rem'
                      }}>
                        {feature.name}
                      </div>
                      <div style={{ marginBottom: '0.25rem' }}>
                        {feature.description}
                      </div>
                      {feature.details && feature.details.length > 0 && (
                        <div style={{ marginLeft: '0.5rem' }}>
                          <strong>Details:</strong>
                          <ul style={{ 
                            margin: '0.25rem 0 0 0', 
                            paddingLeft: '1rem',
                            fontSize: '0.75rem'
                          }}>
                            {feature.details.map((detail, detailIndex) => (
                              <li key={detailIndex}>{detail}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {feature.prompts && feature.prompts.length > 0 && (
                        <div style={{ marginLeft: '0.5rem' }}>
                          <strong>Prompts:</strong>
                          <ul style={{ 
                            margin: '0.25rem 0 0 0', 
                            paddingLeft: '1rem',
                            fontSize: '0.75rem'
                          }}>
                            {feature.prompts.map((prompt, promptIndex) => (
                              <li key={promptIndex} style={{ fontStyle: 'italic' }}>
                                "{prompt}"
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            {item.features.filter(f => f.type === 'Action').length > 0 && (
              <div style={{ marginBottom: '1rem' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  marginBottom: '0.75rem'
                }}>
                  <hr style={{
                    flex: 1,
                    border: 'none',
                    borderTop: '1px solid var(--border)',
                    margin: 0
                  }} />
                  <h4 style={{
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: 'white',
                    margin: 0,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    textAlign: 'center',
                    minWidth: '80px'
                  }}>
                    Actions
                  </h4>
                  <hr style={{
                    flex: 1,
                    border: 'none',
                    borderTop: '1px solid var(--border)',
                    margin: 0
                  }} />
                </div>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem'
                }}>
                  {item.features.filter(f => f.type === 'Action').map((feature, index) => (
                    <div key={index} style={{
                      fontSize: '0.875rem',
                      lineHeight: 1.4,
                      color: 'var(--text-secondary)'
                    }}>
                      <div style={{ 
                        fontWeight: 600, 
                        color: 'white',
                        marginBottom: '0.25rem'
                      }}>
                        {feature.name}
                      </div>
                      <div style={{ marginBottom: '0.25rem' }}>
                        {feature.description}
                      </div>
                      {feature.details && feature.details.length > 0 && (
                        <div style={{ marginLeft: '0.5rem' }}>
                          <strong>Details:</strong>
                          <ul style={{ 
                            margin: '0.25rem 0 0 0', 
                            paddingLeft: '1rem',
                            fontSize: '0.75rem'
                          }}>
                            {feature.details.map((detail, detailIndex) => (
                              <li key={detailIndex}>{detail}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {feature.prompts && feature.prompts.length > 0 && (
                        <div style={{ marginLeft: '0.5rem' }}>
                          <strong>Prompts:</strong>
                          <ul style={{ 
                            margin: '0.25rem 0 0 0', 
                            paddingLeft: '1rem',
                            fontSize: '0.75rem'
                          }}>
                            {feature.prompts.map((prompt, promptIndex) => (
                              <li key={promptIndex} style={{ fontStyle: 'italic' }}>
                                "{prompt}"
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reactions */}
            {item.features.filter(f => f.type === 'Reaction').length > 0 && (
              <div style={{ marginBottom: '1rem' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  marginBottom: '0.75rem'
                }}>
                  <hr style={{
                    flex: 1,
                    border: 'none',
                    borderTop: '1px solid var(--border)',
                    margin: 0
                  }} />
                  <h4 style={{
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: 'white',
                    margin: 0,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    textAlign: 'center',
                    minWidth: '80px'
                  }}>
                    Reactions
                  </h4>
                  <hr style={{
                    flex: 1,
                    border: 'none',
                    borderTop: '1px solid var(--border)',
                    margin: 0
                  }} />
                </div>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem'
                }}>
                  {item.features.filter(f => f.type === 'Reaction').map((feature, index) => (
                    <div key={index} style={{
                      fontSize: '0.875rem',
                      lineHeight: 1.4,
                      color: 'var(--text-secondary)'
                    }}>
                      <div style={{ 
                        fontWeight: 600, 
                        color: 'white',
                        marginBottom: '0.25rem'
                      }}>
                        {feature.name}
                      </div>
                      <div style={{ marginBottom: '0.25rem' }}>
                        {feature.description}
                      </div>
                      {feature.details && feature.details.length > 0 && (
                        <div style={{ marginLeft: '0.5rem' }}>
                          <strong>Details:</strong>
                          <ul style={{ 
                            margin: '0.25rem 0 0 0', 
                            paddingLeft: '1rem',
                            fontSize: '0.75rem'
                          }}>
                            {feature.details.map((detail, detailIndex) => (
                              <li key={detailIndex}>{detail}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {feature.prompts && feature.prompts.length > 0 && (
                        <div style={{ marginLeft: '0.5rem' }}>
                          <strong>Prompts:</strong>
                          <ul style={{ 
                            margin: '0.25rem 0 0 0', 
                            paddingLeft: '1rem',
                            fontSize: '0.75rem'
                          }}>
                            {feature.prompts.map((prompt, promptIndex) => (
                              <li key={promptIndex} style={{ fontStyle: 'italic' }}>
                                "{prompt}"
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Condensed Cards for All Instances - At Bottom */}
        {instances && instances.length > 0 && (
          <div style={{
            marginTop: '1rem',
            borderTop: '1px solid var(--border)'
          }}>
            {instances.map((instance, index) => {
              const isInstanceDead = (instance.hp || 0) >= (instance.hpMax || 1)
              return (
              <div key={instance.id}>
                <div
                  key={instance.id}
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    borderRadius: '4px',
                    padding: '8px',
                    border: '1px solid var(--border)',
                    marginBottom: '4px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '8px',
                    opacity: isInstanceDead ? 0.7 : 1,
                    backgroundColor: isInstanceDead ? 'var(--gray-900)' : 'var(--bg-secondary)',
                    borderColor: isInstanceDead ? 'color-mix(in srgb, var(--gray-600) 40%, transparent)' : 'var(--border)',
                    position: 'relative'
                  }}
                >
                  {/* DEFEATED overlay for instances */}
                  {isInstanceDead && (
                    <>
                      {/* Diagonal striping pattern */}
                      <div style={{
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
                        borderRadius: '4px'
                      }} />
                      {/* DEFEATED text */}
                      <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        color: 'var(--text-secondary)',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        zIndex: 2,
                        backgroundColor: 'var(--gray-900)',
                        padding: '0.125rem 0.25rem',
                        borderRadius: '0.25rem',
                        border: '0.5px solid var(--gray-600)'
                      }}>
                        DEFEATED
                      </div>
                    </>
                  )}
                  {/* Left side - Number section */}
                  <div style={{
                    backgroundColor: 'var(--bg-secondary)',
                    borderRadius: '3px',
                    padding: '2px 6px',
                    border: '1px solid var(--border)',
                    minWidth: '24px',
                    textAlign: 'center'
                  }}>
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: 'var(--text-primary)'
                    }}>
                      {instance.duplicateNumber || 1}
                    </span>
                  </div>

                  {/* Center - Instance info */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flex: 1
                  }}>
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: 500,
                      color: 'var(--text-secondary)'
                    }}>
                      Instance {index + 1}
                    </span>
                  </div>
                </div>
              </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default EnvironmentCard
