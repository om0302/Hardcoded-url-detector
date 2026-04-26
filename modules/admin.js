// ============================================================
//  modules/admin.js — Admin Panel Logic
// ============================================================

function openAdminModal()  { document.getElementById('adminModal').style.display = 'flex'; }
function closeAdminModal() { document.getElementById('adminModal').style.display = 'none'; }

function doAdminLogin() {
  const user = document.getElementById('adminUser').value.trim();
  const pass = document.getElementById('adminPass').value.trim();
  if (user === 'admin' && pass === 'admin123') {
    isAdminLoggedIn = true;
    closeAdminModal();
    openAdminPanel();
    showToast('🔓 Admin access granted!');
  } else {
    showToast('❌ Invalid credentials');
    document.getElementById('adminPass').value = '';
  }
}

function openAdminPanel() {
  if (!isAdminLoggedIn) { openAdminModal(); return; }
  renderAdminPanel();
  document.getElementById('adminPanel').style.display = 'flex';
}

function closeAdminPanel() { document.getElementById('adminPanel').style.display = 'none'; }

function renderAdminPanel() {
  const totalScans = scanHistory.length;
  const totalURLs  = scanHistory.reduce((s, h) => s + h.urlCount, 0);
  const totalCrit  = scanHistory.reduce((s, h) => s + (h.critCount || 0), 0);

  document.getElementById('adminStats').innerHTML =
    '<div class="admin-stat"><div class="num">' + totalScans + '</div><div class="lbl">Total Scans</div></div>'
    + '<div class="admin-stat"><div class="num">' + totalURLs + '</div><div class="lbl">Total URLs Found</div></div>'
    + '<div class="admin-stat"><div class="num" style="color:var(--neon-red);">' + totalCrit + '</div><div class="lbl">Critical Findings</div></div>'
    + '<div class="admin-stat"><div class="num" style="color:var(--neon-green);">' + whitelist.length + '</div><div class="lbl">Whitelisted Domains</div></div>';

  const rows = scanHistory.map((h, i) =>
    '<tr><td>' + (i+1) + '</td><td>' + escapeHTML(h.name) + '</td><td>' + h.urlCount + '</td>'
    + '<td style="color:var(--neon-red);">' + (h.critCount||0) + '</td><td>' + h.time + '</td></tr>'
  ).join('');
  document.getElementById('adminHistoryTable').innerHTML =
    '<table class="admin-table"><tr><th>#</th><th>File</th><th>URLs</th><th>Critical</th><th>Time</th></tr>' + rows + '</table>';

  renderWhitelistDisplay();
  document.getElementById('cfgMaxHistory').value = config.maxHistory;
  document.getElementById('cfgAutoScan').checked  = config.autoScan;
  document.getElementById('cfgRisk').checked      = config.showRisk;
  document.getElementById('cfgDark').checked      = !document.body.classList.contains('light-mode');
}

function addWhitelist() {
  const val = document.getElementById('whitelistInput').value.trim();
  if (!val) { showToast('⚠ Enter a domain first'); return; }
  if (whitelist.includes(val)) { showToast('Already in whitelist'); return; }
  whitelist.push(val);
  localStorage.setItem('urlDetectorWhitelist', JSON.stringify(whitelist));
  document.getElementById('whitelistInput').value = '';
  renderWhitelistDisplay();
  showToast('✅ Added: ' + val);
}

function removeWhitelist(domain) {
  whitelist = whitelist.filter(d => d !== domain);
  localStorage.setItem('urlDetectorWhitelist', JSON.stringify(whitelist));
  renderWhitelistDisplay();
  renderAdminPanel();
  showToast('🗑 Removed: ' + domain);
}

function renderWhitelistDisplay() {
  const div = document.getElementById('whitelistDisplay');
  if (!whitelist.length) { div.innerHTML = '<p style="color:#5a9db5;font-size:11px;">No domains whitelisted yet.</p>'; return; }
  div.innerHTML = whitelist.map(d =>
    '<span class="wl-tag">' + escapeHTML(d) + '<button onclick="removeWhitelist(\'' + escapeAttr(d) + '\')">✕</button></span>'
  ).join('');
}

function saveConfig() {
  config.maxHistory = parseInt(document.getElementById('cfgMaxHistory').value) || 15;
  config.autoScan   = document.getElementById('cfgAutoScan').checked;
  config.showRisk   = document.getElementById('cfgRisk').checked;
  localStorage.setItem('urlDetectorConfig', JSON.stringify(config));
  showToast('💾 Config saved!');
}

function clearAllData() {
  if (!confirm('Clear ALL history, whitelist, and config? This cannot be undone.')) return;
  localStorage.clear();
  scanHistory = [];
  whitelist   = [];
  config = { maxHistory: 15, autoScan: true, showRisk: true, darkMode: true };
  closeAdminPanel();
  showToast('🗑 All data cleared');
}
