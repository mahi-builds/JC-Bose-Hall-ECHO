/**
 * Premium Acoustic Classical Music Client
 * Replaces the digital synthesizer with a beautiful, high-fidelity Steinway grand piano
 * recording of Bach's Prelude in C Major (BWV 846) played by Kimiko Ishizaka (Public Domain CC0).
 * Exposes the identical API interface for seamless integration.
 */

class PlantSynth {
  constructor() {
    this.audio = null;
    this.isPlaying = false;
    this.volume = 0.5; // default volume
    this.fadeTimer = null;
  }

  init() {
    if (this.audio) return;
    
    this.audio = new Audio("assets/bach_prelude.mp3");
    this.audio.loop = true;
    this.audio.volume = this.volume * 0.35; // keep it soft by default
    
    console.log("Acoustic classical background music client initialized.");
  }

  playDrone() {
    this.init();
    if (!this.audio) return;
    
    if (this.isPlaying) return;
    this.isPlaying = true;
    
    // Clear any active fade actions
    if (this.fadeTimer) clearInterval(this.fadeTimer);
    
    this.audio.play()
      .then(() => {
        console.log("Classical piano background music started.");
        
        // Smoothly fade in volume over 1 second
        let targetVol = this.volume * 0.35;
        this.audio.volume = 0;
        
        let steps = 0;
        this.fadeTimer = setInterval(() => {
          steps++;
          this.audio.volume = (steps / 20) * targetVol;
          if (steps >= 20) {
            this.audio.volume = targetVol;
            clearInterval(this.fadeTimer);
          }
        }, 50);
      })
      .catch(err => {
        console.warn("Autoplay block deferred background music playback", err);
        this.isPlaying = false;
      });
  }

  stop() {
    if (!this.isPlaying || !this.audio) return;
    this.isPlaying = false;
    
    if (this.fadeTimer) clearInterval(this.fadeTimer);
    
    // Smoothly fade out volume over 800ms, then pause
    let startVol = this.audio.volume;
    let steps = 0;
    
    this.fadeTimer = setInterval(() => {
      steps++;
      this.audio.volume = Math.max(0, startVol - (steps / 15) * startVol);
      if (steps >= 15) {
        this.audio.volume = 0;
        this.audio.pause();
        clearInterval(this.fadeTimer);
        console.log("Classical piano background music paused.");
      }
    }, 50);
  }

  setVolume(val) {
    this.volume = val;
    if (this.audio) {
      // Scale to prevent piano from being too loud
      this.audio.volume = val * 0.35;
    }
  }
}

// Instantiate and expose globally
window.plantSynth = new PlantSynth();
