// ============================================================
//  modules/scan-file.js — Scan File Tab Logic
// ============================================================

(function initScanFile() {
  const fileInput   = document.getElementById('fileInput');
  const fileDisplay = document.getElementById('fileDisplay');

  fileInput.addEventListener('change', function () {
    const file = fileInput.files[0];
    if (!file) {
      fileDisplay.innerHTML = '📁 No file selected <span style="opacity:0.5;font-size:11px;">(drag &amp; drop or click)</span>';
      fileDisplay.setAttribute('aria-hasfile', 'false');
      return;
    }
    fileDisplay.textContent = '📄 ' + file.name;
    fileDisplay.setAttribute('aria-hasfile', 'true');
    if (config.autoScan) doScan('file');
  });

  // Drag & drop
  fileDisplay.addEventListener('dragover', e => { e.preventDefault(); fileDisplay.style.borderColor = 'rgba(0,240,255,0.5)'; });
  fileDisplay.addEventListener('dragleave', () => { fileDisplay.style.borderColor = ''; });
  fileDisplay.addEventListener('drop', function (e) {
    e.preventDefault(); fileDisplay.style.borderColor = '';
    const file = e.dataTransfer.files[0];
    if (!file) return;
    const dt = new DataTransfer();
    dt.items.add(file);
    fileInput.files = dt.files;
    fileDisplay.textContent = '📄 ' + file.name;
    fileDisplay.setAttribute('aria-hasfile', 'true');
    if (config.autoScan) doScan('file');
  });
})();

// ── Scan dispatcher ──────────────────────────────────────────
function doScan(source) {
  if (source === 'file') {
    const fileInput = document.getElementById('fileInput');
    if (!fileInput.files.length) { showToast('⚠ Please choose a file first!'); return; }
    const file   = fileInput.files[0];
    const reader = new FileReader();
    reader.onload = e => processText(e.target.result, file.name, file.size);
    reader.readAsText(file);
  } else {
    const text = document.getElementById('pasteArea').value.trim();
    if (!text) { showToast('⚠ Please paste some code first!'); return; }
    processText(text, 'pasted-code', text.length);
  }
}
