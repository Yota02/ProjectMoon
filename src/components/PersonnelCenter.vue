<template>
  <div class="personnel-center">
    <h2>🧑‍🚀 Centre de Personnel</h2>

    <div class="staff-grid">
      <article class="staff-card" v-for="role in staffRoles" :key="role">
        <h3>{{ personnelStore.staff[role].label }}</h3>
        <p class="description">{{ personnelStore.staff[role].description }}</p>
        <p><strong>Effectif :</strong> {{ personnelStore.staff[role].count }}</p>
        <p><strong>Cout embauche :</strong> {{ personnelStore.staff[role].hiringCost }} Argent</p>
        <button
          @click="personnelStore.hire(role)"
          :disabled="resourceStore.argent < personnelStore.staff[role].hiringCost"
        >
          Embaucher
        </button>
      </article>
    </div>

    <div class="actions">
      <button
        class="secondary"
        @click="personnelStore.runResearchProtocol()"
        :disabled="!personnelStore.hasScientifique"
      >
        Lancer protocole scientifique
      </button>

      <button
        class="secondary"
        @click="personnelStore.buildRefinery()"
        :disabled="!personnelStore.hasConstructeur || !canBuildRefinery"
      >
        Construire raffinerie ({{ personnelStore.refineryCost.argent }}A /
        {{ personnelStore.refineryCost.carburant }}C)
      </button>
    </div>

    <div class="logs-section">
      <h3>Journal RH / Infrastructure</h3>
      <div class="logs">
        <p v-for="(log, idx) in personnelStore.logs" :key="idx">
          <span class="time">[{{ log.temps }}]</span> {{ log.message }}
        </p>
        <p v-if="personnelStore.logs.length === 0" class="empty-log">
          Aucune embauche ni construction.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { usePersonnelStore, type StaffRole } from '../stores/usePersonnelStore'
import { useResourceStore } from '../stores/useResourceStore'

const personnelStore = usePersonnelStore()
const resourceStore = useResourceStore()

const staffRoles: StaffRole[] = ['ingenieur', 'scientifique', 'constructeur']

const canBuildRefinery = computed(() => {
  return (
    resourceStore.argent >= personnelStore.refineryCost.argent &&
    resourceStore.carburant >= personnelStore.refineryCost.carburant
  )
})
</script>

<style scoped>
.personnel-center {
  background-color: #1a1a2e;
  color: #e0e0e0;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
  margin-bottom: 2rem;
  border: 1px solid #16213e;
}

h2,
h3 {
  color: #4da8da;
  margin-top: 0;
}

.staff-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
}

.staff-card {
  background-color: #0f3460;
  padding: 1rem;
  border-radius: 8px;
}

.description {
  color: #a2a8d3;
  min-height: 40px;
}

button {
  background-color: #4da8da;
  color: #1a1a2e;
  border: none;
  padding: 0.6rem 1rem;
  width: 100%;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}

button:hover:not(:disabled) {
  opacity: 0.85;
}

button:disabled {
  background-color: #555;
  color: #888;
  cursor: not-allowed;
}

.actions {
  margin-top: 1rem;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.secondary {
  background-color: #e94560;
  color: white;
}

.logs-section {
  margin-top: 1rem;
  background-color: #0d1b2a;
  padding: 1rem;
  border-radius: 8px;
}

.logs {
  font-family: monospace;
  font-size: 0.9rem;
  max-height: 140px;
  overflow-y: auto;
}

.time {
  color: #4da8da;
}

.empty-log {
  color: #555;
  font-style: italic;
}

@media (max-width: 720px) {
  .actions {
    grid-template-columns: 1fr;
  }
}
</style>
