/* =====================================================================
   BUONA PASTA · menú, carrito y pedido por WhatsApp
   (los datos viven en data.js · los efectos visuales en fx.js)
   ===================================================================== */
(() => {
  'use strict';

  const DATA = window.BUONA;
  if (!DATA) { console.error('Buona Pasta: falta assets/js/data.js'); return; }
  const BIZ = DATA.business;
  const PRODUCTS = DATA.products;
  const byId = Object.fromEntries(PRODUCTS.map((p) => [p.id, p]));

  /* ---------- utilidades ---------- */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduce = document.documentElement.classList.contains('reduce-motion');
  const money = (n) => '$' + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const clamp = (n, a, b) => Math.min(b, Math.max(a, n));
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const store = {
    get(k, fallback) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fallback; } catch (e) { return fallback; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* navegación privada */ } },
  };

  /* ---------- unidades ---------- */
  const UNITS = { kg: { step: 0.5, min: 0.5, def: 1, max: 20 }, un: { step: 1, min: 1, def: 2, max: 40 } };
  const unitOf = (p) => UNITS[p.unit] || UNITS.kg;
  const snap = (p, n) => { const u = unitOf(p); return clamp(Math.round(n / u.step) * u.step, u.min, u.max); };
  const perWord = (p) => (p.unit === 'un' ? 'unidad' : 'kg');
  const variantOf = (p, id) => p.variants.find((v) => v.id === id) || p.variants[0];
  const minPrice = (p) => Math.min(...p.variants.map((v) => v.price));
  const thumb = (p) => `assets/img/${p.image.file}-${p.image.sizes[0]}.webp`;

  function qtyText(p, q) {
    if (p.unit === 'un') return q === 1 ? '1 unidad' : `${q} unidades`;
    const whole = Math.floor(q);
    const half = q - whole >= 0.5;
    if (!whole) return '½ kg';
    return `${whole}${half ? '½' : ''} kg`;
  }

  /* ---------- WhatsApp ---------- */
  const waNumber = String(BIZ.whatsapp || '').replace(/\D/g, '');
  const waLink = (text) => `https://wa.me/${waNumber}${text ? '?text=' + encodeURIComponent(text) : ''}`;

  /* =================================================================
     MENÚ
     ================================================================= */
  const chipsHTML = (p) => `
    <fieldset class="chips">
      <legend class="sr-only">Elegí el relleno de ${esc(p.name)}</legend>
      ${p.variants.map((v, i) => `
        <label class="chip">
          <input type="radio" name="v-${p.id}" value="${i}"${i === 0 ? ' checked' : ''}>
          <span>${v.color ? `<i class="dot" style="--c:${v.color}"></i>` : ''}${esc(v.name)}${v.veg ? '<svg class="ico chip__leaf" aria-hidden="true"><use href="#i-leaf"/></svg>' : ''}</span>
        </label>`).join('')}
    </fieldset>`;

  function cardHTML(p, i) {
    const img = p.image;
    const srcset = img.sizes.map((s) => `assets/img/${img.file}-${s}.webp ${s}w`).join(', ');
    const sizes = p.size === 'lg'
      ? '(min-width: 1040px) 600px, (min-width: 720px) 46vw, 92vw'
      : '(min-width: 1040px) 394px, (min-width: 720px) 46vw, 92vw';
    const v0 = p.variants[0];
    const u = unitOf(p);
    const day = new Date().getDate();
    const ribbon = p.id === 'noquis' && day >= 20 && day <= 29 ? '<span class="card__ribbon">Se viene el 29: reservá los tuyos</span>' : '';
    return `
    <article class="card card--${p.size}" id="p-${p.id}" data-id="${p.id}" data-reveal style="--d:${(i % 3) * 110}">
      <div class="card__media" style="--bg:${img.color}">
        <img src="assets/img/${img.file}-${img.sizes[0]}.webp" srcset="${srcset}" sizes="${sizes}" width="${img.w}" height="${img.h}" alt="${esc(img.alt)}" loading="lazy" decoding="async">
        <span class="card__tag"><b data-price>${money(v0.price)}</b><small>/${perWord(p)}</small></span>
        ${ribbon}
      </div>
      <div class="card__body">
        <h3 class="card__title">${esc(p.name)}</h3>
        <p class="card__blurb">${esc(p.blurb)}</p>
        ${p.variants.length > 1 ? chipsHTML(p) : ''}
        <p class="card__meta">
          <span><svg class="ico" aria-hidden="true"><use href="#i-clock"/></svg>Cocción: ${esc(p.cook)}</span>
          <span>${p.unit === 'un' ? '≈ 2 por persona' : '1 kg ≈ 4 porciones'}</span>
        </p>
        <div class="portions">
          <span class="portions__label">¿Para cuántos?</span>
          <button type="button" data-people="2" aria-label="Para 2 personas">2</button>
          <button type="button" data-people="4" aria-label="Para 4 personas">4</button>
          <button type="button" data-people="6" aria-label="Para 6 personas">6</button>
        </div>
        <div class="card__buy">
          <div class="stepper" role="group" aria-label="Cantidad de ${esc(p.name)}">
            <button type="button" data-act="minus" aria-label="Restar ${p.unit === 'un' ? 'una unidad' : 'medio kilo'}"><svg class="ico" aria-hidden="true"><use href="#i-minus"/></svg></button>
            <output aria-live="polite">${qtyText(p, u.def)}</output>
            <button type="button" data-act="plus" aria-label="Sumar ${p.unit === 'un' ? 'una unidad' : 'medio kilo'}"><svg class="ico" aria-hidden="true"><use href="#i-plus"/></svg></button>
          </div>
          <button class="btn btn--primary add" type="button"><span class="add__label">Agregar</span><span class="add__price">${money(v0.price * u.def)}</span></button>
        </div>
      </div>
    </article>`;
  }

  function initCard(card, p) {
    const u = unitOf(p);
    let vi = 0;
    let q = u.def;
    const tag = $('.card__tag', card);
    const tagPrice = $('[data-price]', card);
    const out = $('output', card);
    const add = $('.add', card);
    const addLabel = $('.add__label', card);
    const addPrice = $('.add__price', card);
    const minus = $('[data-act="minus"]', card);
    const plus = $('[data-act="plus"]', card);
    const presets = $$('.portions button', card);
    const chipInputs = $$('.chips input', card);
    const peopleQty = (n) => snap(p, p.unit === 'un' ? n * 2 : n / 4);

    const paint = (pulse) => {
      const v = p.variants[vi];
      tagPrice.textContent = money(v.price);
      out.textContent = qtyText(p, q);
      addPrice.textContent = money(v.price * q);
      minus.disabled = q <= u.min;
      plus.disabled = q >= u.max;
      presets.forEach((b) => b.classList.toggle('is-on', peopleQty(Number(b.dataset.people)) === q));
      if (pulse && !reduce) { tag.classList.remove('pulse'); void tag.offsetWidth; tag.classList.add('pulse'); }
    };

    // se llama desde el filtro "Vegetarianas" del menú (ver applyMenuFilter)
    card.__setVegOnly = (vegOnly) => {
      chipInputs.forEach((inp, idx) => {
        const dis = vegOnly && !p.variants[idx].veg;
        inp.disabled = dis;
        inp.closest('.chip').classList.toggle('is-disabled', dis);
      });
      if (vegOnly && !p.variants[vi].veg) {
        const fi = p.variants.findIndex((v) => v.veg);
        if (fi > -1) { vi = fi; chipInputs[fi].checked = true; paint(true); }
      }
    };

    card.addEventListener('change', (e) => {
      if (e.target.name === `v-${p.id}`) { vi = Number(e.target.value); paint(true); }
    });
    minus.addEventListener('click', () => { q = snap(p, q - u.step); paint(); });
    plus.addEventListener('click', () => { q = snap(p, q + u.step); paint(); });
    presets.forEach((b) => b.addEventListener('click', () => { q = peopleQty(Number(b.dataset.people)); paint(true); }));

    let t;
    add.addEventListener('click', () => {
      const v = p.variants[vi];
      addToCart(p.id, v.id, q);
      fly(add, p);
      announce(`${qtyText(p, q)} de ${p.name}${p.variants.length > 1 ? ' (' + v.name + ')' : ''} agregado al pedido. Total: ${money(cartTotal())}.`);
      add.classList.add('is-done');
      addLabel.textContent = '¡Agregado!';
      addPrice.hidden = true;
      clearTimeout(t);
      t = setTimeout(() => { add.classList.remove('is-done'); addLabel.textContent = 'Agregar'; addPrice.hidden = false; }, 1600);
    });

    paint(false);
  }

  function renderMenu() {
    const grid = $('#menu-grid');
    if (!grid) return;
    grid.innerHTML = PRODUCTS.map(cardHTML).join('');
    $$('.card', grid).forEach((card) => initCard(card, byId[card.dataset.id]));
  }

  /* ---------- filtro del menú (Todos / Vegetarianas) ---------- */
  let menuFilter = 'all';
  function applyMenuFilter() {
    const grid = $('#menu-grid');
    if (!grid) return;
    $$('.card', grid).forEach((card) => {
      const p = byId[card.dataset.id];
      const hasVeg = p.variants.some((v) => v.veg);
      const hide = menuFilter === 'veg' && !hasVeg;
      const currentlyHidden = card.classList.contains('is-hidden') || card.hidden;
      if (hide && !currentlyHidden) {
        card.classList.add('is-hidden');
        setTimeout(() => { if (card.classList.contains('is-hidden')) card.hidden = true; }, reduce ? 0 : 420);
      } else if (!hide && currentlyHidden) {
        card.hidden = false;
        requestAnimationFrame(() => requestAnimationFrame(() => card.classList.remove('is-hidden')));
      }
      if (card.__setVegOnly) card.__setVegOnly(menuFilter === 'veg');
    });
  }
  const filterBar = $('#menu-filter');
  if (filterBar) {
    filterBar.addEventListener('click', (e) => {
      const b = e.target.closest('[data-filter]');
      if (!b || b.dataset.filter === menuFilter) return;
      menuFilter = b.dataset.filter;
      $$('.filter-chip', filterBar).forEach((c) => c.classList.toggle('is-on', c === b));
      applyMenuFilter();
      announce(menuFilter === 'veg' ? 'Mostrando solo pastas vegetarianas.' : 'Mostrando todo el menú.');
    });
  }

  /* =================================================================
     CARRITO
     ================================================================= */
  const CART_KEY = 'buona.cart.v1';
  const PROFILE_KEY = 'buona.profile.v1';
  let cart = store.get(CART_KEY, []).filter((l) => byId[l.p] && byId[l.p].variants.some((v) => v.id === l.v) && l.q > 0);
  const state = { view: 'cart', lastMsg: '', lastUrl: '' };

  const el = {
    btn: $('#cart-btn'), count: $('#cart-count'), btnTotal: $('#cart-btn-total'),
    pill: $('#cart-pill'), pillCount: $('#pill-count'), pillTotal: $('#pill-total'),
    dlg: $('#cart'), empty: $('#cart-empty'), filled: $('#cart-filled'), items: $('#cart-items'),
    form: $('#cart-form'), foot: $('#cart-foot'), total: $('#cart-total'), done: $('#cart-done'),
    warn: $('#cart-warn'), live: $('#live'), cross: $('#cart-cross'),
  };

  const persist = () => store.set(CART_KEY, cart);
  const lineTotal = (l) => variantOf(byId[l.p], l.v).price * l.q;
  const cartTotal = () => cart.reduce((a, l) => a + lineTotal(l), 0);
  const lineKey = (l) => `${l.p}:${l.v}`;
  const announce = (msg) => { el.live.textContent = ''; setTimeout(() => { el.live.textContent = msg; }, 30); };

  function addToCart(pid, vid, q) {
    const p = byId[pid];
    const line = cart.find((l) => l.p === pid && l.v === vid);
    if (line) line.q = snap(p, line.q + q); else cart.push({ p: pid, v: vid, q: snap(p, q) });
    persist();
    renderCart();
  }

  function setQty(key, delta) {
    const line = cart.find((l) => lineKey(l) === key);
    if (!line) return;
    line.q = snap(byId[line.p], line.q + delta);
    persist();
    renderCart();
  }

  function removeLine(key) {
    cart = cart.filter((l) => lineKey(l) !== key);
    persist();
    renderCart();
  }

  function lineHTML(l) {
    const p = byId[l.p];
    const v = variantOf(p, l.v);
    const key = lineKey(l);
    const u = unitOf(p);
    return `
    <li class="line" data-key="${key}">
      <img class="line__img" src="${thumb(p)}" alt="" width="58" height="58" loading="lazy">
      <div>
        <span class="line__name">${esc(p.name)}</span>
        ${p.variants.length > 1 ? `<span class="line__var">${esc(v.name)}</span>` : ''}
        <span class="line__var">${money(v.price)} el ${perWord(p)}</span>
      </div>
      <strong class="line__price">${money(lineTotal(l))}</strong>
      <div class="line__ctrl">
        <div class="stepper stepper--sm" role="group" aria-label="Cantidad de ${esc(p.name)}">
          <button type="button" data-act="minus" data-key="${key}" aria-label="Restar"${l.q <= u.min ? ' disabled' : ''}><svg class="ico" aria-hidden="true"><use href="#i-minus"/></svg></button>
          <output>${qtyText(p, l.q)}</output>
          <button type="button" data-act="plus" data-key="${key}" aria-label="Sumar"${l.q >= u.max ? ' disabled' : ''}><svg class="ico" aria-hidden="true"><use href="#i-plus"/></svg></button>
        </div>
        <button type="button" class="line__rm" data-act="remove" data-key="${key}">Quitar</button>
      </div>
    </li>`;
  }

  function renderCrossSell(n) {
    if (!el.cross) return;
    const inCart = new Set(cart.map((l) => l.p));
    const sug = PRODUCTS.find((p) => !inCart.has(p.id));
    if (!sug || n === 0) { el.cross.hidden = true; el.cross.innerHTML = ''; return; }
    el.cross.hidden = false;
    el.cross.innerHTML = `
      <p class="cart__cross-label">¿Sumás algo más?</p>
      <div class="cart__cross-item">
        <img src="${thumb(sug)}" alt="" width="46" height="46" loading="lazy">
        <div class="cart__cross-info"><strong>${esc(sug.name)}</strong><span>${money(minPrice(sug))}${sug.unit === 'un' ? ' c/u' : '/kg'}</span></div>
        <button type="button" class="btn btn--ghost cart__cross-add" data-id="${sug.id}">+ Agregar</button>
      </div>`;
  }
  if (el.cross) {
    el.cross.addEventListener('click', (e) => {
      const b = e.target.closest('[data-id]');
      if (!b) return;
      const p = byId[b.dataset.id];
      addToCart(p.id, p.variants[0].id, unitOf(p).def);
      announce(`${p.name} agregado al pedido.`);
    });
  }

  function updateDeliveryNudge() {
    const box = $('#delivery-nudge');
    if (!box) return;
    const goal = Number(BIZ.freeDeliveryFrom) || 0;
    const envio = modeVal() === 'envio';
    if (!goal || !envio || cart.length === 0) { box.hidden = true; box.classList.remove('is-done'); return; }
    const total = cartTotal();
    const pct = clamp((total / goal) * 100, 0, 100);
    const fill = $('#delivery-fill', box);
    if (fill) fill.style.width = pct + '%';
    const text = $('#delivery-nudge-text', box);
    if (total >= goal) {
      if (text) text.textContent = '¡Listo! Tu envío es gratis.';
      if (!box.classList.contains('is-done')) {
        box.classList.add('is-done');
        if (!reduce) { box.classList.remove('pop'); void box.offsetWidth; box.classList.add('pop'); }
      }
    } else {
      box.classList.remove('is-done');
      if (text) text.textContent = `Te faltan ${money(goal - total)} para el envío gratis.`;
    }
    box.hidden = false;
  }

  let pillOn = false;
  function showPill(on) {
    if (on === pillOn) return;
    pillOn = on;
    if (on) {
      el.pill.hidden = false;
      requestAnimationFrame(() => requestAnimationFrame(() => el.pill.classList.add('is-shown')));
    } else {
      el.pill.classList.remove('is-shown');
      setTimeout(() => { if (!pillOn) el.pill.hidden = true; }, 750);
    }
  }

  function renderCart() {
    const n = cart.length;
    const total = cartTotal();

    el.count.hidden = n === 0;
    el.count.textContent = n;
    el.btnTotal.hidden = n === 0;
    el.btnTotal.textContent = money(total);
    el.btn.setAttribute('aria-label', n ? `Ver mi pedido: ${n} ${n === 1 ? 'producto' : 'productos'}, ${money(total)}` : 'Ver mi pedido');
    el.pillCount.textContent = n;
    el.pillTotal.textContent = money(total);
    showPill(n > 0 && !el.dlg.open);

    // conservar el foco al re-dibujar los botones de una línea
    const active = document.activeElement;
    const focusKey = active && active.dataset && active.dataset.act && active.dataset.key ? `${active.dataset.act}|${active.dataset.key}` : '';

    el.done.hidden = state.view !== 'done';
    el.empty.hidden = !(state.view === 'cart' && n === 0);
    el.filled.hidden = !(state.view === 'cart' && n > 0);
    el.foot.hidden = !(state.view === 'cart' && n > 0);
    el.items.innerHTML = cart.map(lineHTML).join('');
    el.total.textContent = money(total);
    renderCrossSell(n);
    updateDeliveryNudge();

    if (focusKey) {
      const [act, key] = focusKey.split('|');
      const again = el.items.querySelector(`[data-act="${act}"][data-key="${key}"]:not(:disabled)`);
      if (again) again.focus();
    }
  }

  /* ---------- abrir / cerrar ---------- */
  let lastFocus = null;
  function openCart() {
    if (el.dlg.open) return;
    lastFocus = document.activeElement;
    state.view = 'cart';
    renderCart();
    restoreProfile();
    showPill(false);
    el.dlg.showModal();
    document.documentElement.classList.add('no-scroll');
    requestAnimationFrame(() => requestAnimationFrame(() => el.dlg.classList.add('is-open')));
  }

  function closeCart(then) {
    if (!el.dlg.open) return;
    el.dlg.classList.remove('is-open');
    setTimeout(() => {
      el.dlg.close();
      document.documentElement.classList.remove('no-scroll');
      renderCart();
      if (lastFocus && document.contains(lastFocus) && lastFocus.offsetParent !== null) lastFocus.focus({ preventScroll: true });
      if (then) then();
    }, reduce ? 0 : 420);
  }

  el.btn.addEventListener('click', openCart);
  el.pill.addEventListener('click', openCart);
  el.dlg.addEventListener('cancel', (e) => { e.preventDefault(); closeCart(); });
  el.dlg.addEventListener('click', (e) => {
    const c = e.target.closest('[data-close]');
    if (!c) return;
    const goto = c.dataset.goto;
    closeCart(goto ? () => { const t = $(goto); if (t) t.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }); } : null);
  });

  el.items.addEventListener('click', (e) => {
    const b = e.target.closest('[data-act]');
    if (!b) return;
    const key = b.dataset.key;
    const line = cart.find((l) => lineKey(l) === key);
    if (!line) return;
    const step = unitOf(byId[line.p]).step;
    if (b.dataset.act === 'plus') setQty(key, step);
    else if (b.dataset.act === 'minus') setQty(key, -step);
    else if (b.dataset.act === 'remove') removeLine(key);
  });

  /* ---------- formulario ---------- */
  const f = {
    name: $('#f-name'), address: $('#f-address'), addressWrap: $('#f-address-wrap'),
    when: $('#f-when'), notes: $('#f-notes'), pay: $('#pay-group'), pickup: $('#cart-pickup'),
  };
  const modeVal = () => (el.form.querySelector('input[name="mode"]:checked') || {}).value || 'retiro';
  const payVal = () => (el.form.querySelector('input[name="pay"]:checked') || {}).value || '';

  // medios de pago desde data.js
  if (BIZ.payments && BIZ.payments.length) {
    f.pay.insertAdjacentHTML('beforeend', `<div class="seg__row">${BIZ.payments.map((m, i) =>
      `<label><input type="radio" name="pay" value="${esc(m)}"${i === 0 ? ' checked' : ''}><span>${esc(m)}</span></label>`).join('')}</div>`);
  } else { f.pay.hidden = true; }

  function syncMode() {
    const envio = modeVal() === 'envio';
    f.addressWrap.hidden = !envio;
    if (!envio && BIZ.address) { f.pickup.hidden = false; f.pickup.textContent = `Retirás por: ${BIZ.address}`; }
    else if (envio && BIZ.delivery) { f.pickup.hidden = false; f.pickup.textContent = BIZ.delivery; }
    else f.pickup.hidden = true;
    updateDeliveryNudge();
  }
  el.form.addEventListener('change', (e) => { if (e.target.name === 'mode') syncMode(); });
  $$('.quick button', el.form).forEach((b) => b.addEventListener('click', () => { f.when.value = b.dataset.when; f.when.focus(); }));
  [f.name, f.address].forEach((inp) => inp.addEventListener('input', () => {
    const wrap = inp.closest('.field'); wrap.classList.remove('has-error'); const er = $('.err', wrap); if (er) er.textContent = '';
  }));

  function restoreProfile() {
    const pr = store.get(PROFILE_KEY, {});
    if (pr.name && !f.name.value) f.name.value = pr.name;
    if (pr.address && !f.address.value) f.address.value = pr.address;
    if (pr.mode) { const r = el.form.querySelector(`input[name="mode"][value="${pr.mode}"]`); if (r) r.checked = true; }
    if (pr.pay) { const r = el.form.querySelector(`input[name="pay"][value="${CSS.escape(pr.pay)}"]`); if (r) r.checked = true; }
    syncMode();
  }

  function validate() {
    let first = null;
    const mark = (input, msg) => {
      const wrap = input.closest('.field');
      wrap.classList.toggle('has-error', !!msg);
      const er = $('.err', wrap);
      if (er) er.textContent = msg || '';
      if (msg && !first) first = input;
    };
    mark(f.name, f.name.value.trim().length < 2 ? 'Decinos tu nombre así te identificamos.' : '');
    mark(f.address, modeVal() === 'envio' && f.address.value.trim().length < 5 ? 'Necesitamos la dirección para el envío.' : '');
    if (first) first.focus();
    return !first;
  }

  function buildMessage() {
    const mode = modeVal();
    const lines = [];
    lines.push(`*Pedido para ${BIZ.name}* 🍝`, '');
    lines.push(`*Nombre:* ${f.name.value.trim()}`);
    lines.push(`*Entrega:* ${mode === 'envio' ? 'Envío a domicilio' : 'Retiro por el local'}`);
    if (mode === 'envio') lines.push(`*Dirección:* ${f.address.value.trim()}`);
    if (f.when.value.trim()) lines.push(`*Para cuándo:* ${f.when.value.trim()}`);
    if (payVal()) lines.push(`*Pago:* ${payVal()}`);
    lines.push('', '*Detalle del pedido*');
    cart.forEach((l) => {
      const p = byId[l.p];
      const v = variantOf(p, l.v);
      const name = p.variants.length > 1 ? `${p.name} (${v.name})` : p.name;
      lines.push(`• ${qtyText(p, l.q)} de ${name} — ${money(lineTotal(l))}`);
    });
    lines.push('', `*Total: ${money(cartTotal())}*${mode === 'envio' ? ' (más el envío)' : ''}`);
    if (f.notes.value.trim()) lines.push('', `*Aclaraciones:* ${f.notes.value.trim()}`);
    return lines.join('\n');
  }

  el.form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!cart.length || !validate()) return;
    store.set(PROFILE_KEY, { name: f.name.value.trim(), address: f.address.value.trim(), mode: modeVal(), pay: payVal() });
    state.lastMsg = buildMessage();
    state.lastUrl = waLink(state.lastMsg);
    window.open(state.lastUrl, '_blank', 'noopener');
    $('#done-open').href = state.lastUrl;
    state.view = 'done';
    renderCart();
    el.dlg.querySelector('.cart__body').scrollTop = 0;
  });

  // vista "pedido armado"
  $('#done-back').addEventListener('click', () => { state.view = 'cart'; renderCart(); });
  $('#done-clear').addEventListener('click', () => { cart = []; persist(); state.view = 'cart'; renderCart(); closeCart(); });
  $('#done-copy').addEventListener('click', async (e) => {
    const btn = e.currentTarget;
    const label = btn.lastChild;
    try { await navigator.clipboard.writeText(state.lastMsg); }
    catch (err) { const ta = document.createElement('textarea'); ta.value = state.lastMsg; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); } catch (e2) { /* */ } ta.remove(); }
    label.textContent = '¡Copiado!';
    setTimeout(() => { label.textContent = 'Copiar pedido'; }, 1800);
  });

  // aviso si falta configurar el WhatsApp
  el.warn.hidden = !!waNumber;

  /* ---------- animación "vuela al carrito" ---------- */
  function bump(node) {
    if (reduce || !node) return;
    node.classList.remove('bump'); void node.offsetWidth; node.classList.add('bump');
    setTimeout(() => node.classList.remove('bump'), 700);
  }

  function fly(fromEl, p) {
    const usePill = getComputedStyle(el.pill).display !== 'none';
    const target = usePill ? el.pill : el.btn;
    if (reduce) { bump(target); return; }
    const a = fromEl.getBoundingClientRect();
    const tr = target.getBoundingClientRect();
    const end = usePill ? { x: innerWidth / 2 - tr.width / 2 + 30, y: innerHeight - 44 } : { x: tr.left + tr.width / 2, y: tr.top + tr.height / 2 };
    const size = 46;
    const d = document.createElement('div');
    d.setAttribute('aria-hidden', 'true');
    d.style.cssText = `position:fixed;left:0;top:0;width:${size}px;height:${size}px;border-radius:50%;z-index:120;pointer-events:none;border:3px solid #fff;box-shadow:0 14px 26px -8px rgba(0,0,0,.5);background:#fff url(${thumb(p)}) center/cover no-repeat;`;
    document.body.appendChild(d);
    const sx = a.left + a.width / 2 - size / 2;
    const sy = a.top + a.height / 2 - size / 2;
    const ex = end.x - size / 2;
    const ey = end.y - size / 2;
    const mx = (sx + ex) / 2;
    const my = Math.min(sy, ey) - 110;
    const anim = d.animate([
      { transform: `translate(${sx}px,${sy}px) scale(1)`, opacity: 1 },
      { transform: `translate(${mx}px,${my}px) scale(1.18)`, opacity: 1, offset: 0.45 },
      { transform: `translate(${ex}px,${ey}px) scale(.3)`, opacity: 0.85 },
    ], { duration: 780, easing: 'cubic-bezier(.5,0,.3,1)' });
    anim.onfinish = () => { d.remove(); bump(usePill ? el.pill : el.btn); };
  }

  /* =================================================================
     TEXTOS DINÁMICOS (precios, contacto, SEO)
     ================================================================= */
  function fillStatic() {
    $$('[data-price-of]').forEach((n) => { const p = byId[n.dataset.priceOf]; if (p) n.textContent = money(minPrice(p)) + (p.unit === 'un' ? ' c/u' : '/kg'); });
    const perKg = PRODUCTS.filter((p) => p.unit !== 'un');
    $$('[data-min-price]').forEach((n) => { n.textContent = money(Math.min(...(perKg.length ? perKg : PRODUCTS).map(minPrice))); });
    $$('[data-wa-link]').forEach((a) => {
      if (!waNumber) { a.hidden = true; return; }
      a.href = waLink('¡Hola! Quería hacer una consulta.');
    });
    const y = $('#year'); if (y) y.textContent = new Date().getFullYear();
    if (BIZ.delivery) { const d = $('#how-delivery'); if (d) d.textContent = BIZ.delivery; }
    const faqPay = $('[data-faq="pay"]');
    if (faqPay && BIZ.payments && BIZ.payments.length) faqPay.textContent = `Aceptamos ${BIZ.payments.join(', ')}.`;
    const faqDelivery = $('[data-faq="delivery"]');
    if (faqDelivery && BIZ.delivery) faqDelivery.textContent = BIZ.delivery;

    const info = $('#footer-info');
    if (info) {
      const rows = [];
      rows.push(['i-wa', 'Pedidos', waNumber
        ? `Armá tu pedido en esta web o escribinos al <a href="${waLink('¡Hola! Quería hacer una consulta.')}" target="_blank" rel="noopener">WhatsApp +${waNumber}</a>.`
        : 'Armá tu pedido en esta web y lo confirmamos por WhatsApp.']);
      rows.push(['i-bag', 'Entrega', esc(BIZ.delivery || 'Retiro por el local o envío a domicilio. El costo del envío se confirma por WhatsApp.')]);
      if (BIZ.address) rows.push(['i-pin', 'Dónde estamos', esc(BIZ.address)]);
      if (BIZ.hours) rows.push(['i-clock', 'Horarios', esc(BIZ.hours)]);
      if (BIZ.instagram) rows.push(['i-insta', 'Instagram', `<a href="https://instagram.com/${encodeURIComponent(BIZ.instagram.replace(/^@/, ''))}" target="_blank" rel="noopener">@${esc(BIZ.instagram.replace(/^@/, ''))}</a>`]);
      info.innerHTML = rows.map(([ic, label, html]) => `<li><svg class="ico" aria-hidden="true"><use href="#${ic}"/></svg><div><small>${label}</small>${html}</div></li>`).join('');
    }
  }

  function injectJsonLd() {
    const data = {
      '@context': 'https://schema.org',
      '@type': 'FoodEstablishment',
      name: BIZ.name,
      servesCuisine: 'Italiana',
      description: 'Fábrica de pastas caseras: ravioles, sorrentinos, raviolones, ñoquis y canelones.',
      ...(waNumber ? { telephone: '+' + waNumber } : {}),
      ...(BIZ.address ? { address: BIZ.address } : {}),
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Menú',
        itemListElement: PRODUCTS.flatMap((p) => p.variants.map((v) => ({
          '@type': 'Offer', priceCurrency: 'ARS', price: v.price,
          itemOffered: { '@type': 'Product', name: p.variants.length > 1 ? `${p.name} de ${v.name.toLowerCase()}` : p.name, description: p.blurb },
        }))),
      },
    };
    const s = document.createElement('script');
    s.type = 'application/ld+json';
    s.textContent = JSON.stringify(data);
    document.head.appendChild(s);
  }

  function injectFaqJsonLd() {
    const items = $$('.faq-item').map((it) => ({
      '@type': 'Question',
      name: $('.faq-item__q span', it).textContent.trim(),
      acceptedAnswer: { '@type': 'Answer', text: $('.faq-item__a', it).textContent.trim() },
    }));
    if (!items.length) return;
    const s = document.createElement('script');
    s.type = 'application/ld+json';
    s.textContent = JSON.stringify({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: items });
    document.head.appendChild(s);
  }

  /* =================================================================
     PREGUNTAS FRECUENTES (acordeón)
     ================================================================= */
  $$('.faq-item').forEach((item) => {
    const btn = $('.faq-item__q', item);
    const inner = $('.faq-item__panel > div', item);
    if (inner) inner.setAttribute('inert', '');
    btn.addEventListener('click', () => {
      const open = !item.classList.contains('is-open');
      item.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', String(open));
      if (inner) { if (open) inner.removeAttribute('inert'); else inner.setAttribute('inert', ''); }
    });
  });

  /* =================================================================
     PWA: instalar en el celular/escritorio + service worker
     (mejora la carga en visitas repetidas; funciona igual sin esto)
     ================================================================= */
  let deferredInstall = null;
  const installBtn = $('#install-btn');
  addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredInstall = e;
    if (installBtn) installBtn.hidden = false;
  });
  if (installBtn) {
    installBtn.addEventListener('click', async () => {
      if (!deferredInstall) return;
      installBtn.disabled = true;
      deferredInstall.prompt();
      try { await deferredInstall.userChoice; } catch (e) { /* */ }
      deferredInstall = null;
      installBtn.hidden = true;
      installBtn.disabled = false;
    });
  }
  addEventListener('appinstalled', () => { if (installBtn) installBtn.hidden = true; });

  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
    addEventListener('load', () => { navigator.serviceWorker.register('sw.js').catch(() => {}); });
  }

  /* =================================================================
     MENÚ MÓVIL
     ================================================================= */
  const burger = $('#burger');
  const mnav = $('#mobile-nav');
  function setNav(open) {
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    mnav.classList.toggle('is-open', open);
    mnav.setAttribute('aria-hidden', String(!open));
    document.documentElement.classList.toggle('no-scroll', open);
  }
  burger.addEventListener('click', () => setNav(burger.getAttribute('aria-expanded') !== 'true'));
  mnav.addEventListener('click', (e) => { if (e.target.closest('a')) setNav(false); });
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && mnav.classList.contains('is-open')) setNav(false); });
  matchMedia('(min-width: 900px)').addEventListener('change', (e) => { if (e.matches) setNav(false); });

  /* ---------- arranque ---------- */
  renderMenu();
  applyMenuFilter();
  fillStatic();
  injectJsonLd();
  injectFaqJsonLd();
  renderCart();
  window.BuonaCart = { open: openCart, close: closeCart };
})();
