# Planning

The second tab: events in a calendar, the events themselves, and the day templates they start
from. The tab's three views are built; an event and a template do not open yet. The earlier web
app planned single activities on dates; events replace that, and it is not carried over.

| Screen | | Status |
|---|---|---|
| B01, B02 | *Calendrier* and *Événements* | Built; *Partagés* not built |
| B03 | *Journées types* | Built; *Ma structure* not built |
| B04 | A day template | Not built |
| B06 | *Créer un événement* | Not built |
| B07 | An event | Not built |
| B08 | *Modifier l'événement* | Not built |
| B09, B10, B11 | Adding a block: an activity, or a temps de vie and its setup | Not built |
| B12, B13 | A block's time, and an overlap | Not built |
| B14 | *Coordination* across units | Not built |
| B16 | *Dupliquer l'événement* | Not built |
| B17, B18 | Saving an event as a day template, editing a template | Not built |

## The three views

Three segments at the top of the tab.

- ***Calendrier*** (B01): by day, week, month or year, for a group (*Scouts-Guides ▾*). Each event
  shows its status: *2 activités à valider*, *Préparation en cours*. **Statuses show here; the
  validations to handle are in [Suivi](follow-up.md#validations).**
- ***Événements*** (B02): a search by name or period, *Mes événements* and *Partagés*, each event
  with its dates and status (*brouillon*, *préparation en cours*).
- ***Journées types*** (B03): Ajil's, the structure's and the user's own; a search by duration or
  group. **A structure may replace or hide Ajil's templates** ([Modèles](account.md#settings)).

Each view ends with *+ Créer un événement*. *Mon planning*, reached from
[Mon espace](account.md#my-space), is the same calendar showing only what concerns the user.

### What the views do

- **The calendar opens on this week, for every group.** A week runs from Monday. The arrows step
  to the period before or after; *Aujourd'hui* comes back to the one holding today. Changing the
  scale keeps today when it is in view, and the period's first day otherwise.
- **A day of the week or of the month opens that day; a month of the year opens that month.**
  Today stands out; a day with an event carries a dot. The year shows how many events each month
  holds, rather than a card per event.
- **An event is on every day it takes part of.** One ending at midnight ends the day before.
- **The group** lists the groups the user's events name. **An event for every group shows in each
  group's calendar.** The list is hidden while no event names a group.
- ***Événements*** lists the user's events in the order they start, searched by name. An event
  reads *21 novembre · 9h30–17h30* on one day, *28–29 novembre* over days of a month,
  *30 novembre – 2 décembre* across months, then its group (*toutes les unités* when none) and
  its status.
- ***Journées types*** lists Ajil's templates or the user's own, by name, searched by name or by
  the line that says what the day holds. A template's times follow its name when it has some.

### Differs from the design

- **No *2 activités à valider* on an event.** Blocks and validations do not exist yet: an event
  shows its status only — *Brouillon*, *Préparation en cours*, *Prêt*.
- **The group is the event's own text.** Groups and structures do not exist yet, so the choices
  are drawn from the user's events rather than from their structure.
- **The calendar has arrows and *Aujourd'hui***; the wireframe draws one week with no way to move.
- ***Partagés* and *Ma structure* say *Bientôt disponible***: nothing is shared yet, and
  structures do not exist.

## An event

**Creating** (B06, UF-01): a name, the dates (from one day to another), the times, the place,
with or without a night, the group or unit, and the template to start from. **The template's temps
de vie are already in the new event**, and can be changed. Only the people allowed to by their
structure can create one.

**The event** (B07) opens full screen, without the tabs: its name, date and times, place, and
whether there is a night. Three views:

- *Déroulement* — the timeline: each block's time, name, kind (activity or temps de vie),
  duration and status (*À valider*). *+ Ajouter au planning* adds a block;
- *Préparation* — its [tasks](preparation.md);
- *Coordination* — the [units side by side](#coordination).

A group selector, the link to its [fil conducteur](pedagogy.md), and at the bottom *Partager*,
*Modifier*, *Dupliquer*.

**Editing** (B08): *Propriétés* (dates, places, times, nights, groups); the blocks, which can be
reordered by dragging, each with *modifier* — or for an activity *remplacer* or *retirer*;
*+ Ajouter un bloc*; *Enregistrer comme journée type*.

- **Changing a block never changes its source sheet.**
- **A validation stays apart from the preparation.**

**Summary** (UF-10): the event's details lead to its objectives, programme, team, material and
resources, and to a [folder to export or print](sharing.md#a-folder-to-export-or-print-a11-a12). It does
not replace the quick actions on a block.

## Blocks

A block is an activity or a temps de vie, on a date, from a start time, for a duration, for a
group.

**Adding one** (B09): *Une activité* opens the [catalogue in context](catalogue.md#in-context);
*Un temps de vie / libre* opens a list (B10): *Accueil*, *Rassemblement / conseil*, *Repas*,
*Repos / temps libre*, *Services*, *Veillée / nuit*. **The group and the slot chosen are
remembered** through it.

**Setting up a temps de vie** (B11): the date and duration, the group, the organisation, the
preparation, the material, the usual tasks. That setup can be reused in a day template. The
people in charge are chosen in the event's preparation.

**Its time** (B12): the event, the group, the date, the start and the duration. **The end is
computed**: 10:00 for 1 h 30 ends at 11:30. *Vérifier le créneau* checks it.

**An overlap** (B13): when the slot overlaps another block **of the same group**, the app says
which one, and offers the next free slot of the same length, or changing the times. **Nothing
already there is removed or replaced.** Other groups are not checked.

**A block's actions** (UF-02): *Voir*, *Décaler*, *Changer*, *Modifier*, *Matériel*,
*Ressources*, *Retirer*.

## Replacing an activity

From UF-02:

- *Changer* opens the catalogue in context, keeping the slot and the search.
- **Without validation, or for someone allowed to:** the activity is replaced at once.
- **With validation on:** the change becomes a request, following the permissions. **Until it is
  approved, the original activity and its slot stay.**
- A request sent back *À ajuster* comes with a comment; it is changed and sent again.
- The people concerned are told.

## Duplicating

*Dupliquer* (B16) asks for a new start date, then copies:

- the activities and temps de vie, in the same order and with the same durations;
- the groups and the preparation, **with every task back to *À faire***.

**Validations and bilans are not copied.** A whole camp can be duplicated. Duplicating a year's
events at once is planned for later.

## Day templates

A day template is a day's timeline: times, temps de vie, and activity slots either filled or
left *à compléter*. It belongs to Ajil, to a structure, or to one user.

- **Using one** (B04) creates an independent event. **Changing the template afterwards changes no
  event made from it.**
- **Saving an event as a template** (B17): a name; personal or for the structure; whether to keep
  the times and temps de vie, and the preparation and material; whether to keep the activities
  chosen, or leave their slots to fill. **No bilan or validation goes into a template.**
- **Editing a template** (B18) works as editing an event, and changes only that template.

## Coordination

For an event with several units (B14): a grid of times against units, *Ma vue* or *Toutes les
unités*. Each leader can narrow it to their own unit. **It is a view of the event, not another
event.** *Préparation de l'équipe* assigns tasks per group.

## Not finished

- An event (B07), creating one (B06) and a template (B04) open on *Bientôt disponible*.
- An event's status is set only from the dashboard: nothing in the app changes it yet.
- *Mon planning* in Mon espace does not open the calendar yet.

## Not decided

- **An *Enregistrer* action on the event.** A design note lists it beside *Partager*,
  *Modifier* and *Dupliquer*; the V2 screen does not draw it.
- **Who sees *Partagés* events.**
- **The calendar's filters.** The first wireframes filtered by structure, group, event and
  person; V2 draws the group only.
