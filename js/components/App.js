import { useTuner } from '../composables/useTuner.js';
import { FrequencyDisplay } from './FrequencyDisplay.js';
import { TuningMeter } from './TuningMeter.js';
import { StringSelector } from './StringSelector.js';

export const App = {
  components: { FrequencyDisplay, TuningMeter, StringSelector },
  setup() {
    const tuner = useTuner();
    return { ...tuner };
  },
  template: `
    <div class="tuner-shell d-flex flex-column flex-grow-1 p-3">
      <header class="text-center mb-4">
        <h1 class="h4 fw-bold text-light mb-1">
          <i class="bi bi-music-note-beamed text-success"></i> Afinador de Guitarra
        </h1>
        <p class="text-secondary small mb-0">Afinación estándar acústica (EADGBE)</p>
      </header>

      <main class="bg-dark rounded-4 shadow p-3 p-md-4 flex-grow-1 d-flex flex-column gap-4">
        <FrequencyDisplay
          :frequency="frequency"
          :detected-note="detectedNote"
          :is-in-tune="isInTune"
        />

        <TuningMeter :cents="cents" :is-in-tune="isInTune" />

        <StringSelector
          :strings="strings"
          :selected-string="selectedString"
          :is-reference-playing="isReferencePlaying"
          @select="selectString"
          @play-reference="playReference"
        />

        <div class="d-grid mt-auto">
          <button
            type="button"
            class="btn btn-lg"
            :class="isListening ? 'btn-danger' : 'btn-success'"
            @click="toggle"
          >
            <i class="bi" :class="isListening ? 'bi-stop-fill' : 'bi-mic-fill'"></i>
            {{ isListening ? 'Detener' : 'Iniciar micrófono' }}
          </button>
        </div>

        <p v-if="error" class="alert alert-danger small text-center mb-0 py-2">
          <i class="bi bi-exclamation-triangle-fill"></i> {{ error }}
        </p>
      </main>

      <footer class="text-center text-secondary small mt-3">
        <span class="status-dot" :class="isListening ? 'bg-success' : 'bg-secondary'"></span>
        {{ isListening ? 'Escuchando' : 'Inactivo' }}
      </footer>
    </div>
  `
};
