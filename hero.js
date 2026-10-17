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
  const buttons = Array.from(root.querySelectorAll('[data-hero-select]'));
  const fills = buttons.map(button => button.querySelector('.hero-progress-fill'));
  const controls = root.querySelector('.hero-navigation');
  const playback = root.querySelector('.hero-playback');
  const pause = root.querySelector('.hero-pause');
  const status = root.querySelector('[role="status"]');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let current = 0;
  let playing = false;
  let userPaused = false;
  let explicitPlay = false;
  let focusInside = false;
  let controlsHovered = false;
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
    return ready && !destroyed && !loading && !userPaused && !reduced.matches && inView && !document.hidden && (explicitPlay || (!focusInside && !controlsHovered));
  }
  function time(now = performance.now()) { return Math.min(duration, elapsed + (playing ? now - startedAt : 0)); }
  function paint(value) {
    const fraction = Math.max(0, Math.min(value / duration, 1));
    fills[current].style.transform = 'scaleX(' + (reduced.matches ? 1 : fraction) + ')';
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
    pause.hidden = reduced.matches;
    pause.setAttribute('aria-pressed', String(userPaused));
    pause.setAttribute('aria-label', userPaused ? 'Riprendi il carosello della copertina' : 'Metti in pausa il carosello della copertina');
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
      buttons[i].setAttribute('aria-current', String(active));
      fills[i].style.transform = 'scaleX(' + (i < index ? 1 : 0) + ')';
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
  buttons.forEach((button, index) => {
    button.addEventListener('click', () => { explicitPlay = false; void show(index, true); });
    button.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight') next = (index + 1) % scenes.length;
      if (event.key === 'ArrowLeft') next = (index - 1 + scenes.length) % scenes.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = scenes.length - 1;
      if (next !== undefined) { event.preventDefault(); explicitPlay = false; buttons[next].focus(); void show(next, true); }
    });
  });
  pause.addEventListener('click', () => {
    userPaused = !userPaused;
    explicitPlay = !userPaused;
    updatePlayback();
  });
  root.addEventListener('focusin', () => { focusInside = true; explicitPlay = false; updatePlayback(); });
  root.addEventListener('focusout', event => { focusInside = root.contains(event.relatedTarget); updatePlayback(); });
  playback.addEventListener('mouseenter', () => { controlsHovered = true; explicitPlay = false; updatePlayback(); });
  playback.addEventListener('mouseleave', () => { controlsHovered = false; updatePlayback(); });
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
  controls.hidden = false;
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
