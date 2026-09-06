import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { compile } from '@vue/compiler-dom';
import { App } from '../js/components/App.js';
import { FrequencyDisplay } from '../js/components/FrequencyDisplay.js';
import { TuningMeter } from '../js/components/TuningMeter.js';
import { StringSelector } from '../js/components/StringSelector.js';

const root = dirname(fileURLToPath(import.meta.url)) + '/..';
const components = [App, FrequencyDisplay, TuningMeter, StringSelector];

test('todos los templates de componentes compilan sin errores', () => {
  for (const component of components) {
    const { errors = [] } = compile(component.template);
    assert.deepEqual(errors, [], `error compilando template de ${component.name || 'componente'}`);
  }
});

test('los componentes declaran sus propios props y eventos', () => {
  assert.ok(FrequencyDisplay.props.frequency.required);
  assert.ok(StringSelector.emits.includes('select'));
  assert.ok(StringSelector.emits.includes('play-reference'));
  assert.ok(App.components.StringSelector);
  assert.ok(App.components.TuningMeter);
  assert.ok(App.components.FrequencyDisplay);
});

test('App expone el estado necesario del composable en su setup', () => {
  const setup = App.setup.bind({});
  const result = setup();
  for (const key of ['isListening', 'frequency', 'cents', 'isInTune', 'strings', 'selectedString', 'toggle', 'selectString', 'playReference']) {
    assert.ok(key in result, `falta ${key} en el retorno del setup`);
  }
});

test('todos los archivos del app shell existen en disco', () => {
  const sw = readFileSync(join(root, 'sw.js'), 'utf8');
  const paths = [...sw.matchAll(/'\.\/([^']+)'/g)].map((m) => m[1]);
  assert.ok(paths.length >= 8, `solo ${paths.length} rutas en APP_SHELL`);
  for (const p of paths) {
    assert.ok(existsSync(join(root, p)), `falta archivo ./${p}`);
  }
});

test('manifest.webmanifest es JSON válido y con metadatos PWA', () => {
  const manifest = JSON.parse(readFileSync(join(root, 'manifest.webmanifest'), 'utf8'));
  assert.equal(manifest.display, 'standalone');
  assert.ok(manifest.name);
  assert.ok(manifest.short_name);
  assert.ok(manifest.icons.length >= 1);
  assert.ok(manifest.start_url);
});