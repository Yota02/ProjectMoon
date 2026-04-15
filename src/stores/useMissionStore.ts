import { defineStore } from 'pinia'
import { useResourceStore } from './useResourceStore'
import { usePersonnelStore } from './usePersonnelStore'
import { useFleetStore, type OrbitType } from './useFleetStore'
import { useSolarSystemStore } from './useSolarSystemStore'
import { useStationStore } from './useStationStore'
import { useGameStore } from './useGameStore'

type MissionStatus = 'Disponible' | 'Succès' | 'Échec' | 'En attente'

type MissionCategory = 'exploration' | 'ravitaillement'

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
  stationId?: string
  recurrenceDays?: number
  nextAvailableDay?: number
  preferredLauncherId?: string
}

export interface MissionLog {
  temps: string
  message: string
}

export const useMissionStore = defineStore('mission', {
  state: () => ({
    nextMissionId: 3,
    forecasts: [] as ResupplyForecast[],
    missions: [
      {
        id: 1,
        name: 'Lancer un satellite météo',
        cost: { argent: 1000000, carburant: 20 },
        successChance: 0.7, // 70% de chance de succès
        reward: { science: 50 },
        status: 'Disponible',
        requiredOrbit: 'LEO',
        category: 'exploration',
      },
      {
        id: 2,
        name: 'Sonde vers la Lune',
        cost: { argent: 5000000, carburant: 150 },
        successChance: 0.4, // 40% de chance de succès
        reward: { science: 300 },
        status: 'Disponible',
        requiredOrbit: 'LUNAR',
        category: 'exploration',
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
          nourriture: options?.rewardOverride?.nourriture ?? 20 + stationCrewCount * 2,
          eau: options?.rewardOverride?.eau ?? 20 + stationCrewCount * 2,
          o2: options?.rewardOverride?.o2 ?? 20 + stationCrewCount * 2,
          piecesDetachees: options?.rewardOverride?.piecesDetachees ?? 10,
        },
        status: 'Disponible',
        requiredOrbit,
        category: 'ravitaillement',
        stationId,
        recurrenceDays: options?.recurrenceDays,
        nextAvailableDay: options?.recurrenceDays ? currentDay : undefined,
        preferredLauncherId: options?.preferredLauncherId,
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

      mission.reward.nourriture = Math.max(0, Math.trunc(payload.nourriture))
      mission.reward.eau = Math.max(0, Math.trunc(payload.eau))
      mission.reward.o2 = Math.max(0, Math.trunc(payload.o2))
      mission.reward.piecesDetachees = Math.max(0, Math.trunc(payload.piecesDetachees))
      mission.preferredLauncherId = preferredLauncherId

      this.log(`[INFO] Mission de ravitaillement modifiee: ${mission.name}.`)
      return { success: true, mission }
    },

    addResupplyForecast(
      stationId: string,
      dayOfMonth: number,
      payload: { nourriture: number; eau: number; o2: number; piecesDetachees: number },
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
      }

      this.forecasts.push(forecast)
      this.log(
        `[INFO] Prevision creee: ravitaillement station (${stationId}) tous les ${forecast.dayOfMonth}.`,
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

      stationStore.stations.forEach((station) => {
        if (currentDay < station.constructionFinishedDay) return

        const hasResupplyMission = this.missions.some(
          (m) => m.stationId === station.id && m.category === 'ravitaillement',
        )

        if (!hasResupplyMission) {
          this.createStationResupplyMission(station.id, currentDay, { recurrenceDays: 7 })
        }
      })
    },

    launchMission(missionId: number, launcherId: string, currentDay?: number) {
      const resourceStore = useResourceStore()
      const personnelStore = usePersonnelStore()
      const fleetStore = useFleetStore()
      const gameStore = useGameStore()

      const mission = this.missions.find((m) => m.id === missionId)
      const launcher = fleetStore.items.find((l) => l.id === launcherId)
      const launcherDesign = launcher
        ? fleetStore.designs.find((d) => d.id === launcher.designId)
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

      if (!personnelStore.hasIngenieur) {
        this.log(`[ERREUR] Un Ingenieur est requis pour lancer "${mission.name}".`)
        return
      }

      // Vérifier si le joueur a assez de ressources
      if (
        resourceStore.argent >= mission.cost.argent &&
        resourceStore.carburant >= mission.cost.carburant
      ) {
        // Consommer les ressources
        resourceStore.addArgent(-mission.cost.argent)
        resourceStore.addCarburant(-mission.cost.carburant)

        // Calculer la réussite avec la probabilité
        const baseSuccessChance = (mission.successChance + launcher.reliability / 100) / 2
        const effectiveSuccessChance = Math.min(
          0.98,
          baseSuccessChance + personnelStore.missionSuccessBonus,
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
          if (mission.reward.nourriture) resourceStore.addNourriture(mission.reward.nourriture)
          if (mission.reward.eau) resourceStore.addEau(mission.reward.eau)
          if (mission.reward.o2) resourceStore.addO2(mission.reward.o2)
          if (mission.reward.piecesDetachees) {
            resourceStore.addPiecesDetachees(mission.reward.piecesDetachees)
          }

          if (isRecurringMission && mission.recurrenceDays) {
            const dayRef = currentDay ?? gameStore.elapsedDays
            mission.nextAvailableDay = dayRef + mission.recurrenceDays
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

    log(message: string) {
      // On garde max 10 logs
      this.logs.unshift({ temps: new Date().toLocaleTimeString(), message })
      if (this.logs.length > 10) this.logs.pop()
    },
  },
})
