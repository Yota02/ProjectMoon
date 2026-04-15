import { defineStore } from 'pinia'
import { useResourceStore } from './useResourceStore'
import { useGameStore } from './useGameStore'
import { useBaseStore } from './useBaseStore'

const isDebugMode = import.meta.env.VITE_DEBUG_MODE === 'test'

export type ResearchStatus = 'locked' | 'available' | 'researching' | 'completed'

export interface ResearchNode {
  id: string
  name: string
  description: string
  category:
    | 'Lanceurs'
    | 'Bâtiments'
    | 'Moteur'
    | 'Informatique'
    | 'Humain'
    | 'Economique'
    | 'Colonisation'
  cost: number
  duration: number // en secondes (ticks)
  progress: number // 0 à 100
  status: ResearchStatus
  prerequisites: string[]
  tier: number
}

const TIER_YEARS: Record<number, number> = {
  0: 2014,
  1: 2015,
  2: 2020,
  3: 2023,
  4: 2030,
}

function createInitialResearches() {
  const researches: Record<string, ResearchNode> = {
    // LANCEURS
    'l-micro': {
      id: 'l-micro',
      name: 'Micro-Lanceurs',
      description: 'Capacité de lancer de petits satellites en orbite basse.',
      category: 'Lanceurs',
      cost: 20,
      duration: 10,
      progress: 0,
      status: isDebugMode ? 'completed' : 'available',
      prerequisites: [],
      tier: 0,
    },
    'l-booster': {
      id: 'l-booster',
      name: 'Boosters à Poudre',
      description: 'Augmente la poussée initiale pour des charges plus lourdes.',
      category: 'Lanceurs',
      cost: 45,
      duration: 20,
      progress: 0,
      status: isDebugMode ? 'completed' : 'locked',
      prerequisites: ['l-micro'],
      tier: 1,
    },
    'l-medium': {
      id: 'l-medium',
      name: 'Lanceurs Moyens',
      description: "Équilibre parfait entre coût et capacité d'emport.",
      category: 'Lanceurs',
      cost: 80,
      duration: 40,
      progress: 0,
      status: isDebugMode ? 'completed' : 'locked',
      prerequisites: ['l-micro'],
      tier: 1,
    },
    'l-heavy': {
      id: 'l-heavy',
      name: 'Lanceurs Lourds',
      description: "Permet d'envoyer des charges utiles massives au-delà de l'orbite terrestre.",
      category: 'Lanceurs',
      cost: 150,
      duration: 60,
      progress: 0,
      status: isDebugMode ? 'completed' : 'locked',
      prerequisites: ['l-medium', 'l-booster'],
      tier: 2,
    },
    'l-reusable': {
      id: 'l-reusable',
      name: 'Étages Réutilisables',
      description: 'Technologie derentrée atmosphérique contrôlée pour réduire les coûts.',
      category: 'Lanceurs',
      cost: 250,
      duration: 90,
      progress: 0,
      status: isDebugMode ? 'completed' : 'locked',
      prerequisites: ['l-heavy', 'i-ia'],
      tier: 3,
    },
    'l-super-heavy': {
      id: 'l-super-heavy',
      name: 'Lanceurs Super-Lourds',
      description: 'Vaisseaux capables de transporter des modules de colonisation entiers.',
      category: 'Lanceurs',
      cost: 400,
      duration: 120,
      progress: 0,
      status: isDebugMode ? 'completed' : 'locked',
      prerequisites: ['l-heavy', 'm-ionique'],
      tier: 3,
    },
    'l-starship': {
      id: 'l-starship',
      name: 'Vaisseau Interplanétaire',
      description: 'Le summum du transport spatial, entièrement réutilisable et habitable.',
      category: 'Lanceurs',
      cost: 1000,
      duration: 300,
      progress: 0,
      status: isDebugMode ? 'completed' : 'locked',
      prerequisites: ['l-super-heavy', 'l-reusable', 'h-survie'],
      tier: 4,
    },

    // BÂTIMENTS
    'b-labo': {
      id: 'b-labo',
      name: 'Laboratoire de R&D',
      description: 'Améliore la vitesse de génération des points de science.',
      category: 'Bâtiments',
      cost: 50,
      duration: 20,
      progress: 0,
      status: isDebugMode ? 'completed' : 'available',
      prerequisites: [],
      tier: 0,
    },
    'b-usine': {
      id: 'b-usine',
      name: "Usine d'Assemblage",
      description: 'Accélère la construction des lanceurs.',
      category: 'Bâtiments',
      cost: 100,
      duration: 40,
      progress: 0,
      status: isDebugMode ? 'completed' : 'locked',
      prerequisites: ['b-labo'],
      tier: 1,
    },
    'b-control': {
      id: 'b-control',
      name: 'Centre de Contrôle Avancé',
      description: 'Optimise la gestion de plusieurs missions simultanées.',
      category: 'Bâtiments',
      cost: 150,
      duration: 50,
      progress: 0,
      status: isDebugMode ? 'completed' : 'locked',
      prerequisites: ['b-labo', 'i-guidage'],
      tier: 1,
    },
    'b-hangar': {
      id: 'b-hangar',
      name: 'Hangar de Stockage',
      description: 'Permet de stocker plusieurs lanceurs prêts au tir.',
      category: 'Bâtiments',
      cost: 180,
      duration: 50,
      progress: 0,
      status: isDebugMode ? 'completed' : 'locked',
      prerequisites: ['b-usine'],
      tier: 2,
    },
    'b-complex': {
      id: 'b-complex',
      name: 'Complexe de Recherche',
      description: 'Installation massive pour les percées technologiques majeures.',
      category: 'Bâtiments',
      cost: 500,
      duration: 150,
      progress: 0,
      status: isDebugMode ? 'completed' : 'locked',
      prerequisites: ['b-labo', 'b-control'],
      tier: 2,
    },
    'b-drydock': {
      id: 'b-drydock',
      name: 'Cale Sèche Orbitale',
      description: "Permet l'assemblage de vaisseaux directement dans l'espace.",
      category: 'Bâtiments',
      cost: 1200,
      duration: 400,
      progress: 0,
      status: isDebugMode ? 'completed' : 'locked',
      prerequisites: ['b-hangar', 'l-super-heavy'],
      tier: 4,
    },

    // MOTEUR
    'm-chimique': {
      id: 'm-chimique',
      name: 'Propulsion Chimique Optimisée',
      description: 'Réduit la consommation de carburant de 15%.',
      category: 'Moteur',
      cost: 40,
      duration: 15,
      progress: 0,
      status: isDebugMode ? 'completed' : 'available',
      prerequisites: [],
      tier: 0,
    },
    'm-solid': {
      id: 'm-solid',
      name: 'Carburant Solide Haute Densité',
      description: 'Améliore la puissance des boosters.',
      category: 'Moteur',
      cost: 60,
      duration: 25,
      progress: 0,
      status: isDebugMode ? 'completed' : 'locked',
      prerequisites: ['m-chimique'],
      tier: 1,
    },
    'm-ionique': {
      id: 'm-ionique',
      name: 'Moteur Ionique',
      description: 'Indispensable pour les sondes longue distance.',
      category: 'Moteur',
      cost: 200,
      duration: 120,
      progress: 0,
      status: isDebugMode ? 'completed' : 'locked',
      prerequisites: ['m-chimique'],
      tier: 1,
    },
    'm-plasma': {
      id: 'm-plasma',
      name: 'Propulsion Plasma (VASIMR)',
      description: 'Accélération constante pour les voyages interplanétaires rapides.',
      category: 'Moteur',
      cost: 450,
      duration: 180,
      progress: 0,
      status: isDebugMode ? 'completed' : 'locked',
      prerequisites: ['m-ionique'],
      tier: 2,
    },
    'm-nucleaire': {
      id: 'm-nucleaire',
      name: 'Propulsion Nucléaire Thermique',
      description: "Le summum de l'efficacité pour les voyages interplanétaires.",
      category: 'Moteur',
      cost: 600,
      duration: 240,
      progress: 0,
      status: isDebugMode ? 'completed' : 'locked',
      prerequisites: ['m-plasma', 'i-ia'],
      tier: 3,
    },
    'm-antimatter': {
      id: 'm-antimatter',
      name: 'Moteur à Antimatière',
      description: "Technologie théorique permettant d'atteindre des vitesses relativistes.",
      category: 'Moteur',
      cost: 5000,
      duration: 1000,
      progress: 0,
      status: isDebugMode ? 'completed' : 'locked',
      prerequisites: ['m-nucleaire', 'i-quantum'],
      tier: 4,
    },

    // INFORMATIQUE
    'i-guidage': {
      id: 'i-guidage',
      name: 'Système de Guidage Mk1',
      description: 'Augmente la fiabilité des lancements de 10%.',
      category: 'Informatique',
      cost: 30,
      duration: 10,
      progress: 0,
      status: isDebugMode ? 'completed' : 'available',
      prerequisites: [],
      tier: 0,
    },
    'i-sat': {
      id: 'i-sat',
      name: 'Réseau de Satellites Relais',
      description: 'Améliore la communication avec les sondes lointaines.',
      category: 'Informatique',
      cost: 70,
      duration: 30,
      progress: 0,
      status: isDebugMode ? 'completed' : 'locked',
      prerequisites: ['i-guidage'],
      tier: 1,
    },
    'i-ia': {
      id: 'i-ia',
      name: 'IA de Pilotage',
      description: 'Optimisation automatique des trajectoires.',
      category: 'Informatique',
      cost: 300,
      duration: 180,
      progress: 0,
      status: isDebugMode ? 'completed' : 'locked',
      prerequisites: ['i-guidage'],
      tier: 1,
    },
    'i-automation': {
      id: 'i-automation',
      name: 'Automatisation Totale',
      description: 'Réduit drastiquement le personnel nécessaire au sol.',
      category: 'Informatique',
      cost: 500,
      duration: 150,
      progress: 0,
      status: isDebugMode ? 'completed' : 'locked',
      prerequisites: ['i-ia'],
      tier: 2,
    },
    'i-quantum': {
      id: 'i-quantum',
      name: 'Calcul Quantique',
      description: 'Précision de navigation quasi-parfaite.',
      category: 'Informatique',
      cost: 800,
      duration: 300,
      progress: 0,
      status: isDebugMode ? 'completed' : 'locked',
      prerequisites: ['i-ia'],
      tier: 2,
    },
    'i-singularity': {
      id: 'i-singularity',
      name: 'IA de Niveau Singularité',
      description: "Gestion autonome complète de l'expansion galactique.",
      category: 'Informatique',
      cost: 3000,
      duration: 600,
      progress: 0,
      status: isDebugMode ? 'completed' : 'locked',
      prerequisites: ['i-quantum'],
      tier: 4,
    },

    // HUMAIN
    'h-entraînement': {
      id: 'h-entraînement',
      name: "Centre d'Entraînement Alpha",
      description: 'Permet de recruter des astronautes qualifiés.',
      category: 'Humain',
      cost: 60,
      duration: 30,
      progress: 0,
      status: isDebugMode ? 'completed' : 'available',
      prerequisites: [],
      tier: 0,
    },
    'h-psy': {
      id: 'h-psy',
      name: "Psychologie de l'Isolement",
      description: 'Améliore le moral des équipages lors des missions longues.',
      category: 'Humain',
      cost: 100,
      duration: 40,
      progress: 0,
      status: isDebugMode ? 'completed' : 'locked',
      prerequisites: ['h-entraînement'],
      tier: 1,
    },
    'h-survie': {
      id: 'h-survie',
      name: 'Support Vie Régénératif',
      description: 'Indispensable pour les missions habitées de longue durée.',
      category: 'Humain',
      cost: 250,
      duration: 150,
      progress: 0,
      status: isDebugMode ? 'completed' : 'locked',
      prerequisites: ['h-entraînement'],
      tier: 1,
    },
    'h-medecine': {
      id: 'h-medecine',
      name: "Médecine de l'Espace",
      description: 'Réduit les risques de santé liés à la micro-gravité.',
      category: 'Humain',
      cost: 350,
      duration: 100,
      progress: 0,
      status: isDebugMode ? 'completed' : 'locked',
      prerequisites: ['h-survie', 'h-psy'],
      tier: 2,
    },
    'h-cryo': {
      id: 'h-cryo',
      name: 'Cryostase Avancée',
      description: 'Réduit les besoins vitaux lors des longs transits.',
      category: 'Humain',
      cost: 500,
      duration: 200,
      progress: 0,
      status: isDebugMode ? 'completed' : 'locked',
      prerequisites: ['h-survie'],
      tier: 2,
    },
    'h-genetics': {
      id: 'h-genetics',
      name: 'Adaptation Génétique',
      description: "Modification biologique pour survivre sur d'autres planètes.",
      category: 'Humain',
      cost: 2000,
      duration: 500,
      progress: 0,
      status: isDebugMode ? 'completed' : 'locked',
      prerequisites: ['h-medecine', 'h-cryo'],
      tier: 4,
    },

    // ECONOMIQUE
    'e-marketing': {
      id: 'e-marketing',
      name: 'Campagne de Relations Publiques',
      description: 'Augmente la réputation et attire plus de contrats.',
      category: 'Economique',
      cost: 30,
      duration: 15,
      progress: 0,
      status: isDebugMode ? 'completed' : 'available',
      prerequisites: [],
      tier: 0,
    },
    'e-assurance': {
      id: 'e-assurance',
      name: 'Assurances Spatiales',
      description: "Remboursement partiel en cas d'échec de mission.",
      category: 'Economique',
      cost: 120,
      duration: 45,
      progress: 0,
      status: isDebugMode ? 'completed' : 'locked',
      prerequisites: ['e-marketing'],
      tier: 1,
    },
    'e-tourism': {
      id: 'e-tourism',
      name: 'Tourisme Orbital',
      description: 'Nouvelle source de revenus grâce aux civils fortunés.',
      category: 'Economique',
      cost: 280,
      duration: 80,
      progress: 0,
      status: isDebugMode ? 'completed' : 'locked',
      prerequisites: ['e-assurance', 'l-medium'],
      tier: 2,
    },
    'e-fondation': {
      id: 'e-fondation',
      name: 'Fondation Spatiale Internationale',
      description: "Subventions permanentes pour l'exploration.",
      category: 'Economique',
      cost: 450,
      duration: 100,
      progress: 0,
      status: isDebugMode ? 'completed' : 'locked',
      prerequisites: ['e-assurance'],
      tier: 2,
    },
    'e-asteroid': {
      id: 'e-asteroid',
      name: 'Exploitation des Astéroïdes',
      description: "Extraction de métaux précieux dans la ceinture d'astéroïdes.",
      category: 'Economique',
      cost: 1500,
      duration: 350,
      progress: 0,
      status: isDebugMode ? 'completed' : 'locked',
      prerequisites: ['e-fondation', 'm-ionique'],
      tier: 3,
    },
    'e-galactic-trade': {
      id: 'e-galactic-trade',
      name: 'Commerce Interplanétaire',
      description: "Établissement d'un réseau économique autosuffisant.",
      category: 'Economique',
      cost: 4000,
      duration: 800,
      progress: 0,
      status: isDebugMode ? 'completed' : 'locked',
      prerequisites: ['e-asteroid', 'c-dome'],
      tier: 4,
    },

    // COLONISATION
    'c-ferme': {
      id: 'c-ferme',
      name: 'Ferme Hydroponique',
      description: "Permet de produire de la nourriture dans l'espace.",
      category: 'Colonisation',
      cost: 80,
      duration: 40,
      progress: 0,
      status: isDebugMode ? 'completed' : 'available',
      prerequisites: [],
      tier: 0,
    },
    'c-outpost': {
      id: 'c-outpost',
      name: 'Avant-poste Lunaire',
      description: 'Première base permanente sur un autre corps céleste.',
      category: 'Colonisation',
      cost: 200,
      duration: 80,
      progress: 0,
      status: isDebugMode ? 'completed' : 'locked',
      prerequisites: ['c-ferme', 'l-medium'],
      tier: 1,
    },
    'c-mine': {
      id: 'c-mine',
      name: 'Extraction de Régolithe',
      description: 'Utilisation des ressources locales pour la construction.',
      category: 'Colonisation',
      cost: 150,
      duration: 60,
      progress: 0,
      status: isDebugMode ? 'completed' : 'locked',
      prerequisites: ['c-ferme'],
      tier: 1,
    },
    'c-dome': {
      id: 'c-dome',
      name: 'Dômes Habitables',
      description: 'Infrastructures pressurisées pour colonies permanentes.',
      category: 'Colonisation',
      cost: 400,
      duration: 180,
      progress: 0,
      status: isDebugMode ? 'completed' : 'locked',
      prerequisites: ['c-mine', 'c-outpost'],
      tier: 2,
    },
    'c-mars': {
      id: 'c-mars',
      name: 'Première Ville Martienne',
      description: "Établissement d'une présence humaine pérenne sur Mars.",
      category: 'Colonisation',
      cost: 1200,
      duration: 450,
      progress: 0,
      status: isDebugMode ? 'completed' : 'locked',
      prerequisites: ['c-dome', 'l-super-heavy'],
      tier: 3,
    },
    'c-station-base': {
      id: 'c-station-base',
      name: 'Infrastructure Station Orbitale',
      description: 'Permet de construire des stations spatiales modulaires.',
      category: 'Colonisation',
      cost: 150,
      duration: 60,
      progress: 0,
      status: isDebugMode ? 'completed' : 'locked',
      prerequisites: ['c-ferme'],
      tier: 1,
    },
    'c-station-habitat': {
      id: 'c-station-habitat',
      name: 'Habitation Longue Durée',
      description: "Modules d'habitation avancés pour les stations spatiales.",
      category: 'Colonisation',
      cost: 200,
      duration: 80,
      progress: 0,
      status: isDebugMode ? 'completed' : 'locked',
      prerequisites: ['c-station-base'],
      tier: 1,
    },
    'c-station-lab': {
      id: 'c-station-lab',
      name: 'Laboratoires Orbitaux',
      description: 'Recherche scientifique en microgravité.',
      category: 'Colonisation',
      cost: 250,
      duration: 100,
      progress: 0,
      status: isDebugMode ? 'completed' : 'locked',
      prerequisites: ['c-station-base', 'b-labo'],
      tier: 1,
    },
    'c-station-power': {
      id: 'c-station-power',
      name: 'Energie Solaire Spatiale',
      description: 'Panneaux solaires haute efficacité pour stations.',
      category: 'Colonisation',
      cost: 180,
      duration: 70,
      progress: 0,
      status: isDebugMode ? 'completed' : 'locked',
      prerequisites: ['c-station-base'],
      tier: 1,
    },
    'c-terraforming': {
      id: 'c-terraforming',
      name: 'Terraformation Alpha',
      description: "Modification de l'atmosphère planétaire pour la vie humaine.",
      category: 'Colonisation',
      cost: 10000,
      duration: 2000,
      progress: 0,
      status: isDebugMode ? 'completed' : 'locked',
      prerequisites: ['c-mars', 'm-nucleaire', 'h-genetics'],
      tier: 4,
    },
  }
  return researches
}

