# Work Unit Flow (physical line topology) — working draft (EN)

> **This is a working draft, not an official spec.** It captures a design conversation
> between the Product Owner and this assistant. Nothing here is committed until it's
> merged into [Site Hierarchy](01-site-hierarchy.md) §9 — that merge still needs to happen,
> and the content may change in the process. Source discussion: this session, 2026-08-10.

**In short:** this draft adds the one thing missing from FOUNDATION today — a record of
which machine physically feeds which other machine — so the system can tell when a station
is starved because *all* of its upstream machines are down, not just one.

## What this is trying to solve

Neither ISO 22400 nor ISA-95 defines which physical machine feeds which other machine
on a specific factory floor — that's plant-specific and only Molca's own layout can
answer it. Today, FOUNDATION has no entity for this at all: `ROUTING`/`OPERATION`
(`work-master.md` §3.3) only orders **process steps for one product**, and
`WORK_UNIT.position_no` (`site-hierarchy.md` §9.3) is a single integer — it can express
"station 3 comes after station 2" but cannot express two stations feeding one shared
downstream point.

The concrete case that surfaced this: **two machines physically feed into one shared
line** (their outputs unite before the next step). This is a fact about the floor
layout, not about any single product's routing — so it belongs in Site Hierarchy, not
Work Master.

## The model

```
WORK_UNIT_FLOW
├── from_work_unit_id   FK → WORK_UNIT
├── to_work_unit_id     FK → WORK_UNIT
├── valid_from / valid_to
```

One row per physical connection between two work units. Series and parallel both fall
out of this automatically, from how many rows point **into** a given work unit:

- **Series** — a work unit has exactly one incoming row → it depends on exactly one
  predecessor.
- **Parallel / merge** — a work unit has more than one incoming row (e.g. machine A
  and machine B both feed it) → it depends on **all** of them together, not any one
  alone.

## The rule this enables

**A work unit is starved only when every one of its declared predecessors is down.**

Worked example: A and B both feed a shared downstream station D.
- A down, B running → D is **not** starved (B is still supplying it).
- A down, B down → D **is** starved.

This one rule covers series (a work unit with one predecessor is trivially "starved
when that one predecessor is down") and parallel/merge (a work unit with several
predecessors) without needing a separate series-vs-parallel flag anywhere in the model.

## Still open

| # | Question | Notes |
|---|----------|-------|
| 1 | How does the timestamp offset (upstream downtime → downstream starvation) work when there are multiple predecessors, each potentially with a different transit/process time to the merge point? | Needs a per-edge transit time, not just a boolean connection — likely an additional field on `WORK_UNIT_FLOW` (e.g. `transit_time`), still undefined. |
| 2 | What downtime-reason category does an inferred "starved" event get? | Raised earlier alongside the series-only case — still needs `product-owner` to decide. `REASON_CODE` has since split into `DOWNTIME_REASON`/`REJECT_REASON` (now in `05-reference-master-data.md` §9.1, relocated from `asset-ontology.md` §9.4); a "starved" event is a downtime cause, so it would live under `DOWNTIME_REASON`. `DOWNTIME_REASON.downtime_category` only has 3 coarse values (`unplanned`/`planned`/`small_stop`) — whether the old detailed `material` category still exists as a value/sub-code is itself `TBD` (see `05-reference-master-data.md` §9.6, T-2), so this question is now two layers of `TBD` deep. |
| 3 | Does `WORK_UNIT.position_no` still mean anything once `WORK_UNIT_FLOW` exists? | `position_no` assumes a single linear order; a merge point breaks that assumption. May need to stay as a simple display-ordering field within a work center, separate from the actual flow topology. |
| 4 | Is a starved/derived downtime state auto-created, or does it still require human confirmation before affecting OEE? | Same reliability question already open for `source = derived` (OEE-7, `oee-monitoring.md` §9) — this is another instance of it. |
| 5 | [`FLOW-05`](../FLOW/05-kpi-computation.md)'s Quality subgraph already depends on this draft for its neighbor fallback ("resolve neighbor via `WORK_UNIT_FLOW`, repeat Step 0 for the neighbor's own currently-placed asset") — but this draft is scoped entirely to **Availability/starvation**, not Quality. Two gaps this creates: (a) with more than one predecessor (a merge point), which neighbor's good/reject counts does Quality borrow — is there even one right answer? (b) a per-step yield/shrinkage difference (e.g. a Molding→Oven→Cooking line where only Cooking has a sensor) needs each upstream step's own loss factor applied to the borrowed count, not a 1:1 copy — no such field exists on `OPERATION` yet (see [`08-work-master.md`](08-work-master.md) §9.2). Until this is resolved, `FLOW-05`'s Quality fallback is only correct for the single-predecessor, no-shrinkage case. | `foundation-domain` |

## Not decided at all yet

Whether buffers/WIP storage between work units should be modeled (a buffer absorbs a
short upstream stoppage before the downstream station actually starves) — raised
earlier in this conversation as a risk, not yet addressed in this draft. If any real
line has buffering between merge points, the "starved when predecessor is down" rule
above is too simple and would over-trigger.

## Next step

Check with Operations whether any real line has buffering between merge points before
this draft gets merged — it's the one gap that could invalidate the whole "starved when
all predecessors are down" rule.
