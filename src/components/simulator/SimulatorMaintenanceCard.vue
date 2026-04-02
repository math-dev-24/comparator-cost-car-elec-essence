<script setup lang="ts">
import SliderField from '@/components/simulator/SliderField.vue'
import { useLocaleFormat } from '@/composables/useLocaleFormat'
import { useSimulatorStore } from '@/stores/simulator'
import Card from 'primevue/card'
import { useI18n } from 'vue-i18n'

defineOptions({ name: 'SimulatorMaintenanceCard' })

const store = useSimulatorStore()
const { t } = useI18n()
const { fmtInt } = useLocaleFormat()
</script>

<template>
  <Card class="sim-card">
    <template #title>{{ t('maintenance.title') }}</template>
    <template #content>
      <SliderField
        v-model="store.data.maintElecPerYear"
        :label="t('maintenance.maintVehicle', { vehicle: store.data.evLabel })"
        :min="0"
        :max="1000"
        :step="50"
        :format="(v) => `${fmtInt(v)} €`"
      />
      <SliderField
        v-model="store.data.maintFuelPerYear"
        :label="t('maintenance.maintVehicle', { vehicle: store.data.iceLabel })"
        :min="0"
        :max="2000"
        :step="50"
        :format="(v) => `${fmtInt(v)} €`"
      />
    </template>
  </Card>
</template>
