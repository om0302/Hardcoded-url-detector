// ============================================================
//  modules/charts.js — Charts Tab
// ============================================================

function renderCharts() {
  const div = document.getElementById('chartsContent');
  if (!allResults.length) { div.innerHTML = '<p style="color:#5a9db5;font-size:12px;text-align:center;">Run a scan first.</p>'; return; }

  div.innerHTML = '<div class="charts-grid">'
    + '<div class="chart-box"><h4>URL Types</h4><canvas id="chartTypes"></canvas></div>'
    + '<div class="chart-box"><h4>Risk Distribution</h4><canvas id="chartRisk"></canvas></div>'
    + '<div class="chart-box"><h4>Top Domains</h4><canvas id="chartDomains"></canvas></div>'
    + '<div class="chart-box"><h4>Lines per URL Type</h4><canvas id="chartLines"></canvas></div>'
    + '</div>';

  Object.values(chartInstances).forEach(c => c.destroy());
  chartInstances = {};

  const chartDefaults = {
    color: '#9de8ff',
    plugins: { legend: { labels: { color: '#9de8ff', font: { family: 'Share Tech Mono', size: 11 } } } }
  };

  // Types doughnut
  const typeCounts = {};
  allResults.forEach(r => typeCounts[r.type] = (typeCounts[r.type] || 0) + 1);
  chartInstances.types = new Chart(document.getElementById('chartTypes'), {
    type: 'doughnut',
    data: { labels: Object.keys(typeCounts), datasets: [{ data: Object.values(typeCounts), backgroundColor: ['#39ff14','#ff7a18','#00f0ff','#ff2948'], borderWidth: 0 }] },
    options: { ...chartDefaults, cutout: '55%' }
  });

  // Risk bar
  const riskCounts = { critical: 0, high: 0, medium: 0, low: 0, safe: 0 };
  allResults.forEach(r => riskCounts[r.risk.level]++);
  chartInstances.risk = new Chart(document.getElementById('chartRisk'), {
    type: 'bar',
    data: { labels: ['Critical','High','Medium','Low','Safe'], datasets: [{ data: Object.values(riskCounts), backgroundColor: ['#ff2948','#ff7a18','#ffe600','#00f0ff','#39ff14'], borderWidth: 0, borderRadius: 6 }] },
    options: { ...chartDefaults, scales: { x: { ticks: { color: '#9de8ff' }, grid: { color: 'rgba(255,255,255,0.04)' } }, y: { ticks: { color: '#9de8ff' }, grid: { color: 'rgba(255,255,255,0.04)' } } }, plugins: { legend: { display: false } } }
  });

  // Top domains
  const domainCount = {};
  allResults.forEach(r => domainCount[r.domain] = (domainCount[r.domain] || 0) + 1);
  const topD = Object.entries(domainCount).sort((a,b) => b[1]-a[1]).slice(0, 7);
  chartInstances.domains = new Chart(document.getElementById('chartDomains'), {
    type: 'bar',
    data: { labels: topD.map(d => d[0].substring(0, 20)), datasets: [{ data: topD.map(d => d[1]), backgroundColor: '#ff3ecf', borderWidth: 0, borderRadius: 4 }] },
    options: { ...chartDefaults, indexAxis: 'y', scales: { x: { ticks: { color: '#9de8ff' }, grid: { color: 'rgba(255,255,255,0.04)' } }, y: { ticks: { color: '#9de8ff', font: { size: 9 } }, grid: { display: false } } }, plugins: { legend: { display: false } } }
  });

  // Line distribution
  const lineGroups = { '1-25': 0, '26-50': 0, '51-75': 0, '76-100': 0, '100+': 0 };
  allResults.forEach(r => {
    if (r.line <= 25) lineGroups['1-25']++;
    else if (r.line <= 50) lineGroups['26-50']++;
    else if (r.line <= 75) lineGroups['51-75']++;
    else if (r.line <= 100) lineGroups['76-100']++;
    else lineGroups['100+']++;
  });
  chartInstances.lines = new Chart(document.getElementById('chartLines'), {
    type: 'pie',
    data: { labels: Object.keys(lineGroups), datasets: [{ data: Object.values(lineGroups), backgroundColor: ['#00f0ff','#ff3ecf','#39ff14','#ffe600','#ff7a18'], borderWidth: 0 }] },
    options: chartDefaults
  });
}
