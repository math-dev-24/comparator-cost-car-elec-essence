<script setup lang="ts">
import { SIMULATION_YEAR_OPTIONS, useSimulatorStore } from '@/stores/simulator'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'

defineOptions({ name: 'SimulatorHeader' })

const store = useSimulatorStore()

const simulationYearOptions = SIMULATION_YEAR_OPTIONS.map((n) => ({
  label: `${n} ans`,
  value: n,
}))
</script>

<template>
  <header class="sim-header">
    <div class="sim-title-block">
      <h1 class="sim-h1">TCO simulateur</h1>
      <p class="sim-sub">
        Pour estimer si passer à l’électrique vaut le coup : comparez usage (énergie, entretien, assurance), financement et
        valeur à la revente sur la même durée. Habituellement : votre thermique / diesel actuel face au véhicule électrique
        envisagé.
      </p>
    </div>

    <div class="vehicle-row" aria-label="Libellés de comparaison">
      <div class="vehicle-field">
        <label class="vehicle-field-label" for="ev-name">Véhicule électrique</label>
        <InputText id="ev-name" v-model="store.data.evLabel" class="vehicle-input w-full" autocomplete="off" />
      </div>
      <span class="vehicle-vs">vs</span>
      <div class="vehicle-field">
        <label class="vehicle-field-label" for="ice-name">Thermique</label>
        <InputText id="ice-name" v-model="store.data.iceLabel" class="vehicle-input w-full" autocomplete="off" />
      </div>
    </div>

    <div class="horizon-bar" role="group" aria-label="Horizon de simulation">
      <div class="horizon-bar-inner">
        <label class="horizon-label" for="header-sim-years">Horizon de comparaison</label>
        <Select
          id="header-sim-years"
          v-model="store.data.simulationYears"
          :options="simulationYearOptions"
          option-label="label"
          option-value="value"
          class="horizon-select"
        />
      </div>
      <p class="horizon-hint">
        Durée sur laquelle sont calculés le tableau annuel, le graphique et la perte de valeur (achat − revente). Indépendant
        de la durée du crédit, réglée dans l’onglet Financement.
      </p>
    </div>
  </header>
</template>

<style scoped>
.sim-header {
  margin-bottom: 0.75rem;
}

.sim-title-block {
  margin-bottom: 1rem;
}

.sim-h1 {
  font-size: 1.125rem;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: #1a1a18;
  margin: 0 0 0.35rem;
}

.sim-sub {
  margin: 0;
  font-size: 13px;
  color: #5f5e5a;
  line-height: 1.45;
  max-width: 44rem;
}

.vehicle-row {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 0.75rem 1rem;
  padding: 0.85rem 0 0;
  border-top: 1px solid rgba(26, 26, 24, 0.08);
}

.vehicle-field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  min-width: 140px;
  flex: 1 1 160px;
}

.vehicle-field-label {
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #5f5e5a;
}

.vehicle-vs {
  font-size: 13px;
  color: #888780;
  padding-bottom: 0.45rem;
  flex-shrink: 0;
}

.vehicle-input :deep(.p-inputtext) {
  width: 100%;
  background: transparent;
  border: none;
  border-radius: 0;
  border-bottom: 1px solid #c4c2ba;
  box-shadow: none;
  padding-left: 0;
  padding-right: 0;
}

.vehicle-input :deep(.p-inputtext:focus) {
  border-color: #185fa5;
}

.horizon-bar {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(26, 26, 24, 0.08);
}

.horizon-bar-inner {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
}

.horizon-label {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #5f5e5a;
  margin: 0;
}

.horizon-select {
  min-width: 200px;
}

.horizon-hint {
  margin: 0.5rem 0 0;
  font-size: 12px;
  line-height: 1.45;
  color: #5f5e5a;
  max-width: 44rem;
}
</style>
