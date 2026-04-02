<script setup lang="ts">
import SimulatorChart from '@/components/simulator/SimulatorChart.vue'
import { useLocaleFormat } from '@/composables/useLocaleFormat'
import { SIMULATOR_COLORS, useSimulatorStore } from '@/stores/simulator'
import { useI18n } from 'vue-i18n'

defineOptions({ name: 'SimulatorResultsPanel' })

const store = useSimulatorStore()
const { t } = useI18n()
const { fmtInt } = useLocaleFormat()

const y = () => store.data.simulationYears

const monthlyElecRounded = () => fmtInt(Math.round(store.totalElecMonth))
const monthlyFuelRounded = () => fmtInt(Math.round(store.totalFuelMonth))
const monthlySavingsAbs = () => fmtInt(Math.abs(Math.round(store.savingsMonth)))
const savingsPeriodAbs = () => fmtInt(Math.abs(store.savingsSimulation))

function deltaClass(n: number): string {
  if (n > 0) return 'delta-pos'
  if (n < 0) return 'delta-neg'
  return 'delta-zero'
}

function evLower() {
  return store.data.evLabel.toLowerCase()
}

function iceLower() {
  return store.data.iceLabel.toLowerCase()
}
</script>

<template>
  <div class="results-root">
    <section class="verdict-hero" :class="deltaClass(store.savingsSimulation)">
      <p class="verdict-label">{{ t('results.verdictLabel', { y: y() }) }}</p>
      <p v-if="store.savingsSimulation > 0" class="verdict-title" v-html="t('results.verdictEvCheaper', { ev: evLower(), ice: iceLower() })" />
      <p v-else-if="store.savingsSimulation < 0" class="verdict-title" v-html="t('results.verdictIceCheaper', { ev: evLower(), ice: iceLower() })" />
      <p v-else class="verdict-title">{{ t('results.verdictClose') }}</p>
      <p class="verdict-amount">
        <template v-if="store.savingsSimulation !== 0">
          {{ t('results.gapLabel') }} <strong>{{ savingsPeriodAbs() }} €</strong>
          <span class="verdict-hint">
            ({{
              store.savingsSimulation > 0
                ? t('results.gapHintEv', { label: store.data.evLabel })
                : t('results.gapHintIce', { label: store.data.iceLabel })
            }})
          </span>
        </template>
        <template v-else>{{ t('results.gapNegligible') }}</template>
      </p>
    </section>

    <section class="kpi-row">
      <div class="kpi-card kpi-ev">
        <p class="kpi-label">{{ t('results.totalVehicle', { label: store.data.evLabel }) }}</p>
        <p class="kpi-value">{{ fmtInt(store.totalSimulationElec) }} €</p>
        <p class="kpi-sub">{{ t('results.cumulativeYears', { y: y() }) }}</p>
      </div>
      <div class="kpi-card kpi-ice">
        <p class="kpi-label">{{ t('results.totalVehicle', { label: store.data.iceLabel }) }}</p>
        <p class="kpi-value">{{ fmtInt(store.totalSimulationFuel) }} €</p>
        <p class="kpi-sub">{{ t('results.cumulativeYears', { y: y() }) }}</p>
      </div>
      <div class="kpi-card kpi-delta" :class="deltaClass(store.savingsSimulation)">
        <p class="kpi-label">{{ t('results.deltaKpi') }}</p>
        <p class="kpi-value">
          {{ store.savingsSimulation >= 0 ? '+' : '−' }}{{ fmtInt(Math.abs(store.savingsSimulation)) }} €
        </p>
        <p class="kpi-sub">{{ t('results.deltaKpiSub', { ev: store.data.evLabel }) }}</p>
      </div>
    </section>

    <section class="detail-grid">
      <div class="detail-card">
        <p class="detail-title">{{ t('results.firstYearAvg') }}</p>
        <p class="detail-line">
          <span>{{ store.data.evLabel }}</span>
          <span class="detail-ev">{{ monthlyElecRounded() }} {{ t('results.perMonth') }}</span>
        </p>
        <p class="detail-line">
          <span>{{ store.data.iceLabel }}</span>
          <span class="detail-ice">{{ monthlyFuelRounded() }} {{ t('results.perMonth') }}</span>
        </p>
        <p class="detail-line detail-delta">
          <span>{{ t('results.monthlyGap') }}</span>
          <span :class="deltaClass(store.savingsMonth)">
            {{ store.savingsMonth >= 0 ? '+' : '−' }}{{ monthlySavingsAbs() }} €
          </span>
        </p>
      </div>
      <div class="detail-card">
        <p class="detail-title">{{ t('results.usageOnly') }}</p>
        <p class="detail-line">
          <span>{{ t('results.savingsYears', { y: y() }) }}</span>
          <span :class="deltaClass(store.savingsRunningOnly)">
            {{ store.savingsRunningOnly >= 0 ? '+' : '−'
            }}{{ fmtInt(Math.abs(store.savingsRunningOnly)) }} €
          </span>
        </p>
        <p class="detail-note">{{ t('results.usageNote') }}</p>
      </div>
      <div class="detail-card">
        <p class="detail-title">{{ t('results.buySellEnd') }}</p>
        <p class="detail-line">
          <span>{{ t('results.equityEv', { label: store.data.evLabel }) }}</span>
          <span class="detail-ev">{{ fmtInt(store.equityEvAtHorizon) }} €</span>
        </p>
        <p class="detail-line">
          <span>{{ t('results.equityIce', { label: store.data.iceLabel }) }}</span>
          <span class="detail-ice">{{ fmtInt(store.equityIceAtHorizon) }} €</span>
        </p>
        <p class="detail-line detail-delta">
          <span>{{ t('results.equityGap') }}</span>
          <span :class="deltaClass(store.equityDeltaAtHorizon)">
            {{
              store.equityDeltaAtHorizon >= 0 ? '+' : '−'
            }}{{ fmtInt(Math.abs(store.equityDeltaAtHorizon)) }} €
          </span>
        </p>
        <p class="detail-note">{{ t('results.equityNote', { ev: store.data.evLabel }) }}</p>
      </div>
    </section>

    <div class="chart-legend-block">
      <p class="chart-legend-title">{{ t('results.chartLegendTitle') }}</p>
      <div class="legend">
        <span
          ><span class="legend-dot" :style="{ background: SIMULATOR_COLORS.fuel }" />{{
            store.data.iceLabel
          }}</span
        >
        <span
          ><span class="legend-dot" :style="{ background: SIMULATOR_COLORS.ev }" />{{ store.data.evLabel }}</span
        >
        <span
          ><span class="legend-dot" :style="{ background: SIMULATOR_COLORS.savings }" />{{
            t('results.chartLegendCumulative')
          }}</span
        >
      </div>
    </div>

    <SimulatorChart />
  </div>
