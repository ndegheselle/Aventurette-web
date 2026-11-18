# 0025. Structures are managed in a web app of their own

Status: Proposed. Completes [0020](0020-clients-use-a-flutter-app.md), which places the clients'
app and the back office but not the management app.

## Context

[The architecture](../architecture.md) aims at three clients: a phone app for **doing** the
activities, an app for **managing** a structure, and the back office where Ajil's team writes the
catalogue. The first and the last exist. The second does not.

Managing a structure is desk work on a large screen: the planning of every group in a time grid
(B14), the team and its roles, the subscription and its invoices. The phone app is built the
other way round ([0020](0020-clients-use-a-flutter-app.md)): a dock of five tabs, bottom sheets,
a guided mode run with the phone in hand.

Three ways were weighed:

1. **Adaptive layouts in the phone app.** Management needs its own navigation. That means two
   apps inside one binary, released together through the stores, with every client's phone
   shipping screens only managers use.
2. **A second Flutter app, sharing Dart packages with the first.** `models/`, `api/`, `core/` and
   `backend/` would move into a package, and the planning's rules would be written once. But the
   app would run on Flutter web: a heavy first load, weaker browser behaviour (text selection,
   Ctrl+F, opening in a new tab), and dense tables harder to build than in HTML. The other choice,
   desktop builds, means distributing installers. forui is mobile-first and before 1.0.
3. **A web app on the Vue workspace.** `@chapelure/core`, `@chapelure/pocketbase`,
   `@chapelure/ui`, `lint:arch` and the test helpers already exist, and the back office proves
   the stack on dense forms.

A subscription is sold to a structure. Selling it inside a store app may fall under the stores'
payment rules. On the web, it does not.

## Decision

**Structures are managed in a Vue app of its own, `frontend/manager/`**, a workspace of the npm
workspace in `frontend/`, beside the back office. It has the back office's shape: features as
slices ([0003](0003-features-are-vertical-slices.md)), logic outside components
([0009](0009-logic-lives-outside-components.md)), and the boundaries checked by `lint:arch`
([0008](0008-boundaries-are-enforced-by-a-script.md)).

**It shares no code with the phone app.** As in [0020](0020-clients-use-a-flutter-app.md), their
contract is the PocketBase schema and its rules.

**It is not an area of the back office.** The back office serves Ajil's team, the manager app
the structures' members. They differ in audience, in access and in release.

What each app holds:

| | Phone app | Manager app |
|---|---|---|
| Planning | a member's own days and events: see them, plan a day | the structure's planning across its groups: time grid, shifts |
| Structure | switching the active structure, the user's own access (E04, E06) | members, roles and what each role may do (E07) |
| Subscription | its status, if anything | choosing it, paying it, the invoices |

**Who may do what is a backend rule.** Permissions are PocketBase API rules, never a check in a
client alone. A rule both apps must honour when they **write** goes into a PocketBase hook rather
than into each app's mapper. A rule on how a record is **read** (a planned activity's length, for
example) may stay in each client's mapper, with its spec.

## Consequences

- Event and planning mappers exist twice, in Dart and in TypeScript, as activities already do. A
  column renamed in a migration is renamed in both; only the specs on each side catch a miss.
- A third app to deploy: a second SPA served by nginx, on its own host. The readme's deploy
  section and the architecture's flowchart change when the app is created, not before.
- Creating it means: adding `manager` to the `workspaces` in `frontend/package.json`, its aliases
  in `backend/scripts/aliases.mjs` *and* its `tsconfig.json`, and the Tailwind `@source` for
  `frontend/packages/ui/src`, as in `frontend/web/`.
- It cannot open to clients before structures, groups and their roles exist in the backend.
  Today only two roles exist, a user and an Ajil admin ([account](../business/account.md#roles-today)).
- The wireframes draw E06 and E07 in the phone's *Paramètres*. Editing roles and permissions moves
  to the manager app; [account](../business/account.md#settings) changes with the first of them
  built.
- The phone app never sells the subscription.
- The phone app may still adapt its own screens to a tablet. That is layout, not management.
