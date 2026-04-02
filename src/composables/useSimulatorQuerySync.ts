import { useSimulatorStore } from '@/stores/simulator'
import {
  QUERY_KEY_SIM,
  QUERY_KEY_TAB,
  deserializeSimulatorQuery,
  serializeSimulatorData,
} from '@/utils/simulatorQuery'
import { onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export type SimulatorTab = 'financing' | 'mileage' | 'purchase' | 'costs' | 'results'

const VALID_TABS: readonly SimulatorTab[] = [
  'financing',
  'mileage',
  'purchase',
  'costs',
  'results',
]

const LEGACY_TAB_MAP: Record<string, SimulatorTab> = {
  params: 'financing',
}

function tabFromQuery(raw: unknown): SimulatorTab | null {
  if (typeof raw !== 'string') return null
  const mapped = LEGACY_TAB_MAP[raw]
  if (mapped) return mapped
  if ((VALID_TABS as readonly string[]).includes(raw)) return raw as SimulatorTab
  return null
}

/** Sync `data` ↔ `?sim=` (base64 JSON) et onglet ↔ `?tab=` */
export function useSimulatorQuerySync() {
  const route = useRoute()
  const router = useRouter()
  const store = useSimulatorStore()
  const activeTab = ref<SimulatorTab>('financing')

  let applyingFromRoute = false
  let lastPushedSim: string | undefined
  let debounceTimer: ReturnType<typeof setTimeout> | null = null
  const DEBOUNCE_MS = 320

  function applySimFromRoute(): void {
    const raw = route.query[QUERY_KEY_SIM]
    if (typeof raw !== 'string' || raw.length < 4) return
    const patch = deserializeSimulatorQuery(raw)
    if (!patch || typeof patch !== 'object') return
    applyingFromRoute = true
    store.applyQuerySnapshot(patch)
    applyingFromRoute = false
  }

  function readTabFromRoute(): void {
    const t = tabFromQuery(route.query[QUERY_KEY_TAB])
    if (t !== null) activeTab.value = t
  }

  function schedulePushQuery(): void {
    if (applyingFromRoute) return
    if (debounceTimer != null) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(pushQueryFromStore, DEBOUNCE_MS)
  }

  function pushQueryFromStore(): void {
    debounceTimer = null
    if (applyingFromRoute) return
    const sim = serializeSimulatorData(store.data)
    const tab = activeTab.value
    const q = route.query as Record<string, unknown>
    if (q[QUERY_KEY_SIM] === sim && q[QUERY_KEY_TAB] === tab) return
    lastPushedSim = sim
    router.replace({
      path: route.path,
      query: { ...route.query, [QUERY_KEY_SIM]: sim, [QUERY_KEY_TAB]: tab },
    })
  }

  onMounted(() => {
    applySimFromRoute()
    readTabFromRoute()
  })

  watch(
    () => route.query[QUERY_KEY_SIM],
    (sim) => {
      if (typeof sim !== 'string') return
      if (lastPushedSim !== undefined && sim === lastPushedSim) {
        lastPushedSim = undefined
        return
      }
      applySimFromRoute()
    },
  )

  watch(() => route.query[QUERY_KEY_TAB], readTabFromRoute)

  watch(
    () => store.data,
    () => {
      schedulePushQuery()
    },
    { deep: true },
  )

  watch(activeTab, () => {
    schedulePushQuery()
  })

  return { activeTab }
}
