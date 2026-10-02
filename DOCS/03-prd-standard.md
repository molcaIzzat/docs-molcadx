# 03 — PRD Standard

Aturan wajib agar setiap PRD MolcaDx **terukur** dan **langsung bisa dikerjakan** designer & developer.
Template kosongnya: [`templates/prd-template.md`](templates/prd-template.md).

> **PRD dibuat hanya saat Product Owner memintanya secara eksplisit.** Bukan sebagai efek samping tugas lain.

---

## 1. Prinsip

| Prinsip | Artinya di praktik |
|---------|--------------------|
| **Terukur** | Setiap tujuan punya metrik + baseline + target + tanggal ukur. Tidak ada "meningkatkan efisiensi". |
| **Bisa diuji** | Setiap acceptance criteria bisa dijawab lulus/gagal oleh QA tanpa bertanya ke PO. |
| **Bisa diimplementasi** | Designer tahu layar & state apa yang harus dibuat; developer tahu data, aturan, dan error apa yang harus ditangani. |
| **Satu keputusan satu tempat** | Keputusan ditulis di §Decision Log, bukan tersebar di komentar. |
| **Eksplisit soal yang tidak dikerjakan** | §Out of scope wajib diisi. Kosong = belum dipikirkan. |

## 2. Aturan menulis tujuan & metrik

Setiap tujuan harus berbentuk:

> **[Metrik]** dari **[baseline]** menjadi **[target]** pada **[tanggal]**, diukur dengan **[sumber data]**.

Contoh:
- ✅ *Waktu input laporan shift oleh operator turun dari 12 menit (baseline manual, survei Juli 2026) ke ≤4 menit pada 30 hari setelah rilis, diukur dari event `shift_report_submitted` − `shift_report_started`.*
- ❌ *Mempermudah operator melaporkan hasil produksi.*

Aturan:
1. Maksimal **3 tujuan** per PRD. Lebih dari itu berarti PRD-nya harus dipecah.
2. Wajib ada **1 primary metric** dan boleh ada **counter-metric** (metrik yang tidak boleh memburuk).
3. Kalau baseline belum ada, tulis `baseline: belum diukur — ukur dulu pada [tanggal]`. Jangan mengarang angka.
4. Metrik harus bisa di-query dari event/tabel yang disebut namanya. Lihat [04-metrics-framework](04-metrics-framework.md).

## 3. Struktur PRD — berbasis user story

