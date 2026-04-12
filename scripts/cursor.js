/* ════════════════════════════════════════════════════════
   GLOWING BLOB CURSOR + TRAILING CHAIN
   – Main blob  : glowing teal circle, follows mouse
   – Chain      : 10 nodes, each follows the previous
                  with spring physics → snake/chain feel
   – On hover   : blob expands + brightens
   – On click   : blob bursts outward
════════════════════════════════════════════════════════ */
(function initCursor() {
  if (!window.matchMedia('(hover: hover)').matches) return;

  /* ── Config ── */
  const CHAIN_COUNT  = 10;       // number of tail nodes
  const SPRING       = 0.18;     // how fast each node chases the previous
  const BLOB_SIZE    = 22;       // px — main blob diameter
  const NODE_START   = 14;       // px — first chain node diameter
  const NODE_END     = 3;        // px — last chain node diameter
  const isDark  = () => document.documentElement.getAttribute('data-theme') !== 'light';
  const ACCENT  = () => isDark()
    ? (getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#5eead4')
    : '#0a6b62';   // dark teal — visible on light backgrounds
  const BLEND   = () => isDark() ? 'screen' : 'normal';

  /* ── Remove old cursor elements from HTML ── */
  document.getElementById('cursorDot') ?.remove();
  document.getElementById('cursorRing')?.remove();

  /* ── Create main blob ── */
  const blob = document.createElement('div');
  blob.id = 'cursorBlob';
  Object.assign(blob.style, {
    position      : 'fixed',
    top           : '0',
    left          : '0',
    width         : BLOB_SIZE + 'px',
    height        : BLOB_SIZE + 'px',
    borderRadius  : '50%',
    background    : ACCENT(),
    pointerEvents : 'none',
    zIndex        : '10000',
    transform     : 'translate(-50%, -50%)',
    transition    : 'width .25s ease, height .25s ease, opacity .2s ease',
    willChange    : 'left, top',
    mixBlendMode  : BLEND(),
  });
  document.body.appendChild(blob);

  /* ── Create chain nodes ── */
  const nodes = [];
  for (let i = 0; i < CHAIN_COUNT; i++) {
    const t    = i / (CHAIN_COUNT - 1);          // 0 → 1
    const size = NODE_START + (NODE_END - NODE_START) * t;
    const alpha= 0.55 - t * 0.45;                // fade out along chain

    const el = document.createElement('div');
    Object.assign(el.style, {
      position     : 'fixed',
      top          : '0',
      left         : '0',
      width        : size + 'px',
      height       : size + 'px',
      borderRadius : '50%',
      background   : ACCENT(),
      opacity      : alpha,
      pointerEvents: 'none',
      zIndex       : 9999 - i,
      transform    : 'translate(-50%, -50%)',
      willChange   : 'left, top',
      mixBlendMode : BLEND(),
    });
    document.body.appendChild(el);
    nodes.push({ el, x: innerWidth / 2, y: innerHeight / 2 });
  }

  /* ── Mouse position ── */
  let mx = innerWidth  / 2;
  let my = innerHeight / 2;
  let bx = mx, by = my;   // blob position (spring-smoothed)

  document.addEventListener('mousemove', (e) => {
    mx = e.clientX;
    my = e.clientY;
  });

  /* ── Glow filter on blob ── */
  function updateGlow(color) {
    blob.style.boxShadow = `0 0 10px 4px ${color},
                            0 0 28px 8px ${color}55,
                            0 0 56px 14px ${color}22`;
  }
  updateGlow(ACCENT());

  /* ── Animation loop ── */
  let isHover   = false;
  let isClicking = false;

  function tick() {
    requestAnimationFrame(tick);

    const color = ACCENT();

    // Blob springs toward mouse
    bx += (mx - bx) * 0.22;
    by += (my - by) * 0.22;
    blob.style.left = bx + 'px';
    blob.style.top  = by + 'px';

    // Each chain node springs toward the node ahead of it
    let prevX = bx, prevY = by;
    nodes.forEach((node) => {
      node.x += (prevX - node.x) * SPRING;
      node.y += (prevY - node.y) * SPRING;
      node.el.style.left = node.x + 'px';
      node.el.style.top  = node.y + 'px';
      // Also keep node colours in sync with theme
      node.el.style.background = color;
      prevX = node.x;
      prevY = node.y;
    });

    const blend = BLEND();
    blob.style.background    = color;
    blob.style.mixBlendMode  = blend;
    updateGlow(color);
    nodes.forEach(n => n.el.style.mixBlendMode = blend);
  }

  tick();

  /* ── Hover expand ── */
  function onEnter() {
    isHover = true;
    blob.style.width  = (BLOB_SIZE * 2.2) + 'px';
    blob.style.height = (BLOB_SIZE * 2.2) + 'px';
    blob.style.opacity = '0.75';
  }
  function onLeave() {
    isHover = false;
    blob.style.width  = BLOB_SIZE + 'px';
    blob.style.height = BLOB_SIZE + 'px';
    blob.style.opacity = '1';
  }

  function bindHover(el) {
    el.addEventListener('mouseenter', onEnter);
    el.addEventListener('mouseleave', onLeave);
  }

  document.querySelectorAll(
    'a, button, .r-card, .c-card, .tag, .tl-card, .skill-list li, .social-chip'
  ).forEach(bindHover);

  new MutationObserver(() => {
    document.querySelectorAll(
      'a, button, .r-card, .c-card, .tag, .tl-card, .social-chip'
    ).forEach(bindHover);
  }).observe(document.body, { childList: true, subtree: true });

  /* ── Click burst ── */
  document.addEventListener('mousedown', () => {
    blob.style.width  = (BLOB_SIZE * 3) + 'px';
    blob.style.height = (BLOB_SIZE * 3) + 'px';
    blob.style.opacity = '0.5';
  });
  document.addEventListener('mouseup', () => {
    blob.style.width  = isHover ? (BLOB_SIZE * 2.2) + 'px' : BLOB_SIZE + 'px';
    blob.style.height = isHover ? (BLOB_SIZE * 2.2) + 'px' : BLOB_SIZE + 'px';
    blob.style.opacity = '1';
  });

  /* ── Hide/show when leaving window ── */
  document.addEventListener('mouseleave', () => {
    blob.style.opacity = '0';
    nodes.forEach(n => n.el.style.opacity = '0');
  });
  document.addEventListener('mouseenter', () => {
    blob.style.opacity = '1';
    nodes.forEach((n, i) => {
      const t = i / (CHAIN_COUNT - 1);
      n.el.style.opacity = String(0.55 - t * 0.45);
    });
  });

})();
