import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useStationStore, type StationResources } from './useStationStore'
import { useFleetStore } from './useFleetStore'
import { useMissionStore, type Mission } from './useMissionStore'
import { useResourceStore } from './useResourceStore'
import { gameEvents } from '@/engine/EventBus'

export interface TradeRoute {
  id: string
  name: string
  stationId: string
  shipDesignId: string
  active: boolean
  threshold: number // percentage (default 20)
  payload: StationResources
  lastLaunchDay?: number
}

export const useLogisticsStore = defineStore('logistics', () => {
  const routes = ref<TradeRoute[]>([])
  
  const stationStore = useStationStore()
  const fleetStore = useFleetStore()
  const missionStore = useMissionStore()
  const resourceStore = useResourceStore()

  const setupLogisticsListeners = () => {
    gameEvents.on('day-elapsed', ({ elapsedDays }) => {
      processRoutes(elapsedDays)
    })
  }

  const processRoutes = async (currentDay: number) => {
    // Check if logistics is unlocked (5 stations)
    if (stationStore.stations.length < 5) return

    for (const route of routes.value) {
      if (!route.active) continue

      const station = stationStore.stations.find(s => s.id === route.stationId)
      if (!station || !station.resources) continue

      // Check if any resource is below threshold
      const isBelowThreshold = Object.entries(station.resources).some(([key, value]) => {
        if (key === 'energie') return false // energy is not resupplied this way usually
        const max = 100 // Default max for stations in this game
        const percentage = (value / max) * 100
        return percentage < route.threshold
      })

      if (isBelowThreshold) {
        // Cooldown check: 1 launch per 3 days to avoid spamming while ship is in transit
        if (route.lastLaunchDay && currentDay - route.lastLaunchDay < 3) continue

        await attemptLaunch(route, currentDay)
      }
    }
  }

  const attemptLaunch = async (route: TradeRoute, currentDay: number) => {
    // Find a ready ship of the specified design
    const availableShips = fleetStore.items.filter(
      item => item.designId === route.shipDesignId && item.status === 'Prêt'
    )

    if (availableShips.length === 0) {
      // Logic for selecting another ship if design not found? 
      // Requirement said "Assignez un vaisseau réutilisable à une Route".
      return
    }

    // Pick highest reliability
    const ship = availableShips.sort((a, b) => b.reliability - a.reliability)[0]
    
    // Create a temporary mission for this route
    const res = missionStore.createStationResupplyMission(route.stationId, currentDay, {
      rewardOverride: {
        nourriture: route.payload.nourriture,
        eau: route.payload.eau,
        o2: route.payload.o2,
        piecesDetachees: route.payload.piecesDetachees
      },
      titlePrefix: `[ROUTE] ${route.name}`,
    })

    if (res.success && res.mission) {
      const missionId = res.mission.id
      
      // Check if enough fuel/money
      const fuelCost = fleetStore.calculateFuelConsumption(ship.id, missionStore.getResupplyPayloadTotal(route.payload))
      const moneyCost = res.mission.cost.argent

      if (resourceStore.argent >= moneyCost && resourceStore.carburant >= fuelCost) {
        missionStore.log(`[LOGISTIQUE] Déclenchement automatique de la route "${route.name}".`)
        await missionStore.launchMission(missionId, ship.id, currentDay)
        route.lastLaunchDay = currentDay
      } else {
        missionStore.log(`[ALERTE LOGISTIQUE] Ressources insuffisantes pour la route "${route.name}" (Besoin: ${moneyCost}€, ${fuelCost}kg fuel).`)
        // Clean up the temporary mission if it wasn't launched
        missionStore.missions = missionStore.missions.filter(m => m.id !== missionId)
      }
    }
  }

  const addRoute = (route: Omit<TradeRoute, 'id'>) => {
    const newRoute: TradeRoute = {
      ...route,
      id: Math.random().toString(36).substr(2, 9)
    }
    routes.value.push(newRoute)
  }

  const removeRoute = (id: string) => {
    routes.value = routes.value.filter(r => r.id !== id)
  }

  const toggleRoute = (id: string) => {
    const route = routes.value.find(r => r.id === id)
    if (route) route.active = !route.active
  }

  return {
    routes,
    setupLogisticsListeners,
    addRoute,
    removeRoute,
    toggleRoute
  }
}, {
  persist: true
})
