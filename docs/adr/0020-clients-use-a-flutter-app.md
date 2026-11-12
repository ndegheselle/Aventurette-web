# 0020. Clients use a Flutter app; the Vue app becomes the back office

Status: Accepted.

## Context

The design moved to a phone-first app (*03 — Wireframes · V2*, 67 screens at 390 × 844): a
dock of five tabs, full-screen sheets, bottom sheets, a guided mode run with the phone in hand.
The product is renamed **Ajil**.

The Vue app was responsive, not mobile: a desktop layout squeezed down, in a browser tab, with
no store presence, no offline session and no native feel for the guided run. Its admin screens
(the activity editor, the catalogues) are the opposite: dense forms meant for a large screen.

## Decision

Clients use a Flutter app in `frontend/mobile/`, package `ajil`. The Vue app in `frontend/web/`
is the back office, for admins only.

The two apps share no code. Their contract is the PocketBase schema in `backend/api/`.

The Flutter app uses no Material and no Cupertino: its widgets are Remix, on Naked UI and Mix,
styled by our own tokens ([0024](0024-mobile-theme-reuses-joufflu-tokens.md)).

## Consequences

- Every rule of an entity's mapping exists twice, in TypeScript and in Dart. A column renamed
  in a migration has to be renamed in both mappers; nothing checks that they agree. Specs on
  both sides are the only guard.
- The web's client screens — the library, the favorites, the run, the feedback, the planning —
  are now duplicates of the mobile app's, or replaced by it. Deleting them is its own change.
- Without Material, a route's page, a bottom sheet, a toast and a snack bar are ours to write
  (`lib/ui/`). The cost is a few hundred lines; the gain is a look that is ours on both
  platforms, and no Material theme to fight.
- Remix, Mix and Naked UI are in beta. Their versions are pinned exactly, and an upgrade is a
  change of its own.
