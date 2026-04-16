import { useGameStore } from '@/stores/useGameStore'
import { useStationStore } from '@/stores/useStationStore'
import { useMissionStore } from '@/stores/useMissionStore'
import { useTrainingStore } from '@/stores/useTrainingStore'
import { useBaseStore } from '@/stores/useBaseStore'
import { useContractStore } from '@/stores/useContractStore'
import { useResourceStore } from '@/stores/useResourceStore'
import { useFleetStore } from '@/stores/useFleetStore'
import { usePersonnelStore } from '@/stores/usePersonnelStore'
import { useResearchStore } from '@/stores/useResearchStore'
import { useSatelliteStore } from '@/stores/useSatelliteStore'
import { useSolarSystemStore } from '@/stores/useSolarSystemStore'
import { useEventStore } from '@/stores/useEventStore'
import { useLogStore } from '@/stores/useLogStore'

/**
 * Bootstraps all stores so that their EventBus listeners are registered
 * and their persisted state is loaded into memory before the game loop starts.
 */
export function initAllStores() {
  console.log('[Engine] Bootstrapping stores...')
  useResourceStore()
  usePersonnelStore()
  useFleetStore()
  useResearchStore()
  useSatelliteStore()
  useSolarSystemStore()
  useContractStore()
    useBaseStore()
    useStationStore()
    
    // Stores with explicit listeners
    const missionStore = useMissionStore()
    missionStore.setupListeners()
    
    const trainingStore = useTrainingStore()
    trainingStore.setupListeners()
    
    const contractStore = useContractStore()
    contractStore.setupListeners()
    
    const eventStore = useEventStore()
    eventStore.setupListeners()

    const logStore = useLogStore()
    logStore.setupListeners()
  
  const gameStore = useGameStore()
  
  // Appliquer le temps hors ligne une fois que tous les stores sont chargés
  gameStore.initOfflineProgress()
}
