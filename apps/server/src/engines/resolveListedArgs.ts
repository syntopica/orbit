// An exact entry runs as requested; a request naming one entry by its leading
// arguments runs that entry whole. The appended tail comes from the table,
// never from the caller. No match, or several, refuses.
export const resolveListedArgs = (
  subcommands: readonly (readonly string[])[],
  requested: readonly string[],
): readonly string[] | null => {
  const leading = subcommands.filter(
    (listed) =>
      listed.length >= requested.length &&
      requested.every((arg, i) => arg === listed[i]),
  )
  const exact = leading.find((listed) => listed.length === requested.length)
  if (exact !== undefined) return exact
  return leading.length === 1 ? (leading[0] ?? null) : null
}
