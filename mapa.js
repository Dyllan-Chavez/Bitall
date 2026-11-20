/* BITALL — Mapa de Inicio (Google Maps JavaScript API)
 * 1. Clave de navegador configurada; restringir HTTP referrers en Google Cloud.
 * 2. Restringe la clave por HTTP referrers y por Maps JavaScript API.
 * 3. Si tienes un Map ID, escribe su identificador en CONFIG.mapId.
 * La clave del navegador es pública: las restricciones se aplican en Cloud Console.
 */
(() => {
  'use strict';

  const CONFIG = {
    apiKey: 'AIzaSyB7gfMzNQ-mZyyrI8jW8HUSJ9ehyuLOX8w', // <-- CONFIGURAR
    mapId: '',                       // Opcional: ID de mapa de Google Cloud
    centro: { lat: 4.861, lng: -74.033 }, // Chía, Cundinamarca
    zoom: 14,
  };

  const panel = document.getElementById('inicio');
  const contenedor = document.getElementById('google-map');
  const estado = document.getElementById('map-status');
  if (!panel || !contenedor) return;

  let mapa = null;
  let inicializacion = null;

  function informar(mensaje) {
    if (!estado) return;
    estado.hidden = false;
    estado.textContent = mensaje;
  }

  /* Bootstrap de carga dinámica recomendado por Google. Se ejecuta UNA sola vez,
   * y descarga la biblioteca 'maps' únicamente cuando se solicita importLibrary. */
  function prepararGoogleMaps() {
    ((g) => {
      let h, a, k;
      const p = 'The Google Maps JavaScript API';
      const c = 'google';
      const l = 'importLibrary';
      const q = '__ib__';
      const m = document;
      const b = window;
      const d = (b[c] = b[c] || {}).maps || ((b[c].maps = {}));
      const r = new Set();
      const e = new URLSearchParams();
      const u = () => h || (h = new Promise(async (f, n) => {
        await (a = m.createElement('script'));
        e.set('libraries', [...r] + '');
        for (k in g) e.set(k.replace(/[A-Z]/g, t => '_' + t[0].toLowerCase()), g[k]);
        e.set('callback', c + '.maps.' + q);
        a.src = `https://maps.${c}apis.com/maps/api/js?` + e;
        d[q] = f;
        a.onerror = () => { h = null; n(new Error(p + ' no pudo cargarse.')); };
        a.nonce = m.querySelector('script[nonce]')?.nonce || '';
        m.head.append(a);
      }));
      if (d[l]) {
        console.warn(p + ' ya está cargada; no se volverá a cargar.');
      } else {
        d[l] = (f, ...n) => r.add(f) && u().then(() => d[l](f, ...n));
      }
    })({ key: CONFIG.apiKey, v: 'weekly', language: 'es', region: 'CO' });
  }

  async function iniciarMapa() {
    if (mapa || inicializacion || getComputedStyle(panel).display === 'none') return;
    if (!CONFIG.apiKey || CONFIG.apiKey.startsWith('COLOCA_AQUI')) {
      informar('Configura tu API Key de Google Maps en mapa.js para mostrar el mapa.');
      return;
    }
    informar('Cargando mapa de Chía…');
    inicializacion = (async () => {
      prepararGoogleMaps();
      const { Map } = await google.maps.importLibrary('maps');
      // Ningún marcador, ruta, Places ni geolocalización en esta etapa.
      mapa = new Map(contenedor, {
        center: CONFIG.centro,
        zoom: CONFIG.zoom,
        ...(CONFIG.mapId ? { mapId: CONFIG.mapId } : {}),
        zoomControl: true,
        streetViewControl: true,
        fullscreenControl: true,
        mapTypeControl: false,
        gestureHandling: 'auto',
      });
      if (estado) estado.hidden = true;

    })();
    try {
      await inicializacion;
    } catch (error) {
      console.error('BITALL: no fue posible iniciar Google Maps:', error);
      informar('No se pudo cargar Google Maps. Revisa la clave, sus restricciones, la facturación y tu conexión.');
    } finally {
      inicializacion = null;
    }
  }

  function alCambiarPantalla() {
    if (location.hash !== '#inicio') return;
    // Esperar a que :target haya aplicado el display:flex y el grid tenga tamaño.
    requestAnimationFrame(() => requestAnimationFrame(() => { void iniciarMapa(); }));
  }

  window.addEventListener('hashchange', alCambiarPantalla);
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', alCambiarPantalla, { once: true });
  } else {
    alCambiarPantalla();
  }
})();
