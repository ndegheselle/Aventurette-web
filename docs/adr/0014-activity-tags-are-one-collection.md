# 0014 — An activity's tags are one collection

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

Every tag lives in `tags`:

| field | kind | |
|---|---|---|
| `type` | `select`, required | `THEME`, `IMAGINARY`, `GOAL`, `IDEAL_FOR`, `DEVELOP_PHYSICAL`, `DEVELOP_INTELLECTUAL`, `DEVELOP_AFFECT`, `DEVELOP_SOCIAL`, `DEVELOP_MORAL`, `DEVELOP_SPIRITUAL` |
| `slug` | text, required | `^[a-z0-9-]+$`, unique per `type` |
| `name` | text, required | one language |

The kinds were nine at first, with `FIELD` for domains. `FIELD` became `THEME`, and `GOAL` and
`IDEAL_FOR` were added, when the activity was grouped by family
([ADR 0015](0015-activity-attributes-grouped-by-family.md)). `SECURITY` was a kind too, the only
one with a `description`, until it moved out into `safety_instructions`, taking the column with
it ([ADR 0018](0018-safety-instructions-and-tips-are-catalogues.md)).

**An activity links tags through one relation per place a tag goes in its families**
([ADR 0015](0015-activity-attributes-grouped-by-family.md)), all pointing at `tags`:

| relation | accepts |
|---|---|
| `theme_tags` | THEME |
| `imaginary_tags` | IMAGINARY |
| `goal_tags` | GOAL |
| `ideal_for_tags` | IDEAL_FOR |
| `development_tags` | the six DEVELOP_* kinds |

PocketBase cannot restrict a relation to the records of one type, so `back/hooks/tag_kinds.go`
checks it: an activity linking a tag in a relation not meant for its kind is refused, with the
error keyed by that relation.

This was one `tags` relation at first, holding every kind, on the grounds that fields per type
pointing at one collection added boilerplate without adding safety. Grouping the activity by
family turned that around: with one relation, four families shared one column, the mapper had to
split and rebuild it on every write, and an update carrying one family had to be refused lest it
unlink the others' tags. Now each family writes its own relations. The six development axes
share one because they are one family's single list in all but name; the front sorts them apart
by kind. Migration `1790700300_tag_relations_per_family.go` made the split, schema only.

`type` is a `select` because the list of kinds is closed. It is part of the schema, like
`season` and `weather`. The tags inside each kind are data and can grow without a migration.

Migration `1790028400_merge_referentials_into_tags.go` keeps every record's id, so an activity's
links carry over as they are. It named the collection `activities_tags`; migration
`1790770000_tags_collection_renamed.go` renamed it `tags`, the way the material catalogue is
`materials` ([ADR 0016](0016-materials-are-a-catalogue.md)), and the relations, which hold its
id, did not change. Slugs for the tags that had none are derived from their French
wording.

`name` and `description` were first stored as one wording per locale, `{"fr": "…", "en": "…"}`.
Migration `1790603343_single_language_tag_wordings.go` turned them back into single-language
text, keeping the French, until data is translated some more systematic way. A safety
instruction's `name` and `description` still are.

## Consequences

- One collection, one API rule, one type. A new kind is a new `select` value, and a new tag is
  a new row.
- Filtering reads by relation: `theme_tags.id ?= {:id}`. Only a development axis needs the
  kind as well: `development_tags.type = 'DEVELOP_SOCIAL'`.
- Each relation arrives expanded on its own, so the mapper reads it straight into its family.
  `tagOptions` groups every tag by kind for the pickers.
- **Per-kind rules can be schema again.** Each relation has its own `maxSelect` and
  `required` — 999 and optional for now. "At most three themes" is a setting; a rule per
  development axis is not, since the six share a relation.
- The kind of each link is checked by a hook, not by the schema. A record saved without
  validation (a migration's `SaveNoValidate`) skips it.
- If one kind later needs columns of its own, the answer is to move it back out into a
  collection of its own. The same id-preserving migration makes that cheap — it is how safety
  tags became `safety_instructions` ([ADR 0018](0018-safety-instructions-and-tips-are-catalogues.md)).
