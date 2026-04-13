/* ════════════════════════════════════════
   NAME ANIMATION — Magnetic wave lift
   Hovering near a letter pulls it upward
   and ripples a teal glow to neighbours.
   Each letter springs back independently.
════════════════════════════════════════ */
(function initNameAnim() {
  const nameEl = document.getElementById('heroName');
  if (!nameEl || window.matchMedia('(hover: none)').matches) return;

  // Split each word-span into individual letter spans
  nameEl.querySelectorAll('[data-word]').forEach(wordSpan => {
    const text    = wordSpan.dataset.word;
    wordSpan.innerHTML = text
      .split('')
      .map(ch => `<span class="nm-char">${ch}</span>`)
      .join('');
  });

  const chars = Array.from(nameEl.querySelectorAll('.nm-char'));
  if (!chars.length) return;

  // Per-character state
  const state = chars.map(() => ({
    vy    : 0,
    y     : 0,
    glow  : 0,
  }));

  const LIFT      = 38;    // max px upward pull
  const RADIUS    = 140;   // px — influence radius of cursor
  const SPRING    = 0.18;  // spring stiffness (unused directly, via inline)
  const DAMPING   = 0.72;  // velocity damping
  const GLOW_DECAY= 0.88;  // glow falloff per frame

  let rafId = null;
  let active = false;

  function getCharCentre(el) {
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }

  function lerp(a, b, t) { return a + (b - a) * t; }

  function tick() {
    let anyMoving = false;
    chars.forEach((ch, i) => {
      const s = state[i];
      // Spring toward 0
      const force = -s.y * 0.18;
      s.vy = (s.vy + force) * DAMPING;
      s.y  = s.y + s.vy;
      s.glow = s.glow * GLOW_DECAY;

      const absY    = Math.abs(s.y);
      const absGlow = Math.abs(s.glow);

      if (absY > 0.15 || absGlow > 0.005) {
        anyMoving = true;
        ch.style.transform = `translateY(${-s.y.toFixed(2)}px)`;

        // Interpolate colour: text-colour → accent (#5eead4)
        const g = Math.min(1, absGlow);
        if (g > 0.01) {
          ch.style.textShadow = `0 ${(s.y * 0.4).toFixed(1)}px ${(g * 22).toFixed(0)}px rgba(94,234,212,${(g * 0.9).toFixed(2)})`;
          ch.style.color      = `rgba(94,234,212,${(g * 0.95).toFixed(2)})`;
        } else {
          ch.style.textShadow = '';
          ch.style.color      = '';
        }
      } else {
        // Fully at rest — clear styles
        if (ch.style.transform) {
          ch.style.transform  = '';
          ch.style.textShadow = '';
          ch.style.color      = '';
        }
      }
    });

    if (anyMoving || active) {
      rafId = requestAnimationFrame(tick);
    } else {
      rafId = null;
    }
  }

  function startTick() {
    if (!rafId) rafId = requestAnimationFrame(tick);
  }

  nameEl.addEventListener('mousemove', (e) => {
    active = true;
    chars.forEach((ch, i) => {
      const centre = getCharCentre(ch);
      const dx     = e.clientX - centre.x;
      const dy     = e.clientY - centre.y;
      const dist   = Math.sqrt(dx * dx + dy * dy);
      const s      = state[i];

      if (dist < RADIUS) {
        const strength = 1 - dist / RADIUS;
        const target   = LIFT * strength * strength;
        // Kick velocity upward
        s.vy -= (target - s.y) * 0.28;
        s.glow = Math.min(1, s.glow + strength * 0.55);
        // Ripple glow to immediate neighbours
        [-1, 1].forEach(delta => {
          const n = state[i + delta];
          if (n) n.glow = Math.min(1, n.glow + strength * 0.28);
        });
      }
    });
    startTick();
  });

  nameEl.addEventListener('mouseleave', () => {
    active = false;
    startTick();
  });
})();
