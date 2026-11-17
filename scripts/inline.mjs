// Inline the built CSS and JS into docs/index.html so the site is a single self-contained file.
import { readFileSync, writeFileSync, readdirSync, rmSync } from 'node:fs';
const dist = new URL('../docs/', import.meta.url);
let html = readFileSync(new URL('index.html', dist), 'utf8');
for (const f of readdirSync(new URL('assets/', dist))) {
  const body = readFileSync(new URL(`assets/${f}`, dist), 'utf8');
  if (f.endsWith('.css')) html = html.replace(/<link rel="stylesheet"[^>]*>/, () => `<style>${body}</style>`);
  if (f.endsWith('.js')) html = html.replace(/<script type="module" crossorigin src="[^"]*"><\/script>/, () => `<script type="module">${body.replace(/<\/script/gi, '<\\/script')}</script>`);
}
if (/assets\//.test(html)) throw new Error('Asset reference left un-inlined');
writeFileSync(new URL('index.html', dist), html);
rmSync(new URL('assets/', dist), { recursive: true });
console.log(`docs/index.html: ${(html.length / 1024).toFixed(1)} KB`);
