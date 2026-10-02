import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'

import { renderAt } from './test/renderAt'

describe('App', () => {
  it('login screen has no accessibility violations', async () => {
    const { container } = await renderAt('/login')
    const results = await axe(container, {
      rules: { 'color-contrast': { enabled: false } },
    })
    expect(results.violations).toHaveLength(0)
  })
  it('mounts the providers and the router', async () => {
    window.history.pushState({}, '', '/login')
    const { App } = await import('./App')
    render(<App />)
    expect(await screen.findByLabelText('Admin token')).toBeInTheDocument()
  })
})
