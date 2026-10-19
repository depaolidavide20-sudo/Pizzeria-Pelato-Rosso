(() => {
  'use strict';
  const root = document.querySelector('.product-cinema');
  if (!root) return;
  const track = root.querySelector('.cinema-track');
  const slides = Array.from(track.children);
  const status = document.getElementById('cinema-status');
  const title = document.getElementById('cinema-title');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const clone = slides[0].cloneNode(true);
  clone.setAttribute('aria-hidden', 'true');
  clone.removeAttribute('aria-label');
  const cloneImage = clone.querySelector('img');
  cloneImage.loading = 'lazy'; cloneImage.removeAttribute('fetchpriority');
  track.append(clone);
  let position = 0;
  let moving = false;
  let paused = false;
  let hovering = false;
  let focused = false;
  let inView = true;
  let playRequested = false;
  let timer;
  const interval = 2300;
  function canPlay() { return !paused && (playRequested || (!hovering && !focused)) && inView && !document.hidden && !reducedMotion.matches; }
  function schedule() {
    clearTimeout(timer);
    root.classList.toggle('is-running', canPlay());
    if (canPlay() && !moving) timer = setTimeout(() => change(1), interval);
  }
  function render() {
    const realPosition = position % slides.length;
    slides.forEach((slide, index) => {
      const active = index === realPosition;
      slide.classList.toggle('is-active', active);
      slide.setAttribute('aria-hidden', String(!active));
    });
    clone.classList.toggle('is-active', position === slides.length);
    title.textContent = slides[realPosition].dataset.title;
    title.setAttribute('aria-live', canPlay() ? 'off' : 'polite');
  }
  function jumpTo(index) {
    track.style.transition = 'none';
    track.style.transform = 'translate3d(-' + index * 100 + '%, 0, 0)';
    track.getBoundingClientRect();
    track.style.transition = '';
  }
  function settle() {
    if (position === slides.length) { position = 0; jumpTo(0); }
    moving = false; schedule();
  }
  function change(direction) {
    if (moving) return;
    clearTimeout(timer);
    if (position === 0 && direction < 0) { position = slides.length; jumpTo(position); }
    position += direction;
    moving = true;
    track.style.transform = 'translate3d(-' + position * 100 + '%, 0, 0)';
    render();
    if (reducedMotion.matches) settle();
  }
  track.addEventListener('transitionend', event => { if (event.target === track && event.propertyName === 'transform') settle(); });
  document.getElementById('cinema-prev').addEventListener('click', () => change(-1));
  document.getElementById('cinema-next').addEventListener('click', () => change(1));
  root.addEventListener('keydown', event => {
    if (event.target !== root) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault(); change(event.key === 'ArrowRight' ? 1 : -1);
    } else if (event.key === ' ' && !reducedMotion.matches) {
      event.preventDefault();
      const resume = !root.classList.contains('is-running');
      paused = !resume; playRequested = resume; schedule();
      status.textContent = resume ? 'Carosello avviato.' : 'Carosello in pausa.';
    }
  });
  root.addEventListener('mouseenter', () => { hovering = true; playRequested = false; schedule(); });
  root.addEventListener('mouseleave', () => { hovering = false; schedule(); });
  root.addEventListener('focusin', () => { focused = true; playRequested = false; schedule(); });
  root.addEventListener('focusout', event => { focused = root.contains(event.relatedTarget); schedule(); });
  document.addEventListener('visibilitychange', schedule);
  reducedMotion.addEventListener('change', () => { if (moving && reducedMotion.matches) settle(); schedule(); });
  let touchStart;
  root.addEventListener('pointerdown', event => { if (event.pointerType === 'touch' && !event.target.closest('button')) touchStart = event.clientX; });
  root.addEventListener('pointerup', event => { if (touchStart === undefined) return; const distance = event.clientX - touchStart; touchStart = undefined; if (Math.abs(distance) > 40) change(distance < 0 ? 1 : -1); });
  root.addEventListener('pointercancel', () => { touchStart = undefined; });
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => { inView = entries[0].isIntersecting; schedule(); }, { threshold: 0.15 });
    observer.observe(root);
  }
  render(); schedule();
})();
