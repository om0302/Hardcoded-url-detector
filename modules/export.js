// ============================================================
//  modules/export.js — Export (txt, csv, json, html)
// ============================================================

function exportTxt() {
  if (!allResults.length) { showToast('⚠ Nothing to export.'); return; }
  const content = allResults.map(r => 'Line ' + r.line + ' [' + r.type.toUpperCase() + '] [' + r.risk.level.toUpperCase() + ']: ' + r.url).join('\n');
  downloadFile('url-report.txt', content, 'text/plain');
  showToast('⬇ Exported as .txt');
}

function exportCSV() {
  if (!allResults.length) { showToast('⚠ Nothing to export.'); return; }
  const rows = ['Line,Type,Risk,Domain,URL'].concat(
    allResults.map(r => r.line + ',' + r.type + ',' + r.risk.level + ',' + r.domain + ',' + r.url)
  );
  downloadFile('url-report.csv', rows.join('\n'), 'text/csv');
  showToast('⬇ Exported as .csv');
}

function exportJSON() {
  if (!allResults.length) { showToast('⚠ Nothing to export.'); return; }
  const data = {
    meta: { generated: new Date().toISOString(), tool: 'Hardcoded URL Detector PRO', totalURLs: allResults.length },
    stats: lastScanStats,
    results: allResults.map(r => ({ line: r.line, url: r.url, type: r.type, domain: r.domain, risk: r.risk, whitelisted: r.whitelisted, source: r.source }))
  };
  downloadFile('url-report.json', JSON.stringify(data, null, 2), 'application/json');
  showToast('⬇ Exported as .json');
}

function exportHTML() {
  if (!allResults.length) { showToast('⚠ Nothing to export.'); return; }
  const colorMap = { critical:'#ff2948', high:'#ff7a18', medium:'#ffe600', low:'#00f0ff', safe:'#39ff14' };
  const rows = allResults.map(r =>
    '<tr><td>' + r.line + '</td><td>' + escapeHTML(r.source) + '</td><td>' + r.type.toUpperCase() + '</td>'
    + '<td style="color:' + colorMap[r.risk.level] + ';">' + r.risk.level.toUpperCase() + '</td>'
    + '<td>' + escapeHTML(r.domain) + '</td><td style="word-break:break-all;">' + escapeHTML(r.url) + '</td></tr>'
  ).join('');

  const html = '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>URL Detector Report</title>'
    + '<style>body{font-family:monospace;background:#04040a;color:#cfeefb;padding:24px;}'
    + 'h1{color:#00f0ff;}table{width:100%;border-collapse:collapse;margin-top:16px;}'
    + 'th{background:#0a1420;color:#00f0ff;padding:8px;text-align:left;border-bottom:1px solid #1a3a4a;}'
    + 'td{padding:7px 8px;border-bottom:1px solid #0d1f2d;font-size:12px;}'
    + 'tr:hover td{background:rgba(0,240,255,0.04);}'
    + '</style></head><body>'
    + '<h1>🔎 Hardcoded URL Detector PRO — Report</h1>'
    + '<p>Generated: ' + new Date().toLocaleString() + ' · Total: ' + allResults.length + ' URLs</p>'
    + '<table><tr><th>Line</th><th>File</th><th>Type</th><th>Risk</th><th>Domain</th><th>URL</th></tr>'
    + rows + '</table></body></html>';

  downloadFile('url-report.html', html, 'text/html');
  showToast('⬇ Exported as .html report');
}

function downloadFile(filename, content, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
}
