# mobile app

The clients' app, Ajil, in `frontend/mobile/`. What the web's client screens did is ported to it;
every other screen of the wireframes (*03 — Wireframes · V2*) has its route and shows
*Bientôt disponible* ([ADR 0023](../../adr/0023-unbuilt-screens-throw-at-the-api-seam.md)).
Screen ids (`A03`, `B07`…) are the wireframes'.

## The frame

A dock of five tabs — Catalogue, Planning, Créer, Suivi, Pédagogie — each keeping its own
history; tapping the current tab goes back to its root. Every tab page's header ends with ϟ
(Mode rapide, A06) and the avatar (*Mon espace*, E01). Everything else opens full screen, over
the dock. Nobody signed in sees the login; a user who never saw the onboarding sees it first.

## Ported from the web

| Screen | Route | From the web's |
|---|---|---|
| Sign in with an emailed code | `/login` | `Login.page.vue` |
| Onboarding: the catalogue's default filters | `/onboarding` | `Onboarding.page.vue` |
| A01 · A02 Catalogue, segments *Toutes* and *Favoris* | `/catalogue` | `catalogue.page.vue`, `favorites.page.vue` |
| A03 An activity's sheet | `/activities/:id` | `activity.page.vue` |
| A07 · A15 Guided mode, one step to a page | `/activities/:id/run/:step` | `play.page.vue` |
| After a run: like, favourite, comment | `/activities/:id/feedback` | `feedback.page.vue` |
| E01 *Mon espace*, the avatar's menu | — | the dock's profile entry |
| E03 *Mes préférences*: language, theme, default filters | `/me/preferences` | `Settings.page.vue`, `Profile.page.vue` |
| E04 *Mon compte*: who is signed in, signing out | `/me/account` | `Settings.page.vue` |

They keep the web's rules — the catalogue's filters and profile, the favorites written one
activity at a time with an undo, one feedback per user and activity — as described in
[activities](activities.md) and [user](user.md). What differs:

- **The catalogue** is one list with its segments above it. The search and the filters belong
  to *Toutes*; *Favoris* lists the favorites as the web's tab did. A filter sheet edits a copy:
  *Appliquer* keeps it, closing the sheet drops it.
- **The sheet** follows A03: the facts under the title, *Préparation et matériel* (A05, not built),
  the details behind *Voir plus*, the materials and resources, the workshops, the steps, and four
  actions at the bottom — *Partager* (A10, not built), *Enregistrer* (the favorite), *Modifier*
  (A04, not built) and *Mode guidé*, the only way into a run.
- **The run** shows a step's tips as a *Conseils* tab beside its instructions, where the web had
  a button opening them.
- **Rich text is shown as plain text**: paragraphs and bullets, no bold or links.
- **The session is kept** on the device, in its secure storage: there is no *Rester connecté*.
- **The planning is not ported.** The web's calendar of single planned activities is replaced
  by events (B01–B20), which need collections that do not exist yet.

## Not built yet

Each has its route and its header; the wireframe id shows on the page.

| Feature | Screens |
|---|---|
| `activities` | A05 Préparation · A06 Mode rapide · A14 Partagés avec moi · A16 Mes créations |
| `activity_editor` | A04 Modifier l'activité · A19 Créer une activité |
| `sharing` | A10 the share sheet · A11 Contenu du dossier · A12 Aperçu · A13 Partager un lien |
| `planning/events` | B01–B02 the Planning tab · B06 Créer · B07 Événement · B08 Modifier · B11 Paramétrer le temps · B14 Coordination |
| `planning/day_templates` | B03 · B04 Journée type · B18 Modifier · E09 Modèles |
| `tasks` | B15 Préparation · C02 Ma tâche |
| `inventory` | B20 Inventaire |
| `create` | B05 the Créer tab |
| `follow_up` | C01 · C04 · C05 the Suivi tab |
| `validations` | C03 Valider l'événement · C08 Demander un ajustement |
| `reviews` | C06 Bilan pédagogique · C07 Rapport · A08 · A09 the bilan after a run |
| `pedagogy/*` | D01 the Pédagogie tab · D02 Fils conducteurs · D03–D08 a fil conducteur · D09–D11 Ressources |
| `user` | E02 Mes contenus |
| `structures` | E05 Paramètres · E06 Structures · E07 Autorisations |
| `notifications` | E08 Notifications · E10 Mes notifications |

