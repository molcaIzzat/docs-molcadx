# 02 — Domains

Pembagian kepemilikan produk MolcaDx. Setiap domain punya **satu agent** dan **satu set dokumen**.
Daftar ringkasnya ada di [`AGENTS.md`](../AGENTS.md) §3 — file ini adalah detailnya.

## Aturan domain

1. Satu domain punya satu pemilik. Tidak ada dokumen tanpa pemilik.
2. Agent domain **hanya menulis** di dokumen miliknya. Perubahan lintas domain lewat Product Owner.
3. Domain baru dibuat **hanya atas permintaan PO**, lewat skill `molca-domain-agent`.
4. Setiap domain wajib punya: cakupan, keluaran (artifact), definisi selesai, dan antarmuka ke domain lain.

## Layout domain (wajib)

Semua domain tinggal di bawah `DOMAINS/`, satu folder per domain:

```
DOMAINS/
└── <NAMA-DOMAIN>/
    ├── AGENTS.md      daftar isi + kontrak kerja domain
    └── DOCS/          dokumen-dokumen domain
```

Folder domain diberi nama **HURUF BESAR**; nama agent `kebab-case` berakhiran `-domain`.

FOUNDATION memakai [`DOMAINS/FOUNDATION/DOCS-EN/`](../DOMAINS/FOUNDATION/DOCS-EN/README.md) sebagai spec kerja.

`DOCS/` di root **hanya** untuk dokumen lintas domain — product overview, glossary, standar PRD,
metrics framework, ways of working, goals, template, dan PRD. Kontrak kerja domain tidak disimpan di sana.

---

## Domain aktif

### `product-owner` — Product & PRD

| Aspek | Isi |
|-------|-----|
| **Cakupan** | Discovery, prioritisasi, penulisan PRD, definisi metrik keberhasilan, orkestrasi domain lain |
| **Keluaran** | PRD, roadmap, daftar keputusan produk, isi `DOCS/00`–`05` |
| **Definisi selesai** | PRD lolos checklist [03-prd-standard](03-prd-standard.md) §7 dan sudah di-review designer + developer |
| **Antarmuka masuk** | Permintaan user/stakeholder, temuan riset, batasan teknis dari Engineering |
| **Antarmuka keluar** | PRD → Design (flow & UI), Engineering (implementasi), Data (instrumentasi metrik) |
| **Tidak mengerjakan** | Keputusan arsitektur, detail visual komponen, query analitik |

### `foundation-domain` — FOUNDATION (model data dasar)

| Aspek | Isi |
|-------|-----|
| **Cakupan** | Site hierarchy, shift, fiscal year (`FISCAL_YEAR`), equipment taxonomy (asset/placement/tags), reference data, product, KPI formula & tag mapping, work master (routing/BOM/defect — **bukan** work order), data source; workflow/notification/integration/configuration masih concept. **Bukan** organization/roles (IDP) dan **bukan** kalender hari kerja (PRODUCTION). Aturan ID & effective dating |
| **Keluaran** | [`DOMAINS/FOUNDATION/DOCS-EN/00-foundation.md`](../DOMAINS/FOUNDATION/DOCS-EN/00-foundation.md); menyusul: data dictionary, master data governance, integration mapping |
| **Daftar isi domain** | [`DOMAINS/FOUNDATION/AGENTS.md`](../DOMAINS/FOUNDATION/AGENTS.md) |
| **Definisi selesai** | Checklist di `DOMAINS/FOUNDATION/AGENTS.md` §7 |
| **Antarmuka masuk** | Struktur pabrik & penamaan nyata dari `ops-domain`; kebutuhan entitas baru dari PRD |
| **Antarmuka keluar** | Entitas & relasi → `engineering-domain` (skema/API); dimensi & granularitas → `data-domain`; hierarki & atribut → `design-domain` |
| **Tidak mengerjakan** | Skema fisik DB/API (`engineering-domain`), rumus metrik (`product-owner`), desain visual & Figma (`design-domain`, belum dibuat — deklarasi layar & state kini milik FOUNDATION sendiri di [`FOUNDATION/UX/`](../DOMAINS/FOUNDATION/UX/00-ux.md)), proses & SOP nyata (`ops-domain`) |

### `production-domain` — PRODUCTION (planning, monitoring, performance)

