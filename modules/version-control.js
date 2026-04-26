// ============================================================
//  modules/version-control.js — Report Version Tracking
// ============================================================

let scanVersions = JSON.parse(localStorage.getItem('urlDetectorVersions') || '[]');
let currentVersion = 0;

/**
 * Called after every scan to bump the version counter and
 * store a version record. The version info is shown inside
 * the Risk Report tab.
 */
function incrementVersion(sourceName, urlCount, critCount) {
  currentVersion = scanVersions.length + 1;
  const record = {
    version:    currentVersion,
    scanId:     'SCAN-' + Date.now(),
    source:     sourceName,
    urlCount,
    critCount:  critCount || 0,
    timestamp:  new Date().toISOString()
  };
  scanVersions.unshift(record);
  if (scanVersions.length > 50) scanVersions.pop();       // keep last 50
  localStorage.setItem('urlDetectorVersions', JSON.stringify(scanVersions));
  updateVersionBadge(record);
}

/** Renders the version banner in the Risk Report tab */
function updateVersionBadge(record) {
  const vi = document.getElementById('versionInfo');
  if (!vi) return;
  vi.style.display = 'block';
  document.getElementById('reportVersion').textContent  = 'v' + record.version;
  document.getElementById('reportScanId').textContent   = record.scanId;
  document.getElementById('reportTimestamp').textContent = new Date(record.timestamp).toLocaleString();
}

/** Returns the full version log (used by admin / export) */
function getVersionLog() {
  return scanVersions;
}
