// Responsabilidad única: gestionar la captura de audio del micrófono
// y exponer los datos de la onda (time domain) para su análisis.
export class AudioCaptureService {
  constructor({ fftSize = 2048 } = {}) {
    this.fftSize = fftSize;
    this.audioContext = null;
    this.analyser = null;
    this.stream = null;
    this.source = null;
    this.buffer = null;
  }

  async start() {
    if (this.audioContext) return;

    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false }
    });

    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    this.audioContext = new AudioCtx();
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }

    this.source = this.audioContext.createMediaStreamSource(this.stream);
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = this.fftSize;
    this.source.connect(this.analyser);
    this.buffer = new Float32Array(this.analyser.fftSize);
  }

  getSampleRate() {
    return this.audioContext ? this.audioContext.sampleRate : 0;
  }

  getFloatTimeDomainData() {
    if (!this.analyser) return null;
    this.analyser.getFloatTimeDomainData(this.buffer);
    return this.buffer;
  }

  stop() {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
    }
    if (this.audioContext) {
      this.audioContext.close();
    }
    this.audioContext = null;
    this.analyser = null;
    this.stream = null;
    this.source = null;
    this.buffer = null;
  }
}
