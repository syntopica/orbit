import { formatDoctorNote } from '../../formatters/formatDoctorNote'
import { ATRIUM_LABELS } from '../../labels/atriumLabels'
import type { AtriumDoctorSectionProps } from '../../types/AtriumDoctorSectionProps'
import { DoctorList } from '../clips/DoctorList'

// doctor.json from atrium's hourly refresh; codes only (spec 7.4).
export const AtriumDoctorSection = ({
  doctor,
  now,
}: AtriumDoctorSectionProps) =>
  doctor === null ? (
    <section
      aria-label={ATRIUM_LABELS.doctor}
      className="border-line bg-panel space-y-3 rounded-xl border p-4"
    >
      <h2 className="text-lg font-semibold">{ATRIUM_LABELS.doctor}</h2>
      <p className="text-muted text-sm">{ATRIUM_LABELS.noDoctor}</p>
    </section>
  ) : (
    <DoctorList doctor={doctor} note={formatDoctorNote(doctor, now)} />
  )
