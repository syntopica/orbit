import { isUnsafeWebPath } from './isUnsafeWebPath'

describe('isUnsafeWebPath', () => {
  it('refuses every way out of webRoot', () => {
    for (const path of [
      '/../etc/passwd',
      '/assets/../../x',
      '/..',
      '/./index.html',
      '/%2e%2e/x',
      '/%2E%2E/x',
      '/a%2fb',
      '/a\\..\\b',
      '//etc/passwd',
      'etc/passwd',
      '/index.html\0.js',
    ]) {
      expect(isUnsafeWebPath(path)).toBe(true)
    }
  })
  it('accepts ordinary asset paths', () => {
    for (const path of [
      '/index.html',
      '/assets/app-1a2b.js',
      '/system',
      '/a..b/c.d',
    ]) {
      expect(isUnsafeWebPath(path)).toBe(false)
    }
  })
})
