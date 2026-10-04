export const trackWorkerCursor = (
  cursor: string | null,
  seen: Set<string>,
): void => {
  if (cursor === null) return
  if (cursor.length === 0 || cursor.length > 512 || seen.has(cursor))
    throw new Error('worker cursor invalid')
  seen.add(cursor)
}
