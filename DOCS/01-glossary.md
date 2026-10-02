# 01 — Glossary

> **Status: 🟡 DRAFT.** Istilah bertanda `TBD` menunggu konfirmasi PO.
> Aturan: satu istilah = satu definisi. Kalau sebuah kata dipakai di PRD, kata itu harus ada di sini.

## Produk & internal

| Istilah | Definisi |
|---------|----------|
| **MolcaDx** | Platform digital transformation Molca untuk operasional manufaktur. Nama produk, bukan nama modul. |
| **Dx** | Singkatan *Digital Transformation*. Bukan "diagnostics". |
| **Domain** | Satu folder `DOMAINS/<NAMA>/` dengan satu agent dan satu pemilik dokumen di repo ini — **bukan** kategori aktivitas manufaktur IEC 62264/ISO 22400 (lihat **MOM activity category** di bawah, istilah berbeda yang sering tertukar). **Sejak 2026-09-10, Domain juga unit jual/lisensi MolcaDx** — tenant membeli sebagian Domain, FOUNDATION selalu ikut (tidak pernah dijual sendiri), PLATFORM tidak pernah dijual sama sekali (lihat [`CONTEXT.md`](../CONTEXT.md)). Domain aktif: **FOUNDATION**, **PRODUCTION**, **MAINTENANCE**, **PLATFORM**; direncanakan: Quality, Inventory (MOM), Design, Engineering, Data, Ops. Daftar lengkap & kepemilikan di [`AGENTS.md` §3](../AGENTS.md#3-domain--agent). |
| **Domain agent** | Agent yang bertanggung jawab atas satu domain (lihat **Domain** di atas); dibuat lewat skill `molca-domain-agent`. |
| **MOM activity category** | Empat kategori aktivitas *Manufacturing Operations Management* di IEC 62264-3/ISO 22400: **Production, Quality, Maintenance, Inventory Operations Management**. Ini istilah standar, **bukan** nama `domain` MolcaDx — jangan dipakai untuk menamai menu/grouping seolah itu domain (kesalahan ini sempat muncul di draft UX "KPI Selection"). |
| **Foundation** | Merupakan sebuah domain yang menyediakan model data dasar untuk MolcaDx, berfungsi sebagai dasaran untuk setiap domain manufaktur. |
| **Audit trail** | Catatan permanen (append-only) **siapa** membuat, mengubah (nilai sebelum → sesudah), menonaktifkan, atau melakukan aksi bisnis (mis. *release* Job Order) pada record **domain mana pun**, **kapan**, dan **alasannya**. Satu entitas `AUDIT_LOG` milik FOUNDATION (F-14, `AUD`) sebagai infrastruktur bersama; semua domain menulis ke sana (keputusan PO 2026-09-25, mengganti "FOUNDATION saja"). Effective dating dan audit trail **saling melengkapi**: `valid_from`/`valid_to` menjawab *kapan data berlaku*, audit trail menjawab *siapa menulisnya dan kapan* — dan setiap baris audit **ikut mencatat tanggal berlakunya** (mis. "cycle time 20 → 18 detik, diubah 25 Sep oleh X, berlaku mulai 1 Okt"; baris lama ditutup + baris baru dibuka = satu perubahan). Mencakup semua sumber: UI, bulk import, API, job sistem. Disimpan 3 tahun; alasan wajib saat orang mengubah; hak baca **per modul** (`<domain>:<modul>:<scope>:audit_view`). |
| **Audit log** | Feature modul `AUD` (F-14) untuk mencari, memfilter, dan mengunduh baris audit trail **lintas modul dan domain** — kotak *Log service* di Library Configuration pada Figma PO. Hanya menampilkan baris dari modul yang izin `audit_view`-nya dimiliki pengguna. Tetap **satu halaman terpusat**, dan setiap baris menampilkan **domain dan modul asalnya** (mis. "PRODUCTION · Production Planning"); membuka baris membawa ke layar record di modul pemiliknya. Beda dengan **History**: capability per record di tiap layar yang menampilkan audit trail record itu saja. |
| **PRD** | Product Requirements Document sesuai [03-prd-standard](03-prd-standard.md). |
| **Basic knowledge** | Isi folder `DOCS/` — konteks yang harus dibaca agent sebelum bekerja. |
| **FOUNDATION** | Domain pemilik model data dasar MolcaDx. Lihat [`DOMAINS/FOUNDATION/AGENTS.md`](../DOMAINS/FOUNDATION/AGENTS.md). |
| **PLATFORM** | Domain administrasi lintas-tenant sisi vendor (2026-09-10) — **bukan** domain MOM, **bukan** unit yang dijual ke tenant (beda dengan FOUNDATION yang dibundel dan domain MOM yang dilisensikan). Pemilik **License Manager**. Lihat [`DOMAINS/PLATFORM/AGENTS.md`](../DOMAINS/PLATFORM/AGENTS.md). |
| **License Manager** | Modul PLATFORM yang mencatat domain/modul apa saja yang dibeli/dilisensikan sebuah tenant (`TENANT_DOMAIN_ENTITLEMENT`, sketsa entitas — lihat `DOMAINS/PLATFORM/DOCS-EN/01-license-manager.md`). Menjawab separuh [`goalsQ3.md` Q3-7](goalsQ3.md); separuh lainnya (Work Improvement) masih terbuka. |
| **Superadmin** | Tingkat izin akses (Permission) yang membuka halaman entitlement PLATFORM — **bukan** nama domain, **bukan** peran tenant biasa (beda dari persona "Plant Admin/IT" yang beroperasi di dalam domain berlisensi satu tenant). |
| **Tenant** | Satu pelanggan MolcaDx. Entitas `TENANT` sudah dispesifikasi di [FOUNDATION F-01 §9.1](../DOMAINS/FOUNDATION/DOCS-EN/01-site-hierarchy.md#91-tenant--ownershipisolation-layer) — bukan `TBD` lagi. Identitas/membership/SSO tenant tinggal di **Keycloak Organization**-nya, dihubungkan lewat `keycloak_org_id` di baris `TENANT` FOUNDATION ([keputusan 2026-09-11](../LOGS/decisions/2026-09-11-tenant-keycloak-organizations.md)) — identitas di IDP, data bisnis di FOUNDATION, pola yang sama dengan Organization/roles (2026-08-24). |

## Master data (milik `foundation-domain`)

Definisi lengkap: [`DOMAINS/FOUNDATION/DOCS-EN/00-foundation.md`](../DOMAINS/FOUNDATION/DOCS-EN/00-foundation.md). Indeks modul: [`DOMAINS/FOUNDATION/DOCS-EN/README.md`](../DOMAINS/FOUNDATION/DOCS-EN/README.md).

| Istilah | Definisi |
|---------|----------|
| **Master data** | Data acuan yang jarang berubah dan dirujuk transaksi (aset, item, lini, shift), lawan dari data transaksi. |
| **Site hierarchy** | Jenjang lokasi: Enterprise → Site → Area → Work Center → Work Unit. |
| **Work Center** | Lini/sel produksi — level tempat kapasitas & OEE diukur. |
| **Work Unit** | Stasiun/posisi kerja fungsional dalam lini. Bertahan walau mesinnya diganti. |
| **Functional location** | Posisi fungsional tempat sebuah aset dipasang (= `WORK_UNIT`), dibedakan dari aset fisiknya. |
| **Asset class / type / instance** | Tiga lapis ontologi aset: taksonomi → model/spesifikasi → barang fisik. |
| **Criticality** | Tingkat kekritisan aset (A/B/C) — dasar prioritas perbaikan. |
| **Reason code** | Kode penyebab downtime, berjenjang; menentukan planned vs unplanned. |
| **Work master** | Kumpulan master data pekerjaan: item, BOM, routing, operation. **`WORK_ORDER`/`WORK_ORDER_OPERATION` bukan bagian Work Master** sejak 2026-09-03 — keduanya data transaksional milik `production-domain` (Job Schedule), lihat [keputusan](../LOGS/decisions/2026-09-03-foundation-contest-blockers.md). |
| **Routing / Operation** | Urutan proses membuat satu item; satu langkahnya disebut operation dan memegang `standard_cycle_time`. |
| **Step ID** | `OPERATION.step_id` — identitas tetap satu langkah routing; semua baris `OPERATION` bertanggal dari langkah yang sama memakai `step_id` yang sama, dan tabel turunan langkah memakai kunci `step_id`, bukan `operation_id` (PO 2026-10-02, F-08 §9.2). |
| **Measured total** | `tag_role = measured_total` — total berjalan besaran terukur (mis. berat checkweigher dalam gram), `uom_id` wajib, **tidak pernah** dipakai slot KPI mana pun dan tidak dijumlahkan dengan hitungan pcs (PO 2026-10-02, F-04 §9.7). Beda dengan `total` (hitungan unit). |
| **Cleaned segment** | Bentuk kode (site/area/work center/work unit/asset) di dalam alamat OPC UA generated: setiap karakter selain huruf, angka, dan `_` diganti `_` (mis. `FI-2` → `FI_2`). Kode aslinya tidak berubah; dua saudara yang hasil bersihnya sama ditolak saat simpan (PO 2026-10-02, F-04 §9.7.1). |
| **`product_code_mapping_changed`** | Event dari Master Data saat pemetaan kode produk ke work unit diubah (tambah/akhiri/hapus, termasuk ke masa lalu); PRODUCTION yang menghitung ulang KPI, bukan Master Data (PO 2026-10-02, F-04 §9.7). |
| **BOM** | *Bill of Materials* — struktur komponen untuk membuat satu item. |
| **Product type** | `PRODUCT.product_type` — apa produk itu: `raw_material` (bahan baku, dibeli), `packaging` (bahan kemas, dibeli), `consumable` (bahan pembantu, dibeli, tidak dihitung per unit), `semi_finished` (barang setengah jadi, dibuat), `finished_good` (produk jadi, dibuat). Lima nilai sejak 2026-09-30, setara tipe material SAP ROH / VERP / HIBE / HALB / FERT. Bukan hierarki — hierarki produk = nesting BOM. |
| **Packaging level** | `PRODUCT.packaging_level`, hanya untuk `packaging`: **primary** (kontak langsung dengan produk, mis. plastik kemasan) atau **secondary** (pelindung luar, mis. kardus, lakban). |
| **Flow (product flow)** | `PRODUCT_FLOW` — satu cara membuat satu produk (mis. tablet: direct compression / dry granulation / wet granulation), masing-masing dengan BOM dan routing sendiri. Setiap produk punya ≥1 flow; flow "Standard" dibuat otomatis. Work order memilih flow (default = primary). Setara *production version* SAP. |
| **Parameter standard** | `OPERATION_PARAMETER` — setelan proses yang harus dipenuhi satu step (target, min, max, unit; *critical* = CPP). FOUNDATION hanya menyimpan standar; pembandingan dengan nilai aktual = PRODUCTION/Quality. |
| **Recipe base quantity** | `BOM.base_qty` + `base_uom_id` — jumlah produk induk yang dipakai untuk menulis resep ("per 1.000 kg", "per 40 pack"). Default 1. **Bukan batch size** — batch nyata boleh berapa saja, resep diskalakan. |
| **Shrinkage (susut)** | Massa yang hilang karena proses itu sendiri (penguapan, kadar air, kristalisasi) di satu work unit. Rencana: `OPERATION.planned_shrinkage` (fraksi). Aktual dihitung PRODUCTION (1 − output ÷ input). **Bukan reject** (tidak punya reason code, tidak masuk OEE Quality) dan **bukan component scrap** (`BOM_LINE.scrap_factor`, susut per material). |
| **Net BOM** | Konvensi MolcaDx: kuantitas `BOM_LINE` = kebutuhan resep **tanpa** susut yang diharapkan; scrap dan shrinkage ditambahkan di atasnya saat perencanaan (F-08). |
| **Batch** | Satu kali jalan proses batch (ISA-88) — mis. satu siklus mixer, dari mulai sampai material dikeluarkan. Istilah proses/produksi. **Bukan** "batch" versi SAP (itu = lot). |
| **Lot** | Sejumlah material berlabel yang diperlakukan sebagai satu unit untuk ketertelusuran & stok (ISA-95 material lot). Biasanya 1 batch = 1 lot, tapi 1 batch bisa dipecah jadi beberapa lot dan beberapa batch bisa digabung jadi 1 lot. Material beli punya lot pemasok. Di model: `WORK_ORDER_OPERATION_LOT.lot_id`. |
| **Phantom BOM** | BOM produk setengah jadi yang **tidak pernah disimpan sebagai stok** — langsung mengalir ke tahap berikutnya (`BOM.is_phantom`). Produknya tetap `semi_finished`; phantom bukan product type. |
| ~~**Shift pattern**~~ | **Konsep dipensiunkan** ([F-02 core concept 2](../DOMAINS/FOUNDATION/DOCS-EN/02-shift.md)) — tidak ada rotasi/pola per hari; semua `SITE_SHIFT` yang dideklarasikan sebuah site terjadi setiap hari kerja, kumulatif. Tidak ada entitas `SHIFT_PATTERN`. |
| **Shift instance** | Satu shift nyata pada tanggal tertentu; dirujuk oleh setiap transaksi operasional. |
| **Business date** | Tanggal produksi sebuah shift = tanggal shift dimulai, walau shift melewati tengah malam. |
| **Effective dating** | Pencatatan perubahan master data dengan `valid_from`/`valid_to`, bukan menimpa nilai lama. |
| **Crew (regu)** | Kelompok karyawan yang dijadwalkan bersama pada shift. **Belum ada entitas FOUNDATION** untuk ini sejak modul Organization dihapus — lihat [PRD-002 §11 Q1](https://github.com/molca-id/prd-molcadx/blob/main/PRD-002-foundation-core-q3.md#11-open-questions). **2026-09-25:** layar crew assignment (`SCR-FND-SHF-004`) dipensiunkan, belum dibutuhkan (keputusan PO). |
| **Fiscal year** | Jendela tahun pelaporan enterprise-level (`FISCAL_YEAR`), mode `monthly` atau `weekly_iso`, dipecah ke kuartal. Tidak menentukan hari kerja/libur — itu domain terpisah, dimiliki `production-domain`. Detail: [`DOMAINS/FOUNDATION/DOCS-EN/03-yearly-quarterly-declaration.md`](../DOMAINS/FOUNDATION/DOCS-EN/03-yearly-quarterly-declaration.md). |
| **Equipment flow (`EQUIPMENT_FLOW`)** | Urutan posisi di dalam satu `WORK_CENTER` — `from_work_unit_id` → `to_work_unit_id`, keduanya wajib `WORK_UNIT` milik work center yang sama. Ini topologi posisi, bukan aliran mesin — mengganti aset di satu `WORK_UNIT` (`ASSET_PLACEMENT`) tidak menyentuh baris ini. Label layar "Line flow", nama entitas tidak berubah. **Bukan** `WORK_UNIT_FLOW` — dua entitas berbeda, dikonfirmasi PO 2026-09-21 (lihat entri di bawah). Detail: [`DOMAINS/FOUNDATION/DOCS-EN/01-site-hierarchy.md` §9.11](../DOMAINS/FOUNDATION/DOCS-EN/01-site-hierarchy.md#911-equipment_flow--position-topology-inside-one-work_center). |
| **Work unit flow (`WORK_UNIT_FLOW`)** | Sama bentuk dengan `EQUIPMENT_FLOW` (`from_work_unit_id` → `to_work_unit_id`) tapi **tidak dibatasi satu `WORK_CENTER`** — topologi fisik plant-wide, milik FOUNDATION, dibaca PRODUCTION untuk kalkulasi KPI (bukan sebaliknya). Dipakai untuk (a) peralatan bantu yang butuh Availability sendiri (bukan `secondary` placement) dan (b) mencari stasiun tetangga pada perhitungan Quality dua-stasiun. **Bukan** turunan `ROUTING`/`OPERATION.step_number` — urutan operasi itu per-produk, sementara `WORK_UNIT_FLOW` adalah fakta fisik tetap yang sama untuk produk apa pun. Belum ada layar authoring-nya (S-6a). Detail: [`DOMAINS/FOUNDATION/DOCS-EN/01-site-hierarchy.md` §9.12](../DOMAINS/FOUNDATION/DOCS-EN/01-site-hierarchy.md#912-work_unit_flow--position-topology-across-work_centers). |
| **Placement role (primary/secondary)** | Peran penempatan aset pada satu Work Unit: tepat satu `primary` aktif (acuan Availability & downtime), sejumlah `secondary` aktif (peralatan bantu tanpa Availability sendiri, hanya berkontribusi ke Quality/pengayaan reason). Detail: [`DOMAINS/FOUNDATION/DOCS-EN/04-asset-ontology.md` §9.6](../DOMAINS/FOUNDATION/DOCS-EN/04-asset-ontology.md#96-asset-to-work-unit-placement-rules). |
| **Component level** | Empat lapis nesting aset mengikuti ISO 14224: `equipment_unit` → `subunit` → `maintainable_item` → `part`. `part` adalah batas keras, tidak boleh punya anak. |
| **Tag role** | Arti bisnis satu tag PLC/sensor (`product_code`/`total`/`good`/`reject`/`machine_state`/`downtime_reason`/`reject_reason`/`speed`/`runtime`), dipisahkan dari `kind` (bentuk data mentahnya). Daftar tertutup — tidak boleh ditambah nama bertema KPI (mis. `availability_tag`). |
| **Data source (`DATA_SOURCE`)** | Koneksi PLC/OPC UA/MQTT tempat tag dibaca — satu koneksi bisa dipakai banyak `ASSET_TAGS`. Modul FOUNDATION tersendiri sejak 2026-09-03 (keputusan B7), dipisah dari Integration (yang kini khusus ERP/sistem-ke-sistem) dan Equipment Taxonomy. **Granularitas heartbeat/staleness (per-koneksi vs per-tag) masih `TBD` (H-DS-1)** — klaim "resolved: per-koneksi" sebelumnya ditarik kembali karena tidak pernah benar-benar diputuskan. Spesifikasi: [`DOMAINS/FOUNDATION/DOCS-EN/13-data-source.md`](../DOMAINS/FOUNDATION/DOCS-EN/13-data-source.md). |
| **Tag name (`tag_name`)** | Nama tag itu sendiri di mesin (mis. `Total_Count`, `NG_Seal_Overload`) — yang diketik user saat mendeklarasikan `ASSET_TAGS`, bukan alamat lengkapnya. Hanya huruf, angka, `_`; unik per aset. Ditambahkan 2026-09-25 ([F-04 §9.7](../DOMAINS/FOUNDATION/DOCS-EN/04-asset-ontology.md#97-asset_tags--per-asset-tag--signal-declaration)). |
| **Generated node (alamat node hasil generate)** | NodeId OPC UA sebuah tag yang **dibangun otomatis** dari penempatan aset, bukan diketik: `nsu=<namespace_uri>;s=<SITE>/<AREA>/<WC>/<WU>/<ASSET>/<tag_name>`. Bentuk NodeId (namespace + tipe identifier + nilai) mengikuti IEC 62541-3; isi path dipisah `/` adalah **konvensi Molca** (pemisah diganti dari `.` pada 2026-10-01), bukan kewajiban IEC 62541 atau ISA-95. Dihitung dari penempatan yang aktif — aset pindah, alamat ikut berubah; data bacaan tetap dikunci ke `tag_id`. Hanya untuk data source dengan `node_naming = generated` (OPC UA). Keputusan PO 2026-09-25 ([F-04 §9.7.1](../DOMAINS/FOUNDATION/DOCS-EN/04-asset-ontology.md#971-generated-opc-ua-node-address)). |
| **Tag hand-off list (daftar serah-terima tag)** | Daftar semua *generated node* satu data source beserta `tag_name`, `tag_role`, `kind`, UoM, dan data source-nya — diserahkan ke orang hardware Molca yang mengonfigurasi gateway/server OPC UA agar mengekspos **persis** NodeId itu. Alamat hasil generate adalah sumber kebenaran; server yang menyesuaikan. Perlu dibuat ulang setiap kali alamat berubah (aset pindah, kode diganti). Format file `TBD` (F-04 A-11). |
| **Multi-lane machine (mesin multi-lane)** | Satu mesin yang punya set counter terpisah per lane (mis. `Lane1_Total_Count`, `Lane2_Total_Count`), tiap lane dimodelkan sebagai `WORK_UNIT` sendiri — satu-satunya kasus satu aset boleh punya lebih dari satu `ASSET_PLACEMENT` aktif (semua dalam satu site). Tidak ada flag di `ASSET`; multi-lane = keadaan punya >1 penempatan aktif, dibuat lewat pilihan eksplisit "tambah lane". Tag per-lane (`total`/`good`/`reject`/`product_code`/`speed`/…) wajib ditempatkan ke satu work unit (`ASSET_TAGS.work_unit_id`); sinyal seluruh mesin (`machine_state`/`downtime_reason`/`runtime`) berlaku untuk semua lane. Keputusan PO 2026-09-25 ([F-04 §9.6](../DOMAINS/FOUNDATION/DOCS-EN/04-asset-ontology.md#96-asset-to-work-unit-placement-rules)). |
| **KPI formula slot (`KPI_FORMULA_SLOT`)** | Satu posisi input bernama di dalam formula KPI yang tetap (mis. `quality.good`, `availability.downtime_reason`) — nama posisinya, bukan nilai atau sumbernya. Seeded & tertutup, baris baru hanya kalau cakupan ISO yang diadopsi F-07 benar-benar melebar, bukan per-plant. Tiap slot punya `domain` (`production`/`quality`/`maintenance`/`inventory`) — sidebar KPI punya satu item per domain; per 2026-09-27 semua slot `production` (keputusan PO). Spesifikasi: [`DOMAINS/FOUNDATION/DOCS-EN/07-1-kpi-tag-mapping.md` §9.1](../DOMAINS/FOUNDATION/DOCS-EN/07-1-kpi-tag-mapping.md#91-kpi_formula_slot). |
| **KPI parameters (`KPI_PARAMETERS`)** | Katalog kombinasi `tag_role` + `transform` yang legal untuk tiap `KPI_FORMULA_SLOT`. Diseed oleh Product/`foundation-domain`, **tidak pernah bisa ditulis implementor** — batas K-1/K-7 yang sama dengan tabel `KPI_FORMULA` yang ditolak. Spesifikasi: [`DOMAINS/FOUNDATION/DOCS-EN/07-1-kpi-tag-mapping.md` §9.3](../DOMAINS/FOUNDATION/DOCS-EN/07-1-kpi-tag-mapping.md#93-kpi_parameters). |
| **KPI binding (`WORK_UNIT_KPI_BINDING`)** | Pilihan konkret satu tag + satu `transform` untuk mengisi satu `KPI_FORMULA_SLOT`, per Work Unit — wajib untuk setiap slot `bindable`, bukan override di samping resolusi otomatis. Ditulis lewat aksi admin site-scoped biasa (K-7 resolved), bukan aksi desain formula. Spesifikasi: [`DOMAINS/FOUNDATION/DOCS-EN/07-1-kpi-tag-mapping.md` §9.4](../DOMAINS/FOUNDATION/DOCS-EN/07-1-kpi-tag-mapping.md#94-work_unit_kpi_binding). |

## UX & interaksi (dideklarasikan per domain)

Standar & contoh: [`DOMAINS/FOUNDATION/UX/00-ux.md`](../DOMAINS/FOUNDATION/UX/00-ux.md). Aturan anchor di PRD: [03-prd-standard §3.5](03-prd-standard.md).

| Istilah | Definisi |
|---------|----------|
| **UX doc modul** | Deklarasi layar satu modul di `<DOMAIN>/UX/`, diberi nomor mengikuti penomoran spec modulnya (`F-01` ↔ `UX 01`). Memuat inventaris layar + matriks 7 state. |
| **Screen ID (`SCR-*`)** | Pengenal permanen satu layar: `SCR-<DOMAIN>-<MODUL>-<nnn>` (mis. `SCR-FND-SIT-001`). Tidak pernah dipakai ulang atau dinomori ulang. |
| **Matriks 7 state** | State wajib per layar: default, kosong, loading, error, offline, sukses, tanpa izin — boleh `N/A` dengan alasan, tidak boleh diam. |
| **Journey (`UX-JRN-*`)** | Alur pengalaman lintas modul yang hanya **menyusun** layar yang sudah dideklarasikan — tidak menambah layar atau aturan sendiri. |
| **Constraint / implication / decision** | Tiga tier hubungan behavior→desain: aturan (normatif, milik flow) → konsekuensi layar (turunan, milik flow) → keputusan layar (normatif, milik UX doc). Detail: [`DOMAINS/FOUNDATION/FLOW/00-flow.md`](../DOMAINS/FOUNDATION/FLOW/00-flow.md). |

## Eksekusi produksi (milik `production-domain`)

Definisi lengkap: [`DOMAINS/PRODUCTION/DOCS/`](../DOMAINS/PRODUCTION/AGENTS.md).

| Istilah | Definisi |
|---------|----------|
| **Job** | Satu `WORK_ORDER_OPERATION` yang dieksekusi di satu work unit pada satu shift. |
| **WORK_ORDER_OPERATION_DEFECT** | Baris anak `WORK_ORDER_OPERATION` — satu kode `REJECT_REASON` + `disposition` (`scrap`/`rework`/`hold`) + `qty`, dengan `origin` (`sensor` SoT / `manual_override` + `entered_by`/`entered_at`). Agregasi ke `scrap_qty`/`rework_qty` induk. Detail: [01-planning.md § WORK_ORDER_OPERATION_DEFECT](../DOMAINS/PRODUCTION/DOCS/01-planning.md#work_order_operation_defect--one-row--one-code--one-fate-on-one-operation). |
| **Micro-stop** | Berhenti sangat singkat di bawah ambang pencatatan manual; masuk sebagai Performance loss, bukan Availability loss. |
| **Stall (counter berhenti bertambah)** | Keadaan saat tag `total` aset `primary` berhenti bertambah. Lama stall menentukan apakah kejadian itu dikelompokkan sebagai micro-stop (Performance loss) atau downtime nyata (Availability loss); ambang pemisahnya belum ditetapkan (K-6 di [F-07.1](../DOMAINS/FOUNDATION/DOCS-EN/07-1-kpi-tag-mapping.md)). Stall adalah *cara mendeteksi* stop, bukan jenis stop tersendiri. |
| **Deteksi rentang (range detection)** | Cara kedua mendeteksi downtime, berdampingan dengan Stall (bukan pengganti): tag analog aset `primary` (`speed`, RPM, %) dianggap "berhenti" saat nilainya berada **di luar** rentang operasi normal (contoh dari PO: 40–100 = jalan, di luar itu = downtime). Rentangnya konfigurasi per-tag, bukan konstanta Foundation — sama seperti ambang stall, `TBD` siapa pemiliknya. Bukan counter, tidak ada "berhenti bertambah" — melainkan pengecekan ambang langsung pada sinyal kontinu — tapi memakai logika pembagian small_stop/downtime yang sama dengan Stall (K-6/K-8 di [F-07.1](../DOMAINS/FOUNDATION/DOCS-EN/07-1-kpi-tag-mapping.md#how-downtime-gets-detected-from-an-out-of-range-analog-value)). |
| **Loss tree** | Penguraian seluruh kehilangan produksi ke tiga komponen OEE (Availability, Performance, Quality). |
| **Carry-over** | Sisa jumlah job yang tidak selesai pada shift rencana dan berpindah ke shift berikutnya. |
| **Schedule adherence** | % job yang selesai pada shift yang direncanakan — ukuran utama kualitas penjadwalan. |
| **Changeover** | Pergantian setup antar produk; salah satu penyumbang Availability loss. |
| **Disposition** | Perlakuan atas unit cacat pada baris actual: `scrap` / `rework` / `hold` — di `WORK_ORDER_OPERATION_DEFECT`, bukan di master `REJECT_REASON`. |
| **Koreksi (adjustment)** | Entri bertanda yang membetulkan entri sebelumnya tanpa menghapusnya. |
| **Data completeness** | Ukuran kelengkapan data suatu periode; menentukan apakah angka boleh diandalkan. |

## Operasional manufaktur

| Istilah | Definisi | Status |
|---------|----------|--------|
| **Shopfloor** | Area produksi fisik tempat operator bekerja. | ✅ |
| **Lini (line)** | Rangkaian stasiun kerja yang memproduksi satu jenis output. | ✅ |
| **Shift** | Periode kerja terjadwal. **Resolved (F-02 H-1):** 3 Enterprise Shift — Shift 1 (07:00–14:59), Shift 2 (15:00–22:59), Shift 3 (23:00–06:59, lintas tengah malam) — jam sama di semua site, situs beda hanya timezone. | ✅ |
| **Work order (WO)** | Perintah produksi untuk jumlah & produk tertentu dalam periode tertentu. Entitas `WORK_ORDER`/`WORK_ORDER_OPERATION` dimiliki `production-domain` sejak 2026-09-03 — spesifikasi di [01-planning.md § Entities](../DOMAINS/PRODUCTION/DOCS/01-planning.md#entities). Sumber WO: MolcaDx jalur utama (resolved 2026-09-12); ERP kemungkinan nanti. | 🟡 TBD |
| **Downtime** | Periode lini/mesin tidak berproduksi. Dibagi *planned* dan *unplanned*. | ✅ |
| **OEE** | *Overall Equipment Effectiveness* = Availability × Performance × Quality. Rumus detail: [04-metrics-framework](04-metrics-framework.md). | ✅ |
| **Defect / reject** | Output yang tidak lolos kriteria mutu. Kriteria per produk: TBD. | 🟡 TBD |
| **Takt time** | Waktu yang tersedia dibagi jumlah unit yang diminta — laju produksi ideal. | ✅ |
| **Cycle time** | Waktu aktual memproduksi satu unit di satu stasiun. | ✅ |
| **Andon** | Sinyal/eskalasi dari operator saat ada masalah di lini. | ✅ |

## Standar industri (ISA-95 / IEC 62264 / ISO 22400)

Definisi lengkap: [`06-isa95-iso22400-standards.md`](06-isa95-iso22400-standards.md).

| Istilah | Definisi |
|---------|----------|
| **MOM** | *Manufacturing Operations Management* — istilah IEC 62264 untuk Level 3 (hari/shift/jam/menit/detik), tempat MolcaDx beroperasi. Level 4 (ERP, bulan/minggu/hari) di luar cakupan. |
| **Availability** | `Actual production time / Planned busy time` (APT/PBT). Turunan langsung dari riwayat status mesin (running/down) — **tidak butuh data Maintenance domain** (MTTR/MTTF/MTBF pakai data downtime yang sama untuk tujuan berbeda: keandalan, bukan Availability). |
| **Quality ratio** | `Good quantity / Produced quantity` (GQ/PQ). Turunan langsung dari counter baik/reject di lini — **tidak butuh Quality domain** (Cm/Cmk/Cp/Cpk/FPY yang benar-benar butuh infrastruktur statistik SPC). |
| **OEE** | `Availability × Effectiveness × Quality ratio`. Karena Availability dan Quality ratio sama-sama bisa dihitung dari data mentah Production domain sendiri, **OEE bisa dihitung tanpa Quality atau Maintenance domain** — keduanya upsell untuk analisis lebih dalam (kapabilitas statistik, keandalan), bukan prasyarat OEE. |
| **Scrap ratio** | `Scrap quantity / Produced quantity` (SQ/PQ). Diadopsi 2026-09-10 dari katalog KPI ISO 22400-2 Klausul 6 (domain Quality). Sumber sama dengan Quality ratio — `WORK_ORDER_OPERATION.scrap_qty` / total output — **tidak butuh field baru**. `PQ = 0` → "cannot compute", bukan 0%. |
| **Rework ratio** | `Rework quantity / Produced quantity` (RWQ/PQ). Diadopsi 2026-09-10. RWQ dari `WORK_ORDER_OPERATION.rework_qty` (PRODUCTION) — field job, bukan `tag_role`. `PQ = 0` → "cannot compute", bukan 0%. |
| **Throughput rate** | `Produced quantity / Actual order execution time` (PQ/AOET). Diadopsi 2026-09-10. Satuan output per satuan waktu (mis. unit/menit). AOET belum tercatat (operasi masih terbuka) → "no data", bukan pembagian dengan nol. |
| **Production process ratio** | `Actual production time / Actual order execution time` (APT/AOET). Diadopsi 2026-09-10. APT sama dengan pembilang Availability; AOET dari `WORK_ORDER_OPERATION.actual_end − .actual_start`. `AOET = 0` atau belum tercatat → "no data". |
| **Equipment hierarchy** (role-based) | Enterprise → Site → Area → Work Center → Work Unit (IEC 62264-1). **Terpisah** dari physical asset hierarchy (Asset/serial number) — keduanya dihubungkan lewat penempatan yang time-bounded (`ASSET_PLACEMENT`), bukan satu pohon nested. Lihat [`DOMAINS/FOUNDATION/DOCS-EN/04-asset-ontology.md` §3.2](../DOMAINS/FOUNDATION/DOCS-EN/04-asset-ontology.md#three-things-to-understand-before-anything-else). |

### Elemen waktu & kuantitas ISO 22400-2 (bukan KPI)

Kode dari ISO 22400-2:2014 Klausul 5. **Bukan** singkatan umum. Jangan samakan **PBT** dengan jam shift. Isi Molca: [`DOMAINS/FOUNDATION/DOCS-EN/07-0-kpi-formula.md`](../DOMAINS/FOUNDATION/DOCS-EN/07-0-kpi-formula.md).

| Istilah | Definisi |
|---------|----------|
| **POT** | *Planned operation time* — waktu terencana work unit **bisa dipakai** (scheduled time). Di Molca diisi jam `SHIFT_INSTANCE` (mulai–selesai), **bukan** PBT. |
| **PBT** | *Planned busy time* — `POT − planned downtime`. Penyebut Availability. **Bukan** shift, **bukan** tag, tidak disimpan di `SHIFT_INSTANCE`. |
| **APT** | *Actual production time* — waktu aktual work unit **berproduksi** (fungsi bernilai tambah). Pembilang Availability. Molca v1: `PBT − unplanned downtime`. |
| **ADOT** | *Actual unit down time* — waktu aktual work unit tidak mengeksekusi produksi. Molca: `ASSET_STATE_LOG` unplanned (dan stop tanpa alasan sampai dikelas planned). |
| **AUST** | *Actual unit setup time* — waktu siapkan order di work unit. ISO memisahkannya dari APT; Molca v1 **belum** memotong setup dari APT. |
| **PQ** | *Produced quantity* — jumlah dihasilkan (total output). |
| **GQ** | *Good quantity* — jumlah baik. |
| **SQ** | *Scrap quantity* — jumlah yang tidak memenuhi syarat kualitas (scrap/recycle). Pembilang Scrap ratio. |
| **AOET** | *Actual order execution time* — jendela waktu aktual satu operasi berjalan di satu work unit. Diadopsi 2026-09-10 sebagai elemen baru, **bukan** `tag_role` — diisi dari `WORK_ORDER_OPERATION.actual_end − .actual_start` (PRODUCTION), field job, sama seperti `SHIFT_INSTANCE` mengisi POT. Penyebut Throughput rate dan Production process ratio. |
| **RWQ** | *Rework quantity* — jumlah yang dikerjakan ulang. Diadopsi 2026-09-10 sebagai elemen baru, **bukan** `tag_role` — diisi dari `WORK_ORDER_OPERATION.rework_qty` (PRODUCTION), field job yang sama yang sudah dipakai `total_output = good_qty + scrap_qty + rework_qty`. Pembilang Rework ratio. |
| **MTTR** | *Mean time to repair* — rata-rata lama satu **unplanned** downtime sampai mesin **runtime** lagi. `Σ (ended_at − started_at) / n`. Data: `ASSET_STATE_LOG` unplanned, bukan `small_stop` / planned / break. Figma label **MTBR** = MTTR. |
| **MTTF** | *Mean time to failure* — rata-rata jeda dari **restart** sampai **awal** unplanned stop berikutnya (`started_at_{i+1} − ended_at_i`). Perlu ≥2 stop. ISO TTF; bagian dari MTBF = MTTR + MTTF. |
| **MTBF** | *Mean time between failures* — **MTTR + MTTF** = rata-rata jeda dari **awal** unplanned stop ke-i sampai **awal** stop berikutnya. Perlu ≥2 stop. Selaras ISO 22400-2 §5.1.4 (TBF = TTF + TTR). |

## Teknis

| Istilah | Definisi |
|---------|----------|
| **PLC** | *Programmable Logic Controller* — pengendali mesin; sumber data mesin yang paling umum. |
| **SCADA** | Sistem supervisi & akuisisi data dari mesin/PLC. |
| **MES** | *Manufacturing Execution System* — kategori sistem tempat MolcaDx bermain. |
| **Offline-first** | Aplikasi tetap berfungsi tanpa koneksi, sinkron saat koneksi kembali. |
| **Source of truth** | Sistem/tabel yang dianggap benar saat dua sumber berbeda. |
