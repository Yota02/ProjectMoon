<template>
  <div class="personnel-container">
    <div class="header">
      <div class="title-group">
        <h2 class="title">UNITÉ RH & INFRASTRUCTURE</h2>
        <p class="subtitle">Gestion stratégique du personnel et expansion de la base</p>
      </div>
      <div class="stats">
        <div class="stat-pill">
          <span class="l">TOTAL PERSONNEL</span>
          <span class="v">{{ totalStaff }}</span>
        </div>
      </div>
    </div>

    <div class="staff-grid">
      <div 
        class="staff-card" 
        v-for="role in staffRoles" 
        :key="role"
        :class="role"
      >
        <div class="card-glow"></div>
        <div class="card-content">
          <div class="card-header">
            <h3>{{ personnelStore.staff[role].label.toUpperCase() }}</h3>
            <span class="count">{{ personnelStore.staff[role].count }}</span>
          </div>
          <p class="desc">{{ personnelStore.staff[role].description }}</p>
          
          <div class="cost-info">
            <span class="c-label">COÛT RECRUTEMENT</span>
            <span class="c-val">{{ personnelStore.staff[role].hiringCost }} CRÉDITS</span>
          </div>

          <button 
            @click="personnelStore.hire(role)"
            :disabled="resourceStore.argent < personnelStore.staff[role].hiringCost"
            class="hire-btn"
          >
            RECRUTER
          </button>
        </div>
      </div>
    </div>

    <div class="operations-grid">
      <div class="op-block scientific">
        <div class="op-info">
          <h4>PROTOCOLE SCIENTIFIQUE</h4>
          <p>Exploitez vos données pour générer de la science pure.</p>
        </div>
        <button 
          @click="personnelStore.runResearchProtocol()"
          :disabled="!personnelStore.hasScientifique"
          class="op-btn"
        >
          LANCER L'ANALYSE
        </button>
      </div>

      <div class="op-block infra">
        <div class="op-info">
          <h4>RAFFINERIE DE PROPERGOL</h4>
          <p>Extension de la capacité de traitement du carburant.</p>
          <span class="cost">{{ personnelStore.refineryCost.argent }}A / {{ personnelStore.refineryCost.carburant }}C</span>
        </div>
        <button 
          @click="personnelStore.buildRefinery()"
          :disabled="!personnelStore.hasConstructeur || !canBuildRefinery"
          class="op-btn"
        >
          CONSTRUIRE
        </button>
      </div>
    </div>

    <div class="logs-container">
      <div class="logs-header">JOURNAL DES OPÉRATIONS RH</div>
      <div class="logs-list">
        <div v-if="personnelStore.logs.length === 0" class="empty">AUCUNE ACTIVITÉ RÉCENTE</div>
        <div v-for="(log, idx) in personnelStore.logs" :key="idx" class="log-entry">
          <span class="time">[{{ log.temps }}]</span>
          <span class="msg">{{ log.message }}</span>
        </div>
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

const totalStaff = computed(() => {
  return Object.values(personnelStore.staff).reduce((acc, curr) => acc + curr.count, 0)
})

const canBuildRefinery = computed(() => {
  return (
    resourceStore.argent >= personnelStore.refineryCost.argent &&
    resourceStore.carburant >= personnelStore.refineryCost.carburant
  )
})
</script>

<style scoped>
.personnel-container {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

.header {
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
}

.subtitle {
  font-size: 0.9rem;
  color: var(--text-dim);
  margin: 0.25rem 0 0 0;
}

.stat-pill {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 0.5rem 1rem;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.stat-pill .l { font-size: 0.6rem; opacity: 0.5; font-family: 'JetBrains Mono', monospace; }
.stat-pill .v { font-size: 1.2rem; font-weight: 800; color: var(--primary); font-family: 'Orbitron', sans-serif; }

.staff-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.staff-card {
  position: relative;
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s;
}

.staff-card:hover {
  transform: translateY(-5px);
  border-color: var(--primary);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
}

.card-glow {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
}

.ingenieur .card-glow { background: var(--secondary); }
.scientifique .card-glow { background: var(--primary); }
.constructeur .card-glow { background: #ffd700; }

.card-content {
  padding: 2rem;
  z-index: 1;
  position: relative;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.card-header h3 {
  font-family: 'Orbitron', sans-serif;
  font-size: 1.1rem;
  margin: 0;
}

.count {
  font-family: 'Orbitron', sans-serif;
  font-size: 1.5rem;
  font-weight: 900;
  opacity: 0.3;
}

.desc {
  font-size: 0.9rem;
  color: var(--text-dim);
  height: 3rem;
  margin-bottom: 2rem;
}

.cost-info {
  display: flex;
  flex-direction: column;
  margin-bottom: 1.5rem;
}

.c-label { font-size: 0.6rem; opacity: 0.5; font-family: 'JetBrains Mono', monospace; }
.c-val { font-size: 1rem; font-weight: 700; color: #fff; }

.hire-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #fff;
  width: 100%;
  padding: 1rem;
  border-radius: 8px;
  font-weight: 700;
  font-family: 'Orbitron', sans-serif;
  cursor: pointer;
  transition: all 0.2s;
}

.hire-btn:hover:not(:disabled) {
  background: var(--primary);
  color: #000;
  border-color: var(--primary);
  box-shadow: 0 0 15px var(--accent-glow);
}

.hire-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.operations-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.op-block {
  background: rgba(15, 52, 96, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.05);
  padding: 2rem;
  border-radius: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.op-info h4 { font-family: 'Orbitron', sans-serif; margin: 0; font-size: 0.9rem; }
.op-info p { font-size: 0.8rem; color: var(--text-dim); margin: 0.5rem 0; }
.op-info .cost { font-family: 'JetBrains Mono', monospace; font-size: 0.7rem; color: var(--primary); }

.op-btn {
  padding: 0.75rem 1.5rem;
  background: transparent;
  border: 1px solid var(--secondary);
  color: var(--secondary);
  border-radius: 4px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.op-btn:hover:not(:disabled) {
  background: var(--secondary);
  color: #fff;
  box-shadow: 0 0 15px rgba(233, 69, 96, 0.4);
}

.op-btn:disabled { opacity: 0.2; cursor: not-allowed; }

.logs-container {
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  padding: 1.5rem;
}

.logs-header {
  font-size: 0.7rem;
  color: var(--primary);
  text-transform: uppercase;
  letter-spacing: 2px;
  margin-bottom: 1rem;
}

.logs-list {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.75rem;
  max-height: 200px;
  overflow-y: auto;
}

.log-entry { margin-bottom: 0.5rem; }
.log-entry .time { opacity: 0.3; margin-right: 1rem; }
.log-entry .msg { color: var(--text-dim); }

@media (max-width: 900px) {
  .operations-grid { grid-template-columns: 1fr; }
}
</style>
