<script setup lang="ts">
import { SIMULATION_YEAR_OPTIONS, useSimulatorStore } from '@/stores/simulator'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

defineOptions({ name: 'SimulatorHeader' })

const store = useSimulatorStore()
const { t, locale } = useI18n()

const simulationYearOptions = computed(() =>
  SIMULATION_YEAR_OPTIONS.map((n) => ({
    label: t('common.years', { n }),
    value: n,
  })),
)

function setLang(lang: 'fr' | 'en') {
  locale.value = lang
}
</script>

<template>
  <header class="sim-header">
    <div class="sim-title-row">
      <div class="sim-title-block">
        <h1 class="sim-h1">{{ t('header.title') }}</h1>
        <p class="sim-sub">{{ t('header.subtitle') }}</p>
      </div>
      <div class="lang-switch" role="group" :aria-label="t('header.langAria')">
        <button type="button" class="lang-btn" :class="{ active: locale === 'fr' }" @click="setLang('fr')">FR</button>
        <button type="button" class="lang-btn" :class="{ active: locale === 'en' }" @click="setLang('en')">EN</button>
      </div>
    </div>

    <div class="vehicle-row" :aria-label="t('header.comparisonAria')">
      <div class="vehicle-field">
        <label class="vehicle-field-label" for="ev-name">{{ t('header.evField') }}</label>
        <InputText id="ev-name" v-model="store.data.evLabel" class="vehicle-input w-full" autocomplete="off" />
      </div>
      <span class="vehicle-vs">{{ t('common.vs') }}</span>
      <div class="vehicle-field">
        <label class="vehicle-field-label" for="ice-name">{{ t('header.iceField') }}</label>
        <InputText id="ice-name" v-model="store.data.iceLabel" class="vehicle-input w-full" autocomplete="off" />
      </div>
    </div>

    <div class="horizon-bar" role="group" :aria-label="t('header.horizonAria')">
      <div class="horizon-bar-inner">
        <label class="horizon-label" for="header-sim-years">{{ t('header.horizonLabel') }}</label>
        <Select
          id="header-sim-years"
          v-model="store.data.simulationYears"
          :options="simulationYearOptions"
          option-label="label"
          option-value="value"
          class="horizon-select"
        />
      </div>
      <p class="horizon-hint">{{ t('header.horizonHint') }}</p>
    </div>
  </header>
</template>

<style scoped>
.sim-header {
  margin-bottom: 0.75rem;
}

.sim-title-row {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem 1rem;
  margin-bottom: 1rem;
}

.sim-title-block {
  flex: 1 1 16rem;
  min-width: 0;
}

.lang-switch {
  display: inline-flex;
  border-radius: 8px;
  border: 1px solid rgba(26, 26, 24, 0.12);
  overflow: hidden;
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.5);
}

.lang-btn {
  margin: 0;
  padding: 0.35rem 0.65rem;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.04em;
  border: none;
  background: transparent;
  color: #5f5e5a;
  cursor: pointer;
}

.lang-btn + .lang-btn {
  border-left: 1px solid rgba(26, 26, 24, 0.12);
}

.lang-btn:hover {
  color: #1a1a18;
  background: rgba(255, 255, 255, 0.6);
}

.lang-btn.active {
  background: #1a1a18;
  color: #f5f4f0;
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
