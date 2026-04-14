<template>
  <div class="mission-list">
    <h2>🚀 Centre de Contrôle des Missions</h2>
    <div class="missions-container">
      <div v-for="mission in missionStore.missions" :key="mission.id" class="mission-card">
        <h3>{{ mission.name }}</h3>
        <ul class="costs-rewards">
          <li><strong>Coût :</strong> {{ mission.cost.argent }} Argent | {{ mission.cost.carburant }} Carburant</li>
          <li><strong>Succès :</strong> {{ mission.successChance * 100 }}%</li>
          <li><strong>Récompense :</strong> +{{ mission.reward.science }} Science</li>
        </ul>
        <button 
          @click="missionStore.launchMission(mission.id)"
          :disabled="!canAfford(mission)"
          class="launch-btn"
        >
          LANCER
        </button>
        <div class="status" v-if="mission.status !== 'Disponible'">
          Dernier lancement : 
          <span :class="{'success': mission.status === 'Succès', 'fail': mission.status === 'Échec'}">
            {{ mission.status }}
          </span>
        </div>
      </div>
    </div>

    <div class="logs-section">
      <h3>Journal de Bord</h3>
      <div class="logs">
        <p v-for="(log, idx) in missionStore.logs" :key="idx">
          <span class="time">[{{ log.temps }}]</span> {{ log.message }}
        </p>
        <p v-if="missionStore.logs.length === 0" class="empty-log">Aucune mission lancée.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useMissionStore } from '../stores/useMissionStore'
import { useResourceStore } from '../stores/useResourceStore'

const missionStore = useMissionStore()
const resourceStore = useResourceStore()

const canAfford = (mission) => {
  return resourceStore.argent >= mission.cost.argent && 
         resourceStore.carburant >= mission.cost.carburant
}
</script>

<style scoped>
.mission-list {
  background-color: #1a1a2e;
  color: #e0e0e0;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
  border: 1px solid #16213e;
}

h2, h3 {
  color: #4da8da;
  margin-top: 0;
}

.missions-container {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.mission-card {
  background-color: #0f3460;
  padding: 1.5rem;
  border-radius: 8px;
  flex: 1;
  min-width: 250px;
}

.costs-rewards {
  list-style: none;
  padding: 0;
  margin: 1rem 0;
  color: #a2a8d3;
}

.launch-btn {
  background-color: #4da8da;
  color: #1a1a2e;
  border: none;
  padding: 0.75rem 1.5rem;
  width: 100%;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  transition: opacity 0.2s;
  letter-spacing: 1px;
}

.launch-btn:hover:not(:disabled) {
  opacity: 0.8;
}

.launch-btn:disabled {
  background-color: #555;
  color: #888;
  cursor: not-allowed;
}

.status {
  margin-top: 1rem;
  font-size: 0.9rem;
}

.success { color: #4ade80; font-weight: bold; }
.fail { color: #f87171; font-weight: bold; }

.logs-section {
  background-color: #0d1b2a;
  padding: 1rem;
  border-radius: 8px;
}

.logs {
  font-family: monospace;
  font-size: 0.9rem;
  max-height: 150px;
  overflow-y: auto;
}

.time { color: #4da8da; }
.empty-log { color: #555; font-style: italic; }
</style>
