// Keys typed into a field or inside a dialog belong to it, not the graph.
export const isEditableTarget = (target: EventTarget | null): boolean =>
  target instanceof HTMLElement &&
  (target.isContentEditable ||
    ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) ||
    target.closest('dialog, [role="dialog"]') !== null)