| Aspek | Isi |
|-------|-----|
| **Cakupan** | Production Planning (Job Order, schedules, breaktime, interlocks, tracing), Monitoring (dashboard, live, losses), Performance (OEE live/report, MTBR/MTTF, management KPI, heavy audit); shared daily `SHIFT_INSTANCE` generator (B1). Consumes FOUNDATION; KPIs per domain; break/rest ≠ unplanned |
| **Keluaran** | [`00-overview.md`](../DOMAINS/PRODUCTION/DOCS/00-overview.md), [`01-planning.md`](../DOMAINS/PRODUCTION/DOCS/01-planning.md), [`02-monitoring.md`](../DOMAINS/PRODUCTION/DOCS/02-monitoring.md), [`03-performance.md`](../DOMAINS/PRODUCTION/DOCS/03-performance.md), [`04-shift-instance.md`](../DOMAINS/PRODUCTION/DOCS/04-shift-instance.md) |
| **Daftar isi domain** | [`DOMAINS/PRODUCTION/AGENTS.md`](../DOMAINS/PRODUCTION/AGENTS.md) |
| **Definisi selesai** | Checklist di `DOMAINS/PRODUCTION/AGENTS.md` §7 |
| **Antarmuka masuk** | Entitas dari `foundation-domain`; praktik lapangan dari `ops-domain`; rumus kanonik dari `product-owner` |
| **Antarmuka keluar** | Alur & state → `design-domain`; aturan bisnis, validasi, perilaku offline → `engineering-domain`; event & granularitas → `data-domain`; bahan requirement → `product-owner` |
| **Tidak mengerjakan** | Definisi entitas (`foundation-domain`), rumus kanonik metrik (`product-owner`), desain layar (`design-domain`), skema/API/integrasi PLC (`engineering-domain`), SOP fisik (`ops-domain`) |

### `maintenance-domain` — MAINTENANCE (histori kejadian asset) *(MOM)*

| Aspek | Isi |
|-------|-----|
| **Cakupan** | Histori transaksional/kejadian asset: component installation/swap history (`ASSET_COMPONENT_LINK`, dipindah dari FOUNDATION 2026-09-10); ke depan work order perawatan (PM/CM), catatan perbaikan, MTBF/MTTR/MTTF — belum dimodelkan |
| **Keluaran** | [`DOMAINS/MAINTENANCE/DOCS-EN/00-maintenance.md`](../DOMAINS/MAINTENANCE/DOCS-EN/00-maintenance.md), [`01-asset-history.md`](../DOMAINS/MAINTENANCE/DOCS-EN/01-asset-history.md) |
| **Daftar isi domain** | [`DOMAINS/MAINTENANCE/AGENTS.md`](../DOMAINS/MAINTENANCE/AGENTS.md) |
| **Definisi selesai** | Checklist di `DOMAINS/MAINTENANCE/AGENTS.md` §7 |
| **Antarmuka masuk** | `ASSET`, `ASSET_PLACEMENT`, `ASSET.component_level` dari `foundation-domain` (read-only, tidak pernah didefinisikan ulang); kebutuhan story baru dari PRD, saat satu dibuat |
| **Antarmuka keluar** | Entitas & relasi → `engineering-domain`; dimensi MTBF/MTTR/MTTF (setelah dimodelkan) → `data-domain`; deklarasi layar → `design-domain` |
| **Tidak mengerjakan** | Taksonomi/penempatan asset saat ini (`foundation-domain`), skema fisik DB/API (`engineering-domain`), rumus OEE/A-P-Q (`product-owner`/F-07), desain visual (`design-domain`), SOP perawatan nyata (`ops-domain`), PRD (`product-owner`) |

### `platform-domain` — PLATFORM (administrasi lintas-tenant)

| Aspek | Isi |
|-------|-----|
| **Cakupan** | Administrasi lintas-tenant sisi vendor — **bukan** domain MOM, **bukan** dijual ke tenant. License Manager: entitlement tenant↔domain (domain apa yang dibeli tenant); halaman "superadmin". Ke depan: tenant provisioning, cross-tenant observability |
| **Keluaran** | [`DOMAINS/PLATFORM/DOCS-EN/00-platform.md`](../DOMAINS/PLATFORM/DOCS-EN/00-platform.md), [`01-license-manager.md`](../DOMAINS/PLATFORM/DOCS-EN/01-license-manager.md) |
| **Daftar isi domain** | [`DOMAINS/PLATFORM/AGENTS.md`](../DOMAINS/PLATFORM/AGENTS.md) |
| **Definisi selesai** | Checklist di `DOMAINS/PLATFORM/AGENTS.md` §7 |
| **Antarmuka masuk** | Daftar domain yang ada & bisa dilisensikan dari `product-owner`/`AGENTS.md` §3; konsep Tenant dari `foundation-domain` (belum dimodelkan, `TBD`) |
| **Antarmuka keluar** | Status entitlement → `engineering-domain` (penegakan runtime, mekanisme belum diputuskan); deklarasi halaman superadmin → `design-domain` |
| **Tidak mengerjakan** | Data operasional tenant manapun (`foundation-domain`/domain MOM), skema fisik DB/API (`engineering-domain`), desain visual (`design-domain`), PRD (`product-owner`). Tidak pernah menjadi entitas yang dilisensikan tenant — beda dengan Production/Maintenance/dst. |

