import type { DoctorCheck } from '../../types/DoctorCheck'
import { checkAdminToken } from './checkAdminToken'
import { checkInstance } from './checkInstance'
import { checkLaunchdLabels } from './checkLaunchdLabels'
import { checkLaunchdLoaded } from './checkLaunchdLoaded'
import { checkOrbitPlist } from './checkOrbitPlist'
import { checkPort } from './checkPort'
import { checkTailnet } from './checkTailnet'
import { checkTailscaleServe } from './checkTailscaleServe'
import { checkWorkerToken } from './checkWorkerToken'

export const DOCTOR_CHECKS: readonly DoctorCheck[] = [
  checkInstance,
  checkAdminToken,
  checkPort,
  checkTailnet,
  checkLaunchdLabels,
  checkLaunchdLoaded,
  checkTailscaleServe,
  checkOrbitPlist,
  checkWorkerToken,
]
