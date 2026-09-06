import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PitchDetector } from '../js/services/PitchDetector.js';

const detector = new PitchDetector();
const SAMPLE_RATE = 44100;
const BUFFER_SIZE = 4096;

function sine(frameSize, sampleRate, freq, amplitude = 0.5, phase = 0) {
  const buffer = new Float32Array(frameSize);
  for (let i = 0; i < frameSize; i++) {
    buffer[i] = amplitude * Math.sin((2 * Math.PI * freq * i) / sampleRate + phase);
  }
  return buffer;
}

test('silence → null', () => {
  const silence = new Float32Array(BUFFER_SIZE);
  assert.equal(detector.detect(silence, SAMPLE_RATE), null);
});

test('señal con amplitud casi nula → null', () => {
  const quiet = sine(BUFFER_SIZE, SAMPLE_RATE, 110, 0.0001);
  assert.equal(detector.detect(quiet, SAMPLE_RATE), null);
});

for (const [label, freq] of [
  ['E2', 82.41],
  ['A2', 110.0],
  ['D3', 146.83],
  ['G3', 196.0],
  ['B3', 246.94],
  ['E4', 329.63]
]) {
  test(`detecta ${label} (${freq} Hz) en una sinusoide`, () => {
    const result = detector.detect(sine(BUFFER_SIZE, SAMPLE_RATE, freq), SAMPLE_RATE);
    assert.ok(result !== null, `no detectado para ${freq}`);
    assert.ok(
      Math.abs(result - freq) < 0.5,
      `esperado ~${freq}, obtenido ${result}`
    );
  });
}

test('detección estable frente a distintas fases', () => {
  const g3 = 196.0;
  for (const phase of [0, Math.PI / 3, Math.PI / 2, Math.PI]) {
    const result = detector.detect(sine(BUFFER_SIZE, SAMPLE_RATE, g3, 0.5, phase), SAMPLE_RATE);
    assert.ok(Math.abs(result - g3) < 0.5, `fase ${phase}: ${result}`);
  }
});

function harmonicSignal(f0, sampleRate, frameSize) {
  const buffer = new Float32Array(frameSize);
  for (let i = 0; i < frameSize; i++) {
    buffer[i] =
      0.6 * Math.sin((2 * Math.PI * f0 * i) / sampleRate) +
      0.25 * Math.sin((2 * Math.PI * 2 * f0 * i) / sampleRate) +
      0.1 * Math.sin((2 * Math.PI * 3 * f0 * i) / sampleRate);
  }
  return buffer;
}

test('detecta la fundamental en una señal con armónicos (tipo guitarra)', () => {
  const f0 = 110;
  const result = detector.detect(harmonicSignal(f0, SAMPLE_RATE, BUFFER_SIZE), SAMPLE_RATE);
  assert.ok(result !== null);
  assert.ok(Math.abs(result - f0) < 1, `esperado ~${f0}, obtenido ${result}`);
});

test('ruido aleatorio (sin periodicidad) se rechaza', () => {
  const noise = new Float32Array(BUFFER_SIZE);
  let seed = 12345;
  for (let i = 0; i < BUFFER_SIZE; i++) {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    noise[i] = (seed / 4294967296) * 2 - 1;
  }
  assert.equal(detector.detect(noise, SAMPLE_RATE), null);
});