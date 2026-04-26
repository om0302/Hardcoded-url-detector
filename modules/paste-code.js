// ============================================================
//  modules/paste-code.js — Paste Code Tab Logic
// ============================================================

function clearPaste() {
  document.getElementById('pasteArea').value = '';
  showToast('Cleared ✓');
}
