<template>
  <div class="view-container">
    <div class="dashboard-header">
      <div class="header-main">
        <h1>COMMAND CENTER</h1>
        <div class="mission-timer">
          <span class="label">MISSION ELAPSED:</span>
          <span class="value">D-{{ missionDays }} {{ missionTime }}</span>
        </div>
      </div>
      <p class="description">Aperçu stratégique de la base lunaire Project Moon.</p>
    </div>
    
    <div class="dashboard-content">
      <!-- Section Ressources -->
      <section class="dashboard-section">
        <ResourceDashboard />
      </section>

      <!-- Section Graphiques -->
      <div class="charts-grid">
        <div class="chart-card">
          <div class="chart-header">
            <h3>📊 Répartition du Personnel</h3>
            <span class="total">Total: {{ totalPersonnel }}</span>
          </div>
          <DashboardChart 
            type="doughnut" 
            :chart-data="staffChartData" 
            :options="commonChartOptions"
          />
        </div>

        <div class="chart-card">
          <div class="chart-header">
            <h3>📈 Capacité de Production</h3>
            <span class="unit">units/sec</span>
          </div>
          <DashboardChart 
            type="bar" 
            :chart-data="productionChartData" 
            :options="productionChartOptions"
          />
        </div>
      </div>

      <!-- Section Actions & Logs -->
      <div class="bottom-grid">
        <div class="quick-links">
          <h3>RACCOURCIS SYSTÈME</h3>
          <div class="links-container">
            <router-link to="/personnel" class="quick-link-card">
              <span class="icon">👨‍🚀</span>
              <div class="text">
                <h4>Personnel</h4>
                <p>Gestion des effectifs</p>
              </div>
            </router-link>
            
            <router-link to="/missions" class="quick-link-card">
              <span class="icon">🚀</span>
              <div class="text">
                <h4>Missions</h4>
                <p>Lancements & Exploration</p>
              </div>
            </router-link>
          </div>
        </div>

        <div class="recent-logs">
          <h3>LOGS DE MISSION RÉCENTS</h3>
          <div class="logs-container">
            <div v-if="allLogs.length === 0" class="no-logs">Aucun signal détecté...</div>
            <div 
              v-for="(log, index) in allLogs.slice(0, 5)" 
              :key="index" 
              class="log-entry"
              :class="{ 'error': log.message.includes('[ERREUR]'), 'success': log.message.includes('[SUCCÈS]') }"
            >
              <span class="log-time">[{{ log.temps }}]</span>
              <span class="log-msg">{{ log.message }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import ResourceDashboard from '../components/ResourceDashboard.vue'
import DashboardChart from '../components/charts/DashboardChart.vue'
import { usePersonnelStore } from '../stores/usePersonnelStore'
import { useResourceStore } from '../stores/useResourceStore'
import { useMissionStore } from '../stores/useMissionStore'

const personnelStore = usePersonnelStore()
const resourceStore = useResourceStore()
const missionStore = useMissionStore()

// Timer - Simulation simple
const missionDays = ref(12)
const missionTime = ref('00:00:00')
let timerInterval: any = null

onMounted(() => {
  timerInterval = setInterval(() => {
    const now = new Date()
    missionTime.value = now.toLocaleTimeString('fr-FR')
  }, 1000)
})

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval)
})

// Data calculée pour les graphiques
const totalPersonnel = computed(() => {
  return personnelStore.staff.ingenieur.count + 
         personnelStore.staff.scientifique.count + 
         personnelStore.staff.constructeur.count
})

const staffChartData = computed(() => ({
  labels: ['Ingénieurs', 'Scientifiques', 'Constructeurs'],
  datasets: [{
    data: [
      personnelStore.staff.ingenieur.count,
      personnelStore.staff.scientifique.count,
      personnelStore.staff.constructeur.count
    ],
    backgroundColor: [
      'rgba(233, 69, 96, 0.7)',
      'rgba(77, 168, 218, 0.7)',
      'rgba(255, 215, 0, 0.7)'
    ],
    borderColor: [
      '#e94560',
      '#4da8da',
      '#ffd700'
    ],
    borderWidth: 2,
    hoverOffset: 15,
    borderRadius: 5
  }]
}))

