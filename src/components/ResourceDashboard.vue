<template>
  <div class="resource-dashboard">
    <h2>📡 Centre de Ressources</h2>
    <div class="resources">
      <div class="resource">
        <span class="label">Argent</span>
        <span class="valeur">{{ Math.floor(resourceStore.argent) }}</span>
        <span class="prod">(+{{ resourceStore.production.argent }}/s)</span>
        <button @click="resourceStore.addArgent(10)">+10 Manuel</button>
      </div>
      <div class="resource">
        <span class="label">Science</span>
        <span class="valeur">{{ Math.floor(resourceStore.science) }}</span>
        <span class="prod">(+{{ resourceStore.production.science }}/s)</span>
        <button @click="resourceStore.addScience(5)">+5 Manuel</button>
      </div>
      <div class="resource">
        <span class="label">Carburant</span>
        <span class="valeur">{{ Math.floor(resourceStore.carburant) }}</span>
        <span class="prod">(+{{ resourceStore.production.carburant }}/s)</span>
        <button @click="resourceStore.addCarburant(2)">+2 Manuel</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useResourceStore } from '../stores/useResourceStore'

const resourceStore = useResourceStore()
</script>

<style scoped>
.resource-dashboard {
  background-color: #1a1a2e;
  color: #e0e0e0;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
  margin-bottom: 2rem;
  border: 1px solid #16213e;
}

h2 {
  margin-top: 0;
  color: #4da8da;
}

.resources {
  display: flex;
  gap: 1.5rem;
}

.resource {
  background-color: #0f3460;
  padding: 1.5rem;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}

.label {
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-size: 0.9rem;
  color: #a2a8d3;
}

.valeur {
  font-size: 2rem;
  font-weight: bold;
  margin: 0.5rem 0;
}

.prod {
  font-size: 0.8rem;
  color: #4da8da;
  margin-bottom: 1rem;
}

button {
  background-color: #e94560;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.2s;
}

button:hover {
  background-color: #d13c54;
}
</style>
