import { readFileSync } from 'node:fs'
import { mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { runProcess } from '../process/runProcess'
import { renderPlistTemplate } from './renderPlistTemplate'

const template = readFileSync(
  join(
    import.meta.dirname,
    '../../../../launchd/com.syntopica.orbit.plist.template',
  ),
  'utf8',
)
const safe = {
  node: '/usr/local/bin/node',
  orbit: '/opt/orbit/orbit.mjs',
  data: '/srv/instance',
  path: '/opt/n/bin:/usr/bin',
}

const lint = async (rendered: string): Promise<number> => {
  const path = join(
    await mkdtemp(join(tmpdir(), 'orbit-plist-')),
    'orbit.plist',
  )
  await writeFile(path, rendered)
  const result = await runProcess({
    file: '/usr/bin/plutil',
    args: ['-lint', path],
    env: {},
    timeoutMs: 5000,
    maxBytes: 4096,
  })
  return result.code
}

describe('renderPlistTemplate', () => {
  it('produces a plist that plutil accepts, with every placeholder replaced', async () => {
    const rendered = renderPlistTemplate(template, safe)
    expect(rendered).not.toContain('__')
    expect(rendered).toContain(
      '<key>Label</key>\n  <string>com.syntopica.orbit</string>',
    )
    expect(rendered).toContain('<key>Umask</key>\n  <integer>63</integer>')
    expect(rendered).toContain('<string>/srv/instance/orbit/orbit.log</string>')
    expect(rendered).toContain(
      '<key>PATH</key>\n    <string>/opt/n/bin:/usr/bin</string>',
    )
    expect(await lint(rendered)).toBe(0)
  })

  it('escapes XML metacharacters so a value cannot inject markup', async () => {
    const rendered = renderPlistTemplate(template, {
      ...safe,
      data: `/a&b<c>"d'e</string><key>X`,
    })
    expect(rendered).toContain(
      '/a&amp;b&lt;c&gt;&quot;d&apos;e&lt;/string&gt;&lt;key&gt;X',
    )
    expect(rendered).not.toContain('<key>X')
    expect(await lint(rendered)).toBe(0)
  })

  it('does not re-scan a substituted value for placeholders', () => {
    const rendered = renderPlistTemplate(template, {
      ...safe,
      node: '__DATA__',
    })
    expect(rendered).toContain(
      '<string>__DATA__</string>\n    <string>/opt/orbit',
    )
  })

  it.each(['\0', '\n', '\r'])(
    'refuses a value containing %j with a fixed error',
    (bad) => {
      for (const key of ['node', 'orbit', 'data', 'path'] as const) {
        expect(() =>
          renderPlistTemplate(template, { ...safe, [key]: `/x${bad}y` }),
        ).toThrow(new Error('plist value is not allowed'))
      }
    },
  )
})
