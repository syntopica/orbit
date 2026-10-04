import type { ClipsView } from '@orbit/contract'
import { screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'

import { renderAt } from '../../test/renderAt'

const NOW = 1_790_000_000_000
const view: ClipsView = {
  now: NOW,
  total: 2,
  states: [{ state: 'needs-claude', count: 1, oldestAt: null }],
  intake: { days: [], undated: 0 },
  doctor: { ok: true, checks: [] },
  capture: null,
  items: null,
}
// Synthetic only: the history route answers an empty series.
const serve = (clips: ClipsView) => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (path: string) =>
      Promise.resolve(
        Response.json(
          path.startsWith('/api/clips')
            ? clips
            : { now: NOW, from: NOW - 86_400_000, runs: [], series: [] },
        ),
      ),
    ),
  )
}

describe('ClipsItemsSection', () => {
  it('lists each clip with its codes, last run, worker jobs and pages', async () => {
    serve({
      ...view,
      items: [
        {
          id: '0123456789abcdef',
          state: 'needs-claude',
          reason: 'routed_needs_claude',
          failure: { stage: 'synthesis', code: 'MODEL_ESCALATED' },
          stage: 'operator',
          capturedAt: NOW - 3 * 86_400_000,
          lastTransitionAt: null,
          attempts: 2,
          lastRun: {
            startedAt: NOW - 86_400_000,
            durationMs: 93_000,
            outcome: 'escalated',
            model: 'worker:ollama/model-a',
            boundary: 'worker-inference',
            workerJobIds: ['job-0123456789'],
            usage: {
              inputTokens: 120,
              outputTokens: 12,
              cachedInputTokens: null,
              reasoningTokens: null,
            },
          },
          pages: [],
        },
        {
          id: 'fedcba9876543210',
          state: 'reconciled',
          reason: 'reconciled',
          failure: null,
          stage: 'done',
          capturedAt: null,
          lastTransitionAt: null,
          attempts: 0,
          lastRun: null,
          pages: ['topics/placeholder-page'],
        },
      ],
    })
    const { container } = await renderAt('/clips')
    const list = await screen.findByRole('list', { name: 'Clips' })
    const rows = within(list).getAllByRole('listitem')
    const waiting = rows[0] as HTMLElement
    const done = rows[1] as HTMLElement
    expect(waiting).toHaveTextContent('needs-claude')
    expect(waiting).toHaveTextContent('MODEL_ESCALATED @ synthesis')
    expect(waiting).toHaveTextContent('stage operator')
    expect(waiting).toHaveTextContent('3d')
    expect(waiting).toHaveTextContent('2 attempts')
    expect(waiting).toHaveTextContent('escalated · 1m 33s · 120 in · 12 out')
    expect(
      within(waiting).getByRole('link', {
        name: 'Worker job job-0123456789',
      }),
    ).toHaveAttribute('href', '/worker/jobs/job-0123456789')
    expect(done).toHaveTextContent('Age unknown')
    expect(
      within(done).getByRole('link', { name: 'topics/placeholder-page' }),
    ).toHaveAttribute('href', expect.stringContaining('page=topics') as string)
    const results = await axe(container, {
      rules: { 'color-contrast': { enabled: false } },
    })
    expect(results.violations).toEqual([])
  })
  it('names the missing engine flag when items are not listed', async () => {
    serve(view)
    await renderAt('/clips')
    expect(
      await screen.findByText(/add \["status", "--json", "--items"\]/),
    ).toBeInTheDocument()
  })
})
