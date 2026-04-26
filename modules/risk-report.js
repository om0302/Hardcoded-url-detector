// ============================================================
//  modules/risk-report.js — Risk Report Tab
// ============================================================

function renderRiskReport() {
  const div = document.getElementById('riskContent');
  if (!allResults.length) { div.innerHTML = '<p style="color:#5a9db5;font-size:12px;text-align:center;">Run a scan first.</p>'; return; }

  const levels = ['critical', 'high', 'medium', 'low', 'safe'];
  let html = '';

  levels.forEach(level => {
    const items = allResults.filter(r => r.risk.level === level);
    if (!items.length) return;
    html += '<div class="analyzer-section"><h4>' + level.toUpperCase() + ' RISK — ' + items.length + ' URL' + (items.length > 1 ? 's' : '') + '</h4>';
    items.forEach(r => {
      html += '<div class="risk-card">'
        + '<div class="risk-url">'
          + '<div style="font-size:10px;color:#7ad3f5;margin-bottom:3px;">Line ' + r.line + ' · ' + r.type.toUpperCase() + '</div>'
          + escapeHTML(r.url)
          + (r.risk.reasons.length ? '<div class="risk-reason">⚠ ' + r.risk.reasons.join(' · ') + '</div>' : '')
        + '</div>'
        + '<span class="risk-badge ' + r.risk.level + '">' + r.risk.level.toUpperCase() + '</span>'
        + '</div>';
    });
    html += '</div>';
  });

  div.innerHTML = html || '<div class="no-url">✅ No risks detected!</div>';
}
