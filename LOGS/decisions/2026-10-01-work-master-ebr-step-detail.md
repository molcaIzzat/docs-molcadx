# 2026-10-01 — Work Master: EBR step detail (instructions, IPC, dispensing tolerance, yield, hold time)

- **Decided by:** Product Owner — make the FOUNDATION routing match an EBR (electronic batch record) master recipe
  for the parts that are also useful to food lines
- **Domain:** FOUNDATION (F-00, F-08, UX 08 note); execution questions raised to PRODUCTION (not numbered there yet)
- **Builds on:** [wave 2](2026-09-30-work-master-wave-2-flows-parameters.md) — same rule: FOUNDATION holds the
  **standard** (what must happen); recording actuals at execution is PRODUCTION / future Quality domain

## Decisions

### A — `OPERATION_INSTRUCTION` (F-08 §9.2.5)

Ordered sub-steps of a step: `sequence`, `instruction_text`, `requires_confirmation`. Effective-dated. Text / flag
change = standard; add, remove, re-order = structural (new version). Recording a confirmation → PRODUCTION.

### B — `OPERATION_CHECK` (F-08 §9.2.6)

In-process checks (IPC) the operator measures and records: name, `value_type` (`numeric` / `pass_fail` / `text`),
target / min / max + unit for numeric, `sample_count`, frequency (`once` / `start_middle_end` / `interval` + time
unit), `is_critical` (out of range = deviation). Differs from `OPERATION_PARAMETER`: a parameter is a machine setting
the step runs within; a check is a value the operator measures. Value change = standard; add / remove = structural.

### C — Dispensing tolerance on `BOM_LINE` (F-08 §9.4)

`dispense_tolerance_type` (`percent` / `absolute`) + `dispense_tolerance_value`, symmetric ±, empty = no check.
Target = the line's planned quantity for the job (planned-input formula). Covers the standard part of GitHub issue
#60; weighing, comparison and deviation handling stay parked with #60.

### D — Yield range on `OPERATION` (F-08 §9.2.7)

`yield_min_pct`, `yield_max_pct`. Actual yield = actual primary output ÷ theoretical output, theoretical = actual
input converted at the net recipe ratio with no loss. Expected yield = 1 − `planned_shrinkage`; a range not
containing it gives a save warning. Edge cases: no input → "cannot be calculated"; limiting component; > 100%
allowed. Standard change (effective-dated).

### E — Hold time on `OPERATION` (F-08 §9.2.7)

`max_hold_time` + `hold_time_conversion_id`: longest wait from the end of this step to the start of each step that
follows it (next step in order, or every dependent step with `OPERATION_DEPENDENCY`). Across routings: open (W-10).

## Raised to PRODUCTION (via PO, not edited there)

1. Recording instruction confirmation (who, when) and whether it blocks the next instruction / step.
2. Recording IPC results per frequency, prompting the operator, and handling a critical out-of-range result
   (warning, deviation, block) — or wait for Quality, as PLN-Q8 did for parameters.
3. Recording the weighed quantity per BOM line and comparing it to the dispensing tolerance (issue #60, parked).
4. Capturing actual input / output per step to compute yield, and what happens out of range.
5. Recording step start / end times per job, and what happens when a hold time is exceeded (alarm, block, deviation).

## Not in this decision

- Per-step sign-off / second-person verification — depends on GitHub issue #62 (e-signature).
- Line-clearance gate before a step.
- Both deferred until the PO confirms pharma as a target.
- Open questions W-10 … W-15 in F-08 "What's still unknown".
