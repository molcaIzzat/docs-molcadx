// molca-erd — line router. Paste the whole file as the `code` of figma_execute (timeout 30000).
// Idempotent: deletes every page-level node named "erd-rel*" and redraws one line per FK in RELS.
// Each line = a group "erd-rel:<CHILD>.<fk>><PARENT>" holding
//   - a short STRAIGHT connector attached to the child table at its FK row (crow's foot cap), and
//   - a vector path routed through free lanes (gutters between columns, empty bands between tables), and
//   - a short STRAIGHT connector attached to the parent table at its PK area (one / zero-or-one cap).
// Rules the router enforces: no segment crosses a table, no two lines share a lane (SP px apart).
// Lines whose two tables sit in the same SECTION keep their horizontal run inside that section.
// Returns {drawn,total,fails,segments,tableHits,overlaps}. tableHits and overlaps must both be 0.
//
// RELS: one entry per FK column, "<CHILD_KEY>.<fk_column>><PARENT_KEY>". KEY = table node name minus "erd:".
// Edit this list when a spec adds/removes an FK. Optional parent end is derived from the FK row note
// ("nullable" / "conditional"); 1:1 child end from "UQ (1:1)".
const RELS = `
ENTERPRISE.tenant_id>TENANT SITE.enterprise_id>ENTERPRISE SITE.site_class_id>SITE_CLASS AREA.site_id>SITE
AREA.area_class_id>AREA_CLASS WORK_CENTER.area_id>AREA WORK_CENTER.work_center_class_id>WORK_CENTER_CLASS
WORK_UNIT.work_center_id>WORK_CENTER WORK_UNIT.work_unit_class_id>WORK_UNIT_CLASS
EQUIPMENT_FLOW.work_center_id>WORK_CENTER EQUIPMENT_FLOW.from_work_unit_id>WORK_UNIT EQUIPMENT_FLOW.to_work_unit_id>WORK_UNIT
WORK_UNIT_FLOW.from_work_unit_id>WORK_UNIT WORK_UNIT_FLOW.to_work_unit_id>WORK_UNIT
FISCAL_YEAR.enterprise_id>ENTERPRISE ENTERPRISE_SHIFT.enterprise_id>ENTERPRISE SITE_SHIFT.site_id>SITE
SITE_SHIFT.enterprise_shift_id>ENTERPRISE_SHIFT SHIFT_INSTANCE.site_shift_id>SITE_SHIFT DATA_SOURCE.site_id>SITE
KPI_RESULT.work_unit_id>WORK_UNIT KPI_PARAMETERS.slot_id>KPI_FORMULA_SLOT
WORK_UNIT_KPI_BINDING.work_unit_id>WORK_UNIT WORK_UNIT_KPI_BINDING.slot_id>KPI_FORMULA_SLOT
WORK_UNIT_KPI_BINDING.asset_tag_id>ASSET_TAGS WORK_UNIT_KPI_BINDING.second_asset_tag_id>ASSET_TAGS
ASSET_PLACEMENT.asset_id>ASSET ASSET_PLACEMENT.work_unit_id>WORK_UNIT ASSET_CLASS.parent_class_id>ASSET_CLASS
ASSET_TYPE.asset_class_id>ASSET_CLASS ASSET.asset_type_id>ASSET_TYPE ASSET.parent_asset_id>ASSET
ASSET_TAGS.asset_id>ASSET ASSET_TAGS.data_source_id>DATA_SOURCE ASSET_TAGS.work_unit_id>WORK_UNIT
ASSET_TAGS.reject_reason_id>REJECT_REASON ASSET_TAGS.downtime_reason_id>DOWNTIME_REASON ASSET_TAGS.uom_id>UOM
ASSET_PRODUCT_CODES.tag_id>ASSET_TAGS ASSET_PRODUCT_CODES.product_id>PRODUCT
DOWNTIME_REASON_ASSET.downtime_reason_id>DOWNTIME_REASON DOWNTIME_REASON_ASSET.asset_id>ASSET
REJECT_REASON_ASSET.reject_reason_id>REJECT_REASON REJECT_REASON_ASSET.asset_id>ASSET
ACL.child_asset_id>ASSET ACL.parent_asset_id>ASSET PM_PROCEDURE.asset_type_id>ASSET_TYPE PM_STEP.pm_procedure_id>PM_PROCEDURE
WORK_ORDER.product_id>PRODUCT WORK_ORDER.product_flow_id>PRODUCT_FLOW WORK_ORDER.routing_id>ROUTING
WORK_ORDER.bom_id>BOM WORK_ORDER.uom_id>UOM
WOO.work_order_id>WORK_ORDER WOO.operation_id>OPERATION WOO.work_unit_id>WORK_UNIT WOO.shift_instance_id>SHIFT_INSTANCE
WOO_DEFECT.wo_operation_id>WOO WOO_DEFECT.defect_code_id>REJECT_REASON WOO_DEFECT.uom_id>UOM
WOO_LOT.wo_operation_id>WOO WOO_LOT.uom_id>UOM
ASSET_STATE_LOG.asset_id>ASSET ASSET_STATE_LOG.work_unit_id>WORK_UNIT ASSET_STATE_LOG.shift_instance_id>SHIFT_INSTANCE
ASSET_STATE_LOG.downtime_reason_id>DOWNTIME_REASON
ROUTING.product_id>PRODUCT ROUTING.flow_id>PRODUCT_FLOW ROUTING.work_center_id>WORK_CENTER
OPERATION.routing_id>ROUTING OPERATION.work_unit_id>WORK_UNIT OPERATION.required_work_unit_class_id>WORK_UNIT_CLASS
OPERATION.uom_id>UOM OPERATION.time_conversion_id>TIME_CONVERSIONS OPERATION.speed_uom_id>UOM
OPERATION.setup_time_conversion_id>TIME_CONVERSIONS OPERATION.hold_time_conversion_id>TIME_CONVERSIONS
OPERATION_WORK_UNIT.operation_id>OPERATION OPERATION_WORK_UNIT.work_unit_id>WORK_UNIT
OPERATION_DEPENDENCY.operation_id>OPERATION OPERATION_DEPENDENCY.predecessor_operation_id>OPERATION
OPERATION_PARAMETER.operation_id>OPERATION OPERATION_PARAMETER.uom_id>UOM OPERATION_INSTRUCTION.operation_id>OPERATION
OPERATION_CHECK.operation_id>OPERATION OPERATION_CHECK.uom_id>UOM OPERATION_CHECK.frequency_interval_conversion_id>TIME_CONVERSIONS
BOM.product_id>PRODUCT BOM.flow_id>PRODUCT_FLOW BOM.base_uom_id>UOM
BOM_LINE.bom_id>BOM BOM_LINE.component_product_id>PRODUCT BOM_LINE.operation_id>OPERATION BOM_LINE.uom_id>UOM
PRODUCT_FLOW.product_id>PRODUCT PRODUCT.base_uom_id>UOM PRODUCT_DETAIL.product_id>PRODUCT PRODUCT_DETAIL.weight_uom_id>UOM
PUC.product_id>PRODUCT PUC.from_uom_id>UOM PUC.to_uom_id>UOM UOM.measurement_group_id>MEASUREMENT_GROUP
`.trim().split(/\s+/);

