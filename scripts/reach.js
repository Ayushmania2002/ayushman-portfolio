/* ════════════════════════════════════════
   REACH — "Where can you find me?" section
   Leaflet mini-maps · present/absent game
════════════════════════════════════════ */
(function initReach() {
  if (typeof L === 'undefined') return;

  /* ── Tile layers ── */
  const TILE_DARK  = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
  const TILE_LIGHT = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

  /* ── Location data ── */
  const locations = [
    {
      id     : 'rm-tirupati',
      cardId : 'rc-tirupati',
      lat    : 13.5311,
      lng    : 79.4160,
      zoom   : 14,
    },
    {
      id     : 'rm-kolkata',
      cardId : 'rc-kolkata',
      lat    : 22.5778807,
      lng    : 88.4092447,
      zoom   : 15,
    },
    {
      id     : 'rm-delhi',
      cardId : 'rc-delhi',
      lat    : 28.6401449,
      lng    : 77.1612158,
      zoom   : 16,
    },
  ];

  /* ── Marker icon factory ── */
  function makeIcon(color) {
    return L.divIcon({
      className : '',
      html      : `<div style="
        width:12px;height:12px;border-radius:50%;
        background:${color};
        box-shadow:0 0 0 4px ${color}44,0 0 16px ${color}99;
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
      subdomains: 'abcd',
      maxZoom   : 19,
    }).addTo(map);

    L.marker([lat, lng], { icon: makeIcon('#5eead4') }).addTo(map);
    tileLayers.push(tl);
  });

  /* ── Swap tiles on theme toggle ── */
  document.getElementById('themeToggle')?.addEventListener('click', () => {
    setTimeout(() => {
      const url = getTileUrl();
      tileLayers.forEach(tl => tl.setUrl(url));
    }, 60);
  });

  /* ── Panel content ── */
  const PRESENT_HTML = `
    <p class="reach-status reach-status--present">&#x1F7E2;&nbsp; I&rsquo;m here right now!</p>
    <p class="reach-inst-name">ICAR&ndash;IARI, New Delhi</p>
    <p class="reach-inst-sub">Senior Research Fellow &middot; 2026&ndash;present</p>
    <p class="reach-inst-sub">Plant Molecular Physiology Lab &middot; Lab 106, Pusa Campus</p>
    <p class="reach-inst-sub" style="margin-top:6px">Feel free to connect via any of the social links above&nbsp;&#x1F44B;</p>
    <a href="https://maps.google.com/?q=28.6401449,77.1612158" target="_blank" rel="noopener" class="reach-directions">&#x2197; Open in Google Maps</a>
  `;

  const ABSENT_HTML = `
    <p class="reach-status reach-status--absent">&#x1F534;&nbsp; Oops! You can&rsquo;t find me here at the moment.</p>
    <p class="reach-inst-sub" style="margin-top:6px">Try the other locations&nbsp;&#x1F609;</p>
  `;

  /* ── Card click interaction ── */
  document.querySelectorAll('.reach-card').forEach(card => {
    const isPresent = card.dataset.present === 'true';
    const panel     = card.querySelector('.reach-details-panel');
    const btn       = card.querySelector('.reach-reveal-btn');

    // Pre-fill panel content
    panel.innerHTML = isPresent ? PRESENT_HTML : ABSENT_HTML;

    card.addEventListener('click', (e) => {
      if (e.target.closest('.reach-directions')) return;

      const alreadyOpen = card.classList.contains('is-open');

      // Close card
      if (alreadyOpen) {
        card.classList.remove('is-open', 'is-present', 'is-absent');
        btn.setAttribute('aria-expanded', 'false');
        panel.setAttribute('aria-hidden', 'true');
        return;
      }

      // Open card
      card.classList.add('is-open');
      card.classList.add(isPresent ? 'is-present' : 'is-absent');
      btn.setAttribute('aria-expanded', 'true');
      panel.setAttribute('aria-hidden', 'false');

      // Auto-dismiss absent cards after 3 s
      if (!isPresent) {
        setTimeout(() => {
          card.classList.remove('is-open', 'is-absent');
          btn.setAttribute('aria-expanded', 'false');
          panel.setAttribute('aria-hidden', 'true');
        }, 3000);
      }
    });
  });
})();
