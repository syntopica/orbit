import type { AtriumContext } from '@orbit/contract'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'

import { requestOf } from '../../test/requestOf'
import { ContextInspector } from './ContextInspector'

const context: AtriumContext = {
  now: 1_790_000_000_000,
  blocks: [
    {
      rank: 1,
      trust: 'curated',
      role: 'note',
      provider: 'brain',
      notePath: 'notes/a.md',
      conversationId: null,
      authoredAt: null,
      chars: 16,
      text: 'curated evidence',
      truncated: false,
    },
    {
      rank: 2,
      trust: 'history',
      role: 'assistant',
      provider: 'source-a',
      notePath: null,
      conversationId: '0123456789ab',
      authoredAt: Date.parse('2026-10-01T10:00:00Z'),
      chars: 1200,
      text: 'history evidence',
      truncated: true,
    },
  ],
  textChars: 1216,
  limit: 8,
  maxChars: 16_000,
  warnings: ['lexical_budget_exhausted'],
  freshnessStatus: 'fresh',
}
const answer = (body: unknown, status = 200) => {
  const fetchMock = vi
    .fn<typeof fetch>()
    .mockResolvedValue(Response.json(body, { status }))
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}
const ask = (value: string) => {
  fireEvent.change(screen.getByLabelText('Query'), { target: { value } })
  fireEvent.click(screen.getByRole('button', { name: 'Inspect' }))
}

describe('ContextInspector', () => {
  it('labels synthesized blocks and marks untrusted sources', async () => {
    const trusts = ['synthesized', 'untrusted'] as const
    const blocks = context.blocks.map((block, index) => ({
      ...block,
      trust: trusts[index] ?? 'unknown',
    }))
    answer({ ...context, blocks })
    render(<ContextInspector />)
    ask('anything')
    const list = await screen.findByRole('list', { name: 'Blocks' })
    expect(within(list).getByText('Synthesized')).not.toHaveClass('bg-warn')
    expect(within(list).getByText('Untrusted source')).toHaveClass('bg-warn')
  })
  it('starts idle with a disabled button and a 500-character counter', () => {
    render(<ContextInspector />)
    expect(screen.getByRole('button', { name: 'Inspect' })).toBeDisabled()
    expect(screen.getByLabelText('Query')).toHaveAttribute('maxLength', '500')
    expect(screen.getByText('0 / 500 characters')).toBeInTheDocument()
    fireEvent.change(screen.getByLabelText('Query'), {
      target: { value: 'orbit' },
    })
    expect(screen.getByText('5 / 500 characters')).toBeInTheDocument()
  })
  it('posts the trimmed query and shows labelled blocks with their sizes', async () => {
    const fetchMock = answer(context)
    const { container } = render(<ContextInspector />)
    ask('  what changed  ')
    expect(screen.getByRole('status')).toHaveTextContent(
      'Running atrium context',
    )
    const blocks = await screen.findByRole('list', { name: 'Blocks' })
    const [curated, history] = within(blocks).getAllByRole('listitem')
    expect(curated).toHaveTextContent('Curated')
    expect(curated).toHaveTextContent('#1 · brain · note · notes/a.md')
    expect(curated).toHaveTextContent('16 chars')
    expect(history).toHaveTextContent('History')
    expect(history).toHaveTextContent('0123456789ab · 2026-10-01')
    expect(history).toHaveTextContent('1,200 chars, truncated')
    expect(
      screen.getByText('Warnings: lexical_budget_exhausted'),
    ).toBeInTheDocument()
    expect(screen.getByText(/1,216 of 16,000 chars/)).toBeInTheDocument()
    const { path, init } = requestOf(fetchMock, 0)
    expect(path).toBe('/api/atrium/context')
    expect(init.body).toBe('{"query":"what changed"}')
    expect(new Headers(init.headers).get('X-Orbit')).toBe('1')
    const results = await axe(container, {
      rules: { 'color-contrast': { enabled: false } },
    })
    expect(results.violations).toEqual([])
  })
  it('says so when the query finds nothing', async () => {
    answer({ ...context, blocks: [], textChars: 0, warnings: [] })
    render(<ContextInspector />)
    ask('nothing')
    expect(
      await screen.findByText('No evidence for this query.'),
    ).toBeInTheDocument()
  })
  it('says the search ran out of time rather than that nothing matched', async () => {
    answer({ ...context, blocks: [], textChars: 0 })
    render(<ContextInspector />)
    ask('nubenode')
    expect(
      await screen.findByText(
        'The search ran out of time before it found anything; the machine is busy. Try again.',
      ),
    ).toBeInTheDocument()
    expect(
      screen.queryByText('No evidence for this query.'),
    ).not.toBeInTheDocument()
  })
  it('shows a fixed message per error code and never the raw body', async () => {
    answer({ error: 'engine_schema_unsupported' }, 503)
    render(<ContextInspector />)
    ask('orbit')
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Atrium answered in an unsupported version.',
    )
    answer({ error: 'leaky detail' }, 500)
    ask('orbit again')
    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent('Could not run atrium context.')
    expect(alert).not.toHaveTextContent('leaky')
  })
  it('reports a rate limit', async () => {
    answer({ error: 'rate_limited' }, 429)
    render(<ContextInspector />)
    ask('orbit')
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Too many queries; wait a minute.',
    )
  })
})
