# Keputusan — 7 blocker contest review FOUNDATION (2026-09-03)

Konteks lengkap review ada di [`LOGS/handoff-2026-09-03-foundation-contest-review.md`](../handoff-2026-09-03-foundation-contest-review.md).
Lima jalur review adversarial (read-only) menemukan 7 blocker di `DOMAINS/FOUNDATION/DOCS-EN/`.
Berikut keputusan PO atas masing-masing.

## B1 — Generator `SHIFT_INSTANCE` tidak berpemilik (F-02, §H-6)

**Keputusan:** Kepemilikan generator ditunda — tidak diputuskan sesi ini.
**Konsekuensi:** F-02 statusnya diturunkan dari `ACTIVE` ke `DRAFT` sampai generator punya pemilik.
Menunda kepemilikan tidak berarti menunda revert status — dua hal berbeda.

## B2 — `WORK_ORDER_OPERATION` tidak bisa menyimpan kode defect (F-08 §9.6)

**Keputusan:** Gugur untuk FOUNDATION. `WORK_ORDER_OPERATION` pindah ke domain PRODUCTION
(lihat keputusan struktural di bawah) — perbaikan FK `defect_code_id` jadi tanggung jawab
`production-domain` saat memodelkan ulang entitas ini.

## B3 — "Routing locked at release" tanpa mekanisme snapshot (F-08)

**Keputusan:** Mekanisme (version-pin vs snapshot penuh) tidak diputuskan PO sesi ini —
didelegasikan ke `foundation-domain` (pemilik `ROUTING`/`BOM`) dan `production-domain`
(pemilik `WORK_ORDER` setelah pindah) untuk dirancang bersama, karena solusinya melintasi
kedua domain: FOUNDATION perlu mekanisme versi pada `ROUTING`/`BOM`, PRODUCTION perlu
menyimpan versi yang dikunci pada `WORK_ORDER` saat rilis.

## B4 — W-1 (ERP vs MolcaDx sebagai sumber `WORK_ORDER`) masih terbuka (F-08)

**Keputusan:** Pertanyaan ini pindah kepemilikan ke domain PRODUCTION bersama entitas
`WORK_ORDER` (lihat keputusan struktural). Tidak lagi jadi open question FOUNDATION.

## B5 — A-5 "resolved" mengutip skema `ASSET_STATE_LOG` yang tidak ada (F-00/F-04/F-05)

**Keputusan:** `ASSET_STATE_LOG` ditunda — FOUNDATION tidak menspesifikasikannya sesi ini.
**Konsekuensi:** A-5 dikembalikan ke status terbuka, tanpa pemilik domain ditetapkan.
KPI Availability yang bergantung pada tabel ini (F-07 §"Ready") ikut diberi catatan
kualifikasi sampai A-5 diputuskan.

## B6 — `ASSET` punya dua field posisi yang bertentangan (F-04)

**Keputusan:** `ASSET_PLACEMENT` (histori penempatan) adalah sumber kebenaran untuk lokasi
asset saat ini — baris terbaru = lokasi sekarang.
**Konsekuensi:** Field inline `ASSET.work_unit_id`/`site_id` dihapus atau dijadikan read-only
turunan (bukan sumber tulis independen). Pengecekan scope ABAC yang tadinya membaca field
inline diarahkan ulang untuk membaca `ASSET_PLACEMENT`.

## B7 — `ASSET_TAGS.data_source_id` FK wajib ke entitas `DATA_SOURCE` yang belum dimodelkan (F-04/F-11)

**Keputusan:** `DATA_SOURCE` (sumber data sensor) dimodelkan sebagai **modul FOUNDATION baru**,
terpisah dari F-04 Asset Ontology dan F-11 Integration. Integration (F-11) tetap khusus
integrasi sistem-ke-sistem (mis. ERP); `DATA_SOURCE` khusus sumber data sensor/IoT —
dua konsep berbeda, tidak digabung.
**Konsekuensi:** Modul baru perlu kode domain baru di [`AGENTS.md`](../../AGENTS.md) §4, entri
indeks di §2 dan `DOMAINS/FOUNDATION/AGENTS.md` §2, dan file `DOMAINS/FOUNDATION/DOCS-EN/`.
Heartbeat granularity (connection-level vs per-tag) — bagian dari B7 di daftar keputusan asli —
masih `TBD`, jadi bagian pekerjaan modul baru ini.

## Keputusan struktural — `WORK_ORDER`/`WORK_ORDER_OPERATION` pindah ke PRODUCTION

**Keputusan:** `WORK_ORDER` dan `WORK_ORDER_OPERATION` pindah dari FOUNDATION (F-08 Work Master)
ke domain PRODUCTION, bergabung dengan modul Job Schedule yang sudah ada di sana. `ROUTING`,
`OPERATION`, `BOM`, `BOM_LINE`, `QUALITY_DEFECT_CODE` **tetap** di FOUNDATION F-08 sebagai
master/recipe data.
**Alasan:** `WORK_ORDER`/`WORK_ORDER_OPERATION` adalah data transaksional/eksekusi (instans
konkret dari "membuat sesuatu", ditulis live oleh shopfloor), bukan data master ("cara membuat
sesuatu"). Ini konsisten dengan pembagian domain di [`AGENTS.md`](../../AGENTS.md) §3: FOUNDATION
= model data dasar, PRODUCTION = eksekusi & pemantauan produksi.
**Konsekuensi:**
- F-08 kehilangan §9.5 (`WORK_ORDER`) dan §9.6 (`WORK_ORDER_OPERATION`) — dipindah, bukan dihapus.
- PRODUCTION menambahkan kedua entitas ke dokumennya, termasuk perbaikan B2 (FK defect code)
  dan menjawab W-1/B4 (sumber WO).
- Semua story PRD yang merujuk `WORK_ORDER`/`WORK_ORDER_OPERATION` di bawah domain FOUNDATION
  (`US-FND-WMS-*`) perlu ditinjau ulang kepemilikan domainnya — rule 1b berlaku.
- `AGENTS.md` §4 (kode domain & modul) dan §2/§3 perlu pembaruan untuk mencerminkan pemindahan.

## Tindak lanjut

1. `foundation-domain`: revert F-02 status, B6 (`ASSET`/`ASSET_PLACEMENT`), strip §9.5/§9.6 dari
   F-08, buat modul `DATA_SOURCE` baru, revert A-5 ke terbuka, kualifikasi F-07 APT "Ready",
   dan separuh desain B3 (versioning `ROUTING`/`BOM`).
2. `production-domain`: terima `WORK_ORDER`/`WORK_ORDER_OPERATION`, perbaiki B2 (FK defect code),
   putuskan/dokumentasikan W-1 sumber WO, dan separuh desain B3 (snapshot/pin di rilis WO).
3. Product Owner: setelah (1) dan (2) selesai — perbarui `AGENTS.md` §2/§3/§4, sinkronkan
   PRD-001/PRD-003 (rule 1b) untuk story yang terdampak, catat di `LOGS/CHANGELOG.md`.
