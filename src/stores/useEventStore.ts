import { defineStore } from 'pinia'
import { gameEvents } from '@/engine/EventBus'
import { useResourceStore } from './useResourceStore'
import { useContractStore } from './useContractStore'
import { useSatelliteStore } from './useSatelliteStore'
import { useGameStore } from './useGameStore'

export interface GameEventChoice {
  id: string
  label: string
  onSelect: () => void | Promise<void>
}

export interface GameEventDef {
  id: string
  title: string
  description: string
  type: 'info' | 'crisis' | 'opportunity'
  choices: GameEventChoice[]
}

const EVENTS_LIBRARY: GameEventDef[] = [
  {
    id: 'oil-crisis',
    title: 'Crise Géopolitique Majeure',
    description:
      'Des tensions extrêmes au Moyen-Orient ont provoqué un choc pétrolier. Le prix du carburant rocket a triplé sur les marchés mondiaux.',
    type: 'crisis',
    choices: [
      {
        id: 'c1',
        label: 'Subir la hausse (Prix x3 pendant 60 jours)',
        onSelect: () => {
          useResourceStore().setCarburantPriceMultiplier(3, 60)
        },
      },
      {
        id: 'c2',
        label: 'Piocher dans les réserves stratégiques (-500k €, Prix x1.5)',
        onSelect: () => {
          const res = useResourceStore()
          res.addArgent(-500000)
          res.setCarburantPriceMultiplier(1.5, 60)
        },
      },
    ],
  },
  {
    id: 'solar-flare',
    title: 'Éruption Solaire Massive',
    description:
      "Une éjection de masse coronale a sévèrement irradié l'orbite terrestre. Nos systèmes de communication sont en danger critique. Faut-il mettre les satellites en veille pour protéger l'électronique ou risquer des dommages ?",
    type: 'crisis',
    choices: [
      {
        id: 'c1',
        label: 'Mise en veille préventive (Revenus suspendus 1 semaine)',
        onSelect: () => {
          useSatelliteStore().setOffline(7)
        },
      },
      {
        id: 'c2',
        label: 'Ignorer (Risque de dommages matériels)',
        onSelect: async () => {
          const satStore = useSatelliteStore()
          const stationStore = (await import('./useStationStore')).useStationStore()
          const { useLogStore } = await import('./useLogStore')
          const logStore = useLogStore()

          // Satellites
          satStore.activeSatellites.forEach((sat) => {
            if (sat.status === 'En Orbite') {
              sat.health = Math.max(0, sat.health - (10 + Math.random() * 20))
              if (sat.health <= 0) sat.status = 'Désactivé'
            }
          })

          // Stations
          stationStore.stations.forEach((station) => {
            if (station.isShielded) {
              logStore.addLog(
                `[ÉVÉNEMENT] ${station.name} : Boucliers magnétiques activés. Radiations bloquées.`,
                'success',
              )
            } else {
              const damage = Math.max(5, 20 - station.moral / 10) // Le moral aide un peu à la réactivité
              station.moral = Math.max(0, station.moral - 15)
              if (station.resources) {
                station.resources.piecesDetachees = Math.max(
                  0,
                  station.resources.piecesDetachees - 10,
                )
              }
              logStore.addLog(
                `[DÉGÂTS] ${station.name} : Systèmes grillés par l'éruption. -15 Moral, -10 Pièces détachées.`,
                'error',
              )
            }
          })

          useResourceStore().addScience(-50)
        },
      },
    ],
  },
  {
    id: 'sci-discovery',
    title: 'Découverte Exceptionnelle',
    description:
      'Vos chercheurs isolés sur la station lunaire ont identifié une anomalie cristalline qui remet en question nos connaissances en supraconductivité.',
    type: 'opportunity',
    choices: [
      {
        id: 'c1',
        label: 'Publier ouvertement (+250 Science)',
        onSelect: () => {
          useResourceStore().addScience(250)
        },
      },
      {
        id: 'c2',
        label: 'Breveter illégalement (+1.5M €)',
        onSelect: () => {
          useResourceStore().addArgent(1500000)
        },
      },
    ],
  },
  {
    id: 'strike',
    title: 'Grève des Ingénieurs',
    description:
      'Les conditions de travail et les heures supplémentaires non payées ont généré une fronde dans vos bases terrestres. Le personnel demande des primes immédiates.',
    type: 'crisis',
    choices: [
      {
        id: 'c1',
        label: 'Céder aux demandes (-400 000 €)',
        onSelect: () => {
          useResourceStore().addArgent(-400000)
        },
      },
      {
        id: 'c2',
        label: 'Mater la rébellion (Baisse Réputation globale)',
        onSelect: () => {
          const contracts = useContractStore()
          contracts.factionsReputation.USA = Math.max(0, contracts.factionsReputation.USA - 15)
          contracts.factionsReputation.Europe = Math.max(
            0,
            contracts.factionsReputation.Europe - 15,
          )
        },
      },
    ],
  },
  {
    id: 'crisis-o2-runout',
    title: 'CRISE : Asphyxie Orbitaire',
    description:
      "CATASTROPHE ! Une de vos stations est tombée à cours d'Oxygène. La population a été exposée au vide. Les conséquences médiatiques et diplomatiques sont d'une brutalité inouïe.",
    type: 'crisis',
    choices: [
      {
        id: 'c1',
        label: 'Tenter une indemnisation (Coûte 2M €)',
        onSelect: () => {
          useResourceStore().addArgent(-2000000)
        },
      },
      {
        id: 'c2',
        label: "Camoufler la tragédie (Perte d'alliés majeurs)",
        onSelect: () => {
          const contracts = useContractStore()
          contracts.factionsReputation.USA = 0
          contracts.factionsReputation.Europe = 0
          contracts.factionsReputation.Chine = 0
          contracts.factionsReputation.Asie_Est = 0
        },
      },
    ],
  },
]

