import { engineTableSchema } from './engineTableSchema'

describe('engineTableSchema', () => {
  it('accepts the page id placeholder as a whole argument', () => {
    const table = {
      brain: {
        command: 'bin/brain',
        subcommands: [['page', '--json', '--id', '{pageId}']],
      },
    }
    expect(engineTableSchema.safeParse(table).success).toBe(true)
  })
  it('refuses any other placeholder', () => {
    for (const arg of [
      '{path}',
      '{pageId}x',
      '{}',
      'x{pageId}',
      '{pageId',
      'pageId}',
      '{{pageId}}',
    ])
      expect(
        engineTableSchema.safeParse({
          brain: { command: 'bin/brain', subcommands: [['page', arg]] },
        }).success,
      ).toBe(false)
  })
  it('validates action identifiers, fixed args and timeout cap', () => {
    const base = {
      command: 'bin/brain',
      subcommands: [['doctor']],
      actions: {
        rebuild: { args: ['graph', 'rebuild'], label: 'Rebuild graph' },
      },
    }
    expect(
      engineTableSchema.parse({ brain: base }).brain?.actions['rebuild']
        ?.timeoutS,
    ).toBe(600)
    expect(
      engineTableSchema.safeParse({
        brain: {
          ...base,
          actions: {
            rebuild: { args: ['graph'], label: 'Rebuild', timeoutS: 1801 },
          },
        },
      }).success,
    ).toBe(false)
    expect(
      engineTableSchema.safeParse({
        brain: {
          ...base,
          actions: { rebuild: { args: ['{pageId}'], label: 'Rebuild' } },
        },
      }).success,
    ).toBe(false)
    expect(
      engineTableSchema.safeParse({
        brain: {
          ...base,
          actions: { 'bad/action': { args: ['graph'], label: 'Rebuild' } },
        },
      }).success,
    ).toBe(false)
  })
})
