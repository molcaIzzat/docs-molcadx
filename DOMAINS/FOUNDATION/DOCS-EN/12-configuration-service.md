# F-12 — Configuration Service

> Working spec. **Concept only** — no entities modeled yet. One setting is confirmed for the
> first release: [stop thresholds](#confirmed-first-release-item-stop-thresholds-po-2026-10-01) (2026-10-01).

**In short:** Configuration Service stores everything that's allowed to differ between
plants without a code change — thresholds, choice lists, feature flags. Don't confuse it
with master data (see the boundary rule below); that mistake is the most common one made
in this module.

## What this module is for

A service that stores and serves **everything that's allowed to differ between plants
without changing code**: thresholds, rules, enum choices, labels, active features, and
preferences. It's the natural companion to [Workflow Engine](09-workflow-engine.md): workflow
controls *flow*, configuration controls *values and choices*.

## Why it matters — what goes wrong without it

A product installed across many plants will keep hitting the same questions: "our
threshold is 30 minutes, not 15," "we don't use the rework module," "we don't call it a
line, we call it a section."

| If you skip this | What happens |
|---|---|
| Plant differences handled with code branches | The codebase branches wildly; one change risks every plant |
| Hardcoded thresholds | Small changes need a release |
| Every plant runs its own app version | Maintenance becomes impossible |

Like Workflow Engine, the core value is **speed of rolling out the next plant**.

## Core concepts

**1. Layered, with override.** Configuration resolves from most general to most specific:

```
product default → tenant → enterprise → site → area → work center → user
```

The value that applies is the most specific one defined. This is what makes "all lines use
a 15-minute threshold except Line C, which uses 30" possible without copying the entire
configuration. With multi-tenancy, `tenant` enters the chain as the first customer-scoped
default — one customer's defaults never leak into another tenant's resolution.

**The key requirement:** the system must be able to answer *"which level did this value
come from?"* — without that, layered configuration becomes impossible to debug.

**2. Four configuration types that must stay distinct:**

| Type | Example | Who changes it | How often |
|---|---|---|---|
| **Operational parameter** | Micro-stop threshold, output tolerance | Implementor / supervisor | Often |
| **Choice list (enum)** | Andon categories, defect disposition | Implementor | Occasionally |
| **Feature flag** | Rework module on/off | PO / implementor | Rarely |
| **Technical setting** | Endpoint, data retention, size limits | Engineering | Rarely |

Merging all four into one interface lets operators change things they shouldn't be able to
touch.

> **Important boundary:** taxonomies that become **analysis dimensions** — reason code,
> defect code, asset class — are **master data**, not configuration. They carry history,
> get referenced by historical data, and can't simply be overwritten. Their home is
> [Reference & Master Data](05-reference-master-data.md) / [Equipment Taxonomy](04-asset-ontology.md) /
> [Work Master](08-work-master.md).

**3. Configuration is code with no safety net.** A wrong threshold can be as damaging as a
bug, but with no code review, tests, or CI. It needs a substitute: **validation on save,
change history, and the ability to roll back.**

**4. History & rollback.** Every change records: who, when, from what value to what value,
and why. Rollback to a previous version is a required feature, not a nice-to-have — "why
did this number change since Tuesday" usually gets answered here.

> The who/when/before→after record for FOUNDATION master data is [Audit Trail (F-14)](14-audit-trail.md); rollback is not part of it (see F-14 AU-7).

**5. Promotion between environments.** Configuration tested in a staging environment must
be movable to production as one package, not retyped by hand.

**6. Freshness & caching.** Configuration gets read very often, so it's always cached.
What needs to be decided: how long a change takes to take effect, and whether there's an
immediate cache-bust path for urgent changes. Offline devices use the last locally-stored
configuration.

**7. Configuration is not where secrets live.** Credentials and API keys have different
security needs (encryption, rotation, restricted access). Keep them separate.

## Confirmed first-release item: stop thresholds (PO, 2026-10-01)

**Confirmed for the first release** (PO, 2026-10-01, closes [F-07.1](07-1-kpi-tag-mapping.md#whats-still-unknown)
K-6 and the threshold part of K-8). This is the "micro-stop threshold" from the early-candidate
list below. It is an **operational parameter** (concept 2): two values that decide how long a
stop must last before it counts as a stop, and before it counts as real downtime. Until now the
values were fixed in code (1 min / 5 min).

| Setting | Unit | Global default | Meaning |
|---|---|---|---|
| `min_stop_seconds` | seconds | **60** | A stop shorter than this is **not a stop event**. No downtime event is created. The lost time stays inside APT and shows up as **speed loss** (Performance). It is not `small_stop` and not Availability. |
| `small_stop_max_seconds` | seconds | **300** | A stop from `min_stop_seconds` up to this value is a **`small_stop`** (Performance loss). A longer stop is **real downtime** (Availability), `planned` or `unplanned` from its `DOWNTIME_REASON.downtime_category` (unlabeled = `unplanned`). |

- **One pair for both detection methods.** The same two values apply to
  [stalled-counter detection](07-1-kpi-tag-mapping.md#how-downtime-gets-detected-from-a-stalled-counter)
  and [out-of-range detection](07-1-kpi-tag-mapping.md#how-downtime-gets-detected-from-an-out-of-range-analog-value).
  There is no separate pair per method. (The normal-operating band used by range detection is a
  different setting — still open, F-07.1 K-10.)
- **Scope and lookup.** Set per `WORK_CENTER`, with an optional override per `WORK_UNIT`
  ([F-01](01-site-hierarchy.md) §9.5, §9.6). Lookup order: **`WORK_UNIT` → `WORK_CENTER` →
  `SITE` → global default**. The first level that has a value wins. Each value resolves on its
  own (a work unit may override only `small_stop_max_seconds` and inherit `min_stop_seconds`).
  This setting uses only these four levels — not tenant, enterprise, area, or user from the
  general chain in concept 1. The work-unit level sits below work center in that chain and is
  used by this setting only, so far.
- **Validation on save.** The pair that will apply at the level being saved (after lookup) must
  satisfy `0 < min_stop_seconds < small_stop_max_seconds`. Otherwise the save is refused with:
  "Minimum stop must be more than 0 and less than the small-stop limit." Both values are whole
  seconds.
- **Effective-dated.** Each value carries `valid_from`. A shift is bucketed with the values valid
  on its `business_date`. A change never recalculates a shift that is already closed. A value is
  never hard-deleted — it is replaced by a newer `valid_from` (F-00 rule).
- **Audit.** Every change (create, edit, end) is written to [Audit Trail (F-14)](14-audit-trail.md)
  with before → after.
- **Where the value is stored — `TBD` for engineering.** F-12 has no entity model yet. Do **not**
  add columns to `WORK_CENTER` or `WORK_UNIT` for this. Question for engineering + PO: does the
  first release get a generic config-value table (setting key, scope level, scope id, value,
  `valid_from`/`valid_to`), or a dedicated table for these two values only? Either way the table needs a PK and a No-overlap rule per (setting, scope level, scope id) on `valid_from` — this follows from the F-00 [keys rule](00-foundation.md#keys-and-constraints-on-every-table-po-2026-10-01), it is not a new decision.

## `TIME_CONVERSIONS` — considered, not placed here; now resolved

A `time_conversions` entity (`time_conversions_id` PK, `code`, `name`, plus a same-named string
field `time_conversions` — likely a **modeling defect**, reported as-is rather
than silently fixed), with a relationship out to `product_cycle.time_conversion_id` for
converting cycle-time units (e.g. seconds/minutes) — `PRODUCT_CYCLE` itself was retired
2026-09-28 ([F-06 §9.3](06-product.md#93-product_cycle--retired-2026-09-28)) — sits alongside a nearby
`unit_of_measurements` master (`uom_id` PK, `code`, `name`, `unit`) as surrounding context.

**Decision: `TIME_CONVERSIONS` is not added as a Configuration Service entity.** This module's
boundary rule above is explicit: reference tables referenced by historical data are **master
data**, not configuration — exactly the same reasoning that already places `UOM` in
[Work Master](08-work-master.md), not here. `TIME_CONVERSIONS` has the same shape (a flat
`code`/`name` reference table, referenced as an FK from other master/transactional entities),
so it lands on the same side of the line as `UOM` — it isn't a "value allowed to differ between
plants without a code change" (threshold, enum choice, feature flag), which is this module's
actual domain.

**Resolved:** its home is [Reference & Master Data](05-reference-master-data.md) §9.3 — a new
module created specifically for this cluster of flat reference/master tables, alongside
`UNIT_OF_MEASUREMENTS`. This closes the question this section used to leave open between
here, [Product](06-product.md), and [Work Master](08-work-master.md) — `TIME_CONVERSIONS` is
defined in neither of those three, only in `05-reference-master-data.md`.
`OPERATION.time_conversion_id` ([Work Master](08-work-master.md), moved from Product's
`PRODUCT_WORK_UNIT` 2026-08-18) remains its only known consumer.

## Common pitfalls

1. **Making everything configurable.** Every option is a branch that needs testing; an
   option nobody ever changes just adds overhead.
2. **Mixing configuration with master data.** A taxonomy referenced by historical data
   can't just be overwritten.
3. **No visibility into where a value came from.** Layered configuration without
   traceability becomes undiagnosable.
4. **No validation.** A typo in a threshold can silently kill all notifications.
5. **No history.** Nobody can answer why the system's behavior changed.
6. **Storing credentials here.** Different security needs entirely.
7. **Editing production configuration directly, untested.** Equivalent to deploying with
   no tests.

## Implications for MolcaDx

- This module determines **how fast the second plant can go live** — like Workflow Engine,
  its value only shows up on the second rollout.
- This quarter's target user is the internal implementor, so the configuration UI can be
  information-dense as long as **where a value comes from and its impact** stay clear.
- The decision that must come first: **what's configurable in the first release?** Setting
  this early is far cheaper than walking it back after a pilot plant is already using it.
- Early candidates from existing docs: ~~micro-stop threshold~~ (**confirmed 2026-10-01** —
  see [stop thresholds](#confirmed-first-release-item-stop-thresholds-po-2026-10-01)),
  output-over-plan tolerance, correction time limit after shift close, per-line OEE targets,
  data-completeness threshold, planned-capacity factor. **The rest still need PO confirmation.**

## Next step

Get the Product Owner to lock the first-release list of configurable items before
building the config UI — walking a setting back after a pilot plant depends on it is far
more expensive than deciding it up front.
