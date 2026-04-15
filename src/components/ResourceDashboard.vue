<template>
  <div class="resource-dashboard">
    <div class="header">
      <div class="title-group">
        <h2><span class="icon">📡</span> Centre de Contrôle des Ressources</h2>
        <p class="subtitle">Surveillance en temps réel de la station</p>
      </div>
      <div class="status-indicator">
        <span class="pulse"></span>
        SYSTÈMES OPÉRATIONNELS
      </div>
    </div>

    <div class="resources-grid">
      <div class="resource-card money">
        <div class="card-content">
          <div class="top">
            <span class="label">Trésorerie</span>
            <span class="symbol">€</span>
          </div>
          <div class="value-group">
            <span class="value">{{ Math.floor(resourceStore.argent).toLocaleString() }}</span>
            <span class="unit">crédits</span>
          </div>
          <div class="footer">
            <span class="trend positive"
              >+{{ contractStore.totalMonthlyRevenue.toFixed(0) }}M/mois</span
            >
          </div>
        </div>
        <div class="card-bg"></div>
      </div>

      <div class="resource-card science">
        <div class="card-content">
          <div class="top">
            <span class="label">Recherche</span>
            <span class="symbol">🧪</span>
          </div>
          <div class="value-group">
            <span class="value">{{ Math.floor(resourceStore.science).toLocaleString() }}</span>
            <span class="unit">data</span>
          </div>
          <div class="footer">
            <span class="trend positive">+{{ resourceStore.production.science }}/s</span>
            <button class="manual-btn" @click="resourceStore.addScience(5)">Analyse</button>
          </div>
        </div>
        <div class="card-bg"></div>
      </div>

      <div class="resource-card fuel">
        <div class="card-content">
          <div class="top">
            <span class="label">Propergol</span>
            <span class="symbol">🔥</span>
          </div>
          <div class="value-group">
            <span class="value">{{ Math.floor(resourceStore.carburant).toLocaleString() }}</span>
            <span class="unit">L</span>
          </div>
          <div class="footer">
            <span class="trend positive">+{{ resourceStore.production.carburant }}/s</span>
            <button class="manual-btn" @click="resourceStore.addCarburant(2)">Raffiner</button>
          </div>
        </div>
        <div class="card-bg"></div>
      </div>

      <div class="resource-card food">
        <div class="card-content">
          <div class="top">
            <span class="label">Nourriture</span>
            <span class="symbol">🍎</span>
          </div>
          <div class="value-group">
            <span class="value">{{ Math.floor(resourceStore.nourriture).toLocaleString() }}</span>
            <span class="unit">rations</span>
          </div>
          <div class="footer">
            <span class="trend" :class="stationStore.stationConsumption.nourriture > 0 ? 'negative' : 'neutral'">
              -{{ stationStore.stationConsumption.nourriture.toFixed(1) }}/j
            </span>
          </div>
        </div>
        <div class="card-bg"></div>
      </div>

      <div class="resource-card water">
        <div class="card-content">
          <div class="top">
            <span class="label">Eau</span>
            <span class="symbol">💧</span>
          </div>
          <div class="value-group">
            <span class="value">{{ Math.floor(resourceStore.eau).toLocaleString() }}</span>
            <span class="unit">L</span>
          </div>
          <div class="footer">
            <span class="trend" :class="stationStore.stationConsumption.eau > 0 ? 'negative' : 'neutral'">
              -{{ stationStore.stationConsumption.eau.toFixed(1) }}/j
            </span>
          </div>
        </div>
        <div class="card-bg"></div>
      </div>

      <div class="resource-card o2">
        <div class="card-content">
          <div class="top">
            <span class="label">Oxygène</span>
            <span class="symbol">🌬️</span>
          </div>
          <div class="value-group">
            <span class="value">{{ Math.floor(resourceStore.o2).toLocaleString() }}</span>
            <span class="unit">m³</span>
          </div>
          <div class="footer">
            <span class="trend" :class="stationStore.stationConsumption.o2 > 0 ? 'negative' : 'neutral'">
              -{{ stationStore.stationConsumption.o2.toFixed(1) }}/j
            </span>
          </div>
        </div>
        <div class="card-bg"></div>
      </div>

      <div class="resource-card parts">
        <div class="card-content">
          <div class="top">
            <span class="label">Pièces Détachées</span>
            <span class="symbol">⚙️</span>
          </div>
          <div class="value-group">
            <span class="value">{{ Math.floor(resourceStore.piecesDetachees).toLocaleString() }}</span>
            <span class="unit">unités</span>
          </div>
          <div class="footer">
            <span class="trend" :class="stationStore.stationConsumption.piecesDetachees > 0 ? 'negative' : 'neutral'">
              -{{ stationStore.stationConsumption.piecesDetachees.toFixed(1) }}/j
            </span>
          </div>
        </div>
        <div class="card-bg"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useResourceStore } from '../stores/useResourceStore'
