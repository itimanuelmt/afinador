// Muestra la frecuencia detectada y la nota musical más cercana.
export const FrequencyDisplay = {
  props: {
    frequency: { type: Number, required: true },
    detectedNote: { type: Object, default: null },
    isInTune: { type: Boolean, required: true }
  },
  template: `
    <div class="text-center py-3">
      <div
        class="note-badge"
        :class="detectedNote ? (isInTune ? 'text-success' : 'text-warning') : 'text-secondary'"
      >
        {{ detectedNote ? detectedNote.note + detectedNote.octave : '--' }}
      </div>
      <div class="freq-value display-6 mt-1">
        {{ frequency > 0 ? frequency.toFixed(1) : '0.0' }}
        <small class="text-muted fs-6">Hz</small>
      </div>
      <div
        class="badge mt-2"
        :class="detectedNote ? (isInTune ? 'text-bg-success' : 'text-bg-warning') : 'text-bg-secondary'"
      >
        {{ detectedNote ? (isInTune ? 'En tono' : (detectedNote.cents > 0 ? 'Agudo' : 'Grave')) : 'Esperando señal' }}
      </div>
    </div>
  `
};
