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
| — | Planning a day: picking activities, setting their times, saving them on a day | Built |
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
- **The events and the saved activities are grouped**: a week's by day, a month's by week, a
  year's by month; a day's are not grouped. A group with neither is left out; with nothing at
  all, *Rien de prévu sur cette période.*
- **A saved activity shows as on the plan**: a card with its name and its time — *9h–9h45* —,
  its day before it in a month or a year. Tapping it opens the activity's sheet. **It keeps the
  length it had on the plan**, even if the activity's steps change afterwards.
- **A month's weeks start on Monday and are cut at the month's edges**: November 2026 starts with
  the 1st alone.
- **An event is in every group it takes part of.** One ending at midnight ends the day before.
- An event reads its times on one day — *9h30–17h30* —, its days otherwise — *28–29 novembre* —,
  then its status.
- *+ Commencer un planning* ends the page: it [plans a day](#planning-a-day).

### Differs from the design

- **One page, not three views.** The wireframes draw *Calendrier*, *Événements* and *Journées
  types* as segments; the app has the planning alone, until the other two are rebuilt.
- **No group filter.** Groups and structures do not exist yet.
- **No *2 activités à valider* on an event.** Blocks and validations do not exist yet: an event
  shows its status only — *Brouillon*, *Préparation en cours*, *Prêt*.

## Planning a day

Planning mode picks activities in the catalogue, then sets their times on the day's timeline.
**The plan is kept on the phone until it is saved; it makes no event.**

**Entering it**: *Commencer un planning* opens the catalogue in planning mode. *Ajouter au
planning*, always at the bottom of an [activity's sheet](activity-sheet.md#the-sheet-a03), adds
that activity — and enters planning mode when outside it. **Once the activity is in the plan, it
takes it out instead** (*Retirer du planning*, shown on a long press, as each icon's label).

**In planning mode**, the catalogue and the sheets end with a bar: *Planification en cours ·
2 activités*, *Annuler*, which drops the plan, and *Valider*, which opens the plan.

**The plan** shows the day's hours, 0h to 24h, down the left, and each activity as a card at its
time: its name and *9h30–10h15*.

- **The first time it opens with activities, it asks for the start time** (9h unless changed).
  The first activity starts then; each next one starts when the one before ends, in the order
  they were picked.
- **An activity lasts its play time**: the steps after the preparation. **One with none lasts
  30 minutes**, and a short one is drawn half an hour tall, so the cards stay readable.
- **Everything stays within the day.** An activity that would run past midnight ends at
  midnight instead.
- **An activity added once the times are set goes after the one ending last.** ***Ajouter***,
  at the bottom of the plan, goes back to the catalogue to pick more.
- **Overlapping activities are drawn side by side**; nothing prevents an overlap.
- **Activities scrolled wholly out of view are counted** in a badge at the top (*↑ 2 activités*)
  or the bottom of the timeline.
- **Tapping a card** opens a panel: its time on a wheel, applied as it turns; *Remplacer*;
  *Retirer*. **Holding a card** moves it up or down; it lands on the nearest five minutes.
- ***Remplacer*** goes back to the catalogue. The bar then names the activity being replaced,
  and the sheet's button reads *Remplacer*: the activity chosen takes its place and its time,
  and the plan opens again. *Annuler* stops the replacement only.
- ***Enregistrer le planning*** asks which day the plan is for — the planning's day unless
  changed —, saves each activity at its time on it, leaves planning mode and opens the planning
  on that day. **If saving fails, the plan stays as it was.**

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

- An event (B07) and creating one (B06) open on *Bientôt disponible*; nothing links to B06.
- A saved activity cannot be moved or removed from the planning yet.
- A plan saved half-way — some activities written, then a failure — is not undone: saving again
  writes those twice.
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
