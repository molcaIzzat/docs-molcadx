# Keputusan — `TENANT` identitas via Keycloak Organizations, bukan realm-per-tenant (2026-09-11)

## Konteks

[PLATFORM/DOCS-EN/01-license-manager.md](../DOMAINS/PLATFORM/DOCS-EN/01-license-manager.md)
A-2 menanyakan apakah entitas `TENANT` formal sudah ada di suatu tempat. Jawabannya: sudah —
`TENANT` sudah dispesifikasi penuh di [F-01 §9.1](../DOMAINS/FOUNDATION/DOCS-EN/01-site-hierarchy.md#91-tenant--ownershipisolation-layer)
sebagai lapisan ownership/isolation yang membungkus `ENTERPRISE → SITE → AREA → WORK_CENTER →
WORK_UNIT`. PO awalnya menjawab "belum diputuskan" karena pertanyaan sebenarnya bukan
"apakah `TENANT` ada" (sudah), tapi **bagaimana `TENANT` FOUNDATION berhubungan dengan
konsep tenant di sisi IDP/Keycloak** — pertanyaan yang lebih tajam, belum terjawab di mana pun.

Ini versi lain dari pola yang sudah pernah diputuskan: **2026-08-24**, Organization/roles
dihapus total dari FOUNDATION karena identitas & akses murni milik IDP/Keycloak
([`FOUNDATION/DOCS-EN/00-foundation.md`](../DOMAINS/FOUNDATION/DOCS-EN/00-foundation.md)).
Pertanyaan sekarang: apakah `TENANT` (yang FOUNDATION memang butuh sebagai kunci
data-isolation untuk `ENTERPRISE`/`SITE`/dst.) mengikuti pola yang sama, atau berbeda.

## Opsi yang dipertimbangkan

1. **Realm-per-tenant** — satu Keycloak realm per tenant. Isolasi kuat, tapi overhead admin
   tinggi (klien, konfigurasi, token issuer terpisah per tenant) — cocok untuk sedikit tenant
   besar, buruk untuk banyak tenant kecil-menengah (profil SaaS B2B khas MolcaDx).
2. **Keycloak Organizations** — satu realm menampung banyak tenant sebagai "Organization,"
   masing-masing dengan membership/SSO/IdP sendiri, tapi berbagi realm/klien yang sama.
   Fitur ini dirancang khusus untuk multi-tenant SaaS B2B.
3. **Atribut custom di satu realm/user pool** — `tenant_id` sebagai atribut user/grup biasa,
   tanpa fitur Keycloak khusus. Paling fleksibel, tapi isolasi paling lemah (bergantung
   penuh pada aplikasi selalu menghormati atribut itu di setiap query) dan paling tidak
   "native" ke Keycloak.

## Keputusan

**Keycloak Organizations**, bukan realm-per-tenant, bukan atribut custom polos.

**Alasan:** model ABAC MolcaDx (F-00.1) sudah mengasumsikan **satu token, satu rantai scope
claim** yang di-resolve dari tenant turun ke site/area/work_unit — pola satu-realm,
claim-based, persis yang dirancang Keycloak Organizations. Realm-per-tenant butuh
konfigurasi klien terpisah per tenant dan tidak cocok dengan kontrak ABAC satu-realm yang
sudah berjalan.

**`TENANT` FOUNDATION (F-01 §9.1) tetap ada — bukan digantikan, bukan diduplikasi.** Field
baru `keycloak_org_id` ditambahkan sebagai pointer eksternal ke Organization Keycloak yang
bersangkutan. Pembagian tanggung jawab:
- **Keycloak (Organization)** — siapa anggota tenant ini, SSO, federasi IdP, login.
- **FOUNDATION `TENANT`** — record bisnis: baris yang di-FK oleh `ENTERPRISE`/`SITE`/dst.,
  dan baris yang digunakan PLATFORM License Manager untuk memberi entitlement domain.

Sama persis dengan pola Organization/roles 2026-08-24: identitas di IDP, data bisnis di
FOUNDATION — diterapkan sekarang secara eksplisit ke `TENANT`, bukan diasumsikan otomatis
berlaku hanya karena polanya pernah dipakai di tempat lain.

## Konsekuensi

- `DOMAINS/FOUNDATION/DOCS-EN/01-site-hierarchy.md` §9.1: field `keycloak_org_id`
  ditambahkan ke `TENANT`.
- `DOMAINS/PLATFORM/DOCS-EN/01-license-manager.md` A-2: **ditutup** — `TENANT` sudah ada,
  pertanyaan yang sebenarnya (hubungan dengan Keycloak) sekarang punya jawaban.
  `TENANT_DOMAIN_ENTITLEMENT.tenant_id` FK langsung ke FOUNDATION `TENANT`, bukan entitas baru.
- **Belum diputuskan, sengaja `TBD`:** mekanisme sinkronisasi `keycloak_org_id` (siapa
  membuat Organization dulu — provisioning tenant baru dimulai dari Keycloak atau dari
  FOUNDATION, lalu yang lain menyusul?), dan apakah satu `TENANT` selalu = satu Organization
  atau bisa berbeda dalam kasus tepi (merger/akuisisi pelanggan, dll.) — pertanyaan
  operasional, bukan pertanyaan pemodelan, ditunda sampai ada kebutuhan nyata.
- Ini keputusan arsitektur yang mahal untuk dibalik (memilih pola multi-tenancy Keycloak
  memengaruhi provisioning, SSO, dan setiap klaim ABAC) — karenanya dicatat di sini, bukan
  hanya di CHANGELOG.

## Tindak lanjut

1. `foundation-domain`: pertimbangkan apakah `keycloak_org_id` butuh index/uniqueness
   constraint saat modeling fisik (bukan cakupan dokumen ini).
2. `platform-domain`: tutup A-2 di `PLT-01`, lanjutkan entity spec `TENANT_DOMAIN_ENTITLEMENT`
   dengan FK langsung ke FOUNDATION `TENANT`.
3. Product Owner: provisioning flow (Keycloak Organization dulu vs `TENANT` dulu) — `TBD`,
   belum mendesak sampai ada kebutuhan onboarding tenant nyata.
