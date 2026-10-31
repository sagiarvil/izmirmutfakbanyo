/**
 * İZMİR MUTFAK BANYO (izmirmutfakbanyo.com.tr)
 * Mimari İç Mekan Tasarımı, Özel İmalat & Fit-Out Uygulama Hizmetleri
 * Etkileşim ve Dinamik Davranış Motoru (1:1 OSO Mimarlık Davranışları)
 */

document.addEventListener('DOMContentLoaded', () => {
  initStickyHeader();
  initHeroSlider();
  initMobileNav();
  initPortfolioFilter();
  initLightbox();
  initScrollTop();
  initContactForm();
});

/* ==========================================================================
   1. STICKY HEADER & LOGO SWITCHER
   ========================================================================== */
function initStickyHeader() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  const scrollThreshold = 80;

  function handleScroll() {
    if (window.scrollY > scrollThreshold) {
      header.classList.add('is-sticky');
    } else {
      header.classList.remove('is-sticky');
    }
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
}

/* ==========================================================================
   2. HERO SLIDESHOW (REVOLUTION SLIDER REPLICATION)
   ========================================================================== */
function initHeroSlider() {
  const slides = document.querySelectorAll('.slide-item');
  if (!slides.length) return;

  const prevBtn = document.querySelector('.slider-arrow.prev');
  const nextBtn = document.querySelector('.slider-arrow.next');
  const counterEl = document.querySelector('.slider-counter .current');
  const dotsContainer = document.querySelector('.slider-dots');

  let currentIndex = 0;
  const totalSlides = slides.length;
  let slideInterval = null;
  const intervalDelay = 6000;

  // Create dot indicators if container exists
  if (dotsContainer) {
    dotsContainer.innerHTML = '';
    slides.forEach((_, idx) => {
      const dot = document.createElement('div');
      dot.className = `slider-dot ${idx === 0 ? 'active' : ''}`;
      dot.addEventListener('click', () => {
        goToSlide(idx);
        resetAutoPlay();
      });
      dotsContainer.appendChild(dot);
    });
  }

  function updateSlide(index) {
    slides.forEach((slide, idx) => {
      slide.classList.toggle('active', idx === index);
    });

    if (counterEl) {
      counterEl.textContent = String(index + 1).padStart(2, '0');
    }

    if (dotsContainer) {
      const dots = dotsContainer.querySelectorAll('.slider-dot');
      dots.forEach((dot, idx) => {
        dot.classList.toggle('active', idx === index);
      });
    }

    currentIndex = index;
  }

  function nextSlide() {
    const nextIndex = (currentIndex + 1) % totalSlides;
    updateSlide(nextIndex);
  }

  function prevSlide() {
    const prevIndex = (currentIndex - 1 + totalSlides) % totalSlides;
    updateSlide(prevIndex);
  }

  function goToSlide(index) {
    updateSlide(index);
  }

  function startAutoPlay() {
    if (!slideInterval) {
      slideInterval = setInterval(nextSlide, intervalDelay);
    }
  }

  function resetAutoPlay() {
    if (slideInterval) {
      clearInterval(slideInterval);
      slideInterval = setInterval(nextSlide, intervalDelay);
    }
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      nextSlide();
      resetAutoPlay();
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      prevSlide();
      resetAutoPlay();
    });
  }

  // Keyboard navigation
  window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') {
      nextSlide();
      resetAutoPlay();
    } else if (e.key === 'ArrowLeft') {
      prevSlide();
      resetAutoPlay();
    }
  });

  // Touch Swipe navigation
  const sliderEl = document.querySelector('.hero-slider-section');
  if (sliderEl) {
    let touchStartX = 0;
    let touchEndX = 0;

    sliderEl.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    sliderEl.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      if (touchStartX - touchEndX > 50) {
        nextSlide();
        resetAutoPlay();
      } else if (touchEndX - touchStartX > 50) {
        prevSlide();
        resetAutoPlay();
      }
    }, { passive: true });
  }

  startAutoPlay();
}

/* ==========================================================================
   3. MOBILE NAVIGATION DRAWER
   ========================================================================== */
