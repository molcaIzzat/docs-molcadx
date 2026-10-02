# F-11 — Integration

> Working spec. **Concept only** — no entities modeled yet.
>
> **Scope narrowed 2026-09-03 (decision B7, contest review).** This module is now
> **system-to-system integration only** — ERP (Level 4) and peer systems (other MES,
> quality systems, HRIS). Sensor/IoT connections (PLC/SCADA/OPC UA/MQTT, the `DATA_SOURCE`
> entity, and the tag-mapping concept below) moved to their own module,
> [Data Source](13-data-source.md), because they turned out to need real entities
> (`ASSET_TAGS.data_source_id` FK, §9.7 of Equipment Taxonomy) while ERP-side integration
> stays concept-only. The two were being modeled as one module despite having almost nothing
> in common except "connects to something outside MolcaDx" — different protocols, different
> volumes, different owners of the resulting entities.

**In short:** Integration connects MolcaDx to ERP and other business/peer systems above and
beside it. Downward machine/sensor connectivity is [Data Source](13-data-source.md)'s concern
now, not this module's.

## What this module is for

The layer connecting MolcaDx to everything outside it: the business systems above it
(ERP), the machines and sensors below it (PLC/SCADA), and peer systems beside it (other
MES, quality systems, HRIS). In ISA-95 terms, MolcaDx sits at **Level 3** (manufacturing
operations); integration is the job of reaching **Level 4** (business planning) and
**Level 2/1** (control & devices).

## Why it matters — what goes wrong without it

| If you skip this | What happens |
|---|---|
| Work orders get retyped from ERP by hand | Duplicate work, typos, WO numbers don't match between systems |
| Machine status logged manually | Data arrives late and coarse; micro-stops never get caught |
| Production results never flow back to ERP | Inventory and cost figures are never accurate |
| Every connection built ad-hoc | Nobody knows where data actually flows; one break becomes hard to diagnose |

## Core concepts

**1. Two directions with very different character:**

| Direction | Talks to | Volume | Latency | Character |
|---|---|---|---|---|
| **Upward (Level 4)** | ERP | Low (tens/day) | Minutes–hours | Transactional, structured, needs consistency |
| **Downward (Level 2/1)** | PLC, SCADA, sensors | High (thousands/sec) | Milliseconds–seconds | Time-series, compact, needs throughput |

Treating both directions with one mechanism is an expensive architectural mistake — their
reliability, format, and storage needs are entirely different. **This is why they're two
modules now (B7, 2026-09-03):** the "Downward" row above is [Data
Source](13-data-source.md)'s territory; this file (Integration) keeps only "Upward" and
peer-system connections.

**2. Tag mapping — moved to [Data Source](13-data-source.md), 2026-09-03 (B7).** Machines
speak in **tags** (`PLC1.DB10.DBW4`); the system speaks in **entities**
(`ASSET IM-003, state=running`). That mapping — source tag, target asset/signal, transform,
interpretation rule, frequency — plus the `DATA_SOURCE` connection entity itself, the
event-driven (listener/subscription) frequency decision, and the still-open heartbeat
granularity question (connection-level vs per-tag) now live in
[Data Source §Core concepts / §9](13-data-source.md), not here. This module (Integration)
keeps only the ERP/peer-system half of "connecting to something outside MolcaDx."

**3. Edge vs cloud.** Common factory pattern: an **edge** component near the machine does
acquisition, filtering, and buffering; syncing to the center happens after. This isn't just
about performance — it's about **resilience**: factory networks to the outside drop
frequently, but production can't stop for that.

**4. Sync & delivery guarantees.**

| Guarantee | Meaning | Consequence |
|---|---|---|
| *At-most-once* | May be lost | Unacceptable for production data |
| *At-least-once* | Never lost, may duplicate | Acceptable **if** the receiver is idempotent |
| *Exactly-once* | Delivered exactly once | Expensive and often an illusion in distributed systems |

The "0 data loss" target in KR 1B.2 in practice means **at-least-once + idempotency on the
receiving end**, not exactly-once. Every entry needs an idempotency key so a resend doesn't
duplicate output.

**5. Reconciliation, not just transfer.** Good integration doesn't stop at "sent." It
compares: how many were sent vs received vs recorded. Discrepancies get reported, not
silently absorbed.

**6. Contracts & versioning.** Every connection has a contract (message schema, required
fields, code meanings). Changing a contract without versioning silently breaks the other
side. Treat it like a public API.

**7. Security across zones.** Bridging Level 3 to Level 2 crosses the OT/IT network
boundary. The rule that applies: **connections initiate outward from the more secure
zone**, no write access to a PLC unless truly necessary and approved, and credentials are
never stored in plaintext on edge devices.

## Common pitfalls

1. **Treating ERP integration and machine integration the same way.** Their
   characteristics are opposite.
2. **Chasing exactly-once.** At-least-once + properly tested idempotency is better.
3. **No idempotency key.** A resync duplicates production output — and it's hard to
   detect.
4. **Hardcoded tag mapping.** Every new machine becomes a developer task — see
   [Data Source](13-data-source.md), which owns the tag-mapping/`DATA_SOURCE` concept now.
5. **No connection monitoring.** Data quietly stops flowing until a monthly report looks
   odd — see [Data Source](13-data-source.md)'s heartbeat/staleness open question.
6. **Ignoring `client_ts` vs `server_ts`.** Durations come out wrong for late-arriving data.
7. **Opening unnecessary PLC write access.** A safety risk, not just a data risk.

## Implications for MolcaDx

- **KR 1B.1 and KR 1B.2** in Goals Q3 are split between this module and [Data
  Source](13-data-source.md) as of 2026-09-03 (B7): whichever KR text concerns tag mapping,
  heartbeat, or raw PLC/SCADA readings belongs to Data Source; ERP-facing KR text stays here.
  Neither module has re-audited which KR sub-items land where yet — `TBD`, PO to split KR
  ownership explicitly.
- The "0 data loss" claim needs a concrete test definition: how long a disconnect, how
  many scenarios, how long to recover. Without that, the KR can't be marked as passed.
- **PLC/SCADA readability, raw signal history retention, and `is there any PLC/SCADA that
  can even be read` (00-product-overview §6) all moved to [Data Source](13-data-source.md)'s
  Implications, 2026-09-03** — those questions are about the downward connection, not ERP.

## Next step

Answer the PLC/SCADA readability question first — it determines whether [Data
Source](13-data-source.md) (the module that actually reads PLC/SCADA) is a Q1 build or a
Q3+ build. This module (Integration, ERP/peer-systems only) can proceed independently of
that answer, since ERP connectivity doesn't depend on sensor readability.
