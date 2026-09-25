# 0017 — An activity's tags are one collection

**Status:** Accepted

## Context

An activity was described by nine referentials: its domains, its imaginary universes, its safety
tags, and a keyword list for each of six developmental axes. Each was its own collection
(`activities_fields`, `activities_security`, `activities_develop_physical`, …) behind its own
relation field on `activities`.

The nine had the same shape: a `name` translated per locale, plus a `slug` and a `description`
on safety tags only. Keeping them apart bought nothing, and every change had to be made nine
times: nine relation fields, nine API rules, nine seed loops, nine generated types. Adding an
axis meant a schema change. The split had already let a typo through, since the spiritual axis
was linked through a field named `develop_spritual`.

## Decision

Every tag lives in `activities_tags`:

| field | kind | |
|---|---|---|
| `type` | `select`, required | `FIELD`, `IMAGINARY`, `SECURITY`, `DEVELOP_PHYSICAL`, `DEVELOP_INTELLECTUAL`, `DEVELOP_AFFECT`, `DEVELOP_SOCIAL`, `DEVELOP_MORAL`, `DEVELOP_SPIRITUAL` |
| `slug` | text, required | `^[a-z0-9-]+$`, unique per `type` |
| `name` | JSON, required | `{"fr": "…", "en": "…"}` |
| `description` | JSON | same shape, used by safety tags |

`activities.tags` is one relation to it. There is no field per type: PocketBase cannot restrict
a relation to the records of one type, so nine fields pointing at the same collection would add
back the boilerplate without adding any safety.

`type` is a `select` because the list of kinds is closed. It is part of the schema, like
`season` and `weather`. The tags inside each kind are data and can grow without a migration.

Migration `1790028400_merge_referentials_into_tags.go` keeps every record's id, so an activity's
links carry over as they are. Slugs for the tags that had none are derived from their French
wording.

## Consequences

- One collection, one API rule, one type. A new kind is a new `select` value, and a new tag is
  a new row.
- Filtering is the same for every kind: `tags.id ?= {:id}`, and `tags.type = 'SECURITY'` to
  narrow by kind.
- Expanded tags arrive mixed together. Grouping them by `type` is the front's job, a pure
  function in `model/`.
- **Per-kind rules are no longer schema.** `maxSelect` and `required` used to be set per
  referential (10 each). `tags` now accepts up to 999 of any mix. A rule like "at most three
  safety tags" or "at least one domain" would need a record hook in `back/hooks`.
- If one kind later needs columns of its own, the answer is to move it back out into a
  collection of its own. The same id-preserving migration makes that cheap.
