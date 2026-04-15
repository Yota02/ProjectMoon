<template>
  <div class="training-container">
    <section class="hero-panel">
      <div class="hero-copy">
        <span class="eyebrow">ASTRO ACADEMY</span>
        <h2 class="title">Centre d'Entrainement Orbital</h2>
        <p class="subtitle">
          Préparez vos équipages pour les opérations critiques: pilotage, survie, médecine et
          maintenance de mission.
        </p>
      </div>
      <div class="hero-stats">
        <article class="stat-card">
          <span class="label">Total Astronautes</span>
          <strong class="value">{{ totalTrainees }}</strong>
        </article>
        <article class="stat-card">
          <span class="label">Programmes Actifs</span>
          <strong class="value">{{ trainingStore.activeSessions }}</strong>
        </article>
      </div>
    </section>

    <section class="market-container">
      <div class="market-header">
        <div>
          <h4>Marche des Astronautes</h4>
          <p>Recrutez des profils avec nationalite, experience et cout variable.</p>
        </div>
        <button
          @click="trainingStore.refreshMarket()"
          :disabled="!canRefreshMarket"
          class="refresh-btn"
        >
          Rafraichir ({{ MARKET_REFRESH_COST }} Credits)
        </button>
      </div>

      <div class="trainee-grid">
        <article
          class="trainee-card"
          v-for="astronaut in trainingStore.market"
          :key="astronaut.id"
          :class="astronaut.type"
        >
          <div class="card-top">
            <span class="icon-chip">{{ astronaut.flag }}</span>
            <span class="role-tag">{{ trainingStore.trainees[astronaut.type].label }}</span>
          </div>

          <div class="card-header">
            <h3>{{ astronaut.name }}</h3>
            <span class="count">{{ astronaut.experience }}</span>
          </div>

          <p class="desc">
            {{ astronaut.flag }} {{ astronaut.nationality }} -
            {{ trainingStore.trainees[astronaut.type].description }}
          </p>

          <div class="candidate-box">
            <span class="candidate-title">Specialite</span>
            <strong class="candidate-name">{{
              trainingStore.trainees[astronaut.type].label
            }}</strong>
            <div class="candidate-meta">
              <span>{{ astronaut.nationality }}</span>
              <span>{{ astronaut.experience }}</span>
            </div>
          </div>

          <div class="cost-row">
            <span class="cost-label">Cout Recrutement</span>
            <span class="cost-value">{{ astronaut.cost }} Credits</span>
          </div>

          <button
            @click="trainingStore.recruitFromMarket(astronaut.id)"
            :disabled="resourceStore.argent < astronaut.cost"
            class="train-btn"
          >
            Recruter
          </button>
        </article>
      </div>
    </section>

    <section class="roster-container">
      <div class="roster-header">
        <h4>Equipage Forme</h4>
        <span>{{ trainingStore.astronauts.length }} astronautes</span>
      </div>
      <div v-if="trainingStore.astronauts.length === 0" class="empty">Aucun astronaute formé</div>
      <div v-else class="roster-grid">
        <article
          class="astronaut-card"
          v-for="astronaut in trainingStore.astronauts"
          :key="astronaut.id"
        >
          <div class="astronaut-head">
            <strong>{{ astronaut.flag }} {{ astronaut.name }}</strong>
            <span>{{ trainingStore.trainees[astronaut.type].label }}</span>
          </div>
          <div class="astronaut-meta">
            <span>{{ astronaut.nationality }}</span>
            <span>{{ astronaut.experience }}</span>
            <span>{{ astronaut.cost }} Credits</span>
          </div>
        </article>
      </div>
    </section>

    <section class="program-block">
      <div class="program-copy">
        <span class="program-kicker">Simulation Intensif</span>
        <h4>Programme de Cohorte</h4>
        <p>Cycle complet de simulation extravehiculaire, incidents et retour d'urgence.</p>
      </div>
      <div class="program-action">
        <div class="program-cost">
          <span>{{ trainingCostIntensive.argent }} Credits</span>
          <span>{{ trainingCostIntensive.carburant }} Carburant</span>
        </div>
        <button
          @click="trainingStore.startTrainingProgram()"
          :disabled="!canRunProgram"
          class="prog-btn"
        >
          Lancer le programme
        </button>
      </div>
    </section>

    <section class="logs-container">
      <div class="logs-header">
        <h4>Journal des Formations</h4>
        <span>{{ trainingStore.logs.length }} entrées</span>
      </div>
      <div class="logs-list">
        <div v-if="trainingStore.logs.length === 0" class="empty">Aucune activité récente</div>
        <div v-for="(log, idx) in trainingStore.logs" :key="idx" class="log-entry">
          <span class="time">{{ log.temps }}</span>
          <span class="msg">{{ log.message }}</span>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { MARKET_REFRESH_COST, useTrainingStore } from '../stores/useTrainingStore'
import { useResourceStore } from '../stores/useResourceStore'

const trainingStore = useTrainingStore()
const resourceStore = useResourceStore()

const trainingCostIntensive = { argent: 100, carburant: 20 }

