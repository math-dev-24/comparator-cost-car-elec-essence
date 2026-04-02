import { formatLocaleDec, formatLocaleInt, numberLocaleTag, type AppLocale } from '@/utils/localeFormat'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

export function useLocaleFormat() {
  const { locale } = useI18n()
  const tag = computed(() => numberLocaleTag(locale.value))

  function fmtInt(n: number) {
    return formatLocaleInt(n, locale.value as AppLocale)
  }

  function fmtDec(n: number, digits: number) {
    return formatLocaleDec(n, digits, locale.value as AppLocale)
  }

  return { locale, tag, fmtInt, fmtDec }
}