**Semua PRD disusun sebagai user story, dikelompokkan Domain → Modul, dalam bentuk tabel**,
dengan blok detail per story. Struktur & aturan kolom lengkap: [`AGENTS.md` §4](../AGENTS.md#4-format-prd--berbasis-user-story).

```
## <Judul Domain>
### <Judul Modul>
    → tabel ringkasan: ID | Judul User Story | Penjelasan | Dependensi
    → blok detail per story (8 bagian wajib)
```

### 3.1 Delapan bagian wajib per story

| # | Bagian | Melayani | Isi minimum |
|---|--------|----------|-------------|
| 1 | Story | semua | *Sebagai `<persona>`, saya ingin `<aksi>`, agar `<hasil>`* |
| 2 | Konteks | semua | Masalah + bukti + kondisi pemakaian (perangkat, lokasi, jaringan) |
| 3 | **Expectation** | **Designer** | Perilaku yang diharapkan di **semua state**: default, kosong, loading, error, offline, sukses, tanpa izin |
| 4 | **Cara kalkulasi** | **Developer** | Rumus + sumber tiap variabel sampai nama field + **contoh berangka** + kasus tepi |
| 5 | Data & entitas | Developer | Entitas & field FOUNDATION yang dibaca/ditulis. Dilarang mengarang field baru |
| 6 | Aturan & batasan | Designer + Developer | Validasi, hak akses per peran, offline, koreksi, batas nilai |
| 7 | Acceptance criteria | Developer + QA | Given/When/Then |
| 8 | Metrik & event | Developer + Data | Metrik keberhasilan + event yang dipasang |

Bagian yang tidak berlaku ditulis `tidak berlaku` — jangan dihapus. Kosong dan tidak-berlaku berbeda.

### 3.2 Acceptance criteria

Format **Given / When / Then**, satu perilaku satu baris, tanpa "dan/atau" bertumpuk:

```
AC-1  Given operator berada di layar Input Shift dengan lini terpilih,
      When ia menekan "Kirim" sementara kolom Jumlah Output kosong,
      Then form tidak terkirim dan muncul pesan inline "Jumlah output wajib diisi" di bawah kolom tersebut.
```

Setiap story wajib mencakup:
- **Happy path** minimal 1 AC.
- **Validasi & error** minimal 1 AC per input wajib.
- **State kosong / loading / gagal koneksi** — wajib untuk semua layar yang mengambil data.
- **Hak akses** — siapa yang boleh dan apa yang terjadi kalau tidak boleh.

### 3.3 Dependensi antar story

Kolom Dependensi **hanya menunjuk user story lain** memakai ID `US-<DOMAIN>-<MODUL>-<nnn>`;
ketergantungan ke dokumen ditulis di badan story. Dependensi lintas domain wajib eksplisit —
itulah yang menentukan urutan pengerjaan antar tim. Dependensi melingkar tidak boleh ada.

### 3.4 Uji kesiapan

Story siap dikirim hanya kalau **designer bisa mulai membuat layar** dan **developer bisa mulai
menulis kode**, keduanya tanpa satu pun pertanyaan ke PO. Larangan penulisan yang paling sering
melanggar uji ini ada di [`AGENTS.md` §4](../AGENTS.md#uji-kesiapan--cukup-jelas-untuk-designer--developer).

### 3.5 Anchor UX — layar dikutip, bukan diceritakan

Setiap domain mendeklarasikan layar modulnya sendiri di `<DOMAIN>/UX/` (FOUNDATION:
[`FOUNDATION/UX/00-ux.md`](../DOMAINS/FOUNDATION/UX/00-ux.md) — ID `SCR-<DOMAIN>-<MODUL>-<nnn>`,
matriks 7 state, aturan cakupan D-1…D-4). Konsekuensinya untuk PRD:

1. **Expectation mengutip anchor, bukan mendeskripsikan layar.** Bila layar sudah
   dideklarasikan, tulis `SCR-FND-SIT-002` (plus deviasi story ini bila ada) — jangan
   menulis ulang tata letak atau daftar state.
2. **Layar yang sudah dideklarasikan tidak boleh direstate di PRD.** Satu layar satu rumah;
   PRD yang menyalin tata letak atau daftar state dari UX doc adalah cacat dokumen (prinsip yang
   sama dengan F-07 sebagai satu-satunya rumah rumus).
   **Kecuali teks layar (keputusan PO 2026-09-25):** semua teks yang dibaca user (judul, label,
   tombol, pesan state, error, konfirmasi) punya rumah di bagian *Screen text* UX doc modulnya,
   dengan key tetap. PRD **menyalin kata per kata** dan menyebut key-nya; bila beda, UX doc yang
   benar dan `prd-sync` membetulkan PRD. Teks yang belum diputuskan ditulis `TBD — PO` di UX doc —
   PRD dan implementasi tidak boleh mengarang kalimatnya sendiri
   ([`FOUNDATION/UX/00-ux.md`](../DOMAINS/FOUNDATION/UX/00-ux.md) aturan T-1…T-4).
3. **Layar belum dideklarasikan?** Story tetap boleh ditulis — Expectation-nya menjadi
   *bahan deklarasi* bagi UX doc modul terkait, dan UX doc wajib dibuat pada sesi yang sama
   saat story itu masuk PRD.
4. **Journey lintas modul** (mis. setup site oleh implementor) dikutip dari `UX-JRN-*`;
   PRD tidak menyusun ulang alurna.

### 3.6 Format Markdown — harus terbaca di GitHub **dan** Obsidian

Berlaku untuk PRD dan untuk spec/UX di repo ini. Keempat pola di bawah pernah membuat tabel, tebal, dan
miring tampil mentah di Obsidian (perbaikan 2026-09-29, prd-molcadx#19, docs-molcadx#55).

1. **Placeholder di-escape:** tulis `\<count\>`, bukan `<count>`. Tanpa backslash, `<count>` dibaca sebagai
   tag HTML yang tidak ditutup — di GitHub hilang, di Obsidian semua Markdown sesudahnya ikut mentah. Hasil
   tampilannya tetap `<count>`, jadi escape ini **tetap dihitung kata per kata** (§3.5 butir 2). Tidak perlu
   di-escape di dalam `` `code` ``, code block, atau tujuan link `](...)`. Satu-satunya tag HTML yang boleh
   dipakai: `<br>` di dalam sel tabel.
2. **Kotak rumus pakai callout, bukan `<details>`:**

   ~~~
   > [!note]- Exact formula (for developers)
   > ```
   > crosses_midnight = end_time < start_time
   > ```
   ~~~

   Obsidian tidak merender isi `<details>` dan teks sesudahnya ikut mentah. Callout terlipat di Obsidian;
   di GitHub tampil sebagai kutipan terbuka dengan `[!note]-` di baris pertama (trade-off yang diterima PO).
3. **Tabel tidak di dalam list item.** Akhiri list dulu, lalu tulis tabel tanpa indentasi, dengan baris
   kosong sebelum dan sesudahnya. Obsidian Live Preview tidak merender tabel yang ter-indentasi di bawah `-`.
4. **Tabel utuh:** ada baris pemisah `|---|` tepat di bawah header; setiap baris punya jumlah sel yang sama
   dengan header (baris yang di-retire tetap mengisi setiap kolom, pakai `—`); satu baris tabel = satu baris
   teks — jangan di-wrap, pakai `<br>` untuk pindah baris di dalam sel.

## 4. Yang wajib ada untuk **designer**

| Item | Kenapa |
|------|--------|
| Daftar layar + tujuan tiap layar | Supaya ruang lingkup desain jelas |
| Entry point & exit point tiap layar | Menentukan navigasi |
| Semua state per layar: `default / kosong / loading / error / sukses / tanpa izin` | State yang tidak disebut = tidak didesain = bug saat rilis |
| Konten & batas panjang teks (label, pesan error, angka maksimum) | Menentukan layout |
| Konteks pemakaian (perangkat, ukuran layar, kondisi cahaya, sarung tangan) | Menentukan ukuran target sentuh & kontras |
| Prioritas informasi per layar (apa yang harus terbaca dalam 3 detik) | Menentukan hierarki |

Rujukan komponen: skill `molca-web-design-system`.

## 5. Yang wajib ada untuk **developer**

| Item | Kenapa |
|------|--------|
| Entitas data + field + tipe + wajib/opsional | Bikin skema |
| Aturan bisnis & perhitungan (rumus eksplisit) | Tidak boleh ditebak dari UI |
| Sumber data tiap angka di layar | Menghindari dua definisi untuk satu angka |
| Perilaku saat offline / koneksi putus | Wajib di konteks pabrik |
| Hak akses per peran | Keamanan |
| Non-functional requirement berangka | Lihat §6 |
| Event analytics yang harus dipasang | Supaya metrik di §2 bisa diukur |
| Skenario migrasi/backfill data (kalau ada) | Menghindari kejutan saat rilis |

## 6. Non-functional requirement — wajib berangka

| Kategori | Format yang diterima | Contoh |
|----------|----------------------|--------|
| Performa | p95 latency pada kondisi X | "Layar Ringkasan Lini tampil penuh ≤2,5 detik (p95) di jaringan 3G" |
| Kapasitas | angka + satuan | "Mendukung 200 operator aktif bersamaan per pabrik" |
| Ketersediaan | persentase per periode | "99,5% uptime bulanan pada jam operasional 06:00–22:00 WIB" |
| Offline | durasi + perilaku | "Input shift tetap bisa dilakukan offline ≤8 jam, sinkron otomatis saat online" |
| Keamanan | aturan konkret | "Data produksi hanya dapat diakses user dengan peran pada pabrik yang sama" |

Kalimat seperti "harus cepat", "harus aman", "harus scalable" **ditolak** saat review.

## 7. Checklist rilis PRD

PRD tidak boleh dikirim ke Design/Engineering sebelum semua ini ✅:

- [ ] Masalah dijelaskan dengan bukti (data/riset/kutipan user), bukan asumsi tanpa label.
- [ ] Persona diambil dari [00-product-overview §3](00-product-overview.md), bukan persona baru dadakan.
- [ ] Maks. 3 tujuan, semuanya dalam format §2 lengkap dengan baseline, target, tanggal, sumber data.
- [ ] Ada primary metric dan counter-metric.
- [ ] **Setiap user story punya ID unik** `US-<DOMAIN>-<MODUL>-<nnn>` dan terdaftar di tabel modulnya.
- [ ] **Setiap user story punya 8 bagian blok detail** (§3.1); yang tidak berlaku ditulis `tidak berlaku`.
- [ ] **Setiap angka yang ditampilkan punya rumus + sumber variabel + contoh berangka + kasus tepi.**
- [ ] Kolom Dependensi hanya berisi ID user story, tidak melingkar, dan lintas domain ditulis eksplisit.
- [ ] Setiap user story punya AC Given/When/Then yang lulus/gagalnya jelas.
- [ ] Semua state layar terdaftar (default, kosong, loading, error, offline, sukses, tanpa izin).
- [ ] Aturan bisnis & rumus ditulis eksplisit, bukan tersirat dari UI.
- [ ] **Lolos uji kesiapan §3.4** — designer & developer bisa mulai tanpa bertanya ke PO.
- [ ] NFR berangka (§6).
- [ ] Event analytics terdaftar dengan nama & properti.
- [ ] Out of scope terisi.
- [ ] Semua istilah khusus ada di [01-glossary](01-glossary.md).
- [ ] Open question punya penanggung jawab & tenggat.
- [ ] Tidak ada `TBD` di bagian yang menjadi syarat mulai kerja (scope, AC, NFR).
- [ ] Format Markdown lolos §3.6 (placeholder di-escape, tanpa `<details>`, tanpa tabel di dalam list, tabel utuh).
- [ ] Perubahan sudah dicatat di [`LOGS/CHANGELOG.md`](../LOGS/CHANGELOG.md).

## 8. Penamaan & versi

- File: `PRD-<nomor>-<slug>.md` di root repo [`prd-molcadx`](https://github.com/molca-id/prd-molcadx) — contoh `prd-molcadx/PRD-001-input-laporan-shift.md`. PRD besar boleh berupa folder `PRD-<nomor>-<slug>/` (pola PRD-003).
- Versi di header: `v0.x` = draft, `v1.0` = disetujui untuk dikerjakan, naik minor tiap perubahan setelah approval.
- Setiap perubahan setelah `v1.0` wajib masuk §Decision Log di dalam PRD **dan** `LOGS/CHANGELOG.md`.
