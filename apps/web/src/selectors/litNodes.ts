// The hovered node and its neighbours stay lit; null when nothing is hovered.
export const litNodes = (
  neighbours: ReadonlyMap<string, ReadonlySet<string>>,
  hovered: string | null,
): ReadonlySet<string> | null =>
  hovered === null
    ? null
    : new Set([hovered, ...(neighbours.get(hovered) ?? [])])
