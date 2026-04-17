import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useMissionStore } from './useMissionStore'
import { useContractStore, type Faction } from './useContractStore'
import { useGameStore } from './useGameStore'
import { gameEvents } from '@/engine/EventBus'

export interface Competitor {
  id: string
  name: string
  faction: Faction
  color: string
  description: string
  progress: Record<number, number> // Mission ID -> Progress (0-100)
  completedMissionIds: number[]
  speedMultiplier: number // How fast they progress (0.8 to 1.5)
}

export const useCompetitorStore = defineStore('competitor', () => {
  const missionStore = useMissionStore()
  const contractStore = useContractStore()
  const gameStore = useGameStore()

  const competitors = ref<Competitor[]>([
    {
      id: 'nasa',
      name: 'NASA',
      faction: 'USA',
      color: '#3b82f6',
      description: 'Agence spatiale américaine historique, bénéficiant de gros budgets.',
      progress: {},
      completedMissionIds: [],
      speedMultiplier: 1.0,
    },
    {
      id: 'cnsa',
      name: 'CNSA',
      faction: 'Chine',
      color: '#ef4444',
      description: 'Expansion rapide et planification à long terme rigoureuse.',
      progress: {},
      completedMissionIds: [],
      speedMultiplier: 1.1,
    },
    {
      id: 'spacex',
      name: 'SpaceX',
      faction: 'Privé',
      color: '#94a3b8',
      description: 'Innovation radicale et réutilisabilité, progression agressive.',
      progress: {},
      completedMissionIds: [],
      speedMultiplier: 1.3,
    },
  ])

  const setupCompetitorListeners = () => {
    gameEvents.on('day-elapsed', ({ daysPassed }) => {
      if (daysPassed <= 0) return
      advanceCompetitors(daysPassed)
    })

    gameEvents.on('mission-success', ({ missionId }) => {
      handlePlayerMissionSuccess(missionId)
    })
  }

  const advanceCompetitors = (daysPassed: number) => {
    const mainMissions = missionStore.missions.filter((m) => m.category === 'principale')

    competitors.value.forEach((comp) => {
      // Find the first main mission not completed by this competitor and not successfully completed by player yet
      // OR find missions player is currently working on.
      // Actually, let's just find the next "uncompleted" mission for the competitor.
      const nextMission = mainMissions.find((m) => !comp.completedMissionIds.includes(m.id))

      if (nextMission) {
        // Initialize progress if needed
        if (comp.progress[nextMission.id] === undefined) {
          comp.progress[nextMission.id] = 0
        }

        // Check if player already finished it
        const playerFinished = missionStore.successfulMissions.some(m => m.id === nextMission.id)

        // Advance progress
        // Base rate: 100% in ~15 to 60 days depending on mission difficulty (cost/successChance)
        // Simplified: 1% to 3% per day, scaled by speedMultiplier
        const baseDailyProgress = (Math.random() * 1.5 + 0.5) * comp.speedMultiplier
        const difficultyFactor = Math.max(0.2, 1 - (nextMission.id * 0.05)) // Later missions are slower
        
        comp.progress[nextMission.id] += baseDailyProgress * difficultyFactor * daysPassed

        if (comp.progress[nextMission.id] >= 100) {
          comp.progress[nextMission.id] = 100
          comp.completedMissionIds.push(nextMission.id)
          
          // Check if competitor beat the player
          if (!playerFinished) {
            applyPenalty(comp, nextMission.id)
          }
        }
      }
    })
  }

  const applyPenalty = (competitor: Competitor, missionId: number) => {
    const mission = missionStore.missions.find(m => m.id === missionId)
    if (!mission) return

    const penaltyAmount = 15
    const factionToPenalize = competitor.faction === 'Privé' ? 'USA' : competitor.faction

    // Reduce player reputation with this faction
    if (contractStore.factionsReputation[factionToPenalize as keyof typeof contractStore.factionsReputation] !== undefined) {
       contractStore.factionsReputation[factionToPenalize as keyof typeof contractStore.factionsReputation] -= penaltyAmount
       // Ensure clamp
       contractStore.factionsReputation[factionToPenalize as keyof typeof contractStore.factionsReputation] = 
          Math.max(0, contractStore.factionsReputation[factionToPenalize as keyof typeof contractStore.factionsReputation])
    }

    gameEvents.emit('competitor-milestone-reached', {
      competitorName: competitor.name,
      missionName: mission.name,
      penalty: penaltyAmount,
      faction: factionToPenalize
    })

    missionStore.log(`[COURSE] ${competitor.name} a atteint le jalon "${mission.name}" avant vous ! -${penaltyAmount} Réputation (${factionToPenalize}).`)
  }

  const handlePlayerMissionSuccess = (missionId: number) => {
    // If player finishes, competitors might still keep their progress for history, 
    // but they can't trigger penalty for this mission anymore.
    // We already check !playerFinished in applyPenalty.
  }

  const currentRaceStatus = computed(() => {
    const mainMissions = missionStore.missions.filter((m) => m.category === 'principale')
    const currentMission = mainMissions.find(m => m.status === 'Disponible' || m.status === 'En attente')
    if (!currentMission) return null

    return {
      mission: currentMission,
      competitors: competitors.value.map(c => ({
        name: c.name,
        color: c.color,
        progress: c.progress[currentMission.id] || 0,
        isFinished: c.completedMissionIds.includes(currentMission.id)
      }))
    }
  })

  return {
    competitors,
    setupCompetitorListeners,
    currentRaceStatus
  }
}, {

})
