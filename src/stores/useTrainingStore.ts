import { defineStore } from 'pinia'
import { useResourceStore } from './useResourceStore'

export type TrainingType = 'pilote' | 'ingenieur_vol' | 'medic' | 'specialiste'
export type AstronautExperience = 'Junior' | 'Confirme' | 'Veteran'
export const MARKET_REFRESH_COST = 120

interface TraineeProfile {
  label: string
  baseCost: number
  description: string
}

export interface AstronautProfile {
  id: number
  name: string
  nationality: string
  flag: string
  experience: AstronautExperience
  type: TrainingType
  cost: number
}

export interface TrainingLog {
  temps: string
  message: string
}

const firstNames = [
  'Lina',
  'Nora',
  'Amir',
  'Sofia',
  'Hugo',
  'Mila',
  'Ravi',
  'Ines',
  'Leo',
  'Yara',
  'Kenji',
  'Amina',
  'Elio',
  'Nadia',
]

const lastNames = [
  'Dubois',
  'Garcia',
  'Tanaka',
  'Silva',
  'Haddad',
  'Novak',
  'Rossi',
  'Nguyen',
  'Ibrahim',
  'Moreau',
  'Kim',
  'Costa',
]

const nationalities = [
  { label: 'Francaise', flag: '🇫🇷' },
  { label: 'Canadienne', flag: '🇨🇦' },
  { label: 'Japonaise', flag: '🇯🇵' },
  { label: 'Bresilienne', flag: '🇧🇷' },
  { label: 'Marocaine', flag: '🇲🇦' },
  { label: 'Italienne', flag: '🇮🇹' },
  { label: 'Sud-Coreenne', flag: '🇰🇷' },
  { label: 'Indienne', flag: '🇮🇳' },
] as const

const profileByType: Record<TrainingType, TraineeProfile> = {
  pilote: {
    label: 'Pilote',
    baseCost: 150,
    description: 'Expert de la navigation spatiale et des maneuvers orbitales.',
  },
  ingenieur_vol: {
    label: 'Ingenieur de Vol',
    baseCost: 180,
    description: 'Gestion des systemes et maintenance en mission.',
  },
  medic: {
    label: 'Medecin Spatial',
    baseCost: 200,
    description: 'Soins medicaux et gestion de la sante equipage.',
  },
  specialiste: {
    label: 'Specialiste',
    baseCost: 250,
    description: 'Competences polyvalentes pour missions speciales.',
  },
}

const trainingTypes: TrainingType[] = ['pilote', 'ingenieur_vol', 'medic', 'specialiste']

const experienceMultiplier: Record<AstronautExperience, number> = {
  Junior: 1,
  Confirme: 1.35,
  Veteran: 1.8,
}

function pickRandom<T>(items: readonly T[]): T {
  const picked = items[Math.floor(Math.random() * items.length)]
  if (picked === undefined) {
    throw new Error('Impossible de choisir un element aleatoire.')
  }
  return picked
}

function randomExperience(): AstronautExperience {
  const roll = Math.random()
  if (roll < 0.5) return 'Junior'
  if (roll < 0.85) return 'Confirme'
  return 'Veteran'
}

function createAstronautCandidate(type: TrainingType, id: number): AstronautProfile {
  const experience = randomExperience()
  const baseCost = profileByType[type].baseCost
  const randomVariance = 0.9 + Math.random() * 0.2
  const cost = Math.round(baseCost * experienceMultiplier[experience] * randomVariance)
  const nationality = pickRandom(nationalities)

  return {
    id,
    type,
    name: `${pickRandom(firstNames)} ${pickRandom(lastNames)}`,
    nationality: nationality.label,
    flag: nationality.flag,
    experience,
    cost,
  }
}

function createMarket(startId: number, count: number) {
  const market: AstronautProfile[] = []
  let nextId = startId

  for (let i = 0; i < count; i += 1) {
    market.push(createAstronautCandidate(pickRandom(trainingTypes), nextId))
    nextId += 1
  }

  return { market, nextId }
}

const initialMarket = createMarket(1, 8)

const isDebugMode = import.meta.env.VITE_DEBUG_MODE === 'test'