The bottom sheets of the wireframes (B09, B10, B12, B13, B16, B17, B19, C09) open from those
screens, so they come with them.

The shared widgets they need beyond what `lib/ui/` has: a checkbox tile (title, line under it —
A05, C02, C03, A11, E07), a counter (− 5 joueurs +, A06), date and time-range fields (B06, B12),
a select opening a sheet of options (*Groupe ▾*), and a status badge (*À valider*, *Brouillon*).
Feature-owned: the day timeline, read-only and reorderable (B04, B07, B08, B18), the week strip
(B01), the coordination grid (B14), the task card (B15), and the breakdown bars (C05).

### What the backend needs for them

- **Structures, groups and roles**: `structures`, `groups`, memberships with a role, and what
  each role may do.
- **Events**: `events`, their blocks (an activity or a temps de vie, a start, a duration, a
  group), and the catalogue of temps de vie. They replace `user_planned_activities`.
- **Day templates**, with their blocks and who sees them (Ajil, the structure, oneself).
- **Tasks** drawn from a block's materials and preparation, with an assignee and a due date;
  **inventory** items and their movements.
- **Validations** per block, with a state and a comment.
- **Réalisations and bilans**: `user_activity_history` extended with the date, the group and the
  event, and the bilans themselves.
- **Fils conducteurs** and **pedagogical resources**; **shares**; **notifications**.
- **Users writing activities**: today only admins may.

## Rules that hold

*`test/features/activities/activity_mapper_test.dart`* — reading an activity, and the catalogue filter

- An activity asks for every nested relation its steps, materials and workshops need.
- Columns are grouped by family; a choice is read from the backend's spelling, and an unset one
  or one this version does not know reads as none. A stored 0 is an unset range end.
- Relations are inlined down to the file urls; an unexpanded one reads as empty, not as ids.
- The filter keeps an activity whose range overlaps the one asked for, an unset upper bound
  being no limit; a multiple select is compared value by value (`:each`), any one being enough.

*`test/features/activities/catalogue_filters_test.dart`* — quick filters and the profile

- A quick filter reads as its name while unset, its range, its place or a count once set.
- A range or a list counts once among the active filters.
- The profile sets the quick filters only, reads on while they match it (places as a set), is
  never applied when empty, and turned off clears the quick filters only.

*`test/features/activities/activity_test.dart`* — what the steps add up to

- Preparation is the steps preparing the game, play every other step; no duration counts as 0.
- Resources are gathered from the steps, each once. A resource's picture is its url when it is
  an image.
- A run's 1-based step reads as an index, the first for none, the nearest end past either end.
- An activity is a favorite once. A comment is saved trimmed, not when unchanged, and emptied
  when the field is.

*`test/features/activities/feedback_test.dart`* — one feedback per user and activity

- A like and a comment end in one record: the second write updates what the first created, and
  an earlier run's feedback is updated. A second tap while a write is in flight creates nothing.

*`test/features/activities/favorites_test.dart`*

- A change sends one activity, never the list; taking a removal back writes it again.

*`test/features/activities/library_feed_test.dart`* — the endless list

- Pages are appended; a new search starts over and drops a page asked for the previous one; a
  failed page ends the list until asked again.

*`test/features/user/user_test.dart`* — the router and the defaults

- The router waits while the session is read, sends nobody signed in to the login, a user not
  onboarded to the onboarding, and a signed-in user off the login.
- A stored 0 is an unset default; an unset one is written as 0.

*`test/app_test.dart`* — the wiring

- The whole app, mounted on the fake ports: the login signed out, the onboarding first, the
  catalogue and the dock signed in, a sheet over the dock, a tab not built yet saying so.

## Not finished

- **Nothing was checked on a phone yet.** The specs mount the app in a test; the screens were not
  looked at on a device or in a browser.
- **The catalogue asks for its next page on scroll only.** A first page shorter than the screen
  never asks for the second.
- **A bottom sheet does not close by dragging it down**, only with ×, the barrier or back.
- **Full-screen views have no back swipe on iOS**: the page transition is ours, not Cupertino's.
- **The login's errors are one message per step**; the web showed the backend's per-field ones.
- **No sign-in with Google, Microsoft or Apple**: the web's buttons did nothing either.
- **Pictures are placeholders**, as on the web.
- **Only the web platform is set up** for now, to run the app in a browser.
  `flutter create --platforms=android,ios .` in `frontend/mobile/` adds the phones back; their
  application id then has to be set (the template's is `com.example.mobile`).
