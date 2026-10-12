import { en } from './en'
import { hi } from './hi'

export type Language = 'en' | 'hi'

export const dictionaries = {
  en,
  hi
}

/**
 * Helper to resolve nested key path like 'scoreboard.title' in a dictionary
 */
export function getTranslation(dict: typeof en, path: string, fallback?: string): string {
  const parts = path.split('.')
  let current: any = dict
  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part]
    } else {
      return fallback || path
    }
  }
  return typeof current === 'string' ? current : fallback || path
}
