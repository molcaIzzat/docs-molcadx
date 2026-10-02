# F-10 — Notification

> Working spec. **Concept only** — no entities modeled yet.

**In short:** Notification's biggest risk isn't information arriving too late — it's
**alarm fatigue** from sending too much. A bad notification system is worse than none at
all, because it trains people to ignore warnings.

## What this module is for

A service that gets important information to the right person, at the right time, through
the right channel — and makes sure it's actually **received**, not just sent.

## Why it matters — what goes wrong without it

In a factory, delayed information costs real money — a line sits idle 20 minutes because
nobody knew material had run out. But the more common failure runs the other way:

| Problem | Result |
|---|---|
| Information doesn't get through | Response comes too late |
| **Too many notifications** | **Alarm fatigue** — everything gets ignored, including what matters |
| Sent to the wrong person | Nobody feels responsible |
| No record kept | Can't prove who was told what |

The second row is the most common and most dangerous failure. A bad notification system is
**worse than no system at all**, because it trains people to ignore warnings.

## Core concepts

**1. Notification ≠ alarm ≠ log.**

| Kind | Needs action? | Example |
|---|---|---|
| **Alarm** | Yes, immediately | Line stopped > 15 minutes with no known cause |
| **Notification** | Yes, but not urgent | A carry-over job waiting to be rescheduled |
| **Log / info** | No | Shift closed successfully |

Rule from alarm-management discipline: **every alarm must have a clear, unique action.**
If the recipient can't do anything about it, it isn't an alarm — it's a log.

**2. Priority must stay rare.** If everything is "important," nothing is. Common practice:
deliberately cap the proportion of top-priority alerts (e.g. a small percentage of the
total), and periodically review which ones get ignored most — those are candidates to
downgrade or remove.

**3. Recipients are determined by role, not by person.** Same as workflow: send to
*supervisor of Line A*, not to a specific name. People go on leave, resign, or transfer;
roles stay.

**4. Lifecycle: sent → delivered → acknowledged → resolved.** An important notification
doesn't stop at "sent." What needs tracking:
- **delivered** — reached the device,
- **acknowledged** — read and confirmed by the recipient,
- **resolved** — the underlying issue is fixed.

The gaps between these stages are the actual metrics: response time and resolution time.

**5. Escalation.** If not acknowledged within a deadline, it moves up to the next role. Any
notification without escalation that goes unseen is functionally identical to never having
been sent.

**6. Channel choice depends on real factory conditions:**

| Channel | Factory-floor note |
|---|---|
| In-app | The default, but only works if the app is open |
| Push | Needs a personal device — not guaranteed on the factory floor |
| Andon board / line screen | Often the only channel operators actually see |
| Email | For management, not real-time events |
| SMS | Fallback when mobile data is unreliable |

Choose based on **actual usage conditions**, not implementation convenience. An operator
with hands full of work won't open an app to check a notification.

**7. Offline behavior.** A notification created while a device is offline must queue and
send once connectivity returns — marked as "this already happened in the past" so the
recipient doesn't misjudge its urgency.

**8. Deduplication & throttling.** A single flickering machine (on/off/on/off) can trigger
dozens of notifications in a minute. Similar events need to be merged and rate-limited.

## Common pitfalls

1. **Sending everything.** Alarm fatigue; the system permanently loses credibility.
2. **Hardcoded thresholds.** Every plant differs; thresholds must be configurable.
3. **No escalation.** An unseen notification = an unsent one.
4. **Notifications with no clear action.** The recipient knows something's wrong but not
   what to do about it.
5. **Ignoring the channel operators actually see.** Push to a personal phone is often not
   the answer.
6. **Not throttling repeated events.** One broken sensor floods everyone.
7. **Not measuring ignored notifications.** Without this metric, there's no way to fix the
   noise.

## Implications for MolcaDx

- This module's health metric isn't the number of notifications sent — it's the
  **acknowledged-and-acted-on ratio**. A low ratio means the notification rules are wrong,
  not the users.
- Which channels actually get used depends on `TBD` [SF-4](../../PRODUCTION/DOCS/02-monitoring.md#boundaries):
  what devices operators actually carry.
- This module makes the most sense built **together with**
  [Workflow Engine](09-workflow-engine.md) — they share the concepts of trigger, role, and
  escalation.

## Next step

Design this module alongside Workflow Engine, not after it — and track the
acknowledged-and-acted-on ratio from day one, not just delivery counts.
