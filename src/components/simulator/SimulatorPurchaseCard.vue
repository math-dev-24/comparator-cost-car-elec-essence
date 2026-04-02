<script setup lang="ts">
import { useLocaleFormat } from '@/composables/useLocaleFormat'
import { SIMULATOR_COLORS, useSimulatorStore } from '@/stores/simulator'
import Card from 'primevue/card'
import InputNumber from 'primevue/inputnumber'
import { useI18n } from 'vue-i18n'

defineOptions({ name: 'SimulatorPurchaseCard' })

const store = useSimulatorStore()
const { t } = useI18n()
const { tag, fmtInt } = useLocaleFormat()

const accent = {
  ev: SIMULATOR_COLORS.ev,
  ice: SIMULATOR_COLORS.fuel,
}
</script>

<template>
  <Card class="sim-card">
    <template #title>{{ t('purchase.title') }}</template>
    <template #content>
      <p class="card-intro" v-html="t('purchase.intro', { years: store.data.simulationYears })" />

      <div class="purchase-encarts">
        <section
          class="purchase-encart purchase-encart--ev"
          :style="{ '--encart-accent': accent.ev }"
          :aria-label="t('purchase.encartEvAria', { label: store.data.evLabel })"
        >
          <header class="encart-head">
            <h2 class="encart-title">{{ store.data.evLabel }}</h2>
            <p class="encart-sub">{{ t('purchase.evSubtitle') }}</p>
          </header>
          <div class="encart-fields">
            <div>
              <label class="inlabel">{{ t('purchase.purchasePrice') }}</label>
              <InputNumber
                v-model="store.data.evPurchasePrice"
                class="w-full inumber"
                :min="0"
                :max="800000"
                :step="500"
                mode="currency"
                currency="EUR"
                :locale="tag"
              />
            </div>
            <div>
              <label class="inlabel">{{ t('purchase.resaleInYears', { years: store.data.simulationYears }) }}</label>
              <InputNumber
                v-model="store.data.evReprise"
                class="w-full inumber"
                :min="0"
                :max="800000"
                :step="500"
                mode="currency"
                currency="EUR"
                :locale="tag"
              />
            </div>
          </div>
          <p class="encart-foot">
            {{ t('purchase.depreciationPeriod') }}
            <strong>{{ fmtInt(store.data.evPurchasePrice - store.data.evReprise) }} €</strong>
          </p>
        </section>

        <section
          class="purchase-encart purchase-encart--ice"
          :style="{ '--encart-accent': accent.ice }"
          :aria-label="t('purchase.encartIceAria', { label: store.data.iceLabel })"
        >
          <header class="encart-head">
            <h2 class="encart-title">{{ store.data.iceLabel }}</h2>
            <p class="encart-sub">{{ t('purchase.iceSubtitle') }}</p>
          </header>
          <div class="encart-fields">
            <div>
              <label class="inlabel">{{ t('purchase.resaleInYears', { years: store.data.simulationYears }) }}</label>
              <InputNumber
                v-model="store.data.iceReprise"
                class="w-full inumber"
                :min="0"
                :max="800000"
                :step="500"
                mode="currency"
                currency="EUR"
                :locale="tag"
              />
            </div>
            <div>
              <label class="inlabel">{{ t('purchase.currentValue') }}</label>
              <InputNumber
                v-model="store.data.icePurchasePrice"
                class="w-full inumber"
                :min="0"
                :max="800000"
                :step="500"
                mode="currency"
                currency="EUR"
                :locale="tag"
              />
              <p class="field-micro">{{ t('purchase.fieldMicro') }}</p>
            </div>
          </div>
          <p class="encart-foot">
            {{ t('purchase.depreciationPeriod') }}
            <strong>{{ fmtInt(store.data.icePurchasePrice - store.data.iceReprise) }} €</strong>
          </p>
        </section>
      </div>

      <p class="hint mb-0">
        {{ t('purchase.netVehicleHint') }}
        <strong class="metric-ev">{{ fmtInt(store.netVehicleCostEv) }} €</strong> ({{ store.data.evLabel }}) ·
        <strong class="metric-fuel">{{ fmtInt(store.netVehicleCostIce) }} €</strong> ({{ store.data.iceLabel }})
      </p>
    </template>
  </Card>
</template>

<style scoped>
.w-full {
  width: 100%;
}

.mb-0 {
  margin-bottom: 0;
}

.purchase-encarts {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  margin-top: 4px;
}

.purchase-encart {
  border-radius: 10px;
  padding: 14px 16px;
  border: 1px solid rgba(26, 26, 24, 0.1);
  background: rgba(255, 255, 255, 0.35);
  box-shadow: inset 3px 0 0 0 var(--encart-accent);
}

.encart-head {
  margin-bottom: 12px;
}

.encart-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #1a1a18;
}

.encart-sub {
  margin: 4px 0 0;
  font-size: 12px;
  line-height: 1.4;
  color: #5f5e5a;
}

.encart-fields {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.field-micro {
  margin: 6px 0 0;
  font-size: 11px;
  line-height: 1.45;
  color: #888780;
}

.encart-foot {
  margin: 12px 0 0;
  font-size: 12px;
  color: #5f5e5a;
}

.metric-ev {
  color: #0f6e56;
}

.metric-fuel {
  color: #993c1d;
}

@media (max-width: 768px) {
  .purchase-encarts {
    grid-template-columns: 1fr;
  }
}
</style>
