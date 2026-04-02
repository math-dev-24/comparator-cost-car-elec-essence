<script setup lang="ts">
import Slider from 'primevue/slider'

defineOptions({ name: 'SliderField' })

const model = defineModel<number>({ required: true })

withDefaults(
  defineProps<{
    label: string
    min: number
    max: number
    step?: number
    format: (value: number) => string
  }>(),
  { step: 1 },
)
</script>

<template>
  <div class="slider-field">
    <span class="slider-field-label">{{ label }}</span>
    <Slider
      v-model="model"
      class="slider-field-control"
      :min="min"
      :max="max"
      :step="step"
    />
    <span class="slider-field-value">{{ format(model) }}</span>
  </div>
</template>

<style scoped>
.slider-field {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}
.slider-field-label {
  flex: 0 0 200px;
  font-size: 13px;
  color: #1a1a18;
}
.slider-field-control {
  flex: 1;
  min-width: 0;
}
.slider-field-value {
  flex: 0 0 72px;
  font-size: 13px;
  font-weight: 500;
  text-align: right;
  color: #1a1a18;
}
@media (max-width: 600px) {
  .slider-field-label {
    flex: 0 0 140px;
  }
}
</style>