const totalTrainees = computed(() => trainingStore.totalTrainees)

const canRefreshMarket = computed(() => resourceStore.argent >= MARKET_REFRESH_COST)

const canRunProgram = computed(() => {
  return (
    resourceStore.argent >= trainingCostIntensive.argent &&
    resourceStore.carburant >= trainingCostIntensive.carburant
  )
})
</script>

<style scoped>
.training-container {
  --panel-bg: linear-gradient(145deg, rgba(10, 20, 40, 0.9), rgba(8, 12, 26, 0.82));
  --panel-border: rgba(255, 255, 255, 0.12);
  --text-muted: rgba(194, 206, 232, 0.75);
  --cyan: #37d7ff;
  --orange: #ff9b3f;
  --green: #4be0a2;
  --rose: #ff6e7f;
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

.hero-panel {
  display: flex;
  justify-content: space-between;
  align-items: stretch;
  gap: 1.2rem;
  padding: 1.4rem;
  border-radius: 18px;
  border: 1px solid var(--panel-border);
  background: var(--panel-bg);
  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.03),
    0 20px 35px rgba(0, 0, 0, 0.25);
}

.hero-copy {
  max-width: 720px;
}

.eyebrow {
  display: inline-block;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.68rem;
  letter-spacing: 0.2em;
  color: var(--cyan);
  margin-bottom: 0.6rem;
}

.title {
  font-family: 'Orbitron', sans-serif;
  font-size: 1.9rem;
  line-height: 1.2;
  margin: 0 0 0.4rem;
  color: #fff;
}

.subtitle {
  font-size: 0.95rem;
  line-height: 1.55;
  color: var(--text-muted);
  margin: 0;
}

.hero-stats {
  min-width: 270px;
  display: grid;
  gap: 0.75rem;
}

.stat-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 0.95rem 1rem;
}

.stat-card .label {
  display: block;
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: rgba(190, 203, 229, 0.7);
  font-family: 'JetBrains Mono', monospace;
}

.stat-card .value {
  display: block;
  margin-top: 0.2rem;
  font-size: 1.7rem;
  color: #f7fbff;
  text-shadow: 0 0 12px rgba(55, 215, 255, 0.4);
  font-family: 'Orbitron', sans-serif;
}

.trainee-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
}

.market-container {
  background: rgba(4, 8, 20, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 1rem;
}

.market-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.8rem;
}

.market-header h4 {
  margin: 0;
  font-size: 0.95rem;
  font-family: 'Orbitron', sans-serif;
}

.market-header p {
  margin: 0.2rem 0 0;
  color: var(--text-muted);
  font-size: 0.78rem;
}

.refresh-btn {
  padding: 0.6rem 0.8rem;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: rgba(255, 255, 255, 0.07);
  color: #f8fbff;
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-family: 'JetBrains Mono', monospace;
  cursor: pointer;
}

.refresh-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.trainee-card {
  position: relative;
  background: linear-gradient(160deg, rgba(9, 17, 33, 0.9), rgba(10, 15, 28, 0.9));
  border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: 16px;
  padding: 1.2rem;
  transition:
    transform 180ms ease,
    border-color 180ms ease,
    box-shadow 180ms ease;
}

.trainee-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 18px 30px rgba(0, 0, 0, 0.28);
}

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.85rem;
}

.icon-chip {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  font-size: 1.1rem;
  font-weight: 800;
  background: rgba(255, 255, 255, 0.08);
}

.role-tag {
  font-size: 0.63rem;
  letter-spacing: 0.16em;
  font-family: 'JetBrains Mono', monospace;
  color: rgba(194, 206, 232, 0.8);
}

.pilote {
  border-color: rgba(55, 215, 255, 0.3);
}
.pilote .icon-chip {
  background: var(--cyan);
}

.ingenieur_vol {
  border-color: rgba(255, 155, 63, 0.3);
}
.ingenieur_vol .icon-chip {
  background: var(--orange);
}

.medic {
  border-color: rgba(75, 224, 162, 0.3);
}
.medic .icon-chip {
  background: var(--green);
}

.specialiste {
  border-color: rgba(255, 110, 127, 0.3);
}
.specialiste .icon-chip {
  background: var(--rose);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.65rem;
}

.card-header h3 {
  font-family: 'Orbitron', sans-serif;
  font-size: 1rem;
  letter-spacing: 0.02em;
  margin: 0;
}

.count {
  font-family: 'Orbitron', sans-serif;
  font-size: 0.9rem;
  color: #f3fbff;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.16);
}

.desc {
  font-size: 0.85rem;
  line-height: 1.45;
  color: var(--text-muted);
  min-height: 2.8rem;
  margin: 0 0 1rem;
}

.cost-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.9rem;
  padding-top: 0.7rem;
  border-top: 1px solid rgba(255, 255, 255, 0.07);
}

.cost-label {
  font-size: 0.64rem;
  opacity: 0.75;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  font-family: 'JetBrains Mono', monospace;
}
.cost-value {
  font-size: 0.86rem;
  font-weight: 700;
  color: #fcfdff;
}

