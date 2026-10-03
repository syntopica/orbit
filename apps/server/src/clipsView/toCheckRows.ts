import type { ClipsView } from '@orbit/contract'

import type { ClipsDocuments } from '../types/ClipsDocuments'
import { isIdentifier } from '../workerView/isIdentifier'

export const toCheckRows = (
  doctor: ClipsDocuments['doctor'],
): ClipsView['doctor']['checks'] =>
  doctor.checks
    .filter((check) => isIdentifier(check.name))
    .map(({ name, ok, code }) => ({
      name,
      ok,
      code: isIdentifier(code) ? code : null,
    }))
