# PRD-\<nomor\> — \<Nama Fitur\>

| | |
|---|---|
| **Versi** | v0.1 (draft) |
| **Tanggal** | YYYY-MM-DD |
| **Penulis** | product-owner |
| **Status** | Draft / Review / Approved / Shipped |
| **Domain terlibat** | design-domain, engineering-domain, data-domain |
| **Reviewer** | \<nama designer\>, \<nama developer\> |

> Isi PRD ini wajib lolos checklist [DOCS/03-prd-standard §7](../03-prd-standard.md#7-checklist-rilis-prd).
> Hapus semua petunjuk dalam kutipan sebelum status Approved.

---

## 1. Masalah

> Apa yang salah hari ini, siapa yang terdampak, seberapa sering, dan buktinya apa.

| Masalah | Terdampak | Frekuensi | Bukti |
|---------|-----------|-----------|-------|
| | | | |

## 2. Target user

> Ambil dari [00-product-overview §3](../00-product-overview.md). Jangan bikin persona baru.

| Persona | Kebutuhan dalam konteks fitur ini | Konteks pemakaian (perangkat, lokasi, kondisi) |
|---------|-----------------------------------|------------------------------------------------|
| | | |

## 3. Tujuan & metrik (maks. 3)

| # | Metrik | Baseline | Target | Tanggal ukur | Sumber data |
|---|--------|----------|--------|--------------|-------------|
| G1 (primary) | | | | | |
| G2 | | | | | |
| Counter-metric | | | tidak boleh memburuk dari | | |

**Kriteria gagal:** jika pada \<tanggal\> G1 belum mencapai \<ambang\>, maka \<iterasi / rollback / hentikan\>.

## 4. Scope

**Termasuk**
- 

**Tidak termasuk (out of scope)**
- 

**Asumsi**
- 

## 5. User story

> Dikelompokkan **Domain → Modul**. Aturan lengkap: [AGENTS.md §4](../../AGENTS.md#4-format-prd--berbasis-user-story).
> ID: `US-<DOMAIN>-<MODUL>-<nnn>` — permanen, tidak pernah dipakai ulang.

### 5.1 \<Judul Domain\>

#### \<Judul Modul\>

| ID | Judul User Story | Penjelasan | Dependensi |
|----|------------------|------------|------------|
| [`US-XXX-YYY-001`](#us-xxx-yyy-001) | | Sebagai **\<persona\>**, saya ingin **\<aksi\>**, agar **\<hasil\>**. → [detail](#us-xxx-yyy-001) | `—` |
| [`US-XXX-YYY-002`](#us-xxx-yyy-002) | | Sebagai **\<persona\>**, saya ingin **\<aksi\>**, agar **\<hasil\>**. → [detail](#us-xxx-yyy-002) | `US-XXX-YYY-001` |

> Ulangi blok Domain → Modul → tabel untuk setiap domain & modul yang terlibat.

---

## 6. Blok detail user story

> Satu blok per story. **Delapan bagian wajib** — yang tidak berlaku ditulis `tidak berlaku`,
> jangan dihapus. Story siap dikirim hanya kalau designer bisa mulai membuat layar **dan**
> developer bisa mulai menulis kode, keduanya tanpa bertanya ke PO.

### US-XXX-YYY-001

**\<judul\>**

> Heading **hanya ID**, judul di baris tebal di bawahnya. Dengan begitu anchor `#us-xxx-yyy-001`
> dari tabel di atas jalan di GitHub **dan** Obsidian (Obsidian tidak mengenal slug gaya GitHub
> untuk heading yang berisi spasi).

| Bagian | Isi |
|--------|-----|
| **Story** | Sebagai **\<persona dari §2\>**, saya ingin **\<aksi\>**, agar **\<hasil\>**. |
| **Konteks** | Masalah nyata + buktinya. Kondisi pemakaian: perangkat, lokasi, jaringan, keterbatasan fisik. |
| **Expectation** | **Default:** … **Kosong:** … **Loading:** … **Error:** … **Offline:** … **Sukses:** … **Tanpa izin:** … <br>*Ditulis dari sisi user, bukan sisi sistem. Sebutkan apa yang terbaca lebih dulu, teks persisnya, dan batas panjangnya.* <br>*Layar sudah dideklarasikan di `<DOMAIN>/UX/`? Kutip anchor-nya (`SCR-…`) + deviasi story ini — jangan restate layar ([03-prd-standard §3.5](../03-prd-standard.md)).* |
| **Cara kalkulasi** | Rumus: `…`<br>Sumber tiap variabel (sampai nama field): …<br>Contoh berangka: …<br>Kasus tepi (pembagian nol, data tidak lengkap, nilai di luar batas): …<br>*Tulis `tidak berlaku` kalau story ini tidak menampilkan atau menghitung angka.* |
| **Data & entitas** | Baca: … Tulis: … <br>*Hanya entitas & field yang ada di [FOUNDATION](../../DOMAINS/FOUNDATION/DOCS-EN/00-foundation.md). Butuh field baru → ajukan ke PO.* |
| **Aturan & batasan** | Validasi per field + pesan error persisnya · Hak akses per peran + perilaku saat ditolak · Perilaku offline · Aturan koreksi · Batas nilai |
| **Acceptance criteria** | **AC-1** Given …, When …, Then …<br>**AC-2 (validasi)** …<br>**AC-3 (error/offline)** …<br>**AC-4 (hak akses)** … |
| **Metrik & event** | Metrik: `<nama>` baseline `<x>` → target `<y>` pada `<tanggal>`, sumber `<event/tabel>` · Counter-metric: … · Event: `<nama_event>` (`properti`) |
| **Dependensi** | `US-…`, `US-…` — atau `—` |

### `US-XXX-YYY-002` — \<judul\>

…

---

## 7. Lintas story

> Hal yang berlaku untuk **seluruh PRD**, bukan satu story. Detail per story ada di §6 —
> jangan diulang di sini.

### 7.1 Peta layar (untuk Designer)
| Layar | Tujuan | Story yang dilayani | Entry point | Exit point |
|-------|--------|---------------------|-------------|------------|
| | | `US-…` | | |

**Prioritas informasi:** apa yang harus terbaca dalam 3 detik pertama di tiap layar.

### 7.2 Ringkasan entitas (untuk Developer)
| Entitas | Dibaca story | Ditulis story | Field baru yang dibutuhkan |
|---------|--------------|---------------|-----------------------------|
| | `US-…` | `US-…` | `—` / ajukan ke `foundation-domain` |

### 7.3 Hak akses
| Peran | Boleh | Tidak boleh | Perilaku saat ditolak |
|-------|-------|-------------|------------------------|
| | | | |

### 7.4 Perilaku offline
| Aksi | Saat offline | Saat sinkron kembali | Konflik data |
|------|--------------|----------------------|--------------|
| | | | |

### 7.5 Non-functional requirement (wajib berangka)
| Kategori | Requirement | Cara verifikasi |
|----------|-------------|-----------------|
| Performa | | |
| Kapasitas | | |
| Ketersediaan | | |
| Offline | | |
| Keamanan | | |

### 7.6 Migrasi / backfill
> Isi kalau ada data lama. Kalau tidak ada, tulis "tidak ada".

## 8. Instrumentasi (untuk data-domain)

| Event | Pemicu | Properti tambahan | Story | Metrik yang dilayani |
|-------|--------|-------------------|-------|----------------------|
| | | | `US-…` | |

> Properti wajib global ada di [04-metrics-framework §4](../04-metrics-framework.md).

## 9. Rilis

| Aspek | Isi |
|-------|-----|
| Tahapan rilis | (mis. 1 lini pilot → 1 pabrik → seluruh pabrik) |
| Urutan story | Urutan pengerjaan hasil kolom Dependensi §5 — sebutkan jalur kritisnya |
| Kriteria naik tahap | |
| Rencana rollback | |
| Perubahan SOP / pelatihan user | |

## 10. Risiko

| Risiko | Dampak | Kemungkinan | Mitigasi | Pemilik |
|--------|--------|-------------|----------|---------|
| | | | | |

## 11. Open questions

| # | Pertanyaan | Penanggung jawab | Tenggat | Status |
|---|-----------|------------------|---------|--------|
| Q1 | | | | |

## 12. Decision log

| Tanggal | Keputusan | Alasan | Diputuskan oleh |
|---------|-----------|--------|-----------------|
| | | | |
