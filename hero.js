(() => {
  'use strict';
  const root = document.getElementById('hero-cinema');
  if (!root) return;
  // Testi modificabili nelle tre .hero-scene di index.html.
  // I valori sono centralizzati negli attributi data-* della sezione hero.
  const duration = Number(root.dataset.duration) || 2500;
  const fadeDuration = Number(root.dataset.fade) || 700;
  const zoomTo = Number(root.dataset.zoom) || 1.045;
  const scenes = Array.from(root.querySelectorAll('.hero-scene'));
  const images = scenes.map(scene => scene.querySelector('.hero-scene-image'));
  const status = root.querySelector('[role="status"]');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let current = 0;
  let playing = false;
  let userPaused = false;
  let explicitPlay = false;
  let focusInside = false;
  let inView = true;
  let ready = false;
  let loading = false;
  let elapsed = 0;
  let startedAt = 0;
  let frame = 0;
  let changing = false;
  let queued = null;
  let finishFade = null;
  let destroyed = false;
  root.style.setProperty('--hero-fade', fadeDuration + 'ms');
  function canPlay() {
    return ready && !destroyed && !loading && !userPaused && !reduced.matches && inView && !document.hidden && (explicitPlay || !focusInside);
  }
  function time(now = performance.now()) { return Math.min(duration, elapsed + (playing ? now - startedAt : 0)); }
  function paint(value) {
    const fraction = Math.max(0, Math.min(value / duration, 1));
    images[current].style.transform = 'scale(' + (reduced.matches ? 1 : 1 + (zoomTo - 1) * fraction).toFixed(5) + ')';
  }
  function stop() {
    if (playing) elapsed = time();
    playing = false;
    cancelAnimationFrame(frame);
    root.dataset.playing = 'false';
    paint(elapsed);
  }
  function tick(now) {
    if (!playing) return;
    const value = time(now);
    paint(value);
    if (value >= duration) {
      stop();
      void show((current + 1) % scenes.length, false);
      return;
    }
    frame = requestAnimationFrame(tick);
  }
  function updatePlayback() {
    root.dataset.reducedMotion = String(reduced.matches);
    if (canPlay()) {
      if (!playing) {
        playing = true;
        startedAt = performance.now();
        root.dataset.playing = 'true';
        frame = requestAnimationFrame(tick);
      }
    } else stop();
  }
  async function ensureImage(index) {
    const image = images[index];
    image.loading = 'eager';
    try { await image.decode(); return image.naturalWidth > 0; }
    catch { return image.complete && image.naturalWidth > 0; }
  }
  function warmNext() { void ensureImage((current + 1) % scenes.length); }
  function select(index) {
    current = index;
    root.dataset.activeSlide = String(index + 1);
    scenes.forEach((scene, i) => {
      const active = i === index;
      scene.setAttribute('aria-hidden', String(!active));
      scene.inert = !active;
    });
    paint(elapsed);
  }
  async function show(index, manual) {
    index = (index + scenes.length) % scenes.length;
    if (index === current && !loading) return;
    if (changing || loading) { queued = { index, manual }; return; }
    stop();
    loading = true;
    root.setAttribute('aria-busy', 'true');
    const available = await ensureImage(index);
    loading = false;
    root.removeAttribute('aria-busy');
    if (destroyed) return;
    if (!available) {
      userPaused = true;
      if (manual) status.textContent = 'Immagine non disponibile. Puoi scegliere un’altra scena.';
      updatePlayback();
      return;
    }
    const previous = scenes[current];
    const incoming = scenes[index];
    changing = true;
    previous.classList.remove('is-active');
    previous.classList.add('is-leaving');
    incoming.classList.remove('is-leaving');
    images[index].style.transform = 'scale(1)';
    incoming.classList.add('is-active');
    elapsed = 0;
    select(index);
    if (manual) status.textContent = 'Scena ' + (index + 1) + ' di ' + scenes.length + '. ' + incoming.querySelector('.hero-story-heading').textContent;
    let timeout;
    function finish() {
      clearTimeout(timeout);
      incoming.removeEventListener('transitionend', onEnd);
      previous.classList.remove('is-leaving');
      changing = false;
      finishFade = null;
      const pending = queued;
      queued = null;
      if (pending && pending.index !== current) void show(pending.index, pending.manual);
    }
    function onEnd(event) { if (event.target === incoming && event.propertyName === 'opacity') finish(); }
    finishFade = finish;
    if (reduced.matches) finish();
    else {
      incoming.addEventListener('transitionend', onEnd);
      timeout = setTimeout(finish, fadeDuration + 100);
    }
    warmNext();
    updatePlayback();
  }
  // La hero resta navigabile senza indicatori o pulsanti visibili.
  root.addEventListener('keydown', event => {
    if (event.target !== root) return;
    let next;
    if (event.key === 'ArrowRight') next = (current + 1) % scenes.length;
    if (event.key === 'ArrowLeft') next = (current - 1 + scenes.length) % scenes.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = scenes.length - 1;
    if (next !== undefined) {
      event.preventDefault(); explicitPlay = false; void show(next, true);
    } else if (event.key === ' ' && !reduced.matches) {
      event.preventDefault();
      const resume = !playing;
      userPaused = !resume; explicitPlay = resume;
      updatePlayback();
      status.textContent = resume ? 'Carosello avviato.' : 'Carosello in pausa.';
    }
  });
  let touchStart;
  root.addEventListener('pointerdown', event => {
    if (event.pointerType === 'touch' && !event.target.closest('a, button')) touchStart = { x: event.clientX, y: event.clientY };
  });
  root.addEventListener('pointerup', event => {
    if (!touchStart) return;
    const dx = event.clientX - touchStart.x, dy = event.clientY - touchStart.y;
    touchStart = undefined;
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.2) {
      explicitPlay = false; void show(current + (dx < 0 ? 1 : -1), true);
    }
  });
  root.addEventListener('pointercancel', () => { touchStart = undefined; });
  root.addEventListener('focusin', () => { focusInside = true; explicitPlay = false; updatePlayback(); });
  root.addEventListener('focusout', event => { focusInside = root.contains(event.relatedTarget); updatePlayback(); });
  document.addEventListener('visibilitychange', updatePlayback);
  reduced.addEventListener('change', () => {
    stop(); elapsed = 0;
    if (reduced.matches && finishFade) finishFade();
    paint(0); updatePlayback();
  });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => { inView = entries[0].isIntersecting; updatePlayback(); }, { threshold: .2 }).observe(root);
  }
  const header = document.querySelector('.header');
  function sizeHero() { if (header) root.style.setProperty('--hero-header-height', header.getBoundingClientRect().height + 'px'); }
  sizeHero();
  if (header && 'ResizeObserver' in window) new ResizeObserver(sizeHero).observe(header);
  window.addEventListener('pagehide', () => { stop(); destroyed = true; });
  window.addEventListener('pageshow', event => { if (event.persisted) { destroyed = false; updatePlayback(); } });
  select(0);
  void (async () => {
    await ensureImage(0);
    if (destroyed) return;
    if (!reduced.matches) {
      scenes[0].classList.remove('is-active');
      scenes[0].getBoundingClientRect();
      scenes[0].classList.add('is-active');
    }
    ready = true;
    warmNext();
    updatePlayback();
  })();
})();
