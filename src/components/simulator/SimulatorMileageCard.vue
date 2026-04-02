<script setup lang="ts">
import SliderField from '@/components/simulator/SliderField.vue'
import {
  formatFrInt,
  KM_PER_YEAR_MAX,
  KM_PER_YEAR_MIN,
  useSimulatorStore,
} from '@/stores/simulator'
import Card from 'primevue/card'
import InputNumber from 'primevue/inputnumber'
import SelectButton from 'primevue/selectbutton'

defineOptions({ name: 'SimulatorMileageCard' })

const store = useSimulatorStore()

const mileageModeOptions = [
  { label: 'Km/jour & jours/mois', value: 'trip' as const },
  { label: 'Km/an par véhicule', value: 'direct' as const },
]
</script>

<template>
  <Card class="sim-card">
    <template #title>Kilométrage</template>
    <template #content>
      <p class="card-intro mb-3">
        Une seule logique à la fois, avec les <strong>mêmes bornes annuelles</strong> ({{ formatFrInt(KM_PER_YEAR_MIN) }}–{{
          formatFrInt(KM_PER_YEAR_MAX)
        }}
        km/an). En mode trajet, l’électrique et le thermique partagent le même kilométrage annuel. En mode direct, vous
        pouvez les différencier.
      </p>
      <div class="mb-4">
        <label class="inlabel">Mode</label>
        <SelectButton
          v-model="store.data.mileageInputMode"
          :options="mileageModeOptions"
          option-label="label"
          option-value="value"
          class="w-full mode-toggle"
        />
      </div>

      <template v-if="store.data.mileageInputMode === 'trip'">
        <p class="section-hint">Paramètres du trajet</p>
        <SliderField
          v-model="store.data.kmPerDay"
          label="Distance / jour (km)"
          :min="store.tripKmPerDayMin"
          :max="store.tripKmPerDayMax"
          :step="1"
          :format="(v) => `${Math.round(v)} km`"
        />
        <SliderField
          v-model="store.data.daysPerMonth"
          label="Jours / mois"
          :min="store.tripDaysMin"
          :max="store.tripDaysMax"
          :step="1"
          :format="(v) => `${Math.round(v)} j`"
        />
        <div class="readout">
          <p class="readout-main">
            ≈ <strong>{{ formatFrInt(Math.round(store.distanceKmMonthFromTrip)) }} km</strong> / mois ·
            <strong>{{ formatFrInt(store.annualKmFromTrip) }} km</strong> / an (identique pour les deux véhicules)
          </p>
          <p class="readout-sub">Plage km/an : {{ formatFrInt(KM_PER_YEAR_MIN) }}–{{ formatFrInt(KM_PER_YEAR_MAX) }} km</p>
        </div>
      </template>

      <template v-else>
        <p class="section-hint">Km/an (saisie directe)</p>
        <SliderField
          v-model="store.data.evKmPerYear"
          :label="`Km / an — ${store.data.evLabel}`"
          :min="KM_PER_YEAR_MIN"
          :max="KM_PER_YEAR_MAX"
          :step="100"
          :format="(v) => `${formatFrInt(v)} km`"
        />
        <SliderField
          v-model="store.data.iceKmPerYear"
          :label="`Km / an — ${store.data.iceLabel}`"
          :min="KM_PER_YEAR_MIN"
          :max="KM_PER_YEAR_MAX"
          :step="100"
          :format="(v) => `${formatFrInt(v)} km`"
        />
      </template>

      <p class="section-hint mt-4">Compteur initial</p>
      <div class="num-pair-grid">
        <div>
          <label class="inlabel" for="ev-init-km">Km initiaux — {{ store.data.evLabel }}</label>
          <InputNumber
            id="ev-init-km"
            v-model="store.data.evInitialKm"
            class="w-full inumber"
            :min="0"
            :max="500000"
            :step="1000"
            locale="fr-FR"
            suffix=" km"
          />
        </div>
        <div>
          <label class="inlabel" for="ice-init-km">Km initiaux — {{ store.data.iceLabel }}</label>
          <InputNumber
            id="ice-init-km"
            v-model="store.data.iceInitialKm"
            class="w-full inumber"
            :min="0"
            :max="500000"
            :step="1000"
            locale="fr-FR"
            suffix=" km"
          />
        </div>
      </div>
      <div class="odom-grid">
        <div class="metric metric-inline">
          <p class="metric-label">Compteur fin année {{ store.data.simulationYears }} — {{ store.data.evLabel }}</p>
          <p class="metric-value metric-ev">{{ formatFrInt(store.evKmEndOfHorizon) }} km</p>
        </div>
        <div class="metric metric-inline">
          <p class="metric-label">Compteur fin année {{ store.data.simulationYears }} — {{ store.data.iceLabel }}</p>
          <p class="metric-value metric-fuel">{{ formatFrInt(store.iceKmEndOfHorizon) }} km</p>
        </div>
      </div>
    </template>
  </Card>
</template>

<style scoped>
.mb-3 {
  margin-bottom: 0.75rem;
}
.mb-4 {
  margin-bottom: 1rem;
}
.mt-4 {
  margin-top: 1rem;
}
.w-full {
  width: 100%;
}
.mode-toggle {
  max-width: 100%;
}
.section-hint {
  margin: 0 0 10px;
  font-size: 12px;
  font-weight: 600;
  color: #5f5e5a;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.readout {
  margin-top: 4px;
  padding: 10px 12px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.45);
  border: 1px solid rgba(26, 26, 24, 0.08);
}
.readout-main {
  margin: 0;
  font-size: 13px;
  color: #1a1a18;
  line-height: 1.45;
}
.readout-sub {
  margin: 6px 0 0;
  font-size: 11px;
  color: #888780;
}
</style>
