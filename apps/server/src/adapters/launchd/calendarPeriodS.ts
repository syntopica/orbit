import { z } from 'zod'

export const calendarPeriodS = (value: unknown): number | null => {
  const entry = z.object({
    Minute: z.number().optional(),
    Hour: z.number().optional(),
    Day: z.number().optional(),
    Weekday: z.number().optional(),
    Month: z.number().optional(),
  })
  const parsed = z.union([entry, z.array(entry).min(1)]).safeParse(value)
  if (!parsed.success) return null
  const entries = Array.isArray(parsed.data) ? parsed.data : [parsed.data]
  const scale = [
    ['Month', 366 * 86_400],
    ['Day', 31 * 86_400],
    ['Weekday', 7 * 86_400],
    ['Hour', 86_400],
    ['Minute', 3_600],
  ] as const
  return Math.min(
    ...entries.map(
      (e) => scale.find(([key]) => e[key] !== undefined)?.[1] ?? 60,
    ),
  )
}
