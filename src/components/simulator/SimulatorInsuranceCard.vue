<script setup lang="ts">
import SliderField from '@/components/simulator/SliderField.vue'
import { useLocaleFormat } from '@/composables/useLocaleFormat'
import { useSimulatorStore } from '@/stores/simulator'
import Card from 'primevue/card'
import { useI18n } from 'vue-i18n'

defineOptions({ name: 'SimulatorInsuranceCard' })

const store = useSimulatorStore()
const { t } = useI18n()
const { fmtInt } = useLocaleFormat()
</script>

<template>
  <Card class="sim-card">
    <template #title>{{ t('insurance.title') }}</template>
    <template #content>
      <SliderField
        v-model="store.data.insElecPerYear"
        :label="t('insurance.insVehicle', { vehicle: store.data.evLabel })"
        :min="0"
        :max="2000"
        :step="50"
        :format="(v) => `${fmtInt(v)} €`"
      />
      <SliderField
        v-model="store.data.insFuelPerYear"
        :label="t('insurance.insVehicle', { vehicle: store.data.iceLabel })"
        :min="0"
        :max="2000"
        :step="50"
        :format="(v) => `${fmtInt(v)} €`"
      />
    </template>
  </Card>
</template>
