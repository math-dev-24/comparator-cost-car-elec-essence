<script setup lang="ts">
import SliderField from '@/components/simulator/SliderField.vue'
import { formatFrDec, useSimulatorStore } from '@/stores/simulator'
import Card from 'primevue/card'

defineOptions({ name: 'SimulatorEnergyCard' })

const store = useSimulatorStore()
</script>

<template>
  <Card class="sim-card">
    <template #title>Énergie</template>
    <template #content>
      <SliderField
        v-model="store.data.elecKwhPer100"
        label="Conso électrique (kWh/100)"
        :min="8"
        :max="22"
        :step="0.5"
        :format="(v) => formatFrDec(v, 1)"
      />
      <SliderField
        v-model="store.data.elecPricePerKwh"
        label="Prix électricité (€/kWh)"
        :min="0.1"
        :max="0.3"
        :step="0.01"
        :format="(v) => `${formatFrDec(v, 2)} €`"
      />
      <SliderField
        v-model="store.data.fuelLitersPer100"
        label="Conso essence (L/100)"
        :min="4"
        :max="12"
        :step="0.1"
        :format="(v) => formatFrDec(v, 1)"
      />
      <SliderField
        v-model="store.data.fuelPricePerLiter"
        label="Prix essence (€/L)"
        :min="1.3"
        :max="2.5"
        :step="0.01"
        :format="(v) => `${formatFrDec(v, 2)} €`"
      />
    </template>
  </Card>
</template>
