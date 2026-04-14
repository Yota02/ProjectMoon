<template>
  <div class="mission-terminal">
    <div class="terminal-header">
      <div class="title-group">
        <h2 class="title">TERMINAL DE LANCEMENT</h2>
        <p class="subtitle">Sélection et déploiement des vecteurs d'exploration</p>
      </div>
      <div class="requirements-pill" :class="{ ok: personnelStore.hasIngenieur }">
        <span class="icon">{{ personnelStore.hasIngenieur ? '✓' : '⚠' }}</span>
        <span class="text">INGÉNIEURS DISPONIBLES</span>
      </div>
    </div>

    <div class="mission-grid">
      <div 
        v-for="mission in missionStore.missions" 
        :key="mission.id" 
        class="mission-dossier"
        :class="mission.status.toLowerCase()"
      >
        <div class="dossier-id">ID-{{ mission.id.toString().padStart(3, '0') }}</div>
        <div class="dossier-content">
          <h3 class="mission-name">{{ mission.name.toUpperCase() }}</h3>
          
          <div class="probability-section">
            <div class="prob-header">
              <span>SUCCÈS ESTIMÉ</span>
              <span class="perc">{{ (mission.successChance * 100).toFixed(0) }}%</span>
            </div>
            <div class="prob-bar">
              <div class="prob-fill" :style="{ width: (mission.successChance * 100) + '%' }"></div>
            </div>
          </div>

          <div class="data-row">
            <div class="data-item">
              <span class="l">COÛT ARGENT</span>
              <span class="v">{{ mission.cost.argent }}</span>
            </div>
            <div class="data-item">
              <span class="l">COÛT CARBURANT</span>
              <span class="v">{{ mission.cost.carburant }}</span>
            </div>
          </div>

          <div class="reward-box">
            <span class="prefix">RÉCOMPENSE:</span>
            <span class="val">+{{ mission.reward.science }} DATA</span>
          </div>

          <button 
            @click="missionStore.launchMission(mission.id)"
            :disabled="!canAfford(mission)"
            class="launch-btn"
          >
            LANCER LA SÉQUENCE
          </button>

          <div class="mission-status" v-if="mission.status !== 'Disponible'">
            DERNIER RÉSULTAT: <span class="status-val">{{ mission.status.toUpperCase() }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="log-terminal">
      <div class="terminal-bar">LOGS DE TRANSMISSION</div>
      <div class="terminal-content">
        <div v-if="missionStore.logs.length === 0" class="no-signal">COMMUNICATION EN ATTENTE...</div>
        <div v-for="(log, idx) in missionStore.logs" :key="idx" class="log-line">
          <span class="timestamp">[{{ log.temps }}]</span>
          <span class="message">{{ log.message }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useMissionStore, type Mission } from '../stores/useMissionStore'
import { useResourceStore } from '../stores/useResourceStore'
import { usePersonnelStore } from '../stores/usePersonnelStore'

const missionStore = useMissionStore()
const resourceStore = useResourceStore()
const personnelStore = usePersonnelStore()

const canAfford = (mission: Mission) => {
  return (
    resourceStore.argent >= mission.cost.argent &&
    resourceStore.carburant >= mission.cost.carburant &&
    personnelStore.hasIngenieur
  )
}
</script>

<style scoped>
.mission-terminal {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

.terminal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.title {
  font-family: 'Orbitron', sans-serif;
  font-weight: 800;
  font-size: 1.5rem;
  margin: 0;
  color: #fff;
  letter-spacing: 1px;
}

.subtitle {
  font-size: 0.9rem;
  color: var(--text-dim);
  margin: 0.25rem 0 0 0;
}

.requirements-pill {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: rgba(233, 69, 96, 0.1);
  border: 1px solid rgba(233, 69, 96, 0.2);
  color: var(--secondary);
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.7rem;
  font-weight: 700;
}

.requirements-pill.ok {
  background: rgba(77, 168, 218, 0.1);
  border-color: rgba(77, 168, 218, 0.2);
  color: var(--primary);
}

.mission-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 2rem;
}

.mission-dossier {
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  position: relative;
  overflow: hidden;
  transition: all 0.3s;
}

.mission-dossier:hover {
  border-color: var(--primary);
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
}

.dossier-id {
  position: absolute;
  top: 1rem;
  right: 1.5rem;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.6rem;
  opacity: 0.2;
}

.dossier-content {
  padding: 2rem;
}

.mission-name {
  font-family: 'Orbitron', sans-serif;
  font-size: 1.1rem;
  margin: 0 0 1.5rem 0;
  letter-spacing: 1px;
}

.probability-section {
  margin-bottom: 2rem;
}

.prob-header {
  display: flex;
  justify-content: space-between;
  font-size: 0.6rem;
  font-family: 'JetBrains Mono', monospace;
  margin-bottom: 0.5rem;
  opacity: 0.5;
}

.prob-header .perc { color: var(--primary); opacity: 1; font-weight: 700; }

.prob-bar {
  height: 4px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 2px;
}

.prob-fill {
  height: 100%;
  background: var(--primary);
  box-shadow: 0 0 8px var(--accent-glow);
}

.data-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.data-item {
  display: flex;
  flex-direction: column;
}

.data-item .l { font-size: 0.55rem; opacity: 0.4; font-family: 'JetBrains Mono', monospace; }
.data-item .v { font-size: 1rem; font-weight: 700; color: #fff; }

.reward-box {
  background: rgba(77, 168, 218, 0.05);
  padding: 0.75rem;
  border-radius: 4px;
  margin-bottom: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.reward-box .prefix { font-size: 0.6rem; opacity: 0.5; }
.reward-box .val { font-weight: 700; color: var(--primary); font-family: 'JetBrains Mono', monospace; }

.launch-btn {
  width: 100%;
  padding: 1rem;
  background: transparent;
  border: 1px solid var(--primary);
  color: var(--primary);
  font-family: 'Orbitron', sans-serif;
  font-weight: 700;
  font-size: 0.8rem;
  cursor: pointer;
  letter-spacing: 2px;
  transition: all 0.2s;
}

.launch-btn:hover:not(:disabled) {
  background: var(--primary);
  color: #000;
  box-shadow: 0 0 20px var(--accent-glow);
}

.launch-btn:disabled {
  opacity: 0.2;
  cursor: not-allowed;
  border-color: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.2);
}

.mission-status {
  margin-top: 1.5rem;
  font-size: 0.65rem;
  font-family: 'JetBrains Mono', monospace;
  opacity: 0.5;
  text-align: center;
}

.status-val { font-weight: 700; color: var(--primary); }
.mission-dossier.succès { border-color: #00f2ff; }
.mission-dossier.échec { border-color: var(--secondary); }

.log-terminal {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 4px;
  overflow: hidden;
}

.terminal-bar {
  background: rgba(255, 255, 255, 0.03);
  padding: 0.5rem 1rem;
  font-size: 0.6rem;
  font-family: 'JetBrains Mono', monospace;
  letter-spacing: 2px;
  opacity: 0.5;
}

.terminal-content {
  padding: 1.5rem;
  height: 200px;
  overflow-y: auto;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.7rem;
}

.log-line { margin-bottom: 0.4rem; }
.timestamp { color: var(--primary); opacity: 0.5; margin-right: 1rem; }
.no-signal { opacity: 0.2; text-align: center; padding-top: 3rem; }
</style>
