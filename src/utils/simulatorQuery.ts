import type { SimulatorData } from '@/stores/simulator'

/** Version du payload ; incrémenter si la forme des données change */
export const SIM_QUERY_SCHEMA = 1

export const QUERY_KEY_SIM = 'sim'
export const QUERY_KEY_TAB = 'tab'

function utf8ToBase64Url(json: string): string {
  const bytes = new TextEncoder().encode(json)
  let bin = ''
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]!)
  const b64 = btoa(bin)
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function base64UrlToUtf8(s: string): string {
  let b64 = s.replace(/-/g, '+').replace(/_/g, '/')
  while (b64.length % 4) b64 += '='
  const bin = atob(b64)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return new TextDecoder().decode(bytes)
}

/** Encode l’état du simulateur pour l’URL (paramètre unique `sim`) */
export function serializeSimulatorData(data: SimulatorData): string {
  const payload = {
    v: SIM_QUERY_SCHEMA,
    ...stripDataForQuery(data),
  }
    const json = JSON.stringify(payload)
    return utf8ToBase64Url(json)
}

/** Retire les champs non sérialisables (au cas où) — aujourd’hui tout est primitif */
function stripDataForQuery(d: SimulatorData): SimulatorData {
    return { ...d }
}

/** Décode le paramètre `sim` ; retourne `null` si invalide ou mauvaise version */
export function deserializeSimulatorQuery(simParam: string): Record<string, unknown> | null {
    try {
        const json = base64UrlToUtf8(simParam)
        const o = JSON.parse(json) as { v?: number } & Record<string, unknown>
        if (o.v !== SIM_QUERY_SCHEMA) return null
        const { v: _v, ...rest } = o
        return rest
    } catch {
        return null
    }
}
