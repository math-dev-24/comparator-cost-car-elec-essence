import en from '@/locales/en.json'
import fr from '@/locales/fr.json'
import { createI18n } from 'vue-i18n'

export const LOCALE_STORAGE_KEY = 'simulator-locale'

export type AppLocale = 'fr' | 'en'

function detectLocale(): AppLocale {
  if (typeof localStorage !== 'undefined') {
    const s = localStorage.getItem(LOCALE_STORAGE_KEY)
    if (s === 'en' || s === 'fr') return s
  }
  if (typeof navigator !== 'undefined' && navigator.language.toLowerCase().startsWith('en')) {
    return 'en'
  }
  return 'fr'
}

export const i18n = createI18n({
  legacy: false,
  locale: detectLocale(),
  fallbackLocale: 'fr',
  globalInjection: true,
  messages: { fr, en },
})
