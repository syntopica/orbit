import { parseTodoItems } from './parseTodoItems'

describe('parseTodoItems', () => {
  it('reads open states, sections and nested continuation with stable lines', () => {
    const items = parseTodoItems(
      '## Queue\r\n- [ ] First\r\n  detail\r\n  - nested\r\n- [~] Second\r\n\r\n- [!] Blocked\r\n## Next\r\n- [x] Done\r\n- [-] Dropped',
      'todo:example',
      '/example/TODO.md',
    )
    expect(items).toMatchObject([
      {
        id: 'todo:example:2',
        state: 'open',
        section: 'Queue',
        ref: { line: 2 },
        detail: '  detail\n  - nested',
      },
      {
        id: 'todo:example:5',
        state: 'partial',
        section: 'Queue',
        ref: { line: 5 },
      },
      {
        id: 'todo:example:7',
        state: 'blocked',
        section: 'Queue',
        ref: { line: 7 },
      },
    ])
  })

  it('stops at blank lines and headings and caps title and detail', () => {
    const items = parseTodoItems(
      `- [ ] ${'a'.repeat(350)}\n  ${'b'.repeat(5000)}\n\nnot continuation\n## Next\n- [ ] Short`,
      'todo:example',
      '/example/TODO.md',
    )
    expect(items).toHaveLength(2)
    expect(items[0]?.title).toHaveLength(300)
    expect(items[0]?.detail).toHaveLength(4000)
    expect(items[1]?.section).toBe('Next')
  })
})
