// ============================================================
//  modules/history.js — Scan History Tab
// ============================================================

function addHistory(name, urlCount, lineCount, critCount) {
  scanHistory.unshift({ name, urlCount, lineCount, critCount: critCount || 0, time: new Date().toLocaleTimeString() });
  if (scanHistory.length > config.maxHistory) scanHistory.pop();
  localStorage.setItem('urlDetectorHistory', JSON.stringify(scanHistory));
}

function renderHistory() {
  const div = document.getElementById('historyList');
  if (!scanHistory.length) {
    div.innerHTML = '<p style="color:#5a9db5;font-size:12px;">No scans yet.</p>';
    return;
  }
  div.innerHTML = scanHistory.map(h =>
    '<div class="history-item">'
    + '<span class="history-name">📄 ' + escapeHTML(h.name) + '</span>'
    + '<span class="history-count">' + h.urlCount + ' URLs' + (h.critCount ? ' · <span style="color:var(--neon-red);">' + h.critCount + ' critical</span>' : '') + '</span>'
    + '<span class="history-time">' + h.lineCount + ' lines · ' + h.time + '</span>'
    + '</div>'
  ).join('');
}

function clearHistory() {
  scanHistory = [];
  localStorage.removeItem('urlDetectorHistory');
  renderHistory();
  showToast('🗑 History cleared');
}
