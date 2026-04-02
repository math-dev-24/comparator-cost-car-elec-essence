<script setup lang="ts">
import { numberLocaleTag } from '@/utils/localeFormat'
import { SIMULATOR_COLORS, useSimulatorStore } from '@/stores/simulator'
import Chart from 'chart.js/auto'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

defineOptions({ name: 'SimulatorChart' })

const store = useSimulatorStore()
const { t, locale } = useI18n()
const canvasRef = ref<HTMLCanvasElement | null>(null)

let chart: InstanceType<typeof Chart> | null = null

function chartAxisLabels(monthStarts: Date[], locale: string): string[] {
  const loc = numberLocaleTag(locale)
  return monthStarts.map((d, i) => {
    const m = i + 1
    return m === 1 || m % 6 === 0
      ? d.toLocaleDateString(loc, { month: 'short', year: '2-digit' })
      : ''
  })
}

function syncChart() {
  const p = store.chartProjection
  if (!chart) return
  chart.data.labels = chartAxisLabels(p.monthStarts, locale.value)
  const ds = chart.data.datasets
  if (ds[0]) {
    ds[0].label = store.data.iceLabel
    ds[0].data = [...p.fuel]
  }
  if (ds[1]) {
    ds[1].label = store.data.evLabel
    ds[1].data = [...p.elec]
  }
  if (ds[2]) {
    ds[2].label = t('chart.savings')
    ds[2].data = [...p.eco]
  }

  const loc = numberLocaleTag(locale.value)
  const yAxis = chart.options.scales?.y
  if (yAxis && 'ticks' in yAxis && yAxis.ticks && typeof yAxis.ticks === 'object') {
    yAxis.ticks.callback = (v) => `${Number(v).toLocaleString(loc)} €`
  }
  const tooltip = chart.options.plugins?.tooltip
  if (tooltip && tooltip.callbacks) {
    tooltip.callbacks.label = (ctx) =>
      `${ctx.dataset.label} : ${(ctx.parsed.y as number).toLocaleString(loc)} €`
  }

  chart.update('none')
}

onMounted(() => {
  const el = canvasRef.value
  if (!el) return

  const p = store.chartProjection
  const loc = numberLocaleTag(locale.value)
  chart = new Chart(el, {
    type: 'line',
    data: {
      labels: chartAxisLabels(p.monthStarts, locale.value),
      datasets: [
        {
          label: store.data.iceLabel,
          data: [...p.fuel],
          borderColor: SIMULATOR_COLORS.fuel,
          backgroundColor: 'rgba(153, 60, 29, 0.07)',
          fill: true,
          tension: 0.3,
          pointRadius: 0,
          borderWidth: 2,
        },
        {
          label: store.data.evLabel,
          data: [...p.elec],
          borderColor: SIMULATOR_COLORS.ev,
          backgroundColor: 'rgba(15, 110, 86, 0.07)',
          fill: true,
          tension: 0.3,
          pointRadius: 0,
          borderWidth: 2,
        },
        {
          label: t('chart.savings'),
          data: [...p.eco],
          borderColor: SIMULATOR_COLORS.savings,
          backgroundColor: 'rgba(24, 95, 165, 0.07)',
          fill: true,
          tension: 0.3,
          pointRadius: 0,
          borderWidth: 2,
          borderDash: [4, 3],
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) =>
              `${ctx.dataset.label} : ${(ctx.parsed.y as number).toLocaleString(loc)} €`,
          },
        },
      },
      scales: {
        x: {
          ticks: {
            autoSkip: false,
            maxRotation: 0,
            font: { size: 11 },
            color: '#888780',
          },
          grid: { display: false },
        },
        y: {
          ticks: {
            callback: (v) => `${Number(v).toLocaleString(loc)} €`,
            font: { size: 11 },
            color: '#888780',
          },
          grid: { color: 'rgba(128, 128, 128, 0.1)' },
        },
      },
    },
  })
})

watch(
  () => store.data,
  () => syncChart(),
  { deep: true },
)

watch(
  () => [store.evMonthlyPayment, store.iceMonthlyPayment, store.chartProjection],
  () => syncChart(),
  { deep: true },
)

watch(locale, () => syncChart())

onBeforeUnmount(() => {
  chart?.destroy()
  chart = null
})
</script>

<template>
  <div class="chart-wrap">
    <canvas ref="canvasRef" />
  </div>
</template>
