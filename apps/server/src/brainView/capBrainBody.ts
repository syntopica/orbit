// Decode only complete UTF-8 code points within the 1 MiB body limit.
export const capBrainBody = (body: string): string => {
  const bytes = new TextEncoder().encode(body)
  return bytes.byteLength <= 1_048_576
    ? body
    : new TextDecoder().decode(bytes.subarray(0, 1_048_576), { stream: true })
}
