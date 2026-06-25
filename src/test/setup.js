// Vitest setup: jest-dom matchers + stubs for the browser APIs jsdom doesn't
// implement but the dashboard touches on mount. Without these, the boot smoke
// would throw on missing globals (a false negative) rather than on real bugs.
import '@testing-library/jest-dom'

class ObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return []
  }
}

globalThis.ResizeObserver = globalThis.ResizeObserver || ObserverStub
globalThis.IntersectionObserver = globalThis.IntersectionObserver || ObserverStub

if (!window.matchMedia) {
  window.matchMedia = (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener() {},
    removeListener() {},
    addEventListener() {},
    removeEventListener() {},
    dispatchEvent() {
      return false
    },
  })
}

// jsdom logs "Not implemented" for these; make them silent no-ops.
window.scrollTo = window.scrollTo || (() => {})
Element.prototype.scrollTo = Element.prototype.scrollTo || function () {}
Element.prototype.scrollIntoView = Element.prototype.scrollIntoView || function () {}
