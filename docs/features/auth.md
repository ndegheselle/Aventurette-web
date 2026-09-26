# auth

Signing in, signing up, and keeping everything else behind a session.

## Routes

| Name | Path | Screen |
|---|---|---|
| `auth.login` | `/user/login` | Log in |
| `auth.register` | `/user/register` | Sign up |

## The session

`useAuth` is the session, and there is exactly one: `current` is module-level state, shared by
every caller, so signing in anywhere signs in everywhere. `UserData` in `model/user.ts` is this
app's user record, for callers that need more than an id: `useAuth<UserData>()`.

`AuthMenu` is the session's corner of the navbar: the signed-in user's email and a logout, or a
login link.

The session itself is persisted by the backend adapter, not here. `refresh()` is what asks
whether a stored one is still valid — which is what makes a reload keep you signed in.

`useAuth` reaches for the router only when it is running inside a component. The route guard
calls it outside of one (it needs `isLoggedIn` and `refresh`, nothing else), and reaching for
the router there warned on every guarded navigation. Only `logout` navigates, and nothing
outside a component calls it.

## The guard

`authGuard(routesNames)` is registered in `main.ts` as a global `beforeEach`. It lets the login
and register routes through — otherwise nobody could ever sign in — and for anything else
admits a visitor who is already signed in, or whose stored session `refresh()` revives.
Everyone else is sent to `auth.login`.

It is a whitelist of two named routes, so **a new public route has to be added to it
explicitly**. That is the intended default: new screens are private.

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
- `logout` clears the session and goes to the login screen.
- `currentId()` throws `NotAuthentifiedError` rather than returning an empty id when signed out.
- The guard lets login and register through, sends an anonymous visitor to login, admits a
  visitor whose stored session is valid, and does not ask the backend again once signed in.

*`tests/LoginForm.spec.ts`, `tests/RegisterForm.spec.ts`*

- The submit button is disabled while the request is in flight, and enabled again after.
- A field error from the backend appears against that field; a failure with no detail shows the
  form's own default message.
- A refused attempt stays on the page, and can be retried with the error cleared.
- The register form's confirmation field edits independently of the password. These were bound
  to the same field once, so the two could never disagree and the check was dead.

## Not finished

- **Both forms are pre-filled with a development account** (`test@example.com` / `1234567890`),
  in `useLoginForm` and `useRegisterForm`. This has to go before real users see it.
- **"Stay logged in" is not wired to anything.** The checkbox binds to `rememberMe`, which is
  never sent; the session's lifetime is whatever the adapter decides.
- The OAuth2 provider buttons render and throw `NotImplementedError` when clicked.
