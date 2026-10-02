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
})
