# Planning

The second tab: the user's events over a day, a week, a month or a year. The tab is built as one
simple page; an event does not open yet, and day templates are not built. The earlier web
app planned single activities on dates; events replace that, and it is not carried over.

| Screen | | Status |
|---|---|---|
| B01 | The planning: a period and its events | Built, simplified |
| B02 | *Événements* | Not built |
| B03 | *Journées types* | Not built |
| B04 | A day template | Not built |
| B06 | *Créer un événement* | Not built |
| B07 | An event | Not built |
| B08 | *Modifier l'événement* | Not built |
| B09, B10, B11 | Adding a block: an activity, or a temps de vie and its setup | Not built |
| B12, B13 | A block's time, and an overlap | Not built |
| B14 | *Coordination* across units | Not built |
| B16 | *Dupliquer l'événement* | Not built |
| B17, B18 | Saving an event as a day template, editing a template | Not built |

## The planning page

- **A period, written out**: *Samedi 21 novembre 2026*, *16–22 novembre 2026*, *Novembre 2026*,
  *2026*. Tapping it opens a calendar showing the period; a day tapped picks the period holding
  it, of the same range.
- **Beside it, the range** to show by, in a menu: *Jour*, *Semaine*, *Mois*, *Année*. **The
  planning opens on today's week.** Another range keeps the day chosen: from the week of the 18th,
  *Mois* shows that month.
- **The events are grouped**: a week's by day, a month's by week, a year's by month; a day's are
  not grouped. A group with no event is left out; with none at all, *Aucun événement.*
- **A month's weeks start on Monday and are cut at the month's edges**: November 2026 starts with
  the 1st alone.
- **An event is in every group it takes part of.** One ending at midnight ends the day before.
- An event reads its times on one day — *9h30–17h30* —, its days otherwise — *28–29 novembre* —,
  then its status.
- *+ Créer un événement* ends the page.

### Differs from the design

- **One page, not three views.** The wireframes draw *Calendrier*, *Événements* and *Journées
  types* as segments; the app has the planning alone, until the other two are rebuilt.
- **No group filter.** Groups and structures do not exist yet.
- **No *2 activités à valider* on an event.** Blocks and validations do not exist yet: an event
  shows its status only — *Brouillon*, *Préparation en cours*, *Prêt*.

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

- An event (B07) and creating one (B06) open on *Bientôt disponible*.
- *Événements* (B02) and *Journées types* (B03) were removed with the simple planning page, and
  are to be rebuilt.
- An event's status is set only from the dashboard: nothing in the app changes it yet.
- *Mon planning* in Mon espace does not open the calendar yet.

## Not decided

- **An *Enregistrer* action on the event.** A design note lists it beside *Partager*,
  *Modifier* and *Dupliquer*; the V2 screen does not draw it.
- **Who sees *Partagés* events.**
- **The calendar's filters.** The first wireframes filtered by structure, group, event and
  person; V2 draws the group only.
