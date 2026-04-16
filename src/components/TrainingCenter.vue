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
              <p>Utilisez le bouton Rafraîchir pour obtenir de nouveaux profils.</p>
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
              <h3>Programmes de Spécialisation</h3>
              <p>Formez vos astronautes pour augmenter leur expérience et leurs capacités.</p>
            </div>
          </div>

          <div class="programs-layout">
            <!-- Program Selection -->
            <div class="programs-sidebar">
              <div class="sidebar-group">
                <label>1. Choisir un Astronaute</label>
                <select v-model="selectedAstronautId" class="sidebar-select">
                  <option :value="null">Sélectionner...</option>
                  <option v-for="a in availableForTraining" :key="a.id" :value="a.id">
                    {{ a.flag }} {{ a.name }} (Niv. {{ a.level }})
                  </option>
                </select>
              </div>

              <div class="sidebar-group">
                <label>2. Choisir un Programme</label>
                <div class="programs-list">
                  <div
                    v-for="program in TRAINING_PROGRAMS"
                    :key="program.id"
                    class="program-selection-card"
                    :class="{
                      selected: selectedProgramId === program.id,
                      locked: isProgramLocked(program),
                    }"
                    @click="selectedProgramId = program.id"
                  >
                    <div class="prog-info">
                      <span class="prog-label">{{ program.label }}</span>
                      <span class="prog-duration">{{ program.duration }} jours</span>
                    </div>
                    <div class="prog-rewards">
                      <div class="prog-xp">+{{ program.xpReward }} XP</div>
                      <div v-if="program.targetSkill" class="prog-skill">
                        <BaseIcon :name="getSkillIcon(program.targetSkill)" :size="10" />
                        <span
                          >+{{ program.skillReward }} {{ getSkillLabel(program.targetSkill) }}</span
                        >
                      </div>
                    </div>
                    <div v-if="isProgramLocked(program)" class="prog-lock">
                      <BaseIcon name="lock" :size="12" />
                      Niv. {{ program.minLevel }} requis
                    </div>
                  </div>
                </div>
              </div>

              <div v-if="selectedProgram" class="program-summary">
                <p class="prog-desc">{{ selectedProgram.description }}</p>
                <div class="prog-costs">
                  <div class="cost">
                    <BaseIcon name="coins" :size="14" />
                    <span>{{ selectedProgram.cost.argent }} Cr.</span>
                  </div>
                  <div v-if="selectedProgram.cost.carburant" class="cost">
                    <BaseIcon name="rocket" :size="14" />
                    <span>{{ selectedProgram.cost.carburant }} Carb.</span>
                  </div>
                  <div v-if="selectedProgram.cost.science" class="cost">
                    <BaseIcon name="graduation" :size="14" />
                    <span>{{ selectedProgram.cost.science }} Sci.</span>
                  </div>
                </div>
                <button class="enroll-btn" :disabled="!canEnroll" @click="handleEnroll">
                  Démarrer la Formation
                </button>
              </div>
            </div>

            <!-- Active Sessions -->
            <div class="sessions-main">
              <h4 class="sessions-title">Sessions en cours</h4>
              <div v-if="trainingStore.activeTrainingSessions.length === 0" class="no-sessions">
                Aucune formation active.
              </div>
              <div v-else class="sessions-grid">
                <div
                  v-for="session in trainingStore.activeTrainingSessions"
                  :key="session.id"
                  class="session-card"
                >
                  <div class="session-header">
                    <span class="session-astro">{{ getAstronautName(session.astronautId) }}</span>
                    <span class="session-prog">{{ getProgramLabel(session.programId) }}</span>
                  </div>
                  <div class="session-progress">
                    <div class="progress-info">
                      <span>Progrès</span>
                      <span
                        >{{
                          Math.round((1 - session.remainingDays / session.totalDays) * 100)
                        }}%</span
                      >
                    </div>
                    <div class="progress-track">
                      <div
                        class="progress-fill"
                        :style="{
                          width: (1 - session.remainingDays / session.totalDays) * 100 + '%',
                        }"
                      ></div>
                    </div>
                    <div class="progress-time">
                      <BaseIcon name="history" :size="12" />
                      <span>Termine dans {{ Math.ceil(session.remainingDays) }} jours</span>
                    </div>
                  </div>
                </div>
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
import {
  MARKET_REFRESH_COST,
  useTrainingStore,
  TRAINING_PROGRAMS,
} from '../stores/useTrainingStore'
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

// Programs Logic
const selectedAstronautId = ref<number | null>(null)
const selectedProgramId = ref<string | null>(null)

const availableForTraining = computed(() =>
  trainingStore.astronauts.filter((a) => a.status === 'disponible'),
)

const selectedProgram = computed(() =>
  TRAINING_PROGRAMS.find((p) => p.id === selectedProgramId.value),
)

const selectedAstronaut = computed(() =>
  trainingStore.astronauts.find((a) => a.id === selectedAstronautId.value),
)

const isProgramLocked = (program: any) => {
  if (!selectedAstronaut.value) return false
  return selectedAstronaut.value.level < program.minLevel
}

