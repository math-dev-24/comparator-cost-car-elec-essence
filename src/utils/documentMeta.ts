/** Balises head pour SEO / partages sociaux (SPA : mis à jour au runtime selon la locale). */

function upsertMeta(attr: 'name' | 'property', key: string, content: string): void {
  for (const el of document.head.querySelectorAll('meta')) {
    if (el.getAttribute(attr) === key) {
      el.setAttribute('content', content)
      return
    }
  }
  const m = document.createElement('meta')
  m.setAttribute(attr, key)
  m.setAttribute('content', content)
  document.head.appendChild(m)
}

export type SeoLocale = 'fr' | 'en'

export function applyDocumentMeta(opts: {
  htmlLang: SeoLocale
  title: string
  description: string
  keywords: string
}): void {
  document.documentElement.lang = opts.htmlLang
  document.title = opts.title

  upsertMeta('name', 'description', opts.description)
  upsertMeta('name', 'keywords', opts.keywords)

  upsertMeta('property', 'og:title', opts.title)
  upsertMeta('property', 'og:description', opts.description)
  upsertMeta('property', 'og:type', 'website')
  upsertMeta('property', 'og:locale', opts.htmlLang === 'en' ? 'en_US' : 'fr_FR')

  upsertMeta('name', 'twitter:card', 'summary')
  upsertMeta('name', 'twitter:title', opts.title)
  upsertMeta('name', 'twitter:description', opts.description)
}
