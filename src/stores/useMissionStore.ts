import { defineStore } from 'pinia';
import { useResourceStore } from './useResourceStore';

export interface Mission {
  id: number;
  name: string;
  cost: { argent: number; carburant: number };
  successChance: number;
  reward: { science: number };
  status: string;
}

export interface MissionLog {
  temps: string;
  message: string;
}

export const useMissionStore = defineStore('mission', {
  state: () => ({
    missions: [
      {
        id: 1,
        name: "Lancer un satellite météo",
        cost: { argent: 100, carburant: 20 },
        successChance: 0.70, // 70% de chance de succès
        reward: { science: 50 },
        status: "Disponible"
      },
      {
        id: 2,
        name: "Sonde vers la Lune",
        cost: { argent: 500, carburant: 150 },
        successChance: 0.40, // 40% de chance de succès
        reward: { science: 300 },
        status: "Disponible"
      }
    ] as Mission[],
    logs: [] as MissionLog[] // Historique des missions
  }),
  actions: {
    launchMission(missionId: number) {
      const resourceStore = useResourceStore();
      const mission = this.missions.find(m => m.id === missionId);
      
      if (!mission) return;

      // Vérifier si le joueur a assez de ressources
      if (resourceStore.argent >= mission.cost.argent && 
          resourceStore.carburant >= mission.cost.carburant) {
        
        // Consommer les ressources
        resourceStore.addArgent(-mission.cost.argent);
        resourceStore.addCarburant(-mission.cost.carburant);

        // Calculer la réussite avec la probabilité
        const roll = Math.random();
        const isSuccess = roll <= mission.successChance;

        if (isSuccess) {
          mission.status = "Succès";
          resourceStore.addScience(mission.reward.science);
          this.log(`[SUCCÈS] Mission "${mission.name}" a réussi ! Récompense: +${mission.reward.science} Science.`);
        } else {
          mission.status = "Échec";
          this.log(`[ÉCHEC] Mission "${mission.name}" a échoué... Pensez à améliorer vos lanceurs.`);
        }
      } else {
         this.log(`[ERREUR] Pas assez de ressources pour "${mission.name}".`);
      }
    },
    
    log(message: string) {
      // On garde max 10 logs
      this.logs.unshift({ temps: new Date().toLocaleTimeString(), message });
      if (this.logs.length > 10) this.logs.pop();
    }
  }
});
