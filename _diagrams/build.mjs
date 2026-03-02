#!/usr/bin/env node
// Builds .tex files in _diagrams/ to self-contained .svg files in assets/diagrams/
// Usage: node _diagrams/build.mjs [filename.tex]
//   If no filename given, builds all .tex files in _diagrams/

import { load, tex, dvi2svg } from 'node-tikzjax';
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'fs';
import { join, basename } from 'path';

const DIAGRAMS_DIR = new URL('.', import.meta.url).pathname;
const OUTPUT_DIR = join(DIAGRAMS_DIR, '..', 'assets', 'diagrams');
const FONT_DIR = join(DIAGRAMS_DIR, '..', 'node_modules', 'node-tikzjax', 'css', 'bakoma', 'ttf');

function embedFonts(svg) {
  // Extract font families used in this SVG
  const fontMatches = svg.match(/font-family="([^"]*)"/g) || [];
  const fonts = [...new Set(fontMatches.map(m => m.match(/"([^"]*)"/)[1]))];

  if (fonts.length === 0) return svg;

  // Build @font-face declarations with base64-embedded TTF data
  const fontFaces = fonts.map(font => {
    const ttfPath = join(FONT_DIR, `${font}.ttf`);
    try {
      const ttfData = readFileSync(ttfPath);
      const b64 = ttfData.toString('base64');
      return `@font-face { font-family: ${font}; src: url(data:font/truetype;base64,${b64}); }`;
    } catch {
      console.warn(`  Warning: font ${font}.ttf not found, skipping embed`);
      return '';
    }
  }).filter(Boolean).join('\n');

  // Inject <style> with @font-face into the SVG, right after the opening <svg> tag
  return svg.replace(/<svg([^>]*)>/, `<svg$1><style>${fontFaces}</style>`);
}

async function buildDiagram(texFile) {
  const name = basename(texFile, '.tex');
  const input = readFileSync(join(DIAGRAMS_DIR, texFile), 'utf-8');

  console.log(`Building ${texFile}...`);
  const dvi = await tex(input, { tikzLibraries: 'cd' });
  let svg = await dvi2svg(dvi);

  // Embed fonts as base64 for self-contained rendering
  svg = embedFonts(svg);

  mkdirSync(OUTPUT_DIR, { recursive: true });
  const outPath = join(OUTPUT_DIR, `${name}.svg`);
  writeFileSync(outPath, svg);

  const sizeKB = (Buffer.byteLength(svg) / 1024).toFixed(1);
  console.log(`  → ${outPath} (${sizeKB} KB)`);
}

await load();

const files = process.argv.length > 2
  ? [process.argv[2]]
  : readdirSync(DIAGRAMS_DIR).filter(f => f.endsWith('.tex'));

for (const f of files) {
  await buildDiagram(f);
}

console.log('Done.');
