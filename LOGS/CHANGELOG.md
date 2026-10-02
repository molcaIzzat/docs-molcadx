# CHANGELOG — MolcaDx

Entri terbaru di paling atas. Format & aturan: [`README.md`](README.md).

---

## 2026-10-02 — Rentang half-open untuk semua `valid_from`/`valid_to` (keputusan PO) + perbaikan teks UX yang tertinggal

- **Tipe:** keputusan PO. prd-molcadx#24 item 21 disetujui sebagai "half-open di mana-mana", tapi spec hanya menulisnya untuk
  placement; PRD `FYR` masih menutup versi lama "sehari sebelum". Temuan dari prd-sync (prd-molcadx#25).
- **Aturan baru F-00 § Effective dating:** semua pasangan `valid_from`/`valid_to` di semua domain = `[valid_from, valid_to)`.
  Perubahan: `valid_to` lama = `valid_from` baru (nilai sama, bukan sehari/semenit sebelum). Nonaktif: `valid_to` = tanggal
  berlaku. "Berlaku pada t" = `valid_from <= t AND (valid_to IS NULL OR t < valid_to)`; no-overlap memakai batas `'[)'`.
  Contoh fiscal year. Rujukan dari F-03 dan F-04 §9.6. Tipe date vs timestamp tetap per entitas (A-19).
- **UX 01:** `sit-001.error.code-chars` mengizinkan `-` (kecuali kode work unit, S-10); kunci baru `sit-001.error.segment-clash`,
  `sit-002.shift-site.error.same-time`; `sit-002.fiscal-ent.amend.mode-change` kini teks penolakan (draft) — TBD teks di F-03 terjawab.
- **UX 04:** teks segment clash di Edit asset dan Place/swap.
- **F-04 §9.7.1:** contoh work unit `ST 02` → `ST02` (kode work unit belum boleh spasi, S-10).

---

## 2026-10-02 — Keputusan PO atas temuan implementasi FOUNDATION (prd-molcadx#24, 25 item)

- **Tipe:** keputusan PO. Issue prd-molcadx#24 mencatat pilihan yang diambil implementasi persistence FOUNDATION tanpa dasar di PRD/spec,
  plus kontradiksi di PRD. Semua 25 item diputuskan dan ditulis ke spec; PRD menyusul lewat `prd-sync`.
- **Tenant & kunci (F-00):** `region` bukan tenant — batas deployment di atasnya; `tenant_id` dari token login, kunci/FK pakai `tenant_id`
  (item 1, pertanyaan baru **E-2**: nama claim). **E-1 ditutup:** "No overlap" ditegakkan exclusion constraint (`btree_gist`) (item 11).
- **Kode & alamat (F-00, F-01, F-04 §9.7.1, F-13):** kode asli boleh berisi `-`/spasi (`FI-2`, `ANRITSU 57-1`); di alamat generated tiap
  segmen **dibersihkan** (selain huruf/angka/`_` → `_`), dua saudara yang bentrok ditolak. **A-13 ditutup** (item 2, 24). Pertanyaan baru **S-10**
  (`work_unit_code`). Default `namespace_uri` = `urn:molca:<SITE>` (item 4).
- **Tag berat (F-04, F-06, F-07.1):** `tag_role` baru `measured_total` — `uom_id` wajib, tidak diterima slot KPI mana pun (item 3). Pertanyaan
  baru **A-20**. Role per-piece tetap di docs-molcadx#60.
- **Site hierarchy (F-01):** blocker shift terbuka hanya dihitung saat menonaktifkan **site** (item 12).
- **Shift (F-02, PRODUCTION 04):** `end_time` eksklusif; `start = end` ditolak (item 15, **H-9/H-10** ditutup). Generator `SHIFT_INSTANCE` tetap milik
  `production-domain`; generator di master data dicatat sebagai pengganti sementara (item 14).
- **Fiscal (F-03):** ganti mode ditolak, bukan jadi deklarasi baru — **membalik PRD FYR-002 AC-5**; field baru `lineage_id`, `previous_version_id`
  (item 16). Pertanyaan baru **Y-4**; teks pesan penolakan `TBD`.
- **Asset (F-04):** placement half-open (`valid_to` lama = `valid_from` baru), A-19 sisa date-vs-timestamp (item 21). Product codes (`US-FND-WMS-006`):
  validitas timestamp; peringatan back-dated = "up to <n>" shift tertutup; End di masa lalu ikut diperingatkan; event `product_code_mapping_changed`,
  PRODUCTION yang menghitung ulang; alasan wajib di End/Delete; izin dicek di scope site dulu (F-00.1); Delete ikut disembunyikan tanpa izin; flag hanya
  baca primary flow (item 5–10, UX 08).
- **Product & Work Master (F-06, F-08, UX 08):** kesiapan hanya hitung routing released (item 17, P-10 ditutup); `OPERATION.step_id` tetap lintas baris
  bertanggal, tabel turunan langkah pakai `step_id` (item 18, **W-18** ditutup → **W-20**, baru **W-21**); maksimal satu draft BOM & routing per flow (item 19).
- **KPI binding (F-07.1, UX 07):** satu baris utama per slot, plus banyak baris `reason_match_enrich` dan `quality.reject` (item 20, **K-13** ditutup).
  Kartu KPI: Downtime interval dan Reject quantity jadi daftar.
- **Data source (F-13, UX 13):** dicatat bagian mana yang benar-benar menunggu CFG-001 / transformasi; sisanya siap (item 13).
- **Bahasa UI (UX 00, `DOCS/00-product-overview.md`):** default Inggris dengan pengalih `en`/`id`, istilah sesuai glosarium (item 22).
- **Audit (F-14, UX 14 baru):** layar `SCR-FND-AUD-001` Audit log; alasan wajib untuk `release` dan `upload` (item 23). Pertanyaan baru UX-AUD-1..3.
- **UX 05:** copy draft `ref-class.*` untuk halaman kelas lokasi (item 25), pertanyaan baru **UX-REF-4**.
- **Slot wajib vs opsional (F-07.1 §9.1, UX 07, UX 13):** field baru `KPI_FORMULA_SLOT.required`. Performance = cycle time ideal × total count / APT,
  jadi `performance.speed_check` (speed/runtime) **opsional** — tidak lagi muncul di "Missing for KPIs"; di kartu KPI tampil "Optional — not bound" dan
  tidak dihitung di "\<n\> of \<m\> bound". Tiga slot Quality jadi satu baris "two of Good / Total / Reject"; tiap baris diawali nama work center. Product
  code wajib kecuali job di-dispatch ke work unit — pertanyaan baru **K-17**.
- **Glosarium:** Step ID, Measured total, Cleaned segment, `product_code_mapping_changed`.
- **Backlog:** prd-sync PRD-003 (semua item di atas + perubahan Quality di bawah) — belum dijalankan.

---

## 2026-10-02 — Quality: reject dijumlah dari semua binding, lintas mesin dalam satu work unit (keputusan PO)

- **Tipe:** keputusan PO. Sebelumnya F-07.1 membatasi Quality ke tag di **satu asset** ("all `reject` rows for that asset"),
  sehingga reject mesin lain di work unit yang sama (mis. Vertical Line A: packer + checkweigher) tidak terhitung.
- **Aturan baru (F-07.1 §Quality, "More than one machine on one work unit — the bindings decide"):** binding work unit adalah
  daftar lengkapnya. **SQ = Σ semua binding `quality.reject` aktif**, dari mesin mana pun yang terpasang di work unit itu;
  tag yang tidak di-bind tidak dihitung. `quality.good` (titik keluar) dan `quality.total` (titik masuk) masing-masing **satu**
  binding, karena unit yang sama melewati tiap mesin. Ketiganya terisi → `reconcile_check`, selisih = anomali. Contoh berangka
  ditambahkan. Pareto reject per mesin per alasan = drill-down atas tag yang di-bind, bukan `KPI_RESULT` baru.
- **Dokumen:** F-07.1 (resolusi end-to-end, tabel isi Quality, transform `complement_derive`, §9.4 jumlah baris per slot, K-13
  terjawab sebagian), UX 07 (Reject quantity jadi daftar + "Add reject tag" di panel dan `SCR-FND-KPI-002`).
- **Pertanyaan baru:** K-16 — mesin paralel (berdampingan) dalam satu work unit.
- **Backlog:** prd-sync PRD-003 (`US-FND-KPI-*` binding Quality) — belum dijalankan, menunggu permintaan PO.

---

## 2026-10-01 — Alamat OPC UA generated memakai pemisah `/`

- **Tipe:** keputusan PO. Path di dalam NodeId generated (F-04 §9.7.1) berganti dari titik ke garis miring:
  `nsu=<namespace_uri>;s=<SITE>/<AREA>/<WC>/<WU>/<ASSET>/<tag_name>`. Bentuk `nsu=` / `s=` tidak berubah.
  Karakter segmen tetap huruf, angka, dan `_`; `/` kini pemisah, jadi tidak boleh ada di dalam segmen.
- **Dokumen:** F-04 §9.7.1, F-13 §2a, F-00 kode alamat, F-01 S-4, glosarium. Catatan keputusan 2026-09-25
  dibiarkan sebagai riwayat, dengan penunjuk ke bentuk yang berlaku.
- **PRD:** formula di `US-FND-DSR-001`, `US-FND-SIT-001`, `US-FND-AST-002` diselaraskan di sesi yang sama.

---

## 2026-10-01 — Aturan kunci di setiap tabel (PK + unique + no overlap) untuk semua domain (keputusan PO)

- **Tipe:** keputusan PO + spec semua domain. **Kenapa:** change data capture (Debezium) memakai primary key sebagai kunci event;
  PostgreSQL menolak `UPDATE`/`DELETE` pada tabel tanpa primary key di publication.
- **Aturan baru F-00 § Keys and constraints on every table:** satu surrogate PK per tabel (termasuk join/history/log/result/config;
  nama `<entity>_id` untuk entitas baru, nama lama tetap); PK tidak pernah di-update; tiap entitas punya baris **Keys** (PK ·
  Unique · No overlap) di bawah tabel field-nya, hanya dari aturan yang sudah ada di spec; tidak ada kolom berisi list.
  Pertanyaan terbuka **E-1**: no overlap ditegakkan dengan exclusion constraint atau cek aplikasi (engineering).
- **FOUNDATION (48 tabel):** baris Keys di semua tabel; PK ditambah ke `DOWNTIME_REASON_ASSET`, `REJECT_REASON_ASSET`, `KPI_RESULT`;
  tabel field baru `ASSET_PLACEMENT` (dari aturan §9.6 yang sudah ada); F-12 stop thresholds dan UX 08 UX-WMS-4: tabelnya nanti wajib
  PK + kunci unik. Pertanyaan baru: S-8, S-9, H-8, Y-3, A-17, A-18, A-19, T-7, T-8, P-8, P-9, K-12, K-13, K-14, K-15, W-18, W-19, AU-14.
- **PRODUCTION:** baris Keys di 5 entitas; `ASSET_STATE_LOG` PK dinamai `asset_state_log_id` (bagian row-ID dari B5). Pertanyaan baru
  PLN-Q10, PLN-Q11, PLN-Q12, SL-5; PLN-Q9 (nama PK pendek) langsung ditutup: nama lama tetap.
- **MAINTENANCE:** PK `asset_component_link_id` ditambah; `pm_step_id` → `pm_procedure_step_id`; baris Keys di 3 entitas. Pertanyaan
  baru AH-1, WM-5, WM-6.
- **Backlog:** prd-sync PRD-003 / PRD-004 (story yang menulis entitas dengan PK baru).

---

## 2026-10-01 — Story PRD `US-FND-WMS-006` (product codes) dibuat atas permintaan PO

- **Tipe:** keputusan PO (minta story PRD). Story baru di PRD-003 (prd-molcadx #23) untuk section Product codes
  (`SCR-FND-WMS-007`). Di repo ini: kolom Stories key `wms-007.*` dan baris layar di UX 08 kini menunjuk `US-FND-WMS-006`;
  indeks `AGENTS.md` §2 jadi 53 story hidup.
- **Masih terbuka:** UX-WMS-4 (pemilik catatan kode yang belum dipetakan), UX-WMS-5 (dua flow di work center yang sama).

---

## 2026-10-01 — Product codes: per asset, satu produk boleh punya beberapa kode (keputusan PO)

- **Tipe:** keputusan PO, klarifikasi F-04 §9.7 + UX 08. Kode produk milik **tiap asset** (tidak dibagi antar asset). Aturan
  A-6b hanya satu arah: satu kode → satu produk. Sebaliknya boleh: satu produk punya **beberapa kode aktif** di asset yang sama
  dan kode berbeda di asset lain. Cek unik pada `(asset_id, raw_value)`, **bukan** `tag_id` — asset dengan dua tag
  `product_code` tetap tidak boleh memetakan satu kode ke dua produk.
- **Diubah:** F-04 §9.7 (paragraf baru di bawah A-6b), UX 08 § Product codes section (satu baris).

---

## 2026-10-01 — UX 08: spec layar lengkap section Product codes (`SCR-FND-WMS-007`)

- **Tipe:** UX FOUNDATION, teks **draft**. Melengkapi outline 2026-09-30 (issue #58 part B) yang baru punya 4 key.
- **Isi:** layout (grup per work unit, blok per tag `product_code`, work unit tanpa tag), baris & status (Active / Scheduled /
  Ended), aksi (Add code, End, hapus yang belum berlaku; tidak ada edit di tempat — F-04 §9.7), definisi persis dua flag,
  daftar "Seen but not mapped" + aksi "Map to this product", mapping ke masa lalu (hitung ulang shift + peringatan, sama
  dengan standar back-dated), aturan simpan (A-6b), semua state, 17 key `wms-007.*`.
- **Pertanyaan terbuka baru:** **UX-WMS-4** (siapa pemilik catatan kode yang terbaca tapi belum dipetakan, berapa lama disimpan),
  **UX-WMS-5** (dua flow di work center yang sama: kode diselesaikan ke routing mana).
- **Belum ada story PRD** untuk `SCR-FND-WMS-007` (rule 1) — menunggu PO.

---

## 2026-10-01 — UX 08: teks layar detail step (instruksi, check, yield, hold time, toleransi dispensing)

- **Tipe:** UX FOUNDATION, teks **draft** (seperti teks UX 08 lainnya). Menutup `TBD` "screen design not done" di UX 08
  § EBR step detail.
- **Routing tab (`SCR-FND-WMS-003`):** per step bagian **Instructions** dan **Checks** (pola sama dengan Parameters), field
  **Yield range** + hint yield yang diharapkan, **Max hold time**; key `wms-003.instr.*`, `wms-003.checks.*`, `wms-003.yield.*`,
  `wms-003.hold.*`. Peringatan yield memakai teks F-08 §9.2.7 apa adanya.
- **BOM tab (`SCR-FND-WMS-002`):** field **Dispensing tolerance** di editor line consumed, ringkasan di node pohon; key
  `wms-002.line.tolerance*`, `wms-002.error.tolerance-*`.
- **Backlog:** prd-sync PRD-003 `US-FND-WMS-002`, `US-FND-WMS-003` (status kembali 🟢 setelah teks masuk).

---

## 2026-10-01 — UX 02: jumlah gap di Shift calendar dipertahankan, UX-SHF-3 ditutup (keputusan PO)

- **Tipe:** keputusan PO + UX FOUNDATION. **UX-SHF-3 ditutup:** indikator jumlah gap dipertahankan.
- **UX 02 `SCR-FND-SHF-003`:** key baru `shf-003.gap-count` — "\<n\> gap(s) in this range" di samping penanda horizon; menghitung
  alert gap (`shf-003.alert.gap`) pada rentang tanggal yang tampil, disembunyikan saat 0, membuka kontrol generate.
  Alert per tanggal tetap ada; teksnya masih terbuka di UX-SHF-2.
- **Backlog:** prd-sync PRD-003 `US-FND-SHF-002` setelah di-merge.

---

## 2026-10-01 — Skill `molca-erd` + salinan skill implementasi + MCP Figma di repo

- **Tipe:** tooling (skill + konfigurasi MCP). Tidak ada spec yang berubah.
- **Skill baru `molca-erd`** (`.claude/skills/molca-erd/`): alur memperbarui ERD logis di FigJam dari spec. Isinya:
  - `scripts/route.js` — router garis: satu garis per kolom FK, tidak ada garis yang menimpa garis lain atau melewati tabel,
    dengan verifikasi bawaan.
  - `scripts/tables.js` — helper edit tabel.
  - `scripts/sections.js` — section per domain FOUNDATION / MAINTENANCE / PRODUCTION.
  - `scripts/priority.js` — pewarnaan Must/Could/Won't dari sheet scope PO.
  - `references/spec-sources.md` — tabel ↔ file spec, warna header per modul.
  - `references/setup.md` — setup MCP di mesin baru.
- **ERD di FigJam ikut diperbarui** ke spec 2026-10-01:
  - 6 tabel baru FND · WMS: `product_flow`, `operation_work_unit`, `operation_dependency`, `operation_parameter`,
    `operation_instruction`, `operation_check`.
  - Kolom baru di 11 tabel, sesuai perubahan Work Master EBR, Q-28, SL-1 dan weight unit.
  - 102 garis FK; section per domain; tint prioritas.
  - Konflik scope yang perlu keputusan PO, dicatat di legend ERD:
    - `data_source` Won't, padahal `asset_tags.data_source_id` wajib.
    - Shift Could, padahal `shift_instance` dibutuhkan WOO, `asset_state_log` dan `kpi_result`.
- **Salinan skill (vendored)** ke `.claude/skills/`: `prd-implement`, `molca-prototype`, `molca-ui`, `molca-ui-adopt`,
  `molca-web-design-system`, `shadcn`, `tanstack-query-best-practices`. Sebelumnya hanya terpasang global di satu mesin.
  Asal & cara refresh: `.claude/skills/README.md`.
- **MCP:** `.mcp.json` baru mendeklarasikan `figma-console` untuk proyek ini. Token dibaca dari env `FIGMA_ACCESS_TOKEN`
  (opsional), tidak pernah di-commit.
- **Indeks:** `AGENTS.md` §6 (baris skill baru + catatan salinan), `CLAUDE.md` (tabel "This tool").

## 2026-10-01 — UX 01/02: search & keyboard di Site Hierarchy, "tidak ada jam shift" di Shift calendar (keputusan PO)

- **Tipe:** keputusan PO + UX FOUNDATION. Temuan audit usability (prd-molcadx PR #22) disetujui PO dan ditulis di `UX/`,
  karena teks layar bersumber dari sini; PRD menyalinnya lewat prd-sync.
- **UX 02 `SCR-FND-SHF-003`:** key baru `shf-003.empty.no-hours` — site tanpa baris `SITE_SHIFT` tidak menawarkan "Generate shifts"
  (sebelumnya jalan, membuat 0, dan tetap tampil sukses), melainkan tautan ke panel Shift di `SCR-FND-SIT-002`. State note ditambah.
  Pertanyaan terbuka baru **UX-SHF-3**: indikator jumlah gap di samping horizon, diputuskan bersama UX-SHF-2.
- **UX 01 `SCR-FND-SIT-001`:** key baru `sit-001.search`, `sit-001.search.clear`, `sit-001.empty.no-match`; state note: pencarian
  kode/nama di ketiga view (hasil + leluhurnya, terbuka), navigasi keyboard Tree pola WAI-ARIA treeview.
- **Tidak dimasukkan:** popover vs inline untuk date-range picker (detail tata letak, urusan desain).
- **Backlog:** prd-sync PRD-003 `US-FND-SHF-002`, `US-FND-SIT-001` setelah PR ini di-merge; PR #22 ditutup.

## 2026-10-01 — Work Master: detail step ala EBR (instruksi, IPC, toleransi dispensing, yield, hold time) (keputusan PO)

- **Tipe:** keputusan PO + spec FOUNDATION. **Keputusan:** [`LOGS/decisions/2026-10-01-work-master-ebr-step-detail.md`](decisions/2026-10-01-work-master-ebr-step-detail.md).
  Routing dibuat sejajar master recipe EBR, untuk bagian yang juga berguna di lini makanan. FOUNDATION hanya menyimpan **standar**;
  pencatatan aktual saat eksekusi milik PRODUCTION / domain Quality nanti.
- **Entitas/field baru:** **`OPERATION_INSTRUCTION`** (F-08 §9.2.5: urutan sub-step, teks, flag "wajib dikonfirmasi operator");
  **`OPERATION_CHECK`** (F-08 §9.2.6: in-process check/IPC — `numeric`/`pass_fail`/`text`, target/min/max + unit, jumlah sampel,
  frekuensi `once`/`start_middle_end`/`interval`, `is_critical`); `BOM_LINE.dispense_tolerance_type` + `dispense_tolerance_value`
  (± % atau ± kuantitas; bagian standar dari issue #60); `OPERATION.yield_min_pct`/`yield_max_pct` (definisi yield vs output
  teoretis + `planned_shrinkage`, contoh, kasus tepi — F-08 §9.2.7); `OPERATION.max_hold_time` + `hold_time_conversion_id`.
- **Aturan versi:** ubah nilai/teks = perubahan standar (effective-dated); tambah/hapus/urutkan ulang instruksi, tambah/hapus check =
  struktural (versi baru); perubahan `BOM_LINE` termasuk toleransi = versi BOM baru.
- **Pertanyaan terbuka baru:** W-10…W-15 di F-08 (hold time lintas routing, hold per successor & waktu tunggu minimum, toleransi
  asimetris, frekuensi IPC per kuantitas/per lot, lampiran/panjang instruksi, yield untuk step bersatuan hitung).
- **Di luar cakupan:** sign-off per step / verifikasi orang kedua (tergantung issue #62 e-signature) dan line clearance sebelum step —
  ditunda sampai PO mengonfirmasi pharma sebagai target.
- **Diubah:** F-00 (tabel modul + diagram), F-08 (§9.2 tabel, §9.2.5–§9.2.7 baru, §9.4, versi & status, diagram, "What's still unknown"),
  UX 08 (catatan `TBD` saja, belum desain layar).
- **Backlog:**
  - **PRODUCTION (diajukan lewat PO, dokumen PRODUCTION tidak diubah):** pencatatan konfirmasi instruksi; pencatatan hasil IPC + penanganan
    hasil kritis di luar rentang; pencatatan berat timbang per line vs toleransi (#60, tetap diparkir); input/output aktual per step
    untuk yield + tindakan di luar rentang; waktu mulai/selesai step + tindakan saat hold time terlampaui.
  - **prd-sync PRD-003:** `US-FND-WMS-003` (routing: instruksi, check, yield, hold time) dan `US-FND-WMS-002` (BOM: toleransi dispensing).
  - **Glossary:** istilah baru belum didaftarkan (IPC, hold time, dispensing tolerance, yield) — diajukan ke PO.

## 2026-10-01 — K-6/K-8: ambang small stop & downtime per work center (keputusan PO)

- **Tipe:** keputusan PO + spec FOUNDATION. Menutup F-07.1 **K-6** dan bagian ambang dari **K-8**. Sebelumnya batas
  1 menit / 5 menit tertanam di kode.
- **Dua ambang:** `min_stop_seconds` — stop lebih pendek **bukan** stop event; waktu hilangnya jadi speed loss (Performance),
  bukan `small_stop`, bukan Availability. `small_stop_max_seconds` — stop dari `min_stop_seconds` sampai nilai ini = `small_stop`
  (Performance); lebih lama = downtime nyata (Availability; planned/unplanned dari `DOWNTIME_REASON.downtime_category`,
  tanpa alasan = unplanned). Validasi saat simpan: `0 < min_stop_seconds < small_stop_max_seconds`, selain itu ditolak.
- **Cakupan & urutan lookup:** diatur per `WORK_CENTER`, override opsional per `WORK_UNIT`. Urutan `WORK_UNIT` → `WORK_CENTER`
  → `SITE` → default global **60 s / 300 s** (nilai lama). Level pertama yang punya nilai menang.
- **Satu pasangan untuk dua metode deteksi** (stall counter & band analog) — tidak ada ambang per metode.
- **Berlaku per tanggal:** tiap nilai punya `valid_from`; shift memakai ambang yang berlaku pada `business_date`-nya; perubahan
  tidak menghitung ulang shift yang sudah ditutup. Setiap perubahan masuk Audit Trail (F-14).
- **Tempat:** F-12 Configuration Service — "micro-stop threshold" kini **dikonfirmasi untuk rilis pertama** (bagian baru
  "Confirmed first-release item: stop thresholds"). F-12 belum punya model entitas → tabel penyimpanannya `TBD` untuk
  engineering; **tidak** menambah kolom di `WORK_CENTER`/`WORK_UNIT`.
- **Masih terbuka (baru):** **K-10** — siapa pemilik band operasi normal (mis. 40–100) di range detection dan di mana disimpan
  (dipisah dari K-8). **K-11** — stop terdeteksi > `small_stop_max_seconds` tetapi alasannya ber-kategori `small_stop`: durasi
  atau kategori yang menang? Dan apakah ambang berlaku juga untuk stop manual operator (`origin = manual`)?
- **Diubah:** `DOMAINS/FOUNDATION/DOCS-EN/07-1-kpi-tag-mapping.md` (deteksi stall langkah 2, deteksi rentang langkah 2–3, baris
  Micro-stops §Performance, tabel K-6/K-8/K-10/K-11, Next step), `DOMAINS/FOUNDATION/DOCS-EN/07-0-kpi-formula.md` (subbagian baru
  "Micro-stops, small stops, and downtime" di §Performance), `DOMAINS/FOUNDATION/DOCS-EN/12-configuration-service.md`,
  `DOMAINS/FOUNDATION/DOCS-EN/05-reference-master-data.md` (catatan `downtime_category`), `DOMAINS/FOUNDATION/FLOW/04-daily-runtime.md`
  (sumber ambang small stop kini F-12, bukan P-01 §3.3 yang sudah tidak ada).
- **Perlu PO (dokumen milik PO/domain lain, tidak diubah):** `DOCS/01-glossary.md` baris **Stall** dan **Deteksi rentang** masih
  menyebut ambang "belum ditetapkan (K-6/K-8)"; baris **Micro-stop** belum menyebut `min_stop_seconds`. PRODUCTION
  `02-monitoring.md` aturan 5 menyebut small stop dibaca dari `downtime_category` saja — belum menyebut ambang durasi.
- **Backlog (belum dikerjakan sesi ini):** prd-sync PRD-003 — tutup **Q-21** (bagian ambang stall) dan **Q-26** (bagian ambang;
  bagian band → K-10), tinjau **Q-10** / `US-FND-CFG-001` (micro-stop threshold kini dikonfirmasi), sinkronkan `US-FND-KPI-001`,
  `US-FND-KPI-002`, `US-FND-KPI-005`, `US-FND-KPI-006`, `US-FND-KPI-008` (menyebut stall / small stop).

## 2026-10-01 — Q-28: unit reject manual bebas, Quality dihitung dalam satu unit (keputusan PO)

- **Tipe:** keputusan PO + spec FOUNDATION. Menjawab PRD-003 **Q-28** (bentrok F-07 "Reject entered by weight" vs F-07.1
  "Quality never converts units" + aturan satu pasangan). Opsi (b): operator memilih unit, **tanpa field baru**.
- **Quality dihitung dalam satu unit:** `OPERATION.uom_id` step itu. Semua input dibawa ke unit itu sebelum GQ/PQ, sama seperti
  Performance mengonversi PQ (`PRODUCT_UOM_CONVERSION` aktif pada `business_date`; untuk kg lewat berat satu unit di step itu).
  Kalimat "Quality never converts units" diganti.
- **Reject manual** boleh dalam unit apa pun yang punya jalur konversi ke `OPERATION.uom_id` untuk produk itu; unitnya tersimpan di
  `WORK_ORDER_OPERATION_DEFECT.uom_id` (PRODUCTION). Tidak ada jalur konversi → reject disimpan apa adanya, Quality "cannot be
  calculated", alasan "No conversion for this unit".
- **Tidak berubah:** tag PLC di slot Quality tetap wajib satu `ASSET_TAGS.uom_id` (`kpi-002.error.quality-uom-mismatch`) — dipertegas
  bahwa cek ini untuk salah wiring, terpisah dari entri manual.
- **Pasangan baru di F-07.1 §Quality:** `total` mesin (atau total job) + reject manual → `good = total − Σ reject (dikonversi)`,
  `source_tier = manual`. Kalimat "jangan campur total job dengan reject PLC" diperjelas agar tidak melarang pasangan ini.
- **Diubah:** `DOMAINS/FOUNDATION/DOCS-EN/07-0-kpi-formula.md` (paragraf unit Quality; bagian "Reject entered by weight" →
  "Reject entered manually, in any unit", contoh biskuit tetap, tambah kasus tepi), `DOMAINS/FOUNDATION/DOCS-EN/07-1-kpi-tag-mapping.md`
  (§Quality, §9.4 validasi binding). UX 07 tidak diubah (teks error hanya untuk tag).
- **Backlog (belum dikerjakan sesi ini):** prd-sync PRD-003 — tutup **Q-28**, sinkronkan `US-FND-KPI-003` dan `US-FND-KPI-009`.

## 2026-10-01 — Penutupan item terbuka sesi Work Master (keputusan PO)

- **Tipe:** keputusan PO + spec PRODUCTION & FOUNDATION. **Keputusan:** [`LOGS/decisions/2026-10-01-open-items-wrap-up.md`](decisions/2026-10-01-open-items-wrap-up.md).
- **PRODUCTION (PLN-Q1…Q8 dijawab, PO bertindak lintas domain):** `WORK_ORDER_OPERATION_DEFECT.uom_id`; `origin = manual` sebagai sumber utama
  tanpa tag reject; stage order dibuat otomatis sebagai draft dari order FG; lot dapat `qty`, `uom_id`, `started_at`, `ended_at`, `closed_by` +
  aturan tutup lot; batch ID belum; placeholder version lock dihapus; `WORK_ORDER.product_flow_id` + `enforce_sequence` memblokir; tag parameter belum.
- **FOUNDATION:** `PRODUCT_DETAIL.weight_uom_id` (unit berat); knife/tooling tidak dimodelkan; contoh Ajinomoto dihapus dari F-08; tag role
  **`activity_signal`** diputuskan (Availability saja, lewat band check).
- **Diparkir dengan issue sendiri:** weight deviation (#60), jalur yang berubah di tengah batch (#61), persetujuan / e-signature sebelum release (#62).
- **Diubah:** PRODUCTION 01-planning, F-04 §9.7, F-06 §9.2, F-07.1, F-08.
- **Temuan prd-sync (2026-10-01, prd-molcadx#20) — masalah spec, perlu dijawab:** ~~F-07 "reject entered by weight" bertentangan dengan
  aturan F-07.1 (satu sumber per pasangan, Quality tidak pernah konversi unit) — PRD-003 Q-28~~ **dijawab di entri Q-28 di atas**; 01-planning "WORK_ORDER status" masih menyebut
  field lock yang sudah dihapus (PLN-Q6); 02-monitoring baris `derived` hanya menyebut `speed`, belum `activity_signal`; UX 06 masih menunjuk
  `SCR-FND-AST-002` yang retired; UX 08 baris `SCR-FND-WMS-004` masih "B3 TBD"; UX 04 baris `SCR-FND-AST-007` masih memuat product-code mapping;
  status `KPI_RESULT` belum bisa menampung "pending, batch open" / Quality "estimated" (PRD-004 R-07).

## 2026-10-01 — `OPERATION.step_type` jadi teks bebas (keputusan PO)

- **Tipe:** keputusan PO + spec/UX FOUNDATION. Mengubah field yang ditambahkan 2026-09-30 (wave 1, belum di-merge).
- `step_type` bukan lagi enum `process`/`setup`/`inspection`/`transfer`, tapi **teks bebas** yang diisi user; tidak ada logika sistem yang
  membacanya. Aturan KPI diganti: sebuah step dihitung untuk Performance bila **punya standar** (`cycle_time_value` atau
  `standard_speed_value`), bukan karena tipenya. Pengelompokan jenis proses tetap lewat `process_id` (process library).
- **Process library dihapus (sebelum merge):** `PROCESS` (F-05 §9.4.1), `OPERATION.process_id`, layar `SCR-FND-REF-011` dan entri glossary
  dihapus — artinya sama dengan step type. Yang dipertahankan: **step type** (teks bebas); input menyarankan step type yang sudah dipakai
  di tenant agar nama tetap konsisten.
- **Diubah:** F-00, F-05, F-08 §9.2, UX 05, UX 08 (key `wms-003.step.type`), glossary, catatan keputusan wave 1 dan wave 2.

## 2026-09-30 — Work Master wave 2: flow, process library, parameter standard (keputusan PO)

- **Tipe:** keputusan PO + spec/UX FOUNDATION. Dipicu layar EBR "Product Standard" (satu produk, beberapa flow).
- **Keputusan:** [`LOGS/decisions/2026-09-30-work-master-wave-2-flows-parameters.md`](decisions/2026-09-30-work-master-wave-2-flows-parameters.md).
  PO memilih opsi **A**: beberapa flow per produk, dipilih per work order. Jalur yang berubah di tengah batch (opsi B) belum.
- **Entitas/field baru:** **`PRODUCT_FLOW`** (F-08 §9.0) + `BOM.flow_id`, `ROUTING.flow_id`, `ROUTING.enforce_sequence`; **`PROCESS`**
  (F-05 §9.4.1, process library, sub-proses satu level) + `OPERATION.process_id`; **`OPERATION_PARAMETER`** (F-08 §9.2.4: target/min/max,
  unit, critical).
- **Aturan:** setiap produk punya ≥1 flow ("Standard" otomatis); tepat satu flow primary per tanggal; aturan versi jadi per flow;
  `ROUTING.is_primary` sekarang per flow + work center. Parameter: ubah nilai = perubahan standar, tambah/hapus = struktural.
- **Diubah:** F-00 (tabel modul + diagram), F-05, F-08, UX 05 (item 11 "Processes", `SCR-FND-REF-011`), UX 08 (flow bar, picker proses,
  toggle urutan wajib, tabel parameter, 8 key baru), glossary (Flow, Process library, Parameter standard), PRODUCTION 01-planning
  (PLN-Q7 flow di work order + penegakan urutan; PLN-Q8 tag untuk parameter + penanganan di luar batas).
- **Belum:** persetujuan QA / e-signature sebelum release (Workflow Engine, nanti); data khusus EBR (dosage).
- **PRD (rule 1b) — backlog:** story WMS; story baru untuk flow / parameter / process library menunggu PO (rule 1).

## 2026-09-30 — Work Master wave 1: issue #58 bagian A dan B (keputusan PO)

- **Tipe:** keputusan PO + spec/UX FOUNDATION. Menutup **W-7** dan **W-8** (F-08).
- **Keputusan:** [`LOGS/decisions/2026-09-30-work-master-wave-1.md`](decisions/2026-09-30-work-master-wave-1.md). Q1, Q4 (diperbarui),
  Q6 dijawab "yes" oleh PO.
- **Field / entitas baru:** `ROUTING.version`, `.status`, `.is_primary`; `BOM.version`, `.status`; `OPERATION.step_name`, `.step_type`,
  `.setup_time_conversion_id`, `.required_work_unit_class_id`; entitas **`OPERATION_WORK_UNIT`** (stasiun yang boleh + override cycle time)
  dan **`OPERATION_DEPENDENCY`** (step paralel); `BOM_LINE.operation_id`, `.line_use`, `.is_primary_output`; `ASSET_TAGS.count_side`;
  tag role **`lot_marker`**. `ASSET_PRODUCT_CODES.valid_from/valid_to` jadi timestamp.
- **Aturan:** perubahan struktural → versi baru; perubahan standar → baris berlaku-tanggal di versi yang sama. Work order mem-pin versi lewat
  `routing_id`/`bom_id`. Standar dibaca per `business_date` shift (Q1); koreksi mundur menghitung ulang shift lama + peringatan + `AUDIT_LOG`.
  Batch vs discrete dari `WORK_CENTER.type`; output batch dibagi ke shift menurut running time; "pending, batch open" sampai batch ditutup.
  Awal/akhir batch dari step job atau tag `lot_marker` (Q6).
- **Bagian B:** layar baru `SCR-FND-WMS-007` — product codes di dalam tab Routing, dikelompokkan per work unit; FLOW-02 tidak lagi menunjuk
  `SCR-FND-AST-002` yang sudah retired. **Story PRD belum ditulis** (rule 1 — perlu PO minta).
- **Pilihan yang berubah dari issue:** packaging & consumable jadi `product_type`; Q2 jadi sekarang; Q3 = produk bernama saja.
- **Diubah:** F-04 (§9.7), F-07 (bagian baru standar & batch), F-08 (§9.1–9.4, §9.2.2, §9.2.3, "Versions and status", W-7/W-8, contoh lini),
  UX 04, UX 08 (bagian tab Routing + 17 key baru + `SCR-FND-WMS-007`), FLOW-02, PRODUCTION 01-planning (PLN-Q6), catatan keputusan
  sebelumnya (lot_marker sudah diputuskan; mesin paralel = step berbasis kelas).
- **PRD (rule 1b) — backlog:** `US-FND-WMS-002`, `US-FND-WMS-003`, story KPI; story product code (baru) menunggu PO.

## 2026-09-30 — Lini lintas work center, reject diinput berat → waktu (keputusan PO)

- **Tipe:** keputusan PO + spec/UX FOUNDATION + pertanyaan terbuka ke PRODUCTION. Tidak ada field baru di FOUNDATION
  (aturan baru atas field yang sudah ada).
- **Keputusan:** [`LOGS/decisions/2026-09-30-line-across-work-centers-reject-weight.md`](decisions/2026-09-30-line-across-work-centers-reject-weight.md)
  — dari contoh lini biskuit (mixing → mold → oven → cooling → packing).
- **Satu produk per work center** (Dough @ Mixing → Baked biscuit @ Baking → Pack @ Packing), dihubungkan BOM. Alasan: OEE/cycle time
  menempel di produk yang benar-benar jalan, dough bisa dipakai bersama, ketertelusuran & Inventory butuh produk + lot per tahap.
  Tahap yang punya work center sendiri **bukan phantom**.
- **Planning memilih produk output tiap work center**, bukan bahan baku.
- **Step routing diisi otomatis dari `EQUIPMENT_FLOW`** work center; user mengisi output unit, cycle time/throughput, shrinkage per step;
  bisa untick mesin yang dilewati; mesin paralel = alternatif; flow berubah → badge "Flow changed — review routing".
- **Berat satu unit per step diturunkan** dari `standard_weight` + shrinkage step sesudahnya — basah/kering tidak diinput per work unit.
- **Punching: cycle time per punch** (output unit `punch`, `count_basis = cycle`); pieces per punch tidak wajib. Cycle time = kecepatan normal
  penuh, bukan setelan operator. Cara ukur shrinkage (weigh test) ditulis di F-08.
- **Reject diinput berat (F-07):** unit = berat ÷ berat satu unit di step itu; waktu = unit × cycle time step itu. Quality ratio pakai unit
  hasil konversi. Reject lintas work unit **dijumlah dalam waktu, tidak pernah dalam kg**. Tanpa output count → Quality hanya "estimated".
- **Diubah:** F-08 (bagian baru "A line across several work centers", catatan `step_number`), F-07 (dua subbagian baru di Quality), UX 08
  (editor routing: prefill dari flow, berat per unit, 3 key baru), PRODUCTION 01-planning (bagian baru open questions PLN-Q1…Q5).
- **Pertanyaan ke PRODUCTION (PLN-Q1…Q5):** unit di `WORK_ORDER_OPERATION_DEFECT.qty`; input manual sebagai sumber utama tanpa sensor
  reject; stage order otomatis dari order FG; qty/jendela waktu lot + tombol lot; batch ID lintas shift.
- **Masih terbuka di FOUNDATION:** unit `standard_weight` belum jadi field (kg diasumsikan); knife/tooling sebagai asset; tag role
  `activity_signal` / `lot_marker`.
- **PRD (rule 1b) — backlog:** `US-FND-WMS-003` dan story KPI Quality perlu `prd-sync` setelah merge.

## 2026-09-30 — Resep net, planned shrinkage per step, recipe base quantity (keputusan PO)

- **Tipe:** keputusan PO + spec/UX FOUNDATION. **Field baru:** `OPERATION.planned_shrinkage`, `BOM.base_qty`, `BOM.base_uom_id`.
  **Arti diperjelas:** `BOM_LINE.qty_per_unit` (per `base_qty`, net), `BOM_LINE.scrap_factor` (fraksi, 0.05 = 5%).
- **Keputusan:** [`LOGS/decisions/2026-09-30-bom-net-recipe-shrinkage-base-qty.md`](decisions/2026-09-30-bom-net-recipe-shrinkage-base-qty.md).
  Menarik issue #58 Q2 (planned loss di routing step) ke sekarang.
- **Konvensi net:** baris BOM = resep murni; susut ditambahkan di atasnya — component scrap per material (`scrap_factor`), shrinkage
  per proses di work unit (`planned_shrinkage`). Reject tetap terpisah, satu-satunya yang masuk OEE Quality. Shrinkage aktual dihitung
  PRODUCTION, tidak disimpan di FOUNDATION. Rumus planned input + contoh berangka (Mixer 1 vs Mixer 2) + kasus tepi di F-08.
- **Satu resep per produk** — tidak ada BOM per work unit; yang beda per work unit hanya shrinkage.
- **Recipe base quantity** — resep ditulis per batch ("per 1.000 kg", "per 40 pack"); default 1 = perilaku lama. Label layar
  "Recipe base quantity", bukan "batch size". Pohon BOM menampilkan kuantitas sesuai ketikan, % dari batch, dan per 1 unit (net).
- **Diubah:** F-08 (§9.2, §9.3, §9.4, bagian baru "Planned input", catatan contoh Ajinomoto), UX 08 (node pohon, field base qty,
  field shrinkage di editor routing, 5 key baru), glossary (Recipe base quantity, Shrinkage, Net BOM, Batch, Lot). Figma ERD ikut.
- **Diparkir (belum diputuskan):** tag role `activity_signal` (downtime dari arus/tegangan/getaran) dan `lot_marker` (tombol lot);
  qty + jendela waktu per lot dan aturan tutup lot di `WORK_ORDER_OPERATION_LOT` — milik `production-domain`; weight deviation
  (`quality_measurement`, #58 bagian C) — diparkir PO.
- **PRD (rule 1b) — backlog:** `US-FND-WMS-002`, `US-FND-WMS-003` perlu `prd-sync` setelah merge.

## 2026-09-30 — Product type jadi lima nilai, phantom BOM, tampilan pohon BOM (keputusan PO)

- **Tipe:** keputusan PO + spec/UX FOUNDATION. **Field baru:** `PRODUCT.packaging_level`, `BOM.is_phantom`. **Enum
  berubah:** `PRODUCT.product_type`.
- **Keputusan:** [`LOGS/decisions/2026-09-30-product-type-packaging-phantom-bom-tree.md`](decisions/2026-09-30-product-type-packaging-phantom-bom-tree.md)
  — dari diskusi contoh Ajinomoto 250g (issue #58). Membuka kembali dan menjawab ulang P-6 (F-06).
- **`product_type`** = `raw_material` · `packaging` · `consumable` · `semi_finished` · `finished_good` (setara SAP ROH/VERP/HIBE/HALB/FERT).
  **Phantom bukan type.**
- **`packaging_level`** (primary / secondary) wajib bila type = `packaging`, kosong selainnya.
- **`BOM.is_phantom`** — hanya untuk BOM produk `semi_finished`; efek ke stok/material requirement = domain Inventory, `TBD`.
- **Tab BOM di detail Product berbentuk pohon** — satu tampilan, tanpa pilihan Tree/Table seperti site hierarchy. Baris level pertama
  diedit langsung di pohon; level lebih dalam read-only dengan link ke BOM produk itu. Hanya di detail Product untuk saat ini.
  **Hierarki produk tidak wajib dideklarasikan** — BOM satu level tetap sah; pohon siap bila ada level berikutnya.
- **Contoh kerja** Ajinomoto 250g di F-08 core concept 2, berlabel *example data*. Dua hal ditandai terbuka di contoh: kultur bakteri dalam
  `pcs`, dan air + lakban yang ada di pohon tapi tidak di tabel sumber (#58 Q10).
- **Diubah:** F-06 (§ entitas, §9.1, P-6 dua tempat), F-08 (core concept 1–2, §9.3), UX 06 (picker type, field packaging level, 4 key
  baru), UX 08 (bagian pohon BOM + 9 key baru, badge list, baris editor BOM), glossary (Product type, Packaging level, Phantom BOM).
- **Mengubah pilihan di issue #58 bagian A:** packaging dan consumable jadi nilai `product_type`, bukan "material class" dan line use.
  Bila material per step (#58) masuk, line use "consumable" dihapus — cukup satu tempat.
- **PRD (rule 1b) — backlog:** story product (`SCR-FND-PRO-001`, `story TBD`) dan `US-FND-WMS-002` perlu `prd-sync` setelah merge.

## 2026-09-30 — BOM dan Routing pindah ke tab halaman detail Product (keputusan PO)

- **Tipe:** keputusan PO + UX FOUNDATION (navigasi saja). Tidak ada entitas, field, versioning, atau pemilik yang berubah.
- **Keputusan:** [`LOGS/decisions/2026-09-30-bom-routing-as-product-tabs.md`](decisions/2026-09-30-bom-routing-as-product-tabs.md) —
  merevisi sebagian keputusan [2026-09-28](decisions/2026-09-28-work-master-per-domain-operation-uom.md) (keputusan A + addendum
  pertama). BOM (`SCR-FND-WMS-002`) dan Routing (`SCR-FND-WMS-003`) bukan lagi item di grup sidebar Production, tapi **tab di
  halaman detail Product** (`SCR-FND-PRO-001`): Measurement · Conversions · BOM · Routing · History. ID layar tidak berubah.
- **Alasan:** datanya milik FOUNDATION dan dibaca domain lain (KPI sekarang, Inventory/Quality nanti); resep melekat pada satu produk.
- **Daftar produk** mengambil alih tampilan celah dari halaman list BOM/Routing 2026-09-28: kolom status BOM dan Routing dengan
  badge yang sama + filter "Only products without a BOM / routing". Badge hanya untuk `semi_finished`/`finished_good`;
  `raw_material` tampil "—".
- **Lisensi (opsi A):** tenant tanpa lisensi Production tidak melihat tab BOM/Routing, kolom status, dan filternya. Upsell tetap di
  heading grup Production yang terkunci. Opsi B (read-only) dan C (tanpa gate) tidak diambil — ditinjau ulang saat Inventory atau
  Quality mulai membaca BOM/Routing.
- **Diubah:** F-08 (bagian "Work Master per domain"), UX 00 (app shell, placement rule, nav key), UX 06 (tab + kolom + key baru
  `pro-001.*`), UX 08 (bagian navigasi, key list/link di-retire, catatan license gate), UX 09 (label diagram).
  Key di-retire, tidak dipakai ulang: `nav-sidebar.item.bom`, `nav-sidebar.item.routing`, `wms-list.empty`,
  `wms-002.list.columns`, `wms-003.list.columns`, `wms-list.link.other`.
- **PRD (rule 1b) — backlog, belum disinkronkan sesi ini:** `US-FND-WMS-002`, `US-FND-WMS-003`, dan story di balik
  `SCR-FND-PRO-001` masih menjelaskan navigasi lama. Jalankan `prd-sync` setelah PR ini di-merge.

## 2026-09-29 — State log: SL-1 ditutup, dua jalur tulis, aturan overlap SL-4 (keputusan PO)

- **Tipe:** keputusan PO + spec PRODUCTION (`02-monitoring.md` § `ASSET_STATE_LOG`). Diusulkan di channel Work
  (ot-it-auto: IEC 62264-3 §6.9, ISO 22400-2 §5.1/§5.2; it-platform: bentuk Bronze/Silver), dikonfirmasi PO.
- **SL-1 resolved:** pencatatan **per asset**, `asset_id` dan `work_unit_id` **wajib keduanya**. Work unit di-resolve
  dari placement saat event dan jadi level pelaporan Availability. Work unit multi-asset tidak butuh aturan tambahan:
  hanya primary yang menggerakkan Availability (rule 2) dan F-07.1 membolehkan satu primary per work unit. Browser
  `SCR-PROD-MON-001` filter per work unit dan per asset.
- **Dua jalur tulis, satu pemilik:** job Silver data-platform menulis baris `plc` / `derived`, aplikasi MES menulis baris
  `manual` + reason; keduanya ke tabel yang sama atas nama PRODUCTION. Tidak ada tabel state kedua.
- **SL-4 (bagian overlap) resolved:** sensor menang untuk **kapan** (`started_at` / `ended_at`), operator untuk
  **kenapa** — entri operator menambah/mengoreksi reason di baris sensor, bukan baris kedua. Baris `manual` hanya
  berlaku kalau tidak ada coverage `plc` / `derived`. Field baru `entered_by` / `entered_at` (pola sama dengan baris
  reject di Planning). Masih `TBD`: antrean offline, dan nasib baris `manual` kalau data sensor datang belakangan.
  Default usulan it-platform untuk kasus terakhir dicatat, belum dikonfirmasi PO.
- **Recompute Silver tidak pernah menimpa reason yang diisi operator** (baris dengan `entered_by`).
- **FOUNDATION F-04** (A-5, tabel pertanyaan, catatan §9.8) dan `PRODUCTION/AGENTS.md` menunjuk SL-1 sebagai resolved.
- **Backlog PRD:** PRD-004 `US-PROD-MON-003/004/005` (blocker B5 kini tinggal field state + offline) dan story untuk
  `SCR-PROD-MON-001` — ikut `prd-sync` setelah merge.

## 2026-09-29 — Aturan format Markdown (GitHub + Obsidian) di PRD standard dan `prd-sync` (PO)

- **Tipe:** keputusan PO — aturan penulisan. Tidak ada perubahan spec, entitas, atau teks layar.
- **Kenapa:** perbaikan tampilan di prd-molcadx#19 dan docs-molcadx#55 akan kembali rusak di `prd-sync`
  berikutnya kalau tidak ada aturan.
- **`DOCS/03-prd-standard.md` §3.6 baru** (dan satu baris di checklist §7): placeholder ditulis `\<count\>`
  (tetap dihitung kata per kata); kotak rumus pakai callout `> [!note]- …`, bukan `<details>`; tabel tidak di
  dalam list item; tabel utuh (baris pemisah, jumlah sel sama, satu baris per row, baris kosong sesudahnya).
- **Skill `prd-sync`:** aturan yang sama di §4 (saat menyalin teks spec/UX); §5 sekarang "Check links and
  rendering" dan menjalankan `check_render.py` baru (di folder skill) atas file PRD yang diedit.
- **UX 08:** satu baris kosong ditambahkan sesudah tabel Screen text — ditemukan oleh checker baru.

## 2026-09-29 — Perbaikan tampilan Markdown di Obsidian dan GitHub (tanpa perubahan isi)

- **Tipe:** perbaikan format. Tidak ada keputusan, entitas, field, aturan, atau teks layar yang berubah.
- **Placeholder di teks layar di-escape.** Placeholder polos (`<count>`, `<label>`, `<machine>` …) terbaca sebagai
  tag HTML yang tidak ditutup: di GitHub hilang, di Obsidian membuat Markdown sesudahnya tampil mentah (tabel,
  tebal, miring). 164 placeholder di 15 file di `DOCS/`, `DOMAINS/`, `AGENTS.md` sekarang ditulis `\<count\>` —
  tetap tampil `<count>`. Code span, code block, tujuan link, dan `<br>` tidak disentuh. File skill (`.claude/`,
  `.agents/`, `.cursor/`) tidak disentuh — tag di sana memang sengaja.
- **Tabel di dalam list dikeluarkan** (Obsidian Live Preview tidak merender tabel di dalam list item):
  `DOCS/02-domains.md`, UX 07, UX 08, UX 13, `PRODUCTION/DOCS/03-performance.md`.
- **Baris layar yang di-retire diluruskan:** 7 baris di UX 02, UX 04, UX 08 kurang satu sel (nama layar dan
  catatan retire digabung), sehingga Entities/States/Stories bergeser satu kolom. Ditambah sel Purpose `—`.
- **Anchor rusak diperbaiki:** `#94-unit_of_measurements` → `#94-measurement_group-and-unit_of_measurements`
  (F-06, F-08); `#9-entity-specification--routing-and-operation-only` → `#9-entity-specification` (F-06);
  "primary vs secondary" sekarang menunjuk ke F-07.1 (`07-1-kpi-tag-mapping.md`), tempat bagian itu berada (F-04).
- **PRD (rule 1b):** tidak perlu sinkron isi. Perbaikan yang sama sudah dibuat di `prd-molcadx`
  ([PR #19](https://github.com/molca-id/prd-molcadx/pull/19)), termasuk kotak rumus `<details>` → callout Obsidian
  (repo ini tidak punya `<details>`). Diff ini akan muncul di `prd-sync` berikutnya — abaikan, bukan perubahan spec.

## 2026-09-28 — Cara deklarasi tag diperbaiki; alamat tetap bisa diketik (keputusan PO)

- **Tipe:** keputusan PO + UX/spec FOUNDATION. Tidak ada entitas atau field baru.
- **Penamaan alamat tetap pilihan per data source** — kadang Molca tersambung langsung ke server OPC UA mesin/vendor
  yang nama node-nya tetap, jadi alamat ketik masih perlu. Default source OPC UA baru: `generated`
  (F-13 `node_naming`). Tidak pernah dicampur per tag. Filter "Typed addresses" di halaman Tags.
- **Form tag (UX 13 § Declaring a tag):** urutan Data source → Machine → Role → Tag name → Work unit; kind dan tag
  name diisi dari role (daftar default `TBD — foundation-domain`, F-04 A-16); preview alamat live read-only.
- **Mulai dari yang kurang:** panel "Missing for KPIs" di halaman Tags (slot KPI tanpa binding dan tanpa tag
  dengan role yang sah); "Declare" dan "Declare a tag" di side panel KPI (UX 07) membuka form dengan mesin dan role
  terisi.
- **Satu tempat edit:** detail asset (UX 04) dapat tab **Tags** read-only + link "Manage tags".
- **Topic MQTT juga bisa di-generate (PO, 2026-09-28):** `[<topic_root>/]SITE/AREA/WC/WU/ASSET/TAG_NAME`, satu nilai per
  topic (akuisisi pakai Telegraf). Field baru `DATA_SOURCE.topic_root` (MQTT saja, **opsional** — kosong: topic mulai dari site; diisi: broker dipakai
  bersama / test+produksi di satu broker); default
  source MQTT baru `generated`, `manual` untuk topic yang dipublish device sendiri atau banyak sinyal dalam satu
  pesan. F-04 §9.7.1 (bentuk topic + aturan unik per broker + `topic_root`), F-13 §2a/§9.1, UX 13
  (`dsr-001.sources.topic-root`). Nilai `topic_root` kalau dipakai: `TBD` (H-DS-7).
- **Improvement ke depan, bukan blocker:** template tag per `ASSET_TYPE` — dicatat sebagai F-04 A-16, belum didesain.
- **Backlog PRD:** `US-FND-DSR-001` (form, filter, panel), `US-FND-KPI-007` (Declare a tag pre-filled),
  `US-FND-AST-002`/`-003` (tab Tags di detail asset) — ikut `prd-sync` setelah merge, kalau diminta.

## 2026-09-28 — UX: halaman list untuk BOM/Routing, side panel per KPI, halaman Tags (keputusan PO)

- **Tipe:** keputusan PO + UX/FLOW FOUNDATION.
- **BOM dan Routing (UX 08):** picker produk di atas halaman **dihapus**. Halaman dibuka dengan **daftar produk**
  (versi berjalan, jumlah komponen/operasi, badge "No BOM yet" / "No routing yet" / "Cycle time missing" /
  "No unit conversion" / "Locked by <WO>"); klik baris → editor lama (`SCR-FND-WMS-002`/`-003`, perilaku editor
  tidak berubah). Filter default `semi_finished` + `finished_good`. Aturan "pilihan terbawa" diganti link
  BOM ↔ Routing di header detail. Key `wms-picker.*` di-retire, diganti `wms-list.*`, `wms-002.*`, `wms-003.*`.
- **KPI (UX 07, FLOW-05):** tombol "KPI Formula Slots" dan "KPI results" dihapus. Klik kartu KPI → **side panel**
  untuk KPI itu saja: Formula, Inputs (tag atau data job), Work units (bound / "Not bound" + Bind →
  `SCR-FND-KPI-002`), Latest result. `SCR-FND-KPI-001`/`-003`/`-004` jadi bagian panel, ID tetap. Key baru
  `kpi-panel.*`.
- **Tags (UX 13, UX 04, UX 00):** item baru **Tags** (`SCR-FND-DSR-002`) di grup Connections — semua tag yang
  dideklarasikan di site, lintas data source; create/edit/Test read pindah ke sini, `SCR-FND-DSR-001` tinggal
  koneksi + jumlah tag. Export tag list pindah ke Tags dan mengekspor baris hasil filter. UX-DSR-1 resolved;
  UX-DSR-2 resolved untuk "di mana" (format tetap F-04 A-11). Kolom "Last read" / filter "Never read" `TBD` —
  menunggu H-DS-1 (`last_seen_at` per tag).
- **Backlog PRD:** `US-FND-WMS-002`, `US-FND-WMS-003` (picker → list), `US-FND-KPI-002`/`-007`/`-008`
  (panel), `US-FND-DSR-001` ("pane under the source" → halaman Tags) + task breakdown — ikut `prd-sync`
  setelah merge.

## 2026-09-28 — Tiga jawaban kecil PO: produk di breakdown KPI, presisi cycle time, teks picker

- **Tipe:** keputusan PO + spec/UX FOUNDATION. Menjawab tiga `TBD` yang ditambahkan prd-sync (prd-molcadx #12).
- **Breakdown KPI (`SCR-FND-KPI-004`):** aturan konversi ditampilkan untuk produk yang **sedang jalan** di work unit
  (dari tag `product_code`); kalau tidak ada yang jalan, produk **terakhir** yang jalan. UX 07 key
  `kpi-004.conversion.product`.
- **Presisi `cycle_time_value`:** maksimal **6 desimal** (sama dengan `conversion_value`), rate turunan dibulatkan
  half-up. F-08 §9.2.
- **Picker di halaman BOM dan Routing:** label "Product", placeholder "Pick a product", kosong "No products yet —
  declare one first." UX 08 key `wms-picker.*`.
- **Backlog PRD:** `US-FND-KPI-008`, `US-FND-WMS-002`, `US-FND-WMS-003` (+ task breakdown `docs` task-nya) — ikut
  `prd-sync` setelah merge.

## 2026-09-28 — Satu baris konversi produk berlaku dua arah (keputusan PO)

- **Tipe:** keputusan PO + spec/UX FOUNDATION. Ditemukan saat update task breakdown PRD-003 (prd-molcadx #13):
  `US-FND-PRO-003` rule 5 / AC-6 melarang membalik faktor otomatis, sedangkan jalur konversi F-08 §9.2.1 (dipakai
  `US-FND-WMS-003`, `US-FND-KPI-002`) membaca baris terbalik (÷).
- **Keputusan:** satu baris `PRODUCT_UOM_CONVERSION` berlaku dua arah — maju × `conversion_value`, mundur ÷. Baris
  kebalikan tidak perlu diisi. Kalau dua arah sama-sama ada untuk pasangan dan tanggal yang sama, baris yang dibaca
  **maju** yang dipakai. F-06 §9.4 (aturan + contoh), UX 06 `SCR-FND-PRO-003` (tidak lagi menawarkan baris kebalikan).
- **Backlog PRD:** `US-FND-PRO-003` (rule 5, AC-6, state Success "offers to create the reverse row", event
  `uom_conversion_reverse_missing`) + task breakdown-nya — ikut `prd-sync` setelah merge.

## 2026-09-28 — Jawaban PO: satuan Quality, entri rate, breakdown KPI, retire Items & UOM

- **Tipe:** keputusan PO + spec/UX/FLOW FOUNDATION. Adendum di
  [`decisions/2026-09-28-work-master-per-domain-operation-uom.md`](decisions/2026-09-28-work-master-per-domain-operation-uom.md).
  Menjawab tiga temuan `prd-sync` yang dicatat di entri "Sidebar per domain" di bawah.
- **Satuan Quality diblokir saat binding:** tag good/total/reject di satu work unit wajib satu satuan; Quality tidak
  pernah mengonversi. F-07.1 (aturan + validasi §9.4), F-07.0, UX 07 key `kpi-002.error.quality-uom-mismatch`.
- **Rate di Routing disimpan apa adanya** (satuan waktu pilihan user, tidak dinormalisasi ke detik). F-08 §9.2, UX 08.
  Key `ref-002.summary.one-second-row` di-retire (UX 05). Presisi desimal `cycle_time_value` `TBD` (PO/Engineering).
- **Breakdown KPI menampilkan aturan konversi, bukan angka live:** FLOW-05 ditulis ulang, UX 07 key
  `kpi-004.conversion.rule` / `.missing`.
- **`SCR-FND-WMS-001` "Items & UOM" di-retire** (duplikat layar Product), ID tidak dipakai ulang; UX-WMS-3 resolved.
  UX 00, UX 09 disesuaikan.
- **Backlog PRD:** `US-FND-KPI-002/003/008`, `US-FND-REF-005`, `US-FND-WMS-001/003` — `TBD` yang ditambahkan prd-sync
  (prd-molcadx #12) kini terjawab; ikut `prd-sync` berikutnya.

## 2026-09-28 — Work Master diratakan di sidebar: BOM dan Routing jadi item terpisah (keputusan PO)

- **Tipe:** keputusan PO + UX/spec FOUNDATION, MAINTENANCE UX, PLATFORM. Adendum di
  [`decisions/2026-09-28-work-master-per-domain-operation-uom.md`](decisions/2026-09-28-work-master-per-domain-operation-uom.md).
- **Keputusan:** tidak ada item menu "Work Master". Production = **BOM · Routing · KPI**; Maintenance = **PM checklist ·
  KPI · Asset history**; Quality/Inventory = KPI saja (Work Master `TBD`, tanpa item sampai dimodelkan). Alasan: BOM dan
  Routing tidak saling bergantung (entitas, versi, pembaca, dan editor berbeda), tab hanya menambah klik. "Work Master"
  tetap nama modul/spec (istilah ISA-95).
- **UX 00:** tabel sidebar + key — `nav-sidebar.item.work-master` retired (tidak dipakai ulang), baru `bom`, `routing`,
  `pm-checklist` (draft). **UX 08:** `SCR-FND-WMS-002` (BOM) dan `-003` (Routing) jadi halaman terpisah tanpa tab, ID
  tetap; tiap halaman punya item picker sendiri, item terakhir terbawa antar halaman (teks picker `TBD`). UX-WMS-3 baru:
  usulan retire `SCR-FND-WMS-001` "Items & UOM" (duplikat layar Product) — belum di-retire. **F-08**, **PLT-01**,
  **MAINTENANCE UX 01** disesuaikan.
- **Backlog PRD:** `US-FND-WMS-001/002/003`, `US-FND-KPI-007` — ikut `prd-sync` berikutnya.

## 2026-09-28 — Kepemilikan status asset: operational state → PRODUCTION, lifecycle dibelah (keputusan PO)

- **Tipe:** keputusan PO + spec/UX/FLOW FOUNDATION, PRODUCTION, MAINTENANCE. Catatan:
  [`decisions/2026-09-28-asset-status-ownership.md`](decisions/2026-09-28-asset-status-ownership.md). Dasar: aturan
  pembelah 2026-09-10 (kejadian/histori → domain MOM pemilik).
- **Operational state (`ASSET_STATE_LOG`) milik PRODUCTION** — satu penulis; MAINTENANCE hanya membaca (MTBF/MTTR/MTTF).
  **B5/A-5 (bagian kepemilikan) resolved.** PRODUCTION `02-monitoring.md`: bagian entitas baru (hanya field yang sudah
  dirujuk di repo, sisanya `TBD`), layar baru `SCR-PROD-MON-001` menggantikan `SCR-FND-AST-005` (retired, ID tidak dipakai
  ulang), pertanyaan terbuka SL-1 (level pencatatan per asset vs per work unit, dulu A-5) s.d. SL-4.
- **Lifecycle status dibelah** (pola sama dengan `parent_asset_id` / `ASSET_COMPONENT_LINK`): nilai saat ini
  `ASSET.lifecycle_status` tetap di FOUNDATION (aturan placement membacanya); histori + transisi dari perawatan
  (mis. `under_maintenance`) milik MAINTENANCE — entitas belum dimodelkan, M-01 §9.2 baru + pertanyaan LH-1 s.d. LH-5,
  MNT-Q1 (tenant Maintenance tanpa Production tidak punya state log). WM-3 M-02 ditulis ulang.
- **FOUNDATION:** F-04 (tabel status kini kolom *Owner*, diagram, §9.4, A-5, related modules), F-00, F-00.1 (baris
  `ASSET_STATE_LOG` dipindah, P-4 resolved), F-05, F-07.0 (APT tetap Not Ready sampai spec PRODUCTION lengkap), F-13,
  F-14 (`domain_code = PROD`, `module_code = MON`), UX 04, FLOW-00/04/05.
- **Sidebar:** grup Maintenance = Work Master · KPI · **Asset history** (`SCR-MNT-AST-001`, key
  `nav-sidebar.item.asset-history`). Log runtime (state log) bukan layar setup — tinggal di app domainnya.
- **Backlog PRD (rule 1b), menunggu `prd-sync` setelah merge:** PRD-003 `US-FND-SIT-002`, `US-FND-KPI-001/003/004/005/006/012`
  (teks blocker B5), story REF yang membaca state log, `04-equipment-taxonomy` (`lifecycle_status`), README butir 1,
  `30-release` F5/#1. PRD-004 `US-PROD-MON-002/003/004/005`, `US-PROD-PRF-002/003/006`, `01-planning` P-06,
  `20-cross-cutting`, `30-release` P-R-01/B5, README, `90-closed` SHF-003/004.

## 2026-09-28 — Sidebar per domain, satuan item di `OPERATION`, `PRODUCT_CYCLE` di-retire (keputusan PO)

- **Tipe:** keputusan PO + spec/UX/FLOW FOUNDATION. Catatan: [`decisions/2026-09-28-work-master-per-domain-operation-uom.md`](decisions/2026-09-28-work-master-per-domain-operation-uom.md).
- **A — Sidebar dikelompokkan per domain** (menggantikan grup sidebar KPI 2026-09-27 dan draf pertama "grup Work
  Master" hari ini): grup **Master data** (master FOUNDATION yang dipakai semua domain) + satu grup per domain MOM
  (Production, Maintenance, Quality, Inventory) yang hanya berisi konfigurasi per domain — Work Master dan KPI. Domain
  tanpa lisensi tampil sebagai **satu heading grup terkunci** (item disembunyikan, klik → permukaan upsell); deep link
  ke layar domain itu tetap mendarat di state visible-but-locked. UX-WMS-2 resolved, K-9 direvisi. **Data tidak
  digeneralisasi:** resep Production (`ROUTING`/`OPERATION`/`BOM`/`BOM_LINE`) **tetap di FOUNDATION** (opsi 1 dari 2);
  Maintenance tetap M-02; Quality/Inventory `TBD`. Diubah: UX 00 (bagian app shell + key `nav-sidebar.*` baru), UX 07
  (key `kpi-sidebar.*` retired, tidak dipakai ulang; UX-KPI-2 superseded), UX 08, F-08, F-07.0, F-07.1 (K-9), F-00.1.
  **PLATFORM:** PLT-01 core concept 3a baru + FLOW-01 diagram render sidebar + `AGENTS.md`; anchor rusak ke bagian gate
  diperbaiki.
- **B — `OPERATION.uom_id` = satuan item** (pack, carton, kg), bukan satuan waktu; waktu hanya di `time_conversion_id`.
  KPI mengonversi satuan counter ke satuan operation lewat `PRODUCT_UOM_CONVERSION` produk itu — hanya bila
  `count_basis = 'unit'`, sebelum dibagi `batch_size`. Aturan simpan (pesan error persis) dan "cannot be calculated"
  saat runtime. **W-6 resolved.** Diubah: F-08 §9.2 + §9.2.1 baru, F-07.0 (subbagian "Item unit of PRI and PQ"),
  F-07.1 (baris standar Performance, transform `counter_to_duration`), F-05, FLOW-02, FLOW-05, UX 08 `SCR-FND-WMS-003`
  (picker satuan item terfilter).
- **C — `PRODUCT_CYCLE` di-retire:** tidak dibaca siapa pun, bertentangan dengan `OPERATION`, fungsinya diserap B.
  F-06 §9.3 retired (ID/heading disimpan), P-2 moot; UX 06 `SCR-FND-PRO-002` (tab Cycle Time) retired, ID tidak dipakai
  ulang; UX 05 kolom cycle time dibuang; F-00, F-00.1 (baris izin dicoret — string `foundation:pro:*` tetap dipakai
  entitas Product lain), F-12, F-14 dirapikan.
- **Masih terbuka:** FL-3 (PLATFORM) — grup domain berlisensi yang semua itemnya tersembunyi: kosong, hilang, atau
  terkunci? Deep link ke Feature yang tersembunyi mendarat di mana (`TBD` di PLT-01 3a). Label grup Master data belum
  punya story. Item Maintenance → Work Master menaut ke spec M-02 karena belum ada UX M-02 (`TBD — maintenance-domain`).
- **Backlog PRD (rule 1b) — PRD belum disentuh, menunggu `prd-sync` setelah PR ini merge:** PRD-003 `US-FND-PRO-004`
  (seluruhnya `PRODUCT_CYCLE` → retire), `US-FND-WMS-003` (makna `uom_id`, aturan simpan, field UI), `US-FND-KPI-002`
  (langkah konversi + kasus tepi), `US-FND-REF-004`/`-005`/`-006` (membaca `PRODUCT_CYCLE`), `20-cross-cutting.md`
  (baris `PRODUCT_CYCLE`), `US-FND-KPI-007` (tata letak sidebar, key retired, heading terkunci),
  `US-FND-WMS-002` (penempatan di grup Production).
- **Tanpa label "Master data" (PO, 2026-09-28):** master FOUNDATION bersama tampil di atas sidebar **tanpa heading
  payung**; Reference data dan Connections tetap punya heading grupnya sendiri. Key `nav-sidebar.group.master-data`
  di-retire (tidak dipakai ulang). Diubah: UX 00, UX 08, F-08, PLT-01, catatan keputusan. PRD-003 `20-cross-cutting`
  dan `08-work-master` masih menyebut grup Master data — ikut `prd-sync` berikutnya.
- **Sync PRD (2026-09-28):** dijalankan lewat `prd-sync` — prd-molcadx #12, `US-FND-PRO-004` di-retire (story hidup
  53 → 52, indeks `AGENTS.md` §2 diperbarui). **Masalah spec yang ditemukan:** (1) F-07 menyatakan Quality tidak butuh
  konversi satuan (good dan total satu satuan), tapi kasus tepi `US-FND-KPI-003` mengonversi satuan yang berbeda — perlu
  keputusan PO/`foundation-domain`. (2) UX 05 `ref-002.summary.one-second-row` masih merujuk `US-FND-PRO-004` yang sudah
  retired — apakah ringkasan itu masih perlu? (3) FLOW-05 menyebut layar breakdown menampilkan konversi yang dipakai,
  tapi `US-FND-KPI-008` hanya menampilkan konfigurasi — aturan konversi saja atau angka dari hitungan live?

## 2026-09-27 — `US-FND-SIT-003` (location context picker) di-retire (keputusan PO, issue #46)

- **Tipe:** keputusan PO + UX FOUNDATION + PRD-003.
- **Keputusan:** picker konteks lokasi **bukan** story FOUNDATION dan tidak tampil di app FOUNDATION mana pun
  (Master Data). `US-FND-SIT-003` di-retire; ID disimpan, tidak dipakai ulang. Picker di app Production (kemungkinan
  Production Monitoring) **diparkir** — belum ada story, tidak ada FE yang membangunnya sampai dibahas.
- **UX 01:** `SCR-FND-SIT-003` ditandai retired; sembilan key `sit-003.*` dihapus dan tidak dipakai ulang. Kalau
  picker kembali di Production, pakai ID `SCR-PROD-*` baru.
- **PRD-003** (repo `prd-molcadx`): story dipindah ke `90-closed-stories.md`, baris "Header across the whole app" di
  peta layar §7.1 dan event `context_changed` §8 dicoret, task breakdown SIT-003 diganti catatan "no tasks". Story
  hidup 54 → 53, ID closed/retired 11 → 12 (indeks `AGENTS.md` §2 diperbarui).
- **Masih terbuka (issue #46):** apakah story `US-PROD-MON-*` menggantikannya (aturan yang layak dibawa: hanya line
  dalam akses user, satu line → tanpa picker, offline menampilkan line tersimpan di device, target sentuh 44 × 44 px),
  apakah Planning/Performance ikut memakai, dan di mana pilihan disimpan sebelum `CFG-001` ada.

## 2026-09-27 — Laporan Production per keluarga KPI, bukan OEE saja (keputusan PO)

- **Tipe:** keputusan PO + spec PRODUCTION + F-07.
- **Keputusan:** laporan Production tidak hanya OEE. Empat halaman — **Overview** (OEE, A × P × Q, waterfall),
  **Availability** (Availability, Production process ratio, MTTR/MTTF/MTBF, downtime per alasan), **Performance**
  (Performance, Throughput rate, segmen per SKU), **Quality** (Quality ratio, Scrap, Rework, Fall-off ratio, reject per
  alasan). Tiap halaman punya tampilan **Live** (shift berjalan) dan **Period** (rentang `business_date`); scope
  (work unit / area-site / Job Order) jadi filter, sel yang tidak diadopsi F-07 berbunyi "Not calculated at this level".
- **`DOMAINS/PRODUCTION/DOCS/03-performance.md`:** bagian baru "Report pages — one per KPI family", tabel scope,
  7 aturan (baca `KPI_RESULT` saja; koreksi alasan tetap di Monitoring; reject per alasan hanya kuantitas, bukan rasio
  — Defect type scope masih blocked; MTTR dkk. di Availability untuk sekarang; domain lain memakai pola yang sama),
  dan pemetaan fitur Figma lama (OEE live → Live view, OEE report → Period view). Management menampilkan semua KPI yang
  diadopsi di level site. **`TBD — design`:** Figma Production perlu digambar ulang.
- **`07-0-kpi-formula.md`:** tabel baru **KPI → report page** (tabel penempatan tetap, bukan entitas katalog — K-1).
- **`DOMAINS/PRODUCTION/AGENTS.md`:** deskripsi indeks `03-performance.md`.
- **Backlog PRD (rule 1b), atas arahan PO — PRD belum disentuh:** PRD-004 `03-performance` (`US-PROD-PRF-001/002/003`)
  masih bertumpu pada fitur Figma lama (OEE live / OEE report). Perlu dibentuk ulang ke empat halaman setelah
  prd-molcadx #7 dan #8 merge, lewat `prd-sync`.

## 2026-09-27 — KPI per domain: slot punya `domain`, semua KPI yang diadopsi = Production (keputusan PO)

- **Tipe:** keputusan PO + spec + UX + glossary.
- **Keputusan:** KPI dipilih, di-binding, dan ditampilkan per domain MOM — Production / Quality / Maintenance / Inventory.
  Semua KPI yang sudah diadopsi F-07 (Availability, Performance, Quality ratio, OEE, Throughput rate, Production process
  ratio, Scrap ratio, Rework ratio, Fall-off ratio) plus MTTR/MTTF/MTBF adalah **KPI Production**, termasuk yang di
  pengelompokan ISO jatuh ke Quality/Maintenance. Quality/Maintenance/Inventory belum punya KPI yang diadopsi.
- **`DOMAINS/FOUNDATION/DOCS-EN/07-1-kpi-tag-mapping.md` §9.1:** field baru `KPI_FORMULA_SLOT.domain`
  (`production` | `quality` | `maintenance` | `inventory`, wajib); semua 10 seed row = `production` (termasuk
  `throughput.order_execution_time` dan `rework.output`, kini ikut tabel seed). Enum `metric` dilengkapi `throughput`,
  `rework` (sudah dipakai sejak 2026-09-10, belum tercantum di enum). §9.5 `KPI_RESULT.metric` dilengkapi Throughput rate,
  Production process ratio, Scrap ratio, Rework ratio, Fall-off ratio (diadopsi 2026-09-10, belum tercantum).
- **`07-0-kpi-formula.md`:** paragraf "Every KPI adopted above is a Production KPI" di bawah tabel cakupan.
- **`UX/07-kpi.md`:** grup sidebar **KPI** baru dengan satu item per domain (Production / Quality / Maintenance /
  Inventory), masing-masing membuka `SCR-FND-KPI-002` terfilter domain itu — bukan pengelompokan di satu halaman
  (keputusan PO). Keempat item selalu tampil; domain tanpa slot membuka empty state. **UX-KPI-2** dibuka lalu ditutup
  di hari yang sama. Blok Screen text baru (sidebar + empty state, semua `(draft)`).
- **Glossary:** "KPI formula slot" menyebut `domain`.
- **Kesiapan FOUNDATION (lanjutan, hari yang sama):** `FLOW/05-kpi-computation.md` — halaman KPI Calculation dibuka dari
  halaman KPI satu domain dan hanya memuat slot domain itu. `07-1` §9.5 — nilai enum `KPI_RESULT.metric` kini ditulis persis
  (`availability` … `fall_off_ratio`), sama dengan ejaan yang sudah dipakai PRD-003. **K-9** dibuka lalu ditutup (keputusan PO):
  item sidebar KPI suatu domain **disembunyikan** bila tenant tidak berlangganan domain itu (License Manager) — sesuai PLT-01
  core concept 3 (item sidebar = level Feature → hidden). Domain yang dilanggan tapi belum punya KPI tetap tampil dengan
  empty state; tanpa domain sama sekali, grup KPI disembunyikan. `00-1` — domain tidak menambah permission sendiri;
  entitlement adalah cek terpisah. Indeks UX (`UX/00-ux.md`, `AGENTS.md`) dan journey `UX/09` menyebut sidebar KPI.
  11 anchor rusak lama di `07-0`/`07-1` diperbaiki (Production order scope, Two stations, Performance, OEE).
- **Backlog PRD (rule 1b):** PRD-003 `US-FND-KPI-007` masih menulis "all four always shown" — perlu mengikuti K-9 (hanya domain
  yang dilanggan) pada sync berikutnya.
- **PRD (rule 1b):** PRD-003 `US-FND-KPI-007` (binding) disinkronkan pada sesi yang sama di `prd-molcadx`; story baru
  `US-FND-KPI-013` (Fall-off ratio) ditambahkan atas permintaan PO.

## 2026-09-27 — Creator map: Work Directive = production execution management (ot-it)

- **Tipe:** koreksi spek PRODUCTION (PR #43 / issue #42).
- **Sumber:** ot-it spot-check pada peta pembuat Part-4.
- **`05-work-master.md`:**
  - Work Directive Part-3 creator → **Production execution management** (IEC 62264-4 §4.2.4 / 62264-3 §6.8.3), bukan detailed scheduling. Who MolcaDx tetap system on `WORK_ORDER` release.
  - Work Master activity label → **Definition management** (Part-4 wording).
  - WM-P-1 closed text: drop “cycle-time” dari daftar freeze (identity routing/BOM saja; Performance tetap as-of).
- Spot-check creator map **selesai**; WM-P-2 tetap terbuka.


## 2026-09-27 — Work Master versi Production siap (issue #42)

- **Tipe:** spec PRODUCTION + indeks domain.
- **Keputusan (Work room 2026-09-27, Faris + ot-it + it-platform):** FOUNDATION pemilik Work Master (F-08); Production
  hanya memakai; bekuan job = identitas routing/BOM (bukan snapshot cycle time untuk OEE). Tidak ada katalog resep kedua.
- **`DOMAINS/PRODUCTION/DOCS/05-work-master.md`** 🟡 → 🟢:
  - **Peta pembuat (IEC 62264-4 §4.2.4):** tabel objek → aktivitas Part-3 → siapa di MolcaDx → status. Work Schedule,
    Job List, Work Request, Work Performance ditandai *deferred*; **Job Response ≠ Work Performance** ditulis eksplisit.
    Menunggu spot-check ot-it.
  - **Pengganti sementara Work Directive:** hanya `routing_version_locked` / `bom_version_locked` di `WORK_ORDER`
    (keduanya masih terblokir F-08 W-8) — identity plan saja. Cycle time / speed **tidak** disalin ke job.
    OEE Performance (Silver) join Foundation as-of `business_date` (F-07). Koreksi master = baris `OPERATION`
    baru (bukan edit di tempat, F-08 §9.2); kalau di-backdate ke hari lampau → recompute mengubah Performance hari itu.
    PRI (planned run time per item, ISO 22400-2 §5.1.2.5, didefinisikan di F-07) "as released" = pilihan produk nanti
    di W-8, bukan wajib ISO.
  - **WM-P-3 ditutup:** label Figma "Cycle Time" = `OPERATION.cycle_time_value` (discrete/batch) atau
    `standard_speed_value` (continuous). Tidak ada field baru.
  - **WM-P-2 diparkir** (PO + ops, 2026-09-27) — batas bawah sudah dari aturan release; yang terbuka: wajib-tidaknya
    standar per `OPERATION` dan setup/crew (W-7).
  - **WM-P-4 baru:** process-segment library, ditunda lewat Q3.
- **`01-planning.md`:** baris Work Directive di Planning spine menunjuk ke bagian pengganti sementara di `05`.
- **`DOMAINS/PRODUCTION/AGENTS.md`:** status `05-work-master.md` → 🟢.
- **Backlog PRD (rule 1b):** tidak ada entitas/field baru. Story Planning PRD-004 yang menyebut resep/lock/dispatch
  belum dicek terhadap perubahan ini — jalankan `prd-sync` saat PO meminta.

## 2026-09-25 — Layar Crew assignment dipensiunkan (keputusan PO)

- **Tipe:** keputusan PO + UX + glossary.
- **Keputusan:** crew assignment belum dibutuhkan untuk saat ini. `SCR-FND-SHF-004` dipensiunkan di
  `DOMAINS/FOUNDATION/UX/02-shift.md` — baris layar dicoret, semua baris teks layar `shf-004.*` dihapus
  (termasuk 2 `TBD — PO`: crew picker & offline). ID layar dan key tidak dipakai ulang. Glossary "Crew (regu)" diberi catatan.
- **Dependensi (rule 4):** tidak ada story hidup yang bergantung pada `US-FND-SHF-004`. Satu-satunya pembaca
  `SHIFT_ASSIGNMENT` adalah `US-PROD-SHF-001` di PRD-001 yang sudah beku (kode `SHF` PRODUCTION sudah dipensiunkan).
- **Backlog (rule 1b):** PRD-003 `02-shift.md` masih menandai `US-FND-SHF-004` 🔴 Blocked — perlu diubah jadi
  Closed/retired (+ `20-cross-cutting.md`, `90-closed-stories.md`, task breakdown) saat PO meminta sinkron PRD.

## 2026-09-25 — Alamat node tag OPC UA di-generate dari hierarki (keputusan PO)

- **Tipe:** keputusan PO + spec + UX + FLOW + glossary. [Catatan keputusan](decisions/2026-09-25-generated-opcua-tag-nodes.md).
- **Keputusan:** user hanya mendeklarasikan tag (`ASSET_TAGS.tag_name`, mis. `Total_Count`, + role/kind/uom/…).
  Untuk data source OPC UA dengan `node_naming = generated`, NodeId dibangun dari penempatan aset:
  `nsu=<namespace_uri>;s=<SITE>.<AREA>.<WC>.<WU>.<ASSET>.<tag_name>`. Bentuk NodeId mengikuti IEC 62541-3;
  isi path bertitik = konvensi Molca (bukan kewajiban IEC 62541/ISA-95). Simpan namespace **URI** (`nsu=`),
  bukan indeks `ns=`. Molca memegang sisi OPC UA: MolcaDx membuat **tag hand-off list**, orang hardware Molca
  mengonfigurasi server agar cocok. `manual` = perilaku lama (`node` diketik) — selalu untuk MQTT.
- **Pilihan desain `foundation-domain`:** `generated_node` **dihitung saat dibaca**, tidak disimpan per periode
  penempatan (hindari sumber kebenaran kedua, pola B6). Pola `*_code` yang disarankan diganti jadi **satu segmen
  per level** (`JKT1`, `AS`, `L01`, `S03`) — bukan field baru; cakupan unik tidak berubah. Charset huruf/angka/`_`
  untuk kode hierarki di setiap simpan; untuk `asset_tag` hanya saat tag disimpan ke source `generated`. Rename kode
  yang dipakai alamat hidup = peringatan + konfirmasi (A-14 terbuka).
- **Spec (`foundation-domain`):** F-04 §9.7 — `tag_name` baru, `node` jadi kondisional (hanya `manual`),
  `generated_node` turunan read-only; §9.7.1 baru (bentuk, dasar standar, segmen, 8 aturan); open A-11…A-14.
  F-13 §9.1 — `node_naming`, `namespace_uri` (namespace keluar dari `connection_config`); konsep 2a; open H-DS-5,
  H-DS-6. F-01 §9.3–§9.6 pola kode + catatan S-4 (dua tempat) + pitfall 5. F-00 tabel business code (asset tag
  jadi `IM003`) + catatan kode dalam alamat mesin + paragraf Data Source. F-07.1 satu catatan (bacaan per `tag_id`).
- **UX/FLOW:** `UX/13` — `SCR-FND-DSR-001` tag name diketik, alamat read-only, aksi export tag list, 11 baris teks baru
  (4 draft, 7 `TBD — PO`), UX-DSR-2. `UX/01` — hint kode per level, error charset, konfirmasi rename kode. `UX/04` —
  catatan state (rename `asset_tag`, place/swap mengubah alamat). FLOW-01 contoh kode; FLOW-02 langkah hand-off.
- **Glossary:** Tag name, Generated node, Tag hand-off list (disetujui PO).
- **Backlog (rule 1b):** PRD-003 **tidak** disinkronkan sesi ini (tidak diminta). Story terdampak: `US-FND-DSR-001`,
  `US-FND-SIT-001` (hint/validasi kode), `US-FND-AST-002` (deklarasi tag).
- **Perlu dicek PO:** contoh `entity_code` di F-14 Audit Trail (`JKT1-AS-L01`) kini bentuk gabungan tampilan, bukan
  kode tersimpan — tidak diubah.
- **Lanjutan (keputusan PO, hari yang sama) — mesin multi-lane:** satu aset boleh ditempatkan di beberapa work unit
  sekaligus hanya sebagai mesin multi-lane (counter per lane), semua dalam satu site, lewat pilihan eksplisit "tambah
  lane" (tanpa flag di `ASSET`). F-04 §9.6 aturan baru; §9.7 field `ASSET_TAGS.work_unit_id` (wajib bila >1 penempatan
  aktif; FK ke work unit, **bukan** ke `ASSET_PLACEMENT` karena baris penempatan ditutup/dibuka ulang); tag per-lane
  hanya dihitung di work unit-nya, tag tanpa lane tidak dibaca. Sinyal seluruh mesin (`machine_state`/`downtime_reason`/
  `runtime`) berlaku untuk semua lane, Availability tiap lane dihitung sendiri, **satu** alamat di bawah work unit
  tag itu (§9.7.1 aturan 9; alias per lane → A-15 terbuka). Mesin boleh `primary` di tiap lane. F-07.1: join tag
  per work unit + validasi binding. F-00.1: scope baris AST. UX 04/13 catatan + 2 baris teks `TBD — PO`; FLOW-02 satu
  baris implikasi; glossary "Multi-lane machine".
- **Draft teks layar (T-3a, `foundation-domain`):** usulan kata `"<teks>" (draft)` untuk 42 baris `TBD — PO` —
  `UX/02` 21 dari 23 (`SCR-FND-SHF-003`/`004`), `UX/13` 19 dari 19 (`SCR-FND-DSR-001`), `UX/04` 2 catatan state
  (rename `asset_tag`/place-swap mengubah alamat; pertanyaan move vs tambah lane) diisi inline. 2 tetap `TBD — PO`:
  `shf-004.crew-picker` (menunggu keputusan letak crew) dan `shf-004.offline` (boleh assign crew saat offline?).
  Menunggu review PO; PRD-003 tidak disentuh.
- **Draft teks layar UX/01 (T-3a, `foundation-domain`):** usulan kata untuk **71** baris `TBD — PO` di Screen text `UX/01-site-hierarchy.md` (SIT-001…003), ditulis `"<teks>" (draft)` mengikuti Copy style; **2** tetap `TBD — PO` (`sit-001.table.columns`, `sit-002.fiscal-ent.row.status` — butuh keputusan isi, bukan kata). `sit-001.confirm.code-in-address` mengikuti spec saat ini (peringatan + konfirmasi; A-14 masih terbuka).

---

## 2026-09-25 — Data source mendapat layar sendiri di grup sidebar "Connections" (keputusan PO)

- **Tipe:** keputusan PO + UX.
- **Keputusan:** Data Source (F-13) **tidak** masuk grup Reference data — ia menyimpan rahasia koneksi
  (`connection_config`) dan status koneksi hidup (`last_seen_at`), bukan pick-list kode/nama. Layarnya berada di grup
  sidebar baru **Connections**; Integration (F-11) bisa menambah item di sana nanti. Modul tetap F-13 / `DSR`.
- **UX (`foundation-domain`):** file baru `UX/13-data-source.md` — `SCR-FND-DSR-001` (daftar data source + daftar
  `ASSET_TAGS` + Test read); `ASSET_TAGS` (F-04 §9.7) sebelumnya belum punya layar (celah D-1). Screen text: 18 baris,
  13 `TBD — PO`. Pertanyaan UX-DSR-1. Terdaftar di `UX/00-ux.md`, `DOMAINS/FOUNDATION/AGENTS.md`; catatan di
  `UX/05-reference.md` dan F-13 *Related modules*.

---

## 2026-09-25 — Teks layar pindah ke UX: UX = sumber, PRD menyalin kata per kata (keputusan PO)

- **Tipe:** keputusan PO + aturan standar + UX + skill.
- **Masalah:** dua implementasi layar yang sama menulis kalimat berbeda di tempat PRD tidak memberi teks (atau
  menulis `TBD`), dan mengubah aturan untuk developer jadi kalimat di layar.
- **Keputusan:** semua teks yang dibaca user di layar yang dideklarasikan punya rumah di bagian **Screen text** UX
  doc modulnya, dengan key tetap (`sit-004.empty`). PRD menyalin kata per kata; bila beda, UX yang benar. Teks
  belum diputuskan = baris `TBD — PO`, implementasi menampilkan `[TBD copy: <key>]`. Bahasa Inggris dulu;
  terjemahan Indonesia belakangan (UX-0-1).
- **Aturan:** `FOUNDATION/UX/00-ux.md` (aturan T-1…T-4, D-4 diubah, D-5 baru), `DOCS/03-prd-standard.md` §3.5,
  skill `prd-sync` (teks layar disalin dari UX).
- **Modul pilot (`foundation-domain`):** Screen text ditambahkan ke `UX/01-site-hierarchy.md` (SIT-001…003, 161
  baris), `UX/02-shift.md` (SHF-003/004, 29 baris), `UX/05-reference.md` (REF-001…010 + sidebar, 149 baris). Dari
  339 baris, 182 masih `TBD — PO`. Pertanyaan baru: UX-SHF-2, UX-REF-2, UX-REF-3.

---

## 2026-09-25 — Skill `prd-sync`: sinkronisasi PRD tidak lagi dicatat di changelog ini (keputusan PO)

- **Tipe:** skill.
- **Perubahan:** `.claude/skills/prd-sync/SKILL.md` langkah 6–7 — sinkronisasi PRD cukup dicatat di
  `prd-molcadx/CHANGELOG.md`. Changelog ini hanya mencatat keputusan pemicunya (rule 1a) dan, bila ada, temuan
  masalah spec dari sinkronisasi (inkonsistensi nyata / celah spec yang perlu jawaban PO).

---

## 2026-09-25 — Audit log tetap terpusat + asal baris terlihat; download data domain = aksi bisnis (keputusan PO)

- **Tipe:** keputusan PO + spec + PRD (rule 1b). Menutup P-10 (PRD-004).
- **Keputusan:** (1) Feature Audit log **tetap satu halaman terpusat**, dan setiap baris wajib menampilkan domain + modul
  asalnya (nama modul dari tabel kode §4 `AGENTS.md`); membuka baris membawa ke layar record di modul pemiliknya; file
  unduhan punya kolom `domain_code`/`module_code`. (2) Download data milik domain (jadwal, report) dicatat sebagai
  **aksi bisnis domain** berakhiran `_downloaded` (`schedule_downloaded` PLN, `report_downloaded` PRF), bukan `download`
  generik — `download` tetap khusus unduhan baris audit (`entity_type = AUDIT_LOG`). Aksi `*_downloaded` tidak punya
  `changes`, mengisi `download_filter` + `download_row_count`. Dikonfirmasi PO: tanpa alasan wajib, dan scope baris =
  scope filter yang dipakai (`tenant` bila tanpa filter).
- **FOUNDATION:** `14-audit-trail.md` — taksonomi (Audit log terpusat), core concept 7 dan 9 (tabel aksi download),
  §9.1 `action`/`changes`/`download_filter`/`download_row_count`, §9.2 aturan asal baris.
- **PRODUCTION:** `01-planning.md` § Log (`schedule_downloaded`), `02-monitoring.md` § Log (tanpa `download` generik),
  `03-performance.md` § Log (`report_downloaded`); unduhan log sendiri = baris `download` milik FOUNDATION `AUD`.
- **PO:** glosarium (*Audit log*).
- **prd-sync:** PRD-003 dan PRD-004 disinkronkan ke `docs-molcadx@327bb64` ([prd-molcadx#4](https://github.com/molca-id/prd-molcadx/pull/4)) — `AUD-003`/`004`, `PLN-007`/`011`, `MON-007`, `PRF-002`/`007`; P-10 ditutup.

---

## 2026-09-25 — Audit trail diperluas ke seluruh sistem, hak baca per modul (keputusan PO)

- **Tipe:** keputusan PO (membalik "FOUNDATION saja" di hari yang sama) + spec + PRD (rule 1b).
- **Keputusan:** satu `AUDIT_LOG` milik FOUNDATION (F-14) sebagai infrastruktur bersama; **semua domain** menulis ke
  sana dengan aturan yang sama (append-only, satu transaksi, alasan wajib, 3 tahun, nama aktor disimpan). Hak baca
  **per modul**: `<domain>:<modul>:<scope>:audit_view` / `:audit_download` (mis. `foundation:sit:site:audit_view`,
  `production:pln:site:audit_view`), terpisah dari `view` record-nya. Feature Audit log (`AUD`) tidak punya izin
  sendiri — hanya menampilkan baris dari modul yang izinnya dimiliki.
- **FOUNDATION (`foundation-domain`):** `14-audit-trail.md` — cakupan + PRODUCTION (`WORK_ORDER`,
  `WORK_ORDER_OPERATION`, `WORK_ORDER_OPERATION_DEFECT`, `WORK_ORDER_OPERATION_LOT`) dan MAINTENANCE
  (`ASSET_COMPONENT_LINK`, `PM_PROCEDURE`, `PM_PROCEDURE_STEP`); field baru `domain_code`, `module_code`; `action` jadi
  string (aksi generik + aksi bisnis per domain, core concept 9); contoh rilis Job Order; open questions baru AU-11
  (PLATFORM tercakup?), AU-12 (arti tiap aksi bisnis PRODUCTION), AU-13 (siapa boleh baca baris `download`).
  `00-1-authorization-permissions.md` (pola per modul menggantikan `foundation:aud:*`), `00-foundation.md` (kosakata aksi
  `audit_view` / `audit_download`), `DOMAINS/FOUNDATION/AGENTS.md`.
- **PRODUCTION (`production-domain`):** `01-planning.md` § Log, `02-monitoring.md` § Log, `03-performance.md` § Heavy
  audit log = view `AUDIT_LOG` per modul (`PLN` / `MON` / `PRF`) dengan aksi dan izinnya; baris `WORK_ORDER_OPERATION_DEFECT`
  tetap menyimpan `entered_by`/`entered_at` + baris audit; dua pertanyaan terbuka di 03-performance (entitas report;
  baris Monitoring di log Performance). `DOMAINS/PRODUCTION/AGENTS.md` aturan 4.
- **PO:** `AGENTS.md` §3/§4, `DOCS/02-domains.md`, glosarium (*Audit trail*, *Audit log*).
- **PRD (repo `prd-molcadx`):** PRD-003 `AUD` (seluruh sistem, izin per modul, AC-11); PRD-004 P-08 ditutup —
  `PLN-011`, `MON-007` jadi 🟢, `PRF-007` 🟡 + R-05.
- **prd-sync:** PRD-003 dan PRD-004 disinkronkan ke `docs-molcadx@171a333` ([prd-molcadx#4](https://github.com/molca-id/prd-molcadx/pull/4)). Open item baru **P-10**: F-14 membatasi `download` ke `AUDIT_LOG`, spec PRODUCTION mencatat download jadwal/report — inkonsistensi, menunggu PO.

---

## 2026-09-25 — Skill baru `prd-sync` (sinkron PRD dari git diff spec)

- **Tipe:** skill + aturan kerja (permintaan PO).
- **Masalah:** sinkron PRD (rule 1b) selama ini mengandalkan changelog (ringkasan tulisan tangan, bisa tidak lengkap)
  atau membaca semua dokumen (terlalu besar, jadi dibaca sekilas — penyebab PRD-003 dulu tertinggal).
- **Skill `.claude/skills/prd-sync/SKILL.md`:** titik sinkron per PRD (baris *Specs synced to* `docs-molcadx@<sha>` di
  README PRD) → `git diff` spec sampai `origin/main` → cocokkan bagian yang berubah ke story di **semua** PRD hidup lewat
  link/anchor dan nama entitas/field/ID → baca penuh hanya bagian spec dan blok story yang kena → edit + rapikan status,
  open items, hitungan, anchor → pindahkan titik sinkron → PR di `prd-molcadx`. Tidak membuat story baru (rule 1);
  perubahan tanpa story dilaporkan ke PO.
- **Diubah:** `AGENTS.md` §5 rule 1b (menunjuk ke skill) dan §6 (daftar skill).
- **PRD (repo `prd-molcadx`):** baris *Specs synced to* ditambahkan di README PRD-003 dan PRD-004.


---

## 2026-09-25 — F-14 Audit Trail: PO menjawab AU-1, AU-2, AU-8

- **AU-1 (resolved):** baris audit disimpan **3 tahun** dari `occurred_at`. Sisa pertanyaan AU-1b: setelah 3 tahun
  dihapus atau diarsip.
- **AU-2 (resolved):** **alasan wajib**. Diterapkan: wajib di setiap `update` / `deactivate` / `reactivate` oleh orang
  (`ui`/`api`) dan sekali per bulk import (disalin ke tiap baris batch); opsional di `create`; kosong untuk
  `source = system`. Simpan tanpa alasan ditolak.
- **AU-8 (resolved):** membaca audit trail butuh izin sendiri `foundation:aud:<scope>:view`, terpisah dari `view`
  record-nya.
- **AU-3 (resolved):** nama tampilan (`actor_display_name`) **disimpan dan tidak pernah dikosongkan**, termasuk saat ada
  permintaan hapus data — baris audit tetap append-only. Dasar hukumnya (UU PDP: kebijakan perusahaan / kontrak kerja)
  dicatat pelanggan saat onboarding. **AU-9** dibahas nanti; **AU-1b** (setelah 3 tahun: hapus atau arsip) terbuka.
- Diubah: `14-audit-trail.md` (open questions, field `reason`, §9.2, next step), `00-1-authorization-permissions.md`.
- **PRD-003 (repo `prd-molcadx`, rule 1b):** `14-audit-trail.md` + aturan lintas story di `20-cross-cutting.md`:
  setiap form ubah/nonaktifkan master data FOUNDATION wajib punya kolom alasan.

---

## 2026-09-25 — FOUNDATION F-14 Audit Trail (`AUD`) (keputusan PO)

- **Tipe:** keputusan PO + spec baru + PRD (rule 1b).
- **Keputusan PO:** FOUNDATION punya audit trail — siapa membuat / mengubah (before → after) / menonaktifkan
  record master data, kapan. **Hanya FOUNDATION** (domain lain tetap punya log sendiri; P-08 PRD-004 tetap
  terbuka). **Modul sendiri** F-14, kode `AUD` — bukan bagian F-12. Taksonomi: Capability "History" di tiap
  Feature master data + Feature "Audit log" (= kotak *Log service* Library Configuration di Figma).
- **Aturan tambahan PO (sesi yang sama):** (1) edit effective-dated (tutup baris lama + buka baris baru) = **satu**
  baris audit yang membawa tanggal berlaku (`effective_from`/`effective_to`); (2) mencakup **semua** penulisan ke
  entitas FOUNDATION dari sumber apa pun, termasuk job milik domain lain (generator `SHIFT_INSTANCE`,
  job kalkulasi `KPI_RESULT` → `source = system`, `actor_type = service`).
- **Spec (`foundation-domain`):** baru `DOMAINS/FOUNDATION/DOCS-EN/14-audit-trail.md` — entitas `AUDIT_LOG`
  (append-only, satu transaksi dengan perubahan, tanpa `delete` — "hapus" di Figma = `deactivate`, unduhan ikut
  dicatat), open questions AU-1…AU-10. Diperbarui: `00-foundation.md` (peta modul, ERD, aksi `download` khusus
  `AUD`), `00-1-authorization-permissions.md` (`foundation:aud:<scope>:view` / `:download`), `12-configuration-service.md`
  (satu rujukan silang), `DOCS-EN/README.md`, `DOMAINS/FOUNDATION/AGENTS.md`.
- **PO:** `AGENTS.md` §2 (F-14 + PRD-003 jadi 14 modul / 54 story), §3, §4 (kode `AUD` + catatan 2026-09-25);
  `DOCS/02-domains.md` (posisi taksonomi `AUD`); `DOCS/01-glossary.md` (Audit trail, Audit log).
- **PRD-003 (repo `prd-molcadx`):** modul baru `14-audit-trail.md`, 4 story `US-FND-AUD-001…004`.
- **Backlog:** layar `SCR-FND-AUD-*` belum dideklarasikan di `UX/` (tunggu AU-8); task breakdown PRD-003 belum
  memuat story `AUD`; `ASSET_STATE_LOG` belum tercakup sampai kepemilikannya jelas (A-5/B5).

---

## 2026-09-24 — Kode modul PRODUCTION: `PLN` / `MON` / `PRF` (keputusan PO, dari Figma)

- **Tipe:** keputusan PO — taksonomi & kode modul. Belum ada PRD PRODUCTION baru (rule 1).
- **Module:** tiga kotak biru Figma "Production" = Production Planning (`PLN`), Production Monitoring
  (`MON`), Production Performance Analysis (`PRF`). Kode lama `SHF`/`OEE`/`JOB` untuk PRODUCTION
  dipensiunkan; ID `US-PROD-SHF/OEE/JOB-*` tetap di PRD-001 beku, tidak dipakai ulang.
- **Feature:** PLN = Job Order · Breaktime · Execution (Product Tracing ditunda — kotak merah, lot hook
  ke Inventory). MON = Dashboard · Live Monitoring · Losses List. PRF = OEE live dashboard · OEE report
  · OEE KPI for Management · OEE Performance — angkanya dari KPI yang dideklarasikan untuk domain
  Production di KPI Selection (F-07 / F-07.1).
- **Capability:** isi tiap kotak Figma; Log = capability lintas Feature per modul; generator
  `SHIFT_INSTANCE` masuk `PLN`.
- **Diubah:** `AGENTS.md` §4 (tabel kode + catatan 2026-09-24), `DOCS/02-domains.md` §"Taksonomi
  platform" (pemetaan PRODUCTION terverifikasi Figma, menggantikan catatan "card codes may lag").
- **PRD-004 PRODUCTION** dimulai di repo `prd-molcadx` (atas permintaan PO): satu PRD per domain, satu file per modul — `PLN` 11, `MON` 7, `PRF` 7 story. Tiap modul bisa diimplementasikan di repo berbeda (kolom *Implementation repo*, `TBD`).
  Didaftarkan di `AGENTS.md` §2. Ditemukan **inkonsistensi nyata** yang diangkat sebagai P-06: F-02 H-2
  (istirahat = planned downtime di `ASSET_STATE_LOG`, mengurangi PBT) vs PRODUCTION 01-planning § Breaktime
  (istirahat dikeluarkan dari POT, bukan planned downtime). **Backlog:** keputusan PO, lalu F-02 atau
  01-planning disesuaikan.

---

## 2026-09-24 — PRD dipindah ke repo terpisah `prd-molcadx`

- **Tipe:** struktur repo (keputusan PO). Tidak ada isi PRD atau spec yang berubah.
- **Alasan:** developer yang ditugaskan implementasi ikut membaca seluruh repo dokumen lewat `AGENTS.md`,
  padahal cukup PRD-nya saja. Sekarang PRD punya repo sendiri dengan pintu masuk khusus implementer.
- **Dipindah:** seluruh `DOCS/prd/` → repo [`prd-molcadx`](https://github.com/molca-id/prd-molcadx)
  (checkout lokal `../prd-molcadx/`, sejajar repo ini): `PRD-001-molcadx-core-q3-en.md` (beku),
  `PRD-003-foundation/` (20 file), `PRD-003-task-breakdown.md`. `DOCS/prd/` dihapus dari repo ini.
- **Link:** link lintas repo diganti URL GitHub — 929 link di PRD ke `docs-molcadx`, 12 link di repo ini ke
  `prd-molcadx`. Link internal antar-file PRD tetap relatif.
- **Aturan baru:** `AGENTS.md` §5 rule **1a** — PRD dibuat & diubah di `../prd-molcadx/`, `DOCS/prd/` tidak
  dibuat ulang; rule 1b menunjuk ke sana. Ikut diperbarui: `AGENTS.md` §1, `DOCS/03-prd-standard.md` §8
  (lokasi file), `.claude/agents/product-owner.md`, skill `prd-pilot`, komentar `scripts/export-doc.sh`.
- **Tetap di repo ini:** `DOCS/03-prd-standard.md` dan `DOCS/templates/prd-template.md` (aturan untuk
  penulis PRD, bukan implementer).
- **Repo:** `molca-id/prd-molcadx` (private) dibuat dan di-push 2026-09-24.

---
## 2026-09-24 — PRODUCTION #32 fix: restore WO entities, lot hook, ISO reliability names

- **Tipe:** ubah (docs-only on `docs/production-figma-en-rewrite` / PR #32).
- **Domain:** PRODUCTION (+ FOUNDATION F-07 / F-07.1 reliability; glossary / PRD link retargets).
- **File terdampak:** `DOMAINS/PRODUCTION/DOCS/01-planning.md` (Entities: `WORK_ORDER` / `WORK_ORDER_OPERATION` / `WORK_ORDER_OPERATION_DEFECT` / `WORK_ORDER_OPERATION_LOT`), `03-performance.md`, `05-work-master.md`, `DOMAINS/PRODUCTION/AGENTS.md`; `DOMAINS/FOUNDATION/DOCS-EN/07-0-kpi-formula.md`, `07-1-kpi-tag-mapping.md`; `DOCS/01-glossary.md`; live link retargets in frozen PRD-001, PRD-003, FOUNDATION FLOW/UX/DOCS-EN; `scripts/check-md-links.py`; this changelog.
- **Perubahan:**
  1. Restored English entity specs dropped when #32 replaced `job-schedule.md` — incl. disposition on actual (T-6), FK → `REJECT_REASON`, and **`origin` = `sensor` | `manual_override`** with `entered_by`/`entered_at` required on override (Silver reject write target).
  2. Q3 **lot hook** child `WORK_ORDER_OPERATION_LOT` (consumed/produced structured `lot_id`, who/when); Inventory owns the lot later — not invented here.
  3. Reliability names: Figma **MTBR → MTTR**; F-07.1 **MTTF** = old "MTBF" gap; **MTBF = MTTR + MTTF** (ISO 22400-2 §5.1.4). Removed "deliberate simplification" wording.
  4. Re-pointed live markdown links/anchors that still aimed at deleted `job-schedule*` / `shopfloor*` / `oee-monitoring*` sections or missing Indonesian anchors on `01`/`02`/`03`.
- **Alasan:** #32 merge blocker (entity spec + dangling anchors); Work 2026-09-24 decisions on sensor SoT, lot hook, ISO reliability triad.
- **Dampak:** Platform Silver reject step has a declared write target; PRD-001/003 links resolve to new Entities headings; no PRODUCTION PRD authored (rule 1).
- **Link check:** `scripts/check-md-links.py` — prod-related broken **141 → 2** (remaining = historical `LOGS/CHANGELOG.md` cites of deleted files); **0 introduced**.

## 2026-09-24 — PRODUCTION: English rewrite from Faris Figma (replaces P-01/P-02/P-03)

- **Domain:** PRODUCTION (`production-domain`).
- **Source:** Faris Figma Production columns + ot-it breaktime note; stacks on `docs/standards-gaps-prd-sync` / PR #31 FOUNDATION fixes.
- **Deleted:** `DOMAINS/PRODUCTION/DOCS/shopfloor.md`, `shopfloor-konsep.md`, `oee-monitoring.md`, `oee-monitoring-konsep.md`, `job-schedule.md`, `job-schedule-konsep.md`, `work-schedule-draft.md`.
- **Added:** `00-overview.md`, `01-planning.md`, `02-monitoring.md`, `03-performance.md`, `04-shift-instance.md`; decision `LOGS/decisions/2026-09-24-production-figma-rewrite.md`.
- **Updated:** `DOMAINS/PRODUCTION/AGENTS.md` (English index), `DOCS/02-domains.md` PRODUCTION blurb, root `AGENTS.md` links.
- **Rules folded in:** KPIs per domain; break/rest ⊂ POT exclusion (never unplanned category); planned DT shrinks PBT; unplanned reduces APT; Part-4 spine Work Master → Directive → Job Order (+ Response).
- **Not a PRODUCTION PRD:** no `DOCS/prd/` PRODUCTION file.
- **Broken-link retarget (path only):** live refs to deleted `shopfloor*` / `oee-monitoring*` / `job-schedule*` / `work-schedule-draft.md` now point at `01-planning` / `02-monitoring` / `03-performance` across glossary, goalsQ3, PRD-001, PRD-003, and FOUNDATION FLOW/UX/DOCS-EN. Deep anchors from the old files are stale — content lives in the new English modules.
- **Agent def:** `.claude/agents/production-domain.md` rewritten English to match.

## 2026-09-23 — Keputusan PO: defect code = reject reason (`QUALITY_DEFECT_CODE` digabung ke `REJECT_REASON`)

- **Tipe:** keputusan PO (menutup Q-18) + spec + UX + FLOW + PRD. Catatan keputusan:
  [`LOGS/decisions/2026-09-23-defect-code-merged-into-reject-reason.md`](decisions/2026-09-23-defect-code-merged-into-reject-reason.md).
- **Yang dipertahankan:** `REJECT_REASON` (F-05) — punya scoping per mesin, tidak license-gated. `QUALITY_DEFECT_CODE`
  (F-08 §9.7) **dipensiunkan**; nomor section tetap.
- **Spec:** F-05 (`REJECT_REASON` = satu-satunya daftar reject/defect; T-1 mencakup W-4; **T-6 baru** = field
  `disposition` scrap/rework, dulu W-9), F-08 (§9.7 retired, W-4/W-9 dipindah, daftar entitas WMS), F-00 (peta +
  prioritas), F-00.1 (baris izin WMS dicoret), F-07 (FK dan disposition menunjuk `REJECT_REASON`/T-6).
- **FLOW/UX/glossary/indeks:** FLOW-02 seed `REJECT_REASON`; FLOW-00 T-1; UX 05 (item sidebar 11 dihapus, `SCR-FND-REF-004`
  juga daftar defect code); UX 08 (`SCR-FND-WMS-005` retired, cakupan); glossary `WORK_ORDER_OPERATION_DEFECT`;
  `FOUNDATION/AGENTS.md` F-08; `AGENTS.md` §2 (50 story hidup, 10 closed) + catatan §4 2026-09-23.
- **PRD-003:** `US-FND-WMS-005` **ditutup** ke `US-FND-REF-002` (dipindah ke `90-closed-stories.md`, ID tidak dipakai
  ulang); `REF-002` = juga daftar defect code + rule disposition (T-6); open items, sidebar, `20-cross-cutting`
  (peta layar, entitas, offline, event), `30-release` (Q-18 resolved, F4 `WMS` (2)), README/00/AGENTS hitungan 50;
  task breakdown `WMS-005` ditandai closed.
- **Tautan saja (tanpa ubah isi):** anchor F-08 §9.7 lama diperbarui di `PRODUCTION/DOCS/job-schedule.md` dan PRD-001 (beku).
- **Backlog lintas domain (rule 6, `production-domain`):** `job-schedule.md`, `job-schedule-konsep.md`,
  `oee-monitoring.md`, `shopfloor.md` masih menyebut `QUALITY_DEFECT_CODE`; `WORK_ORDER_OPERATION_DEFECT.defect_code_id`
  sebaiknya jadi FK ke `REJECT_REASON`.

## 2026-09-23 — Keputusan PO: defect code masuk sidebar Reference data

- **Tipe:** keputusan PO (menjawab TBD entri sebelumnya) + UX + sinkron PRD.
- **Keputusan:** `QUALITY_DEFECT_CODE` (`SCR-FND-WMS-005`, ID tetap) jadi item ke-11 sidebar Reference data.
  Data tetap milik Work Master (F-08) dan **tetap license-gated oleh Production** (tanpa entitlement: terlihat tapi terkunci).
- **Perubahan:** `UX/05-reference.md` (baris 11, TBD diganti catatan keputusan), `UX/08-work-master.md` (baris
  `SCR-FND-WMS-005`), PRD `05-reference-master-data.md` (tabel sidebar baris 11), PRD `08-work-master.md`
  (`US-FND-WMS-005` bagian Screen).
- **Masih terbuka:** Q-18 — kalau defect code dan reject reason ternyata satu entitas, item 4 dan 11 digabung.

## 2026-09-23 — Keputusan PO: sidebar "Reference data" untuk semua daftar pilihan (pick-list)

- **Tipe:** keputusan PO + UX + sinkron PRD (rule 1b).
- **Keputusan:** semua daftar datar yang dipilih layar lain (satuan, konversi waktu, alasan downtime/reject,
  kelas site/area/work center/work unit, kelas & tipe aset) ada di satu grup sidebar **Reference data**,
  urutan tetap 1–10. **Satu tempat edit:** tiap daftar hanya diedit di layar Reference-nya; layar lain
  menampilkannya read-only (+ tautan). Data milik satu item tetap di layar item itu (jam shift site, tab
  cycle time/konversi produk, BOM/routing, penempatan mesin, alasan yang berlaku per mesin).
- **UX:** `05-reference.md` — bagian "Reference data sidebar" (urutan, aturan, yang tidak termasuk);
  perilaku tabel datar + filter kategori + pesan kosong-terfilter dipindah ke `SCR-FND-REF-003`.
  `04-asset.md` — `SCR-FND-AST-004` (reason taxonomy, story closed) **dipensiunkan**; daftar alasan per mesin
  pindah ke form aset `SCR-FND-AST-007`. `00-ux.md` — indeks menyebut sidebar.
- **PRD:** `05-reference-master-data.md` — tabel sidebar (10 layar → story yang membangunnya, termasuk di file
  modul lain); `US-FND-REF-003` layar implementor → form aset `SCR-FND-AST-007`. `20-cross-cutting.md` — baris
  sidebar, `SCR-FND-AST-004` ditandai retired, `US-FND-AST-004` (closed) dihapus dari pembaca `ASSET_CLASS`/`ASSET_TYPE`.
- **Terbuka:** apakah defect code (`QUALITY_DEFECT_CODE`, `SCR-FND-WMS-005`) ikut masuk sidebar (license-gate
  Production + Q-18) — `TBD — PO`; letak persis daftar alasan di form aset — `TBD` UX.

## 2026-09-23 — Cek silang penuh UX FOUNDATION ↔ PRD-003 (rule 1b)

- **Tipe:** sinkron PRD ke UX + koreksi UX. Pemicu: PO menanyakan apakah PRD sudah cocok dengan UX.
- **Metode:** setiap layar `SCR-FND-*` aktif di `UX/0*.md` dicocokkan ke story yang disebut kolom Stories-nya.
  Ditemukan story yang tidak menyebut layarnya sama sekali, plus dua perbedaan perilaku.
- **PRD — layar kini disebut di tiap story:** `SIT-002` (`SCR-FND-SIT-002`), `SIT-003` (`SCR-FND-SIT-003`),
  `SHF-004` (`SCR-FND-SHF-004`), `PRO-001`…`004` (satu halaman detail produk bertab: Measurement / Cycle time /
  Conversion), `WMS-002`/`003`/`005` (`SCR-FND-WMS-002`/`003`/`005`), `SIT-004` (ID layar ditulis lengkap).
- **PRD — perilaku disesuaikan ke UX:** `SIT-002` — tombol Deactivate ada di footer dialog Edit (bukan tombol di
  item); `WMS-002` — versi baru adalah langkah eksplisit yang menutup versi lama; `WMS-003` — ubah cycle time
  meminta konfirmasi "this closes the current record".
- **UX dikoreksi:** `01` Deactivate tidak lagi "disabled/TBD" (UX-SIT-3 resolved 2026-09-22); `05` `SCR-FND-REF-001`
  menunjuk `US-FND-REF-004`, bukan `US-FND-WMS-001` yang sudah closed; `08` "yield/shrink factors" → `scrap_factor`
  sesuai F-08; `08` anchor License Manager yang rusak.
- **Tidak disentuh:** `SCR-FND-KPI-003` (melayani story PRODUCTION), `SCR-FND-WMS-006` (di luar FOUNDATION),
  layar story closed/retired (`AST-004`, `AST-005`, `WMS-001`, `WMS-004`).

## 2026-09-23 — Task breakdown: task untuk perubahan `US-FND-AST-001` / `AST-002` hari ini

- **Tipe:** pembaruan `DOCS/prd/PRD-003-task-breakdown.md`, diminta PO.
- **`US-FND-AST-001`:** 6 task baru (`-31`…`-36`) — schema `ASSET_CLASS` tanpa atribut, layar Reference
  `SCR-FND-REF-009`/`010`, editor atribut di `ASSET_TYPE`, tampilan read-only + tautan di `SCR-FND-AST-007`, tes.
  Ditandai *superseded*: `-01`, `-08`, `-16` — dua di antaranya sudah salah sejak awal (atribut ditaruh di class,
  padahal F-04/PRD menaruhnya di type).
- **`US-FND-AST-002`:** 13 task baru (`-30`…`-42`) — `asset_name` + fallback nama, create tanpa site, search
  tag/nama/serial, form aset di `SCR-FND-AST-007`, Asset Registry (daftar, Table/Diagram, Filter, detail), state
  filtered-empty dan not-found, tes. Ditandai *superseded*: `-02` (dulu mengisi site — salah), `-03`, `-08`.
- Task lama tidak dihapus: dicoret dan menunjuk penggantinya. Indeks `AGENTS.md` §2: 1.376 baris task.

## 2026-09-23 — Task breakdown: task untuk kelas lokasi (`US-FND-SIT-001` + `US-FND-SIT-004`)

- **Tipe:** pembaruan `DOCS/prd/PRD-003-task-breakdown.md`, diminta PO.
- **`US-FND-SIT-001`:** 8 task baru (`-40`…`-47`) — schema FK kelas di keempat node, API picker + validasi level,
  field Class di dialog, rule 8, tes AC-9/AC-10, dan task docs untuk S-5.
- **`US-FND-SIT-004` (baru):** 25 task — schema empat daftar kelas, API list/create/update/deactivate + hitungan
  pemakaian, empat layar Reference `SCR-FND-REF-005`–`008` dan semua state-nya, validasi, ABAC tenant, tes AC-1…AC-6,
  dua event, dua task docs (S-5; boleh-tidaknya menonaktifkan kelas yang masih dipakai).
- **Indeks:** `AGENTS.md` §2 diperbarui ke 1.357 baris task (dihitung ulang) lintas 45 story.
- **Belum dikerjakan:** task untuk perubahan `US-FND-AST-001`/`AST-002` hari ini (layar Reference kelas/tipe aset,
  registrasi di `SCR-FND-AST-007`, `asset_name`).

## 2026-09-23 — PRD `US-FND-AST-002` disinkron ke UX 04 dan F-04

- **Tipe:** sinkron PRD (rule 1b) — tiga celah lama, diminta PO.
- **Perubahan (`DOCS/prd/PRD-003-foundation/04-equipment-taxonomy.md`):**
  - Registrasi/edit mesin → form aset di `SCR-FND-AST-007` (UX 04 memisahkannya dari Asset Registry 2026-09-17);
    pencarian mesin → Asset Registry `SCR-FND-AST-001` (Table/Diagram, search tag/nama/serial, tombol Filter).
  - UX-AST-3 (resolved 2026-09-17): lokasi penempatan tiap mesin kini tampil di daftar; TBD dihapus.
  - `asset_name` (F-04 §9.4, 2026-09-21) ditambahkan ke Writes + batas teks; tampilan pakai fallback
    `ASSET_TYPE.type_name` → `asset_tag`.
  - State baru dari UX 04: kosong-karena-filter beda pesan dari kosong-total; "not found" untuk ID tak dikenal.
  - Open item UX-AST-3 dan "Tree/Diagram search & filter" ditutup; catatan open question `US-FND-AST-003` diperbarui.
- **Verifikasi:** 7/7 AC, 0 tautan rusak; yang hilang hanya teks TBD basi dan tautan keputusan screen-merge yang sudah digantikan.

## 2026-09-23 — UX diselaraskan dengan perubahan hari ini (picker Class, navigasi kelas/tipe aset)

- **Tipe:** pembaruan UX FOUNDATION + sinkron PRD kecil (rule 1b). Diminta PO.
- **`UX/01-site-hierarchy.md`:** field **Class** opsional di dialog Edit/Add semua node (Site, Area, Work Center,
  Work Unit) — field terakhir, hanya kelas aktif level yang sama dari `SCR-FND-REF-005`–`008`, maksimal satu,
  boleh kosong. Sekalian diperbaiki: catatan lama menulis "Code/Name/Type" untuk Work Unit, padahal F-01 §9.6
  menyatakan Work Unit tidak punya Type.
- **`UX/00-ux.md`:** baris indeks `05-reference.md` kini menyebut sumber F-01 §9.7–§9.10 dan F-04 §9.2–§9.3.
- **`UX/04-asset.md`:** baris kelas/tipe di `SCR-FND-AST-007` (read-only) menaut ke manajer Reference-nya.
- **PRD:** `US-FND-SIT-001` — TBD letak picker + open item-nya ditutup. `US-FND-AST-001` dan peta layar diselaraskan
  ke jalur UX: breadcrumb Asset Registry → `SCR-FND-AST-007` → manajer Reference (sebelumnya PRD menulis badge
  langsung ke Reference — keliru, dibetulkan).

## 2026-09-23 — Keputusan PO: pengelola kelas lokasi & kelas/tipe aset pindah ke layar Reference

- **Tipe:** keputusan PO (edit langsung di `UX/05-reference.md`) + pelengkapan + sinkron PRD (rule 1b).
- **Keputusan:** enam layar pengelola baru di Reference, masing-masing entri nav sendiri — site / area /
  work center / work unit class manager dan asset class / asset type manager. Edit kelas & tipe aset **pindah**
  dari `SCR-FND-AST-007` ke Reference.
- **Perubahan:**
  - `UX/05-reference.md`: baris PO dilengkapi — ID `SCR-FND-REF-005`…`010`, tujuan, entitas, state (diambil dari
    F-01 §9.7–§9.10 dan F-04 §9.2–§9.3), catatan cakupan. Entitas tetap milik spec-nya; hanya layarnya di Reference.
  - `UX/04-asset.md`: `SCR-FND-AST-007` kini hanya menampilkan kelas/tipe (read-only); tetap memegang registrasi
    aset & pemetaan kode produk. ID tidak diubah.
  - PRD `US-FND-AST-001`: layar edit → `SCR-FND-REF-009`/`010`; teks lama "Table view `SCR-FND-AST-001` satu-satunya
    tempat edit" (sudah basi sejak split 2026-09-17) diganti; open item tata letak Table dihapus.
  - PRD `US-FND-SIT-004`: layar → `SCR-FND-REF-005`…`008`; TBD "di mana daftar kelas dikelola" ditutup.
  - `20-cross-cutting.md` peta layar: 2 baris baru, baris `SCR-FND-AST-001` tidak lagi mengklaim edit taksonomi.
- **Masih terbuka:** field Class di dialog node belum ada di UX 01; S-5 (nilai kelas); aturan menonaktifkan kelas
  yang masih dipakai. Belum dicek: `US-FND-AST-002` masih menyebut registrasi di `SCR-FND-AST-001` padahal UX 04
  menaruhnya di `SCR-FND-AST-007` (celah sejak 2026-09-17).

## 2026-09-23 — PRD-003 disinkron ke kelas lokasi F-01 (`SITE_CLASS`…`WORK_UNIT_CLASS`) + story baru `US-FND-SIT-004`

- **Tipe:** sinkron PRD (rule 1b) — celah lama, bukan keputusan baru. Diminta PO.
- **Masalah:** F-01 §9.7–§9.10 mendefinisikan empat daftar kelas datar (`SITE_CLASS`, `AREA_CLASS`,
  `WORK_CENTER_CLASS`, `WORK_UNIT_CLASS`) dan field kelas opsional di tiap node (§9.3–§9.6) sejak 2026-08-26,
  tapi tidak ada story PRD yang memakainya.
- **Perubahan (`DOCS/prd/PRD-003-foundation/01-site-hierarchy.md`):**
  - `US-FND-SIT-001`: picker Class opsional di dialog Edit/Add semua level (termasuk work unit), field kelas di
    bagian 5, rule 8 (satu kelas per item, level yang sama, hanya untuk pengelompokan), AC-9, AC-10.
  - **Story baru `US-FND-SIT-004` — Manage the location class lists** (8 bagian lengkap), 🟡 partly blocked.
  - Open items: S-5 (nilai kelas nyata), layar kelas belum ada di UX 01, aturan nonaktif-saat-dipakai belum diputuskan.
  - Hitungan diperbarui: 51 story hidup (README, `00-problem-goals-scope`, `30-release-risks-questions`, `AGENTS.md` §2).
- **Tidak dikarang:** letak picker, layar pengelola kelas, dan boleh-tidaknya menonaktifkan kelas yang masih dipakai
  ditulis `TBD — perlu konfirmasi foundation-domain`.
- **Backlog (`foundation-domain`):** `UX/01-site-hierarchy.md` perlu layar daftar kelas + field Class di dialog node;
  F-01 perlu aturan menonaktifkan kelas yang masih dipakai. Belum ada task breakdown untuk `US-FND-SIT-004`.

## 2026-09-23 — Keputusan PO: `ENTERPRISE_SHIFT.is_production_shift` dihapus, konsep shift non-produksi dibuang

- **Tipe:** keputusan PO + sinkron PRD (rule 1b).
- **Domain:** FOUNDATION (`DOCS-EN/02-shift.md`, `UX/02-shift.md`), PRD-003.
- **Keputusan:** tidak ada lagi pembeda shift produksi vs non-produksi. Setiap shift yang dideklarasikan site
  dihitung ke OEE. Field `is_production_shift` dihapus dari F-02 §9.1 (commit PO `0c0b551`).
- **Perubahan:**
  - F-02 core concept 6 diganti di tempat ("Every declared shift counts") — nomor tidak digeser karena
    dokumen lain merujuk "core concept 7".
  - `UX/02-shift.md`: flag dihapus dari panel Shift dan dialog edit.
  - PRD-003 `US-FND-SHF-001`: kolom flag, syarat flag di rule 6 + TBD override per-site, **AC-7 (dihapus, ID
    tidak dipakai ulang)**, properti event, field di Writes. `US-FND-SHF-002`: edge case pengecualian + kotak
    rumusnya, dan read `ENTERPRISE_SHIFT.is_production_shift`. `20-cross-cutting.md`: peta layar + tabel event.
  - `PRD-003-task-breakdown.md`: T-…-24, -34, -42 ditandai *dropped*; -01, -03, -09, -37 field dilepas.
- **Tidak disentuh:** PRD-001 (beku); catatan sejarah di `99-history.md`.
- **Backlog lintas domain (rule 6 — dirutekan ke `production-domain` lewat PO):**
  `DOMAINS/PRODUCTION/DOCS/oee-monitoring.md` baris ~98 masih mengecualikan shift non-produksi lewat
  `SHIFT_DEFINITION.is_production_shift = false` (nama entitas lama pula) — perlu dihapus/diperbarui oleh
  pemilik domain PRODUCTION.

## 2026-09-23 — PRD-003: selesaikan sisa pass bahasa sederhana (KPI-007/008)

- **Tipe:** keterbacaan PRD — isi tidak berubah.
- **Cek dulu:** diukur per baris di `06-product.md` dan `07-kpi.md` — sisa "gaya kode" hampir seluruhnya nama
  event/nilai tersimpan (memang tetap di backtick). Yang benar-benar belum selesai: blok Calculation
  `US-FND-KPI-007` dan `US-FND-KPI-008` (daftar aturan berbahasa field) dan catatan pembuka KPI-009–012.
- **Perubahan:** ketiganya ditulis ulang dalam bahasa sederhana; aturan asli disimpan kata per kata dalam kotak
  "Exact rules (for developers)". Verifikasi: 0 item hilang, 14/14 ID AC, 0 tautan rusak.

## 2026-09-23 — PRD-003 second pass: bahasa biasa + rumus dipindah ke kotak "for developers" (isi tidak berubah)

- **Tipe:** keterbacaan PRD (lanjutan entri di bawah: pass kedua, mengikuti model `01-site-hierarchy.md` yang
  ditulis ulang PO sebagai contoh).
- **Perubahan:** 13 file modul `DOCS/prd/PRD-003-foundation/` (`01`–`13`):
  - kalimat memakai bahasa biasa di mana-mana **kecuali** bagian 5 (Data & entities) yang tetap memakai nama
    entitas/field persis untuk developer — di bagian lain: *line, station, job, machine stop, connection, tag
    declaration, component list, standard cycle time, defect code*, dst.;
  - **tiap rumus** dijelaskan satu kalimat + contoh berangka; rumus persis (plus sumber variabel sampai nama
    field) dipindah ke kotak lipat `<details>Exact formula (for developers)</details>` tepat di bawahnya —
    tidak ada rumus yang dihapus atau diubah, hanya dipindah (diverifikasi per file);
  - hal yang tetap verbatim: teks UI, ID story, nama event, kode contoh yang diketik user (mis. `FG-1001`,
    `SC-01`, `IM-003`), dan nilai enum yang tampil di layar.
- **Pembagian kerja:** `01` (model oleh PO) · `02`, `03`, `05`, `09`, `10`, `11`, `12` (4 agent paralel) ·
  `04`, `06`, `07`, `08`, `13` (sesi ini, menyelesaikan sisa yang belum tersentuh).
- **Tidak berubah (diverifikasi otomatis per file terhadap versi sebelumnya):** semua ID story identik, jumlah
  AC per file identik, setiap baris isi blok kode/rumus lama masih ada, 0 tautan file rusak di seluruh folder.
  Dua delta kosmetik di file yang ditulis ulang sebelum sesi ini: `01` komentar rumus "for the user" →
  "for the subject" (selaras glossary), `05` baris `good = total − Σ reject` diberi komentar tambahan.
- **Catatan KPI (`07-kpi.md`):** sumber variabel (nama field) tetap bernama dan ikut di dalam kotak rumus,
  karena F-07 mewajibkan rumus menyebut sumber tiap variabel sampai nama field — bukan pelanggaran aturan
  "bahasa biasa"; kotaknya yang menyembunyikannya dari pembaca awam.
- **Backlog lama belum disentuh** (lihat entri di bawah): 6 temuan `US-FND-KPI-007`/`004`, `NTF-002`,
  `REF-006`, `PRO-003`/`004`, `INT-003`, serta keputusan PO soal copy izin UI "IDP-asserted scope claim".

## 2026-09-23 — Blok detail story PRD-003 ditulis ulang agar mudah dipahami (isi tidak berubah)

- **Tipe:** keterbacaan PRD (lanjutan todo PO "bila belum mudah dimengerti minta agent untuk bikin mudah dimengerti").
- **Perubahan:** 50 blok detail story di 13 file modul `DOCS/prd/PRD-003-foundation/`:
  - tiap story dibuka baris **In short** (1–2 kalimat);
  - tabel padat `| Part | Content |` diganti 8 bagian bernomor (1 Story … 8 Metrics & events) — 8 bagian
    wajib `AGENTS.md` §4 tetap lengkap, standar tidak mewajibkan bentuk tabel untuk blok detail;
  - state layar jadi tabel `State | What the user sees`, rumus di blok kode, rules dan AC satu per baris;
  - istilah akses "subject whose IDP-asserted scope claim covers …" → *site access* / *work-unit access* / dst.,
    didefinisikan sekali di **Glossary** baru di `README.md` (plus istilah KPI: OEE, MTTR/MTBF, SKU, WIP).
- **Tidak berubah:** teks UI (pesan error, empty state, pesan izin) kata per kata; semua ID AC, rumus, angka,
  field, event, TBD, dan target tautan — diverifikasi otomatis per file terhadap versi sebelumnya.
- **Koreksi kecil:** label rujukan basi (F-01↔F-04, F-06→F-02, F-02 §7.5→F-08, "§6.3") dan satu rujukan
  `US-FND-WMS-005` yang masih menunjuk PRD-001.
- **Backlog (ditemukan, belum diputuskan):** `US-FND-KPI-007` contoh "four rows, four slots" hanya mencantumkan
  3 binding (F-07.1 §9.4 punya baris ke-4 `reason_match_enrich`); `US-FND-KPI-004` pembulatan 0,7163 × 420
  (300,85 vs 300,83 yang diharapkan AC-3); `US-FND-NTF-002` timer eskalasi dari `delivered_at` sementara contoh
  menghitung dari waktu kirim; `US-FND-REF-006` tidak menghitung referensi `PRODUCT_CYCLE.time_conversion_id`;
  `US-FND-PRO-003`/`004` menaut anchor izin Work Master, bukan Product; `US-FND-INT-003` menyebut "F-09" untuk
  `CONNECTOR_HEALTH` (kemungkinan F-11). Pesan izin UI masih memakai istilah "IDP-asserted scope claim" —
  perlu keputusan PO bila ingin disederhanakan (itu copy produk, bukan hanya dokumen).

## 2026-09-23 — Tautan story PRD-003 diperbaiki untuk Obsidian (heading = ID saja)

- **Tipe:** perbaikan tautan + konvensi penulisan PRD — isi spec tidak berubah.
- **Masalah:** tautan `→ detail` di tabel story gagal di Obsidian ("Unable to find
  `us-fnd-sit-001--build-the-location-hierarchy-for-one-site`"). Obsidian tidak mengenal slug
  gaya GitHub untuk heading yang berisi spasi; GitHub sebaliknya tidak mengenal format `%20` Obsidian.
- **Perbaikan:** 58 heading blok detail di `DOCS/prd/PRD-003-foundation/` diubah dari
  `` #### `US-FND-SIT-001` — Judul `` menjadi `#### US-FND-SIT-001` + judul di baris tebal di bawahnya;
  214 tautan diubah ke `#us-fnd-sit-001`. Obsidian mencocokkan heading tanpa peduli huruf besar/kecil,
  jadi anchor ini jalan di kedua tool. Satu tautan dari `DOCS-EN/01-site-hierarchy.md` ikut diperbarui.
- **Konvensi:** contoh blok detail di `AGENTS.md` §4 dan `DOCS/templates/prd-template.md` disesuaikan —
  heading blok detail **hanya ID**. Format tautan tabel (`#us-xxx-yyy-001`) sudah begitu sejak awal;
  heading-nya yang tidak cocok.
- **Belum diperbaiki (batas Obsidian, lintas repo):** tautan ke heading bagian yang berisi spasi —
  mis. `20-cross-cutting.md#71-screen-map-for-design` dan ~345 tautan ke spec `DOCS-EN/` — tetap jalan di
  GitHub; di Obsidian membuka file tapi tidak melompat ke bagiannya. PRD-001 (beku) tidak disentuh.

## 2026-09-23 — Hapus dokumen usang di `DOCS/prd/`

- **Tipe:** pembersihan repo — tidak ada perubahan isi spec.
- **Dihapus:** `PRD-001-molcadx-core-q3.md` (ID), `PRD-001-molcadx-core-q3.pdf` (ekspor dari versi ID),
  `PRD-002-kpi-product-reference-data.md` (ID), `PRD-002-kpi-product-reference-data-en.md` — keempatnya
  sudah berstatus 🔴 USANG sejak diserap ke PRD-001 v0.2 (2026-08-24), dan
  `PRD-003-foundation-domain-en.md` (stub pengalih setelah PRD-003 dipecah jadi folder, entri di bawah).
  Semua tetap tersedia di git history.
- **Tautan diperbarui:** `AGENTS.md` §2 (baris dokumen usang → 🔴 DIHAPUS), header & footer
  `PRD-001-molcadx-core-q3-en.md` (tautan → teks biasa; isi beku tidak disentuh). Rujukan di entri
  changelog lama dan di `LOGS/decisions/` dibiarkan — itu catatan sejarah.
- **Juga dihapus (konfirmasi PO):** `MolcaDx-Agent-Orchestrator.pptx` di root — tidak dirujuk di mana pun.
- **Tidak dihapus:** draf kerja `*-draft.md` di `DOMAINS/` (masih dirujuk spec aktif).

## 2026-09-23 — PRD-003 dipecah jadi folder + readability pass (isi spec tidak berubah)

- **Tipe:** restrukturisasi & keterbacaan PRD yang sudah ada (rule 1b: merawat, bukan PRD baru).
  Pemicu: todo PO — "buat PRD untuk foundation dan review, bila belum mudah dimengerti minta
  agent untuk bikin mudah dimengerti".
- **Domain:** Product & PRD (PRD-003 FOUNDATION).
- **Perubahan struktur:** `DOCS/prd/PRD-003-foundation-domain-en.md` (2.059 baris) →
  folder [`DOCS/prd/PRD-003-foundation/`](https://github.com/molca-id/prd-molcadx/blob/main/PRD-003-foundation/README.md):
  - `README.md` — ringkasan 1 halaman: status, tabel modul + status per story, urutan build,
    penghambat utama, dependensi ke PRODUCTION.
  - `00-problem-goals-scope.md` (§1–4), `01-`…`13-` satu file per modul (penomoran = F-0x),
    `20-cross-cutting.md` (§7–8), `30-release-risks-questions.md` (§9–11, §14),
    `90-closed-stories.md` (9 ID closed/retired, termasuk Organization), `99-history.md` (§12–13
    + catatan versi dari header lama).
  - File lama dihapus (lihat entri penghapusan di atas); versi satu-file terakhir ada di git history.
- **Perubahan keterbacaan (tiap file modul):** baris **Status** per story (🟢 20 · 🟡 12 · 🔴 8 ·
  🟠 10 = 50) + kolom Status di tabel story; tabel "Open items in this module"; narasi riwayat
  ("Corrected 2026-09-03 …", "was 13, see M3") dipindah ke bagian *Change notes* di akhir file;
  kalimat panjang dipecah. Diverifikasi: 58 blok detail lengkap, set ID AC per story identik
  dengan versi lama, tidak ada identifier kode yang hilang.
- **Koreksi fakta (bukan keputusan baru):**
  - Hitungan story diseragamkan: **50 story hidup** (sebelumnya tertulis 54/48/56/50 di tempat
    berbeda); 12 story di modul konsep (sebelumnya 12/13).
  - Aturan "setiap perubahan wajib masuk PRD-001 juga", risiko F-R-01, F-Q-01, dan aksi §14 #1
    (back-port `FYR` ke PRD-001) dihapus/dipensiunkan — PRD-001 dibekukan 2026-09-03.
  - Q-04 dipakai salah untuk pertanyaan planned downtime (Q-04 = rework dihitung ulang sebagai
    `good_qty`). Sisi shift sudah terjawab (F-02 H-7: `SHIFT_INSTANCE` tidak pernah memotong planned
    downtime); penghambat yang tersisa = **B5** (`ASSET_STATE_LOG` belum punya spec entitas).
  - B1 masih tercatat sebagai blocker di `US-FND-KPI-001`/`004`/`012`, padahal ditutup 2026-09-10/11
    (sync 2026-09-11 hanya menyentuh `SHF-002`) — B1 dihapus, B5 tetap.
  - Out of scope K-4: "30 KPI ISO lain" → **25** (K-4 diperluas 2026-09-10, F-07).
  - `US-FND-KPI-012` AC-6: aritmetika contoh pembanding diperbaiki (180/200 = 90,0%, bukan 95,0%;
    rata-rata naif 92,25%). Hasil yang diharapkan (93,0%) tidak berubah.
  - F-Q-02 ditandai *sebagian terjawab* (B1: generator `SHIFT_INSTANCE` milik `production-domain`;
    kepemilikan daftar hari kerja belum tercatat).
  - ~15 anchor tautan yang sudah rusak sebelum pemecahan diperbaiki; 4 anchor ke bagian Organization
    lama di `90-closed-stories.md` dibiarkan (target sudah tidak ada).
- **Rujukan diperbarui:** `AGENTS.md` §2 (baris PRD-003 + 1 tautan §4), `PRD-003-task-breakdown.md`,
  `DOCS-EN/01-site-hierarchy.md` (1 tautan), `scripts/export-doc.sh` (contoh), 8 tautan anchor di
  PRD-001 (tautan saja, isi beku tidak disentuh).
- **Backlog sinkron (rule 1b) — ditemukan saat review, belum dikerjakan:**
  - `US-FND-AST-002`/`AST-003` masih menganggap **UX-AST-3** terbuka, padahal `UX/04-asset.md`
    menandainya resolved 2026-09-17 (register menampilkan "currently placed at X").
  - `US-FND-AST-002` belum memuat field `asset_name` (F-04 §9.4, keputusan 2026-09-21, UX-AST-6);
    batas teks "name ≤80" tidak punya field tujuan.
  - `US-FND-KPI-011` AC-3 menghitung rate sementara untuk operasi yang masih terbuka, sementara F-07
    menyebut "no data" — perlu keputusan mana yang benar (F-07 menang bila tidak diputuskan lain).
  - `US-FND-KPI-012`: Expectation menaruh `AOET = 0` di state *Anomaly*, Calculation menyebut "no data".
  - `US-FND-KPI-003`: kalimat "subtract infeed from outfeed" terbalik dari rumusnya
    (`total_1 − total_2`, hulu − hilir).
  - `20-cross-cutting.md` §7.3: tabel peran masih memakai kata-kata ROLE/organisasi/kalender yang
    sudah dipensiunkan; NFR baris ~216 masih berbasis peran, bukan klaim scope IDP.
  - Label rujukan basi (mis. "F-04 §7.4" menaut ke F-01, "F-06 §2" menaut ke F-02) di `01-`, `02-`,
    `04-`, `08-` — label saja, tautan benar.

## 2026-09-22 — Keputusan PO: `valid_from`/`valid_to` di `AREA`/`WORK_CENTER`/`WORK_UNIT` dikonfirmasi (resolve UX-SIT-3)

- **Tipe:** keputusan PO yang menutup pertanyaan terbuka UX-SIT-3 — bukan perubahan spec,
  PRD-003 tidak disentuh (PO akan sinkron `US-FND-SIT-002` terpisah).
- **Domain:** FOUNDATION (`DOCS-EN/01-site-hierarchy.md`, `UX/01-site-hierarchy.md`).
- **Keputusan:** ya, field `valid_from`/`valid_to` dibutuhkan dan dipertahankan persis
  seperti yang sudah di-spec di F-01 §9.4–§9.6 untuk `AREA`/`WORK_CENTER`/`WORK_UNIT` — bukan
  warisan buta dari aturan F-00, tapi kebutuhan nyata agar lini/area/stasiun yang di-retire
  hilang dari picker sambil histori tetap utuh (`US-FND-SIT-002`). Ini terpisah dari effective
  dating `ASSET_PLACEMENT` sendiri (aset mana menempati work unit kapan) — tidak disentuh
  keputusan ini. Sisa gap adalah implementasi belum menambahkan kolomnya, bukan spec.
- **Perubahan:**
  - `UX/01-site-hierarchy.md` — catatan ⚠ di dekat "Deactivated nodes" diperbarui, entri
    `UX-SIT-3` di tabel pertanyaan terbuka ditandai resolved (strikethrough, mengikuti gaya
    entri lain).
  - `DOCS-EN/01-site-hierarchy.md` §9.13 — entri baru `S-7` (resolved) mencatat resolusi ini
    untuk keterlacakan, karena §9.13 sebelumnya tidak pernah menandai gap ini sebagai
    pertanyaan terbuka.
- **Backlog sinkron (rule 1b):** PRD-003 `US-FND-SIT-002` perlu disinkron oleh PO untuk
  mencerminkan resolusi ini — tidak disentuh di sesi ini per instruksi PO.
- **Update, sesi yang sama:** backlog di atas ditutup. `US-FND-SIT-002` (PRD-003) —
  banner `BLOCKED` dihapus, diganti catatan "Unblocked 2026-09-22" yang merujuk resolusi
  `UX-SIT-3` di atas; rules & acceptance criteria story ini kini buildable seperti tertulis.

## 2026-09-21 — Keputusan PO: `ASSET` mendapat field `asset_name` sendiri (resolve UX-AST-6)

- **Tipe:** keputusan PO yang menutup pertanyaan terbuka UX-AST-6 (dibuka sesi ini sendiri,
  sama hari) — bukan PRD baru, PRD-003 tidak disentuh (rule 1b: ditandai sebagai backlog
  sinkron di bawah, bukan diedit langsung karena PRD-003 milik PO).
- **Domain:** FOUNDATION (`DOCS-EN/04-asset-ontology.md`, `UX/04-asset.md`).
- **Keputusan:** ya, `ASSET` butuh nama per-instance sendiri — nama turunan
  (`ASSET_TYPE.type_name` → `asset_tag`) yang dipakai Asset Registry bukan jawaban
  permanen. Field baru `asset_name` (F-04 §9.4): opsional, teks bebas, tanpa constraint
  keunikan (beda dari `asset_tag` yang unik per site) — ini label yang dipilih manusia,
  bukan identifier. Saat kosong, fallback nama turunan yang sudah ada tetap berlaku, jadi
  aset yang sudah terdaftar sebelum field ini ada tidak rusak.
- **Perubahan:**
  - `DOCS-EN/04-asset-ontology.md` §9.4 — baris `asset_name` baru. "What's still unknown"
    — baris pertanyaan nama aset ditandai resolved.
  - `UX/04-asset.md` — UX-AST-6 ditandai resolved. **UX-AST-7 baru**: apakah duplikat
    `asset_name` dalam satu site perlu peringatan di form Edit asset, atau memang dibiarkan
    (label, bukan identifier). `SCR-FND-AST-001`'s list row dan detail header, deskripsi
    nama diperbarui dari "derived" jadi "asset_name kalau ada, fallback ke turunan kalau
    tidak" — `SCR-FND-AST-007`'s Edit asset form perlu input `asset_name` baru (belum
    dispesifikasi field-by-field di layar itu, implementor detail).
- **Untuk PO — masih terbuka:** UX-AST-7 (duplikat nama). **Backlog sinkron PRD-003 (rule
  1b):** `US-FND-AST-001`/`US-FND-AST-002` (`04-asset-ontology.md`/`UX/04-asset.md`
  dependensinya) sekarang punya field baru yang PRD-003 belum menyebutnya — perlu ditinjau
  ulang kapan pun PO siap.

## 2026-09-21 — Pertanyaan terbuka baru: apakah `ASSET` butuh field nama sendiri (UX-AST-6)

- **Tipe:** pertanyaan terbuka baru, ditemukan saat meninjau ulang catatan reviewer PR #8
  (`mes-master-data-fe-test`) — bukan PRD baru, bukan keputusan.
- **Domain:** FOUNDATION (`UX/04-asset.md`, `DOCS-EN/04-asset-ontology.md`).
- **Temuan:** nama tampilan `ASSET` di Asset Registry diturunkan dari `ASSET_TYPE.type_name`
  (fallback ke `asset_tag`) karena `ASSET` sendiri tidak punya field nama — konsisten dengan
  F-04 §9.4 yang sudah ada. Yang belum pernah dicatat: penulis implementasi menandai ini
  sebagai kompromi UX nyata, bukan keputusan yang sudah final, dan mencatat butuh perubahan
  skema/API kalau nama per-aset ternyata memang dibutuhkan.
- **Perubahan:**
  - `UX/04-asset.md` — **UX-AST-6 baru**: apakah nama turunan ini bertahan, atau `ASSET`
    butuh `name`/nickname sendiri (dua `ASSET_TYPE` yang sama akan selalu menampilkan label
    yang identik sampai seseorang membaca tag-nya).
  - `DOCS-EN/04-asset-ontology.md` "What's still unknown" — baris penunjuk ke UX-AST-6,
    menegaskan ini pertanyaan berbeda dari `asset_tag` (identifier yang bisa dipindai, sudah
    terjawab) — ini soal label yang manusiawi dibaca.
- **Untuk PO — masih terbuka:** UX-AST-6, tidak memblokir apa pun yang sudah dibangun.

## 2026-09-21 — Keputusan PO: `EQUIPMENT_FLOW` dan `WORK_UNIT_FLOW` entitas berbeda; `WORK_UNIT_FLOW` sekarang dispesifikasi (F-01 §9.12)

- **Tipe:** keputusan PO yang menutup pertanyaan terbuka S-6/UX-SIT-4 dari entri 2026-09-17
  di bawah, plus entitas baru dispesifikasi penuh ke DOCS-EN — bukan PRD baru, PRD-003
  tidak disentuh (story-nya sudah menyebut `WORK_UNIT_FLOW` dengan benar; yang hilang
  hanyalah spesifikasi entitasnya, bukan teks story).
- **Domain:** FOUNDATION (`DOCS-EN/01-site-hierarchy.md`, `DOCS-EN/07-1-kpi-tag-mapping.md`,
  `DOCS-EN/08-work-master.md`, `UX/01-site-hierarchy.md`, `DOCS/01-glossary.md`).
- **Keputusan 1 — entitas berbeda:** `EQUIPMENT_FLOW` (dibackfill 2026-09-17) dan
  `WORK_UNIT_FLOW` (dikutip PRD-003 `US-FND-AST-003`/`US-FND-KPI-003`) **bukan entitas yang
  sama** — rename tidak jadi dilakukan. `EQUIPMENT_FLOW` tetap topologi posisi di dalam
  satu `WORK_CENTER` saja, tanpa peran KPI, diedit dari panel "Line flow"nya sendiri.
  `WORK_UNIT_FLOW` menyambungkan `WORK_UNIT` yang bisa lintas `WORK_CENTER`, dipakai untuk
  peralatan bantu dengan Availability sendiri dan pencarian stasiun tetangga pada kalkulasi
  Quality dua-stasiun — kebutuhan yang secara struktural tidak bisa dipenuhi `EQUIPMENT_FLOW`
  karena `work_center_id`-nya membatasi kedua ujung ke satu work center yang sama.
- **Keputusan 2 — bukan turunan `ROUTING`/`OPERATION`:** sempat dipertimbangkan apakah
  `WORK_UNIT_FLOW` bisa diturunkan dari `OPERATION.step_number` (08-work-master.md §9.1–9.2)
  alih-alih jadi entitas baru — ditolak, karena urutan operasi itu **per-produk** (satu baris
  `ROUTING`), sementara relasi fisik hulu/hilir antar work unit tetap sama untuk produk apa
  pun yang lewat di sana. Dua fakta berbeda, tidak saling menggantikan.
- **Keputusan 3 — kepemilikan:** FOUNDATION memiliki `WORK_UNIT_FLOW` (fakta struktural
  layout pabrik, sama seperti `EQUIPMENT_FLOW`), PRODUCTION hanya membaca untuk kalkulasi
  KPI — pola read/write yang sama dengan `ASSET`/`ASSET_PLACEMENT` dan `ROUTING`/`OPERATION`.
- **Perubahan:**
  - `DOCS-EN/01-site-hierarchy.md` §9.11 — paragraf hipotesis "likely the same" diganti
    dengan penjelasan kenapa keduanya berbeda. **§9.12 baru** — spesifikasi entitas
    `WORK_UNIT_FLOW` penuh (field, kenapa bukan sekadar `EQUIPMENT_FLOW` tanpa
    `work_center_id`, kenapa bukan turunan `ROUTING`/`OPERATION`). Open questions
    bergeser ke §9.13. S-6 ditandai resolved; **S-6a baru** dibuka — belum ada layar
    authoring untuk `WORK_UNIT_FLOW` (panel "Line flow" yang ada hanya mengedit
    `EQUIPMENT_FLOW`).
  - `DOCS-EN/07-1-kpi-tag-mapping.md` — dua kutipan prosa `WORK_UNIT_FLOW` yang sudah ada
    (auxiliary equipment Availability, neighbouring-station Quality) ditaut ke spesifikasi
    baru di F-01 §9.12.
  - `DOCS-EN/08-work-master.md` §9.2 — catatan singkat di baris `step_number`, menegaskan
    itu bukan `WORK_UNIT_FLOW` (per-produk vs fakta fisik tetap) sebelum pembaca
    menyimpulkan sendiri seperti yang sempat terjadi di sesi ini.
  - `UX/01-site-hierarchy.md` UX-SIT-4 ditandai resolved dengan kesimpulan yang sama,
    anchor diperbarui ke §9.12.
  - `DOCS/01-glossary.md` — entri `Equipment flow` diberi catatan silang "bukan
    `WORK_UNIT_FLOW`"; entri **Work unit flow (`WORK_UNIT_FLOW`)** ditambahkan, menaut ke
    F-01 §9.12.
- **Untuk PO — masih terbuka:** S-6a (siapa membangun layar authoring `WORK_UNIT_FLOW`,
  dan di mana) — tidak memblokir `08-work-master.md`/`07-1-kpi-tag-mapping.md` yang hanya
  membaca entitasnya, tapi PRD-003 (`US-FND-AST-003`, `US-FND-KPI-003`) kini merujuk
  entitas yang benar-benar ada dan bisa ditinjau ulang kapan pun PO siap (rule 1b, belum
  dilakukan sesi ini karena PRD-003 milik PO).

## 2026-09-17 — Asset dan Asset Placement UX digabung jadi satu layar Asset Registry; line topology pindah ke Site Hierarchy

- **Tipe:** update UX (2 dokumen) + entitas baru dibackfill ke DOCS-EN (1) + glossary (1) —
  bukan PRD baru.
- **Domain:** FOUNDATION (`UX/04-asset.md`, `UX/01-site-hierarchy.md`,
  `DOCS-EN/01-site-hierarchy.md`, `DOCS/01-glossary.md`).
- **Kenapa:** implementasi layar yang sudah berjalan (bukan usulan) menggabungkan browsing
  aset dan riwayat penempatan menjadi satu alur berpusat-aset, dan memindahkan topologi
  posisi lini ke panel Site Hierarchy — dokumen UX perlu menyusul kenyataan ini, bukan
  sebaliknya.
- **Perubahan:**
  - `UX/04-asset.md` — `SCR-FND-AST-001` kini **Asset Registry**: satu baris per unit
    Equipment (bukan pohon `ASSET_CLASS → ASSET_TYPE → ASSET`), mode Table/Diagram
    (mode Tree dihapus), pencarian tag/nama/serial, satu modal Filter (kelas, status,
    penempatan), dan halaman detail dua tab (Hierarchy & components / Placement
    history). Nama aset yang ditampilkan diturunkan dari `ASSET_TYPE.type_name` (fallback
    ke tag) karena `ASSET` sendiri tidak punya field nama — konsisten dengan F-04 §9.4
    yang sudah ada, bukan perubahan model. Otoritas Class/Type kembali jadi layar
    tersendiri dengan **ID baru** `SCR-FND-AST-007` (`SCR-FND-AST-002` tetap pensiun,
    tidak dipakai ulang, sesuai aturan permanensi ID). `SCR-FND-AST-003` (riwayat
    penempatan) tidak berubah bentuk tapi kehilangan entri navigasi utamanya — aksi
    place/swap kini juga bisa dimulai dari detail Asset Registry, memakai mutation dan
    alur konfirmasi swap (409) yang sama. `SCR-FND-AST-004` (Downtime/Reject Reason)
    kini tabel datar dengan filter kategori, bukan kartu per kategori. Ditandai bahwa
    pohon komponen di tab Hierarchy belum menampilkan riwayat penggantian komponen —
    data itu memang belum ada di `ASSET` (entitasnya milik domain Maintenance).
  - `UX/01-site-hierarchy.md` — node `WORK_CENTER` di `SCR-FND-SIT-002` mendapat bagian
    baru **Line flow** (diagram rantai + tabel edge from/to, dibatasi ke Work Unit milik
    work center itu sendiri, menolak self-loop dan edge duplikat) menggantikan layar CRUD
    berdiri sendiri yang sebelumnya membolehkan Work Unit lintas work center tanpa
    pembatasan — layar lama itu resmi dipensiunkan. Node `WORK_UNIT` kini menampilkan
    timeline penempatan lengkap (bukan cuma ringkasan + tautan keluar). Node `AREA` kini
    menjelaskan bahwa pengaturan shift/fiscal ada di level `SITE`, menggantikan panel
    kosong yang terbaca seperti masih loading.
  - `DOCS-EN/01-site-hierarchy.md` — entitas `EQUIPMENT_FLOW` (§9.11, baru) dibackfill:
    ditemukan sudah berjalan di implementasi tanpa spesifikasi FOUNDATION sebelumnya.
    Kemungkinan entitas yang sama dengan `WORK_UNIT_FLOW` yang sudah dikutip dua story
    PRD-003 (`US-FND-AST-003`, `US-FND-KPI-003`) tanpa pernah dispesifikasikan — dicatat
    sebagai S-6, belum diputuskan mana nama yang bertahan.
  - `DOCS/01-glossary.md` — entri baru **Equipment flow (`EQUIPMENT_FLOW`)**.
- **Untuk PO — story PRD-003 yang perlu ditinjau ulang (rule 1b, tidak diedit di sesi
  ini karena PRD-003 milik PO):** `US-FND-AST-001`, `US-FND-AST-002`, `US-FND-AST-003`
  masih merujuk keputusan merge 2026-09-04 yang sekarang sebagian digantikan (screen
  Table-view-sebagai-taxonomy-editor sudah tidak akurat; `UX-AST-3` yang dulu open kini
  resolved). `US-FND-AST-003`/`US-FND-KPI-003` juga menyebut `WORK_UNIT_FLOW` yang
  kemungkinan sama dengan `EQUIPMENT_FLOW` yang baru dibackfill — perlu konfirmasi PO
  sebelum disinkronkan.

## 2026-09-12 — Sinkron PRD-003 (rule 1b): state "No entitlement" ditambahkan ke 3 story WMS

- **Tipe:** sinkronisasi PRD (rule 1b) — ditemukan lewat `prd-pilot`, bukan story baru.
- **Domain:** PRD-003, modul `WMS`.
- **Kenapa:** PO bertanya langsung apakah keputusan license-gate Work Master (sesi yang sama)
  perlu dicek terhadap PRD, lalu diminta ditulis-ulang-dan-dibandingkan. `prd-pilot` dijalankan
  terhadap modul `WMS` FOUNDATION dan mengonfirmasi: **belum tersinkron** — ketiga story nyata
  (`US-FND-WMS-002`/`003`/`005`) hanya punya state "No permission" (ABAC), tidak ada state
  license-gate sama sekali, padahal `UX/08-work-master.md` sudah menyatakan Work Master
  di-gate Production sejak commit sebelumnya di sesi ini.
- **Perubahan:** `US-FND-WMS-002`, `US-FND-WMS-003`, `US-FND-WMS-005` — masing-masing dapat
  state baru "No entitlement (license-gate, Production)" di Expectation, ditegaskan berbeda
  dari "No permission" (ABAC), plus satu AC baru per story. §13.8 baru mencatat sinkronisasi
  ini; sel Version/Date header diperbarui.
- **Temuan lain dari `prd-pilot` (tidak ditindaklanjuti, sudah ada sebelumnya):** tidak ada
  inkonsistensi nyata antara dokumen dan PRD selain gap license-gate di atas; TBD lama (W-8
  version-lock, P-1 scope, W-9 disposition, W-4 daftar defect code) cocok di kedua sisi —
  bukan gap baru.

## 2026-09-12 — Deklarasikan license-gate check di FLOW/UX; perbaiki anchor JS-1 yang basi

- **Tipe:** dokumen baru (FLOW pertama PLATFORM) + update UX yang sudah ada — bukan entitas
  baru, bukan PRD baru.
- **Domain:** PLATFORM (FLOW-01 baru) + FOUNDATION (`UX/08-work-master.md`, catatan state).
- **Kenapa:** keputusan sesi sebelumnya (Work Master di-gate Production) perlu punya tempat
  nyata di FLOW/UX, bukan cuma di dokumen konsep PLT-01 — PO bertanya langsung apakah ini akan
  dideklarasikan di FLOW/UX.
- **Perubahan:**
  - `DOMAINS/PLATFORM/FLOW/01-module-entitlement-check.md` (baru) — flow generik: layar mana
    pun yang di-gate lisensi (di domain manapun) mengecek `TENANT_DOMAIN_ENTITLEMENT` terhadap
    domain gate-nya; Module-level → visible-but-locked, Feature-level → hidden (PLT-01 core
    concept 3). Didaftarkan sebagai FLOW pertama PLATFORM di `PLATFORM/AGENTS.md` §2 dan
    `DOCS-EN/README.md`.
  - `DOMAINS/FOUNDATION/UX/08-work-master.md` — catatan baru: `SCR-FND-WMS-001/002/003/005`
    di-gate Production, state "No entitlement" (visible-but-locked) ditambahkan, mengutip
    FLOW-01 alih-alih menggambar ulang di tiap baris layar. Ditegaskan beda dari state "No
    permission" yang sudah ada (itu soal ABAC scope, ini soal lisensi domain — dua gate
    berbeda).
  - Sekalian diperbaiki: anchor `UX-WMS-1` di dokumen yang sama masih menunjuk ke
    `job-schedule.md` sebagai "pertanyaan terbuka", padahal JS-1 sudah ditutup sesi sebelumnya
    — anchor dan teksnya diperbarui jadi "resolved."
- **Sengaja tidak dikerjakan sesi ini:** `scope_ref`-level (per-baris) locking UI (FL-2 di
  FLOW-01) dan apakah entitlement dicek sekali per navigasi atau live (FL-1) — keduanya `TBD`,
  butuh keputusan PO + `engineering-domain`/`design-domain` sebelum bisa didesain.

## 2026-09-12 — License gate bisa beda dari pemilik data: Work Master (FOUNDATION) di-gate oleh Production

- **Tipe:** koreksi/perluasan model PLATFORM License Manager (PLT-01) — bukan entitas baru,
  bukan PRD baru.
- **Domain:** PLATFORM (PLT-01) + FOUNDATION (F-08, catatan penunjuk saja).
- **Kenapa:** PO menunjukkan kasus nyata — Work Master (`ROUTING`/`OPERATION`/`BOM`) dimiliki
  FOUNDATION, tapi tidak berguna sama sekali untuk tenant yang tidak berlangganan domain
  Production (tidak ada yang perlu di-routing/di-BOM-kan). Klaim lama di PLT-01 ("FOUNDATION
  selalu dibundel, titik") ternyata terlalu luas — perlu dipisah dua pertanyaan: **siapa
  pemilik data** (tetap FOUNDATION, tidak berubah) vs **domain mana yang menjadi gate lisensi**
  (bisa domain lain, kalau modul itu memang hanya berguna untuk domain itu).
- **Keputusan:** Work Master (`WMS`) tetap data FOUNDATION, tapi **gate lisensinya adalah
  PRODUCTION** — License Manager mengecek entitlement tenant terhadap `domain_code =
  PRODUCTION`, bukan FOUNDATION, sebelum menampilkan layar Work Master.
- **Perubahan:** `DOMAINS/PLATFORM/DOCS-EN/01-license-manager.md` — core concept 5 direvisi
  (FOUNDATION *sebagai keseluruhan* tidak pernah jadi grant target, tapi modul FOUNDATION
  individual bisa tetap di-gate domain lain); tabel baru "Module license-gate ≠ data
  ownership" mengklasifikasi modul FOUNDATION lain: `SIT`/`SHF`/`FYR`/`AST`/`REF`/`PRO`
  universal (tanpa gate), `WMS` di-gate Production (diputuskan), `KPI` sengaja ditandai `TBD`
  (sekarang mencakup KPI Production/Maintenance/Quality/Inventory — kemungkinan butuh gate
  per-KPI, bukan per-modul, begitu domain-domain itu benar-benar dibuat), `WFE`/`NTF`/`INT`/
  `CFG`/`DSR` sementara universal (infrastruktur lintas-domain, keyakinan lebih rendah).
  `DOMAINS/FOUNDATION/DOCS-EN/08-work-master.md` — catatan penunjuk ke keputusan ini, supaya
  pembaca F-08 tidak berasumsi "FOUNDATION memiliki ini = semua tenant selalu melihatnya."
- **Sengaja tidak diputuskan sesi ini:** klasifikasi gate untuk `KPI` (butuh domain Quality/
  Inventory/Maintenance benar-benar ada dulu dengan story KPI sendiri sebelum bisa diputuskan
  granularitasnya); apakah `WFE`/`NTF`/`INT`/`CFG`/`DSR` benar-benar selalu universal atau ada
  kasus tepi — ditandai keyakinan rendah, bukan fakta final.

## 2026-09-12 — JS-1 ditutup: MolcaDx jalur utama pembuatan `WORK_ORDER`, ERP tetap kemungkinan masa depan

- **Tipe:** menutup open question lama (JS-1/W-1/B4), keputusan PO langsung — bukan PRD baru,
  bukan entitas baru.
- **Domain:** PRODUCTION (`job-schedule.md` §2.3, §3, §10).
- **Kenapa:** JS-1 sudah lama menunggu jawaban ("apakah WO dari ERP, manual, atau campuran")
  dan ditandai 🔴 karena "menentukan ukuran modul" — dibahas sambil meninjau Work Master
  Production, PO menjawab langsung.
- **Keputusan:** MolcaDx adalah **jalur utama** pembuatan `WORK_ORDER` — planner membuat WO
  manual di MolcaDx, semua field §2.1 diisi manual. Koneksi ke ERP **tetap kemungkinan di masa
  depan**, bukan campuran yang harus didukung sejak awal — `source_system` tetap string
  nullable seperti sekarang (bukan enum wajib), keunikan `wo_number` lintas ERP tetap `TBD`
  sampai jalur ERP itu benar-benar mulai dibangun.
- **Perubahan:** `DOMAINS/PRODUCTION/DOCS/job-schedule.md` §2.3 (ditulis ulang jadi resolved,
  bukan open question), §3 tahap 1 alur penjadwalan (planner/MolcaDx, bukan `TBD`), §10 JS-1
  ditandai selesai.
- **Tidak disentuh:** PRD-001 (beku, tidak disinkronkan lagi per keputusan PO 2026-09-03) —
  `US-PROD-JOB-*` di sana tidak diedit. Belum ada PRD aktif untuk Job Schedule yang perlu
  sinkron rule 1b.
- **Terpisah, dibahas sesi yang sama tapi belum diputuskan:** W-8 (routing/BOM version-lock)
  sengaja ditunda atas permintaan PO ("ignore the lock for now"); P-1 (scope akses
  `PRODUCT`/`PRODUCT_DETAIL` — tenant-wide vs per-enterprise) dijelaskan ke PO, belum
  diputuskan, default permisif (tenant-scope) tetap berlaku sampai ada keputusan.

## 2026-09-12 — Tambah modul Work Master (`PM_PROCEDURE`) ke MAINTENANCE

- **Tipe:** dokumen baru dalam domain yang sudah ada (bukan domain baru, bukan PRD baru) —
  mengisi salah satu gap yang ditemukan diagram IEC 62264 Work Master/Schedule/Request/Job
  Order/Directive per domain MOM yang PO bagikan.
- **Domain:** MAINTENANCE (M-02 baru) + indeks lintas-domain (`AGENTS.md` §4 kode modul).
- **Kenapa:** diagram menunjukkan setiap domain MOM (Production/Maintenance/Quality/Inventory)
  seharusnya punya rantai Work Master sendiri — Production sudah punya (`ROUTING`/`OPERATION`/
  `BOM`, F-08 FOUNDATION); MAINTENANCE belum punya sama sekali (cuma `ASSET_COMPONENT_LINK`).
  Quality dan Inventory belum dibuat sebagai domain, jadi tidak diberi entitas — hanya
  Production dan Maintenance yang bisa dikerjakan sekarang.
- **Perubahan:** `DOMAINS/MAINTENANCE/DOCS-EN/02-work-master.md` (baru) — `PM_PROCEDURE`
  (checklist PM per `ASSET_TYPE`, bukan per work center) + `PM_PROCEDURE_STEP` (langkah,
  estimasi durasi, tool/part `TBD` — belum ada entitas tool/part di manapun). Sengaja **tidak**
  meniru bentuk `ROUTING`/`OPERATION` — PM procedure tidak disequence lintas work center dan
  estimasi durasinya bukan input OEE, beda alasan dari `cycle_time_value`. Terdaftar di
  `MAINTENANCE/AGENTS.md` §2 (M-02) dan `DOCS-EN/README.md`; dokumen masa depan yang lama
  (`02-work-order.md`, `03-reliability.md`) diganti nomor jadi `03-work-order.md`/
  `04-reliability.md` supaya tidak bentrok nomor dengan M-02 baru. Kode modul `WMS`
  didaftarkan **dipakai bersama** FOUNDATION dan MAINTENANCE di `AGENTS.md` §4, pola yang sama
  dengan `AST`/`SHF` — dua entitas berbeda (resep produksi vs checklist perawatan), bukan satu
  bentuk digeneralisasi.
- **Sengaja tidak dikerjakan sesi ini:** rantai Work Schedule/Request/Job Order/Directive
  Maintenance (dispatch `PM_PROCEDURE` ke `ASSET` nyata) — modul terpisah, lebih besar,
  ditandai `03-work-order.md`, belum dimodelkan. Quality dan Inventory tidak diberi Work
  Master karena domainnya sendiri belum dibuat — perlu keputusan PO eksplisit dulu untuk
  membuat domainnya (skill `molca-domain-agent`) sebelum entitasnya bisa ditulis.

## 2026-09-11 — Sinkron PRD-003 (rule 1b): `US-FND-SHF-002` mengikuti penutupan B1

- **Tipe:** sinkronisasi PRD (rule 1b) — bukan story baru. Menutup gap yang ditemukan saat PO
  bertanya apakah PRD-003 perlu diperbarui setelah perubahan sesi ini ke FOUNDATION/FLOW.
- **Domain:** PRD-003, modul `SHF`.
- **Kenapa:** [B1](decisions/2026-09-10-b1-shift-instance-generator-owner.md) ditutup
  2026-09-10 (kepemilikan generator `SHIFT_INSTANCE` → `production-domain`, F-02 kembali
  `ACTIVE`), tapi `US-FND-SHF-002` — story yang **adalah** generator itu sendiri — masih
  membawa banner lama "jangan mulai implementasi sampai PO konfirmasi kepemilikan," ditulis
  saat B1 masih terbuka (2026-09-03). Dicek eksplisit, bukan diasumsikan: `TENANT`'s
  `keycloak_org_id` (keputusan terpisah, sama batch) **tidak** menyentuh story PRD-003 mana
  pun — tidak ada story dalam cakupan ini yang membaca/menulis field `TENANT`.
- **Perubahan:** `US-FND-SHF-002` — banner blocking dihapus, Context & Calculation diperbarui
  dari "asumsi kerja" jadi kepemilikan terkonfirmasi; §13.7 baru mencatat sinkronisasi ini;
  sel Version/Date di header ditambah catatan.
- **Commit:** percobaan memisahkan commit ini dari pekerjaan KPI sesi paralel di `PRD-003`
  gagal — file itu ternyata sudah "modified" (belum di-commit) sejak sebelum sesi ini mulai
  (temuan `US-FND-KPI-008`, sesi 2026-09-08), jadi tidak ada baseline `HEAD` yang bisa
  dipercaya untuk memisahkan "punyaku" dari "sudah ada duluan" dari "sesi paralel." Di-commit
  sebagai satu commit gabungan (`docs(prd): sync PRD-003...`) yang mencakup ketiganya apa
  adanya, bukan diam-diam — lebih jujur daripada rekonstruksi yang tidak bisa diverifikasi.

## 2026-09-11 — `TENANT` sudah ada di FOUNDATION; hubungan dengan Keycloak diputuskan (PLT-01 A-2 ditutup)

- **Tipe:** keputusan arsitektur ([`LOGS/decisions/2026-09-11-tenant-keycloak-organizations.md`](decisions/2026-09-11-tenant-keycloak-organizations.md))
  + koreksi cakupan PLATFORM/FOUNDATION.
- **Domain:** FOUNDATION (F-01, field baru) + PLATFORM (PLT-01, PLT-00, `AGENTS.md`) + glossary.
- **Kenapa:** PLT-01 A-2 menanyakan apakah `TENANT` sudah ada — dicek langsung ke kode/dokumen
  (bukan diasumsikan): **sudah**, `TENANT` dispesifikasi penuh di
  [F-01 §9.1](../DOMAINS/FOUNDATION/DOCS-EN/01-site-hierarchy.md#91-tenant--ownershipisolation-layer)
  sejak sebelum sesi ini. Jawaban PO "belum diputuskan" untuk A-2 sebenarnya soal pertanyaan
  yang lebih tajam — hubungan `TENANT` FOUNDATION dengan konsep tenant di Keycloak — bukan
  soal apakah entitasnya ada sama sekali.
- **Keputusan:** tenant di MolcaDx dimodelkan lewat **Keycloak Organizations** (bukan
  realm-per-tenant, bukan atribut custom polos) karena cocok dengan kontrak ABAC satu-realm
  yang sudah berjalan (F-00.1). `TENANT` FOUNDATION tetap record bisnis; field baru
  `keycloak_org_id` jadi pointer ke Organization Keycloak-nya — identitas/SSO di Keycloak,
  data bisnis di FOUNDATION, pola yang sama dengan Organization/roles (2026-08-24).
- **Perubahan:** `DOMAINS/FOUNDATION/DOCS-EN/01-site-hierarchy.md` §9.1 (`keycloak_org_id`
  ditambahkan ke `TENANT`); `DOMAINS/PLATFORM/DOCS-EN/01-license-manager.md` (A-2 ditutup,
  §9 entity spec `TENANT_DOMAIN_ENTITLEMENT.tenant_id` FK ke `TENANT` FOUNDATION, bukan lagi
  diblokir), `DOCS-EN/00-platform.md`, `PLATFORM/AGENTS.md` (interface & done-when
  diperbarui); `DOCS/01-glossary.md` (istilah Tenant diperbarui, tidak lagi `TBD`).
- **Sengaja tidak diputuskan sesi ini:** urutan provisioning (Keycloak Organization dibuat
  duluan atau `TENANT` FOUNDATION duluan) — `TBD`, belum mendesak sampai ada onboarding
  tenant nyata; mekanisme sinkronisasi kedua sisi.

## 2026-09-10 — Buat domain PLATFORM, beri rumah untuk License Manager (goalsQ3 Q3-7)

- **Tipe:** domain baru (skill `molca-domain-agent`, PO eksplisit), lanjutan dari sesi grill
  packaging/licensing hari ini.
- **Domain:** PLATFORM (baru) + indeks lintas-domain (`AGENTS.md`, `DOCS/02-domains.md`,
  `DOCS/01-glossary.md`, `DOCS/goalsQ3.md`).
- **Kenapa:** sesi grill (`grill-with-docs`) menetapkan bahwa **Domain juga unit jual/lisensi**
  MolcaDx — tenant bisa membeli sebagian domain, FOUNDATION selalu dibundel. Ini langsung
  menyisakan pertanyaan tak terjawab: siapa mengelola domain apa saja yang dibeli satu tenant,
  dan di mana halaman "superadmin" untuk itu didokumentasikan. `DOCS/goalsQ3.md` Q3-7 sudah
  lama mencatat License Manager tanpa domain — sesi ini menutup separuh itu.
- **Domain baru `DOMAINS/PLATFORM/`:** pola *full* (`DOCS-EN/` + `UX/`, meniru MAINTENANCE).
  `DOCS-EN/00-platform.md` (peta domain: administrasi lintas-tenant sisi vendor, **bukan**
  domain MOM, **bukan** dijual ke tenant — beda dari FOUNDATION yang dibundel dan domain MOM
  yang dilisensikan), `DOCS-EN/01-license-manager.md` (konsep License Manager, entitas
  entitlement tenant↔domain — sengaja `TBD`, lihat A-1 s/d A-5), `UX/01-license-manager.md`
  (`SCR-PLT-LIC-001`, halaman superadmin — state provisional, belum didesain), agent
  `.claude/agents/platform-domain.md`.
- **Terminologi disiplinkan (lanjutan grill):** "superadmin" ditetapkan sebagai tingkat izin
  akses (Permission), bukan nama domain atau peran lain — dicatat di `CONTEXT.md`,
  `DOCS/01-glossary.md`, dan domain map PLATFORM sendiri supaya tidak melebar lagi.
- **Indeks:** `AGENTS.md` §1/§2/§3 (PLATFORM terdaftar aktif), `DOCS/02-domains.md` (detail +
  diagram ketergantungan — PLATFORM digambar terpisah dari rantai FOUNDATION→PRODUCTION,
  lintas-tenant, bukan "di atas/di bawah"), `DOCS/01-glossary.md` (istilah baru: PLATFORM,
  License Manager, Superadmin, Tenant; entri Domain lama diperbarui), `DOCS/goalsQ3.md`
  (Q3-7 dipecah — License Manager selesai, Work Improvement tetap terbuka; tabel modul &
  §6.3 celah cakupan disinkronkan).
- **Sengaja tidak dikerjakan sesi ini (`TBD`, tercatat eksplisit, bukan diasumsikan):**
  bentuk entitas entitlement tenant↔domain (A-1), apakah `TENANT` sudah ada sebagai entitas
  formal di tempat lain (A-2), perilaku runtime saat tenant tidak berlisensi — hidden/disabled/
  locked (A-3, separuh Q3-7 yang belum terjawab), apakah grant bisa parsial per-modul (A-4),
  tingkat izin di dalam "superadmin" itu sendiri (A-5). Domain Work Improvement (separuh lain
  Q3-7) juga tidak disentuh — beda kebutuhan, tidak terkait PLATFORM.

## 2026-09-10 — Production order scope KPI: `KPI_RESULT.aggregation_level` dapat nilai `work_order`, Fall-off ratio + 4 rasio lain terbuka

- **Tipe:** resolusi TBD-PO (bukan story baru) — menutup gap `aggregation_level` yang menahan Fall-off ratio dan Production-order-scope Throughput rate/Production process ratio/Scrap ratio/Rework ratio.
- **Domain:** FOUNDATION, `DOCS-EN/07-0-kpi-formula.md` + `07-1-kpi-tag-mapping.md`.
- **Keputusan PO:** level agregasi order diselesaikan **per domain pemilik**, bukan konsep `WORK_ORDER` global. Hari ini hanya PRODUCTION punya konsep Job Order (`WORK_ORDER`, dipindah dari FOUNDATION 2026-09-03). Sesi ini hanya membuka gap KPI memakai `WORK_ORDER` PRODUCTION yang sudah ada — **tidak** merancang bentuk Job Order Maintenance/Quality/Inventory (belum ada domainnya).
- **Perubahan:**
  - `KPI_RESULT.aggregation_level` (`07-1` §9.5) bertambah nilai `work_order`, resolve ke `WORK_ORDER.work_order_id` (PRODUCTION, [job-schedule.md §2.1](../DOMAINS/PRODUCTION/DOCS/job-schedule.md#21-work_order--rencana-jadi-transaksi)). Catatan forward-looking (bukan spec): saat Maintenance/Quality/Inventory dapat konsep Job Order sendiri, `aggregation_level` butuh domain-qualifier — tidak dirancang sesi ini.
  - **Diadopsi (Production order scope, `sum_of_terms` rollup lintas `WORK_ORDER_OPERATION` per `work_order_id`):** Throughput rate, Production process ratio, Scrap ratio, Rework ratio — variabel sudah ada, hanya level agregasinya yang kurang.
  - **Diadopsi (KPI baru, Production order scope saja):** Fall-off ratio — diverifikasi ulang: "produced quantity at first operation" dan "good quantity at current operation" sama-sama resolve ke field `WORK_ORDER_OPERATION` yang sudah ada (`good_qty`/`scrap_qty`/`rework_qty` via `OPERATION.step_number` untuk operasi pertama). Formula + contoh berangka di `07-1` §"Production order scope (2026-09-10, PO decision)".
  - Tabel "Deferred ISO 22400-2 KPIs" (`07-0`): baris Fall-off ratio ditandai selesai (dicoret, bukan dihapus — riwayat tetap ada); baris defect-type breakdown **tidak diubah** (gap terpisah).
  - Roadmap table, MOM-domain catalog table, scope table intro (`07-0`) diperbarui mengikuti (angka KPI ✅ 8→9).
- **Sengaja tidak diselesaikan sesi ini (TBD-PO tetap terbuka):** Equipment load ratio (field kapasitas), MTTF (model data Maintenance), dan pertanyaan Defect type scope untuk OEE/NEE/Effectiveness/Quality ratio — ketiganya tidak disentuh.
- **Backlog rule 1b:** `DOCS/prd/PRD-003-foundation-domain-en.md` — `US-FND-KPI-009`–`012` (Scrap/Rework ratio, Throughput rate, Production process ratio) sekarang juga punya opsi Production order scope yang belum tercermin di Data & entities/AC story-nya; Fall-off ratio belum punya story sama sekali (KPI baru). **Belum disinkron sesi ini** — PO perlu memutuskan apakah Fall-off ratio jadi story baru (`US-FND-KPI-013`?) sebelum ditulis, karena rule 1 melarang PRD baru tanpa permintaan eksplisit.

## 2026-09-10 — B1 ditutup: `production-domain` memiliki generator `SHIFT_INSTANCE`, F-02 kembali `ACTIVE`

- **Tipe:** menutup blocker terbuka ([B1](decisions/2026-09-03-foundation-contest-blockers.md#b1--generator-shift_instance-tidak-berpemilik-f-02-h-6),
  2026-09-03) — keputusan kepemilikan PO, bukan PRD baru.
- **Domain:** FOUNDATION (F-02, revert status) + PRODUCTION (cakupan baru) + indeks keputusan.
- **Keputusan:** [`LOGS/decisions/2026-09-10-b1-shift-instance-generator-owner.md`](decisions/2026-09-10-b1-shift-instance-generator-owner.md) —
  `production-domain` memiliki mekanisme generate `SHIFT_INSTANCE` (job harian, sebelum
  business day mulai, menegakkan aturan tanpa-duplikat/tanpa-gap yang FOUNDATION tetapkan).
  Sempat dipertimbangkan menaruhnya di FOUNDATION (karena FOUNDATION memiliki skemanya) —
  ditolak, pola yang sama dengan `ASSET_COMPONENT_LINK`: kepemilikan skema entitas ≠
  kepemilikan proses yang mengisinya seiring waktu ([MOM domain alignment](decisions/2026-09-10-mom-domain-alignment.md)).
- **Eksplisit dicatat:** satu `SHIFT_INSTANCE` per site+shift+date, generate sekali oleh
  `production-domain`, dibaca lewat FK oleh domain MOM lain yang butuh konteks waktu
  (MAINTENANCE hari ini, Quality/Inventory nanti) — tidak diduplikasi per domain.
- **Perubahan:** `DOMAINS/FOUNDATION/DOCS-EN/02-shift.md` (status `DRAFT` → `ACTIVE`, H-6
  resolved), `DOCS-EN/README.md`, `FOUNDATION/AGENTS.md` §2, `00-foundation.md` (ERD note),
  `DOMAINS/FOUNDATION/FLOW/03-shift-generation.md` (⚠ dihapus), `DOMAINS/PRODUCTION/AGENTS.md`
  §1/§3 (cakupan generator ditambahkan).
- **Sengaja tidak dikerjakan sesi ini:** mekanisme teknis (worker/cron/queue) — didelegasikan
  ke `engineering-domain` saat technical design, bukan bagian keputusan kepemilikan domain
  bisnis ini.

## 2026-09-10 — Sinkron PRD-003 (rule 1b): scope binding Time period & Plant ditambahkan ke 6 story KPI

- **Tipe:** sinkronisasi PRD (rule 1b) — bukan story baru, bukan KPI baru. Menutup item backlog dari
  entri di bawah ("`US-FND-KPI-009`–`012` di PRD-003 hanya menyebut Work Unit scope").
- **Domain:** FOUNDATION, `DOCS/prd/PRD-003-foundation-domain-en.md`, modul KPI (§6.12).
- **Konteks:** entri di bawah menambah dua scope binding baru di `07-0-kpi-formula.md`/`07-1-kpi-tag-mapping.md`
  — Time period scope (Availability/Performance/Quality ratio/OEE index) dan Plant scope (Throughput
  rate/Production process ratio) — formula sama, tidak ada field baru, hanya opsi `KPI_RESULT.period`/
  `aggregation_level` yang lebih lebar dari yang sudah dimodelkan.
- **Story yang diperbarui (Data & entities, Calculation, Rules & constraints, satu AC baru per
  story):**
  - `US-FND-KPI-001` (Availability), `US-FND-KPI-002` (Performance), `US-FND-KPI-003` (Quality),
    `US-FND-KPI-004` (OEE) — ditambah catatan Time period scope: `period` boleh berupa rentang
    `business_date` eksplisit, rollup `sum_of_terms` yang sama dengan rollup area/site yang sudah ada,
    diterapkan lintas `SHIFT_INSTANCE` dalam rentang alih-alih lintas work unit. Satu AC baru per
    story dengan angka berhitung.
  - `US-FND-KPI-011` (Throughput rate), `US-FND-KPI-012` (Production process ratio) — ditambah catatan
    Plant scope: rollup ke `aggregation_level = site` dengan rumus `ΣPQ/ΣAOET` dan `ΣAPT/ΣAOET`, rollup
    `sum_of_terms` yang sama dengan rule agregasi per-operasi yang sudah ada di story itu sendiri. Satu
    AC baru per story dengan angka berhitung.
- **Tidak disentuh (sesuai instruksi tugas):** F-07/F-07.1 sendiri (sudah diperbarui di entri di
  bawah); 4 item `TBD — perlu konfirmasi PO` yang masih terbuka (equipment load ratio capacity field,
  gap agregasi Production order/Fall-off ratio, model data MTTF, dan makna "Defect type" scope untuk
  OEE/NEE/Effectiveness/Quality ratio) — semua masih menunggu keputusan PO, tidak diubah di sesi ini.

## 2026-09-10 — Perluasan cakupan (scope) ISO 22400-2 dari chart kedua: Time period & Plant diadopsi, Production order & Defect type tetap diblokir

- **Tipe:** perluasan dokumen kerja FOUNDATION (bukan KPI/elemen baru — lihat entri di bawah untuk
  4 KPI yang sudah diadopsi sebelumnya di sesi yang sama).
- **Domain:** FOUNDATION (`DOMAINS/FOUNDATION/DOCS-EN/07-0-kpi-formula.md`,
  `DOMAINS/FOUNDATION/DOCS-EN/07-1-kpi-tag-mapping.md`).
- **Konteks:** PO memberi chart ISO 22400-2 kedua yang mencakup scope di luar Work unit/Product
  (Production order, Defect type, Time period, Worker/workgroup, Stock, Plant,
  Characteristic/measurements, Production order sequence). Setiap kombinasi KPI × scope baru dicek
  ulang terhadap `KPI_RESULT.aggregation_level`/`period` — scope baru tidak otomatis mewarisi status
  adopsi KPI-nya di Work Unit scope.
- **Diadopsi (tanpa modeling baru — field/entity sudah ada):**
  - **Time period scope** — Availability, Performance (Effectiveness), Quality ratio, OEE index.
    `KPI_RESULT.period` sudah bertipe "`shift_instance_id`, atau rentang `business_date` eksplisit"
    — opsi kedua itu **adalah** Time period scope, formula sama, rollup `sum_of_terms` yang sama
    lintas `SHIFT_INSTANCE` dalam rentang.
  - **Plant scope** — Throughput rate, Production process ratio. "Plant" dipetakan ke **Site**
    (01-site-hierarchy.md); `KPI_RESULT.aggregation_level` sudah punya nilai `site`. Rollup
    `ΣPQ/ΣAOET` dan `ΣAPT/ΣAOET`, disiplin `sum_of_terms` yang sama dengan rollup Availability/OEE
    yang sudah ada.
- **Tetap diblokir, dengan alasan spesifik per scope:**
  - **Production order scope** — Throughput rate/Production process ratio/Scrap ratio/Rework ratio
    diblokir oleh gap yang **sama** dengan Fall-off ratio (TBD-PO lama): `KPI_RESULT.aggregation_level`
    tidak punya nilai `work_order`. Ini memperluas dampak TBD tersebut (5 kombinasi KPI×scope, bukan
    cuma Fall-off ratio), **tidak** menambah TBD baru. Allocation ratio/Allocation efficiency/Setup
    ratio/Technical efficiency/FPY tetap diblokir oleh gap elemen lama (AUBT/AUST/AUPT/ADET/Quality
    domain), tidak terkait scope.
  - **Defect type scope — temuan baru.** `WORK_ORDER_OPERATION_DEFECT` (PRODUCTION) ternyata sudah
    punya qty per `defect_code_id` — breakdown per kode defect **secara struktur data sudah bisa**.
    Tapi belum diadopsi karena dua gap: (1) `KPI_RESULT.aggregation_level` tidak punya nilai
    `defect_code` (gap baru, sumbu berbeda dari gap Production order di atas); (2)
    `QUALITY_DEFECT_CODE.disposition` belum ada — ini **W-9 lama** ([08-work-master.md §9.7](../DOMAINS/FOUNDATION/DOCS-EN/08-work-master.md#97-quality_defect_code--scrapworkrework-taxonomy)),
    bukan gap baru. OEE index/NEE index/Effectiveness/Quality ratio di scope ini ditandai
    `TBD — perlu konfirmasi PO`: keempat formula itu tidak punya variabel yang bisa dipecah per kode
    defect (GQ, APT, PBT tidak berdimensi defect) — perlu klarifikasi apakah maksud chart benar-benar
    "hitung per kode defect" atau konteks lain (mis. Pareto).
  - **Stock (Inventory turns), Characteristic/measurements (Cm/Cmk/Cp/Cpk), Worker/workgroup (Worker
    efficiency)** — dicek ulang, tetap diblokir, alasan sama seperti sebelumnya (domain Inventory/
    Quality belum ada; Personnel di luar cakupan FOUNDATION). Tidak ada informasi baru dari chart ini
    yang mengubah jawaban itu.
- **3 item `TBD — perlu konfirmasi PO` lama (equipment load ratio capacity field, fall-off ratio
  order-scope aggregation, MTTF data model) — tidak berubah statusnya**, tapi fall-off ratio's TBD
  kini eksplisit disebut menggerbangi 5 kombinasi KPI×scope, bukan cuma dirinya sendiri. **1 TBD baru
  ditambahkan** (OEE/NEE/Effectiveness/Quality ratio di Defect type scope — lihat di atas). Total TBD
  aktif: 4.
- **Backlog rule 1b (belum disinkronkan sesi ini):** `US-FND-KPI-009`–`012` di PRD-003 hanya
  menyebut Work Unit scope. Perluasan Time period/Plant scope di atas berpotensi menambah
  acceptance criteria/expectation baru ke story yang sama (mis. "juga computable atas rentang
  tanggal" untuk KPI-009, "juga computable di Site level" untuk KPI-011/012) — PRD-003 milik
  `product-owner`, bukan domain ini, jadi tidak diubah langsung di sini. Diserahkan ke PO.

---

## 2026-09-10 — Sinkronkan PRD-003 dan glosarium ke 4 KPI ISO 22400-2 baru (rule 1b + rule 7)

- **Tipe:** sinkronisasi PRD (rule 1b) + entri glosarium baru (rule 7), tindak lanjut wajib atas
  perluasan adopsi KPI FOUNDATION di entri di bawah ini (F-07/F-07.1, sesi yang sama).
- **Domain:** Product & PRD (`DOCS/prd/PRD-003-foundation-domain-en.md`, `DOCS/01-glossary.md`).
- **PRD-003 — 4 user story baru ditambahkan ke modul KPI** (§5 tabel ringkasan + §6 blok detail,
  ditempatkan setelah `US-FND-KPI-008`, sebelum §6.13 FYR), total story PRD-003 naik dari 50 ke 54
  (52→56 blok detail; jumlah "51"/"47 dari 50" yang sudah usang di beberapa tempat ikut
  diperbaiki ke angka konsisten sambil di sini):
  - `US-FND-KPI-009` — Compute Scrap ratio from the same Quality inputs. Tidak butuh slot/binding
    baru — memakai ulang input `US-FND-KPI-003` (Quality) persis.
  - `US-FND-KPI-010` — Compute Rework ratio from job rework quantity. Baca `rework.output` (slot
    `bindable = false` baru di F-07.1 §9.1), tidak ada `WORK_UNIT_KPI_BINDING` baru.
  - `US-FND-KPI-011` — Compute Throughput rate from actual order execution time. Baca
    `throughput.order_execution_time` (slot `bindable = false` baru), AOET dari
    `WORK_ORDER_OPERATION.actual_start`/`.actual_end`.
  - `US-FND-KPI-012` — Compute Production process ratio from APT and AOET. Pakai ulang APT dari
    `US-FND-KPI-001` plus AOET dari `US-FND-KPI-011`.
  - Keempatnya lolos uji kesiapan §4 AGENTS.md (delapan bagian lengkap: Story, Context,
    Expectation semua state, Calculation dengan contoh berangka + kasus tepi, Data & entities,
    Rules & constraints, Acceptance criteria Given/When/Then, Metrics & events) — tidak ada yang
    `BLOCKED`, karena F-07/F-07.1 sudah memastikan setiap variabelnya menunjuk field yang ada.
    Satu metrik (`US-FND-KPI-010`'s target) ditulis `TBD — perlu konfirmasi PO` karena cakupan
    rollout `WORK_ORDER_OPERATION_DEFECT`/rework tracking di pilot site belum diketahui dokumen
    manapun — bukan dikarang.
  - §7.2 (ringkasan entitas untuk Engineering) dan §8 (instrumentasi untuk Data) ikut disinkronkan:
    baris `KPI_FORMULA_SLOT`/`KPI_PARAMETERS`/`WORK_UNIT_KPI_BINDING`/`KPI_RESULT` diperbarui untuk
    menyebut story baru dan dua slot non-bindable baru; baris `WORK_ORDER_OPERATION` (PRODUCTION)
    ditambahkan; 11 event baru didaftarkan (`scrap_ratio_computed`, `rework_ratio_computed`,
    `throughput_rate_computed`, `production_process_ratio_computed`, dan pasangan
    `_no_data`/`_anomaly`-nya).
  - Catatan sinkronisasi PRD-001: **tidak** di-back-port — PRD-001 beku sejak 2026-09-03 (rule 1b
    hanya berlaku ke PRD-003 untuk domain FOUNDATION, lihat keputusan PO yang sama). Ditulis
    eksplisit di catatan pembuka PRD-003 supaya tidak dikira lupa.
- **Glosarium — 6 istilah baru** ditambahkan: **AOET** dan **RWQ** ke tabel "Elemen waktu &
  kuantitas ISO 22400-2 (bukan KPI)" (plus **SQ** yang selama ini sudah dipakai tapi belum
  didefinisikan — dirapikan sekalian), **Scrap ratio**, **Rework ratio**, **Throughput rate**,
  **Production process ratio** ke tabel utama "Standar industri" mengikuti gaya entri
  Availability/Quality ratio/OEE yang sudah ada.
- **Tidak disentuh sesi ini (sesuai instruksi):** F-07/F-07.1 sendiri (sudah disinkronkan FOUNDATION
  di entri di bawah); tiga `TBD — perlu konfirmasi PO` di katalog deferred F-07 (field kapasitas
  equipment load ratio, agregasi order-scope fall-off ratio, jalur pemodelan MTTF) — tetap `TBD`
  di PRD-003 juga, tidak diputuskan di sini.

## 2026-09-10 — Perluas adopsi KPI ISO 22400-2 di FOUNDATION (4 KPI baru, sisanya di-defer eksplisit)

- **Tipe:** perluasan cakupan model data (K-4 dibuka kembali, PO minta adopsi ISO 22400-2
  sebanyak mungkin di luar OEE family v1) + katalog "deferred" eksplisit untuk sisanya.
- **Domain:** FOUNDATION (`07-0-kpi-formula.md`, `07-1-kpi-tag-mapping.md`).
- **Kenapa:** v1 (2026-08-24) sengaja hanya mengadopsi OEE family (Availability/Performance/
  Quality/OEE) + MTTR/MTBF, semua elemen ISO lain ditandai `⛔ not yet`. PO minta ditinjau
  ulang seberapa banyak dari 33/34 KPI ISO 22400-2 (chart "KPIs by Scope") sekarang bisa
  diadopsi mengingat model data FOUNDATION/PRODUCTION/MAINTENANCE aktual saat ini — setiap
  KPI hanya diadopsi kalau **setiap variabel formulanya** sudah menunjuk field yang benar-benar
  ada di dokumen, tidak ada field baru yang dikarang.
- **4 KPI diadopsi (di F-07, scope table + bagian baru "Newly adopted KPIs (2026-09-10)"; binding
  di F-07.1 bagian baru "Newly adopted KPIs (2026-09-10)"), semua di scope Work Unit, grain sama
  dengan Availability/Performance/Quality (`WORK_UNIT` × `SHIFT_INSTANCE`):**
  - **Scrap ratio** = SQ / PQ — dua-duanya elemen v1 yang sudah diadopsi, tidak butuh field baru.
  - **Rework ratio** = Rework quantity / PQ — elemen baru **RWQ**, dibaca dari
    `WORK_ORDER_OPERATION.rework_qty` (PRODUCTION), field yang sudah ada tapi belum pernah
    dipakai KPI mana pun.
  - **Throughput rate** = PQ / Actual order execution time — elemen baru **AOET**, dibaca dari
    `WORK_ORDER_OPERATION.actual_end − .actual_start` (PRODUCTION).
  - **Production process ratio** = APT / Actual order execution time — pakai APT (sudah
    diadopsi) dan AOET (baru, sama seperti Throughput rate).
  - AOET dan RWQ **bukan** `tag_role` baru — keduanya field job pada `WORK_ORDER_OPERATION`,
    diperlakukan sama seperti `good_qty`/`scrap_qty` job quantities yang sudah ada, bukan
    sinyal PLC/`ASSET_TAGS`. Dua slot baru ditambahkan di F-07.1 §9.1
    (`throughput.order_execution_time`, `rework.output`), keduanya `bindable = false` — tidak
    ada baris `WORK_UNIT_KPI_BINDING` baru yang dibutuhkan.
- **Sisanya tetap `⛔ not yet`, sekarang dengan katalog "Deferred ISO 22400-2 KPIs" eksplisit di
  F-07 (nama KPI, formula, alasan spesifik per baris) alih-alih catatan generik "revisit later":**
  worker efficiency (Personnel eksplisit di luar cakupan FOUNDATION per desain), allocation
  ratio/efficiency, utilization efficiency, NEE index, setup ratio, technical efficiency,
  equipment load ratio (butuh field "equipment production capacity" yang belum ada di manapun —
  `TBD` PO soal mau ditambah di mana), fall-off ratio (input-nya ada tapi butuh agregasi
  order-scope yang belum ada di `KPI_RESULT.aggregation_level` — `TBD` PO), actual-to-planned
  scrap ratio (butuh field "planned scrap quantity" yang belum ada), FPY dan empat index kapabilitas
  proses/mesin (Cm/Cmk/Cp/Cpk — butuh domain Quality yang belum dibuat), corrective maintenance
  ratio (MAINTENANCE baru punya `ASSET_COMPONENT_LINK`, belum ada work order/PM-CM time tracking),
  enam KPI Inventory (butuh domain Inventory yang belum dibuat + konsep "Consumed material" yang
  belum dimodelkan di mana pun), comprehensive energy consumption (tidak ada entitas metering
  energi), TEEP (bukan salah satu dari 34 KPI Clause 6 ISO, juga butuh elemen "Calendar time"
  yang belum diadopsi).
- **MTTF dicek eksplisit (bukan cuma diasumsikan blocked), tidak diadopsi** — dua alasan
  independen: (1) ISO Clause 5.1.4 yang sudah ditranskripsi di F-07 hanya mendefinisikan TBF/TTR,
  tidak ada elemen "time to failure" terpisah untuk disumberkan; (2)
  `DOMAINS/MAINTENANCE/DOCS-EN/01-asset-history.md` baru memodelkan `ASSET_COMPONENT_LINK`
  (histori instalasi/penggantian komponen), belum ada entitas kejadian kegagalan — satu-satunya
  data terkait kegagalan tetap `ASSET_STATE_LOG`, yang kepemilikannya sendiri masih disputed/belum
  selesai (B5). `TBD — perlu konfirmasi PO`: kalau MTTF tetap diinginkan, apakah pakai
  penyederhanaan yang sama seperti MTBF/MTTR (dari `ASSET_STATE_LOG` yang sama) atau menunggu
  MAINTENANCE memodelkan kejadian kegagalan sungguhan.
- **Tidak disentuh sesi ini:** `DOCS/01-glossary.md` (istilah baru — AOET, RWQ, Scrap ratio,
  Rework ratio, Throughput rate, Production process ratio — diusulkan ke PO, bukan ditulis
  langsung, sesuai kepemilikan dokumen); PRD-003 (rule 1b — story KPI PRD-003 kemungkinan perlu
  disinkronkan ke 4 KPI baru ini, dicatat sebagai backlog eksplisit untuk PO, bukan dikerjakan di
  sesi ini karena PRD bukan dokumen domain FOUNDATION).

## 2026-09-10 — Buat domain MAINTENANCE, pindahkan histori instalasi komponen keluar dari FOUNDATION

- **Tipe:** domain baru (skill `molca-domain-agent`, PO eksplisit) + pemindahan konten domain
  (rule 1b sync), audit lanjutan dari [keputusan MOM domain alignment](decisions/2026-09-10-mom-domain-alignment.md)
  di sesi yang sama.
- **Domain:** MAINTENANCE (baru) + FOUNDATION (konten dipindah keluar) + PRD-003 + indeks
  lintas-domain (`AGENTS.md`, `DOCS/02-domains.md`).
- **Kenapa:** PO menerapkan aturan pembelah dari keputusan MOM di atas ke kandidat konkret yang
  sudah ditandai di keputusan itu: `ASSET_COMPONENT_LINK` (histori instalasi/penggantian
  komponen) adalah catatan kejadian ("apa yang terjadi pada asset ini, dan kapan"), bukan
  taksonomi/struktur saat ini — persis pola yang sudah dipakai untuk `WORK_ORDER` pindah ke
  PRODUCTION, 2026-09-03. FOUNDATION eksplisit dikonfirmasi PO hanya memegang hierarchy +
  placement saat ini, bukan histori perubahan state.
- **Domain baru `DOMAINS/MAINTENANCE/`:** pola *full* (`DOCS-EN/` + `UX/`, meniru FOUNDATION).
  `DOCS-EN/00-maintenance.md` (peta domain, standar ISO 14224/55000/IEC 62264, batas dengan
  FOUNDATION), `DOCS-EN/01-asset-history.md` (`ASSET_COMPONENT_LINK`, dipindah dari F-04 §9.5),
  `UX/01-asset-history.md` (`SCR-MNT-AST-001`, dipindah dari `SCR-FND-AST-006`), agent
  `.claude/agents/maintenance-domain.md`. Kode modul `AST` **dipakai bersama** FOUNDATION dan
  MAINTENANCE, pola yang sama dengan `SHF` (dibedakan lewat prefix domain, bukan kode baru).
- **FOUNDATION (`04-asset-ontology.md`, `00-1-authorization-permissions.md`, `UX/04-asset.md`):**
  entitas `ASSET_COMPONENT_LINK`, screen `SCR-FND-AST-006`, dan open question `UX-AST-4` (kini
  `UX-MNT-1`) dihapus/ditandai dipindah, diganti pointer ke MAINTENANCE. `ASSET`/`ASSET_PLACEMENT`/
  `ASSET.parent_asset_id` (current-state pointer) **tetap** di FOUNDATION — hanya *trail*-nya
  yang pindah.
- **PRD-003:** `US-FND-AST-005` retired (ID tidak dipakai ulang), isi lengkapnya dipertahankan
  verbatim di dokumen MAINTENANCE baru, bukan dihapus — tidak ada story lain yang menjadikannya
  dependensi, jadi aman dipindah tanpa meninjau ulang story lain. Scope count 51 → 50 user
  story. **Belum ada PRD untuk MAINTENANCE** (rule 1 — tidak dibuat sebagai efek samping
  pemindahan ini); `US-MNT-AST-001` menunggu PO memesan satu.
- **Indeks:** `AGENTS.md` §1/§2/§3/§4 dan `DOCS/02-domains.md` — MAINTENANCE terdaftar sebagai
  domain aktif (dipindah dari tabel "Direncanakan"), diagram ketergantungan diperbarui.
- **Sengaja tidak dikerjakan sesi ini:** Work Order (PM/CM) dan Reliability (MTBF/MTTR/MTTF) di
  MAINTENANCE — belum dimodelkan, ditandai `TBD` di `DOCS-EN/00-maintenance.md`, menunggu input
  ops/PO soal proses maintenance nyata di pabrik.

## 2026-09-10 — Keputusan: selaraskan pembagian domain ke MOM IEC 62264/ISA-95

- **Tipe:** keputusan struktural PO ([`LOGS/decisions/2026-09-10-mom-domain-alignment.md`](decisions/2026-09-10-mom-domain-alignment.md)), bukan PRD baru.
- **Domain:** indeks lintas-domain (`AGENTS.md` §3).
- **Kenapa:** IEC 62264/ISA-95 membelah operasi pabrik jadi empat domain MOM — Production,
  Quality, Maintenance, Inventory — di atas satu *shared object model*. FOUNDATION memainkan
  peran lapisan bersama itu, bukan salah satu dari empat domain operasi, tapi `AGENTS.md` §3
  belum mendaftarkan Quality/Maintenance/Inventory sama sekali (hanya domain pendukung platform
  generik: Design/Engineering/Data/Ops). Tanpa peta ini, keputusan scope FOUNDATION diambil
  kasus per kasus tanpa kerangka konsisten.
- **Perubahan:** `AGENTS.md` §3 — baris FOUNDATION dapat catatan peran *shared object model*;
  tabel "Direncanakan" dapat tiga baris baru (Quality, Maintenance, Inventory) ditandai *(MOM)*,
  terpisah dari domain pendukung platform. Tidak ada folder/agent baru dibuat sesi ini.
- **Aturan yang ditetapkan:** definisi/taksonomi/master data → FOUNDATION; instans
  eksekusi/transaksional (histori kejadian, catatan hasil kerja) → domain MOM pemiliknya.
  Preseden: `WORK_ORDER`/`WORK_ORDER_OPERATION` pindah FOUNDATION→PRODUCTION
  ([keputusan 2026-09-03](decisions/2026-09-03-foundation-contest-blockers.md)).
- **Tidak disentuh:** audit isi FOUNDATION saat ini (termasuk histori instalasi komponen yang baru
  masuk, commit `69c99fa`) terhadap aturan ini — kerangka penilaian, bukan migrasi otomatis;
  follow-up terpisah, belum dijadwalkan.

---

## 2026-09-08 — Sync penuh temuan `prd-pilot` (bukan hanya 6 koreksi pertama)

- **Tipe:** koreksi story/index yang sudah ada (rule 1b) — menyelaraskan PRD & kontrak ke dokumen
  sumber; **tidak** mengarang keputusan produk baru.
- **Domain:** product-owner + foundation-domain (PRD-003) + indeks lintas-domain (`AGENTS.md`,
  `DOCS/02-domains.md`).
- **Kenapa:** setelah batch 6 kontradiksi, sisa temuan bucket-(c) / ownership drift dari
  `prd-pilot` lintas-modul masih membuat PRD lebih basi dari F-0x/UX. Sesi ini menutup sebanyak
  mungkin yang sumbernya sudah memutuskan; yang masih terbuka tetap BLOCKED/TBD.
- **PRD-003 (ringkas):**
  - **AST** — `code` (bukan `asset_class_code`); attrs di Type; `*_REASON_ASSET`; unplaced via
    `ASSET_PLACEMENT`; UX-AST-3 TBD untuk reverse lookup.
  - **SIT** — kontradiksi collapse UX 01 ditandai TBD; hapus `WORK_UNIT.type`; S-3 parenthetical
    diperbaiki.
  - **SHF/FYR** — empty copy & panel retired sesuai UX 02/03; fiscal SITE fully read-only (Y-2).
  - **KPI** — empat transform timing termasuk `range_bucket`; `complement_derive` same-asset;
    persona KPI-007 → Admin/IT pabrik; `is_oee_tracked` ditandai stale cross-doc (F-01 vs F-07.1).
  - **WMS/PRO/REF** — deps lepas dari WMS-001 closed; tanpa dispositions palsu; scope no-FK =
    enterprise/tenant; copy UX 06; tanpa nama role IDP; deactivation column UOM/TIME = TBD.
  - **NTF/CFG/WFE** — tanpa `ROLE_ASSIGNMENT`/`USER_ACCOUNT`/`ROLE` FOUNDATION; F-09 (bukan F-07)
    untuk workflow; lifecycle NTF termasuk `sent`; empty prefer `"belum ada data"` bila belum ada UX.
  - **INT-002/003** — **BLOCKED — ownership** (shopfloor sync → PRODUCTION; heartbeat → DSR/H-DS-1);
    ID tidak dihapus. Hitungan BLOCKED di ringkasan: **5**.
  - **DSR-001** — `site_id` wajib di write list; `last_seen_at` bukan UI health; tidak menulis
    readings; §7 map/event → DSR (bukan INT-001 closed).
- **Index:** `AGENTS.md` §3 blurb FOUNDATION tanpa organization/calendar; kode modul **`FYR`**
  (bukan `FSC`); catatan “KPI tidak punya story” dicabut. `DOCS/02-domains.md` cakupan FOUNDATION
  diselaraskan (sama: `FYR`, tanpa org/WO/calendar).
- **Sengaja tidak “diselesaikan” sepihak:** K-6/K-8/H-DS-1/UX-SIT-3/W-8/W-9/P-1/ADR-0001;
  house-style copy/metrics yang bukan fakta sumber; memindahkan INT-002 ke PRD PRODUCTION
  (butuh keputusan PO + story PRODUCTION).

## 2026-09-08 — Perbaiki 6 kontradiksi PRD-003 vs dokumen sumber FOUNDATION (ditemukan `prd-pilot`)

- **Tipe:** koreksi story yang sudah ada di PRD-003 (rule 1b) — bukan story/PRD baru, tidak ada
  fakta baru yang dikarang.
- **Domain:** foundation-domain (PRD-003, modul `CFG`, `PRO`, `WMS`, `NTF`, `SIT`).
- **Kenapa:** diagnostik lintas-modul `prd-pilot` (agent baru menulis ulang story dari
  DOCS-EN/UX/FLOW saja, lalu di-diff ke PRD-003 asli) menemukan 6 titik di mana PRD-003
  bertentangan dengan dokumen sumber yang dikutipnya sendiri. Semua diperbaiki agar cocok
  dengan sumbernya; tidak ada mekanisme atau field baru yang diasumsikan.
- **Perubahan di `DOCS/prd/PRD-003-foundation-domain-en.md`:**
  1. **`US-FND-CFG-001`** — rantai resolusi scope di bagian Calculation kehilangan `tenant`.
     [F-12 §Core concept 1](../DOMAINS/FOUNDATION/DOCS-EN/12-configuration-service.md#core-concepts)
     menyebut rantainya eksplisit `product default → tenant → enterprise → site → area →
     work center → user`. Ditambahkan kembali di teks rumus resolusi.
  2. **`US-FND-PRO-002`** — aturan akses menyebut `PRODUCT_DETAIL` berskala `site`, padahal
     [F-06 §9.2](../DOMAINS/FOUNDATION/DOCS-EN/06-product.md#92-product_detail--physical--tracking-attributes-11-with-product)
     dan [katalog otorisasi](../DOMAINS/FOUNDATION/DOCS-EN/00-1-authorization-permissions.md#product-pro--06-productmd-9)
     tidak memberi FK Site Hierarchy pada `PRODUCT_DETAIL`, sama seperti `PRODUCT` sendiri.
     Diselaraskan dengan pola `US-FND-PRO-001`/`-003`/`-004`: klaim `site` dihapus, diganti
     "no FK → resolves upward, `TBD` menunggu P-1, default `tenant`".
  3. **`US-FND-WMS-002`** (BOM) **dan `US-FND-WMS-003`** (Routing) — kedua story menulis field
     `version` pada `BOM`/`ROUTING`, padahal
     [F-08 §9.1](../DOMAINS/FOUNDATION/DOCS-EN/08-work-master.md#91-routing--a-product-can-run-at-this-work-center)
     menyatakan eksplisit "no version field here either — see W-8", dan W-8 mencatatnya belum
     diputuskan. Field `version` dihapus dari Data & entities kedua story; aturan/AC yang
     bergantung pada penguncian versi ("locked onto a WORK_ORDER") diganti
     `TBD — perlu konfirmasi foundation-domain (W-8, belum diputuskan)`, AC yang menguji
     penguncian itu ditandai "not yet testable" (pola yang sama dengan `US-FND-WMS-005` AC-5).
     Di `US-FND-WMS-003` juga: field `sequence_no`/`standard_crew_size` diganti nama menjadi
     `step_number`/`crew_size` sesuai nama kanonik [F-08 §9.2](../DOMAINS/FOUNDATION/DOCS-EN/08-work-master.md#92-operation--one-step-of-a-routing-at-one-work-unit-with-its-standard),
     di setiap tempat kemunculannya (Expectation, Data & entities, Rules).
  4. **`US-FND-NTF-001`** — metrik kesehatan modul hanya mengukur "% diakui dalam deadline".
     [F-10 "Implications for MolcaDx"](../DOMAINS/FOUNDATION/DOCS-EN/10-notification.md#implications-for-molcadx)
     mendefinisikan rasio ini sebagai "**acknowledged-and-acted-on**" — separuh "acted on"
     hilang total di story. Metrik ditulis ulang menyebut kedua separuh secara eksplisit;
     ditambah catatan `TBD — perlu konfirmasi foundation-domain` karena F-10 masih
     concept-only dan tidak ada field yang memodelkan "acted on" — hanya separuh
     "acknowledged" yang benar-benar terukur hari ini.
  5. **`US-FND-SIT-002`** — story menganggap `valid_from`/`valid_to` sudah ada pada
     `AREA`/`WORK_CENTER`/`WORK_UNIT`, padahal
     [`UX-SIT-3`](../DOMAINS/FOUNDATION/UX/01-site-hierarchy.md#open-questions) mencatat
     pertanyaan itu sendiri masih terbuka — apakah field itu benar ada di model data yang
     terimplementasi. Ditambah banner BLOCKED di atas story (gaya sama dengan banner
     `US-FND-KPI-006`/`US-FND-SHF-004`): rules/AC berlaku begitu `UX-SIT-3` terjawab, tapi
     story ini belum bisa dibangun end-to-end sampai `foundation-domain` mengonfirmasi field
     itu. Hitungan "stories BLOCKED" di ringkasan pembuka PRD diperbarui dari 2 ke 3.
- **Tidak disentuh (di luar cakupan sesi ini, sesuai instruksi):** temuan `prd-pilot` lain
  tentang FYR ("tabs"/"rare override" basi) dan INT (klaim KR-split basi) — itu perbaikan ke
  `DOCS-EN`/`UX`, bukan PRD-003, follow-up terpisah. Pola persona "internal implementor"
  (`KPI-007`/`INT-003`/`CFG-001`–`003`) juga tidak disentuh — itu keputusan produk tertunda,
  bukan sesuatu yang diputuskan sepihak di sesi ini.

## 2026-09-08 — Tambah `US-FND-KPI-008` (View KPI calculation breakdown) di PRD-003, rule 1b sync

- **Tipe:** story baru di PRD yang sudah ada (rule 1b) — bukan PRD baru
- **Domain:** foundation-domain (PRD-003, modul `KPI`)
- **Kenapa:** `SCR-FND-KPI-004` (KPI Calculation, view-only) sudah dideklarasikan di
  `DOMAINS/FOUNDATION/UX/07-kpi.md` dan `DOMAINS/FOUNDATION/FLOW/05-kpi-computation.md`
  tapi belum punya user story di PRD-003 — celah ditemukan lewat diagnostik `prd-pilot`
  (agent baru yang hanya diberi DOCS-EN/UX/FLOW berhasil menulis story 8-bagian penuh dari
  dokumen itu saja, membuktikan dokumennya sudah cukup, bukan terhambat keputusan produk
  yang belum ada). Metode deteksi `range_bucket` (range/threshold detection) dilebur ke
  dalam story ini, bukan dibuatkan story sendiri, karena halaman ini satu-satunya tempat
  metode itu muncul ke user.
- **Perubahan di `DOCS/prd/PRD-003-foundation-domain-en.md`:**
  - Tabel ringkasan modul KPI — tambah baris `US-FND-KPI-008`.
  - Blok detail `US-FND-KPI-008` (8 bagian lengkap) ditambah setelah `US-FND-KPI-007`,
    persona **Admin/IT pabrik** (salah satu dari 4 persona kanonik, dipilih karena
    halaman ini audiensnya sama dengan editor binding `US-FND-KPI-007`: implementor/admin
    yang memverifikasi wiring, desk-based, bukan layar shopfloor).
  - §11 Open questions — tambah **Q-26** membungkus K-8 (apakah threshold
    small_stop/downtime range detection berbagi nilai dengan K-6 milik stall detection,
    atau terpisah), perlakuan sama seperti K-6/Q-21 pada `US-FND-KPI-006`. AC yang
    bergantung padanya ditandai "not yet testable" — story ini sendiri **tidak** BLOCKED,
    hanya bagian penampilan nilai band numerik yang menunggu Q-26.
  - §7.2 Entity summary — `US-FND-KPI-008` ditambah sebagai pembaca (read-only)
    `KPI_FORMULA_SLOT`/`KPI_PARAMETERS` dan `WORK_UNIT_KPI_BINDING`.
  - §12 Decision log — entri baru mencatat penambahan ini.
  - Header versi, kolom Scope, dan paragraf "In short" — angka story diperbarui dari
    50 ke **51** mengikuti pola yang sudah dipakai untuk penambahan story sebelumnya
    (`US-FND-KPI-007`, `US-FND-AST-005`, `US-FND-DSR-001`).
- **Backlog, sengaja tidak dikerjakan sesi ini:** `US-FND-KPI-007` memakai persona
  "implementor", bukan salah satu dari 4 persona kanonik di
  [`00-product-overview.md` §3](../DOCS/00-product-overview.md) (seharusnya
  **Admin/IT pabrik**). Ini bug terpisah yang sudah diketahui sebelumnya, sengaja
  ditunda, dan **tidak** diperbaiki di sesi ini.

---

## 2026-09-08 — Tambah layar `SCR-FND-KPI-004` (KPI Calculation, view-only) di modul KPI (F-07.1)

- **Tipe:** kapabilitas baru (Feature/Capability) di modul yang sudah ada, tidak ada entitas baru
- **Domain:** foundation-domain (F-07.1 KPI Formula & Tag Mapping)
- **Kenapa:** Product Owner minta layar view-only per KPI yang menampilkan rumus (F-07),
  tag mana yang mengisi tiap slot beserta `tag_role`/`transform` (F-07.1), dan metode
  deteksi downtime yang berlaku — refleksi hidup dari `KPI_FORMULA_SLOT` /
  `KPI_PARAMETERS` / `WORK_UNIT_KPI_BINDING` yang sudah ada, bukan dokumen tulisan tangan
  yang bisa basi. Tidak ada create/edit di layar ini.
- **Perubahan:**
  - `DOMAINS/FOUNDATION/FLOW/05-kpi-computation.md` — tambah section
    "Activity: user opens the KPI Calculation page (view-only)" (diagram + 5 state:
    default, empty per-slot "belum dipetakan", loading, error/stale+retry, no-permission)
    dan tabel Design implications terpisah untuk layar ini. Tambah satu baris Design
    implications baru di tabel A/P/Q existing soal "satu work unit mengikat tepat satu
    transform timing Availability" (dipakai `SCR-FND-KPI-004`).
  - `DOMAINS/FOUNDATION/UX/07-kpi.md` — tambah baris `SCR-FND-KPI-004` di tabel Screens
    (7-state lengkap), catatan kenapa view-only berbeda alasannya dari katalog
    `SCR-FND-KPI-001` (ini derived read dari binding yang sudah implementor-writable, bukan
    K-1/K-7 boundary), dan update baris Coverage.
- **Housekeeping:** tidak ada file baru dibuat (keduanya masuk ke file yang sudah
  terdaftar di [`DOMAINS/FOUNDATION/AGENTS.md` §2](../DOMAINS/FOUNDATION/AGENTS.md)),
  jadi tidak ada baris indeks baru yang perlu ditambah.

---

## 2026-09-08 — Tambah metode deteksi downtime kedua: range/threshold detection (F-07.1)

- **Tipe:** perluasan spesifikasi modul KPI Formula & Tag Mapping, satu open question baru
- **Domain:** foundation-domain (F-07.1 KPI Formula & Tag Mapping)
- **Kenapa:** Product Owner minta metode deteksi downtime kedua di samping stall
  (counter berhenti bertambah): tag analog (`speed`, RPM, %) dianggap downtime saat
  nilainya di luar rentang operasi normal (contoh PO: 40–100 = jalan). Mekanismenya beda
  dari stall (bukan counter, tidak ada "berhenti bertambah") tapi memakai logika
  pembagian small_stop/downtime yang sama.
- **Perubahan:**
  - `DOMAINS/FOUNDATION/DOCS-EN/07-1-kpi-tag-mapping.md` — tambah section
    "How downtime gets detected from an out-of-range analog value" sebagai saudara
    section stall detection; tambah transform `range_bucket` (mencerminkan
    `stall_bucket`) ke tabel transform enum §9.2; update paragraf "empat transform yang
    berkompetisi" untuk slot `availability.downtime_reason`; update tabel Availability
    ("do not use") dan tabel tag-role reverse untuk `speed` (sekarang bisa mengisi
    Availability, tapi hanya lewat `range_bucket`, tidak pernah langsung); tambah **K-8**
    di "What's still unknown" — apakah ambang small_stop/downtime dibagi satu nilai
    global lintas metode deteksi (stall & range), atau per-metode-deteksi sendiri-sendiri
    (belum dijawab K-6). Update "Next step" untuk menyebut K-8.
  - `DOCS/01-glossary.md` — tambah entri **Deteksi rentang (range detection)** di tabel
    Master data, mengikuti gaya terse entri Stall, ditautkan ke section F-07.1 barunya.
- **Housekeeping:** tidak ada file baru (perubahan di file yang sudah terdaftar di
  [`DOMAINS/FOUNDATION/AGENTS.md` §2](../DOMAINS/FOUNDATION/AGENTS.md)). Tidak menyentuh
  PRD — sinkronisasi story PRD-003 (kalau ada) diperiksa terpisah lewat `prd-pilot`.

---

## 2026-09-06 — Tooling: knowledge graph graphify dipasang di repo

- **Tipe:** tambah
- **Domain:** — (tooling, lintas domain)
- **File terdampak:** `CLAUDE.md`, `.gitattributes`, `.claude/settings.json`, `.gitignore`, `graphify-out/`
- **Perubahan:**
  - Seluruh 81 dokumen repo diekstrak menjadi knowledge graph (569 node, 889 edge,
    29 komunitas) dan disimpan di `graphify-out/` — `graph.json` (data), `graph.html`
    (viz interaktif), `GRAPH_REPORT.md` (laporan audit).
  - `CLAUDE.md` ditambahi bagian "graphify": pertanyaan soal isi repo dijawab lewat
    `graphify query` lebih dulu sebelum grep, dan `graphify update .` dijalankan setelah
    dokumen berubah agar graph tidak basi. Bagian ini ditulis oleh installer graphify,
    bukan manual.
  - `.claude/settings.json` (baru) memasang hook `PreToolUse` yang mengingatkan agent
    memakai graph sebelum Bash/Grep/Read/Glob. Berisi path absolut
    `/Users/nurilratu/.local/bin/graphify` — perlu disesuaikan per mesin.
  - `.gitattributes` (baru) mendaftarkan merge driver `graphify` untuk `graph.json`.
    Driver-nya belum dikonfigurasi di git; tanpa itu git jatuh ke merge biasa dan
    `graph.json` bisa konflik saat dua orang membangun ulang graph.
  - `.gitignore` mengecualikan `graphify-out/cache/` dan `graphify-out/.graphify_*` —
    keduanya state lokal per mesin (cache hash + path interpreter absolut).
  - **Catatan hasil audit graph:** skill `grill-with-docs` dan `unslop` ada tiga salinan
    byte-identical di `.claude/skills/`, `.cursor/skills/`, dan `.agents/skills/` tanpa
    tautan apa pun antar salinan — rawan drift, belum diputuskan mau diapakan.

---

## 2026-09-04 — Split `US-FND-DSR-001` dari `US-FND-INT-001` (closes GitHub issue #20)

- **Tipe:** story PRD baru + story lama ditutup
- **Domain:** product-owner (PRD-003, domain FOUNDATION)
- **Kenapa:** keputusan PO (issue #20) — `DATA_SOURCE` (F-13) tidak pernah punya story
  sendiri, kontennya numpang di `US-FND-INT-001` sejak split modul B7. `US-FND-INT-001`'s
  own note (2026-09-03) sudah mengusulkan split ini dan meninggalkannya sebagai keputusan
  PO — sekarang dieksekusi.
- **Perubahan:** `DOCS/prd/PRD-003-foundation-domain-en.md` —
  - `US-FND-DSR-001` ("Declare a data source connection and map its tags") ditambahkan,
    memindahkan konten `DATA_SOURCE`/`ASSET_TAGS` `US-FND-INT-001` apa adanya (satu layar,
    per Expectation row aslinya), bukan ditulis ulang dari nol.
  - `US-FND-INT-001` **ditutup**, bukan dipersempit jadi shell ERP-only kosong — F-11
    Integration belum punya field/layar ERP konkret mana pun untuk ditulis jadi story. ID
    baru dipakai kalau jalur ERP benar-benar discope nanti.
  - `US-FND-INT-002`/`US-FND-INT-003` Dependencies diperbarui menunjuk `US-FND-DSR-001`.
  - Tabel modul, table of contents, entity summary, dan hitungan story/blok detail
    diperbarui (50 story, 13 modul).
- **Tindak lanjut:** GitHub issue #20 dikomentari dan ditutup, mengonfirmasi split selesai.

---

## 2026-09-04 — Tambah `US-FND-AST-005`: story PRD untuk riwayat instalasi komponen (`ASSET_COMPONENT_LINK`)

- **Tipe:** story PRD baru
- **Domain:** product-owner (PRD-003, domain FOUNDATION)
- **Kenapa:** menutup gap `ASSET_COMPONENT_LINK` yang ditemukan `prd-pilot` — entitas ini
  sudah lengkap dispesifikasikan (F-04 §9.5) tapi tidak punya story PRD mana pun. Layarnya
  (`SCR-FND-AST-006`) sudah ditambahkan `foundation-domain` di sesi terpisah (entri di
  bawah); story ini menutup gap sisi PRD-nya, dua bagian dari perbaikan yang sama.
- **Perubahan:** `DOCS/prd/PRD-003-foundation-domain-en.md` — tambah `US-FND-AST-005`
  ("Record component swaps as installation history") mengikuti pola `US-FND-AST-003`
  (placement history) satu level lebih dalam. Blok detail 8 bagian lengkap; Calculation
  ditulis `tidak berlaku` (CRUD/history, bukan kalkulasi KPI, sama seperti presedennya).
  Baris tabel modul Asset Ontology, entity summary (§7.2), screen map (§7.1), decision log
  (§12), dan §13.6 baru semua diperbarui. Jumlah story domain naik dari 48 ke 49; jumlah
  blok detail dari 51 ke 52.
- **TBD dibiarkan terbuka (tidak diasumsikan):**
  - `UX-AST-4` (owner `foundation-domain`) — apakah `ASSET.component_level` wajib
    konsisten dengan kedalaman `parent_asset_id`, atau boleh berbeda. Rule ③ dan AC-4 story
    ini ditulis sebagai asumsi sementara (parent picker memfilter `Part`-level), bukan
    jawaban final — wajib ditinjau ulang begitu `UX-AST-4` resolved (AGENTS.md §5 rule 1b).
  - Apakah `ASSET.parent_asset_id` disinkronkan otomatis dari baris `ASSET_COMPONENT_LINK`
    terbaru — tidak dijawab F-04, ditandai `TBD — perlu konfirmasi foundation-domain` di
    bagian Data & entitas.
  - Metrik keberhasilan — tidak ada nama/baseline/target konkret di sumber manapun; metrik
    ditandai `TBD — perlu konfirmasi PO` mengikuti konvensi file ini untuk story tanpa
    metrik, dengan kandidat framing (mirroring `US-FND-AST-003`) dicatat untuk PO putuskan.

---

## 2026-09-04 — Tambah `SCR-FND-AST-006`: layar riwayat instalasi komponen (`ASSET_COMPONENT_LINK`)

- **Tipe:** dokumen UX baru (screen declaration)
- **Domain:** foundation-domain
- **Kenapa:** `prd-pilot` menemukan `ASSET_COMPONENT_LINK` (F-04 §9.5 — riwayat pemasangan
  komponen terhadap parent fisiknya, bahan baku Maintenance domain di masa depan untuk
  analisis MTBF/MTTF) sudah lengkap dispesifikasikan di entity spec tapi tidak punya layar
  maupun story PRD mana pun — gap nyata, bukan sekadar belum diprioritaskan.
- **Perubahan:** `DOMAINS/FOUNDATION/UX/04-asset.md` — tambah `SCR-FND-AST-006` (list +
  timeline + install/swap action) ke tabel Screens, mengikuti pola `SCR-FND-AST-003`
  (Placement history) satu level lebih dalam: komponen bukan work unit. Cakupan: list
  komponen yang terpasang saat ini per parent asset, riwayat instalasi lengkap per slot
  komponen (tidak pernah ditimpa/disembunyikan — prinsip F-00 yang sama dengan
  `ASSET_PLACEMENT`), dan aksi install/swap yang mencari `ASSET` terdaftar pada level
  komponen yang benar (memfilter `Part`-level dari picker parent, sesuai aturan ISO 14224
  §9.5). Reachable langsung dan via link dari baris aset di `SCR-FND-AST-001`'s Table view.
  Coverage line ditambah `ASSET_COMPONENT_LINK`.
- **Open question baru:** `UX-AST-4` — validasi `component_level` masih `TBD` di sumber
  (F-04 §9.4/§9.5), screen ini mengasumsikan parent picker memfilter `Part`-level; perlu
  dikonfirmasi ulang saat `TBD` itu diselesaikan. Owner `foundation-domain`.
- **Tidak diubah:** `DOCS-EN/04-asset-ontology.md` (entitasnya sudah lengkap di sana) dan
  `TBD` `component_level` tidak diresolusi di sesi ini, sengaja dibiarkan terbuka.
- **Belum dibuat:** story PRD untuk `SCR-FND-AST-006` — ditangani `product-owner` secara
  terpisah, bukan bagian dari sesi ini.

---

## 2026-09-04 — Follow-up: `US-FND-AST-002` AC-1 masih kontradiksi fix `site_id` (verifikasi ulang)

- **Tipe:** koreksi story PRD sesi berjalan (rule 1b AGENTS.md)
- **Domain:** foundation-domain
- **Kenapa:** verifikasi ulang atas fix Bug 1 (entri di bawah, "`US-FND-AST-002` Data & entities
  menulis `ASSET.site_id`") menemukan satu bug sisa di story yang sama: **AC-1** masih menulis
  "saves an asset with tag, site, and (optionally) type" — menyiratkan `site` adalah input saat
  registrasi, padahal Data & entities sudah menegaskan `ASSET.site_id` tidak pernah bisa ditulis
  di sini (resolved B6, 2026-09-03).
- **Perbaikan AC-1:** kata "site" dihapus dari kalimat save; ditambahkan catatan eksplisit bahwa
  site tidak dimasukkan di sini, placement/site datang belakangan lewat `US-FND-AST-003`, dan
  aset yang belum ditempatkan tampil "unplaced".
- **Rule ① (`asset_tag` unique within the site) — diperiksa, bukan ditebak:** dicek ke
  `04-asset-ontology.md` §9.4, yang menyatakan `asset_tag` "unique within site" tapi tidak
  menjelaskan bagaimana itu dievaluasi untuk aset yang didaftarkan tanpa site (site derived dari
  `ASSET_PLACEMENT`, bisa "unplaced"). Ini gap yang sama dengan open question `A-10`, dan dokumen
  sumber tidak menyelesaikannya. Rule ① ditandai `TBD — perlu konfirmasi PO`/`foundation-domain`
  dengan pertanyaan spesifik (fallback ke uniqueness global, atau tunda pengecekan sampai
  `US-FND-AST-003`?); **AC-2** yang bergantung pada rule ini ditandai kontingen pada resolusinya.
- **File terdampak:** `DOCS/prd/PRD-003-foundation-domain-en.md` (`US-FND-AST-002` — Rules &
  constraints ①, Acceptance criteria AC-1/AC-2).
- **Tidak diubah:** `DOMAINS/FOUNDATION/DOCS-EN/04-asset-ontology.md` — sudah benar dan konsisten,
  tidak ada yang perlu diubah di sana; celahnya murni di narasi PRD-003.

## 2026-09-04 — Perbaikan 3 bug PRD-003 ditemukan oleh diagnostik `prd-pilot` (Asset Ontology, Data Source/Integration)

- **Tipe:** koreksi story PRD sesi berjalan (rule 1b AGENTS.md) + koreksi entri decision log
- **Domain:** foundation-domain
- **Kenapa:** sebuah run diagnostik skill `prd-pilot` (read-only) menemukan tiga bug nyata di
  `PRD-003-foundation-domain-en.md` — bukan keputusan baru, melainkan konten PRD yang basi atau
  bertentangan dengan keputusan yang sudah resolved di `DOCS-EN`/`UX`. Follow-up ini adalah
  perbaikannya.
- **Bug 1 — `US-FND-AST-002` Data & entities menulis `ASSET.site_id`:** bertentangan dengan
  keputusan B6 ([`2026-09-03-foundation-contest-blockers.md`](decisions/2026-09-03-foundation-contest-blockers.md))
  dan `04-asset-ontology.md` §9.4 yang menyatakan `site_id` adalah derived/read-only dari
  `ASSET_PLACEMENT`, bukan field yang ditulis. `site_id` dihapus dari daftar field `Write: ASSET`,
  digantikan catatan bahwa registrasi tidak menyertakan site sampai `US-FND-AST-003` menempatkan
  aset (dan A-10 soal aset yang belum pernah ditempatkan resolved).
- **Bug 2 — `US-FND-AST-001`/`002` Expectation menjelaskan layout dua-layar yang sudah pensiun:**
  keduanya menyebut layar berdiri sendiri (taxonomy editor dua-panel; asset register dengan
  kolom & fokus pencarian) padahal `UX/04-asset.md` pasca [screen-merge
  2026-09-04](decisions/2026-09-04-asset-ontology-screen-merge.md) menggabungkan keduanya jadi
  satu layar `SCR-FND-AST-001` (Tree/Diagram/Table). Expectation kedua story ditulis ulang
  mengikuti struktur nyata (Table = taksonomi + registrasi aset; Tree/Diagram = browse flat +
  badge-jump ke Table); detail yang tidak disebutkan `UX/04-asset.md` (mis. urutan fokus field
  pencarian, layout kolom persis di Table) ditandai `TBD — perlu konfirmasi PO`, bukan ditebak.
- **Koreksi decision log terkait Bug 2:** `decisions/2026-09-04-asset-ontology-screen-merge.md`
  §"Konsekuensi" sebelumnya mengklaim AC/data/rules `US-FND-AST-001`/`002`/`003` "tidak berubah
  oleh keputusan ini". Klaim ini salah — pemeriksaan saat itu hanya mencari referensi literal
  SCR-ID dan melewatkan bahwa bagian Expectation mengunci layout lama sebagai detail yang bisa
  diuji. Bagian itu diperbaiki dengan catatan koreksi eksplisit, bukan dibiarkan berdiri.
- **Bug 3 — `US-FND-INT-003` membangun logika `healthy`/`late`/`stopped` yang dilarang
  `13-data-source.md`:** open question H-DS-1 eksplisit melarang membangun staleness alerting
  sebelum granularitas heartbeat (per-koneksi vs per-tag) resolved. Bagian Calculation, Rules
  ②④, AC-1/2/3, dan Metrics & events yang bergantung pada klasifikasi status ditandai **blocked
  on H-DS-1**, mengikuti pola yang sudah dipakai `US-FND-INT-001` untuk gap transformasinya
  sendiri di file yang sama — threshold `[proposed]` dipertahankan sebagai desain, bukan dihapus.
- **File terdampak:** `DOCS/prd/PRD-003-foundation-domain-en.md` (`US-FND-AST-001`,
  `US-FND-AST-002`, `US-FND-INT-003`), `LOGS/decisions/2026-09-04-asset-ontology-screen-merge.md`
  (§Konsekuensi).
- **Tidak diubah:** `DOMAINS/FOUNDATION/DOCS-EN/04-asset-ontology.md`,
  `DOMAINS/FOUNDATION/DOCS-EN/13-data-source.md`, `DOMAINS/FOUNDATION/UX/04-asset.md` — sudah
  benar, hanya PRD-003 dan satu koreksi decision log yang perlu berubah. Sesi ini tidak menyentuh
  bagian lain PRD-003.

## 2026-09-04 — Koreksi pemetaan taksonomi (kode modul PRD ≠ Feature otomatis), tambah README + issue template

- **Tipe:** koreksi dokumen sesi berjalan + artifact baru
- **Domain:** product-owner
- **Kenapa:** klaim di entri taksonomi 2026-09-04 sebelumnya ("kode modul §4 = Module",
  "layar `SCR-*` = Feature") ternyata terlalu luas. PO mengecek screenshot UI nyata/rencana:
  Module yang benar adalah level kartu launcher (Master Data, Shopfloor, OEE Monitoring, Job
  Schedule, dst.), bukan kode modul PRD. Kode modul PRD (`SIT`, `SHF`, `FSC`, `REF`, `AST`,
  `DSR`, `PRO`, dst.) hanyalah namespace ID untuk user story — posisi taksonomi aslinya
  bervariasi dan harus dicek ke UI: `SIT` = Feature; `SHF`/`FSC` = Capability nested di dalam
  Feature `SIT` (sudah benar di `DOMAINS/FOUNDATION/UX/01-site-hierarchy.md`, tidak diubah);
  `REF` = bungkusan 4 Feature (UOM, time conversion, downtime reason, reject/rework reason);
  `AST`/`DSR`/`PRO` = anggapan kerja satu Feature masing-masing, belum terverifikasi
  screenshot. Asimetri Module: FOUNDATION tampak membundel banyak kode modul ke satu kartu
  "Master Data" (anggapan kerja), PRODUCTION satu kode modul = satu kartu (terkonfirmasi).
- **File terdampak:**
  - `DOCS/02-domains.md` §"Taksonomi platform (8 level)" — tabel pemetaan direvisi (Module =
    kartu launcher, Feature = sidebar item/`SCR-*`, Capability = operasi/panel nested), tambah
    subbagian "Kode modul PRD ≠ level taksonomi tetap" dengan tabel bukti per kode modul dan
    aturan mengikat baru: setiap deklarasi wajib menyatakan level + verifikasi ke UI nyata,
    tidak boleh asumsi kode modul baru = Feature baru
  - `.claude/skills/molca-domain-agent/SKILL.md` — pointer ke bagian taksonomi ditambah
    pengingat eksplisit verifikasi level ke UI sebelum membuat kode modul baru
  - `AGENTS.md` §1 — daftar `README.md` dan `.github/ISSUE_TEMPLATE/` (baru, sebelumnya tidak
    terdaftar)
- **Artifact baru:**
  - `README.md` (root) — pintu masuk GitHub, menunjuk ke `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`,
    dan template issue deklarasi taksonomi
  - `.github/ISSUE_TEMPLATE/domain-declaration.md` — template issue GitHub untuk deklarasi
    Domain/Module/Feature/Capability, memaksa pemilihan level lewat checklist dan pertanyaan
    eksplisit "bisa jadi ini Capability nested di Feature yang sudah ada?" untuk mencegah
    kesalahan yang sama (kasus Shift/Fiscal Year)
  - `.github/ISSUE_TEMPLATE/config.yml` — `blank_issues_enabled: true`, tanpa contact links
- **Tidak diubah:** `DOMAINS/FOUNDATION/UX/01-site-hierarchy.md` — konten `UX-SIT-2` sudah
  benar sejak awal, ini murni koreksi tulisan meta di `02-domains.md`

## 2026-09-04 — Tetapkan taksonomi platform 8 level (Domain→...→Permission) untuk semua domain baru

- **Tipe:** aturan kerja baru (kontrak lintas domain)
- **Domain:** product-owner
- **File terdampak:**
  - `DOCS/02-domains.md` (baru: bagian "Taksonomi platform (8 level)" — tabel 8 level OHARA
    Platform + tabel pemetaan MolcaDx: Domain=folder `DOMAINS/<DOMAIN>/`, Module=kode modul
    `AGENTS.md` §4, Feature=layar `SCR-*` di `<DOMAIN>/UX/`, Capability=user story PRD,
    Action/Function=baris task breakdown, Permission=klaim scope ABAC/IDP)
  - `AGENTS.md` §1 (satu baris pointer ke bagian baru, sebelum "Layout domain")
  - `DOCS/templates/domain-agent-template.md` §1 Mission (pointer: cek taksonomi sebelum
    mengunci scope domain baru)
  - `.claude/skills/molca-domain-agent/SKILL.md` step 1 (baca bagian taksonomi sebagai bagian
    dari `DOCS/02-domains.md` sebelum membuat domain baru)
- **Perubahan:** memformalkan taksonomi 8 level (Platform/Product Suite/Domain/Module/Feature/
  Capability/Action-Function/Permission) yang sebelumnya hanya pengetahuan tribal PO, sebagai
  pemetaan atas artifact yang sudah ada — tidak menambah entitas atau skema ID baru. Berlaku
  mengikat: domain/module/feature/story baru sejak tanggal ini wajib bisa ditempatkan di
  hierarki ini; kalau tidak pas, itu sinyal cakupan salah skala, bukan alasan melewati aturan.
- **Alasan:** PO memberi referensi taksonomi standar OHARA Platform (dipakai lintas produk
  MolcaDX/Savior/MolcaTwin) dan meminta ini jadi kontrak baku, bukan pengetahuan tak tertulis,
  agar konsisten saat domain baru (design/engineering/data/ops) dibuat lewat skill
  `molca-domain-agent`.

---

## 2026-09-04 — FOUNDATION: akui screen merge Asset Ontology (issue #18)

- **Tipe:** keputusan (rekonsiliasi spec vs implementasi yang sudah dikirim)
- **Domain:** foundation-domain
- **File terdampak:**
  - `LOGS/decisions/2026-09-04-asset-ontology-screen-merge.md` (baru)
  - `DOMAINS/FOUNDATION/UX/04-asset.md`
  - `DOCS/prd/PRD-003-foundation-domain-en.md` (§7.1 Screen map only — bukan heading/anchor
    blok detail story, yang sedang diperbaiki agent lain di sesi ini secara paralel)
- **Perubahan:** `SCR-FND-AST-001` (Class/type taxonomy editor) dan `SCR-FND-AST-002`
  (Asset register) — dua layar terpisah di spec asli — diakui sebagai satu layar gabungan
  tree+detail dengan tiga view (Tree/Diagram/Table), sesuai yang sudah dikirim frontend
  (`mes-master-data-fe-test`, di luar repo ini). Tree/Diagram kini menampilkan daftar rata
  aset Equipment-unit dengan Class/Type sebagai badge kecil (nesting 3 level dihapus); Table
  tetap menampilkan hierarki penuh dan menjadi satu-satunya tempat mengedit taksonomi.
  `SCR-FND-AST-001` dipertahankan sebagai ID tunggal untuk layar gabungan; `SCR-FND-AST-002`
  di-retire (dilebur, ID tidak dipakai ulang). Ditambahkan: badge Class/Type di Tree/Diagram
  bisa diklik dan melompat ke baris yang cocok di Table (pre-filtered + highlighted),
  mengikuti pola "reachable directly and via a link" yang sudah dipakai `SCR-FND-AST-003`.
  Referensi `SCR-FND-AST-002` di `SCR-FND-AST-003`'s picker dan `UX-AST-3` diperbarui ke
  `SCR-FND-AST-001`; `UX-AST-1`/`UX-AST-2` tidak terdampak, tidak diubah.
- **Rule 1b (sinkronisasi PRD):** `DOCS/prd/PRD-003-foundation-domain-en.md` §7.1 Screen map
  diperbarui (dua baris "Asset taxonomy"/"Asset list & detail" digabung jadi satu baris layar
  gabungan). AC/data & entitas/rules `US-FND-AST-001`/`002`/`003` diperiksa — **tidak
  menyebut struktur dua layar secara eksplisit dan tidak berubah oleh keputusan ini,
  jadi tidak disinkronkan**. `DOCS/prd/PRD-003-task-breakdown.md` diperiksa — task UI level
  (mis. "two-panel default" pada `US-FND-AST-001`) menjelaskan layout di dalam sebuah view,
  kompatibel dengan Table view pada layar gabungan, **tidak disinkronkan**.
- **DOCS-EN:** `04-asset-ontology.md` dicek, tidak menyebut SCR ID apa pun — tidak ada
  perubahan entitas, ini murni keputusan layer UX. Tidak disentuh.
- **Alasan:** lihat decision doc — split by task (browse vs manage taksonomi), bukan by
  entity, dan memperbaiki keluhan usability nyata (scroll 3 level untuk cari satu mesin).

---

## 2026-09-04 — PRD-003: perbaikan mekanis anchor heading, kompatibilitas Obsidian

- **Tipe:** perbaikan mekanis (bukan keputusan konten)
- **Domain:** product-owner
- **File terdampak:** `DOCS/prd/PRD-003-foundation-domain-en.md`
- **Perubahan:** 20 heading blok detail story memakai pola `` `ID`: Judul `` (kolon langsung
  setelah backtick penutup, tanpa spasi) alih-alih pola `` `ID` — Judul `` (em dash + spasi) yang
  dipakai 28 heading lain di file yang sama. Kedua pola menghasilkan slug anchor GFM yang identik
  secara matematis, tapi Obsidian gagal mencocokkan link ke pola kolon — link yang menunjuk ke 20
  heading itu tampil "Unable to find" di Obsidian meski valid di GitHub. Root cause: generator ID
  heading Obsidian menangani `` `ID`: `` berbeda dari slugger GFM standar.
  Diperbaiki: 20 heading diubah dari kolon ke em dash (`US-FND-REF-001..006`, `PRO-001..004`,
  `KPI-001..007`, `FYR-001..003`) — sekarang seragam dengan 28 heading lainnya, total 48. Karena
  em dash menghasilkan double-hyphen pada slug (pola yang sama seperti heading `AST-*` yang sudah
  benar), 99 link internal yang menunjuk ke 20 anchor ini diperbarui dari single-hyphen ke
  double-hyphen setelah nomor story (mis. `#us-fnd-ref-003-scope-...` →
  `#us-fnd-ref-003--scope-...`) — mencakup baris tabel ringkasan, kolom Dependensi, referensi
  silang antar-story, dan baris "Replaced by"/"CLOSED". `DOCS/prd/PRD-003-task-breakdown.md`
  dicek — tidak berisi link ke anchor PRD-003, tidak ada perubahan di file itu. `PRD-001` dan
  `PRD-002` dicek juga — link mereka ke pola nama anchor yang sama menunjuk ke heading lokal milik
  file masing-masing (dokumen beku/usang, bukan cross-file ke PRD-003), jadi di luar cakupan
  perbaikan ini.
- **Alasan:** bug kompatibilitas render, tidak mengubah isi/keputusan produk apa pun — semua teks
  story, urutan, dan makna tetap sama persis.
- **Verifikasi:** 0 heading pola kolon tersisa di file (`grep '^#### \`US-FND-.*\`:'` → 0 match,
  48 match untuk pola em dash). 0 link lama (single-hyphen) tersisa yang menunjuk ke 20 anchor ini
  di file manapun dalam repo.

---

## 2026-09-04 — Data Source: tutup H-DS-4 — `DATA_SOURCE` wajib `site_id`, skop ABAC turun ke `site`

- **Tipe:** keputusan PO, tutup pertanyaan terbuka
- **Domain:** FOUNDATION
- **File terdampak:** `DOMAINS/FOUNDATION/DOCS-EN/13-data-source.md` (§9.1 entity spec, "How the
  entities connect", "What's still unknown", "Next step"), `DOMAINS/FOUNDATION/DOCS-EN/00-1-authorization-permissions.md`
  (§ Data Source), `DOCS/prd/PRD-003-foundation-domain-en.md` (`US-FND-INT-001` rule ⑦, AC-7),
  `DOCS/prd/PRD-003-task-breakdown.md` (`T-US-FND-INT-001-21`, `-29`)
- **Perubahan:** Product Owner memutuskan `DATA_SOURCE` **wajib** punya FK `site_id` ke `SITE`
  (Site Hierarchy §9.3) — satu PLC/OPC UA server/MQTT broker terpasang fisik di satu site, tidak
  bisa dipakai lintas site. Ditambahkan sebagai field wajib baru di §9.1, dicatat sebagai
  penyelesaian H-DS-4 (ditandai coret, bukan dihapus — mengikuti pola S-1..S-4 di
  `01-site-hierarchy.md`). "How the entities connect" diperbarui — kalimat lama "`DATA_SOURCE`
  has no FK of its own into Site Hierarchy" tidak berlaku lagi. Ditambahkan aturan validasi baru:
  setiap `ASSET_TAGS` yang menunjuk ke suatu `DATA_SOURCE` harus milik aset dengan site yang sama
  dengan `DATA_SOURCE.site_id` — berbagi lintas site dilarang, berbagi lintas `WORK_UNIT`/`WORK_CENTER`
  dalam site yang sama tetap boleh (skop tidak turun sampai `work_unit`).
  `00-1-authorization-permissions.md` diperbarui: skop ABAC `DATA_SOURCE` diturunkan dari
  `tenant` ke `site` (contoh permission string `foundation:dsr:site:update`), dengan catatan
  eksplisit bahwa resolusi `tenant` sebelumnya kelewat luas — ditambal di sesi ini.
  **Sinkronisasi PRD (aturan 1b):** `US-FND-INT-001` (modul INT, PRD-003) menyebut skop `tenant`
  untuk `DATA_SOURCE` di rule ⑦ dan AC-7 — diperbarui ke `site` + catatan tanggal + aturan validasi
  cross-site baru. `PRD-003-task-breakdown.md` (task ClickUp-ready turunan PRD-003) juga
  disesuaikan pada dua baris yang menyebut skop `tenant` secara eksplisit
  (`T-US-FND-INT-001-21`, `-29`). Tidak ada story `DSR` tersendiri di PRD-003 — modul Data Source
  baru punya baris ABAC, belum punya user story sendiri, jadi tidak ada story lain yang perlu
  disinkronkan selain `US-FND-INT-001`.
- **Alasan:** menutup H-DS-4 sesuai keputusan PO sesi ini. H-DS-1/H-DS-2/H-DS-3 **tidak** disentuh
  — tetap terbuka seperti sebelumnya.
- **Backlog eksplisit:** belum ada story `US-FND-DSR-*` khusus modul Data Source di PRD-003 —
  `US-FND-INT-001` masih membawa isi F-13 di bawah kode modul `INT` (lihat `TBD` yang sudah ada di
  story itu soal pemisahan `DSR`/`INT`). Kalau story `DSR` tersendiri nanti dibuat, ia harus
  mewarisi skop `site` ini sejak awal, bukan mengulang draft `tenant` yang baru diperbaiki.

## 2026-09-04 — Data Source: buka H-DS-4 (tenant-wide scope vs `site_id`/`enterprise_id` FK)

- **Tipe:** tambah pertanyaan terbuka
- **Domain:** FOUNDATION
- **File terdampak:** `DOMAINS/FOUNDATION/DOCS-EN/13-data-source.md` (§ "What's still unknown")
- **Perubahan:** ditambahkan `H-DS-4` — apakah `DATA_SOURCE` seharusnya tetap tanpa FK ke Site
  Hierarchy sama sekali (tenant-wide, sesuai resolusi ABAC saat ini di
  `00-1-authorization-permissions.md`), atau seharusnya punya `site_id`/`enterprise_id` FK.
  Alasan "satu koneksi bisa melayani tag di lebih dari satu `WORK_UNIT`" hanya menjustifikasi
  tidak diskop ke `work_unit`/`site`-sempit untuk kasus berbagi yang disebutkan (satu PLC untuk
  beberapa stasiun di lini/site yang **sama**) — bukan alasan untuk melompat langsung ke
  tenant-wide tanpa FK sama sekali, mengingat satu PLC/OPC UA/MQTT broker secara fisik terpasang
  di satu site, bukan tersebar lintas enterprise/site dalam satu tenant. Tidak menjawab
  pertanyaannya — hanya mendokumentasikan celahnya, sesuai pola B7 yang sudah ada di file yang
  sama (kesimpulan skop yang diambil tanpa keputusan tertulis yang menutup opsi antara).
- **Alasan:** user meminta scoping review DATA_SOURCE vs ASSET (per-tenant/enterprise locking).
  Investigasi menemukan bahwa kesimpulan tenant-scope di ABAC catalog melompati opsi site-level
  tanpa pembahasan eksplisit — celah nyata, bukan yang sudah ditutup H-DS-1/2/3. Tidak mengubah
  file `00-1-authorization-permissions.md` (bukan file domain data-source, dan resolusinya sendiri
  tidak salah secara mekanis — hanya belum lengkap alasannya) — ditandai sebagai pertanyaan
  terbuka di modul yang memilikinya.

## 2026-09-04 — Skrip baru: `scripts/export-doc.sh` (markdown → PDF/Word)

- **Tipe:** tambah (skrip baru, diminta eksplisit oleh user)
- **Domain:** Product Owner
- **File terdampak:** `scripts/export-doc.sh` (baru), `scripts/pdf-style.css` (baru), `AGENTS.md`
  (§1 daftar `scripts/`, §6 perbaikan baris `pdf` yang ternyata bukan skill nyata)
- **Perubahan:** user minta cara mengekspor PRD ke PDF, lalu (karena sudah pakai Obsidian untuk
  PDF) minta juga opsi Word. `AGENTS.md` §6 sudah lama menyebut skill `pdf` — dicek, **skill itu
  tidak pernah ada** (tidak terdaftar di skill list Claude Code, tidak ada di manapun di disk).
  Repo juga tidak punya toolchain PDF/Word lokal (tidak ada `pandoc`/`wkhtmltopdf`/`weasyprint`/
  Chrome headless). Dibuatkan satu skrip yang menangani keduanya:
  `scripts/export-doc.sh <src.md> [output.pdf|output.docx] [--portrait]` — format dipilih dari
  ekstensi output. Word cukup `pandoc` saja (konversi native ke `.docx`, tidak butuh
  `wkhtmltopdf`). PDF tetap lewat `pandoc --pdf-engine=wkhtmltopdf`, default A4 landscape karena
  kebanyakan tabel PRD di repo ini terlalu lebar untuk portrait, styling lewat
  `scripts/pdf-style.css` yang bisa diedit terpisah. Baris `pdf` di §6 diperbaiki menunjuk skrip
  ini, bukan skill fantasi.
- **Belum diverifikasi jalan:** `pandoc`/`wkhtmltopdf` tidak bisa dipasang oleh agent (perlu
  `sudo`, environment ini minta password yang agent tidak punya). User perlu memasang sendiri
  (`sudo apt-get install -y pandoc wkhtmltopdf` di Debian/Ubuntu, `brew install pandoc
  wkhtmltopdf` di macOS) sebelum skrip ini bisa dicoba end-to-end — Word saja hanya butuh
  `pandoc`, tanpa `wkhtmltopdf`.
- **Alasan:** ekspor PRD ke PDF/Word dibutuhkan berulang; skrip lintas-tool (bukan skill
  Claude-only) dipilih user supaya tim yang pakai Cursor/Antigravity juga bisa pakai tanpa AI.

---

## 2026-09-04 — Regenerasi task breakdown `US-FND-INT-001` mengikuti perbaikan PRD-003

- **Tipe:** ubah (menyelesaikan backlog eksplisit dari entri perbaikan `US-FND-INT-001` sebelumnya
  hari ini — task breakdown belum ikut diperbarui saat itu)
- **Domain:** Product Owner
- **File terdampak:** `DOCS/prd/PRD-003-task-breakdown.md`
- **Perubahan:** Task table `US-FND-INT-001` (35 task lama, berbasis badan story yang salah)
  ditulis ulang jadi 33 task berbasis badan story yang sudah diperbaiki:
  - Task "model entitas di DOCS-EN" dan "rekonsiliasi note vs badan" dihapus — sudah tidak relevan
    karena `DATA_SOURCE`/`ASSET_TAGS` sudah dimodelkan penuh (bukan concept-only), dan rekonsiliasi
    sudah selesai di PRD.
  - Task schema/api/ui/validation/abac/test/event diturunkan ulang dari field nyata `DATA_SOURCE`
    (F-13 §9.1) dan `ASSET_TAGS` (F-04 §9.7), bukan `CONNECTOR`/`TAG_MAPPING` lama.
  - Task yang bergantung pada field `scale`/`offset`/`interpretation_rules` yang tidak ada
    (AC-1 sebagian, AC-3, AC-5, satu event) ditandai eksplisit BLOCKED merujuk task docs baru
    (`T-US-FND-INT-001-02`), bukan dibangun dengan field karangan.
  - Catatan pembuka bagian Integration, bagian "Ambiguity flags" batch C, tabel Totals, dan daftar
    "Next steps" di kepala dokumen semuanya diperbarui — total task keseluruhan turun dari 1.326
    jadi **1.324** (verified via grep).
- **Alasan:** rule 1b — dokumen turunan dari PRD wajib ikut disinkronkan saat PRD sumbernya
  berubah, sama seperti PRD itu sendiri wajib disinkronkan saat DOCS-EN berubah.
- **Dampak:** `DOCS/prd/PRD-003-task-breakdown.md` sekarang konsisten penuh dengan PRD-003 per
  2026-09-04. `US-FND-DSR-001` split question dan gap `scale`/`offset` masih terbuka, tidak
  diputuskan sesi ini.

---

## 2026-09-04 — Perbaiki `US-FND-INT-001`: badan story akhirnya disamakan dengan catatan rewrite-nya

- **Tipe:** ubah (memperbaiki bug yang ditemukan agent task-breakdown sesi sebelumnya hari ini)
- **Domain:** Product Owner
- **File terdampak:** `DOCS/prd/PRD-003-foundation-domain-en.md`
- **Perubahan:** Catatan rewrite 2026-09-03 di atas `US-FND-INT-001` mengklaim story ini sudah
  dipindah dari `CONNECTOR`/`TAG_MAPPING` ke `ASSET_TAGS`/`DATA_SOURCE`, tapi seluruh badan tabel
  (Context, Calculation, Data & entitas, Rules, semua AC, Metrics & events) masih menyebut
  `CONNECTOR`/`TAG_MAPPING` apa adanya — rewrite sebelumnya cuma menyentuh catatan, bukan isinya.
  Sesi ini badan tabel benar-benar ditulis ulang:
  - **Data & entitas** sekarang menulis `DATA_SOURCE` (F-13 §9.1: `name`, `protocol`,
    `connection_config`, `heartbeat_interval`/`last_seen_at`) dan `ASSET_TAGS` (F-04 §9.7:
    `asset_id`, `data_source_id`, `node`, `kind`, `tag_role`, dst.) — field diambil langsung dari
    spec, bukan dikarang.
  - **Rule ①** diperbaiki: mengklaim "signal type baru tidak perlu code change" padahal `tag_role`
    adalah enum tertutup di F-04 §9.7 — klaim lama dikoreksi eksplisit, bukan didiamkan.
  - **Rule ⑤** (versi kontrak) dihapus — itu aturan F-11 Integration (ERP), tidak ada padanannya
    di F-13 Data Source, tidak dikarang penggantinya.
  - **Rule ⑦** (akses) diperbaiki jadi dua tier: `DATA_SOURCE` scope `tenant`, `ASSET_TAGS` scope
    `work_unit` — diambil dari `00-1-authorization-permissions.md`, bukan diasumsikan sama seperti
    sebelumnya (dulu satu scope `site` untuk semuanya).
  - **Gap baru ditemukan, sengaja tidak diselesaikan sendiri:** baik `DATA_SOURCE` maupun
    `ASSET_TAGS` tidak punya field `scale`/`offset`/`interpretation_rules` — mekanisme transformasi
    nilai yang jadi inti Calculation section lama tidak punya rumah di entitas nyata. Ditandai
    `TBD — perlu konfirmasi foundation-domain` di badan story; AC-1/2/3/5 dan beberapa event
    ditandai blocked pending keputusan ini, bukan ditebak fieldnya.
  - **`US-FND-INT-003`** — baris Data & entitas yang masih mengutip `CONNECTOR`/`TAG_MAPPING`/
    `SYNC_RECEIPT` sebagai entitas yang dibaca ikut diperbaiki merujuk `DATA_SOURCE`/`ASSET_TAGS`,
    plus catatan bahwa kalkulasi `data_age_seconds`-nya mengasumsikan heartbeat level-koneksi
    padahal H-DS-1 (granularitas heartbeat) masih terbuka.
  - Header `Version` PRD-003 diperbarui mencatat perbaikan ini.
- **Alasan:** ditemukan oleh agent task-breakdown (`DOCS/prd/PRD-003-task-breakdown.md`, sesi
  sebelumnya hari ini) saat menurunkan task untuk `US-FND-INT-001` — badan story adalah satu-
  satunya bagian lengkap tapi isinya kontradiksi dengan catatan di atasnya. User eksplisit minta
  diperbaiki.
- **Dampak:** `DOCS/prd/PRD-003-task-breakdown.md` (dibuat sesi sebelumnya) **belum** disinkronkan
  ke perbaikan ini — task breakdown `US-FND-INT-001` di sana masih diturunkan dari badan story
  yang lama (versi `CONNECTOR`/`TAG_MAPPING`). Backlog eksplisit: task breakdown perlu diregenerasi
  untuk story ini di sesi berikutnya. `US-FND-DSR-001` split question tetap terbuka, tidak
  disentuh sesi ini.

---

## 2026-09-04 — Dokumen baru: PRD-003 Task Breakdown (1.326 task, siap-tempel ClickUp)

- **Tipe:** tambah (dokumen baru, diminta eksplisit oleh user)
- **Domain:** Product Owner
- **File terdampak:** `DOCS/prd/PRD-003-task-breakdown.md` (baru), `AGENTS.md` §2 (registrasi + perbaikan
  angka modul/story PRD-003 yang sudah usang: 13→12 modul, 51→48 story)
- **Perubahan:** user membandingkan PRD-003 terhadap template PRD internal perusahaan (11 bagian wajib,
  termasuk "Rincian ke Backlog/Epic" via ClickUp Story→Task) dan template ClickUp aktual
  (Project → Story list → Task list). PRD-003 berhenti di level story (apa yang dibangun + cara
  verifikasinya) — belum ada pemecahan ke level task implementasi. Dokumen baru ini mengisi gap itu:
  - Tiga agent paralel (per kelompok modul: SIT/SHF/FYR/AST · REF/PRO/KPI · WMS/WFE/NTF/INT/CFG)
    membaca PRD-003 dan memecah setiap story jadi task granular (`T-<STORY-ID>-<nn>`), diketik
    `schema`/`api`/`ui`/`validation`/`abac`/`event`/`test`/`docs`, dengan dependensi antar-task dan
    ukuran (`S`/`M`/`L`, dibias keras ke `S` sesuai permintaan "sekecil mungkin").
  - Story `CLOSED`/`BLOCKED`/pindah domain (`US-FND-WMS-001`, `SHF-003`, `SHF-004`, `AST-004`)
    dilewati sesuai instruksi PRD sendiri — tidak ada task yang dikarang untuk story yang PRD
    bilang jangan dibangun. `US-FND-KPI-006` (BLOCKED tapi PRD minta "ditulis penuh") tetap
    ditugaskan penuh dengan penanda BLOCKED per-task.
  - Setiap `TBD`/open question di dalam story (Q-18, Q-21, Q-24, P-1 scope, `is_oee_tracked`, dst.)
    dapat satu task `docs` eksplisit yang menyebut pertanyaannya, bukan ditebak.
  - Empat modul concept-only (WFE/NTF/INT/CFG) mendapat task prasyarat "model entitas modul ini di
    `DOCS-EN`" per story, karena tidak ada spesifikasi entitas untuk dijadikan task schema/api nyata.
  - **Temuan penting:** agent batch WMS/WFE/NTF/INT/CFG menemukan `US-FND-INT-001` kontradiksi
    internal — catatan rewrite 2026-09-03 klaim story ini sekarang menulis `ASSET_TAGS`/`DATA_SOURCE`,
    tapi badan story (Expectation/Calculation/Data & entitas/Rules/AC) masih menyebut bentuk lama
    `CONNECTOR`/`TAG_MAPPING` secara verbatim — rewrite sesi sebelumnya cuma mengubah catatannya,
    bukan badan story-nya. Task diturunkan dari badan story (satu-satunya bagian yang lengkap) plus
    satu task rekonsiliasi eksplisit; **belum diperbaiki di PRD-003 sendiri** — dicatat sebagai
    "Known gap to fix before use" di kepala dokumen baru.
  - Tiga agent menemukan beberapa ambiguitas tambahan (tidak ditebak, dicatat): mekanisme deteksi
    eligibility two-station Quality (`US-FND-KPI-003` rule ⑦), tie-break multi-reason-tag
    (`US-FND-KPI-006`), field satuan berat yang hilang (`US-FND-PRO-002`, Q-20 lama), integrasi IDP
    untuk recipient count (`US-FND-NTF-001`) — daftar lengkap ada di tiga bagian "Ambiguity flags"
    di dokumen baru.
- **Total:** 1.326 task lintas 44 story yang bisa dibangun (4 story ditutup/diblokir dilewati sesuai
  instruksi), 12 modul.
- **Alasan:** menutup item #11 template PRD perusahaan ("Rincian ke Backlog/Epic") yang sebelumnya
  dicatat sebagai gap nyata (bukan pilihan desain) di sesi sebelumnya hari yang sama.
- **Dampak:** dokumen ini **DRAFT**, belum direview PO/engineering — ukuran task (S/M/L) adalah
  estimasi struktural dari bentuk task, bukan story point yang dikalibrasi tim. `US-FND-INT-001`
  perlu diperbaiki di PRD-003 sebelum 9 task schema/api-nya dipercaya.

---

## 2026-09-03 — PRD-003: story baru `US-FND-KPI-007` (bind work unit ke KPI formula slot) — menutup gap FLOW/UX yang ternyata sudah ada

- **Tipe:** tambah (story baru, diminta eksplisit oleh user — rule 1 mengizinkan)
- **Domain:** Product Owner
- **File terdampak:** `DOCS/prd/PRD-003-foundation-domain-en.md`, `DOCS/01-glossary.md`
- **Konteks — koreksi klaim sebelumnya:** sesi ini PO sempat menyatakan FLOW/UX untuk F-07.1
  KPI tag mapping "belum ada", berdasarkan pencarian yang keliru. Setelah dicek ulang,
  `DOMAINS/FOUNDATION/FLOW/02-production-readiness.md`, `FLOW/05-kpi-computation.md`, dan
  `DOMAINS/FOUNDATION/UX/07-kpi.md` **sudah lengkap** — termasuk `SCR-FND-KPI-001/002/003`
  dan K-7 (siapa boleh menulis `WORK_UNIT_KPI_BINDING`) yang sudah resolved di sesi
  sebelumnya hari ini. Tidak ada FLOW/UX baru dibuat sesi ini — klaim sebelumnya ditarik.
  Gap yang benar-benar ada hanya dua: (1) tidak ada story PRD yang mengutip
  `SCR-FND-KPI-002`, (2) `KPI_FORMULA_SLOT`/`KPI_PARAMETERS`/`WORK_UNIT_KPI_BINDING` belum
  ada di `DOCS/01-glossary.md` meski dipakai luas di F-07.1 dan `US-FND-KPI-001-006`.
- **Perubahan:**
  - `US-FND-KPI-007` (Bind a work unit's tags to its KPI formula slots) ditambahkan ke §6.12
    KPI — story implementor untuk mengisi `WORK_UNIT_KPI_BINDING`, mengutip `SCR-FND-KPI-002`
    (sudah ada di `UX/07-kpi.md`) dan K-7 (sudah resolved). Blok detail 8 bagian penuh
    ditulis mengikuti format §4 `AGENTS.md`, termasuk worked example dari F-07.1 §9.4
    (checkweigher primary/secondary).
  - `US-FND-KPI-007` ditambahkan sebagai dependensi eksplisit ke `US-FND-KPI-001/002/003/006`
    — keempatnya membaca `WORK_UNIT_KPI_BINDING` langsung di bagian Data & entitas masing-
    masing (dicek satu per satu, bukan ditambahkan massal); `US-FND-KPI-004/005` tidak
    diubah karena keduanya hanya membaca `KPI_RESULT`/binding `US-FND-KPI-001` secara
    transitif, tidak langsung.
  - Metadata header (`Version`, `Scope`, narasi §1) diperbarui: 47 → 48 story, 12 modul tetap.
  - `DOCS/01-glossary.md` — tiga entri baru: **KPI formula slot**, **KPI parameters**,
    **KPI binding**, merujuk F-07.1 §9.1/§9.3/§9.4 (rule 7).
- **Alasan:** user eksplisit meminta ("try to generate the flow and ux prd for 07 kpi formula
  and tagging"); investigasi menunjukkan FLOW/UX sudah lengkap, jadi permintaan dipenuhi
  lewat PRD (satu-satunya bagian yang benar-benar kosong) plus glossary.
- **Dampak:** PRD-003 sekarang punya story eksplisit untuk aksi yang sebelumnya hanya
  tersirat di `US-FND-KPI-001`'s AC-12 ("no binding → no_data") tanpa story yang
  menghasilkan binding itu sendiri.

---

## 2026-09-03 — PRD-001 dibekukan; PRD-003 jadi acuan aktif domain FOUNDATION

- **Tipe:** ubah (status dokumen, `AGENTS.md` §2)
- **Domain:** Product Owner
- **File terdampak:** `AGENTS.md`
- **Perubahan:** PO memutuskan PRD-001 tidak disinkronkan lagi mulai sesi ini. Baris indeks
  §2 diperbarui: PRD-001 status 🟡 DRAFT v0.2 → 🔴 **BEKU** v0.2, deskripsi mencatat PRD-003
  sekarang jadi acuan untuk FOUNDATION, sementara PRD-001 tetap satu-satunya rujukan untuk 3
  modul PRODUCTION (Shopfloor, OEE Monitoring, Job Schedule) sampai domain itu punya PRD
  sendiri — dibaca sebagai snapshot beku, bukan dokumen hidup. PRD-003 deskripsinya diperbarui
  jadi "acuan aktif domain FOUNDATION", catatan tumpang-tindih historis dengan PRD-001 ditandai
  tidak lagi relevan.
- **Alasan:** user eksplisit "ignore prd-001 since we wont update that again" (2026-09-03).
  Konsekuensi langsung: rule 1b (`AGENTS.md` §5.1b) sekarang hanya berlaku untuk PRD-003 —
  keputusan `DOCS-EN`/`UX`/`FLOW` FOUNDATION yang mengubah story tidak lagi wajib disinkronkan
  ke PRD-001.
- **Dampak:** backlog PRD-001 yang sebelumnya dicatat (label `F-XX` salah di 8 baris tabel
  readiness, entri changelog sesi sebelumnya) resmi moot — tidak perlu diperbaiki. Domain
  PRODUCTION belum punya PRD berlingkup domain sendiri; ini gap terbuka yang belum diminta PO
  untuk ditutup.

---

## 2026-09-03 — Menuntaskan backlog sinkronisasi PRD: rename `US-FND-WMS-004`→`US-PROD-JOB-005`, rewrite `US-FND-INT-001`, review story PRODUCTION native, perbaikan label F-08

- **Tipe:** ubah (menuntaskan 4 item backlog dari entri "PRD-001/PRD-003: sinkronisasi rule 1b
  atas 7 blocker contest review" — sesi sebelumnya sempat terhenti di tengah pekerjaan ini;
  entri tersebut sekarang **usang pada bagian "kandidat rename" dan "backlog" poin 1/2/4** —
  keempatnya sudah dieksekusi, dicatat di sini, bukan diedit ulang di entri lama)
- **Domain:** Product Owner
- **File terdampak:** `DOCS/prd/PRD-001-molcadx-core-q3-en.md`, `DOCS/prd/PRD-003-foundation-domain-en.md`
- **Perubahan:**
  1. **Rename dieksekusi** — `US-FND-WMS-004` (Create & release a work order) resmi jadi
     `US-PROD-JOB-005`, dipindah dari section FOUNDATION Work Master ke §6.14 PRODUCTION Job
     Schedule di kedua PRD. ID lama ditandai `~~US-FND-WMS-004~~` dengan catatan "RENAMED,
     2026-09-03" dan tidak dipakai ulang (`AGENTS.md` §4 aturan dependensi). Semua kolom
     Dependensi yang tadinya merujuk `US-FND-WMS-004` diperbarui ke `US-PROD-JOB-005`. Cakupan
     PRD-003 turun jadi **47 story, 12 modul** (dari 48) karena story ini bukan lagi milik
     FOUNDATION.
  2. **`US-FND-INT-001` ditulis ulang** — bentuk `CONNECTOR`/`TAG_MAPPING` yang diusulkan
     sebelumnya dibuang; story sekarang menulis entitas nyata `ASSET_TAGS` (F-04 §9.7) dan
     `DATA_SOURCE` (F-13 §9.1, B7). Ditinggalkan satu `TBD — perlu konfirmasi PO` eksplisit:
     apakah story ini perlu dipecah jadi `US-FND-DSR-001` (deklarasi koneksi `DATA_SOURCE`) +
     `US-FND-INT-001` yang menyempit ke ERP saja — belum dieksekusi, keputusan penomoran PO.
  3. **Story PRODUCTION native ditinjau** (`US-PROD-OEE-001/003/004/005`, `US-PROD-JOB-001-004`,
     PRD-001) — semuanya membaca `SHIFT_INSTANCE`/`ASSET_STATE_LOG` langsung atau melalui story
     yang dependen; ditambahkan catatan risiko B1 (`SHIFT_INSTANCE` generator tak berpemilik,
     F-02 `DRAFT`) dan B5 (`ASSET_STATE_LOG` reopened, A-5) di setiap Context yang relevan —
     `US-PROD-OEE-001` dan `US-PROD-JOB-001` memuat penjelasan penuh, story turunannya
     merujuk balik untuk menghindari duplikasi teks.
  4. **Label modul Work Master diperbaiki** — tabel "Readiness status per module" (PRD-001 §readiness)
     baris Work Master menyebut dokumen basisnya "F-02" padahal file yang dirujuk (href) adalah
     `08-work-master.md`; diperbaiki jadi "F-08". Catatan tambahan: baris "work order source"
     diarahkan ke baris Job Schedule (JS-1) karena pertanyaan itu sekarang milik PRODUCTION.
- **Backlog baru, ditemukan saat mengerjakan poin 4 (belum diperbaiki sesi ini):** seluruh
  tabel "Readiness status per module" (PRD-001, sekitar baris 102–114) memakai label `F-01`…`F-10`
  yang **tidak cocok** dengan nomor file `DOCS-EN` sebenarnya di 8 dari 9 baris FOUNDATION
  (mis. Site Hierarchy diberi label `F-04` padahal filenya `01-site-hierarchy.md`; Asset Ontology
  diberi `F-01` padahal filenya `04-asset-ontology.md`). Ini bukan typo tunggal — polanya
  sistemik di seluruh tabel, kemungkinan skema penomoran lama yang tidak diperbarui saat file
  `DOCS-EN` diberi nomor ulang. Hanya baris Work Master (poin 4 di atas) yang diperbaiki sesi
  ini karena itu satu-satunya yang diminta; 8 baris sisanya butuh sesi tersendiri untuk
  diverifikasi satu per satu terhadap nomor file aktualnya sebelum diperbaiki massal.
- **Alasan:** rule 1b — menuntaskan pekerjaan yang tercatat eksplisit sebagai backlog di entri
  changelog sebelumnya, bukan dibiarkan diam.
- **Dampak:** PRD-001/PRD-003 kini konsisten penuh dengan keputusan
  [`2026-09-03-foundation-contest-blockers.md`](decisions/2026-09-03-foundation-contest-blockers.md)
  untuk semua story FOUNDATION yang terdampak, plus story PRODUCTION native di PRD-001. Sisa
  terbuka: keputusan rename `US-FND-INT-001`/`US-FND-DSR-001` (PO), dan label F-XX yang salah
  di 8 baris tabel readiness (backlog baru, di atas).

---

## 2026-09-03 — FOUNDATION FLOW/UX: perbaiki rujukan WORK_ORDER/WORK_ORDER_OPERATION pasca pindah ke PRODUCTION

- **Tipe:** ubah (tindak lanjut backlog eksplisit dari entri changelog sesi sebelumnya —
  "PRD-001/PRD-003: sinkronisasi rule 1b atas 7 blocker contest review" — dan
  [`2026-09-03-foundation-contest-blockers.md`](decisions/2026-09-03-foundation-contest-blockers.md)
  "Keputusan struktural — WORK_ORDER/WORK_ORDER_OPERATION pindah ke PRODUCTION")
- **Domain:** FOUNDATION
- **File terdampak:** `DOMAINS/FOUNDATION/FLOW/00-flow.md`, `DOMAINS/FOUNDATION/FLOW/04-daily-runtime.md`,
  `DOMAINS/FOUNDATION/FLOW/05-kpi-computation.md`, `DOMAINS/FOUNDATION/UX/08-work-master.md`
- **Perubahan:**
  - **`FLOW/00-flow.md`** — tabel pemetaan IEC 62264-3 diperbaiki: baris "Production
    dispatching / execution management" dan "Production data collection" tadinya menyebut
    `WORK_ORDER`/`WORK_ORDER_OPERATION` seolah kontribusi FOUNDATION (F-08/F-02/F-04); sekarang
    eksplisit menyebut kedua entitas milik PRODUCTION, merujuk `job-schedule.md §2.1`/`§2.2`,
    dan menyisakan hanya bagian yang memang FOUNDATION punya (`SHIFT_INSTANCE` context,
    `ASSET_STATE_LOG`, mekanisme versi `ROUTING`/`BOM` yang dikunci WO). Baris traceability
    "Versioned routing/BOM locked at WO release" diperbarui jadi rujukan dua domain (FOUNDATION
    untuk mekanisme versi pada `ROUTING`/`BOM`, masih terbuka di W-8; PRODUCTION untuk field
    `WORK_ORDER` yang dikunci).
  - **`FLOW/04-daily-runtime.md`** — node `OUTP` (channel operator) ditandai `WORK_ORDER_OPERATION`
    milik PRODUCTION, bukan didefinisikan ulang di sini; catatan lintas-domain baru ditambahkan
    setelah diagram merujuk `job-schedule.md §2.2`, termasuk perubahan grain
    (`scrap_qty`/`rework_qty` sekarang turunan dari `WORK_ORDER_OPERATION_DEFECT`, bukan field
    yang diisi langsung).
  - **`FLOW/05-kpi-computation.md`** — node `MULTI` (segmentasi multi-SKU) ditandai
    `WORK_ORDER_OPERATION` milik PRODUCTION; catatan lintas-domain baru merujuk
    `job-schedule.md §2.2`.
  - **`UX/08-work-master.md`** — catatan pemindahan struktural ditambahkan di kepala dokumen;
    `Coverage` line diperbaiki (rule D-1 tidak lagi berlaku untuk `WORK_ORDER`/
    `WORK_ORDER_OPERATION` karena keduanya bukan lagi entitas §9 F-08). `SCR-FND-WMS-004`
    (Work order create & release) dan `SCR-FND-WMS-006` (Operation progress) ditandai **di luar
    cakupan FOUNDATION** — **tidak dihapus** karena PRODUCTION belum punya seri `UX/` sendiri
    ([`UX/00-ux.md`](../DOMAINS/FOUNDATION/UX/00-ux.md) scope note 2026-08-26) dan ini satu-satunya
    tempat kedua layar itu terdokumentasi; ditandai agar `production-domain` bisa
    memindahkan/retire-kan dengan `SCR-PROD-*` baru saat serinya mulai (ID `SCR-FND-WMS-*` lama
    tidak pernah dipakai ulang, sesuai aturan ID di `UX/00-ux.md`). `SCR-FND-WMS-004` juga
    ditandai field `routing_version_locked`/`bom_version_locked` masih `TBD` (bergantung W-8),
    dan `SCR-FND-WMS-005` ditandai bergantung field `disposition` yang belum ada di F-08 §9.7
    (W-9). Baris open question `UX-WMS-1` diperbarui: pertanyaan hidup sekarang di
    `job-schedule.md §2.3`, owner pindah ke `production-domain`.
- **Tidak diubah (butuh keputusan PO):** rename ID `US-FND-WMS-004` → kode modul PRODUCTION
  (mis. `US-PROD-JOB-*`) tetap belum dieksekusi, sudah dicatat sebagai keputusan terbuka di
  entri changelog sesi sebelumnya — tidak diulang di sini. Pemindahan konten `SCR-FND-WMS-004`/
  `-006` ke seri `UX/` PRODUCTION yang sesungguhnya juga menunggu PO membuka seri itu.

## 2026-09-03 — PRD-001/PRD-003: sinkronisasi rule 1b atas 7 blocker contest review (WORK_ORDER pindah domain, F-02 DRAFT, F-07 not-Ready, B6, A-5, F-13)

- **Tipe:** ubah (rule 1b — sinkronisasi PRD atas tindak lanjut keputusan
  [`2026-09-03-foundation-contest-blockers.md`](decisions/2026-09-03-foundation-contest-blockers.md) poin 3, PO)
- **Domain:** Product Owner
- **File terdampak:** `DOCS/prd/PRD-003-foundation-domain-en.md`, `DOCS/prd/PRD-001-molcadx-core-q3-en.md`
- **Perubahan (per story yang disentuh):**
  - **`US-FND-WMS-004`** (kedua PRD, teks identik) — ditandai entitas `WORK_ORDER`/
    `WORK_ORDER_OPERATION` sekarang milik PRODUCTION (§2.1–§2.2 `job-schedule.md`), bukan
    FOUNDATION lagi; **kandidat rename `US-FND-WMS-004` → `US-PROD-JOB-*`** dicatat sebagai
    keputusan terbuka, tidak dieksekusi sesi ini. Konteks diperbarui: W-1/JS-1 sekarang punya
    4 pertanyaan spesifik PO di `job-schedule.md §2.3`. Data & entitas ditambah
    `routing_version_locked`/`bom_version_locked` (tipe `TBD`, bergantung W-8). Aturan ②
    diperbaiki: versi dikunci saat **rilis** (`draft`→`released`), bukan saat **pembuatan** WO —
    bug faktual sebelumnya bertentangan dengan spec PRODUCTION.
  - **`US-FND-SIT-002`** (kedua PRD) — `WORK_ORDER_OPERATION` di rumus `blocker_count` ditandai
    PRODUCTION-owned (dibaca via FK lintas domain, bukan didefinisikan ulang); `ASSET_STATE_LOG`
    ditandai belum tersepesifikasi & kepemilikan disengketakan (A-5, reopened B5) — dicatat
    sebagai risiko pada satu dari tiga sumber blocker count, bukan blocker penuh story ini.
  - **`US-FND-KPI-001`** (kedua PRD) — catatan risiko ditambahkan di Context: POT/PBT bergantung
    `SHIFT_INSTANCE` yang generatornya tak berpemilik (B1, F-02 `DRAFT`); APT bergantung
    `ASSET_STATE_LOG` yang belum tersepesifikasi (B5/A-5). Story tetap bisa didesain & AC-nya
    tetap berlaku, tapi tidak bisa dibangun end-to-end sampai B1/B5 selesai.
  - **`US-FND-KPI-004`, `US-FND-KPI-005`** (kedua PRD) — catatan risiko pendek merujuk balik ke
    `US-FND-KPI-001`, karena keduanya membaca `SHIFT_INSTANCE`/`ASSET_STATE_LOG` langsung.
  - **`US-FND-SHF-002`** (kedua PRD) — catatan baru: story ini **adalah** generator
    `SHIFT_INSTANCE` yang kepemilikannya belum ditugaskan PO (B1) — kalimat lama "mekanisme dan
    daftar tanggal produksi tetap di `production-domain`" ditandai sebagai asumsi kerja story
    ini sendiri, **bukan** keputusan PO. Implementasi tidak boleh dimulai sebelum PO menugaskan
    pemilik generator; desain/kalkulasi/AC tetap valid untuk dikerjakan lebih dulu.
  - **`US-FND-AST-002`** (PRD-001 saja — versi PRD-003 sudah benar) — diperbaiki dari bug B6:
    kalkulasi `uninstalled_assets` dan Data & entitas tadinya memakai `ASSET.work_unit_id`
    (field yang sudah dihapus) dan menulis `ASSET.site_id` sebagai field independen (sekarang
    derived read-only dari `ASSET_PLACEMENT`). Rule ④ diperbaiki: komponen mewarisi site dari
    `ASSET_PLACEMENT` induk, bukan field `site_id`/`work_unit_id` sendiri.
  - **`US-FND-INT-001`** (kedua PRD) — ditandai `TBD — perlu konfirmasi foundation-domain`:
    entitas usulan `CONNECTOR`/`TAG_MAPPING` (masih ⚠ belum dimodelkan) kini tumpang tindih
    dengan `ASSET_TAGS` (F-04 §9.7, sudah tersepesifikasi) dan `DATA_SOURCE` (F-13, modul baru
    2026-09-03, B7). Story ini butuh penulisan ulang terhadap entitas nyata — tidak dieksekusi
    sesi ini karena mengubah seluruh bagian Data & entitas dan Calculation, bukan koreksi kecil.
  - Header metadata kedua PRD (`Version`/`Last FOUNDATION sync`) diperbarui mencatat sinkronisasi
    kedua di hari yang sama ini.
- **Alasan:** keputusan struktural & 7 blocker `2026-09-03-foundation-contest-blockers.md`
  mengubah acceptance criteria/data & entitas/aturan story-story di atas — rule 1b AGENTS.md §5
  mewajibkan PRD yang sudah ada disinkronkan pada sesi yang sama, bukan dibiarkan mengklaim
  status yang sudah ditarik (`ACTIVE`, `Ready`, "resolved") di DOCS-EN.
- **Kandidat rename `US-FND-WMS-*` → `US-PROD-JOB-*` (dilaporkan, tidak dieksekusi):**
  `US-FND-WMS-004` (Create & release a work order) adalah satu-satunya kandidat kuat — ia
  menulis `WORK_ORDER`/`WORK_ORDER_OPERATION` murni, tanpa menyentuh `ROUTING`/`OPERATION`/`BOM`.
  `US-FND-WMS-002` (BOM) dan `US-FND-WMS-003` (Routing) **bukan** kandidat — keduanya menulis
  `BOM`/`ROUTING`/`OPERATION`, entitas yang tetap di FOUNDATION. `US-FND-WMS-005` (defect code
  taxonomy) **bukan** kandidat — menulis `QUALITY_DEFECT_CODE`, juga tetap FOUNDATION.
  Keputusan rename adalah keputusan penomoran PO, bukan hal yang boleh diputuskan sepihak sesi
  ini.
- **Backlog eksplisit — belum disinkronkan sesi ini (rule 1b, dicatat agar tidak diam-diam
  terlewat):**
  1. `US-FND-WMS-002`/`003` (BOM/Routing) masih mengutip modul Work Master sebagai "F-02" di
     beberapa baris Context (seharusnya F-08) — bug label pra-eksisting, di luar 6 item sinkron
     sesi ini, tidak diperbaiki.
  2. `US-PROD-OEE-*`, `US-PROD-JOB-*` (PRD-001, story PRODUCTION asli, bukan hasil duplikasi
     FOUNDATION) belum ditinjau baris-per-baris untuk rujukan `ASSET_STATE_LOG`/`SHIFT_INSTANCE`/
     `is_oee_tracked` yang sama — di luar cakupan yang diminta PO sesi ini (fokus pada story
     FOUNDATION yang terdampak keputusan), perlu sesi lanjutan sebelum PRODUCTION dianggap sinkron
     penuh.
  3. `FLOW/04-daily-runtime.md`, `FLOW/05-kpi-computation.md`, `FLOW/00-flow.md`, dan
     `UX/08-work-master.md` — dicatat sebagai backlog oleh `foundation-domain` pada sesi
     sebelumnya (entri di atas), belum disinkronkan ke PRD juga; menunggu FLOW/UX-nya sendiri
     diperbaiki lebih dulu.
  4. `US-FND-INT-001` — TBD di atas belum dijawab; sampai `foundation-domain` menentukan bentuk
     penulisan ulang terhadap `ASSET_TAGS`/`DATA_SOURCE`, story ini tidak bisa dianggap siap
     dikerjakan developer.
- **Dampak:** PRD-001 dan PRD-003 sekarang konsisten dengan `DOCS-EN` FOUNDATION dan
  `job-schedule.md` PRODUCTION per 2026-09-03 untuk 8 story yang disentuh. Story yang belum
  disentuh (lihat backlog) tetap berisiko menyesatkan developer/designer sampai sesi lanjutan.

---

## 2026-09-03 — FOUNDATION: revert status ACTIVE/resolved palsu (B1/B5), B6 `ASSET_PLACEMENT` jadi sumber tunggal lokasi, strip `WORK_ORDER`/`WORK_ORDER_OPERATION` dari F-08, modul baru `DATA_SOURCE` (F-13, B7)

- **Tipe:** ubah (bagian FOUNDATION dari tindak lanjut keputusan
  [`2026-09-03-foundation-contest-blockers.md`](decisions/2026-09-03-foundation-contest-blockers.md) poin 1)
- **Domain:** foundation-domain
- **File terdampak:** `DOMAINS/FOUNDATION/DOCS-EN/02-shift.md`,
  `DOMAINS/FOUNDATION/DOCS-EN/04-asset-ontology.md`,
  `DOMAINS/FOUNDATION/DOCS-EN/08-work-master.md`,
  `DOMAINS/FOUNDATION/DOCS-EN/00-foundation.md`,
  `DOMAINS/FOUNDATION/DOCS-EN/00-1-authorization-permissions.md`,
  `DOMAINS/FOUNDATION/DOCS-EN/07-0-kpi-formula.md`,
  `DOMAINS/FOUNDATION/DOCS-EN/11-integration.md`,
  `DOMAINS/FOUNDATION/DOCS-EN/13-data-source.md` (baru),
  `DOMAINS/FOUNDATION/AGENTS.md`, `DOCS/01-glossary.md`
- **Perubahan:**
  - **B1:** F-02 Shift diturunkan status `ACTIVE` → `DRAFT`. Generator `SHIFT_INSTANCE`
    (H-6) dicatat eksplisit sebagai **tidak berpemilik** — `production-domain` hanya
    kandidat, belum ditugaskan PO. Modul kembali `ACTIVE` hanya setelah PO menugaskan
    pemilik generator.
  - **B6:** `ASSET_PLACEMENT` (riwayat penempatan) dijadikan **satu-satunya** sumber
    kebenaran lokasi aset saat ini. `ASSET.work_unit_id` **dihapus**; `ASSET.site_id`
    jadi **derived read-only** dari `ASSET_PLACEMENT` aktif (bukan lagi field tulis
    independen). Semua baris ABAC di `00-1-authorization-permissions.md` yang membaca
    `ASSET.site_id`/`work_unit_id` inline (`ASSET`, `ASSET_COMPONENT_LINK`, `ASSET_TAGS`,
    `ASSET_PRODUCT_CODES`, `DOWNTIME_REASON_ASSET`, `REJECT_REASON_ASSET`) diarahkan ulang
    ke `ASSET_PLACEMENT`. Open item baru A-10: bagaimana aset yang belum pernah punya
    `ASSET_PLACEMENT` dicatat "berada di Site X".
  - **Struktural:** `WORK_ORDER`/`WORK_ORDER_OPERATION` dikeluarkan dari F-08 §9.5/§9.6
    (dikosongkan, diganti catatan pointer ke PRODUCTION, tidak dihapus dari histori git).
    `ROUTING`/`OPERATION`/`BOM`/`BOM_LINE`/`QUALITY_DEFECT_CODE` tetap di FOUNDATION.
    W-1 dan W-5 ikut pindah (bukan lagi open question FOUNDATION). Diagram entitas di
    `00-foundation.md` dan `08-work-master.md` diperbarui dengan penanda batas domain.
  - **B7:** Modul baru **F-13 Data Source** (`DOCS-EN/13-data-source.md`), kode modul
    `DSR`, dipisah dari F-04 (Equipment Taxonomy) dan F-11 (Integration — kini murni
    integrasi sistem-ke-sistem/ERP). Entitas `DATA_SOURCE` (§9.1) diberi spesifikasi
    minimal (identity, protocol, connection_config, heartbeat placeholder). **Granularitas
    heartbeat (per-koneksi vs per-tag) ditulis eksplisit sebagai `TBD` (H-DS-1)** — klaim
    "resolved: per-koneksi" (A-6c) sebelumnya **ditarik kembali**, tidak pernah benar-benar
    diputuskan. `ASSET_TAGS.data_source_id` (F-04 §9.7) sekarang FK ke `DATA_SOURCE` yang
    nyata. Didaftarkan di `DOMAINS/FOUNDATION/AGENTS.md` §2 dan `00-foundation.md`'s
    module table + reading order.
  - **B5:** A-5 (F-04 §9.8) dikembalikan ke **terbuka** — klaim "resolved: both,
    contextually... matches `ASSET_STATE_LOG`'s existing dual recording level" ditarik
    karena mengutip skema `ASSET_STATE_LOG` yang tidak punya spesifikasi §9 di mana pun di
    FOUNDATION. `ASSET_STATE_LOG` **sengaja tidak dispesifikasikan** sesi ini. F-07
    (`07-0-kpi-formula.md`) yang sebelumnya menyatakan "Ready" untuk POT/PBT dan
    unplanned-downtime/APT sekarang diberi catatan kualifikasi (bergantung pada B1 dan B5
    yang belum selesai) — bukan lagi "Ready" tanpa syarat.
  - **B3 (separuh FOUNDATION):** W-8 baru di F-08 — `ROUTING`/`BOM` belum punya field
    version-pin yang bisa dikunci `WORK_ORDER` saat rilis. Ditulis sebagai open item lintas
    domain (desain bersama `production-domain`, JS-8 di sisi PRODUCTION), bukan diputuskan
    sendiri.
  - **Temuan baru saat mengerjakan (W-9):** `production-domain` (JS-9) menandai
    `QUALITY_DEFECT_CODE` butuh field `disposition` yang sudah diasumsikan ada oleh
    `oee-monitoring.md`/glossary tapi belum ada di F-08 §9.7 — dicatat sebagai open item,
    tidak ditambahkan sendiri (butuh daftar nilai nyata seperti W-4).
  - `DOCS/01-glossary.md`: entri **Data source** diperbarui (dulu "belum ada spec", sekarang
    menunjuk F-13, mencatat H-DS-1 tetap `TBD`).
- **Alasan:** pola lintas 7 blocker — spesifikasi mencap "resolved/ACTIVE/Ready" untuk hal
  yang fondasinya belum ada. Perbaikan menarik kembali klaim itu, bukan menyelesaikan
  substansinya (yang memang sengaja ditunda PO), supaya dokumen tidak menyesatkan
  `production-domain`/`engineering-domain` yang membaca status modul apa adanya.
- **Dampak:** story PRD yang merujuk `WORK_ORDER`/`WORK_ORDER_OPERATION` di bawah domain
  FOUNDATION (`US-FND-WMS-*`), F-02 status `ACTIVE`, atau F-07 "Ready" tanpa syarat perlu
  ditinjau ulang oleh Product Owner (rule 1b) — **belum dikerjakan sesi ini**, backlog
  eksplisit untuk PO. `FLOW/04-daily-runtime.md`, `FLOW/05-kpi-computation.md`,
  `FLOW/00-flow.md`, dan `UX/08-work-master.md` masih menyebut `WORK_ORDER` di bawah asumsi
  lama (belum disinkronkan ke pemindahan domain ini) — **backlog eksplisit**, belum
  dikerjakan sesi ini. `engineering-domain` (belum dibuat) perlu H-DS-2 (bentuk
  `connection_config`) sebelum desain schema `DATA_SOURCE`.

---

## 2026-09-03 — `WORK_ORDER`/`WORK_ORDER_OPERATION` pindah ke PRODUCTION; perbaikan B2/B3, jawaban W-1/B4

- **Tipe:** ubah (rule 1b-setara — bagian PRODUCTION dari tindak lanjut keputusan
  [`2026-09-03-foundation-contest-blockers.md`](decisions/2026-09-03-foundation-contest-blockers.md) §"Keputusan struktural" & poin 2)
- **Domain:** production-domain
- **File terdampak:** `DOMAINS/PRODUCTION/DOCS/job-schedule.md`,
  `DOMAINS/PRODUCTION/DOCS/job-schedule-konsep.md`, `DOMAINS/PRODUCTION/AGENTS.md`,
  `DOCS/01-glossary.md`
- **Perubahan:**
  - `WORK_ORDER` dan `WORK_ORDER_OPERATION` dipindah & didefinisikan penuh di
    `job-schedule.md` §2.1–§2.2 (menggantikan F-08 §9.5/§9.6 yang dikosongkan
    `foundation-domain` secara paralel). `ROUTING`/`OPERATION`/`BOM`/`BOM_LINE`/
    `QUALITY_DEFECT_CODE` **tetap** di FOUNDATION F-08, dirujuk via FK.
  - **B2 (grain defect code):** entitas baru `WORK_ORDER_OPERATION_DEFECT` — baris per
    (`wo_operation_id`, `defect_code_id`, `qty`). `WORK_ORDER_OPERATION.scrap_qty`/
    `.rework_qty` jadi field turunan (agregasi anak per `disposition`), bukan lagi
    diketik langsung user.
  - **B3 (routing/BOM locked at release):** dua field baru di `WORK_ORDER`,
    `routing_version_locked`/`bom_version_locked`, diisi sistem saat transisi
    `draft`→`released`. Tipe/target field **`TBD`** — bergantung pada mekanisme versi
    yang belum dirancang `foundation-domain` untuk `ROUTING`/`BOM`; dicatat sebagai
    dependensi eksplisit (JS-8), tidak ditebak.
  - **W-1/B4 (sumber WO):** kepemilikan pertanyaan pindah ke PRODUCTION (§2.3), tetap
    `TBD — perlu konfirmasi PO` dengan 4 pertanyaan spesifik (ERP-only/MolcaDx-only/
    campuran, `source_system` enum vs string, siapa jamin `wo_number` unik, field mana
    diisi manual planner).
  - **Temuan baru (JS-9):** `oee-monitoring.md` §4 dan glossary sudah mengasumsikan
    `QUALITY_DEFECT_CODE` punya field `disposition` (`scrap`/`rework`), tapi F-08 §9.7
    tidak punya field itu — dicatat sebagai dependensi terbuka ke `foundation-domain`,
    bukan ditambahkan sendiri (bukan dokumen PRODUCTION).
  - `job-schedule-konsep.md` dan `PRODUCTION/AGENTS.md` §2 diberi catatan singkat
    tentang perpindahan kepemilikan entitas. `01-glossary.md` diperbarui: **Work master**
    tidak lagi mencakup `WORK_ORDER`, **Work order (WO)** menunjuk ke pemilik baru, entri
    baru **WORK_ORDER_OPERATION_DEFECT**.
- **Alasan:** `WORK_ORDER`/`WORK_ORDER_OPERATION` adalah data transaksional/eksekusi
  (shopfloor live), bukan data master — cocok dengan pembagian domain PRODUCTION vs
  FOUNDATION di `AGENTS.md` §3. B2/B3/B4 tidak bisa diperbaiki di FOUNDATION karena
  perbaikannya butuh keputusan eksekusi (grain transaksi, kapan lock terjadi) yang
  bukan wewenang model data dasar.
- **Dampak:** `foundation-domain` perlu menuntaskan mekanisme versi `ROUTING`/`BOM`
  (JS-8) dan menambah `QUALITY_DEFECT_CODE.disposition` (JS-9) sebelum B3/B2 bisa
  diimplementasikan penuh. Story PRD yang merujuk `WORK_ORDER`/`WORK_ORDER_OPERATION`
  di bawah domain FOUNDATION (`US-FND-WMS-*`) perlu ditinjau ulang kepemilikan
  domainnya oleh Product Owner (rule 1b) — belum dikerjakan sesi ini, di luar cakupan
  `production-domain`.

---

## 2026-09-03 — Contest review FOUNDATION (5 jalur paralel) + handoff tindak lanjut

- **Tipe:** tambah (dokumen handoff baru; tidak ada spesifikasi/PRD yang diubah)
- **Domain:** Product Owner
- **File terdampak:** `LOGS/handoff-2026-09-03-foundation-contest-review.md` (baru)
- **Perubahan:** PO menjalankan review adversarial 5 jalur (subagent, read-only) atas seluruh
  spesifikasi FOUNDATION di `DOMAINS/FOUNDATION/DOCS-EN/` plus audit rule-1b PRD-001/PRD-003.
  **Kelima jalur mengembalikan verdict BLOCK.** Temuan lengkap ada di artefak output reviewer
  (path tercatat di file handoff); ringkasannya:
  - **7 blocker:** (B1) generator `SHIFT_INSTANCE` tidak berpemilik padahal modul berstatus
    ACTIVE; (B2) `WORK_ORDER_OPERATION` tidak bisa menyimpan kode defect (tanpa FK & grain);
    (B3) "locked at release" tanpa mekanisme snapshot; (B4) W-1 (ERP vs MolcaDx) terbuka dan
    entitas `WORK_ORDER` kolaps di kedua jawaban; (B5) A-5 berlabel "resolved" mengutip skema
    `ASSET_STATE_LOG` yang tidak ada di file mana pun; (B6) `ASSET` punya dua field posisi
    yang bertentangan (`work_unit_id` inline vs `ASSET_PLACEMENT`); (B7) `ASSET_TAGS.data_source_id`
    FK wajib ke entitas `DATA_SOURCE` yang belum dimodelkan.
  - **Pola lintas temuan:** spesifikasi men-cap "resolved/ACTIVE/Ready" untuk hal yang fondasinya
    belum ada — stempel resolved tersebut harus ditarik kembali.
  - **PRD-001 v0.2** masih kontradiktif dengan keputusan DOCS-EN terbaru di sel yang
    enforceable (`is_oee_tracked`, `scheduled_minutes`, entitas pensiun `CREW`/`NON_WORKING_DAY`,
    nama role terlarang, dependensi ke `US-FND-ORG-002`), sementara PRD-003 sudah membawa
    koreksi yang sama.
- **Tindak lanjut (urutan usulan):** (1) 6 keputusan PO untuk `LOGS/decisions/` — W-1, W-5,
  small_stop→Availability/Performance, `is_oee_tracked`, kepemilikan `ASSET_STATE_LOG`,
  granularitas heartbeat; (2) paket kerja foundation-domain untuk B2/B3/B6/B7; (3) sinkronisasi
  rule-1b PRD-001 (mayoritas menyalin teks PRD-003 yang sudah terkoreksi).

---

## 2026-09-03 — Menuntaskan rewrite role→ABAC di PRD-003 (29 story tersisa dari sesi terputus)

- **Tipe:** ubah (rule 1b — merawat PRD yang sudah ada, bukan PRD baru)
- **Domain:** Product Owner
- **File terdampak:** `DOCS/prd/PRD-003-foundation-domain-en.md`
- **Perubahan:** sesi sebelumnya (rate-limited di tengah jalan) sudah menulis ulang sebagian
  besar baris kontrol akses PRD-003 dari nama role hardcode (`admin`/`supervisor`/
  `plant_manager`) ke frasa scope+action ABAC per kontrak di `00-foundation.md` §"Authorization
  attribute contract". Sesi ini menuntaskan 29 story yang tertinggal: `US-FND-SIT-001/002`,
  `US-FND-AST-001/003`, `US-FND-WMS-002/003/004`, `US-FND-SHF-001`, `US-FND-WFE-001/002/003/004`,
  `US-FND-NTF-001/002`, `US-FND-INT-001/003`, `US-FND-CFG-001/002/003`, `US-FND-REF-001/003/005/006`,
  `US-FND-PRO-001/003/004`, `US-FND-FYR-001/002/003`.
  - Setiap mention `admin`/`supervisor`/`plant_manager` di dalam blok story tersebut (Expectation
    "No permission", Rules & constraints, Acceptance criteria) diganti frasa
    "subjek yang klaim scope IDP-nya mencakup `<level>` (atau klaim `<level lebih luas>`)",
    dengan action (`view`/`create`/`update`/`deactivate`/`import`) dan scope level dicek ke
    katalog konkret `DOMAINS/FOUNDATION/DOCS-EN/00-1-authorization-permissions.md`, bukan ditebak.
  - Sekalian membetulkan beberapa baris Access yang sudah dikonversi di sesi sebelumnya tapi
    scope level-nya keliru dibanding katalog: `ASSET_CLASS`/`ASSET_TYPE` (US-FND-AST-001),
    `ASSET_PLACEMENT` (US-FND-AST-003), `BOM`/`BOM_LINE`/`PRODUCT`/`PRODUCT_CYCLE`/
    `PRODUCT_UOM_CONVERSION` (US-FND-WMS-002, US-FND-PRO-001/003/004 — ditandai `TBD` menunggu
    P-1, bukan dipaksa site/enterprise), `ROUTING`/`OPERATION` (US-FND-WMS-003), `WORK_ORDER`
    (US-FND-WMS-004 — site via multi-hop, P-2), dan `DOWNTIME_REASON`/`REJECT_REASON`/
    `TIME_CONVERSIONS`/`UNIT_OF_MEASUREMENTS` (US-FND-REF-001/005/006 — tenant, bukan site/
    enterprise, karena keempatnya tidak punya FK Site Hierarchy).
  - 4 modul concept-only (`WFE`/`NTF`/`INT`/`CFG`) tidak punya baris katalog (tidak ada §9 entity
    spec) — untuk story-story ini, scope tetap memakai atribut `scope_type`/`scope_id` milik
    entitas proposal masing-masing (sudah ditulis di sesi sebelumnya), bukan salah satu dari
    enam level katalog.
  - Contoh & narasi ilustratif yang memakai kata "supervisor"/"plant_manager" sebagai persona
    di luar baris kontrol akses (mis. contoh eskalasi workflow/notifikasi) **tidak** diubah —
    itu bukan pernyataan akses ke data FOUNDATION, konsisten dengan story lain yang sudah
    dikonversi sebelumnya.
  - Tidak ada story yang memakai action `import` baru — ke-29 story ini semuanya mengenai
    `view`/`create`/`update`/`deactivate`; tidak ada satu pun yang mendeskripsikan muat massal
    dari file, jadi `import` tidak relevan untuk daftar ini.
- **Alasan:** menuntaskan pekerjaan yang terhenti karena rate limit di sesi sebelumnya, per
  instruksi eksplisit — bukan efek samping tugas lain.
- **Dampak:** PRD-003 kini konsisten memakai frasa scope+action ABAC di seluruh story yang
  disebutkan; tidak ada lagi nama role hardcode di baris kontrol akses 29 story ini.

---

## 2026-09-03 — Sweep katalog izin: baris `import` ditambahkan pada 4 entitas

- **Tipe:** ubah (tindak lanjut entri "Kosakata aksi ABAC bertambah satu" di bawah)
- **Domain:** `foundation-domain`
- **File terdampak:** `DOMAINS/FOUNDATION/DOCS-EN/00-1-authorization-permissions.md`
- **Perubahan:** menyisir ulang katalog izin per modul (bukan otomatis dari `create`) dan
  menambah baris `import` hanya pada entitas yang teks modulnya sendiri mendukung muat
  banyak baris sekaligus:
  - **Ditambahkan:** `DOWNTIME_REASON`, `REJECT_REASON` (Reference & Master Data — T-1
    menyebut "list" yang harus dipasok `ops-domain`, dan contoh ABAC di `00-foundation.md`
    sendiri memakai "downtime-reason list" sebagai ilustrasi), `UNIT_OF_MEASUREMENTS`
    (Reference & Master Data — §9.4 menyamakannya dengan `DOWNTIME_REASON` sebagai
    "ordinary master-data maintenance", plus contoh ABAC yang sama menyebut "UOM... list"),
    `QUALITY_DEFECT_CODE` (Work Master — W-4 memakai bahasa "list" yang sama seperti T-1).
    Semua empat ditandai `TBD — foundation-domain: insert-only atau upsert-by-code?` karena
    dokumen modulnya belum menjawab itu.
  - **Diperiksa, sengaja tidak ditambah** (dicatat eksplisit di file, bukan dibiarkan
    kosong tanpa keterangan): `TIME_CONVERSIONS` (deklarasi satu-baris lewat kalkulator
    kuantitas+unit, tidak ada bahasa "list"), `MEASUREMENT_GROUP` (§9.4 eksplisit
    menyebutnya "governed, `foundation-domain`-reviewed addition", kebalikan dari bulk
    self-service), `DOWNTIME_REASON_ASSET`/`REJECT_REASON_ASSET` (join per-asset, bukan
    daftar setup), seluruh modul Site Hierarchy, Shift, Yearly & Quarterly Declaration,
    Product, KPI (`WORK_UNIT_KPI_BINDING` dkk.), dan sisa entitas Equipment Taxonomy/Work
    Master (relasional/efektif-tanggal/transaksional, atau taksonomi self-nesting tanpa
    bahasa bulk eksplisit seperti `ASSET_CLASS`/`ASSET_TYPE`).
  - Menambah pertanyaan terbuka P-6 dan memperbarui "Next step" untuk insert-vs-upsert
    empat entitas di atas.
- **Alasan:** menindaklanjuti entri di bawah ini — kosakata `import` sudah dideklarasikan
  di `00-foundation.md`, entri ini adalah penyisiran nyata katalognya per modul, sesuai
  larangan "jangan otomatis ke semua entitas yang punya `create`".
- **Dampak:** PRD story yang menyebut `import` untuk salah satu dari 4 entitas ini kini
  punya dasar kutipan yang tertelusuri; story lain yang ingin mengklaim `import` untuk
  entitas lain harus menunjukkan teks pendukung di `DOCS-EN` modul terkait dulu.

---

## 2026-09-03 — Kosakata aksi ABAC bertambah satu: `import` (bulk CSV)

- **Tipe:** ubah (perluasan keputusan ABAC hari ini)
- **Domain:** `foundation-domain`
- **File terdampak:** `DOMAINS/FOUNDATION/DOCS-EN/00-foundation.md` (bagian ABAC)
- **Perubahan:** kosakata aksi ABAC yang tadinya 4 nilai (`view`/`create`/`update`/
  `deactivate`) bertambah jadi 5 dengan `import` — muat banyak baris sekaligus dari
  file yang diunggah (CSV hari ini). Dinyatakan sebagai aksi terpisah dari `create`,
  bukan pengulangan `create`, karena blast radius dan pola kegagalannya beda (satu
  baris salah tidak boleh memblokir 499 baris lain; grant `import` masuk akal dibatasi
  lebih ketat daripada `create` satu baris). Apakah satu entitas berperilaku
  insert-only atau upsert-by-code saat di-import adalah keputusan per-entitas di file
  `DOCS-EN`-nya sendiri, tidak diasumsikan seragam di sini.
- **Alasan:** PO — banyak modul referensi/master data butuh cara memuat banyak baris
  sekaligus (mis. daftar UOM, downtime reason) saat onboarding plant baru; `create`
  satu-per-satu tidak cukup mewakili itu sebagai satu unit otorisasi.
- **Dampak:** `00-1-authorization-permissions.md` perlu di-sweep ulang untuk
  menambah baris `import` pada entitas yang benar-benar didukung — bukan otomatis
  semua entitas yang punya `create`. Tindak lanjut di entri terpisah.

---

## 2026-09-03 — Katalog izin otorisasi (F-00.1) + format nama string izin di F-00

- **Tipe:** tambah
- **Domain:** `foundation-domain`
- **File terdampak:** `DOMAINS/FOUNDATION/DOCS-EN/00-foundation.md`, `DOMAINS/FOUNDATION/DOCS-EN/00-1-authorization-permissions.md` (baru), `DOMAINS/FOUNDATION/AGENTS.md` §2, `AGENTS.md` §2
- **Perubahan:**
  - `00-foundation.md` — subbagian baru "An illustrative encoding — not a mandate" di
    bagian ABAC yang sudah ada, mendeklarasikan format `foundation:<module_code>:
    <scope_level>:<action>` sebagai **contoh, bukan mandat** — batas yang sama dengan
    "physical schema/API milik `engineering-domain`" yang sudah ada di file ini.
  - `00-1-authorization-permissions.md` (baru, F-00.1) — katalog konkret, satu baris
    per kombinasi modul/scope/action nyata, dibaca langsung dari §9 tiap modul (bukan
    ditebak dari nama modul): Site Hierarchy (6 level, create di level induk), Shift
    (`SITE_SHIFT` site-scoped, `SHIFT_INSTANCE` view-only dari sisi FOUNDATION),
    Fiscal Year (enterprise-only, Y-2 dikonfirmasi), Equipment Taxonomy (`ASSET_CLASS`/
    `ASSET_TYPE` tenant-scoped vs `ASSET`/`ASSET_PLACEMENT` site/work_unit-scoped),
    Reference & Master Data, Product, KPI (`KPI_FORMULA_SLOT`/`KPI_PARAMETERS` tanpa
    aksi `create`/`update` sama sekali per K-7, `WORK_UNIT_KPI_BINDING` work-unit-scoped,
    `KPI_RESULT` view-only), Work Master. Empat modul concept-only (Workflow Engine,
    Notification, Integration, Configuration Service) ditulis `TBD` eksplisit, bukan
    ditebak.
  - Didaftarkan di `DOMAINS/FOUNDATION/AGENTS.md` §2 dan `AGENTS.md` §2.
- **Alasan:** bagian ABAC F-00 (ditambahkan sesi sebelumnya hari ini) menyatakan
  kontrak scope/action FOUNDATION tapi tidak punya katalog konkret yang bisa dikutip
  story per entitas nyata — tanpa itu, setiap story menebak sendiri level scope-nya.
- **Dampak:**
  - Lima temuan baru dicatat sebagai open question di F-00.1 (bukan ditutupi): scope
    `PRODUCT`/`BOM` yang belum jelas tenant vs enterprise (tidak ada FK sama sekali di
    §9), `WORK_ORDER` yang disebut "unique within site" tapi tidak punya field
    `site_id`, `TIME_CONVERSIONS`/`UNIT_OF_MEASUREMENTS` yang tidak punya field
    `valid_from`/`valid_to`/`deleted_at` sama sekali walau §9.5 mewajibkannya,
    `ASSET_STATE_LOG` yang kepemilikannya kontradiktif antara tabel modul F-00 dan
    teks F-04, dan scope pembuatan `TENANT` yang belum jelas pemiliknya.
  - Tidak menyentuh `DOCS/prd/**` — sinkronisasi PRD-003 dikerjakan agent lain secara
    paralel di sesi ini.

## 2026-09-03 — Kontrak atribut otorisasi (ABAC) ditambahkan ke F-00

- **Tipe:** tambah (keputusan arsitektur)
- **Domain:** `foundation-domain`
- **File terdampak:** `DOMAINS/FOUNDATION/DOCS-EN/00-foundation.md`
- **Perubahan:** ditambahkan bagian baru "Authorization attribute contract (ABAC)"
  setelah bullet "Access and roles live in the identity provider" yang sudah ada.
  Mendeklarasikan kontribusi nyata FOUNDATION ke keputusan ABAC: rantai FK yang sudah
  ada di Site Hierarchy (`tenant_id → enterprise_id → site_id → area_id →
  work_center_id → work_unit_id`) dinyatakan eksplisit sebagai **resource attribute**
  yang bisa dirujuk sistem otorisasi eksternal, plus kosakata aksi tetap (`view`/
  `create`/`update`/`deactivate`, tanpa `delete`). Subject attribute (role, penugasan
  site/enterprise) tetap 100% milik IDP — tidak ada entitas, field, atau tabel baru.
- **Alasan:** PRD sweep sesi ini menemukan setiap satu dari 12 modul FOUNDATION
  menyebut nama role konkret (`admin`/`supervisor`/`plant_manager`) tanpa sumber di
  dokumen manapun — celah berulang yang sama di semua modul. PO memutuskan Organization/
  CREW tetap tidak dihidupkan lagi, tapi FOUNDATION perlu mendeklarasikan sisi resource
  dari keputusan ABAC supaya story punya sesuatu yang bisa dirujuk selain mengarang
  nama role.
- **Dampak:** story PRD ke depan menulis akses sebagai "scope level + action" (mis.
  "`update` pada resource scoped `site`"), bukan nama role — lihat tindak lanjut
  perbaikan `PRD-003` di entri terpisah.

---

## 2026-09-03 — Skill baru: `prd-pilot`

- **Tipe:** tambah (skill)
- **Domain:** Product Owner
- **File terdampak:** `.claude/skills/prd-pilot/SKILL.md` (baru), `AGENTS.md` §6
- **Perubahan:** ditambahkan skill `prd-pilot` — mengukur apakah dokumen `DOCS-EN`/
  `UX`/`FLOW` satu modul sudah cukup untuk memproduksi ulang story PRD-nya secara
  independen. Metodenya dua langkah: (1) agent baru tanpa memori sesi ini dan tanpa
  akses ke `DOCS/prd/`/`LOGS/CHANGELOG.md` menulis story dari dokumen domain saja;
  (2) agent kedua men-diff hasilnya ke PRD asli, mengelompokkan setiap beda jadi
  celah dokumen nyata / pilihan penulisan bebas / inkonsistensi nyata (dengan
  menyebut mana yang basi). Read-only — tidak pernah mengedit PRD asli.
- **Alasan:** PO minta cara sistematis memverifikasi kalau PRD dan implementasi
  konsisten dengan dokumen domain, dieksekusi manual dua kali sesi ini untuk F-05
  dan F-07 (keduanya menemukan gap nyata: `MEASUREMENT_GROUP` yang hilang dari story
  UOM, dan model entitas KPI yang seluruhnya di-drop dari enam story KPI) — sudah
  terbukti berharga cukup untuk dijadikan prosedur baku, bukan diulang ad-hoc.
- **Dampak:** siap dipakai untuk sweep seluruh 13 modul FOUNDATION di PRD-003, dan
  untuk domain lain (PRODUCTION, atau domain baru) ke depannya.

---

## 2026-09-03 — K-7 resolved: siapa boleh menulis `WORK_UNIT_KPI_BINDING`

- **Tipe:** keputusan (resolusi open question)
- **Domain:** `foundation-domain`
- **File terdampak:** `DOMAINS/FOUNDATION/DOCS-EN/07-1-kpi-tag-mapping.md` (K-7, §9.6, "Next step"),
  `DOMAINS/FOUNDATION/UX/07-kpi.md` (UX-KPI-1, `SCR-FND-KPI-002` row)
- **Perubahan:** dua tingkat governance dikonfirmasi terpisah, sesuai dugaan awal
  pertanyaan K-7. `KPI_FORMULA_SLOT`/`KPI_PARAMETERS` (katalog kombinasi tag-role +
  transform yang legal — `SCR-FND-KPI-001`) tetap **tidak pernah bisa ditulis
  implementor**, batasan K-1 yang sama dengan `KPI_FORMULA` — perubahan lewat
  `foundation-domain`/PO. `WORK_UNIT_KPI_BINDING` (memilih satu kombinasi yang sudah
  legal untuk satu work unit — `SCR-FND-KPI-002`) memakai **peran admin biasa, scoped ke
  site pemilik work unit itu (atau enterprise)** — model akses yang sama persis dengan
  setiap layar master-data FOUNDATION lain (Site Hierarchy, Shift, Products, Reference
  Data). Tidak ada peran baru atau skema ABAC khusus.
- **Alasan:** PO — mengikat tag ke slot adalah edit master-data biasa (site-scoped), beda
  dengan mendesain formulanya sendiri (itu yang harus tetap terkunci, per K-1).
- **Dampak:** `SCR-FND-KPI-002` sekarang implementor-facing, bukan menunggu gate PO —
  `UX/07-kpi.md` mencatat kedua layar (`SCR-FND-KPI-001` read-only, `SCR-FND-KPI-002`
  editable) siap dibangun dari sisi governance.

---

## 2026-09-03 — Sweep rekonsiliasi PRD: story FOUNDATION disinkronkan ke keputusan `DOCS-EN`/`UX` 2026-09-02/03

- **Tipe:** ubah (sinkronisasi story yang sudah ada — bukan PRD baru, bukan ID story baru)
- **Domain:** Product Owner
- **File terdampak:** `DOCS/prd/PRD-003-foundation-domain-en.md` (→ v0.2, §13.4 baru),
  `DOCS/prd/PRD-001-molcadx-core-q3-en.md` (§13.5 baru)
- **Perubahan:** semua perubahan diterapkan **identik di kedua PRD** sesuai aturan sinkronisasi
  di kepala PRD-003.
  - `US-FND-REF-005` — **dibuka kembali dari BLOCKED.** Banner BLOCKED dihapus; Expectation,
    Calculation, Data, Rules, AC (10), Metrics ditulis penuh di atas `seconds_per_unit`
    (F-05 §9.3/§9.6, T-4 resolved): deklarasi via kuantitas bulat + satuan dasar tetap
    (detik/menit/jam/hari), sistem menghitung `seconds_per_unit = quantity × base_unit_seconds`
    ("30" + menit → 1800, "3" + jam → 10800); re-edit menurunkan ulang kuantitas/satuan dari
    faktor tersimpan (satuan bulat terbesar yang membagi rata); `code`/`name` label bebas;
    konsumen memakai `duration = raw_value × seconds_per_unit`. Semua sebutan "hours" di story
    ini diganti **seconds**. Q-17 dicoret + **Resolved**; PRD-003: M4, F-R-06, tahap F3/F7,
    tabel §4/§7.2 disesuaikan; PRD-001: R-19 ditutup.
  - `US-FND-PRO-004` — `uom_id` kini hanya item (UOM grup `count`), FK baru
    `time_conversion_id` → `TIME_CONVERSIONS`; durasi nyata = `cycle_time_value ×
    seconds_per_unit`; mode entri **throughput** (`seconds_per_unit ÷ rate`, 500/jam → 7,2 s,
    selalu disimpan ke baris "seconds", laju tidak pernah disimpan). AC-10..14 baru. Kotak
    peringatan "bukan sumber Performance" dipertahankan. Dependensi + `US-FND-REF-005`.
  - `US-FND-SIT-001` — Expectation mengikuti UX 01: tiga mode tampilan Tree/Diagram/Table,
    menu ⋮ per node dengan Edit dan Add {child kind} berbentuk dialog (bukan tombol Add yang
    mengikuti seleksi, bukan form inline), detail pane read-only + panel Shift/Fiscal Year
    (Enterprise/Site) atau ringkasan Asset Placement (Work Unit), panel kiri tidak bisa
    collapse, **badge alert solid** di node `SITE` yang adopsi `SITE_SHIFT`-nya belum lengkap
    (AC-7 baru, rumus `missing_shifts`). `default_shift_calendar_id` dibuang dari Write
    (tidak ada di F-01, konsep kalender sudah dipensiunkan).
  - `US-FND-SHF-001` — judul diganti "Define enterprise shifts & each site's shift hours";
    ditulis ulang ke model dua level `ENTERPRISE_SHIFT` (label + `is_production_shift`,
    editable in place, delete ditolak sambil menyebut situs pengadopsi) / `SITE_SHIFT`
    (`start_time`/`end_time` wajib per enterprise shift; `crosses_midnight` **diturunkan**
    dari `end_time < start_time`, tidak disimpan; tanpa break (H-2); tanpa rotasi/pattern;
    tanpa `scheduled_minutes`). AC baru: dua window `SITE_SHIFT` di situs yang sama yang
    tumpang tindih — termasuk lintas tengah malam — ditolak sambil menyebut shift yang bentrok.
    Aturan non-production dikeluarkan dari denominator OEE dipertahankan.
  - `US-FND-SHF-002` — rujukan `SHIFT_DEFINITION`/`SHIFT_PATTERN` diganti `SITE_SHIFT`/
    `ENTERPRISE_SHIFT`; Write hanya field F-02 §9.3 (tanpa `scheduled_minutes`,
    `work_center_id`); per situs, bukan per lini; dependensi ke `US-FND-SHF-003` (closed)
    dihapus. Di PRD-001 story ini masih membaca `SHIFT_CALENDAR`/`NON_WORKING_DAY` — drift yang
    sudah dibetulkan PRD-003 pada 2026-08-24, kini disamakan.
  - `US-FND-SHF-004` — sebagai dependen `SHF-001`: usulan regu dari `SHIFT_PATTERN` dihapus;
    cara pre-fill regu tanpa rotasi ditandai `TBD — perlu konfirmasi PO`.
  - `US-FND-REF-001/002/004` — Expectation menyebut layar sendiri `SCR-FND-REF-003/004/001`
    (UX 05), bukan satu layar gabungan "Reference & Master Data" dengan section switcher.
  - `US-FND-FYR-001` — dicek, tidak berubah; sudah konsisten dengan UX 03 (Y-2, tanpa override
    situs).
  - §7.1 peta layar (baris Location structure, Enterprise shift labels, Shift instance monitor,
    Working calendar dicoret, 5 baris REF/PRO baru), §7.2 ringkasan entitas, §8 event
    (`enterprise_shift_*`, `site_shift_*`, `time_conversion_*`, `product_cycle_created`), §12
    decision log di kedua PRD. PRD-001 `US-PROD-OEE-001`: satu nama entitas mati
    `SHIFT_DEFINITION.is_production_shift` → `ENTERPRISE_SHIFT.is_production_shift`; story
    PRODUCTION lain tidak disentuh.
- **Alasan:** [`AGENTS.md` §5 aturan 1b](../AGENTS.md) (ditambahkan 2026-09-03) mewajibkan
  story PRD yang sudah ada disinkronkan pada sesi yang sama ketika keputusan `DOCS-EN`/`UX`
  mengubah AC, data & entitas, atau aturannya — termasuk membuka kembali story BLOCKED saat
  penyebabnya resolved. Entri 2026-09-02 di bawah sengaja tidak menyentuh `DOCS/prd/`, sehingga
  PRD-003/PRD-001 mendeskripsikan perilaku yang sudah tidak benar (T-4, `PRODUCT_CYCLE`, UX site
  hierarchy/shift/reference). PO mengotorisasi sweep ini secara eksplisit.
- **Dampak:** `US-FND-REF-005` bisa dikerjakan. Lima pertanyaan yang tidak terjawab dokumen
  domain ditinggalkan sebagai `TBD — perlu konfirmasi PO` di dalam story (daftar di PRD-003
  §13.4) dan perlu dirutekan ke `foundation-domain`: field deaktivasi `TIME_CONVERSIONS`
  (F-05 §9.5 vs §9.3), keunikan `seconds_per_unit`, presisi `PRODUCT_CYCLE.cycle_time_value`
  hasil throughput, semantik `SITE_SHIFT.end_time` (inklusif vs batas) & `start_time =
  end_time`, pre-fill regu tanpa rotasi. **Backlog eksplisit (belum disinkronkan):**
  (a) PRD-001 masih memuat `US-FND-SHF-003` sebagai story aktif padahal PRD-003 menutupnya
  2026-08-24; (b) PRD-001 `US-PROD-JOB-001` dan diagram §13.1 masih membaca
  `SHIFT_INSTANCE.scheduled_minutes` yang dilarang F-02 core concept 5 — butuh
  `production-domain` menetapkan sumber kapasitas shift; (c) Q-16 di kedua PRD menyatakan
  `MEASUREMENT_GROUP` tidak ada di F-05 §9.4, padahal kini ada — `US-FND-REF-004` perlu
  sweep susulan.

---

## 2026-09-03 — Aturan `CHANGELOG.md`: jangan sebut repo/path kode frontend

- **Tipe:** ubah (aturan proses)
- **Domain:** Product Owner
- **File terdampak:** `LOGS/README.md` (§Aturan, poin 6 baru)
- **Perubahan:** ditambahkan aturan eksplisit — `File terdampak` dan `Dampak` di setiap
  entri changelog hanya boleh merujuk file di repo ini; repo/path kode frontend atau
  backend lain tidak boleh disebut. Entri-entri sesi sebelumnya yang melanggar ini sudah
  dibersihkan (referensi path kode frontend dihapus, satu entri yang tidak mengubah apa
  pun di repo ini dihapus seluruhnya).
- **Alasan:** PO — changelog ini riwayat keputusan domain (`DOCS/`, `DOMAINS/`,
  `AGENTS.md`), bukan riwayat implementasi kode di repo lain; mencampur keduanya bikin
  changelog kadaluarsa begitu prototype berubah struktur, padahal keputusan domainnya
  sendiri tetap valid.
- **Dampak:** entri changelog ke depan tidak lagi mengutip file/folder di luar repo ini.

---

## 2026-09-03 — F-07: status kesiapan input KPI untuk `production-domain`

- **Tipe:** tambah (pernyataan status, bukan keputusan baru)
- **Domain:** `foundation-domain`
- **File terdampak:** `DOMAINS/FOUNDATION/DOCS-EN/07-0-kpi-formula.md`
- **Perubahan:** ditambahkan bagian "Status: what FOUNDATION already provides for
  production-domain to build on" — tabel yang menyatakan eksplisit bahwa keempat elemen
  Foundation-side untuk KPI v1 (POT/PBT, unplanned downtime/APT, PRI, PQ/GQ/SQ) sudah
  punya sumber nyata yang bisa di-resolve, termasuk mencatat bahwa PRI (`OPERATION.
  cycle_time_value`) baru benar-benar bisa dihitung sejak T-4 resolved sesi
  sebelumnya (sebelumnya `TIME_CONVERSIONS` tidak punya faktor numerik sama sekali).
  Dua celah yang masih terbuka (K-5 changeover bucketing, debounce window multi-SKU)
  didaftar terpisah supaya tidak tercampur dengan yang sudah siap.
- **Alasan:** PO minta ditegaskan cakupan KPI yang beririsan dengan production-domain —
  daripada implementasi baru, `07-0`/`07-1` dicek dan sudah konsisten dengan perbaikan
  sesi ini (tidak ada rujukan basi ke "hours" atau ke `PRODUCT_CYCLE`); yang kurang
  hanya pernyataan status eksplisit.
- **Dampak:** `production-domain` bisa mulai membangun job kalkulasi KPI v1 tanpa
  menunggu Foundation lagi untuk empat elemen di atas — hanya K-5 dan debounce window
  yang masih perlu keputusan.

---

## 2026-09-02 — FOUNDATION UX: konvensi lintas layar "delete wajib konfirmasi"

- **Tipe:** tambah
- **Domain:** FOUNDATION (UX)
- **File terdampak:** `DOMAINS/FOUNDATION/UX/00-ux.md`
- **Perubahan:**
  - Ditambahkan bagian "Cross-cutting conventions": setiap aksi yang menghapus data
    (bukan deaktivasi master data — itu sudah diatur di F-00 §3) wajib menampilkan dialog
    konfirmasi yang menyebutkan apa yang akan hilang, sebelum aksinya dieksekusi. Berlaku
    seragam di semua layar, tidak boleh dilewati karena aksinya terasa kecil.
  - Kesenjangan ditemukan saat meninjau konsistensi dokumen UX ini terhadap layar-layar
    yang sudah dispesifikasikan — aturan ini sudah tersirat di beberapa layar, tapi
    konvensinya belum pernah tertulis eksplisit.

---

## 2026-09-02 — UX disinkronkan: cycle throughput, quantity+unit, dan aturan overlap shift

- **Tipe:** ubah (sinkronisasi perilaku ke dokumen UX, bukan redesign)
- **Domain:** `foundation-domain`
- **File terdampak:** `DOMAINS/FOUNDATION/UX/06-product.md`, `UX/05-reference.md`,
  `UX/02-shift.md`
- **Perubahan:**
  - `06-product.md` `SCR-FND-PRO-002` — dicatat item (`uom_id`) dan satuan waktu
    (`time_conversion_id`) sebagai dua field terpisah, dan toggle mode entri "Cycle
    time"/"Throughput".
  - `05-reference.md` `SCR-FND-REF-002` — dicatat cara deklarasi lewat kuantitas + satuan
    dasar tetap (bukan angka detik mentah), termasuk perilaku re-edit yang menurunkan
    ulang kuantitas/satuan dari faktor tersimpan.
  - `02-shift.md` `SCR-FND-SHF-002` (panel Shift di `SCR-FND-SIT-002`) — ditambah state
    Error untuk aturan no-overlap `SITE_SHIFT` yang sudah diimplementasikan sebelumnya
    di sesi ini tapi belum tercatat di UX.
  - Dicek `FLOW/*.md` — tidak ada rujukan basi ke `TIME_CONVERSIONS`/`PRODUCT_CYCLE`/
    overlap shift yang perlu dibetulkan, tidak ada perubahan di situ.
- **Alasan:** menutup celah sinkronisasi dari beberapa perubahan kode/model sesi ini yang
  sudah masuk `DOCS-EN/` tapi belum sempat tercermin di `UX/`.
- **Dampak:** dokumen saja — tidak ada perubahan kode.

---

## 2026-09-02 — `PRODUCT_CYCLE`: entri throughput sebagai alternatif waktu siklus

- **Tipe:** tambah (perilaku field, mengikuti pola yang sudah didokumentasikan)
- **Domain:** `foundation-domain`
- **File terdampak:** `DOMAINS/FOUNDATION/DOCS-EN/06-product.md` (§9.3 `cycle_time_value`)
- **Perubahan:** ditambahkan mode entri throughput untuk `PRODUCT_CYCLE.cycle_time_value`
  — admin bisa mengetik laju (mis. "500 per jam") alih-alih waktu siklus langsung; layar
  menurunkan `cycle_time_value = seconds_per_unit ÷ rate` dan selalu menyimpannya ke
  baris `TIME_CONVERSIONS` "seconds" (bukan satuan waktu laju itu sendiri, karena hasil
  bagi jarang bulat di satuan besar). Hanya nilai turunan yang disimpan, laju sendiri
  tidak jadi field tersendiri — pola yang sama persis dengan yang sudah didokumentasikan
  untuk `OPERATION.cycle_time_value` (`08-work-master.md` §9.2) tapi belum pernah
  diimplementasikan di layar mana pun sampai sekarang.
- **Alasan:** PO bertanya apakah throughput bisa dikonversi ke cycle time — jawabannya
  sudah didokumentasikan untuk `OPERATION`; `PRODUCT_CYCLE` (yang baru dibangun ulang
  sesi ini) sekarang mengikuti pola yang sama.
- **Dampak:** `US-FND-PRO`-terkait (`DOCS/prd/`) belum diperbarui untuk menyebut mode
  entri throughput ini — perlu disweep terpisah oleh PO kalau story terkait dibuka lagi.

---

## 2026-09-02 — `PRODUCT_CYCLE`: item dan satuan waktu jadi dua FK terpisah

- **Tipe:** ubah (model F-06, ditemukan lewat screenshot prototype)
- **Domain:** `foundation-domain`
- **File terdampak:** `DOMAINS/FOUNDATION/DOCS-EN/06-product.md` (§9.3, overview bullet)
- **Perubahan:** `PRODUCT_CYCLE.uom_id` sebelumnya adalah satu baris `UNIT_OF_MEASUREMENTS`
  yang menyandang label gabungan penuh (mis. "seconds/pack" sebagai satu unit) — tidak
  ada yang memastikan bagian pembilangnya selalu detik (basis waktu aplikasi, T-4).
  Sekarang dipecah jadi dua FK: `uom_id` (item saja — pack/carton, UOM `count` biasa) +
  `time_conversion_id` baru (satuan waktu `cycle_time_value` dicatat, sama seperti
  `OPERATION.time_conversion_id` di Work Master §9.2). Nilai detik sebenarnya diturunkan
  otomatis dari `cycle_time_value × TIME_CONVERSIONS.seconds_per_unit`.
- **Alasan:** PO menunjukkan kalau field waktunya tidak konsisten dengan cara
  `TIME_CONVERSIONS`/`OPERATION` sudah dibetulkan sesi ini — mengonfirmasi item dari
  UOM, waktu dari Time Conversions.
- **Dampak:** `PRODUCT.base_uom_id` dan `PRODUCT_UOM_CONVERSION.from_uom_id`/`.to_uom_id`
  (§9.1, §9.4) **belum** mengikuti perbaikan yang sama — masih didokumentasikan sebagai
  FK, tapi ada gap terpisah dari sebelum modul UOM ini punya implementasi nyata. Belum
  diminta untuk dibetulkan.

---

## 2026-09-02 — `TIME_CONVERSIONS`: deklarasi via kuantitas + satuan, bukan detik mentah

- **Tipe:** ubah (perilaku deklarasi field, bukan skema)
- **Domain:** `foundation-domain`
- **File terdampak:** `DOMAINS/FOUNDATION/DOCS-EN/05-reference-master-data.md` (§9.3)
- **Perubahan:** ditambahkan aturan bahwa satu baris `TIME_CONVERSIONS` dideklarasikan
  lewat kuantitas + satuan dasar tetap (detik/menit/jam/hari — bukan tabel sendiri,
  cuma pilihan di form ini), dan layar yang menghitung `seconds_per_unit` secara
  otomatis ("30" + "menit" → `1800`) — bukan admin mengetik angka detik mentah sendiri.
  Kuantitas/satuan aslinya tidak disimpan terpisah; saat diedit ulang, nilai itu
  diturunkan ulang dari `seconds_per_unit` dengan memilih satuan bulat terbesar yang
  membaginya rata. `code`/`name` jadi label bebas (mis. "Standard changeover"), tidak
  lagi wajib menamai satuan dasar — bisa mewakili durasi bernama apa pun.
- **Alasan:** PO menunjukkan kalau field faktor mentah ("seconds_per_unit" diketik
  langsung) merepotkan — misal produk siklus 0,5 jam lebih gampang dinyatakan sebagai
  "30 menit" daripada memaksa desimal di satuan jam.
- **Dampak:** menutup celah UX yang sama untuk siapa pun yang membangun layar
  `SCR-FND-REF-002` — kuantitas + satuan adalah kontrak input, bukan lagi angka detik
  mentah.

---

## 2026-09-02 — F-05: empat taksonomi referensi jadi menu terpisah, bukan satu switcher

- **Tipe:** ubah (navigasi/UX)
- **Domain:** `foundation-domain`
- **File terdampak:** `DOMAINS/FOUNDATION/UX/05-reference.md`
- **Perubahan:**
  - Ditambahkan `SCR-FND-REF-003` (Downtime reason manager) dan `SCR-FND-REF-004` (Reject
    reason manager) — sebelumnya dokumen ini salah mengklaim layarnya ada di
    `04-asset.md`, padahal tidak pernah ditulis di sana. Coverage diperluas mencakup
    `DOWNTIME_REASON`/`REJECT_REASON`.
  - Ditambahkan catatan bahwa keempat taksonomi (`UNIT_OF_MEASUREMENTS`,
    `TIME_CONVERSIONS`, `DOWNTIME_REASON`, `REJECT_REASON`) sekarang masing-masing punya
    nav entry & layar sendiri, bukan satu layar "Reference & Master Data" dengan section
    switcher seperti sebelumnya.
  - `SCR-FND-REF-002`'s catatan diperbarui menyebut `seconds_per_unit` (mengikuti T-4
    yang sudah resolved sebelumnya di sesi ini).
- **Alasan:** PO memutuskan splitting lebih baik daripada satu menu gabungan — masing-
  masing taksonomi kecil, flat, dan dirujuk modul lain secara independen; digabung dalam
  satu switcher membuatnya kurang mudah ditemukan (butuh tahu dulu ada di dalam
  "Reference & Master Data" sebelum bisa membuka tab yang benar).
- **Dampak:** navigasi F-05 sekarang punya 4 titik masuk terpisah alih-alih 1 — dokumen
  turunan lain (mis. onboarding/training material) yang masih merujuk "Reference &
  Master Data" sebagai satu layar perlu disesuaikan.

---

## 2026-09-02 — Indikator "shift belum lengkap" di node Site (Tree/Diagram/Table)

- **Tipe:** ubah (UX, hasil sinkronisasi dengan prototype)
- **Domain:** `foundation-domain`
- **File terdampak:** `DOMAINS/FOUNDATION/UX/01-site-hierarchy.md`
- **Perubahan:** ditambahkan catatan bahwa node `SITE`, di ketiga mode tampilan
  (Tree/Diagram/Table), sekarang menampilkan badge count merah solid saat situs itu
  belum melengkapi adopsi `SITE_SHIFT` (jumlah `ENTERPRISE_SHIFT` yang belum dideklarasi
  — angka yang sama dengan badge "N missing" yang sudah ada di panel Shift). `Area`/`Work
  Center`/`Work Unit` tidak pernah menampilkan ini.
- **Alasan:** sebelumnya situs yang belum lengkap hanya terlihat setelah dibuka satu per
  satu ke panel Shift — PO minta ketidaklengkapan terlihat langsung dari tree/diagram/
  table.
- **Dampak:** dokumen saja — tidak ada entitas atau aturan baru, murni catatan
  visibilitas UX untuk `SCR-FND-SIT-001`.

---

## 2026-09-02 — `SITE_SHIFT` tidak boleh tumpang tindih dalam satu situs (aturan baru)

- **Tipe:** tambah (aturan/validasi baru)
- **Domain:** `foundation-domain`
- **File terdampak:** `DOMAINS/FOUNDATION/DOCS-EN/02-shift.md` (§9.2 `SITE_SHIFT`)
- **Perubahan:** ditambahkan aturan eksplisit bahwa dua baris `SITE_SHIFT` pada `site_id`
  yang sama tidak boleh menempati menit yang sama, termasuk lintas tengah malam (ekor
  shift `23:00–06:59` menempati `00:00–06:59` di hari kalender berikutnya, dan itu tidak
  boleh bentrok dengan shift lain yang mulai sebelum `06:59`). Divalidasi saat
  declare/edit, ditolak dengan menyebut shift yang bentrok — pola error yang sama dengan
  error delete-blocked yang sudah ada di tabel yang sama.
- **Alasan:** PO diminta memastikan jam shift per situs tidak melebihi/menabrak 24 jam —
  ini sebelumnya implisit dari core concept 1 ("setiap situs wajib punya satu baris per
  `ENTERPRISE_SHIFT`") tapi tidak pernah dieja sebagai aturan validasi eksplisit.
- **Dampak:** aturan validasi baru yang wajib ditegakkan di titik mana pun `SITE_SHIFT`
  dideklarasikan atau diedit — bukan hanya rekomendasi UX, ini aturan data.

---

## 2026-09-02 — FOUNDATION UX (Site Hierarchy/Shift/Fiscal) disinkronkan ke perilaku prototype terbaru

- **Tipe:** ubah (sinkronisasi perilaku, bukan redesign)
- **Domain:** `foundation-domain`
- **File terdampak:** `DOMAINS/FOUNDATION/UX/01-site-hierarchy.md`, `DOMAINS/FOUNDATION/UX/02-shift.md`,
  `DOMAINS/FOUNDATION/UX/03-fiscal.md`
- **Perubahan:**
  - `01-site-hierarchy.md` — model editing diganti dari form inline di detail pane jadi
    dialog yang dibuka lewat menu "more actions" (⋮) di tiap node row/box, di **ketiga**
    mode tampilan (Edit + Add {child kind}, deactivate tetap di footer dialog Edit,
    disabled/TBD). `SCR-FND-SIT-001` diubah dari satu "diagram view" jadi tiga mode
    tampilan yang bisa dipilih user — Tree (list bertingkat), Diagram (box+connector),
    Table (tabel flat dengan filter tipe) — bukan lagi canvas tunggal + fallback
    aksesibilitas. Detail pane sekarang murni tampilan baca (title, code, badge tipe) +
    `renderExtra` (panel Shift/Fiscal Year untuk Enterprise/Site, ringkasan Asset
    Placement untuk Work Unit). Ditambahkan catatan eksplisit bahwa hierarchy panel
    kiri tidak bisa di-collapse ke rail. Layout sketch diperbarui mengikuti semua ini.
  - `01-site-hierarchy.md` & `03-fiscal.md` — panel Fiscal Year untuk node `SITE`
    sekarang **murni read-only**, tidak ada override level-site (tombol/dialog/entitas
    `FISCAL_YEAR_SITE_OVERRIDE` semuanya tidak ada). Ini juga membetulkan kedua file
    yang sebelumnya bertentangan dengan keputusan Y-2 yang sudah resolved di
    `DOMAINS/FOUNDATION/DOCS-EN/03-yearly-quarterly-declaration.md` ("no site override
    needed — enterprise-level always").
  - `02-shift.md` — `SCR-FND-SHF-001` ditambah kemampuan edit in-place: ikon pensil per
    baris `ENTERPRISE_SHIFT` membuka dialog untuk mengubah `shift_label` dan
    `is_production_shift`, selaras dengan F-02 §9.1 yang sudah memperlakukan field ini
    sebagai field deklaratif biasa (bukan record tertutup seperti `SHIFT_INSTANCE`).
- **Alasan:** satu ronde validasi lewat prototype mengubah perilaku layar nyata secara
  material dari yang didokumentasikan — dokumen UX ini adalah source-of-truth perilaku
  dan disinkronkan ke keputusan yang sudah divalidasi, bukan sebaliknya.
- **Dampak:** tidak ada SCR ID baru atau penomoran ulang. `DOMAINS/FOUNDATION/DOCS-EN/*`
  dan `DOCS/prd/` tidak disentuh — sudah benar/di luar cakupan sesi ini.

## 2026-09-02 — T-4 resolved: `TIME_CONVERSIONS` dapat field `seconds_per_unit`, target unit jadi seconds

- **Tipe:** ubah (resolusi open question)
- **Domain:** `foundation-domain`
- **File terdampak:** `DOMAINS/FOUNDATION/DOCS-EN/05-reference-master-data.md` (§9.3, §9.6),
  `DOMAINS/FOUNDATION/DOCS-EN/08-work-master.md` (§9.2), `DOMAINS/FOUNDATION/DOCS-EN/06-product.md`,
  `DOMAINS/FOUNDATION/DOCS-EN/04-asset-ontology.md`, `DOMAINS/FOUNDATION/DOCS-EN/07-1-kpi-tag-mapping.md`,
  `DOMAINS/FOUNDATION/DOCS-EN/tag-declaration-draft.md`
- **Perubahan:** `TIME_CONVERSIONS` sebelumnya cuma `code`/`name` plus field aneh `time_conversions`
  (string, dicurigai cacat modeling) — tidak ada faktor numerik sama sekali untuk benar-benar
  melakukan konversi yang didokumentasikan di `OPERATION.time_conversion_id`. Field itu diganti
  `seconds_per_unit` (numeric, wajib) — berapa detik untuk satu unit `code` baris ini (mis.
  `minutes` → `60`, `hours` → `3600`, `seconds` → `1`). Nilai hasil konversi selalu dihitung
  backend otomatis (`raw_value × seconds_per_unit`), tidak pernah diketik manual sebagai angka
  terpisah. Target/base unit konversi ditetapkan PO sebagai **seconds**, bukan hours yang
  sebelumnya cuma tersirat di prosa — semua penyebutan "convert to hours"/"to hours" yang
  merujuk mekanisme konversi ini (di `08-work-master.md` §9.2 `cycle_time_value`/`uom_id`/
  `time_conversion_id`, `06-product.md`, `04-asset-ontology.md` bagian tag `runtime`, dan
  `07-1-kpi-tag-mapping.md`) diubah jadi "to seconds". T-4 di §9.6 `05-reference-master-data.md`
  ditandai resolved (coret + catatan **Resolved: ...**), mengikuti konvensi resolusi open
  question yang sudah dipakai file ini untuk T-1–T-3/T-5 gaya file lain.
- **Alasan:** T-4 (juga dirujuk sebagai R-19 di PRD-001 dan M4 di PRD-003) adalah alasan
  `US-FND-REF-005` ditandai BLOCKED — tabel referensi tidak punya cara nyata melakukan
  konversi yang didokumentasikan sebagai konsumen tunggalnya. PO memutuskan target unit
  (seconds) dan mekanisme (faktor numerik tersimpan, dihitung backend) dalam sesi ini.
- **Dampak:** `TIME_CONVERSIONS` sekarang punya fondasi model yang benar-benar bisa
  diimplementasikan. `US-FND-REF-005`/R-19/M4 **tetap BLOCKED** — dokumen PRD (`DOCS/prd/`)
  sengaja tidak disentuh sesi ini, unblock story itu adalah keputusan PO terpisah.

---

## 2026-08-28 — FOUNDATION UX: `01-site-hierarchy.md` disamakan dengan tiga mode tampilan implementasi nyata

- **Tipe:** ubah
- **Domain:** FOUNDATION (UX)
- **File terdampak:** `DOMAINS/FOUNDATION/UX/01-site-hierarchy.md`
- **Perubahan:**
  - Baris `SCR-FND-SIT-001` sebelumnya menyebut layar ini sebagai satu "diagram view"
    tunggal ("tree rendered as a diagram (boxes + connectors...)"). Implementasi nyata
    punya **tiga mode toggle** berbeda atas node set yang sama: **Tree** (list indented,
    default), **Diagram** (boxes+connectors, layout 2D asli), **Table** (list flat +
    filter per jenis). Baris diperbarui menyebut ketiganya secara eksplisit dan
    menyempitkan makna "diagram" ke satu dari tiga mode, bukan seluruh layar.
  - Ditambahkan catatan state baru: **Sidebar quick-links** — Sites/Areas/Work
    Centers/Work Units masing-masing dapat sub-link di sidebar, semuanya menuju layar
    `SCR-FND-SIT-001` yang sama dalam mode Table dengan filter jenis (`?type=`), bukan
    layar terpisah — keputusan komposisi layar saja.
  - Ditambahkan catatan state baru: **Timezone adalah daftar terkunci, bukan teks
    bebas** — field Timezone pada node `SITE` (saat buat maupun edit) adalah searchable
    select dari daftar IANA timezone asli, kebalikan dari aturan Code yang bebas teks.
- **Alasan:** sesi ini membangun Site Hierarchy jadi aplikasi nyata (tree/diagram/table
  toggle, sidebar quick-links, timezone picker) — dokumen perlu disamakan agar tidak
  menyiratkan hanya ada satu mode tampilan atau bahwa Timezone bebas format seperti Code.
- **Dampak:** tidak ada perubahan entitas — murni penyelarasan deskripsi layar dengan
  implementasi yang sudah diverifikasi langsung dari kode.

## 2026-08-28 — UX 01/05/06/04: catat keputusan interaksi dari implementasi nyata (dialog, tab, konsolidasi Reference & Master Data)

- **Tipe:** ubah
- **Domain:** FOUNDATION (UX)
- **File terdampak:** `DOMAINS/FOUNDATION/UX/01-site-hierarchy.md`, `DOMAINS/FOUNDATION/UX/06-product.md`, `DOMAINS/FOUNDATION/UX/05-reference.md`, `DOMAINS/FOUNDATION/UX/04-asset.md`
- **Perubahan:** menulis balik keputusan level-interaksi yang sudah diputuskan tapi belum
  tercatat di dokumen — bukan detail visual, tapi fakta interaksi yang memang wajib ada
  di UX doc (pola modal/dialog, tab vs layar terpisah), diverifikasi langsung terhadap
  spesifikasi layar yang berlaku, bukan diasumsikan:
  - `01-site-hierarchy.md`: menegaskan dialog **memang pola yang dipilih** untuk semua aksi
    tulis di detail pane (Enterprise Shift add, Site Shift declare, Fiscal Year declare,
    site override) — bukan sekadar "diperbolehkan."
  - `06-product.md`: `SCR-FND-PRO-002`/`003` diperbarui — keduanya adalah **tab** pada satu
    halaman detail `SCR-FND-PRO-001`, bukan layar terpisah. ID tetap dipertahankan.
  - `05-reference.md` + `04-asset.md`: **konsolidasi nyata ditemukan** — `SCR-FND-REF-001`
    (UOM), `SCR-FND-REF-002` (Time conversion), dan `SCR-FND-AST-004` (Reason taxonomy)
    ternyata dibangun sebagai **satu layar** dengan section switcher (Units of measurement /
    Time conversions / Downtime reasons / Reject reasons), bukan tiga layar terpisah.
    Ketiga ID dipertahankan (tidak diberi nomor ulang), masing-masing sekarang menunjuk ke
    section-nya di layar gabungan tersebut. Kepemilikan entitas tidak berubah — F-05 tetap
    pemilik semua entitasnya, `04-asset.md` tetap pemilik story untuk reason taxonomy.
- **Alasan:** ini murni keputusan komposisi layar, bukan keputusan produk baru — tapi tanpa
  dicatat, dokumen akan menyesatkan siapa pun yang membaca UX doc tanpa melihat kode nyata,
  seolah-olah masih ada 3 layar terpisah untuk apa yang sekarang 1 layar dengan section.
- **Dampak:** tidak ada perubahan entitas/aturan F-04/F-05/F-06. Verifikasi dilakukan
  membaca langsung spesifikasi layar yang berlaku (Reference & Master Data, Product
  detail, dialog Shift/Fiscal Year), bukan asumsi dari percakapan sesi ini.

## 2026-08-28 — UX 01 (Site Hierarchy): sinkronkan dua temuan dari implementasi nyata

- **Tipe:** ubah
- **Domain:** FOUNDATION (UX)
- **File terdampak:** `DOMAINS/FOUNDATION/UX/01-site-hierarchy.md`
- **Perubahan:**
  - **State notes:** ditambah bullet "Panel collapse" — panel hierarchy dan detail pane
    sekarang bisa di-collapse independen jadi rail ikon sempit (toggle chevron di header
    masing-masing), supaya salah satu panel bisa mengambil alih lebar dari panel lainnya;
    state-nya session-local, tidak persisten.
  - **State notes:** bullet "Deactivated nodes" diberi catatan silang ke `UX-SIT-3` baru —
    fiturnya belum bisa dibangun karena field-nya belum ada di model data yang
    diimplementasikan.
  - **State notes:** bullet "Master-detail" diperjelas — larangan "no floating forms on
    the canvas" spesifik untuk **tree canvas**, bukan larangan dialog/popup untuk aksi yang
    berasal dari detail pane itu sendiri (Shift/Fiscal Year/Asset Placement semuanya sudah
    benar memakai dialog untuk aksi add/declare/place-nya).
  - **Open questions:** ditambah `UX-SIT-3` — `SITE`/`AREA`/`WORK_CENTER`/`WORK_UNIT` tidak
    punya field `valid_from`/`valid_to` di model data yang sudah diimplementasikan, jadi
    state note "Deactivated nodes... never silently removed" saat ini tidak punya apa pun
    untuk dirender. Menunggu `foundation-domain`: apakah deaktivasi memang dibutuhkan untuk
    keempat entitas ini, atau state note itu cuma warisan dari aturan umum F-00 tanpa
    konfirmasi eksplisit di level entitas.
- **Alasan:** peninjauan spesifikasi Site Hierarchy (`SCR-FND-SIT-001/002`) sesi ini
  menemukan dua kesenjangan dokumentasi — satu detail UI yang belum tercatat (panel
  collapse), satu gap model data yang nyata (field deaktivasi tidak ada) — plus satu
  ambiguitas kata-kata yang sempat memicu pertanyaan apakah dialog untuk Shift/Fiscal
  boleh dipakai. Ketiganya ditulis balik ke dokumen sesuai prinsip "temuan implementasi
  wajib disinkronkan ke UX/PRD", bukan didiamkan.
- **Dampak:** tidak ada perubahan entitas atau aturan F-01 — murni catatan state/pertanyaan
  terbuka. `03-yearly-quarterly-declaration.md` (mode `calendar_basis`/`period_pattern`
  `FISCAL_YEAR`) dicek terhadap doc ini — `01-site-hierarchy.md` tidak menyebut field
  `FISCAL_YEAR` apa pun secara langsung (hanya "declare FISCAL_YEAR windows"), jadi detail
  mode/pattern itu tetap sepenuhnya milik F-03, tidak perlu diduplikasi di sini.

## 2026-08-28 — PRD-003: perbaiki §6.2/§6.4/§6.5 yang kontradiksi keputusan yang sudah resolved

- **Tipe:** ubah
- **Domain:** Product Owner (PRD lintas domain)
- **File terdampak:** `DOCS/prd/PRD-003-foundation-domain-en.md`
- **Perubahan:**
  - **§6.2 Asset Ontology** — `US-FND-AST-003` ditulis ulang total: aturan "satu work unit
    satu asset" dan penolakan AC-3 diganti model primary/secondary yang sudah resolved di
    A-9 (`04-asset-ontology.md`, 2026-08-20) dan sudah di-spec penuh di `UX/04-asset.md`
    sesi ini. Field `WORK_UNIT.current_asset_id`/`ASSET.work_unit_id` yang direka dihapus —
    `ASSET_PLACEMENT` satu-satunya sumber. `US-FND-AST-002` kehilangan field
    `manufacturer`/`model` (A-7, resolved: dihapus dari `ASSET`) dan field `criticality`
    yang sama sekali tidak ada di spec F-04 — ditandai `TBD`. Batas kedalaman komponen
    diperbaiki dari klaim "3 level" jadi 4 layer ISO 14224 yang sebenarnya (Equipment
    unit→Subunit→Maintainable item→Part). Nama entitas `DOWNTIME_REASON_EQUIPMENT`/
    `REJECT_REASON_EQUIPMENT` di `US-FND-AST-001` diperbaiki jadi `DOWNTIME_REASON_ASSET`/
    `REJECT_REASON_ASSET`, nama yang benar di F-05.
  - **§6.4 Organization** — seluruh section ditutup (`US-FND-ORG-001/002/003`), sesuai
    keputusan `AGENTS.md` §4 2026-08-24: Organization dihapus dari FOUNDATION, peran/akses
    kini milik identity provider. Konten asli dipertahankan (dicoret, ditandai jangan
    dibangun), bukan dihapus. Semua dependent lintas section diperbaiki: `US-FND-SIT-003`
    (kalkulasi `effective_scope`), Workflow Engine, Notification, Configuration Service —
    masing-masing ditandai `TBD` untuk integrasi identity provider, bukan menebak
    jawabannya. Tabel ringkasan entitas (§7.2) dan tabel layar (§7.1) diperbarui senada.
  - **§6.5 "Calendar & Shift" → "Shift"** — nama section diperbaiki (separuh "Calendar"
    sudah pindah jadi §6.13 FYR). `US-FND-SHF-001` ditulis ulang total dari model
    `SHIFT_DEFINITION`/`SHIFT_PATTERN` (rotasi day×crew) yang **tidak pernah ada** menjadi
    model dua-level yang sebenarnya (`ENTERPRISE_SHIFT` + `SITE_SHIFT`, tab pada node
    `ENTERPRISE`/`SITE` di `SCR-FND-SIT-002`), termasuk H-1 (3 shift, jam resolved) dan H-2
    (tidak ada field break). `US-FND-SHF-004` ditandai **CLOSED, BLOCKED** (bukan
    diretensi) — bergantung pada `CREW`/`US-FND-ORG-003` yang hilang bersama Organization;
    `TBD` menunggu PO, ID dipertahankan.
  - **§6.1 Site Hierarchy** — field `SITE.default_shift_calendar_id` (konsep Calendar yang
    sudah pensiun) dihapus dari `US-FND-SIT-001`.
  - **§6.13 Yearly & Quarterly Declaration** — ditambah catatan komposisi layar (tab pada
    `SCR-FND-SIT-002`, bukan layar berdiri sendiri); isi entitas tidak diubah, sudah benar.
  - §13.2 (tabel story ditutup) dan seluruh tautan anchor markdown yang berubah akibat
    judul story yang diganti (`US-FND-SHF-001`, `US-FND-SHF-004`, section §6.4/§6.5)
    disinkronkan.
- **Alasan:** hasil audit `PRD-003` atas permintaan user, membandingkan terhadap
  `DOMAINS/FOUNDATION/DOCS-EN/*` dan `UX/*` versi sesi ini (termasuk perubahan PR #15).
  §6.2 dan §6.5 kontradiksi keputusan F-04/F-02 yang sudah resolved **sebelum** PRD-003
  ditulis (bukan basi karena PR #15) — ini murni salah tulis awal, bukan drift dokumen.
  §6.4 kontradiksi keputusan yang dibuat pada tanggal yang sama dengan PRD ini.
- **Dampak:** tidak ada entitas baru diciptakan. Field `criticality` pada `ASSET` dan
  pertanyaan "apa itu crew sekarang" (`US-FND-SHF-004`) tetap terbuka, ditandai eksplisit
  `TBD — perlu konfirmasi PO`/`foundation-domain`, bukan ditebak. §6.10/§6.11 (Reference &
  Master Data, Product) dikonfirmasi bersih pada audit sebelumnya — tidak disentuh.
  Catatan tambahan di luar cakupan perbaikan ini: `US-FND-SHF-002` (generate shift
  instance) kemungkinan juga sudah di luar scope FOUNDATION menurut `02-shift.md` sendiri
  (mekanisme generate adalah tanggung jawab `production-domain`) — belum diperbaiki di sini,
  perlu keputusan `foundation-domain`/`production-domain` terpisah.


## 2026-08-28 — FOUNDATION: perbaiki dokumen stale hasil audit penuh (journey, glossary, F-00, WORK_UNIT_FLOW)

- **Tipe:** ubah
- **Domain:** FOUNDATION + Product Owner (glossary lintas domain)
- **File terdampak:** `DOMAINS/FOUNDATION/UX/09-jrn-implementor-setup.md`,
  `DOCS/01-glossary.md`, `DOMAINS/FOUNDATION/DOCS-EN/00-foundation.md`,
  `DOMAINS/FOUNDATION/DOCS-EN/work-unit-flow-draft.md`
- **Perubahan:**
  - `09-jrn-implementor-setup.md`: fase wizard "declare hierarchy" dan "declare time"
    digabung jadi satu fase — keduanya sekarang satu layar (`SCR-FND-SIT-002`) sejak PR
    #15 memindahkan Shift/Fiscal Year jadi tab pada node `ENTERPRISE`/`SITE`, bukan layar
    terpisah. Juga memperbaiki anotasi F-05 yang salah menyebut UOM hidup di
    `SCR-FND-AST-004` — hanya reason taxonomy (downtime/reject) yang di sana, UOM tetap
    di `SCR-FND-REF-001`.
  - `01-glossary.md`: entri **Domain** diperbaiki — sebelumnya didefinisikan sebagai
    kategori aktivitas manufaktur IEC 62264 (Production/Quality/Maintenance/Inventory),
    padahal itu istilah standar yang berbeda dari `domain` proyek ini (satu folder
    `DOMAINS/<NAMA>/`, satu agent). Ditambahkan entri baru **MOM activity category**
    untuk istilah IEC 62264 itu sendiri, dengan catatan eksplisit agar tidak tertukar —
    kekeliruan ini kemungkinan sumber "KPI Selection: Production/Quality/Maintenance/
    Inventory" yang muncul di draft UX sebelumnya. Entri **Shift pattern** ditandai
    dipensiunkan (F-02 core concept 2 sudah menghapus konsep ini) dan **Shift** diperbarui
    dari `TBD` jadi resolved (3 Enterprise Shift, jam tetap per F-02 H-1).
  - `00-foundation.md`: daftar entitas effective-dating diberi catatan eksplisit "bukan
    daftar lengkap" plus ditambah lima entitas yang sebelumnya hilang dari daftar
    (`ENTERPRISE_SHIFT`, `ASSET_TAGS`, `PRODUCT_CYCLE`, `PRODUCT_UOM_CONVERSION`,
    `QUALITY_DEFECT_CODE`) — semuanya sudah punya `valid_from`/`valid_to` di modulnya
    masing-masing tapi tidak disebut di sini.
  - `work-unit-flow-draft.md`: ditambah pertanyaan terbuka #5 — `FLOW-05` (KPI
    computation) sudah bergantung pada draft ini untuk fallback Quality lintas
    `WORK_UNIT_FLOW`, padahal draft ini baru mencakup Availability/starvation, belum
    Quality. Dua celah dicatat: neighbor mana yang dipakai saat ada >1 predecessor, dan
    field shrinkage/yield per step yang belum ada di `OPERATION` (§9.2 08-work-master.md).
- **Alasan:** hasil audit penuh atas permintaan user ("search trough all of it") terhadap
  bagian FOUNDATION yang belum direview mendalam sesi ini — F-00, seri FLOW, journey doc,
  dan draft yang belum digabung. Semua temuan bersifat perbaikan dokumen stale/salah
  kutip, bukan keputusan produk baru.
- **Dampak:** tidak ada perubahan entitas. `work-unit-flow-draft.md`'s pertanyaan #5 tetap
  terbuka menunggu `foundation-domain` — belum diselesaikan di sini, hanya didokumentasikan
  agar tidak hilang.


## 2026-08-28 — FOUNDATION UX: Shift/Fiscal jadi tabs pada ENTERPRISE/SITE, Asset Placement tetap section

- **Tipe:** ubah
- **Domain:** FOUNDATION (UX)
- **File terdampak:** `DOMAINS/FOUNDATION/UX/01-site-hierarchy.md`
- **Perubahan:** `SCR-FND-SIT-002`'s Shift/Fiscal Year pada node `ENTERPRISE` dan `SITE`
  diubah dari stacked sections jadi **tabs**, mengikuti pola tab yang sudah dipakai
  `SCR-FND-PRO-001` (product detail) — satu pola interaksi konsisten untuk "beberapa hal
  menempel pada satu detail record" di seluruh app, bukan pola berbeda per layar.
  Asset Placement pada node `WORK_UNIT` **tetap section biasa**, bukan tab — hanya ada
  satu hal di sana, jadi tab bar dengan satu tab tidak memberi pilihan nyata ke user.
- **Alasan:** konsistensi pola UI lintas layar. Tidak ada perubahan entitas — murni
  komposisi tampilan.
- **Dampak:** `01-site-hierarchy.md` §Screens, bagian "Shift & Fiscal panels" (diganti
  nama jadi "Shift & Fiscal tabs, Asset Placement section"), dan layout sketch
  diperbarui agar konsisten menyebut tabs vs section.


## 2026-08-28 — FOUNDATION UX: Asset Placement summary on `WORK_UNIT`, `SCR-FND-AST-003` fully specified

- **Tipe:** ubah
- **Domain:** FOUNDATION (UX)
- **File terdampak:** `DOMAINS/FOUNDATION/UX/01-site-hierarchy.md`, `DOMAINS/FOUNDATION/UX/04-asset.md`
- **Perubahan:**
  - `01-site-hierarchy.md`: `SCR-FND-SIT-002` gains a third node-type variant — when the
    selected node is `WORK_UNIT`, the detail pane shows a **read-only** Asset Placement
    summary (current primary/secondary + "view history / place →" link into
    `SCR-FND-AST-003`). This section never writes `ASSET_PLACEMENT` itself, keeping the
    existing "positions only, no drag-and-drop of machines" rule intact — placement stays
    a link-out, not a duplicate editing surface.
  - `04-asset.md`: `SCR-FND-AST-003` expanded from a one-line summary into a full
    list+timeline+action spec: list of work units (current primary/secondary at a
    glance), per-work-unit timeline (primary max 1 active + full history, secondary 0..N
    + history), and a place/swap action (asset picker restricted to Equipment-unit level,
    role choice, effective date, A-9 duplicate-primary rejection). Added two open
    questions (UX-AST-2: should an unplaced work unit alert like Shift Instance Monitor's
    "no gaps" rule; UX-AST-3: reverse lookup from Asset Register).
- **Alasan:** `ASSET_PLACEMENT` connects two separate taxonomies (`WORK_UNIT` from Site
  Hierarchy, `ASSET` from Equipment Taxonomy) — same shape reasoning already used for why
  it stays a standalone screen (`SCR-FND-AST-003`) rather than folding into either tree,
  unlike `SITE_SHIFT`/`FISCAL_YEAR` which belong to exactly one node. The site-hierarchy
  summary section only exists so a user already looking at a `WORK_UNIT` doesn't have to
  navigate away to see what's placed there.
- **Dampak:** no entity changes — `ASSET_PLACEMENT` (F-04 §9.6) is unchanged, this is
  screen composition only. Two related but unresolved questions (a per-`OPERATION`
  shrinkage/yield field on Work Master, and whether `WORK_UNIT_KPI_BINDING` needs
  revalidation after a placement swap) are **not** included here — both are entity/behavior
  questions routed to `foundation-domain`, not decided in this UX pass.


## 2026-08-28 — FOUNDATION UX: revisi — Shift & Fiscal Year jadi panel enterprise+site di `SCR-FND-SIT-002`, bukan menu sendiri

- **Tipe:** ubah
- **Domain:** FOUNDATION (UX)
- **File terdampak:** `DOMAINS/FOUNDATION/UX/02-shift.md`, `DOMAINS/FOUNDATION/UX/03-fiscal.md`, `DOMAINS/FOUNDATION/UX/01-site-hierarchy.md`
- **Perubahan:** merevisi entri changelog sesi ini sebelumnya (di bawah) menyusul UX diagram PO
  yang menaruh Enterprise Shift dan Fiscal Year sebagai section di node `ENTERPRISE`, bukan
  menu list+detail terpisah:
  - `SCR-FND-SHF-001` (enterprise shift labels) dan `SCR-FND-FSC-001` (fiscal year declaration)
    **dibatalkan jadi menu sendiri** — keduanya kembali diretire sebagai layar standalone dan
    jadi varian node-type dari panel Shift/Fiscal Year di `SCR-FND-SIT-002`: tampil dengan mode
    *declare* saat node terpilih `ENTERPRISE`, dan mode *completion checklist / read-mostly +
    override* saat node terpilih `SITE` (perilaku `SITE_SHIFT`/`FISCAL_YEAR` sebelumnya, tidak
    berubah).
  - `02-shift.md`: baris `SCR-FND-SHF-001` dan `SCR-FND-SHF-002` sama-sama coret (retired),
    keduanya menunjuk ke `SCR-FND-SIT-002` dengan node berbeda. Status file tetap 🟡 DRAFT —
    `SCR-FND-SHF-003`/`004` masih layar aktif.
  - `03-fiscal.md`: `SCR-FND-FSC-001` tetap coret (retired) tapi catatannya diperbaiki agar
    menjelaskan dua mode panel (enterprise declare vs site read/override), bukan cuma satu.
    Status file tetap 🔴 RETIRED — tidak ada layar aktif tersisa di file ini.
  - `01-site-hierarchy.md`: baris `SCR-FND-SIT-002`, bagian "Shift & Fiscal panels", layout
    sketch, dan `UX-SIT-2` diperbarui agar menyebut kedua node type (`ENTERPRISE` dan `SITE`)
    secara eksplisit.
- **Alasan:** tree `SCR-FND-SIT-001`/`002` sudah punya node `ENTERPRISE` sebagai root — jadi
  `ENTERPRISE_SHIFT` dan `FISCAL_YEAR` (keduanya entitas enterprise-level yang dideklarasikan
  sebelum situs mana pun ada) punya tempat menempel alami di tree yang sama, tidak perlu menu
  top-level terpisah. Keputusan sebelumnya (menu list+detail sendiri untuk `SCR-FND-SHF-001`)
  ditarik karena tidak sesuai desain UX aktual PO.
- **Dampak:** tidak ada perubahan entitas/aturan F-02/F-03 — murni komposisi layar. FLOW-01
  tetap tidak berubah (tidak mengutip `SCR-FND-SHF-001`/`SCR-FND-FSC-001` untuk aturan mana pun).

## 2026-08-28 — FOUNDATION UX: `03-fiscal.md` diretire, `SCR-FND-SHF-001` jadi menu list+detail sendiri (direvisi, lihat entri di atas)

- **Tipe:** ubah
- **Domain:** FOUNDATION (UX)
- **File terdampak:** `DOMAINS/FOUNDATION/UX/02-shift.md`, `DOMAINS/FOUNDATION/UX/03-fiscal.md`, `DOMAINS/FOUNDATION/UX/01-site-hierarchy.md`
- **Perubahan:**
  - `03-fiscal.md` status dokumen diubah jadi 🔴 RETIRED — satu-satunya layarnya (`SCR-FND-FSC-001`) sudah diserap penuh ke panel Fiscal Year di `SCR-FND-SIT-002`, tidak ada yang tersisa di file ini.
  - `02-shift.md` status **tetap** 🟡 DRAFT (bukan RETIRED) — hanya `SCR-FND-SHF-002` yang diserap ke `SCR-FND-SIT-002`; `SCR-FND-SHF-001`, `003`, `004` masih layar aktif milik file ini.
  - `SCR-FND-SHF-001` (Enterprise shift labels) diubah dari tombol di dalam node enterprise pada hierarchy jadi **menu list+detail sendiri**, mengikuti pola tree+pane `SCR-FND-SIT-001`/`002`: list nama `ENTERPRISE_SHIFT`, detail per-baris berisi `is_production_shift` dan daftar read-only site yang sudah adopsi beserta jam realnya.
  - `01-site-hierarchy.md` diperbarui: baris `SCR-FND-SIT-002`, catatan "Shift & Fiscal panels", dan `UX-SIT-2` disinkronkan agar tidak lagi menyiratkan `SCR-FND-SHF-001` sebagai "langkah terpisah" tanpa bentuk layar.
- **Alasan:** `SITE_SHIFT` memang dipaksa site-scoped (adopsi wajib per site, F-02 core concept 1) — itu levar yang benar ada di detail pane site. Tapi `ENTERPRISE_SHIFT` dideklarasikan sekali secara enterprise-wide sebelum situs mana pun ada, jadi tidak punya node untuk ditempeli — layarnya butuh entry point sendiri, bukan tombol tersembunyi di dalam hierarchy. Ini keputusan komposisi layar saja, tidak mengubah entitas atau aturan F-02.
- **Dampak:**
  - `02-shift.md` §Screens: baris `SCR-FND-SHF-001` sekarang menjelaskan list+detail lengkap dengan empty state ("declare your first shift").
  - FLOW-01 tidak berubah — dokumen itu tidak mengutip `SCR-FND-SHF-001` untuk aturan mana pun, jadi restrukturisasi ini murni UX.

## 2026-08-27 — `molca-domain-agent` skill diterjemahkan ke Inggris, tambah pola "full" mengikuti FOUNDATION

- **Tipe:** ubah
- **Domain:** Product Owner
- **File terdampak:** `.claude/skills/molca-domain-agent/SKILL.md`, `DOCS/templates/domain-agent-template.md`
- **Perubahan:** Skill hanya mengenal layout flat `DOCS/` (pola PRODUCTION), padahal FOUNDATION
  sudah berkembang jadi pola lain: `DOCS-EN/` modul bernomor (konsep + §9 entitas) plus `FLOW/`
  dan `UX/` opsional. Skill dan template sekarang menawarkan dua pola eksplisit — **simple**
  (`DOCS/`, tetap default PRODUCTION-style) dan **full** (`DOCS-EN/` + `FLOW/`/`UX/` opsional,
  mengikuti FOUNDATION) — dipilih saat mengunci definisi domain (langkah 2), tidak boleh dicampur.
  `FLOW/`/`UX/` tetap tidak dibuat otomatis bersama `DOCS-EN/` pada domain baru. Sekaligus
  diterjemahkan penuh ke Inggris (sebelumnya Indonesia) dan diaudit lewat skill `unslop` — em dash
  narasi diganti titik/koma/titik dua, kecuali token baku `TBD — needs PO confirmation`.
- **Alasan:** domain baru (platform/tenant) diminta PO untuk memakai format FOUNDATION, dan skill
  yang membuatnya belum tahu format itu ada.
- **Dampak:** domain baru yang dibuat lewat skill ini ke depannya eksplisit memilih simple/full;
  tidak mengubah domain yang sudah ada (FOUNDATION, PRODUCTION tetap seperti sekarang).

## 2026-08-26 — Shift & Fiscal Year declaration digabung ke layar Site Hierarchy (bukan retitle modul)

- **Tipe:** keputusan UX (tier 3, layar) — bukan perubahan entitas/modul
- **Domain:** Product Owner, berdampak ke `foundation-domain`
- **File terdampak:** `DOMAINS/FOUNDATION/UX/01-site-hierarchy.md`, `02-shift.md`, `03-fiscal.md`, `00-ux.md`
- **Perubahan:** `SCR-FND-SHF-002` (deklarasi site shift) dan `SCR-FND-FSC-001` (deklarasi
  fiscal year) **dipensiunkan sebagai layar berdiri sendiri** — kedua form sekarang jadi
  panel di bagian bawah `SCR-FND-SIT-002` (Node detail & deactivate), tampil hanya saat
  node terpilih adalah `SITE`. ID layar dipertahankan (tidak pernah dipakai ulang), hanya
  diarahkan ulang ke panel barunya. `SCR-FND-SHF-001` (label enterprise shift),
  `SCR-FND-SHF-003` (monitor instance), `SCR-FND-SHF-004` (assignment kru) **tidak
  terdampak** — sifatnya beda (deklarasi sekali di level enterprise, atau pemantauan
  operasional per tanggal, bukan setup satu kali per site).
- **Yang TIDAK berubah:** `DOCS-EN/02-shift.md` dan `03-yearly-quarterly-declaration.md`
  tetap modul terpisah dengan entitasnya sendiri (`ENTERPRISE_SHIFT`/`SITE_SHIFT`,
  `FISCAL_YEAR`) — keputusan ini murni komposisi layar (tier UX), bukan penggabungan
  modul. `FISCAL_YEAR` tetap enterprise-level, bukan entitas milik `SITE` — panel di
  `SCR-FND-SIT-002` bersifat mostly-read untuk `FISCAL_YEAR`.
- **Alasan:** setup satu site (hierarchy + shift + fiscal) jadi satu tempat, bukan tiga
  layar terpisah yang harus dibuka bergantian saat provisioning site baru — permintaan PO.

---

## 2026-08-26 — Kontrak agent FOUNDATION ditautkan ulang ke seri `FLOW/` & `UX/`

- **Tipe:** pembaruan kontrak agent (tanpa perubahan entitas/perilaku produk)
- **Domain:** Product Owner (kontrak), berdampak ke `foundation-domain`
- **File terdampak:** `.claude/agents/foundation-domain.md`, `DOMAINS/FOUNDATION/AGENTS.md` §4 & §6
- **Perubahan:** Seri `FLOW/` (7 dokumen) dan `UX/` (10 dokumen) lahir di `main`, lalu ikut pindah ke
  `DOMAINS/FOUNDATION/` pada rebase (entri di atasnya), tetapi definisi agent `foundation-domain`
  tidak pernah merujuk keduanya — daftar "Baca sebelum bekerja" berhenti di `DOCS-EN/00-foundation.md`.
  Sekarang: deskripsi agent menyatakan kepemilikan seri alur perilaku dan deklarasi layar `SCR-*`;
  dua bacaan wajib baru (`FLOW/00-flow.md`, `UX/00-ux.md`) masuk definisi agent; aturan 6 mewajibkan
  dokumen baru di ketiga subfolder (`DOCS-EN/`, `FLOW/`, `UX/`) terdaftar di indeks §2 yang sesuai.
  Di kontrak domain, §6 menambahkan kedua seri ke bacaan wajib dan §4 mencatatnya sebagai artefak.
- **Sekalian:** klaim "organization" dihapus dari deskripsi agent — sejak 2026-08-24 Organization bukan
  modul FOUNDATION (peran/akses milik identity provider; lihat `AGENTS.md` §2).
- **Alasan:** agent yang membaca hanya definisinya akan melewatkan dua pohon dokumen yang justru
  mengikat keluarannya — layar wajib mengutip FLOW, dan entitas wajib mendukung alur yang ada.

---
## 2026-08-26 — Folder domain pindah ke `DOMAINS/`, tautan relatif dibetulkan

### FOUNDATION & PRODUCTION pindah dari root ke `DOMAINS/`

- **Tipe:** pemindahan folder + pembaruan kontrak agent
- **Domain:** Product Owner (kontrak lintas domain), berdampak ke `foundation-domain` & `production-domain`
- **File terdampak:** `AGENTS.md` §1 (peta repo + Layout domain) & §2/§3/§5, `CLAUDE.md`, `GEMINI.md`, `.claude/agents/foundation-domain.md`, `.claude/agents/production-domain.md`, `.claude/skills/molca-domain-agent/SKILL.md`, `DOCS/02-domains.md`, `DOCS/templates/domain-agent-template.md`, `DOCS/01-glossary.md`, `DOCS/04-metrics-framework.md`, `DOCS/06-isa95-iso22400-standards.md`, `DOCS/goalsQ3.md`, `DOCS/prd/PRD-001-*` (2 file), `DOCS/prd/PRD-002-*` (2 file), `DOCS/prd/PRD-003-foundation-domain-en.md`, seluruh `DOMAINS/FOUNDATION/**` (termasuk `DOCS-EN/`, `FLOW/`, `UX/`) & `DOMAINS/PRODUCTION/**`
- **Perubahan:** `FOUNDATION/` → `DOMAINS/FOUNDATION/` dan `PRODUCTION/` → `DOMAINS/PRODUCTION/`. Aturan **Layout domain** di `AGENTS.md` §1 dan `DOCS/02-domains.md` sekarang menyatakan folder domain tinggal di bawah `DOMAINS/`, bukan di root; skill `molca-domain-agent` dan `DOCS/templates/domain-agent-template.md` mengikuti supaya domain berikutnya dibuat di tempat yang benar. Tautan di badan template ditulis relatif dari `DOMAINS/<NAMA-DOMAIN>/AGENTS.md` — dua tingkat ke akar repo, satu tingkat ke domain tetangga.
- **Perbaikan tautan:** pemindahan lewat Obsidian meratakan target tautan markdown jadi nama file telanjang (mis. `](00-foundation.md)` dari `DOCS/prd/`), yang hanya resolve di dalam Obsidian. **1.001 tautan rusak** di 14 file dipulihkan ke jalur relatif yang benar; isi dokumen tidak diubah. File di `DOMAINS/**` dipulihkan dari git lalu kedalaman `../`-nya digeser satu tingkat, karena satu-satunya perbedaan terhadap versi commit adalah target tautan.
- **Rebase ke `main`:** dikerjakan di atas 15 commit `main` yang belum ada di branch ini (PR #10 & #11). `main` menambah dua subpohon baru **di lokasi lama** — `FOUNDATION/FLOW/` (7 file) dan `FOUNDATION/UX/` (10 file) — plus rename `07-kpi-formula.md` → `07-0-kpi-formula.md`. Keduanya ikut dipindahkan ke `DOMAINS/FOUNDATION/`, dan rename `07-0` diambil dari `main`. Konflik di 6 file diselesaikan dengan mengambil isi `main` lalu memasang ulang awalan `DOMAINS/`; bullet baru `main` soal lapisan `UX/`+`FLOW/` di `DOMAINS/FOUNDATION/AGENTS.md` dipertahankan.
- **Alasan:** permintaan pemilik repo — folder domain dikumpulkan di bawah satu induk supaya akar repo hanya memuat dokumen lintas domain dan pintu masuk per tool.
- **Tidak diubah:** entri riwayat `LOGS/CHANGELOG.md` dan `LOGS/handoff-2026-08-12-kpi-operating-time.md` — keduanya mencatat kondisi pada saat itu, termasuk jalur `FOUNDATION/DOCS/` yang sudah dihapus. Tiga tautan yang **memang** dirusak Obsidian di `CHANGELOG.md` (baris 3, 23, 937) dibetulkan; jalur historis lain dibiarkan. Contoh di skill pihak ketiga `grill-with-docs` dan placeholder di `domain-agent-template.md` (`<nama-agent>`, `DOCS/nama-file.md`) tetap sebagaimana adanya.

---

## 2026-08-26 — FLOW series split from 3 docs into 6; PRODUCTION-owned rows removed from FOUNDATION's daily-runtime implications

- **Type:** restructure (no new entity/behavior rules; content re-cut across files, cross-references updated)
- **Domain:** foundation-domain
- **Files affected:** `FOUNDATION/FLOW/00-flow.md` (rewritten); `01-provisioning.md` →
  split into `01-site-skeleton.md` + `02-production-readiness.md`; `02-daily-runtime.md` →
  split into `03-shift-generation.md` + `04-daily-runtime.md` + `05-kpi-computation.md`;
  `03-change-control.md` → renamed `06-change-control.md`; cross-references updated in
  `FOUNDATION/UX/00-ux.md`, `01-site-hierarchy.md`, `02-shift.md`, `04-asset.md`,
  `06-product.md`, `07-kpi.md`, `08-work-master.md`, `09-jrn-implementor-setup.md`,
  `FOUNDATION/AGENTS.md`, `FOUNDATION/DOCS-EN/README.md`.
- **Change:**
  1. Old FLOW-01 (provisioning) conflated site-skeleton setup (reference data, hierarchy,
     time) with production readiness (assets, product, KPI binding, work master) in one
     20-node diagram. Split at the dependency seam into FLOW-01/FLOW-02.
  2. Old FLOW-02 (daily runtime) bundled an unattended recurring job (shift-instance
     generation, owner `production-domain`, ⚠ H-6), the attended operator/PLC loop, and
     downstream KPI computation into one diagram, with KPI computation compressed to a
     single end box despite F-07.1 §9 now having a full entity spec. Split into
     FLOW-03/FLOW-04/FLOW-05.
  3. Old FLOW-02's design-implications table cited `US-PROD-SHF-003` and `P-02 §2`
     (PRODUCTION-owned artifacts) as FOUNDATION-derived implications — a domain-boundary
     leak per `FOUNDATION/AGENTS.md` §5.6. Those two rows are removed from the new
     FLOW-04; a note directs operator-channel UI derivation to a future PRODUCTION FLOW
     doc instead.
  4. FLOW-00 rewritten: series table now lists 6 flows with IEC-clause-to-flow mapping,
     the split rationale is recorded inline (not re-litigated per file), and a new open
     question is added (should work-order release get its own diagram, currently inside
     FLOW-02).
- **Reason:** requested audit found the 3-doc series too coarse for its own stated
  purpose (one diagram, one activity) and one real scope violation; splitting fixes both
  without adding any new product decision.
- **Unchanged:** all `SCR-*` IDs, entities, and cited rules — this is a re-cut of existing
  content, not new behavior.

## 2026-08-26 — Foundation activity flows added as FD-FLOW series under `FOUNDATION/FLOW/`

### `SCR-FND-SIT-001` redeclared as a diagram tree view

- **Type:** change interaction decision (tier 3; anchor ID, entities, stories unchanged)
- **Domain:** foundation-domain
- **Files affected:** `FOUNDATION/UX/01-site-hierarchy.md`
- **Change:** The site tree explorer is now declared as a **diagram tree** (boxes +
  connectors, expand/collapse) with a master-detail split: diagram = map, detail pane =
  the only editing surface. Guards declared with it: positions only (assets never on this
  tree — placement is `SCR-FND-AST-003`), deactivated nodes dashed under a toggle, ARIA
  treeview + list-mode toggle for accessibility, collapse-below-Area default with
  per-subtree focus. Open question UX-SIT-1 resolved by the collapse decision. Layout
  sketch added, explicitly marked interaction-not-visual-design.
- **Reason:** PO — the hierarchy is a bounded 5-level tree that reads spatially; a plain
  indented explorer undersells it.
- **Unchanged:** `SCR-FND-SIT-001` ID, entities, stories, FLOW constraints; `SCR-FND-SIT-002/003`
  untouched.

### Per-domain UX declarations added: `FOUNDATION/UX/` (00–09); design-domain NOT created

- **Type:** add document series + standard amendment (no entity/behavior changes)
- **Domain:** foundation-domain
- **Files affected:** new `FOUNDATION/UX/00-ux.md`, `01-site-hierarchy.md` …
  `08-work-master.md`, `09-jrn-implementor-setup.md` (10 files); `FOUNDATION/AGENTS.md`
  §2 + §3; `FOUNDATION/DOCS-EN/README.md` (drafts row); `DOCS/03-prd-standard.md` (new
  §3.5); `DOCS/templates/prd-template.md` (Expectation anchor note); `DOCS/01-glossary.md`
  (5 terms); `DOCS/02-domains.md` (foundation scope + design-domain planned-scope note);
  `FOUNDATION/FLOW/01–03` (implication anchors picked up)
- **Change:** Every modeled FOUNDATION module now has a screen inventory with permanent
  `SCR-FND-<MODUL>-<nnn>` IDs and the 7-state matrix, numbered exactly like `DOCS-EN/`
  (`F-01` ↔ `UX 01`). `00-ux.md` holds the shared standard: layer stack
  (entities → behavior → screens → journeys → stories), ID grammar, 7 states, checkable
  coverage rules D-1…D-4. `09-jrn-implementor-setup.md` declares the cross-module setup
  wizard that G2 measures, composing cited screens only. FLOW design-implication rows now
  cite the screens that picked them up (PROD anchors reserved, docs pending PO).
  `03-prd-standard` §3.5 makes "cite the anchor, never restate the screen" a PRD rule.
- **Reason:** PO — declared UX flows should live in each domain (not a separate design
  domain) so PRDs pick from declarations, like the rest of the docs; PRODUCTION's UX series
  deferred by PO the same day. A `design-domain` agent was scaffolded and then removed
  uncommitted when the PO pivoted; `design-domain` stays a *planned* domain, narrowed to
  visual design/design system.
- **Unchanged:** every entity spec, behavior rule, and diagram — UX docs cite them; the
  only FLOW edits are the "picked up by" columns.

### `flow/` renamed to `FLOW/`; stray `..md` removed

- **Type:** path-case fix (folder rename, no content change)
- **Domain:** foundation-domain (rename made by PO during review)
- **Files affected:** `FOUNDATION/flow/` → `FOUNDATION/FLOW/`; `FOUNDATION/AGENTS.md` §2
  and `FOUNDATION/DOCS-EN/README.md` links repointed; empty root file `..md` deleted
- **Change:** Folder casing now matches the repo's uppercase folder convention
  (`DOCS-EN`, `PRODUCTION`, `LOGS`). Index links re-anchored to `FLOW/`.
- **Reason:** PO renamed the folder during review; per §5.4 an index that points at the
  wrong path means the document does not exist, so indexes must follow immediately.
- **Unchanged:** file contents, numbering, diagrams. Changelog text in the entries below
  keeps the older `flow/` spelling as the record of when it was written.

### Design-implications tier added to FLOW-00…03

- **Type:** add section (no rule changes, no diagram changes)
- **Domain:** foundation-domain
- **Files affected:** `FOUNDATION/flow/00-flow.md`, `01-provisioning.md`,
  `02-daily-runtime.md`, `03-change-control.md`
- **Change:** 00 gains a three-tier convention separating behavioral truth from interaction
  decisions: constraint (normative, owned by flows) → implication (derived, owned by flows,
  non-normative) → decision (normative, owned by the future `UX-xx`/`SCR-xxx` interaction
  layer). FLOW-01/02/03 each gain a *Design implications* table deriving screen-level
  consequences strictly from already-decided rules, every row citing its source and left
  unpicked (`—`) until a UX document declares the screen that satisfies it.
- **Reason:** PO asked whether domain flows should also drive design. The F-07 split
  precedent says behavior and interaction must stay separately owned (they change for
  different reasons); implications give design a normative anchor without transferring
  ownership or restating screens.
- **Unchanged:** diagrams, entity specs, decisions, open questions.

### FLOW-01 provisioning order corrected to the F-00 reading order

- **Type:** fix diagram ordering (content correction, no entity changes)
- **Domain:** foundation-domain
- **Files affected:** `FOUNDATION/flow/01-provisioning.md`, `FOUNDATION/flow/00-flow.md`
  (series row)
- **Change:** A-1's phases now follow F-00's documented "Next step" reading order exactly —
  F-05 reference seed → F-01 site hierarchy → F-02/F-03 time declaration → F-04 assets &
  placement → F-06 product → F-07.1 KPI binding → F-08 work master — each phase labeled with
  its DOCS-EN module number. Previously time declaration sat at the bottom, after product
  and assets, contradicting F-00. The one edge the reading order cannot express
  (`ASSET_PRODUCT_CODES.product_id` FKs into `PRODUCT`, F-06 read after F-04) is drawn as an
  explicit deferred mapping step instead of being silently reordered.
- **Reason:** PO review — "why is time declaration at the bottom?" The diagram must follow
  the numbered modules' documented dependency order, not an ad-hoc sequence. Raw numeric
  order F-01→F-08 is not the fix either: F-00 itself explains F-05 must precede F-04/F-06.
- **Unchanged:** FLOW-02/FLOW-03 diagrams, every entity spec, all open-question IDs.

### `DOCS-EN/flow/activity-diagram.md` split into FLOW-00…03, moved to `FOUNDATION/flow/`

- **Type:** restructure (split 1 file into 4; diagram content unchanged)
- **Domain:** foundation-domain
- **Files affected:** new `FOUNDATION/flow/00-flow.md`, `01-provisioning.md`,
  `02-daily-runtime.md`, `03-change-control.md`; removed `FOUNDATION/DOCS-EN/flow/`;
  `FOUNDATION/AGENTS.md` §2 (series listed), `FOUNDATION/DOCS-EN/README.md` (drafts row
  repointed)
- **Change:** The flow folder now sits at the same level as `DOCS-EN/` and follows its
  numbering convention. FLOW-00 keeps the series index, notation, IEC 62264-3 §6.4–6.11
  mapping, traceability table, and open-question list; FLOW-01/02/03 each carry one diagram
  (provisioning, daily runtime, change control). Mermaid blocks re-validated in the browser
  after the split; relative links re-anchored to the new depth.
- **Reason:** PO — folder placement and numbering should match `DOCS-EN/` convention.
- **Unchanged:** diagram content, decisions, open questions.

### FD-FLOW `activity-diagram.md` created: A-1 provisioning, A-2 daily runtime, A-3 change control

- **Type:** add document (working draft, 🟡)
- **Domain:** foundation-domain
- **Files affected:** `FOUNDATION/DOCS-EN/flow/activity-diagram.md` (new folder `flow/` +
  new file), `FOUNDATION/DOCS-EN/README.md` (drafts table row)
- **Change:** Added a behavioral companion to F-00's structural map: three Mermaid activity
  diagrams covering (A-1) master-data provisioning, (A-2) the daily shift-instance runtime
  loop with operator vs PLC collection channels and the
  placement-resolved-at-event-timestamp rule, and (A-3) master-data change control with
  PRD-active routing, close-and-open effective dating, and no-hard-delete. Every node cites
  its source section; unresolved points carry their open-question IDs (H-6, T-1, W-4, K-7,
  OEE-8, status enum TBD). Activity phase names aligned to IEC 62264-3:2016 §6.4–6.11 using
  the local copy in `operational-intelligence/research/`.
- **Reason:** PO asked for an activity diagram of the FOUNDATION domain; behavior was spread
  across prose in nine module files and had never been drawn end to end.
- **Unchanged:** every module spec — the diagrams restate decided rules only; no entity,
  field, or status was introduced.

---

## 2026-08-24 — PRD-002 untuk KPI/Product/Reference Data; F-07 dipecah dari basis ISO 22400-2; KPI manufaktur keluar dari `04-metrics-framework.md`

### PRD-003: PRD berlingkup domain FOUNDATION, plus modul `FYR` yang belum pernah ada

- **Tipe:** dokumen baru (PRD berlingkup domain) + modul baru + penutupan story
- **Domain:** Product Owner, untuk `foundation-domain`
- **File terdampak:** `DOCS/prd/PRD-003-foundation-domain-en.md` (baru, 1.606 baris), `AGENTS.md` §2 dan §4
- **Perubahan:** PO meminta PRD berdiri sendiri untuk domain FOUNDATION. Isinya 13 modul dan 51 user story: 48 disalin dari PRD-001 v0.2, ditambah **modul baru `FYR` (Yearly & Quarterly Declaration)** dengan 3 story. F-03 sudah lama bertanda 🟢 ACTIVE dengan spesifikasi entitas `FISCAL_YEAR` lengkap, tapi `FISCAL_YEAR` muncul **nol kali** di PRD-001 maupun PRD-002 dan belum punya kode modul. Ketiga story-nya menutupi kedua mode `calendar_basis` (`monthly` dan `weekly_iso`), pola kuartal kondisional 4-5-4/4-4-5/5-4-4 yang wajib disembunyikan di mode monthly, aturan amandemen yang tidak boleh menulis ulang periode tertutup, dan kontrak resolusi tanggal ke tahun/kuartal yang dihitung saat baca. Kode modul `FYR` didaftarkan di `AGENTS.md` §4. Nomor pertanyaan dibuat identik dengan PRD-001 v0.2 supaya satu Q berarti sama di kedua berkas; ID risiko diberi awalan `F-` supaya tidak bentrok.
- **Alasan:** PO — `foundation-domain` butuh brief berlingkup domainnya sendiri. Biaya duplikasinya sudah disampaikan sebelum keputusan diambil dan diterima.
- **Tidak diubah:** PRD-001 v0.2 (tetap acuan lintas domain); 3 story `FYR` **belum di-back-port** ke sana, tercatat sebagai aksi 1 di §14 dan risiko F-R-01. Rumus F-07 tidak dinyatakan ulang; koreksi Availability hanya dirujuk ke v0.2 §13.1 supaya tidak ada dua versi cerita yang bisa berbeda.

### `US-FND-SHF-003` ditutup: konsep kalender kerja sudah dipensiunkan

- **Tipe:** penutupan story + koreksi
- **Domain:** Product Owner
- **File terdampak:** `DOCS/prd/PRD-003-foundation-domain-en.md` (`US-FND-SHF-002`, `US-FND-SHF-003`)
- **Perubahan:** `US-FND-SHF-003` ("Manage the working calendar & exception days") ditutup karena memodelkan `SHIFT_CALENDAR` dan `NON_WORKING_DAY`. [F-03](../DOMAINS/FOUNDATION/DOCS-EN/03-yearly-quarterly-declaration.md) mencatat PO **mempensiunkan konsep itu sepenuhnya**, karena daftar pengecualian tetap tidak cocok saat pola kerja berbeda per enterprise, tenant, dan site. Penggantinya **bukan** di FOUNDATION: tanggal produksi dimiliki `production-domain` lewat Work Schedule. `US-FND-SHF-002` diperbaiki di tempat, bukan ditutup, karena hanya ketergantungan kalendernya yang salah: sekarang `scheduled_minutes = duration_minutes − break_minutes` dan daftar tanggal produksi diambil dari `production-domain`, bukan dari `NON_WORKING_DAY`.
- **Alasan:** ditemukan saat memeriksa cakupan FOUNDATION. `NON_WORKING_DAY` dan `SHIFT_CALENDAR` dipakai 4 story di PRD sementara F-03 menyatakan keduanya pensiun, kelas kekeliruan yang sama dengan `US-FND-AST-004` dan `US-FND-WMS-001`.
- **Tidak diubah:** PRD-001 v0.2 masih memuat `US-FND-SHF-003` sebagai story hidup dan masih menyebut `NON_WORKING_DAY` di `US-PROD-OEE-004` serta `US-PROD-JOB-004`. Ini divergensi yang diketahui antara kedua dokumen, tercatat sebagai F-R-01 dan F-Q-02, dan perlu keputusan PO sebelum salah satu naik dari draft.

### PRD-001 jadi v0.2: acuan tunggal Design & Engineering, menyerap PRD-002

- **Tipe:** konsolidasi + koreksi rumus
- **Domain:** Product Owner (dengan koreksi pada story milik production-domain, atas persetujuan PO)
- **File terdampak:** `DOCS/prd/PRD-001-molcadx-core-q3-en.md` (jadi v0.2, 2.005 baris, 506KB), `DOCS/prd/PRD-001-molcadx-core-q3.md` + `DOCS/prd/PRD-002-*.md` (ditandai 🔴 USANG), `AGENTS.md` §2
- **Perubahan:** Atas permintaan PO, dua PRD digabung jadi satu acuan tunggal supaya designer dan developer tidak perlu tahu dokumen mana yang berlaku untuk modul mana. Nomor PRD-001 dipertahankan karena 49 dari 65 story sudah di sana dan `AGENTS.md`, `goalsQ3`, serta dokumen FOUNDATION sudah merujuknya. Bahasa Inggris jadi bahasa kerja, menutup Q-10 untuk dokumen ini. Isinya sekarang **15 modul, 65 user story**: 16 story PRD-002 masuk sebagai §6.10 Reference & Master Data, §6.11 Product, §6.12 KPI, dan tiga bagian PRODUCTION bergeser ke §6.13 sampai §6.15. Penomoran PRD-002 dinomori ulang supaya tidak bentrok: Q-01..Q-10 jadi Q-16..Q-25, R-01..R-10 jadi R-14..R-23, keputusannya masuk sebagai baris bertanggal di §12. Bagian §7.1, §7.2, §7.5, §7.6, dan §8 digabung isinya. §13 direstrukturisasi: §13.1 mencatat koreksi rumus, §13.2 mencatat story yang ditutup, konten ISO 24495-1 bergeser ke §13.3 dan §13.4.
- **Alasan:** PO — dua dokumen dengan rumus Availability yang berbeda lebih berbahaya daripada satu dokumen panjang, karena developer tidak punya penanda mana yang benar.
- **Tidak diubah:** rumus di F-07/F-07.1 (tetap pemilik rumus, dikutip bukan dinyatakan ulang); tidak ada field atau entitas baru yang ditambahkan ke FOUNDATION; PDF PRD-001 (tetap kedaluwarsa, tautannya dicabut dari `AGENTS.md` §2); contoh `US-PROD-OEE-003` di `AGENTS.md` §4 (masih memakai rumus lama, tercatat sebagai aksi 0d di §14).

### Koreksi rumus Availability dan 6 nama entitas mati di PRD-001

- **Tipe:** koreksi isi
- **Domain:** Product Owner + production-domain
- **File terdampak:** `DOCS/prd/PRD-001-molcadx-core-q3-en.md` (13 story)
- **Perubahan:** `Availability = waktu_operasi / waktu_terjadwal` diganti `APT / PBT` sesuai ISO 22400-2 Clause 6 Table 9, dengan POT, PBT, dan APT diturunkan eksplisit dan tiap variabel disebut sampai nama field. `US-PROD-SHF-004` sekarang menyatakan dua pengurangan yang berbeda: `planned` keluar dari POT jadi PBT, `unplanned` keluar dari PBT jadi APT, `small_stop` tidak keluar dari keduanya. **`US-FND-SHF-002` diperbaiki**: `scheduled_minutes = duration_minutes − break_minutes`, tidak lagi mengurangi planned downtime, karena kalau dikurangi di sana **dan** di Availability, planned downtime terpotong dua kali. `US-FND-SHF-003` ikut diperbaiki untuk maintenance sebagian hari. Nama entitas mati diganti di seluruh dokumen: `REASON_CODE` → `DOWNTIME_REASON` (16), `is_planned` → `downtime_category` (25), `standard_cycle_time` → `cycle_time_value` (25), `ITEM` → `PRODUCT` (10), `applies_to_asset_class_id` → `DOWNTIME_REASON_ASSET.asset_id` (7), `UOM.conversion_factor` → `PRODUCT_UOM_CONVERSION.conversion_value` (4). `US-FND-AST-004` ditutup dan digantikan, `US-FND-WMS-001` ditutup dan dipecah; dependensi `US-FND-WMS-002..005` diarahkan ke `US-FND-PRO-001`.
- **Alasan:** satu dokumen acuan tidak boleh berisi dua rumus Availability yang bertentangan, dan tidak boleh menyebut field yang tidak ada di FOUNDATION. Ditemukan saat menulis PRD-002 §6.3 dan diverifikasi ke teks PRD-001 baris 1011 dan story `US-PROD-SHF-004`.
- **Tidak diubah:** angka contoh sederhana tetap 90,0% karena kedua bentuk memberi hasil sama saat hanya ada istirahat. Selisihnya baru muncul saat ada planned downtime yang tidak ikut terpotong di `scheduled_minutes`, dan kasus itu dihitung penuh di §13.1 (90,0% versus 88,3%, dengan 60 menit maintenance hilang dari hitungan). Apakah planned downtime memang dicatat sebagai baris `ASSET_STATE_LOG` tetap terbuka sebagai Q-19.

### PRD-002 baru: 16 user story untuk 3 modul FOUNDATION yang belum punya story

- **Tipe:** dokumen baru (PRD)
- **Domain:** Product Owner
- **File terdampak:** `DOCS/prd/PRD-002-kpi-product-reference-data.md` (baru), `AGENTS.md` §2 dan §4, `DOCS/01-glossary.md` (istilah **Stall**)
- **Perubahan:** PRD-002 ditulis atas permintaan PO untuk menutup tiga modul FOUNDATION yang spec kerjanya sudah ada tapi belum pernah masuk PRD, yaitu Reference & Master Data (F-05), Product (F-06), dan KPI (F-07 + F-07.1). Isinya 16 user story dengan delapan bagian blok detail lengkap: 6 story `REF` (taksonomi `DOWNTIME_REASON` dan `REJECT_REASON`, penyaringan per instance aset lewat kedua join table, `UNIT_OF_MEASUREMENTS`, `TIME_CONVERSIONS`, aturan penonaktifan), 4 story `PRO` (`PRODUCT`, `PRODUCT_DETAIL`, `PRODUCT_UOM_CONVERSION`, `PRODUCT_CYCLE`), dan 6 story `KPI` (Availability dari POT ke PBT ke APT, Performance dengan segmentasi per SKU, Quality dengan urutan pengisian pasangan, OEE beserta waterfall dari PBT, MTTR/MTBF dari stop tak terencana tertutup, deteksi downtime dari counter yang stall). Tiga kode modul baru ditetapkan dan didaftarkan di `AGENTS.md` §4: `REF`, `PRO`, `KPI`. `PRO` dipilih untuk Product, bukan `PRD`, supaya ID story tidak bertabrakan dengan singkatan dokumen. Seluruh contoh berangka di §6 memakai satu shift yang sama (POT 480, terencana 60, tak terencana 42 dalam 3 stop, output 1.000 dengan 50 reject, dua SKU) sehingga angkanya bisa ditelusuri antar story, dan penutup waterfall `OEE × PBT` = 300,83 menit cocok dengan hasil batang ketiga.
- **Alasan:** PO — ketiga modul punya dokumen lengkap tapi nol user story, sehingga tidak ada yang bisa dikerjakan designer atau developer dari modul itu. F-06 dan F-07 bahkan tidak dirujuk sekali pun oleh PRD-001.
- **Tidak diubah:** rumus di F-07 dan F-07.1 (dikutip, tidak dinyatakan ulang); tidak ada field atau entitas baru yang ditambahkan ke FOUNDATION; PRD-001 dan `AGENTS.md` §4 contoh blok detail **tidak** disentuh walaupun rumus Availability-nya perlu dikoreksi (dicatat sebagai pekerjaan PO di PRD-002 §13.1); layar OEE tetap milik `production-domain`.

### PRD-002 versi Inggris jadi dokumen kerja Design & Engineering

- **Tipe:** dokumen baru (versi bahasa) + keputusan konvensi
- **Domain:** Product Owner
- **File terdampak:** `DOCS/prd/PRD-002-kpi-product-reference-data-en.md` (baru, 948 baris), `DOCS/prd/PRD-002-kpi-product-reference-data.md` (disinkronkan), `AGENTS.md` §2
- **Perubahan:** Versi Inggris PRD-002 ditulis atas permintaan PO sebagai dasar dokumen untuk designer dan developer. Isinya lengkap, bukan ringkasan: 16 blok detail dengan delapan bagian, §7 lintas story, §8 instrumentasi, §13 hubungan dengan PRD-001. Angka desimal memakai titik, bukan koma, supaya bisa dibaca langsung developer. Ditambah dua penunjuk arah baca di §Contents yang tidak ada di versi Indonesia: designer mulai dari §7.1 lalu baris Expectation tiap story, developer mulai dari §7.2 lalu baris Calculation, Data & entities, Rules & constraints, dan Acceptance criteria. **Berkas Inggris dinyatakan sebagai dokumen kerja** (D-11), dengan berkas Indonesia sebagai pendamping PO, mengikuti arah yang sudah diambil FOUNDATION saat `DOCS-EN/` jadi spec kerja. Versi Indonesia disinkronkan: penunjuk ke berkas EN di header, Q-10, D-11, dan R-10 ditambahkan supaya kedua berkas punya daftar pertanyaan, keputusan, dan risiko yang sama.
- **Alasan:** PO — designer dan developer membangun dari bahasa Inggris. Menaruh isi teknis §6 dan §7 hanya di berkas Indonesia berarti pembaca utamanya membaca terjemahan.
- **Tidak diubah:** rumus, contoh berangka, ID story, kode modul, dan seluruh isi teknis. Kedua berkas berisi 16 story yang sama dengan 9 baris bagian yang sama per story. `PRD-001-molcadx-core-q3-en.md` **tidak** disentuh, walaupun ia menyatakan versi Indonesia sebagai sumber kebenaran untuk dirinya sendiri. Konvensi berlawanan itu diajukan sebagai Q-10, bukan diselesaikan sendiri.

### Dua story PRD-001 ditutup dan digantikan

- **Tipe:** penutupan story (dokumen saja, belum ada kode)
- **Domain:** Product Owner
- **File terdampak:** `DOCS/prd/PRD-002-kpi-product-reference-data.md` §5.2 dan §13.2
- **Perubahan:** `US-FND-AST-004` (taksonomi reason code) ditutup, digantikan `US-FND-REF-001`, `US-FND-REF-002`, dan `US-FND-REF-003`. Story itu sudah bertanda `TBD` oleh penulisnya sendiri dan seluruh Expectation-nya ditulis atas dasar `REASON_CODE` tunggal dengan `category` tujuh nilai, `is_planned` boolean, dan pembatasan per `ASSET_CLASS` — ketiganya tidak ada lagi, dan entitasnya sudah pindah dari F-04 ke F-05. `US-FND-WMS-001` (item & satuan ukur) ditutup dan dipecah menjadi `US-FND-PRO-001`, `US-FND-REF-004`, dan `US-FND-PRO-003`, karena ia memakai entitas `ITEM` yang sudah bernama `PRODUCT` di F-06, dan rumusnya merujuk `UOM.conversion_factor` yang **tidak ada di satu pun file FOUNDATION**. Keduanya dicatat eksplisit sesuai `AGENTS.md` §4 aturan dependensi nomor 4, dan `US-FND-WMS-002` sampai `005` yang bergantung padanya perlu ditinjau ulang.
- **Alasan:** PO — story yang premisnya sudah tidak ada tidak boleh tetap berdiri di indeks seolah bisa dikerjakan.
- **Tidak diubah:** isi PRD-001 sendiri. Penutupan dicatat di PRD-002, bukan dengan mengedit PRD-001.

### Temuan: rumus Availability PRD-001 menyimpan PBT di dalam jam shift

- **Tipe:** temuan, belum ada perbaikan
- **Domain:** Product Owner (perlu keputusan)
- **File terdampak:** belum ada. Tercatat di `DOCS/prd/PRD-002-kpi-product-reference-data.md` §13.1
- **Perubahan:** Tidak ada file yang diubah. PRD-001 `US-PROD-OEE-003` memakai `Availability = waktu_operasi / waktu_terjadwal` dengan `waktu_terjadwal` ← `SHIFT_INSTANCE.scheduled_minutes`, dan `US-PROD-SHF-004` menyatakan durasi ber-`is_planned = true` tidak mengurangi `waktu_operasi` karena "sudah dipotong di `scheduled_minutes`". Bentuk itu menyimpan PBT di dalam jam shift, yang dilarang F-07.1 ("the shift fills **POT** only") dan `01-glossary` ("PBT bukan shift, tidak disimpan di `SHIFT_INSTANCE`"). Pada shift dengan istirahat saja kedua bentuk memberi angka yang sama, yaitu 90,0%. Selisih muncul saat ada downtime terencana yang tidak ikut terpotong di `scheduled_minutes`, misalnya maintenance 60 menit di tengah shift: PRD-001 memberi 90,0% (mengklaim 378 menit produksi), F-07 memberi 88,3% (APT 318 dari PBT 360), dan 60 menit maintenance itu hilang sepenuhnya dari hitungan sehingga segmen POT ke PBT pada waterfall tidak bisa digambar. Contoh blok detail `US-PROD-OEE-003` di `AGENTS.md` §4 memakai rumus yang sama, sehingga ia akan terus menyebarkan bentuk lama ke setiap PRD berikutnya. PRD-001 tidak menyebut POT, PBT, atau APT satu kali pun.
- **Alasan:** ditemukan saat menulis PRD-002 §6.3 dan diverifikasi ke teks PRD-001 baris 1011 dan story `US-PROD-SHF-004`, bukan dari ingatan.
- **Tidak diubah:** PRD-001, `AGENTS.md` §4 contoh, dan `SHIFT_INSTANCE`. Keputusannya milik PO, dan pertanyaan penentunya tercatat sebagai Q-04 di PRD-002 §11: apakah downtime terencana dicatat sebagai baris `ASSET_STATE_LOG` atau dipotong di `SHIFT_INSTANCE`.

### Temuan: `MEASUREMENT_GROUP` ada di changelog tapi tidak ada di F-05

- **Tipe:** temuan, divergensi changelog dan spec
- **Domain:** foundation-domain (perlu keputusan)
- **File terdampak:** belum ada. Tercatat sebagai Q-01 di `DOCS/prd/PRD-002-kpi-product-reference-data.md` §11
- **Perubahan:** Tidak ada file yang diubah. Entri changelog 2026-08-21 di bawah mencatat entitas `MEASUREMENT_GROUP`, field `UNIT_OF_MEASUREMENTS.measurement_group_id`, pitfall nomor 7, dan pertanyaan terbuka T-5 sebagai sudah masuk `FOUNDATION/DOCS-EN/05-reference-master-data.md` §9.4. Tidak satu pun dari keempatnya ada di file itu: field-nya hanya `uom_id`, `code`, `name`, `unit`, dan daftar pertanyaan terbukanya berhenti di T-4. Pencarian `MEASUREMENT_GROUP` di seluruh repo hanya menemukan dua kecocokan, keduanya di `LOGS/CHANGELOG.md`. PRD-002 karena itu **tidak** memakai entitas tersebut, dan `US-FND-REF-004` beserta `US-FND-PRO-003` ditulis dengan menyatakan terbuka bahwa kewajaran dimensi satuan (kg terhadap pcs) tidak bisa diperiksa sistem.
- **Alasan:** ditemukan saat mencari penjaga konversi satuan untuk `US-FND-PRO-003`. Menulis story terhadap entitas yang tidak ada di spec berarti mengarang field, yang dilarang `AGENTS.md` §4.
- **Tidak diubah:** F-05 dan entri changelog 2026-08-21. Salah satu dari keduanya perlu diperbaiki `foundation-domain`, dan PRD-002 tidak menebak yang mana.


---

## 2026-08-24 — F-07 rewritten from ISO 22400-2, catalog reference and phase roadmap added, post-rename link fixes

### F-07.1 §9 entity specification populated: KPI_FORMULA_SLOT, KPI_PARAMETERS, WORK_UNIT_KPI_BINDING, KPI_RESULT

- **Type:** add entity spec (was "None in v1")
- **Domain:** Product Owner + foundation-domain
- **Files affected:** `FOUNDATION/DOCS-EN/07-1-kpi-tag-mapping.md`
- **Change:** Replaced §9's "None in v1" with four entities, none of them the rejected
  `KPI_INDEX`/`KPI_FORMULA`. `KPI_FORMULA_SLOT` (§9.1) names the input positions the four
  formulas in F-07 need filled, seeded and closed like `tag_role`. A transform enum (§9.2)
  lists the twelve fixed ways a bound tag becomes a slot's value (`none` through
  `interval_mean`), restating logic already in this file's per-metric tables and the
  stalled-counter walkthrough, plus one new one, `reason_tag_drives_stop`, for a work unit
  whose primary asset has its own bank of per-fault registers instead of relying on a
  stalled counter. `KPI_PARAMETERS` (§9.3) is the seeded, never-implementor-writable menu
  of which tag-role-and-transform combinations are legal per slot — the same "first that
  works" priority tables above, as data. `WORK_UNIT_KPI_BINDING` (§9.4) is the mandatory
  per-work-unit pick, replacing automatic priority resolution outright, with a worked
  example (generic primary/checkweigher asset pair, no site-specific tag names).
  `KPI_RESULT` (§9.5) is the calc job's output record — every field traced back to a rule
  already stated elsewhere in this file (the no-data rule, the provisional-while-open
  rule, `reconcile_check`, the OEE waterfall, the sum-of-terms rollup rule), except
  `computed_at`/`is_stale`, explicitly handed to `production-domain` as freshness
  bookkeeping this file has no rule for. Updated the "does not redefine" table and header
  note to match.
- **Reason:** PO — the tag-to-formula wiring pattern was agreed in a design exploration
  and needed to become the actual spec F-07.1 says it doesn't have yet, rather than stay
  only in that exploration.
- **Unchanged:** the four ISO formulas themselves (F-07), K-1/K-4, every per-metric table
  and walkthrough already in this file — the new entities restate the same rules as data,
  they don't add a new one.

### K-7 added: write governance for WORK_UNIT_KPI_BINDING vs KPI_PARAMETERS

- **Type:** add open question
- **Domain:** Product Owner
- **Files affected:** `FOUNDATION/DOCS-EN/07-1-kpi-tag-mapping.md`
- **Change:** Added K-7 to "What's still unknown": `KPI_PARAMETERS` is already
  not implementor-writable (same K-1 boundary as `KPI_FORMULA`), but who's allowed to
  write a `WORK_UNIT_KPI_BINDING` row is still open — picking a declared tag for a work
  unit is a different act from defining which combinations are legal in the first place,
  and the two shouldn't be assumed to share one governance tier by default.
- **Reason:** PO — surfaced directly by writing the §9.3/§9.4 entity spec in the previous
  commit; the two tables carry different risk and the write boundary for the newer one
  was never decided.
- **Unchanged:** K-1's boundary on `KPI_PARAMETERS` itself, K-2/K-3/K-5/K-6.

### Phase roadmap table added: which KPI targets which phase

- **Type:** add section, no adoption decision
- **Domain:** Product Owner
- **Files affected:** `FOUNDATION/DOCS-EN/07-0-kpi-formula.md`
- **Change:** Added "Roadmap: which KPI targets which phase" — one flat table listing all
  35 KPIs already stated in the MOM domain catalog above (Production, Quality, Maintenance,
  Inventory operations management, plus Comprehensive energy consumption), each with its
  Domain, its Formula, and an empty `Phase` column. `Phase` is pre-filled `v1` only for the
  four already-adopted KPIs (Availability, Effectiveness/Performance, Quality ratio, OEE
  index) and `v1 (Molca's simplified stop-log version)` for MTBF/MTTR, since those are
  already settled facts per the scope table above. Every other row is `TBD`, left for
  Product to fill in row by row rather than pre-grouped into v2/v3 by guesswork. A closing
  note makes explicit that filling in `Phase` is planning, not adoption — moving a row live
  still requires modeling the missing Foundation element, giving it its own ✅ row in the
  scope table, and logging the change per K-4. "Next step" at the bottom now points here
  first.
- **Reason:** PO — wanted a single table covering every KPI with room to fill in phase
  later, not a pre-sorted v1/v2/v3 checklist.
- **Unchanged:** the scope table's actual ✅/⛔ marks, the four adopted formulas, K-1, K-4,
  and every KPI's formula as already stated in the MOM domain catalog — this table only
  reorganizes what's already there with a `Phase` column attached.

### Dead links to `07-kpi-formula.md` fixed after the rename to `07-0-kpi-formula.md`

- **Type:** link fix, no content change
- **Domain:** Product Owner
- **Files affected:** `AGENTS.md`, `FOUNDATION/AGENTS.md`, `FOUNDATION/DOCS-EN/README.md`,
  `FOUNDATION/DOCS-EN/00-foundation.md`, `02-shift.md`, `04-asset-ontology.md`,
  `05-reference-master-data.md`, `06-product.md`, `08-work-master.md`,
  `07-1-kpi-tag-mapping.md`, `DOCS/01-glossary.md`, `DOCS/04-metrics-framework.md`,
  `LOGS/CHANGELOG.md` (the three entries above this one only)
- **Change:** Commit `9ba6d1b` (2026-08-24) renamed `07-kpi-formula.md` to
  `07-0-kpi-formula.md` without fixing its cross-references. The eleven files above still
  linked to the old name, which no longer exists on the filesystem, including three indexes
  (`AGENTS.md` §3, `FOUNDATION/AGENTS.md` §2, `FOUNDATION/DOCS-EN/README.md`) that, per
  AGENTS.md's own §5.4 rule, means the module "is considered not to exist" while that link
  stays dead. Fixed by updating the filename in every link (anchors like `#section`
  preserved). Historical CHANGELOG entries already recorded before the rename were **left
  unchanged** — those are a record of conditions at the time they were written, not a link
  that must always stay valid.
- **Reason:** Found while checking commit readiness for the in-progress `07-0-kpi-formula.md`
  diff; fixed now so it doesn't ship with dead links.
- **Unchanged:** the technical content of every file above, and the CHANGELOG entries that
  already existed before this one.

### TEEP ditambahkan ke domain Production di katalog KPI F-07

- **Tipe:** tambahan kecil pada section referensi
- **Domain:** Product Owner
- **File terdampak:** `FOUNDATION/DOCS-EN/07-0-kpi-formula.md`
- **Perubahan:** Menambahkan baris TEEP (Total Effective Equipment Performance) ke tabel
  Production domain: `TEEP = OEE index × Utilization`, `Utilization = Planned busy time /
  Calendar time`. Diberi catatan eksplisit bahwa TEEP **bukan** salah satu dari 34 KPI
  Clause 6 ISO 22400-2 yang dicatalog canvas ini — di canvas TEEP hanya muncul sebagai
  bullet list ("oee, teep, utilization"), bukan card formal di grouping 33/34. Ditempatkan
  di Production karena dibangun murni dari elemen Production (OEE + Utilization), pola yang
  sama dengan TBF/TTR sebelumnya. Ditandai `⛔ not yet` — Molca v1 belum punya elemen
  "Calendar time" untuk membangun Utilization.
- **Alasan:** PO — TEEP adalah ekstensi OEE yang umum dipakai industri, diminta ditambahkan
  ke domain Production di katalog referensi ini.
- **Tidak diubah:** tabel scope adopsi, rumus OEE/Availability/Performance/Quality yang
  sudah diadopsi.

### TBF/TTR ditambahkan ke domain Production di katalog KPI F-07

- **Tipe:** tambahan kecil pada section referensi (koreksi dari entri log sebelumnya)
- **Domain:** Product Owner
- **File terdampak:** `FOUNDATION/DOCS-EN/07-0-kpi-formula.md`
- **Perubahan:** Menambahkan catatan + tabel di bawah tabel Production domain: TBF (time
  between failures, §5.1.4.1) dan TTR (time to repair, §5.1.4.2) adalah elemen Production,
  bukan hanya Maintenance — keduanya diukur dari interval downtime unplanned pada equipment
  produksi sendiri (`ASSET_STATE_LOG`), sementara MTBF/MTTR yang tampil di tabel Maintenance
  adalah agregasi di atas elemen itu. Ditautkan ke section [Reliability elements](07-0-kpi-formula.md#reliability-elements-iso-clause-514)
  yang sudah ada.
- **Alasan:** PO — sesuai diskusi sebelumnya, TBF/TTR bukan murni milik domain Maintenance;
  Production yang menghasilkan raw interval-nya.
- **Tidak diubah:** rumus MTBF/MTTR di tabel Maintenance, tabel scope adopsi, dan section
  Reliability elements yang sudah ada di atas.

### Katalog KPI ISO 22400-2 per domain MOM ditambahkan ke F-07 sebagai referensi

- **Tipe:** tambah section referensi (tidak mengubah scope adopsi)
- **Domain:** Product Owner
- **File terdampak:** `FOUNDATION/DOCS-EN/07-0-kpi-formula.md`
- **Perubahan:** Menambahkan section "ISO 22400-2 — full KPI catalog by MOM domain (reference)",
  diambil dari canvas kerja `operational-intelligence/iec-ios.tldraw` (diagram "ISO 22400-2 —
  KPIs by MOM Domain (33 of 34)"). Mengelompokkan 33 dari 34 KPI Clause 6 per domain aktivitas
  MOM IEC 62264 — Production (13 KPI), Quality (10 KPI), Maintenance (4 KPI), Inventory
  operations management (6 KPI) — plus satu KPI yang dikecualikan dari pengelompokan domain,
  Comprehensive energy consumption (Table 24), dicatat terpisah. Setiap KPI yang sudah
  ✅ diadopsi (Availability, Effectiveness/Performance, Quality ratio, OEE index) ditandai
  di tabel baru ini dan tetap merujuk ke definisi normatifnya di atas.
- **Alasan:** PO — tim sudah mengelompokkan 34 KPI ISO 22400-2 per domain MOM di tldraw;
  memasukkannya ke F-07 sebagai katalog referensi lengkap membuat scope table (K-4, subset
  yang diadopsi) bisa dibaca berdampingan dengan gambaran penuh standarnya per domain, tanpa
  perlu membuka canvas terpisah.
- **Tidak diubah:** tabel scope adopsi (§"Scope: which parts of ISO 22400-2 Molca adopts")
  dan keempat rumus KPI yang sudah diadopsi — section baru ini murni referensi, bukan
  keputusan widening scope baru.

### F-07 dipecah: base ISO 22400-2 vs mapping tag Molca

- **Tipe:** rewrite (pecah 1 file jadi 2, tidak ada penghapusan isi)
- **Domain:** Product Owner (F-07 baru) + foundation-domain (F-07.1)
- **File terdampak:** `FOUNDATION/DOCS-EN/07-kpi-formula.md` (ditulis ulang), `FOUNDATION/DOCS-EN/07-1-kpi-tag-mapping.md` (baru), `FOUNDATION/AGENTS.md`, `FOUNDATION/DOCS-EN/README.md`, `AGENTS.md` §2
- **Perubahan:** `07-kpi-formula.md` ditulis ulang dari nol oleh PO, isinya digrep langsung dari `ISO-22400-2-2014_searchable.pdf` (`operational-intelligence/research/`) — bukan diringkas dari memori atau draft sebelumnya: elemen waktu (POT/PBT/APT/PRI, Clause 5.1), elemen logistik/kualitas (PQ/GQ/SQ, Clause 5.5), elemen reliability (TBF/TTR, §5.1.4), dan keempat formula KPI (Availability, Effectiveness/"Performance", Quality ratio, OEE index, Clause 6 Table 7/9/10/11) dikutip lengkap dengan nomor klausa. Ditambah tabel scope eksplisit: dari 29 elemen waktu + 16 elemen logistik/kualitas + 34 KPI di standar, v1 Molca hanya mengadopsi subset Production OEE family (menjawab K-4). Seluruh arsitektur Molca yang lama (model `tag_role`, primary/secondary asset, deteksi downtime dari counter yang stall, segmentasi multi-SKU, derivasi reject dua-stasiun, tabel reverse tag→metrik, K-2/K-3/K-5/K-6) dipindah **tanpa diubah** ke file baru `07-1-kpi-tag-mapping.md` (modul F-07.1), yang sekarang mengasumsikan formula F-07 sebagai given dan hanya menjawab "tag/entitas mana mengisi elemen mana." F-07 dan F-07.1 didaftarkan di `FOUNDATION/AGENTS.md`, `FOUNDATION/DOCS-EN/README.md`, dan `AGENTS.md` §2.
- **Alasan:** PO — F-07 lama mencampur "apa formulanya" dengan "bagaimana Foundation mengisinya," dan rumus ISO-nya dinyatakan ulang dari memori, bukan dikutip dari standar. PO ingin F-07 jadi base yang bisa diverifikasi langsung ke PDF, dengan mapping Molca-spesifik dipisah supaya keduanya bisa berubah independen (mis. widening scope ISO tidak perlu menyentuh tag mapping, dan sebaliknya).
- **Tidak diubah:** rumus Availability/Performance/Quality/OEE itu sendiri (identik dengan draft lama, sekarang terverifikasi ke ISO); seluruh keputusan K-1 dan K-4 (sudah resolved sebelumnya, sekarang dikutip ulang dengan sumber klausa); tidak ada entity spec baru (§9 tetap kosong di kedua file).

### KPI manufaktur tidak direstate di `04-metrics-framework.md`

- **Tipe:** koreksi keputusan di atas, sebelum di-commit
- **Domain:** Product Owner
- **File terdampak:** `DOCS/04-metrics-framework.md` §5, `FOUNDATION/DOCS-EN/07-kpi-formula.md`, `FOUNDATION/DOCS-EN/07-1-kpi-tag-mapping.md`
- **Perubahan:** Rencana awal menaruh tabel restatement rumus Availability/Performance/Quality/OEE/MTBF/MTTR di `04-metrics-framework.md` §5 dibatalkan. `04-metrics-framework.md` adalah dokumen metrik produk/behavior per domain (§1–4, §6–7 tidak berubah); KPI manufaktur bukan isinya. §5 sekarang hanya satu paragraf yang menunjuk ke F-07 (rumus) dan F-07.1 (pengisian per work unit), tanpa rumus apa pun dinyatakan ulang. Referensi balik di F-07 dan F-07.1 yang tadinya menyebut `04-metrics-framework.md` §5 sebagai pemilik "cross-product restatement" diperbaiki — F-07 sekarang satu-satunya rumah rumus, F-07.1 tidak lagi menyebut metrics-framework sebagai pemilik arithmetic.
- **Alasan:** PO — menaruh tabel restatement ISO di `04-metrics-framework.md` salah; itu menduplikasi F-07 dan mencampur metrik manufaktur ke dokumen yang seharusnya soal metrik produk/behavior per domain.
- **Tidak diubah:** rumus itu sendiri (tetap di F-07, tidak berubah nilainya), struktur `04-metrics-framework.md` §1–4 dan §6–7, pemisahan F-07/F-07.1.

---

## 2026-08-21 — `MEASUREMENT_GROUP` entitas baru, bukan enum di `UNIT_OF_MEASUREMENTS`

- **Tipe:** tambah entitas (revisi dari rencana field enum)
- **Domain:** foundation-domain (F-05 §9.4, referensi dari F-04 §9.7)
- **File terdampak:** `FOUNDATION/DOCS-EN/05-reference-master-data.md`, `04-asset-ontology.md`
- **Perubahan:** Rencana awal (field enum `quantity_type`/`measurement_type` langsung di `UNIT_OF_MEASUREMENTS`) diganti jadi entitas baru `MEASUREMENT_GROUP` (§9.4), bentuknya sama seperti `ASSET_CLASS` di Equipment Taxonomy, taksonomi murni, tidak punya nilai atribut sendiri. `UNIT_OF_MEASUREMENTS.measurement_group_id` jadi FK ke sana, bukan kolom enum. Field ini yang membedakan "beda skala, dimensi sama" (`kg` vs `g`, `pcs` vs `box`, konversi generik sah) dari "dimensi beda sama sekali" (`kg` vs `pcs`, hanya sah lewat `PRODUCT_UOM_CONVERSION` yang di-scope per produk). Seed rows yang diusulkan: `count`, `mass`, `volume`, `length`, `other`, masih `TBD` terhadap katalog UOM Molca yang sebenarnya (T-5). Ditambah pitfall #7: menambah `UNIT_OF_MEASUREMENTS` row itu maintenance biasa, menambah `MEASUREMENT_GROUP` row itu governed, sebobot menambah `tag_role` baru.
- **Alasan:** PO — enum yang di-hardcode di kolom tidak bisa di-effective-date dan tidak lewat proses review master data seperti `DOWNTIME_REASON`/`REJECT_REASON`. Entitas sendiri konsisten dengan bentuk yang sudah ada di modul ini.
- **Tidak diubah:** `T-3` (soal apakah `UNIT_OF_MEASUREMENTS` ini tabel yang sama dengan yang diasumsikan Work Master/Configuration Service) tetap terbuka, tidak diselesaikan oleh perubahan ini.

---

## 2026-08-20 — KPI formula & reorganisasi modul FOUNDATION

### Unslop `04-asset-ontology.md`

- **Tipe:** editorial (tidak ada perubahan isi/aturan)
- **Domain:** foundation-domain
- **File terdampak:** `FOUNDATION/DOCS-EN/04-asset-ontology.md`
- **Perubahan:** Hapus em dash dari seluruh prosa (paragraf, bullet, sel tabel) dan ganti dengan titik/koma/titik dua sesuai konteks. Em dash dibiarkan hanya di tiga tempat yang memang konvensi seluruh dokumen FOUNDATION: judul H1 (`# F-04 — ...`), judul entitas §9.x (`### 9.2 \`ASSET_CLASS\` — ...`), dan placeholder kolom Owner yang sudah "resolved" (`| — |`). Beberapa filler kecil dirapikan ("named as *the* #1 cause" jadi "*the* number one cause", "This exists specifically because" jadi "This exists because").
- **Alasan:** PO — `/unslop` diminta untuk dokumen ini; em dash berulang adalah ciri tulisan AI yang paling menonjol di file ini.
- **Tidak diubah:** semua aturan, field, dan keputusan teknis, hanya redaksi.

### `ASSET_PLACEMENT` boleh punya primary + secondary; downtime dari counter yang stall

- **Tipe:** perubahan model (breaking) + tambah mekanisme
- **Domain:** foundation-domain (F-04 §9.6, F-01 §9.6, F-07)
- **File terdampak:** `FOUNDATION/DOCS-EN/04-asset-ontology.md`, `01-site-hierarchy.md`, `07-kpi-formula.md`
- **Perubahan:** Aturan lama "satu WORK_UNIT = maksimal satu ASSET aktif" diganti jadi asimetris: `ASSET_PLACEMENT.placement_role` (`primary`/`secondary`). Maksimal satu `primary` aktif per WORK_UNIT (aturan lama, cuma diberi nama) — asset ini yang menentukan Availability dan jadi acuan deteksi downtime. Boleh ada berapa pun `secondary` aktif sekaligus — equipment pendamping permanen (mis. checkweigher inline pada satu packer) yang tidak punya Availability sendiri, hanya menyumbang tag ke Quality dan/atau pengayaan reason downtime. Dicatat sebagai A-9 di `04-asset-ontology.md` §9.8. Ditambah section baru di F-07: "Multiple assets under one work unit — primary vs secondary" (kapan pakai secondary vs WORK_UNIT+WORK_UNIT_FLOW terpisah) dan "How downtime gets detected from a stalled counter" (mekanisme nyata dari mapping PLC line Vertical Packer: downtime dideteksi dari counter `total` milik asset primary yang berhenti naik, bukan dari boolean state langsung; durasi stall dibagi bucket small_stop vs downtime nyata; reason dicari dengan mencocokkan tag kandidat — dari primary atau secondary — yang aktif di jendela waktu yang sama). K-6 dicatat: threshold durasi stall (contoh nyata ~5 menit) belum jelas rumahnya (global default vs per WORK_UNIT/WORK_UNIT_CLASS).
- **Alasan:** PO — mapping tag PLC nyata (line Vertical Packer) menunjukkan satu WORK_UNIT memang berisi dua equipment (packer + checkweigher dedicated), dan checkweigher itu tidak punya downtime sendiri. Aturan lama tidak bisa mengakomodasi ini tanpa dipecah jadi dua WORK_UNIT yang sebenarnya tidak representatif (checkweigher tidak butuh Availability sendiri).
- **Tidak diubah:** rumus Availability/Performance/Quality/OEE itu sendiri; aturan "satu primary per WORK_UNIT" (rename, bukan penghapusan); kasus two-station (WORK_UNIT_FLOW) untuk equipment yang memang butuh Availability sendiri tetap pakai WORK_UNIT terpisah, bukan secondary.

### Walkthrough end-to-end: bagaimana KPI satu work unit resolve dari tag

- **Tipe:** tambah
- **Domain:** foundation-domain (F-07)
- **File terdampak:** `FOUNDATION/DOCS-EN/07-kpi-formula.md`
- **Perubahan:** Section baru "How one work unit's KPI resolves from tags, end to end" setelah "Where tags live" — merangkai urutan nyata: Step 0 resolve asset aktif via `ASSET_PLACEMENT` pada timestamp event (bukan asset sekarang), lalu per metrik (Availability dari state log, Performance dari `product_code` + output + segmentasi multi-SKU, Quality same-asset atau fallback cross-asset via `WORK_UNIT_FLOW`), lalu OEE. Ini menyatukan aturan yang sebelumnya tersebar sebagai satu alur yang bisa diikuti, bukan tabel per-metrik yang berdiri sendiri.
- **Alasan:** PO — butuh satu penjelasan yang menyambungkan `ASSET_PLACEMENT`, `WORK_UNIT_FLOW`, dan tabel per-metrik yang sudah ada, supaya urutan kalkulasi nyata (bukan cuma daftar input) jelas untuk satu work unit.
- **Tidak diubah:** rumus dan tabel per-metrik yang sudah ada (Availability/Performance/Quality/OEE) — section baru ini hanya merujuk, tidak mendefinisikan ulang.

### F-09–F-12 (Workflow Engine, Notification, Integration, Configuration Service) jadi CONCEPT

- **Tipe:** perubahan status
- **Domain:** foundation-domain
- **File terdampak:** `FOUNDATION/AGENTS.md`, `FOUNDATION/DOCS-EN/README.md`
- **Perubahan:** Status F-09–F-12 diubah dari 🟡 DRAFT (hasil penomoran ulang sebelumnya) menjadi 🟠 CONCEPT di kedua tabel indeks, sesuai isi filenya sendiri yang sudah menyatakan "Concept only — no entities modeled yet".
- **Alasan:** PO — status DRAFT sebelumnya tidak mencerminkan bahwa keempat modul ini masih tahap konsep, belum ada entitas yang dimodelkan.
- **Tidak diubah:** isi keempat dokumen.

### F-01–F-03 (Site Hierarchy, Shift, Yearly & Quarterly Declaration) jadi ACTIVE

- **Tipe:** perubahan status
- **Domain:** foundation-domain
- **File terdampak:** `FOUNDATION/AGENTS.md`, `FOUNDATION/DOCS-EN/README.md`, `FOUNDATION/DOCS-EN/01-site-hierarchy.md`, `02-shift.md`, `03-yearly-quarterly-declaration.md`
- **Perubahan:** Status F-01 (🟡 DRAFT → 🟢 ACTIVE), F-02 (🟠 REDESIGNED → 🟢 ACTIVE), F-03 (🟠 SPLIT FROM CALENDAR → 🟢 ACTIVE) di kedua tabel indeks dan di baris status masing-masing file.
- **Alasan:** PO — ketiga modul dinilai siap diimplementasikan.
- **Tidak diubah:** isi ketiga dokumen (tidak ada perubahan model/entitas, hanya status).

### Work Master naik ke F-08, empat modul platform digeser dan ditandai DRAFT

- **Tipe:** penomoran ulang + perubahan status
- **Domain:** foundation-domain
- **File terdampak:** rename `FOUNDATION/DOCS-EN/12-work-master.md` → `08-work-master.md`, `08-workflow-engine.md` → `09-workflow-engine.md`, `09-notification.md` → `10-notification.md`, `10-integration.md` → `11-integration.md`, `11-configuration-service.md` → `12-configuration-service.md`; header `# F-XX` tiap file disesuaikan; seluruh cross-reference path & label `F-08`–`F-12` diperbaiki di `FOUNDATION/AGENTS.md`, `FOUNDATION/DOCS-EN/README.md`, `FOUNDATION/DOCS-EN/00-foundation.md`, `04-asset-ontology.md`, `05-reference-master-data.md`, `06-product.md`, `07-kpi-formula.md`, `tag-declaration-draft.md`, `PRODUCTION/DOCS/*.md`, `AGENTS.md` (root), `DOCS/goalsQ3.md`, `DOCS/prd/PRD-001-molcadx-core-q3(-en).md`
- **Perubahan:** Work Master pindah dari slot F-12 ke F-08 (langsung setelah KPI inputs F-07). Workflow Engine, Notification, Integration, Configuration Service bergeser satu slot masing-masing (F-08→F-09, F-09→F-10, F-10→F-11, F-11→F-12), urutannya tetap sama. Keempat modul itu statusnya diubah jadi 🟡 DRAFT (sebelumnya 🟠 CONCEPT) di tabel indeks `FOUNDATION/AGENTS.md` dan `FOUNDATION/DOCS-EN/README.md`. `00-foundation.md` §"Next step" dan catatan "Known inconsistency" diperbarui: reading-order gap (cycle-time source Work Master dibaca setelah formula KPI yang bergantung padanya) sekarang **resolved** karena Work Master dibaca tepat setelah KPI & Reference Data.
- **Alasan:** PO — Work Master lebih matang/load-bearing dibanding empat modul platform yang masih konsep, jadi urutannya dinaikkan; empat modul itu ditandai draft karena belum divalidasi.
- **Tidak diubah:** `DOCS/goalsQ3.md` dan `DOCS/prd/PRD-001-molcadx-core-q3(-en).md` — kedua dokumen ini memakai penomoran F-XX lokal sendiri (urutan baris tabelnya sendiri), sudah berbeda dari nomor asli FOUNDATION sebelum sesi ini; hanya path filenya yang diperbaiki, label `F-XX` di kedua dokumen itu dibiarkan seperti semula (bukan cakupan sesi ini). Entri changelog lama & `LOGS/handoff-2026-08-12-kpi-operating-time.md` yang masih menyebut nomor lama tidak disentuh (riwayat).

### Performance harus dijumlah per segmen SKU, bukan satu cycle time

- **Tipe:** perbaikan rumus
- **Domain:** foundation-domain (F-07), Product Owner (metrics framework)
- **File terdampak:** `FOUNDATION/DOCS-EN/07-kpi-formula.md`, `DOCS/04-metrics-framework.md`
- **Perubahan:** `Performance = (cycle_time_ideal × total_output) / waktu_operasi` hanya benar kalau satu SKU jalan sepanjang periode. Ditambah aturan segmentasi: `Performance = Σᵢ (standard_i × output_i) / APT`, batas segmen dari `WORK_ORDER_OPERATION` (ada job) atau transisi tag `product_code` (PLC saja, perlu debounce `TBD`). Segmen tanpa `OPERATION` yang cocok dikecualikan dan ditandai partial, bukan diblend ke rata-rata. Waterfall OEE step Performance disesuaikan.
- **Alasan:** PO — satu lini bisa menjalankan lebih dari satu SKU dalam satu shift; rumus lama diam-diam mengasumsikan satu SKU dan akan salah kalau dipakai langsung.
- **Tidak diubah:** Availability dan Quality (tidak bergantung pada cycle time/SKU).
- **Terbuka:** K-5 — apakah waktu changeover antar-SKU masuk bucket loss Performance sendiri atau `planned` `DOWNTIME_REASON` (Operations + PO).

---

## 2026-08-19 — FK/schema equipment → asset

- **Tipe:** rename skema
- **Domain:** foundation-domain
- **File terdampak:** `FOUNDATION/DOCS-EN/00-foundation.md`, `04-asset-ontology.md`, `05-reference-master-data.md`, `06-product.md`, `07-kpi-formula.md`, `10-integration.md`, `12-work-master.md`, `tag-declaration-draft.md`, `README.md`
- **Perubahan:** Instance fisik adalah `ASSET`, bukan equipment. `equipment_id` → `asset_id`. Join `DOWNTIME_REASON_EQUIPMENT`/`REJECT_REASON_EQUIPMENT` → `DOWNTIME_REASON_ASSET`/`REJECT_REASON_ASSET`. `EQUIPMENT_TAGS`/`EQUIPMENT_PRODUCT_CODES` → `ASSET_TAGS`/`ASSET_PRODUCT_CODES`. Denormalisasi `equipment_code` → `asset_tag`. Prose "equipment instance" / per-equipment scoping mengikuti.
- **Alasan:** PO — deklarasi memakai `ASSET`/`asset_id`, bukan `equipment_id`.
- **Tidak diubah:** PRD (`DOCS/prd/`); nama modul Equipment Taxonomy; lapis ISO 14224 **Equipment unit** / enum `equipment_unit`; OEE (*Overall Equipment Effectiveness*); hierarki ISA-95 "equipment hierarchy" di glossary/standar; entri changelog lama; pohon `FOUNDATION/DOCS/` Indonesia (bukan spec kerja).

---

## 2026-08-19 — Salvage BOM/WO dari Work Master Indonesia, lalu hapus `FOUNDATION/DOCS/`

- **Tipe:** pindah isi + penghapusan
- **Domain:** foundation-domain
- **File terdampak:** `FOUNDATION/DOCS-EN/12-work-master.md`, seluruh `FOUNDATION/DOCS/*.md` (12 file), `FOUNDATION/AGENTS.md`, `FOUNDATION/DOCS-EN/README.md`, `CLAUDE.md`, `GEMINI.md`, `DOCS/02-domains.md`
- **Perubahan:** Field table `BOM`/`BOM_LINE`/`WORK_ORDER`/`WORK_ORDER_OPERATION`/`QUALITY_DEFECT_CODE` dipindah ke F-12 EN (`ITEM` → `PRODUCT`, UOM → F-05). Pohon Indonesia lalu dihapus. **Tidak** dipindah: Organization (SSO), Calendar lama, Shift model lama, katalog `KPI_FORMULA`, konsep yang sudah ada di EN.
- **Alasan:** PO — jangan buang semua; simpan yang masih berguna di spec Inggris, jangan biarkan dua pohon.
- **Tidak diubah:** entri changelog lama yang masih menyebut path Indonesia.

---

## 2026-08-19 — `FOUNDATION/AGENTS.md` ke Bahasa Inggris

- **Tipe:** terjemahan
- **Domain:** foundation-domain
- **File terdampak:** `FOUNDATION/AGENTS.md`
- **Perubahan:** Kontrak domain (misi, indeks, cakupan, artefak, antarmuka, aturan) ditulis ulang dalam bahasa Inggris. Isi dan tautan ke `DOCS-EN/` tidak berubah. Scope "Does" tidak lagi menyebut organization/calendar sebagai pekerjaan modul (sudah SSO / Production), selaras dengan indeks §2.
- **Alasan:** PO — file agent di folder FOUNDATION memakai bahasa Inggris, sama dengan spec kerja.
- **Tidak diubah:** `.claude/agents/foundation-domain.md` (masih Indonesia).

---

## 2026-08-19 — Pintu masuk Claude Code (`CLAUDE.md`) dan Antigravity (`GEMINI.md`)

- **Tipe:** indeks
- **Domain:** Product Owner
- **File terdampak:** `CLAUDE.md`, `GEMINI.md`, `AGENTS.md`
- **Perubahan:** Claude Code tidak memuat `AGENTS.md` di root; Antigravity memuat `GEMINI.md`. Kedua file hanya menunjuk ke `AGENTS.md` (kontrak tidak diduplikasi). Skill Claude: `.claude/skills/`. Skill Antigravity: `.agents/skills/`.
- **Alasan:** PO — agent di Claude dan Antigravity harus kena kontrak yang sama dengan Cursor.
- **Tidak diubah:** isi `AGENTS.md` §4–§6.

---

## 2026-08-19 — FOUNDATION: tautan kerja ke `DOCS-EN`, bukan `DOCS/` Indonesia

- **Tipe:** tautan / indeks
- **Domain:** product-owner (lintas) + foundation-domain (indeks)
- **File terdampak:** `AGENTS.md`, `FOUNDATION/AGENTS.md`, `FOUNDATION/DOCS-EN/*`, `DOCS/02-domains.md`, `DOCS/01-glossary.md`, `DOCS/goalsQ3.md`, `DOCS/06-isa95-iso22400-standards.md`, `DOCS/prd/PRD-001-*`, `DOCS/templates/*`, `PRODUCTION/**`, `.claude/agents/foundation-domain.md`, `.claude/agents/production-domain.md`
- **Perubahan:** Spec kerja FOUNDATION adalah `FOUNDATION/DOCS-EN/`. Tautan kerja (indeks, PRD, PRODUCTION, glossary, agent) tidak lagi menunjuk `FOUNDATION/DOCS/`. Reason downtime/reject dari PRD/PRODUCTION mengarah ke F-05, bukan §9.4 Equipment Taxonomy. Folder Indonesia tidak dihapus.
- **Alasan:** PO — jangan pakai pohon Indonesia untuk linking.
- **Tidak diubah:** isi historis `LOGS/CHANGELOG.md`; file di `FOUNDATION/DOCS/` (frozen).

---

## 2026-08-19 — Skill `grill-with-docs` di repo

- **Tipe:** skill lokal
- **Domain:** Product Owner
- **File terdampak:** `.cursor/skills/grill-with-docs/`, `.claude/skills/grill-with-docs/`, `.agents/skills/grill-with-docs/`, `AGENTS.md`
- **Perubahan:** Salin skill `grill-with-docs` (plus `CONTEXT-FORMAT.md`, `ADR-FORMAT.md`) ke tiga path workspace. Isi sama dengan skill global.
- **Alasan:** Sesi grill vs dokumen harus tersedia di Cursor, Claude, dan Antigravity tanpa skill di home.
- **Tidak diubah:** skill global di `~/.agents/skills/grill-with-docs`.

---

## 2026-08-19 — F-07 + glossary: MTTR/MTBF dari unplanned downtime

- **Tipe:** keputusan
- **Domain:** foundation-domain
- **File terdampak:** `FOUNDATION/DOCS-EN/07-kpi-formula.md`, `DOCS/01-glossary.md`
- **Perubahan:** **MTTR** = rata-rata durasi stop unplanned sampai runtime lagi. **MTBF** = rata-rata waktu dari akhir satu unplanned ke awal unplanned berikutnya. Sumber sama dengan APT (bukan planned, bukan `small_stop`). Tanpa tag baru. `n=0` → no data; `n=1` → MTBF cannot compute.
- **Alasan:** PO — report OEE menampilkan MTTR/MTBF; artinya durasi unplanned dan jarak antar unplanned.

---

## 2026-08-19 — F-07: jelaskan unplanned downtime vs APT

- **Tipe:** kejelasan
- **Domain:** foundation-domain
- **File terdampak:** `FOUNDATION/DOCS-EN/07-kpi-formula.md`
- **Perubahan:** Hapus frasa “Unplanned DT (leaves APT)”. Ditulis: planned DT dipotong dari **POT** → **PBT**; unplanned DT dipotong dari **PBT** → **APT**. Contoh 420 / 42 / 378.
- **Alasan:** PO tidak paham label lama.

---

## 2026-08-19 — F-07: label jam shift hanya **POT**

- **Tipe:** perjelas nama
- **Domain:** foundation-domain
- **File terdampak:** `FOUNDATION/DOCS-EN/07-kpi-formula.md`, `FOUNDATION/DOCS-EN/02-shift.md`
- **Perubahan:** Baris Availability/waterfall memakai nama **POT** saja, tanpa “(not PBT)”. PBT tetap baris/definisi terpisah (`POT − planned downtime`).
- **Alasan:** PO — deklarasikan sebagai POT, jangan menempel penolakan PBT di label.

---

## 2026-08-19 — Glossary: elemen ISO 22400-2 (POT, PBT, APT, …)

- **Tipe:** istilah
- **Domain:** product-owner (glossary lintas domain)
- **File terdampak:** `DOCS/01-glossary.md`
- **Perubahan:** Tambah kode ISO yang dipakai F-07 dan **bukan** singkatan umum: **POT**, **PBT**, **APT**, **ADOT**, **AUST**, **PQ**, **GQ**, **SQ**. PBT didefinisikan `POT − planned downtime`, bukan jam shift. OEE / Availability / Quality ratio / MOM sudah ada — tidak diulang.
- **Alasan:** PO — cek abbreviation lalu masuk glossary kalau bukan singkatan umum.

---

## 2026-08-19 — PBT bukan shift: patuh ISO 22400-2 (`PBT = POT − planned downtime`)

- **Tipe:** koreksi istilah
- **Domain:** foundation-domain
- **File terdampak:** `FOUNDATION/DOCS-EN/07-kpi-formula.md`, `FOUNDATION/DOCS-EN/02-shift.md`
- **Perubahan:** Dilarang menulis **PBT = shift**. Jam `SHIFT_INSTANCE` hanya mengisi **POT**. **PBT** tetap definisi ISO: `POT − planned downtime`. Availability = `APT / PBT`. Waterfall OEE mulai di PBT; batang POT→PBT terpisah. H-7 Shift diperbaiki.
- **Alasan:** PO — menyamakan PBT dengan shift tidak comply ISO 22400-2.

---

## 2026-08-19 — Skill `unslop` untuk Antigravity

- **Tipe:** skill lokal
- **Domain:** Product Owner
- **File terdampak:** `.agents/skills/unslop/SKILL.md`, `AGENTS.md`
- **Perubahan:** Salin `unslop` ke `.agents/skills/` (path workspace Antigravity). Bukan `~/.gemini/config/skills/` atau `~/.agents/skills/`.
- **Alasan:** Agent Antigravity tidak membaca `.cursor/skills/` atau `.claude/skills/`.
- **Tidak diubah:** isi `SKILL.md` (sama dengan Cursor/Claude).

---

## 2026-08-19 — Skill `unslop` dipindah ke repo

- **Tipe:** skill lokal
- **Domain:** Product Owner
- **File terdampak:** `.cursor/skills/unslop/SKILL.md`, `.claude/skills/unslop/SKILL.md`, `AGENTS.md`
- **Perubahan:** Salin skill `unslop` ke repo (bukan hanya skill global di home). Cursor baca `.cursor/skills/`; agent domain repo ini baca `.claude/skills/`. Isi sama dengan skill personal.
- **Alasan:** Aturan tulisan berlaku untuk siapa pun yang buka repo ini, bukan hanya mesin yang punya skill di home.
- **Tidak diubah:** skill global di `~/.claude/skills/unslop` (tetap ada, tidak dihapus dari sini).

---

## 2026-08-19 — F-07: PBT dari ISO 22400-2; Quality two-station infeed/outfeed

- **Tipe:** keputusan + perjelas istilah
- **Domain:** foundation-domain
- **File terdampak:** `FOUNDATION/DOCS-EN/07-kpi-formula.md`
- **Perubahan:** PBT/APT/POT dijelaskan dari **ISO 22400-2:2014** §5.1.2.4 / §5.1.3.6 (`ISO-22400-2-2014_searchable.pdf`): `PBT = POT − planned downtime`, `Availability = APT / PBT`. Molca: POT = jam `SHIFT_INSTANCE`; planned DT = stop aktual berkategori planned (kunci PO — beda dari “rencana di kalender” ISO). APT v1 = PBT − unplanned; setup ISO (AUST) belum dipisah. Quality two-station: **bukan rumus Quality baru** — isi reject dari `total` infeed − `total` outfeed; jika mesin 1 hulu, `reject = max(0, total_1 − total_2)`, bukan `total_2 − total_1`.
- **Alasan:** PO minta PBT dibaca dari file ISO di research; selisih counter dua mesin adalah jalur NG, bukan KPI ke-5.
- **Tidak diubah:** rumus `Quality = good / total`.

---

## 2026-08-19 — F-07 Quality: `good = total − reject` sebagai jalur isi

- **Tipe:** keputusan
- **Domain:** foundation-domain
- **File terdampak:** `FOUNDATION/DOCS-EN/07-kpi-formula.md`
- **Perubahan:** Rumus Quality tetap `good / total`. Kalau tidak ada tag/job `good`, `good = total − Σ reject`. Kalau tidak ada `total`, `total = good + Σ reject`. Ketiganya ada tapi tidak konsisten → anomali, bukan menimpa diam-diam. Jangan campur sumber job dengan tag dalam satu rasio.
- **Alasan:** banyak PLC Molca punya total + NG per alasan, tanpa counter good terpisah — itu jalur data, bukan rumus Quality kedua.

---

## 2026-08-19 — OEE tampil ⇒ waterfall loss wajib

- **Tipe:** keputusan tampilan (bukan rumus baru)
- **Domain:** foundation-domain + production-domain
- **File terdampak:** `FOUNDATION/DOCS-EN/07-kpi-formula.md`, `PRODUCTION/DOCS/oee-monitoring.md`
- **Perubahan:** Setiap kali OEE bisa dihitung, **wajib** grafik waterfall dari tipe loss yang sama dengan A/P/Q: mulai PBT → unplanned DT → residu Performance (+ `small_stop`) → loss Quality → waktu produktif (`OEE × PBT`). Planned DT **bukan** batang OEE (sudah keluar dari PBT); boleh batang terpisah shift→PBT. Availability-only: tidak ada waterfall OEE.
- **Alasan:** OEE sudah didefinisikan dari rumah loss; kalau A, P, Q ada, ketiga tangga waterfall ada — bukan widget opsional.
- **Tidak diubah:** sub-kategori breakdown/changeover/material di loss tree Production tetap `TBD`.

---

## 2026-08-19 — FOUNDATION/DOCS-EN: F-07 metrik ↔ `tag_role`

- **Tipe:** keputusan (deklarasi relasi, bukan entitas baru)
- **Domain:** foundation-domain
- **File terdampak:** `FOUNDATION/DOCS-EN/07-kpi-formula.md`
- **Perubahan:** Tabel **metric → sumber + `tag_role`** dan **`tag_role` → metric** untuk Availability, Performance, Quality, OEE. OEE tidak punya role sendiri. `product_code` hanya memilih `OPERATION`, bukan suku A/P/Q. Tetap: tidak ada `availability_tag`; tanpa tag = tap ke tabel yang sama.
- **Alasan:** F-07 sudah punya input terpisah tapi relasi ke tag masih tersebar di prosa.
- **Tidak diubah:** catalog widget / layout composable.

---

## 2026-08-19 — FOUNDATION/DOCS-EN: F-07 input OEE per parameter; Availability boleh tanpa OEE

- **Tipe:** keputusan + tulis ulang companion
- **Domain:** foundation-domain
- **File terdampak:** `FOUNDATION/DOCS-EN/07-kpi-formula.md`, `00-foundation.md`, `README.md`, `FOUNDATION/AGENTS.md`
- **Perubahan:** F-07 EN-first: **bukan** seeder `KPI_INDEX`/`KPI_FORMULA` (K-1 & K-4 ditutup). Deklarasi per input (PBT, planned/unplanned aktual, APT, standar `OPERATION`, total/good). **Availability boleh tampil sendiri** kalau PBT+APT ada; OEE hanya jika A, P, dan Q semua bisa dihitung — "no data" bukan 0%. Tag tetap di equipment; operator mengisi tabel yang sama. §9 formula **tidak ada di v1**.
- **Alasan:** hanya PBT yang sempat dikunci, padahal OEE punya banyak bahan; layar Availability-only sah untuk lini yang baru punya jam shift + state log.
- **Tidak diubah:** `PRODUCTION/DOCS/oee-monitoring.md` (aturan "OEE jangan telanjang" tetap untuk *widget OEE*, bukan kewajiban menampilkan OEE), metrics-framework §5 / OEE-8/OEE-9 (milik PO).

---

## 2026-08-19 — FOUNDATION/DOCS-EN: tutup H-2 (break bukan field Shift); PBT bukan tag

- **Tipe:** keputusan
- **Domain:** foundation-domain
- **File terdampak:** `FOUNDATION/DOCS-EN/02-shift.md`, `FOUNDATION/DOCS-EN/07-kpi-formula.md`
- **Perubahan:** **H-2 resolved.** `SITE_SHIFT` hanya jam mulai/selesai — baris placeholder `break_minutes` dihapus. Istirahat yang benar-benar terjadi adalah downtime terencana di `ASSET_STATE_LOG`, bukan potongan jam shift. Tabel break berulang di kanvas Production Planning **bukan** Foundation (nanti, domain Production); tidak menulis downtime sendiri. Catatan singkat di `07-kpi-formula.md`: **PBT** (ISO planned busy time) bukan tag dan bukan field `SHIFT_INSTANCE`. Arah hitung KPI (bukan kolom Shift): `PBT = (end − start instance) − Σ downtime planned aktual`. Downtime tanpa alasan belum planned — tetap di dalam PBT. H-7 tetap milik KPI/`production-domain` (tidak disimpan di Shift).
- **Alasan:** mesin yang jalan saat jendela istirahat harus tetap runtime; potongan `break_minutes` di master shift akan memotong PBT meski mesin tidak berhenti.
- **Tidak diubah:** `FOUNDATION/DOCS/` (Indonesia, retired untuk Shift), `PRODUCTION/DOCS/oee-monitoring.md` (masih rumus lama shift − istirahat; milik production-domain, disentuh saat domain itu dideklarasikan), PRD-001.

---

## 2026-08-19 — FOUNDATION/DOCS-EN: tutup P-6, hierarki produk via nesting BOM

- **Tipe:** keputusan
- **Domain:** foundation-domain
- **File terdampak:** `FOUNDATION/DOCS-EN/06-product.md`, `12-work-master.md`, `README.md`
- **Perubahan:** **P-6 resolved.** `PRODUCT.product_type` tetap flag datar tiga nilai (`raw_material` / `semi_finished` / `finished_good`); hierarki FG → semi → raw sudah ada sebagai nesting `BOM` di Work Master, jadi tidak ada master family/category terpisah. `README.md` mencatat F-01–F-06 sudah punya §9.
- **Alasan:** pertanyaan rollup reporting di Product sudah terjawab oleh konsep BOM yang sudah ada, bukan entitas baru.
- **Dampak:** tidak ada open question tersisa di `06-product.md`. `BOM` sendiri masih konsep di Work Master (field table belum ditulis).

---

## 2026-08-18 — FOUNDATION/DOCS-EN: pindahkan routing/cycle-time Product ke Work Master, tambah `*_CLASS` di Site Hierarchy, tutup A-6/A-7/H-1/H-5/H-6/P-1/P-2/P-5

- **Tipe:** resolusi banyak open question via sesi tanya-jawab dengan Product Owner + satu restrukturisasi lintas-file (pemindahan entitas)
- **Domain:** foundation-domain
- **File terdampak:** `FOUNDATION/DOCS-EN/00-foundation.md`, `01-site-hierarchy.md`, `02-shift.md`, `04-asset-ontology.md`, `05-reference-master-data.md`, `06-product.md`, `10-integration.md`, `11-configuration-service.md`, `12-work-master.md`, `tag-declaration-draft.md`
- **Perubahan:**
  1. **`01-site-hierarchy.md` — horizontal grouping via `*_CLASS`.** Ditambahkan empat tabel lookup datar (tidak self-nesting seperti `ASSET_CLASS`): `SITE_CLASS`, `AREA_CLASS`, `WORK_CENTER_CLASS`, `WORK_UNIT_CLASS` (§9.7–§9.10), masing-masing satu FK per node — bukan many-to-many — untuk pengelompokan lintas cabang tree (mis. semua `WORK_CENTER` "Packaging Line" di semua site), menjawab pitfall #1 ("A department isn't an area") yang sebelumnya cuma disebut tanpa solusi. **S-1 resolved:** 2 site untuk peluncuran awal (satu 2 area, satu 4 area, total 6 area). **S-2 resolved:** `SITE.timezone` disimpan sebagai nama IANA per site (`Asia/Jakarta`, `Asia/Tokyo`); data tetap UTC, field ini hanya dipakai untuk interpretasi shift/`business_date` per site. **S-4 resolved:** `*_code` murni internal/sistematis (pola yang diusulkan tetap dipakai, tidak perlu konfirmasi penamaan lantai produksi), `*_name` yang menampung apa pun sebutan asli operator (mis. "Line 2") — dua field ini sengaja dipisah tanggung jawabnya. **S-5 ditambahkan** (nilai riil `*_CLASS`, belum dijawab).
  2. **`04-asset-ontology.md` — A-6 (a/b/c) dan A-7 resolved.** A-7: `ASSET.manufacturer`/`.model` dihapus, setiap `ASSET` selalu baca dari `ASSET_TYPE`. A-6a: `EQUIPMENT_TAGS.equipment_id` dibatasi Equipment-unit-level saja (`parent_asset_id IS NULL`), sama seperti `ASSET_PLACEMENT`. A-6b: unique constraint `(equipment_id, raw_value)` pada `EQUIPMENT_PRODUCT_CODES` — satu kode mentah = satu produk aktif per equipment. A-6c: heartbeat/staleness untuk tag yang diam dilacak di level `DATA_SOURCE` (koneksi), bukan per-tag — cocok dengan cara kerja asli OPC UA subscription keep-alive / MQTT LWT, sekaligus menyingkap gap baru: `DATA_SOURCE` belum punya entity spec sendiri di mana pun (dicatat di `10-integration.md` "Next step"). Ditambah field baru `EQUIPMENT_TAGS.count_basis` (enum `unit`/`cycle`) — mendeklarasikan per-tag apakah counter menghitung unit individual atau siklus mesin, dipakai formula operating-time Work Master untuk memutuskan perlu-tidaknya pembagian oleh `batch_size`.
  3. **`02-shift.md` — H-1, H-5, H-6 resolved; H-7 dieksplisitkan sebagai domain lain.** H-1: 3 Enterprise Shift (07:00–14:59/15:00–22:59/23:00–06:59), jam sama di kedua site (hanya beda timezone). H-5: overtime/shift tambahan tidak dilacak untuk saat ini — field `is_overtime` dihapus dari `SHIFT_INSTANCE` (bukan dibiarkan sebagai schema tak terpakai). H-6: waktu generate `SHIFT_INSTANCE` resolved (harian, sebelum hari bisnis dimulai) — mekanismenya sendiri tetap milik `production-domain`. H-7 ditandai eksplisit "deferred, bukan domain foundation" atas permintaan Product Owner, bukan dibiarkan "Unknown" tanpa keterangan.
  4. **Restrukturisasi besar: `PRODUCT_WORK_CENTER`/`PRODUCT_ROUTE_OVERRIDE`/`PRODUCT_WORK_UNIT` pindah dari `06-product.md` ke `12-work-master.md` sebagai `ROUTING`/`OPERATION`.** Dipicu diskusi ITEM vs PRODUCT: keduanya entitas yang sama (raw material/WIP/finished good dengan flag tipe) — `ITEM` dipensiunkan, `PRODUCT` yang dipakai di mana-mana. `ROUTING` (§9.1, Work Master) = identitas produk×work-center murni (tanpa field cycle time kasar — field itu tidak selamat dari merge, jadi P-3 resolved by removal, bukan dijawab). `OPERATION` (§9.2) = satu langkah routing di satu work unit, gabungan sequencing lama (`PRODUCT_ROUTE_OVERRIDE`) + cycle time lama (`PRODUCT_WORK_UNIT`), ditambah dua field baru yang belum pernah ada di kedua tabel Product: `standard_setup_time`, `crew_size`. Penggabungan ini otomatis resolve **P-1** (routing Product vs Work Master ternyata konsep yang sama, bukan dua hal berbeda). `PRODUCT_CYCLE` sengaja **tidak** ikut pindah — tetap di Product karena itu master-level (per UOM), bukan per-work-unit. Field `cycle_time_value` di `OPERATION` dapat catatan data-entry: user boleh input throughput rate (mis. "500 unit/jam", satuan waktu dipilih lewat `time_conversion_id` yang sudah ada), sistem yang konversi ke `cycle_time_value` saat disimpan — tidak ada field `throughput_rate` terpisah yang disimpan.
  5. **`06-product.md` — P-2, P-5 resolved; P-7 dibahas lalu dikoreksi lagi.** P-2: `PRODUCT_CYCLE` boleh punya banyak baris aktif sekaligus (satu per UOM) — keberadaan `is_main_uom` sendiri hanya masuk akal kalau ada lebih dari satu baris aktif untuk dipilih. P-5: sensor pabrik Molca menghitung unit individual, bukan siklus — jadi formula operating-time butuh `sensor_count ÷ batch_size` sebelum dikali `cycle_time_value`, tapi ini dideklarasikan per-tag lewat `count_basis` (poin 2), bukan diasumsikan berlaku global. **P-7** (proses kontinu vs diskrit): draf pertama salah menyimpulkan work unit kontinu cukup pakai `runtime`-role tag saja; setelah user mengoreksi ("sensor cek reduce speed atau tidak"), resolusi final: `OPERATION` (setelah pindah ke Work Master) dapat field rate `standard_speed_value`/`speed_uom_id` sebagai standar target, dibandingkan lewat **dua cara alternatif** — `speed`-role tag langsung, atau `runtime × standard_speed_value` (output teoritis) vs `total`/`good`-role tag (output aktual) — tergantung tag apa yang ada di equipment tersebut.
  6. **Cross-reference lintas file diperbaiki mengikuti pemindahan poin 4:** setiap kutipan `PRODUCT_WORK_UNIT.uom_id`/`.time_conversion_id`/`.batch_size` di `00-foundation.md`, `05-reference-master-data.md`, `11-configuration-service.md`, `tag-declaration-draft.md` diganti ke `OPERATION` (Work Master). `tag-declaration-draft.md` decision 8 dapat catatan "Correction 2026-08-18" kedua — bukan pembalikan ke kesalahan 2026-08-12 (`OPERATION.standard_cycle_time` yang dulu belum terdefinisi), karena `OPERATION` sekarang tabel yang benar-benar dispesifikasi, bukan placeholder.
  7. **Inkonsistensi baru ditemukan, sengaja tidak diperbaiki sepihak:** `00-foundation.md` "Next step" masih menempatkan Work Master di urutan baca paling akhir (karena historically "least settled"), padahal sekarang Work Master memegang sumber cycle-time yang dibutuhkan formula KPI di urutan baca sebelumnya (Product → KPI & Reference Data). Dicatat eksplisit sebagai known gap di `00-foundation.md`, bukan diam-diam diperbaiki dengan mengubah urutan baca (itu keputusan struktural yang lebih besar dari lingkup sesi ini).
- **Tidak diubah:** `FOUNDATION/DOCS/` (pohon Indonesia, retired), `../DOCS/work-master.md` (masih source of truth untuk `ITEM`/`BOM`/`WORK_ORDER`/`WORK_ORDER_OPERATION` — hanya `ROUTING`/`OPERATION` yang sekarang EN-first di `12-work-master.md`), `07-kpi-formula.md` (belum disentuh meski isinya sekarang bergantung pada `OPERATION`, bukan `PRODUCT_WORK_UNIT`).
- **Alasan:** sesi ini dimulai dari pertanyaan Product Owner soal horizontal grouping di Site Hierarchy dan berkembang jadi review menyeluruh terhadap beberapa open question FOUNDATION yang sudah lama menggantung (A-6, A-7, H-1/H-5/H-6, P-1/P-2/P-5), plus satu temuan struktural nyata: `PRODUCT_WORK_CENTER`/`PRODUCT_ROUTE_OVERRIDE`/`PRODUCT_WORK_UNIT` di Product ternyata memang "proto-Work Master" (istilah yang dipakai di kanvas desain `operational-intelligence/iec-ios.tldraw`) — bukan konsep permanen milik Product, sehingga dipindah ke rumah aslinya begitu Work Master ditinjau ulang.

---

## 2026-08-14 — FOUNDATION/DOCS-EN: tulis §9 Entity specification untuk `06-product.md`, samakan gaya dengan 01–04

- **Tipe:** tulis tabel field-level baru + perbaikan cross-reference (bukan perubahan makna entitas yang sudah ada)
- **Domain:** foundation-domain
- **File terdampak:** `FOUNDATION/DOCS-EN/06-product.md`, `FOUNDATION/DOCS-EN/README.md`
- **Perubahan:**
  1. **`06-product.md` §9 (baru)** — bagian "Not covered here" yang sebelumnya bilang field table belum ditulis, diganti tabel field nyata: `PRODUCT` (§9.1), `PRODUCT_DETAIL` (§9.2), `PRODUCT_WORK_CENTER` (§9.3), `PRODUCT_ROUTE_OVERRIDE` (§9.4), `PRODUCT_WORK_UNIT` (§9.5), `PRODUCT_CYCLE` (§9.6), `PRODUCT_UOM_CONVERSION` (§9.7), diikuti §9.8 yang menegaskan entitas yang direferensikan tapi dimiliki modul lain (`EQUIPMENT_PRODUCT_CODES` milik Equipment Taxonomy, `TIME_CONVERSIONS`/`UNIT_OF_MEASUREMENTS` milik Reference & Master Data, `WORK_CENTER`/`WORK_UNIT` milik Site Hierarchy), dan §9.9 "Open questions" (P-1..P-3). Tidak ada fakta baru dikarang — tipe/required field diturunkan langsung dari prose yang sudah ada di file sebelumnya.
  2. **Perbaikan cross-reference — `EQUIPMENT_PRODUCT_CODE`(S):** deskripsi lama di `06-product.md` menyebut entitas ini "per `ASSET` (equipment)" dan memakai nama singular `EQUIPMENT_PRODUCT_CODE`. Definisi kanonik sebenarnya (`04-asset-ontology.md` §9.7, ditulis di commit `b121643`, setelah `06-product.md` terakhir disentuh) memakai nama plural `EQUIPMENT_PRODUCT_CODES` dan FK-nya adalah `tag_id` → `EQUIPMENT_TAGS` (bukan langsung ke `ASSET`). `06-product.md` diperbaiki mengikuti definisi kanonik itu, ditandai eksplisit sebagai entitas milik Equipment Taxonomy — bukan didefinisikan ulang di sini. Pohon "How the entities connect" dipisah: entitas yang dimiliki Product tetap di bawah `PRODUCT`, sedangkan `EQUIPMENT_PRODUCT_CODES` dipindah ke blok terpisah dengan catatan kepemilikan, sama seperti pola `TIME_CONVERSIONS`/`UNIT_OF_MEASUREMENTS` di `05-reference-master-data.md`.
  3. Pertanyaan terbuka **P-4** ("apakah `raw_value` unik per equipment...") dihapus dari `06-product.md` karena ternyata pertanyaan yang sama sudah tercatat sebagai **A-6(b)** di `04-asset-ontology.md` §9.8 (entitas ini memang dimiliki di sana) — diganti satu baris pointer, mengikuti pola A-2 yang sudah dipakai di `04-asset-ontology.md` untuk menghindari dua file bertanya hal yang sama.
  4. **Tightening narasi** mengikuti pola `ea8757c` (01/03/04/05): banner intro dipendekkan ke bentuk langsung ("No Indonesian source yet...", tanpa menceritakan riwayat "confirmed against MolcaDx's own KPI operating-time design thread"); bagian "`TIME_CONVERSIONS` — resolved, now defined in Reference & Master Data" (framing riwayat) dilebur jadi satu paragraf pendek di §9.8/badan teks tanpa kata "resolved"; paragraf "Correction to earlier drafts" dipangkas jadi satu kalimat pernyataan langsung tanpa menceritakan draft lama.
  5. **Elemen struktural yang sebelumnya hilang, ditambahkan** untuk menyamakan dengan 01/03/04: heading "How the entities connect" (sebelumnya "Entities and how they connect"), "Common pitfalls", dan "Related modules" — pola yang sudah ada di 01/04/05 tapi belum ada di `06-product.md`.
  6. `README.md` — baris "Full field-level entity specs ... currently F-01 through F-05" diperbarui jadi "F-01 through F-06" karena `06-product.md` sekarang juga punya §9 lengkap.
- **Tidak diubah:** `04-asset-ontology.md`, `05-reference-master-data.md`, `07-kpi-formula.md`, `tag-declaration-draft.md` — lihat catatan "Perlu keputusan" di laporan sesi ini untuk dua inkonsistensi lintas file yang ditemukan tapi sengaja tidak diperbaiki sepihak (nama field `PRODUCT_WORK_UNITS.product_cycle_time_value` di `tag-declaration-draft.md` vs `PRODUCT_WORK_UNIT.cycle_time_value` yang sebenarnya; dan `04-asset-ontology.md`'s tabel "Related modules" yang belum menyebut Product sama sekali walau `EQUIPMENT_PRODUCT_CODES.product_id` FK ke sana).
- **Alasan:** `06-product.md` adalah satu-satunya modul di antara F-01–F-05 yang belum punya §9 entity spec (masih berbentuk prose "Entities and how they connect" + catatan "field table belum ditulis") — sesi ini menutup gap itu sekaligus memperbaiki cross-reference yang jadi basi setelah `04-asset-ontology.md` mendefinisikan `EQUIPMENT_PRODUCT_CODES` secara resmi di commit `b121643`, sesudah `06-product.md` sendiri terakhir diubah.

---

## 2026-08-14 — FOUNDATION/DOCS-EN: tulis §9 Entity specification untuk `01-site-hierarchy.md`, `02-shift.md`, `03-yearly-quarterly-declaration.md`

- **Tipe:** tulis tabel field-level baru (mengisi placeholder yang sebelumnya sengaja dikosongkan)
- **Domain:** foundation-domain
- **File terdampak:** `FOUNDATION/DOCS-EN/01-site-hierarchy.md`, `FOUNDATION/DOCS-EN/02-shift.md`, `FOUNDATION/DOCS-EN/03-yearly-quarterly-declaration.md`
- **Perubahan:**
  1. **`01-site-hierarchy.md` §9** — placeholder "Deliberately left blank" diganti tabel field nyata: `TENANT` (§9.1), `ENTERPRISE` (§9.2), `SITE` (§9.3), `AREA` (§9.4), `WORK_CENTER` (§9.5), `WORK_UNIT` (§9.6), ditutup "Open questions" (§9.7) yang mengutip ulang S-1..S-4. Setiap tabel per level punya FK ke level induknya — bukan satu tree self-referencing seperti `ASSET_CLASS`, jadi tidak butuh field `depth` terpisah (kedalaman sudah tetap 5 level lewat skema). Pola kode bisnis (`site_code`, `area_code`, dst.) diambil dari tabel "Suggested business-code patterns" di `00-foundation.md`, ditandai sebagai usulan/placeholder, bukan final. Field `SITE.timezone` ditandai `TBD` — bentuk penyimpanannya (nama IANA per site vs UTC + tampilan per enterprise) mengutip S-2 yang belum benar-benar menjawab satu desain. `tenant_code`/`enterprise_code` juga ditandai `TBD` karena tidak ada pola yang diusulkan untuk kedua level itu. `WORK_UNIT` sengaja tidak diberi field `current_asset_id` — relasi ke asset yang menempatinya tetap milik `ASSET_PLACEMENT` (`04-asset-ontology.md §9.4`), sesuai keputusan changelog 2026-08-13 sebelumnya. Header status diubah dari 🔴 NOT WRITTEN jadi 🟡 DRAFT; "Next step" diubah dari "tunggu S-1..S-4" jadi "field table sudah ditulis pakai placeholder pola kode, tinggal konfirmasi S-1/S-2/S-4 ke Operations/PO".
  2. **`02-shift.md` §9** — placeholder diganti tabel field nyata: `ENTERPRISE_SHIFT` (§9.1), `SITE_SHIFT` (§9.2), `SHIFT_INSTANCE` (§9.3), ditutup "Open questions" (§9.4). `ENTERPRISE_SHIFT` dapat field `is_production_shift` (wajib, sesuai "Production shifts vs non-production shifts" di konsep #6), ditandai `TBD` soal apakah perlu bisa di-override per site. `SITE_SHIFT` dapat baris `break_minutes`/break start-end bertanda `TBD` eksplisit mengutip H-2 (bukan dihilangkan begitu saja) — belum ada desain final, hanya placeholder. `SHIFT_INSTANCE` dapat `status` (enum minimal `open`/`closed`, daftar lengkap `TBD`) dan `is_overtime` (`TBD`, mengutip H-5) — keduanya ditulis eksplisit sebagai placeholder, bukan tebakan final. H-6 (mekanisme generate `SHIFT_INSTANCE`) dan H-7 (sumber nilai scheduled-time) sengaja **tidak** dijadikan field — keduanya soal mekanisme/lokasi, bukan kolom struktural, dan §9.3 secara eksplisit menegaskan `SHIFT_INSTANCE` tetap tidak punya `scheduled_minutes` (sesuai larangan tegas di konsep #5/common pitfall #5) — hanya dicatat sebagai catatan terbuka di intro entitas, mengutip H-6/H-7. `SHIFT_ASSIGNMENT` **tidak** ditulis ulang — entitas itu sudah sengaja dihapus dari modul ini sebelumnya. Header status diubah 🔴→🟡; "Next step" diperbarui: urutan penyelesaian sekarang H-1 dulu (baru bisa dikonfigurasi untuk site nyata), lalu H-2.
  3. **`03-yearly-quarterly-declaration.md` §9** — placeholder diganti tabel field `FISCAL_YEAR` (§9.1) yang mencakup **kedua mode `calendar_basis` secara setara/lengkap dan sama-sama dikirim (delivered)**, bukan hanya `monthly`: field `monthly` (`start_month`/`end_month`, `start_date`/`end_date` turunan) dan field `weekly_iso` (`start_date`/`end_date` dipilih langsung, `period_pattern` dengan nilai `4-5-4`/`4-4-5`/`5-4-4`) sama-sama ditulis sebagai bagian yang dibangun & disurface, bukan salah satu deferred/hidden-by-default. **Koreksi dalam sesi ini:** draft pertama sempat keliru menyimpulkan dari catatan Y-1 ("Resolved: month-aligned, `calendar_basis = monthly` adalah mode yang dikonfirmasi") bahwa hanya `monthly` yang dibangun untuk v1 dan `weekly_iso` sengaja disembunyikan di UI — user mengoreksi langsung ("who said that? we deliver both of them"). Diperbaiki: Y-1 hanya menjawab fakta fiskal tahun Molca sendiri (Molca memang month-aligned), **bukan** keputusan cakupan produk untuk menahan `weekly_iso` — keduanya tetap dikirim sebagai mode yang bisa dipilih tiap enterprise/tenant. Tidak ada field yang ditandai `TBD` di file ini karena Y-1/Y-2 sudah resolved sebelum sesi ini. §9.2 "Open questions" ditulis eksplisit kosong untuk kedua mode. Header status diubah 🔴→🟡; "Next step" jadi "implementasi `FISCAL_YEAR` mendukung `monthly` dan `weekly_iso` sebagai mode nyata yang bisa dipilih, `start_month`/`end_month` hanya untuk baris `monthly` dan `period_pattern` hanya untuk baris `weekly_iso`".
  4. Grep seluruh `FOUNDATION/DOCS-EN/` untuk cross-reference beranchor ke `01-site-hierarchy.md#9`, `02-shift.md#9`, `03-yearly-quarterly-declaration.md#9` — **nihil hasil** di pohon EN (satu-satunya kutipan `07-kpi-formula.md` ke `01-site-hierarchy.md` adalah link file biasa tanpa anchor, tidak perlu diperbaiki). Anchor beranchor `#9x-...` yang ada di `DOCS/prd/PRD-001-*.md` dan `FOUNDATION/DOCS/foundation.md`/`calendar.md` semuanya menunjuk ke sumber Bahasa Indonesia yang sudah retired (`../../FOUNDATION/DOCS/site-hierarchy.md`, `shift.md`) — di luar cakupan sesi ini, tidak disentuh.
- **Alasan:** blocker yang sebelumnya menahan §9 sudah selesai — Y-1/Y-2 (fiscal year) resolved sesi sebelumnya, konsep Site Hierarchy memang tidak pernah benar-benar dipertanyakan (hanya perlu field table yang tidak menjiplak sumber Indonesia lama), dan Shift sekarang bisa ditulis dengan `TBD` eksplisit untuk H-2/H-5/H-6/H-7 alih-alih terus dikosongkan.
- **Tidak diubah:** `FOUNDATION/DOCS/` (pohon Indonesia, retired), `DOCS/prd/PRD-001-*.md` (milik product-owner), `LOGS/CHANGELOG.md` entri lama.

---

## 2026-08-14 — FOUNDATION/DOCS-EN: hapus atribusi ke `erd-check.pdf`/"reference ERD", tulis ulang sebagai desain sendiri

- **Tipe:** reword sumber atribusi (bukan perubahan isi/fakta/entitas)
- **Domain:** foundation-domain
- **File terdampak:** `FOUNDATION/DOCS-EN/00-foundation.md`, `FOUNDATION/DOCS-EN/04-asset-ontology.md`, `FOUNDATION/DOCS-EN/05-reference-master-data.md`, `FOUNDATION/DOCS-EN/06-product.md`, `FOUNDATION/DOCS-EN/07-kpi-formula.md`, `FOUNDATION/DOCS-EN/11-configuration-service.md`, `FOUNDATION/DOCS-EN/README.md`, `FOUNDATION/DOCS-EN/tag-declaration-draft.md`
- **Perubahan:** seluruh kemunculan frasa yang mengaitkan isi dokumen ke riset internal `operational-intelligence/research/erd-check.pdf` — mis. "per the reference ERD", "the ERD shows...", "the source ERD's own 'CONFIG & MASTER DATA' section groups...", "based on the ERD", nama file `erd-check.pdf` itu sendiri — dihapus dan kalimat di sekitarnya ditulis ulang supaya terbaca sebagai desain FOUNDATION sendiri, bukan ringkasan dokumen riset eksternal. Field, tabel entitas, dan penalaran (mis. mengapa `DOWNTIME_REASON`/`REJECT_REASON`/`TIME_CONVERSIONS`/`UNIT_OF_MEASUREMENTS` dikelompokkan jadi satu modul F-05) **tidak dihapus** — hanya kalimat sumbernya yang diganti, alasan pengelompokan tetap ditulis eksplisit berbasis logikanya sendiri (semua entitas tsb bukan deskriptor satu asset/product/work order spesifik, melainkan lookup kode/nama bersama).
- **Yang tidak diubah:** semua penanda `TBD`/pertanyaan terbuka (T-1 s.d. T-5, P-1 s.d. P-4, dst.) tetap terbuka persis seperti sebelumnya — fakta yang belum dikonfirmasi Operations/Engineering (daftar `DOWNTIME_REASON`/`REJECT_REASON` sebenarnya, overlap `UNIT_OF_MEASUREMENTS` vs Work Master `UOM`, field liar `time_conversions`, split `kind`/`tag_role` pada `equipment_tags`) tetap tidak dikonfirmasi — hanya framing "kenapa bentuk ini masuk akal" yang berubah dari "ditemukan di ERD riset" jadi "ini desain kerja modul ini sendiri, menunggu konfirmasi". `FOUNDATION/DOCS/` (pohon Bahasa Indonesia), `LOGS/CHANGELOG.md` entri lama, dan `LOGS/handoff-*.md` tidak disentuh (catatan historis).

---

## 2026-08-13 — FOUNDATION/DOCS-EN: rename modul F-04 dari "Asset Ontology" jadi "Equipment Taxonomy"

- **Tipe:** rename nama modul (bukan perubahan cakupan/entitas)
- **Domain:** foundation-domain
- **File terdampak:** `FOUNDATION/DOCS-EN/04-asset-ontology.md`, `FOUNDATION/DOCS-EN/README.md`, `FOUNDATION/DOCS-EN/00-foundation.md`, `FOUNDATION/DOCS-EN/05-reference-master-data.md`, `FOUNDATION/DOCS-EN/01-site-hierarchy.md`, `FOUNDATION/DOCS-EN/11-configuration-service.md`, `AGENTS.md` (root)
- **Perubahan:**
  1. Setiap kemunculan nama modul "Asset Ontology" di file-file EN di atas diganti jadi "**Equipment Taxonomy**" — nama file tetap `04-asset-ontology.md` (tidak di-rename), nomor modul tetap F-04, dan seluruh nama entitas (`ASSET`, `ASSET_CLASS`, `ASSET_TYPE`, `ASSET_PLACEMENT`, `ASSET_COMPONENT_LINK`, `ASSET_STATE_LOG`, dst.) tidak disentuh — murni ganti nama modul, bukan ganti skema.
  2. `AGENTS.md` (root) §"Kode domain & modul" — baris FOUNDATION diperbarui dari "Asset Ontology · Work Master · ..." jadi "Equipment Taxonomy · Work Master · ...". Kode modul (`AST`) tidak berubah.
- **Alasan:** "Asset Ontology" ambigu berdampingan dengan `01-site-hierarchy.md`, dan dua standar industri yang dikutip modul ini memakai istilah berbeda untuk hal yang berbeda: ISA-95/IEC 62264 memakai "Equipment Hierarchy" untuk pohon Enterprise→Site→Area→Line (itu sudah jadi `01-site-hierarchy.md`), sedangkan **ISO 14224 memakai "Equipment Taxonomy"** (Clause 8-nya sendiri berjudul "Equipment boundary and taxonomy") untuk klasifikasi Class/Type/Instance + nesting komponen (Equipment unit→Subunit→Maintainable item→Part) yang justru dicakup `04-asset-ontology.md`. Jadi "Equipment Taxonomy" mengadopsi istilah standar ISO 14224 sendiri untuk isinya sendiri, bukan istilah baru yang dikarang.
- **Tidak diubah (di luar cakupan):**
  - `FOUNDATION/DOCS/asset-ontology.md` (pohon Bahasa Indonesia, sedang di-retire) dan seluruh referensi "Asset Ontology" di dalam `FOUNDATION/DOCS/*.md` Indonesia lainnya (`foundation.md`, `kpi-formula.md`, `integration.md`, `site-hierarchy.md`, `configuration-service.md`) serta `FOUNDATION/AGENTS.md` §2 (indeks pohon Indonesia F-03) — tetap memakai nama Indonesia yang belum diubah.
  - `PRODUCTION/DOCS/shopfloor.md`, `PRODUCTION/DOCS/shopfloor-konsep.md`, `PRODUCTION/DOCS/oee-monitoring-konsep.md` — merujuk nama modul via dokumen Indonesia (`asset-ontology.md`), milik `production-domain`; perlu disinkronkan oleh `production-domain` bila nama modul EN dirujuk lagi di sana.
  - `DOCS/prd/PRD-001-molcadx-core-q3.md` dan `-en.md`, `DOCS/goalsQ3.md` — menyebut "Asset Ontology" sebagai nama modul (termasuk header "6.2 FOUNDATION — Asset Ontology"); dokumen ini milik `product-owner`, diajukan ke PO untuk diselaraskan, tidak diubah langsung oleh foundation-domain.
  - `LOGS/CHANGELOG.md` (entri lama) dan `LOGS/handoff-2026-08-12-kpi-operating-time.md` — catatan historis, tetap memakai nama lama sesuai kondisi saat ditulis.

## 2026-08-13 — FOUNDATION/DOCS-EN: hapus §9 Entity specification di `01-site-hierarchy.md` dan `03-yearly-quarterly-declaration.md`, menyusul `02-shift.md`

- **Tipe:** hapus tabel field-level, ganti placeholder
- **Domain:** foundation-domain
- **File terdampak:** `FOUNDATION/DOCS-EN/01-site-hierarchy.md`, `FOUNDATION/DOCS-EN/03-yearly-quarterly-declaration.md` (`02-shift.md` sudah lebih dulu diubah pola serupa di sesi sebelumnya, dijadikan acuan pola/tone di sini, tidak diubah lagi)
- **Perubahan:**
  1. **`01-site-hierarchy.md` §9** — tabel field `SITE`/`AREA`/`WORK_CENTER`/`WORK_UNIT` (§9.1 Entities, §9.2 Core attributes, §9.3 Rules) dihapus seluruhnya, diganti placeholder singkat mengikuti pola `02-shift.md`. Header blockquote diubah dari "Concepts (§1–§8) + entity specification (§9)... Entity spec status: 🟡 DRAFT" jadi "Concepts only — no entity specification yet... Entity spec status: 🔴 NOT WRITTEN".
  2. **`03-yearly-quarterly-declaration.md` §9** — tabel field `FISCAL_YEAR` (`fiscal_year_id`, `enterprise_id`, `fiscal_year`, `calendar_basis`, `start_date`/`end_date`, `period_pattern`, `valid_from`/`valid_to`) dihapus seluruhnya, diganti placeholder singkat pola serupa. Header blockquote diubah jadi "Concepts only — no entity specification yet... Entity spec status: 🔴 NOT WRITTEN".
  3. Grep seluruh `FOUNDATION/DOCS-EN/` untuk `01-site-hierarchy.md#9` dan `03-yearly-quarterly-declaration.md#9` — **nihil hasil**, tidak ada cross-reference lain yang menunjuk ke sub-heading §9.x yang dihapus (mis. tidak ada file lain yang mengutip `#92-core-attributes`), jadi tidak ada link yang perlu diperbaiki.
- **Alasan — catatan penting, beda jenis kerugian per file:**
  - `02-shift.md` (sesi sebelumnya): field yang dihapus **hasil karangan baru** sesi itu sendiri, belum pernah diputuskan siapa pun — menghapusnya tidak menghilangkan fakta yang pernah disepakati.
  - **`01-site-hierarchy.md` (sesi ini) berbeda:** field yang dihapus (`SITE.timezone`, `WORK_CENTER.type`/`is_oee_tracked`, `WORK_UNIT.position_no`/`is_bottleneck`, dll.) **bukan** karangan baru — itu terjemahan setia dari sumber Indonesia asli `FOUNDATION/DOCS/site-hierarchy.md` yang sedang dihapus. Menghapusnya di sini berarti kehilangan sesuatu yang pernah benar-benar didokumentasikan (meski sumber itu sendiri belum pernah dikonfirmasi PO/Ops sebagai final) — bukan sekadar membuang draft karangan. Dihapus tetap karena alasan yang sama seperti Shift: draft yang belum disetujui PO tidak boleh dianggap keputusan final hanya karena sudah tertulis lama.
  - `03-yearly-quarterly-declaration.md`: field `FISCAL_YEAR` yang dihapus juga baru (diakui sendiri di file sebagai "new entity authored directly in English", tidak ada sumber Indonesia untuk `FISCAL_YEAR`) — sejenis dengan kasus Shift, bukan kasus Site Hierarchy.
- **Dampak/verifikasi:**
  - Tidak ada file lain yang disentuh; `FOUNDATION/DOCS/` (pohon Indonesia) dan `04-asset-ontology.md` (di luar cakupan, ada kerja rename paralel "Equipment Taxonomy" yang sedang berjalan) sengaja tidak disentuh.
  - "What's still unknown" di kedua file tidak diubah — pertanyaan S-1..S-4 dan Y-1/Y-2 tetap terbuka, sekarang juga jadi alasan eksplisit kenapa §9 belum bisa ditulis ulang.

---

## 2026-08-13 — FOUNDATION/DOCS-EN: modul baru `05-reference-master-data.md` (F-05), seluruh file dinomori ulang

> Menggabungkan dua entri kerja sebelumnya (buat modul + cascade renumber +1, lalu reshuffle F-01→F-05) jadi satu — keduanya belum pernah di-commit terpisah, jadi ini dicatat sebagai satu perubahan tunggal ke hasil akhir, bukan dua langkah.

- **Tipe:** tambah modul + rename total
- **Domain:** foundation-domain
- **File terdampak:** semua file `FOUNDATION/DOCS-EN/*.md` kecuali `00-foundation.md` (isi tetap berubah) — `git mv`: `01-site-hierarchy.md`→`01-` (tetap), `02-shift.md`→`02-` (tetap), `03-yearly-quarterly-declaration.md`→`03-` (tetap), `04-asset-ontology.md`→`04-` (tetap), `05-product.md`→`06-`, `06-kpi-formula.md`→`07-`, `07-workflow-engine.md`→`08-`, `08-notification.md`→`09-`, `09-integration.md`→`10-`, `10-configuration-service.md`→`11-`, `11-work-master.md`→`12-`, 1 file baru `05-reference-master-data.md`. Plus `README.md`, `tag-declaration-draft.md`, `work-unit-flow-draft.md`. Dua link eksternal juga diperbaiki: `PRODUCTION/DOCS/work-schedule-draft.md` dan `PRODUCTION/DOCS/oee-monitoring.md`.
- **Hasil akhir:** F-01 Site Hierarchy, F-02 Shift, F-03 Yearly & Quarterly Declaration, F-04 Asset Ontology, **F-05 Reference & Master Data (baru)**, F-06 Product, F-07 KPI & Reference Data, F-08 Workflow Engine, F-09 Notification, F-10 Integration, F-11 Configuration Service, F-12 Work Master.
- **Perubahan:**
  1. **Modul baru F-05 — Reference & Master Data** (`05-reference-master-data.md`), diletakkan tepat setelah Asset Ontology (bukan di posisi F-01) karena ia pendamping/apendiks Asset Ontology — bukan prasyarat fondasional seperti Site Hierarchy. Dibangun dari ERD referensi (`operational-intelligence/research/erd-check.pdf`, bagian "CONFIG & MASTER DATA"). Isinya:
     - `DOWNTIME_REASON`, `DOWNTIME_REASON_EQUIPMENT`, `REJECT_REASON`, `REJECT_REASON_EQUIPMENT` — **dipindah verbatim** (bentuk field tidak diubah) dari `04-asset-ontology.md` §9.4, yang sekarang §9.4-nya diganti jadi cross-reference singkat ke modul baru ini, mengikuti pola cross-module lain di file itu.
     - `TIME_CONVERSIONS`, `UNIT_OF_MEASUREMENTS`, `PRODUCT_UOM_CONVERSIONS` — entitas baru, dikutip langsung dari ERD. Ini menutup `TBD` yang sebelumnya digantung antara `06-product.md` dan `11-configuration-service.md` soal rumah `TIME_CONVERSIONS`.
     - Dicatat sebagai `TBD` (bukan diputuskan sepihak): kemungkinan `UNIT_OF_MEASUREMENTS` di sini adalah tabel yang sama dengan `UOM` yang sudah diasumsikan ada di Work Master oleh `07-kpi-formula.md`/`11-configuration-service.md` (T-3); kemungkinan `PRODUCT_UOM_CONVERSIONS` di sini adalah entitas yang sama dengan `PRODUCT_UOM_CONVERSION` yang sudah disebut di `06-product.md` (T-4); field `time_conversions` yang bernama sama dengan entitasnya di ERD sumber (kemungkinan cacat diagram, dilaporkan apa adanya, tidak dikoreksi diam-diam).
  2. **Renumber total** untuk sampai ke urutan akhir di atas — header `# F-XX` di setiap file diperbarui, dan setiap link/referensi lintas-file (termasuk `00-foundation.md`, `README.md`, dan dua draft tak bernomor) diperbaiki ke nomor baru satu-per-satu per nama file (bukan replace angka polos, karena beberapa angka lama harus jadi angka baru yang berbeda-beda). Tabel indeks `README.md` disusun ulang total untuk 13 baris F-00–F-12, plus paragraf naratif riwayat renumbering di atasnya.
  3. **Bug pra-ada yang sekalian diperbaiki** (ditemukan saat verifikasi, bukan bagian dari kerja ini): `06-product.md` §"In short" menyebut modulnya sendiri "F-05" padahal headernya `# F-06` — diperbaiki jadi "F-06". `PRODUCTION/DOCS/oee-monitoring.md` (2 baris) merujuk `FOUNDATION/DOCS-EN/04-shift.md` — Shift tidak pernah `04-`; diperbaiki ke `02-shift.md`. Link eksternal ke `FOUNDATION/DOCS-EN/05-product.md` di `PRODUCTION/DOCS/work-schedule-draft.md` (nomor lama) diperbaiki ke `06-product.md`.
- **Alasan:** ERD referensi mengelompokkan `DOWNTIME_REASON`/`REJECT_REASON` dan tabel referensi unit/waktu sebagai satu klaster "CONFIG & MASTER DATA" yang terpisah dari klaster aset — mempertahankan keduanya di dalam `asset-ontology.md` akan mencampur taksonomi lintas-modul ke dalam modul yang seharusnya hanya soal aset. Modul baru diletakkan setelah Asset Ontology (bukan di F-01) karena ia pendamping Asset Ontology, bukan prasyarat fondasional. Modul baru ini juga menutup `TBD` lama (`TIME_CONVERSIONS`) sekaligus, alih-alih membiarkannya menggantung di dua file.
- **Dampak/verifikasi:**
  - Grep seluruh `FOUNDATION/DOCS-EN/*.md` untuk nama file lama = nihil (hanya tersisa di entri riwayat `CHANGELOG.md` yang memang mencatat kondisi pada saat itu, tidak diubah).
  - Semua link `[...](NN-file.md)` di `FOUNDATION/DOCS-EN/` diverifikasi resolve ke file yang benar-benar ada (skrip Python, 0 broken link).
  - `DOCS/01-glossary.md` **belum** diperbarui dengan istilah baru (`TIME_CONVERSIONS`, `UNIT_OF_MEASUREMENTS`, `PRODUCT_UOM_CONVERSIONS`) — di luar cakupan `DOCS-EN`, perlu tindak lanjut terpisah kalau istilah ini mulai dipakai PRD.
  - `FOUNDATION/AGENTS.md` §2 (indeks dokumen Indonesia) **tidak diubah** — hanya mendaftar `FOUNDATION/DOCS/`, bukan `DOCS-EN/`, dan modul baru ini belum punya sumber Indonesia.
  - `LOGS/handoff-2026-08-12-kpi-operating-time.md` masih menyebut nomor-nomor lama dari babak renumbering sebelumnya — **tidak disentuh**, log riwayat bertanggal, bukan dokumen hidup, sudah basi sejak sebelum sesi ini juga.
  - T-3 dan T-4 (kemungkinan duplikat `UOM`/`PRODUCT_UOM_CONVERSION` dengan Work Master dan Product) masih terbuka — perlu keputusan `foundation-domain` sebelum modul ini lolos draft.

---

## 2026-08-13 — Propagasi split `REASON_CODE` → `DOWNTIME_REASON`/`REJECT_REASON`, dan riset `TIME_CONVERSIONS`

- **Tipe:** propagasi rename + riset entitas baru (tidak ditambahkan)
- **Domain:** foundation-domain
- **File terdampak:** `PRODUCTION/DOCS/shopfloor.md`, `PRODUCTION/DOCS/oee-monitoring.md`, `FOUNDATION/DOCS/foundation.md`, `FOUNDATION/DOCS-EN/00-foundation.md`, `FOUNDATION/DOCS/kpi-formula.md`, `FOUNDATION/DOCS-EN/06-kpi-formula.md`, `FOUNDATION/DOCS-EN/work-unit-flow-draft.md`, `FOUNDATION/DOCS-EN/05-product.md`, `FOUNDATION/DOCS/configuration-service.md`, `FOUNDATION/DOCS-EN/10-configuration-service.md`, `AGENTS.md`, `DOCS/prd/PRD-001-molcadx-core-q3.md`, `DOCS/prd/PRD-001-molcadx-core-q3-en.md`
- **Perubahan:**
  1. **Propagasi split entitas** (`FOUNDATION/DOCS/asset-ontology.md` §9.4 dan `FOUNDATION/DOCS-EN/04-asset-ontology.md` §9.4 sudah lebih dulu memecah `REASON_CODE` tunggal menjadi `DOWNTIME_REASON`/`DOWNTIME_REASON_EQUIPMENT` dan `REJECT_REASON`/`REJECT_REASON_EQUIPMENT`, berdasarkan ERD referensi `operational-intelligence/research/erd-check.pdf` — sesi ini **tidak mengubah §9.4 itu sendiri**, hanya menyebarkan konsekuensinya ke file lain):
     - `shopfloor.md` §3.3/§7/§8 — `reason_code_id` → `downtime_reason_id`, referensi ke `REASON_CODE` diganti `DOWNTIME_REASON`; §3.4 ditambah catatan bahwa `QUALITY_DEFECT_CODE` **bukan** sinonim `REJECT_REASON` — relasi persisnya `TBD`.
     - `oee-monitoring.md` §2.1/§2.2/§4/§5 — `REASON_CODE.is_planned` diganti `DOWNTIME_REASON.downtime_category`; kategori rinci (`breakdown`/`changeover`/`material`/`operator`) di loss tree ditandai `TBD` karena ERD hanya punya 3 nilai kasar.
     - `foundation.md` & `00-foundation.md` — baris modul Asset Ontology di tabel indeks entitas diperbarui.
     - `kpi-formula.md` & `06-kpi-formula.md` §3.5/§9.5 — catatan penting: scoping reason code per aset yang sebelumnya jadi pertanyaan terbuka (K-2/K-3) **kemungkinan sudah terjawab** oleh `DOWNTIME_REASON_EQUIPMENT`/`REJECT_REASON_EQUIPMENT` yang sudah scoped per equipment instance di ERD baru — ditandai sebagai temuan, bukan keputusan final.
     - `work-unit-flow-draft.md` OEE-2 — dicatat sebagai dua lapis `TBD` (kategori "starved" + status kategori rinci itu sendiri).
     - `AGENTS.md` — contoh blok detail `US-PROD-OEE-003` diperbarui.
     - **`DOCS/prd/PRD-001-molcadx-core-q3.md`/`-en.md`** — rename field/entitas murni (mis. `Data & entitas`, event properties) diperbarui langsung. **`US-FND-AST-004`** dan **`US-PROD-SHF-004`** — dua user story yang logikanya (pohon kategori 2 level, `is_planned` per baris, `applies_to_asset_class_id` per class) melekat ke bentuk `REASON_CODE` lama — **tidak diubah**, hanya diberi catatan `TBD` tebal di atas tabelnya yang menandai perlu review `product-owner` sebelum dibangun.
  2. **Riset `TIME_CONVERSIONS`** (dari `erd-check.pdf`, bersama `unit_of_measurements`/`product_uom_conversions` sebagai konteks): dicek apakah cocok masuk Configuration Service — **keputusan: tidak ditambahkan**, karena tabel referensi flat (`code`/`name`) yang dirujuk sebagai FK punya bentuk yang sama dengan `UOM`, yang batasan modul ini sendiri (§3.2/`10-configuration-service.md` boundary rule) sudah menegaskan sebagai master data milik Work Master, bukan konfigurasi. FK konsumennya (`PRODUCT_WORK_UNIT.time_conversion_id`) ditemukan sudah ada di `FOUNDATION/DOCS-EN/05-product.md`, tapi tabel `TIME_CONVERSIONS` itu sendiri belum didefinisikan di sana — dicatat sebagai `TBD` milik `foundation-domain` (Product module vs Work Master), bukan diasumsikan. Field `time_conversions` yang bernama sama dengan entitasnya di ERD sumber dicatat sebagai kemungkinan cacat diagram, apa adanya.
- **Alasan:** dokumen di luar `asset-ontology.md` masih menyebut `REASON_CODE` tunggal setelah entitas itu dipecah — kalau tidak disebarkan, developer/designer akan membangun dari definisi yang sudah usang. `TIME_CONVERSIONS` diriset karena disebut di ERD yang sama, tapi ditolak masuk Configuration Service supaya batas modul (konfigurasi vs master data) yang sudah didokumentasikan tidak dilanggar diam-diam.
- **Dampak:**
  - Dua acceptance criteria PRD (`US-FND-AST-004`, `US-PROD-SHF-004`) berstatus **perlu review PO** sebelum dibangun — logikanya berasumsi bentuk `REASON_CODE` lama (kategori rinci 7 nilai, scoping per class) yang tidak lagi terkonfirmasi ada di taksonomi baru.
  - `kpi-formula.md` K-2/K-3 kemungkinan sudah terjawab oleh join table baru — `ops-domain`/`product-owner` perlu menegaskan sebelum ditutup resmi.
  - `TIME_CONVERSIONS` masih belum punya rumah definitif (Product module F-05 vs Work Master) — keputusan menunggu `foundation-domain` saat modul Product di-review.

---

## 2026-08-13 — FOUNDATION/DOCS-EN: putus ketergantungan `01-site-hierarchy.md`, `02-shift.md`, `03-yearly-quarterly-declaration.md` terhadap `../DOCS/`

- **Tipe:** merge konten + reword tautan (persiapan penghapusan `FOUNDATION/DOCS/`)
- **Domain:** foundation-domain
- **File terdampak:** `FOUNDATION/DOCS-EN/01-site-hierarchy.md`, `02-shift.md`, `03-yearly-quarterly-declaration.md`, `README.md`
- **Perubahan:**
  1. **`01-site-hierarchy.md`** — header diganti dari framing "reading aid, Indonesian original wins" menjadi "file ini basis, `../DOCS/site-hierarchy.md` dipensiunkan". Bagian "Not covered here" (yang tadinya melempar tabel field `SITE`/`WORK_CENTER`/`WORK_UNIT` ke `../DOCS/site-hierarchy.md#9`) diganti jadi seksi baru **"## 9. Entity specification"** berisi tabel field yang diterjemahkan langsung dari sumber Indonesia. Dua ketidaksesuaian ditandai `TBD`/superseded, bukan diterjemahkan mentah: field `default_shift_calendar_id` pada `SITE` (menunjuk modul Calendar yang sudah pensiun) dan field `current_asset_id` pada `WORK_UNIT` (sudah digantikan model histori `ASSET_PLACEMENT` di `04-asset-ontology.md §9.5`).
  2. **`02-shift.md`** — header diganti serupa. Tidak ada penerjemahan spec Indonesia karena sumbernya sendiri sudah ditandai stale (model 1-level lama, sebelum redesign 2-level Enterprise/Site Shift). Seksi **"## 9. Entity specification"** baru ditulis dari konsep yang sudah ada di file EN sendiri (`ENTERPRISE_SHIFT`, `SITE_SHIFT`, `SHIFT_INSTANCE`, `SHIFT_ASSIGNMENT`), dengan beberapa field ditandai `TBD` karena redesign menetapkan struktur tapi belum semua field (lokasi flag production/non-production, lokasi field istirahat, `crosses_midnight` tersimpan vs dihitung, nilai enum `status` yang pasti).
  3. **`03-yearly-quarterly-declaration.md`** — header direword; tidak ada konten yang perlu di-merge karena `FISCAL_YEAR` memang tidak pernah dimodelkan di `../DOCS/calendar.md` (modul itu hanya punya `SHIFT_CALENDAR`/`NON_WORKING_DAY`). Judul "Entity shape (EN-side design; not yet in the Indonesian source)" diganti jadi "## 9. Entity specification" dan catatan "not yet synced to `../DOCS/calendar.md`" dihapus dari TBD note.
  4. **`README.md`** — baris tabel F-01, F-02, F-03 di kolom "Indonesian source" diganti dari tautan `../DOCS/*.md` menjadi keterangan retired/tidak ada sumber. Catatan "Writing standard" (paragraf pembuka) diperbarui: entity spec sekarang ada inline di §9 masing-masing companion untuk modul yang sudah dimigrasi (F-01–F-04), modul lain masih merujuk `../DOCS/*.md`. Baris F-04 dan modul F-05–F-11 tidak disentuh (di luar cakupan sesi ini).
- **Alasan:** persiapan penghapusan `FOUNDATION/DOCS/` sepenuhnya — `DOCS-EN/` harus jadi basis mandiri, tidak boleh ada tautan kerja atau konten yang masih dilempar ke `../DOCS/`.
- **Dampak:**
  - Tidak menyentuh isi `FOUNDATION/DOCS/` maupun file `DOCS-EN` bernomor 04 ke atas (di luar cakupan sesi ini, 04 sudah dikerjakan sebelumnya).
  - Dua TBD baru harus dikonfirmasi PO/ops sebelum implementasi: (a) apakah `SITE` masih perlu field pengganti `default_shift_calendar_id`; (b) di entitas mana flag production/non-production shift dan field istirahat sebaiknya hidup.

---

## 2026-08-12 — PRD-001 disesuaikan ke ISO 24495-1 (Plain Language)

- **Tipe:** ubah
- **Domain:** product-owner
- **File terdampak:** `DOCS/prd/PRD-001-molcadx-core-q3.md`, `DOCS/prd/PRD-001-molcadx-core-q3-en.md`
- **Perubahan:**
  - Kedua versi PRD-001 kini mengikuti [ISO 24495-1](https://www.iso.org/standard/78907.html), memakai **empat aturan rumah yang sama** dengan companion `FOUNDATION/DOCS-EN/` yang dibuat di branch `feat/update-isa`: jawaban lebih dulu, mudah dipindai, kata sederhana & kalimat pendek, akhiri dengan langkah berikutnya.
  - **Prinsip 1 (relevan)** sudah terpenuhi sejak awal — dinyatakan, bukan diubah.
  - **Prinsip 2 (mudah ditemukan):** ditambah **§Ringkasan** (jawaban lebih dulu: satu angka penentu, 9 modul siap vs 4 terhalang, tiga risiko terbesar) dan **§Daftar isi** yang memetakan tiap bagian ke peran yang membutuhkannya. Sebelumnya dokumen 1.348 baris dengan 95 heading tidak punya pintu masuk sama sekali.
  - **Prinsip 3 (mudah dipahami):** isi berlabel yang tadinya menyatu dalam satu sel dipecah ke baris masing-masing (pemecahan otomatis menyisipkan 913 jeda baris di versi ID dan 917 di EN; sisa selisih `<br>` berasal dari label node mermaid). Bagian terpanjang tanpa jeda turun **1.414 → 657 karakter** (ID) dan **1.402 → 657** (EN); bagian di atas 400 karakter turun **209 → 44** (ID) dan **223 → 47** (EN). Ditambah **dua diagram mermaid**: rantai perhitungan OEE (§6.11) dan jalur kritis rilis (§9).
  - **Prinsip 4 (bisa dipakai):** ditambah **§13.2** berisi rencana evaluasi E-1…E-4. Uji kesiapan yang sudah ada di `AGENTS.md` §4 dipetakan ke klausa 5.4.3 — repo ini sudah punya ujinya, hanya belum dibingkai sebagai kepatuhan.
  - Ditambah **§13** (dasar kepatuhan + status per prinsip) dan **§14** (yang harus dilakukan berikutnya, diurutkan dari yang paling banyak membuka pekerjaan).
  - **Bug rendering diperbaiki:** karakter `|` di dalam notasi himpunan `{user | ∃ ROLE_ASSIGNMENT(...)}` pada `US-FND-NTF-001` memecah kolom tabel sejak PRD pertama kali ditulis. Kini di-escape jadi `\|`.
- **Alasan:** diminta PO.
- **Cara verifikasi:**
  - Setiap penyisipan jeda baris dijalankan lewat skrip yang **membandingkan aliran kata sebelum & sesudah** dan membatalkan perubahan kalau ada satu kata pun berubah. Penjaga ini sempat menangkap satu bug nyata (regex yang menelan tanda titik) sebelum file tersentuh.
  - Kedua diagram mermaid **benar-benar dirender** (mermaid-cli) untuk memastikan sintaksnya sah, bukan diasumsikan.
  - 196 tautan anchor internal di kedua file resolve; 0 tabel dengan jumlah kolom tidak konsisten.
- **Dampak:**
  - **Prinsip 4 belum terpenuhi dan tidak bisa dipenuhi dengan menyunting teks.** Klausa 5.4.3 mensyaratkan evaluasi bersama pembaca nyata; PRD ini belum pernah dibaca satu designer atau developer pun karena domainnya belum ada ([Q-08](https://github.com/molca-id/prd-molcadx/blob/main/PRD-001-molcadx-core-q3.md#11-open-questions)). Status ditulis 🔴 di §13.1, bukan diklaim patuh.
  - **44/47 bagian panjang masih tersisa**, hampir semuanya sel kalkulasi yang padat rumus. Memecahnya lebih jauh akan mengorbankan ketepatan yang justru dibutuhkan developer.
  - **Akar masalahnya ada di template, bukan di PRD ini.** `03-prd-standard` §3.1 dan `AGENTS.md` §4 mewajibkan blok detail 8 bagian di dalam sel tabel — isi komprehensif + tata letak tabel menghasilkan dinding teks. PRD berikutnya akan mengulang pola yang sama. Memperbaikinya berarti mengubah template, dan itu **belum dilakukan** karena mengubah format rumah yang diikuti semua agent.
- **Pertanyaan terbuka baru:** (1) apakah `03-prd-standard` + `templates/prd-template.md` ikut disesuaikan ke ISO 24495-1, agar PRD berikutnya tidak kembali padat? (2) konvensi penamaan file Inggris belum seragam — PRD memakai sufiks `-en.md` di folder yang sama, sedangkan FOUNDATION memakai folder `DOCS-EN/`. Penanggung jawab: PO.

---

## 2026-08-12 — FOUNDATION/DOCS-EN: Asset Ontology dipindah ke posisi F-04 (setelah Shift dan Yearly & Quarterly Declaration)

- **Tipe:** urut ulang
- **Domain:** foundation-domain
- **File terdampak:** `FOUNDATION/DOCS-EN/`: `02-asset-ontology.md` → `04-asset-ontology.md`; `03-shift.md` → `02-shift.md`; `04-yearly-quarterly-declaration.md` → `03-yearly-quarterly-declaration.md`; `00-foundation.md`; `README.md`; `01-site-hierarchy.md`; `06-kpi-formula.md`; `07-workflow-engine.md`; `10-configuration-service.md`
- **Perubahan:**
  1. **Urutan baca berubah** dari Site Hierarchy → Asset Ontology → Shift → Yearly & Quarterly Declaration menjadi **Site Hierarchy → Shift → Yearly & Quarterly Declaration → Asset Ontology** — `05-product.md` sampai `11-work-master.md` **tidak berubah nomor** (Product tetap F-05, sudah lebih besar dari posisi baru Asset Ontology F-04, jadi tidak ada geseran lanjutan).
  2. Header `# F-XX` di ketiga file yang dipindah diperbarui (F-02 Shift, F-03 Yearly & Quarterly Declaration, F-04 Asset Ontology), beserta seluruh tautan silang lokal yang merujuk nama/nomor file lama (`00-foundation.md`, `README.md`, `01-site-hierarchy.md`, `03-yearly-quarterly-declaration.md`, `06-kpi-formula.md`, `07-workflow-engine.md`, `10-configuration-service.md`).
  3. Paragraf "urutan baca" dan tabel peta modul di `00-foundation.md`, serta tabel indeks `README.md`, diperbarui untuk menjelaskan alasan pemindahan.
  4. `git mv` dipakai lewat nama sementara (`tmp-asset-ontology.md`) untuk menghindari tabrakan nama saat pertukaran 3 arah, sehingga riwayat file tetap menempel.
- **Alasan:** permintaan langsung Product Owner — "I don't have any idea about how asset will be declared yet." Asset Ontology saat ini adalah modul yang paling belum settled, jadi memakai logika yang sama dengan yang sudah membuat Work Master dibaca paling akhir: modul yang belum settled dibaca belakangan, bukan lebih dulu.
- **Dampak:**
  - **Sudah dicek — tidak ada ketergantungan mundur yang pecah.** `02-shift.md` dan `03-yearly-quarterly-declaration.md` tidak mereferensikan entitas Asset Ontology (`ASSET`, `ASSET_CLASS`, `ASSET_PLACEMENT`, `ASSET_STATE_LOG`, `REASON_CODE`) sebagai sesuatu yang perlu dijelaskan lebih dulu — satu-satunya kemunculan `ASSET_STATE_LOG` di `02-shift.md` cuma daftar konsumen hilir (`SHIFT_INSTANCE → referenced by ... ASSET_STATE_LOG`), bukan forward-reference yang butuh Asset Ontology dijelaskan dulu.
  - `EQUIPMENT_PRODUCT_CODE` di `05-product.md` (FK ke `ASSET`) tetap berada setelah Asset Ontology (F-04 < F-05) — tidak ada masalah urutan.
  - `../DOCS/` (Indonesia) tidak disentuh — folder itu masih memakai nomor modul lama (lihat catatan "EN-first" di entri-entri sebelumnya) dan belum disinkronkan.

---

## 2026-08-12 — FOUNDATION/DOCS-EN: pensiunkan modul Calendar, pisah jadi Shift 2-level + Yearly & Quarterly Declaration; PRODUCTION: perbaiki oee-monitoring.md, draft Work Schedule

> **Menggantikan entri "perbaiki `scheduled_minutes`" di bawah** — perbaikan itu ternyata masih salah tempat (lihat Alasan). Entri lama dibiarkan untuk jejak, tidak dihapus.

- **Tipe:** hapus + pisah + tambah + koreksi (lintas domain, dikerjakan 2 sub-agent paralel: `foundation-domain` dan `production-domain`)
- **Domain:** foundation-domain, production-domain
- **File terdampak:**
  - `FOUNDATION/DOCS-EN/`: `04-shift.md` → `03-shift.md` (ditulis ulang total); `03-calendar.md` → `04-yearly-quarterly-declaration.md` (ditulis ulang dari bagian fiscal year saja); `00-foundation.md`; `README.md`; `07-workflow-engine.md` (satu analogi basi diperbaiki)
  - `PRODUCTION/DOCS/oee-monitoring.md` (diperbaiki); `PRODUCTION/DOCS/work-schedule-draft.md` (**baru**, draft opsi belum final); `PRODUCTION/AGENTS.md` (indeks draft ditambahkan)
- **Perubahan:**
  1. **Modul Calendar dipensiunkan sepenuhnya.** Keputusan PO: konsep "kalender hari libur" (`NON_WORKING_DAY`, `SHIFT_CALENDAR`) tidak dipakai — daftar pengecualian (libur) berbeda-beda per enterprise/tenant/site dan belum ada cara pasti untuk mendeklarasikannya. Sebagai gantinya: **Work Schedule** — deklarasi positif kapan produksi benar-benar direncanakan (tidak ada entri = tidak terjadi, defaultnya dibalik dari "selalu kerja, kecuali libur" menjadi "tidak pernah kerja, kecuali dijadwalkan"). Work Schedule adalah milik `production-domain`, **belum didesain final** — lihat `PRODUCTION/DOCS/work-schedule-draft.md`.
  2. **Bagian fiscal year dari Calendar bertahan sendiri** sebagai modul baru **Yearly & Quarterly Declaration** (`04-yearly-quarterly-declaration.md`) — murni deklarasi jendela tahun/kuartal (`FISCAL_YEAR`), tidak berubah isinya, hanya dipisah dari konsep hari kerja/libur yang sudah dipensiunkan.
  3. **Shift dirombak jadi 2 level**, mengganti `SHIFT_DEFINITION`/`SHIFT_PATTERN` lama:
     - **Enterprise Shift** — identitas saja ("Shift 1, Shift 2, Shift 3"), tanpa jam.
     - **Site Shift** — tiap site memilih shift enterprise mana yang dipakai dan mendeklarasikan jam aslinya sendiri (start, durasi, istirahat) — label sama bisa beda jam antar site.
     - **Rotasi/pola dihapus total.** Tidak ada "shift mana jalan hari apa" — semua shift yang dideklarasikan sebuah site terjadi di **setiap** hari kerja, kumulatif.
  4. **`scheduled_minutes` tidak lagi didefinisikan rumusnya di modul Shift/Calendar sama sekali** — baik versi lama (dikurangi planned downtime) maupun versi "koreksi" sebelumnya (tidak dikurangi). Field ini disebut ada di `SHIFT_INSTANCE`, tapi rumusnya sengaja **tidak** dideklarasikan di sini — itu keputusan kalkulasi KPI, bukan deklarasi struktur, dan sekarang menjadi tanggung jawab `production-domain`/KPI, bukan FOUNDATION.
  5. `PRODUCTION/DOCS/oee-monitoring.md` diperbaiki mengikuti keputusan ini: `waktu_terjadwal` = durasi shift − istirahat saja (tanpa potongan planned downtime); Availability tetap hanya digerakkan oleh unplanned downtime. **Belum diputuskan** (diajukan sebagai proposal, perlu persetujuan PO): metrik baru **Utilization** = `(waktu_terjadwal − Σ planned downtime) / waktu_terjadwal`, berdampingan dengan Availability/Performance/Quality — dicatat sebagai **OEE-8**. **OEE-9**: `DOCS/04-metrics-framework.md` §5 masih pakai asumsi lama dan belum diperbaiki (pemilik PO, di luar wewenang production-domain untuk mengubah sendiri).
- **Alasan:** PO menunjukkan entri sebelumnya (koreksi `scheduled_minutes`) masih salah tempat — Calendar/Shift seharusnya hanya *mendeklarasikan* struktur (jam, hari, pola), bukan *menghitung* (rumus KPI). Menaruh rumus `scheduled_minutes` di modul deklarasi mencampur dua lapisan yang PO ingin dipisah tegas.
- **Dampak:**
  - **EN-first** — hanya `FOUNDATION/DOCS-EN/` dan `PRODUCTION/DOCS/`. `../DOCS/shift.md` dan `../DOCS/calendar.md` (Indonesia) **belum** disinkronkan dan masih memakai model lama (`SHIFT_PATTERN`, kalender libur) — ditandai basi di file EN masing-masing.
  - **Belum diselesaikan:** desain Work Schedule (opsi A1-A3 granularitas entri, opsi B1-B3 hubungan ke `SHIFT_INSTANCE` — lihat draft); mekanisme generate `SHIFT_INSTANCE` (bergantung pada Work Schedule); persetujuan PO untuk metrik Utilization (OEE-8); perbaikan `04-metrics-framework.md` (OEE-9); konfirmasi mode fiscal year (`Y-1`, sebelumnya `TBD` di Calendar lama).
- **Konfirmasi PO:** seluruh restrukturisasi ini datang langsung dari percakapan dengan PO (bukan inisiatif domain agent), termasuk keputusan eksplisit untuk tidak mendesain Work Schedule/hari libur sekarang.

**Susulan (percakapan lanjutan PO langsung ke agent `foundation-domain`, sesi sama):**
1. Penjelasan konsep Work Schedule di file FOUNDATION-EN dipangkas jadi satu kalimat batas cakupan ("tanggal produksi jalan adalah urusan `production-domain`, di luar FOUNDATION") — sebelumnya ada ~15 baris penjelasan model "deklarasi positif" yang PO nilai tidak perlu diketahui FOUNDATION sama sekali. File: `03-shift.md`, `00-foundation.md`, `04-yearly-quarterly-declaration.md`, `README.md`.
2. **Site Shift hanya mendeklarasikan start time & end time — field istirahat (break) dihapus** dari deklarasi ini. Alasan: durasi istirahat berbeda-beda per area/line, tidak pas jadi satu field di level Site Shift. Ditambahkan open question baru **H-2**: di mana/bagaimana istirahat sebenarnya dilacak — belum dijawab, untuk Operations/production-domain.
3. **H-4 ditutup:** PO mengonfirmasi `business_date` = tanggal mulai shift **sesuai** praktik pelaporan Molca yang sebenarnya. Dicatat di `03-shift.md` (H-4 dicoret, bukan dihapus, agar jejaknya tetap terlihat) dan baris H-4 dibuang dari tabel open-question `00-foundation.md`. **Belum diselesaikan:** ini menutup risiko **R-02** di `DOCS/prd/PRD-001-molcadx-core-q3.md` (baris ~1299, "`business_date` = tanggal mulai shift ternyata tidak cocok praktik lapangan") — PRD **belum diperbarui**, itu wewenang `product-owner`, bukan `foundation-domain`.
4. **Koreksi: adopsi Site Shift wajib, bukan opsional.** Sebelumnya ditulis tiap site "memilih" shift enterprise mana yang dipakai (subset opsional) — PO mengoreksi: **setiap site wajib punya baris `SITE_SHIFT` untuk setiap `ENTERPRISE_SHIFT`** yang ada. Yang boleh berbeda per site hanyalah jam aslinya (start/end time), bukan ada-tidaknya shift itu di site tsb. Diperbaiki di `03-shift.md` (§1, diagram ER, pitfall baru #8) dan `00-foundation.md` (diagram ER).
5. **Kutipan PRD-001 (R-02) di `03-shift.md` diparafrase ke Inggris**, sebelumnya dikutip verbatim dalam Bahasa Indonesia (kutipan langsung dari PRD, bukan pilihan bahasa sengaja). Satu sisa teks Indonesia yang dibiarkan: tag `TBD — perlu konfirmasi PO/Ops` di `04-yearly-quarterly-declaration.md` — ini format tag baku dari `AGENTS.md`, bukan prosa, jadi tidak diterjemahkan. **Belum diputuskan:** apakah tag ini perlu versi Inggris untuk dokumen EN-first ke depannya.
6. **`scheduled_minutes` dihapus total dari deklarasi Shift** — sebelumnya (entri di atas, poin 4 sesi ini) field-nya masih disebut "ada di `SHIFT_INSTANCE`, tapi rumusnya di luar cakupan"; sekarang Shift **tidak mendeklarasikan field ini sama sekali**. Shift hanya mendeklarasikan struktur (start/end time, label, site) — nilai scheduled-time untuk Availability sepenuhnya diserahkan ke lapisan KPI/`production-domain`, termasuk apakah field itu bahkan bernama `scheduled_minutes` atau tidak.
7. **Koreksi atribusi open question: berhenti melabeli `production-domain` sebagai pemilik pertanyaan yang sebenarnya belum ada yang punya.** PO menunjukkan beberapa open question ditulis seolah `production-domain` sudah pasti akan menjawabnya, padahal itu belum tentu benar — statusnya genuinely "belum ada yang tahu," bukan "sudah dilempar ke domain lain." Diubah jadi **Unknown**: H-2 (lokasi tracking istirahat), H-6 (mekanisme generate `SHIFT_INSTANCE`), H-7 (di mana nilai scheduled-time hidup). Dibiarkan tidak berubah: batas cakupan bahwa Calendar/Work Schedule di luar tanggung jawab pemodelan FOUNDATION — itu keputusan PO sendiri di sesi ini, bukan klaim soal siapa yang akan menjawab.

---

## 2026-08-12 — FOUNDATION/DOCS-EN: perbaiki `scheduled_minutes` agar tidak lagi memotong planned downtime

- **Tipe:** koreksi
- **Domain:** foundation-domain
- **File terdampak:** `FOUNDATION/DOCS-EN/03-calendar.md`, `FOUNDATION/DOCS-EN/04-shift.md`, `LOGS/CHANGELOG.md`
- **Perubahan:** menutup **Q1** dari `LOGS/handoff-2026-08-12-kpi-operating-time.md`. `scheduled_minutes` sekarang **hanya** `shift duration − break` — tidak lagi dikurangi planned downtime. `calendar.md` juga diperjelas: hari libur/shutdown penuh tetap mengurangi scheduled time (tidak ada shift instance yang dibuat), tapi jendela maintenance terencana **di dalam** shift yang berjalan tetap masuk `scheduled_minutes` dan muncul sebagai loss Utilization, bukan hilang dari penyebut.
- **Alasan:** dokumen sebelumnya (draft lama) memotong planned downtime dari `scheduled_minutes`, yang bertentangan dengan keputusan yang sudah dicatat di handoff yang sama: "Availability is reduced only by unplanned downtime... Planned maintenance lowers utilization, not availability." Kalau planned downtime sudah hilang dari penyebut sejak awal, ia tidak pernah terlihat sebagai loss apa pun — bukan Availability, bukan Utilization.
- **Dampak — belum diselesaikan:** `PRODUCTION/DOCS/oee-monitoring.md` §2.1 (catatan `waktu_terjadwal` = "sudah dikurangi istirahat & downtime terencana") dan §2.2 aturan 2 masih memakai rumus lama dan **belum diperbarui** — ini dokumen Indonesia milik `production-domain`, di luar cakupan sesi EN-first ini. `production-domain` perlu: (1) memperbarui `waktu_terjadwal`/`waktu_operasi` agar konsisten, (2) memutuskan di mana dan bagaimana Utilization dihitung sebagai metrik terpisah dari Availability.
- **Konfirmasi PO:** perbaikan dilakukan atas permintaan PO langsung via percakapan, menutup Q1 sebelum lanjut ke modul Product.

---

## 2026-08-12 — FOUNDATION/DOCS-EN: tambah modul Product (F-05), penomoran ulang F-06..F-11, koreksi sumber cycle time

- **Tipe:** tambah + urut ulang + koreksi
- **Domain:** foundation-domain
- **File terdampak:** `FOUNDATION/DOCS-EN/05-product.md` (**baru**); `06-kpi-formula.md` (dulu `05-kpi-formula.md`); `07-workflow-engine.md` (dulu `06-workflow-engine.md`); `08-notification.md` (dulu `07-notification.md`); `09-integration.md` (dulu `08-integration.md`); `10-configuration-service.md` (dulu `09-configuration-service.md`); `11-work-master.md` (dulu `10-work-master.md`); `README.md`; `00-foundation.md`; `tag-declaration-draft.md`; `LOGS/CHANGELOG.md`
- **Perubahan:**
  1. **Modul Product baru ditambahkan di posisi F-05**, sebelum KPI & Reference Data — keputusan PO: Product harus "fixed" (didefinisikan) sebelum KPI operating-time bisa dihitung, karena formulanya membaca cycle time dari modul ini. Sumber: ERD `erd-check.pdf` (dibaca dari canvas `iec-ios.tldraw` milik proyek sister `operational-intelligence`, halaman "ERD — Config & Master Data"). Entitas: `PRODUCT`, `PRODUCT_DETAIL`, `PRODUCT_WORK_CENTER`, `PRODUCT_ROUTE_OVERRIDE`, `PRODUCT_WORK_UNIT`, `PRODUCT_CYCLE`, `PRODUCT_UOM_CONVERSION`, `EQUIPMENT_PRODUCT_CODE`. Belum ada padanan Indonesia — `foundation-domain` perlu meninjau sebelum ditulis ke `../DOCS/`.
  2. **Penomoran ulang EN:** F-01 Site Hierarchy · F-02 Asset Ontology · F-03 Calendar · F-04 Shift · F-05 Product · F-06 KPI & Reference Data · F-07 Workflow Engine · F-08 Notification · F-09 Integration · F-10 Configuration Service · F-11 Work Master. Work Master tetap di posisi terakhir (keputusan PO: dipisah dari Product, tetap menyimpan cakupannya sendiri).
  3. **Koreksi sumber cycle time:** draft sebelumnya (`tag-declaration-draft.md` keputusan #8, dan handoff KPI operating-time) menyebut `OPERATION.standard_cycle_time` sebagai sumber multiplier konversi sensor-count→jam. ERD produk yang sebenarnya **tidak punya entitas `OPERATION`** — cycle time adalah atribut relasi `PRODUCT`×`WORK_UNIT` (`PRODUCT_WORK_UNIT.cycle_time_value`), bukan `PRODUCT`×`OPERATION`. Referensi diperbaiki di kedua tempat.
  4. Header `# F-XX`, tautan silang lokal, tabel peta modul (`00-foundation.md`), urutan baca, dan indeks `README.md` diperbarui agar konsisten.
- **Alasan:** dependensi data nyata — formula KPI operating-time (`sensor_count × cycle_time`) tidak bisa diverifikasi tanpa model Product ada lebih dulu; entitas `OPERATION` yang dirujuk sebelumnya ternyata tidak pernah dimodelkan di ERD produk asli.
- **Dampak:**
  - **EN-first** — hanya `FOUNDATION/DOCS-EN/`. `../DOCS/`, PRD, dan goalsQ3 belum disinkronkan dan masih pakai penomoran lama (lihat entri 2026-08-12 di bawah).
  - **Belum diselesaikan:** hubungan `PRODUCT_ROUTE_OVERRIDE` (routing Product) dengan `ROUTING`/`OPERATION` milik Work Master (F-11) — apakah konsep yang sama atau berbeda. Dicatat sebagai open question P-1 di `05-product.md`.
- **Konfirmasi PO:** posisi F-05 dan pemisahan dari Work Master dipilih PO langsung via percakapan.

---

## 2026-08-12 — FOUNDATION/DOCS-EN: hapus modul Organization, pindahkan Work Master ke posisi terakhir, penomoran ulang

- **Tipe:** hapus + urut ulang + ubah
- **Domain:** foundation-domain
- **File terdampak:** seluruh `FOUNDATION/DOCS-EN/`: `02-organization.md` **dihapus**; `04-work-master.md` → `10-work-master.md`; `03-asset-ontology.md` → `02-asset-ontology.md`; `05-calendar.md` → `03-calendar.md`; `06-shift.md` → `04-shift.md`; `07-kpi-formula.md` → `05-kpi-formula.md`; `08-workflow-engine.md` → `06-workflow-engine.md`; `09-notification.md` → `07-notification.md`; `10-integration.md` → `08-integration.md`; `11-configuration-service.md` → `09-configuration-service.md`; `README.md`; `00-foundation.md`; `04-shift.md`; `LOGS/CHANGELOG.md`
- **Perubahan:**
  1. **Modul Organization dihapus** (keputusan PO 2026-08-12) — pengguna, akun, peran, dan crew tidak lagi dimodelkan di MolcaDx karena auth & peran dipindah ke **SSO/Keycloak** (IDP). Semua entitasnya (`ORG_UNIT`, `EMPLOYEE`, `USER_ACCOUNT`, `ROLE`, `ROLE_ASSIGNMENT`, `CREW`) dihapus dari peta, diagram entitas, daftar effective-dating, dan tabel open question. Referensi crew/employee di `shift.md` diarahkan ke identitas eksternal via SSO.
  2. **Work Master dipindah ke posisi terakhir** (`F-10`), setelah Workflow Engine — keputusan PO agar modul yang paling baru/belum stabil jadi paling akhir dibaca.
  3. **Penomoran ulang EN:** F-01 Site Hierarchy · F-02 Asset Ontology · F-03 Calendar · F-04 Shift · F-05 KPI & Reference Data · F-06 Workflow Engine · F-07 Notification · F-08 Integration · F-09 Configuration Service · F-10 Work Master.
  4. Header `# F-XX` tiap file, tautan silang lokal, tabel peta modul (`00-foundation.md`), urutan baca, dan indeks `README.md` diperbarui agar konsisten. Ditambahkan baris KPI & Reference Data yang sebelumnya tidak ada di peta.
- **Alasan:** SSO/Keycloak menggantikan kebutuhan user/role lokal; Work Master belum stabil sehingga sengaja dipindah ke akhir urutan baca.
- **Dampak:**
  - **EN-first** — hanya `FOUNDATION/DOCS-EN/`. Versi Indonesia (`../DOCS/`) dan `FOUNDATION/AGENTS.md` **belum** disinkronkan, dan PRD/goalsQ3 masih memakai penomoran F-ID lama (mis. F-04 = Site Hierarchy). Perlu lintas-sinkronisasi nanti.
  - **Pengguna/peran/crew dihapus dari model** — konsekuensi disepakati PO (tidak ada akuntabilitas per orang, tidak ada penugasan shift per crew di sisi MolcaDx; identitas datang dari IDP).
- **Konfirmasi PO:** keputusan hapus menyeluruh entitas people-related sudah dipilih PO via percakapan. Istilah & ID modul baru perlu disinkronkan ke `../DOCS/` dan glossary bila diinginkan.

---

## 2026-08-12 — FOUNDATION/DOCS-EN: tambah `FISCAL_YEAR` (jendela laporan tahunan) di modul Calendar

- **Tipe:** ubah + tambah
- **Domain:** foundation-domain
- **File terdampak:** `FOUNDATION/DOCS-EN/05-calendar.md`, `FOUNDATION/DOCS-EN/00-foundation.md`, `LOGS/CHANGELOG.md`
- **Perubahan:**
  - Ditambahkan konsep `FISCAL_YEAR` di `05-calendar.md`: jendela tahunan untuk mengelompokkan angka laporan. **Bukan** daftar hari libur dan **bukan** jam shift — hanya "dari kapan sampai kapan" satu tahun bisnis berjalan. Dimiliki di level enterprise (jarang di-override site).
  - **Mode switch** `calendar_basis`: `monthly` (dari bulan ke bulan; tanggal turunan = awal bulan → akhir bulan) atau `weekly_iso` (jendela dipilih per tanggal, lalu pola kuartal dipilih).
  - **Aturan bersyarat:** `period_pattern` (`4-5-4` / `4-4-5` / `5-4-4`) **wajib jika dan hanya jika** `calendar_basis = weekly_iso`; ketika `monthly`, field disembunyikan dan tidak dipakai.
  - Diperbarui daftar entitas modul Calendar di tabel peta `00-foundation.md` (tambah `FISCAL_YEAR`).
  - Ditandai `TBD — perlu konfirmasi PO/Ops`: pastikan tahun fiskal Molca sejajar bulan (bukan kalender mingguan 52/53) sebelum `monthly` jadi default.
- **Alasan:** keputusan desain PO (percakapan 2026-08-12) — tahun fiskal adalah entitas nyata, dilengkapi pilihan mode bulanan vs mingguan-ISO dengan pola kuartal bersyarat.
- **Dampak:** konsep + entitas baru; **belum** disinkronkan ke `FOUNDATION/DOCS/` versi Indonesia (EN-first), dan istilah `FISCAL_YEAR` belum masuk `DOCS/01-glossary.md`.

---

## 2026-08-12 — FOUNDATION/DOCS-EN: tambah konsep `TENANT` sebagai lapisan kepemilikan (ownership layer)

- **Tipe:** ubah
- **Domain:** foundation-domain
- **File terdampak:** `FOUNDATION/DOCS-EN/00-foundation.md`, `FOUNDATION/DOCS-EN/01-site-hierarchy.md`, `FOUNDATION/DOCS-EN/11-configuration-service.md`
- **Perubahan:**
  - Ditambahkan `TENANT` sebagai **ownership/isolation layer** di atas Enterprise — satu tenant = satu pelanggan (multi-tenant SaaS).
  - **Bukan level di hierarki ISA-95/IEC 62264** — standar itu hanya memodelkan plant fisik. Level ISA-95 tetap mulai dari Enterprise; tenant adalah batas kepemilikan di atasnya.
  - Diperbarui diagram koneksi entitas & tabel level ISA-95 (`site-hierarchy.md`), prinsip bersama & tabel modul (`foundation.md`), dan rantai layering Configuration Service menjadi `product default → tenant → enterprise → site → area → work center → user`.
  - Memperbaiki urutan baca yang usang di "Next step" (`00-foundation.md`) menjadi `Site Hierarchy → Organization → Asset Ontology → Work Master → Calendar → Shift` — sebelumnya masih menulis urutan lama (Asset Ontology di depan) yang bertentangan dengan penomoran F-ID dan arah dependensi (`ASSET_PLACEMENT → WORK_UNIT` membutuhkan Site Hierarchy lebih dulu).
- **Alasan:** keputusan desain PO (percakapan 2026-08-12) untuk mendukung multi-tenancy tanpa merusak klaim konformansi ISA-95.
- **Dampak:** konsep baru di level atas; tidak mengubah kardinalitas level fisik. **Belum** disinkronkan ke `FOUNDATION/DOCS/` (versi Indonesia) — sengaja ditahan di sisi DOCS-EN dulu.
- **Konfirmasi PO:** entitas `TENANT` belum dimodelkan formal; menunggu keputusan `foundation-domain` soal penamaan & kepemilikan entitas.

---

## 2026-08-07 — PRD-001 diterjemahkan ke bahasa Inggris

- **Tipe:** tambah + ubah
- **Domain:** product-owner
- **File terdampak:** `DOCS/prd/PRD-001-molcadx-core-q3-en.md` (baru), `AGENTS.md`
- **Perubahan:**
  - Terjemahan penuh PRD-001 ke bahasa Inggris, 1.362 baris, **49 user story** lengkap dengan blok detail 8 bagian, §7 lintas story, §8 instrumentasi, §9 rilis, §10 risiko, §11 open question, §12 decision log.
  - **Pengenal sengaja tidak diterjemahkan:** nama entitas (`SHIFT_INSTANCE`), nama field (`scheduled_minutes`), nama event (`output_recorded`), ID user story (`US-FND-SIT-001`), dan nama metrik (`waktu_catat_output`). Menerjemahkannya akan memecah pengenal antara dua dokumen dan memutus rujukan silang ke dokumen domain yang dipakai developer. Nama metrik berbahasa Indonesia diberi *gloss* Inggris di dalam tanda kurung pada tiap kemunculannya.
  - Tautan ke dokumen domain tetap menunjuk file berbahasa Indonesia — dokumen domain **tidak** diterjemahkan.
  - Diverifikasi dengan skrip: 49 ID user story **identik** dengan versi Indonesia, 149 tautan anchor internal semuanya resolve, dan seluruh tautan file relatif menunjuk file yang benar-benar ada.
- **Alasan:** diminta PO.
- **Dampak:**
  - **Versi Indonesia tetap menjadi sumber kebenaran** — dinyatakan di header terjemahan; kalau keduanya berbeda, versi Indonesia yang menang.
  - Konsekuensinya: **setiap perubahan PRD ke depan harus dilakukan di dua file.** Kalau ini terasa mahal, PO perlu memutuskan satu bahasa sebagai kanonik — lihat pertanyaan terbuka di bawah.
  - Belum ada versi PDF untuk terjemahan ini (PO meminta `.md` saja).
- **Pertanyaan terbuka baru:** bahasa mana yang kanonik untuk PRD berikutnya? Memelihara dua versi penuh secara manual akan menyimpang begitu satu sisi diperbarui dan sisi lain tidak. Penanggung jawab: PO.

---

## 2026-08-11 — FOUNDATION: susun ulang urutan baca modul, luruskan klaim Asset Ontology, tambah modul KPI & Reference Data (F-07)

- **Tipe:** ubah + tambah
- **Domain:** foundation-domain
- **File terdampak:** seluruh `# F-XX` header di `FOUNDATION/DOCS/*.md` dan `FOUNDATION/DOCS-EN/*.md`; `FOUNDATION/AGENTS.md` §2; `FOUNDATION/DOCS/foundation.md` §2 & §3; `FOUNDATION/DOCS-EN/README.md`; `FOUNDATION/DOCS/workflow-engine.md` (satu referensi silang); `FOUNDATION/DOCS/kpi-formula.md` (baru, sebelumnya file 0 byte); `FOUNDATION/DOCS-EN/kpi-formula.md` (baru); `FOUNDATION/DOCS/asset-ontology.md` §8; `FOUNDATION/DOCS-EN/asset-ontology.md` (ringkasan "In short")
- **Perubahan:**
  1. **Perbaikan klaim keliru** — `asset-ontology.md` §8 (dan companion EN-nya) sebelumnya menyatakan Asset Ontology "adalah fondasi paling hulu" yang menjadi dasar Site Hierarchy. Ini terbalik: relasi `ASSET_PLACEMENT → WORK_UNIT` (§9.5) berarti Asset Ontology **bergantung pada** Site Hierarchy (butuh `WORK_UNIT` sudah ada), bukan sebaliknya. Kalimat diperbaiki di kedua bahasa.
  2. **Urutan baca FOUNDATION disusun ulang** mengikuti urutan build-up standar (enterprise → site → area → work center → work unit, lalu equipment, lalu business config) — hasil pembanding dengan ERD produk sibling (referensi, bukan sumber kebenaran untuk MolcaDx) dan disepakati Product Owner + user:
     - F-01 Site Hierarchy (dulu F-04), F-02 Organization (dulu F-03), F-03 Asset Ontology (dulu F-01), F-04 Work Master (dulu F-02), F-05 Calendar (tetap), F-06 Shift (tetap), **F-07 KPI & Reference Data (baru)**, F-08 Workflow Engine (dulu F-07), F-09 Notification (dulu F-08), F-10 Integration (dulu F-09), F-11 Configuration Service (dulu F-10). F-00 (peta) tidak berubah.
     - Semua header `# F-XX` di `FOUNDATION/DOCS/` dan `FOUNDATION/DOCS-EN/` diperbarui; tabel modul di `FOUNDATION/AGENTS.md` §2, `FOUNDATION/DOCS/foundation.md` §2, dan `FOUNDATION/DOCS-EN/README.md` disusun ulang sesuai urutan baru; satu referensi silang di `workflow-engine.md` ("Integration (F-09)") diperbaiki jadi "(F-10)".
  3. **Modul baru F-07 — KPI & Reference Data** ditulis penuh (`kpi-formula.md` sebelumnya kosong): entitas `KPI_INDEX` (metrik bernama), `KPI_PARAMETERS` (elemen data mentah), `KPI_FORMULA` (pemetaan metrik ↔ parameter, `is_required`, tautan ke `WORK_UNIT_TAG`). Modul ini secara eksplisit **tidak** mendefinisikan ulang rumus arithmetic (tetap milik `product-owner` di `04-metrics-framework.md`), `UOM` (tetap milik `work-master.md`), atau `REASON_CODE` (tetap milik `asset-ontology.md` §9.4) — hanya mereferensikan. Companion Bahasa Inggris ditulis mengikuti gaya ISO 24495-1 yang sudah dipakai `DOCS-EN/`.
  4. `foundation.md` §3 (ERD mermaid) ditambah relasi `KPI_INDEX ||--o{ KPI_FORMULA`, `KPI_FORMULA }o--|| KPI_PARAMETERS`, `KPI_FORMULA }o--o| WORK_UNIT_TAG`, `WORK_UNIT ||--o{ WORK_UNIT_TAG`.
- **Alasan:** Permintaan Product Owner + user setelah membandingkan cakupan FOUNDATION dengan ERD produk sibling (`../operational-intelligence/research/erd-check.pdf`, referensi saja) — urutan baca lama (Asset Ontology di depan Site Hierarchy) menyesatkan karena Asset Ontology secara struktural bergantung pada `WORK_UNIT` yang dimodelkan Site Hierarchy.
- **Dampak:** Tidak ada entitas/field yang berubah arti atau kardinalitas — perubahan bersifat penomoran ulang (F-ID), perbaikan satu klaim naratif, dan **penambahan** entitas baru (KPI & Reference Data). Karena belum ada PRD aktif yang memakai F-ID sebagai referensi tetap, perubahan ini tidak memerlukan keputusan formal PO di `LOGS/decisions/`.
- **Pertanyaan terbuka ditinggalkan untuk PO/Ops** (lihat `kpi-formula.md` §9.6): apakah scoping `REASON_CODE` per aset (bukan sekadar per `ASSET_CLASS` yang sudah ada) benar-benar dibutuhkan lapangan, atau taksonomi dasar sudah cukup; apakah konfigurasi metrik dinamis dibutuhkan rilis pertama atau cukup hardcode.

---

## 2026-08-10 — FOUNDATION/DOCS-EN: terapkan struktur ISO 24495-1 (Plain Language)

- **Tipe:** ubah
- **Domain:** foundation-domain
- **File terdampak:** seluruh 13 file di `FOUNDATION/DOCS-EN/` + `README.md`
- **Perubahan:**
  - Ditambahkan baris **"In short"** di awal tiap file (setelah disclaimer) — satu kalimat inti sebelum penjelasan panjang, sesuai prinsip *Relevance* ISO 24495-1.
  - Ditambahkan bagian **"Next step"** di akhir tiap file — aksi konkret atau pihak yang perlu dihubungi, sesuai prinsip *Usability*.
  - `README.md` diberi catatan standar penulisan yang dipakai (ISO 24495-1: answer first, easy to scan, plain words, end with what to do next).
- **Alasan:** Permintaan user agar companion Bahasa Inggris eksplisit mengikuti standar Plain Language ISO 24495-1.
- **Dampak:** Tidak mengubah isi teknis atau fakta di companion; murni penataan ulang format agar lebih mudah dipindai dan langsung ke inti.

---

## 2026-08-10 — FOUNDATION: buat folder companion Bahasa Inggris `FOUNDATION/DOCS-EN/`

- **Tipe:** tambah
- **Domain:** foundation-domain
- **File terdampak:** `FOUNDATION/DOCS-EN/` (baru — 11 file companion + `README.md`), `FOUNDATION/AGENTS.md`
- **Perubahan:**
  - Dibuat folder baru `FOUNDATION/DOCS-EN/` berisi companion plain-language Bahasa Inggris untuk seluruh 11 dokumen `FOUNDATION/DOCS/` (F-00 s.d. F-10), mengikuti gaya yang sudah ada di `asset-ontology-en.md`.
  - `asset-ontology-en.md`, `tag-declaration-draft-en.md`, dan `work-unit-flow-draft-en.md` (sebelumnya untracked di `FOUNDATION/DOCS/`) dipindahkan ke folder ini dan diganti nama tanpa akhiran `-en`/`-draft-en` yang redundan (`asset-ontology.md`, `tag-declaration-draft.md`, `work-unit-flow-draft.md`); tautan relatif di dalamnya diperbaiki mengarah ke `../DOCS/`.
  - Ditambahkan `README.md` sebagai indeks folder, menyatakan companion **bukan** sumber kebenaran — dokumen Indonesia di `FOUNDATION/DOCS/` tetap mengikat.
  - `FOUNDATION/AGENTS.md` §2 diberi catatan yang menunjuk ke folder ini.
- **Alasan:** Permintaan user — kesulitan membaca dokumen FOUNDATION berbahasa Indonesia.
- **Dampak:** Tidak mengubah entitas, field, atau aturan yang ada. Perubahan bersifat aditif (dokumentasi bantu baca), dokumen sumber Indonesia tidak disentuh.

---

## 2026-08-10 — OEE Monitoring (P-02): tambah pertanyaan terbuka OEE-7 (keandalan data `derived`)

- **Tipe:** ubah
- **Domain:** production-domain
- **File terdampak:** `PRODUCTION/DOCS/oee-monitoring.md`
- **Perubahan:**
  - Ditambahkan baris **OEE-7** ke tabel §9 Pertanyaan terbuka: apakah data `ASSET_STATE_LOG.source = derived` (durasi dikonversi dari counter output × `standard_cycle_time`, dipakai saat lini tidak punya sensor running-hour langsung) perlu ditandai dengan tingkat keandalan berbeda dari `plc`/`manual`.
  - Ditambahkan catatan penjelas di bawah tabel: konversi counter → jam mengasumsikan kecepatan mesin = `standard_cycle_time` sepanjang periode; selisih kecepatan aktual ikut terserap ke durasi hasil konversi, mencampur Availability loss dan Performance loss yang seharusnya terpisah (§4 Loss tree).
  - Penanggung jawab: PO. Prioritas: 🟠 Sedang.
- **Alasan:** Muncul dari diskusi PO soal klien yang sensornya hanya mengirim counter output, bukan durasi running langsung — perlu keputusan eksplisit sebelum `source = derived` dipakai di perhitungan OEE.
- **Dampak:** Tidak mengubah entitas atau rumus yang ada; hanya menambah pertanyaan terbuka yang perlu dijawab PO sebelum sumber data `derived` dipercaya setara dengan `plc`/`manual`.

---

## 2026-08-10 — Asset Ontology EN companion (F-01): tambah diagram hubungan entitas

- **Tipe:** ubah
- **Domain:** foundation-domain
- **File terdampak:** `FOUNDATION/DOCS/asset-ontology-en.md`
- **Perubahan:**
  - Ditambahkan seksi baru **"How the entities connect"**, ditempatkan setelah "Three things to understand before anything else" dan sebelum "Other rules worth knowing".
  - Isi: diagram teks hierarkis (fence polos, tanpa Mermaid) yang memetakan ASSET_CLASS → ASSET_TYPE → ASSET → (parent_asset_id, ASSET_PLACEMENT → WORK_UNIT, lifecycle_status, ASSET_STATE_LOG → REASON_CODE/SHIFT_INSTANCE → OEE Availability), dengan rujukan baris ke `asset-ontology.md` dan `oee-monitoring.md` di setiap cabang.
  - Ditambahkan 5 poin penjelas di bawah diagram (Class/Type/Instance = level katalog bukan tahapan; lifecycle status vs operational state dipisah sengaja; perpindahan aset = riwayat baru bukan overwrite; komponen tidak punya placement sendiri; REASON_CODE hanya wajib untuk state "down_" dan menjadi input Availability OEE).
  - Disclaimer "reading aid, not a replacement" di bagian atas file **tidak diubah**. `asset-ontology.md` (sumber Indonesia) **tidak disentuh**.
- **Alasan:** Membantu pembaca non-teknis/EN melihat keterkaitan antar-entitas F-01 sekaligus tanpa harus melompat antar-bagian dokumen sumber.
- **Dampak:** Tidak mengubah entitas, field, atau aturan yang dipakai PRD aktif — murni penjelasan tambahan pada dokumen companion EN.

---

## 2026-08-10 — Workflow Engine (F-07): tambah pola acuan Tulip.co sebagai referensi

- **Tipe:** ubah
- **Domain:** foundation-domain
- **File terdampak:** `FOUNDATION/DOCS/workflow-engine.md`
- **Perubahan:**
  - Ditambahkan baris di tabel §5 "Acuan standar & pola" menunjuk ke subbagian baru §5.1.
  - Ditambahkan subbagian **§5.1 "Pola dari platform sejenis: Tulip.co"** — pola arsitektur publik Tulip (bukan spesifikasi untuk ditiru), atas permintaan PO untuk membantu menjawab Q3-3 (cakupan workflow engine).
  - Isi: (1) pemetaan model Trigger Tulip (event→condition→action→transition, level Widget/Step/App/Machine) terhadap anatomi §3.2 — disimpulkan Tulip **tidak punya padanan jelas** untuk Task, Assignment berbasis peran, atau Escalation/timer; trigger Tulip lebih dekat logika app-building per elemen UI daripada proses lintas peran; (2) pemetaan Connector Host/Edge Device Tulip terhadap Integration (F-09) — ditandai *adjacent*, bukan inti workflow-engine, dengan cross-reference ke `integration.md`; (3) dua contoh kandidat alur ringan level-UI (catat otomatis alasan downtime dari dropdown, validasi form sebelum step berpindah) sebagai pembanding alur berat lintas peran yang sudah ada di §8 — ditandai **perlu konfirmasi PO** apakah keduanya termasuk cakupan engine.
  - Sumber: dokumentasi publik support.tulip.co (platform components & network diagram, triggers, widget triggers, app building basics, steps) — dicantumkan sebagai tautan di dokumen.
  - Status banner dokumen (🟡 draft, entitas belum dimodel) **tidak diubah**.
- **Alasan:** PO meminta pola referensi dari platform sejenis untuk membantu men-scope Q3-3 tanpa menjadikannya spesifikasi.
- **Dampak:** Tidak mengubah entitas atau field yang sudah dipakai PRD aktif; hanya menambah konteks referensi. Pertanyaan cakupan tetap terbuka, kini dengan dua contoh kandidat tambahan untuk didiskusikan PO.

---

## 2026-08-07 — PRD-001 dibuat: PRD program 13 modul + versi PDF

- **Tipe:** tambah + ubah
- **Domain:** product-owner
- **File terdampak:** `DOCS/prd/PRD-001-molcadx-core-q3.md` (baru), `DOCS/prd/PRD-001-molcadx-core-q3.pdf` (baru), `AGENTS.md`
- **Perubahan:**
  - **PRD pertama MolcaDx** dibuat atas permintaan PO ("semua modul, jadi satu"): mencakup **13 modul** — 10 FOUNDATION (Site Hierarchy, Asset Ontology, Work Master, Organization, Calendar & Shift, Workflow Engine, Notification, Integration, Configuration Service) + 3 PRODUCTION (Shopfloor, OEE Monitoring, Job Schedule).
  - **49 user story** dengan ID `US-<DOMAIN>-<MODUL>-<nnn>`, masing-masing punya blok detail 8 bagian lengkap sesuai [`AGENTS.md` §4](../AGENTS.md#4-format-prd--berbasis-user-story) — termasuk rumus + sumber field + contoh berangka + kasus tepi, dan AC Given/When/Then (happy path, validasi, error/offline, hak akses).
  - 3 tujuan program (§3) diturunkan dari tiga hal yang harus terbukti di [Goals Q3 §1](../DOCS/goalsQ3.md); primary metric `lini_pilot_aktif_harian`, dua counter-metric (tingkat koreksi setelah shift ditutup, waktu catat output).
  - Bagian lintas story lengkap: peta 30+ layar, ringkasan entitas, matriks hak akses 6 peran, tabel perilaku offline, **25 NFR berangka**, rencana rilis 4 tahap dengan jalur kritis, 13 risiko, 15 open question, decision log 9 keputusan.
  - **Versi PDF** dihasilkan (85 halaman, A4 landscape) lewat render markdown → HTML → Chrome headless, karena `pandoc`/`weasyprint` tidak tersedia di lingkungan ini.
  - Didaftarkan di `AGENTS.md` §2.
- **Alasan:** PO meminta PRD untuk seluruh modul sebagai satu dokumen dan dalam bentuk PDF.
- **Penyimpangan dari standar yang dinyatakan terbuka (PRD §0):**
  - [03-prd-standard §2 aturan 1](../DOCS/03-prd-standard.md#2-aturan-menulis-tujuan--metrik) membatasi **maks. 3 tujuan per PRD** dan meminta PRD dipecah kalau lebih. Dokumen ini tetap 3 tujuan tapi cakupannya 13 modul, sehingga berfungsi sebagai **PRD program**; rencana pemotongan menjadi `PRD-002…` per modul ditulis di §0 dan §9. ID user story tidak berubah saat dipotong.
  - Checklist §7 melarang `TBD` di scope/AC/NFR. Semua AC & NFR sudah berangka, tapi **13 angka berasal dari usulan dokumen domain, bukan keputusan PO** — ditandai `[usulan]` dan didaftar di §11. Selama masih ada `[usulan]`, PRD **tidak boleh** naik ke `v1.0`.
- **Dampak:**
  - Format PRD berbasis user story yang ditetapkan sesi sebelumnya **kini teruji** pada PRD nyata; blok detail 8 bagian terbukti bisa diisi penuh untuk 49 story.
  - **13 story** (`FND-WFE`, `FND-NTF`, `FND-INT`, `FND-CFG`) menyebut entitas yang **belum ada di FOUNDATION** — ditandai ⚠ dan diblokir sampai `foundation-domain` memodelkannya (PRD §7.2, Q-11).
  - Muncul kebutuhan **field baru** yang harus diajukan ke `foundation-domain`: `REASON_CODE.parent_reason_code_id`, `QUALITY_DEFECT_CODE.parent/default_disposition/applies_to_item_id`, `WORK_ORDER_OPERATION.carry_over_*` + riwayat reschedule, penanda `adjustment` untuk koreksi, `ASSET_STATE_LOG.is_micro_stop`, serta entitas `ANDON_EVENT`.
  - Muncul dua peran yang dipakai dokumen PRODUCTION tapi belum ada di daftar `ROLE`: `technician` dan `planner` (Q-02).
  - Ditemukan celah yang sebelumnya tidak terlihat: **handover antar shift belum punya user story** padahal [F-06 §3.6](../FOUNDATION/DOCS/shift.md#36-handover-antar-shift) menyebutnya praktik penting — kalau tidak ditangani, buku catatan tetap dipakai dan prinsip "tidak menambah kerja ganda" dilanggar (Q-12, R-08).
  - **KR 0.2** (form pemetaan kebutuhan sistem/hardware/data) belum punya story karena istilah "RG" belum terdefinisi (Q-15).
  - PRD belum punya reviewer: `design-domain` & `engineering-domain` belum dibuat (Q-08, R-12).

---

## 2026-08-07 — Dokumen knowledge per modul + FOUNDATION dipecah per modul

- **Tipe:** tambah + ubah
- **Domain:** product-owner (atas nama foundation-domain & production-domain)
- **File terdampak:** 10 file baru di `FOUNDATION/DOCS/`, 3 file baru di `PRODUCTION/DOCS/`, `FOUNDATION/DOCS/asset-ontologi.md` (ditulis ulang), `FOUNDATION/AGENTS.md`, `PRODUCTION/AGENTS.md`, `AGENTS.md`, `DOCS/goalsQ3.md`
- **Perubahan:**
  - **13 dokumen knowledge per modul** dibuat — 10 modul FOUNDATION + 3 modul PRODUCTION. Struktur seragam: definisi, masalah yang diselesaikan, konsep inti, fungsi modul, acuan standar, kaitan antar modul, jebakan umum, implikasi untuk MolcaDx.
  - **`asset-ontologi.md` dipecah per modul.** Isinya yang tadinya mencakup 6 modul dipindahkan ke file modul masing-masing sebagai §9 Spesifikasi entitas. File aslinya menjadi **F-00 — Peta Model Data**: prinsip bersama, ERD lintas modul, aturan ID/kode/effective dating, dan ringkasan pertanyaan terbuka.
  - Empat modul platform mendapat dokumentasi pertamanya: **Workflow Engine (F-07)**, **Notification (F-08)**, **Integration (F-09)**, **Configuration Service (F-10)** — konsep saja, entitas belum dimodelkan.
  - PRODUCTION mendapat dokumen konsep terpisah (`*-konsep.md`) di samping spesifikasi yang sudah ada.
  - Semua tautan silang yang menunjuk bagian `asset-ontologi.md` yang pindah sudah diarahkan ulang ke file modulnya.
  - Indeks di `FOUNDATION/AGENTS.md`, `PRODUCTION/AGENTS.md`, `AGENTS.md`, dan tabel modul di `DOCS/goalsQ3.md` diperbarui.
  - Folder `modules/` yang sempat dibuat dibatalkan — `<DOMAIN>/DOCS/` sudah menjadi wadahnya.
- **Alasan:** dokumen sebelumnya menjelaskan *apa yang akan dibangun* tapi tidak *kenapa modul itu ada dan konsep apa yang mendasarinya*. Tanpa itu, setiap orang baru — dan setiap agent domain — harus menyimpulkan sendiri, dan kesimpulannya akan berbeda-beda.
- **Sumber:** standar & praktik industri — ISA-95/IEC 62264, ISO 22400, ISO 14224, ISO 55000, ISO 8601, BPMN 2.0, EEMUA 191/ISA-18.2, IEC 62443, OPC UA, TPM/Lean. **Bukan riset lapangan Molca** — semua yang spesifik ke Molca tetap ditandai `TBD`.
- **Dampak:**
  - Struktur FOUNDATION berubah dari 1 file besar menjadi 1 file per modul; rujukan `asset-ontologi.md §5` dan sejenisnya sudah tidak berlaku.
  - Empat modul platform kini punya dasar untuk dirancang entitasnya, tapi **belum dirancang** — status 🟠 KONSEP.
  - Dokumen konsep memunculkan keputusan yang belum diambil dan sebelumnya tidak terlihat, terutama: batas cakupan "low-code" pada Workflow Engine, dan batas antara konfigurasi vs master data pada Configuration Service.
  - **Work Improvement** & **License Manager** belum dibuatkan dokumen — domainnya belum ditentukan PO.

---

## 2026-08-07 — Audit AGENTS.md + format PRD berbasis user story ditetapkan

- **Tipe:** ubah
- **Domain:** product-owner
- **File terdampak:** `AGENTS.md`, `DOCS/03-prd-standard.md`, `DOCS/templates/prd-template.md`
- **Perubahan:**
  - **Audit `AGENTS.md`** — 8 temuan diperbaiki: urutan peta repo dirapikan (subfolder `DOCS/` mengikuti induknya), aturan layout domain ditambahkan ke §1, aturan changelog diperluas dari hanya `DOCS/` menjadi semua dokumen termasuk `<DOMAIN>/DOCS/` dan `AGENTS.md`, aturan pendaftaran dokumen dipertegas ke indeks yang tepat, nama skill PDF diseragamkan menjadi `pdf`, `LOGS/decisions/` didaftarkan, tautan ke Goals Q3 ditambahkan di header dan §3, aturan konsistensi istilah ditambahkan.
  - **§4 Format PRD** ditambahkan: PRD berbasis **user story**, dikelompokkan Domain → Modul, dalam tabel `ID | Judul User Story | Penjelasan | Dependensi`, dengan kolom Dependensi merujuk ID user story lain.
  - Ditetapkan **ID `US-<DOMAIN>-<MODUL>-<nnn>`** beserta tabel kode domain & modul — tanpa ID, kolom Dependensi tidak punya sasaran.
  - Ditetapkan **blok detail 8 bagian wajib** per story (Story, Konteks, Expectation, Cara kalkulasi, Data & entitas, Aturan & batasan, Acceptance criteria, Metrik & event), lengkap dengan contoh terisi penuh (`US-PROD-OEE-003`).
  - Ditambahkan **uji kesiapan**: story hanya boleh dikirim kalau designer bisa mulai membuat layar dan developer bisa mulai menulis kode tanpa satu pun pertanyaan ke PO; disertai tabel pemetaan bagian → peran dan 5 pola penulisan terlarang.
  - `DOCS/03-prd-standard.md` §3 ditulis ulang mengikuti struktur ini; checklist rilis §7 bertambah 5 poin.
  - `DOCS/templates/prd-template.md` §5–§8 ditulis ulang: tabel user story per Domain → Modul, blok detail 8 bagian, dan bagian lintas story yang tidak lagi mengulang isi per story.
- **Alasan:** format PRD sebelumnya berupa daftar user story datar tanpa ID, sehingga tidak ada cara merujuk antar story dan tidak ada tempat baku untuk rumus & expectation. Akibatnya PRD berisiko lolos review tapi tetap harus ditanyakan ulang saat dikerjakan.
- **Dampak:**
  - Semua PRD berikutnya wajib memakai format ini; template lama tidak berlaku.
  - Kode modul baru ditetapkan PO saat modul pertama kali masuk PRD, lalu didaftarkan di tabel `AGENTS.md` §4.
  - Belum ada PRD yang ditulis — format ini baru diuji saat PRD pertama dibuat.

---

## 2026-08-07 — `DOCS/domains/` dihapus, layout folder-scoped jadi satu-satunya pola

- **Tipe:** hapus + ubah
- **Domain:** product-owner
- **File terdampak:** `DOCS/domains/` (dihapus), `AGENTS.md`, `DOCS/02-domains.md`, `DOCS/templates/domain-agent-template.md`, `.claude/skills/molca-domain-agent/SKILL.md`
- **Perubahan:**
  - `DOCS/domains/` dihapus — isinya hanya `.gitkeep`, tidak pernah terpakai karena FOUNDATION dan PRODUCTION menyimpan kontrak kerjanya di `<DOMAIN>/AGENTS.md`.
  - Aturan **Layout domain** ditambahkan ke `DOCS/02-domains.md`: setiap domain wajib punya folder sendiri di root (`<NAMA-DOMAIN>/AGENTS.md` + `<NAMA-DOMAIN>/DOCS/`). Catatan lama yang menyebut dua pola paralel dihapus.
  - `DOCS/templates/domain-agent-template.md` ditulis ulang mengikuti struktur `FOUNDATION/AGENTS.md` & `PRODUCTION/AGENTS.md` — 9 bagian, termasuk tabel indeks dokumen, dengan tautan relatif dari folder domain.
  - Skill `molca-domain-agent` diperbarui: bagian layout wajib di depan, langkah 3 membuat folder domain (bukan file di `DOCS/domains/`), langkah 5 kini 5 titik pendaftaran (AGENTS.md §1/§2/§3, 02-domains.md, glossary), checklist selesai diperluas.
- **Alasan:** dua pola penyimpanan yang berjalan paralel membuat daftar isi punya dua sumber kebenaran. Pola folder-scoped sudah terbukti di dua domain, jadi pola satunya dihapus daripada dipertahankan sebagai opsi.
- **Dampak:**
  - Tidak ada dokumen yang hilang — folder yang dihapus kosong.
  - Domain berikutnya yang dibuat lewat skill otomatis memakai layout folder-scoped.
  - `DOCS/` root sekarang tegas hanya untuk dokumen lintas domain.

---

## 2026-08-07 — Goals Q3 didokumentasikan

- **Tipe:** tambah
- **Domain:** product-owner
- **File terdampak:** `DOCS/goalsQ3.md`, `AGENTS.md`
- **Perubahan:**
  - `DOCS/goalsQ3.md` dibuat dari input PO: fokus kuartal, daftar foundation item, domain, modul (Production + 10 modul Foundation + Work Improvement & License Manager), dan 7 KR lintas 4 track.
  - Dua track yang sama-sama bernomor 1 pada input asli dipisah menjadi **Track 1A** (Monitoring and Controlling) dan **Track 1B** (Platform and Edge Engineering) agar setiap KR punya ID unik untuk dirujuk PRD.
  - Ditambahkan §6 Catatan PO: ringkasan kepemilikan track, usulan bentuk terukur untuk ketujuh KR, celah cakupan, urutan ketergantungan, dan 9 pertanyaan terbuka.
- **Alasan:** menyediakan acuan prioritas kuartal yang bisa dirujuk semua domain, sekaligus menandai jarak antara tujuan kuartal dan dokumen yang sudah ada.
- **Dampak:**
  - **Tidak satu pun dari 7 KR memenuhi format terukur** [03-prd-standard §2](../DOCS/03-prd-standard.md) — usulan bentuk terukurnya ada di §6.2, angkanya menunggu PO.
  - **5 dari 7 KR dimiliki domain yang belum ada** (`engineering-domain`, `design-domain`).
  - **6 modul Foundation belum punya dokumen**: Workflow Engine, Notification, Integration, Configuration Service, Work Improvement, License Manager. Workflow Engine paling kritis karena disebut langsung di fokus kuartal.
  - Track 1A (*service monitoring*) berbeda dari [P-02 OEE Monitoring](../DOMAINS/PRODUCTION/DOCS/oee-monitoring.md) (*production monitoring*) — perlu penamaan tegas agar tidak tertukar.
  - Belum ada PRD yang dibuat dari dokumen ini — sesuai aturan, menunggu permintaan eksplisit PO.

---

## 2026-08-07 — Domain PRODUCTION dibuat

- **Tipe:** tambah
- **Domain:** production-domain (dibuat oleh product-owner)
- **File terdampak:** `PRODUCTION/AGENTS.md`, `PRODUCTION/DOCS/shopfloor.md`, `PRODUCTION/DOCS/oee-monitoring.md`, `PRODUCTION/DOCS/job-schedule.md`, `.claude/agents/production-domain.md`, `AGENTS.md`, `DOCS/02-domains.md`, `DOCS/01-glossary.md`
- **Perubahan:**
  - Domain **PRODUCTION** dibuat dengan layout *folder-scoped*, mengikuti pola FOUNDATION.
  - **P-01 `shopfloor.md`** — enam alur inti (mulai shift, catat output, downtime, defect, andon, tutup shift), aktor & hak, 8 state layar wajib, perilaku offline + aturan konflik, aturan koreksi data, 8 event, dan 5 metrik kualitas alur.
  - **P-02 `oee-monitoring.md`** — rantai perhitungan dari `SHIFT_INSTANCE` sampai OEE, 6 aturan perhitungan yang tidak boleh dilanggar, level & granularitas, loss tree, indikator kesegaran/kelengkapan data, 4 tampilan yang dibutuhkan, ambang peringatan.
  - **P-03 `job-schedule.md`** — state machine work order & operation, alur penjadwalan 7 tahap, rumus kapasitas, aturan urutan, penanganan penyimpangan & carry-over, 5 metrik kualitas penjadwalan.
  - Agent `production-domain` didefinisikan di `.claude/agents/`.
  - Didaftarkan di `AGENTS.md` §1/§2/§3 dan `DOCS/02-domains.md` (termasuk matriks tanggung jawab PRD dan diagram ketergantungan antar domain).
  - 9 istilah eksekusi produksi ditambahkan ke `DOCS/01-glossary.md`.
- **Alasan:** FOUNDATION menetapkan *apa* datanya; PRODUCTION menetapkan *bagaimana* data itu dihasilkan dan dibaca. Tanpa lapisan ini, designer dan developer harus menebak alur dan aturan agregasi sendiri.
- **Dampak:**
  - PRODUCTION **memakai** entitas FOUNDATION dan tidak boleh membuat entitas sendiri — kebutuhan entitas baru lewat Product Owner.
  - Rumus kanonik tetap milik `DOCS/04-metrics-framework.md`; P-02 hanya menjabarkan cara menghitungnya dari data nyata.
  - Ketiga dokumen berstatus **DRAFT** — 19 pertanyaan terbuka, 9 di antaranya prioritas tinggi. Yang paling menghambat: mode pencatatan output (SF-1), perlakuan changeover dalam OEE (OEE-6), dan sumber work order (JS-1).
  - Beberapa `TBD` PRODUCTION bergantung pada `TBD` FOUNDATION yang sama (level pencatatan downtime, sumber work order) — jawaban PO menutup keduanya sekaligus.

---

## 2026-08-07 — Domain FOUNDATION dibuat

- **Tipe:** tambah
- **Domain:** foundation-domain (dibuat oleh product-owner)
- **File terdampak:** `FOUNDATION/AGENTS.md`, `FOUNDATION/DOCS/asset-ontologi.md`, `.claude/agents/foundation-domain.md`, `AGENTS.md`, `DOCS/02-domains.md`, `DOCS/01-glossary.md`
- **Perubahan:**
  - Domain **FOUNDATION** dibuat dengan layout *folder-scoped*: `FOUNDATION/AGENTS.md` sebagai daftar isi + kontrak kerja, dan `FOUNDATION/DOCS/` sebagai dokumennya.
  - `FOUNDATION/DOCS/asset-ontologi.md` (F-01) ditulis — memuat lima blok: organization, site hierarchy, asset ontology, work master, dan shift & calendar; lengkap dengan peta entitas, atribut inti, kardinalitas, aturan ID/kode, dan effective dating.
  - Agent `foundation-domain` didefinisikan di `.claude/agents/`.
  - Didaftarkan di `AGENTS.md` §1 (peta repo), §2 (indeks dokumen per domain), §3 (domain aktif) dan di `DOCS/02-domains.md` termasuk matriks tanggung jawab per PRD.
  - 17 istilah master data ditambahkan ke `DOCS/01-glossary.md`.
- **Alasan:** semua domain lain (engineering, data, design) butuh definisi entitas yang sama sebelum bisa bekerja. Tanpa ontologi tunggal, setiap domain akan membuat definisi aset/lini/shift sendiri dan angka metrik tidak akan cocok.
- **Dampak:**
  - `DOCS/04-metrics-framework.md` §5 kini punya sumber field yang konkret (lihat `asset-ontologi.md` §7.5).
  - Bagian "Entitas data" pada PRD berikutnya ditulis `foundation-domain`, bukan `product-owner`.
  - `asset-ontologi.md` berstatus **DRAFT** — 8 pertanyaan prioritas tinggi/sedang menunggu jawaban PO & `ops-domain` (ringkasan di §10). Yang paling menghambat: daftar reason code downtime, defect code, dan pola shift.
  - `ops-domain` belum ada; sebagian `TBD` baru bisa dijawab setelah domain itu dibuat atau lewat konfirmasi langsung PO.

---

## 2026-08-07 — Inisialisasi struktur dokumentasi & orkestrasi

- **Tipe:** tambah
- **Domain:** product-owner
- **File terdampak:** `AGENTS.md`, `DOCS/00`–`DOCS/05`, `DOCS/templates/*`, `LOGS/*`, `.claude/skills/molca-domain-agent/SKILL.md`
- **Perubahan:**
  - `AGENTS.md` dibuat sebagai daftar isi + daftar domain + aturan kerja semua agent.
  - `DOCS/` diisi basic knowledge: product overview, glossary, pembagian domain, standar PRD, kerangka metrik, ways of working.
  - `DOCS/templates/` berisi template PRD dan template agent domain.
  - `LOGS/` dibuat beserta aturan pencatatan.
  - Skill lokal `molca-domain-agent` dibuat untuk menambah domain/agent baru atas permintaan PO.
- **Alasan:** menyiapkan fondasi sebelum PRD ditulis, agar setiap dokumen punya pemilik, format, dan jejak perubahan.
- **Dampak:**
  - `DOCS/00-product-overview.md` dan `DOCS/01-glossary.md` berstatus **DRAFT** — berisi `TBD` yang harus dijawab PO sebelum dipakai sebagai dasar PRD.
  - Domain yang aktif baru **Product & PRD**. Domain Design, Engineering, Data, dan Ops masih berstatus direncanakan.
  - Belum ada PRD yang dibuat — sesuai aturan, PRD hanya dibuat saat diminta eksplisit.
