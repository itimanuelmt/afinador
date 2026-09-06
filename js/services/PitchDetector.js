// Responsabilidad única: estimar la frecuencia fundamental de una señal
// mediante YIN (función de diferencia normalizada acumulada), robusta para
// ondas puras y sonidos de guitarra (evita elegir armónicos).
export class PitchDetector {
  constructor({ minFrequency = 60, maxFrequency = 1000, rmsThreshold = 0.01, yinThreshold = 0.15 } = {}) {
    this.minFrequency = minFrequency;
    this.maxFrequency = maxFrequency;
    this.rmsThreshold = rmsThreshold;
    this.yinThreshold = yinThreshold;
  }

  // Devuelve la frecuencia en Hz o null si no hay señal periódica suficiente.
  detect(buffer, sampleRate) {
    if (!buffer || buffer.length === 0) return null;
    if (this._rms(buffer) < this.rmsThreshold) return null;

    const border = Math.min(buffer.length, 2048);
    const maxLag = Math.min(Math.floor(sampleRate / this.minFrequency), Math.max(1, border - 1));
    const minLag = Math.max(2, Math.floor(sampleRate / this.maxFrequency));
    if (minLag >= maxLag) return null;

    const tau = this._findPeriod(buffer, border, minLag, maxLag);
    if (tau < 0) return null;

    return sampleRate / tau;
  }

  _rms(buffer) {
    let sum = 0;
    for (let i = 0; i < buffer.length; i++) {
      sum += buffer[i] * buffer[i];
    }
    return Math.sqrt(sum / buffer.length);
  }

  // Diferencia acumulada normalizada (CMNDF) → primer periodo válido.
  _findPeriod(buffer, border, minLag, maxLag) {
    const diff = this._differenceFunction(buffer, border, maxLag);
    const cmndf = this._cumulativeMeanNormalized(diff, minLag, maxLag);

    let tau = -1;
    for (let t = minLag; t <= maxLag; t++) {
      if (cmndf[t] < this.yinThreshold) {
        tau = t;
        break;
      }
    }
    if (tau < 0) return -1;

    const localMinimum = this._localMinimum(cmndf, tau, maxLag);
    return this._parabolicRefine(cmndf, localMinimum);
  }

  _differenceFunction(buffer, border, maxLag) {
    const diff = new Float32Array(maxLag + 1);
    for (let t = 1; t <= maxLag; t++) {
      let sum = 0;
      for (let i = 0; i < border - t; i++) {
        const delta = buffer[i] - buffer[i + t];
        sum += delta * delta;
      }
      diff[t] = sum;
    }
    return diff;
  }

  // d'(t) = d(t)·t / Σ_{k≤t} d(k): penaliza periodos cortos (evita armónicos).
  _cumulativeMeanNormalized(diff, minLag, maxLag) {
    const cmndf = new Float32Array(maxLag + 1);
    let runningSum = 0;
    for (let t = minLag; t <= maxLag; t++) {
      runningSum += diff[t];
      cmndf[t] = runningSum === 0 ? Number.POSITIVE_INFINITY : (diff[t] * t) / runningSum;
    }
    return cmndf;
  }

  _localMinimum(cmndf, start, maxLag) {
    let minimum = start;
    for (let k = start + 1; k <= maxLag; k++) {
      if (cmndf[k] < cmndf[minimum]) {
        minimum = k;
      } else {
        break;
      }
    }
    return minimum;
  }

  // Interpolación parabólica sobre los tres lags vecinos al mínimo.
  _parabolicRefine(values, lag) {
    if (lag <= 1 || lag + 1 >= values.length) return lag;
    const y1 = values[lag - 1];
    const y0 = values[lag];
    const y2 = values[lag + 1];
    const denom = y1 - 2 * y0 + y2;
    if (Math.abs(denom) < 1e-12) return lag;
    return lag + (0.5 * (y1 - y2)) / denom;
  }
}