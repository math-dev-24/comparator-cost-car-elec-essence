<script setup lang="ts">
import { formatFrInt, SIMULATOR_COLORS, useSimulatorStore } from '@/stores/simulator'
import Card from 'primevue/card'
import InputNumber from 'primevue/inputnumber'

defineOptions({ name: 'SimulatorPurchaseCard' })

const store = useSimulatorStore()

const accent = {
  ev: SIMULATOR_COLORS.ev,
  ice: SIMULATOR_COLORS.fuel,
}
</script>

<template>
  <Card class="sim-card">
    <template #title>Achat & revente</template>
    <template #content>
      <p class="card-intro">
        Côté <strong>électrique</strong>, on indique le prix d’achat du projet et une revente estimée à
        {{ store.data.simulationYears }} ans. Côté <strong>thermique</strong>, en général vous possédez déjà la voiture :
        la revente à l’horizon est l’élément clé ; la valeur actuelle sert à étaler la décote sur la période (et au crédit
        éventuel).
      </p>

      <div class="purchase-encarts">
        <section
          class="purchase-encart purchase-encart--ev"
          :style="{ '--encart-accent': accent.ev }"
          :aria-label="`Achat et revente — ${store.data.evLabel}`"
        >
          <header class="encart-head">
            <h2 class="encart-title">{{ store.data.evLabel }}</h2>
            <p class="encart-sub">Projet véhicule électrique</p>
          </header>
          <div class="encart-fields">
            <div>
              <label class="inlabel">Prix d’achat</label>
              <InputNumber
                v-model="store.data.evPurchasePrice"
                class="w-full inumber"
                :min="0"
                :max="800000"
                :step="500"
                mode="currency"
                currency="EUR"
                locale="fr-FR"
              />
            </div>
            <div>
              <label class="inlabel">Valeur de revente estimée dans {{ store.data.simulationYears }} ans</label>
              <InputNumber
                v-model="store.data.evReprise"
                class="w-full inumber"
                :min="0"
                :max="800000"
                :step="500"
                mode="currency"
                currency="EUR"
                locale="fr-FR"
              />
            </div>
          </div>
          <p class="encart-foot">
            Décote sur la période :
            <strong>{{ formatFrInt(store.data.evPurchasePrice - store.data.evReprise) }} €</strong>
          </p>
        </section>

        <section
          class="purchase-encart purchase-encart--ice"
          :style="{ '--encart-accent': accent.ice }"
          :aria-label="`Revente thermique — ${store.data.iceLabel}`"
        >
          <header class="encart-head">
            <h2 class="encart-title">{{ store.data.iceLabel }}</h2>
            <p class="encart-sub">Thermique / diesel (référence ou véhicule actuel)</p>
          </header>
          <div class="encart-fields">
            <div>
              <label class="inlabel">Valeur de revente estimée dans {{ store.data.simulationYears }} ans</label>
              <InputNumber
                v-model="store.data.iceReprise"
                class="w-full inumber"
                :min="0"
                :max="800000"
                :step="500"
                mode="currency"
                currency="EUR"
                locale="fr-FR"
              />
            </div>
            <div>
              <label class="inlabel">Valeur actuelle du véhicule</label>
              <InputNumber
                v-model="store.data.icePurchasePrice"
                class="w-full inumber"
                :min="0"
                :max="800000"
                :step="500"
                mode="currency"
                currency="EUR"
                locale="fr-FR"
              />
              <p class="field-micro">
                Sert à calculer la perte de valeur mois par mois et le capital pour un crédit sur cette voiture.
              </p>
            </div>
          </div>
          <p class="encart-foot">
            Décote sur la période :
            <strong>{{ formatFrInt(store.data.icePurchasePrice - store.data.iceReprise) }} €</strong>
          </p>
        </section>
      </div>

      <p class="hint mb-0">
        Coût « véhicule » net sur l’horizon (achat ou valeur actuelle − revente) :
        <strong class="metric-ev">{{ formatFrInt(store.netVehicleCostEv) }} €</strong> ({{ store.data.evLabel }}) ·
        <strong class="metric-fuel">{{ formatFrInt(store.netVehicleCostIce) }} €</strong> ({{ store.data.iceLabel }})
      </p>
    </template>
  </Card>
</template>

<style scoped>
.w-full {
  width: 100%;
}

.mb-0 {
  margin-bottom: 0;
}

.purchase-encarts {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  margin-top: 4px;
}

.purchase-encart {
  border-radius: 10px;
  padding: 14px 16px;
  border: 1px solid rgba(26, 26, 24, 0.1);
  background: rgba(255, 255, 255, 0.35);
  box-shadow: inset 3px 0 0 0 var(--encart-accent);
}

.encart-head {
  margin-bottom: 12px;
}

.encart-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #1a1a18;
}

.encart-sub {
  margin: 4px 0 0;
  font-size: 12px;
  line-height: 1.4;
  color: #5f5e5a;
}

.encart-fields {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.field-micro {
  margin: 6px 0 0;
  font-size: 11px;
  line-height: 1.45;
  color: #888780;
}

.encart-foot {
  margin: 12px 0 0;
  font-size: 12px;
  color: #5f5e5a;
}

.metric-ev {
  color: #0f6e56;
}

.metric-fuel {
  color: #993c1d;
}

@media (max-width: 768px) {
  .purchase-encarts {
    grid-template-columns: 1fr;
  }
}
</style>
