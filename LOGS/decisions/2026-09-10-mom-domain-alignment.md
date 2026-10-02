# Keputusan — Selaraskan pembagian domain MolcaDx ke MOM domains IEC 62264/ISA-95 (2026-09-10)

## Konteks

MolcaDx baru punya dua domain aktif: FOUNDATION dan PRODUCTION ([`AGENTS.md`](../../AGENTS.md) §3).
Standar IEC 62264 (ISA-95) — acuan yang dipakai tim untuk membelah *Manufacturing Operations
Management* (MOM) — membagi operasi pabrik jadi empat domain: **Production**, **Quality**,
**Maintenance**, **Inventory**, di atas satu lapisan *shared object model* (definisi equipment,
material, personnel yang dipakai keempatnya). Apa yang sedang dibangun sebagai FOUNDATION
memainkan peran lapisan bersama itu, bukan salah satu dari empat domain operasi.

Masalahnya: keempat domain MOM itu tidak eksplisit di `AGENTS.md` §3. "Direncanakan" hanya
mencatat Design/Engineering/Data/Ops — generik, bukan turunan MOM. Tanpa peta ini, keputusan
"field/entitas ini masuk FOUNDATION atau bukan" diambil kasus per kasus tanpa kerangka yang
konsisten, dan berisiko FOUNDATION diam-diam menyerap data eksekusi salah satu domain operasi
(seperti yang sudah terjadi sekali pada `WORK_ORDER`).

## Keputusan

1. **FOUNDATION = shared object model ISA-95**, bukan salah satu dari empat domain MOM. Isinya
   definisi/taksonomi yang dipakai bersama: site hierarchy, shift/fiscal calendar, equipment
   taxonomy, reference data, product, KPI formula, work master (routing/BOM/defect code sebagai
   *resep*, bukan *instans eksekusi*), workflow/notification/integration/configuration (concept),
   data source.
2. **Aturan pembelah** (dipakai untuk setiap keputusan scope FOUNDATION selanjutnya):
   - Definisi/taksonomi/master data ("apa itu X", "cara membuat X") → **FOUNDATION**.
   - Instans eksekusi/transaksional ("X terjadi pada waktu Y", histori kejadian, catatan hasil
     kerja) → **domain MOM pemiliknya** (Production/Quality/Maintenance/Inventory), bukan FOUNDATION.
   - Preseden yang sudah berjalan: `WORK_ORDER`/`WORK_ORDER_OPERATION` pindah dari FOUNDATION
     (F-08 Work Master) ke PRODUCTION (modul Job Schedule) pada
     [keputusan 2026-09-03](2026-09-03-foundation-contest-blockers.md) — alasannya persis pola
     ini: data transaksional vs data master. Setiap kandidat baru (mis. histori instalasi
     komponen, catatan perbaikan, hasil inspeksi kualitas, mutasi stok) diuji dengan pola yang
     sama sebelum dianggap milik FOUNDATION.
3. **Empat domain MOM didaftarkan eksplisit** di `AGENTS.md` §3 "Direncanakan": Quality,
   Maintenance, Inventory ditambahkan sebagai domain yang belum dibuat, sejajar dengan PRODUCTION
   yang sudah aktif. Design/Engineering/Data adalah domain pendukung platform (bukan turunan MOM)
   dan tetap terdaftar terpisah — tidak dihapus, hanya tidak dicampur dengan taksonomi MOM.
4. **Tidak membuat domain baru sesi ini.** Menambahkan Quality/Maintenance/Inventory ke tabel
   "Direncanakan" bukan berarti foldernya/agent-nya dibuat — itu tetap menunggu PO memanggil
   skill `molca-domain-agent` saat salah satunya dibutuhkan.

## Konsekuensi

- `AGENTS.md` §3 diperbarui: baris FOUNDATION dapat catatan "berperan sebagai shared object model
  ISA-95, bukan domain MOM ke-5"; tabel "Direncanakan" dapat tiga baris baru (Quality,
  Maintenance, Inventory) dengan cakupan awal yang masih kasar (akan diperjelas saat domain itu
  benar-benar dibuat).
- Kandidat yang sedang berjalan (mis. histori instalasi komponen yang baru masuk FOUNDATION,
  lihat commit `69c99fa`) **tidak otomatis dipindah** oleh keputusan ini — ini kerangka penilaian,
  bukan migrasi. Kalau nanti histori itu ternyata catatan kejadian pemeliharaan (bukan sekadar
  lineage struktural asset), maka aturan §2 di atas berlaku dan perlu keputusan pemindahan
  terpisah, sama seperti `WORK_ORDER`.
- Setiap kali `foundation-domain` mengajukan entitas/field baru yang terasa seperti "catatan
  kejadian" (punya timestamp kejadian, dicatat live oleh shopfloor/teknisi/QC/gudang), PO
  mengujinya dengan aturan §2 sebelum menyetujuinya masuk FOUNDATION.

## Tindak lanjut

1. `AGENTS.md` §3 — tambah tiga baris "Direncanakan" (Quality, Maintenance, Inventory) + catatan
   FOUNDATION-sebagai-shared-object-model, dengan pointer ke dokumen ini.
2. Belum ada aksi ke `DOMAINS/FOUNDATION/DOCS-EN/` sesi ini — dokumen ini kerangka penilaian,
   bukan audit ulang isi FOUNDATION saat ini. Audit isi FOUNDATION terhadap aturan §2 (termasuk
   histori instalasi komponen) adalah pekerjaan terpisah, belum dijadwalkan.

**Selesai, 2026-09-10 (sesi lanjutan, sama hari):** PO meminta audit itu dijalankan segera —
tidak menunggu sesi terpisah. Domain **MAINTENANCE** dibuat (`molca-domain-agent`), dan
`ASSET_COMPONENT_LINK`/`SCR-FND-AST-006`/`US-FND-AST-005` dipindah ke sana dari FOUNDATION,
sesuai aturan §2 di atas. Detail lengkap di [`LOGS/CHANGELOG.md`](../CHANGELOG.md) entri
tanggal yang sama.
