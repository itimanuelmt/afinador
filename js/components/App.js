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
    <div class="tuner-shell d-flex flex-column flex-grow-1">
      <header class="tuner-header">
        <div class="tuner-header__mark">
          <span class="tuner-header__index">AFN-01</span>
          <h1 class="tuner-header__title">Afinador</h1>
        </div>
        <p class="tuner-header__sub">Guitarra acústica &middot; afinación estándar EADGBE</p>
      </header>

      <main class="tuner-panel d-flex flex-column flex-grow-1">
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

        <div class="tuner-action">
          <button
            type="button"
            class="tuner-btn tuner-btn--accent"
            :class="{ 'is-listening': isListening }"
            @click="toggle"
          >
            <i class="bi" :class="isListening ? 'bi-stop-fill' : 'bi-mic-fill'"></i>
            <span>{{ isListening ? 'Detener' : 'Iniciar micrófono' }}</span>
          </button>
        </div>

        <p v-if="error" class="tuner-error">
          <i class="bi bi-exclamation-triangle-fill"></i> {{ error }}
        </p>
        <p v-else class="tuner-hint">Coloca el instrumento cerca del micrófono y pulsa una cuerda</p>
      </main>

      <footer class="tuner-status">
        <span class="tuner-led" :class="isListening ? 'is-live' : ''"></span>
        <span>{{ isListening ? 'Escuchando' : 'Inactivo' }}</span>
      </footer>
    </div>
  `
};
