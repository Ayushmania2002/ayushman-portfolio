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
     TIMELINE HORIZONTAL SCROLL
     • Mouse wheel over section → horizontal scroll
       with smooth momentum
     • Click+drag to scroll
     • Hides hint badge once user has scrolled
  ────────────────────────────────────────────── */
  (function initTimelineScroll() {
    const outer = document.getElementById('tlOuter');
    const hint  = document.getElementById('tlScrollHint');
    if (!outer) return;

    let isHovering = false;
    outer.addEventListener('mouseenter', () => { isHovering = true;  });
    outer.addEventListener('mouseleave', () => { isHovering = false; });

    /* ── Momentum wheel scroll ── */
    let velocity = 0;
    let rafId    = null;

    function applyMomentum() {
      if (Math.abs(velocity) < 0.5) { velocity = 0; return; }
      outer.scrollLeft += velocity;
      velocity *= 0.88;
      rafId = requestAnimationFrame(applyMomentum);
    }

    window.addEventListener('wheel', (e) => {
      if (!isHovering) return;
      e.preventDefault();
      cancelAnimationFrame(rafId);
      velocity += e.deltaY * 1.1;
      rafId = requestAnimationFrame(applyMomentum);
    }, { passive: false });

    /* ── Drag to scroll ── */
    let isDragging = false, startX = 0, scrollStart = 0;

    outer.addEventListener('mousedown', (e) => {
      isDragging  = true;
      startX      = e.pageX;
      scrollStart = outer.scrollLeft;
      velocity    = 0;
      cancelAnimationFrame(rafId);
      outer.style.userSelect = 'none';
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      outer.scrollLeft = scrollStart - (e.pageX - startX);
    });

    window.addEventListener('mouseup', () => {
      isDragging = false;
      outer.style.userSelect = '';
    });

    /* ── Touch swipe (mobile) ── */
    let touchStartX = 0, touchScrollStart = 0;
    outer.addEventListener('touchstart', (e) => {
      touchStartX    = e.touches[0].pageX;
      touchScrollStart = outer.scrollLeft;
    }, { passive: true });
    outer.addEventListener('touchmove', (e) => {
      outer.scrollLeft = touchScrollStart - (e.touches[0].pageX - touchStartX);
    }, { passive: true });

    /* ── Hide hint once scrolled ── */
    outer.addEventListener('scroll', () => {
      if (outer.scrollLeft > 40 && hint) hint.style.opacity = '0';
    }, { passive: true });
  })();

})();
