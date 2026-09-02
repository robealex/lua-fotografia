// Menú móvil — Lua Fotografía
(function () {
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.getElementById('site-nav');
  const backdrop = document.querySelector('.nav-backdrop');
  if (!toggle || !nav) return;

  function closeMenu() {
    nav.classList.remove('nav-open');
    if (backdrop) backdrop.classList.remove('nav-open');
    toggle.classList.remove('is-active');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('no-scroll');
  }

  function openMenu() {
    nav.classList.add('nav-open');
    if (backdrop) backdrop.classList.add('nav-open');
    toggle.classList.add('is-active');
    toggle.setAttribute('aria-expanded', 'true');
    document.body.classList.add('no-scroll');
  }

  toggle.addEventListener('click', () => {
    if (nav.classList.contains('nav-open')) closeMenu();
    else openMenu();
  });

  if (backdrop) backdrop.addEventListener('click', closeMenu);

  nav.querySelectorAll('a').forEach((a) => a.addEventListener('click', closeMenu));

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 800) closeMenu();
  });
})();
