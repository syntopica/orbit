import { screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { renderAt } from '../../test/renderAt'
import { requestUrl } from '../../test/requestUrl'
import { workerView } from '../../test/workerView'

const day = Date.parse('2026-10-02T00:00:00Z')
const row = {
  day,
  provider: 'agy',
  queue: 'q',
  attempts: 2,
  succeeded: 2,
  wallMs: 100,
  tokensIn: 10,
  tokensOut: 5,
  costUsd: 0,
}

describe('worker costs without spend', () => {
  it('shows one line instead of a blank cost plot', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo | URL) => {
        const url = requestUrl(input)
        const body = url.includes('/costs')
          ? { now: day + 1000, rows: [row] }
          : url.includes('/quality')
            ? { now: day, attempts: [], ratings: [], judged: [] }
            : workerView({ now: day })
        return await Promise.resolve(Response.json(body))
      }),
    )
    await renderAt('/worker')
    const section = await screen.findByRole('region', { name: 'Costs' })
    expect(
      await within(section).findByText('No spend in this range.'),
    ).toBeInTheDocument()
    expect(
      within(section).queryByRole('slider', {
        name: 'Cost per day by provider',
      }),
    ).not.toBeInTheDocument()
  })
})
