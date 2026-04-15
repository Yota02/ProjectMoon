<template>
  <div class="training-container">
    <!-- Hero Section -->
    <section class="hero-panel">
      <div class="hero-content">
        <div class="hero-text">
          <span class="eyebrow">Astro Academy • Station Orbitale Alpha</span>
          <h2 class="title">Centre d'Entraînement</h2>
          <p class="subtitle">
            Recrutez et gérez vos équipages pour les missions d'exploration lointaine.
          </p>
        </div>
        <div class="hero-stats">
          <div class="stat-item">
            <span class="stat-label">Effectif Total</span>
            <span class="stat-value">{{ totalTrainees }}</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <span class="stat-label">Sessions Actives</span>
            <span class="stat-value">{{ trainingStore.activeSessions }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Tabs Navigation -->
    <nav class="tabs-nav">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        class="tab-btn"
        :class="{ active: activeTab === tab.id }"
        @click="activeTab = tab.id"
      >
        <BaseIcon :name="tab.icon" :size="18" />
        <span>{{ tab.label }}</span>
        <span v-if="tab.count !== undefined" class="tab-count">{{ tab.count }}</span>
      </button>
    </nav>

    <!-- Main Content Area -->
    <div class="main-content">
      <!-- Market Tab -->
      <transition name="fade-slide" mode="out-in">
        <section v-if="activeTab === 'market'" class="tab-section" key="market">
          <div class="section-header">
            <div class="header-info">
              <h3>Marché des Astronautes</h3>
              <p>Nouveaux profils disponibles toutes les 24h standards.</p>
            </div>
            <button
              @click="trainingStore.refreshMarket()"
              :disabled="!canRefreshMarket"
              class="refresh-btn"
            >
              <BaseIcon name="history" :size="16" />
              <span>Rafraîchir ({{ MARKET_REFRESH_COST }} Cr.)</span>
            </button>
          </div>

          <div class="trainee-grid">
            <AstronautCard
              v-for="candidate in trainingStore.market"
              :key="candidate.id"
              v-bind="candidate"
              is-market
              :disabled="resourceStore.argent < candidate.cost"
              @recruit="trainingStore.recruitFromMarket(candidate.id)"
            />
          </div>
        </section>

        <!-- Roster Tab -->
        <section v-else-if="activeTab === 'roster'" class="tab-section" key="roster">
          <div class="section-header">
            <div class="header-info">
              <h3>Équipage Opérationnel</h3>
              <p>Liste des membres qualifiés et prêts au déploiement.</p>
            </div>
          </div>

          <div v-if="trainingStore.astronauts.length === 0" class="empty-state">
            <div class="empty-icon">
              <BaseIcon name="user" :size="48" />
            </div>
            <h4>Aucun membre d'équipage</h4>
            <p>Visitez le marché pour recruter vos premiers astronautes.</p>
            <button @click="activeTab = 'market'" class="empty-btn">Aller au marché</button>
          </div>
          <div v-else class="trainee-grid">
            <AstronautCard
              v-for="astronaut in trainingStore.astronauts"
              :key="astronaut.id"
              v-bind="astronaut"
            />
          </div>
        </section>

        <!-- Programs Tab -->
        <section v-else-if="activeTab === 'programs'" class="tab-section" key="programs">
          <div class="section-header">
            <div class="header-info">
              <h3>Programmes Spéciaux</h3>
              <p>Améliorez les capacités de votre base par l'entraînement.</p>
            </div>
          </div>

          <div class="program-card">
            <div class="program-visual">
              <BaseIcon name="graduation" :size="40" />
            </div>
            <div class="program-details">
              <span class="tag">Certification EVA</span>
              <h4>Simulation de Survie Intensive</h4>
              <p>
                Un cycle complet de 48h simulant des pannes critiques et des sorties
                extravéhiculaires.
              </p>
              <div class="program-footer">
                <div class="costs">
                  <div class="cost">
                    <BaseIcon name="coins" :size="14" />
                    <span>100 Cr.</span>
                  </div>
                  <div class="cost">
                    <BaseIcon name="rocket" :size="14" />
                    <span>20 Carb.</span>
                  </div>
                </div>
                <button
                  @click="trainingStore.startTrainingProgram()"
                  :disabled="!canRunProgram"
                  class="launch-btn"
                >
                  Lancer le cycle
                </button>
              </div>
            </div>
          </div>
        </section>
      </transition>
    </div>

    <!-- Mini Log Sidebar/Footer -->
    <section class="logs-panel">
      <div class="logs-header">
        <BaseIcon name="history" :size="16" />
        <h4>Dernières activités</h4>
      </div>
      <div class="logs-content">
        <div v-if="trainingStore.logs.length === 0" class="empty-logs">
          En attente d'opérations...
        </div>
        <div v-for="(log, idx) in trainingStore.logs" :key="idx" class="log-item">
          <span class="log-time">{{ log.temps }}</span>
          <span class="log-msg">{{ log.message }}</span>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { MARKET_REFRESH_COST, useTrainingStore } from '../stores/useTrainingStore'
import { useResourceStore } from '../stores/useResourceStore'
import BaseIcon from './ui/BaseIcon.vue'
import AstronautCard from './ui/AstronautCard.vue'

const trainingStore = useTrainingStore()
const resourceStore = useResourceStore()

const activeTab = ref('market')
const tabs = computed(() => [
  { id: 'market', label: 'Marché', icon: 'briefcase' },
  { id: 'roster', label: 'Équipage', icon: 'user', count: trainingStore.astronauts.length },
  { id: 'programs', label: 'Programmes', icon: 'graduation' },
])

const totalTrainees = computed(() => trainingStore.totalTrainees)
const canRefreshMarket = computed(() => resourceStore.argent >= MARKET_REFRESH_COST)
const canRunProgram = computed(() => {
  return resourceStore.argent >= 100 && resourceStore.carburant >= 20
})
</script>

<style scoped>
.training-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Hero Panel */
.hero-panel {
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.8) 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 2rem;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
  position: relative;
  overflow: hidden;
}

