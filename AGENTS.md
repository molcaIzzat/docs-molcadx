# AGENTS.md — MolcaDx

Daftar isi & kontrak kerja untuk semua agent yang bekerja di repo ini.
**Baca file ini lebih dulu sebelum mengerjakan apa pun.**

- **Produk:** MolcaDx — platform *Digital Transformation* untuk operasional manufaktur Molca.
- **Owner:** Product Owner (agent orchestrator, didefinisikan di file ini).
- **Status:** pre-PRD. Sebagian dokumen masih `DRAFT` dan perlu validasi.
- **Prioritas berjalan:** [Goals Q3](DOCS/goalsQ3.md).
- **Terakhir diperbarui:** 2026-10-01 — riwayat di [`LOGS/CHANGELOG.md`](LOGS/CHANGELOG.md).
- **Pintu masuk per tool:** Cursor membaca file ini. Claude Code membaca [`CLAUDE.md`](CLAUDE.md). Antigravity membaca [`GEMINI.md`](GEMINI.md). Keduanya hanya menunjuk ke sini — jangan menduplikasi kontraknya.

---

## 1. Peta repo

| Path | Isi | Siapa yang menulis |
|------|-----|--------------------|
| [`AGENTS.md`](AGENTS.md) | Daftar isi, daftar domain, aturan kerja, format PRD — kontrak semua agent | Product Owner |
| [`README.md`](README.md) | Pintu masuk GitHub — ringkas, menunjuk ke `AGENTS.md` sebagai kontrak sebenarnya | Product Owner |
| [`CLAUDE.md`](CLAUDE.md) | Pintu masuk Claude Code → file ini | Product Owner |
| [`GEMINI.md`](GEMINI.md) | Pintu masuk Antigravity → file ini | Product Owner |
| [`DOCS/`](DOCS/) | Dokumen **lintas domain** — sumber kebenaran produk | Product Owner |
| [`../prd-molcadx/`](https://github.com/molca-id/prd-molcadx) *(repo terpisah)* | PRD per fitur + task breakdown — **hanya diisi saat PO minta**. Semua PRD ditulis & diperbarui **di repo itu**, bukan di sini (dipindah dari `DOCS/prd/` 2026-09-24) | Product Owner |
| [`DOCS/templates/`](DOCS/templates/) | Template PRD & template domain baru | Product Owner |
| [`DOMAINS/`](DOMAINS/) | Induk semua folder domain | Product Owner |
| [`DOMAINS/FOUNDATION/`](DOMAINS/FOUNDATION/) | Domain FOUNDATION — model data dasar | `foundation-domain` |
| [`DOMAINS/PRODUCTION/`](DOMAINS/PRODUCTION/) | Domain PRODUCTION — eksekusi & pemantauan produksi | `production-domain` |
| [`DOMAINS/MAINTENANCE/`](DOMAINS/MAINTENANCE/) | Domain MAINTENANCE — histori kejadian asset (component installation/swap history, ke depan work order & reliability) | `maintenance-domain` |
| [`DOMAINS/PLATFORM/`](DOMAINS/PLATFORM/) | Domain PLATFORM — administrasi lintas-tenant sisi vendor (License Manager, halaman superadmin) | `platform-domain` |
| [`LOGS/`](LOGS/) | Catatan setiap perubahan dokumen | Siapa pun yang mengubah dokumen |
| [`LOGS/decisions/`](LOGS/decisions/) | Keputusan produk yang butuh penjelasan panjang | Product Owner |
| [`.claude/agents/`](.claude/agents/) | Definisi agent per domain | Skill `molca-domain-agent` |
| [`.claude/skills/`](.claude/skills/) | Skill lokal Claude / domain agent | Product Owner |
| [`.cursor/skills/`](.cursor/skills/) | Skill lokal Cursor | Product Owner |
| [`.agents/skills/`](.agents/skills/) | Skill lokal Antigravity | Product Owner |
| [`scripts/`](scripts/) | Skrip utilitas repo lintas tool (bukan skill Claude/Cursor/Antigravity) — mis. `export-doc.sh` (markdown → PDF/Word) | Product Owner |
| [`.github/ISSUE_TEMPLATE/`](.github/ISSUE_TEMPLATE/) | Template GitHub Issue — `domain-declaration.md` untuk deklarasi Domain/Module/Feature/Capability sebelum masuk dokumen repo | Product Owner |

> Setiap domain/module/feature/story baru wajib bisa ditempatkan di taksonomi platform 8 level
> (Domain → Module → Feature → Capability → Action/Function → Permission) — lihat
> [`DOCS/02-domains.md`](DOCS/02-domains.md) §"Taksonomi platform (8 level)".

### Layout domain (wajib)

Setiap domain punya foldernya sendiri di bawah [`DOMAINS/`](DOMAINS/) —
`DOMAINS/<NAMA-DOMAIN>/AGENTS.md` (daftar isi + kontrak kerja) dan `DOMAINS/<NAMA-DOMAIN>/DOCS/`
(dokumennya). FOUNDATION memakai [`DOMAINS/FOUNDATION/DOCS-EN/`](DOMAINS/FOUNDATION/DOCS-EN/README.md)
sebagai spec kerja. Folder domain **HURUF BESAR**, nama agent `kebab-case` berakhiran `-domain`.
Aturan lengkap: [`DOCS/02-domains.md`](DOCS/02-domains.md).

`DOCS/` di root **bukan** tempat kontrak domain.

## 2. Indeks dokumen lintas domain (`DOCS/`)

| # | Dokumen | Ringkasan | Status |
|---|---------|-----------|--------|
| 00 | [Product Overview](DOCS/00-product-overview.md) | Apa itu MolcaDx, masalah, user, value proposition | 🟡 DRAFT |
| 01 | [Glossary](DOCS/01-glossary.md) | Istilah domain manufaktur & internal Molca | 🟡 DRAFT |
| 02 | [Domains](DOCS/02-domains.md) | Pembagian domain, layout, kepemilikan, ketergantungan | 🟢 AKTIF |
| 03 | [PRD Standard](DOCS/03-prd-standard.md) | Aturan wajib agar PRD terukur & bisa diimplementasi | 🟢 AKTIF |
| 04 | [Metrics Framework](DOCS/04-metrics-framework.md) | Cara mendefinisikan metrik, baseline, target | 🟢 AKTIF |
| 05 | [Ways of Working](DOCS/05-ways-of-working.md) | Alur kerja PO ↔ domain agent ↔ designer ↔ developer | 🟢 AKTIF |
| — | [Goals Q3](DOCS/goalsQ3.md) | Fokus, domain, modul, dan 7 KR lintas 4 track kuartal berjalan | 🟡 DRAFT |
| — | [PRD-001 MolcaDx Core v0.2](https://github.com/molca-id/prd-molcadx/blob/main/PRD-001-molcadx-core-q3-en.md) | **Dibekukan 2026-09-03 — tidak disinkronkan lagi (keputusan PO).** 15 modul (12 FOUNDATION + 3 PRODUCTION), 65 user story, versi terakhir per tanggal beku. Untuk FOUNDATION, [**PRD-003**](https://github.com/molca-id/prd-molcadx/blob/main/PRD-003-foundation/README.md) sekarang jadi acuan yang disinkronkan. Untuk PRODUCTION (Shopfloor, OEE Monitoring, Job Schedule — belum punya PRD berlingkup domain sendiri), PRD-001 tetap satu-satunya rujukan yang ada, tapi dibaca sebagai snapshot beku, bukan dokumen hidup. Bahasa Inggris | 🔴 BEKU v0.2 |
| — | [**PRD-003 FOUNDATION Domain**](https://github.com/molca-id/prd-molcadx/blob/main/PRD-003-foundation/README.md) | **Acuan aktif untuk domain FOUNDATION** (menggantikan peran PRD-001 di domain ini, 2026-09-03). 14 modul, **53 user story hidup** (`US-FND-WMS-006` product codes ditambah 2026-10-01) + 13 ID closed/retired (`US-FND-PRO-004` retired 2026-09-28 — `PRODUCT_CYCLE` dihapus) (`US-FND-SIT-003` retired 2026-09-27) (`AUD` ditambah 2026-09-25) (`SIT-004` ditambah, `WMS-005` ditutup — defect code digabung ke `REJECT_REASON`, 2026-09-23). **2026-09-23: dipecah jadi folder** — `README.md` (ringkasan 1 halaman, status per modul, urutan build, penghambat utama) + satu file per modul `01-`…`13-` (penomoran = F-0x) + `20-cross-cutting`, `30-release-risks-questions`, `90-closed-stories`, `99-history`. Tiap story punya baris **Status**; riwayat dipindah ke bagian *Change notes* | 🟡 DRAFT v0.2 |
| — | [**PRD-004 PRODUCTION Domain**](https://github.com/molca-id/prd-molcadx/blob/main/PRD-004-production/README.md) | **Acuan aktif untuk domain PRODUCTION** (dimulai 2026-09-24, menggantikan bagian PRODUCTION di PRD-001). Mengikuti Figma PO: modul `PLN` / `MON` / `PRF`. Satu file per modul: Planning (`PLN`, 11 story), Monitoring (`MON`, 7), Performance Analysis (`PRF`, 7) = 25 story | 🟡 DRAFT v0.1 |
| — | [**PRD-003 Task Breakdown**](https://github.com/molca-id/prd-molcadx/blob/main/PRD-003-task-breakdown.md) | Pemecahan tiap story PRD-003 jadi task implementasi konkret (schema/api/ui/validation/abac/event/test/docs), format siap-tempel ke ClickUp (Story → Task). 1.376 baris task (dihitung 2026-09-23, termasuk 6 yang ditandai *superseded*) lintas 45 story yang bisa dibangun — termasuk `US-FND-SIT-004`; 4 story ditutup/diblokir dilewati. Dibuat oleh 3 agent paralel per kelompok modul | 🟡 DRAFT |
| — | ~~PRD-001 (ID)~~ · ~~PRD-002 (ID)~~ · ~~PRD-002 (EN)~~ | Diserap ke v0.2 pada 2026-08-24. **Dihapus 2026-09-23** (beserta ekspor `PRD-001-molcadx-core-q3.pdf`) — tersedia di git history bila perlu dirujuk | 🔴 DIHAPUS |
| — | [Template PRD](DOCS/templates/prd-template.md) | Kerangka PRD berbasis user story | 🟢 AKTIF |
| — | [Template Domain](DOCS/templates/domain-agent-template.md) | Kerangka `DOMAINS/<DOMAIN>/AGENTS.md` baru | 🟢 AKTIF |

Legenda status: 🟢 AKTIF (siap dipakai) · 🟡 DRAFT (perlu validasi PO) · 🔴 USANG.

### Dokumen per domain

Setiap domain memelihara daftar isinya sendiri. Tabel ini hanya pintu masuknya.

| Domain | Daftar isi | Dokumen |
|--------|-----------|---------|
| FOUNDATION | [DOMAINS/FOUNDATION/AGENTS.md](DOMAINS/FOUNDATION/AGENTS.md) | Spec kerja di [`DOMAINS/FOUNDATION/DOCS-EN/`](DOMAINS/FOUNDATION/DOCS-EN/README.md) — [F-00 peta](DOMAINS/FOUNDATION/DOCS-EN/00-foundation.md), [F-00.1 katalog izin otorisasi](DOMAINS/FOUNDATION/DOCS-EN/00-1-authorization-permissions.md), [site hierarchy](DOMAINS/FOUNDATION/DOCS-EN/01-site-hierarchy.md), [shift](DOMAINS/FOUNDATION/DOCS-EN/02-shift.md), [yearly/quarterly](DOMAINS/FOUNDATION/DOCS-EN/03-yearly-quarterly-declaration.md), [equipment taxonomy](DOMAINS/FOUNDATION/DOCS-EN/04-asset-ontology.md), [reference data](DOMAINS/FOUNDATION/DOCS-EN/05-reference-master-data.md), [product](DOMAINS/FOUNDATION/DOCS-EN/06-product.md), [KPI formula](DOMAINS/FOUNDATION/DOCS-EN/07-0-kpi-formula.md), [KPI tag mapping](DOMAINS/FOUNDATION/DOCS-EN/07-1-kpi-tag-mapping.md), [workflow](DOMAINS/FOUNDATION/DOCS-EN/09-workflow-engine.md), [notification](DOMAINS/FOUNDATION/DOCS-EN/10-notification.md), [integration](DOMAINS/FOUNDATION/DOCS-EN/11-integration.md), [configuration](DOMAINS/FOUNDATION/DOCS-EN/12-configuration-service.md), [work master](DOMAINS/FOUNDATION/DOCS-EN/08-work-master.md), [data source](DOMAINS/FOUNDATION/DOCS-EN/13-data-source.md), [audit trail](DOMAINS/FOUNDATION/DOCS-EN/14-audit-trail.md) |
| PRODUCTION | [DOMAINS/PRODUCTION/AGENTS.md](DOMAINS/PRODUCTION/AGENTS.md) | English modules (2026-09-24 Figma rewrite): [overview](DOMAINS/PRODUCTION/DOCS/00-overview.md), [planning](DOMAINS/PRODUCTION/DOCS/01-planning.md), [monitoring](DOMAINS/PRODUCTION/DOCS/02-monitoring.md), [performance](DOMAINS/PRODUCTION/DOCS/03-performance.md), [shift instance](DOMAINS/PRODUCTION/DOCS/04-shift-instance.md) |
| MAINTENANCE | [DOMAINS/MAINTENANCE/AGENTS.md](DOMAINS/MAINTENANCE/AGENTS.md) | Spec kerja di [`DOMAINS/MAINTENANCE/DOCS-EN/`](DOMAINS/MAINTENANCE/DOCS-EN/README.md) — [M-00 peta](DOMAINS/MAINTENANCE/DOCS-EN/00-maintenance.md), [M-01 asset history](DOMAINS/MAINTENANCE/DOCS-EN/01-asset-history.md) (`ASSET_COMPONENT_LINK`, dipindah dari FOUNDATION 2026-09-10) |
| PLATFORM | [DOMAINS/PLATFORM/AGENTS.md](DOMAINS/PLATFORM/AGENTS.md) | Spec kerja di [`DOMAINS/PLATFORM/DOCS-EN/`](DOMAINS/PLATFORM/DOCS-EN/README.md) — [PLT-00 peta](DOMAINS/PLATFORM/DOCS-EN/00-platform.md), [PLT-01 License Manager](DOMAINS/PLATFORM/DOCS-EN/01-license-manager.md) (entitlement tenant↔domain, konsep saja) |

Setiap modul punya dokumen **konsep** (definisi, masalah yang diselesaikan, acuan standar, jebakan umum)
dan, bila sudah dimodelkan, **spesifikasi** (entitas/alur/aturan). Di FOUNDATION keduanya menyatu dalam
satu file per modul; di PRODUCTION terpisah (`*-konsep.md` dan `*.md`).

## 3. Domain & agent

Satu domain = satu folder = satu agent = satu pemilik dokumen.
Detail lengkap di [`DOCS/02-domains.md`](DOCS/02-domains.md).

### Aktif

| Domain | Agent | Tanggung jawab | Definisi |
|--------|-------|----------------|----------|
| **Product & PRD** | `product-owner` | Discovery, prioritisasi, penulisan PRD, orkestrasi domain lain | [`.claude/agents/product-owner.md`](.claude/agents/product-owner.md) |
| **FOUNDATION** | `foundation-domain` | Model data dasar (berperan sebagai *shared object model* IEC 62264/ISA-95 — bukan salah satu domain MOM, lihat [keputusan 2026-09-10](LOGS/decisions/2026-09-10-mom-domain-alignment.md)): site hierarchy, shift, fiscal year, equipment taxonomy, reference data, product, KPI formula & tag mapping, work master (routing/BOM/defect codes), workflow/notification/integration/configuration (concept), data source, audit trail bersama untuk seluruh sistem (siapa mengubah apa, di domain mana pun) — **bukan** organization/roles (IDP) dan **bukan** kalender hari kerja (PRODUCTION) | [`DOMAINS/FOUNDATION/AGENTS.md`](DOMAINS/FOUNDATION/AGENTS.md) · [`.claude/agents/foundation-domain.md`](.claude/agents/foundation-domain.md) |
| **PRODUCTION** | `production-domain` | Planning, monitoring, performance (Figma 2026-09-24); shared `SHIFT_INSTANCE` generator | [`DOMAINS/PRODUCTION/AGENTS.md`](DOMAINS/PRODUCTION/AGENTS.md) · [`.claude/agents/production-domain.md`](.claude/agents/production-domain.md) |
| **MAINTENANCE** *(MOM)* | `maintenance-domain` | Histori kejadian asset: component installation/swap history (`ASSET_COMPONENT_LINK`, dipindah dari FOUNDATION 2026-09-10); ke depan work order perawatan (PM/CM), catatan perbaikan, MTBF/MTTR/MTTF — belum dimodelkan. Membaca `ASSET`/`ASSET_PLACEMENT` FOUNDATION, tidak pernah mendefinisikan ulang | [`DOMAINS/MAINTENANCE/AGENTS.md`](DOMAINS/MAINTENANCE/AGENTS.md) · [`.claude/agents/maintenance-domain.md`](.claude/agents/maintenance-domain.md) |
| **PLATFORM** | `platform-domain` | Administrasi lintas-tenant sisi vendor — **bukan domain MOM, tidak pernah dijual ke tenant** ([keputusan 2026-09-10](LOGS/decisions/2026-09-10-mom-domain-alignment.md)). License Manager: entitlement tenant↔domain (siapa berlangganan domain mana), halaman "superadmin" — konsep saja, entitas belum dimodelkan (`TBD`, lihat `DOMAINS/PLATFORM/DOCS-EN/01-license-manager.md`) | [`DOMAINS/PLATFORM/AGENTS.md`](DOMAINS/PLATFORM/AGENTS.md) · [`.claude/agents/platform-domain.md`](.claude/agents/platform-domain.md) |

### Direncanakan (belum dibuat — buat saat dibutuhkan)

Domain MOM lain per IEC 62264/ISA-95 (Production dan Maintenance sudah aktif di atas; Quality,
Inventory belum) didaftarkan terpisah dari domain pendukung platform. Lihat
[keputusan 2026-09-10](LOGS/decisions/2026-09-10-mom-domain-alignment.md) untuk aturan pembelah
FOUNDATION vs domain-domain ini.

| Domain | Calon agent | Cakupan |
|--------|-------------|---------|
| Quality *(MOM)* | `quality-domain` | Inspeksi, hasil QC, defect/NCR, sertifikasi — cakupan awal, akan diperjelas saat domain dibuat |
| Inventory *(MOM)* | `inventory-domain` | Stok, mutasi gudang, penerimaan/pengiriman material — cakupan awal, akan diperjelas saat domain dibuat |
| Design / UX | `design-domain` | Design system, user flow, wireframe, handoff Figma |
| Engineering | `engineering-domain` | Arsitektur, API, data model, integrasi |
| Data & Analytics | `data-domain` | Event tracking, KPI, dashboard, definisi metrik |
| Operations (pabrik) | `ops-domain` | Proses produksi, SOP, integrasi mesin/IoT |

> Domain baru **tidak dibuat otomatis**. Buat lewat skill `molca-domain-agent` saat PO memintanya.
> [Goals Q3](DOCS/goalsQ3.md) §6.1 mencatat 5 dari 7 KR kuartal ini dimiliki domain yang belum ada.

## 4. Format PRD — berbasis user story

**Semua PRD MolcaDx disusun sebagai user story, dikelompokkan Domain → Modul, dalam bentuk tabel.**
Aturan lengkap & checklist: [`DOCS/03-prd-standard.md`](DOCS/03-prd-standard.md).
Kerangka siap pakai: [`DOCS/templates/prd-template.md`](DOCS/templates/prd-template.md).

### Struktur

```
## <Judul Domain>
### <Judul Modul>
    → tabel user story  (ringkasan, satu baris per story)
    → blok detail       (penjelasan komprehensif per story, ditautkan dari tabel)
```

**Tabel ringkasan:**

| ID | Judul User Story | Penjelasan | Dependensi |
|----|------------------|------------|------------|
| [`US-PROD-SHF-001`](#us-prod-shf-001) | Catat output produksi | Sebagai **operator**, saya ingin mencatat jumlah output pada job berjalan, agar hasil shift terekam tanpa kertas. → [detail](#us-prod-shf-001) | `US-FND-SHF-002`, `US-PROD-JOB-004` |
| [`US-PROD-SHF-002`](#us-prod-shf-002) | Buka downtime satu ketukan | Sebagai **operator**, saya ingin menandai lini berhenti tanpa memilih penyebab dulu, agar penanganan tidak tertunda. → [detail](#us-prod-shf-002) | `US-FND-AST-002` |

### Aturan kolom

| Kolom | Isi | Aturan |
|-------|-----|--------|
| **ID** | Pengenal unik & permanen | Format `US-<DOMAIN>-<MODUL>-<nnn>`. Wajib — tanpa ID, kolom Dependensi tidak bisa merujuk apa pun. ID tidak pernah dipakai ulang walau story dibatalkan. |
| **Judul User Story** | Frasa aksi singkat | Cukup untuk dirujuk dalam percakapan. Satu baris. |
| **Penjelasan** | Bentuk baku *Sebagai `<persona>`, saya ingin `<aksi>`, agar `<hasil>`* + tautan ke blok detail | Persona wajib dari [00-product-overview §3](DOCS/00-product-overview.md). **Isi lengkapnya ada di blok detail** — lihat di bawah. |
| **Dependensi** | Daftar ID user story lain | **Menyebut user story lain**, bukan dokumen. Kosongkan dengan `—` kalau berdiri sendiri. |

### Kode domain & modul

| Domain | Kode | Modul | Kode |
|--------|------|-------|------|
| FOUNDATION | `FND` | Reference & Master Data · Site Hierarchy · Shift · Yearly & Quarterly Declaration (Fiscal Calendar) · Equipment Taxonomy · Product · KPI Formula & Tag Mapping · Work Master · Workflow Engine · Notification · Integration · Configuration Service · Data Source · Audit Trail | `REF` · `SIT` · `SHF` · `FYR` · `AST` · `PRO` · `KPI` · `WMS` · `WFE` · `NTF` · `INT` · `CFG` · `DSR` · `AUD` |
| PRODUCTION | `PROD` | Production Planning · Production Monitoring · Production Performance Analysis | `PLN` · `MON` · `PRF` |
| MAINTENANCE | `MNT` | Asset History · Work Master | `AST` · `WMS` |

> Kode modul baru ditetapkan Product Owner saat modul pertama kali masuk PRD, lalu didaftarkan di tabel ini.
> **2026-08-24** — modul `Organization` dihapus dari kode FOUNDATION: peran/akses kini murni
> milik identity provider (SSO/Keycloak), tidak dimodelkan FOUNDATION
> ([`FOUNDATION/DOCS-EN/00-foundation.md`](DOMAINS/FOUNDATION/DOCS-EN/00-foundation.md)). Kode `REF`,
> `PRO`, `KPI` baru ditambahkan mengikuti modul yang sudah ada di
> `FOUNDATION/DOCS-EN/` tapi belum terdaftar di sini — lihat
> [PRD-002](https://github.com/molca-id/prd-molcadx/blob/main/PRD-002-foundation-core-q3.md).
> **2026-09-03** — setelah contest review FOUNDATION ([keputusan](LOGS/decisions/2026-09-03-foundation-contest-blockers.md)):
> entitas `WORK_ORDER`/`WORK_ORDER_OPERATION` pindah dari modul `WMS` (FOUNDATION) ke modul
> `JOB` (PRODUCTION) — `WMS` kini hanya `ROUTING`/`OPERATION`/`BOM`/`BOM_LINE`/`QUALITY_DEFECT_CODE`
> (kode `WMS` tidak berubah, isinya yang menyusut). Kode `DSR` (Data Source) ditambahkan untuk
> modul baru F-13, sumber data sensor/IoT, terpisah dari `INT` (integrasi sistem-ke-sistem).
> `SHF` dipakai bersama oleh FOUNDATION (Shift) dan PRODUCTION (Shopfloor) — kode ini sengaja
> tidak diubah, kedua modul dibedakan lewat prefix domain (`US-FND-SHF-*` vs `US-PROD-SHF-*`).
> **2026-09-08** — kode modul Yearly & Quarterly Declaration diselaraskan ke **`FYR`** (bukan `FSC`):
> PRD-003 dan izin F-00 memakai `FYR` / `foundation:fyr:…`; layar UX tetap `SCR-FND-FSC-*`
> (ID layar tidak diubah/dipakai ulang). Catatan lama bahwa `KPI` “tidak punya user story sendiri”
> **dicabut** — [PRD-003](https://github.com/molca-id/prd-molcadx/blob/main/PRD-003-foundation/README.md) punya set `US-FND-KPI-*` penuh
> (formula + binding + breakdown); KPI tetap kontrak formula di F-07/F-07.1, plus story FOUNDATION.
> **2026-09-10** — domain **MAINTENANCE** dibuat ([keputusan](LOGS/decisions/2026-09-10-mom-domain-alignment.md)):
> entitas `ASSET_COMPONENT_LINK` (installation/swap history) pindah dari modul `AST` FOUNDATION ke
> modul `AST` MAINTENANCE — kode modul `AST` **dipakai bersama** oleh FOUNDATION (Equipment Taxonomy)
> dan MAINTENANCE (Asset History), pola yang sama dengan `SHF` (dibedakan lewat prefix domain:
> `US-FND-AST-*` vs `US-MNT-AST-*`, kode tidak diubah). `US-FND-AST-005` retired dari PRD-003, isinya
> pindah ke `DOMAINS/MAINTENANCE/` — belum ada PRD Maintenance (rule 1).
> **2026-09-12** — modul **Work Master** ditambahkan ke MAINTENANCE (`PM_PROCEDURE`/
> `PM_PROCEDURE_STEP`, M-02): kode modul `WMS` **dipakai bersama** oleh FOUNDATION (Work Master:
> `ROUTING`/`OPERATION`/`BOM`/`BOM_LINE`/`QUALITY_DEFECT_CODE`) dan MAINTENANCE (PM checklist
> per asset type) — sama polanya dengan `AST`/`SHF` di atas, dibedakan lewat prefix domain
> (`US-FND-WMS-*` vs `US-MNT-WMS-*`), bukan entitas yang sama: FOUNDATION `WMS` = resep
> produksi, MAINTENANCE `WMS` = checklist perawatan, sengaja tidak digeneralisasi jadi satu
> bentuk. Belum ada PRD Maintenance (rule 1).
> **2026-09-23** — `QUALITY_DEFECT_CODE` (FOUNDATION `WMS`) **digabung ke `REJECT_REASON`** (`REF`),
> keputusan PO ([catatan](LOGS/decisions/2026-09-23-defect-code-merged-into-reject-reason.md)). FOUNDATION `WMS`
> kini `ROUTING`/`OPERATION`/`BOM`/`BOM_LINE`; `US-FND-WMS-005` ditutup ke `US-FND-REF-002`.
> **2026-09-24** — kode modul PRODUCTION diganti mengikuti Figma PO (tiga kotak biru = tiga Module):
> **`PLN`** Production Planning, **`MON`** Production Monitoring, **`PRF`** Production Performance Analysis.
> Kode lama `SHF`/`OEE`/`JOB` di domain PRODUCTION **dipensiunkan** — ID `US-PROD-SHF/OEE/JOB-*` tetap
> tinggal di PRD-001 yang beku dan **tidak dipakai ulang**; story PRODUCTION baru memakai `US-PROD-PLN/MON/PRF-*`.
> `SHF` tetap hidup untuk FOUNDATION Shift (`US-FND-SHF-*`). Pemetaan Feature/Capability per modul:
> [`DOCS/02-domains.md`](DOCS/02-domains.md) §"Taksonomi platform". Contoh blok detail di bawah
> (`US-PROD-OEE-003`) memakai kode lama — dibiarkan sebagai contoh format, bukan ID hidup.
> **2026-09-25** — modul FOUNDATION baru **Audit Trail**, kode **`AUD`** (F-14, keputusan PO): siapa
> membuat / mengubah (before → after) / menonaktifkan / melakukan aksi pada record, kapan, dan alasannya. Awalnya
> "hanya FOUNDATION"; **di hari yang sama diperluas ke seluruh sistem** — satu `AUDIT_LOG` milik FOUNDATION, semua
> domain menulis ke sana, hak baca **per modul** (`<domain>:<modul>:<scope>:audit_view`). Taksonomi: Capability
> "History" di tiap Feature semua domain + satu Feature "Audit log" (= kotak "Log service" di Figma Library Configuration).

### Aturan dependensi

1. **Hanya menunjuk user story**, memakai ID. Ketergantungan ke dokumen ditulis di badan PRD, bukan di kolom ini.
2. **Dependensi lintas domain wajib eksplisit** — inilah yang menentukan urutan pengerjaan antar tim.
3. **Tidak boleh melingkar.** A → B → A berarti dua story itu sebenarnya satu, atau salah satunya terlalu besar.
4. **Story yang menjadi dependensi tidak boleh dibatalkan diam-diam** — kalau dibatalkan, semua story yang merujuknya wajib ditinjau ulang.
5. Setiap user story tetap wajib punya **acceptance criteria Given/When/Then** dan metrik terukur sesuai [03-prd-standard](DOCS/03-prd-standard.md) — tabel ini adalah daftar isi story, bukan pengganti kriteria uji.

### Blok detail — wajib komprehensif

Satu baris tabel tidak cukup untuk dikerjakan designer & developer. Setiap user story **wajib**
punya blok detail dengan **delapan bagian di bawah ini**. Bagian yang tidak berlaku ditulis
`tidak berlaku` — jangan dihapus, karena kosong dan tidak-berlaku itu dua hal berbeda.

| # | Bagian | Isi | Wajib |
|---|--------|-----|-------|
| 1 | **Story** | *Sebagai `<persona>`, saya ingin `<aksi>`, agar `<hasil>`* | ✅ |
| 2 | **Konteks** | Kenapa story ini ada: masalah nyata, bukti, kondisi pemakaian (perangkat, lokasi, jaringan) | ✅ |
| 3 | **Expectation** | Perilaku yang diharapkan — apa yang user lihat & sistem lakukan, termasuk **semua state**: default, kosong, loading, error, offline, sukses, tanpa izin | ✅ |
| 4 | **Cara kalkulasi** | Rumus eksplisit + sumber tiap variabel + **contoh perhitungan berangka** + perlakuan kasus tepi (pembagian nol, data tidak lengkap, nilai di luar batas) | ✅ kalau story menampilkan/menghitung angka |
| 5 | **Data & entitas** | Entitas dan field [FOUNDATION](DOMAINS/FOUNDATION/DOCS-EN/00-foundation.md) yang dibaca/ditulis. **Dilarang mengarang field baru** — ajukan ke `foundation-domain` | ✅ |
| 6 | **Aturan & batasan** | Validasi, hak akses per peran, perilaku offline, aturan koreksi, batas nilai | ✅ |
| 7 | **Acceptance criteria** | Given/When/Then, satu perilaku satu baris, lulus/gagal jelas tanpa bertanya ke PO | ✅ |
| 8 | **Metrik & event** | Metrik keberhasilan (baseline → target → tanggal → sumber) + event analytics yang dipasang | ✅ |

**Aturan isi:**

- **Expectation ditulis dari sisi user, bukan sisi sistem.** "Operator melihat konfirmasi dalam 1 detik", bukan "API mengembalikan 200".
- **Setiap angka punya rumus.** Kalau sebuah angka muncul di layar tanpa rumus di bagian 4, story itu belum siap dikerjakan.
- **Rumus wajib menyebut sumber tiap variabel** sampai ke nama field, dan **wajib punya contoh berangka** — contoh adalah alat uji tercepat bagi developer.
- **Kasus tepi bukan opsional.** Pembagian nol, data separuh, nilai negatif, dan shift yang belum ditutup harus punya jawaban eksplisit.
- Rumus kanonik metrik tetap milik [04-metrics-framework](DOCS/04-metrics-framework.md) — story menjabarkan penerapannya, tidak mendefinisikan ulang. Kalau bentrok, metrics framework yang menang.

### Uji kesiapan — cukup jelas untuk designer & developer?

Sebuah user story baru boleh dikirim kalau **kedua pertanyaan ini dijawab "ya"**:

> **Designer** bisa mulai membuat layar — semua state, semua teks, semua prioritas informasi —
> tanpa bertanya satu pun ke Product Owner?
>
> **Developer** bisa mulai menulis kode — entitas, rumus, validasi, hak akses, perilaku offline,
> dan tahu kapan pekerjaannya lulus — tanpa bertanya satu pun ke Product Owner?

Kalau salah satu "tidak", story itu belum selesai ditulis. Pemetaannya:

| Bagian blok detail | Yang dilayani | Pertanyaan yang harus terjawab |
|--------------------|---------------|--------------------------------|
| 1 Story, 2 Konteks | Designer + Developer | Untuk siapa, dipakai di kondisi apa (perangkat, jaringan, tangan kotor)? |
| 3 Expectation | **Designer** | Layar apa saja, state apa saja, apa yang terbaca lebih dulu, teks & batasnya apa? |
| 4 Cara kalkulasi | **Developer** | Rumusnya apa, variabelnya dari mana, contohnya berapa, kasus tepinya bagaimana? |
| 5 Data & entitas | **Developer** | Baca/tulis ke entitas dan field mana? |
| 6 Aturan & batasan | Designer + Developer | Validasi, hak akses, offline, koreksi — dan apa yang user lihat saat aturan itu kena? |
| 7 Acceptance criteria | **Developer + QA** | Kapan pekerjaan dinyatakan lulus? |
| 8 Metrik & event | Developer + Data | Event apa yang dipasang, angka apa yang dipantau setelah rilis? |

**Larangan yang paling sering melanggar uji ini:**

| Ditulis | Kenapa gagal | Ganti dengan |
|---------|--------------|--------------|
| "Tampilkan data produksi" | Data yang mana, dari field apa, urut apa | Sebut entitas, field, urutan, dan batas jumlah |
| "Validasi input" | Developer menebak aturannya | Sebut aturan per field + pesan error persisnya |
| "Handle error" | Designer tidak tahu harus menggambar apa | Sebutkan tiap kondisi error dan apa yang user lihat |
| "Harus cepat / mudah dipakai" | Tidak bisa diuji | Angka: p95 ≤2,5 detik; ≤3 ketukan |
| "Hitung OEE" | Ada banyak varian rumus | Rumus penuh + sumber variabel + contoh berangka |

### Contoh blok detail

#### US-PROD-OEE-003

**Tampilkan OEE lini pada shift berjalan**

> Heading blok detail **hanya berisi ID**, judul di baris tebal di bawahnya — agar anchor
> `#us-prod-oee-003` dari tabel ringkasan jalan di GitHub dan Obsidian sekaligus.

| Bagian | Isi |
|--------|-----|
| **Story** | Sebagai **supervisor produksi**, saya ingin melihat OEE lini saya pada shift berjalan beserta ketiga komponennya, agar saya bisa bertindak sebelum shift berakhir. |
| **Konteks** | Hari ini supervisor baru tahu performa lini dari laporan H+1, sehingga koreksi selalu terlambat satu shift. Dipakai sambil berjalan di lantai produksi, layar kecil, jaringan tidak stabil. |
| **Expectation** | **Default:** OEE besar di atas, tiga komponen A/P/Q di bawahnya, ditandai "sementara" selama shift `open`, disertai waktu pembaruan terakhir. **Kosong:** belum ada entri → tampil "belum ada data", **bukan** 0%. **Loading:** kerangka tampilan, angka lama tidak ditahan agar tidak dikira angka baru. **Error:** angka terakhir yang berhasil dimuat tetap tampil dengan penanda kedaluwarsa. **Offline:** penanda offline + waktu data terakhir. **Tanpa izin:** jelaskan lini ini di luar cakupan peran, sebutkan siapa yang dihubungi. |
| **Cara kalkulasi** | `Availability = waktu_operasi / waktu_terjadwal` · `Performance = (cycle_time_ideal × total_output) / waktu_operasi` · `Quality = good_qty / total_output` · `OEE = A × P × Q`.<br>**Sumber:** `waktu_terjadwal` ← `SHIFT_INSTANCE.scheduled_minutes` · `waktu_operasi` ← `waktu_terjadwal − Σ downtime` dari `ASSET_STATE_LOG` dengan `DOWNTIME_REASON.downtime_category = 'unplanned'` · `cycle_time_ideal` ← `OPERATION.standard_cycle_time` **versi yang berlaku pada `business_date`** · `total_output` ← `good_qty + scrap_qty + rework_qty`.<br>**Contoh:** shift 480 menit, istirahat 60 → `waktu_terjadwal` 420. Downtime tak terencana 42 → `waktu_operasi` 378. A = 378/420 = **90%**. Output 1.000 unit (950 baik, 50 scrap), cycle ideal 20 detik → P = (20 × 1.000)/60/378 = **88,2%**. Q = 950/1.000 = **95%**. OEE = 0,90 × 0,882 × 0,95 = **75,4%**.<br>**Kasus tepi:** `waktu_operasi = 0` atau `total_output = 0` → tampil "tidak dapat dihitung", bukan 0%. `P > 100%` → tandai anomali data, jangan dipotong diam-diam ke 100%. Agregasi ke area/site dari penjumlahan suku dasar, **bukan** rata-rata OEE antar lini. |
| **Data & entitas** | Baca: `SHIFT_INSTANCE`, `ASSET_STATE_LOG`, `DOWNTIME_REASON`, `WORK_ORDER_OPERATION`, `OPERATION`, `WORK_CENTER`. Tulis: tidak ada. |
| **Aturan & batasan** | Hanya lini dengan `WORK_CENTER.is_oee_tracked = true`. Hak akses: peran `supervisor` ke atas pada scope lini tersebut. Shift `open` → angka wajib berlabel "sementara"; final hanya dari shift `closed`. Offline: tampilkan data terakhir yang tersimpan lokal, jangan tampilkan angka kosong. |
| **Acceptance criteria** | **AC-1** Given shift berjalan dengan entri lengkap, When supervisor membuka layar lini, Then OEE + A/P/Q tampil dengan label "sementara" dan waktu pembaruan terakhir.<br>**AC-2** Given belum ada entri sama sekali pada shift berjalan, When layar dibuka, Then tampil "belum ada data" dan **tidak** menampilkan 0%.<br>**AC-3** Given `waktu_operasi = 0`, When OEE dihitung, Then tampil "tidak dapat dihitung" disertai alasannya.<br>**AC-4** Given user tanpa peran pada lini itu, When mencoba membuka, Then akses ditolak dengan penjelasan dan kontak yang dituju. |
| **Metrik & event** | **Metrik:** % shift yang OEE-nya dibuka supervisor pada shift yang sama — baseline `TBD`, target `TBD`, diukur dari `oee_view_opened`. **Counter-metric:** waktu muat layar p95 ≤2,5 detik di jaringan 3G. **Event:** `oee_view_opened` (`view_type`, `scope_level`, `period`), `oee_drilldown` (`from_level`, `to_level`). |
| **Dependensi** | `US-PROD-SHF-001` (output tercatat), `US-PROD-SHF-003` (downtime tercatat), `US-FND-SHF-002` (shift instance tersedia) |

## 5. Aturan kerja (berlaku untuk semua agent)

1. **PRD baru hanya dibuat saat diminta eksplisit.** Jangan generate PRD sebagai efek samping dari tugas lain.
   - **1a. PRD tinggal di repo [`prd-molcadx`](https://github.com/molca-id/prd-molcadx)** (checkout lokal: `../prd-molcadx/`, sejajar repo ini). Buat dan ubah PRD di sana — **jangan** membuat ulang `DOCS/prd/` di repo ini. Link dari repo ini ke PRD memakai URL GitHub `prd-molcadx`; link dari PRD ke spec memakai URL GitHub `docs-molcadx`. Perubahan PRD dicatat di `CHANGELOG.md` repo `prd-molcadx`, dan keputusan pemicunya tetap dicatat di [`LOGS/CHANGELOG.md`](LOGS/CHANGELOG.md) repo ini. (Ditambahkan 2026-09-24: developer yang ditugaskan implementasi cukup membaca repo PRD, tidak perlu membaca seluruh repo dokumen.)
   - **1b. Story PRD yang sudah ada wajib disinkronkan pada sesi yang sama** (di `../prd-molcadx/`, lihat 1a) ketika sebuah keputusan di `DOMAINS/<DOMAIN>/DOCS-EN/`, `UX/`, atau `FLOW/` mengubah *acceptance criteria*, *data & entitas*, atau *aturan* story itu — termasuk membuka kembali story yang `BLOCKED` saat penyebab blokirnya resolved. Kalau tidak bisa disinkronkan di sesi itu, catat sebagai backlog eksplisit di entri changelog yang sama — jangan dibiarkan diam. Cara bakunya: skill **`prd-sync`** (§6). Rule 1 melarang *membuat* PRD sebagai efek samping; rule 1b **mewajibkan** *merawat* yang sudah ada — dua hal berbeda. (Ditambahkan 2026-09-03 setelah PRD-003 ketahuan ketinggalan beberapa keputusan `DOCS-EN` yang sudah resolved, karena rule 1 dibaca sebagai "jangan sentuh PRD sama sekali".)
2. **PRD memakai format user story §4** dan wajib lolos checklist [`DOCS/03-prd-standard.md`](DOCS/03-prd-standard.md) — kriteria yang tidak terukur diperbaiki dulu sebelum dikirim.
3. **Setiap perubahan dokumen wajib dicatat** di [`LOGS/CHANGELOG.md`](LOGS/CHANGELOG.md) pada sesi yang sama. Berlaku untuk `DOCS/` root, `DOMAINS/<DOMAIN>/DOCS/`, semua `AGENTS.md`, dan skill.
4. **Dokumen baru wajib terdaftar di indeks yang tepat** — lintas domain di §2, dokumen domain di `DOMAINS/<DOMAIN>/AGENTS.md` §2, dan domainnya sendiri di §3 file ini. Kalau tidak terdaftar, dianggap tidak ada.
5. **Jangan mengarang fakta produk.** Kalau belum tahu, tulis `TBD — perlu konfirmasi PO` beserta pertanyaan spesifik dan penanggung jawabnya.
6. **Agent domain tidak mengubah dokumen domain lain.** Ajukan ke PO, PO yang merutekan.
7. **Satu istilah satu definisi.** Istilah baru wajib masuk [`DOCS/01-glossary.md`](DOCS/01-glossary.md).

## 6. Skill yang tersedia

| Skill | Kapan dipakai |
|-------|---------------|
| `molca-domain-agent` (lokal, `.claude/skills/`) | Membuat folder + agent domain baru saat PO minta |
| `unslop` (lokal) | Hapus pola tulisan AI. Cursor: `.cursor/skills/` · Claude: `.claude/skills/` · Antigravity: `.agents/skills/` |
| `grill-with-docs` (lokal) | Grill rencana vs model domain & istilah yang sudah ada, lalu tulis keputusan. Path sama dengan `unslop` |
| `prd-pilot` (lokal, `.claude/skills/`) | Uji apakah `DOCS-EN`/`UX`/`FLOW` satu modul (atau seluruh domain) sudah cukup untuk memproduksi ulang story PRD-nya — agent baru tanpa akses PRD asli menulis dari dokumen saja, lalu di-diff ke PRD asli jadi tabel gap (celah dokumen asli / pilihan penulisan bebas / inkonsistensi nyata). Read-only, tidak pernah mengubah PRD asli |
| `prd-sync` (lokal, `.claude/skills/`) | Sinkronkan PRD di `../prd-molcadx/` dengan perubahan spec (rule 1b). Bekerja dari **git diff** `DOCS-EN`/`UX`/`FLOW` sejak titik sinkron tiap PRD (baris *Specs synced to* di README PRD) — bukan dari changelog, bukan membaca semua dokumen. Mencocokkan bagian spec yang berubah ke story lewat link/anchor dan nama field, mengedit story itu saja, memindahkan titik sinkron, lalu membuka PR. Tidak pernah membuat story baru — perubahan tanpa story dilaporkan ke PO |
| `scripts/export-doc.sh` (bukan skill — skrip, lihat [`scripts/`](scripts/)) | Export dokumen/PRD ke PDF atau Word (`.docx`) saat diminta, format dipilih dari ekstensi output. PDF butuh `pandoc`+`wkhtmltopdf`; Word cukup `pandoc` saja (tidak dibundel, lihat komentar di skrip). **2026-09-04:** baris ini sebelumnya menyebut skill `pdf` yang ternyata tidak pernah ada — diganti dengan skrip nyata |
| `molca-erd` (lokal, `.claude/skills/`) | Perbarui / gambar ulang ERD logis MolcaDx di FigJam dari spec `DOCS-EN` + `PRODUCTION/DOCS` lewat MCP `figma-console` (Desktop Bridge). Berisi router garis (tidak ada garis yang menimpa garis lain atau melewati tabel), section per domain, pewarnaan prioritas Must/Could/Won't, dan daftar gotcha API Figma. ERD turunan dari spec — tidak pernah menambah field sendiri. Setup MCP mesin baru: [`.claude/skills/molca-erd/references/setup.md`](.claude/skills/molca-erd/references/setup.md); server dideklarasikan di [`.mcp.json`](.mcp.json) |
| `prd-implement` (lokal, `.claude/skills/`, salinan) | Implementasi PRD (`prd-molcadx`) ke repo modul `repo-molcadx/mes-*-fe` — cari delta PRD per repo, bangun story yang siap, bawa efek lintas repo |
| `molca-web-design-system` (lokal, `.claude/skills/`, salinan) | Spesifikasi komponen/token desain web Molca |
| `molca-prototype` (lokal, `.claude/skills/`, salinan) | Prototipe cepat layar Molca (Vite + React + shadcn) |
| `molca-ui` (lokal, `.claude/skills/`, salinan) | Membangun UI dengan design system Molca + registry shadcn `@molca` |
| `molca-ui-adopt` (lokal, `.claude/skills/`, salinan) | Memasang design system Molca ke repo Vite + React yang sudah ada (mis. repo `mes-*-fe` baru) |
| `shadcn` (lokal, `.claude/skills/`, salinan) | Implementasi komponen UI |
| `tanstack-query-best-practices` (lokal, `.claude/skills/`, salinan) | Pola data fetching/caching/mutation TanStack Query untuk repo implementasi |

> **Salinan (vendored) 2026-10-01** — tujuh skill bertanda *salinan* disalin dari instalasi global
> (`~/.agents/skills/`) supaya ikut ter-clone ke mesin lain. Asal & cara update:
> [`.claude/skills/README.md`](.claude/skills/README.md).

## Learned User Preferences

- When committing, split the work into logical commits before opening a pull request.
- After a branch is merged, pull the default branch and delete the unused local branch.
- Keep master-data implementation in the `mes-master-data-fe-erd` worktree and leave the `mes-master-data-fe-test` checkout unchanged.
- Write tests that prove a real behavior. Do not add tests only so the suite passes or so the count goes up.
- Open the asset register form as a bottom drawer so the long form can scroll. The fiscal year form still opens from the right.

## Learned Workspace Facts

- Master-data implementation follows the code shape of `molca-id/mes-master-data`, including its BFF authentication so login is not bypassed; the entity model comes from the docs ERD.
- Master-data lists keep a page-size cap of 100 and walk pages. Do not raise the cap to load every row.
- Product codes and work master read products from the database products repository, not the in-memory `ProductsStore`.
- Whether `region` stands for `tenant_id` is an open Product Owner question. Do not encode that guess in unique keys or migrations.
- The foundation master-data implementation includes the production KPI formulas and tag bindings the spec already names. Production reads those definitions later.
