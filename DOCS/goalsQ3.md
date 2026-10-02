# Goals Q3 — MolcaDx

> **Status: 🟡 DRAFT.** Isi tujuan & track di bawah datang dari Product Owner (7 Agustus 2026)
> dan dituliskan apa adanya. Bagian **§6 Catatan PO** memuat celah yang harus ditutup
> sebelum track ini bisa dipakai sebagai dasar PRD — lihat [03-prd-standard](03-prd-standard.md).
>
> Periode: `TBD` — kalau Q3 = Jul–Sep 2026 (kalender), periode ini sudah berjalan ~5 minggu
> saat dokumen dibuat. Konfirmasi tanggal mulai & akhir sebelum target dikunci.

---

## 1. Focus

> Build and validate the **Master Data core engine** by enabling **low code workflow creation**
> and achieving **active floor execution on live pilot lines** for **internal implementors**.

Tiga hal yang harus terbukti pada akhir kuartal:

| # | Yang harus terbukti | Bukti keberhasilan |
|---|---------------------|--------------------|
| 1 | Master data core engine berdiri | Entitas ISA-95 termodelkan dan bisa diisi tanpa perubahan kode |
| 2 | Workflow bisa dibuat tanpa koding | Implementor internal membuat workflow sendiri, tanpa developer |
| 3 | Eksekusi nyata di lini pilot | Lini pilot mencatat produksi lewat MolcaDx, bukan kertas |

**Pengguna sasaran kuartal ini: internal implementor** — bukan operator pabrik pelanggan.
Ini menggeser prioritas: kelengkapan & fleksibilitas konfigurasi lebih dulu daripada kehalusan UX massal.

## 2. Foundation

| # | Item | Status di repo |
|---|------|----------------|
| 1.1 | **Asset ontology berbasis ISA-95 → PRD** | Konsep + model ada di [F-01](../DOMAINS/FOUNDATION/DOCS-EN/04-asset-ontology.md); **PRD belum dibuat** |
| 1.2 | **Low Code Workflow Engine** | Konsep ada di [F-07](../DOMAINS/FOUNDATION/DOCS-EN/09-workflow-engine.md); **entitas & PRD belum ada** |
| 1.3 | **Monitoring and control module** | Sebagian di [03-performance](../DOMAINS/PRODUCTION/DOCS/03-performance.md); *service monitoring* (Track 1A) belum ada |

## 3. Domain

| Domain | Agent | Status |
|--------|-------|--------|
| **Production** | `production-domain` | 🟢 Aktif — [DOMAINS/PRODUCTION/AGENTS.md](../DOMAINS/PRODUCTION/AGENTS.md) |
| **Foundation** | `foundation-domain` | 🟢 Aktif — [DOMAINS/FOUNDATION/AGENTS.md](../DOMAINS/FOUNDATION/AGENTS.md) |

## 4. Modules

### 4.1 Production

| Modul | Dokumen | Status |
|-------|---------|--------|
| Production Planning | [01-planning](../DOMAINS/PRODUCTION/DOCS/01-planning.md) | 🟡 DRAFT |
| Production Performance | [03-performance](../DOMAINS/PRODUCTION/DOCS/03-performance.md) | 🟡 DRAFT |
| Production Monitoring | [02-monitoring](../DOMAINS/PRODUCTION/DOCS/02-monitoring.md) | 🟡 DRAFT |

### 4.2 Foundation (semua modul)

```
FOUNDATION
├── Asset Ontology
├── Work Master
├── Organization
├── Site Hierarchy
├── Calendar
├── Shift
├── Workflow Engine
├── Notification
├── Integration
└── Configuration Service

Work Improvement
License Manager
```

| Modul | Tercakup dokumen sekarang? |
|-------|----------------------------|
| Asset Ontology | ✅ [F-01](../DOMAINS/FOUNDATION/DOCS-EN/04-asset-ontology.md) |
| Work Master | ✅ [F-02](../DOMAINS/FOUNDATION/DOCS-EN/08-work-master.md) |
| Organization | ✅ [F-03](../DOMAINS/FOUNDATION/DOCS-EN/00-foundation.md) |
| Site Hierarchy | ✅ [F-04](../DOMAINS/FOUNDATION/DOCS-EN/01-site-hierarchy.md) |
| Calendar | ✅ [F-05](../DOMAINS/FOUNDATION/DOCS-EN/03-yearly-quarterly-declaration.md) |
| Shift | ✅ [F-06](../DOMAINS/FOUNDATION/DOCS-EN/02-shift.md) |
| Workflow Engine | 🟡 [F-07](../DOMAINS/FOUNDATION/DOCS-EN/09-workflow-engine.md) — konsep saja, entitas belum dimodelkan |
| Notification | 🟡 [F-08](../DOMAINS/FOUNDATION/DOCS-EN/10-notification.md) — konsep saja, entitas belum dimodelkan |
| Integration | 🟡 [F-09](../DOMAINS/FOUNDATION/DOCS-EN/11-integration.md) — konsep saja, entitas belum dimodelkan |
| Configuration Service | 🟡 [F-10](../DOMAINS/FOUNDATION/DOCS-EN/12-configuration-service.md) — konsep saja, entitas belum dimodelkan |
| **Work Improvement** | ❗ belum — posisinya di luar FOUNDATION, domainnya belum ditentukan |
| **License Manager** | ✅ domain ditentukan 2026-09-10 — [`DOMAINS/PLATFORM/DOCS-EN/01-license-manager.md`](../DOMAINS/PLATFORM/DOCS-EN/01-license-manager.md), konsep saja, entitas belum dimodelkan (`TBD` A-1/A-2) |