.hero-panel::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 300px;
  height: 100%;
  background: radial-gradient(circle at 100% 0%, rgba(55, 215, 255, 0.1) 0%, transparent 70%);
}

.hero-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
  position: relative;
  z-index: 1;
}

.eyebrow {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.75rem;
  color: #37d7ff;
  text-transform: uppercase;
  letter-spacing: 2px;
  margin-bottom: 0.5rem;
  display: block;
}

.title {
  font-family: 'Orbitron', sans-serif;
  font-size: 2.25rem;
  margin: 0;
  background: linear-gradient(to bottom, #fff, #94a3b8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.subtitle {
  color: #94a3b8;
  margin: 0.5rem 0 0 0;
  max-width: 500px;
}

.hero-stats {
  display: flex;
  align-items: center;
  gap: 2rem;
  background: rgba(0, 0, 0, 0.2);
  padding: 1rem 2rem;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-label {
  font-size: 0.7rem;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.stat-value {
  font-family: 'Orbitron', sans-serif;
  font-size: 1.75rem;
  color: #fff;
}

.stat-divider {
  width: 1px;
  height: 40px;
  background: rgba(255, 255, 255, 0.1);
}

/* Tabs Navigation */
.tabs-nav {
  display: flex;
  gap: 0.5rem;
  background: rgba(15, 23, 42, 0.5);
  padding: 0.4rem;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  width: fit-content;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.25rem;
  border: none;
  background: transparent;
  color: #64748b;
  border-radius: 10px;
  cursor: pointer;
  font-family: 'Orbitron', sans-serif;
  font-size: 0.85rem;
  transition: all 0.2s;
}

.tab-btn:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.05);
}

.tab-btn.active {
  background: #37d7ff;
  color: #0f172a;
}

.tab-count {
  font-size: 0.7rem;
  background: rgba(0, 0, 0, 0.2);
  padding: 0.1rem 0.5rem;
  border-radius: 6px;
  margin-left: 0.25rem;
}

/* Tab Sections */
.tab-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-header h3 {
  font-family: 'Orbitron', sans-serif;
  font-size: 1.25rem;
  margin: 0;
  color: #fff;
}

.section-header p {
  color: #64748b;
  margin: 0.25rem 0 0 0;
  font-size: 0.9rem;
}

.refresh-btn {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  background: rgba(55, 215, 255, 0.1);
  border: 1px solid rgba(55, 215, 255, 0.2);
  color: #37d7ff;
  padding: 0.6rem 1rem;
  border-radius: 10px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s;
}

.refresh-btn:hover:not(:disabled) {
  background: rgba(55, 215, 255, 0.2);
  transform: translateY(-1px);
}

.trainee-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  background: rgba(15, 23, 42, 0.4);
  border: 2px dashed rgba(255, 255, 255, 0.05);
  border-radius: 24px;
  text-align: center;
}

