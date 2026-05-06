/* ============================================================
   RACHANATMAK — main.js v2
   Page transitions, scroll reveal, nav, filters, API works
   ============================================================ */

(function () {
  'use strict';

  const worksGrid = document.querySelector('[data-works-grid], .works-grid');
  const filterBar = document.querySelector('[data-filter-bar], .works-filter-bar');
  const featuredOnly = document.body.dataset.page === 'home';
  const isGithubPages = window.location.hostname.endsWith('github.io');

  document.addEventListener('DOMContentLoaded', () => {
    initPageTransitions();
    initNavbar();
    initScrollReveal();
    initPointerTilt();

    if (worksGrid) {
      loadWorks();
    }
  });

  function initPageTransitions() {
    let overlay = document.querySelector('.page-transition-overlay');

    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'page-transition-overlay';
      document.body.appendChild(overlay);
    }

    overlay.classList.add('page-exit');
    overlay.addEventListener('animationend', () => overlay.classList.remove('page-exit'), { once: true });

    document.addEventListener('click', (event) => {
      const link = event.target.closest('a[href]');

      if (!link) {
        return;
      }

      const href = link.getAttribute('href');

      if (
        !href ||
        href.startsWith('#') ||
        href.startsWith('http') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        link.target === '_blank'
      ) {
        return;
      }

      event.preventDefault();
      overlay.classList.add('page-enter');
      overlay.addEventListener('animationend', () => {
        window.location.href = href;
      }, { once: true });
    });
  }

  function initNavbar() {
    const navbar = document.querySelector('.navbar, .site-nav');

    if (!navbar) {
      return;
    }

    const onScroll = () => navbar.classList.toggle('scrolled', window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    const path = window.location.pathname.split('/').pop() || 'index.html';

    document.querySelectorAll('.navbar-links a, .navbar-mobile-drawer a, .nav-links a').forEach((link) => {
      const href = (link.getAttribute('href') || '').split('/').pop() || 'index.html';

      if (href === path) {
        link.classList.add('active', 'is-active');
      }
    });

    const hamburger = document.querySelector('.navbar-hamburger');
    const drawer = document.querySelector('.navbar-mobile-drawer');

    if (hamburger && drawer) {
      hamburger.addEventListener('click', () => {
        const open = drawer.classList.toggle('open');
        hamburger.classList.toggle('open', open);
        hamburger.setAttribute('aria-expanded', String(open));
      });
    }
  }

  function initScrollReveal() {
    const elements = document.querySelectorAll('.reveal:not(.visible), [data-reveal]:not(.is-visible)');

    if (!elements.length) {
      return;
    }

    if (!('IntersectionObserver' in window)) {
      elements.forEach(showReveal);
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (!entry.isIntersecting) {
          return;
        }

        setTimeout(() => showReveal(entry.target), index * 70);
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    elements.forEach((element) => observer.observe(element));
  }

  function showReveal(element) {
    element.classList.add('visible', 'is-visible');
  }

  async function loadWorks() {
    try {
      if (isGithubPages) {
        const works = getGithubPagesWorks();
        const visibleWorks = featuredOnly ? works.slice(0, 8) : works;
        renderFilters(works);
        renderWorks(visibleWorks);
        return;
      }

      const response = await fetch('api/works');

      if (!response.ok) {
        throw new Error('Failed to fetch artworks.');
      }

      const works = await response.json();
      const visibleWorks = featuredOnly ? works.slice(0, 8) : works;

      renderFilters(works);
      renderWorks(visibleWorks);
    } catch (error) {
      worksGrid.innerHTML = '<p class="empty-state">Artworks could not be loaded. Please try again soon.</p>';
    }
  }

  function renderFilters(works) {
    if (!filterBar || featuredOnly) {
      return;
    }

    const categories = ['All', ...new Set(works.map((work) => work.category).filter(Boolean))];

    filterBar.innerHTML = categories
      .map((category, index) => {
        const activeClass = index === 0 ? 'active is-active' : '';
        return `<button class="filter-btn ${activeClass}" type="button" data-filter="${escapeHtml(category.toLowerCase())}">${escapeHtml(category)}</button>`;
      })
      .join('');

    filterBar.addEventListener('click', (event) => {
      const button = event.target.closest('.filter-btn');

      if (!button) {
        return;
      }

      document.querySelectorAll('.filter-btn').forEach((filterButton) => filterButton.classList.remove('active', 'is-active'));
      button.classList.add('active', 'is-active');

      const category = button.dataset.filter;

      worksGrid.querySelectorAll('.work-card').forEach((card) => {
        const match = category === 'all' || card.dataset.category === category;
        card.classList.toggle('filtered-out', !match);
      });
    }, { once: false });
  }

  function renderWorks(works) {
    if (!works.length) {
      worksGrid.innerHTML = '<p class="empty-state">No artworks have been uploaded yet. Add the first piece from the admin dashboard.</p>';
      return;
    }

    worksGrid.innerHTML = works
      .map((work, index) => {
        const category = String(work.category || 'All');

        return `
          <article class="work-card reveal" data-category="${escapeHtml(category.toLowerCase())}" style="transition-delay:${index * 0.06}s">
            <img src="${work.imageUrl || work.image || ''}" alt="${escapeHtml(work.title || 'Artwork')}" loading="lazy">
            <div class="work-card-overlay">
              <div class="work-card-title">${escapeHtml(work.title || 'Untitled')}</div>
              <div class="work-card-cat">${escapeHtml(category)} | ${escapeHtml(work.year || '')}</div>
            </div>
            <div class="work-card-arrow" aria-hidden="true">↗</div>
          </article>
        `;
      })
      .join('');

    initScrollReveal();
  }

  function initPointerTilt() {
    const card = document.querySelector('.art-in-motion-card, .signature-card');

    if (!card) {
      return;
    }

    window.addEventListener('pointermove', (event) => {
      const x = (event.clientX / window.innerWidth - 0.5) * 10;
      const y = (event.clientY / window.innerHeight - 0.5) * -10;
      card.style.setProperty('--tilt-x', `${y}deg`);
      card.style.setProperty('--tilt-y', `${x}deg`);
    }, { passive: true });
  }

  function getGithubPagesWorks() {
    return [
      {
        _id: 'demo-01',
        title: 'Lake View Balcony',
        category: 'Residential',
        year: 2023,
        imageUrl: createArtworkSvg({
          sky: '#61c8ee',
          water: '#7fc9d6',
          accent: '#356b2f',
          floor: '#57401f'
        })
      },
      {
        _id: 'demo-02',
        title: 'Quiet Geometry',
        category: 'Commercial',
        year: 2025,
        imageUrl: createArtworkSvg({
          sky: '#d8e0d7',
          water: '#567ba4',
          accent: '#d97a31',
          floor: '#2a2a33'
        })
      },
      {
        _id: 'demo-03',
        title: 'Warm Interior Study',
        category: 'Corporate',
        year: 2024,
        imageUrl: createArtworkSvg({
          sky: '#efe4cb',
          water: '#8f8a71',
          accent: '#ce5a2b',
          floor: '#4f3625'
        })
      },
      {
        _id: 'demo-04',
        title: 'Garden Threshold',
        category: 'Residential',
        year: 2026,
        imageUrl: createArtworkSvg({
          sky: '#b7dfe6',
          water: '#639ec2',
          accent: '#4f8d38',
          floor: '#49311e'
        })
      }
    ];
  }

  function createArtworkSvg(palette) {
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 1200" role="img" aria-label="Artwork preview">
        <rect width="900" height="1200" fill="${palette.sky}"/>
        <rect y="540" width="900" height="180" fill="${palette.water}"/>
        <rect y="720" width="900" height="180" fill="${palette.accent}" opacity="0.45"/>
        <path d="M-80 1000 C180 760 720 760 980 1000 L980 1320 L-80 1320 Z" fill="${palette.floor}"/>
        <path d="M80 900 C250 760 650 760 820 900" fill="none" stroke="#111" stroke-width="16"/>
        <path d="M80 900 C250 760 650 760 820 900" fill="none" stroke="#111" stroke-width="4" transform="translate(0 36)"/>
        <g stroke="#111" stroke-width="8">
          <line x1="135" y1="892" x2="135" y2="710"/>
          <line x1="225" y1="840" x2="225" y2="680"/>
          <line x1="315" y1="800" x2="315" y2="655"/>
          <line x1="405" y1="776" x2="405" y2="640"/>
          <line x1="495" y1="776" x2="495" y2="640"/>
          <line x1="585" y1="800" x2="585" y2="655"/>
          <line x1="675" y1="840" x2="675" y2="680"/>
          <line x1="765" y1="892" x2="765" y2="710"/>
        </g>
        <rect x="0" y="0" width="900" height="1200" fill="url(#grain)" opacity="0.16"/>
        <defs>
          <pattern id="grain" width="90" height="90" patternUnits="userSpaceOnUse">
            <path d="M0 12 H90 M0 45 H90 M0 78 H90 M12 0 V90 M45 0 V90 M78 0 V90" stroke="white" stroke-opacity="0.22" stroke-width="1"/>
          </pattern>
        </defs>
      </svg>
    `;

    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }
})();
