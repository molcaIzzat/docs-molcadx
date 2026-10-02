# 00 — Product Overview: MolcaDx

> **Status: 🟡 DRAFT.** Dokumen ini adalah kerangka awal yang disusun Product Owner.
> Bagian bertanda `TBD` belum divalidasi ke stakeholder dan **tidak boleh** dipakai
> sebagai fakta di PRD sebelum dikonfirmasi.

## 1. Satu kalimat

MolcaDx adalah platform *digital transformation* yang membawa operasional pabrik dari
proses berbasis kertas/spreadsheet ke proses digital yang terukur — dalam satu sistem
yang terhubung dengan lini produksi.

## 2. Masalah yang dituju

| # | Masalah | Bukti / sumber | Status |
|---|---------|----------------|--------|
| P1 | Data operasional pabrik tersebar di spreadsheet & kertas, tidak real-time | TBD | belum divalidasi |
| P2 | Keputusan produksi diambil dari laporan yang telat (harian/mingguan) | TBD | belum divalidasi |
| P3 | Tidak ada satu sumber kebenaran untuk performa lini/mesin | TBD | belum divalidasi |

## 3. Target user

| Persona | Peran | Kebutuhan utama | Frekuensi pakai |
|---------|-------|-----------------|-----------------|
| Operator lini | Input & eksekusi | Input cepat, minim ketik, tahan sarung tangan | Setiap shift |
| Supervisor produksi | Kontrol harian | Lihat status lini, tindak lanjut anomali | Beberapa kali/hari |
| Manajer pabrik | Keputusan | Tren performa, bandingkan lini/periode | Harian–mingguan |
| Admin/IT pabrik | Konfigurasi | Kelola user, master data, integrasi mesin | Sesekali |

> TBD: konfirmasi persona mana yang jadi *primary user* untuk rilis pertama.

## 4. Value proposition

- **Untuk supervisor & manajer:** visibilitas kondisi produksi mendekati real-time, bukan laporan H+1.
- **Untuk operator:** input yang lebih cepat daripada form kertas, tanpa kerja ganda.
- **Untuk perusahaan:** basis data operasional yang konsisten untuk perbaikan berkelanjutan.

## 5. Prinsip produk

1. **Shopfloor-first.** Dipakai berdiri, sambil kerja, layar kecil, tangan kotor. Desktop menyusul.
2. **Terukur sejak awal.** Fitur tanpa metrik keberhasilan tidak masuk PRD.
3. **Tidak menambah kerja ganda.** Kalau digital ≠ menggantikan kertas, fitur itu gagal.
4. **Toleran koneksi buruk.** Jaringan pabrik tidak bisa diasumsikan stabil.
5. **Satu sumber kebenaran.** Setiap angka punya satu definisi (lihat [04-metrics-framework](04-metrics-framework.md)).

## 6. Batasan awal

| Batasan | Keterangan | Status |
|---------|------------|--------|
| Platform | TBD — web responsive dulu, atau mobile native? | perlu keputusan PO |
| Integrasi mesin/IoT | TBD — ada PLC/sensor yang bisa dibaca? | perlu konfirmasi teknis |
| Bahasa | UI berbahasa Inggris secara default, dengan pemilih bahasa `en`/`id`. Istilah di kedua bahasa wajib sesuai [01-glossary](01-glossary.md) dan ISO 22400 (KR 2.2). Menggantikan "seluruh UI berbahasa Indonesia" (PO, 2026-10-02, prd-molcadx#24 item 22) | diputuskan |
| Deployment | TBD — cloud, on-prem, atau hybrid (kebijakan data pabrik) | perlu konfirmasi |

## 7. Di luar cakupan (untuk saat ini)

- Modul finansial/akuntansi penuh (ERP).
- HRIS / payroll.
- Modul VR/AR — ada di lini produk Molca lain, bukan MolcaDx.

## 8. Pertanyaan terbuka untuk PO

1. Rilis pertama menyasar pabrik/lini yang mana, dan berapa user?
2. Apa satu metrik utama yang menyatakan MolcaDx berhasil? (lihat [04](04-metrics-framework.md))
3. Sistem apa yang sudah ada dan harus diintegrasikan/digantikan?
4. Siapa pembeli vs siapa pemakai — apakah orang yang sama?