const page = figma.currentPage;
const STUB = 48, SP = 20, W = 4, MARGIN = 36;

for (const n of [...page.children]) { if (n.removed) continue; if (n.name.startsWith('erd-rel')) n.remove(); }

// Tables (may live inside SECTIONs, so use absolute coordinates)
const T = {};
for (const t of page.findAll(n => n.type === 'TABLE' && n.name.startsWith('erd:'))) {
  const ax = t.absoluteTransform[0][2], ay = t.absoluteTransform[1][2];
  const rows = []; let y = ay;
  for (let r = 0; r < t.numRows; r++) {
    const h = t.cellAt(r, 0).height;
    rows.push({ col: t.cellAt(r, 1).text.characters.trim(), note: t.cellAt(r, 2).text.characters, top: y, bot: y + h });
    y += h;
  }
  const s = t.parent.type === 'SECTION' ? t.parent : null;
  T[t.name.slice(4)] = { node: t, x: ax, y: ay, w: t.width, h: t.height, rows, color: t.cellAt(0, 0).fills[0].color,
    sec: s ? { id: s.id, y1: s.y, y2: s.y + s.height } : null };
}

// Columns = distinct table x positions; gutters = gaps between columns
const xs = [...new Set(Object.values(T).map(t => Math.round(t.x)))].sort((a, b) => a - b);
for (const k in T) T[k].ci = xs.indexOf(Math.round(T[k].x));
const colR = xs.map((x, i) => Math.max(...Object.values(T).filter(t => t.ci === i).map(t => t.x + t.w)));
const gut = g => g === 0 ? [xs[0] - 560, xs[0]] : g === xs.length ? [colR[xs.length - 1], colR[xs.length - 1] + 560] : [colR[g - 1], xs[g]];
const lanes = g => { const [L, R] = gut(g); const out = []; for (let x = L + STUB + 24; x <= R - STUB - 24; x += SP) out.push(x);
  const c = (L + R) / 2; return out.sort((a, b) => Math.abs(a - c) - Math.abs(b - c)); };

