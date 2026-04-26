# 🔐 Hardcoded URL Detector PRO — Setup, Git & Playwright Guide

## 📁 Project Structure

```
url-detector/
├── index.html                    ← Main HTML (orchestrator)
├── assets/
│   └── style.css                 ← All styles
├── modules/
│   ├── core.js                   ← Shared state, helpers, tab switching
│   ├── scan-file.js              ← Scan File tab logic
│   ├── paste-code.js             ← Paste Code tab logic
│   ├── bulk-scan.js              ← Bulk Scan tab logic
│   ├── ai-analyzer.js            ← AI Analyzer tab
│   ├── risk-report.js            ← Risk Report tab
│   ├── charts.js                 ← Charts tab
│   ├── history.js                ← History tab
│   ├── admin.js                  ← Admin Panel
│   ├── export.js                 ← TXT/CSV/JSON/HTML export
│   └── version-control.js        ← Scan version tracking
├── tests/
│   └── url-detector.spec.js      ← Playwright tests (no file upload needed)
├── playwright.config.js
├── package.json
└── README.md                     ← This file
```

---

## 🚀 Running the App

```bash
# Install dependencies
npm install

# Start local server
npm run serve
# Open http://localhost:5500 in browser
```

---

## 🎭 Running Playwright Tests

```bash
# Install Playwright + browsers (first time only)
npx playwright install

# Run all tests (headless)
npm test

# Run with browser visible
npm run test:headed

# View HTML report after tests
npm run test:report
```

### ✅ What the tests cover (no file upload needed!)
All tests use the **Paste Code** tab — code is injected programmatically.

| # | Module | Test |
|---|--------|------|
| 1 | Page Load | Title, header, PRO badge |
| 2 | Tabs | All 8 tabs visible, switching works |
| 3 | Paste & Scan | Text injection, stat row, counts |
| 4 | Results | Cards appear, URL text, badges |
| 5 | Filters | HTTPS/HTTP/All filter chips |
| 6 | Search | Filters results, shows no-match |
| 7 | AI Analyzer | Sections render, duplicate detection |
| 8 | Risk Report | Renders, version info, Scan ID |
| 9 | Charts | Canvas elements visible |
| 10 | History | Entry logged, source label |
| 11 | Export | Bar visible, buttons present |
| 12 | Theme | Toggle switches light mode |
| 13 | Clear | Hides stats, removes cards |
| 14 | Admin | Login modal, wrong creds, correct creds |
| ❌ | FAIL | Intentional fail (expects 999 URLs) |

---

## 🗂️ Git Version Control — Step by Step

### Step 1 — Initialize repository
```bash
cd url-detector
git init
git branch -M main
```

### Step 2 — Create .gitignore
```bash
cat > .gitignore << 'EOF'
node_modules/
playwright-report/
test-results/
.DS_Store
*.log
EOF
```

### Step 3 — First commit (initial project)
```bash
git add .
git commit -m "feat: initial modular structure — split into 11 modules"
```

### Step 4 — Add version control module
```bash
git add modules/version-control.js
git commit -m "feat(version-control): add scan version tracking in Risk Report"
```

### Step 5 — Add Playwright tests
```bash
git add tests/ playwright.config.js package.json
git commit -m "test: add Playwright e2e tests — all modules, no file upload required"
```

### Step 6 — Connect to GitHub (replace URL with yours)
```bash
git remote add origin https://github.com/YOUR_USERNAME/url-detector-pro.git
git push -u origin main
```

### Step 7 — Run tests and commit results
```bash
npm test
# Expected: 34 passed, 1 failed (intentional)
git add .
git commit -m "test: run Playwright — 34 pass, 1 intentional fail documented"
git push
```

### Step 8 — Tagging a release version
```bash
git tag -a v1.0.0 -m "Release v1.0.0 — modular build with Playwright tests"
git push origin v1.0.0
```

---

## 📋 Version Control in Reports

After every scan, the **Risk Report tab** shows:
- `Report Version` — auto-incremented (v1, v2, v3…)
- `Scan ID` — unique timestamp ID (e.g. `SCAN-1714012345678`)
- `Generated` — human-readable date/time

Version history is stored in `localStorage` (key: `urlDetectorVersions`).

---

## 🔑 Admin Credentials
- **Username:** `admin`
- **Password:** `admin123`
