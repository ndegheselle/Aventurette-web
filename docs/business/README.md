# Ajil, the clients' app

Ajil helps youth leaders find, prepare, run and review activities for the groups they look
after: scout units, holiday centres, camps. It is used on a phone, often held in hand while the
activity is running.

These documents say what the app does, in the user's words, whatever it is built with. They are
the reference for any version of the app: the current one, or one rewritten with another
technology. Screen ids (`A03`, `B07`…) are those of the design, *03 — Wireframes · V2 adaptée*.
User journeys (`UF-01`…) are those of *02 — User Flows*.

## Features

| Feature | Screens | Status |
|---|---|---|
| [Account and my space](account.md) | sign-in, onboarding, E01–E10 | Sign-in, onboarding and part of E01, E03, E04 built |
| [Catalogue](catalogue.md) | A01 A02 A14 A16 | *Toutes* and *Favoris* built |
| [Activity sheet](activity-sheet.md) | A03 A05 | Sheet built, preparation not |
| [Running an activity](running-an-activity.md) | A06 A07 A08 A09 A15 | Guided steps built; its ending differs; quick mode not built |
| [Creating an activity](activity-authoring.md) | B05 A04 A19 | Not built |
| [Sharing and exporting](sharing.md) | A10–A13 | Not built |
| [Planning](planning.md) | B01–B14 B16–B18 | Not built |
| [Preparation and inventory](preparation.md) | B15 B19 B20 C02 | Not built |
| [Follow-up](follow-up.md) | C01 C03–C09 | Not built |
| [Pedagogy](pedagogy.md) | D01–D11 | Not built |

**Built** means the current app does it. **Not built** means only the design exists: the screen
can be opened and says *Bientôt disponible*. Where the current app departs from the design, the
document says so under *Differs from the design*. A rewrite should choose which one to follow on
purpose, not by accident.

## Who uses it

- **Animateur**: finds and runs activities, does the preparation tasks given to them, writes
  bilans.
- **Responsable** (unit leader, *direction pédagogique*): creates events, gives out tasks,
  validates, reads reports.
- **Ajil**: writes the public catalogue and the editorial resources, in the back office. Not in
  this app.

What each role may do is set per structure ([Autorisations](account.md#settings)), not fixed in
the app. Today only two roles exist: a user, and an Ajil admin who writes the catalogue.

## Words

| Word | Meaning |
|---|---|
| Activité, fiche | A game, a workshop or an outing, described in one sheet. |
| Structure | The organisation a user belongs to (a scout group, a centre). It owns groups, templates, resources and an inventory. |
| Groupe, unité | The children a block or an event is for (*Scouts-Guides · 11–14 ans*). |
| Événement | A dated programme for one or more groups: two hours, a day, a camp. |
| Bloc | One line of an event's timeline: an activity or a temps de vie, at a time, for a duration, for a group. |
| Temps de vie | A block that is not an activity: welcome, meal, rest, services, evening. |
| Journée type, trame | A reusable day timeline, used to start an event. |
| Créneau | A free slot in a timeline, waiting for an activity. |
| Réalisation | The record that an activity was actually run, on a date, with a group. |
| Bilan | What the team thought of a réalisation, an event or a period. |
| Validation | A responsable's approval of an activity or an event. Optional, per structure. |
| Tâche | A preparation job drawn from an event: print, buy, set up. It has a responsable and a due date. |
| Fil conducteur | The pedagogical thread of a period: needs, objectives, themes, imaginary world. |
| Fil rouge, imaginaire | The story world that links activities (*Aventure › Pirates*). |
| Fil blanc | An optional spiritual intention, per structure. |
| Mode guidé | Running an activity step by step, full screen. |
| Mode rapide | Getting a game right now for the number of players present. |

## The frame

- **Five tabs** at the bottom: *Catalogue*, *Planning*, *Créer*, *Suivi*, *Pédagogie*. Each
  keeps its own history; tapping the current tab goes back to its first screen.
- **Every tab page's header** ends with ϟ, which opens the [Mode rapide](running-an-activity.md#quick-mode),
  and the avatar, which opens [Mon espace](account.md#my-space). The avatar carries a dot when a
  notification is unread.
- **Everything else opens full screen, over the tabs**: an activity, an event, a setting. A back
  arrow at the top, the actions at the bottom. The phone's back button does what the arrow does.
- **Short choices open a panel from the bottom**: share, add to the planning, pick a time,
  confirm.
- **The guided and quick modes are immersive**: no tabs at all.
- **No floating buttons.** An action is confirmed discreetly, with a short message, and with an
  undo when it can be undone.

## Rules that hold everywhere

- **One sheet, one guided mode.** The same activity sheet and the same guided mode are reached
  from the catalogue, the favourites, the planning and the quick mode. The history opens a
  bilan, never a sheet to replay.
- **The catalogue keeps its context.** Opened to fill a slot or replace an activity, it remembers
  the group and the slot, and choosing an activity puts it there.
- **A source is never changed by someone else's use of it.** A shared activity is read-only to
  who receives it; adapting it makes a personal copy. Changing a block in an event never changes
  the activity sheet it came from. Using a template creates an independent event.
- **Validation is optional.** A structure's *direction pédagogique* switches it on. It covers the
  objectives, the programme, the organisation, the responsibilities and the material, and is
  independent of the preparation tasks still to do.
- **Ticking material never changes the stock.** Purchases, returns, losses and consumption are
  confirmed by hand.
- **States, not pages.** *Activité en cours* is a banner, not a page. *Mes tâches* is a filter,
  not a module.
- **Notifications are shortcuts** to where the work is, not a second to-do list. They go only to
  the people concerned.

## Not decided

- **The fifth tab** is *Pédagogie* in the wireframes V2 and *Club* (collective and team
  resources) in the information architecture and the first wireframes. The app follows V2.
- **Using Ajil without an account.** The information architecture sets "code or link →
  catalogue → sheet → guided mode, with no account required" as the first priority. Today every
  screen needs a sign-in, and only accounts created by Ajil can sign in.
- **Ma progression** (badges, experience) is marked "to discuss".
- **Collaborative features** are still to prioritise.
- **Language of the content.** Activities and their tags exist in French only, whatever language
  the app is shown in.
