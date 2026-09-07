(function () {
  'use strict';
  const { api, requireSession, renderTopnav, gbp, fmtDate, el } = App;

  let me = null;
  let projects = [];
  let currentId = null;
  let current = null; // { project, valuations }

  const $ = (id) => document.getElementById(id);
  const rowsEl = () => $('rows');

  async function init() {
    me = await requireSession();
    if (!me) return;
    renderTopnav(me, 'app');
    wire();
    await loadProjects();
    if (projects.length) selectProject(projects[0].id);
    else showNewForm();
  }

  function wire() {
    $('new-project').onclick = showNewForm;
    $('np-cancel').onclick = () => { $('new-form').hidden = true; if (currentId) $('detail').hidden = false; else $('empty').hidden = false; };
    $('np-create').onclick = createProject;
    $('add-row').onclick = () => addRow();
    $('run').onclick = runValuation;
    $('save').onclick = saveDetails;
    $('d-delete').onclick = deleteProject;
  }

  function show(which) {
    $('empty').hidden = which !== 'empty';
    $('new-form').hidden = which !== 'new';
    $('detail').hidden = which !== 'detail';
  }
  function showNewForm() { show('new'); $('np-name').value = ''; $('np-loc').value = ''; $('np-err').hidden = true; $('np-name').focus(); }

  async function loadProjects() {
    const data = await api('GET', '/api/projects');
    projects = data.projects || [];
    renderProjectList();
    refreshQuotaBadge(data.quota);
  }

  function refreshQuotaBadge(q) {
    if (q) { me.quota = q; renderTopnav(me, 'app'); }
  }

  function renderProjectList() {
    const list = $('proj-list');
    list.innerHTML = '';
    projects.forEach((p) => {
      const b = el('button', 'proj-item' + (p.id === currentId ? ' active' : ''));
      b.appendChild(el('span', 'p-name', p.name));
      const meta = p.lastValuationAt ? 'Valued ' + fmtDate(p.lastValuationAt) : (p.unitCount + ' unit' + (p.unitCount === 1 ? '' : 's'));
      b.appendChild(el('span', 'p-meta', p.location + ' · ' + meta));
      b.onclick = () => selectProject(p.id);
      list.appendChild(b);
    });
  }

  async function createProject() {
    $('np-err').hidden = true;
    const name = $('np-name').value.trim();
    const location = $('np-loc').value.trim();
    if (!name || !location) { $('np-err').textContent = 'Please enter a name and location.'; $('np-err').hidden = false; return; }
    try {
      const { project } = await api('POST', '/api/projects', { name, location, houseTypes: [] });
      await loadProjects();
      selectProject(project.id);
    } catch (e) { $('np-err').textContent = e.message; $('np-err').hidden = false; }
  }

  async function selectProject(id) {
    currentId = id;
    renderProjectList();
    show('detail');
    try {
      current = await api('GET', '/api/projects/' + id);
    } catch (e) { alert(e.message); return; }
    renderDetail();
  }

  function renderDetail() {
    const p = current.project;
    $('d-name').textContent = p.name;
    $('d-loc').textContent = p.location;
    rowsEl().innerHTML = '';
    const hts = (p.houseTypes && p.houseTypes.length) ? p.houseTypes : [null];
    hts.forEach((ht) => addRow(ht));
    $('run-err').hidden = true;
    $('run-status').textContent = '';
    // latest valuation
    if (current.valuations && current.valuations.length) renderResults(current.valuations[0]);
    else $('results').hidden = true;
    renderHistory();
  }

  function addRow(data) {
    const tpl = $('row-tpl');
    const frag = tpl.content.cloneNode(true);
    const row = frag.querySelector('[data-row]');
    if (data) {
      row.querySelector('[data-f="name"]').value = data.name || '';
      row.querySelector('[data-f="sqft"]').value = data.sqft || '';
      row.querySelector('[data-f="bedrooms"]').value = data.bedrooms || '';
      if (data.parking) row.querySelector('[data-f="parking"]').value = data.parking;
      if (data.typology) row.querySelector('[data-f="typology"]').value = data.typology;
    }
    row.querySelector('[data-remove]').onclick = () => {
      if (rowsEl().children.length > 1) row.remove();
      else row.querySelectorAll('input').forEach((i) => (i.value = ''));
    };
    rowsEl().appendChild(frag);
  }

  function collectRows() {
    const out = [];
    rowsEl().querySelectorAll('[data-row]').forEach((row, i) => {
      out.push({
        id: 'house-' + (i + 1),
        name: row.querySelector('[data-f="name"]').value.trim(),
        sqft: Number(row.querySelector('[data-f="sqft"]').value),
        bedrooms: Number(row.querySelector('[data-f="bedrooms"]').value),
        parking: row.querySelector('[data-f="parking"]').value,
        typology: row.querySelector('[data-f="typology"]').value,
      });
    });
    return out;
  }

  function validateRows(rows) {
    if (!rows.length) return 'Add at least one house type.';
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      if (!r.name || !(r.sqft > 0) || !(r.bedrooms > 0)) return 'Complete every field for house type ' + (i + 1) + ' (name, size, bedrooms).';
    }
    return null;
  }

  async function saveDetails() {
    const rows = collectRows();
    try {
      await api('PUT', '/api/projects/' + currentId, { houseTypes: rows });
      $('run-status').textContent = 'Saved.';
      setTimeout(() => ($('run-status').textContent = ''), 1500);
      await loadProjects();
    } catch (e) { $('run-err').textContent = e.message; $('run-err').hidden = false; }
  }

  async function runValuation() {
    $('run-err').hidden = true;
    const rows = collectRows();
    const v = validateRows(rows);
    if (v) { $('run-err').textContent = v; $('run-err').hidden = false; return; }

    $('run').disabled = true;
    $('run-status').innerHTML = '<span class="spinner"></span> Researching live market data — up to a minute…';
    try {
      const data = await api('POST', '/api/projects/' + currentId + '/valuation', { location: current.project.location, houseTypes: rows });
      $('run-status').textContent = '';
      // refresh detail + list
      current = await api('GET', '/api/projects/' + currentId);
      renderDetail();
      refreshQuotaBadge(data.quota);
      $('results').scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (e) {
      if (e.status === 402) { $('run-err').innerHTML = e.message + ' <a href="/billing.html">Upgrade →</a>'; }
      else $('run-err').textContent = e.message;
      $('run-err').hidden = false;
      $('run-status').textContent = '';
    } finally {
      $('run').disabled = false;
    }
  }

  function renderResults(val) {
    $('results').hidden = false;
    $('res-title').textContent = 'Valuation — ' + (val.location || current.project.location);
    $('res-meta').textContent = 'Generated ' + fmtDate(val.createdAt) + (val.model ? ' · ' + val.model : '');
    $('res-pdf').href = '/api/projects/' + currentId + '/valuations/' + val.id + '/pdf';
    if (val.marketOverview) { $('res-overview').hidden = false; $('res-overview-text').textContent = val.marketOverview; }
    else $('res-overview').hidden = true;

    const grid = $('res-grid');
    grid.innerHTML = '';
    (val.results || []).forEach((r) => grid.appendChild(card(r)));
  }

  function card(r) {
    const frag = $('card-tpl').content.cloneNode(true);
    frag.querySelector('[data-name]').textContent = r.name || 'House type';
    const conf = ['low', 'medium', 'high'].includes(r.confidence) ? r.confidence : 'medium';
    const chip = frag.querySelector('[data-conf]');
    chip.textContent = conf.charAt(0).toUpperCase() + conf.slice(1) + ' confidence';
    chip.classList.add('chip--' + conf);
    frag.querySelector('[data-price]').textContent = gbp(r.predictedPrice);
    frag.querySelector('[data-persqft]').textContent = typeof r.pricePerSqft === 'number' ? gbp(r.pricePerSqft) + ' / sqft' : '';
    const pr = r.priceRange || {};
    frag.querySelector('[data-low]').textContent = gbp(pr.low);
    frag.querySelector('[data-high]').textContent = gbp(pr.high);
    const dot = frag.querySelector('[data-dot]');
    if (typeof pr.low === 'number' && typeof pr.high === 'number' && pr.high > pr.low && typeof r.predictedPrice === 'number') {
      dot.style.left = Math.max(0, Math.min(100, ((r.predictedPrice - pr.low) / (pr.high - pr.low)) * 100)) + '%';
    } else { dot.style.display = 'none'; }
    frag.querySelector('[data-summary]').textContent = r.summary || '';
    const comps = frag.querySelector('[data-comps]');
    (Array.isArray(r.comparables) ? r.comparables : []).forEach((c) => {
      const li = document.createElement('li');
      const price = typeof c.price === 'number' ? gbp(c.price) : '';
      li.textContent = [c.description, price].filter(Boolean).join(' — ');
      if (c.source) { const s = el('span', 'muted', ' (' + c.source + ')'); li.appendChild(s); }
      comps.appendChild(li);
    });
    if (!comps.children.length) comps.appendChild(el('li', 'muted', 'No comparables returned.'));
    return frag;
  }

  function renderHistory() {
    const vs = current.valuations || [];
    if (vs.length <= 1) { $('history').hidden = true; return; }
    $('history').hidden = false;
    const body = $('hist-body');
    body.innerHTML = '';
    vs.forEach((v) => {
      const tr = document.createElement('tr');
      tr.appendChild(el('td', null, fmtDate(v.createdAt)));
      tr.appendChild(el('td', null, String((v.results || []).length)));
      tr.appendChild(el('td', 'muted', v.model || ''));
      const td = document.createElement('td');
      const view = el('a', '', 'View');
      view.href = '#'; view.onclick = (e) => { e.preventDefault(); renderResults(v); $('results').scrollIntoView({ behavior: 'smooth' }); };
      const pdf = el('a', '', 'PDF');
      pdf.href = '/api/projects/' + currentId + '/valuations/' + v.id + '/pdf';
      pdf.style.marginLeft = '12px';
      td.appendChild(view); td.appendChild(pdf);
      tr.appendChild(td);
      body.appendChild(tr);
    });
  }

  async function deleteProject() {
    if (!confirm('Delete this project and all its valuations? This cannot be undone.')) return;
    await api('DELETE', '/api/projects/' + currentId);
    currentId = null; current = null;
    await loadProjects();
    if (projects.length) selectProject(projects[0].id);
    else show('empty');
  }

  init();
})();
