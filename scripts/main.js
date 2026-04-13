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
    github  : 'https://github.com/Ayushmania2002',
    linkedin: 'https://www.linkedin.com/in/ayushman-mallick-68490922b/',
    scholar : '',   // e.g. 'https://scholar.google.com/citations?user=XXXX'
    email   : 'mailto:ayushmania2002@gmail.com',
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

  /* ── 7. Lab / advisor page popup ── */
  (function initLabModal() {
    const modal    = document.getElementById('labModal');
    const backdrop = document.getElementById('labModalBackdrop');
    const closeBtn = document.getElementById('labModalClose');
    const frame    = document.getElementById('labModalFrame');
    const fallback = document.getElementById('labModalFallback');
    const nameEl   = document.getElementById('labModalName');
    const advEl    = document.getElementById('labModalAdvisor');
    const linkEl   = document.getElementById('labModalLink');
    const logoEl   = document.getElementById('labModalLogo');
    if (!modal) return;

    document.querySelectorAll('.tl-lab-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const labName  = btn.dataset.labName  || 'Lab Page';
        const advisor  = btn.dataset.advisor  || '';
        const url      = btn.dataset.labUrl   || '#';
        const logoSrc  = btn.dataset.labLogo  || '';

        nameEl.textContent = labName;
        advEl.textContent  = advisor;
        linkEl.href        = url;

        // Lab logo
        if (logoEl) {
          if (logoSrc) {
            logoEl.src   = logoSrc;
            logoEl.alt   = labName + ' logo';
            logoEl.style.display = '';
          } else {
            logoEl.src   = '';
            logoEl.style.display = 'none';
          }
        }
        fallback.classList.remove('visible');

        // Try loading in iframe; show fallback if blocked
        frame.src = url;
        frame.onerror = () => fallback.classList.add('visible');
        // Timeout fallback: if iframe doesn't trigger load in 5s, show fallback message
        const t = setTimeout(() => fallback.classList.add('visible'), 5000);
        frame.onload = () => {
          clearTimeout(t);
          // If X-Frame-Options blocks it, the iframe will load but be empty
          try {
            const doc = frame.contentDocument || frame.contentWindow?.document;
            if (!doc || doc.body.innerHTML.trim() === '') fallback.classList.add('visible');
          } catch(err) {
            fallback.classList.add('visible'); // cross-origin: can't inspect
          }
        };

        modal.classList.add('is-open');
        document.body.style.overflow = 'hidden';
      });
    });

    function closeLabModal() {
      modal.classList.remove('is-open');
      document.body.style.overflow = '';
      setTimeout(() => { frame.src = ''; }, 300);
    }
    backdrop?.addEventListener('click', closeLabModal);
    closeBtn?.addEventListener('click', closeLabModal);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('is-open')) closeLabModal();
    });
  })();

  /* ── 9. Unified gallery modal (timeline gallery cards + CRISPR research card) ── */
  (function initGalleryModal() {
    const modal    = document.getElementById('galleryModal');
    const backdrop = document.getElementById('galleryModalBackdrop');
    const closeBtn = document.getElementById('galleryModalClose');
    const imgEl    = document.getElementById('galleryModalImg');
    const prevBtn  = document.getElementById('galleryPrev');
    const nextBtn  = document.getElementById('galleryNext');
    const countEl  = document.getElementById('galleryCount');
    const navEl    = document.getElementById('galleryNav');
    if (!modal) return;

    let images = [];
    let current = 0;

    function showImg(idx) {
      current = (idx + images.length) % images.length;
      imgEl.src = images[current].src;
      imgEl.alt = images[current].alt;
      if (countEl) countEl.textContent = `${current + 1} / ${images.length}`;
    }

    function openGallery(imgs, startIdx) {
      images  = imgs;
      current = startIdx || 0;
      showImg(current);
      if (navEl) navEl.classList.toggle('hidden', images.length <= 1);
      modal.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    }

    function closeGallery() {
      modal.classList.remove('is-open');
      document.body.style.overflow = '';
      setTimeout(() => { imgEl.src = ''; images = []; }, 300);
    }

    // Timeline gallery cards
    document.querySelectorAll('.tl-card--gallery').forEach((card) => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('.tl-lab-btn')) return; // lab btn has its own handler
        const raw  = card.dataset.galleryImgs || '';
        const alt  = card.dataset.galleryAlt  || '';
        const srcs = raw.split('|').map(s => s.trim()).filter(Boolean);
        if (!srcs.length) return;
        const imgs = srcs.map((src, i) => ({ src, alt: `${alt} — ${i + 1}` }));
        openGallery(imgs, 0);
      });
    });

    // Research cards with gallery (.r-card--gallery)
    document.querySelectorAll('.r-card--gallery').forEach((card) => {
      card.addEventListener('click', (e) => {
        // Don't swallow dot-indicator or caption clicks within the slideshow
        if (e.target.closest('.r-slide-dots') || e.target.closest('.r-slide-caption')) return;
        const raw = card.dataset.galleryImgs || '';
        const alt = card.dataset.galleryAlt  || '';
        const srcs = raw.split('|').map(s => s.trim()).filter(Boolean);
        if (!srcs.length) return;
        const imgs = srcs.map((src, i) => ({ src, alt: `${alt} — ${i + 1}` }));
        openGallery(imgs, 0);
      });
    });

    prevBtn?.addEventListener('click', (e) => { e.stopPropagation(); showImg(current - 1); });
    nextBtn?.addEventListener('click', (e) => { e.stopPropagation(); showImg(current + 1); });
    backdrop?.addEventListener('click', closeGallery);
    closeBtn?.addEventListener('click', closeGallery);

    // Scroll to navigate images
    modal.addEventListener('wheel', (e) => {
      if (!modal.classList.contains('is-open') || images.length <= 1) return;
      e.preventDefault();
      if (e.deltaY > 0) showImg(current + 1);
      else              showImg(current - 1);
    }, { passive: false });

    // Keyboard nav
    document.addEventListener('keydown', (e) => {
      if (!modal.classList.contains('is-open')) return;
      if (e.key === 'Escape')      closeGallery();
      if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   showImg(current - 1);
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown')  showImg(current + 1);
    });
  })();

  /* ── 10. Pixel-portrait hover effect ── */
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
