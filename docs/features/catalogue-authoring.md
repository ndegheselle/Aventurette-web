# materials-authoring

The material catalogue: the names every activity picks its materials from, added, renamed and
deleted in one place ([ADR 0016](../adr/0016-materials-are-a-catalogue.md)).

What an activity needs of a material, and how much, is not here. That is the activity's link to
it, written from the activity's editor in [activities-authoring](activities-authoring.md).

## Routes

| Name | Path | Screen |
|---|---|---|
| `materials.authoring` | `/materials/authoring` | The catalogue |

Admin-only: `meta.roles` is `[Role.ADMIN]`, so the auth guard sends anyone else home, and the
sidebar hides the link ([auth](auth.md#roles)). The collection's API rules are still open to
everyone, as the step collections' are.

## The screen

`useMaterialsEditList` owns it: the page, sorted by name, a search on the name, and three
writes, each on its own. There is no form to save.

- **Adding** writes the typed name, trimmed. The backend refuses a name it already has, whatever
  its case, and `useSubmit` puts the refusal under the field.
- **Renaming** is written as a row's field is left. `renamedTo` decides whether there is
  anything to write: nothing for a blank field or an unchanged one. A blank field, or a name
  the backend refuses, shows the saved name again. The composable keeps the last saved names by
  id for that, so the list never shows a name the catalogue does not hold.
- **Deleting** asks first, because it reaches every activity using the material: the links
  cascade, and each activity, step and workshop loses it. The page confirms, the composable
  writes, then re-queries.

## Data

`MaterialData` and `materialMapper` are in `activities/`, with the other shapes. This feature
imports them, and `api/materials.api.ts` is the catalogue's `crud`.

## Rules that hold

*`tests/material.edit.spec.ts`*: what a rename writes.

- What was typed, trimmed. Nothing for a blank field, or for the name it already has.
- A change of case is a rename.

*`tests/useMaterialsEditList.spec.ts`*: a refused rename puts the field back.

- A refusal shows the last saved name, not the one first read.
- A blank field writes nothing and shows the saved name.

## Not finished

- **Nothing says how many activities use a material** before it is deleted, and nothing lists
  the ones no activity uses.
- **No merge.** Two materials that are the same thing under different names are fixed by
  renaming one and deleting the other, which loses the deleted one's links.
- **Roles stop at the client.** The API rules do not check the role, so any signed-in user can
  still rename or delete a material through the API.
- The rows reuse the placeholder images the rest of the app does.
