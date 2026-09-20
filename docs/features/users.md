# users

The account behind the session: what kind of user it is, and the children recorded against it.

## Routes

| Name | Path | Screen |
|---|---|---|
| `users.profil` | `/user/profil` | The profile, and the list of children |
| `users.profil.type` | `/user/profil/type` | Choosing a profile type |

## Data

`UserData` is the generated `UsersResponse` with no mapper of its own: the session comes back
from the auth port, which expands nothing and stores no file, so `childrens` is ids.

`childMapper` maps nothing but `expand` away: a child is a name, an age and its owner, and
nothing hangs off one. **`interests` is gone** — the collection it pointed at was removed, and
with it the relation, the picker and the two specs that covered them. If a child is to record
what it likes again, the catalogue's `attribute_options` are the natural vocabulary, but that
needs a relation on `childrens` that does not exist today.

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

## Rules that hold

*`tests/ChildrenList.spec.ts`*

- Removing a child asks first; declining keeps it on screen and on the server; accepting
  deletes it on the server and takes it off the list.

## Not finished

- Neither `Profil.page.vue` nor `SelectProfilType.page.vue` has a spec. They are thin — a
  layout, and a three-button choice that calls `users.update({ type })` and navigates — but the
  navigation after choosing a type is untested.
- Nothing routes to `users.profil.type`; it is reachable only by typing the URL.
