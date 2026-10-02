# docs-molcadx

Dokumen produk **MolcaDx** — platform digital transformation untuk operasional manufaktur Molca.

## Mulai dari mana

Kontrak kerja produk (daftar isi, daftar domain, aturan PRD, alur delegasi) ada di
[`AGENTS.md`](AGENTS.md). **Baca itu dulu sebelum menyentuh dokumen apa pun.**

Setiap tool AI masuk lewat pintu berbeda, semuanya menunjuk ke `AGENTS.md` yang sama:

| Tool | Pintu masuk |
|------|-------------|
| Cursor | Membaca [`AGENTS.md`](AGENTS.md) langsung |
| Claude Code | Membaca [`CLAUDE.md`](CLAUDE.md) → menunjuk ke `AGENTS.md` |
| Antigravity | Membaca [`GEMINI.md`](GEMINI.md) → menunjuk ke `AGENTS.md` |

## Struktur singkat

- [`DOCS/`](DOCS/) — dokumen lintas domain (product overview, glossary, standar PRD, metrics
  framework, ways of working, PRD).
- [`DOMAINS/`](DOMAINS/) — dokumen per domain (FOUNDATION, PRODUCTION), masing-masing punya
  `AGENTS.md` sendiri.
- [`LOGS/CHANGELOG.md`](LOGS/CHANGELOG.md) — riwayat setiap perubahan dokumen.
- [`.claude/skills/`](.claude/skills/), [`.cursor/skills/`](.cursor/skills/),
  [`.agents/skills/`](.agents/skills/) — skill per tool.

## Mendeklarasikan domain/module/feature/capability baru lewat GitHub Issue

Kadang deklarasi awal terjadi di GitHub Issue dulu, sebelum masuk ke dokumen repo. Pakai
template [`.github/ISSUE_TEMPLATE/domain-declaration.md`](.github/ISSUE_TEMPLATE/domain-declaration.md)
— template ini memaksa penulis memilih level taksonomi secara eksplisit
(lihat [`DOCS/02-domains.md`](DOCS/02-domains.md) §"Taksonomi platform (8 level)") supaya
tidak salah asumsi level seperti yang pernah terjadi (kode modul PRD dikira otomatis = Feature).