export const useEventStore = defineStore('event', {
  state: () => ({
    activeEventId: null as string | null,
    eventHistory: [] as string[],
    daysSinceLastEvent: 0,
  }),
  getters: {
    activeEventDef: (state): GameEventDef | undefined => {
      if (!state.activeEventId) return undefined
      return EVENTS_LIBRARY.find((e) => e.id === state.activeEventId)
    },
  },
  actions: {
    setupListeners() {
      // Pour éviter les fuites ou doubles abonnements, on pourrait stocker la ref,
      // mais le plus simple et sûr ici est l'arrow function.
      gameEvents.on('day-elapsed', (payload) => this._handleDayElapsed(payload))
    },

    _handleDayElapsed(_payload?: unknown) {
      this.daysSinceLastEvent += 1

      // Tous les 100 jours min (~2.5 events par an), on a 2% de chance d'avoir un Event narratif
      if (this.daysSinceLastEvent > 100 && Math.random() < 0.02) {
        if (!this.activeEventId) {
          this.triggerRandomEvent()
          this.daysSinceLastEvent = 0
        }
      }
    },

    triggerSpecificEvent(eventId: string) {
      if (this.activeEventId !== null) return
      const ev = EVENTS_LIBRARY.find((e) => e.id === eventId)
      if (ev) {
        this.activeEventId = eventId
      }
    },

    triggerRandomEvent() {
      const gameStore = useGameStore()
      const isYear4 = gameStore.currentYear >= 2017

      // Exclut les événements "Crise spécifiques" qui doivent être invoqués manuellement
      // Et exclut les crises avant l'année 4
      const pool = EVENTS_LIBRARY.filter((e) => {
        if (e.id.startsWith('crisis-')) return false
        if (!isYear4 && e.type === 'crisis') return false
        return true
      })

      if (pool.length === 0) return

      const idx = Math.floor(Math.random() * pool.length)
      const ev = pool[idx]
      if (ev) {
        this.activeEventId = ev.id
      }
    },

    async resolveEvent(choiceId: string) {
      const activeDef = this.activeEventDef
      if (!activeDef) return

      const choice = activeDef.choices.find((c) => c.id === choiceId)
      if (choice) {
        await choice.onSelect()
        this.eventHistory.push(activeDef.id)
        this.activeEventId = null
      }
    },
  },
})
