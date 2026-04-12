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
    new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const id = e.target.id;
        navLinks.forEach((l) => {
          l.style.color = l.getAttribute('href') === '#' + id ? 'var(--accent)' : '';
        });
      });
    }, { rootMargin: '-40% 0px -40% 0px' })
    .observe.apply(null, [...sections].map ? null : null);

    // Fix: observe each section
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
    const container = document.querySelector('.r-slideshow');
    if (!container) return;

    const slides = Array.from(container.querySelectorAll('.r-slide'));
    const dots   = Array.from(container.querySelectorAll('.r-slide-dot'));
    if (slides.length < 2) return;

    let current = 0;
    const DELAY = 2800;

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
  })();

  /* ──────────────────────────────────────────────
     TIMELINE — STICKY HORIZONTAL SCROLL
     The section gets extra height = track scroll
     width. The inner wrapper is position:sticky so
     it pins while the user scrolls vertically, and
     the track translates horizontally in sync with
     scroll progress — exactly like shivamkgw.github.io
  ────────────────────────────────────────────── */
  (function initStickyTimeline() {
    const section = document.getElementById('timeline');
    const track   = document.getElementById('tlTrack');
    const hint    = document.getElementById('tlScrollHint');
    const bar     = document.getElementById('tlProgressBar');
    if (!section || !track) return;

    // Skip on mobile — CSS resets to normal layout
    const isMobile = () => window.innerWidth <= 768;

    let maxX = 0;

    function setHeight() {
      if (isMobile()) {
        section.style.height = '';
        track.style.transform = '';
        return;
      }
      // Extra scrollable height = how far the track needs to travel
      maxX = track.scrollWidth - window.innerWidth;
      section.style.height = (window.innerHeight + Math.max(0, maxX)) + 'px';
    }

    function onScroll() {
      if (isMobile()) return;
      const rect     = section.getBoundingClientRect();
      const progress = Math.max(0, Math.min(1, -rect.top / maxX));
      track.style.transform = `translateX(${-maxX * progress}px)`;
      if (bar) bar.style.width = (progress * 100) + '%';
      // Hide scroll hint after 5% progress
      if (hint && progress > 0.05) hint.classList.add('hidden');
    }

    // Init — wait for fonts/images so track width is accurate
    window.addEventListener('load', () => {
      setHeight();
      onScroll();
    });

    setHeight(); // immediate rough pass
    window.addEventListener('resize', () => { setHeight(); onScroll(); });
    window.addEventListener('scroll', onScroll, { passive: true });
  })();

})();
