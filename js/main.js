import { createApp } from 'https://unpkg.com/vue@3.4.38/dist/vue.esm-browser.prod.js';
import { App } from './components/App.js';

createApp(App).mount('#app');

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {
      /* SW opcional: la app funciona igual sin él */
    });
  });
}
