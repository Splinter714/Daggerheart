import { loadCustomContent, saveCustomContent } from './DataLibrary'

beforeEach(() => localStorage.clear())

describe('DataLibrary custom content', () => {
  it('round-trips custom adversaries through save/load', () => {
    const adversaries = [{ id: 'c1', name: 'Homebrew Beast' }]
    saveCustomContent('adversary', adversaries)

    expect(loadCustomContent().customAdversaries).toEqual(adversaries)
  })

  it('round-trips custom environments through save/load', () => {
    const environments = [{ id: 'e1', name: 'Haunted Wood' }]
    saveCustomContent('environment', environments)

    expect(loadCustomContent().customEnvironments).toEqual(environments)
  })

  it('returns empty arrays when nothing is stored', () => {
    expect(loadCustomContent()).toEqual({ customAdversaries: [], customEnvironments: [] })
  })

  it('survives corrupt JSON in storage, yielding [] instead of throwing', () => {
    localStorage.setItem('daggerheart-custom-adversaries', '{not valid json')

    expect(() => loadCustomContent()).not.toThrow()
    expect(loadCustomContent().customAdversaries).toEqual([])
  })
})
