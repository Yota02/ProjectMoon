<template>
  <div class="chart-wrapper">
    <component
      :is="chartComponent"
      :data="chartData"
      :options="chartOptions"
      class="chart-canvas"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  RadialLinearScale,
  type ChartData,
  type ChartOptions
} from 'chart.js'
import { Bar, Pie, Line, PolarArea, Doughnut } from 'vue-chartjs'

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  RadialLinearScale
)

interface Props {
  type: 'bar' | 'pie' | 'line' | 'polarArea' | 'doughnut'
  chartData: ChartData<any>
  options?: ChartOptions<any>
}

const props = defineProps<Props>()

const chartComponent = computed(() => {
  switch (props.type) {
    case 'bar': return Bar
    case 'pie': return Pie
    case 'line': return Line
    case 'polarArea': return PolarArea
    case 'doughnut': return Doughnut
    default: return Bar
  }
})

const defaultOptions: ChartOptions<any> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        color: '#a2a8d3',
        font: {
          family: "'Inter', sans-serif",
          size: 12
        },
        padding: 20,
        usePointStyle: true
      }
    },
    tooltip: {
      backgroundColor: 'rgba(26, 26, 46, 0.95)',
      titleColor: '#e94560',
      bodyColor: '#e0e0e0',
      borderColor: '#16213e',
      borderWidth: 1,
      padding: 12,
      displayColors: true,
      callbacks: {
        labelColor: function(context: any) {
          return {
            borderColor: context.dataset.borderColor,
            backgroundColor: context.dataset.backgroundColor,
            borderWidth: 2,
            borderDash: [2, 2],
            borderRadius: 2,
          };
        }
      }
    }
  },
  scales: props.type === 'bar' || props.type === 'line' ? {
    y: {
      grid: {
        color: 'rgba(162, 168, 211, 0.1)'
      },
      ticks: {
        color: '#a2a8d3'
      }
    },
    x: {
      grid: {
        display: false
      },
      ticks: {
        color: '#a2a8d3'
      }
    }
  } : props.type === 'polarArea' ? {
    r: {
      grid: {
        color: 'rgba(162, 168, 211, 0.1)'
      },
      angleLines: {
        color: 'rgba(162, 168, 211, 0.1)'
      },
      pointLabels: {
        color: '#a2a8d3'
      },
       ticks: {
        backdropColor: 'transparent',
        color: 'rgba(162, 168, 211, 0.5)'
      }
    }
  } : {}
}

const chartOptions = computed(() => ({
  ...defaultOptions,
  ...props.options
}))
</script>

<style scoped>
.chart-wrapper {
  position: relative;
  height: 300px;
  width: 100%;
}

.chart-canvas {
  width: 100% !important;
  height: 100% !important;
}
</style>
