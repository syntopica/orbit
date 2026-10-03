import { z } from 'zod'

// A brain page id as orbit accepts it (spec 7.5): `<dir>[/<dir>...]/<stem>`
// in ASCII. No segment starts with `.` or `-`, so an id can neither climb out
// of a page root nor read as an option; anything else never reaches the
// engine, which validates again against its configured roots.
export const pageIdSchema = z
  .string()
  .max(256)
  .regex(/^\w[\w-]*(?:\/\w[\w-]*)*\/\w[\w.-]*$/)
