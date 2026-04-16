import { defineStore } from 'pinia'
import { useResourceStore } from './useResourceStore'
import { usePersonnelStore } from './usePersonnelStore'
import { useFleetStore, type OrbitType } from './useFleetStore'
import { useSolarSystemStore } from './useSolarSystemStore'
import { useStationStore } from './useStationStore'
import { useGameStore } from './useGameStore'

const isDebugMode = import.meta.env.VITE_DEBUG_MODE === 'test'

type MissionStatus = 'Disponible' | 'Succès' | 'Échec' | 'En attente'

type MissionCategory = 'exploration' | 'ravitaillement' | 'principale'

export interface ResupplyForecast {
  id: string
  stationId: string
  dayOfMonth: number
  payload: {
    nourriture: number
    eau: number
    o2: number
    piecesDetachees: number
  }
  lastTriggeredMonthKey?: string
  autoLaunch?: boolean
  preferredLauncherDesignId?: string
}

interface CreateResupplyMissionOptions {
  rewardOverride?: {
    nourriture?: number
    eau?: number
    o2?: number
    piecesDetachees?: number
    science?: number
  }
  recurrenceDays?: number
  titlePrefix?: string
  preferredLauncherId?: string
  autoLaunch?: boolean
  autoLaunchPreferredLauncherDesignId?: string
}

interface ResupplyPayload {
  nourriture: number
  eau: number
  o2: number
  piecesDetachees: number
}

export interface Mission {
  id: number
  name: string
  cost: { argent: number; carburant: number }
  successChance: number
  reward: {
    science: number
    nourriture?: number
    eau?: number
    o2?: number
    piecesDetachees?: number
  }
  status: MissionStatus
  requiredOrbit: OrbitType
  category?: MissionCategory
  objective?: string
  launcherRequirement?: string
  unlockAfterMissionId?: number
  stationId?: string
  recurrenceDays?: number
  nextAvailableDay?: number
  preferredLauncherId?: string
  autoLaunch?: boolean
  autoLaunchPreferredLauncherDesignId?: string
  populationRequirement?: { type: 'marsCivilian'; count: number }
  populationReward?: number
}

export interface MissionLog {
  temps: string
  message: string
}

