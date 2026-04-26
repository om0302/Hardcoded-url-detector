// ============================================================
//  modules/core.js — Shared State, Helpers, Tab & Theme
// ============================================================

// ── Global State ─────────────────────────────────────────────
let allResults   = [];
let activeFilter = 'all';
let scanHistory  = JSON.parse(localStorage.getItem('urlDetectorHistory') || '[]');
let whitelist    = JSON.parse(localStorage.getItem('urlDetectorWhitelist') || '[]');
let isAdminLoggedIn = false;
let chartInstances  = {};
let currentSource   = '';
let lastScanStats   = {};

let config = JSON.parse(localStorage.getItem('urlDetectorConfig') || JSON.stringify({
  maxHistory: 15,
  autoScan:   true,
  showRisk:   true,
  darkMode:   true
}));

// ── Tab Switching ─────────────────────────────────────────────
function switchTab(name, btn) {
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('tab-' + name).classList.add('active');
  if (btn) btn.classList.add('active');
  if (name === 'history')  renderHistory();
  if (name === 'charts'   && allResults.length) renderCharts();
  if (name === 'risk'     && allResults.length) renderRiskReport();
  if (name === 'analyzer' && allResults.length) renderAnalyzer();
}

// ── URL Type Classifier ───────────────────────────────────────
function classifyURL(url) {
  if (/localhost|127\.0\.0\.1/.test(url)) return 'localhost';
  if (/^https?:\/\/\d{1,3}(\.\d{1,3}){3}/.test(url)) return 'ip';
  if (url.startsWith('https://')) return 'https';
  return 'http';
}

function colorForType(type) {
  return { https: 'green', http: 'orange', localhost: 'blue', ip: 'red' }[type] || 'blue';
}

// ── Risk Scorer ───────────────────────────────────────────────
function scoreRisk(url, type) {
  let score = 0, reasons = [];
  if (type === 'http'  && !/localhost|127\.0\.0\.1/.test(url)) { score += 30; reasons.push('Unencrypted HTTP'); }
  if (type === 'ip')   { score += 25; reasons.push('Direct IP address (no domain)'); }
  if (/password|passwd|secret|token|apikey|api_key|key=|auth=|credential/i.test(url)) { score += 40; reasons.push('Sensitive keyword in URL'); }
  if (/\?.*=.*[a-zA-Z0-9]{20,}/.test(url)) { score += 20; reasons.push('Long token/key parameter detected'); }
  if (type === 'localhost') { score += 5; reasons.push('Localhost reference'); }
  if (/staging|test|dev\.|debug/i.test(url)) { score += 10; reasons.push('Non-production environment'); }
  if (/admin|root|superuser/i.test(url)) { score += 20; reasons.push('Admin path detected'); }
  if (url.length > 200) { score += 10; reasons.push('Unusually long URL'); }
  let level = score >= 60 ? 'critical' : score >= 40 ? 'high' : score >= 20 ? 'medium' : score >= 5 ? 'low' : 'safe';
  return { score, level, reasons };
}

// ── Whitelist Check ───────────────────────────────────────────
function isWhitelisted(url) {
  return whitelist.some(domain => url.includes(domain));
}

