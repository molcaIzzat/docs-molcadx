# LOGS

Catatan perubahan MolcaDx. Tujuannya: siapa pun (atau agent mana pun) bisa tahu
**apa yang berubah, kapan, dan kenapa** tanpa membaca ulang seluruh `DOCS/`.

## Isi folder

| File | Isi |
|------|-----|
| [`CHANGELOG.md`](CHANGELOG.md) | Log utama — semua perubahan `DOCS/`, `AGENTS.md`, dan skill |
| [`decisions/`](decisions/) | Keputusan produk yang butuh penjelasan panjang (satu file per keputusan) |

## Aturan

1. **Setiap perubahan di `DOCS/` atau `AGENTS.md` wajib punya satu entri** di `CHANGELOG.md`, ditulis pada sesi yang sama dengan perubahannya.
2. Entri terbaru di **paling atas**.
3. Format tanggal: `YYYY-MM-DD` (absolut, bukan "kemarin"/"minggu lalu").
4. Satu entri = satu perubahan bermakna. Perbaikan typo boleh digabung jadi satu entri.
5. Keputusan yang mengubah arah produk atau rumus metrik → buat file di `decisions/` dan tautkan dari changelog.
6. **`File terdampak` dan `Dampak` hanya merujuk ke file di repo ini** (`DOCS/`,
   `DOMAINS/`, `AGENTS.md`, PRD). **Jangan pernah menyebut repo atau path kode
   frontend/backend lain** (mis. `mes-master-data-fe-test`, `apps/web/...`, nama file
   `.tsx`) — changelog ini riwayat keputusan domain, bukan riwayat implementasi kode.
   Kalau sebuah keputusan domain kebetulan sudah dicoba di sebuah prototype, itu bukan
   bagian dari entri ini; catat hanya keputusan dan alasannya.

## Format entri

```markdown
## YYYY-MM-DD — <judul singkat>
- **Tipe:** tambah | ubah | hapus | keputusan
- **Domain:** product-owner | design-domain | ...
- **File terdampak:** `DOCS/xx-...md`, `AGENTS.md`
- **Perubahan:** apa yang berubah, singkat dan konkret.
- **Alasan:** kenapa berubah.
- **Dampak:** siapa/apa yang perlu menyesuaikan (mis. PRD-003 perlu update metrik).
```

## Format file keputusan (`decisions/YYYY-MM-DD-<slug>.md`)

```markdown
# <Judul keputusan>
- **Tanggal:** YYYY-MM-DD
- **Status:** diusulkan | disetujui | dibatalkan | digantikan oleh <link>
- **Konteks:** situasi yang memaksa keputusan ini.
- **Pilihan yang dipertimbangkan:** A, B, C — beserta trade-off.
- **Keputusan:** yang dipilih dan kenapa.
- **Konsekuensi:** yang jadi lebih mudah, yang jadi lebih sulit.
```