export const useMissionStore = defineStore('mission', {
  state: () => ({
    nextMissionId: 11,
    forecasts: [] as ResupplyForecast[],
    missions: [
      {
        id: 1,
        name: "Mise en orbite d'un satellite",
        cost: { argent: 1000000, carburant: 20 },
        successChance: 0.72,
        reward: { science: 80 },
        status: 'Disponible',
        requiredOrbit: 'LEO',
        category: 'principale',
        objective:
          'Valider votre premiere etape du programme spatial avec un satellite operationnel.',
        launcherRequirement: 'Micro-Lanceur minimum (LEO)',
      },
      {
        id: 2,
        name: 'Constellation orbitale',
        cost: { argent: 4500000, carburant: 80 },
        successChance: 0.64,
        reward: { science: 220 },
        status: 'En attente',
        requiredOrbit: 'LEO',
        category: 'principale',
        objective:
          'Deployer un reseau de satellites de communication et de navigation en orbite basse.',
        launcherRequirement: 'Micro-Lanceur ou Lanceur Moyen',
        unlockAfterMissionId: 1,
      },
      {
        id: 3,
        name: 'Noyau de station orbitale',
        cost: { argent: 8500000, carburant: 140 },
        successChance: 0.55,
        reward: { science: 460 },
        status: 'En attente',
        requiredOrbit: 'LEO',
        category: 'principale',
        objective: 'Assembler le module central d une station habitee en orbite terrestre.',
        launcherRequirement: 'Lanceur Moyen recommande',
        unlockAfterMissionId: 2,
      },
      {
        id: 4,
        name: 'Station spatiale operationnelle',
        cost: { argent: 12000000, carburant: 190 },
        successChance: 0.48,
        reward: { science: 680 },
        status: 'En attente',
        requiredOrbit: 'LEO',
        category: 'principale',
        objective:
          'Finaliser la station avec support vie, equipage permanent et maintenance orbitale.',
        launcherRequirement: 'Lanceur Lourd prefere pour les modules',
        unlockAfterMissionId: 3,
      },
      {
        id: 5,
        name: 'Depot logistique cis-lunaire',
        cost: { argent: 18000000, carburant: 280 },
        successChance: 0.4,
        reward: { science: 900 },
        status: 'En attente',
        requiredOrbit: 'LUNAR',
        category: 'principale',
        objective: 'Placer un depot de carburant et de fret sur trajectoire lunaire.',
        launcherRequirement: 'Lanceur Super-Lourd pour le fret lunaire',
        unlockAfterMissionId: 4,
      },
      {
        id: 6,
        name: 'Base lunaire initiale',
        cost: { argent: 26000000, carburant: 380 },
        successChance: 0.34,
        reward: { science: 1100 },
        status: 'En attente',
        requiredOrbit: 'LUNAR',
        category: 'principale',
        objective: 'Deployer les premiers modules habitables pour etablir une base sur la Lune.',
        launcherRequirement: 'Lanceur Super-Lourd ou Vaisseau Interplanetaire',
        unlockAfterMissionId: 5,
      },
      {
        id: 7,
        name: 'Base lunaire autonome',
        cost: { argent: 32000000, carburant: 440 },
        successChance: 0.31,
        reward: { science: 1400 },
        status: 'En attente',
        requiredOrbit: 'LUNAR',
        category: 'principale',
        objective: 'Rendre la base lunaire autosuffisante en energie, oxygene et maintenance.',
        launcherRequirement: 'Vaisseau Interplanetaire prefere (missions lourdes)',
        unlockAfterMissionId: 6,
      },
      {
        id: 8,
        name: 'Avant-poste martien',
        cost: { argent: 40000000, carburant: 520 },
        successChance: 0.25,
        reward: { science: 1500 },
        status: 'En attente',
        requiredOrbit: 'MARTIAN',
        category: 'principale',
        objective: 'Lancer la premiere architecture de base martienne et valider son implantation.',
        launcherRequirement: 'Vaisseau Interplanetaire obligatoire',
        unlockAfterMissionId: 7,
      },
      {
        id: 9,
        name: 'Cite scientifique martienne',
        cost: { argent: 55000000, carburant: 700 },
        successChance: 0.22,
        reward: { science: 2100 },
        status: 'En attente',
        requiredOrbit: 'MARTIAN',
        category: 'principale',
        objective: 'Etendre l avant-poste en colonie scientifique avec laboratoires specialises.',
        launcherRequirement: 'Vaisseau Interplanetaire + rotation logistique reguliere',
        unlockAfterMissionId: 8,
      },
      {
        id: 10,
        name: "Programme d'extraction asteroidale",
        cost: { argent: 70000000, carburant: 900 },
        successChance: 0.2,
        reward: { science: 3000 },
        status: 'En attente',
        requiredOrbit: 'MARTIAN',
        category: 'principale',
        objective:
          "Ouvrir une route industrielle vers les asteroides pour soutenir l'expansion interplanetaire.",
        launcherRequirement: 'Vaisseau Interplanetaire de classe lourde requis',
        unlockAfterMissionId: 9,
      },
      {
        id: 11,
        name: "Capture et mise en orbite d'astéroïde",
        cost: { argent: 90000000, carburant: 1100 },
        successChance: 0.18,
        reward: { science: 4000 },
        status: 'En attente',
        requiredOrbit: 'MARTIAN',
        category: 'principale',
        objective:
          "Capturer un asterode et le placer en orbite martienne pour servir de base d'extraction.",
        launcherRequirement: 'Vaisseau Interplanetaire de classe lourde avec module de capture',
        unlockAfterMissionId: 10,
        populationRequirement: { type: 'marsCivilian', count: 1000000 },
        populationReward: 1000000,
      },
    ] as Mission[],
    logs: [] as MissionLog[], // Historique des missions
  }),
  getters: {
    availableMissions: (state) => state.missions.filter((m) => m.status === 'Disponible'),
    completedMissions: (state) =>
      state.missions.filter((m) => m.status === 'Succès' || m.status === 'Échec'),
    successfulMissions: (state) => state.missions.filter((m) => m.status === 'Succès'),
    successRate: (state) => {
      const completed = state.missions.filter((m) => m.status === 'Succès' || m.status === 'Échec')
      if (completed.length === 0) return 0
      return Math.round(
        (state.missions.filter((m) => m.status === 'Succès').length / completed.length) * 100,
      )
    },
  },
  actions: {
    normalizeResupplyPayload(payload: ResupplyPayload): ResupplyPayload {
      return {
        nourriture: Math.max(0, Math.trunc(payload.nourriture)),
        eau: Math.max(0, Math.trunc(payload.eau)),
        o2: Math.max(0, Math.trunc(payload.o2)),
        piecesDetachees: Math.max(0, Math.trunc(payload.piecesDetachees)),
      }
    },

    getResupplyPayloadTotal(payload: ResupplyPayload) {
      return payload.nourriture + payload.eau + payload.o2 + payload.piecesDetachees
    },

    validateResupplyPayloadCapacity(payload: ResupplyPayload, launcherId?: string) {
      if (!launcherId) {
        return { success: true as const }
      }

      const fleetStore = useFleetStore()
      const launcher = fleetStore.items.find((item) => item.id === launcherId)
      const launcherDesign = launcher
        ? fleetStore.designs.find((design) => design.id === launcher.designId)
        : undefined

      if (!launcher || !launcherDesign || launcherDesign.type !== 'launcher') {
        return { success: false as const, message: 'Lanceur de ravitaillement introuvable' }
      }

      const payloadTotal = this.getResupplyPayloadTotal(payload)
      if (payloadTotal > launcherDesign.cargoCapacity) {
        return {
          success: false as const,
          message: `Charge totale (${payloadTotal}) superieure a la capacite du lanceur (${launcherDesign.cargoCapacity}).`,
        }
      }

      return { success: true as const }
    },

    createStationResupplyMission(
      stationId: string,
      currentDay: number,
      options?: CreateResupplyMissionOptions,
    ) {
      const stationStore = useStationStore()
      const station = stationStore.stations.find((s) => s.id === stationId)

      if (!station) {
        this.log('[ERREUR] Station introuvable pour la mission de ravitaillement.')
        return { success: false, message: 'Station introuvable' }
      }

      const stationCrewCount = station.astronautIds.length
      const existingResupplyMissionsCount = this.missions.filter(
        (m) => m.stationId === stationId && m.category === 'ravitaillement',
      ).length
      const missionIndex = existingResupplyMissionsCount + 1
      const orbitToMission: Record<string, OrbitType> = {
        earth: 'LEO',
        moon: 'LUNAR',
        mars: 'MARTIAN',
      }

      const requiredOrbit = orbitToMission[station.orbitBodyId] ?? 'LEO'
      const baseSuccessByOrbit: Record<OrbitType, number> = {
        LEO: 0.88,
        MEO: 0.8,
        GEO: 0.75,
        HEO: 0.72,
        LUNAR: 0.65,
        MARTIAN: 0.5,
      }

      const requestedPayload = this.normalizeResupplyPayload({
        nourriture: options?.rewardOverride?.nourriture ?? 20 + stationCrewCount * 2,
        eau: options?.rewardOverride?.eau ?? 20 + stationCrewCount * 2,
        o2: options?.rewardOverride?.o2 ?? 20 + stationCrewCount * 2,
        piecesDetachees: options?.rewardOverride?.piecesDetachees ?? 10,
      })

      const capacityCheck = this.validateResupplyPayloadCapacity(
        requestedPayload,
        options?.preferredLauncherId,
      )
      if (!capacityCheck.success) {
        this.log(`[ERREUR] ${capacityCheck.message}`)
        return { success: false, message: capacityCheck.message }
      }

      const mission: Mission = {
        id: this.nextMissionId++,
        name: `${options?.titlePrefix ?? `Ravitaillement #${missionIndex}`} - ${station.name}`,
        cost: {
          argent: 750000 + stationCrewCount * 100000,
          carburant: 25 + stationCrewCount * 5,
        },
        successChance: baseSuccessByOrbit[requiredOrbit],
        reward: {
          science: options?.rewardOverride?.science ?? 10,
          nourriture: requestedPayload.nourriture,
          eau: requestedPayload.eau,
          o2: requestedPayload.o2,
          piecesDetachees: requestedPayload.piecesDetachees,
        },
        status: 'Disponible',
        requiredOrbit,
        category: 'ravitaillement',
        stationId,
        recurrenceDays: options?.recurrenceDays,
        nextAvailableDay: options?.recurrenceDays ? currentDay : undefined,
        preferredLauncherId: options?.preferredLauncherId,
        autoLaunch: options?.autoLaunch,
        autoLaunchPreferredLauncherDesignId: options?.autoLaunchPreferredLauncherDesignId,
      }

      this.missions.push(mission)
      this.log(`[INFO] Mission hebdomadaire creee: ${mission.name}.`)
      return { success: true, mission }
    },

    updateStationResupplyMission(
      missionId: number,
      payload: { nourriture: number; eau: number; o2: number; piecesDetachees: number },
      preferredLauncherId?: string,
    ) {
      const mission = this.missions.find(
        (m) => m.id === missionId && m.category === 'ravitaillement' && m.stationId,
      )

      if (!mission) {
        this.log('[ERREUR] Mission de ravitaillement introuvable pour modification.')
        return { success: false, message: 'Mission de ravitaillement introuvable' }
      }

      const normalizedPayload = this.normalizeResupplyPayload(payload)
      const nextPreferredLauncherId = preferredLauncherId ?? mission.preferredLauncherId
      const capacityCheck = this.validateResupplyPayloadCapacity(
        normalizedPayload,
        nextPreferredLauncherId,
      )
      if (!capacityCheck.success) {
        this.log(`[ERREUR] ${capacityCheck.message}`)
        return { success: false, message: capacityCheck.message }
      }

      mission.reward.nourriture = normalizedPayload.nourriture
      mission.reward.eau = normalizedPayload.eau
      mission.reward.o2 = normalizedPayload.o2
      mission.reward.piecesDetachees = normalizedPayload.piecesDetachees
      mission.preferredLauncherId = nextPreferredLauncherId

      this.log(`[INFO] Mission de ravitaillement modifiee: ${mission.name}.`)
      return { success: true, mission }
    },

    addResupplyForecast(
      stationId: string,
      dayOfMonth: number,
      payload: { nourriture: number; eau: number; o2: number; piecesDetachees: number },
      options?: { autoLaunch?: boolean; preferredLauncherDesignId?: string },
    ) {
      const stationStore = useStationStore()
      const stationExists = stationStore.stations.some((s) => s.id === stationId)
      if (!stationExists) {
        return { success: false, message: 'Station introuvable' }
      }

      if (!Number.isFinite(dayOfMonth) || dayOfMonth < 1 || dayOfMonth > 28) {
        return { success: false, message: 'Le jour doit etre compris entre 1 et 28' }
      }

      const forecast: ResupplyForecast = {
        id: Math.random().toString(36).slice(2, 11),
        stationId,
        dayOfMonth: Math.trunc(dayOfMonth),
        payload: {
          nourriture: Math.max(0, Math.trunc(payload.nourriture)),
          eau: Math.max(0, Math.trunc(payload.eau)),
          o2: Math.max(0, Math.trunc(payload.o2)),
          piecesDetachees: Math.max(0, Math.trunc(payload.piecesDetachees)),
        },
        autoLaunch: options?.autoLaunch,
        preferredLauncherDesignId: options?.preferredLauncherDesignId,
      }

      this.forecasts.push(forecast)
      this.log(
        `[INFO] Prevision creee: ravitaillement station (${stationId}) tous les ${forecast.dayOfMonth}${forecast.autoLaunch ? ' (Auto-launch ON)' : ''}.`,
      )
      return { success: true, forecast }
    },

    removeResupplyForecast(forecastId: string) {
      this.forecasts = this.forecasts.filter((f) => f.id !== forecastId)
    },

    runResupplyForecasts(currentDate: Date, currentDay: number) {
      const currentDayOfMonth = currentDate.getDate()
      const monthKey = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}`

      this.forecasts.forEach((forecast) => {
        if (forecast.dayOfMonth !== currentDayOfMonth) return
        if (forecast.lastTriggeredMonthKey === monthKey) return

        const result = this.createStationResupplyMission(forecast.stationId, currentDay, {
          rewardOverride: {
            science: 10,
            nourriture: forecast.payload.nourriture,
            eau: forecast.payload.eau,
            o2: forecast.payload.o2,
            piecesDetachees: forecast.payload.piecesDetachees,
          },
          titlePrefix: `Prevision ${forecast.dayOfMonth}`,
          autoLaunch: forecast.autoLaunch,
          autoLaunchPreferredLauncherDesignId: forecast.preferredLauncherDesignId,
        })

        if (result.success) {
          forecast.lastTriggeredMonthKey = monthKey
        }
      })
    },

    refreshWeeklyMissions(currentDay: number) {
      this.missions.forEach((mission) => {
        if (!mission.recurrenceDays || mission.nextAvailableDay === undefined) return

        if (mission.status !== 'Disponible' && currentDay >= mission.nextAvailableDay) {
          mission.status = 'Disponible'
        }
      })
    },

    ensureStationResupplyMissions(currentDay: number) {
      const stationStore = useStationStore()
      const fleetStore = useFleetStore()

      stationStore.stations.forEach((station) => {
        if (currentDay < station.constructionFinishedDay) return

        const hasResupplyMission = this.missions.some(
          (m) => m.stationId === station.id && m.category === 'ravitaillement',
        )

        if (!hasResupplyMission) {
          const preferredLauncherId = isDebugMode
            ? fleetStore.readyLaunchers.find((l) => {
                const design = fleetStore.designs.find((d) => d.id === l.designId)
                const orbitMap: Record<string, OrbitType> = {
                  earth: 'LEO',
                  moon: 'LUNAR',
                  mars: 'MARTIAN',
                }
                const requiredOrbit = orbitMap[station.orbitBodyId] ?? 'LEO'
                return design?.supportedOrbits.includes(requiredOrbit)
              })?.id
            : undefined

          this.createStationResupplyMission(station.id, currentDay, {
            recurrenceDays: 7,
            preferredLauncherId,
          })
        }
      })
    },

    unlockMainMissions(completedMissionId: number) {
      const stationStore = useStationStore()
      const unlockedMissions = this.missions.filter((mission) => {
        if (mission.category !== 'principale') return false
        if (mission.status !== 'En attente') return false
        if (mission.unlockAfterMissionId !== completedMissionId) return false

        if (mission.populationRequirement) {
          const { type, count } = mission.populationRequirement
          if (type === 'marsCivilian') {
            if (stationStore.marsCivilianPopulation < count) return false
          }
        }

        return true
      })

      unlockedMissions.forEach((mission) => {
        mission.status = 'Disponible'
        this.log(`[OBJECTIF] Nouvelle mission principale disponible: "${mission.name}".`)
      })
    },

    async launchMission(missionId: number, launcherId: string, currentDay?: number) {
      const resourceStore = useResourceStore()
      const personnelStore = usePersonnelStore()
      const fleetStore = useFleetStore()
      const gameStore = useGameStore()

      const mission = this.missions.find((m) => m.id === missionId)
      const launcher = fleetStore.items.find((l) => l.id === launcherId)
      const launcherDesign = launcher
        ? fleetStore.designs.find((design) => design.id === launcher.designId)
        : null

      if (!mission) return
      if (mission.status !== 'Disponible') {
        this.log(`[ERREUR] La mission "${mission.name}" n'est pas disponible actuellement.`)
        return
      }
      if (!launcher || !launcherDesign) {
        this.log(`[ERREUR] Un lanceur valide est requis pour "${mission.name}".`)
        return
      }

      if (launcher.status !== 'Prêt') {
        this.log(`[ERREUR] Le lanceur ${launcher.name} n'est pas prêt.`)
        return
      }

      // Vérifier les capacités du lanceur
      if (!launcherDesign.supportedOrbits.includes(mission.requiredOrbit)) {
        this.log(
          `[ERREUR] ${launcherDesign.name} ne peut pas atteindre l'orbite ${mission.requiredOrbit}.`,
        )
        return
      }

      if (mission.requiredOrbit === 'LUNAR' && !launcherDesign.canReachMoon) {
        this.log(`[ERREUR] ${launcherDesign.name} ne peut pas aller à la Lune.`)
        return
      }

      if (mission.category === 'ravitaillement') {
        const payloadTotal = this.getResupplyPayloadTotal({
          nourriture: mission.reward.nourriture ?? 0,
          eau: mission.reward.eau ?? 0,
          o2: mission.reward.o2 ?? 0,
          piecesDetachees: mission.reward.piecesDetachees ?? 0,
        })
        if (payloadTotal > launcherDesign.cargoCapacity) {
          this.log(
            `[ERREUR] Charge de ravitaillement (${payloadTotal}) superieure a la capacite de ${launcherDesign.name} (${launcherDesign.cargoCapacity}).`,
          )
          return
        }
      }

      if (!personnelStore.hasIngenieur) {
        this.log(`[ERREUR] Un Ingenieur est requis pour lancer "${mission.name}".`)
        return
      }

      // Calculer la consommation de carburant basée sur le lanceur et la charge utile
      const payloadWeight =
        mission.category === 'ravitaillement'
          ? this.getResupplyPayloadTotal({
              nourriture: mission.reward.nourriture ?? 0,
              eau: mission.reward.eau ?? 0,
              o2: mission.reward.o2 ?? 0,
              piecesDetachees: mission.reward.piecesDetachees ?? 0,
            })
          : 0

      const fuelConsumption = fleetStore.calculateFuelConsumption(launcherId, payloadWeight)
      const totalCostArgent = mission.cost.argent

      // Vérifier si le joueur a assez de ressources
      if (resourceStore.argent >= totalCostArgent && resourceStore.carburant >= fuelConsumption) {
        // Consommer les ressources
        resourceStore.addArgent(-totalCostArgent)
        resourceStore.addCarburant(-fuelConsumption)

        // Calculer la réussite avec la probabilité
        const satelliteStore = (await import('./useSatelliteStore')).useSatelliteStore()
        const orbitToBody: Record<string, string> = {
          LEO: 'earth',
          MEO: 'earth',
          GEO: 'earth',
          HEO: 'earth',
          LUNAR: 'moon',
          MARTIAN: 'mars',
        }
        const targetBody = orbitToBody[mission.requiredOrbit] || 'earth'
        const satNavBonus = (satelliteStore.navigationBonus(targetBody) || 0) / 100

        const baseSuccessChance = (mission.successChance + launcher.reliability / 100) / 2
        const effectiveSuccessChance = Math.min(
          0.98,
          baseSuccessChance + personnelStore.missionSuccessBonus + satNavBonus,
        )
        const roll = Math.random()
        const isSuccess = roll <= effectiveSuccessChance

        // Gérer le lanceur après le vol
        if (launcherDesign.isReusable) {
          launcher.status = 'En maintenance'
          // Réduire un peu la fiabilité après chaque vol
          launcher.reliability = Math.max(70, launcher.reliability - 2)
          this.log(
            `[INFO] Le lanceur ${launcher.name} est en cours de récupération pour réutilisation.`,
          )
        } else {
          // Supprimer le lanceur non réutilisable
          fleetStore.items = fleetStore.items.filter((i) => i.id !== launcherId)
          this.log(`[INFO] Le lanceur ${launcher.name} a été consommé durant la mission.`)
        }

        if (isSuccess) {
          const isRecurringMission = Boolean(mission.recurrenceDays)
          mission.status = isRecurringMission ? 'En attente' : 'Succès'
          resourceStore.addScience(mission.reward.science)

          if (mission.stationId) {
            const stationStore = useStationStore()
            const station = stationStore.stations.find((s) => s.id === mission.stationId)
            if (station && station.resources) {
              if (mission.reward.nourriture) {
                stationStore.addStationResources(mission.stationId, {
                  nourriture: mission.reward.nourriture,
                })
              }
              if (mission.reward.eau) {
                stationStore.addStationResources(mission.stationId, { eau: mission.reward.eau })
              }
              if (mission.reward.o2) {
                stationStore.addStationResources(mission.stationId, { o2: mission.reward.o2 })
              }
              if (mission.reward.piecesDetachees) {
                stationStore.addStationResources(mission.stationId, {
                  piecesDetachees: mission.reward.piecesDetachees,
                })
              }
            }
          } else {
            if (mission.reward.nourriture) resourceStore.addNourriture(mission.reward.nourriture)
            if (mission.reward.eau) resourceStore.addEau(mission.reward.eau)
            if (mission.reward.o2) resourceStore.addO2(mission.reward.o2)
            if (mission.reward.piecesDetachees) {
              resourceStore.addPiecesDetachees(mission.reward.piecesDetachees)
            }
          }

          if (isRecurringMission && mission.recurrenceDays) {
            const dayRef = currentDay ?? gameStore.elapsedDays
            mission.nextAvailableDay = dayRef + mission.recurrenceDays
          }

          this.unlockMainMissions(mission.id)

          if (mission.populationReward && mission.requiredOrbit === 'MARTIAN') {
            const stationStore = useStationStore()
            const marsStations = stationStore.stations.filter(
              (s) => s.orbitBodyId === 'mars' && s.constructionFinishedDay <= gameStore.elapsedDays,
            )
            marsStations.forEach((station) => {
              stationStore.addCivilianPopulation(station.id, mission.populationReward!)
            })
            this.log(
              `[INFO] +${mission.populationReward.toLocaleString()} population civile ajoutee sur Mars.`,
            )
          }

          this.log(
            `[SUCCÈS] Mission "${mission.name}" a réussi avec ${launcher.name} ! Récompense: +${mission.reward.science} Science.`,
          )

          // Démarrer un voyage visuel dans le système solaire
          const solarStore = useSolarSystemStore()
          if (mission.requiredOrbit === 'LUNAR') {
            solarStore.startTravel(mission.name, 'earth', 'moon', 3) // 3 jours pour la lune
          } else if (mission.requiredOrbit === 'MARTIAN') {
            solarStore.startTravel(mission.name, 'earth', 'mars', 200) // 200 jours pour Mars
          } else if (mission.requiredOrbit === 'LEO') {
            solarStore.startTravel(mission.name, 'earth', 'earth', 1) // Orbite terrestre
          }
        } else {
          const isRecurringMission = Boolean(mission.recurrenceDays)
          mission.status = isRecurringMission ? 'En attente' : 'Échec'
          if (isRecurringMission && mission.recurrenceDays) {
            const dayRef = currentDay ?? gameStore.elapsedDays
            mission.nextAvailableDay = dayRef + mission.recurrenceDays
          }
          this.log(`[ÉCHEC] Mission "${mission.name}" avec ${launcher.name} a échoué...`)
        }
      } else {
        this.log(`[ERREUR] Pas assez de ressources pour "${mission.name}".`)
      }
    },

    processAutoLaunchMissions(currentDay: number) {
      const fleetStore = useFleetStore()
      const availableMissions = this.missions.filter(
        (m) => m.status === 'Disponible' && m.autoLaunch,
      )

      availableMissions.forEach((mission) => {
        // On cherche un lanceur prêt et compatible
        let launcher: (typeof fleetStore.readyLaunchers)[number] | undefined
        if (mission.autoLaunchPreferredLauncherDesignId) {
          launcher = fleetStore.readyLaunchers.find(
            (l) =>
              l.designId === mission.autoLaunchPreferredLauncherDesignId &&
              this.validateResupplyPayloadCapacity(mission.reward as ResupplyPayload, l.id).success,
          )
        }

        if (!launcher) {
          launcher = fleetStore.readyLaunchers.find(
            (l) =>
              this.validateResupplyPayloadCapacity(mission.reward as ResupplyPayload, l.id)
                .success &&
              fleetStore.designs
                .find((d) => d.id === l.designId)
                ?.supportedOrbits.includes(mission.requiredOrbit),
          )
        }

        if (launcher) {
          // On vérifie aussi si on a les ressources (launchMission le fait déjà mais on veut être discret dans les logs si on n'a pas les fonds)
          const resourceStore = useResourceStore()
          if (
            resourceStore.argent >= mission.cost.argent &&
            resourceStore.carburant >= mission.cost.carburant
          ) {
            this.log(`[AUTO] Lancement automatique de la mission "${mission.name}"...`)
            this.launchMission(mission.id, launcher.id, currentDay)
          }
        }
      })
    },

    log(message: string) {
      // On garde max 10 logs
      this.logs.unshift({ temps: new Date().toLocaleTimeString(), message })
      if (this.logs.length > 10) this.logs.pop()
    },
  },
})
