// Shared client helpers for the House Type Valuer SaaS.
(function () {
  'use strict';

  async function api(method, path, body) {
    const opts = { method, headers: {} };
    if (body !== undefined) {
      opts.headers['Content-Type'] = 'application/json';
      opts.body = JSON.stringify(body);
    }
    const res = await fetch(path, opts);
    let data = null;
    try { data = await res.json(); } catch (e) { /* no body */ }
    if (!res.ok) {
      const err = new Error((data && data.error) || 'Request failed.');
      err.status = res.status;
      err.data = data;
      throw err;
    }
    return data;
  }

  async function getMe() {
    try { return await api('GET', '/api/auth/me'); }
    catch (e) { if (e.status === 401 || e.status === 404) return null; throw e; }
  }

  // Redirect to login unless signed in; returns the me payload.
  async function requireSession() {
    const me = await getMe();
    if (!me) { location.href = '/login.html'; return null; }
    return me;
  }

  function gbp(v) {
    if (typeof v !== 'number' || !isFinite(v)) return '—';
    return '£' + Math.round(v).toLocaleString('en-GB');
  }
  function fmtDate(ts) {
    if (!ts) return '';
    try {
      return new Date(ts).toLocaleString('en-GB', { day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' });
    } catch (e) { return ''; }
  }

  function el(tag, cls, text) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function renderTopnav(me, active) {
    const nav = document.getElementById('topnav');
    if (!nav) return;
    nav.innerHTML = '';
    const links = [
      { href: '/app.html', label: 'Valuations', key: 'app' },
      { href: '/team.html', label: 'Team', key: 'team' },
      { href: '/billing.html', label: 'Billing', key: 'billing' },
    ];
    if (me.user.isPlatformAdmin) links.push({ href: '/admin.html', label: 'Admin', key: 'admin' });
    links.forEach((l) => {
      const a = el('a', active === l.key ? 'active' : '', l.label);
      a.href = l.href;
      nav.appendChild(a);
    });
    const q = me.quota;
    const badge = el('span', 'badge', `${q.remaining}/${q.quota} left · ${q.planName}`);
    badge.style.marginLeft = '8px';
    nav.appendChild(badge);
    const out = el('a', '', 'Sign out');
    out.href = '#';
    out.onclick = async (e) => { e.preventDefault(); await api('POST', '/api/auth/logout'); location.href = '/login.html'; };
    nav.appendChild(out);
  }

  // Theme toggle wiring (button with id="theme-btn", label span id="theme-label")
  function initTheme() {
    const btn = document.getElementById('theme-btn');
    if (!btn) return;
    const label = document.getElementById('theme-label');
    const sysDark = () => window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches;
    const cur = () => document.documentElement.getAttribute('data-theme') || (sysDark() ? 'dark' : 'light');
    const set = (t) => { document.documentElement.setAttribute('data-theme', t); if (label) label.textContent = t === 'dark' ? 'Light' : 'Dark'; };
    if (label) label.textContent = sysDark() ? 'Light' : 'Dark';
    btn.onclick = () => set(cur() === 'dark' ? 'light' : 'dark');
  }

  window.App = { api, getMe, requireSession, gbp, fmtDate, el, renderTopnav, initTheme };
})();
