/* ════════════════════════════════════════
   MAIN — theme · mobile nav · smooth scroll
   · pixel portrait · social links
════════════════════════════════════════ */
(function initMain() {
  const html = document.documentElement;

  /* ── 1. Theme ── */
  const THEME_KEY = 'am-theme';
  html.setAttribute('data-theme', localStorage.getItem(THEME_KEY) || 'dark');

  document.getElementById('themeToggle')?.addEventListener('click', () => {
    const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem(THEME_KEY, next);
    if (typeof window.updateSphereTheme === 'function') window.updateSphereTheme();
  });

  /* ── 2. Mobile nav ── */
  const hamburger = document.getElementById('navHamburger');
  const mobileNav = document.getElementById('navMobile');
  const backdrop  = document.getElementById('navBackdrop');
  const closeBtn  = document.getElementById('navMobileClose');

  const open  = () => {
    mobileNav?.classList.add('open');
    backdrop?.classList.add('open');
    hamburger?.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  };
  const close = () => {
    mobileNav?.classList.remove('open');
    backdrop?.classList.remove('open');
    hamburger?.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };

  hamburger?.addEventListener('click', open);
  closeBtn?.addEventListener('click', close);
  backdrop?.addEventListener('click', close);
  mobileNav?.querySelectorAll('a').forEach((a) => a.addEventListener('click', close));
  document.addEventListener('keydown', (e) => e.key === 'Escape' && close());

  /* ── 3. Smooth scroll ── */
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const offset = document.getElementById('nav')?.offsetHeight || 72;
      window.scrollTo({
        top     : target.getBoundingClientRect().top + window.scrollY - offset,
        behavior: 'smooth',
      });
    });
  });

  /* ── 4. Social links — FILL IN YOUR REAL URLS BELOW ── */
  const SOCIAL = {
    github  : '',   // e.g. 'https://github.com/YourUsername'
    linkedin: '',   // e.g. 'https://linkedin.com/in/YourProfile'
    scholar : '',   // e.g. 'https://scholar.google.com/citations?user=XXXX'
    email   : '',   // e.g. 'mailto:you@example.com'
  };

  const setHref = (id, url) => {
    if (url) document.getElementById(id)?.setAttribute('href', url);
  };

  setHref('githubChip',   SOCIAL.github);
  setHref('linkedinChip', SOCIAL.linkedin);
  setHref('githubCard',   SOCIAL.github);
  setHref('linkedinCard', SOCIAL.linkedin);
  setHref('scholarCard',  SOCIAL.scholar);
  setHref('emailCard',    SOCIAL.email);

  /* ── 5. Footer year ── */
  const footerCopy = document.querySelector('.footer-copy');
  if (footerCopy) footerCopy.textContent = `© ${new Date().getFullYear()} Ayushman Mallick`;

  /* ── 6. Fade-in on load ── */
  document.body.style.opacity    = '0';
  document.body.style.transition = 'opacity 0.45s ease';
  window.addEventListener('load', () => (document.body.style.opacity = '1'));

  /* ── 7. Degree certificate — hover preview + click popup ── */
  (function initDegreeCard() {
    const card    = document.getElementById('degreeCard');
    const modal   = document.getElementById('degreeModal');
    const backdrop = document.getElementById('degreeModalBackdrop');
    const closeBtn = document.getElementById('degreeModalClose');
    if (!card || !modal) return;

    function openModal(e) {
      e.stopPropagation();
      modal.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      closeBtn?.focus();
    }
    function closeModal() {
      modal.classList.remove('is-open');
      document.body.style.overflow = '';
    }

    card.addEventListener('click', openModal);
    backdrop?.addEventListener('click', closeModal);
    closeBtn?.addEventListener('click', closeModal);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
    });
  })();

  /* ── 8. Pixel-portrait hover effect ── */
  const wrap  = document.getElementById('profilePhotoWrap');
  const photo = document.getElementById('profilePhoto');

  if (wrap && photo) {
    let canvas = null;
    let ready  = false;

    function buildPixel() {
      if (ready || photo.naturalWidth === 0) return;
      const BLOCK = 8;
      const w = photo.naturalWidth;
      const h = photo.naturalHeight;

      const full = document.createElement('canvas');
      full.width  = w; full.height = h;
      full.getContext('2d').drawImage(photo, 0, 0, w, h);

      const small = document.createElement('canvas');
      small.width  = Math.floor(w / BLOCK);
      small.height = Math.floor(h / BLOCK);
      const sc = small.getContext('2d');
      sc.imageSmoothingEnabled = false;
      sc.drawImage(full, 0, 0, small.width, small.height);

      canvas = document.createElement('canvas');
      canvas.width  = w; canvas.height = h;
      canvas.style.cssText = `
        position:absolute;inset:0;width:100%;height:100%;
        object-fit:cover;opacity:0;
        transition:opacity .28s ease;border-radius:inherit;`;
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(small, 0, 0, w, h);
      wrap.appendChild(canvas);
      ready = true;
    }

    photo.complete ? buildPixel() : photo.addEventListener('load', buildPixel);
    wrap.addEventListener('mouseenter', () => { if (canvas) canvas.style.opacity = '1'; });
    wrap.addEventListener('mouseleave', () => { if (canvas) canvas.style.opacity = '0'; });
  }

})();
