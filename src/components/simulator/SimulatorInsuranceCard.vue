<script setup lang="ts">
import SliderField from '@/components/simulator/SliderField.vue'
import { formatFrInt, useSimulatorStore } from '@/stores/simulator'
import Card from 'primevue/card'

defineOptions({ name: 'SimulatorInsuranceCard' })

const store = useSimulatorStore()
</script>

<template>
  <Card class="sim-card">
    <template #title>Assurance annuelle</template>
    <template #content>
      <SliderField
        v-model="store.data.insElecPerYear"
        :label="`Assurance ${store.data.evLabel} (€/an)`"
        :min="0"
        :max="2000"
        :step="50"
        :format="(v) => `${formatFrInt(v)} €`"
      />
      <SliderField
        v-model="store.data.insFuelPerYear"
        :label="`Assurance ${store.data.iceLabel} (€/an)`"
        :min="0"
        :max="2000"
        :step="50"
        :format="(v) => `${formatFrInt(v)} €`"
      />
    </template>
  </Card>
</template>
