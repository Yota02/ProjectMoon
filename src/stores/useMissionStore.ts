import { defineStore } from 'pinia'
import { useResourceStore } from './useResourceStore'
import { usePersonnelStore } from './usePersonnelStore'
import { useFleetStore, type OrbitType } from './useFleetStore'
import { useSolarSystemStore } from './useSolarSystemStore'

export interface Mission {
  id: number
  name: string
  cost: { argent: number; carburant: number }
  successChance: number
  reward: { science: number }
  status: string
  requiredOrbit: OrbitType
}

export interface MissionLog {
  temps: string
  message: string
}

export const useMissionStore = defineStore('mission', {
  state: () => ({
    missions: [
      {
        id: 1,
        name: 'Lancer un satellite météo',
        cost: { argent: 1000000, carburant: 20 },
        successChance: 0.7, // 70% de chance de succès
        reward: { science: 50 },
        status: 'Disponible',
        requiredOrbit: 'LEO'
      },
      {
        id: 2,
        name: 'Sonde vers la Lune',
        cost: { argent: 5000000, carburant: 150 },
        successChance: 0.4, // 40% de chance de succès
        reward: { science: 300 },
        status: 'Disponible',
        requiredOrbit: 'LUNAR'
      },
    ] as Mission[],
    logs: [] as MissionLog[], // Historique des missions
  }),
  actions: {
    launchMission(missionId: number, launcherId: string) {
      const resourceStore = useResourceStore()
      const personnelStore = usePersonnelStore()
      const fleetStore = useFleetStore()
      
      const mission = this.missions.find((m) => m.id === missionId)
      const launcher = fleetStore.items.find((l) => l.id === launcherId)
      const launcherDesign = launcher ? fleetStore.designs.find(d => d.id === launcher.designId) : null

      if (!mission) return
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
        this.log(`[ERREUR] ${launcherDesign.name} ne peut pas atteindre l'orbite ${mission.requiredOrbit}.`)
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
        const baseSuccessChance = (mission.successChance + (launcher.reliability / 100)) / 2
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
          this.log(`[INFO] Le lanceur ${launcher.name} est en cours de récupération pour réutilisation.`)
        } else {
          // Supprimer le lanceur non réutilisable
          fleetStore.items = fleetStore.items.filter(i => i.id !== launcherId)
          this.log(`[INFO] Le lanceur ${launcher.name} a été consommé durant la mission.`)
        }

        if (isSuccess) {
          mission.status = 'Succès'
          resourceStore.addScience(mission.reward.science)
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
        } else {          mission.status = 'Échec'
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
