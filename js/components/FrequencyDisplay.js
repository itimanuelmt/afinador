// Muestra la frecuencia detectada y la nota musical más cercana.
export const FrequencyDisplay = {
  props: {
    frequency: { type: Number, required: true },
    detectedNote: { type: Object, default: null },
    isInTune: { type: Boolean, required: true }
  },
  template: `
    <div class="tuner-readout">
      <div
        class="tuner-readout__note"
        :class="detectedNote ? (isInTune ? 'is-true' : 'is-near') : ''"
      >
        {{ detectedNote ? detectedNote.note + detectedNote.octave : '--' }}
      </div>
      <div class="tuner-readout__freq">
        {{ frequency > 0 ? frequency.toFixed(1) : '0.0' }}
        <small>Hz</small>
      </div>
      <div
        class="tuner-state"
        :class="detectedNote ? (isInTune ? 'is-true' : 'is-near') : ''"
      >
        {{ detectedNote ? (isInTune ? 'En tono' : (detectedNote.cents > 0 ? 'Agudo' : 'Grave')) : 'Esperando señal' }}
      </div>
    </div>
  `
};