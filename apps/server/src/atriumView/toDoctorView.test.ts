import { atriumDoctorDocument } from '../test/atriumDoctorDocument'
import { toDoctorView } from './toDoctorView'

const hour = 3_600_000
const writtenAt = Date.parse('2026-10-03T11:30:00Z')

describe('toDoctorView', () => {
  it('turns stale only past twice the refresh interval', () => {
    const doctor = atriumDoctorDocument()
    expect(toDoctorView(doctor, hour, writtenAt + 2 * hour).stale).toBe(false)
    expect(toDoctorView(doctor, hour, writtenAt + 2 * hour + 1).stale).toBe(
      true,
    )
  })
  it('keeps severities and codes, never prose', () => {
    const view = toDoctorView(atriumDoctorDocument(), hour, writtenAt)
    expect(view.checks.map((c) => [c.name, c.severity, c.code])).toEqual([
      ['archive', 'ok', 'archive_fresh'],
      ['synthesis', 'warn', 'orphans'],
      ['refresh', 'broken', 'refresh_stale'],
    ])
  })
})