const canEnroll = computed(() => {
  if (
    !selectedAstronautId.value ||
    !selectedProgramId.value ||
    !selectedProgram.value ||
    !selectedAstronaut.value
  )
    return false

  if (selectedAstronaut.value.status !== 'disponible') return false
  if (selectedAstronaut.value.level < selectedProgram.value.minLevel) return false

  const prog = selectedProgram.value
  const hasMoney = resourceStore.argent >= prog.cost.argent
  const hasFuel = resourceStore.carburant >= prog.cost.carburant
  const hasScience = !prog.cost.science || resourceStore.science >= prog.cost.science

  return hasMoney && hasFuel && hasScience
})

const handleEnroll = () => {
  if (selectedAstronautId.value && selectedProgramId.value) {
    const success = trainingStore.enrollInTraining(
      selectedAstronautId.value,
      selectedProgramId.value,
    )
    if (success) {
      selectedAstronautId.value = null
      selectedProgramId.value = null
    }
  }
}

const getSkillIcon = (skill: string) => {
  const icons: Record<string, string> = {
    pilotage: 'rocket',
    ingenierie: 'wrench',
    medecine: 'heart',
    science: 'graduation',
  }
  return icons[skill]
}

const getSkillLabel = (skill: string) => {
  const labels: Record<string, string> = {
    pilotage: 'Pilotage',
    ingenierie: 'Ingénierie',
    medecine: 'Médecine',
    science: 'Science',
  }
  return labels[skill]
}

const getAstronautName = (id: number) => {
  return trainingStore.astronauts.find((a) => a.id === id)?.name || 'Inconnu'
}

const getProgramLabel = (id: string) => {
  return TRAINING_PROGRAMS.find((p) => p.id === id)?.label || 'Inconnu'
}
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

/* New Programs Styles */
.programs-layout {
  display: grid;
  grid-template-columns: 400px 1fr;
  gap: 2rem;
  align-items: flex-start;
}

.programs-sidebar {
  background: rgba(15, 23, 42, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.sidebar-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.sidebar-group label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.75rem;
  color: #37d7ff;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.sidebar-select {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #fff;
  padding: 0.75rem;
  border-radius: 10px;
  font-family: 'Orbitron', sans-serif;
  font-size: 0.85rem;
  cursor: pointer;
}

.programs-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.program-selection-card {
  padding: 1rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.program-selection-card:hover:not(.locked) {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(55, 215, 255, 0.3);
}

.program-selection-card.selected {
  background: rgba(55, 215, 255, 0.1);
  border-color: #37d7ff;
}

.program-selection-card.locked {
  opacity: 0.5;
  cursor: not-allowed;
  background: rgba(0, 0, 0, 0.2);
}

.prog-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.25rem;
}

.prog-label {
  font-family: 'Orbitron', sans-serif;
  font-size: 0.9rem;
  color: #fff;
}

.prog-duration {
  font-size: 0.75rem;
  color: #64748b;
}

.prog-rewards {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.prog-xp {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.8rem;
  color: #4be0a2;
}

.prog-skill {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.75rem;
  color: #37d7ff;
}

.prog-lock {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin-top: 0.5rem;
  font-size: 0.7rem;
  color: #f87171;
}

.program-summary {
  margin-top: 1rem;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.prog-desc {
  font-size: 0.85rem;
  color: #94a3b8;
  margin-bottom: 1.5rem;
  line-height: 1.4;
}

.prog-costs {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.enroll-btn {
  width: 100%;
  background: linear-gradient(90deg, #37d7ff, #00d4ff);
  color: #000;
  border: none;
  padding: 0.8rem;
  border-radius: 12px;
  font-weight: 700;
  font-family: 'Orbitron', sans-serif;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
}

.enroll-btn:hover:not(:disabled) {
  filter: brightness(1.1);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 212, 255, 0.3);
}

.enroll-btn:disabled {
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.2);
  cursor: not-allowed;
}

.sessions-main {
  flex: 1;
}

.sessions-title {
  font-family: 'Orbitron', sans-serif;
  font-size: 1rem;
  color: #64748b;
  margin: 0 0 1rem 0;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.no-sessions {
  padding: 3rem;
  background: rgba(15, 23, 42, 0.2);
  border: 1px dashed rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  text-align: center;
  color: rgba(255, 255, 255, 0.2);
  font-family: 'JetBrains Mono', monospace;
}

.sessions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.session-card {
  background: rgba(30, 41, 59, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 1.25rem;
}

.session-header {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-bottom: 1.25rem;
}

.session-astro {
  font-family: 'Orbitron', sans-serif;
  font-size: 1.1rem;
  color: #fff;
}

.session-prog {
  font-size: 0.8rem;
  color: #37d7ff;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.session-progress {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: #94a3b8;
}

.progress-track {
  height: 6px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #37d7ff, #4be0a2);
  transition: width 0.3s ease-out;
}

.progress-time {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.7rem;
  color: #64748b;
  margin-top: 0.25rem;
}

@media (max-width: 1100px) {
  .programs-layout {
    grid-template-columns: 1fr;
  }
}
</style>
