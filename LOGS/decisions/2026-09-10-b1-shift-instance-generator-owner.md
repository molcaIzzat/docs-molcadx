# Keputusan — B1 ditutup: `production-domain` memiliki generator `SHIFT_INSTANCE` (2026-09-10)

## Konteks

[B1](2026-09-03-foundation-contest-blockers.md#b1--generator-shift_instance-tidak-berpemilik-f-02-h-6)
(2026-09-03) menunda kepemilikan mekanisme generate `SHIFT_INSTANCE` — konsekuensinya F-02
(Shift) diturunkan dari `ACTIVE` ke `DRAFT` sampai ada pemilik. Timing sudah diputuskan
(harian, sebelum business day mulai) dan aturan sudah diputuskan (tidak boleh duplikat/gap
per site+shift+date) — yang belum ada hanya **siapa membangun mekanismenya**.

F-02 §9.3 dan FLOW-03 sudah lama menyebut `production-domain` sebagai kandidat paling mungkin
(memiliki FLOW-03/FLOW-04 yang berdekatan), tapi itu asumsi kerja, bukan keputusan PO.

Sempat dipertimbangkan: menaruhnya di FOUNDATION karena FOUNDATION memiliki skema
`SHIFT_INSTANCE`. **Ditolak** — F-02 sendiri sudah menyatakan dua kali bahwa mekanisme
generate ini eksplisit di luar cakupan FOUNDATION; memindahkannya ke FOUNDATION mengulang
pola yang baru saja dikoreksi untuk `ASSET_COMPONENT_LINK` (kepemilikan skema entitas ≠
kepemilikan proses yang mengisinya seiring waktu, lihat
[keputusan MOM domain alignment](2026-09-10-mom-domain-alignment.md)). "Worker backend" (cron/
scheduler) adalah masalah `engineering-domain` terlepas dari domain bisnis mana yang
memilikinya — tidak relevan untuk keputusan kepemilikan ini.

## Keputusan

**`production-domain` memiliki mekanisme generate `SHIFT_INSTANCE`** (H-6, H-7), termasuk:
- Menjalankan proses harian yang membuat baris `SHIFT_INSTANCE` untuk setiap `SITE_SHIFT`
  aktif, sebelum business day dimulai.
- Menegakkan aturan yang sudah ditetapkan FOUNDATION (tanpa duplikat, tanpa gap per
  site+shift+date — F-02 §9.3).
- Menjawab H-7: mengisi PBT dari POT − planned downtime di lapisan KPI, tidak pernah menulis
  PBT ke `SHIFT_INSTANCE` itu sendiri.

FOUNDATION tetap memiliki skema `SHIFT_INSTANCE` (F-02 §9.3) dan aturan yang harus
ditegakkan; FOUNDATION tidak membangun atau menjalankan mekanismenya.

**Satu `SHIFT_INSTANCE` per site+shift+date, dipakai bersama oleh semua domain MOM.**
`production-domain` generate sekali; `SHIFT_INSTANCE` yang sama itu — bukan salinan —
dibaca lewat FK oleh domain MOM lain yang butuh konteks waktu (MAINTENANCE hari ini
untuk mencatat kapan sebuah perawatan terjadi; Quality/Inventory nanti). Tidak ada
generator kedua di domain lain: kalau MAINTENANCE (atau domain MOM manapun) butuh
`shift_instance_id`, ia FK ke baris yang sama yang dibuat `production-domain`, persis
pola yang sudah dipakai `WORK_ORDER_OPERATION` hari ini (F-02 "How the entities
connect"). Ini konsisten dengan FOUNDATION sebagai *shared object model* — kalau setiap
domain MOM generate `SHIFT_INSTANCE`-nya sendiri, itu justru menghidupkan kembali
masalah "dua sumber kebenaran" yang FOUNDATION dirancang untuk mencegah.

## Konsekuensi

- F-02 (Shift) kembali ke status `ACTIVE` — satu-satunya blocker (kepemilikan generator)
  sudah selesai.
- `DOMAINS/PRODUCTION/AGENTS.md` menambahkan kepemilikan ini ke cakupannya.
- FLOW-03 diperbarui: peringatan "mechanism owner unassigned" dihapus, statusnya sudah
  terkonfirmasi PO (sebelumnya asumsi kerja `foundation-domain`, sekarang keputusan resmi).
- Implementasi teknis mekanisme (worker/cron/queue) tetap didelegasikan ke
  `engineering-domain` saat technical design — ini bukan bagian dari keputusan kepemilikan
  domain bisnis.

## Tindak lanjut

1. `foundation-domain`: revert status F-02 → `ACTIVE` di `02-shift.md`, `DOCS-EN/README.md`,
   `FOUNDATION/AGENTS.md` §2, dan ERD note di `00-foundation.md`.
2. `production-domain`: daftarkan kepemilikan generator `SHIFT_INSTANCE` di
   `DOMAINS/PRODUCTION/AGENTS.md` §1/§3.
3. Perbarui `FLOW-03` (`DOMAINS/FOUNDATION/FLOW/03-shift-generation.md`) — hapus tanda ⚠
   "unassigned," catat keputusan ini.
4. Catat di `LOGS/CHANGELOG.md` pada sesi yang sama.
