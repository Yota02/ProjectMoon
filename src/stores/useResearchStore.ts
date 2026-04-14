import { defineStore } from 'pinia';
import { useResourceStore } from './useResourceStore';

export type ResearchStatus = 'locked' | 'available' | 'researching' | 'completed';

export interface ResearchNode {
  id: string;
  name: string;
  description: string;
  category: 'Lanceurs' | 'Bâtiments' | 'Moteur' | 'Informatique' | 'Humain' | 'Economique' | 'Colonisation';
  cost: number;
  duration: number; // en secondes (ticks)
  progress: number; // 0 à 100
  status: ResearchStatus;
  prerequisites: string[];
  unlockedBy?: string[]; // Pour la logique inverse si besoin
}

export const useResearchStore = defineStore('research', {
  state: () => ({
    researches: {
      // LANCEURS
      'l-micro': {
        id: 'l-micro',
        name: 'Micro-Lanceurs',
        description: 'Capacité de lancer de petits satellites en orbite basse.',
        category: 'Lanceurs',
        cost: 20,
        duration: 10,
        progress: 0,
        status: 'available',
        prerequisites: []
      },
      'l-heavy': {
        id: 'l-heavy',
        name: 'Lanceurs Lourds',
        description: 'Permet d\'envoyer des charges utiles massives au-delà de l\'orbite terrestre.',
        category: 'Lanceurs',
        cost: 150,
        duration: 60,
        progress: 0,
        status: 'locked',
        prerequisites: ['l-micro']
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
        status: 'available',
        prerequisites: []
      },
      'b-usine': {
        id: 'b-usine',
        name: 'Usine d\'Assemblage',
        description: 'Accélère la construction des lanceurs.',
        category: 'Bâtiments',
        cost: 100,
        duration: 40,
        progress: 0,
        status: 'locked',
        prerequisites: ['b-labo']
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
        status: 'available',
        prerequisites: []
      },
      'm-ionique': {
        id: 'm-ionique',
        name: 'Moteur Ionique',
        description: 'Indispensable pour les sondes longue distance.',
        category: 'Moteur',
        cost: 200,
        duration: 120,
        progress: 0,
        status: 'locked',
        prerequisites: ['m-chimique']
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
        status: 'available',
        prerequisites: []
      },
      'i-ia': {
        id: 'i-ia',
        name: 'IA de Pilotage',
        description: 'Optimisation automatique des trajectoires.',
        category: 'Informatique',
        cost: 300,
        duration: 180,
        progress: 0,
        status: 'locked',
        prerequisites: ['i-guidage']
      },

      // HUMAIN
      'h-entraînement': {
        id: 'h-entraînement',
        name: 'Centre d\'Entraînement Alpha',
        description: 'Permet de recruter des astronautes qualifiés.',
        category: 'Humain',
        cost: 60,
        duration: 30,
        progress: 0,
        status: 'available',
        prerequisites: []
      },
      'h-survie': {
        id: 'h-survie',
        name: 'Support Vie Régénératif',
        description: 'Indispensable pour les missions habitées de longue durée.',
        category: 'Humain',
        cost: 250,
        duration: 150,
        progress: 0,
        status: 'locked',
        prerequisites: ['h-entraînement']
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
        status: 'available',
        prerequisites: []
      },
      'e-assurance': {
        id: 'e-assurance',
        name: 'Assurances Spatiales',
        description: 'Remboursement partiel en cas d\'échec de mission.',
        category: 'Economique',
        cost: 120,
        duration: 45,
        progress: 0,
        status: 'locked',
        prerequisites: ['e-marketing']
      },

      // COLONISATION
      'c-ferme': {
        id: 'c-ferme',
        name: 'Ferme Hydroponique',
        description: 'Permet de produire de la nourriture dans l\'espace, réduisant les coûts de maintenance.',
        category: 'Colonisation',
        cost: 80,
        duration: 40,
        progress: 0,
        status: 'available',
        prerequisites: []
      },
      'c-mine': {
        id: 'c-mine',
        name: 'Extraction de Régolithe',
        description: 'Utilisation des ressources locales pour la construction.',
        category: 'Colonisation',
        cost: 150,
        duration: 60,
        progress: 0,
        status: 'locked',
        prerequisites: ['c-ferme']
      },
      'c-dome': {
        id: 'c-dome',
        name: 'Dômes Habitables',
        description: 'Infrastructures pressurisées pour établir des colonies permanentes.',
        category: 'Colonisation',
        cost: 400,
        duration: 180,
        progress: 0,
        status: 'locked',
        prerequisites: ['c-mine']
      }
    } as Record<string, ResearchNode>,
    activeResearchId: null as string | null,
  }),
  getters: {
    activeResearch: (state) => state.activeResearchId ? state.researches[state.activeResearchId] : null,
    getByCategory: (state) => (category: string) => {
      return Object.values(state.researches).filter(r => r.category === category);
    }
  },
  actions: {
    startResearch(id: string) {
      const resourceStore = useResourceStore();
      const research = this.researches[id];

      if (!research || research.status !== 'available' || this.activeResearchId) return;

      if (resourceStore.science >= research.cost) {
        resourceStore.addScience(-research.cost);
        research.status = 'researching';
        this.activeResearchId = id;
      }
    },

    tick(deltaTime: number) {
      if (!this.activeResearchId) return;

      const research = this.researches[this.activeResearchId];
      if (!research) return;

      // deltaTime est en ms, on convertit en progression
      // Si duration est en secondes, 1 tick = 1 seconde = 100 / duration pourcentages
      const increment = (deltaTime / 1000) * (100 / research.duration);
      research.progress += increment;

      if (research.progress >= 100) {
        this.completeResearch(this.activeResearchId);
      }
    },

    completeResearch(id: string) {
      const research = this.researches[id];
      if (!research) return;

      research.progress = 100;
      research.status = 'completed';
      this.activeResearchId = null;

      // Débloquer les suivants
      Object.values(this.researches).forEach(r => {
        if (r.status === 'locked' && r.prerequisites.includes(id)) {
          // Vérifier si toutes les prérequis sont complétés
          const allMet = r.prerequisites.every(preId => this.researches[preId].status === 'completed');
          if (allMet) {
            r.status = 'available';
          }
        }
      });
    }
  }
});
