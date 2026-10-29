# user

The account: signing in and up, the session, roles, guarding the rest of the app, and what a signed-in user can change about themselves.

## Routes

| Name | Path | Screen |
|---|---|---|
| `user.login` | `/user/login` | Log in |
| `user.register` | `/user/register` | Sign up |
| `user.onboarding` | `/user/onboarding` | The filter defaults, once, at the first sign-in |
| `user.settings` | `/user/settings` | Settings |
| `user.profile` | `/user/settings/profile` | The settings' profile section: the filter defaults |

Both hang under `Auth.layout.vue` rather than the default one: no sidebar, and a navbar holding
only a home link and the theme and language menus, above the same footer. Settings is private like any new route, under the main layout, and is
reached from the account menu in the navbar (`AuthMenu`).

## The session

`useAuth` is the session, and there is exactly one: `current` is module-level state, shared by
every caller, so signing in anywhere signs in everywhere. `UserData` in `models/user.ts` is this
app's user record; `useAuth().current` holds a `SessionUser`, the part of it the session needs —
id, email, name, avatar and role — and the backend is asked for those fields only
(`api/session.ts`). The rest of the record, the favorites included, is read by the screen that
needs it.

`AuthMenu` is the session's corner of the navbar: the signed-in user's email and a logout, or a
login link. `logout` only drops the session; the menu then goes to the login screen.

The session itself is persisted by the backend adapter, not here. `refresh()` is what asks
whether a stored one is still valid — which is what makes a reload keep you signed in.

`useAuth` never navigates: the route guard calls it outside of a component, where the router
cannot be injected, so moving between screens is left to the component that asks for it.

## The guard

`authGuard` is registered in `main.ts` as a global `beforeEach`. It lets the login
and register routes through — otherwise nobody could ever sign in — and for anything else
admits a visitor who is already signed in, or whose stored session `refresh()` revives.
Everyone else is sent to `user.login`.

It is a whitelist of two named routes, so **a new public route has to be added to it
explicitly**. That is the intended default: new screens are private.

Past the session it reads the route's `meta.roles`: a user holding none of them is sent to `/`.
`to.meta` merges every matched record's, so a parent route's `roles` covers its children.

## Roles

A user's `role` is `USER` or `ADMIN`, in `models/user.ts` as `Role`. The backend stores no role as
an empty string, and `roleOf` reads that as `USER` — every account that existed before roles is
a plain user.

`hasRole(user, roles)` is the one rule: no roles asked for lets anyone through, signed out
included; otherwise the user must hold one of them. `useAuth().hasRole(...roles)` applies it to
the session, which is what a template binds to hide an element:

```vue
<template v-if="hasRole(Role.ADMIN)">…</template>
```

and a route asks for one in its meta, which the guard checks:

```ts
{ path: '/materials/authoring', component: MaterialsEditPage, meta: { roles: [Role.ADMIN] } }
```

`meta.roles` is typed by the `RouteMeta` augmentation in `guard.ts`.

A role is **granted by a superuser**, from the PocketBase Dashboard. The `users` create and update
rules refuse a body that sets `role`, or anyone could sign up as an admin or promote themselves.
`role` is required all the same: a user created without one is given `USER` by a hook
(`backend/api/hooks/users.go`), which is what lets a sign-up through.

## Onboarding

A signed-in user whose record says they have not been `onboarded` is sent to `user.onboarding`
by the guard, whatever they were opening. It hangs under the bare layout (`bareRoutes`), though
it is private. It asks for the catalogue's filter defaults; *Save* stores them and *Later*
stores nothing. Either way the user is `onboarded` after, so it is shown once, and the session is
refreshed so the guard knows.

## Filter defaults

