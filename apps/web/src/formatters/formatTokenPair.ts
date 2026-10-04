// Tokens in and out as one short pair for a table cell; a dash for a count
// no attempt has reported yet.
export const formatTokenPair = (
  tokensIn: number | null,
  tokensOut: number | null,
): string => `${String(tokensIn ?? '—')} → ${String(tokensOut ?? '—')}`