export const useTrainingStore = defineStore('training', {
  state: () => ({
    trainees: {
      pilote: {
        ...profileByType.pilote,
      },
      ingenieur_vol: {
        ...profileByType.ingenieur_vol,
      },
      medic: {
        ...profileByType.medic,
      },
      specialiste: {
        ...profileByType.specialiste,
      },
    } as Record<TrainingType, TraineeProfile>,
    astronauts: isDebugMode ? [
      createAstronautCandidate('pilote', 999),
      createAstronautCandidate('ingenieur_vol', 1000)
    ] : [] as AstronautProfile[],
    market: initialMarket.market,
    nextAstronautId: initialMarket.nextId,
    activeSessions: 0,
    logs: [] as TrainingLog[],
  }),
  getters: {
    totalTrainees: (state) => state.astronauts.length,
    countByType: (state) => (type: TrainingType) =>
      state.astronauts.filter((astronaut) => astronaut.type === type).length,
    hasPilote: (state) => state.astronauts.some((astronaut) => astronaut.type === 'pilote'),
    hasIngenieurVol: (state) =>
      state.astronauts.some((astronaut) => astronaut.type === 'ingenieur_vol'),
    hasMedic: (state) => state.astronauts.some((astronaut) => astronaut.type === 'medic'),
    hasSpecialiste: (state) =>
      state.astronauts.some((astronaut) => astronaut.type === 'specialiste'),
    trainingCost: (state) => (type: TrainingType) => {
      const match = state.market.find((candidate) => candidate.type === type)
      return match?.cost ?? profileByType[type].baseCost
    },
  },
  actions: {
    recruitFromMarket(astronautId: number) {
      const resourceStore = useResourceStore()
      const candidateIndex = this.market.findIndex((candidate) => candidate.id === astronautId)
      if (candidateIndex < 0) {
        this.log('[ERREUR] Candidat introuvable sur le marche.')
        return false
      }

      const candidate = this.market[candidateIndex]
      if (!candidate) return false

      if (resourceStore.argent < candidate.cost) {
        this.log(`[ERREUR] Fonds insuffisants pour recruter ${candidate.name}.`)
        return false
      }

      resourceStore.addArgent(-candidate.cost)
      this.astronauts.push(candidate)

      this.log(
        `[MARCHE] ${candidate.flag} ${candidate.name} (${candidate.nationality}, ${candidate.experience}) recrute comme ${this.trainees[candidate.type].label}.`,
      )

      this.market.splice(candidateIndex, 1)
      this.market.push(createAstronautCandidate(pickRandom(trainingTypes), this.nextAstronautId))
      this.nextAstronautId += 1
      return true
    },

    refreshMarket() {
      const resourceStore = useResourceStore()
      const refreshCost = MARKET_REFRESH_COST

      if (resourceStore.argent < refreshCost) {
        this.log('[ERREUR] Fonds insuffisants pour rafraichir le marche.')
        return false
      }

      resourceStore.addArgent(-refreshCost)
      const refreshed = createMarket(this.nextAstronautId, 8)
      this.market = refreshed.market
      this.nextAstronautId = refreshed.nextId
      this.log('[MARCHE] Nouveaux profils disponibles sur le marche des astronautes.')
      return true
    },

    train(type: TrainingType) {
      const candidate = this.market.find((astronaut) => astronaut.type === type)
      if (!candidate) {
        this.log(`[ERREUR] Aucun profil ${this.trainees[type].label} disponible sur le marche.`)
        return false
      }
      return this.recruitFromMarket(candidate.id)
    },

    startTrainingProgram() {
      const resourceStore = useResourceStore()

      const cost = { argent: 100, carburant: 20 }
      if (resourceStore.argent < cost.argent || resourceStore.carburant < cost.carburant) {
        this.log('[ERREUR] Ressources insuffisantes pour le programme de formation.')
        return false
      }

      resourceStore.addArgent(-cost.argent)
      resourceStore.addCarburant(-cost.carburant)
      this.activeSessions += 1

      this.log(`[FORMATION] Programme d'entrainement lance.`)
      return true
    },

    log(message: string) {
      this.logs.unshift({ temps: new Date().toLocaleTimeString(), message })
      if (this.logs.length > 10) this.logs.pop()
    },
  },
})
