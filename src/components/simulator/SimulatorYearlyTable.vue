<script setup lang="ts">
import { formatFrInt, useSimulatorStore } from '@/stores/simulator'
import Card from 'primevue/card'
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'

defineOptions({ name: 'SimulatorYearlyTable' })

const store = useSimulatorStore()

function formatDelta(n: number): string {
  const v = Math.round(n)
  const s = formatFrInt(Math.abs(v))
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
    <template #title>Détail par année ({{ store.data.simulationYears }} ans)</template>
    <template #content>
      <div class="legend-box">
        <p class="legend-title">Comment lire le tableau</p>
        <ul class="legend-list">
          <li>
            <strong>Coût {{ store.data.evLabel }} / {{ store.data.iceLabel }}</strong> : énergie + entretien +
            assurance + mensualités de crédit <em>ou</em> amortissement linéaire (achat − reprise) sur l’horizon
            choisi.
          </li>
          <li>
            <strong>Δ / an</strong> : coût thermique − coût électrique.
            <span class="pos-ex">Positif</span> = cette année l’électrique coûte <strong>moins cher</strong> (gain).
            <span class="neg-ex">Négatif</span> = l’électrique coûte <strong>plus cher</strong> (perte vs thermique).
          </li>
          <li><strong>Δ cumulé</strong> : somme des Δ / an — même signe : avantage cumulé pour l’électrique si positif.</li>
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
        <Column field="year" header="Année" frozen style="width: 4rem" />
        <Column field="evKm" :header="`Km ${store.data.evLabel}`">
          <template #body="{ data }">{{ formatFrInt(data.evKm) }}</template>
        </Column>
        <Column field="iceKm" :header="`Km ${store.data.iceLabel}`">
          <template #body="{ data }">{{ formatFrInt(data.iceKm) }}</template>
        </Column>
        <Column header="Coût élec (énergie, maint., crédit/amort.)">
          <template #body="{ data }">
            <div class="cost-cell">
              <span class="cost-main">{{ formatFrInt(data.evCostYear) }} €</span>
              <span class="cost-detail"
                >dont usage {{ formatFrInt(data.evUsageYear) }} € · véh.
                {{ formatFrInt(data.evVehicleYear) }} €</span
              >
            </div>
          </template>
        </Column>
        <Column header="Coût essence (énergie, maint., crédit/amort.)">
          <template #body="{ data }">
            <div class="cost-cell">
              <span class="cost-main">{{ formatFrInt(data.iceCostYear) }} €</span>
              <span class="cost-detail"
                >dont usage {{ formatFrInt(data.iceUsageYear) }} € · véh.
                {{ formatFrInt(data.iceVehicleYear) }} €</span
              >
            </div>
          </template>
        </Column>
        <Column header="Δ / an (therm. − élec.)">
          <template #body="{ data }">
            <span class="delta-cell" :class="cellDeltaClass(data.deltaYear)">{{ formatDelta(data.deltaYear) }} €</span>
          </template>
        </Column>
        <Column header="Δ cumulé">
          <template #body="{ data }">
            <span class="delta-cell" :class="cellDeltaClass(data.deltaCumulative)">{{
              formatDelta(data.deltaCumulative)
            }}
            €</span>
          </template>
        </Column>
      </DataTable>

      <div class="totals-footer" :class="cellDeltaClass(store.savingsSimulation)">
        <p class="totals-title">Bilan sur {{ store.data.simulationYears }} ans (achat, utilisation, revente modélisée)</p>
        <p v-if="store.savingsSimulation > 0" class="totals-text">
          Avec vos hypothèses, le véhicule <strong>{{ store.data.evLabel }}</strong> représente un coût total de charges
          inférieur de <strong>{{ formatFrInt(store.savingsSimulation) }} €</strong> par rapport au
          {{ store.data.iceLabel }} sur la période.
        </p>
        <p v-else-if="store.savingsSimulation < 0" class="totals-text">
          Avec vos hypothèses, le véhicule <strong>{{ store.data.iceLabel }}</strong> représente un coût total de charges
          inférieur de <strong>{{ formatFrInt(Math.abs(store.savingsSimulation)) }} €</strong> par rapport à l’{{
            store.data.evLabel
          }}
          sur la période.
        </p>
        <p v-else class="totals-text">Les deux scénarios sont très proches en coûts de charges sur la période.</p>
        <p class="totals-sub">
          Totaux cumulés : {{ formatFrInt(store.totalSimulationElec) }} € ({{ store.data.evLabel }}) ·
          {{ formatFrInt(store.totalSimulationFuel) }} € ({{ store.data.iceLabel }}). Équité estimée à la revente (valeur
          − crédit) : {{ formatFrInt(store.equityEvAtHorizon) }} € vs {{ formatFrInt(store.equityIceAtHorizon) }} €.
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
