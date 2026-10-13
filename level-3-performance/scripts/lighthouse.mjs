// Runs Lighthouse (mobile emulation, default throttling) against before/after and prints a comparison table.
import { spawn } from 'node:child_process';
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import { writeFile, mkdir } from 'node:fs/promises';

const targets = [['before', 4001], ['after', 4002]];
const servers = targets.map(([d, p]) => spawn('node', ['scripts/serve.mjs', d, String(p)], { stdio: 'ignore' }));
await new Promise((r) => setTimeout(r, 800));

const chrome = await chromeLauncher.launch({
  chromePath: process.env.CHROME_PATH,
  chromeFlags: ['--headless=new', '--no-sandbox', '--disable-gpu'],
});
await mkdir('reports', { recursive: true });
const rows = [];
try {
  for (const [name, port] of targets) {
    const runs = [];
    for (let i = 0; i < 3; i++) {
      const r = await lighthouse(`http://localhost:${port}/`, { port: chrome.port, output: 'json', onlyCategories: ['performance'], logLevel: 'error' });
      runs.push(r.lhr);
    }
    runs.sort((a, b) => a.categories.performance.score - b.categories.performance.score);
    const m = runs[1]; // median run
    await writeFile(`reports/${name}.json`, JSON.stringify(m, null, 2));
    const a = m.audits;
    rows.push({
      version: name,
      score: Math.round(m.categories.performance.score * 100),
      FCP: a['first-contentful-paint'].displayValue,
      LCP: a['largest-contentful-paint'].displayValue,
      TBT: a['total-blocking-time'].displayValue,
      CLS: a['cumulative-layout-shift'].displayValue,
      'page weight': (a['total-byte-weight'].numericValue / 1024).toFixed(0) + ' KiB',
    });
  }
} finally {
  await chrome.kill();
  servers.forEach((s) => s.kill());
}
console.table(rows);
await writeFile('reports/summary.json', JSON.stringify(rows, null, 2));
