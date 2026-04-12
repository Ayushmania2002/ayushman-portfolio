/* ════════════════════════════════════════
   REACH — "Where can you find me?" maps
   Leaflet.js mini-maps + card reveal logic
════════════════════════════════════════ */
(function initReach() {
  if (typeof L === 'undefined') return;

  /* ── Tile layers ── */
  const TILE_DARK  = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
  const TILE_LIGHT = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
  const ATTR = '&copy; <a href="https://carto.com/" target="_blank">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>';

  /* ── Location data ── */
  const locations = [
    { id: 'rm-tirupati', lat: 13.5311, lng: 79.4160, zoom: 13 },
    { id: 'rm-kolkata',  lat: 22.5791, lng: 88.4147, zoom: 13 },
    { id: 'rm-delhi',    lat: 28.6406, lng: 77.1724, zoom: 13 },
  ];

  /* ── Custom teal pulsing marker ── */
  function makeIcon() {
    return L.divIcon({
      className : '',
      html      : `<div style="
        width:12px;height:12px;border-radius:50%;
        background:#5eead4;
        box-shadow:0 0 0 4px rgba(94,234,212,.25),0 0 16px rgba(94,234,212,.6);
        animation:reach-pulse 2s ease-in-out infinite;
      "></div>`,
      iconSize  : [12, 12],
      iconAnchor: [6, 6],
    });
  }

  /* ── Build maps ── */
  const tileLayers = [];

  function getTileUrl() {
    return document.documentElement.getAttribute('data-theme') === 'dark'
      ? TILE_DARK : TILE_LIGHT;
  }

  locations.forEach(({ id, lat, lng, zoom }) => {
    const el = document.getElementById(id);
    if (!el) return;

    const map = L.map(el, {
      center            : [lat, lng],
      zoom,
      zoomControl       : false,
      dragging          : false,
      scrollWheelZoom   : false,
      doubleClickZoom   : false,
      keyboard          : false,
      attributionControl: false,
    });

    const tl = L.tileLayer(getTileUrl(), {
      subdomains : 'abcd',
      maxZoom    : 19,
      attribution: ATTR,
    }).addTo(map);

    L.marker([lat, lng], { icon: makeIcon() }).addTo(map);
    tileLayers.push(tl);
  });

  /* ── Swap tiles on theme toggle ── */
  document.getElementById('themeToggle')?.addEventListener('click', () => {
    setTimeout(() => {
      const url = getTileUrl();
      tileLayers.forEach(tl => tl.setUrl(url));
    }, 60);
  });

  /* ── Card reveal interaction ── */
  document.querySelectorAll('.reach-card').forEach(card => {
    card.addEventListener('click', (e) => {
      // Let links handle themselves
      if (e.target.closest('.reach-directions')) return;

      const panel = card.querySelector('.reach-details-panel');
      const btn   = card.querySelector('.reach-reveal-btn');
      const open  = card.classList.toggle('is-open');

      btn.setAttribute('aria-expanded', open);
      panel.setAttribute('aria-hidden',  !open);
    });
  });
})();