// ── Extract Domain ────────────────────────────────────────────
function extractDomain(url) {
  try { return new URL(url).hostname; }
  catch (e) {
    const m = url.match(/https?:\/\/([^\/\?#:]+)/);
    return m ? m[1] : url;
  }
}

// ── Filter Chip ───────────────────────────────────────────────
function applyFilter(filterValue, btn) {
  activeFilter = filterValue;
  document.querySelectorAll('.chip').forEach(c => c.classList.toggle('active', c.dataset.filter === filterValue));
  renderResults();
}

// ── Render Results ────────────────────────────────────────────
function renderResults() {
  const query  = (document.getElementById('searchBar')?.value || '').toLowerCase();
  const sortBy = document.getElementById('sortSelect')?.value || 'line';
  const div    = document.getElementById('results');
  div.innerHTML = '';

  let filtered = allResults.filter(r => {
    if (activeFilter === 'all')         return true;
    if (activeFilter === 'critical')    return r.risk.level === 'critical';
    if (activeFilter === 'whitelisted') return r.whitelisted;
    return r.type === activeFilter;
  }).filter(r => {
    if (!query) return true;
    return r.url.toLowerCase().includes(query) || String(r.line).includes(query) || r.domain.toLowerCase().includes(query);
  });

  filtered.sort((a, b) => {
    if (sortBy === 'risk')   return b.risk.score - a.risk.score;
    if (sortBy === 'type')   return a.type.localeCompare(b.type);
    if (sortBy === 'domain') return a.domain.localeCompare(b.domain);
    return a.line - b.line;
  });

  if (!filtered.length) {
    div.innerHTML = '<div class="no-url">'
      + (allResults.length ? '🔍 No results match your filter/search.' : '✅ No hardcoded URLs found in this file!')
      + '</div>';
    return;
  }

  const showRisk = document.getElementById('chkShowRisk')?.checked !== false;

  filtered.forEach((r, i) => {
    const card = document.createElement('div');
    card.className = 'result-card ' + colorForType(r.type) + (r.whitelisted ? ' whitelisted' : '');
    card.style.animationDelay = (i * 20) + 'ms';
    card.setAttribute('data-url', r.url);
    card.setAttribute('data-line', r.line);
    card.setAttribute('data-type', r.type);
    card.setAttribute('data-risk', r.risk.level);

    const badge     = '<span class="badge ' + r.type + '">' + r.type.toUpperCase() + '</span>';
    const riskBadge = showRisk ? '<span class="risk-badge ' + r.risk.level + '">' + r.risk.level.toUpperCase() + '</span>' : '';
    const wlBadge   = r.whitelisted ? '<span style="font-size:10px;color:#39ff14;">✅ WL</span>' : '';

    card.innerHTML =
      '<div class="card-left">'
        + '<span class="card-line">Line ' + r.line + ' &nbsp;·&nbsp; ' + escapeHTML(r.domain) + (r.whitelisted ? ' · <span style="color:#39ff14;">whitelisted</span>' : '') + '</span>'
        + '<span class="card-url">' + escapeHTML(r.url) + '</span>'
        + (showRisk && r.risk.reasons.length ? '<span style="font-size:9px;color:#5a9db5;margin-top:2px;">⚠ ' + r.risk.reasons.join(' · ') + '</span>' : '')
      + '</div>'
      + '<div style="display:flex;gap:5px;align-items:center;flex-shrink:0;flex-wrap:wrap;">'
        + badge + riskBadge + wlBadge
        + '<button class="btn copy-btn" onclick="copyURL(\'' + escapeAttr(r.url) + '\')">📋</button>'
        + '<a href="' + escapeAttr(r.url) + '" target="_blank" rel="noopener" class="btn copy-btn" style="text-decoration:none;color:var(--neon-blue);">🔗</a>'
      + '</div>';
    div.appendChild(card);
  });
}

// ── Core processText ──────────────────────────────────────────
function processText(text, sourceName, sourceSize) {
  currentSource = sourceName;
  const ignoreComments = document.getElementById('chkIgnoreComments')?.checked;
  const applyWL        = document.getElementById('chkApplyWhitelist')?.checked;
  const lines          = text.split('\n');
  const urlRegex       = /https?:\/\/[^\s'"<>)\]]+/g;
  allResults = [];

  lines.forEach((line, idx) => {
    if (ignoreComments && /^\s*(\/\/|#|\/\*|\*)/.test(line)) return;
    const matches = line.match(urlRegex);
    if (matches) {
      matches.forEach(url => {
        url = url.replace(/[.,;`'")\]]+$/, '');
        const type = classifyURL(url);
        const wl   = applyWL && isWhitelisted(url);
        const risk = scoreRisk(url, type);
        allResults.push({ line: idx + 1, url, type, risk, whitelisted: wl, domain: extractDomain(url), source: sourceName });
      });
    }
  });

  const total  = allResults.length;
  const httpsC = allResults.filter(r => r.type === 'https').length;
  const httpC  = allResults.filter(r => r.type === 'http').length;
  const localC = allResults.filter(r => r.type === 'localhost').length;
  const ipC    = allResults.filter(r => r.type === 'ip').length;
  const crit   = allResults.filter(r => r.risk.level === 'critical').length;
  const seen   = new Set(); let dupes = 0;
  allResults.forEach(r => { if (seen.has(r.url)) dupes++; else seen.add(r.url); });

  lastScanStats = { total, httpsC, httpC, localC, ipC, crit, dupes, lines: lines.length, sourceName };

  document.getElementById('statTotal').textContent    = total;
  document.getElementById('statHttps').textContent    = httpsC;
  document.getElementById('statHttp').textContent     = httpC;
  document.getElementById('statLocal').textContent    = localC;
  document.getElementById('statIP').textContent       = ipC;
  document.getElementById('statLines').textContent    = lines.length;
  document.getElementById('statCritical').textContent = crit;
  document.getElementById('statDupes').textContent    = dupes;

  document.getElementById('statsRow').style.display      = 'flex';
  document.getElementById('filterSection').style.display = 'block';
  document.getElementById('bottomBar').style.display     = 'flex';

  const sizeLabel = typeof sourceSize === 'number'
    ? (sourceSize / 1024).toFixed(1) + ' KB — ' + sourceName
    : sourceName;
  document.getElementById('fileSize').textContent = sizeLabel;

  activeFilter = 'all';
  document.querySelectorAll('.chip').forEach(c => c.classList.toggle('active', c.dataset.filter === 'all'));
  if (document.getElementById('searchBar')) document.getElementById('searchBar').value = '';

  renderResults();
  addHistory(sourceName, total, lines.length, crit);
  incrementVersion(sourceName, total, crit);
  showToast(total ? '✅ Found ' + total + ' URL' + (total > 1 ? 's' : '') + '!' : '✅ No hardcoded URLs found!');
}

// ── Clear Results ─────────────────────────────────────────────
function clearResults() {
  allResults = [];
  ['results', 'analyzerContent', 'riskContent', 'chartsContent'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = id === 'results' ? '' : '<p style="color:#5a9db5;font-size:12px;text-align:center;">Run a scan first.</p>';
  });
  document.getElementById('statsRow').style.display      = 'none';
  document.getElementById('filterSection').style.display = 'none';
  document.getElementById('bottomBar').style.display     = 'none';
  const fi = document.getElementById('fileInput');
  if (fi) fi.value = '';
  const fd = document.getElementById('fileDisplay');
  if (fd) { fd.innerHTML = '📁 No file selected <span style="opacity:0.5;font-size:11px;">(drag &amp; drop or click)</span>'; fd.setAttribute('aria-hasfile','false'); }
  const pa = document.getElementById('pasteArea');
  if (pa) pa.value = '';
  showToast('🗑 Cleared');
}

// ── Theme Toggle ──────────────────────────────────────────────
function toggleTheme() {
  document.body.classList.toggle('light-mode');
  const isLight = document.body.classList.contains('light-mode');
  document.getElementById('themeToggleBtn').textContent = isLight ? '🌙' : '☀️';
}

// ── Copy URL ──────────────────────────────────────────────────
function copyURL(url) {
  navigator.clipboard.writeText(url)
    .then(() => showToast('📋 Copied!'))
    .catch(() => showToast('⚠ Copy failed'));
}

// ── Toast ─────────────────────────────────────────────────────
let toastTimer;
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2500);
}

// ── Helpers ───────────────────────────────────────────────────
function escapeHTML(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
function escapeAttr(str) {
  return String(str).replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}
