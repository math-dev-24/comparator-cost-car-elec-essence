<script setup lang="ts">
import { useLocaleFormat } from '@/composables/useLocaleFormat'
import { FINANCING_DURATION_YEAR_OPTIONS, useSimulatorStore } from '@/stores/simulator'
import Card from 'primevue/card'
import InputNumber from 'primevue/inputnumber'
import InputSwitch from 'primevue/inputswitch'
import Select from 'primevue/select'
import SelectButton from 'primevue/selectbutton'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

defineOptions({ name: 'SimulatorFinancingCard' })

const store = useSimulatorStore()
const { t } = useI18n()
const { tag, fmtInt } = useLocaleFormat()

const financingYearOptions = computed(() =>
  FINANCING_DURATION_YEAR_OPTIONS.map((n) => ({
    label: t('common.years', { n }),
    value: n,
  })),
)

const financeModeOptions = computed(() => [
  { label: t('financing.rateMode'), value: true },
  { label: t('financing.paymentMode'), value: false },
])
</script>

<template>
  <Card class="sim-card sim-card-highlight">
    <template #title>{{ t('financing.title') }}</template>
    <template #content>
      <p class="card-intro" v-html="t('financing.intro')" />
      <div class="finance-duration-row">
        <label class="inlabel finance-label" for="fin-years">{{ t('financing.creditDuration') }}</label>
        <Select
          id="fin-years"
          v-model="store.data.financingDurationYears"
          :options="financingYearOptions"
          option-label="label"
          option-value="value"
          class="finance-select"
        />
      </div>
      <div class="finance-two-cols">
        <fieldset class="finance-fieldset">
          <legend class="finance-legend">{{ store.data.evLabel }}</legend>
          <div class="finance-row-switch">
            <label for="ev-fin" class="switch-label">{{ t('financing.financingSwitch') }}</label>
            <InputSwitch id="ev-fin" v-model="store.data.evUseFinancing" />
          </div>
          <template v-if="store.data.evUseFinancing">
            <div class="mb-2">
              <SelectButton
                v-model="store.data.evFinanceUseRate"
                :options="financeModeOptions"
                option-label="label"
                option-value="value"
                size="small"
                class="w-full"
              />
            </div>
            <template v-if="store.data.evFinanceUseRate">
              <label class="inlabel">{{ t('financing.taeg') }}</label>
              <InputNumber
                v-model="store.data.evAnnualRatePercent"
                class="w-full inumber mb-2"
                :min="0"
                :max="20"
                :min-fraction-digits="1"
                :max-fraction-digits="2"
                suffix=" %"
                :locale="tag"
              />
              <p class="hint mb-0">
                {{ t('financing.monthlyComputed') }}
                <strong>{{ fmtInt(Math.round(store.evMonthlyPayment)) }} €</strong>
              </p>
            </template>
            <template v-else>
              <label class="inlabel">{{ t('financing.monthlyInput') }}</label>
              <InputNumber
                v-model="store.data.evMonthlyPaymentInput"
                class="w-full inumber"
                :min="0"
                :max="5000"
                :step="10"
                mode="currency"
                currency="EUR"
                :locale="tag"
              />
              <p class="hint mb-0">{{ t('financing.noInterestHint') }}</p>
            </template>
          </template>
        </fieldset>
        <fieldset class="finance-fieldset">
          <legend class="finance-legend">{{ store.data.iceLabel }}</legend>
          <div class="finance-row-switch">
            <label for="ice-fin" class="switch-label">{{ t('financing.financingSwitch') }}</label>
            <InputSwitch id="ice-fin" v-model="store.data.iceUseFinancing" />
          </div>
          <template v-if="store.data.iceUseFinancing">
            <div class="mb-2">
              <SelectButton
                v-model="store.data.iceFinanceUseRate"
                :options="financeModeOptions"
                option-label="label"
                option-value="value"
                size="small"
                class="w-full"
              />
            </div>
            <template v-if="store.data.iceFinanceUseRate">
              <label class="inlabel">{{ t('financing.taeg') }}</label>
              <InputNumber
                v-model="store.data.iceAnnualRatePercent"
                class="w-full inumber mb-2"
                :min="0"
                :max="20"
                :min-fraction-digits="1"
                :max-fraction-digits="2"
                suffix=" %"
                :locale="tag"
              />
              <p class="hint mb-0">
                {{ t('financing.monthlyComputed') }}
                <strong>{{ fmtInt(Math.round(store.iceMonthlyPayment)) }} €</strong>
              </p>
            </template>
            <template v-else>
              <label class="inlabel">{{ t('financing.monthlyInput') }}</label>
              <InputNumber
                v-model="store.data.iceMonthlyPaymentInput"
                class="w-full inumber"
                :min="0"
                :max="5000"
                :step="10"
                mode="currency"
                currency="EUR"
                :locale="tag"
              />
              <p class="hint mb-0">{{ t('financing.noInterestHint') }}</p>
            </template>
          </template>
        </fieldset>
      </div>
    </template>
  </Card>
</template>

<style scoped>
.mb-2 {
  margin-bottom: 0.5rem;
}
.mb-0 {
  margin-bottom: 0;
}
.w-full {
  width: 100%;
}
</style>
