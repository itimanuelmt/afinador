// Medidor visual de cents: aguja que se desplaza de -50 (grave) a +50 (agudo).
export const TuningMeter = {
  props: {
    cents: { type: Number, default: 0 },
    isInTune: { type: Boolean, default: false }
  },
  computed: {
    needlePosition() {
      const clamped = Math.max(-50, Math.min(50, this.cents));
      return 50 + (clamped / 50) * 50; // 0%..100%
    },
    statusText() {
      if (this.cents === 0) return 'Toca una cuerda';
      if (this.isInTune) return '¡En tono!';
      return this.cents > 0 ? 'Baja la tensión (agudo)' : 'Sube la tensión (grave)';
    }
  },
  template: `
    <div class="px-2">
      <div class="meter mb-2">
        <div class="meter-center"></div>
        <div class="meter-needle" :style="{ left: needlePosition + '%' }"></div>
      </div>
      <p class="text-center small mb-0" :class="isInTune ? 'text-success' : 'text-body-secondary'">
        {{ statusText }}
      </p>
    </div>
  `
};
