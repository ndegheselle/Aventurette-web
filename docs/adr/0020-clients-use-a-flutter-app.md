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

The Flutter app's widgets, theme and icons are [forui](https://forui.dev)'s
([0024](0024-mobile-app-uses-forui-theme.md)). The app is a `WidgetsApp`: its
own code uses no Material and no Cupertino widget.

## Consequences

- Every rule of an entity's mapping exists twice, in TypeScript and in Dart. A column renamed
  in a migration has to be renamed in both mappers; nothing checks that they agree. Specs on
  both sides are the only guard.
- The web's client screens — the library, the favorites, the run, the feedback, the planning —
  are now duplicates of the mobile app's, or replaced by it. Deleting them is its own change.
- forui gives the controls, the bottom sheet, the dialog, the toasts and the dock. What it
  lacks — a route's page, the page frame — is ours, in `lib/ui/`, on Flutter's `widgets`
  library.
- forui draws some controls with Material inside (a text field is a Material `TextField`), and
  brings Material's localizations with its own. The app does not import Material, but ships it.
- forui is before 1.0 and breaks its API between minor versions. An upgrade is a change of its
  own.
