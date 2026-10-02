# 0015 — An activity's attributes are grouped by family in the model, flat in the database

**Status:** Accepted

## Context

The activity sheet template (*Template - Fiche d'activité*) describes an activity with some thirty
fields: format, practice, theme, imaginary universe and its rule, ages, group size, children's
pace, leader effort, leaders needed, workshop supervision, indoor and outdoor, detailed
location, requirements, seasons, safety tags, pedagogical goals, "ideal for", six developmental
axes, and so on. It also moves the material list from the steps to the activity, adds parallel
workshops, and gives each step a title, a kind, a duration, actions to tick, a visual brief, a
tip and, for the step announcing the end, what ends the activity.

`ActivityData` was the `activities` record as it was stored, one property per column. With that
many fields a flat object stops saying anything about how they relate. And the fields are meant
to be filtered on in increment 1, one at a time.

## Decision

**The columns stay flat. The entity groups them by family.** `ActivityData` keeps what
identifies the activity at the top — `id`, `name`, `description`, `state`, `user`, `visual`,
`visualBrief` — and puts everything else under one property per family:

| family | holds | columns |
|---|---|---|
| `classification` | format, practices, themes | `format`, `practices`, `theme_tags` |
| `imaginary` | rule, universes | `imaginary_rule`, `imaginary_tags` |
| `audience` | ages, group size, children's pace, age variants | `age_min`, `age_max`, `participants_min`, `participants_max`, `children_pace`, `age_variants` |
| `supervision` | leader effort, leaders needed, cross supervision, notes | `host_effort`, `recommended_hosts_numbers`, `cross_supervision`, `supervision_notes` |
| `place` | indoor, outdoor, locations, requirements, seasons | `indoor`, `outdoor`, `locations`, `conditions`, `seasons` |
| `safety` | safety instructions | `safety_instructions` |
| `pedagogy` | goals, ideal for, six development axes | `goal_tags`, `ideal_for_tags`, `development_tags` |

`api/activity.mapper.ts` is the only place that knows which column belongs to which family. It
builds the families on read and flattens them on write, as ADR 0007 has every mapper do.

Tags stay one collection, and each place a tag goes has a relation of its own (ADR 0014), so a
family reads and writes its tags like any other column. The six development axes share
`development_tags`, and the mapper sorts them apart by kind. Safety instructions have a
collection of their own, and so do tips, which sit beside the steps rather than in a family
(ADR 0018).

The identity fields stay at the top because the list filters on them. A filter key is a column
name, and `name`, `state` and `description` are both at once.

**Derived values are functions, not columns.** Preparation and playing time are sums of step
durations (`timingOf`). "With or without material" is whether the list is empty. The number of
leaders needed is still typed in by the author, until the supervision referential can compute
it.

What the template changed besides the grouping:

- `environnement` became `indoor` and `outdoor`, two independent flags, plus a `locations`
  list for detail.
- `season` became `seasons`, the four seasons. A holiday is not a season: it moved to a THEME
  tag.
- `weather` went. The template asks for no weather input.
- `energy_level` was renamed `host_effort`, since leader effort is what it measured.
- The FIELD tag kind was renamed THEME, and GOAL and IDEAL_FOR were added.
- `tags` was split into one relation per family (`1790700300_tag_relations_per_family.go`).
- Materials moved from `steps_materials` (a row per step) to `activities_materials` (a row per
  activity, with a quantity). Steps and workshops link the rows they use, without cascading.
- `activities_workshops` is new. So are a step's `title`, `kind`, `duration`, `visual_brief`,
  `actions`, `tip`, `end_criteria` and `end_criteria_other`.

The migrations are `1790700000_activity_attribute_families.go`,
`1790700100_materials_belong_to_the_activity.go`, `1790700200_workshops_and_step_guidance.go` and
`1790700300_tag_relations_per_family.go`. Each has a rollback, but some rollbacks lose data: a
list folds back into its first value, and the last one carries no tag links either way.

## Consequences

- The form and the detail screen read by family: `activity.place.indoor`,
  `activity.pedagogy.development.DEVELOP_SOCIAL`. The template's sections map onto panels.
- Every column can still be filtered on as it is. Filtering by a family field means naming its
  column, because filter keys are not mapped.
- **An update carries a family whole, or leaves it out.** The mapper writes a family's columns
  and tag relations only when the family is in the update, so updating one family never touches
  another.
- Validation errors still come back keyed by column (`age_min`, `host_effort`), so the form
  names columns when it shows an error. It is the one place above `api/` that does.
- The mapper is longer, and nothing checks it against the payload type except the specs. That
  was already true (ADR 0007). A round-trip spec over every development kind guards the one
  relation the mapper splits.
- An unset single choice is the empty string PocketBase stores. The model types it as `T | null`
  instead of pretending it is always set, and the mapper translates between the two — writing
  `''` back, never `undefined`, which would leave a cleared choice in place.
