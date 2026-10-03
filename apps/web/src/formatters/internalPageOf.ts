import { pageIdSchema } from '@orbit/contract'

// The page id of a link `linkWikiPages` wrote, or null for any other href.
export const internalPageOf = (href: string | undefined): string | null => {
  const prefix = '/brain?page='
  if (href?.startsWith(prefix) !== true) return null
  try {
    const id = pageIdSchema.safeParse(
      decodeURIComponent(href.slice(prefix.length)),
    )
    return id.success ? id.data : null
  } catch {
    return null
  }
}
