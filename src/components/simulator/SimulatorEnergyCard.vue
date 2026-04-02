<script setup lang="ts">
import SliderField from '@/components/simulator/SliderField.vue'
import { useLocaleFormat } from '@/composables/useLocaleFormat'
import { useSimulatorStore } from '@/stores/simulator'
import Card from 'primevue/card'
import { useI18n } from 'vue-i18n'

defineOptions({ name: 'SimulatorEnergyCard' })

const store = useSimulatorStore()
const { t } = useI18n()
const { fmtDec } = useLocaleFormat()
</script>

<template>
  <Card class="sim-card">
    <template #title>{{ t('energy.title') }}</template>
    <template #content>
      <SliderField
        v-model="store.data.elecKwhPer100"
        :label="t('energy.elecConso')"
        :min="8"
        :max="22"
        :step="0.5"
        :format="(v) => fmtDec(v, 1)"
      />
      <SliderField
        v-model="store.data.elecPricePerKwh"
        :label="t('energy.elecPrice')"
        :min="0.1"
        :max="0.3"
        :step="0.01"
        :format="(v) => `${fmtDec(v, 2)} €`"
      />
      <SliderField
        v-model="store.data.fuelLitersPer100"
        :label="t('energy.fuelConso')"
        :min="4"
        :max="12"
        :step="0.1"
        :format="(v) => fmtDec(v, 1)"
      />
      <SliderField
        v-model="store.data.fuelPricePerLiter"
        :label="t('energy.fuelPrice')"
        :min="1.3"
        :max="2.5"
        :step="0.01"
        :format="(v) => `${fmtDec(v, 2)} €`"
      />
    </template>
  </Card>
</template>
