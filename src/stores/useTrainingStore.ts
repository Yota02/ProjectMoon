import { defineStore } from 'pinia'
import { useResourceStore } from './useResourceStore'
import { gameEvents } from '@/engine/EventBus'

export type TrainingType = 'pilote' | 'ingenieur_vol' | 'medic' | 'specialiste'
export type AstronautExperience = 'Junior' | 'Confirme' | 'Veteran'
export const MARKET_REFRESH_COST = 120

interface TraineeProfile {
  label: string
  baseCost: number
  description: string
}

export interface AstronautSkills {
  pilotage: number
  ingenierie: number
  medecine: number
  science: number
}

export interface AstronautProfile {
  id: number
  name: string
  nationality: string
  flag: string
  experience: AstronautExperience
  type: TrainingType
  cost: number
  level: number
  xp: number
  xpToNextLevel: number
  status: 'disponible' | 'entrainement' | 'mission'
  skills: AstronautSkills
}

export interface TrainingSession {
  id: string
  astronautId: number
  programId: string
  remainingDays: number
  totalDays: number
  xpReward: number
}

export interface TrainingProgram {
  id: string
  label: string
  description: string
  duration: number
  cost: { argent: number; carburant: number; science?: number }
  xpReward: number
  minLevel: number
  targetSkill?: keyof AstronautSkills
  skillReward?: number
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

  const minSkill = experience === 'Junior' ? 2 : experience === 'Confirme' ? 8 : 15
  const maxSkill = experience === 'Junior' ? 5 : experience === 'Confirme' ? 12 : 25

  const generateSkill = (isPrimary: boolean) => {
    const min = isPrimary ? minSkill + 10 : minSkill
    const max = isPrimary ? maxSkill + 15 : maxSkill
    return Math.floor(Math.random() * (max - min + 1) + min)
  }

  const skills: AstronautSkills = {
    pilotage: generateSkill(type === 'pilote'),
    ingenierie: generateSkill(type === 'ingenieur_vol'),
    medecine: generateSkill(type === 'medic'),
    science: generateSkill(type === 'specialiste'),
  }

  return {
    id,
    type,
    name: `${pickRandom(firstNames)} ${pickRandom(lastNames)}`,
    nationality: nationality.label,
    flag: nationality.flag,
    experience,
    cost,
    level: experience === 'Junior' ? 1 : experience === 'Confirme' ? 5 : 10,
    xp: 0,
    xpToNextLevel: (experience === 'Junior' ? 1 : experience === 'Confirme' ? 5 : 10) * 100,
    status: 'disponible',
    skills,
  }
}

