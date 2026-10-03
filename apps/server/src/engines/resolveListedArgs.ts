import { argMatches } from './argMatches'
import { hasPlaceholder } from './hasPlaceholder'

// D3: an exact entry runs as requested; a request naming one entry by its
// leading arguments runs that entry whole. The appended tail comes from the
// table, never from the caller, and is never an unfilled placeholder.
export const resolveListedArgs = (
  subcommands: readonly (readonly string[])[],
  requested: readonly string[],
): readonly string[] | null => {
  const candidates = subcommands.filter(
    (listed) =>
      requested.length <= listed.length &&
      requested.every((arg, index) => argMatches(listed[index] ?? '', arg)),
  )
  if (candidates.some((listed) => listed.length === requested.length))
    return requested
  const [only, ...others] = candidates
  if (only === undefined || others.length > 0) return null
  const tail = only.slice(requested.length)
  return hasPlaceholder(tail) ? null : [...requested, ...tail]
}
