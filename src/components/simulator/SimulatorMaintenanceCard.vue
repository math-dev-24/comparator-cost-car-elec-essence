<script setup lang="ts">
import SliderField from '@/components/simulator/SliderField.vue'
import { formatFrInt, useSimulatorStore } from '@/stores/simulator'
import Card from 'primevue/card'

defineOptions({ name: 'SimulatorMaintenanceCard' })

const store = useSimulatorStore()
</script>

<template>
  <Card class="sim-card">
    <template #title>Maintenance annuelle</template>
    <template #content>
      <SliderField
        v-model="store.data.maintElecPerYear"
        :label="`Entretien ${store.data.evLabel} (€/an)`"
        :min="0"
        :max="1000"
        :step="50"
        :format="(v) => `${formatFrInt(v)} €`"
      />
      <SliderField
        v-model="store.data.maintFuelPerYear"
        :label="`Entretien ${store.data.iceLabel} (€/an)`"
        :min="0"
        :max="2000"
        :step="50"
        :format="(v) => `${formatFrInt(v)} €`"
      />
    </template>
  </Card>
</template>
