# 0022. Mobile specs live in `test/`, mirroring `lib/`

Status: Accepted. Keeps [0013](0013-specs-live-in-a-feature-tests-folder.md)'s intent — fewer
specs, and source folders that list source — and changes only where the specs sit.

## Context

0013 put the web's specs in each feature's `tests/` folder. In Flutter, `flutter test` looks in
`test/`, and every file under `lib/` belongs to the package: a spec there would be analysed as
app code and need its test imports in the app's dependencies.

## Decision

A mobile spec lives in `frontend/mobile/test/`, at the path of what it covers:
`test/features/activities/feedback_test.dart` covers `lib/features/activities/`. The test
toolkit — `FakeCrud`, `FakeAuth`, `signedInContainer` — is in `test/support/`, the counterpart
of `frontend/tests/`.

What earns a spec does not change: code with a decision in it. A mapper, a rule in `models/`, a
notifier that sequences writes or drops a stale answer. One widget test mounts the whole app on
the fake ports to check the wiring: the router's redirects, the dock, a sheet over it.

## Consequences

- A spec is one folder away from its subject instead of zero; `test/` mirrors `lib/`, so it is
  found by the same path.
- Flutter fails a widget test on a framework error — an overflow, a missing ancestor — the way
  [0011](0011-tests-fail-on-vue-warnings.md) makes a Vue warning fail.
