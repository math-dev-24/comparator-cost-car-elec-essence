<script setup lang="ts">
import SimulatorChart from '@/components/simulator/SimulatorChart.vue'
import {
  formatFrInt,
  SIMULATOR_COLORS,
  useSimulatorStore,
} from '@/stores/simulator'

defineOptions({ name: 'SimulatorResultsPanel' })

const store = useSimulatorStore()

const y = () => store.data.simulationYears

const monthlyElecRounded = () => formatFrInt(Math.round(store.totalElecMonth))
const monthlyFuelRounded = () => formatFrInt(Math.round(store.totalFuelMonth))
const monthlySavingsAbs = () => formatFrInt(Math.abs(Math.round(store.savingsMonth)))
const savingsPeriodAbs = () => formatFrInt(Math.abs(store.savingsSimulation))

function deltaClass(n: number): string {
  if (n > 0) return 'delta-pos'
  if (n < 0) return 'delta-neg'
  return 'delta-zero'
}
</script>

<template>
  <div class="results-root">
    <section class="verdict-hero" :class="deltaClass(store.savingsSimulation)">
      <p class="verdict-label">Synthèse sur {{ y() }} ans (charges : énergie, entretien, assurance, crédit ou amort.)</p>
      <p v-if="store.savingsSimulation > 0" class="verdict-title">
        L’{{ store.data.evLabel.toLowerCase() }} revient <strong>moins cher</strong> que l’{{
          store.data.iceLabel.toLowerCase()
        }}
      </p>
      <p v-else-if="store.savingsSimulation < 0" class="verdict-title">
        L’{{ store.data.iceLabel.toLowerCase() }} revient <strong>moins cher</strong> que l’{{
          store.data.evLabel.toLowerCase()
        }}
      </p>
      <p v-else class="verdict-title">Coûts proches sur la période</p>
      <p class="verdict-amount">
        <template v-if="store.savingsSimulation !== 0">
          Écart : <strong>{{ savingsPeriodAbs() }} €</strong>
          <span class="verdict-hint">
            ({{ store.savingsSimulation > 0 ? `économie avec l’${store.data.evLabel}` : `économie avec l’${store.data.iceLabel}` }})
          </span>
        </template>
        <template v-else>Écart négligeable entre les deux scénarios.</template>
      </p>
    </section>

    <section class="kpi-row">
      <div class="kpi-card kpi-ev">
        <p class="kpi-label">Total {{ store.data.evLabel }}</p>
        <p class="kpi-value">{{ formatFrInt(store.totalSimulationElec) }} €</p>
        <p class="kpi-sub">sur {{ y() }} ans cumulés</p>
      </div>
      <div class="kpi-card kpi-ice">
        <p class="kpi-label">Total {{ store.data.iceLabel }}</p>
        <p class="kpi-value">{{ formatFrInt(store.totalSimulationFuel) }} €</p>
        <p class="kpi-sub">sur {{ y() }} ans cumulés</p>
      </div>
      <div class="kpi-card kpi-delta" :class="deltaClass(store.savingsSimulation)">
        <p class="kpi-label">Écart (thermique − électrique)</p>
        <p class="kpi-value">
          {{ store.savingsSimulation >= 0 ? '+' : '−' }}{{ formatFrInt(Math.abs(store.savingsSimulation)) }} €
        </p>
        <p class="kpi-sub">positif = avantage {{ store.data.evLabel }}</p>
      </div>
    </section>

    <section class="detail-grid">
      <div class="detail-card">
        <p class="detail-title">Moyenne 1ʳᵉ année</p>
        <p class="detail-line">
          <span>{{ store.data.evLabel }}</span>
          <span class="detail-ev">{{ monthlyElecRounded() }} € / mois</span>
        </p>
        <p class="detail-line">
          <span>{{ store.data.iceLabel }}</span>
          <span class="detail-ice">{{ monthlyFuelRounded() }} € / mois</span>
        </p>
        <p class="detail-line detail-delta">
          <span>Écart mensuel</span>
          <span :class="deltaClass(store.savingsMonth)">
            {{ store.savingsMonth >= 0 ? '+' : '−' }}{{ monthlySavingsAbs() }} €
          </span>
        </p>
      </div>
      <div class="detail-card">
        <p class="detail-title">Usage seul (sans véhicule)</p>
        <p class="detail-line">
          <span>Économie {{ y() }} ans</span>
          <span :class="deltaClass(store.savingsRunningOnly)">
            {{ store.savingsRunningOnly >= 0 ? '+' : '−'
            }}{{ formatFrInt(Math.abs(store.savingsRunningOnly)) }} €
          </span>
        </p>
        <p class="detail-note">Énergie + entretien + assurance, sans crédit ni amortissement achat.</p>
      </div>
      <div class="detail-card">
        <p class="detail-title">Achat / vente (fin de période)</p>
        <p class="detail-line">
          <span>Equité nette estimée — {{ store.data.evLabel }}</span>
          <span class="detail-ev">{{ formatFrInt(store.equityEvAtHorizon) }} €</span>
        </p>
        <p class="detail-line">
          <span>Equité nette estimée — {{ store.data.iceLabel }}</span>
          <span class="detail-ice">{{ formatFrInt(store.equityIceAtHorizon) }} €</span>
        </p>
        <p class="detail-line detail-delta">
          <span>Écart (élec − therm.)</span>
          <span :class="deltaClass(store.equityDeltaAtHorizon)">
            {{
              store.equityDeltaAtHorizon >= 0 ? '+' : '−'
            }}{{ formatFrInt(Math.abs(store.equityDeltaAtHorizon)) }} €
          </span>
        </p>
        <p class="detail-note">
          Valeur de reprise linéaire − crédit restant (si prêt). Positif = meilleure position côté
          {{ store.data.evLabel }} à la revente.
        </p>
      </div>
    </section>

    <div class="chart-legend-block">
      <p class="chart-legend-title">Graphique — coûts cumulés</p>
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
          ><span class="legend-dot" :style="{ background: SIMULATOR_COLORS.savings }" />Écart cumulé (therm. −
          élec.) — au-dessus de 0 = avantage électrique</span
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
