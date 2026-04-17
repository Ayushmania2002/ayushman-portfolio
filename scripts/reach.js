/* ════════════════════════════════════════
   REACH — "Where can you find me?" section
   Leaflet mini-maps · present/absent game
   + Geolocation auto-detection
════════════════════════════════════════ */
(function initReach() {
  if (typeof L === 'undefined') return;

  /* ── Tile layers ── */
  const TILE_DARK  = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
  const TILE_LIGHT = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

  /* ── Location data with per-card panel HTML ── */
  const locations = [
    {
      id      : 'rm-tirupati',
      cardId  : 'rc-tirupati',
      lat     : 13.5311,
      lng     : 79.4160,
      zoom    : 14,
      mapsUrl : 'https://maps.google.com/?q=13.5311,79.4160',
      presentHtml: `
        <p class="reach-status reach-status--present">&#x1F7E2;&nbsp; I&rsquo;m here right now!</p>
        <p class="reach-inst-name">IISER Tirupati</p>
        <p class="reach-inst-sub">BS&ndash;MS Programme &middot; 2020&ndash;2025</p>
        <p class="reach-inst-sub">Department of Biology &middot; Yerpedu, Tirupati</p>
        <p class="reach-inst-sub" style="margin-top:6px">Feel free to connect via any of the social links above&nbsp;&#x1F44B;</p>
        <a href="https://maps.google.com/?q=13.5311,79.4160" target="_blank" rel="noopener" class="reach-directions">&#x2197; Open in Google Maps</a>
      `,
      absentHtml: `
        <p class="reach-status reach-status--absent">&#x1F534;&nbsp; Oops! You can&rsquo;t find me here at the moment.</p>
        <p class="reach-inst-name">IISER Tirupati</p>
        <p class="reach-inst-sub">BS&ndash;MS Programme &middot; 2020&ndash;2025</p>
        <p class="reach-inst-sub">Department of Biology &middot; Yerpedu, Tirupati</p>
        <a href="https://maps.google.com/?q=13.5311,79.4160" target="_blank" rel="noopener" class="reach-directions">&#x2197; Open in Google Maps</a>
      `,
    },
    {
      id      : 'rm-kolkata',
      cardId  : 'rc-kolkata',
      lat     : 22.5778807,
      lng     : 88.4092447,
      zoom    : 15,
      mapsUrl : 'https://maps.google.com/?q=22.5778807,88.4092447',
      presentHtml: `
        <p class="reach-status reach-status--present">&#x1F7E2;&nbsp; I&rsquo;m here right now!</p>
        <p class="reach-inst-name">Bidhannagar, Kolkata</p>
        <p class="reach-inst-sub">Home &middot; West Bengal, India</p>
        <p class="reach-inst-sub" style="margin-top:6px">Feel free to connect via any of the social links above&nbsp;&#x1F44B;</p>
        <a href="https://maps.google.com/?q=22.5778807,88.4092447" target="_blank" rel="noopener" class="reach-directions">&#x2197; Open in Google Maps</a>
      `,
      absentHtml: `
        <p class="reach-status reach-status--absent">&#x1F534;&nbsp; Oops! You can&rsquo;t find me here at the moment.</p>
        <p class="reach-inst-name">Bidhannagar, Kolkata</p>
        <p class="reach-inst-sub">Home &middot; West Bengal, India</p>
        <a href="https://maps.google.com/?q=22.5778807,88.4092447" target="_blank" rel="noopener" class="reach-directions">&#x2197; Open in Google Maps</a>
      `,
    },
    {
      id      : 'rm-delhi',
      cardId  : 'rc-delhi',
      lat     : 28.6401449,
      lng     : 77.1612158,
      zoom    : 16,
      mapsUrl : 'https://maps.google.com/?q=28.6401449,77.1612158',
      presentHtml: `
        <p class="reach-status reach-status--present">&#x1F7E2;&nbsp; I&rsquo;m here right now!</p>
        <p class="reach-inst-name">ICAR&ndash;IARI, New Delhi</p>
        <p class="reach-inst-sub">Senior Research Fellow &middot; 2026&ndash;present</p>
        <p class="reach-inst-sub">Plant Molecular Physiology Lab &middot; Lab 106, Pusa Campus</p>
        <p class="reach-inst-sub" style="margin-top:6px">Feel free to connect via any of the social links above&nbsp;&#x1F44B;</p>
        <a href="https://maps.google.com/?q=28.6401449,77.1612158" target="_blank" rel="noopener" class="reach-directions">&#x2197; Open in Google Maps</a>
      `,
      absentHtml: `
        <p class="reach-status reach-status--absent">&#x1F534;&nbsp; Oops! You can&rsquo;t find me here at the moment.</p>
        <p class="reach-inst-name">ICAR&ndash;IARI, New Delhi</p>
        <p class="reach-inst-sub">Plant Molecular Physiology Lab &middot; Pusa Campus</p>
        <a href="https://maps.google.com/?q=28.6401449,77.1612158" target="_blank" rel="noopener" class="reach-directions">&#x2197; Open in Google Maps</a>
      `,
    },
  ];

  /* ── Haversine distance (km) ── */
  function distKm(lat1, lng1, lat2, lng2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2
      + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180)
      * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  /* ── Update which card is "present" ── */
  function applyPresence(presentCardId) {
    locations.forEach(loc => {
      const card = document.getElementById(loc.cardId);
      if (!card) return;
      const isPresent = loc.cardId === presentCardId;
      card.dataset.present = isPresent ? 'true' : 'false';

      // Update dot style
      const dot = card.querySelector('.reach-dot');
      if (dot) {
        isPresent
          ? dot.classList.add('reach-dot--present')
          : dot.classList.remove('reach-dot--present');
      }

      // Update panel content (only if panel is currently closed)
      const panel = card.querySelector('.reach-details-panel');
      if (panel && !card.classList.contains('is-open')) {
        panel.innerHTML = isPresent ? loc.presentHtml : loc.absentHtml;
      }
    });
  }

  /* ── Auto-detect via Geolocation API ── */
  function detectLocation() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      pos => {
        const { latitude, longitude } = pos.coords;
        let closestIdx = -1, closestDist = Infinity;
        locations.forEach((loc, i) => {
          const d = distKm(latitude, longitude, loc.lat, loc.lng);
          if (d < closestDist) { closestDist = d; closestIdx = i; }
        });
        // Only mark present if within 60 km of a city
        if (closestIdx >= 0 && closestDist < 60) {
          applyPresence(locations[closestIdx].cardId);
        }
      },
      () => { /* permission denied or unavailable — keep hardcoded default */ },
      { timeout: 6000, maximumAge: 300000 }
    );
  }

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

  /* ── Initialise panel content with defaults ── */
  locations.forEach(loc => {
    const card = document.getElementById(loc.cardId);
    if (!card) return;
    const isPresent = card.dataset.present === 'true';
    const panel = card.querySelector('.reach-details-panel');
    if (panel) panel.innerHTML = isPresent ? loc.presentHtml : loc.absentHtml;
  });

  /* ── Card click interaction ── */
  document.querySelectorAll('.reach-card').forEach(card => {
    const panel = card.querySelector('.reach-details-panel');
    const btn   = card.querySelector('.reach-reveal-btn');

    card.addEventListener('click', (e) => {
      if (e.target.closest('.reach-directions')) return;

      const isPresent  = card.dataset.present === 'true';
      const alreadyOpen = card.classList.contains('is-open');

      // Close card
      if (alreadyOpen) {
        card.classList.remove('is-open', 'is-present', 'is-absent');
        btn.setAttribute('aria-expanded', 'false');
        panel.setAttribute('aria-hidden', 'true');
        return;
      }

      // Refresh panel content (presence may have been updated by geolocation)
      const loc = locations.find(l => l.cardId === card.id);
      if (loc) panel.innerHTML = isPresent ? loc.presentHtml : loc.absentHtml;

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

  /* ── Kick off geolocation detection ── */
  detectLocation();

})();