### Ketergantungan antar domain aktif

```
foundation-domain  →  production-domain  →  (design / engineering / data)
   entitas & aturan      alur & angka           layar, sistem, tracking
                 ↳  maintenance-domain
                       histori kejadian asset

platform-domain  (lintas-tenant, di luar rantai di atas — lihat entitlement setiap domain,
                   tidak pernah memakai/menulis data operasional satu tenant)
```

PRODUCTION dan MAINTENANCE **memakai** entitas FOUNDATION dan tidak boleh menciptakan entitas
sendiri. Kebutuhan entitas baru dari keduanya diajukan ke Product Owner untuk diteruskan ke
FOUNDATION. Lihat [keputusan 2026-09-10](../LOGS/decisions/2026-09-10-mom-domain-alignment.md)
untuk aturan pembelah FOUNDATION vs domain MOM (Production/Quality/Maintenance/Inventory).
PLATFORM berdiri terpisah dari rantai ini — ia tidak "di atas" atau "di bawah" FOUNDATION,
melainkan di luar tenant sama sekali (lihat `DOMAINS/PLATFORM/DOCS-EN/00-platform.md`).

---

## Domain direncanakan

Belum dibuat. Cakupan di bawah adalah rancangan awal; finalkan saat agent-nya dibuat.

### `design-domain` — Design / UX
- **Cakupan:** desain visual, design system, wireframe, aksesibilitas, handoff Figma. *Per 2026-08-26 (PO): deklarasi user flow & layar per modul tidak lagi milik domain ini — masing-masing domain mendeklarasikannya sendiri di `<DOMAIN>/UX/`; domain ini tinggal desain visual & komponen saat dibuat.*
- **Keluaran:** token & komponen, wireframe, spesifikasi visual per state.
- **Sudah tersedia:** skill `molca-web-design-system` (design system web Molca) dan `molca-prototype`.
- **Bergantung pada:** deklarasi UX per domain (`<DOMAIN>/UX/`) dan PRD (§ user story + acceptance criteria).

### `engineering-domain` — Engineering
- **Cakupan:** arsitektur sistem, API contract, data model, integrasi mesin/IoT, non-functional requirement.
- **Keluaran:** technical design doc, API spec, estimasi & risiko teknis.
- **Bergantung pada:** PRD (§ requirement fungsional + NFR).

### `data-domain` — Data & Analytics
- **Cakupan:** definisi metrik, event tracking plan, dashboard, kualitas data.
- **Keluaran:** tracking plan (event, properti, pemicu), definisi metrik yang bisa di-query, dashboard.
- **Bergantung pada:** [04-metrics-framework](04-metrics-framework.md) + PRD (§ metrik keberhasilan).

### `ops-domain` — Operations (pabrik)
- **Cakupan:** proses produksi nyata, SOP, kebutuhan operator di lantai produksi, kendala lapangan.
- **Keluaran:** peta proses *as-is*, SOP terdampak, catatan kendala lapangan (koneksi, perangkat, shift).
- **Bergantung pada:** akses ke pabrik/stakeholder operasional.

### `quality-domain` — Quality *(MOM)*
- **Cakupan:** inspeksi, hasil QC, defect/NCR, sertifikasi — belum dibuat, cakupan awal per [keputusan 2026-09-10](../LOGS/decisions/2026-09-10-mom-domain-alignment.md).
- **Bergantung pada:** entitas FOUNDATION (produk, defect code taxonomy).

### `inventory-domain` — Inventory *(MOM)*
- **Cakupan:** stok, mutasi gudang, penerimaan/pengiriman material — belum dibuat, cakupan awal per [keputusan 2026-09-10](../LOGS/decisions/2026-09-10-mom-domain-alignment.md).
- **Bergantung pada:** entitas FOUNDATION (produk, UOM).

