# Keputusan — Screen merge Asset Ontology diakui sebagai target (2026-09-04)

Konteks: [issue #18](https://github.com/molca-id/docs-molcadx/issues/18).

## Apa yang menyimpang

`DOMAINS/FOUNDATION/UX/04-asset.md` menspesifikasikan dua layar terpisah:
`SCR-FND-AST-001` (Class/type taxonomy editor) dan `SCR-FND-AST-002` (Asset register).
Implementasi frontend yang sudah dikirim (`mes-master-data-fe-test`, di luar repo ini)
menyimpang dari spec ini dalam **dua tahap**, tidak pernah dicatat sebagai keputusan:

1. **Penggabungan awal:** kedua layar digabung jadi satu layar tree+detail dengan tiga
   view — Tree, Diagram, Table.
2. **Perataan lanjutan (sesi berikutnya):** Tree dan Diagram diubah lagi untuk
   menampilkan **daftar rata (flat)** aset level Equipment-unit, dengan Class/Type
   hanya sebagai badge kecil (nesting 3 level dihapus). Table tetap menampilkan
   hierarki penuh `ASSET_CLASS → ASSET_TYPE → ASSET` dan menjadi **satu-satunya**
   tempat mengedit taksonomi (create/edit class atau type).

## Keputusan

**Diterima sebagai target yang didokumentasikan** — bukan reverted ke dua layar
terpisah. Alasan:

- Pemisahan yang benar bukan per-entitas (taxonomy vs asset), melainkan **per-tugas**:
  Tree/Diagram melayani "browse/inspect equipment, cari satu mesin dengan cepat";
  Table melayani "kelola struktur taksonomi". Task-based split ini lebih sesuai
  kebutuhan nyata daripada entity-based split versi awal spec.
- Memperbaiki keluhan usability nyata: scroll 3 level nesting hanya untuk menemukan
  satu mesin. Flat list + badge menyelesaikan ini tanpa kehilangan konteks
  class/type (badge tetap terlihat).
- Preseden sudah ada untuk pola "satu layar, banyak view" di domain ini —
  `SCR-FND-SIT-001` (Site tree explorer) sudah memakai tiga view mode (Tree/Diagram/
  Table) berbagi satu node selection & detail pane. Pola AST mengikuti pola yang
  sama, bukan pola baru.
- Sejalan dengan keputusan sebelumnya di [`2026-09-03-foundation-contest-blockers.md`](2026-09-03-foundation-contest-blockers.md)
  tentang menerima realitas implementasi yang sudah lebih baik daripada spec asli
  ketika ada alasan usability yang jelas.

**Tidak diterima:** mengarang ulang detail visual (warna, spacing, dsb.) yang tidak
disebutkan issue — dokumen ini hanya mencatat struktur layar/view, bukan detail
implementasi UI.

## Struktur SCR ID

- `SCR-FND-AST-001` — dipakai sebagai **satu-satunya ID** untuk layar gabungan
  (Asset browser & taxonomy manager, tiga view). Dipilih karena ini ID yang sudah
  dipakai `US-FND-AST-001` (taxonomy) dan paling dekat dengan konsep "master
  screen" yang sekarang menaungi taksonomi + register.
- `SCR-FND-AST-002` — **diretensi/di-retire**, dilebur ke `SCR-FND-AST-001`'s Table
  view. ID **tidak dipakai ulang** untuk apa pun di masa depan (rule 7 AGENTS.md).
  Alasan tidak mempertahankan dua ID untuk dua "sub-view" seperti pola
  `SCR-FND-SIT-001`/`002`: pola SIT memisahkan **tree navigasi** (001) dari
  **detail/edit pane** (002) — dua peran UI yang berbeda dalam satu layar. Kasus AST
  berbeda: ketiga view (Tree/Diagram/Table) adalah **cara melihat data yang sama**,
  bukan navigasi vs detail terpisah — satu ID sudah cukup mewakilinya, meniru cara
  `SCR-FND-SIT-001` sendiri memakai satu ID untuk tiga view mode-nya.
- Referensi ke `SCR-FND-AST-002` di layar lain (`SCR-FND-AST-003`'s picker; `UX-AST-3`)
  diarahkan ulang ke `SCR-FND-AST-001`.

## Resolusi navigasi badge → Table (pertanyaan terbuka dari issue)

**Keputusan:** ya, badge Class/Type di Tree/Diagram **bisa diklik** dan melompat ke
baris yang cocok di Table view, pre-filtered ke class/type itu dan barisnya
disorot (highlighted).

**Preseden yang diikuti:** domain ini sudah punya pola "reachable both directly and
via a [read-only summary] link" untuk lompatan antar layar — dipakai oleh
`SCR-FND-AST-003` (Placement history) yang reachable langsung maupun via link di
`SCR-FND-SIT-002`'s `WORK_UNIT` detail. Pola yang sama dipakai di sini: badge adalah
link, bukan hanya label statis.

**Alasan tanpa preseden eksplisit untuk "jump ke baris pre-filtered + highlight":**
kalau tidak ada preseden identik, default ke opsi berbiaya rendah dan bernilai
tinggi — absennya lompatan ini adalah regresi usability dibanding bahkan spec dua
layar yang asli (yang setidaknya menyatukan semua hal taksonomi dalam satu tempat,
walau lewat menu terpisah).

## Konsekuensi

- `DOMAINS/FOUNDATION/UX/04-asset.md` — tabel Screens diperbarui, `SCR-FND-AST-002`
  ditandai retired, referensi silang diperbarui, `UX-AST-3` disesuaikan redaksinya
  (substansi pertanyaan tidak berubah).
- `DOCS/prd/PRD-003-foundation-domain-en.md` — diperiksa (rule 1b AGENTS.md §5.1b).
  §7.1 "Screen map (for Design)" **memang** menyebut "Asset taxonomy" dan "Asset list
  & detail" sebagai dua baris terpisah dengan "on to the asset list" sebagai exit
  point — ini disinkronkan (digabung jadi satu baris), karena baris itu murni
  referensi struktur layar, bukan heading/anchor cerita.
  **Koreksi 2026-09-04 (follow-up, prd-pilot diagnostic run):** klaim di atas bahwa
  "AC/data & entitas/rules `US-FND-AST-001`/`002`/`003` tidak menyebut struktur dua
  layar secara eksplisit dan tidak berubah oleh keputusan ini" **salah**. Pemeriksaan
  saat itu hanya mencari referensi literal ke SCR-ID (`SCR-FND-AST-001`/`002`) dan
  tidak menemukan satupun — tapi melewatkan bahwa bagian **Expectation** kedua story
  mengkodekan layout dua-layar yang sudah pensiun sebagai detail yang bisa diuji:
  `US-FND-AST-001` menyebut "two panels — the `ASSET_CLASS` tree... on the left, the
  `ASSET_TYPE` list... on the right" (layar editor taksonomi berdiri sendiri) dan
  `US-FND-AST-002` menyebut "asset list with columns tag, type, line/station
  placement... search by tag is the first field to receive focus" (layar register
  aset berdiri sendiri). Keduanya sudah diperbaiki di PRD-003 pada follow-up ini agar
  menjelaskan struktur layar Table (taksonomi + registrasi aset) vs Tree/Diagram
  (browse dengan badge-jump) yang sebenarnya berlaku sekarang. Pelajaran: memeriksa
  "apakah story menyebut SCR-ID" tidak cukup untuk menyimpulkan "tidak berubah" —
  Expectation section bisa mengunci detail UI tanpa pernah menyebut ID layar sama
  sekali.
- `DOCS/prd/PRD-003-task-breakdown.md` — diperiksa. Task UI level (mis. "two-panel
  default — class tree left + type list right" pada `US-FND-AST-001`) menjelaskan
  layout di dalam sebuah view, bukan asumsi dua layar terpisah — kompatibel dengan
  Table view pada layar gabungan tanpa perlu diedit. Tidak disinkronkan.
- Tidak ada perubahan entitas — ini murni keputusan layer UX, `04-asset-ontology.md`
  (DOCS-EN) tidak disentuh.

## Tindak lanjut

Tidak ada — keputusan ini menutup issue #18 sepenuhnya, termasuk pertanyaan navigasi
badge yang dibawa masuk oleh PO.
