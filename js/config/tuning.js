// Fuente única de verdad para la afinación estándar de guitarra acústica (EADGBE).
// Frecuencias calculadas sobre A4 = 440 Hz (temperamento igual).
export const A4_FREQUENCY = 440;

export const STANDARD_TUNING = [
  { id: 'E6', label: 'Mi (6ª)', note: 'E', octave: 2, frequency: 82.41 },
  { id: 'A5', label: 'La (5ª)', note: 'A', octave: 2, frequency: 110.0 },
  { id: 'D4', label: 'Re (4ª)', note: 'D', octave: 3, frequency: 146.83 },
  { id: 'G3', label: 'Sol (3ª)', note: 'G', octave: 3, frequency: 196.0 },
  { id: 'B2', label: 'Si (2ª)', note: 'B', octave: 3, frequency: 246.94 },
  { id: 'E1', label: 'Mi (1ª)', note: 'E', octave: 4, frequency: 329.63 }
];

export const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
