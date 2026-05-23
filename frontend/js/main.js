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
        // Only show cards that match the selected category
        card.style.display = match ? '' : 'none';
      });

      // Show/hide insight cards based on filter
      const insightsContainer = document.querySelector('[data-insights-container]');
      if (insightsContainer) {
        const insightCards = insightsContainer.querySelectorAll('[data-insight-filter]');
        insightCards.forEach((card) => {
          const insightFilter = card.dataset.insightFilter;
          const shouldShow = category !== 'all' && insightFilter === category;
          card.style.display = shouldShow ? 'block' : 'none';
        });
        insightsContainer.style.display = category === 'all' ? 'none' : 'block';
      }
    }, { once: false });

    // Hide insights on initial load
    const insightsContainer = document.querySelector('[data-insights-container]');
    if (insightsContainer) {
      insightsContainer.style.display = 'none';
    }
  }

  function renderWorks(works) {
    if (!works.length) {
      worksGrid.innerHTML = '<p class="empty-state">No artworks have been uploaded yet. Add the first piece from the admin dashboard.</p>';
      return;
    }

    worksGrid.innerHTML = works
      .map((work, index) => {
        const category = String(work.category || 'All');
        const imageUrl = work.imageUrl || work.image || '';
        const title = work.title || 'Untitled';
        const year = work.year || '';

        return `
          <article class="work-card reveal" tabindex="0" role="button" aria-label="Open ${escapeHtml(title)}" data-category="${escapeHtml(category.toLowerCase())}" data-image="${escapeHtml(imageUrl)}" data-title="${escapeHtml(title)}" data-meta="${escapeHtml(`${category} | ${year}`)}" style="transition-delay:${index * 0.06}s">
            <img src="${imageUrl}" alt="${escapeHtml(title)}" loading="lazy">
            <div class="work-card-overlay">
              <div class="work-card-title">${escapeHtml(title)}</div>
              <div class="work-card-cat">${escapeHtml(category)} | ${escapeHtml(year)}</div>
            </div>
            <button class="work-card-arrow" type="button" aria-label="Open ${escapeHtml(title)}">↗</button>
          </article>
        `;
      })
      .join('');

    initScrollReveal();
    initWorkLightbox();
  }

  function initWorkLightbox() {
    if (!worksGrid || worksGrid.dataset.lightboxReady === 'true') {
      return;
    }

    worksGrid.dataset.lightboxReady = 'true';

    worksGrid.addEventListener('click', (event) => {
      const card = event.target.closest('.work-card');

      if (!card || card.classList.contains('filtered-out')) {
        return;
      }

      openWorkLightbox(card);
    });

    worksGrid.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') {
        return;
      }

      const card = event.target.closest('.work-card');

      if (!card || card.classList.contains('filtered-out')) {
        return;
      }

      event.preventDefault();
      openWorkLightbox(card);
    });
  }

  function openWorkLightbox(card) {
    const image = card.dataset.image;

    if (!image) {
      return;
    }

    const lightbox = getWorkLightbox();
    const img = lightbox.querySelector('[data-lightbox-image]');
    const title = lightbox.querySelector('[data-lightbox-title]');
    const meta = lightbox.querySelector('[data-lightbox-meta]');

    img.src = image;
    img.alt = card.dataset.title || 'Artwork';
    title.textContent = card.dataset.title || 'Untitled';
    meta.textContent = card.dataset.meta || '';
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.classList.add('lightbox-open');
    lightbox.querySelector('[data-lightbox-close]').focus();
  }

  function getWorkLightbox() {
    let lightbox = document.querySelector('[data-work-lightbox]');

    if (lightbox) {
      return lightbox;
    }

    lightbox = document.createElement('div');
    lightbox.className = 'work-lightbox';
    lightbox.dataset.workLightbox = '';
    lightbox.setAttribute('aria-hidden', 'true');
    lightbox.innerHTML = `
      <div class="work-lightbox-backdrop" data-lightbox-close></div>
      <figure class="work-lightbox-panel" role="dialog" aria-modal="true" aria-label="Artwork preview">
        <button class="work-lightbox-close" type="button" data-lightbox-close aria-label="Close image">×</button>
        <img class="work-lightbox-image" data-lightbox-image src="" alt="">
        <figcaption class="work-lightbox-caption">
          <span data-lightbox-title></span>
          <small data-lightbox-meta></small>
        </figcaption>
      </figure>
    `;
    document.body.appendChild(lightbox);

    lightbox.addEventListener('click', (event) => {
      if (event.target.closest('[data-lightbox-close]')) {
        closeWorkLightbox();
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && lightbox.classList.contains('open')) {
        closeWorkLightbox();
      }
    });

    return lightbox;
  }

  function closeWorkLightbox() {
    const lightbox = document.querySelector('[data-work-lightbox]');

    if (!lightbox) {
      return;
    }

    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('lightbox-open');
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
        _id: 'texture-01',
        title: 'Texture Art Study 01',
        category: 'Texture Art',
        year: 2026,
        imageUrl: 'assets/works/texture-art-01.jpeg'
      },
      {
        _id: 'texture-02',
        title: 'Texture Art Study 02',
        category: 'Texture Art',
        year: 2026,
        imageUrl: 'assets/works/texture-art-02.jpeg'
      },
      {
        _id: 'texture-03',
        title: 'Texture Art Study 03',
        category: 'Texture Art',
        year: 2026,
        imageUrl: 'assets/works/texture-art-03.jpeg'
      },
      {
        _id: 'texture-04',
        title: 'Texture Art Study 04',
        category: 'Texture Art',
        year: 2026,
        imageUrl: 'assets/works/texture-art-04.jpeg'
      },
      {
        _id: 'texture-05',
        title: 'Texture Art Study 05',
        category: 'Texture Art',
        year: 2026,
        imageUrl: 'assets/works/texture-art-05.jpeg'
      },
      {
        _id: 'mural-01',
        title: 'Wall Mural Study 01',
        category: 'Wall Murals',
        year: 2026,
        imageUrl: 'assets/works/wall-mural-01.jpeg'
      },
      {
        _id: 'mural-02',
        title: 'Wall Mural Study 02',
        category: 'Wall Murals',
        year: 2026,
        imageUrl: 'assets/works/wall-mural-02.jpeg'
      },
      {
        _id: 'mural-03',
        title: 'Wall Mural Study 03',
        category: 'Wall Murals',
        year: 2026,
        imageUrl: 'assets/works/wall-mural-03.jpeg'
      },
      {
        _id: 'mural-04',
        title: 'Wall Mural Study 04',
        category: 'Wall Murals',
        year: 2026,
        imageUrl: 'assets/works/wall-mural-04.jpeg'
      },
      {
        _id: 'mural-05',
        title: 'Wall Mural Study 05',
        category: 'Wall Murals',
        year: 2026,
        imageUrl: 'assets/works/wall-mural-05.jpeg'
      },
      {
        _id: 'mural-06',
        title: 'Wall Mural Study 06',
        category: 'Wall Murals',
        year: 2026,
        imageUrl: 'assets/works/wall-mural-06.jpeg'
      },
      {
        _id: 'mural-07',
        title: 'Wall Mural Study 07',
        category: 'Wall Murals',
        year: 2026,
        imageUrl: 'assets/works/wall-mural-07.jpeg'
      },
      {
        _id: 'mural-08',
        title: 'Wall Mural Study 08',
        category: 'Wall Murals',
        year: 2026,
        imageUrl: 'assets/works/wall-mural-08.jpeg'
      },
      {
        _id: 'mural-09',
        title: 'Wall Mural Study 09',
        category: 'Wall Murals',
        year: 2026,
        imageUrl: 'assets/works/wall-mural-09.jpeg'
      },
      {
        _id: 'mural-10',
        title: 'Wall Mural Study 10',
        category: 'Wall Murals',
        year: 2026,
        imageUrl: 'assets/works/wall-mural-10.jpeg'
      },
      {
        _id: 'mural-11',
        title: 'Wall Mural Study 11',
        category: 'Wall Murals',
        year: 2026,
        imageUrl: 'assets/works/wall-mural-11.jpeg'
      },
      {
        _id: 'mural-12',
        title: 'Wall Mural Study 12',
        category: 'Wall Murals',
        year: 2026,
        imageUrl: 'assets/works/wall-mural-12.jpeg'
      },
      {
        _id: 'mural-13',
        title: 'Wall Mural Study 13',
        category: 'Wall Murals',
        year: 2026,
        imageUrl: 'assets/works/wall-mural-13.jpeg'
      },
      {
        _id: 'bedback-01',
        title: 'Bedback Mural Study 01',
        category: 'Wall Murals',
        year: 2026,
        imageUrl: 'assets/works/wardrobe-03.jpeg'
      },
      {
        _id: 'bedback-02',
        title: 'Bedback Mural Study 02',
        category: 'Wall Murals',
        year: 2026,
        imageUrl: 'assets/works/wardrobe-04.jpeg'
      },
      {
        _id: 'wardrobe-01',
        title: 'Wardrobe Study 01',
        category: 'Wardrobes',
        year: 2026,
        imageUrl: 'assets/works/wardrobe-01.jpeg'
      },
      {
        _id: 'wardrobe-02',
        title: 'Wardrobe Study 02',
        category: 'Wardrobes',
        year: 2026,
        imageUrl: 'assets/works/wardrobe-02.jpeg'
      },
      {
        _id: 'wardrobe-03',
        title: 'Wardrobe Study 03',
        category: 'Wardrobes',
        year: 2026,
        imageUrl: 'assets/works/wardrobe-03.jpeg'
      },
      {
        _id: 'wardrobe-04',
        title: 'Wardrobe Study 04',
        category: 'Wardrobes',
        year: 2026,
        imageUrl: 'assets/works/wardrobe-04.jpeg'
      },
      {
        _id: 'wardrobe-05',
        title: 'Wardrobe Study 05',
        category: 'Wardrobes',
        year: 2026,
        imageUrl: 'assets/works/wardrobe-05.jpeg'
      },
      {
        _id: 'wardrobe-06',
        title: 'Wardrobe Study 06',
        category: 'Wardrobes',
        year: 2026,
        imageUrl: 'assets/works/wardrobe-06.jpeg'
      },
      {
        _id: 'wardrobe-07',
        title: 'Wardrobe Study 07',
        category: 'Wardrobes',
        year: 2026,
        imageUrl: 'assets/works/wardrobe-07.jpeg'
      },
      {
        _id: 'wardrobe-08',
        title: 'Wardrobe Study 08',
        category: 'Wardrobes',
        year: 2026,
        imageUrl: 'assets/works/wardrobe-08.jpeg'
      },
      {
        _id: 'wardrobe-09',
        title: 'Wardrobe Study 09',
        category: 'Wardrobes',
        year: 2026,
        imageUrl: 'assets/works/wardrobe-09.jpeg'
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
