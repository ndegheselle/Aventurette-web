# users

The account behind the session: what kind of user it is, the children recorded against it, and
what those children are interested in.

## Routes

| Name | Path | Screen |
|---|---|---|
| `users.profil` | `/user/profil` | The profile, and the list of children |
| `users.profil.type` | `/user/profil/type` | Choosing a profile type |

## Data

`UserData` is the generated `UsersResponse`, with no `Expanded<>` wrapper: the auth provider
never asks for relations, so `childrens` is ids.

`ChildrenData` **is** expanded — `child.interests` holds the interests themselves, per
`CHILD_RELATIONS`. Saving a child still persists their ids
([ADR 0007](../adr/0007-relations-are-inlined-by-the-adapter.md)).

A profile type is one of `PERSONNAL`, `ASSOCIATION` or `SCHOOL`, from the generated schema.

## Children

`ChildrenList` is `useEditableList` from `@chapelure/ui` over `childrenApi`: the list holds the
records, the modal edits one, and `onRemove` is where this feature's own rule goes — ask for
confirmation, and delete on the server only once it is given. Declining leaves the child both
on screen and on the server.

The confirmation dialog is app-wide: `useConfirmation` needs one `<ConfirmationModal />`
mounted in the layout, which registers itself with the composable. With none mounted, `show()`
resolves to `null` — which reads as "cancelled" to every caller, so a missing dialog declines
an action instead of throwing.

## Interests

The picker shows every interest and marks the ones the child has. Two things make it less
trivial than it looks, both in `model/interest.ts`:

- The two lists come from different requests, so the child's interests are equal records but
  never the same objects. Marking is by id; comparing by identity would mark nothing.
- `isSelected` belongs to the picker, not to the data. `selectionOf` strips it before the
  selection is reported, so it is never saved.

## Rules that hold

*`tests/interest.spec.ts`*

- Marking is by id, and keeps the offered order rather than the selection order.
- An interest the child has that is no longer offered is ignored rather than reappearing.
- The source records are copied, not tagged: nothing gains an `isSelected` property.

*`tests/ChildrenList.spec.ts`, `tests/InterestsSelect.spec.ts`*

- Removing a child asks first; declining keeps it on screen and on the server; accepting
  deletes it on the server and takes it off the list.
- Clicking a marked interest reports the selection without it.
- Loading a different child into the picker re-marks it.

## Not finished

- Neither `Profil.page.vue` nor `SelectProfilType.page.vue` has a spec. They are thin — a
  layout, and a three-button choice that calls `users.update({ type })` and navigates — but the
  navigation after choosing a type is untested.
- Nothing routes to `users.profil.type`; it is reachable only by typing the URL.