const productionChartData = computed(() => ({
  labels: ['Trésorerie', 'Science', 'Propergol'],
  datasets: [{
    label: 'Production par seconde',
    data: [
      resourceStore.production.argent,
      resourceStore.production.science,
      resourceStore.production.carburant
    ],
    backgroundColor: [
      'rgba(255, 215, 0, 0.4)',
      'rgba(77, 168, 218, 0.4)',
      'rgba(233, 69, 96, 0.4)'
    ],
    borderColor: [
      '#ffd700',
      '#4da8da',
      '#e94560'
    ],
    borderWidth: 2,
    borderRadius: 8
  }]
}))

const allLogs = computed(() => {
  return [...missionStore.logs, ...personnelStore.logs].sort((a, b) => {
    return b.temps.localeCompare(a.temps)
  })
})

const commonChartOptions = {
  plugins: {
    legend: {
      position: 'right' as const
    }
  }
}

const productionChartOptions = {
  scales: {
    y: {
      beginAtZero: true
    }
  }
}
</script>

<style scoped>
.view-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding-bottom: 3rem;
}

.dashboard-header {
  border-bottom: 2px solid rgba(77, 168, 218, 0.2);
  padding-bottom: 1.5rem;
}

.header-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

h1 {
  font-family: 'JetBrains Mono', monospace;
  font-size: 2.5rem;
  font-weight: 800;
  letter-spacing: -2px;
  color: #fff;
  margin: 0;
  background: linear-gradient(90deg, #fff, #4da8da);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.mission-timer {
  background: rgba(0, 0, 0, 0.3);
  padding: 0.5rem 1.5rem;
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  font-family: 'JetBrains Mono', monospace;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.mission-timer .label {
  font-size: 0.65rem;
  color: #4da8da;
}

.mission-timer .value {
  font-size: 1.2rem;
  color: #fff;
  font-weight: 700;
}

.description {
  color: #a2a8d3;
  font-size: 1rem;
  margin: 0.5rem 0 0 0;
  opacity: 0.7;
}

.charts-grid {
  display: grid;
  grid-template-columns: 1fr 1.5fr;
  gap: 1.5rem;
  margin-top: 1.5rem;
}

.chart-card {
  background: rgba(26, 26, 46, 0.4);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 1.5rem;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.chart-header h3 {
  margin: 0;
  font-size: 1.1rem;
  color: #fff;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.chart-header .total, .chart-header .unit {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.8rem;
  color: #4da8da;
  background: rgba(77, 168, 218, 0.1);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.bottom-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.quick-links h3, .recent-logs h3 {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.4);
  text-transform: uppercase;
  letter-spacing: 2px;
  margin-bottom: 1rem;
}

.links-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.quick-link-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: rgba(15, 52, 96, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 1.25rem;
  text-decoration: none;
  transition: all 0.2s;
}

.quick-link-card:hover {
  background: rgba(15, 52, 96, 0.8);
  border-color: #4da8da;
  transform: translateX(5px);
}

.quick-link-card .icon {
  font-size: 2rem;
}

.quick-link-card h4 {
  margin: 0;
  color: #fff;
}

.quick-link-card p {
  margin: 0;
  font-size: 0.8rem;
  color: #a2a8d3;
}

.logs-container {
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 1rem;
  height: 200px;
  overflow-y: auto;
}

.log-entry {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.8rem;
  margin-bottom: 0.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.03);
  display: flex;
  gap: 0.75rem;
}

.log-time {
  color: #4da8da;
  white-space: nowrap;
}

.log-msg {
  color: #e0e0e0;
}

.log-entry.error .log-msg { color: #e94560; }
.log-entry.success .log-msg { color: #00f2ff; }

.no-logs {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.2);
  font-family: 'JetBrains Mono', monospace;
}

@media (max-width: 1024px) {
  .charts-grid, .bottom-grid {
    grid-template-columns: 1fr;
  }
}
</style>
