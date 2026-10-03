import { z } from 'zod'

export const isIntakeDay = (day: string): boolean =>
  z.iso.date().safeParse(day).success
