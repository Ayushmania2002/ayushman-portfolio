/* ════════════════════════════════════════
   SCROLL ANIMATIONS · NAV · PROGRESS
   · MICROSCOPY SLIDESHOW
════════════════════════════════════════ */
(function initAnimations() {

  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
  }

  /* ── Scroll progress bar ── */
  const bar = document.getElementById('scrollProgress');
  if (bar) {
    window.addEventListener('scroll', () => {
      const pct = window.scrollY /
        (document.documentElement.scrollHeight - window.innerHeight) * 100;
      bar.style.width = pct + '%';
    }, { passive: true });
  }

  /* ── Nav scrolled state ── */
  const nav = document.getElementById('nav');
  if (nav) {
    const cb = () => nav.classList.toggle('scrolled', window.scrollY > 70);
    window.addEventListener('scroll', cb, { passive: true });
    cb();
  }

  /* ── Reveal on scroll (IntersectionObserver) ── */
  const reveals = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');
  if ('IntersectionObserver' in window) {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const delay = parseInt(e.target.dataset.delay || '0', 10);
        setTimeout(() => e.target.classList.add('visible'), delay);
        obs.unobserve(e.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
    reveals.forEach((el) => obs.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('visible'));
  }

  /* ── Hero stagger on load ── */
  document.querySelectorAll('.hero-content .reveal-up').forEach((el, i) => {
    setTimeout(() => el.classList.add('visible'), 150 + i * 110);
  });

  /* ── GSAP card stagger ── */
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    const cards = document.querySelectorAll('.r-card');
    if (cards.length) {
      cards.forEach((c) => gsap.set(c, { opacity: 0, y: 50 }));
      ScrollTrigger.create({
        trigger: '.research-grid',
        start  : 'top 78%',
        onEnter: () => gsap.to(cards, {
          opacity: 1, y: 0, duration: 0.65, stagger: 0.12, ease: 'power3.out',
        }),
        once: true,
      });
    }
  }

  /* ── Active nav link spy ── */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  if (sections.length && navLinks.length) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        navLinks.forEach((l) => {
          l.style.color = l.getAttribute('href') === '#' + e.target.id
            ? 'var(--accent)' : '';
        });
      });
    }, { rootMargin: '-40% 0px -40% 0px' });
    sections.forEach((s) => spy.observe(s));
  }

  /* ──────────────────────────────────────────────
     MICROSCOPY SLIDESHOW
     Uses direct style.opacity to bypass any CSS
     stacking-context interference from GSAP.
  ────────────────────────────────────────────── */
  (function initSlideshow() {
    const DELAY = 2800;
    document.querySelectorAll('.r-slideshow').forEach(container => {
      const slides = Array.from(container.querySelectorAll('.r-slide'));
      const dots   = Array.from(container.querySelectorAll('.r-slide-dot'));
      if (slides.length < 2) return;

      let current = 0;

      // Init: set inline opacity directly (bypasses CSS class specificity issues)
      slides.forEach((s, i) => {
        s.style.transition = 'opacity 1s ease-in-out';
        s.style.opacity    = i === 0 ? '1' : '0';
      });
      if (dots[0]) dots[0].classList.add('r-slide-dot--active');

      function goTo(idx) {
        slides[current].style.opacity = '0';
        if (dots[current]) dots[current].classList.remove('r-slide-dot--active');
        current = ((idx % slides.length) + slides.length) % slides.length;
        slides[current].style.opacity = '1';
        if (dots[current]) dots[current].classList.add('r-slide-dot--active');
      }

      setInterval(() => goTo(current + 1), DELAY);
      dots.forEach((dot, i) => dot.addEventListener('click', () => goTo(i)));
    });
  })();

  /* ── Timeline item entrance animations ── */
  (function initTimelineReveal() {
    const items = document.querySelectorAll('.tl-item');
    if (!items.length) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add('tl-visible');
        obs.unobserve(e.target);
      });
    }, { threshold: 0.15 });
    items.forEach((item) => obs.observe(item));
  })();

  /* ── Background fade slideshow (hero + journey sections) ── */
  (function initBgSlideshow() {
    const lightSrcs = [
      'assets/images/light1.png',
      'assets/images/light2.png',
      'assets/images/light3.png',
      'assets/images/light4.png',
      'assets/images/light5.png',
      'assets/images/light6.png',
      'assets/images/light7.jpeg',
      'assets/images/light8.png',
      'assets/images/light9.jpeg',
    ];
    const darkSrcs = [
      'assets/images/dark1.png',
      'assets/images/dark2.png',
      'assets/images/dark3.png',
      'assets/images/dark4.png',
      'assets/images/dark5.png',
      'assets/images/dark6.png',
      'assets/images/dark7.png',
      'assets/images/dark8.png',
      'assets/images/dark9.png',
      'assets/images/dark10.png',
    ];

    const containers = [
      document.getElementById('heroBgSlideshow'),
      document.getElementById('researchBgSlideshow'),
      document.getElementById('journeyBgSlideshow'),
    ].filter(Boolean);
    if (!containers.length) return;

    let activeTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    let idx = 0;

    function getSrcs() {
      return activeTheme === 'light' ? lightSrcs : darkSrcs;
    }

    function buildSlides(container, srcs) {
      container.innerHTML = '';
      return srcs.map((src, i) => {
        const el = document.createElement('div');
        el.className = 'bg-slide' + (i === 0 ? ' bg-slide--active' : '');
        el.style.backgroundImage = "url('" + src + "')";
        container.appendChild(el);
        return el;
      });
    }

    let slides = containers.map(c => buildSlides(c, getSrcs()));

    function tick() {
      const theme = document.documentElement.getAttribute('data-theme') || 'dark';
      const srcs  = theme === 'light' ? lightSrcs : darkSrcs;

      if (theme !== activeTheme) {
        activeTheme = theme;
        idx = 0;
        slides = containers.map(c => buildSlides(c, srcs));
        return;
      }

      const next = (idx + 1) % srcs.length;
      slides.forEach(s => {
        s[idx].classList.remove('bg-slide--active');
        s[next].classList.add('bg-slide--active');
      });
      idx = next;
    }

    setInterval(tick, 3000);
  })();

  /* ── Timeline centre-line scroll fill (Arnab-style) ── */
  (function initTimelineLine() {
    const track  = document.getElementById('tlTrack');
    const fill   = document.getElementById('tlLineFill');
    const section = document.getElementById('timeline');
    if (!track || !fill || !section) return;

    function update() {
      const tRect = track.getBoundingClientRect();
      const sRect = section.getBoundingClientRect();
      const centreX = tRect.left + tRect.width / 2 - 1;

      // Show only when timeline section is in view
      const inView = sRect.top < window.innerHeight && sRect.bottom > 0;
      fill.style.opacity = inView ? '1' : '0';
      fill.style.left    = centreX + 'px';
    }

    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  })();

})();
