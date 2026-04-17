import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useGameStore } from './useGameStore'
import { useSolarSystemStore } from './useSolarSystemStore'
import { useResourceStore } from './useResourceStore'
import { gameEvents } from '@/engine/EventBus'

export type RoverType = 'drone' | 'rover' | 'lab-mobile'

export interface RoverDesign {
  id: string
  name: string
  type: RoverType
  cost: number
  reliability: number
  scanSpeed: number // scan % per day
  description: string
}

export interface RoverItem {
  id: string
  designId: string
  name: string
  status: 'Ready' | 'Scanning' | 'Lost'
  assignedZoneId?: string
}

export interface ScanMission {
  id: string
  zoneId: string
  roverId: string
  startDay: number
}

export interface ProspectionResult {
  zoneId: string
  mineralQuality: number // 0.5 to 1.5 multiplier
  waterQuality: number
  energyQuality: number
  scienceQuality: number
}

export const ROVER_DESIGNS: RoverDesign[] = [
  {
    id: 'd-scout',
    name: 'Drone Scout',
    type: 'drone',
    cost: 50, // en millions
    reliability: 0.9,
    scanSpeed: 10,
    description: 'Petit drone rapide pour un scan préliminaire.'
  },
  {
    id: 'r-pathfinder',
    name: 'Rover Pathfinder',
    type: 'rover',
    cost: 120,
    reliability: 0.95,
    scanSpeed: 5,
    description: 'Rover robuste pour une exploration détaillée.'
  },
  {
    id: 'l-explorer',
    name: 'Laboratoire Mobile Explorer',
    type: 'lab-mobile',
    cost: 400,
    reliability: 0.98,
    scanSpeed: 2,
    description: 'Laboratoire complet sur roues pour une prospection de haute précision.'
  }
]

export const useExplorationStore = defineStore('exploration', () => {
  const gameStore = useGameStore()
  const solarStore = useSolarSystemStore()
  const resourceStore = useResourceStore()

  const rovers = ref<RoverItem[]>([])
  const activeMissions = ref<ScanMission[]>([])
  const prospectionResults = ref<Record<string, ProspectionResult>>({})

  // Initial rovers for debug or startup if needed
  if (import.meta.env.VITE_DEBUG_MODE === 'test') {
    // maybe add one
  }

  const buyRover = (designId: string) => {
    const design = ROVER_DESIGNS.find(d => d.id === designId)
    if (!design || resourceStore.argent < design.cost * 1000000) return

    resourceStore.addArgent(-design.cost * 1000000)
    
    rovers.value.push({
      id: Math.random().toString(36).substr(2, 9),
      designId: design.id,
      name: `${design.name} #${rovers.value.length + 1}`,
      status: 'Ready'
    })
  }

  const startScan = (zoneId: string, roverId: string) => {
    const rover = rovers.value.find(r => r.id === roverId)
    if (!rover || rover.status !== 'Ready') return

    rover.status = 'Scanning'
    rover.assignedZoneId = zoneId
    
    activeMissions.value.push({
      id: Math.random().toString(36).substr(2, 9),
      zoneId,
      roverId,
      startDay: gameStore.elapsedDays
    })
  }

  const getProspectionResult = (zoneId: string) => prospectionResults.value[zoneId]

  const setProspectionResult = (result: ProspectionResult) => {
    prospectionResults.value[result.zoneId] = result
  }

  gameEvents.on('day-elapsed', ({ daysPassed }) => {
    if (daysPassed <= 0) return

    activeMissions.value.forEach(mission => {
      const rover = rovers.value.find(r => r.id === mission.roverId)
      if (!rover) return

      const design = ROVER_DESIGNS.find(d => d.id === rover.designId)
      if (!design) return

      // Advanced scan progress
      solarStore.advanceZoneScan(design.scanSpeed * daysPassed, mission.zoneId)

      // Check for mission completion or accidents
      const zone = solarStore.planets.flatMap(p => p.zones || []).find(z => z.id === mission.zoneId)
      // Completion check logic could go here
    })
  })

  return {
    rovers,
    activeMissions,
    prospectionResults,
    roverDesigns: ROVER_DESIGNS,
    buyRover,
    startScan,
    getProspectionResult,
    setProspectionResult
  }
})
