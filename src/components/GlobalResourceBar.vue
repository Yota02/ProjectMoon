<template>
  <div class="global-resource-bar">
    <div class="resource-item money">
      <div class="info">
        <span class="label">CREDITS</span>
        <span class="value">{{ Math.floor(resourceStore.argent).toLocaleString() }}</span>
      </div>
      <div class="trend">+{{ contractStore.totalMonthlyRevenue.toFixed(0) }}M/mois</div>
    </div>

    <div class="divider"></div>

    <div class="resource-item science">
      <div class="info">
        <span class="label">DATA</span>
        <span class="value">{{ Math.floor(resourceStore.science).toLocaleString() }}</span>
      </div>
      <div class="trend">+{{ resourceStore.production.science }}/s</div>
    </div>

    <div class="divider"></div>

    <div class="resource-item fuel">
      <div class="info">
        <span class="label">PROPELLANT</span>
        <span class="value">{{ Math.floor(resourceStore.carburant).toLocaleString() }}</span>
      </div>
      <div class="trend">+{{ resourceStore.production.carburant }}/s</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useResourceStore } from '../stores/useResourceStore'
import { useContractStore } from '../stores/useContractStore'

const resourceStore = useResourceStore()
const contractStore = useContractStore()
</script>

<style scoped>
.global-resource-bar {
  display: flex;
  align-items: center;
  gap: 2rem;
  font-family: 'JetBrains Mono', monospace;
}

.resource-item {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.info {
  display: flex;
  flex-direction: column;
  line-height: 1.1;
}

.label {
  font-size: 0.55rem;
  color: rgba(255, 255, 255, 0.4);
  letter-spacing: 1px;
}

.value {
  font-size: 1.1rem;
  font-weight: 700;
  color: #fff;
}

.trend {
  font-size: 0.65rem;
  font-weight: 700;
  padding: 0.1rem 0.4rem;
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.05);
}

.money .trend {
  color: #ffd700;
  background: rgba(255, 215, 0, 0.1);
}
.science .trend {
  color: var(--primary);
  background: rgba(77, 168, 218, 0.1);
}
.fuel .trend {
  color: var(--secondary);
  background: rgba(233, 69, 96, 0.1);
}

.divider {
  width: 1px;
  height: 20px;
  background: rgba(255, 255, 255, 0.1);
}

@media (max-width: 900px) {
  .divider,
  .trend {
    display: none;
  }
  .global-resource-bar {
    gap: 1rem;
  }
}
</style>
