# 0019 — Catalogues are prefixed `catalog_`

**Status:** Accepted

## Context

Two kinds of collection sit side by side. Some hold records one activity owns:
`activities_steps`, `activities_materials`, `steps_resources`. Others hold reference data
shared by every activity, written by an admin and picked by the authors: materials
([ADR 0016](0016-materials-are-a-catalogue.md)), tags
([ADR 0014](0014-activity-tags-are-one-collection.md)), safety instructions and tips
([ADR 0018](0018-safety-instructions-and-tips-are-catalogues.md)). The owned ones carried their
owner as a prefix; the shared ones carried nothing, so a bare name said neither which kind it
was nor that it was global.

## Decision

**Every catalogue is named `catalog_<what it holds>`**: `catalog_materials`, `catalog_tags`,
`catalog_safety_instructions`, `catalog_tips`. A collection owned by a record keeps its owner as
a prefix. `1790850300_catalogues_prefixed.go` renames the four, and the indexes named after them.

## Consequences

- The name says the scope: `catalog_` is shared and admin-written, `activities_` belongs to one
  activity. A new catalogue takes the prefix.
- The relations hold ids, not names, so the links carry over and the relation fields keep their
  names: `activities.tips` points at `catalog_tips`.
- The generated types follow: `Collections.CatalogTags`, `CatalogTagsResponse`.
- The earlier migrations and ADRs still say `materials`, `tags`, `safety_instructions` and
  `tips`: they describe the database as it was when they were written.
