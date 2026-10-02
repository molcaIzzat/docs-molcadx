// molca-erd — group tables into one SECTION per domain. Paste as figma_execute `code` (timeout 20000).
// Idempotent: lifts every erd: table back to page level, deletes all sections, deletes all erd-rel lines,
// re-stacks FOUNDATION, places the other domains in a row below it, and rebuilds the sections.
// ALWAYS run scripts/route.js afterwards — this script deletes the lines.
//
// Domain of a table = the prefix of its header module cell (row 0, col 2): "PROD ·" / "MNT ·" / else FOUNDATION.
// Grid: columns at x = 0, 1300, 2600 … (table width 730, gutter 570). FOUNDATION column x positions are kept.
// LOWER: where each non-FOUNDATION table goes in the lower row — x = the column of the table it links to most,
// so its lines are short. Tables listed for the same x stack top-down in list order.
const LOWER = {
  MAINTENANCE: { 3900: ['ACL', 'PM_PROCEDURE', 'PM_STEP'] },
  PRODUCTION: { 5200: ['ASSET_STATE_LOG'], 6500: ['WOO_DEFECT', 'WOO_LOT'], 7800: ['WOO'], 9100: ['WORK_ORDER'] },
};
const FILL = { FOUNDATION: { r: 0.945, g: 0.961, b: 0.996 }, MAINTENANCE: { r: 0.953, g: 0.957, b: 0.965 },
  PRODUCTION: { r: 0.996, g: 0.945, b: 0.945 } };
const PAD = 160, BOTTOM_BAND = 700, GAP = 400;

const page = figma.currentPage;
for (const t of page.findAll(n => n.type === 'TABLE' && n.name.startsWith('erd:'))) if (t.parent !== page) {
  const ax = t.absoluteTransform[0][2], ay = t.absoluteTransform[1][2]; page.appendChild(t); t.x = ax; t.y = ay; }
for (const s of page.children.filter(n => n.type === 'SECTION')) s.remove();
for (const n of [...page.children]) { if (n.removed) continue; if (n.name.startsWith('erd-rel')) n.remove(); }

const tabs = page.children.filter(n => n.type === 'TABLE' && n.name.startsWith('erd:'));
const T = Object.fromEntries(tabs.map(t => [t.name.slice(4), t]));
const dom = t => { const m = t.cellAt(0, 2).text.characters; return /^PROD\b/.test(m) ? 'PRODUCTION' : /^MNT\b/.test(m) ? 'MAINTENANCE' : 'FOUNDATION'; };
const fnd = tabs.filter(t => dom(t) === 'FOUNDATION');

const byCol = {}; for (const t of fnd) (byCol[Math.round(t.x)] ??= []).push(t);
for (const x in byCol) { let y = 400; for (const t of byCol[x].sort((a, b) => a.y - b.y)) { t.y = y; y += t.height + 160; } }
const fBottom = Math.max(...fnd.map(t => t.y + t.height)), fRight = Math.max(...fnd.map(t => t.x + t.width));
const fSecBottom = fBottom + BOTTOM_BAND, rowY = fSecBottom + GAP + 220;

const mkSec = (name, members, fill) => {
  const x1 = Math.min(...members.map(t => t.x)) - PAD, y1 = Math.min(...members.map(t => t.y)) - (name === 'FOUNDATION' ? 400 : 220);
  const x2 = Math.max(...members.map(t => t.x + t.width)) + PAD, y2 = name === 'FOUNDATION' ? fSecBottom : Math.max(...members.map(t => t.y + t.height)) + PAD;
  const s = figma.createSection(); page.insertChild(0, s); s.name = name + ' domain';
  s.x = x1; s.y = y1; s.resizeWithoutConstraints(x2 - x1, y2 - y1); s.fills = [{ type: 'SOLID', color: fill }];
  for (const t of members) { const ax = t.x, ay = t.y; s.appendChild(t); t.x = ax - s.x; t.y = ay - s.y; }
  return [s.x, s.y, s.width, s.height];
};
const out = { FOUNDATION: mkSec('FOUNDATION', fnd, FILL.FOUNDATION) };
const unplaced = [];
for (const d of ['MAINTENANCE', 'PRODUCTION']) {
  const members = [];
  for (const x in LOWER[d]) { let y = rowY; for (const k of LOWER[d][x]) { const t = T[k]; if (!t) continue; t.x = +x; t.y = y; y += t.height + 160; members.push(t); } }
  for (const t of tabs) if (dom(t) === d && !members.includes(t)) unplaced.push(t.name);
  if (members.length) out[d] = mkSec(d, members, FILL[d]);
}
const title = page.children.find(x => x.type === 'TEXT'); if (title) { title.x = -PAD; title.y = -260; }
const lg = page.children.find(x => x.type === 'SHAPE_WITH_TEXT'); if (lg) { lg.x = fRight + PAD + 200; lg.y = 0; }
return { sections: out, unplaced }; // unplaced must be empty — add those keys to LOWER
