(() => {
  'use strict';
  const business = window.PELATO_ROSSO || {};
  const menu = business.menu || {};
  const panel = document.getElementById('menu-panel');
  const tabs = Array.from(document.querySelectorAll('[role="tab"]'));
  const expandButton = document.getElementById('menu-expand');
  const categoryDescription = document.getElementById('menu-category-description');
  const exampleNote = document.getElementById('menu-example-note');
  const euro = new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' });
  let currentCategory = 'classiche';
  let expanded = false;
  const previewCount = 6;
  tabs.forEach(tab => {
    const count = tab.querySelector('span');
    if (count) count.textContent = String((menu[tab.dataset.category] || []).length).padStart(2, '0');
  });
  function renderMenu() {
    panel.replaceChildren();
    const pizzas = Array.isArray(menu[currentCategory]) ? menu[currentCategory] : [];
    const shownPizzas = expanded ? pizzas : pizzas.slice(0, previewCount);
    categoryDescription.textContent = business.menuDescriptions?.[currentCategory] || '';
    shownPizzas.forEach((pizza, index) => {
      const row = document.createElement('article'); row.className = 'pizza-row';
      const number = document.createElement('span'); number.className = 'pizza-number'; number.textContent = String(index + 1).padStart(2, '0'); number.setAttribute('aria-hidden', 'true');
      const description = document.createElement('div');
      const title = document.createElement('h3'); title.textContent = pizza.name;
      const ingredients = document.createElement('p'); ingredients.textContent = pizza.ingredients;
      description.append(title, ingredients); row.append(number, description);
      const price = document.createElement('span'); price.className = 'pizza-price';
      price.textContent = Number.isFinite(pizza.price) ? euro.format(pizza.price) : 'Chiedi in pizzeria';
      if (pizza.priceIsExample) { price.textContent += ' *'; price.setAttribute('aria-label', euro.format(pizza.price) + ', prezzo indicativo'); }
      row.append(price); panel.append(row);
    });
    expandButton.hidden = pizzas.length <= previewCount;
    expandButton.setAttribute('aria-expanded', String(expanded));
    expandButton.replaceChildren(document.createTextNode(expanded ? 'Mostra meno' : 'Mostra tutte le proposte (' + pizzas.length + ')'));
    const arrow = document.createElement('span'); arrow.textContent = expanded ? '↑' : '↓'; arrow.setAttribute('aria-hidden', 'true'); expandButton.append(arrow);
    exampleNote.hidden = !pizzas.some(pizza => pizza.priceIsExample);
    if (!pizzas.length) { const empty = document.createElement('p'); empty.className = 'menu-note'; empty.textContent = 'Il menu sarà disponibile a breve.'; panel.append(empty); }
  }
  function selectTab(tab) {
    tabs.forEach(item => { const active = item === tab; item.setAttribute('aria-selected', String(active)); item.tabIndex = active ? 0 : -1; });
    currentCategory = tab.dataset.category; expanded = false;
    panel.setAttribute('aria-labelledby', tab.id); renderMenu();
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => selectTab(tab));
    tab.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      if (next !== undefined) { event.preventDefault(); selectTab(tabs[next]); tabs[next].focus(); }
    });
  });
  expandButton.addEventListener('click', () => {
    expanded = !expanded; renderMenu();
    if (!expanded) tabs.find(tab => tab.dataset.category === currentCategory)?.scrollIntoView({ block: 'start', behavior: 'instant' });
  });
  renderMenu();
  const toggle = document.querySelector('.nav-toggle');
  const navigation = document.getElementById('navigation');
  function closeNavigation() { toggle.setAttribute('aria-expanded', 'false'); toggle.setAttribute('aria-label', 'Apri il menu di navigazione'); navigation.classList.remove('is-open'); }
  toggle.addEventListener('click', () => { const open = toggle.getAttribute('aria-expanded') !== 'true'; toggle.setAttribute('aria-expanded', String(open)); toggle.setAttribute('aria-label', open ? 'Chiudi il menu di navigazione' : 'Apri il menu di navigazione'); navigation.classList.toggle('is-open', open); });
  navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', closeNavigation));
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') { closeNavigation(); toggle.focus(); } });
  const wideScreen = window.matchMedia('(min-width: 761px)'); wideScreen.addEventListener('change', event => { if (event.matches) closeNavigation(); });
  document.getElementById('copyright-year').textContent = new Date().getFullYear();
  const privacyDialog = document.getElementById('privacy-dialog');
  document.getElementById('privacy-open').addEventListener('click', () => privacyDialog.showModal());
  document.getElementById('privacy-close').addEventListener('click', () => privacyDialog.close());
  privacyDialog.addEventListener('click', event => { if (event.target === privacyDialog) { const bounds = privacyDialog.getBoundingClientRect(); if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) privacyDialog.close(); } });
  if (business.address) document.getElementById('business-address').textContent = business.address;
  function safeWebUrl(value) { try { const url = new URL(value); return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : null; } catch { return null; } }
  const mapsUrl = safeWebUrl(business.mapsUrl);
  if (mapsUrl) { const mapLink = document.getElementById('map-link'); mapLink.href = mapsUrl; mapLink.hidden = false; }
  if (Array.isArray(business.hours) && business.hours.length) {
    const hours = document.getElementById('business-hours'); hours.replaceChildren();
    business.hours.forEach(line => { const p = document.createElement('p'); p.textContent = line; hours.append(p); });
  }
  const rawTelephone = String(business.phone || '').replace(/[^+\d]/g, '');
  const telephone = rawTelephone && !rawTelephone.startsWith('+') && !rawTelephone.startsWith('00') ? '+39' + rawTelephone : rawTelephone;
  const whatsapp = String(business.whatsapp || '').replace(/\D/g, '');
  const email = typeof business.email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(business.email) ? business.email : '';
  if (telephone || whatsapp || email) {
    const contact = document.getElementById('business-contact'); const actions = document.getElementById('order-actions'); contact.replaceChildren(); actions.hidden = false;
    function addContact(href, label, actionLabel, external) {
      const p = document.createElement('p'); const link = document.createElement('a'); link.href = href; link.textContent = label; p.append(link); contact.append(p);
      const action = document.createElement('a'); action.href = href; action.className = 'button button-red'; action.textContent = actionLabel; const arrow = document.createElement('span'); arrow.textContent = '↗'; arrow.setAttribute('aria-hidden', 'true'); action.append(arrow);
      if (external) [link, action].forEach(a => { a.target = '_blank'; a.rel = 'noopener noreferrer'; }); actions.append(action);
    }
    if (telephone) addContact('tel:' + telephone, business.phone, 'Chiama la pizzeria', false);
    if (whatsapp) addContact('https://wa.me/' + whatsapp, 'Scrivici su WhatsApp', 'Scrivici su WhatsApp', true);
    if (email) addContact('mailto:' + email, email, 'Scrivici', false);
    document.getElementById('faq-order').textContent = 'Usa i recapiti in questa sezione per contattare la pizzeria, scegliere le pizze e concordare il ritiro.';
    document.querySelector('.contact-note').textContent = 'Contattaci per disponibilità e modalità di ritiro.';
  }
})();