---

## Taksonomi platform (8 level) — mengikat semua domain baru

Ditetapkan PO 2026-09-04. Ini taksonomi standar OHARA Platform untuk semua produk (MolcaDx,
Savior, MolcaTwin), dari level platform sampai hak akses individual:

| Level | Tujuan | Contoh |
|---|---|---|
| Platform | Platform inti dipakai semua produk | OHARA Platform |
| Product Suite | Aplikasi SaaS yang dijual ke customer | MolcaDX, Savior, MolcaTwin |
| Domain | Area bisnis utama dalam satu produk | Manufacturing, Learning, Quality |
| Module | Kelompok fitur besar | OEE, Shopfloor, Library |
| Feature | Yang benar-benar dilihat user | Dashboard, Machine, Scenario |
| Capability | Operasi bisnis yang tersedia pada satu feature | Create, Assign, Monitor, Export |
| Action / Function | Implementasi teknis spesifik | Save Machine, Import CSV, Generate Report |
| Permission | Hak akses per peran | Admin, Manager, Operator |

MolcaDx berada di level **Product Suite**. Pemetaan di bawah ini mengikat irisan yang benar-benar
dimiliki dan dimodelkan MolcaDx (Domain sampai Action/Function; Permission tetap milik IDP/ABAC,
sudah ditetapkan di luar cakupan FOUNDATION — lihat [`AGENTS.md`](../AGENTS.md) §4 catatan
2026-08-24 soal `Organization`):

