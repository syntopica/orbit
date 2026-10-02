import { describe, expect, it } from 'vitest'
import { validatePairFragment } from './validatePairFragment'

const id = 'abcdefghijk'
const secret = 'aaaaaaaaaaaaaaaaaaaaaa'

describe('validatePairFragment', () => {
  it('splits a well-formed fragment, with or without the leading hash', () => {
    expect(validatePairFragment(`${id}.${secret}`)).toEqual({ id, secret })
    expect(validatePairFragment(`#${id}.${secret}`)).toEqual({ id, secret })
    expect(
      validatePairFragment('A-_defghijk.placeholder_secret-_Zz'),
    ).not.toBeNull()
  })
  it.each([
    '',
    'short.x',
    id,
    `${id}.${secret}.extra`,
    `abcdefghij!.${secret}`,
    `${id}.placeholder_secret_00!`,
    `${id}x.${secret}`,
    `${id.slice(1)}.${secret}`,
    `${id}.${secret}x`,
    `${id}.${secret.slice(1)}`,
    `${'a'.repeat(33)}.${'b'.repeat(65)}`,
  ])('rejects %j', (hash) => {
    expect(validatePairFragment(hash)).toBeNull()
  })
})
