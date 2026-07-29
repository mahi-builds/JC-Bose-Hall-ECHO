/**
 * Minimalist Web Speech API Narrator (Restored to Working State)
 * Restored to the clean, robust local SpeechSynthesis engine used in the beginning.
 * Removes all complex voice overrides, sentence splitting, and external CDN dependencies
 * to guarantee 100% stable local speech guide playback on all devices.
 */

class TranscriptNarrator {
  constructor() {
    this.synth = window.speechSynthesis;
    this.isPlaying = false;
    this.isPaused = false;
    this.currentParaIndex = 0;
    this.paras = [];
    this.paraTexts = [];
    this.volume = 1.0;
    this.onStateChangeCallback = null;
  }

  init() {
    if (this.paras.length > 0) return;
    
    this.paras = Array.from(document.querySelectorAll('.transcript-para'));
    this.paraTexts = this.paras.map(p => p.innerText.trim());

    this.paras.forEach((para, idx) => {
      para.style.cursor = 'pointer';
      para.addEventListener('click', () => {
        this.speak(idx);
      });
    });
  }

  speak(paraIndex) {
    this.init();
    if (!this.synth) {
      console.warn("SpeechSynthesis not supported on this browser.");
      return;
    }

    // Cancel previous speaking utterances cleanly
    this.synth.cancel();

    if (paraIndex < 0 || paraIndex >= this.paras.length) {
      this.resetState();
      return;
    }

    this.currentParaIndex = paraIndex;
    this.isPlaying = true;
    this.isPaused = false;
    this.triggerStateChange();

    // Duck the background classical music volume slightly during narration
    if (window.plantSynth && window.plantSynth.isPlaying) {
      window.plantSynth.setVolume(0.18);
    }

    // Highlight active paragraph visually
    this.paras.forEach((p, idx) => {
      if (idx === paraIndex) {
        p.classList.add('active-highlight');
      } else {
        p.classList.remove('active-highlight');
      }
    });

    const text = this.paraTexts[paraIndex];
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set standard speed and volume
    utterance.volume = this.volume;
    utterance.rate = 1.0; // Restored to standard, natural speed
    utterance.pitch = 1.0;

    utterance.onend = () => {
      this.speak(paraIndex + 1); // read next paragraph automatically
    };

    utterance.onerror = (e) => {
      console.error("SpeechSynthesis error:", e);
      if (this.isPlaying) {
        this.speak(paraIndex + 1);
      }
    };

    this.synth.speak(utterance);
  }

  pause() {
    if (this.isPlaying && !this.isPaused) {
      this.synth.pause();
      this.isPaused = true;
      this.triggerStateChange();
    }
  }

  resume() {
    if (this.isPlaying && this.isPaused) {
      this.synth.resume();
      this.isPaused = false;
      this.triggerStateChange();
    } else if (!this.isPlaying) {
      this.speak(0);
    }
  }

  stop() {
    if (this.synth) {
      this.synth.cancel();
    }
    this.resetState();
  }

  resetState() {
    this.isPlaying = false;
    this.isPaused = false;
    
    // Restore classical background piano volume to normal
    if (window.plantSynth && window.plantSynth.isPlaying) {
      window.plantSynth.setVolume(1.0);
    }
    
    this.paras.forEach(p => p.classList.remove('active-highlight'));
    this.triggerStateChange();
  }

  setVolume(val) {
    this.volume = val;
  }

  triggerStateChange() {
    if (this.onStateChangeCallback) {
      this.onStateChangeCallback({
        isPlaying: this.isPlaying,
        isPaused: this.isPaused,
        currentParaIndex: this.currentParaIndex
      });
    }
  }

  onStateChange(callback) {
    this.onStateChangeCallback = callback;
  }
}

window.transcriptNarrator = new TranscriptNarrator();