> Empat modul platform (F-07…F-10) sudah punya dokumen konsep, tapi **belum masuk model data** —
> entitasnya belum dirancang. Work Improvement masih belum punya domain; License Manager sudah
> (domain PLATFORM, 2026-09-10). Lihat [§6.3](#63-celah-cakupan).

---

## 5. Tracks & Key Results

> **Catatan penomoran:** input asli memuat **dua** track bernomor 1
> ("Monitoring and Controlling" dan "Platform and Edge Engineering"), keduanya dengan KR 1.1.
> Di sini keduanya dipisah menjadi **Track 1A** dan **Track 1B** agar setiap KR punya ID unik.
> Kalau penomoran yang dimaksud berbeda, perbaiki di sini — ID KR akan dirujuk PRD nanti.

### Track 0 — Comply and Design to ISA-95, ISO 22400, IEC 62264

**Fokus:** kepatuhan pada standar internasional sejak model data.

| KR | Isi | Keluaran |
|----|-----|----------|
| **KR 0.1** | Build ERD based on the standard | ERD yang dapat direview terhadap ISA-95 / IEC 62264 |
| **KR 0.2** | Develop a form to map the system, hardware, and data requirements — file ini menjadi jembatan dari hasil RG ke developer | Form/template pemetaan kebutuhan sistem, hardware, dan data |

> Catatan standar: **ISA-95** dan **IEC 62264** adalah standar yang sama (IEC 62264 adalah versi
> internasionalnya) — keduanya boleh disebut, tapi jangan diperlakukan sebagai dua pekerjaan terpisah.
> **ISO 22400** menetapkan definisi KPI manufaktur (termasuk OEE) — ini yang harus dicocokkan dengan
> [04-metrics-framework §5](04-metrics-framework.md).

### Track 1A — Monitoring and Controlling

**Fokus:** apps monitoring and maintenance.

| KR | Isi | Keluaran |
|----|-----|----------|
| **KR 1A.1** | Modul untuk *service monitoring* atas data yang diakuisisi | Modul pemantauan kesehatan layanan akuisisi data |

> Ini **pemantauan sistem**, berbeda dari [03-performance](../DOMAINS/PRODUCTION/DOCS/03-performance.md)
> yang memantau *produksi*. Dua hal berbeda dengan nama mirip — perlu nama yang tegas agar tidak tertukar.

### Track 1B — Platform and Edge Engineering (Backend, Data Engine)

**Fokus:** data model flexibility and offline resilience.

| KR | Isi | Keluaran |
|----|-----|----------|
| **KR 1B.1** | Database engine + hierarki aset IEC 62264, mendukung metadata JSON dinamis untuk deklarasi data tag → data pipeline | Engine + pipeline |
| **KR 1B.2** | Sync engine yang menjamin **100% data recovery (0 data loss)** saat koneksi terputus | Sync engine |

> KR 1B.2 sejalan dengan aturan offline di [02-monitoring](../DOMAINS/PRODUCTION/DOCS/02-monitoring.md)
> — "jangan pernah membuang entri operator". Definisi ujinya perlu dipertegas (lihat §6.2).

### Track 2 — Shopfloor and Application Experience (Frontend & UX)

**Fokus:** zero friction execution.

| KR | Isi | Keluaran |
|----|-----|----------|
| **KR 2.1** | Build UI untuk master data berdasarkan ERD | Layar CRUD master data |
| **KR 2.2** | Standarisasi UI berdasarkan istilah standar internasional di industri | Panduan istilah + penerapannya di UI |

> KR 2.2 bersinggungan dengan [01-glossary](01-glossary.md): istilah yang dipakai di UI harus
> istilah yang sama dengan yang terdaftar di glossary, dan glossary harus merujuk ke ISA-95/ISO 22400.

---

## 6. Catatan PO

### 6.1 Ringkasan track

| Track | Fokus | Jumlah KR | Pemilik domain |
|-------|-------|-----------|----------------|
| 0 | Kepatuhan standar | 2 | `foundation-domain` |
| 1A | Monitoring layanan | 1 | `engineering-domain` (belum dibuat) |
| 1B | Platform & edge | 2 | `engineering-domain` (belum dibuat) |
| 2 | Frontend & UX | 2 | `design-domain` (belum dibuat) |

**Konsekuensi:** 5 dari 7 KR dimiliki domain yang **belum ada agent-nya**. Untuk mengeksekusi
kuartal ini, `engineering-domain` dan `design-domain` perlu dibuat.

### 6.2 KR belum terukur

Sesuai [03-prd-standard §2](03-prd-standard.md), setiap tujuan harus berbentuk
*metrik → baseline → target → tanggal → sumber data*. Saat ini **tidak satu pun KR** memenuhi itu.
Usulan bentuk terukur (angka masih `TBD`, tunggu keputusan PO):

| KR | Bentuk terukur yang diusulkan |
|----|-------------------------------|
| 0.1 | ERD mencakup 100% entitas wajib ISA-95 Part 2 yang relevan, lolos review checklist kepatuhan pada `TBD` |
| 0.2 | Form dipakai pada ≥`TBD` sesi RG, dan ≥`TBD`% hasilnya bisa dipakai developer tanpa klarifikasi ulang |
| 1A.1 | Kegagalan akuisisi data terdeteksi ≤`TBD` menit sejak terjadi, cakupan `TBD`% layanan |
| 1B.1 | Menambah satu tipe aset + data tag baru tanpa perubahan kode & tanpa migrasi, ≤`TBD` menit |
| 1B.2 | 0 entri hilang pada uji putus koneksi `TBD` jam × `TBD` skenario; 100% tersinkron ≤`TBD` menit setelah pulih |
| 2.1 | Semua entitas master data punya layar CRUD; implementor menyelesaikan setup 1 site ≤`TBD` jam tanpa bantuan developer |
| 2.2 | ≥`TBD`% istilah UI cocok dengan glossary & ISO 22400; 0 istilah bertentangan |

**Metrik utama kuartal (usulan):** jumlah lini pilot yang **aktif mencatat produksi harian**
lewat MolcaDx pada akhir kuartal. Ini satu-satunya angka yang membuktikan ketiga fokus di §1
sekaligus. Target: `TBD`.

**Counter-metric (usulan):** waktu setup satu site oleh implementor tidak boleh naik seiring
bertambahnya modul — fleksibilitas tidak boleh dibayar dengan kerumitan konfigurasi.

### 6.3 Celah cakupan

| Celah | Dampak |
|-------|--------|
| **Workflow Engine** baru punya konsep ([F-07](../DOMAINS/FOUNDATION/DOCS-EN/09-workflow-engine.md)), entitas belum dirancang | Masih pekerjaan terbesar di kuartal ini. Pertanyaan penghalang: alur apa saja yang harus bisa dibuat implementor (Q3-3). |
| **Notification, Integration, Configuration Service** sudah punya konsep (F-08…F-10) tapi belum masuk model data | FOUNDATION saat ini memodelkan data, belum layanan platform. Cakupan `foundation-domain` perlu diperluas atau dipecah. |
| **Work Improvement** ditulis di luar blok FOUNDATION | Domainnya belum ditentukan. Perlu keputusan PO: masuk domain mana. |
| ~~**License Manager** ditulis di luar blok FOUNDATION~~ | **Selesai 2026-09-10** — domain `platform-domain` dibuat, lihat `DOMAINS/PLATFORM/AGENTS.md`. Entitas entitlement tenant↔domain masih `TBD` (A-1/A-2), tapi kepemilikan domainnya sudah tidak lagi celah |
| `engineering-domain` & `design-domain` belum ada | Pemilik 5 dari 7 KR |
| Track 1A vs P-02: dua "monitoring" berbeda | Risiko tertukar di PRD dan di UI |

### 6.4 Ketergantungan urutan

```
Track 0 (ERD & standar)
   └─→ Track 1B (engine di atas ERD)
          └─→ Track 2.1 (UI master data di atas ERD)
   └─→ Workflow Engine  ── prasyarat "low code" di fokus §1
Track 1A ── independen
Track 2.2 ── independen, tapi memperbarui 01-glossary
```

KR 2.1 secara eksplisit bergantung pada KR 0.1 ("UI berdasarkan ERD"). Kalau ERD selesai terlambat,
Track 2 ikut mundur — ini jalur kritis kuartal ini.

### 6.5 Pertanyaan terbuka

| # | Pertanyaan | Penanggung jawab | Prioritas |
|---|-----------|------------------|-----------|
| Q3-1 | Tanggal mulai & akhir kuartal ini? | PO | 🔴 |
| Q3-2 | Berapa lini pilot, di site mana? | PO + ops | 🔴 |
| Q3-3 | Apa cakupan "Low Code Workflow Engine" — workflow apa yang harus bisa dibuat implementor? | PO | 🔴 |
| Q3-4 | Angka target untuk 7 KR di §6.2 | PO | 🔴 |
| Q3-5 | Apakah `engineering-domain` & `design-domain` dibuat sekarang? | PO | 🔴 |
| Q3-6 | "RG" pada KR 0.2 singkatan dari apa? Belum ada di [glossary](01-glossary.md) | PO | 🟠 |
| Q3-7 | Work Improvement masuk domain mana? (License Manager **selesai** 2026-09-10 — domain `platform-domain`) | PO | 🟠 |
| Q3-8 | Penomoran track: dua "Track 1" disengaja atau salah tulis? | PO | 🟠 |
| Q3-9 | Apakah ISO 22400 dijadikan acuan wajib untuk semua KPI di `04-metrics-framework`? | PO | 🟠 |
