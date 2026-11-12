# 0023. A screen not built yet has its route, and says *Bientôt disponible*

Status: Accepted.

## Context

The wireframes draw 67 screens. The backend has what about a dozen of them need: activities,
favorites, feedback, the session. Events, day templates, tasks, validations, bilans,
fils conducteurs, sharing and structures have no collection yet.

Building only what the backend serves would leave a dock of five tabs where four lead nowhere,
and nothing to say what comes next or where in the wireframes it is.

## Decision

Every screen of the wireframes has a route. A screen the backend cannot serve yet is a
`ComingSoonPage`: its header, as designed, and *Bientôt disponible* with its wireframe id
(`B07`, `D03–D07`) in place of its content.

When a screen is built, its unbuilt calls throw `UnimplementedError` in `api/`, and nowhere
else. Two shared helpers turn that into a state rather than a crash:

- `AsyncView` shows *Bientôt disponible* for a read that throws it;
- `runAction` shows a toast for an action that throws it (*Partager* on a sheet, for now).

`UnimplementedError` means only this. Anything that is a bug throws something else.

## Consequences

- The app can be walked through as designed, from the first day.
- The backlog is a search: `grep -rn "UnimplementedError\|wireframe: '" lib/`.
- A placeholder route costs a line in its feature's `routes.dart` and a string; the
  generated-looking files under `features/planning/`, `features/tasks/`… are that, until built.
