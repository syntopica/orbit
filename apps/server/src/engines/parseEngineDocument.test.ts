import { z } from 'zod'

import { doctorDocumentSchema } from './doctorDocumentSchema'
import { parseEngineDocument } from './parseEngineDocument'

const schema = z.object({ schemaVersion: z.literal(1), n: z.number() })

describe('parseEngineDocument', () => {
  it('accepts a valid document whatever the exit code', () => {
    for (const code of [0, 1, 2])
      expect(
        parseEngineDocument(
          { code, stdout: '{"schemaVersion":1,"n":3}' },
          schema,
        ),
      ).toEqual({ schemaVersion: 1, n: 3 })
  })
  it('reports an unknown major version as engine_schema_unsupported', () => {
    expect(() =>
      parseEngineDocument({ code: 0, stdout: '{"schemaVersion":2}' }, schema),
    ).toThrow(expect.objectContaining({ reason: 'engine_schema_unsupported' }))
  })
  it('reports unparseable output by exit code', () => {
    expect(() =>
      parseEngineDocument({ code: 1, stdout: 'usage: tool' }, schema),
    ).toThrow(expect.objectContaining({ reason: 'exit_nonzero' }))
    expect(() =>
      parseEngineDocument({ code: 0, stdout: '{"schemaVersion":1}' }, schema),
    ).toThrow(expect.objectContaining({ reason: 'schema_invalid' }))
  })
  it('reads a doctor document', () => {
    const stdout =
      '{"schemaVersion":1,"ok":false,"checks":[{"name":"db","ok":false,"code":"missing"}]}'
    expect(
      parseEngineDocument({ code: 1, stdout }, doctorDocumentSchema).checks,
    ).toEqual([{ name: 'db', ok: false, code: 'missing' }])
  })
})
