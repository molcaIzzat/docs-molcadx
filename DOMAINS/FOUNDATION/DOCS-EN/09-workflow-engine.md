# F-09 — Workflow Engine

> Working spec. **Concept only** — no entities modeled yet.

**In short:** Workflow Engine lets an internal implementor build and change an approval or
escalation process through a UI — no developer, no redeploy. This is a Q3 commitment; see
"Implications for MolcaDx" below.

## What this module is for

A component that runs business processes **defined as data, not as code**. An implementor
assembles steps, conditions, and actions through a UI; the engine executes them. "Low-code"
here specifically means: **an internal implementor can create and change a workflow
without a developer and without a redeploy.**

## Why it matters — what goes wrong without it

| If you skip this | What happens |
|---|---|
| Every plant has a different SOP | Every rollout needs a code change → doesn't scale |
| Changing an approval flow requires a release | Small changes take weeks |
| Rules are scattered across the codebase | Nobody knows exactly what rule is in force today |

The core value is **speed of rollout** — the 2nd and 3rd plant shouldn't have to wait in a
developer queue.

## Core concepts

**1. Definition vs instance** — same pattern as Site Shift vs shift instance (see
[02-shift.md](02-shift.md)):

| | Contains | Changes |
|---|---|---|
| **Workflow definition** | The versioned blueprint of a flow | When reconfigured |
| **Workflow instance** | One real execution against a specific object | Continuously, while running |

A running instance **locks the version of its definition**. Changing the definition must
never change a flow that's already in progress — otherwise an approval could suddenly jump
to a different person mid-flight.

**2. Anatomy of a workflow:**

| Piece | Role |
|---|---|
| **Trigger** | What starts it: a data event (downtime opened), a schedule (end of every shift), or a manual action |
| **Condition** | Branching based on data (e.g. duration > 30 minutes) |
| **Task** | A step requiring a human (approval, verification, filling a form) |
| **Action** | An automated step (change status, send notification, call an integration) |
| **Assignment** | Who does the task — **role + scope based**, never a person's name |
| **Escalation / timer** | What happens if the task isn't done within a deadline |
| **Terminal state** | The end condition: success, rejected, cancelled, expired |

**3. Two modeling styles:**

| Style | Fits | Example |
|---|---|---|
| **State machine** | Objects with a clear lifecycle | Work order status: draft → released → in_progress → completed |
| **Flow / BPMN** | Cross-role processes with branching | Repair request: reported → verified → approved → done → closed |

A manufacturing platform usually needs both. Forcing one style to cover everything produces
tangled configuration.

**4. Where to draw the "low-code" line — the most important product decision in this
module.** The more expressive the engine gets, the closer it drifts to a programming
language — and the less usable it becomes for non-technical people.

| Too narrow | Balanced | Too broad |
|---|---|---|
| Linear approval only | Conditions, branching, timers, actions from a closed list | Free-form scripts, loops, arbitrary expressions |
| Implementors hit a wall fast, developers still needed | Most real cases are covered | Configuration becomes untested code with no debugger or version control |

The common pattern: a **closed whitelist of actions** + **limited condition expressions**,
expanded based on real need — not anticipated in advance.

**5. Auditability is a feature, not an add-on.** Every instance must be able to answer:
which step is it on, who did what and when, why did it take this branch, and how long did
each step take. Without this, a stuck workflow can't be diagnosed by anyone.

**6. Idempotency & reliability.** Workflows touch the outside world (notifications,
integrations). Actions must be **idempotent** — running twice must never produce two
effects. This matters especially in a factory environment with unstable networks and
offline sync.

**7. Versioning & migration.** When a definition changes, old instances keep running on
their old version. This needs an explicit decision: can a running instance be migrated to
the new version, or must it finish on the old one (the second option is far simpler and
usually enough).

## Reference pattern: Tulip.co (a public analog product, not a spec to copy)

Tulip's trigger model is a uniform shape: *event → optional condition → list of actions →
optional transition*, attachable at the Widget, Step, App, or Machine/Device level.

| Tulip element | Equivalent above | Same / different |
|---|---|---|
| Event | Trigger | Conceptually the same |
| Condition | Condition | Same |
| Action | Action | Same; Tulip also uses a closed action list |
| Transition | Terminal state / step change | Conceptually similar, but Tulip has no formal instance lifecycle — closer to "switch screen step" |
| — | Task | **No clear equivalent.** Tulip doesn't model "a step that needs a human" as its own entity |
| — | Assignment (role + scope) | **Not visible in public docs.** Tulip triggers attach to UI elements, not routed to roles |
| — | Escalation / timer | **Not visible as a first-class concept** |

**Takeaway:** Tulip's triggers are app-building logic per UI element (close to "if this
button is pressed, do this") — not a cross-role process engine with assignment, escalation,
and terminal states like an approval workflow needs. That remains MolcaDx's own territory;
the Tulip pattern is relevant only to lightweight **widget/step-level triggers** (quick
forms and actions on an operator screen), not to the "Flow / BPMN" style above.

Two lightweight candidate flows worth noting separately from the heavier list in
"Implications for MolcaDx" below: auto-logging a downtime reason when an operator picks
one from a dropdown, and validating a form field before a step advances (e.g. a QC value
out of range blocks progress). Both are closer to "UI/form rules" than to a cross-role
business process — **needs PO confirmation** whether the engine should cover these too.

## Common pitfalls

1. **Building a do-everything engine before knowing the real flows needed.** The result is
   complex and still doesn't fit.
2. **Assigning to a person's name instead of a role.** The flow breaks the moment that
   person takes leave or resigns.
3. **Not locking the version on a running instance.** The flow changes mid-execution.
4. **No test/simulation mode.** Every configuration change becomes a bet made in
   production.
5. **Forgetting the failure path.** An action to an external system fails and the instance
   hangs with nobody aware.
6. **Configuration with no change trail.** Nobody can answer "why did the flow change last
   week."
7. **Assuming low-code removes the need for testing.** Configuration is still logic — it
   can still be wrong.

## Implications for MolcaDx

- This is a **quarter-focus prerequisite**: without this module, the "low-code workflow
  creation" claim isn't met.
- The target user is the **internal implementor**, not the operator — so prioritize
  completeness and readability of configuration over polished mass-market UX.
- The open question that must be answered first (Q3-3 in Goals Q3): **which flows must an
  implementor actually be able to build?** Without 3–5 real example flows, the engine's
  scope can't be set and the "build everything, fit nothing" risk above is nearly
  guaranteed.
- Plausible first candidates, from existing docs: andon escalation, approval for data
  correction after a shift closes, and approval for rescheduling a job that's already
  running. **Needs PO confirmation.**

## Next step

This module can't be scoped without 3–5 real example flows from Molca's own factory.
Naming those examples is the single blocking task — raise it with the Product Owner
before design work starts on this module.
