# user

What a signed-in user can change about their own account.

## Routes

| Name | Path | Screen |
|---|---|---|
| `user.settings` | `/user/settings` | Settings |

Private like any new route, under the main layout. It is reached from the account menu in the
navbar (`AuthMenu`).

## What it does

The settings page shows the account's email, read-only, and edits its display name. Saving
writes the user's own record, then asks `useAuth().refresh()` for it again: the session holds a
copy of the user, and this is what keeps the navbar's copy current.

The backend's `users` update rule (`id = @request.auth.id`, and no `role` in the body) is what
keeps a user to their own record; nothing here checks it.

## Rules that hold

None worth a spec: `toProfilePatch` trims the name, and the rest is wiring.

## Not finished

- The email and the password cannot be changed here; both go through PocketBase flows
  (confirmation emails) that nothing in the app drives yet.
- The avatar the backend can store is not editable; the navbar shows a placeholder.
