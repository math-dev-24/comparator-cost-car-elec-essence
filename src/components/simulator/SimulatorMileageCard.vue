<script setup lang="ts">
import SliderField from '@/components/simulator/SliderField.vue'
import { useLocaleFormat } from '@/composables/useLocaleFormat'
import {
  KM_PER_YEAR_MAX,
  KM_PER_YEAR_MIN,
  useSimulatorStore,
} from '@/stores/simulator'
import Card from 'primevue/card'
import InputNumber from 'primevue/inputnumber'
import SelectButton from 'primevue/selectbutton'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

defineOptions({ name: 'SimulatorMileageCard' })

const store = useSimulatorStore()
const { t } = useI18n()
const { tag, fmtInt } = useLocaleFormat()

const mileageModeOptions = computed(() => [
  { label: t('mileage.modeTrip'), value: 'trip' as const },
  { label: t('mileage.modeDirect'), value: 'direct' as const },
])

const readoutApproxHtml = computed(() =>
  t('mileage.readoutApprox', {
    kmMonth: fmtInt(Math.round(store.distanceKmMonthFromTrip)),
    kmYear: fmtInt(store.annualKmFromTrip),
  }),
)
</script>

<template>
  <Card class="sim-card">
    <template #title>{{ t('mileage.title') }}</template>
    <template #content>
      <p class="card-intro mb-3" v-html="t('mileage.intro', { kmMin: fmtInt(KM_PER_YEAR_MIN), kmMax: fmtInt(KM_PER_YEAR_MAX) })" />
      <div class="mb-4">
        <label class="inlabel">{{ t('mileage.mode') }}</label>
        <SelectButton
          v-model="store.data.mileageInputMode"
          :options="mileageModeOptions"
          option-label="label"
          option-value="value"
          class="w-full mode-toggle"
        />
      </div>

      <template v-if="store.data.mileageInputMode === 'trip'">
        <p class="section-hint">{{ t('mileage.tripParams') }}</p>
        <SliderField
          v-model="store.data.kmPerDay"
          :label="t('mileage.kmPerDay')"
          :min="store.tripKmPerDayMin"
          :max="store.tripKmPerDayMax"
          :step="1"
          :format="(v) => `${Math.round(v)} km`"
        />
        <SliderField
          v-model="store.data.daysPerMonth"
          :label="t('mileage.daysPerMonth')"
          :min="store.tripDaysMin"
          :max="store.tripDaysMax"
          :step="1"
          :format="(v) => `${Math.round(v)} ${t('mileage.daysShort')}`"
        />
        <div class="readout">
          <p class="readout-main" v-html="readoutApproxHtml" />
          <p class="readout-sub">
            {{ t('mileage.readoutRange', { min: fmtInt(KM_PER_YEAR_MIN), max: fmtInt(KM_PER_YEAR_MAX) }) }}
          </p>
        </div>
      </template>

      <template v-else>
        <p class="section-hint">{{ t('mileage.directSection') }}</p>
        <SliderField
          v-model="store.data.evKmPerYear"
          :label="t('mileage.kmPerYear', { vehicle: store.data.evLabel })"
          :min="KM_PER_YEAR_MIN"
          :max="KM_PER_YEAR_MAX"
          :step="100"
          :format="(v) => `${fmtInt(v)} km`"
        />
        <SliderField
          v-model="store.data.iceKmPerYear"
          :label="t('mileage.kmPerYear', { vehicle: store.data.iceLabel })"
          :min="KM_PER_YEAR_MIN"
          :max="KM_PER_YEAR_MAX"
          :step="100"
          :format="(v) => `${fmtInt(v)} km`"
        />
      </template>

      <p class="section-hint mt-4">{{ t('mileage.initialSection') }}</p>
      <div class="num-pair-grid">
        <div>
          <label class="inlabel" for="ev-init-km">{{ t('mileage.initialKm', { vehicle: store.data.evLabel }) }}</label>
          <InputNumber
            id="ev-init-km"
            v-model="store.data.evInitialKm"
            class="w-full inumber"
            :min="0"
            :max="500000"
            :step="1000"
            :locale="tag"
            suffix=" km"
          />
        </div>
        <div>
          <label class="inlabel" for="ice-init-km">{{ t('mileage.initialKm', { vehicle: store.data.iceLabel }) }}</label>
          <InputNumber
            id="ice-init-km"
            v-model="store.data.iceInitialKm"
            class="w-full inumber"
            :min="0"
            :max="500000"
            :step="1000"
            :locale="tag"
            suffix=" km"
          />
        </div>
      </div>
      <div class="odom-grid">
        <div class="metric metric-inline">
          <p class="metric-label">
            {{ t('mileage.odomEnd', { year: store.data.simulationYears, vehicle: store.data.evLabel }) }}
          </p>
          <p class="metric-value metric-ev">{{ fmtInt(store.evKmEndOfHorizon) }} km</p>
        </div>
        <div class="metric metric-inline">
          <p class="metric-label">
            {{ t('mileage.odomEnd', { year: store.data.simulationYears, vehicle: store.data.iceLabel }) }}
          </p>
          <p class="metric-value metric-fuel">{{ fmtInt(store.iceKmEndOfHorizon) }} km</p>
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
