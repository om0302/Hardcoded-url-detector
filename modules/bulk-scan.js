// ============================================================
//  modules/bulk-scan.js — Bulk File Scan Tab Logic
// ============================================================

function updateBulkDisplay() {
  const input = document.getElementById('bulkInput');
  const list  = document.getElementById('bulkFileList');
  if (!input.files.length) { list.innerHTML = ''; return; }
  list.innerHTML = Array.from(input.files).map((f, i) =>
    '<div style="font-size:11px;color:#7ad3f5;padding:4px 0;border-bottom:1px solid rgba(255,255,255,0.05);">'
    + '📄 ' + escapeHTML(f.name) + ' <span style="color:#5a9db5;">(' + (f.size / 1024).toFixed(1) + ' KB)</span>'
    + '</div>'
  ).join('');
}

async function doBulkScan() {
  const input = document.getElementById('bulkInput');
  if (!input.files.length) { showToast('⚠ Please choose files first!'); return; }

  const progress = document.getElementById('bulkProgress');
  progress.style.display = 'block';
  allResults = [];

  const files = Array.from(input.files);
  for (const file of files) {
    const text = await readFileAsText(file);
    const lines    = text.split('\n');
    const urlRegex = /https?:\/\/[^\s'"<>)\]]+/g;
    lines.forEach((line, idx) => {
      const matches = line.match(urlRegex);
      if (matches) {
        matches.forEach(url => {
          url = url.replace(/[.,;`'")\]]+$/, '');
          const type = classifyURL(url);
          const wl   = isWhitelisted(url);
          const risk = scoreRisk(url, type);
          allResults.push({ line: idx + 1, url, type, risk, whitelisted: wl, domain: extractDomain(url), source: file.name });
        });
      }
    });
  }

  progress.style.display = 'none';

  const total = allResults.length;
  const crit  = allResults.filter(r => r.risk.level === 'critical').length;
  const seen  = new Set(); let dupes = 0;
  allResults.forEach(r => { if (seen.has(r.url)) dupes++; else seen.add(r.url); });

  document.getElementById('statTotal').textContent    = total;
  document.getElementById('statHttps').textContent    = allResults.filter(r => r.type === 'https').length;
  document.getElementById('statHttp').textContent     = allResults.filter(r => r.type === 'http').length;
  document.getElementById('statLocal').textContent    = allResults.filter(r => r.type === 'localhost').length;
  document.getElementById('statIP').textContent       = allResults.filter(r => r.type === 'ip').length;
  document.getElementById('statLines').textContent    = '—';
  document.getElementById('statCritical').textContent = crit;
  document.getElementById('statDupes').textContent    = dupes;

  document.getElementById('statsRow').style.display      = 'flex';
  document.getElementById('filterSection').style.display = 'block';
  document.getElementById('bottomBar').style.display     = 'flex';
  document.getElementById('fileSize').textContent        = files.length + ' files scanned';

  activeFilter = 'all';
  document.querySelectorAll('.chip').forEach(c => c.classList.toggle('active', c.dataset.filter === 'all'));
  renderResults();
  addHistory('Bulk: ' + files.length + ' files', total, 0, crit);
  incrementVersion('Bulk: ' + files.length + ' files', total, crit);
  showToast('✅ Bulk scan complete — ' + total + ' URLs found!');
}

function clearBulk() {
  document.getElementById('bulkInput').value = '';
  document.getElementById('bulkFileList').innerHTML = '';
  showToast('Cleared ✓');
}

function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload  = e => resolve(e.target.result);
    r.onerror = reject;
    r.readAsText(file);
  });
}
