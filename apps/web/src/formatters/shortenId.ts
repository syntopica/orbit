// The first eight characters and an ellipsis; short ids stay whole.
export const shortenId = (id: string): string =>
  id.length <= 9 ? id : `${id.slice(0, 8)}…`
