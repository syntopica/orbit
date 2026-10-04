import { formatCount } from './formatCount'

// A collapsed community is named by its most linked page and its size;
// pages with no community are one group of their own.
export const formatClusterLabel = (
  lead: string | null,
  pages: number,
): string =>
  lead === null
    ? `Unlinked pages · ${formatCount(pages)}`
    : `${lead} · ${formatCount(pages)} ${pages === 1 ? 'page' : 'pages'}`
