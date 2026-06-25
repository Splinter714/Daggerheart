import { readFileSync, readdirSync } from 'node:fs'
import { join, relative } from 'node:path'

// Fitness guard: structural import boundaries.
//
// Locks in the separation the codebase already has, so a later refactor can't
// quietly re-couple layers. Near-zero false positives: these assert on the raw
// `import ... from '<source>'` specifiers, not on resolved behavior.

const SRC_ROOT = join(process.cwd(), 'src')

function collectFiles(dir, predicate) {
  const out = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) {
      out.push(...collectFiles(full, predicate))
    } else if (predicate(full)) {
      out.push(full)
    }
  }
  return out
}

// Extract the source specifiers of static `import` statements.
function importSources(file) {
  const src = readFileSync(file, 'utf8')
  const sources = []
  const re = /import\s+(?:[^'"]*?\sfrom\s+)?['"]([^'"]+)['"]/g
  let m
  while ((m = re.exec(src)) !== null) sources.push(m[1])
  return sources
}

const isSource = (f) => /\.(js|jsx)$/.test(f) && !/\.test\.(js|jsx)$/.test(f)

describe('import boundaries', () => {
  describe('GameCard/ sections stay independent of the heavy editors', () => {
    const sectionDir = join(SRC_ROOT, 'components/Adversaries/GameCard')
    const sections = collectFiles(sectionDir, isSource)

    it('finds GameCard section files', () => {
      expect(sections.length).toBeGreaterThan(0)
    })

    it.each(sections.map((f) => relative(process.cwd(), f)))(
      '%s does not import Browser or CustomAdversaryCreator',
      (rel) => {
        const sources = importSources(join(process.cwd(), rel))
        const offenders = sources.filter((s) => /(^|\/)Browser(\b|\/)|CustomAdversaryCreator/.test(s))
        expect(offenders, `${rel} imports a heavy editor: ${offenders.join(', ')}`).toEqual([])
      },
    )
  })

  describe('DataLibrary is a pure data layer (no React/component imports)', () => {
    const rel = 'src/components/Browser/DataLibrary.js'

    it('imports no React and no component module', () => {
      const sources = importSources(join(process.cwd(), rel))
      const offenders = sources.filter((s) => s === 'react' || /\.jsx$/.test(s) || /components\//.test(s))
      expect(offenders, `${rel} should stay data-only; offending imports: ${offenders.join(', ')}`).toEqual([])
    })
  })
})