| Level taksonomi | Artifact MolcaDx hari ini | Kenapa |
|---|---|---|
| Domain | Folder `DOMAINS/<DOMAIN>/` (`FOUNDATION`, `PRODUCTION`) | Satu domain = satu folder = satu agent = satu pemilik dokumen, sesuai §"Aturan domain" di atas |
| Module | Kartu di layar launcher (mis. "Master Data", "Shopfloor", "OEE Monitoring", "Job Schedule", "Quality Management", "User Management") | Ini level yang benar-benar dilihat user sebagai "modul" — satu kartu launcher, bukan kode modul PRD. Lihat catatan asimetri di bawah |
| Feature | Item sidebar di dalam satu Module (mis. "Site Hierarchy", "SKU", "Downtime Reason" di dalam kartu "Master Data") atau layar `SCR-*` di `<DOMAIN>/UX/*.md` | Unit yang benar-benar dinavigasi user sebagai satu layar/menu berdiri sendiri |
| Capability | Operasi bisnis pada satu Feature — bisa berupa tab/panel bersyarat di dalam layar Feature yang sama, bukan sidebar item sendiri | Mis. panel Shift & Fiscal Year yang muncul di dalam layar Site Hierarchy saat sebuah node dipilih — lihat contoh terverifikasi di bawah |
| Action / Function | Baris task pada file task breakdown (mis. [`PRD-003-task-breakdown.md`](https://github.com/molca-id/prd-molcadx/blob/main/PRD-003-task-breakdown.md)) | Satu baris task = satu implementasi teknis konkret (schema/api/ui/validation/abac/event/test/docs) yang mewujudkan satu capability |
| Permission | Klaim scope ABAC dari identity provider | Sudah dinyatakan di luar model FOUNDATION — bukan entitas MolcaDx, hanya dikonsumsi lewat hak akses per peran di setiap story |

### Kode modul PRD ≠ level taksonomi tetap

**Koreksi 2026-09-04, sesi yang sama.** Draft pertama bagian ini mengklaim "kode modul di
`AGENTS.md` §4 = Module" dan "layar `SCR-*` = Feature" secara flat. Itu salah, dan sudah dicek
ulang lewat screenshot UI nyata/rencana:

Kode modul di [`AGENTS.md`](../AGENTS.md) §4 (`SIT`, `SHF`, `FYR`, `AST`, `PRO`, `REF`, `WMS`,
`KPI`, `DSR`, …; layar fiscal tetap memakai prefix `SCR-FND-FSC-*` — ID layar tidak diubah)
`KPI`, `WFE`, `NTF`, `INT`, `CFG`, `DSR`, `OEE`, `JOB`, dst.) **bukan level taksonomi** —
itu cuma alat penamaan ID untuk user story PRD (`US-<DOMAIN>-<MODUL>-<nnn>`), supaya story
mudah dikelompokkan dan dirujuk. Posisi asli sebuah kode modul di taksonomi (Feature,
Capability yang nested di dalam Feature lain, atau bungkusan beberapa Feature sekaligus)
**wajib dicek ke UI nyata/rencana** — tidak boleh diasumsikan dari nama kodenya.

Kasus yang sudah terverifikasi lewat screenshot:

| Kode modul | Posisi taksonomi asli | Bukti |
|---|---|---|
| `SIT` | **Feature** — satu layar Site Hierarchy (`SCR-FND-SIT-001`/`002`) | Sidebar "Master Data" punya item Site Hierarchy sendiri |
| `SHF`, `FYR` (layar `SCR-FND-FSC-*`) | **Capability nested di dalam Feature `SIT`**, bukan Feature sendiri | [`DOMAINS/FOUNDATION/UX/01-site-hierarchy.md`](../DOMAINS/FOUNDATION/UX/01-site-hierarchy.md) §"Shift & Fiscal panels..." dan open question `UX-SIT-2` (resolved 2026-08-26, direvisi 2026-09-03) — panel Shift & Fiscal Year tampil di dalam `SCR-FND-SIT-002` saat sebuah node tree dipilih, menyerap apa yang tadinya rencana layar terpisah `SCR-FND-SHF-002`/`SCR-FND-FSC-001`. Kode modul PRD = `FYR`; prefix layar tetap `FSC` |
| `REF` | **Bungkusan beberapa Feature** (bukan satu Feature) | Sidebar "Master Data" → bagian "Reference Data" punya item sendiri-sendiri: Units of Measurement, Time Conversions, Downtime Reason, Reject & Rework Reason — masing-masing Feature berdiri sendiri, `REF` cuma namespace ID gabungan |
| `AUD` (2026-09-25) | **Satu Feature + satu Capability lintas Feature** — Feature "Audit log" (kotak *Log service* di Library Configuration, Figma PO) untuk cari/filter/unduh semua perubahan master data; Capability "History" per record di **setiap** Feature **semua domain** (kotak "Log" di tiap blok Master Foundation dan tiap modul Production, Figma PO). Diperluas dari FOUNDATION saja ke seluruh sistem 2026-09-25; hak baca per modul | Figma PO 2026-09-24/25 — belum ada screenshot layar nyata |
| `AST`, `DSR`, `PRO` | Kelihatannya masing-masing satu Feature (satu sidebar item) | **Belum terverifikasi screenshot** — anggapan kerja, bukan fakta final. Perlu dicek ulang saat layarnya benar-benar dirilis/di-mock |

**Module = level kartu launcher**, satu level di atas Feature. Ada asimetri nyata yang
sengaja **tidak diratakan**:

- **FOUNDATION:** kode-kode modulnya (`SIT`, `SHF`, `FYR`, `AST`, `PRO`, `REF`, `WMS`, `KPI`, `DSR`, dst.)
  tampaknya sebagian besar terbungkus jadi **satu kartu launcher "Master Data"** — ini masih
  **anggapan kerja**, belum dicek screenshot per kode modul satu per satu.
- **PRODUCTION:** **terverifikasi 2026-09-24 lewat Figma PO** (diagram "Production"). Tiga kotak
  biru = tiga **Module**, kode PRD `PLN` / `MON` / `PRF` (kode lama `SHF`/`OEE`/`JOB` untuk PRODUCTION
  dipensiunkan, lihat [`AGENTS.md`](../AGENTS.md) §4 catatan 2026-09-24). Kotak putih di bawahnya =
  **Feature**, isi kotak = **Capability**. Kotak "Master Foundation" di diagram yang sama **bukan**
  modul PRODUCTION — itu FOUNDATION (lihat [`00-overview.md`](../DOMAINS/PRODUCTION/DOCS/00-overview.md)).

| Module (kode) | Feature | Capability (dari isi kotak Figma) | Spec |
|---|---|---|---|
| Production Planning (`PLN`) | **Job Order** | Upload schedule form (SKU, target, mesin, kapan diproses, urutan SKU, approval, catatan) · Download form (detail & status jadwal) · Final output (urutan jadwal harian, % capaian live, dispatch job ke tiap mesin/Work Unit) | [`01-planning.md` § Job Order](../DOMAINS/PRODUCTION/DOCS/01-planning.md#job-order) |
| | **Breaktime** | Input breaktime per shift (berulang / sekali) · Tampilan tabel & timeline | [`01-planning.md` § Breaktime](../DOMAINS/PRODUCTION/DOCS/01-planning.md#breaktime) |
| | **Execution** | Interlock checklist sebelum jalan: material, kesiapan equipment, kesiapan personel, instruksi kerja digital | [`01-planning.md` § Execution interlock](../DOMAINS/PRODUCTION/DOCS/01-planning.md#execution-interlock--checklist) |
| | *Product Tracing* — **ditunda** | Material · WIP 1 · WIP 2 · FG. Kotak merah di Figma; traceability lot ditunda ke Inventory (lot hook Q3) — belum Feature aktif | [`01-planning.md` § Product tracing](../DOMAINS/PRODUCTION/DOCS/01-planning.md#product-tracing) |
| Production Monitoring (`MON`) | **Dashboard** | Event timeline: target result, ranking | [`02-monitoring.md`](../DOMAINS/PRODUCTION/DOCS/02-monitoring.md) |
| | **Live Monitoring** | State mesin/Work Unit real-time + konteks Job Order berjalan | idem |
| | **Losses List** | Daftar loss terbuka & terbaru | idem |
| Production Performance Analysis (`PRF`) | **OEE live dashboard** · **OEE report** (termasuk MTTR — label Figma "MTBR" — dan MTTF) · **OEE KPI for Management** · **OEE Performance** (report dashboard, KPI evaluation) | Isi angka = **KPI yang dideklarasikan untuk domain Production** di Library Configuration → KPI Selection (FOUNDATION F-07 / F-07.1), bukan daftar rumus sendiri. Hari ini: Availability, Performance, Quality ratio, OEE index, Throughput rate, Production process ratio (+ MTTR/MTTF/MTBF dari F-07.1). *Pendefinisian ulang failure* (kotak putus-putus) = capability usulan pada OEE report, aturannya `TBD — PO` | [`03-performance.md`](../DOMAINS/PRODUCTION/DOCS/03-performance.md) · [F-07](../DOMAINS/FOUNDATION/DOCS-EN/07-0-kpi-formula.md) |

  **Log** (siapa/kapan buat·ubah before/after·hapus·unduh) muncul di tiap modul — diperlakukan sebagai
  **Capability lintas Feature** di modul itu, bukan Feature sendiri. Log PRF lebih berat (reset,
  override, approve report). Generator `SHIFT_INSTANCE` ([`04-shift-instance.md`](../DOMAINS/PRODUCTION/DOCS/04-shift-instance.md))
  tidak terlihat user — story-nya masuk `PLN`.

**Aturan mengikat (diperbarui 2026-09-04):** setiap kali seseorang mendeklarasikan domain,
module, feature, atau capability baru, wajib **menyatakan level taksonominya secara eksplisit**
dan **memverifikasinya ke UI nyata/rencana** — bukan mengasumsikan bahwa kode modul PRD baru
otomatis berarti Feature baru. Kalau sesuatu tidak pas dengan bersih ke salah satu level
Domain/Module/Feature/Capability/Action-Function, itu tanda **cakupannya salah skala** (terlalu
besar, terlalu kecil, atau mencampur dua level) — bukan alasan untuk melewati taksonomi ini atau
membuat level/skema ID baru.

Ini pemetaan penamaan atas artifact yang sudah ada (§4 kode modul, `UX/*.md`, user story PRD,
task breakdown) — **tidak menambah entitas atau skema ID baru**. Kode modul tetap dipakai apa
adanya sebagai namespace ID (`AGENTS.md` §4 tidak berubah oleh koreksi ini).

---

## Matriks tanggung jawab per PRD

| Bagian PRD | Penulis | Reviewer wajib |
|------------|---------|----------------|
| Problem, user, tujuan, metrik | `product-owner` | `data-domain` |
| User story & acceptance criteria | `product-owner` | `design-domain`, `engineering-domain` |
| **Entitas data & aturan integritas** | `foundation-domain` | `engineering-domain` |
| **Alur produksi, validasi entri, agregasi angka** | `production-domain` | `foundation-domain`, `ops-domain` |
| Flow & spesifikasi UI | `design-domain` | `product-owner`, `foundation-domain` (kalau menampilkan master data) |
| Requirement teknis & NFR | `engineering-domain` | `product-owner` |
| Instrumentasi & tracking | `data-domain` | `engineering-domain`, `foundation-domain` (dimensi & granularitas) |
