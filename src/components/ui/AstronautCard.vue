<template>
  <article class="astronaut-card" :class="[type, { 'is-market': isMarket }]">
    <div class="card-glow"></div>
    <div class="card-content">
      <div class="card-top">
        <div class="icon-wrapper">
          <BaseIcon :name="typeIcon" :size="20" />
        </div>
        <div class="nationality-badge">
          <span>{{ flag }}</span>
          <span class="nat-text">{{ nationality }}</span>
        </div>
      </div>

      <div class="card-main">
        <h3 class="name">{{ name }}</h3>
        <div class="role-row">
          <span class="role-tag">{{ roleLabel }}</span>
          <div class="experience-badge" :class="experience.toLowerCase()">
            {{ experience }}
          </div>
        </div>
      </div>

      <div v-if="isMarket" class="card-footer">
        <div class="cost-info">
          <span class="label">Coût de recrutement</span>
          <div class="value">
            <BaseIcon name="coins" :size="14" />
            <span>{{ cost }} Credits</span>
          </div>
        </div>
        <button
          @click="$emit('recruit')"
          :disabled="disabled"
          class="action-btn recruit-btn"
        >
          Recruter
        </button>
      </div>
      <div v-else class="card-footer recruited">
        <div class="status-badge">
          <BaseIcon name="check" :size="12" />
          <span>Opérationnel</span>
        </div>
        <div class="id-tag">#{{ id.toString().padStart(3, '0') }}</div>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import BaseIcon from './BaseIcon.vue'
import type { TrainingType, AstronautExperience } from '../../stores/useTrainingStore'

const props = defineProps<{
  id: number
  name: string
  nationality: string
  flag: string
  experience: AstronautExperience
  type: TrainingType
  cost: number
  isMarket?: boolean
  disabled?: boolean
}>()

defineEmits(['recruit'])

const roleLabel = computed(() => {
  const labels: Record<TrainingType, string> = {
    pilote: 'Pilote d\'Élite',
    ingenieur_vol: 'Ingénieur de Vol',
    medic: 'Médecin Spatial',
    specialiste: 'Spécialiste Mission'
  }
  return labels[props.type]
})

const typeIcon = computed(() => {
  const icons: Record<TrainingType, string> = {
    pilote: 'rocket',
    ingenieur_vol: 'wrench',
    medic: 'heart',
    specialiste: 'shield'
  }
  return icons[props.type]
})
</script>

<style scoped>
.astronaut-card {
  position: relative;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
}

.astronaut-card:hover {
  transform: translateY(-4px);
  border-color: rgba(255, 255, 255, 0.2);
  box-shadow: 0 12px 24px -8px rgba(0, 0, 0, 0.5);
}

.card-glow {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at 50% 0%, var(--accent-color, transparent) 0%, transparent 70%);
  opacity: 0.1;
  pointer-events: none;
}

.astronaut-card.pilote { --accent-color: #37d7ff; }
.astronaut-card.ingenieur_vol { --accent-color: #ff9b3f; }
.astronaut-card.medic { --accent-color: #4be0a2; }
.astronaut-card.specialiste { --accent-color: #ff6e7f; }

.card-content {
  padding: 1.25rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  z-index: 1;
}

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.icon-wrapper {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent-color);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.nationality-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.75rem;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 20px;
  font-size: 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.nat-text {
  color: rgba(255, 255, 255, 0.7);
  font-family: 'JetBrains Mono', monospace;
}

.card-main {
  margin-bottom: 1.5rem;
}

.name {
  font-family: 'Orbitron', sans-serif;
  font-size: 1.1rem;
  color: #fff;
  margin: 0 0 0.5rem 0;
  letter-spacing: 0.5px;
}

.role-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.role-tag {
  font-size: 0.7rem;
  color: var(--accent-color);
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 600;
}

.experience-badge {
  font-size: 0.65rem;
  padding: 0.1rem 0.5rem;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
  font-family: 'JetBrains Mono', monospace;
}

.experience-badge.junior { color: #94a3b8; }
.experience-badge.confirme { color: #fbbf24; }
.experience-badge.veteran { color: #f87171; }

.card-footer {
  margin-top: auto;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.cost-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.cost-info .label {
  font-size: 0.65rem;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.cost-info .value {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  color: #fff;
  font-weight: 700;
  font-family: 'JetBrains Mono', monospace;
}

.recruit-btn {
  width: 100%;
  padding: 0.75rem;
  border-radius: 10px;
  background: var(--accent-color);
  color: #000;
  border: none;
  font-weight: 700;
  font-family: 'JetBrains Mono', monospace;
  text-transform: uppercase;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.recruit-btn:hover:not(:disabled) {
  filter: brightness(1.1);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
}

.recruit-btn:disabled {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.3);
  cursor: not-allowed;
}

.card-footer.recruited {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-badge {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.7rem;
  color: #4be0a2;
  font-weight: 600;
}

.id-tag {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.3);
}
</style>
