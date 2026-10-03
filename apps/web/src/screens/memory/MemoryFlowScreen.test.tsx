import {
  FLOW_STAGE_IDS,
  type FlowStageId,
  type MemoryFlow,
} from '@orbit/contract'
import { focusManager } from '@tanstack/react-query'
import { act, fireEvent, screen, waitFor, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'

import { mediaMatches } from '../../test/mediaMatches'
import { renderAt } from '../../test/renderAt'

const PHONE_QUERY = '(max-width: 767px)'
const PANEL_ROLE = 'complementary'
const NOW = 1_790_000_000_000
type Stage = MemoryFlow['stages'][number]
const stage = (id: FlowStageId, overrides: Partial<Stage> = {}): Stage => ({
  id,
  component: 'atrium',
  state: 'unknown',
  freshAt: null,
  policyMs: null,
  label: null,
  lastRunAt: null,
  backlog: null,
  metrics: [],
  pending: [],
  ...overrides,
})
const index = stage('index', {
  state: 'ok',
  freshAt: NOW - 1_800_000,
  policyMs: 7_200_000,
  label: 'com.example.refresh',
  lastRunAt: NOW - 1_800_000,
  backlog: { key: 'atrium.not_indexed', value: 2 },
  metrics: [{ key: 'atrium.not_indexed', value: 2 }],
  pending: [{ key: 'atrium.not_indexed', count: 2, oldestAt: null }],
})
const flow: MemoryFlow = {
  now: NOW,
  stages: FLOW_STAGE_IDS.map((id) => (id === 'index' ? index : stage(id))),
  edges: [{ from: 'index', to: 'retrieval', perHour: 2.5, flowing: true }],
}
const serve = (body: unknown, status = 200) => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => Promise.resolve(Response.json(body, { status }))),
  )
}

describe('MemoryFlowScreen on a phone', () => {
  it('lists every stage and opens the selected one in a panel', async () => {
    mediaMatches.add(PHONE_QUERY)
    serve(flow)
    const { container, router } = await renderAt('/memory')
    const list = await screen.findByRole('list', { name: 'Stages' })
    expect(within(list).getAllByRole('button')).toHaveLength(8)
    expect(
      screen.getByRole('button', { name: 'Session-stop hook: Not measured' }),
    ).toBeInTheDocument()
    fireEvent.click(
      screen.getByRole('button', { name: 'Index: Fresh, 2 not indexed' }),
    )
    const panel = await screen.findByRole(PANEL_ROLE, { name: 'Index' })
    expect(router.state.location.search).toEqual({ stage: 'index' })
    expect(panel).toHaveTextContent('30m ago')
    expect(panel).toHaveTextContent('policy 2h')
    expect(panel).toHaveTextContent('com.example.refresh')
    expect(panel).toHaveTextContent('2 records not indexed')
    expect(panel).toHaveTextContent('2.5 per hour')
    const results = await axe(container, {
      rules: { 'color-contrast': { enabled: false } },
    })
    expect(results.violations).toEqual([])
    fireEvent.click(within(panel).getByRole('button', { name: 'Close' }))
    await waitFor(() => {
      expect(screen.queryByRole(PANEL_ROLE)).toBeNull()
    })
  })
  it('puts the phone panel beside its selected card and returns focus on close', async () => {
    mediaMatches.add(PHONE_QUERY)
    serve(flow)
    const { router } = await renderAt('/memory')
    const button = await screen.findByRole('button', {
      name: 'Archive: Not measured',
    })
    act(() => {
      button.focus()
    })
    fireEvent.click(button)
    const panel = await screen.findByRole(PANEL_ROLE, { name: 'Archive' })
    const list = screen.getByRole('list', { name: 'Stages' })
    const firstCard = within(list).getAllByRole('listitem')[0]
    if (firstCard === undefined) throw new Error('Missing first stage card')
    expect(within(firstCard).getByRole(PANEL_ROLE, { name: 'Archive' })).toBe(
      panel,
    )
    expect(button).toHaveFocus()
    expect(button).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getAllByRole(PANEL_ROLE)).toHaveLength(1)
    const close = within(panel).getByRole('button', { name: 'Close' })
    act(() => {
      close.focus()
    })
    fireEvent.click(close)
    await waitFor(() => {
      expect(screen.queryByRole(PANEL_ROLE)).toBeNull()
      expect(router.state.location.search).toEqual({})
    })
    expect(button).toHaveFocus()
    expect(button).toHaveAttribute('aria-expanded', 'false')
  })
  it('opens on the stage the URL names', async () => {
    mediaMatches.add(PHONE_QUERY)
    serve(flow)
    await renderAt('/memory?stage=index')
    expect(
      await screen.findByRole(PANEL_ROLE, { name: 'Index' }),
    ).toBeInTheDocument()
  })
  it('preserves unmeasured freshness in the selected panel', async () => {
    serve(flow)
    await renderAt('/memory?stage=episodes')
    const panel = await screen.findByRole(PANEL_ROLE, {
      name: 'Session-stop hook',
    })
    expect(panel).toHaveTextContent('Not measured')
    expect(panel).toHaveTextContent('no instant measured')
    expect(panel).toHaveTextContent(
      'No launchd label is registered for this stage.',
    )
  })
  it('closes a selected stage when pressed again', async () => {
    mediaMatches.add(PHONE_QUERY)
    serve(flow)
    const { router } = await renderAt('/memory?stage=index')
    await screen.findByRole(PANEL_ROLE, { name: 'Index' })
    fireEvent.click(
      screen.getByRole('button', { name: 'Index: Fresh, 2 not indexed' }),
    )
    await waitFor(() => {
      expect(router.state.location.search).toEqual({})
      expect(screen.queryByRole(PANEL_ROLE)).toBeNull()
    })
  })
  it('keeps last good data greyed with its age after a failed refetch', async () => {
    const clock = vi.spyOn(Date, 'now').mockReturnValue(NOW)
    serve(flow)
    await renderAt('/memory?stage=index')
    await screen.findByRole(PANEL_ROLE, { name: 'Index' })
    clock.mockReturnValue(NOW + 120_000)
    serve({ error: 'unavailable' }, 503)
    act(() => {
      focusManager.setFocused(false)
      focusManager.setFocused(true)
    })
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Last good data is 2m old.',
    )
    expect(
      screen.getByRole('region', { name: 'Memory flow data' }),
    ).toHaveClass('grayscale')
    expect(screen.getByRole(PANEL_ROLE, { name: 'Index' })).toHaveTextContent(
      '2 records not indexed',
    )
    focusManager.setFocused(undefined)
  })
  it('says so when the flow cannot be read', async () => {
    mediaMatches.add(PHONE_QUERY)
    serve({ error: 'internal' }, 500)
    await renderAt('/memory')
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Could not read the memory flow.',
    )
  })
})
