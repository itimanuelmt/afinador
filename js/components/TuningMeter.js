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
    hasSignal() {
      return this.cents !== 0;
    },
    statusText() {
      if (this.cents === 0) return 'Toca una cuerda';
      if (this.isInTune) return 'En tono';
      return this.cents > 0 ? 'Agudo &middot; afloja la cuerda' : 'Grave &middot; tensa la cuerda';
    }
  },
  template: `
    <div class="tuner-meter" :class="isInTune && hasSignal ? 'is-true' : ''">
      <div class="tuner-meter__scale">
        <div class="tuner-meter__ticks"></div>
        <div class="tuner-meter__center"></div>
        <div class="tuner-meter__needle" :style="{ left: needlePosition + '%' }"></div>
      </div>
      <div class="tuner-meter__labels">
        <span>Grave</span>
        <span>0&cent;</span>
        <span>Agudo</span>
      </div>
      <p class="tuner-meter__status" :class="isInTune && hasSignal ? 'is-true' : ''">
        {{ statusText }}
      </p>
    </div>
  `
};