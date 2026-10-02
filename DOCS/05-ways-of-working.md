# 05 — Ways of Working

Alur kerja antara Product Owner (orchestrator), agent domain, designer, dan developer.

## 1. Peran Product Owner sebagai orchestrator

PO tidak mengerjakan semua domain. PO:
1. Menerima permintaan dari user/stakeholder.
2. Menentukan domain mana yang terlibat ([02-domains](02-domains.md)).
3. Menyiapkan konteks (dokumen `DOCS/` mana yang relevan) sebelum mendelegasikan.
4. Menggabungkan hasil, menjaga konsistensi istilah & metrik.
5. Mencatat keputusan dan perubahan di `LOGS/`.

## 2. Alur dari permintaan sampai rilis

| Tahap | Pemilik | Keluaran | Syarat lanjut |
|-------|---------|----------|---------------|
| 1. Permintaan masuk | PO | Catatan masalah + siapa yang terdampak | Masalah jelas, bukan solusi |
| 2. Discovery | PO (+ `ops-domain`) | Bukti masalah, baseline metrik | Ada bukti, bukan asumsi |
| 3. **PRD** *(hanya saat PO minta)* | PO | PRD sesuai [03-prd-standard](03-prd-standard.md) | Lolos checklist §7 |
| 4. Desain | `design-domain` | Flow + spec layar semua state | Semua state PRD tercakup |
| 5. Technical design | `engineering-domain` | API contract, data model, estimasi | Semua NFR terjawab |
| 6. Implementasi | Developer | Kode + event analytics terpasang | AC lulus |
| 7. Validasi metrik | `data-domain` | Angka aktual vs target PRD | Ada keputusan lanjut/iterasi/rollback |

Tahap 4 dan 5 boleh berjalan paralel; keduanya membaca PRD yang sama.

## 3. Aturan pemicu (penting)

| Kejadian | Yang dilakukan agent |
|----------|----------------------|
| User minta ide / diskusi / analisis | Jawab langsung. **Jangan** membuat PRD. |
| User minta "buatkan PRD untuk X" | Baru buat PRD, pakai template + checklist. |
| User minta domain baru | Jalankan skill `molca-domain-agent`, lalu daftarkan di `AGENTS.md` §3 dan [02-domains](02-domains.md). |
| User minta versi PDF | Jalankan skill `anthropic-skills:pdf` atas dokumen yang diminta. |
| Ada dokumen `DOCS/` berubah | Tambah entri di [`LOGS/CHANGELOG.md`](../LOGS/CHANGELOG.md) pada sesi yang sama. |

## 4. Definition of Ready (sebelum developer/designer mulai)

- [ ] PRD berstatus `v1.0` (disetujui).
- [ ] Tidak ada `TBD` di scope, AC, dan NFR.
- [ ] Dependensi ke domain lain sudah dijawab, bukan "menunggu".
- [ ] Metrik & event sudah didefinisikan (bisa dipasang bersamaan dengan fitur).

## 5. Definition of Done

- [ ] Semua AC lulus dan diverifikasi.
- [ ] Semua state layar terimplementasi (termasuk kosong/error/offline).
- [ ] Event analytics terpasang & terlihat di sumber data.
- [ ] NFR diukur, bukan diasumsikan.
- [ ] Dokumen terdampak di `DOCS/` diperbarui + entri di `LOGS/`.

## 6. Penanganan ketidakpastian

Urutan yang benar saat informasi kurang:
1. Cek `DOCS/` — mungkin sudah dijawab.
2. Kalau tetap tidak ada: tulis `TBD — perlu konfirmasi PO` beserta **pertanyaan spesifik** dan **penanggung jawab**.
3. Kerjakan bagian yang tidak bergantung pada jawaban itu.
4. Jangan mengisi dengan tebakan yang terbaca seperti fakta.