.candidate-box {
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.03);
  border-radius: 10px;
  padding: 0.65rem;
  margin-bottom: 0.9rem;
}

.candidate-title {
  display: block;
  font-size: 0.6rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: rgba(190, 203, 229, 0.7);
  font-family: 'JetBrains Mono', monospace;
}

.candidate-name {
  display: block;
  margin-top: 0.2rem;
  font-size: 0.9rem;
  color: #f6fbff;
}

.candidate-meta {
  margin-top: 0.25rem;
  display: flex;
  justify-content: space-between;
  gap: 0.4rem;
  font-size: 0.68rem;
  color: rgba(194, 206, 232, 0.8);
  font-family: 'JetBrains Mono', monospace;
}

.roster-container {
  background: rgba(4, 8, 20, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 1rem;
}

.roster-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.7rem;
}

.roster-header h4 {
  margin: 0;
  font-size: 0.9rem;
  color: #f4f9ff;
  font-family: 'Orbitron', sans-serif;
}

.roster-header span {
  font-size: 0.67rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: rgba(190, 203, 229, 0.7);
}

.roster-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 0.6rem;
}

.astronaut-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: 10px;
  padding: 0.7rem;
}

.astronaut-head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 0.6rem;
}

.astronaut-head strong {
  font-size: 0.85rem;
  color: #f6fbff;
}

.astronaut-head span {
  font-size: 0.65rem;
  color: rgba(194, 206, 232, 0.8);
  font-family: 'JetBrains Mono', monospace;
}

.astronaut-meta {
  margin-top: 0.3rem;
  display: flex;
  justify-content: space-between;
  gap: 0.4rem;
  font-size: 0.66rem;
  color: rgba(194, 206, 232, 0.84);
  font-family: 'JetBrains Mono', monospace;
}

.train-btn {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.18);
  color: #f8fbff;
  width: 100%;
  padding: 0.75rem;
  border-radius: 8px;
  font-weight: 700;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.72rem;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  cursor: pointer;
  transition:
    background 150ms ease,
    border-color 150ms ease,
    transform 150ms ease;
}

.train-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.35);
  transform: translateY(-1px);
}

.train-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.program-block {
  background: linear-gradient(140deg, rgba(13, 26, 53, 0.9), rgba(33, 17, 18, 0.82));
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 1.25rem;
  border-radius: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.program-kicker {
  display: inline-block;
  font-size: 0.63rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--orange);
  font-family: 'JetBrains Mono', monospace;
  margin-bottom: 0.4rem;
}

.program-copy h4 {
  font-family: 'Orbitron', sans-serif;
  margin: 0 0 0.35rem;
  font-size: 1.2rem;
}

.program-copy p {
  margin: 0;
  color: var(--text-muted);
  font-size: 0.88rem;
}

.program-action {
  min-width: 270px;
  display: grid;
  gap: 0.7rem;
}

.program-cost {
  display: flex;
  justify-content: space-between;
  gap: 0.8rem;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.72rem;
  color: #d9ecff;
  padding: 0.55rem 0.7rem;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.11);
  background: rgba(255, 255, 255, 0.04);
}

.prog-btn {
  width: 100%;
  padding: 0.75rem 1rem;
  background: linear-gradient(90deg, #ff9b3f, #ff6e7f);
  border: none;
  color: #1a1114;
  border-radius: 8px;
  font-weight: 700;
  text-transform: uppercase;
  font-size: 0.72rem;
  letter-spacing: 0.09em;
  font-family: 'JetBrains Mono', monospace;
  cursor: pointer;
  transition:
    transform 150ms ease,
    filter 150ms ease,
    opacity 150ms ease;
}

.prog-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  filter: brightness(1.04);
}

.prog-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.logs-container {
  background: rgba(4, 8, 20, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 1rem;
}

.logs-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.7rem;
}

.logs-header h4 {
  margin: 0;
  font-size: 0.9rem;
  color: #f4f9ff;
  font-family: 'Orbitron', sans-serif;
}

.logs-header span {
  font-size: 0.67rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: rgba(190, 203, 229, 0.7);
}

.logs-list {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.72rem;
  max-height: 220px;
  overflow-y: auto;
  padding-right: 0.3rem;
}

.log-entry {
  display: grid;
  grid-template-columns: 90px 1fr;
  gap: 0.8rem;
  margin-bottom: 0.35rem;
  padding: 0.45rem 0.5rem;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.02);
}

.log-entry .time {
  opacity: 0.6;
}

.log-entry .msg {
  color: var(--text-muted);
}

.empty {
  color: rgba(190, 203, 229, 0.65);
  text-align: center;
  padding: 0.8rem 0;
}

@media (max-width: 900px) {
  .hero-panel {
    flex-direction: column;
  }

  .market-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .hero-stats,
  .program-action {
    min-width: 0;
  }

  .title {
    font-size: 1.5rem;
  }

  .program-block {
    flex-direction: column;
    align-items: stretch;
  }

  .log-entry {
    grid-template-columns: 1fr;
    gap: 0.2rem;
  }
}
</style>
