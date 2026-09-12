import type { Category } from './types'

export function normalizeCategory(raw: string): Category | null {
  const s = raw.trim().toLowerCase().replace(/[\s-]+/g, '_')
  if (s.includes('general')) return 'general'
  if (s.includes('super')) return 'super_senior'
  if (s.includes('senior')) return 'senior'
  if (s.includes('junior') && s.includes('sub')) return 'sub_junior'
  if (s.includes('junior')) return 'junior'
  return null
}
