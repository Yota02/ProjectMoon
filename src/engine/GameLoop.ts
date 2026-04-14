export class GameLoop {
  tickRate: number;
  lastTime: number;
  timerId: number | null;
  callbacks: Array<(deltaTime: number) => void>;

  constructor(tickRate = 1000) {
    this.tickRate = tickRate; // en millisecondes
    this.lastTime = 0;
    this.timerId = null;
    this.callbacks = [];
  }

  // Ajoute une fonction à exécuter à chaque tick
  addTickHandler(callback: (deltaTime: number) => void) {
    this.callbacks.push(callback);
  }

  start() {
    if (this.timerId !== null) return; // Déjà démarré
    this.lastTime = performance.now();
    this.loop();
  }

  stop() {
    if (this.timerId !== null) {
      cancelAnimationFrame(this.timerId);
      this.timerId = null;
    }
  }

  loop() {
    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastTime;

    // Si le temps écoulé dépasse notre tickRate, on exécute les calculs (le "tick")
    if (deltaTime >= this.tickRate) {
      // On passe le deltaTime au cas où on voudrait calculer des productions hors-ligne ou des rattrapages de temps
      this.callbacks.forEach(cb => cb(deltaTime));
      
      // On met à jour la référence de temps.
      this.lastTime = currentTime - (deltaTime % this.tickRate);
    }

    this.timerId = requestAnimationFrame(() => this.loop());
  }
}

// Instance globale prête à l'emploi
export const gameLoop = new GameLoop(1000); // 1 tick = 1 seconde
