# 0018 — Safety instructions and tips are catalogues of their own

**Status:** Accepted

## Context

Safety tags lived in `tags` as the SECURITY kind ([ADR 0014](0014-activity-tags-are-one-collection.md)).
They were the only kind with a `description`, the precautions a risk calls for, so every other
kind carried an empty column and every tag picker was typed with it. ADR 0014 had left this
open: a kind that needs columns of its own moves back out into a collection of its own.

A step had a `tip`: free text the author wrote for that step. The same advice comes back from
one activity to the next ("count down before stopping", "start the next round before the last
one ends"), and it is advice an organisation wants to write once and curate, the way it curates
its safety instructions.

## Decision

**`safety_instructions`** holds what the SECURITY tags held:

| field | kind | |
|---|---|---|
| `slug` | text, required, unique | `^[a-z0-9-]+$`: the referential's names, `feu`, `eau`… |
| `name` | text, required | one language |
| `description` | editor | the precautions |

An activity links them through `safety_instructions`, which the model reads into
`activity.safety.instructions`.

**`tips`** holds advice, as a `name` and the advice itself in `description`. A step links the
tips it gives through `activities_steps.tips`, which the model reads into `step.tips`: the
template writes a tip under the step it helps with, and the run screen shows it there.

Both are reference data, like the tags: anyone may read them and a superuser writes them, from
the Dashboard. The editor picks among them and creates none.

**Two collections, not one.** Safety instructions and tips have the same shape today, a name and
some rich text. One collection told apart by a `type` was considered, as the tags are, and
turned down:

- PocketBase cannot restrict a relation to the records of one `type`. One collection would need
  a hook like `back/hooks/tag_kinds.go` to keep a tip out of the safety relation, and a record
  saved without validation skips a hook. Two collections are restricted by the relation itself.
- They are not the same data. A safety instruction is identified by its slug, and the
  referential is short and closed. A tip has no identifier and the catalogue grows with every
  activity. The slug would be required for one kind and meaningless for the other: the column
  only one kind uses is what this decision just took out of `tags`.
- What one collection bought the tags does not apply. Tags were nine identical referentials
  behind nine relations, nine rules and nine types. Here there are two, read in two different
  places.
- Merging later is one id-preserving migration, as `1790028400_merge_referentials_into_tags.go`
  was. Splitting a merged collection is what this decision paid for.

Migration `1790850000_safety_instructions_out_of_tags.go` copies every SECURITY tag into
`safety_instructions` under its id, so an activity's links carry over. Then it deletes the
SECURITY tags, the kind and `tags.description`. Migration `1790850100_tips_catalogue.go` gives
each step's tip a row of the catalogue, named after its step, or after its activity when the
step has no title, and linked to the activity in the order of its steps. Then it drops
`activities_steps.tip`. Its rollback puts every tip an activity links back on its first step,
since which step a tip came from is not kept.

Migration `1791000000_tips_on_steps.go` then moves the link from the activity to its steps:
`activities.tips` goes, and every tip an activity linked goes on its first step, since which step
it was for is not kept. An activity with no step keeps none, the tips staying in the catalogue.

## Consequences

- `tags` is uniform again: `type`, `slug`, `name`. The tag-kind hook checks one relation fewer.
- **A tip belongs to a step.** The run screen shows a step's tips at that step, and the detail
  screen no longer has a tips button.
- **Tips are picked, not written.** An author cannot add one from the editor. The catalogue
  starts with one row per tip the steps held, named after their step, so near-duplicates are
  merged by hand.
- The import matches safety instructions by name or slug, and each step's tips by name, the way
  it matches tags. The sheet format is version 3: a version 1 file named safety tags and gave
  each step a tip, a version 2 one named the tips on the activity, and both are refused rather
  than read with those parts silently lost.
