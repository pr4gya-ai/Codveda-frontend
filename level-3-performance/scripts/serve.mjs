// Tiny static server with gzip/brotli + realistic cache headers, so before/after can be measured fairly.
import http from 'node:http';
import { createReadStream, statSync } from 'node:fs';
import zlib from 'node:zlib';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dir = path.join(root, process.argv[2] || 'after');
const port = Number(process.argv[3] || 4002);
const optimized = (process.argv[2] || 'after') === 'after';
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.png': 'image/png', '.webp': 'image/webp' };
const compressible = new Set(['.html', '.css', '.js']);

http.createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (p.endsWith('/')) p += 'index.html';
  const file = path.join(dir, p);
  if (!file.startsWith(dir)) { res.writeHead(403).end(); return; }
  let st;
  try { st = statSync(file); if (!st.isFile()) throw 0; } catch { res.writeHead(404).end('Not found'); return; }
  const ext = path.extname(file);
  const headers = { 'Content-Type': types[ext] || 'application/octet-stream' };
  // "before" mimics a naive host: no compression, no caching. "after" uses both.
  if (optimized) {
    headers['Cache-Control'] = ext === '.html' ? 'public, max-age=0, must-revalidate' : 'public, max-age=31536000, immutable';
  }
  const ae = req.headers['accept-encoding'] || '';
  if (optimized && compressible.has(ext)) {
    const enc = /\bbr\b/.test(ae) ? 'br' : /\bgzip\b/.test(ae) ? 'gzip' : null;
    if (enc) {
      headers['Content-Encoding'] = enc; headers['Vary'] = 'Accept-Encoding';
      res.writeHead(200, headers);
      createReadStream(file).pipe(enc === 'br' ? zlib.createBrotliCompress() : zlib.createGzip()).pipe(res);
      return;
    }
  }
  headers['Content-Length'] = st.size;
  res.writeHead(200, headers);
  createReadStream(file).pipe(res);
}).listen(port, () => console.log(`Serving ${path.basename(dir)}/ at http://localhost:${port}`));
