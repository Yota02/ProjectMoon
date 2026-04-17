import { defineStore } from 'pinia'
import { useResourceStore } from './useResourceStore'
import { useGameStore } from './useGameStore'
import { useLogStore } from './useLogStore'
import { gameEvents } from '@/engine/EventBus'

export type Faction = 'USA' | 'Europe' | 'Chine' | 'Asie_Est' | 'Privé' | 'Indépendant'

export interface Contract {
  id: string
  title: string
  description: string
  type: 'État' | 'Privé'
  reward: number
  monthlyReward: number
  danger: 'low' | 'medium' | 'high'
  status: 'available' | 'active' | 'completed'
  requirements: {
    science?: number
    researchId?: string
    minArgent?: number
  }
}

export interface Subsidy {
  id: string
  agency: string
  faction: Faction
  amount: number
  description: string
  status: 'locked' | 'available' | 'signed'
  requirement: string
  eventRequired?: string
}

export const useContractStore = defineStore('contract', {
  state: () => ({
    factionsReputation: {
      USA: 50,
      Europe: 60,
      Chine: 40,
      Asie_Est: 50, // Japon / Corée
    },
    activeEvents: [] as string[],
    subsidies: [
      {
        id: 'sub-esa',
        agency: 'ESA (Europe)',
        faction: 'Europe',
        amount: 20,
        description: 'Soutien au développement technologique européen.',
        status: 'available',
        requirement: 'Initial',
      },
      {
        id: 'sub-cnes',
        agency: 'CNES (France)',
        faction: 'Europe',
        amount: 15,
        description: 'Financement pour la propulsion verte.',
        status: 'locked',
        requirement: 'Science > 300',
      },
      {
        id: 'sub-nasa',
        agency: 'NASA (USA)',
        faction: 'USA',
        amount: 50,
        description: 'Partenariat stratégique exploration Artemis.',
        status: 'locked',
        requirement: 'Science > 1500',
      },
      {
        id: 'sub-spaceforce',
        agency: 'US Space Force',
        faction: 'USA',
        amount: 75,
        description: 'Contrats de défense et surveillance orbitale.',
        status: 'locked',
        requirement: 'Trésorerie > 2.0 Md €',
      },
      {
        id: 'sub-cnsa',
        agency: 'CNSA (Chine)',
        faction: 'Chine',
        amount: 40,
        description: 'Programme de station spatiale Tiangong.',
        status: 'locked',
        requirement: 'Science > 1000',
      },
      {
        id: 'sub-casc',
        agency: 'CASC (Chine)',
        faction: 'Chine',
        amount: 55,
        description: 'Développement de lanceurs Longue Marche.',
        status: 'locked',
        requirement: "3 Contrats d'État complétés",
      },
      {
        id: 'sub-jaxa',
        agency: 'JAXA (Japon)',
        faction: 'Asie_Est',
        amount: 30,
        description: 'Partenariat sur la robotique lunaire.',
        status: 'locked',
        requirement: 'Science > 800',
      },
      {
        id: 'sub-kari',
        agency: 'KARI (Corée du Sud)',
        faction: 'Asie_Est',
        amount: 25,
        description: 'Soutien au programme de sondes KPLO.',
        status: 'locked',
        requirement: 'Recherche: Micro-Lanceurs',
      },
      // Event-based
      {
        id: 'sub-race-usa',
        agency: 'Bonus Course (USA)',
        faction: 'USA',
        amount: 120,
        description: "Fonds d'urgence pour la suprématie technologique.",
        status: 'locked',
        requirement: 'Événement: Course Spatiale',
        eventRequired: 'spaceRace',
      },
      {
        id: 'sub-race-china',
        agency: 'Bonus Course (Chine)',
        faction: 'Chine',
        amount: 125,
        description: "Plan quinquennal d'accélération spatiale.",
        status: 'locked',
        requirement: 'Événement: Course Spatiale',
        eventRequired: 'spaceRace',
      },
    ] as Subsidy[],
    contracts: [
      {
        id: 'gov-001',
        title: 'Surveillance Orbitale',
        description: "Surveillance de débris pour le compte de l'ONU.",
        type: 'État',
        reward: 500000,
        monthlyReward: 50,
        danger: 'low',
        status: 'available',
        requirements: { science: 100 },
      },
      {
        id: 'priv-001',
        title: 'StarLink Deployment',
        description: 'Déploiement de 24 satellites de communication.',
        type: 'Privé',
        reward: 3500000,
        monthlyReward: 15,
        danger: 'medium',
        status: 'available',
        requirements: { science: 500, researchId: 'l-micro' },
      },
    ] as Contract[],
  }),
  getters: {
    availableContracts: (state) => state.contracts.filter((c) => c.status === 'available'),
    activeContracts: (state) => state.contracts.filter((c) => c.status === 'active'),
    signedSubsidies: (state) => state.subsidies.filter((s) => s.status === 'signed'),
    totalMonthlyRevenue: (state) => {
      const subsidiesRevenue = state.subsidies
        .filter((s) => s.status === 'signed')
        .reduce((sum, s) => sum + s.amount, 0)
      const contractsRevenue = state.contracts
        .filter((c) => c.status === 'active')
        .reduce((sum, c) => sum + c.monthlyReward, 0)
      return subsidiesRevenue + contractsRevenue
    },
  },
  actions: {
    setupListeners() {
      gameEvents.on('month-elapsed', () => {
        const resourceStore = useResourceStore()
        const monthlyRevenue = this.totalMonthlyRevenue
        if (monthlyRevenue > 0) {
          resourceStore.addArgent(monthlyRevenue * 1000000)
        }
      })

      gameEvents.on('year-elapsed', () => {
        this.processAnnualSubsidies()
      })

      gameEvents.on('space-race-started', () => {
        this.triggerEvent('spaceRace')
      })
    },

    processAnnualSubsidies() {
      const resourceStore = useResourceStore()
      const gameStore = useGameStore()
      
      // Moyenne de la réputation des factions
      const factions = Object.keys(this.factionsReputation)
      const avgRep = factions.reduce((sum, f) => sum + this.factionsReputation[f as keyof typeof this.factionsReputation], 0) / factions.length
      
      // Subvention annuelle basée sur la réputation moyenne et la hype
      // Base: 1M par point de réputation moyenne + bonus hype
      const annualAmount = (avgRep * 1000000) * (1 + gameStore.hype / 100)
      
      if (annualAmount > 0) {
        resourceStore.addArgent(annualAmount)
        const logStore = useLogStore()
        logStore.addLog(`[FINANCE] Subvention annuelle reçue : +${Math.round(annualAmount).toLocaleString()} € (Basée sur une réputation moyenne de ${Math.round(avgRep)}% et une hype de ${Math.round(gameStore.hype)}%)`, 'success')
      }
    },

    lobbyFaction(faction: Faction, scienceCost: number) {
      const resourceStore = useResourceStore()
      if (resourceStore.science >= scienceCost) {
        resourceStore.addScience(-scienceCost)
        // 1 point de réputation pour 10 science (ajustable)
        const repGain = Math.floor(scienceCost / 10)
        this.factionsReputation[faction as keyof typeof this.factionsReputation] += repGain
        this.factionsReputation[faction as keyof typeof this.factionsReputation] = Math.min(100, this.factionsReputation[faction as keyof typeof this.factionsReputation])
        
        const logStore = useLogStore()
        logStore.addLog(`[LOBBYING] Influence exercée sur ${faction} : +${repGain} Réputation.`, 'info')
        return true
      }
      return false
    },

    triggerEvent(eventId: string) {
      if (!this.activeEvents.includes(eventId)) {
        this.activeEvents.push(eventId)
        this.subsidies.forEach((s) => {
          if (s.eventRequired === eventId) s.status = 'available'
        })
      }
    },

    signSubsidy(subsidyId: string) {
      const resourceStore = useResourceStore()
      const gameStore = useGameStore()
      
      const subsidy = this.subsidies.find((s) => s.id === subsidyId)
      if (!subsidy || subsidy.status !== 'available') return

      resourceStore.addArgent(subsidy.amount * 1000000)

      gameEvents.emit('contract-signed', {
        contractId: subsidy.id,
        contractName: subsidy.agency,
        date: gameStore.formattedDate,
      })

      // Reputation Logic
      const faction = subsidy.faction
      this.factionsReputation[faction as keyof typeof this.factionsReputation] += 15

      if (faction === 'USA') {
        this.factionsReputation.Chine -= 35
        this.factionsReputation.Europe += 5
        this.factionsReputation.Asie_Est += 10
      } else if (faction === 'Chine') {
        this.factionsReputation.USA -= 40
        this.factionsReputation.Asie_Est -= 20
        this.factionsReputation.Europe -= 5
      } else if (faction === 'Europe') {
        this.factionsReputation.USA += 5
        // China is neutral-ish to Europe in this game context
      } else if (faction === 'Asie_Est') {
        this.factionsReputation.Chine -= 15
        this.factionsReputation.USA += 10
      }

      // Clamp reputation between 0 and 100
      Object.keys(this.factionsReputation).forEach((key) => {
        const k = key as keyof typeof this.factionsReputation
        this.factionsReputation[k] = Math.max(0, Math.min(100, this.factionsReputation[k]))
      })

      subsidy.status = 'signed'
      this.checkGeopolitics()
      this.updateProduction()
    },

    checkGeopolitics() {
      Object.keys(this.factionsReputation).forEach((faction) => {
        const rep = this.factionsReputation[faction as keyof typeof this.factionsReputation]
        if (rep < 15) {
          this.cancelFactionSubsidies(faction as Faction)
        }
      })
    },

    cancelFactionSubsidies(faction: Faction) {
      this.subsidies.forEach((s) => {
        if (s.faction === faction && s.status === 'signed') {
          s.status = 'locked'
        }
      })
      this.updateProduction()
    },

    updateProduction() {
      // Production is now handled in gameStore.tick() - monthly payments
      // Only used to track active contracts/subsidies for display purposes
    },

    acceptContract(contractId: string) {
      const resourceStore = useResourceStore()
      const gameStore = useGameStore()
      const contract = this.contracts.find((c) => c.id === contractId)

      if (contract && contract.status === 'available') {
        contract.status = 'active'
        resourceStore.addArgent(contract.reward)
        
        gameEvents.emit('contract-signed', {
          contractId: contract.id,
          contractName: contract.title,
          date: gameStore.formattedDate,
        })

        this.updateProduction()
      }
    },
  },

})
