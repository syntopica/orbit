import { request } from 'node:http'

import { expect, test } from '@playwright/test'

import { E2E } from '../support/paths'

const statusFor = (host: string): Promise<number> =>
  new Promise((resolve, reject) => {
    const req = request(
      {
        host: '127.0.0.1',
        port: E2E.port,
        path: '/api/snapshots',
        headers: { Host: host, 'Sec-Fetch-Site': 'same-origin' },
      },
      (res) => {
        res.resume()
        resolve(res.statusCode ?? 0)
      },
    )
    req.on('error', reject)
    req.end()
  })

test('refuses a request for a host it does not serve', async () => {
  expect(await statusFor('evil.example')).toBe(421)
  expect(await statusFor('orbit.example.ts.net')).toBe(401)
  expect(await statusFor(`127.0.0.1:${E2E.port}`)).toBe(401)
})
