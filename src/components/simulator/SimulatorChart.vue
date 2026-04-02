<script setup lang="ts">
import { SIMULATOR_COLORS, useSimulatorStore } from '@/stores/simulator'
import Chart from 'chart.js/auto'
import type { Chart as ChartJs } from 'chart.js'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

defineOptions({ name: 'SimulatorChart' })

const store = useSimulatorStore()
const canvasRef = ref<HTMLCanvasElement | null>(null)

let chart: ChartJs | null = null

function syncChart() {
  const p = store.chartProjection
  if (!chart) return
  chart.data.labels = p.labels
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
    ds[2].data = [...p.eco]
  }
  chart.update('none')
}

onMounted(() => {
  const el = canvasRef.value
  if (!el) return

  const p = store.chartProjection
  chart = new Chart(el, {
    type: 'line',
    data: {
      labels: p.labels,
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
          label: 'Économie',
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
              `${ctx.dataset.label} : ${(ctx.parsed.y as number).toLocaleString('fr-FR')} €`,
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
            callback: (v) => `${Number(v).toLocaleString('fr-FR')} €`,
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