</template>

<style scoped>
.results-root {
  margin-top: 0.25rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.verdict-hero {
  border-radius: 12px;
  padding: 1.25rem 1.35rem;
  border: 1px solid rgba(26, 26, 24, 0.12);
  background: #ebe9e2;
}

.verdict-hero.delta-pos {
  border-color: rgba(15, 110, 86, 0.35);
  background: linear-gradient(135deg, rgba(15, 110, 86, 0.12) 0%, #ebe9e2 55%);
}

.verdict-hero.delta-neg {
  border-color: rgba(153, 60, 29, 0.35);
  background: linear-gradient(135deg, rgba(153, 60, 29, 0.1) 0%, #ebe9e2 55%);
}

.verdict-label {
  margin: 0 0 0.5rem;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #5f5e5a;
}

.verdict-title {
  margin: 0 0 0.35rem;
  font-size: 1.05rem;
  font-weight: 600;
  color: #1a1a18;
  line-height: 1.35;
}

.verdict-amount {
  margin: 0;
  font-size: 15px;
  color: #2b2b28;
}

.verdict-hint {
  display: block;
  margin-top: 0.35rem;
  font-size: 13px;
  color: #5f5e5a;
}

.kpi-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.kpi-card {
  border-radius: 10px;
  padding: 14px;
  background: #ebe9e2;
  border: 1px solid rgba(26, 26, 24, 0.08);
}

.kpi-ev .kpi-value {
  color: #0f6e56;
}

.kpi-ice .kpi-value {
  color: #993c1d;
}

.kpi-delta.delta-pos .kpi-value {
  color: #0f6e56;
}

.kpi-delta.delta-neg .kpi-value {
  color: #993c1d;
}

.kpi-label {
  margin: 0 0 4px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #5f5e5a;
}

.kpi-value {
  margin: 0;
  font-size: 22px;
  font-weight: 600;
}

.kpi-sub {
  margin: 6px 0 0;
  font-size: 12px;
  color: #888780;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.detail-card {
  border-radius: 10px;
  padding: 14px;
  background: rgba(255, 255, 255, 0.45);
  border: 1px solid rgba(26, 26, 24, 0.08);
}

.detail-title {
  margin: 0 0 10px;
  font-size: 12px;
  font-weight: 600;
  color: #1a1a18;
}

.detail-line {
  margin: 0 0 6px;
  display: flex;
  justify-content: space-between;
  gap: 8px;
  font-size: 13px;
  color: #3d3d3a;
}

.detail-delta {
  font-weight: 600;
  padding-top: 6px;
  margin-top: 4px;
  border-top: 1px solid rgba(26, 26, 24, 0.08);
}

.detail-ev {
  color: #0f6e56;
  font-weight: 500;
}

.detail-ice {
  color: #993c1d;
  font-weight: 500;
}

.detail-note {
  margin: 8px 0 0;
  font-size: 11px;
  line-height: 1.45;
  color: #888780;
}

.delta-pos {
  color: #0f6e56;
}

.delta-neg {
  color: #993c1d;
}

.delta-zero {
  color: #5f5e5a;
}

.chart-legend-block {
  margin-top: 0.25rem;
}

.chart-legend-title {
  margin: 0 0 0.5rem;
  font-size: 12px;
  font-weight: 600;
  color: #5f5e5a;
}

@media (max-width: 900px) {
  .kpi-row,
  .detail-grid {
    grid-template-columns: 1fr;
  }
}
</style>
