export function sanitizeUrl(input: string): string | null {
  try {
    const u = new URL(input)
    if (u.protocol !== 'http:' && u.protocol !== 'https:') {
      return null
    }
    return u.toString()
  } catch {
    return null
  }
}

