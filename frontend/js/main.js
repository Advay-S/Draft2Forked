/* ============================================================
   RACHANATMAK — main.js v2
   Page transitions, scroll reveal, nav, filters, API works
   ============================================================ */

(function () {
  'use strict';

  const worksGrid = document.querySelector('[data-works-grid], .works-grid');
  const filterBar = document.querySelector('[data-filter-bar], .works-filter-bar');
  const featuredOnly = document.body.dataset.page === 'home';
  const workInsights = [
    {
      category: 'Wall Murals',
      className: 'insight-card-murals',
      video: 'assets/works/Wall-murals-bg.mp4',
     points: [
       ['Large scale artworks created directly on walls.'],
       ['Flexible themes, styles, colours, and compositions to suit the space'],
       ['Durable unlike wallpapers that may peel overtime.']
              ]
    },
    {
      category: 'Canvas Paintings',
      className: 'insight-card-canvas',
      video: 'assets/works/Canvas-paintings-bg.mp4',
     points: [
       ['Artwork created on stretched woven cotton fabric using medium like acrylic, oil or watercolour.'],
       ['Lightweight and portable'],
       ['Available in multiple sizes for different spaces']
              ]
    },
    {
      category: 'Texture Art',
      className: 'insight-card-texture',
      video: 'assets/works/Texture-art-bg.mp4',
      points: [
       ['Artwork created using a texture paste primarily consisting of pop & putty.'],
       ['Enhances shadows and highlights'],
       ['A great alternative to flat wall finishes.']
]
    },
    {
      category: 'Wardrobes',
      className: 'insight-card-wardrobes',
      video: 'assets/works/Wadrobe-bg.mp4',
      points: [
      ['Wardrobe painting is created directly on plywood/MDF instead of laminates.'],
      ['The surface is prepared with putty, primer, and base coats to achieve a smooth finish for painting.'],
      ['Allows a creative freedom in terms of colours, textures and finishes.']
]
    }
  ];

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
    }, { threshold: 0, rootMargin: '0px 0px -40px 0px' });

    elements.forEach((element) => observer.observe(element));
  }

  function showReveal(element) {
    element.classList.add('visible', 'is-visible');
  }

  function shuffleArray(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

async function loadWorks() {
    const works = getBundledWorks();

    let visibleWorks = works;

    if (featuredOnly) {
        visibleWorks = [
            ...shuffleArray(
                works.filter(w => w.category === 'Wall Murals')
            ).slice(0, 2),

            ...shuffleArray(
                works.filter(w => w.category === 'Canvas Paintings')
            ).slice(0, 2),

            ...shuffleArray(
                works.filter(w => w.category === 'Texture Art')
            ).slice(0, 2),

            ...shuffleArray(
                works.filter(w => w.category === 'Wardrobes')
            ).slice(0, 2)
        ];
    }

    renderFilters(works);
    renderWorks(visibleWorks);
}


  function renderFilters(works) {
    if (!filterBar || featuredOnly) {
      return;
    }

    const categories = getOrderedCategories(works);

    filterBar.innerHTML = categories
      .map((category, index) => {
        const activeClass = index === 0 ? 'active is-active' : '';
        return `<button class="filter-btn ${activeClass}" type="button" data-filter="${escapeHtml(normalizeCategory(category))}">${escapeHtml(category)}</button>`;
      })
      .join('');


    filterBar.addEventListener('click', (event) => {
      const button = event.target.closest('.filter-btn');

      if (!button) {
        return;
      }

      filterBar.querySelectorAll('.filter-btn').forEach((filterButton) => filterButton.classList.remove('active', 'is-active'));
      button.classList.add('active', 'is-active');
      setActiveWorkSection(button.dataset.filter);
    });
  }

  function renderWorks(works) {
    if (!works.length) {
      worksGrid.innerHTML = '<p class="empty-state">No artworks have been uploaded yet. Add the first piece from the admin dashboard.</p>';
      return;
    }

    if (featuredOnly) {
      worksGrid.innerHTML = works.map((work, index) => renderWorkCard(work, index)).join('');
      initScrollReveal();
      initWorkLightbox();
      return;
    }

    worksGrid.innerHTML = getOrderedCategories(works)
      .map((category) => {
        const insight = getInsightForCategory(category);
        const categoryWorks = works.filter((work) => normalizeCategory(work.category) === normalizeCategory(category));

        if (!categoryWorks.length) {
          return '';
        }

        return `
         <section class="work-category-section ${escapeHtml(normalizeCategory(category).replace(/\s+/g, '-'))}"
         data-work-section="${escapeHtml(normalizeCategory(category))}">
         <div class="work-section-top">

  ${insight?.video ? `
    <video
      class="section-bg-video"
      autoplay
      muted
      loop
      playsinline
      preload="auto"
      oncanplay="this.play()"
    >
      <source src="${insight.video}" type="video/mp4">
    </video>
  ` : ''}

  ${insight ? renderInsightCard(insight) : ''}

</div>
            <div class="work-section-grid">
              ${categoryWorks.map((work, index) => renderWorkCard(work, index)).join('')}
            </div>
          </section>
        `;
      })
      .join('');

    initScrollReveal();
    initWorkLightbox();
    setActiveWorkSection(getOrderedCategories(works)[0]);
  }

  function setActiveWorkSection(category) {
    const activeCategory = normalizeCategory(category);

    worksGrid.querySelectorAll('[data-work-section]').forEach((section) => {
      section.classList.toggle('is-hidden', section.dataset.workSection !== activeCategory);
    });
  }

  function renderWorkCard(work, index) {
    const category = String(work.category || 'Artwork');
    const imageUrl = work.imageUrl || work.image || '';
    const title = work.title || 'Untitled';
    const year = work.year || '';
    const meta = year ? `${category} | ${year}` : category;

    return `
      <article class="work-card" tabindex="0" role="button" aria-label="Open ${escapeHtml(title)}" data-category="${escapeHtml(category.toLowerCase())}" data-image="${escapeHtml(imageUrl)}" data-title="${escapeHtml(title)}" data-meta="${escapeHtml(meta)}" style="transition-delay:${index * 0.04}s">
        <img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(title)}">
        <div class="work-card-overlay">
          <div class="work-card-title">${escapeHtml(title)}</div>
          <div class="work-card-cat">${escapeHtml(meta)}</div>
        </div>
        <button class="work-card-arrow" type="button" aria-label="Open ${escapeHtml(title)}">&#8599;</button>
      </article>
    `;
  }

  function renderInsightCard(insight) {
    return `
      <article class="insight-card ${escapeHtml(insight.className)}">
        <!-- title removed -->
        <ul>
         ${insight.points.map(([text]) => `<li>${escapeHtml(text)}</li>`).join('')} </ul>
      </article>
    `;
  }

  function normalizeCategory(category) {
    return String(category || '').trim().toLowerCase();
  }

  function getOrderedCategories(works) {
    const preferredOrder = ['Wall Murals', 'Canvas Paintings', 'Texture Art', 'Wardrobes'];
    const available = new Set(works.map((work) => work.category).filter(Boolean));
    const ordered = preferredOrder.filter((category) => available.has(category));
    const remaining = [...available].filter((category) => !preferredOrder.includes(category));

    return [...ordered, ...remaining];
  }

  function getInsightForCategory(category) {
    return workInsights.find((insight) => normalizeCategory(insight.category) === normalizeCategory(category));
  }

  function mergeBundledCanvasWorks(works) {
    const list = Array.isArray(works) ? works.slice() : [];
    const hasCanvas = list.some((work) => normalizeCategory(work.category) === 'canvas paintings');

    return hasCanvas ? list : [...list, ...getCanvasWorks()];
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

  function getBundledWorks() {
    return [
      ...getTextureWorks(),
      ...getCanvasWorks(),
      ...getMuralWorks(),
      ...getWardrobeWorks()
    ];
  }

  function getCanvasWorks() {
    return [
      {
        _id: 'abstract-72x36-acrylics-kondhwa-pune-2025',
        title: 'Abstract — 72” x 36” — Acrylics on Canvas — Kondhwa Pune 2025',
        category: 'Canvas Paintings',
        year: 2025,
        imageUrl: 'assets/works/canvas/Abstract _ 72” x 36” _ acrylics on canvas_ 2025, Kondhwa Pune.jpg'
      },
      // Latest canvas sss
      {
        //done
        _id: 'abstract-acrylics-on-canvas-18x24-2025',
        title: 'Abstract _ Acrylics on canvas _ 18” x 24” - 2025',
        category: 'Canvas Paintings',
        year: 2025,
        imageUrl: 'assets/works/canvas/Latest/Abstract _ Acrylics on canvas _ 18” x 24” - 2025.jpg'
      },
      {
        //done
        _id: 'abstract-acrylics-on-canvas-20x20-2025',
        title: 'Abstract _ Acrylics on canvas _ 20” x 20” - 2025',
        category: 'Canvas Paintings',
        year: 2025,
        imageUrl: 'assets/works/canvas/Latest/Abstract _ Acrylics on canvas _ 20” x 20” - 2025.jpg'
      }, 
      { //done
        _id: 'peace-acrylics-on-canvas-10x14-2026',
        title: 'Peace _ Acrylics on canvas _ 10” x 14” - 2026',
        category: 'Canvas Paintings',
        year: 2026,
        imageUrl: 'assets/works/canvas/Latest/Peace _ Acrylics on canvas _ 10” x 14” - 2026.jpg'
      },
      { //done
        _id: 'the-subtle-system-acrylics-on-canvas-18x24-2025',
        title: 'The Subtle System _ Acrylics on canvas _ 18” x 24” - 2025',
        category: 'Canvas Paintings',
        year: 2025,
        imageUrl: 'assets/works/canvas/Latest/The Subtle System _ Acrylics on canvas _ 18” x 24” - 2025.jpg'
      },
      {
    _id: 'untitled-8x10-acrylics-on-canvas-2024',
    title: 'Untitled _ 8” x 10” _ Acrylics on canvas - 2024',
    category: 'Canvas Paintings',
    year: 2024,
    imageUrl: 'assets/works/canvas/Latest/Untitled _ 8” x 10” _ Acrylics on canvas - 2024.jpg'
      },
      {
    _id: 'untitled-12x18-acrylics-on-canvas-2024',
    title: 'Untitled _ 12” x 18” _ Acrylics on canvas - 2024',
    category: 'Canvas Paintings',
    year: 2024,
    imageUrl: 'assets/works/canvas/Latest/Untitled _ 12” x 18” _ Acrylics on canvas - 2024.jpg'
      },
      {
    _id: 'untitled-acrylics-on-canvas-18x24-2024',
    title: 'Untitled _ Acrylics on canvas _ 18_ x 24_ - 2024',
    category: 'Canvas Paintings',
    year: 2024,
    imageUrl: 'assets/works/canvas/Latest/Untitled _ Acrylics on canvas _ 18_ x 24_ - 2024.jpg'
      },
      // Latest end 
      {
        _id: 'abstract-72x36-acrylics-kondhwa-pune-2025-2',
        title: 'Abstract — 72” x 36” — Acrylics on Canvas — Kondhwa Pune 2025 (Alternate View)',
        category: 'Canvas Paintings',
        year: 2025,
        imageUrl: 'assets/works/canvas/Abstract _ 72” x 36” _ acrylics on canvas_ 2025, Kondhwa Pune(1).jpg'
      },
      {
        _id: 'motifs-18x36-acrylics-raigad-2025',
        title: 'Motifs — 18” x 36” — Acrylics on Canvas — Raigad 2025',
        category: 'Canvas Paintings',
        year: 2025,
        imageUrl: 'assets/works/canvas/Motifs _ 18” x 36” _ acrylics on canvas, 2025, Raigad .jpg'
      },
      {
        _id: 'snow-mountains-72x48-acrylics-mundhwa-pune-2025',
        title: 'Snow Mountains — 72” x 48” — Acrylics on Canvas — Mundhwa Pune 2025',
        category: 'Canvas Paintings',
        year: 2025,
        imageUrl: 'assets/works/canvas/Snow mountains _ 72” x 48” _ Acrylics on canvas _ 2025, Mundhwa, Pune.jpg'
      },
      {
        _id: 'southern-star-golf-course-camp-pune-2025',
        title: 'Southern Star Golf Course — Camp Pune 2025',
        category: 'Canvas Paintings',
        year: 2025,
        imageUrl: 'assets/works/canvas/Southern star golf course, camp, Pune 2025.jpg'
      },
      {
        _id: 'the-elephant-2024',
        title: 'The Elephant — 2024',
        category: 'Canvas Paintings',
        year: 2024,
        imageUrl: 'assets/works/canvas/The Elephant - 2024.jpg'
      }
    ];
  }

  function getTextureWorks() {
    return [
      {
        _id: 'abstract-72x36-mdf-material-kondhwa-pune-2025',
        title: 'Abstract — 72” x 36” — MDF Material — Kondhwa Pune 2025',
        category: 'Texture Art',
        year: 2025,
        imageUrl: 'assets/works/texture/Abstract _ 72” x 36” _ MDF material _ 2025, Kondhwa Pune.jpg'
      },
      {
        _id: 'r-p-kothrud-pune-2024',
        title: 'Residential Project Kothrud Pune 2024',
        category: 'Texture Art',
        year: 2024,
        imageUrl: 'assets/works/texture/R P Kothrud Pune 2024.jpg'
      },
      {
        _id: 'residential-project-pune-2024',
        title: 'Residential Project — Pune 2024',
        category: 'Texture Art',
        year: 2024,
        imageUrl: 'assets/works/texture/Residential project 2024.jpg'
      },
      {
        _id: 'residential-project-pune-2024-1',
        title: 'Residential Project — Pune 2024 (View 2)',
        category: 'Texture Art',
        year: 2024,
        imageUrl: 'assets/works/texture/Residential project 2024(1).jpg'
      },
      {
        _id: 'residential-project-pune-2024-2',
        title: 'Residential Project — Pune 2024 (View 3)',
        category: 'Texture Art',
        year: 2024,
        imageUrl: 'assets/works/texture/Residential project 2024(2).jpg'
      },
      {
        _id: 'residential-project-pune-2024-3',
        title: 'Residential Project — Pune 2024 (View 4)',
        category: 'Texture Art',
        year: 2024,
        imageUrl: 'assets/works/texture/Residential project 2024(3).jpg'
      },
      {
        _id: 'residential-project-pune-2024-variant',
        title: 'Residential Project — Pune 2024 (Pune Variation)',
        category: 'Texture Art',
        year: 2024,
        imageUrl: 'assets/works/texture/Residential Project, Pune - 2024 .jpg'
      },
      {
        _id: 'rp-kothrud-2025',
        title: 'Residential Project Kothrud 2025',
        category: 'Texture Art',
        year: 2025,
        imageUrl: 'assets/works/texture/RP Kothrud 2025.JPG'
      },
      {
        _id: 'rp-kothrud-pune-2025',
        title: 'Residential Project Kothrud Pune 2025',
        category: 'Texture Art',
        year: 2025,
        imageUrl: 'assets/works/texture/RP Kothrud Pune 2025.JPG'
      },
      {
        _id: 'rp-sinhgad-road-pune-2025',
        title: 'Residential Project Sinhgad Road — Pune 2025',
        category: 'Texture Art',
        year: 2025,
        imageUrl: 'assets/works/texture/RP sinhgad road, Pune 2025.jpg'
      }
    ];
  }

  function getWardrobeWorks() {
    return [
      {
        _id: 'residential-project-pune-2024',
        title: 'Residential Project — Pune 2024',
        category: 'Wardrobes',
        year: 2024,
        imageUrl: 'assets/works/wardrobe/Residential project Pune 2024.jpg'
      },
      {
        _id: 'residential-project-at-eka-elitas-kothrud-pune-2025',
        title: 'Residential Project at Eka Elitas — Kothrud Pune 2025',
        category: 'Wardrobes',
        year: 2025,
        imageUrl: 'assets/works/wardrobe/RP at eka elitas Kothrud 2025.jpg'
      },
      {
        _id: 'residential-project-eka-elitas-kothrud-pune-2025-2',
        title: 'Residential Project, Eka Elitas — Kothrud Pune 2025 (View 2)',
        category: 'Wardrobes',
        year: 2025,
        imageUrl: 'assets/works/wardrobe/RP eka elitas Kothrud 2025(1).jpg'
      },
      {
        _id: 'residential-project-eka-elitas-kothrud-pune-2025-3',
        title: 'Residential Project, Eka Elitas — Kothrud Pune 2025 (View 3)',
        category: 'Wardrobes',
        year: 2025,
        imageUrl: 'assets/works/wardrobe/Rp eka elitas Kothrud 2025.jpg'
      },
      {
        _id: 'residential-project-mundhwa-pune-2025',
        title: 'Residential Project, Mundhwa Pune 2025',
        category: 'Wardrobes',
        year: 2025,
        imageUrl: 'assets/works/wardrobe/RP mundhwa Pune 2025.jpg'
      },
      {
        _id: 'residential-project-mundhwa-pune-2025-alt',
        title: 'Residential Project, Mundhwa Pune 2025 (Alternate View)',
        category: 'Wardrobes',
        year: 2025,
        imageUrl: 'assets/works/wardrobe/RP. Mundhwa Pune 2025.jpg'
      },
      {
        _id: 'residential-project-mundhwa-pune-2025-detail-2',
        title: 'Residential Project, Mundhwa Pune 2025 (Detail 2)',
        category: 'Wardrobes',
        year: 2025,
        imageUrl: 'assets/works/wardrobe/RP mundhwa Pune 2025(1).jpg'
      },
      {
        _id: 'residential-project-mundhwa-pune-2025-detail-3',
        title: 'Residential Project, Mundhwa Pune 2025 (Detail 3)',
        category: 'Wardrobes',
        year: 2025,
        imageUrl: 'assets/works/wardrobe/RP mundhwa pune 2025(2).jpg'
      },
      {
        _id: 'residential-project-mundhwa-pune-2025-detail-4',
        title: 'Residential Project, Mundhwa Pune 2025 (Detail 4)',
        category: 'Wardrobes',
        year: 2025,
        imageUrl: 'assets/works/wardrobe/RP mundhwa Pune 2025(3).jpg'
      },
      {
        _id: 'residential-project-vimannagar-pune-2025',
        title: 'Residential Project, Vimannagar Pune 2025',
        category: 'Wardrobes',
        year: 2025,
        imageUrl: 'assets/works/wardrobe/RP vimannagar Pune 2025.jpg'
      }
    ];
  }

  function getMuralWorks() {
    return [
    {
      "_id": "architects-office-deccan-pune-2022",
      "title": "Architects Office, Deccan Pune - 2022",
      "category": "Wall Murals",
      "year": 2022,
      "imageUrl": "assets/works/murals/Architects Office, Deccan Pune - 2022.JPG"
    },
    {
      "_id": "aster-coworkinb-space-deccan-pune-2023",
      "title": "Aster coworking space Deccan Pune 2023",
      "category": "Wall Murals",
      "year": 2023,
      "imageUrl": "assets/works/murals/Aster coworkinb space Deccan Pune 2023.JPG"
    },
    {
      "_id": "coffee-house-restaurant-camp-pune-2025",
      "title": "Coffee house restaurant, camp Pune 2025",
      "category": "Wall Murals",
      "year": 2025,
      "imageUrl": "assets/works/murals/Coffee house restaurant, camp Pune 2025.JPG"
    },

    {
      "_id": "felice-restaurant-kothrud-pune-2025-1",
      "title": "Felice Restaurant, Kothrud Pune 2025 (1)",
      "category": "Wall Murals",
      "year": 2025,
      "imageUrl": "assets/works/murals/Felice Restaurant, Kothrud Pune 2025  (1).jpg"
    },
    { // to be added here 
      "_id": "felice-restaurant-kothrud-latest-update",
      "title": "Felice Restaurant, Kothrud Pune 2025 ",
      "category": "Wall Murals",
      "year": 2025,
      "imageUrl": "assets/works/murals/Felice Restaurant, Kothrud Latest update.JPG"
    },
    {
      "_id": "felice-restaurant-kothrud-pune-2025-1-1",
      "title": "Felice Restaurant, Kothrud Pune 2025 (1)",
      "category": "Wall Murals",
      "year": 2025,
      "imageUrl": "assets/works/murals/Felice Restaurant, Kothrud Pune 2025 (1).jpg"
    },
    {
      "_id": "house-of-veg-restaurant-erandwane-pune-2022",
      "title": "House of veg restaurant, Erandwane, Pune 2022",
      "category": "Wall Murals",
      "year": 2022,
      "imageUrl": "assets/works/murals/House of veg restaurant, Erandwane, Pune 2022.JPG"
    },
    {
      "_id": "kalash-properties-aundh-2024",
      "title": "Kalash Properties, Aundh 2024",
      "category": "Wall Murals",
      "year": 2024,
      "imageUrl": "assets/works/murals/Kalash Properties, Aundh 2024.jpg"
    },
    {
      "_id": "majestic-landmarks-balewadi-high-street-pune-2024",
      "title": "Majestic landmarks, Balewadi high street, Pune 2024",
      "category": "Wall Murals",
      "year": 2024,
      "imageUrl": "assets/works/murals/Majestic landmarks,  Balewadi high street, Pune 2024.jpg"
    },
    {
      "_id": "majestic-landmarks-balewadi-high-street-pune-2024-1",
      "title": "Majestic landmarks, Balewadi high street Pune 2024",
      "category": "Wall Murals",
      "year": 2024,
      "imageUrl": "assets/works/murals/Majestic landmarks, Balewadi high street Pune 2024.jpg"
    },
    {
      "_id": "mit-vpu-solapur-2025",
      "title": "MIT VPU, Solapur 2025",
      "category": "Wall Murals",
      "year": 2025,
      "imageUrl": "assets/works/murals/MIT VPU, Solapur 2025.jpg"
    },
    {
      "_id": "mtdc-aurangabad-2024",
      "title": "MTDC Aurangabad, 2024",
      "category": "Wall Murals",
      "year": 2024,
      "imageUrl": "assets/works/murals/MTDC Aurangabad, 2024.jpg"
    },
    {
      "_id": "r-p-pune-2026",
      "title": "Residential project pune 2026",
      "category": "Wall Murals",
      "year": 2026,
      "imageUrl": "assets/works/murals/R p pune 2026.jpg"
    },
    {
      "_id": "residential-project-2023",
      "title": "Residential project 2023",
      "category": "Wall Murals",
      "year": 2023,
      "imageUrl": "assets/works/murals/Residential project 2023.JPG"
    },
    {
      "_id": "restaurant-in-pune-2023",
      "title": "Restaurant in Pune - 2023",
      "category": "Wall Murals",
      "year": 2023,
      "imageUrl": "assets/works/murals/Restaurant in Pune - 2023.jpeg"
    },
    {
      "_id": "rp-bungalow-in-bhugaon-pune-is-2025-1",
      "title": "Residential Project _ Bungalow in Bhugaon, Pune is 2025 (1)",
      "category": "Wall Murals",
      "year": 2025,
      "imageUrl": "assets/works/murals/RP _ Bungalow in Bhugaon, Pune is 2025 (1).jpg"
    },
    {
      "_id": "rp-bungalow-in-bhugaon-pune-is-2025-2",
      "title": "Residential Project _ Bungalow in Bhugaon, Pune is 2025 (2)",
      "category": "Wall Murals",
      "year": 2025,
      "imageUrl": "assets/works/murals/RP _ Bungalow in Bhugaon, Pune is 2025 (2).jpg"
    },
    {
      "_id": "rp-bungalow-in-bhugaon-pune-is-2025",
      "title": "Residential Project _ Bungalow in Bhugaon, Pune is 2025",
      "category": "Wall Murals",
      "year": 2025,
      "imageUrl": "assets/works/murals/RP _ Bungalow in Bhugaon, Pune is 2025.jpg"
    },


    {
      "_id": "rp-amanora-township-pune-2025",
      "title": "Residential Project Amanora township Pune 2025",
      "category": "Wall Murals",
      "year": 2025,
      "imageUrl": "assets/works/murals/RP Amanora township Pune 2025.jpg"
    },
    {
      "_id": "rp-at-a-bungalow-in-kothrud-pune-2025-1",
      "title": "Residential Project at a bungalow in Kothrud Pune 2025",
      "category": "Wall Murals",
      "year": 2025,
      "imageUrl": "assets/works/murals/RP at a bungalow in Kothrud Pune 2025.jpg"
    },
    {
      "_id": "rp-balewadi-high-street-pune-2024",
      "title": "Residential Project Balewadi high street Pune 2024",
      "category": "Wall Murals",
      "year": 2024,
      "imageUrl": "assets/works/murals/RP Balewadi high street Pune 2024.JPG"
    },
    {
      "_id": "rp-baner-2025",
      "title": "Residential Project Baner 2025",
      "category": "Wall Murals",
      "year": 2025,
      "imageUrl": "assets/works/murals/RP Baner 2025.jpg"
    },
    {
      "_id": "rp-bhugaon-2025",
      "title": "Residential Project bhugaon 2025",
      "category": "Wall Murals",
      "year": 2025,
      "imageUrl": "assets/works/murals/RP bhugaon 2025.jpg"
    },
    {
      "_id": "rp-bhugaon-pune-2025",
      "title": "Residential Project bhugaon Pune 2025",
      "category": "Wall Murals",
      "year": 2025,
      "imageUrl": "assets/works/murals/RP bhugaon Pune 2025.jpg"
    },

    {
      "_id": "rp-eka-elitas-kothrud-pune-2026",
      "title": "Residential Project eka elitas Kothrud Pune 2026",
      "category": "Wall Murals",
      "year": 2026,
      "imageUrl": "assets/works/murals/RP eka elitas Kothrud Pune 2026.jpg"
    },
    {
      "_id": "rp-eka-elitas-kothrud-pune-2026-1-1",
      "title": "Residential Project Eka elitas Kothrud Pune 2026(1)",
      "category": "Wall Murals",
      "year": 2026,
      "imageUrl": "assets/works/murals/RP Eka elitas Kothrud Pune 2026(1).jpg"
    },
    {
      "_id": "rp-eka-elitas-kothrud-pune-2026-2",
      "title": "Residential Project eka elitas, Kothrud, Pune 2026",
      "category": "Wall Murals",
      "year": 2026,
      "imageUrl": "assets/works/murals/RP eka elitas, Kothrud, Pune 2026.jpg"
    },

    {
      "_id": "rp-kharadi-pune",
      "title": "Residential Project kharadi Pune",
      "category": "Wall Murals",
      "year": 2025,
      "imageUrl": "assets/works/murals/RP kharadi Pune.jpg"
    },
    {
      "_id": "rp-kharadi-pune-1-1",
      "title": "Residential Project kharadi Pune(1)",
      "category": "Wall Murals",
      "year": 2025,
      "imageUrl": "assets/works/murals/RP kharadi Pune(1).jpg"
    },
    {
      "_id": "rp-kothrud-2024",
      "title": "Residential Project Kothrud 2024",
      "category": "Wall Murals",
      "year": 2024,
      "imageUrl": "assets/works/murals/RP Kothrud 2024.jpg"
    },
    

    {
      "_id": "rp-kothrud-2026",
      "title": "Residential Project Kothrud 2026",
      "category": "Wall Murals",
      "year": 2026,
      "imageUrl": "assets/works/murals/RP Kothrud 2026.jpg"
    },
    {
      "_id": "rp-kothrud-2026-1-1",
      "title": "Residential Project Kothrud 2026(1)",
      "category": "Wall Murals",
      "year": 2026,
      "imageUrl": "assets/works/murals/Rp Kothrud 2026(1).jpg"
    },
    {
      "_id": "rp-kothrud-2026-2-1",
      "title": "Residential Project Kothrud 2026(2)",
      "category": "Wall Murals",
      "year": 2026,
      "imageUrl": "assets/works/murals/Rp Kothrud 2026(2).jpg"
    },

    {
      "_id": "rp-kothrud-pune-2025",
      "title": "Residential Project Kothrud Pune 2025",
      "category": "Wall Murals",
      "year": 2025,
      "imageUrl": "assets/works/murals/RP Kothrud Pune 2025.jpg"
    },
    {
      "_id": "rp-kothrud-pune-2025-1-1",
      "title": "Residential Project Kothrud Pune 2025(1)",
      "category": "Wall Murals",
      "year": 2025,
      "imageUrl": "assets/works/murals/Rp Kothrud Pune 2025(1).jpg"
    },
    {
      "_id": "rp-kothrud-pune-2026-1",
      "title": "Residential Project Kothrud Pune 2026 (1)",
      "category": "Wall Murals",
      "year": 2026,
      "imageUrl": "assets/works/murals/RP Kothrud Pune 2026 (1).jpg"
    },

    {
      "_id": "rp-kothrud-pune-2026",
      "title": "Residential Project Kothrud Pune 2026",
      "category": "Wall Murals",
      "year": 2026,
      "imageUrl": "assets/works/murals/RP Kothrud Pune 2026.jpg"
    },

    {
      "_id": "rp-kothrud-pune-2026-2-1",
      "title": "Residential Project Kothrud Pune 2026(2)",
      "category": "Wall Murals",
      "year": 2026,
      "imageUrl": "assets/works/murals/RP Kothrud Pune 2026(2).jpg"
    },

    {
      "_id": "rp-sindh-society-aundh-2025",
      "title": "Residential Project Sindh Society Aundh 2025",
      "category": "Wall Murals",
      "year": 2025,
      "imageUrl": "assets/works/murals/RP Sindh Society Aundh 2025.jpg"
    },

    {
      "_id": "rp-sindh-society-aundh-2025-2",
      "title": "Residential Project Sindh Society Aundh 2025(2)",
      "category": "Wall Murals",
      "year": 2025,
      "imageUrl": "assets/works/murals/RP Sindh Society Aundh 2025(2).jpg"
    },
    {
      "_id": "rp-sindh-society-aundh-2025-3",
      "title": "Residential Project Sindh Society, Aundh 2025",
      "category": "Wall Murals",
      "year": 2025,
      "imageUrl": "assets/works/murals/RP Sindh Society, Aundh 2025.jpg"
    },
    {
      "_id": "rp-warje-2025",
      "title": "Residential Project warje 2025",
      "category": "Wall Murals",
      "year": 2025,
      "imageUrl": "assets/works/murals/Rp warje 2025.jpg"
    },
    {
      "_id": "rp-warje-2025-1",
      "title": "Residential Project warje 2025(1)",
      "category": "Wall Murals",
      "year": 2025,
      "imageUrl": "assets/works/murals/RP warje 2025(1).jpg"
    },
    {
      "_id": "rp-bandra-mumbai-2025",
      "title": "Residential Project, Bandra, Mumbai 2025",
      "category": "Wall Murals",
      "year": 2025,
      "imageUrl": "assets/works/murals/RP, Bandra, Mumbai 2025.jpg"
    },
    {
      "_id": "rp-bandra-mumbai-2025-1",
      "title": "Residential Project, Bandra, Mumbai 2025(1)",
      "category": "Wall Murals",
      "year": 2025,
      "imageUrl": "assets/works/murals/RP, Bandra, Mumbai 2025(1).jpg"
    },
    {
      "_id": "rp-baner-pune-2026",
      "title": "Residential Project, Baner, Pune 2026",
      "category": "Wall Murals",
      "year": 2026,
      "imageUrl": "assets/works/murals/RP, Baner, Pune 2026.jpg"
    },
    {
      "_id": "rp-kothrud-pune-2025-2",
      "title": "Residential Project, Kothrud Pune 2025",
      "category": "Wall Murals",
      "year": 2025,
      "imageUrl": "assets/works/murals/RP, Kothrud Pune 2025.jpg"
    },
    {
      "_id": "southern-star-golf-course-camp-pune-2025",
      "title": "Southern star golf course, camp, Pune 2025",
      "category": "Wall Murals",
      "year": 2025,
      "imageUrl": "assets/works/murals/Southern star golf course, camp, Pune 2025.jpg"
    },
    {
      "_id": "splendid-courtyard-yashada-realty-group-lohegaon-pune-2023",
      "title": "Splendid courtyard, Yashada Realty group, Lohegaon , Pune 2023",
      "category": "Wall Murals",
      "year": 2023,
      "imageUrl": "assets/works/murals/Splendid courtyard, Yashada Realty group, Lohegaon , Pune 2023.JPG"
    },
    {
      "_id": "the-walnut-tree-cafe-koregaon-park-pune-2023",
      "title": "The walnut tree cafe, Koregaon park, Pune 2023",
      "category": "Wall Murals",
      "year": 2023,
      "imageUrl": "assets/works/murals/The walnut tree cafe, Koregaon park, Pune 2023.JPG"
    },
    {
      "_id": "vantage-21-yashada-realty-group-2024",
      "title": "Vantage 21, Yashada Realty group 2024",
      "category": "Wall Murals",
      "year": 2024,
      "imageUrl": "assets/works/murals/Vantage 21, Yashada Realty group 2024.jpg"
    },
    {
      "_id": "vantage-21-yashada-realty-group-2024-1",
      "title": "Vantage 21, Yashada Realty group 2024(1)",
      "category": "Wall Murals",
      "year": 2024,
      "imageUrl": "assets/works/murals/Vantage 21, Yashada Realty group 2024(1).jpg"
    },
    {
      "_id": "vantage-21-yashada-realty-group-2024-2",
      "title": "Vantage 21, Yashada Realty Group 2024(2)",
      "category": "Wall Murals",
      "year": 2024,
      "imageUrl": "assets/works/murals/Vantage 21, Yashada Realty Group 2024(2).jpg"
    },
    {
      "_id": "voyya-travels-shivajinagar-pune-2025",
      "title": "Voyya Travels, Shivajinagar Pune 2025",
      "category": "Wall Murals",
      "year": 2025,
      "imageUrl": "assets/works/murals/Voyya Travels, Shivajinagar Pune 2025.jpg"
    },
    {
      "_id": "welworth-purnam-grow-india-llp-hinjewadi-pune-2026",
      "title": "Welworth Purnam, grow India LLP, hinjewadi, Pune 2026",
      "category": "Wall Murals",
      "year": 2026,
      "imageUrl": "assets/works/murals/Welworth Purnam, grow India LLP, hinjewadi, Pune 2026.jpg"
    },
    {
      "_id": "welworth-purnam-grow-india-real-on-llp-hinjewadi-pune-2026",
      "title": "Welworth Purnam, grow India real on LLP, hinjewadi, Pune 2026",
      "category": "Wall Murals",
      "year": 2026,
      "imageUrl": "assets/works/murals/Welworth Purnam, grow India real on LLP, hinjewadi, Pune 2026.jpg"
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
document.querySelectorAll('video').forEach(video => {
  video.muted = true;
  video.play().catch(() => {});
});
document.querySelectorAll('video').forEach(video => {
  video.muted = true;
  video.defaultMuted = true;

  const playPromise = video.play();

  if (playPromise !== undefined) {
    playPromise.catch(() => {});
  }
});
window.addEventListener('load', () => {
  document.querySelectorAll('video').forEach(video => {
    video.muted = true;
    video.defaultMuted = true;

    video.play().catch(err => {
      console.log('Autoplay blocked:', err);
    });
  });
});
