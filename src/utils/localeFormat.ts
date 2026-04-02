export type AppLocale = 'fr' | 'en'

const TAG: Record<AppLocale, string> = {
  fr: 'fr-FR',
  en: 'en-US',
}

function resolveLocale(locale: string): AppLocale {
  return locale === 'en' ? 'en' : 'fr'
}

export function formatLocaleInt(n: number, locale: string): string {
  return Math.round(n).toLocaleString(TAG[resolveLocale(locale)])
}

export function formatLocaleDec(n: number, digits: number, locale: string): string {
  if (resolveLocale(locale) === 'en') return n.toFixed(digits)
  return n.toFixed(digits).replace('.', ',')
}

export function numberLocaleTag(locale: string): string {
  return TAG[resolveLocale(locale)]
}
