# 06 — Acuan Standar: ISA-95 / IEC 62264 & ISO 22400

> Dokumen lintas domain. Rangkuman istilah & formula baku dari IEC 62264 (identik isi teknis
> dengan ANSI/ISA-95) dan ISO 22400-2, dipakai sebagai acuan bersama oleh `foundation-domain`
> dan `production-domain`. disusun berdasarkan file standar.

## 1. Equipment hierarchy (role-based)

IEC 62264-1 mendefinisikan **role-based equipment hierarchy**:

```
Enterprise → Site → Area → Work Center → Work Unit
```

Ini **hierarki posisi/fungsi**, terpisah dari **physical asset hierarchy** (aset fisik bernomor
seri, bisa dipindah/diganti). Kedua hierarki dihubungkan lewat penempatan yang time-bounded
(aset menempati work unit pada periode tertentu), bukan digabung jadi satu pohon nested — lihat
[`DOMAINS/FOUNDATION/DOCS-EN/04-asset-ontology.md` §3.2](../DOMAINS/FOUNDATION/DOCS-EN/04-asset-ontology.md#three-things-to-understand-before-anything-else).

## 2. Empat MOM domain

IEC 62264 & ISO 22400 membagi Manufacturing Operations Management (Level 3, tempat MolcaDx
beroperasi) ke empat kategori aktivitas — **MOM domain**:

- **Production** — koordinasi/eksekusi produksi (raw material, equipment, personnel → produk)
- **Quality** — pengukuran & pelaporan mutu
- **Maintenance** — ketersediaan & perawatan equipment
- **Inventory** — pergerakan & pelacakan material

> **Catatan istilah:** "MOM domain" (kategori aktivitas standar industri, di atas) berbeda dari
> "Domain" produk di [`01-glossary.md`](01-glossary.md) (area kepemilikan tim: Product,
> Foundation, Production, dst). Kedua istilah kebetulan sama-sama punya kategori "Production",
> tapi maknanya beda level.

## 3. Formula KPI inti & ketergantungan datanya

| KPI | Formula | Sumber data |
|-----|---------|-------------|
| **Availability** | `Actual production time / Planned busy time` | Riwayat status mesin (running/down) — data mentah Production domain sendiri |
| **Quality ratio** | `Good quantity / Produced quantity` | Counter baik/reject di lini — data mentah Production domain sendiri |
| **OEE** | `Availability × Effectiveness × Quality ratio` | Gabungan tiga di atas |

**Temuan penting:** meski OEE "terlihat" butuh Quality domain (karena salah satu komponennya
bernama "Quality ratio"), inputnya — good/reject count — adalah counter mentah setingkat dengan
data downtime yang sudah dipakai untuk Availability. Jadi **OEE bisa dihitung penuh dari data
Production domain sendiri**, tanpa perlu modul Quality atau Maintenance:

- **Maintenance domain tidak jadi prasyarat Availability.** MTBF/MTTF/MTTR memakai log downtime
  yang *sama* dengan Availability, tapi untuk tujuan berbeda (keandalan equipment, bukan
  ketersediaan). Berbagi sumber data mentah ≠ ketergantungan formula.
- **Quality domain tidak jadi prasyarat OEE.** Yang benar-benar butuh modul Quality tersendiri
  adalah kapabilitas statistik — Cm, Cmk, Cp, Cpk, First Pass Yield — karena perlu spec limit,
  sampling, dan perhitungan sigma/deviasi, bukan sekadar pembacaan counter.

Implikasi: `production-domain` bisa memberikan OEE/Availability/Quality ratio sebagai fitur inti
tanpa menunggu modul Quality/Maintenance dibangun; modul-modul itu adalah *upsell* untuk analisis
lebih dalam (kapabilitas proses, keandalan), bukan blocker untuk KPI headline.

## 4. Istilah tambahan

| Istilah | Arti |
|---------|------|
| **MOM** | *Manufacturing Operations Management* — Level 3 IEC 62264 (shift/jam/menit/detik); Level 4 (ERP, bulan/minggu/hari) di luar cakupan MolcaDx |
| **Work Center** | Level tempat kapasitas & OEE biasanya diukur |
| **Functional location** | = Work Unit; posisi yang bertahan walau mesinnya diganti |
| **Effectiveness (Performance)** | `(cycle_time_ideal × total_output) / actual_production_time` — komponen kedua OEE |

## 5. Referensi silang

- [`DOMAINS/FOUNDATION/DOCS-EN/04-asset-ontology.md`](../DOMAINS/FOUNDATION/DOCS-EN/04-asset-ontology.md) §3.2, §5 — equipment vs functional location, acuan standar
- [`DOMAINS/FOUNDATION/DOCS-EN/01-site-hierarchy.md`](../DOMAINS/FOUNDATION/DOCS-EN/01-site-hierarchy.md) §3.1, §5 — jenjang hierarki lengkap
- [`04-metrics-framework.md`](04-metrics-framework.md) §5 — rumus OEE/Availability/Performance/Quality yang dipakai produk
- [`01-glossary.md`](01-glossary.md) — istilah "Domain" vs "MOM domain"
