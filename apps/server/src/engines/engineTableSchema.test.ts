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
})
