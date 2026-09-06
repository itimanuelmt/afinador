import { test } from 'node:test';
import assert from 'node:assert/strict';
import { STANDARD_TUNING, NOTE_NAMES, A4_FREQUENCY } from '../js/config/tuning.js';

test('la afinación estándar tiene las 6 cuerdas en orden EADGBE', () => {
  assert.equal(STANDARD_TUNING.length, 6);
  assert.deepEqual(
    STANDARD_TUNING.map((s) => s.note),
    ['E', 'A', 'D', 'G', 'B', 'E']
  );
});

test('la afinación va de grave a agudo (E2 → E4)', () => {
  for (let i = 1; i < STANDARD_TUNING.length; i++) {
    assert.ok(
      STANDARD_TUNING[i].frequency > STANDARD_TUNING[i - 1].frequency,
      `frecuencia ${i} debe ser mayor`
    );
  }
  assert.equal(STANDARD_TUNING[0].note, 'E');
  assert.equal(STANDARD_TUNING[0].octave, 2);
  assert.equal(STANDARD_TUNING[5].note, 'E');
  assert.equal(STANDARD_TUNING[5].octave, 4);
});

test('las frecuencias de cada cuerda coinciden con las de referencia (EADGBE)', () => {
  const expected = [82.41, 110.0, 146.83, 196.0, 246.94, 329.63];
  STANDARD_TUNING.forEach((s, i) => {
    assert.ok(
      Math.abs(s.frequency - expected[i]) < 0.01,
      `cuerda ${s.label}: esperado ~${expected[i]}, obtenido ${s.frequency}`
    );
  });
});

test('cada cuerda tiene un id, etiqueta, nota, octava y frecuencia únicos', () => {
  const ids = STANDARD_TUNING.map((s) => s.id);
  assert.equal(new Set(ids).size, ids.length);
  STANDARD_TUNING.forEach((s) => {
    assert.ok(s.label);
    assert.ok(s.octave >= 0);
    assert.ok(s.frequency > 0);
  });
});

test('A4 base y nombres de notas válidos', () => {
  assert.equal(A4_FREQUENCY, 440);
  assert.equal(NOTE_NAMES.length, 12);
  assert.deepEqual(NOTE_NAMES, ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']);
});