// Occupancy: every placed horizontal / vertical segment
const H = [], V = [];
const ov = (a1, a2, b1, b2) => Math.min(a1, a2) < Math.max(b1, b2) + SP && Math.max(a1, a2) > Math.min(b1, b2) - SP;
const hFree = (y, x1, x2) => !H.some(h => Math.abs(h.y - y) < SP && ov(x1, x2, h.x1, h.x2));
const vFree = (x, y1, y2) => !V.some(v => Math.abs(v.x - x) < SP && ov(y1, y2, v.y1, v.y2));

const fails = [], edges = [];
for (const s of RELS) {
  const [, c, fk, p] = s.match(/^(\w+)\.(\w+)>(\w+)$/); const C = T[c], P = T[p];
  if (!C || !P) { fails.push('missing table ' + s); continue; }
  const fr = C.rows.find(r => r.col === fk); if (!fr) { fails.push('missing fk ' + s); continue; }
  const pr = P.rows.find(r => /PK/.test(r.note)) || P.rows[1];
  edges.push({ s, c, fk, p, C, P, fr, pr, opt: /nullable|conditional/.test(fr.note), oneToOne: /UQ \(1:1\)/.test(fr.note),
    span: Math.abs(C.ci - P.ci) });
}
edges.sort((a, b) => a.span - b.span); // short lines first get the best lanes

const pSlots = (P, pr, near) => { const out = []; const body = P.rows.slice(1);
  for (let y = body[0].top + 12; y <= body[body.length - 1].bot - 12; y += SP) out.push(y);
  return out.sort((a, b) => { const pa = (a >= pr.top && a <= pr.bot) ? 0 : 1, pb = (b >= pr.top && b <= pr.bot) ? 0 : 1;
    return pa - pb || Math.abs(a - near) - Math.abs(b - near); }); };
const cSlots = fr => { const c = (fr.top + fr.bot) / 2; return [c, c - 12, c + 12, c - 24, c + 24]; };
const blocked = (c1, c2) => { const iv = []; for (const k in T) { const t = T[k]; if (t.ci > c1 && t.ci < c2) iv.push([t.y - MARGIN, t.y + t.h + MARGIN]); } return iv; };
const maxB = Math.max(...Object.values(T).map(t => t.y + t.h));

let n = 0;
for (const e of edges) {
  const { C, P } = e; let cs, ps, gC, gP;
  // parent left of child: child exits LEFT, parent entered RIGHT (and mirrored). Same column: both RIGHT.
  if (C.ci > P.ci) { cs = 'L'; ps = 'R'; gC = C.ci; gP = P.ci + 1; }
  else if (C.ci < P.ci) { cs = 'R'; ps = 'L'; gC = C.ci + 1; gP = P.ci; }
  else { cs = 'R'; ps = 'R'; gC = gP = C.ci + 1; }
  const exC = cs === 'L' ? C.x : C.x + C.w, exP = ps === 'L' ? P.x : P.x + P.w;
  const sC = cs === 'L' ? exC - STUB : exC + STUB, sP = ps === 'L' ? exP - STUB : exP + STUB;
  let path = null;
  if (gC === gP) { // one shared gutter: out, one vertical lane, in
    outer: for (const yC of cSlots(e.fr)) for (const yP of pSlots(P, e.pr, yC)) {
      if (e.c === e.p && Math.abs(yC - yP) < SP) continue;
      for (const x of lanes(gC)) if (hFree(yC, sC, x) && hFree(yP, sP, x) && vFree(x, yC, yP)) {
        path = { yC, yP, pts: [[sC, yC], [x, yC], [x, yP], [sP, yP]], h: [[yC, sC, x], [yP, sP, x]], v: [[x, yC, yP]] }; break outer; }
    }
  } else { // child gutter lane -> horizontal corridor free of tables in the columns between -> parent gutter lane
    const iv = blocked(Math.min(C.ci, P.ci), Math.max(C.ci, P.ci));
    const same = C.sec && P.sec && C.sec.id === P.sec.id;
    const lo = same ? C.sec.y1 + 90 : 90, hi = same ? C.sec.y2 - 40 : maxB + 1500;
    const Ys = []; for (let y = lo; y < hi; y += SP) if (!iv.some(([a, b]) => y > a && y < b)) Ys.push(y);
    outer2: for (const yC of cSlots(e.fr)) for (const xC of lanes(gC)) {
      if (!hFree(yC, sC, xC)) continue;
      for (const yP of pSlots(P, e.pr, yC).slice(0, 12)) for (const xP of lanes(gP)) {
        if (!hFree(yP, sP, xP)) continue;
        const tgt = (yC + yP) / 2; const ys = Ys.slice().sort((a, b) => Math.abs(a - tgt) - Math.abs(b - tgt));
        for (const Y of ys) if (vFree(xC, yC, Y) && hFree(Y, xC, xP) && vFree(xP, Y, yP)) {
          path = { yC, yP, pts: [[sC, yC], [xC, yC], [xC, Y], [xP, Y], [xP, yP], [sP, yP]],
            h: [[yC, sC, xC], [Y, xC, xP], [yP, sP, xP]], v: [[xC, yC, Y], [xP, Y, yP]] }; break outer2; }
      }
    }
  }
  if (!path) { fails.push('no route ' + e.s); continue; }
  path.h.forEach(([y, x1, x2]) => H.push({ y, x1, x2 })); path.v.forEach(([x, y1, y2]) => V.push({ x, y1, y2 }));

  const col = P.color, strokes = [{ type: 'SOLID', color: { r: col.r, g: col.g, b: col.b } }]; // line colour = parent header
  const pts = path.pts.filter((p, i, a) => i === 0 || p[0] !== a[i - 1][0] || p[1] !== a[i - 1][1]);
  const v = figma.createVector();
  v.vectorPaths = [{ windingRule: 'NONE', data: pts.map((p, i) => (i ? 'L ' : 'M ') + p[0] + ' ' + p[1]).join(' ') }];
  v.strokes = strokes; v.strokeWeight = W; v.strokeJoin = 'ROUND'; v.cornerRadius = 16; v.fills = [];
  const a = figma.createConnector(); a.connectorLineType = 'STRAIGHT';
  a.connectorStart = { endpointNodeId: C.node.id, position: { x: cs === 'L' ? 0 : C.w, y: path.yC - C.y } };
  a.connectorEnd = { position: { x: sC, y: path.yC } };
  a.connectorStartStrokeCap = e.oneToOne ? 'ERD_ZERO_OR_ONE' : 'ERD_ZERO_OR_MORE'; a.connectorEndStrokeCap = 'NONE';
  a.strokes = strokes; a.strokeWeight = W;
  const b = figma.createConnector(); b.connectorLineType = 'STRAIGHT';
  b.connectorStart = { position: { x: sP, y: path.yP } };
  b.connectorEnd = { endpointNodeId: P.node.id, position: { x: ps === 'L' ? 0 : P.w, y: path.yP - P.y } };
  b.connectorStartStrokeCap = 'NONE'; b.connectorEndStrokeCap = e.opt ? 'ERD_ZERO_OR_ONE' : 'ERD_EXACTLY_ONE';
  b.strokes = strokes; b.strokeWeight = W;
  const g = figma.group([a, v, b], page); g.name = 'erd-rel:' + e.c + '.' + e.fk + '>' + e.p; n++; // page level, above sections
}