export const useResearchStore = defineStore('research', {
  state: () => ({
    researches: createInitialResearches(),
    activeResearchId: null as string | null,
  }),
  getters: {
    activeResearch: (state) =>
      state.activeResearchId ? state.researches[state.activeResearchId] : null,
    completedResearchIds: (state) =>
      Object.values(state.researches)
        .filter((r) => r.status === 'completed')
        .map((r) => r.id),
    getByCategory: (state) => (category: string) => {
      return Object.values(state.researches).filter((r) => r.category === category)
    },
    getTierYear: () => (tier: number) => {
      return TIER_YEARS[tier] || 2030
    },
    getDifficultyMultiplier: (state) => (id: string) => {
      const research = state.researches[id]
      if (!research) return 1

      const gameStore = useGameStore()
      const currentYear = gameStore.currentYear
      const forecastYear = TIER_YEARS[research.tier] || 2030

      const diff = forecastYear - currentYear

      if (diff > 0) {
        // En avance sur son temps: plus cher et plus long (20% par an)
        return 1 + diff * 0.2
      } else if (diff < 0) {
        // En retard: plus facile (10% de réduction par an, min 50%)
        return Math.max(0.5, 1 / (1 + Math.abs(diff) * 0.1))
      }

      return 1
    },
  },
  actions: {
    startResearch(id: string) {
      const resourceStore = useResourceStore()
      const research = this.researches[id]

      if (!research || research.status !== 'available' || this.activeResearchId) return

      const multiplier = this.getDifficultyMultiplier(id)
      const adjustedCost = Math.round(research.cost * multiplier)

      if (resourceStore.science >= adjustedCost) {
        resourceStore.addScience(-adjustedCost)
        research.status = 'researching'
        this.activeResearchId = id
      }
    },

    tick(deltaTime: number) {
      if (!this.activeResearchId) return

      const baseStore = useBaseStore()
      const hasConnectedLab = baseStore.placedBuildings.some(
        (b) => b.buildingId === 'lab' && baseStore.isBuildingConnected(b),
      )

      if (!hasConnectedLab) return

      const research = this.researches[this.activeResearchId]
      if (!research) return

      const multiplier = this.getDifficultyMultiplier(this.activeResearchId)
      const adjustedDuration = research.duration * multiplier

      // deltaTime est en ms, on convertit en progression
      const increment = (deltaTime / 1000) * (100 / adjustedDuration)
      research.progress += increment

      if (research.progress >= 100) {
        this.completeResearch(this.activeResearchId)
      }
    },

    completeResearch(id: string) {
      const research = this.researches[id]
      if (!research) return

      research.progress = 100
      research.status = 'completed'
      this.activeResearchId = null

      // Débloquer les suivants
      Object.values(this.researches).forEach((r) => {
        if (r.status === 'locked' && r.prerequisites.includes(id)) {
          // Vérifier si toutes les prérequis sont complétés
          const allMet = r.prerequisites.every(
            (preId) => this.researches[preId].status === 'completed',
          )
          if (allMet) {
            r.status = 'available'
          }
        }
      })
    },
  },
})