function initMobileNav() {
  const toggleBtn = document.querySelector('.mobile-toggle');
  const drawer = document.querySelector('.mobile-nav-drawer');
  const backdrop = document.querySelector('.mobile-nav-backdrop');
  if (!toggleBtn || !drawer) return;

  function openMenu() {
    toggleBtn.classList.add('is-active');
    drawer.classList.add('is-open');
    if (backdrop) backdrop.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    toggleBtn.classList.remove('is-active');
    drawer.classList.remove('is-open');
    if (backdrop) backdrop.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  toggleBtn.addEventListener('click', () => {
    if (drawer.classList.contains('is-open')) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  if (backdrop) {
    backdrop.addEventListener('click', closeMenu);
  }

  // Close when clicking nav links
  const links = drawer.querySelectorAll('a');
  links.forEach(link => {
    link.addEventListener('click', closeMenu);
  });
}

/* ==========================================================================
   4. PORTFOLIO FILTERING (PROJELER SAYFASI)
   ========================================================================== */
function initPortfolioFilter() {
  const filterBar = document.querySelector('.portfolio-filter-bar:not(#modelFilterBar)');
  const items = document.querySelectorAll('.portfolio-item');
  if (!filterBar || !items.length) return;
  const filterBtns = filterBar.querySelectorAll('.filter-btn');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterValue = btn.getAttribute('data-filter');

      items.forEach(item => {
        const itemCategory = item.getAttribute('data-category');
        if (filterValue === 'all' || itemCategory === filterValue) {
          item.style.display = 'block';
          setTimeout(() => {
            item.style.opacity = '1';
            item.style.transform = 'scale(1)';
          }, 30);
        } else {
          item.style.opacity = '0';
          item.style.transform = 'scale(0.95)';
          setTimeout(() => {
            item.style.display = 'none';
          }, 300);
        }
      });
    });
  });
}

/* ==========================================================================
   5. LIGHTBOX MODAL
   ========================================================================== */
function initLightbox() {
  const triggerBoxes = document.querySelectorAll('[data-lightbox-src]');
  if (!triggerBoxes.length) return;

  let modal = document.querySelector('.lightbox-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.className = 'lightbox-modal';
    modal.innerHTML = `
      <div class="lightbox-content">
        <button class="lightbox-close" aria-label="Kapat">&times;</button>
        <img src="" alt="Görsel Büyütme" id="lightbox-img" />
      </div>
    `;
    document.body.appendChild(modal);
  }

  const lightboxImg = modal.querySelector('#lightbox-img');
  const closeBtn = modal.querySelector('.lightbox-close');

  function openLightbox(src) {
    lightboxImg.src = src;
    modal.classList.add('is-active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    modal.classList.remove('is-active');
    document.body.style.overflow = '';
    setTimeout(() => {
      lightboxImg.src = '';
    }, 300);
  }

  triggerBoxes.forEach(box => {
    box.addEventListener('click', (e) => {
      e.preventDefault();
      const src = box.getAttribute('data-lightbox-src');
      if (src) openLightbox(src);
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', closeLightbox);
  }

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeLightbox();
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-active')) {
      closeLightbox();
    }
  });
}

/* ==========================================================================
   6. SCROLL TO TOP
   ========================================================================== */
function initScrollTop() {
  const scrollBtn = document.querySelector('.scroll-top-btn');
  if (!scrollBtn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      scrollBtn.classList.add('is-visible');
    } else {
      scrollBtn.classList.remove('is-visible');
    }
  }, { passive: true });

  scrollBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

/* ==========================================================================
   7. CONTACT FORM SUBMISSION
   ========================================================================== */
function initContactForm() {
  const form = document.querySelector('#contactForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const submitBtn = form.querySelector('button[type=\"submit\"]');
    const originalText = submitBtn.textContent;

    submitBtn.disabled = true;
    submitBtn.textContent = 'GÖNDERİLİYOR...';

    setTimeout(() => {
      alert('Mesajınız başarıyla iletildi. Mimari ekibimiz en kısa sürede sizinle iletişime geçecektir.');
      form.reset();
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }, 1200);
  });
}