// Verify: no segment inside a table, no two lines collinear-overlapping
const rects = Object.values(T).map(t => ({ x1: t.x, y1: t.y, x2: t.x + t.w, y2: t.y + t.h }));
const segs = [];
for (const g of page.children.filter(x => x.type === 'GROUP' && x.name.startsWith('erd-rel'))) {
  const v = g.children.find(c => c.type === 'VECTOR');
  const nums = v.vectorPaths[0].data.match(/-?\d+(\.\d+)?/g).map(Number); const p = [];
  for (let i = 0; i < nums.length; i += 2) p.push([nums[i] + v.absoluteTransform[0][2], nums[i + 1] + v.absoluteTransform[1][2]]);
  for (let i = 1; i < p.length; i++) segs.push({ g: g.name, a: p[i - 1], b: p[i] });
}
let tableHits = 0, overlaps = 0;
for (const s of segs) { const x1 = Math.min(s.a[0], s.b[0]), x2 = Math.max(s.a[0], s.b[0]), y1 = Math.min(s.a[1], s.b[1]), y2 = Math.max(s.a[1], s.b[1]);
  for (const r of rects) if (x1 < r.x2 - 1 && x2 > r.x1 + 1 && y1 < r.y2 - 1 && y2 > r.y1 + 1) tableHits++; }
const span = (a, b, i) => [Math.min(a[i], b[i]), Math.max(a[i], b[i])];
for (let i = 0; i < segs.length; i++) for (let j = i + 1; j < segs.length; j++) {
  const s = segs[i], u = segs[j]; if (s.g === u.g) continue;
  const sh = s.a[1] === s.b[1], uh = u.a[1] === u.b[1];
  if (sh && uh && Math.abs(s.a[1] - u.a[1]) < 8) { const [a1, a2] = span(s.a, s.b, 0), [b1, b2] = span(u.a, u.b, 0); if (Math.min(a2, b2) > Math.max(a1, b1)) overlaps++; }
  if (!sh && !uh && Math.abs(s.a[0] - u.a[0]) < 8) { const [a1, a2] = span(s.a, s.b, 1), [b1, b2] = span(u.a, u.b, 1); if (Math.min(a2, b2) > Math.max(a1, b1)) overlaps++; }
}
return { drawn: n, total: RELS.length, fails, segments: segs.length, tableHits, overlaps };
