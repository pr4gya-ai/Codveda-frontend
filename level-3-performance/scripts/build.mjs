// Optimizing build: before/ -> after/
//  - responsive WebP images (+ srcset, width/height, lazy, async decode)
//  - minified + content-hashed JS (deferred); critical CSS inlined (no render-blocking request)
//  - minified HTML
//  - long-lived immutable caching headers (_headers for Netlify; serve.mjs mirrors them locally)
import { readFile, writeFile, mkdir, rm, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import esbuild from 'esbuild';
import sharp from 'sharp';
import { minify as minifyHtml } from 'html-minifier-terser';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = path.join(root, 'before');
const out = path.join(root, 'after');
const hash = (buf) => createHash('sha256').update(buf).digest('hex').slice(0, 8);

await rm(out, { recursive: true, force: true });
await mkdir(path.join(out, 'img'), { recursive: true });

// --- JS & CSS ---
const js = await esbuild.transform(await readFile(path.join(src, 'script.js'), 'utf8'), { minify: true, target: 'es2019' });
const css = await esbuild.transform(await readFile(path.join(src, 'styles.css'), 'utf8'), { loader: 'css', minify: true });
const jsName = `script.${hash(js.code)}.js`;
await writeFile(path.join(out, jsName), js.code);

// --- Images: 480/800/1200 WebP ---
const widths = [480, 800, 1200];
const meta = {};
for (const f of (await readdir(path.join(src, 'img'))).filter((n) => n.endsWith('.png'))) {
  const base = f.replace('.png', '');
  const input = sharp(path.join(src, 'img', f));
  const { width, height } = await input.metadata();
  meta[base] = { width, height };
  for (const w of widths) {
    await input.clone().resize({ width: w }).webp({ quality: 72, effort: 5 }).toFile(path.join(out, 'img', `${base}-${w}.webp`));
  }
}

// --- HTML ---
let html = await readFile(path.join(src, 'index.html'), 'utf8');
html = html
  .replace('<link rel="stylesheet" href="styles.css" />', `<style>${css.code}</style>`)
  .replace('<script src="script.js"></script>', `<script src="/${jsName}" defer></script>`)
  .replace(/<img src="img\/(photo\d)\.png" alt="([^"]*)" \/>/g, (_, base, alt) => {
    const m = meta[base];
    const srcset = widths.map((w) => `/img/${base}-${w}.webp ${w}w`).join(', ');
    return `<picture><img src="/img/${base}-800.webp" srcset="${srcset}" sizes="(min-width:960px) 540px, (min-width:640px) 48vw, 92vw" width="${m.width}" height="${m.height}" alt="${alt}" loading="lazy" decoding="async"></picture>`;
  });
html = await minifyHtml(html, { collapseWhitespace: true, removeComments: true, removeRedundantAttributes: true, minifyCSS: false, minifyJS: false });
await writeFile(path.join(out, 'index.html'), html);

// --- Caching headers (Netlify / Cloudflare Pages format) ---
await writeFile(path.join(out, '_headers'), `/*\n  X-Content-Type-Options: nosniff\n/index.html\n  Cache-Control: public, max-age=0, must-revalidate\n/script.*.js\n  Cache-Control: public, max-age=31536000, immutable\n/img/*\n  Cache-Control: public, max-age=31536000, immutable\n`);

console.log('Built ->', out);