import { useContractStore } from '../stores/useContractStore'
import { useStationStore } from '../stores/useStationStore'

const resourceStore = useResourceStore()
const contractStore = useContractStore()
const stationStore = useStationStore()
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700&family=JetBrains+Mono:wght@400;700&display=swap');

.resource-dashboard {
  font-family: 'Outfit', sans-serif;
  padding: 1rem 0;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
}

h2 {
  margin: 0;
  font-size: 1.8rem;
  font-weight: 700;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.icon {
  filter: drop-shadow(0 0 8px rgba(77, 168, 218, 0.5));
}

.subtitle {
  color: #a2a8d3;
  margin: 0.25rem 0 0 0;
  font-size: 0.95rem;
  opacity: 0.8;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.75rem;
  color: #00f2ff;
  background: rgba(0, 242, 255, 0.1);
  padding: 0.5rem 1rem;
  border-radius: 100px;
  border: 1px solid rgba(0, 242, 255, 0.2);
}

.pulse {
  width: 8px;
  height: 8px;
  background: #00f2ff;
  border-radius: 50%;
  box-shadow: 0 0 0 rgba(0, 242, 255, 0.4);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(0, 242, 255, 0.7);
  }
  70% {
    transform: scale(1);
    box-shadow: 0 0 0 10px rgba(0, 242, 255, 0);
  }
  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(0, 242, 255, 0);
  }
}

.resources-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.resource-card {
  position: relative;
  background: rgba(26, 26, 46, 0.6);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 1.5rem;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.resource-card:hover {
  transform: translateY(-5px);
  border-color: rgba(255, 255, 255, 0.15);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.4);
}

.card-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
}

.resource-card.money .card-bg {
  background: linear-gradient(90deg, #ffd700, #ff8c00);
}
.resource-card.science .card-bg {
  background: linear-gradient(90deg, #4da8da, #00f2ff);
}
.resource-card.fuel .card-bg {
  background: linear-gradient(90deg, #e94560, #ff2e63);
}
.resource-card.food .card-bg {
  background: linear-gradient(90deg, #4ade80, #22c55e);
}
.resource-card.water .card-bg {
  background: linear-gradient(90deg, #38bdf8, #0ea5e9);
}
.resource-card.o2 .card-bg {
  background: linear-gradient(90deg, #f472b6, #db2777);
}
.resource-card.parts .card-bg {
  background: linear-gradient(90deg, #94a3b8, #475569);
}

.card-content {
  position: relative;
  z-index: 1;
}

.top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.label {
  text-transform: uppercase;
  letter-spacing: 1.5px;
  font-size: 0.75rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.5);
}

.symbol {
  font-size: 1.2rem;
  opacity: 0.8;
}

.value-group {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.value {
  font-size: 2.5rem;
  font-weight: 700;
  color: #fff;
  font-family: 'JetBrains Mono', monospace;
  letter-spacing: -1px;
}

.unit {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.4);
}

.footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  padding-top: 1rem;
}

.trend {
  font-size: 0.85rem;
  font-weight: 600;
  font-family: 'JetBrains Mono', monospace;
}

.trend.positive {
  color: #00f2ff;
}

.trend.negative {
  color: #ef4444;
}

.trend.neutral {
  color: #94a3b8;
}

.manual-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #fff;
  padding: 0.4rem 0.8rem;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.manual-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
}

.resource-card.money:hover .manual-btn {
  color: #ffd700;
}
.resource-card.science:hover .manual-btn {
  color: #4da8da;
}
.resource-card.fuel:hover .manual-btn {
  color: #e94560;
}
</style>
