// Selector de cuerdas (EADGBE) y botón para oír el tono de referencia.
export const StringSelector = {
  props: {
    strings: { type: Array, required: true },
    selectedString: { type: Object, required: true },
    isReferencePlaying: { type: Boolean, default: false }
  },
  emits: ['select', 'play-reference'],
  template: `
    <div>
      <div class="d-flex flex-wrap justify-content-center gap-2 mb-3">
        <button
          v-for="str in strings"
          :key="str.id"
          type="button"
          class="btn string-btn"
          :class="str.id === selectedString.id ? 'btn-success' : 'btn-outline-secondary'"
          @click="$emit('select', str)"
        >
          {{ str.label }}
        </button>
      </div>
      <div class="d-grid">
        <button
          type="button"
          class="btn"
          :class="isReferencePlaying ? 'btn-warning' : 'btn-outline-light'"
          @click="$emit('play-reference')"
        >
          <i class="bi" :class="isReferencePlaying ? 'bi-stop-fill' : 'bi-volume-up-fill'"></i>
          {{ isReferencePlaying ? 'Reproduciendo…' : 'Oír tono de ' + selectedString.note }}
        </button>
      </div>
    </div>
  `
};
