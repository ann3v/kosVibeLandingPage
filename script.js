(() => {
  const header = document.querySelector('.site-header');
  const navLinks = Array.from(document.querySelectorAll('.navbar__links a'));
  const sections = navLinks
    .map(link => {
      const id = link.getAttribute('href');
      if (!id || !id.startsWith('#')) return null;
      return document.querySelector(id);
    })
    .filter(Boolean);

  const revealSelectors = [
    '.hero__content > *',
    '.hero__visual',
    '.section-heading',
    '.about-card',
    '.feature-card',
    '.gallery-card',
    '.download-card',
    '.footer__brand',
    '.footer__links a'
  ];

  const revealElements = Array.from(
    new Set(
      revealSelectors.flatMap(selector => Array.from(document.querySelectorAll(selector)))
    )
  );

  const addRuntimeStyles = () => {
    const style = document.createElement('style');
    style.textContent = `
      .site-header {
        transition:
          background 180ms cubic-bezier(0.16, 1, 0.3, 1),
          border-color 180ms cubic-bezier(0.16, 1, 0.3, 1),
          box-shadow 180ms cubic-bezier(0.16, 1, 0.3, 1);
      }

      .site-header.is-scrolled {
        background: linear-gradient(180deg, rgba(7, 11, 20, 0.96), rgba(7, 11, 20, 0.82));
        border-bottom-color: rgba(255, 255, 255, 0.1);
        box-shadow: 0 16px 40px rgba(0, 0, 0, 0.22);
      }

      .navbar__links a.is-active {
        color: var(--color-text);
      }

      .navbar__links a.is-active::after {
        transform: scaleX(1);
      }

      .reveal-item {
        opacity: 0;
        filter: blur(8px);
        clip-path: inset(0 0 14% 0 round 0.5rem);
        transition:
          opacity 700ms cubic-bezier(0.16, 1, 0.3, 1),
          filter 700ms cubic-bezier(0.16, 1, 0.3, 1),
          clip-path 700ms cubic-bezier(0.16, 1, 0.3, 1);
        transition-delay: var(--reveal-delay, 0ms);
        will-change: opacity, filter, clip-path;
      }

      .reveal-item.is-visible {
        opacity: 1;
        filter: blur(0);
        clip-path: inset(0 0 0 0 round 0.5rem);
      }

      @media (prefers-reduced-motion: reduce) {
        .reveal-item {
          opacity: 1 !important;
          filter: none !important;
          clip-path: none !important;
          transition: none !important;
        }
      }
    `;
    document.head.appendChild(style);
  };

  const updateHeaderState = () => {
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 12);
  };

  const updateActiveNav = () => {
    if (!sections.length || !navLinks.length) return;

    const scrollPosition = window.scrollY + 140;
    let currentId = sections[0].id;

    sections.forEach(section => {
      if (section.offsetTop <= scrollPosition) {
        currentId = section.id;
      }
    });

    navLinks.forEach(link => {
      const isActive = link.getAttribute('href') === `#${currentId}`;
      link.classList.toggle('is-active', isActive);
      if (isActive) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  };

  const initReveal = () => {
    revealElements.forEach((element, index) => {
      element.classList.add('reveal-item');
      element.style.setProperty('--reveal-delay', `${Math.min(index % 6, 5) * 70}ms`);
    });

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      revealElements.forEach(element => element.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.14,
        rootMargin: '0px 0px -8% 0px'
      }
    );

    revealElements.forEach(element => observer.observe(element));
  };

  const initSmoothAnchorState = () => {
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navLinks.forEach(item => item.classList.remove('is-active'));
        link.classList.add('is-active');
      });
    });
  };

  const init = () => {
    addRuntimeStyles();
    initReveal();
    initSmoothAnchorState();
    updateHeaderState();
    updateActiveNav();

    window.addEventListener('scroll', () => {
      updateHeaderState();
      updateActiveNav();
    }, { passive: true });

    window.addEventListener('resize', updateActiveNav);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();