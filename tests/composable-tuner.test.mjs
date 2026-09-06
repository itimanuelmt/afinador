import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { useTuner } from '../js/composables/useTuner.js';
import { PitchDetector } from '../js/services/PitchDetector.js';
import { NoteCalculator } from '../js/services/NoteCalculator.js';

const SAMPLE_RATE = 44100;
const BUFFER_SIZE = 4096;

function sine(frameSize, sampleRate, freq, amplitude = 0.5) {
  const buffer = new Float32Array(frameSize);
  for (let i = 0; i < frameSize; i++) {
    buffer[i] = amplitude * Math.sin((2 * Math.PI * freq * i) / sampleRate);
  }
  return buffer;
}

function createRealServices() {
  return {
    pitchDetector: new PitchDetector(),
    noteCalculator: new NoteCalculator()
  };
}

let pendingFrame;
function stubAnimationFrame() {
  pendingFrame = null;
  globalThis.requestAnimationFrame = (cb) => {
    pendingFrame = cb;
    return 1;
  };
  globalThis.cancelAnimationFrame = () => {
    pendingFrame = null;
  };
}

function createFakeCapture(sample = null) {
  let currentSample = sample;
  return {
    setSample(s) {
      currentSample = s;
    },
    getFloatTimeDomainData() {
      return currentSample;
    },
    getSampleRate: () => SAMPLE_RATE,
    start: async () => {},
    stop() {}
  };
}

const fakeReferenceTone = () => {
  const played = [];
  return {
    played,
    play(freq) {
      played.push(freq);
    },
    stop() {}
  };
};

beforeEach(() => {
  stubAnimationFrame();
  process.env.NODE_ENV = 'production';
});

test('estado inicial: detenido, sin frecuencia y con la 6ª cuerda seleccionada', () => {
  const tuner = useTuner({
    audioCapture: createFakeCapture(),
    ...createRealServices(),
    referenceTone: fakeReferenceTone()
  });
  assert.equal(tuner.isListening.value, false);
  assert.equal(tuner.frequency.value, 0);
  assert.equal(tuner.detectedNote.value, null);
  assert.equal(tuner.selectedString.value.note, 'E');
  assert.equal(tuner.strings.length, 6);
});

test('oscila entre escuchar y detener', async () => {
  const tuner = useTuner({
    audioCapture: createFakeCapture(),
    ...createRealServices(),
    referenceTone: fakeReferenceTone()
  });
  await tuner.toggle();
  assert.equal(tuner.isListening.value, true);
  tuner.toggle();
  assert.equal(tuner.isListening.value, false);
  assert.equal(tuner.frequency.value, 0);
});

test('la rueda de detección convierte 110 Hz en la nota A2 en tono', async () => {
  const capture = createFakeCapture();
  const tuner = useTuner({
    audioCapture: capture,
    ...createRealServices(),
    referenceTone: fakeReferenceTone()
  });
  await tuner.start();
  capture.setSample(sine(BUFFER_SIZE, SAMPLE_RATE, 110));
  pendingFrame();
  assert.ok(Math.abs(tuner.frequency.value - 110) < 0.5, `freq ${tuner.frequency.value}`);
  assert.equal(tuner.detectedNote.value.note, 'A');
  assert.equal(tuner.detectedNote.value.octave, 2);
  assert.ok(Math.abs(tuner.cents.value) <= 1, `cents ${tuner.cents.value}`);
  tuner.stop();
});

test('detección de la 6ª cuerda grave (82.41 Hz) → E2', async () => {
  const capture = createFakeCapture();
  const tuner = useTuner({ audioCapture: capture, ...createRealServices(), referenceTone: fakeReferenceTone() });
  await tuner.start();
  capture.setSample(sine(BUFFER_SIZE, SAMPLE_RATE, 82.41));
  pendingFrame();
  assert.equal(tuner.detectedNote.value.note, 'E');
  assert.equal(tuner.detectedNote.value.octave, 2);
  tuner.stop();
});

test('ignora señales fuera del rango audible del afinador', async () => {
  const capture = createFakeCapture();
  const tuner = useTuner({ audioCapture: capture, ...createRealServices(), referenceTone: fakeReferenceTone() });
  await tuner.start();
  capture.setSample(sine(BUFFER_SIZE, SAMPLE_RATE, 12));
  pendingFrame();
  assert.equal(tuner.frequency.value, 0);
  assert.equal(tuner.detectedNote.value, null);
  tuner.stop();
});

test('seleccionar cuerda cambia la selección y el tono de referencia', async () => {
  const tone = fakeReferenceTone();
  const tuner = useTuner({ audioCapture: createFakeCapture(), ...createRealServices(), referenceTone: tone });
  tuner.selectString(tuner.strings[1]);
  assert.equal(tuner.selectedString.value.note, 'A');
  assert.equal(tuner.selectedString.value.octave, 2);
  tuner.playReference();
  assert.ok(tone.played.includes(110), `debe tocar 110 Hz, recibió ${tone.played}`);
});

test('playReference marca reproducción activa y la revoca al terminar', async () => {
  const tuner = useTuner({ audioCapture: createFakeCapture(), ...createRealServices(), referenceTone: fakeReferenceTone() });
  tuner.playReference();
  assert.equal(tuner.isReferencePlaying.value, true);
  await new Promise((resolve) => setTimeout(resolve, 2100));
  assert.equal(tuner.isReferencePlaying.value, false);
});

test('permiso denegado → mensaje de error claro', async () => {
  const capture = createFakeCapture();
  capture.start = async () => {
    const err = new Error('denied');
    err.name = 'NotAllowedError';
    throw err;
  };
  const tuner = useTuner({ audioCapture: capture, ...createRealServices(), referenceTone: fakeReferenceTone() });
  await tuner.start();
  assert.equal(tuner.isListening.value, false);
  assert.ok(tuner.error.value.includes('Permiso'), tuner.error.value);
});

test('fallo de hardware de audio → mensaje de error genérico', async () => {
  const capture = createFakeCapture();
  capture.start = async () => {
    throw new Error('audio device gone');
  };
  const tuner = useTuner({ audioCapture: capture, ...createRealServices(), referenceTone: fakeReferenceTone() });
  await tuner.start();
  assert.ok(tuner.error.value.includes('micrófono'), tuner.error.value);
});