/* =====================================================================
   BUONA PASTA · efectos visuales
   Entrada del hero · polvo de harina · video · revelados · escena
   "Así nace un raviol" animada con el scroll
   ===================================================================== */
(() => {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  // "reduce-motion" lo decide un script en <head>: preferencia del sistema, salvo que la persona elija otra cosa
  const reduce = document.documentElement.classList.contains('reduce-motion');
  const coarse = matchMedia('(pointer: coarse)').matches;
  const conn = navigator.connection || {};
  const saveData = !!(conn.saveData || /(^|-)2g$/.test(conn.effectiveType || ''));
  const clamp = (n, a, b) => Math.min(b, Math.max(a, n));
  const seg = (p, a, b, ease) => { const t = clamp((p - a) / (b - a), 0, 1); return ease ? ease(t) : t; };
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);
  const easeIn = (t) => t * t * t;
  const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const easeOutBack = (t) => { const c1 = 1.70158; const c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
  const easeOutBounce = (t) => {
    const n1 = 7.5625; const d1 = 2.75;
    if (t < 1 / d1) return n1 * t * t;
    if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
    if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
    return n1 * (t -= 2.625 / d1) * t + 0.984375;
  };
  const rand = (i) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

  const header = $('#header');
  const hero = $('#hero');

  /* ---------- interruptor de animaciones ---------- */
  (function motionSwitch() {
    const root = document.documentElement;
    const set = (v) => { try { localStorage.setItem('buona.motion', v); } catch (e) { /* */ } location.reload(); };
    const toggle = $('#motion-toggle');
    if (toggle) {
      toggle.textContent = reduce ? 'Activar animaciones' : 'Reducir animaciones';
      toggle.addEventListener('click', () => set(reduce ? 'full' : 'reduced'));
    }
    const note = $('#motion-note');
    if (reduce && root.classList.contains('os-reduce') && !root.classList.contains('motion-chosen')) {
      if (note) { note.hidden = false; $('button', note).addEventListener('click', () => set('full')); }

      // aviso flotante: aparece una sola vez para que se pueda activar con un clic
      let seen = false;
      try { seen = !!localStorage.getItem('buona.motionToast'); localStorage.setItem('buona.motionToast', '1'); } catch (e) { /* */ }
      if (!seen) {
        const t = document.createElement('div');
        t.className = 'motion-toast';
        t.setAttribute('role', 'status');
        t.innerHTML = '<svg class="ico" aria-hidden="true"><use href="#i-spark"/></svg><span>Tu sistema tiene las animaciones desactivadas.</span><button type="button" class="act">Activarlas</button><button type="button" class="x" aria-label="Cerrar aviso"><svg class="ico" aria-hidden="true"><use href="#i-close"/></svg></button>';
        document.body.appendChild(t);
        $('.act', t).addEventListener('click', () => set('full'));
        $('.x', t).addEventListener('click', () => t.remove());
        setTimeout(() => t.remove(), 20000);
      }
    }
  })();

  /* =================================================================
     1 · HERO: título por palabras + entrada
     ================================================================= */
  function splitWords(root) {
    let i = 0;
    const walk = (node) => {
      Array.from(node.childNodes).forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
            const w = document.createElement('span'); w.className = 'w';
            const s = document.createElement('span'); s.textContent = part; s.style.setProperty('--i', i++);
            w.appendChild(s); frag.appendChild(w);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1) walk(n);
      });
    };
    walk(root);
  }

  if (hero) {
    const title = $('#hero-title');
    if (title && !reduce) { title.setAttribute('aria-label', title.textContent.trim()); splitWords(title); $$('.w', title).forEach((w) => w.setAttribute('aria-hidden', 'true')); }
    $$('[data-hero-in]').forEach((n) => n.style.setProperty('--hd', n.dataset.heroIn));
    const fontsReady = document.fonts && document.fonts.ready ? Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 900))]) : Promise.resolve();
    fontsReady.then(() => requestAnimationFrame(() => hero.classList.add('is-ready')));
  }

  /* =================================================================
     2 · VIDEO (carga diferida, se pausa fuera de pantalla)
     ================================================================= */
  function startVideo(v) {
    if (!v || v.dataset.started) return;
    v.dataset.started = '1';
    v.src = v.dataset.src;
    v.muted = true; v.defaultMuted = true; v.playsInline = true;
    v.addEventListener('playing', () => v.classList.add('is-on'), { once: true });
    const p = v.play();
    if (p && p.catch) p.catch(() => { /* autoplay bloqueado: queda el póster */ });
  }
  function watchVideo(v) {
    if (!('IntersectionObserver' in window)) return;
    new IntersectionObserver(([e]) => {
      if (!v.dataset.started) return;
      if (e.isIntersecting) { const p = v.play(); if (p && p.catch) p.catch(() => {}); } else v.pause();
    }, { threshold: 0.02 }).observe(v);
  }

  if (!reduce && !saveData) {
    const hv = $('#hero-video');
    const go = () => setTimeout(() => { startVideo(hv); watchVideo(hv); }, 250);
    if (document.readyState === 'complete') go(); else addEventListener('load', go, { once: true });

    const cv = $('#closing-video');
    if (cv && 'IntersectionObserver' in window) {
      const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { io.disconnect(); startVideo(cv); watchVideo(cv); } }, { rootMargin: '700px 0px' });
      io.observe(cv);
    }
  }

  /* =================================================================
     3 · POLVO DE HARINA (canvas sobre el video del hero)
     ================================================================= */
  function initDust() {
    const canvas = $('#hero-dust');
    const host = $('#arch');
    if (!canvas || !host || reduce) return;
    const ctx = canvas.getContext('2d');
    const N = matchMedia('(max-width: 720px)').matches ? 26 : 54;
    let w = 0; let h = 0; let dpr = 1; let raf = 0; let visible = true;
    const mouse = { x: -999, y: -999, on: false };
    const parts = [];

    const spawn = (init) => ({
      x: Math.random() * w, y: init ? Math.random() * h : h + 12,
      r: 0.7 + Math.random() * 2.3, vx: (Math.random() - 0.5) * 0.18, vy: -(0.12 + Math.random() * 0.4),
      a: 0.18 + Math.random() * 0.55, ph: Math.random() * 6.28, s: 0.4 + Math.random() * 0.9,
    });
    const resize = () => {
      const r = host.getBoundingClientRect();
      dpr = Math.min(devicePixelRatio || 1, 2); w = r.width; h = r.height;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!parts.length) for (let i = 0; i < N; i++) parts.push(spawn(true));
    };
    const step = () => {
      raf = 0;
      if (!visible) return;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = '#fff';
      for (const p of parts) {
        p.ph += 0.012 * p.s;
        p.x += p.vx + Math.sin(p.ph) * 0.28;
        p.y += p.vy;
        if (mouse.on) {
          const dx = p.x - mouse.x; const dy = p.y - mouse.y; const d2 = dx * dx + dy * dy;
          if (d2 < 130 * 130) { const d = Math.sqrt(d2) || 1; const f = (1 - d / 130) * 2.6; p.x += (dx / d) * f; p.y += (dy / d) * f; }
        }
        if (p.y < -12 || p.x < -12 || p.x > w + 12) Object.assign(p, spawn(false));
        ctx.globalAlpha = p.a;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.2832); ctx.fill();
      }
      raf = requestAnimationFrame(step);
    };
    const start = () => { if (!raf && visible) raf = requestAnimationFrame(step); };

    resize();
    addEventListener('resize', resize);
    host.addEventListener('pointermove', (e) => { const r = host.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; mouse.on = true; });
    host.addEventListener('pointerleave', () => { mouse.on = false; });
    if ('IntersectionObserver' in window) new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) start(); }, { threshold: 0 }).observe(host);
    document.addEventListener('visibilitychange', () => { if (document.hidden) { visible = false; } else { visible = true; start(); } });
    start();
  }
  initDust();

  /* =================================================================
     4 · REVELADO AL HACER SCROLL
     ================================================================= */
  const revealEls = $$('[data-reveal]');
  if (reduce || !('IntersectionObserver' in window)) revealEls.forEach((n) => n.classList.add('is-in'));
  else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -9% 0px', threshold: 0.06 });
    revealEls.forEach((n) => io.observe(n));
  }

  /* =================================================================
     5 · HEADER + PARALLAX (un solo loop de scroll)
     ================================================================= */
  const heroCopy = $('.hero__copy');
  const heroVisual = $('.hero__visual');
  let ticking = false;
  const frame = () => {
    ticking = false;
    const y = window.scrollY;
    if (header) header.classList.toggle('is-scrolled', y > 24);
    if (!reduce && hero && y < innerHeight * 1.2) {
      if (heroVisual) heroVisual.style.transform = `translate3d(0, ${(y * -0.06).toFixed(1)}px, 0)`;
      if (heroCopy && window.innerWidth >= 900) heroCopy.style.transform = `translate3d(0, ${(y * 0.1).toFixed(1)}px, 0)`;
    }
    if (makeApi) makeApi.kick();
  };
  const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } };
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);

  /* =================================================================
     6 · MICRO-INTERACCIONES (solo con mouse)
     ================================================================= */
  if (!coarse && !reduce) {
    $$('[data-magnetic]').forEach((b) => {
      b.addEventListener('pointermove', (e) => {
        const r = b.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) / r.width;
        const y = (e.clientY - r.top - r.height / 2) / r.height;
        b.style.transform = `translate(${(x * 12).toFixed(1)}px, ${(y * 9).toFixed(1)}px)`;
      });
      b.addEventListener('pointerleave', () => { b.style.transform = ''; });
    });
    $$('.card').forEach((c) => c.addEventListener('pointermove', (e) => {
      const r = c.getBoundingClientRect();
      c.style.setProperty('--mx', `${e.clientX - r.left}px`);
      c.style.setProperty('--my', `${e.clientY - r.top}px`);
    }));
  }

  /* =================================================================
     7 · ESCENA "ASÍ NACE UN RAVIOL"
     ================================================================= */
  let makeApi = null;
  (function initMake() {
    const sec = $('#como-se-hace');
    const stage = $('#stage');
    if (!sec || !stage) return;
    const steps = $$('.step', sec);
    const dots = $$('#make-dots li', sec);

    /* --- construcción de la escena --- */
    const mk = (cls, inner) => { const d = document.createElement('div'); d.className = cls; if (inner) d.innerHTML = inner; d.style.opacity = '0'; d.style.visibility = 'hidden'; stage.appendChild(d); return d; };
    const CELL = 18;
    const cells = [];
    [-1, 0, 1].forEach((gy) => [-1, 0, 1].forEach((gx) => cells.push({ x: gx * CELL, y: gy * CELL })));
    const FILL = ['#FFF6E2', '#7BA34A', '#E7A5A0', '#F1C24F', '#EE9B3C', '#FFF6E2', '#7BA34A', '#E7A5A0', '#F1C24F'];

    const table = mk('s-table');
    const flour = mk('s-flour');
    const well = mk('s-well');
    const yolks = [mk('s-yolk'), mk('s-yolk')];
    const puffs = Array.from({ length: 10 }, () => mk('s-puff'));
    const ball = mk('s-ball');
    const sheet = mk('s-sheet');
    const dollops = cells.map((c, i) => { const d = mk('s-dollop'); d.style.setProperty('--c', FILL[i]); return d; });
    const cover = mk('s-cover');
    const bumps = cells.map(() => mk('s-bump'));
    const cuts = [mk('s-cut h'), mk('s-cut h'), mk('s-cut v'), mk('s-cut v')];
    const ravs = cells.map(() => mk('s-rav'));
    const wheel = mk('s-wheel');
    const pin = mk('s-pin', '<i></i>');
    const plate = mk('s-plate', '<img src="assets/img/raviolones-800.webp" alt="" width="800" height="800" loading="lazy" decoding="async">');
    const steam = mk('s-steam', '<i></i><i></i><i></i>');
    const sparks = Array.from({ length: 6 }, () => mk('s-spark'));

    /* --- colocar un elemento (x, y en cqw · escala · rotación · opacidad) --- */
    const put = (el, x, y, sx, r, o) => {
      const t = `translate(calc(-50% + ${x.toFixed(2)}cqw), calc(-50% + ${y.toFixed(2)}cqw)) rotate(${r.toFixed(2)}deg) scale(${sx.toFixed(3)})`;
      if (el._t !== t) { el.style.transform = t; el._t = t; }
      const op = o < 0.004 ? 0 : o > 0.996 ? 1 : Math.round(o * 1000) / 1000;
      if (el._o !== op) { el.style.opacity = op; el.style.visibility = op === 0 ? 'hidden' : 'visible'; el._o = op; }
    };
    const clip = (el, v) => { if (el._c !== v) { el.style.clipPath = v; el._c = v; } };

    const LINES = [
      { a: 0.605, b: 0.65, h: true, pos: -9 },
      { a: 0.65, b: 0.69, h: true, pos: 9 },
      { a: 0.69, b: 0.73, h: false, pos: -9 },
      { a: 0.73, b: 0.77, h: false, pos: 9 },
    ];

    let lastIdx = -1;

    function render(p) {
      /* 01 · harina y huevo */
      const fIn = seg(p, 0, 0.07, easeOutBack);
      const fOut = seg(p, 0.22, 0.3, easeInOut);
      put(table, 0, 0, 1, 0, 1);
      put(flour, 0, 0, (0.55 + 0.45 * fIn) * (1 - 0.18 * fOut), 0, 1 - fOut);
      const wIn = seg(p, 0.05, 0.11, easeOut);
      put(well, 0, 0, wIn * (1 - 0.4 * fOut), 0, wIn * (1 - fOut));
      const absorb = seg(p, 0.2, 0.27, easeInOut);
      [[-3.6, 0.08, 0.15], [3.8, 0.105, 0.175]].forEach(([x, a, b], i) => {
        const t = seg(p, a, b, easeOutBounce);
        put(yolks[i], x, -66 * (1 - t) + (i ? 2 : -1.5), 1 - 0.85 * absorb, (1 - t) * (i ? 40 : -40), seg(p, a, a + 0.012) * (1 - absorb));
      });
      const pt = seg(p, 0.145, 0.225);
      puffs.forEach((pf, i) => {
        const ang = (i / puffs.length) * Math.PI * 2 + rand(i) * 0.6;
        const dist = 8 + rand(i + 9) * 8 + easeOut(pt) * (14 + rand(i + 3) * 12);
        put(pf, Math.cos(ang) * dist, Math.sin(ang) * dist, 0.5 + pt * 1.2, 0, pt > 0 && pt < 1 ? (1 - pt) * 0.9 : 0);
      });

      /* 02 · amasado: el rodillo estira la masa de arriba hacia abajo */
      const bIn = seg(p, 0.2, 0.275, easeOutBack);
      const wipe = seg(p, 0.295, 0.395, easeInOut);
      const Y = -29 + 58 * wipe;
      const hiddenTop = clamp((Y + 18) / 36, 0, 1);
      const sw = seg(p, 0.775, 0.83, easeInOut);          // pasa de hoja a ravioles
      put(ball, 0, 0, 0.55 + 0.45 * bIn, 0, bIn * (wipe >= 1 ? 0 : 1));
      clip(ball, hiddenTop > 0 ? `inset(${(hiddenTop * 36).toFixed(2)}cqw -6cqw -6cqw -6cqw)` : 'none');
      const shown = clamp((Y + 28) / 56, 0, 1);
      put(sheet, 0, 0, 1, 0, wipe > 0 ? 1 - sw : 0);
      clip(sheet, `inset(-8cqw -8cqw ${(56 * (1 - shown) - 8 * shown).toFixed(2)}cqw -8cqw)`);
      const leave = seg(p, 0.385, 0.405);
      put(pin, 0, Y + 6 * leave, 1, 0, seg(p, 0.285, 0.305) * (1 - leave));

      /* 03 · relleno y tapa */
      const dolFade = seg(p, 0.555, 0.6);
      cells.forEach((c, i) => {
        const a = 0.4 + i * 0.0115;
        const t = seg(p, a, a + 0.05, easeOutBack);
        put(dollops[i], c.x, c.y - 12 * (1 - t), 0.25 + 0.75 * t, 0, seg(p, a, a + 0.02) * (1 - dolFade));
      });
      const cIn = seg(p, 0.515, 0.585, easeOut);
      put(cover, 0, -16 * (1 - cIn), 1.03 - 0.03 * cIn, 0, cIn * 0.97 * (1 - sw));
      const bumpO = seg(p, 0.56, 0.61) * (1 - sw);
      cells.forEach((c, i) => put(bumps[i], c.x, c.y, 1, 0, bumpO));

      /* 04 · sellado y corte */
      let wx = 0; let wy = 0;
      cuts.forEach((c, i) => {
        const { a, b, h, pos } = LINES[i];
        const t = seg(p, a, b, easeInOut);
        put(c, h ? 0 : pos, h ? pos : 0, 1, 0, t > 0 ? 1 - sw : 0);
        clip(c, h ? `inset(0 ${((1 - t) * 100).toFixed(2)}% 0 0)` : `inset(0 0 ${((1 - t) * 100).toFixed(2)}% 0)`);
        if (p >= a && p <= b) { const along = -28 + 56 * t; wx = h ? along : pos; wy = h ? pos : along; }
      });
      put(wheel, wx, wy, 1, p * 1500, seg(p, 0.6, 0.612) * (1 - seg(p, 0.77, 0.79)));

      const spread = seg(p, 0.81, 0.89, easeOut);
      const gather = seg(p, 0.885, 0.95, easeIn);
      cells.forEach((c, i) => {
        const k = (1 + 0.3 * spread) * (1 - 0.88 * gather);
        put(ravs[i], c.x * k, c.y * k, 1 - 0.5 * gather, (rand(i + 20) - 0.5) * 14 * spread, sw * (1 - seg(p, 0.925, 0.96)));
      });

      /* 05 · a la mesa */
      const pl = seg(p, 0.88, 0.965, easeOutBack);
      put(plate, 0, 0, 0.5 + 0.5 * pl, (1 - pl) * -14 + seg(p, 0.95, 1) * 4, seg(p, 0.88, 0.94));
      put(steam, 0, -24, 1, 0, seg(p, 0.93, 0.98));
      sparks.forEach((s, i) => {
        const ang = (i / sparks.length) * Math.PI * 2 + 0.4;
        const t = seg(p, 0.94 + i * 0.006, 0.985 + i * 0.002, easeOutBack);
        put(s, Math.cos(ang) * 44, Math.sin(ang) * 44, t * (0.9 + 0.2 * Math.sin(p * 40 + i)), i * 30 + p * 90, t);
      });

      /* textos e indicadores */
      const idx = Math.min(4, Math.floor(p / 0.2 + 1e-6));
      if (idx !== lastIdx) {
        steps.forEach((s, i) => s.classList.toggle('is-on', i === idx));
        dots.forEach((d, i) => d.classList.toggle('is-on', i === idx));
        lastIdx = idx;
      }
      sec.classList.toggle('is-end', p > 0.9);
    }

    /* --- progreso del scroll con suavizado --- */
    let cur = 0; let target = 0; let running = false; let last = 0;
    const getTarget = () => { const r = sec.getBoundingClientRect(); return clamp(-r.top / Math.max(1, r.height - innerHeight), 0, 1); };
    const near = () => { const r = sec.getBoundingClientRect(); return r.bottom > -innerHeight * 0.5 && r.top < innerHeight * 1.5; };

    function tick(t) {
      const dt = Math.min(64, t - last) / 1000; last = t;
      target = getTarget();
      cur += (target - cur) * (1 - Math.exp(-dt * 9));
      if (Math.abs(target - cur) < 0.0005) cur = target;
      render(cur);
      if (cur !== target) requestAnimationFrame(tick); else running = false;
    }
    function kick() {
      if (reduce || running || !near()) return;
      running = true; last = performance.now(); requestAnimationFrame(tick);
    }

    if (reduce) { render(1); makeApi = { kick() {} }; return; }
    cur = target = getTarget();
    render(cur);
    makeApi = { kick };
  })();
})();
