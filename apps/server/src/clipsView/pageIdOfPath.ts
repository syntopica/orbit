import { pageIdSchema } from '@orbit/contract'

// A ledger page path (`topics/name.md`) as a brain page id (`topics/name`);
// null for anything that is not one, such as the root `index.md`.
export const pageIdOfPath = (path: string): string | null => {
  const parsed = pageIdSchema.safeParse(path.replace(/\.md$/, ''))
  return parsed.success ? parsed.data : null
}
