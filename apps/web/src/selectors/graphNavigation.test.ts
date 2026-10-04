import { afterEach, describe, expect, it, vi } from 'vitest'

import { clusterNodeId } from '../graph/clusterNodeId'
import { readClusterId } from '../graph/readClusterId'
import { readLastPage } from '../graph/readLastPage'
import { writeLastPage } from '../graph/writeLastPage'
import type { BrainSearch } from '../types/BrainSearch'
import { isEditableTarget } from '../validators/isEditableTarget'
import { validateBrainSearch } from '../validators/validateBrainSearch'
import { buildGraphModel } from './buildGraphModel'
import { graphKeyPatch } from './graphKeyPatch'
import { mostCentralPage } from './mostCentralPage'
import { resolveFocus } from './resolveFocus'
import { searchForNode } from './searchForNode'

const search: BrainSearch = validateBrainSearch({})
const model = buildGraphModel({
  now: 0,
  nodes: [
    { id: 'notes/a', type: 'topic', degree: 1, orphan: false },
    { id: 'notes/b', type: 'topic', degree: 3, orphan: false },
    { id: 'notes/c', type: 'topic', degree: 3, orphan: false },
  ],
  edges: [],
  dangling: 0,
  skipped: 0,
})

afterEach(() => {
  localStorage.clear()
  vi.restoreAllMocks()
})

describe('graphKeyPatch', () => {
  it('picks, widens and narrows the view', () => {
    expect(graphKeyPatch('2', search)).toEqual({ depth: 2 })
    expect(graphKeyPatch('0', search)).toEqual({ depth: 0 })
    expect(graphKeyPatch('+', { ...search, depth: 3 })).toEqual({ depth: 3 })
    expect(graphKeyPatch('=', search)).toEqual({ depth: 2 })
    expect(graphKeyPatch('-', search)).toEqual({ depth: 0 })
    expect(graphKeyPatch('_', { ...search, depth: 0 })).toEqual({ depth: 0 })
    expect(graphKeyPatch('x', search)).toBeNull()
  })
  it('steps back with Escape: to the overview, then closes a group', () => {
    expect(graphKeyPatch('Escape', search)).toEqual({ depth: 0 })
    expect(
      graphKeyPatch('Escape', { ...search, depth: 0, cluster: 4 }),
    ).toEqual({ cluster: null })
    expect(graphKeyPatch('Escape', { ...search, depth: 0 })).toBeNull()
  })
})

describe('searchForNode', () => {
  it('opens a group in place and a page in its local view', () => {
    const overview = { ...search, depth: 0 as const }
    expect(searchForNode(overview, clusterNodeId(3))).toEqual({
      ...overview,
      cluster: 3,
    })
    expect(searchForNode(overview, 'notes/a')).toMatchObject({
      page: 'notes/a',
      depth: 1,
    })
    expect(searchForNode({ ...search, depth: 3 }, 'notes/a').depth).toBe(3)
  })
  it('clears the page, and in the overview the open group', () => {
    expect(
      searchForNode({ ...search, page: 'notes/a', depth: 0, cluster: 2 }, null),
    ).toEqual({ ...search, depth: 0, cluster: null })
    expect('page' in searchForNode({ ...search, page: 'notes/a' }, null)).toBe(
      false,
    )
  })
})

describe('focus', () => {
  it('uses the selection, then the remembered page, then the most linked', () => {
    expect(resolveFocus(model, 'notes/a', 'notes/c')).toBe(0)
    expect(resolveFocus(model, undefined, 'notes/c')).toBe(2)
    expect(resolveFocus(model, undefined, 'notes/gone')).toBe(1)
    expect(mostCentralPage(buildGraphModel({ ...emptyGraph }))).toBeNull()
  })
  it('remembers the last page and survives refused storage', () => {
    expect(readLastPage()).toBeNull()
    writeLastPage('notes/b')
    expect(readLastPage()).toBe('notes/b')
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('denied')
    })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('denied')
    })
    expect(readLastPage()).toBeNull()
    expect(() => {
      writeLastPage('notes/c')
    }).not.toThrow()
  })
})

const emptyGraph = { now: 0, nodes: [], edges: [], dangling: 0, skipped: 0 }

describe('ids and key targets', () => {
  it('reads cluster ids back and rejects page ids', () => {
    expect(readClusterId(clusterNodeId(-1))).toBe(-1)
    expect(readClusterId('notes/a')).toBeNull()
    expect(readClusterId('cluster:x')).toBeNull()
  })
  it('leaves keys typed into fields and dialogs alone', () => {
    const input = document.createElement('input')
    const dialog = document.createElement('div')
    dialog.setAttribute('role', 'dialog')
    const button = document.createElement('button')
    dialog.append(button)
    expect(isEditableTarget(input)).toBe(true)
    expect(isEditableTarget(button)).toBe(true)
    expect(isEditableTarget(document.body)).toBe(false)
    expect(isEditableTarget(null)).toBe(false)
  })
})
