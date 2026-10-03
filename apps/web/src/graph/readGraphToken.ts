export const readGraphToken = (
  style: CSSStyleDeclaration,
  name: string,
  fallback: string,
): string => style.getPropertyValue(name).trim() || fallback
