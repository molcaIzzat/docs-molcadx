// molca-erd — table edit helpers. Paste this file as the start of a figma_execute `code`, then append the
// EDITS block for this run (see the example at the bottom). Works on tables at page level or inside sections.
//
// Table contract (keep it, route.js and priority.js depend on it):
//   node name  "erd:<KEY>"            KEY = UPPER_SNAKE, short aliases allowed (WOO, PUC, ACL, UOM)
//   row 0      TABLE | <table_name> | <DOMAIN · MODULE>   header row, fill = module colour (see SKILL.md)
//   rows 1..n  <type> | <column> | <note>                 type ∈ id string int numeric bool enum date
//                                                          timestamp timestamptz time datetime key-value list ref
//   note words the router reads: "PK", "FK", "nullable", "conditional", "UQ (1:1)"

const page = figma.currentPage;
const all = () => page.findAll(n => n.type === 'TABLE' && n.name.startsWith('erd:'));
const T = Object.fromEntries(all().map(t => [t.name.slice(4), t]));

// Load every font the tables use before touching any text (FigJam throws otherwise).
{ const fonts = new Map();
  for (const t of Object.values(T)) for (let r = 0; r < Math.min(t.numRows, 3); r++) for (let c = 0; c < t.numColumns; c++) {
    const f = t.cellAt(r, c).text.fontName; if (f && f !== figma.mixed) fonts.set(JSON.stringify(f), f); }
  for (const f of fonts.values()) await figma.loadFontAsync(f); }

// "type|column|note" lines -> [[type,column,note], ...]
const P = s => s.trim().split('\n').map(l => { const a = l.split('|').map(x => x.trim()); while (a.length < 3) a.push(''); return a; });
const VF = 'date|valid_from|\ndate|valid_to|nullable';

// Replace the whole body of a table. Rows are added with insertRow (NOT insertRowAfter — that does not exist).
const setRows = (t, rows) => {
  const need = rows.length + 1;
  while (t.numRows < need) t.insertRow(t.numRows - 1);
  while (t.numRows > need) t.removeRow(t.numRows - 1);
  rows.forEach((row, i) => row.forEach((v, j) => { t.cellAt(i + 1, j).text.characters = v; }));
};

// Insert one row after the row whose column == afterCol. No-op if `col` already exists.
const addRowAfter = (t, afterCol, [type, col, note]) => {
  for (let r = 1; r < t.numRows; r++) if (t.cellAt(r, 1).text.characters.trim() === col) return;
  for (let r = 1; r < t.numRows; r++) if (t.cellAt(r, 1).text.characters.trim() === afterCol) {
    t.insertRow(r + 1); t.cellAt(r + 1, 0).text.characters = type; t.cellAt(r + 1, 1).text.characters = col;
    t.cellAt(r + 1, 2).text.characters = note; return; }
};

// New table = clone of a table with the same header colour (same module), placed in the same parent.
// Reuses an existing erd:<KEY> if a previous partial run already created it (runs are not transactional).
const newTable = (key, likeKey, title, module, rows) => {
  let t = T[key];
  if (!t) { t = T[likeKey].clone(); T[likeKey].parent.appendChild(t); t.name = 'erd:' + key; }
  t.cellAt(0, 1).text.characters = title; t.cellAt(0, 2).text.characters = module;
  setRows(t, P(rows)); T[key] = t; return t;
};

// Re-stack each column inside one parent (page or section): same x, top at `top`, 160 px gaps.
// orderByKey: optional {x: [KEY, ...]} to force an order in a column; otherwise current y order is kept.
const restack = (parent, top = 400, orderByKey = {}) => {
  const byCol = {};
  for (const t of all().filter(t => t.parent === parent)) (byCol[Math.round(t.x)] ??= []).push(t);
  for (const x in byCol) {
    const ord = orderByKey[x];
    byCol[x].sort((a, b) => ord ? ord.indexOf(a.name.slice(4)) - ord.indexOf(b.name.slice(4)) : a.y - b.y);
    let y = top; for (const t of byCol[x]) { t.y = y; y += t.height + 160; }
  }
};

/* ---- EDITS for this run (example from 2026-10-01) ----
setRows(T.ROUTING, P(`id|routing_id|PK
id|product_id|FK
id|flow_id|FK → product_flow
id|work_center_id|FK
int|version|per flow + work center
enum|status|draft, released, retired
${VF}`));
newTable('PRODUCT_FLOW', 'OPERATION', 'product_flow', 'FND · WMS', `id|product_flow_id|PK
id|product_id|FK
string|flow_code|UQ per product
${VF}`);
addRowAfter(T.ASSET_TAGS, 'count_basis', ['enum', 'count_side', 'conditional — output, input']);
restack(T.ROUTING.parent);
return 'ok';
*/
