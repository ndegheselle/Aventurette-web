# admin

The attribute catalogue, whole and read-only.

An activity has almost no columns of its own: age, duration, environment and the developmental
keywords are all rows of `attribute_definitions` and `attribute_options`, seeded rather than
coded ([activities](activities.md#the-attribute-catalogue)). That makes the catalogue the one
piece of this app you cannot read off the source, which is what this screen is for — a filter
that offers nothing, or an attribute nobody remembers seeding, is visible here and nowhere else.

## Routes

| Name | Path | Screen |
|---|---|---|
| `admin.catalogue` | `/admin/catalogue` | Every group, its attributes, and their vocabularies |

Behind the auth guard like everything but login and register — and **behind nothing else**.
There is no admin role: `users.type` is `PERSONNAL`, `ASSOCIATION` or `SCHOOL`, none of which
means "may administer". Any signed-in user can open this page. It reads and never writes, so the
exposure is the catalogue itself, but the name of the feature promises a restriction the app
cannot keep yet.

## Data

**It owns none.** `useCatalogue` reads through `activities`' own `useAttributes`, so the three
reference collections are fetched once and served from memory, and the catalogue has one
definition in the codebase rather than two. The dependency runs one way, as it does from
[activities-edit](activities-edit.md): nothing in `activities` imports this feature.

What is this feature's own is `model/catalogue.ts` — how the flat lists become a tree:

- Groups keep the order they arrive in, which is the order the seed wrote them and the order
  the Glossaire lists them.
- **A group that defines nothing is still listed.** An empty group is a thing an administrator
  needs to see.
- **An attribute whose group is missing is gathered at the end**, under a null group, rather
  than dropped. A catalogue screen that silently hides a row is worse than one that looks
  untidy — and an orphan is exactly what someone deleting a group would produce.

`optionCount` totals the vocabularies for the header, and is the only number computed rather
than counted in the template.

## The screen

One panel per group: its name and slug, how many attributes it defines, then each attribute
with its slug, its type as a badge, and **its whole vocabulary** — 159 option badges across the
catalogue, not a count. Seeing the values is the point; counting them is what the header does.

Two notes distinguish an attribute with nothing to offer:

- a `single_choice` or `multi_choice` with no options is **a warning** — its vocabulary is
  missing, which is `Sécurité`'s situation today;
- every other type shows nothing at all, because a range or a free text never had one.

`takesOptions` in `activities/model/attribute.ts` is what tells the two apart, beside
`isFilterable`, which decides the same kind of question for the filter bar.

## Rules that hold

*`tests/catalogue.spec.ts`* — the grouping, which is the only decision here

- Every group is listed with what it defines, in the order given.
- A group that defines nothing is listed anyway.
- An attribute whose group is missing lands in a trailing entry rather than disappearing, and
  no such entry appears when every attribute has its group.
- `optionCount` totals the vocabularies.

The page itself gets no spec: it is markup over one computed, and mounting it would assert the
catalogue's contents rather than this feature's behaviour
([ADR 0013](../adr/0013-specs-live-in-a-feature-tests-folder.md)).

## Not finished

- **"Administration" is a name, not a permission.** See Routes.
- **Nothing here writes.** Adding a keyword still means a seed migration or the PocketBase
  Dashboard. Editing from this screen is the obvious next step, and the reason the feature is
  called `admin` rather than `catalogue`.
- **Imaginaire's families are not shown**, because they are no longer stored — the `subgroup`
  column that held them has been dropped, so the thirteen keywords render as one flat list.
