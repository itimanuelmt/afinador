import { A4_FREQUENCY, NOTE_NAMES } from '../config/tuning.js';

// Responsabilidad única: convertir frecuencias en notas musicales y
// calcular la desviación en cents (temperamento igual, A4 = 440 Hz).
export class NoteCalculator {
  // A partir de una frecuencia devuelve la nota más cercana y su desviación.
  noteFromFrequency(frequency) {
    if (!frequency || frequency <= 0) return null;

    const midiNumber = 12 * Math.log2(frequency / A4_FREQUENCY) + 69;
    const nearestMidi = Math.round(midiNumber);
    const targetFrequency = this.frequencyFromMidi(nearestMidi);
    const cents = Math.round(1200 * Math.log2(frequency / targetFrequency));

    const nameIndex = ((nearestMidi % 12) + 12) % 12;
    const octave = Math.floor(nearestMidi / 12) - 1;

    return {
      note: NOTE_NAMES[nameIndex],
      octave,
      targetFrequency,
      cents
    };
  }

  frequencyFromMidi(midi) {
    return A4_FREQUENCY * Math.pow(2, (midi - 69) / 12);
  }
}
