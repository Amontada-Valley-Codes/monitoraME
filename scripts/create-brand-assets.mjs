import { mkdirSync, writeFileSync } from 'node:fs';
import sharp from 'sharp';

// Trace the shapes from the supplied identity panel and recolor the resulting paths.
const source = 'C:/Users/praze/Downloads/Painel de identidade MonitoraME claro e escuro.png';
const output = new URL('../public/brand/', import.meta.url);
mkdirSync(output, { recursive: true });

async function trace(crop, matches) {
  const { data, info } = await sharp(source).extract(crop).raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  const pixels = new Uint8Array(width * height);
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    const i = (y * width + x) * channels;
    pixels[y * width + x] = Number(matches(data[i], data[i + 1], data[i + 2]));
  }
  const filled = (x, y) => x >= 0 && x < width && y >= 0 && y < height && pixels[y * width + x] === 1;
  const edges = [], outgoing = new Map();
  const add = (x1, y1, x2, y2, dir) => {
    const edge = { x1, y1, x2, y2, dir, used: false };
    edges.push(edge);
    const key = `${x1},${y1}`;
    if (!outgoing.has(key)) outgoing.set(key, []);
    outgoing.get(key).push(edge);
  };
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) if (filled(x, y)) {
    if (!filled(x, y - 1)) add(x, y, x + 1, y, 0);
    if (!filled(x + 1, y)) add(x + 1, y, x + 1, y + 1, 1);
    if (!filled(x, y + 1)) add(x + 1, y + 1, x, y + 1, 2);
    if (!filled(x - 1, y)) add(x, y + 1, x, y, 3);
  }
  const loops = [];
  for (const first of edges) {
    if (first.used) continue;
    const points = [[first.x1, first.y1]];
    let edge = first;
    while (edge && !edge.used) {
      edge.used = true;
      points.push([edge.x2, edge.y2]);
      const choices = (outgoing.get(`${edge.x2},${edge.y2}`) || []).filter((item) => !item.used);
      edge = choices.sort((a, b) => ((a.dir - edge.dir + 4) % 4) - ((b.dir - edge.dir + 4) % 4))[0];
    }
    if (points.length < 9) continue;
    const corners = points.filter((point, i) => {
      if (i === 0 || i === points.length - 1) return true;
      const prev = points[i - 1], next = points[i + 1];
      return (point[0] - prev[0]) * (next[1] - point[1]) !== (point[1] - prev[1]) * (next[0] - point[0]);
    });
    loops.push(`M${corners.map(([x, y]) => `${x} ${y}`).join('L')}Z`);
  }
  return loops.join('');
}

const wordPath = await trace({ left: 202, top: 138, width: 512, height: 72 }, (r, g, b) => r < 150 && g < 150 && b < 150);
const markPath = await trace({ left: 279, top: 307, width: 198, height: 119 }, (r, g, b) => b > r + 30 && b > g + 10);
const path = (d, fill) => `<path d="${d}" fill="${fill}" fill-rule="evenodd"/>`;
const word = (fill) => path(wordPath, fill);
const mark = (fill) => path(markPath, fill);
const app = `<rect width="120" height="120" rx="30" fill="var(--brand-blue, #2058B7)"/><g transform="translate(12 31) scale(.49)">${mark('var(--brand-cutout, #FFFFFF)')}</g>`;
function save(name, width, height, content) {
  writeFileSync(new URL(name, output), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="MonitoraME"><title>MonitoraME</title>${content}</svg>\n`);
}
save('icon-app.svg', 120, 120, app);
save('icon-m.svg', 198, 119, mark('var(--brand-blue, #2058B7)'));
for (const [theme, ink] of [['light', 'var(--brand-ink, #171717)'], ['dark', 'var(--brand-ink, #FFFFFF)']]) {
  save(`horizontal-${theme}.svg`, 672, 120, `${app}<g transform="translate(145 25)">${word(ink)}</g>`);
  save(`stacked-${theme}.svg`, 552, 225, `<g transform="translate(177 0)">${mark('var(--brand-blue, #2058B7)')}</g><g transform="translate(20 148)">${word(ink)}</g>`);
}
for (const [name, ink] of [['black', 'var(--brand-ink, #171717)'], ['white', 'var(--brand-ink, #FFFFFF)']]) {
  save(`wordmark-${name}.svg`, 512, 72, word(ink));
}
