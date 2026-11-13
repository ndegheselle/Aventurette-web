# Catalogue

The first tab: find an activity by searching, filtering, or browsing the favourites, one's own
creations and what others shared. Every entry opens the same [activity sheet](activity-sheet.md).

| Screen | | Status |
|---|---|---|
| A01 | *Catalogue*, segment *Toutes* | Built |
| A02 | Segment *Favoris* | Built |
| A16 | Segment *Mes créations* | Not built |
| A14 | Segment *Partagés avec moi* | Not built |

## The page

One page: a search at the top (*Un jeu, une idée, un objectif…*), and under it four segments,
*Toutes*, *Favoris*, *Mes créations* and *Partagés avec moi*, which can also be swiped. The search
and the filters stay at the top while the list scrolls.

A card shows a picture, the family (*AVENTURE*), the title, and the format, duration and number
of players: *Grand jeu · 90 min · 8–20 joueurs*. A saved activity is marked *ENREGISTRÉ*.

## Search and filters

- The search looks in the titles.
- Filters drop down from the top (*Filtres ▾*). The most used ones are also quick filters, on one
  line under the search: age, number of children, place.
- A quick filter reads as its name while unset, and as what was chosen once set: a range, a
  place, or a count.
- A filter panel edits a draft. *Appliquer* keeps it; closing the panel drops it.
- **Every filter set must hold, and within one filter any value is enough**: an activity in the
  park *or* in the forest.
- **Ages and number of children keep an activity whose range overlaps the one asked for.** A
  range with no upper bound has no limit.
- Changing the search or a filter starts the list over. Results that arrive late for the previous
  search are dropped, never mixed in.
- More results load as the list is scrolled.

### The profile

The design pre-fills the filters from the **group** being prepared for: ages, duration,
indoor or outdoor, objectives (UF-08).

What is built uses the **user's own defaults** instead, chosen at the
[onboarding](account.md#onboarding) and in [Mes préférences](account.md#my-preferences): ages,
number of children, places. A toggle, *Appliquer mon profil*, sits in the filters:

- The profile sets the quick filters only.
- The toggle reads on while the quick filters still match the profile (places compared as a set).
- An empty profile is never applied.
- Turning it off clears the quick filters, and nothing else.

## Favourites

- A heart on every card and on the sheet (*Enregistrer*) adds or removes a favourite. A short
  message confirms it; the one for a removal has an undo, which puts the favourite back.
- **Each change is about one activity.** Two hearts tapped quickly one after the other both
  count; neither cancels the other.
- An activity is a favourite once, however many times it is added.
- *Favoris* lists them in the order they were added. The design gives it its own search (*Titre
  ou tag…*) and a filter by tag (*Camp*, *Coopération*).

## Mes créations

The user's own sheets: original ones and adaptations of someone else's. Each says what it is:
*Créée par moi · modifiable*, *Brouillon personnel*. Events are not listed here; they stay in the
[planning](planning.md). Creating one is [Creating an activity](activity-authoring.md).

## Partagés avec moi

What a person or the user's structure [shared](sharing.md): *Partagée par Camille · lecture
seule*. Always read-only. Each can be exported as PDF, printed, or its link copied. To adapt one:
*Créer → reprendre une activité existante*, which makes a copy and leaves the source unchanged.

## In context

Opened from the planning to fill a slot or to replace an activity (UF-02, UF-08), the catalogue
keeps the group and the slot. The filters start from the group. Choosing an activity places it in
that slot, and nothing is replaced before the user confirms.

## Differs from the design

- **The profile is the user's, not the group's**: groups do not exist yet.
- **The quick filters are age, number of children and place.** The design draws two age ranges
  and *Extérieur*.
- ***Favoris* has no search or tag filter.** The search and the filters belong to *Toutes*.

## Not decided

- **Temps de vie in the catalogue.** A design note says the catalogue holds activities *and*
  temps de vie; the V2 screens show activities only.
- **How the sheet shows "choose for this slot"** when opened in context: no screen draws it.
