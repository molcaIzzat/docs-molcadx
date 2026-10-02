# 04 — Metrics Framework

Cara MolcaDx mendefinisikan angka. Tujuannya satu: **setiap metrik di PRD bisa di-query, bukan diperdebatkan.**

## 1. Anatomi satu metrik

Setiap metrik wajib punya 7 bagian:

| Bagian | Contoh |
|--------|--------|
| Nama | `waktu_input_laporan_shift` |
| Definisi kalimat | Selisih waktu antara operator membuka form input shift dan berhasil mengirimnya |
| Rumus | `median(shift_report_submitted.ts − shift_report_started.ts)` |
| Sumber data | Event analytics `shift_report_started`, `shift_report_submitted` |
| Populasi | Operator aktif, per shift selesai, tidak termasuk sesi yang dibatalkan |
| Baseline | 12 menit (survei manual, Juli 2026, n=TBD) |
| Target & tanggal | ≤4 menit, 30 hari setelah rilis |

Metrik tanpa rumus dan sumber data **tidak sah** dipakai di PRD.

## 2. Tiga lapis metrik

| Lapis | Pertanyaan | Contoh |
|-------|-----------|--------|
| **Outcome** | Apakah bisnis/operasional membaik? | Downtime tidak tercatat turun; OEE naik |
| **Product** | Apakah produk dipakai sesuai maksud? | % shift yang laporannya masuk lewat MolcaDx |
| **Behavior/health** | Apakah pengalaman pakainya sehat? | Waktu input, error rate form, crash-free session |

PRD fitur biasanya menargetkan **product + behavior**, dan menyebutkan outcome mana yang didukung.

## 3. Counter-metric

Setiap PRD wajib menyebut minimal satu metrik yang **tidak boleh memburuk**.
Contoh: mempercepat input shift tidak boleh menaikkan `tingkat_koreksi_laporan` (laporan yang diedit setelah kirim) di atas baseline + 2pp.

## 4. Konvensi event

- Nama event: `snake_case`, `objek_aksi` (lampau) — `shift_report_submitted`, `downtime_logged`.
- Properti wajib di semua event: `user_id`, `role`, `plant_id`, `line_id`, `shift_id`, `client_ts`, `server_ts`, `app_version`, `is_offline_sync`.
- Event dicatat di *tracking plan* milik `data-domain`; PRD hanya mendaftarkan event yang dibutuhkan metriknya.
- Karena kondisi offline nyata di pabrik, **selalu** bedakan `client_ts` (saat kejadian) dan `server_ts` (saat diterima). Metrik durasi memakai `client_ts`.

## 5. Metrik operasional (OEE family)

Rumus Availability/Performance/Quality/OEE/MTBF/MTTR **tidak dinyatakan ulang di sini**.
Satu rumus, satu rumah: [F-07](../DOMAINS/FOUNDATION/DOCS-EN/07-0-kpi-formula.md) (basis ISO 22400-2,
dikutip langsung dari standar) dan [F-07.1](../DOMAINS/FOUNDATION/DOCS-EN/07-1-kpi-tag-mapping.md)
(pengisian per work unit dari tag/entitas Foundation). Dokumen ini soal metrik
produk/behavior (§1–4, §6–7) — bukan tempat KPI manufaktur direstate. Angka yang muncul
di layar wajib menyebut rumus F-07 mana yang dipakai; jangan turunkan rumus baru dari
tabel ini karena tabelnya sudah tidak ada.

## 6. Aturan baseline

1. Kalau baseline belum ada, PRD boleh terbit dengan `baseline: belum diukur — diukur [cara] sebelum [tanggal]`, tapi **target tidak boleh dikunci** sebelum baseline ada.
2. Baseline dari survei/observasi manual wajib menyebut metode dan jumlah sampel.
3. Baseline diperbarui maksimal sekali per kuartal; perubahan dicatat di `LOGS/`.

## 7. Kapan metrik dinyatakan gagal

Tentukan di PRD sejak awal: *jika setelah [periode] metrik primary tidak mencapai [ambang], maka [tindakan: iterasi / rollback / hentikan]*. Tanpa ini, tidak ada mekanisme belajar.
