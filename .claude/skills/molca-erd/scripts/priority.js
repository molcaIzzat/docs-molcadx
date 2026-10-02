// molca-erd — tint each table BODY by its scope priority (MoSCoW sheet from the PO). Headers keep their
// module colour. Paste as figma_execute `code`. Idempotent: every body cell is re-filled on each run.
// Source of the mapping: the PO's scope spreadsheet (Site & Equipment / Product / Reference Data / KPI /
// Setting). Update the lists below when the sheet changes; tables not listed stay white = "not in the sheet".
// Recorded 2026-10-01. Related tables inherit their sheet item (e.g. the class/flow tables follow Site Hierarchy).
const MUST = [
  // Site Hierarchy
  'TENANT', 'ENTERPRISE', 'SITE', 'AREA', 'WORK_CENTER', 'WORK_UNIT',
  'SITE_CLASS', 'AREA_CLASS', 'WORK_CENTER_CLASS', 'WORK_UNIT_CLASS', 'EQUIPMENT_FLOW', 'WORK_UNIT_FLOW',
  // Asset Registry
  'ASSET', 'ASSET_PLACEMENT', 'ASSET_TAGS',
  // Reference Data: UoM, Time Conversion, Downtime Reason, Reject Reason
  'UOM', 'MEASUREMENT_GROUP', 'PUC', 'TIME_CONVERSIONS',
  'DOWNTIME_REASON', 'DOWNTIME_REASON_ASSET', 'REJECT_REASON', 'REJECT_REASON_ASSET',
  // KPI Formula Slot, KPI Key Binding
  'KPI_FORMULA_SLOT', 'KPI_PARAMETERS', 'WORK_UNIT_KPI_BINDING',
];
const COULD = ['ENTERPRISE_SHIFT', 'SITE_SHIFT', 'SHIFT_INSTANCE', 'FISCAL_YEAR']; // Shift, Fiscal year
const WONT = ['DATA_SOURCE', 'ASSET_CLASS', 'ASSET_TYPE', 'ACL'];                 // Data Source, Asset Class/Type, "Hide Hierarchy & Components"
// Field-level Won't inside a coloured table: sheet items (Batch Track, Barcode, Shelf Life, "Parent Asset hide")
// plus FK columns that point at a Won't table.
const WONT_ROWS = { PRODUCT_DETAIL: ['barcode', 'is_batch_tracked', 'shelf_life_days'],
  ASSET: ['parent_asset_id', 'asset_type_id'], ASSET_TAGS: ['data_source_id'] };

const C = { must: { r: 0.851, g: 0.949, b: 0.890 }, could: { r: 1, g: 0.945, b: 0.761 },
  wont: { r: 0.984, g: 0.835, b: 0.835 }, none: { r: 1, g: 1, b: 1 } };
const page = figma.currentPage; const out = { must: 0, could: 0, wont: 0, none: 0 };
for (const t of page.findAll(n => n.type === 'TABLE' && n.name.startsWith('erd:'))) {
  const k = t.name.slice(4);
  const p = MUST.includes(k) ? 'must' : COULD.includes(k) ? 'could' : WONT.includes(k) ? 'wont' : 'none'; out[p]++;
  for (let r = 1; r < t.numRows; r++) {
    const rp = (WONT_ROWS[k] || []).includes(t.cellAt(r, 1).text.characters.trim()) ? 'wont' : p;
    for (let c = 0; c < t.numColumns; c++) t.cellAt(r, c).fills = [{ type: 'SOLID', color: C[rp] }];
  }
}
return out;
