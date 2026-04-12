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
          clearProps: 'transform,opacity', // remove inline styles after anim so CSS opacity on children works
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
     Fades through slides every 2.8 s.
     Always starts on page load.
  ────────────────────────────────────────────── */
  (function initSlideshow() {
    const container = document.querySelector('.r-slideshow');
    if (!container) return;

    const slides = Array.from(container.querySelectorAll('.r-slide'));
    const dots   = Array.from(container.querySelectorAll('.r-slide-dot'));
    if (slides.length < 2) return;

    let current = 0;
    const DELAY = 2800;

    function goTo(idx) {
      slides[current].classList.remove('r-slide--active');
      if (dots[current]) dots[current].classList.remove('r-slide-dot--active');
      current = (idx + slides.length) % slides.length;
      slides[current].classList.add('r-slide--active');
      if (dots[current]) dots[current].classList.add('r-slide-dot--active');
    }

    // Always start — no IntersectionObserver dependency
    const timer = setInterval(() => goTo(current + 1), DELAY);

    // Dot clicks
    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => goTo(i));
    });
  })();

})();
