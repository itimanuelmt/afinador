// Se ejecuta antes de cargar cualquier módulo de prueba (--import).
// Evita los warnings en desarrollo de Vue al usar useTuner fuera de un componente.
process.env.NODE_ENV = 'production';