import { render, screen, waitFor } from '@testing-library/react'
import { GameStateProvider } from '../../state/state'
import DashboardView from './DashboardView'

beforeEach(() => localStorage.clear())

// Boot smoke: render the real app tree (provider + dashboard) the way index.jsx
// does, and assert it gets past the loading placeholder without tripping the
// ErrorBoundary. If any child throws on mount, the fallback ("Something went
// wrong:") renders and this fails — which is exactly the regression we want caught.
describe('app boot smoke', () => {
  it('boots the dashboard past the loading state without hitting the error boundary', async () => {
    render(
      <GameStateProvider>
        <DashboardView />
      </GameStateProvider>
    )

    await waitFor(() => expect(document.querySelector('.loading-state')).toBeNull())
    expect(screen.queryByText('Something went wrong:')).toBeNull()
  })
})
