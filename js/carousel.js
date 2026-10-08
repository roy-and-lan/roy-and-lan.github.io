// Shared photo-story controls for the English and Vietnamese invitations.
(() => {
  const carousel = document.querySelector('.carousel-section');
  if (!carousel) return;

  const slides = Array.from(carousel.querySelectorAll('.carousel-slide'));
  const dots = Array.from(carousel.querySelectorAll('.dot'));
  const counter = carousel.querySelector('.story-index');
  const header = document.querySelector('.site-header');
  const mobile = window.matchMedia('(max-width: 700px)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const mobileImages = ['running.gif', 'cycling_goat_mobile.gif', 'vietnam_mobile.jpg', 'house_mobile.png', 'proposal_mobile.jpg'];
  const stillImages = ['soho.jpg', 'landing.jpg', 'vietnam_mobile.jpg', 'house_mobile.png', 'proposal_mobile.jpg'];
  let currentIndex = 0;

  function loadImage(slide, index) {
    const source = reducedMotion.matches
      ? `../images/assets/${stillImages[index]}`
      : mobile.matches ? `../images/assets/${mobileImages[index]}` : slide.dataset.bg;
    slide.style.backgroundImage = `url("${source}")`;
  }

  function setExpanded(slide, expanded) {
    const wrapper = slide.querySelector('.slide-text-wrapper');
    if (!wrapper) return;
    const button = wrapper.querySelector('.story-toggle');
    wrapper.classList.toggle('expanded', expanded);
    slide.classList.toggle('text-expanded', expanded);
    button.setAttribute('aria-expanded', String(expanded));
    button.replaceChildren(document.createTextNode(expanded ? button.dataset.closeLabel : button.dataset.openLabel));
    const symbol = document.createElement('span');
    symbol.setAttribute('aria-hidden', 'true');
    symbol.textContent = expanded ? '−' : '+';
    button.append(symbol);
  }

  function showSlide(index) {
    currentIndex = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => {
      const active = i === currentIndex;
      setExpanded(slide, false);
      slide.classList.toggle('active', active);
      slide.setAttribute('aria-hidden', String(!active));
      slide.inert = !active;
      dots[i].classList.toggle('active', active);
      dots[i].setAttribute('aria-pressed', String(active));
      if (active) loadImage(slide, i);
    });
    counter.textContent = `${String(currentIndex + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
  }

  carousel.querySelector('.prev-btn').addEventListener('click', () => showSlide(currentIndex - 1));
  carousel.querySelector('.next-btn').addEventListener('click', () => showSlide(currentIndex + 1));
  dots.forEach((dot, index) => dot.addEventListener('click', () => showSlide(index)));
  slides.forEach(slide => {
    const button = slide.querySelector('.story-toggle');
    if (!button) return;
    button.addEventListener('click', () => setExpanded(slide, button.getAttribute('aria-expanded') !== 'true'));
    slide.querySelector('.text-overlay').addEventListener('click', () => setExpanded(slide, false));
  });

  // Arrow keys and swipes are scoped to the story, leaving forms and page scrolling alone.
  carousel.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'Escape'].includes(event.key)) return;
    event.preventDefault();
    if (event.key === 'Escape') {
      setExpanded(slides[currentIndex], false);
      return;
    }
    if (event.target.closest('.carousel-slide')) carousel.focus({ preventScroll: true });
    showSlide(currentIndex + (event.key === 'ArrowRight' ? 1 : -1));
  });

  let touchStart = null;
  carousel.addEventListener('touchstart', event => {
    touchStart = event.touches.length === 1 && !event.target.closest('button, a, .text-expanded .slide-content')
      ? { x: event.touches[0].clientX, y: event.touches[0].clientY } : null;
  }, { passive: true });
  carousel.addEventListener('touchend', event => {
    if (!touchStart) return;
    const dx = touchStart.x - event.changedTouches[0].clientX;
    const dy = touchStart.y - event.changedTouches[0].clientY;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) showSlide(currentIndex + (dx > 0 ? 1 : -1));
    touchStart = null;
  }, { passive: true });
  carousel.addEventListener('touchcancel', () => { touchStart = null; }, { passive: true });

  function refreshImages() {
    slides.forEach((slide, index) => {
      if (slide.style.backgroundImage) loadImage(slide, index);
    });
  }
  mobile.addEventListener('change', refreshImages);
  reducedMotion.addEventListener('change', refreshImages);
  function updateHeader() {
    header.classList.toggle('is-scrolled', carousel.getBoundingClientRect().bottom <= header.offsetHeight);
  }
  window.addEventListener('scroll', updateHeader, { passive: true });
  window.addEventListener('resize', updateHeader);
  window.addEventListener('pageshow', updateHeader);
  updateHeader();
  showSlide(0);
})();
