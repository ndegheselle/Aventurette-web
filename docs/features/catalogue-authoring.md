# catalogue-authoring

The catalogues every activity picks from, written in one place: materials
([ADR 0016](../adr/0016-materials-are-a-catalogue.md)), tags
([ADR 0014](../adr/0014-activity-tags-are-one-collection.md)), safety instructions and tips
([ADR 0018](../adr/0018-safety-instructions-and-tips-are-catalogues.md)). They are the
`catalog_` collections ([ADR 0019](../adr/0019-catalogues-are-prefixed.md)).

What an activity takes from a catalogue is not here. That is the activity's links, written from
the activity's editor in [activities-authoring](activities-authoring.md).

## Routes

| Name | Path | Screen |
|---|---|---|
| — | `/catalogue` | Redirects to the materials tab |
| `catalogue.materials` | `/catalogue/materials` | The materials |
| `catalogue.tags` | `/catalogue/tags` | The tags |
| `catalogue.safety` | `/catalogue/safety` | The safety instructions |
| `catalogue.tips` | `/catalogue/tips` | The tips |

The four are children of `Catalogue.page.vue`, which holds the tabs and the navbar title.
Admin-only: the parent's `meta.roles` is `[Role.ADMIN]`, which vue-router merges into each
child, so the auth guard sends anyone else home, and the sidebar hides the link
([auth](auth.md#roles)).

The backend checks it too for tags, safety instructions and tips: their create, update and
delete rules ask for `@request.auth.role = "ADMIN"`
(`1790850400_admins_write_the_catalogues.go`). Reading stays open to everyone.

## The materials tab

`useMaterialsEditList` owns it: `useCatalogueEditList`'s page, search and delete, with adding
and renaming on top. There is no modal and no form to save: each write is its own.

- **Adding** writes the typed name, trimmed. The backend refuses a name it already has, whatever
  its case: an alert says so, and the name stays typed.
- **Renaming** is written as a row's field is left. `renamedTo` decides whether there is
  anything to write: nothing for a blank field or an unchanged one. A blank field, or a name
  the backend refuses, shows the saved name again. The composable keeps the last saved names by
  id for that, so the list never shows a name the catalogue does not hold.
- **Deleting** asks first, because it reaches every activity using the material: the links
  cascade, and each activity, step and workshop loses it. `CatalogueTab` confirms, the
  composable writes, then re-queries.

## The tags, safety instructions and tips tabs

Each is a list, sorted by name, with a search, and a modal per entry. `useCatalogueEditList`
holds what they share with the materials tab: the page, the search and the delete. `useTagsEditList`,
`useSafetyInstructionsEditList` and `useTipsEditList` give it its catalogue and its search. The
modals save through `useEditModal`, and the tab re-queries once one is confirmed.

Every tab, materials included, renders through `components/CatalogueTab.vue`: the search and
its add button, each row's delete (and edit) button, the delete's confirmation and the pages.
A page gives it the row's content and, for tags, the kind selector.

- **Tags** are searched by name or slug, and narrowed to one kind by the selector
  (`tagsFilter`). A new tag takes the kind the selector shows, or THEME on "every kind". Its
  kind is fixed once it exists: the activities linking it took it for that kind, and the
  backend's tag-kind check would refuse their next save.
- **Safety instructions** have a name, a slug and their precautions as rich text, searched by
  name or slug.
- **Tips** have a name and the advice as rich text, searched by name.
- **A slug follows the name** while a new entry is written (`slugFollowing`, wired into both
  modals by `useSluggedEditModal`): it is `slugify`'s reading of the name until the author
  writes one of their own. An existing slug changes only
  by hand, since the import matches on it. The backend refuses a slug that is not lower-case
  letters, digits and dashes, and one its catalogue already has (within a kind, for tags).
- **Deleting** asks first. The backend unlinks the entry from every activity using it: the
  relations do not cascade, so the activities stay.

## Data

The shapes and mappers are in `activities/`, with the other read models. This feature imports
them, and `api/` holds one `crud` per catalogue.

## Rules that hold

*`tests/catalogue.edit.spec.ts`*: what a rename writes, the slugs, and the tags' query.

- What was typed, trimmed. Nothing for a blank field, or for the name it already has.
- A change of case is a rename.
- A slug is lower case, has no accents, and has one dash per run of anything else, none at the ends.
- A new entry's slug follows its name until the author writes another.
- The tags' query leaves out an empty search, rather than sending an empty group.

*`tests/useMaterialsEditList.spec.ts`*: a refused rename puts the field back.

- A refusal shows the last saved name, not the one first read.
- A blank field writes nothing and shows the saved name.
- A refused name to add stays typed; an added one clears the search.

## Not finished

- **Nothing says how many activities use an entry** before it is deleted, and nothing lists
  the ones no activity uses.
- **No merge.** Two entries that are the same thing under different names are fixed by renaming
  one and deleting the other, which loses the deleted one's links.
- **Roles stop at the client for materials.** `catalog_materials` is still open to everyone, so
  any signed-in user can rename or delete a material through the API.
- The material rows reuse the placeholder images the rest of the app does.