/* ==========================================================================
   8. FAQ ACCORDION HANDLER
   ========================================================================== */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');
  if (!faqItems.length) return;

  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    if (question) {
      question.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        // Close others
        faqItems.forEach(i => i.classList.remove('active'));
        if (!isActive) {
          item.classList.add('active');
        }
      });
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initFaqAccordion();

  // ============================================================
  // 137 MODEL FILTRELEME, ARAMA & DETAY MODALI (modeller.html)
  // ============================================================
  const modelFilterBar = document.getElementById('modelFilterBar');
  const modelSearchInput = document.getElementById('modelSearchInput');
  const allModelsGrid = document.getElementById('allModelsGrid');
  const noModelsFound = document.getElementById('noModelsFound');
  const resetModelFilter = document.getElementById('resetModelFilter');
  const modelDetailModal = document.getElementById('modelDetailModal');
  const closeModelModal = document.getElementById('closeModelModal');

  if (allModelsGrid) {
    const modelCards = allModelsGrid.querySelectorAll('.model-card');
    let currentCat = 'all';
    let currentQuery = '';

    function applyModelFilters() {
      let visibleCount = 0;
      const q = currentQuery.trim().toLowerCase();

      modelCards.forEach(card => {
        const cat = card.getAttribute('data-category') || '';
        const title = (card.getAttribute('data-full-title') || '').toLowerCase();
        const modelNo = (card.getAttribute('data-model') || '').toLowerCase();
        const specs = (card.getAttribute('data-specs') || '').toLowerCase();
        const desc = (card.getAttribute('data-desc') || '').toLowerCase();

        const catMatch = (currentCat === 'all' || cat === currentCat);
        const queryMatch = (!q || title.includes(q) || modelNo.includes(q) || specs.includes(q) || desc.includes(q));

        if (catMatch && queryMatch) {
          card.style.display = 'flex';
          visibleCount++;
        } else {
          card.style.display = 'none';
        }
      });

      if (noModelsFound) {
        noModelsFound.style.display = visibleCount === 0 ? 'block' : 'none';
      }
    }

    if (modelFilterBar) {
      const filterBtns = modelFilterBar.querySelectorAll('.filter-btn');
      filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          filterBtns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          currentCat = btn.getAttribute('data-cat') || 'all';
          applyModelFilters();
        });
      });
    }

    if (modelSearchInput) {
      modelSearchInput.addEventListener('input', (e) => {
        currentQuery = e.target.value;
        applyModelFilters();
      });
    }

    if (resetModelFilter) {
      resetModelFilter.addEventListener('click', () => {
        currentCat = 'all';
        currentQuery = '';
        if (modelSearchInput) modelSearchInput.value = '';
        if (modelFilterBar) {
          const filterBtns = modelFilterBar.querySelectorAll('.filter-btn');
          filterBtns.forEach(b => b.classList.remove('active'));
          if (filterBtns[0]) filterBtns[0].classList.add('active');
        }
        applyModelFilters();
      });
    }

    // Modal Açma / Kapatma
    allModelsGrid.addEventListener('click', (e) => {
      const btn = e.target.closest('.open-model-modal');
      if (!btn) return;
      const card = btn.closest('.model-card');
      if (!card || !modelDetailModal) return;

      const mid = card.getAttribute('data-model') || '';
      const title = card.getAttribute('data-full-title') || '';
      const img = card.getAttribute('data-img') || '';
      const specs = card.getAttribute('data-specs') || '';
      const desc = card.getAttribute('data-desc') || '';

      const mImg = document.getElementById('modalImg');
      const mBadge = document.getElementById('modalBadge');
      const mTitle = document.getElementById('modalTitle');
      const mSpecs = document.getElementById('modalSpecs');
      const mDesc = document.getElementById('modalDesc');
      const mWa = document.getElementById('modalWaBtn');

      if (mImg) { mImg.src = img; mImg.alt = title; }
      if (mBadge) mBadge.textContent = mid;
      if (mTitle) mTitle.textContent = title;
      if (mSpecs) mSpecs.textContent = specs;
      if (mDesc) mDesc.textContent = desc;
      if (mWa) {
        mWa.href = 'https://wa.me/905324411060?text=' + encodeURIComponent('Merhaba, ' + mid + ' kodlu model (' + title + ') hakkında fiyat ve keşif bilgisi almak istiyorum.');
      }

      modelDetailModal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    });

    if (closeModelModal && modelDetailModal) {
      closeModelModal.addEventListener('click', () => {
        modelDetailModal.style.display = 'none';
        document.body.style.overflow = '';
      });

      modelDetailModal.addEventListener('click', (e) => {
        if (e.target === modelDetailModal) {
          modelDetailModal.style.display = 'none';
          document.body.style.overflow = '';
        }
      });
    }

    // URL parametresi ile filtre tetikleme (?kategori=mutfak gibi)
    const urlParams = new URLSearchParams(window.location.search);
    const catParam = urlParams.get('kategori') || urlParams.get('cat');
    if (catParam && modelFilterBar) {
      const targetBtn = modelFilterBar.querySelector('[data-cat="' + catParam + '"]');
      if (targetBtn) {
        targetBtn.click();
      }
    }
  }

});
