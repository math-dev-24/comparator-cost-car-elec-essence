<script setup lang="ts">
import { useLocaleFormat } from '@/composables/useLocaleFormat'
import { useSimulatorStore } from '@/stores/simulator'
import Card from 'primevue/card'
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'
import { useI18n } from 'vue-i18n'

defineOptions({ name: 'SimulatorYearlyTable' })

const store = useSimulatorStore()
const { t } = useI18n()
const { fmtInt } = useLocaleFormat()

function formatDelta(n: number): string {
  const v = Math.round(n)
  const s = fmtInt(Math.abs(v))
  if (v > 0) return `+${s}`
  if (v < 0) return `−${s}`
  return s
}

function cellDeltaClass(n: number): string {
  if (n > 0) return 'cell-delta-pos'
  if (n < 0) return 'cell-delta-neg'
  return 'cell-delta-zero'
}
</script>

<template>
  <Card class="sim-card">
    <template #title>{{ t('yearly.title', { n: store.data.simulationYears }) }}</template>
    <template #content>
      <div class="legend-box">
        <p class="legend-title">{{ t('yearly.howToRead') }}</p>
        <ul class="legend-list">
          <li v-html="t('yearly.legendCost', { ev: store.data.evLabel, ice: store.data.iceLabel })" />
          <li v-html="t('yearly.legendDelta')" />
          <li v-html="t('yearly.legendCumul')" />
        </ul>
      </div>

      <DataTable
        :value="store.yearlyBreakdown"
        striped-rows
        size="small"
        scrollable
        scroll-height="400px"
        class="year-table"
      >
        <Column field="year" :header="t('yearly.colYear')" frozen style="width: 4rem" />
        <Column field="evKm" :header="t('yearly.colKm', { label: store.data.evLabel })">
          <template #body="{ data }">{{ fmtInt(data.evKm) }}</template>
        </Column>
        <Column field="iceKm" :header="t('yearly.colKm', { label: store.data.iceLabel })">
          <template #body="{ data }">{{ fmtInt(data.iceKm) }}</template>
        </Column>
        <Column :header="t('yearly.colCostElec')">
          <template #body="{ data }">
            <div class="cost-cell">
              <span class="cost-main">{{ fmtInt(data.evCostYear) }} €</span>
              <span class="cost-detail">{{
                t('yearly.costDetail', {
                  usage: fmtInt(data.evUsageYear),
                  vehicle: fmtInt(data.evVehicleYear),
                })
              }}</span>
            </div>
          </template>
        </Column>
        <Column :header="t('yearly.colCostIce')">
          <template #body="{ data }">
            <div class="cost-cell">
              <span class="cost-main">{{ fmtInt(data.iceCostYear) }} €</span>
              <span class="cost-detail">{{
                t('yearly.costDetail', {
                  usage: fmtInt(data.iceUsageYear),
                  vehicle: fmtInt(data.iceVehicleYear),
                })
              }}</span>
            </div>
          </template>
        </Column>
        <Column :header="t('yearly.colDelta')">
          <template #body="{ data }">
            <span class="delta-cell" :class="cellDeltaClass(data.deltaYear)">{{ formatDelta(data.deltaYear) }} €</span>
          </template>
        </Column>
        <Column :header="t('yearly.colDeltaCumul')">
          <template #body="{ data }">
            <span class="delta-cell" :class="cellDeltaClass(data.deltaCumulative)">{{
              formatDelta(data.deltaCumulative)
            }}
            €</span>
          </template>
        </Column>
      </DataTable>

      <div class="totals-footer" :class="cellDeltaClass(store.savingsSimulation)">
        <p class="totals-title">{{ t('yearly.footerTitle', { y: store.data.simulationYears }) }}</p>
        <p
          v-if="store.savingsSimulation > 0"
          class="totals-text"
          v-html="t('yearly.footerEvWins', { ev: store.data.evLabel, ice: store.data.iceLabel, amount: fmtInt(store.savingsSimulation) })"
        />
        <p
          v-else-if="store.savingsSimulation < 0"
          class="totals-text"
          v-html="t('yearly.footerIceWins', { ice: store.data.iceLabel, ev: store.data.evLabel, amount: fmtInt(Math.abs(store.savingsSimulation)) })"
        />
        <p v-else class="totals-text">{{ t('yearly.footerClose') }}</p>
        <p class="totals-sub">
          {{
            t('yearly.footerSub', {
              totalEv: fmtInt(store.totalSimulationElec),
              ev: store.data.evLabel,
              totalIce: fmtInt(store.totalSimulationFuel),
              ice: store.data.iceLabel,
              eqEv: fmtInt(store.equityEvAtHorizon),
              eqIce: fmtInt(store.equityIceAtHorizon),
            })
          }}
        </p>
      </div>
    </template>
  </Card>
</template>

<style scoped>
.legend-box {
  margin-bottom: 1rem;
  padding: 12px 14px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(26, 26, 24, 0.08);
}

.legend-title {
  margin: 0 0 8px;
  font-size: 12px;
  font-weight: 600;
  color: #1a1a18;
}

.legend-list {
  margin: 0;
  padding-left: 1.1rem;
  font-size: 12px;
  line-height: 1.5;
  color: #5f5e5a;
}

.legend-list li {
  margin-bottom: 6px;
}

.pos-ex {
  color: #0f6e56;
  font-weight: 600;
}

.neg-ex {
  color: #993c1d;
  font-weight: 600;
}

.cost-cell {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 7rem;
}

.cost-main {
  font-weight: 600;
  color: #1a1a18;
}

.cost-detail {
  font-size: 10px;
  color: #888780;
  line-height: 1.3;
}

.delta-cell {
  font-weight: 600;
  white-space: nowrap;
}

.cell-delta-pos {
  color: #0f6e56;
}

.cell-delta-neg {
  color: #993c1d;
}

.cell-delta-zero {
  color: #5f5e5a;
}

.totals-footer {
  margin-top: 1.25rem;
  padding: 1.1rem 1.25rem;
  border-radius: 10px;
  border: 1px solid rgba(26, 26, 24, 0.12);
  background: #f0efe9;
}

.totals-footer.cell-delta-pos {
  border-color: rgba(15, 110, 86, 0.3);
  background: linear-gradient(180deg, rgba(15, 110, 86, 0.08) 0%, #f0efe9 40%);
}

.totals-footer.cell-delta-neg {
  border-color: rgba(153, 60, 29, 0.3);
  background: linear-gradient(180deg, rgba(153, 60, 29, 0.07) 0%, #f0efe9 40%);
}

.totals-title {
  margin: 0 0 10px;
  font-size: 13px;
  font-weight: 700;
  color: #1a1a18;
}

.totals-text {
  margin: 0 0 10px;
  font-size: 14px;
  line-height: 1.5;
  color: #2b2b28;
}

.totals-sub {
  margin: 0;
  font-size: 12px;
  line-height: 1.45;
  color: #5f5e5a;
}
</style>
