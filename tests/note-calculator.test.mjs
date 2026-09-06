import { test } from 'node:test';
import assert from 'node:assert/strict';
import { NoteCalculator } from '../js/services/NoteCalculator.js';

const calculator = new NoteCalculator();

test('A4 (440 Hz) se detecta como A4 en tono (0 cents)', () => {
  const result = calculator.noteFromFrequency(440);
  assert.deepEqual([result.note, result.octave, result.cents], ['A', 4, 0]);
  assert.equal(result.targetFrequency, 440);
});

test('las 6 cuerdas EADGBE se detectan en tono', () => {
  const expected = [
    { note: 'E', octave: 2 },
    { note: 'A', octave: 2 },
    { note: 'D', octave: 3 },
    { note: 'G', octave: 3 },
    { note: 'B', octave: 3 },
    { note: 'E', octave: 4 }
  ];
  const freqs = [82.41, 110.0, 146.83, 196.0, 246.94, 329.63];
  freqs.forEach((freq, i) => {
    const result = calculator.noteFromFrequency(freq);
    assert.deepEqual([result.note, result.octave], [expected[i].note, expected[i].octave], `freq ${freq}`);
    assert.ok(Math.abs(result.cents) <= 1, `freq ${freq}: cents ${result.cents}`);
  });
});

test('frecuencias agudas dan cents positivos y graves negativos', () => {
  const sharp = calculator.noteFromFrequency(331);
  const flat = calculator.noteFromFrequency(328.2);
  assert.equal(sharp.note, 'E');
  assert.equal(flat.note, 'E');
  assert.ok(sharp.cents > 0, `esperado positivo, obtenido ${sharp.cents}`);
  assert.ok(flat.cents < 0, `esperado negativo, obtenido ${flat.cents}`);
});

test('la nota de referencia de una cuerda es exactamente su nota', () => {
  const e4 = calculator.noteFromFrequency(329.63);
  assert.equal(e4.note, 'E');
  assert.equal(e4.octave, 4);
  assert.equal(e4.cents, 0);
});

test('entradas inválidas devuelven null', () => {
  assert.equal(calculator.noteFromFrequency(0), null);
  assert.equal(calculator.noteFromFrequency(-5), null);
  assert.equal(calculator.noteFromFrequency(null), null);
  assert.equal(calculator.noteFromFrequency(undefined), null);
});

test('frecuenciaFromMidi es consistente (redonda en A4)', () => {
  const f = calculator.frequencyFromMidi(69);
  assert.ok(Math.abs(f - 440) < 0.001);
});

test('coherencia ida y vuelta: frecuencia → nota → frecuencia objetivo', () => {
  for (let midi = 40; midi <= 88; midi++) {
    const freq = calculator.frequencyFromMidi(midi);
    const note = calculator.noteFromFrequency(freq);
    assert.equal(note.cents, 0, `midi ${midi}`);
  }
});