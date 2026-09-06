// Selector de cuerdas (EADGBE) y botón para oír el tono de referencia.
export const StringSelector = {
  props: {
    strings: { type: Array, required: true },
    selectedString: { type: Object, required: true },
    isReferencePlaying: { type: Boolean, default: false }
  },
  emits: ['select', 'play-reference'],
  template: `
    <div class="tuner-strings">
      <div class="tuner-strings__head">
        <span>Cuerda</span>
        <span>EADGBE</span>
      </div>
      <div class="tuner-strings__row">
        <button
          v-for="str in strings"
          :key="str.id"
          type="button"
          class="string-key"
          :class="{ 'is-selected': str.id === selectedString.id }"
          @click="$emit('select', str)"
        >
          <span class="string-key__note">{{ str.note }}</span>
          <span class="string-key__label">{{ str.label }}</span>
        </button>
      </div>
      <div class="tuner-strings__ref">
        <button
          type="button"
          class="tuner-btn tuner-btn--ghost"
          :class="{ 'is-playing': isReferencePlaying }"
          @click="$emit('play-reference')"
        >
          <i class="bi" :class="isReferencePlaying ? 'bi-stop-fill' : 'bi-volume-up-fill'"></i>
          {{ isReferencePlaying ? 'Reproduciendo' : 'Oír tono de ' + selectedString.note }}
        </button>
      </div>
    </div>
  `
};