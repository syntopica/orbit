import { snapshotCoreSchema } from './snapshotCoreSchema'

export const snapshotSchema = snapshotCoreSchema.extend({
  lastGood: snapshotCoreSchema.nullable(),
})
