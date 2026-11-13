/* ===== Comportamentos compartilhados entre index.html e projetos.html ===== */
(function () {
  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Tema claro / escuro ---------- */
  var toggle = document.getElementById('theme');
  var metaTheme = document.querySelector('meta[name="theme-color"]');
  function paintMeta() {
    if (metaTheme) metaTheme.setAttribute('content', root.dataset.theme === 'light' ? '#faf8ff' : '#000000');
  }
  var systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
  var manualTheme = null;
  try { var saved = localStorage.getItem('theme'); if (saved === 'light' || saved === 'dark') manualTheme = saved; } catch (e) {}
  function syncTheme() {
    root.dataset.theme = manualTheme || (systemTheme.matches ? 'dark' : 'light');
    if (toggle) toggle.setAttribute('aria-pressed', root.dataset.theme === 'light');
    paintMeta();
  }
  systemTheme.addEventListener('change', syncTheme);
  window.addEventListener('storage', function(e) {
    if (e.key === 'theme' || e.key === null) { manualTheme = e.newValue === 'light' || e.newValue === 'dark' ? e.newValue : null; syncTheme(); }
  });
  syncTheme();
  if (toggle) {
    toggle.setAttribute('aria-pressed', root.dataset.theme === 'light');
    toggle.addEventListener('click', function () {
      var next = root.dataset.theme === 'light' ? 'dark' : 'light';
      root.classList.add('theme-anim');
      manualTheme = next;
      root.dataset.theme = next;
      toggle.setAttribute('aria-pressed', next === 'light');
      try { localStorage.setItem('theme', next); } catch (e) {}
      paintMeta();
      setTimeout(function () { root.classList.remove('theme-anim'); }, 500);
    });
  }

  /* ---------- Barra de progresso + navbar ---------- */
  var bar = document.getElementById('progress');
  var nav = document.getElementById('nav');
  var ticking = false;
  function onScroll() {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    var p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    if (bar) bar.style.transform = 'scaleX(' + p + ')';
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 30);
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  /* ---------- Menu mobile ---------- */
  var burger = document.getElementById('burger');
  var menu = document.getElementById('menu');
  if (burger && menu) {
    var close = function () {
      menu.classList.remove('open'); burger.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
    };
    burger.addEventListener('click', function () {
      var open = menu.classList.toggle('open');
      burger.classList.toggle('open', open);
      burger.setAttribute('aria-expanded', open);
    });
    menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', close); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  }

  /* ---------- Reveal ao rolar ---------- */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });

  /* ---------- Luz que segue o mouse nos cards ---------- */
  document.querySelectorAll('.card').forEach(function (c) {
    c.addEventListener('pointermove', function (e) {
      var r = c.getBoundingClientRect();
      c.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      c.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });

  /* ---------- Marquee: duplica a trilha para o loop ficar contínuo ---------- */
  document.querySelectorAll('.m-row').forEach(function (row) {
    var track = row.querySelector('.m-track');
    if (!track) return;
    var clone = track.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    row.appendChild(clone);
  });

  /* ---------- Destaque do menu conforme a seção visível (só no index) ---------- */
  var links = Array.prototype.slice.call(document.querySelectorAll('.menu a[href^="#"]'));
  if (links.length) {
    var map = {};
    links.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting && map[e.target.id]) {
          links.forEach(function (l) { l.classList.remove('active'); });
          map[e.target.id].classList.add('active');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(map).forEach(function (id) {
      var s = document.getElementById(id);
      if (s) spy.observe(s);
    });
  }

  /* ---------- Copiar e-mail ---------- */
  var toast = document.getElementById('toast');
  var toastTimer;
  function say(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove('show'); }, 2400);
  }
  function fallbackCopy(text) {
    var t = document.createElement('textarea');
    t.value = text; t.setAttribute('readonly', '');
    t.style.cssText = 'position:fixed;opacity:0;top:0;left:0';
    document.body.appendChild(t); t.select();
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(t);
    return ok;
  }
  document.querySelectorAll('[data-copy]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var text = btn.getAttribute('data-copy');
      var done = function (ok) { say(ok ? 'E-mail copiado!' : 'Não consegui copiar. Selecione e copie: ' + text); };
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(function () { done(true); }, function () { done(fallbackCopy(text)); });
      } else {
        done(fallbackCopy(text));
      }
    });
  });

  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
})();
