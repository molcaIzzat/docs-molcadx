---
name: Domain / Module / Feature / Capability declaration
about: Declare a new Domain, Module, Feature, or Capability for MolcaDx before it is written into the repo docs.
title: "[DECLARE] "
labels: taxonomy-declaration
---

Reference before filling this in: [`DOCS/02-domains.md`](../../DOCS/02-domains.md)
§"Taksonomi platform (8 level)".

**Rule:** a new PRD module code (`US-<DOMAIN>-<MODULE>-nnn`) is NOT automatically a new Feature.
It may turn out to be a Capability nested inside an existing Feature, or a bundle of several
Features. Check against the real/planned UI before deciding the level below.

## 1. Which taxonomy level are you declaring?

Pick exactly one:

- [ ] Domain
- [ ] Module
- [ ] Feature
- [ ] Capability
- [ ] Action / Function (rare to declare standalone — usually comes from task breakdown)

## 2. Name and one-line description

Name:

Description:

## 3. If declaring a Domain

- Product Suite it belongs to (default MolcaDx, note if shared with Savior/MolcaTwin):
- Why this can't fit inside an existing Domain:

## 4. If declaring a Module

- Which Domain does it belong to?
- What launcher card / entry point does it correspond to (or will it)?
- What Features is it expected to contain? (can be TBD)
  -
  -

## 5. If declaring a Feature

- Which Module does it belong to?
- Is there a screen/sidebar item for this (screenshot or mock link if available)?
- What Capabilities is it expected to expose? (can be TBD)
  -
  -

## 6. If declaring a Capability

- Which Feature does it belong to?
- **Could this instead be a Capability nested inside an existing Feature, rather than a new
  Feature?** Explain why or why not — this is the exact check that would have caught the
  Shift/Fiscal Year case (they turned out to be panels inside the Site Hierarchy Feature, not
  their own Feature).

## 7. Evidence

Screenshot, mock, or existing doc link that supports the level chosen above (if none yet, say
so explicitly — do not assume):

## 8. Open questions for PO

List anything still `TBD — perlu konfirmasi PO` with who should answer it.
