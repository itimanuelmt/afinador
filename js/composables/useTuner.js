import { ref, computed, onUnmounted } from 'vue';
import { STANDARD_TUNING } from '../config/tuning.js';
import { AudioCaptureService } from '../services/AudioCaptureService.js';
import { PitchDetector } from '../services/PitchDetector.js';
import { NoteCalculator } from '../services/NoteCalculator.js';
import { ReferenceToneService } from '../services/ReferenceToneService.js';

// Orquesta los servicios y expone estado reactivo para la UI.
// Recibe las dependencias por inyección (facilita tests y cumple SOLID).
export function useTuner({
  audioCapture = new AudioCaptureService(),
  pitchDetector = new PitchDetector(),
  noteCalculator = new NoteCalculator(),
  referenceTone = new ReferenceToneService()
} = {}) {
  const isListening = ref(false);
  const isReferencePlaying = ref(false);
  const error = ref(null);
  const frequency = ref(0);
  const detectedNote = ref(null);
  const selectedString = ref(STANDARD_TUNING[0]);

  let animationFrameId = null;

  const cents = computed(() => detectedNote.value?.cents ?? 0);
  const isInTune = computed(() => Math.abs(cents.value) <= 5);

  function selectString(stringConfig) {
    selectedString.value = stringConfig;
    if (isReferencePlaying.value) {
      playReference();
    }
  }

  function tick() {
    const buffer = audioCapture.getFloatTimeDomainData();
    if (buffer) {
      const detectedFrequency = pitchDetector.detect(buffer, audioCapture.getSampleRate());
      if (detectedFrequency && detectedFrequency > 30 && detectedFrequency < 1000) {
        frequency.value = detectedFrequency;
        detectedNote.value = noteCalculator.noteFromFrequency(detectedFrequency);
      }
    }
    animationFrameId = requestAnimationFrame(tick);
  }

  async function start() {
    error.value = null;
    try {
      await audioCapture.start();
      isListening.value = true;
      tick();
    } catch (err) {
      error.value =
        err && err.name === 'NotAllowedError'
          ? 'Permiso de micrófono denegado.'
          : 'No se pudo acceder al micrófono.';
    }
  }

  function stop() {
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
    audioCapture.stop();
    isListening.value = false;
    frequency.value = 0;
    detectedNote.value = null;
  }

  function toggle() {
    if (isListening.value) stop();
    else start();
  }

  function playReference() {
    referenceTone.play(selectedString.value.frequency);
    isReferencePlaying.value = true;
    setTimeout(() => {
      isReferencePlaying.value = false;
    }, 2000);
  }

  function stopReference() {
    referenceTone.stop();
    isReferencePlaying.value = false;
  }

  onUnmounted(() => {
    stop();
    stopReference();
  });

  return {
    isListening,
    isReferencePlaying,
    error,
    frequency,
    detectedNote,
    cents,
    isInTune,
    selectedString,
    strings: STANDARD_TUNING,
    start,
    stop,
    toggle,
    selectString,
    playReference,
    stopReference
  };
}
