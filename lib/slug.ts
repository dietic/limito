import crypto from 'node:crypto'
import { config, reservedSlugs } from './config'

export function generateSlug(): string {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz0123456789'
  const len = config.slugs.autoLength
  let out = ''
  const bytes = crypto.randomBytes(len)
  for (let i = 0; i < len; i++) {
    const b = bytes.at(i) ?? 0
    out += alphabet[b % alphabet.length]
  }
  if (reservedSlugs.has(out)) {
    return generateSlug()
  }
  return out
}

export function isValidCustomSlug(slug: string): boolean {
  const { customMin, customMax, pattern } = config.slugs
  if (slug.length < customMin || slug.length > customMax) return false
  if (!pattern.test(slug)) return false
  if (reservedSlugs.has(slug)) return false
  return true
}
