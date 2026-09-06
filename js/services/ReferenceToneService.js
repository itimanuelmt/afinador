// Responsabilidad única: reproducir un tono de referencia con un
// oscilador y una envolvente suave (evita clicks al iniciar/terminar).
export class ReferenceToneService {
  constructor() {
    this.audioContext = null;
    this.oscillator = null;
    this.gainNode = null;
  }

  play(frequency, { duration = 2, type = 'sine', volume = 0.2 } = {}) {
    this.stop();

    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    this.audioContext = new AudioCtx();
    this.oscillator = this.audioContext.createOscillator();
    this.gainNode = this.audioContext.createGain();

    const now = this.audioContext.currentTime;
    this.gainNode.gain.setValueAtTime(0, now);
    this.gainNode.gain.linearRampToValueAtTime(volume, now + 0.02);
    this.gainNode.gain.setValueAtTime(volume, now + duration - 0.05);
    this.gainNode.gain.linearRampToValueAtTime(0, now + duration);

    this.oscillator.type = type;
    this.oscillator.frequency.value = frequency;
    this.oscillator.connect(this.gainNode).connect(this.audioContext.destination);

    this.oscillator.start(now);
    this.oscillator.stop(now + duration);
    this.oscillator.onended = () => this._cleanup();
  }

  stop() {
    if (this.oscillator) {
      try {
        this.oscillator.stop();
      } catch (e) {
        /* ya detenido */
      }
      this._cleanup();
    }
  }

  _cleanup() {
    if (this.audioContext) {
      this.audioContext.close();
    }
    this.audioContext = null;
    this.oscillator = null;
    this.gainNode = null;
  }
}