The ages, the duration in minutes and the places the user looks for activities in:
`defaultAgeMin` and `defaultAgeMax`, `defaultDurationMin` and `defaultDurationMax`, and
`defaultLocations` on the user record, read and written through `api/filterDefaults.mapper.ts`.
As on an activity's audience, a 0 bound is unset. The places were copied from an activity's
`locations` when the migration ran; adding a place to one does not add it to the other.
`useFilterDefaults` holds the form for both the onboarding and the profile, and
`ui/FilterDefaults.vue` its fields.

## Settings

The settings page sets the theme and the language, opens the profile, and logs out. A section,
the profile so far, is a child route of `user.settings`: on a phone it takes the whole page, with
a back button to the menu; on a desktop it shows beside the menu. The *Children* entry is shown
disabled.

## Favorites and history

- `users.favorites` is a list of activities. It sits on the user record, so the `users` rules
  already keep it to its owner. Deleting an activity removes it from every list.
- `user_activity_history` holds one record per user and activity (a unique index on both):
  revisiting updates the record, and `updated` is when the activity was last opened. Every rule
  is `user = @request.auth.id`, and an update cannot move a record to another user or activity.
  Deleting either side deletes the record. Nothing in the app reads or writes it yet.

The favorites' screens, and reading and writing them, are the
[activities](activities.md#favorites) feature's.

## Errors

Nothing in this feature validates credentials. The backend does, and answers with per-field
codes that the adapter normalises into `ValidationError`; `useValidationErrors` turns a code
into a message by looking up `validation.errors.<code>`.

That includes the password confirmation on the register form: the backend returns
`validation_values_mismatch` on `passwordConfirm`, which renders like any other field error.
One rule, in one place.

## Rules that hold

*`tests/useAuth.spec.ts`, `tests/guard.spec.ts`*

- One session is shared by every caller.
- A rejected login reaches the caller rather than being swallowed, and leaves the session empty.
- `logout` clears the session.
- `currentId()` throws `NotAuthenticatedError` rather than returning an empty id when signed out.
- The guard lets login and register through, sends an anonymous visitor to login, admits a
  visitor whose stored session is valid, and does not ask the backend again once signed in.
- On a route with `meta.roles`, the guard sends a user without the role home, admits one with
  it, and still sends an anonymous visitor to login.

- A user who has not seen the onboarding is sent there first, and let into it.

*`tests/filterDefaults.spec.ts`*

- A 0 bound reads as unset, and an unset one is written back as 0.
- A write sends only the fields given, so putting the onboarding off keeps the defaults.

*`tests/user.spec.ts`*

- An empty role is a plain user.
- No roles asked for lets anyone through; otherwise the user must hold one of them.

*`tests/Login.page.spec.ts`, `tests/Register.page.spec.ts`*

- The submit button is disabled while the request is in flight, and enabled again after.
- A field error from the backend appears against that field; a failure with no detail shows the
  form's own default message.
- A refused attempt stays on the page, and can be retried with the error cleared.
- The register form's confirmation field edits independently of the password. These were bound
  to the same field once, so the two could never disagree and the check was dead.

## Not finished

- **History has no screen.** The backend stores it; nothing in the app reads or writes it yet.
- **Both forms are pre-filled with a development account** (`test@example.com` / `1234567890`),
  in `useLoginForm` and `useRegisterForm`. This has to go before real users see it.
- **"Stay logged in" is not wired to anything.** The checkbox binds to `rememberMe`, which is
  never sent; the session's lifetime is whatever the adapter decides.
- The OAuth2 provider buttons render and throw `NotImplementedError` when clicked.
- A denied route redirects to `/` silently, with no message. A route that redirects `/` to an
  admin-only screen would loop.
- **The filter defaults filter nothing yet.** The catalogue's filters are not wired to its
  feed, so the defaults are stored and shown in the profile, and used nowhere else.
- **Every account that existed before onboarding gets it once**, at its next sign-in: `onboarded`
  starts false for everyone.
- **The profile edits only the filter defaults.** The email
  and the password go through PocketBase flows (confirmation emails) that nothing in the app
  drives yet, and the avatar the backend can store is not editable; the navbar shows a
  placeholder.