.empty-icon {
  color: rgba(255, 255, 255, 0.1);
  margin-bottom: 1.5rem;
}

.empty-state h4 {
  font-family: 'Orbitron', sans-serif;
  font-size: 1.25rem;
  margin: 0 0 0.5rem 0;
  color: #fff;
}

.empty-state p {
  color: #64748b;
  margin: 0 0 1.5rem 0;
}

.empty-btn {
  background: #fff;
  color: #000;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
  font-family: 'Orbitron', sans-serif;
  font-size: 0.85rem;
}

/* Program Card */
.program-card {
  display: flex;
  gap: 2rem;
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.6) 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 2rem;
  border-radius: 24px;
  align-items: center;
}

.program-visual {
  width: 100px;
  height: 100px;
  border-radius: 24px;
  background: rgba(55, 215, 255, 0.1);
  color: #37d7ff;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(55, 215, 255, 0.2);
  flex-shrink: 0;
}

.program-details {
  flex: 1;
}

.program-details .tag {
  color: #ff9b3f;
  font-size: 0.75rem;
  font-family: 'JetBrains Mono', monospace;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.program-details h4 {
  font-family: 'Orbitron', sans-serif;
  font-size: 1.5rem;
  margin: 0.25rem 0 0.5rem 0;
  color: #fff;
}

.program-details p {
  color: #94a3b8;
  margin: 0 0 1.5rem 0;
  max-width: 600px;
}

.program-footer {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.costs {
  display: flex;
  gap: 1.5rem;
}

.cost {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #fff;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.9rem;
}

.launch-btn {
  background: linear-gradient(90deg, #37d7ff, #00d4ff);
  color: #000;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 12px;
  font-weight: 700;
  font-family: 'Orbitron', sans-serif;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
}

.launch-btn:hover:not(:disabled) {
  filter: brightness(1.1);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 212, 255, 0.3);
}

/* Logs Panel */
.logs-panel {
  margin-top: 1rem;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 16px;
  padding: 1.25rem;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.logs-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
  color: #64748b;
}

.logs-header h4 {
  margin: 0;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 1px;
}

.logs-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 120px;
  overflow-y: auto;
}

.log-item {
  display: flex;
  gap: 1.5rem;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.75rem;
  padding: 0.4rem 0.75rem;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 6px;
}

.log-time {
  color: #475569;
}

.log-msg {
  color: #94a3b8;
}

/* Transitions */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(10px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}

@media (max-width: 900px) {
  .hero-content {
    flex-direction: column;
    align-items: flex-start;
  }

  .hero-stats {
    width: 100%;
    justify-content: center;
  }

  .program-card {
    flex-direction: column;
    text-align: center;
  }

  .program-footer {
    flex-direction: column;
    gap: 1.5rem;
  }

  .tabs-nav {
    width: 100%;
    overflow-x: auto;
  }
}
</style>