export const TRAINING_PROGRAMS: TrainingProgram[] = [
  {
    id: 'basic_survival',
    label: 'Survie de Base',
    description: 'Entraînement intensif aux protocoles de sécurité standard.',
    duration: 2,
    cost: { argent: 80, carburant: 0 },
    xpReward: 50,
    minLevel: 1,
  },
  {
    id: 'flight_sim',
    label: 'Simulateur de Vol',
    description: 'Entraînement aux manœuvres orbitales et amarrages.',
    duration: 3,
    cost: { argent: 120, carburant: 10 },
    xpReward: 80,
    minLevel: 1,
    targetSkill: 'pilotage',
    skillReward: 2,
  },
  {
    id: 'engineering_cert',
    label: 'Maintenance Systèmes',
    description: 'Apprentissage des systèmes de survie et propulsion.',
    duration: 3,
    cost: { argent: 130, carburant: 5 },
    xpReward: 80,
    minLevel: 1,
    targetSkill: 'ingenierie',
    skillReward: 2,
  },
  {
    id: 'medical_crash_course',
    label: 'Premiers Soins Spatiaux',
    description: 'Protocoles médicaux en environnement de microgravité.',
    duration: 3,
    cost: { argent: 100, carburant: 0 },
    xpReward: 80,
    minLevel: 1,
    targetSkill: 'medecine',
    skillReward: 2,
  },
  {
    id: 'science_lab_training',
    label: 'Analyse en Laboratoire',
    description: "Protocoles d'expérimentation scientifique en orbite.",
    duration: 3,
    cost: { argent: 110, carburant: 0, science: 20 },
    xpReward: 80,
    minLevel: 1,
    targetSkill: 'science',
    skillReward: 2,
  },
  {
    id: 'advanced_eva',
    label: 'Sortie EVA Avancée',
    description: 'Perfectionnement des manœuvres en apesanteur.',
    duration: 4,
    cost: { argent: 150, carburant: 15 },
    xpReward: 120,
    minLevel: 3,
    targetSkill: 'pilotage',
    skillReward: 3,
  },
  {
    id: 'master_engineering',
    label: 'Ingénierie de Haute Précision',
    description: 'Réparation de composants nano-tech et structures de base.',
    duration: 5,
    cost: { argent: 250, carburant: 10, science: 30 },
    xpReward: 200,
    minLevel: 5,
    targetSkill: 'ingenierie',
    skillReward: 5,
  },
  {
    id: 'command_training',
    label: 'Commandement Orbital',
    description: "Gestion d'équipage et psychologie de mission long-terme.",
    duration: 7,
    cost: { argent: 300, carburant: 20, science: 50 },
    xpReward: 300,
    minLevel: 7,
  },
]

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
    astronauts: isDebugMode
      ? [
          createAstronautCandidate('pilote', 999),
          createAstronautCandidate('ingenieur_vol', 1000),
          createAstronautCandidate('medic', 1001),
          createAstronautCandidate('specialiste', 1002),
        ]
      : ([] as AstronautProfile[]),
    market: initialMarket.market,
    nextAstronautId: initialMarket.nextId,
    activeSessions: 0, // Keep for backward compatibility if needed, but we use activeTrainingSessions now
    activeTrainingSessions: [] as TrainingSession[],
    lastMarketRefreshDay: 0,
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
    setupListeners() {
      gameEvents.on('day-elapsed', ({ daysPassed, elapsedDays }) => {
        this.updateTrainingSessions(daysPassed)
        this.checkMarketRefresh(elapsedDays)
      })
    },

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

    enrollInTraining(astronautId: number, programId: string) {
      const resourceStore = useResourceStore()
      const astronaut = this.astronauts.find((a) => a.id === astronautId)
      const program = TRAINING_PROGRAMS.find((p) => p.id === programId)

      if (!astronaut || !program) {
        this.log('[ERREUR] Astronaute ou programme introuvable.')
        return false
      }

      if (astronaut.status !== 'disponible') {
        this.log(`[ERREUR] ${astronaut.name} n'est pas disponible pour l'entrainement.`)
        return false
      }

      if (astronaut.level < program.minLevel) {
        this.log(
          `[ERREUR] Niveau insuffisant (${astronaut.level}/${program.minLevel}) pour ${program.label}.`,
        )
        return false
      }

      // Check costs
      if (
        resourceStore.argent < program.cost.argent ||
        resourceStore.carburant < program.cost.carburant
      ) {
        this.log('[ERREUR] Ressources insuffisantes pour la formation.')
        return false
      }
      if (program.cost.science && resourceStore.science < program.cost.science) {
        this.log('[ERREUR] Science insuffisante pour la formation.')
        return false
      }

      // Pay
      resourceStore.addArgent(-program.cost.argent)
      resourceStore.addCarburant(-program.cost.carburant)
      if (program.cost.science) resourceStore.addScience(-program.cost.science)

      // Start session
      astronaut.status = 'entrainement'
      this.activeTrainingSessions.push({
        id: Math.random().toString(36).substr(2, 9),
        astronautId,
        programId: program.id,
        remainingDays: program.duration,
        totalDays: program.duration,
        xpReward: program.xpReward,
      })

      this.log(`[FORMATION] ${astronaut.name} commence le programme : ${program.label}.`)
      return true
    },

    updateTrainingSessions(daysPassed: number) {
      if (daysPassed <= 0) return

      const completedSessionIds: string[] = []

      this.activeTrainingSessions.forEach((session) => {
        session.remainingDays -= daysPassed
        if (session.remainingDays <= 0) {
          completedSessionIds.push(session.id)
          this.completeTraining(session)
        }
      })

      this.activeTrainingSessions = this.activeTrainingSessions.filter(
        (s) => !completedSessionIds.includes(s.id),
      )
    },

    completeTraining(session: TrainingSession) {
      const astronaut = this.astronauts.find((a) => a.id === session.astronautId)
      const program = TRAINING_PROGRAMS.find((p) => p.id === session.programId)

      if (astronaut && program) {
        astronaut.status = 'disponible'
        this.addXP(astronaut, session.xpReward)

        let skillMsg = ''
        if (program.targetSkill && program.skillReward) {
          astronaut.skills[program.targetSkill] += program.skillReward
          skillMsg = ` (+${program.skillReward} en ${this.getSkillLabel(program.targetSkill)})`
        }

        this.log(
          `[FORMATION] ${astronaut.name} a termine avec succes : ${program.label} ! (+${session.xpReward} XP)${skillMsg}`,
        )
      }
    },

    getSkillLabel(skill: keyof AstronautSkills) {
      const labels: Record<keyof AstronautSkills, string> = {
        pilotage: 'Pilotage',
        ingenierie: 'Ingénierie',
        medecine: 'Médecine',
        science: 'Science',
      }
      return labels[skill]
    },

    addXP(astronaut: AstronautProfile, amount: number) {
      astronaut.xp += amount
      while (astronaut.xp >= astronaut.xpToNextLevel) {
        astronaut.xp -= astronaut.xpToNextLevel
        this.levelUp(astronaut)
      }
    },

    levelUp(astronaut: AstronautProfile) {
      astronaut.level += 1
      astronaut.xpToNextLevel = astronaut.level * 100

      // Update experience label
      if (astronaut.level >= 10) astronaut.experience = 'Veteran'
      else if (astronaut.level >= 5) astronaut.experience = 'Confirme'

      this.log(`[NIVEAU] ${astronaut.name} passe au niveau ${astronaut.level} !`)
    },

    checkMarketRefresh(_currentDay: number) {
      // Automatic refresh disabled - only manual refresh available
    },

    startTrainingProgram() {
      const resourceStore = useResourceStore()

      const availableAstronaut = this.astronauts.find((a) => a.status === 'disponible')
      if (!availableAstronaut) {
        this.log('[ERREUR] Aucun astronaute disponible pour la formation.')
        return false
      }

      const affordableProgram = TRAINING_PROGRAMS.find((p) => {
        const hasLevel = availableAstronaut.level >= p.minLevel
        const canAffordArgent = resourceStore.argent >= p.cost.argent
        const canAffordCarburant = resourceStore.carburant >= p.cost.carburant
        const canAffordScience = p.cost.science ? resourceStore.science >= p.cost.science : true
        return hasLevel && canAffordArgent && canAffordCarburant && canAffordScience
      })

      if (!affordableProgram) {
        this.log('[ERREUR] Aucun programme de formation abordable.')
        return false
      }

      return this.enrollInTraining(availableAstronaut.id, affordableProgram.id)
    },

    log(message: string) {
      this.logs.unshift({ temps: new Date().toLocaleTimeString(), message })
      if (this.logs.length > 10) this.logs.pop()
    },
  },
  persist: true,
})
