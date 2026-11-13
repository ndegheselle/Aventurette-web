# Running an activity

Two immersive modes, without the tabs. The **guided mode** runs one activity step by step, the
phone in hand. The **quick mode** finds a game right now for the players actually present.

| Screen | | Status |
|---|---|---|
| A07, A15 | A step of the guided mode | Built |
| A09 | *Enregistrer ou quitter*, after the last step | Not built: the app shows a feedback screen instead |
| A08 | *Bilan* of the run | Not built |
| A06 | *Mode rapide* | Not built |

## Guided mode

Opened only from the sheet's *Mode guidé* (UF-05).

- **It runs the steps of the activity, in the author's order, and nothing else.** The general
  preparation and advice stay on the sheet.
- A step shows *ÉTAPE 2 / 5*, its title and what to say, then three tabs: *Consignes*, *Conseils*
  and *Sécurité*. Under them, the leader in charge of this step, the material for this step only,
  and the resources and story useful at this step.
- *Précédent* and *Suivant* move between steps; the last step has *Terminer*.
- Opened at a step that does not exist, it shows the nearest one: the first when none is given,
  the last past the end.
- The phone's back button does what the arrow at the top does.

### Leaving and coming back

From UF-09:

- **Leaving keeps the progress.** A banner, *Activité en cours*, then shows across the app, and
  brings the user back to the same step, with its rules, advice and resources.
- From the banner, the activity is resumed, finished or cancelled.
- ***Annuler* asks for confirmation** before dropping an activity that was started. A cancelled
  activity is not counted.

### Finishing

- *Terminer* asks whether to keep the run (A09). *Enregistrer* adds a **réalisation** to the
  history, on that date and with that group. *Quitter* closes the guided mode without counting
  it.
- Neither removes the activity from the planning.
- The **bilan** is optional (A08): the date and the group; how it went (*Difficile*, *Mitigé*,
  *Positif*); whether the objectives were reached (*Atteints*, *En partie*, *Non atteints*); what
  to remember next time. Saving adds the réalisation with or without the bilan.
- A saved réalisation shows in [Suivi](follow-up.md): in the history, and as a bilan to complete.
- A short game does not call for a full bilan every time.

## Quick mode

Opened by ϟ in the header of any tab, for when a game is needed now (UF-07, A06).

- It asks how many players are present: *− 5 joueurs +*. This is the number actually there, which
  may differ from the group's usual size.
- **It proposes one game at a time, compatible with exactly that number**: its title, one
  sentence, the players and the duration, the material (*Sans matériel*).
- *Lancer* opens it in the guided mode. *Passer* proposes another compatible game.
- One number, not a range to set with two handles.
- However many games are skipped, it never switches to the catalogue by itself.
- Leaving returns to where the user was.

## Differs from the design

What is built after the last step is a feedback screen, carried over from the earlier web app:
a *well done*, a like, the favourite heart, and a comment.

- **One feedback per user and activity.** The like and the comment end in the same record; a
  later run updates it rather than adding another.
- A second tap while the first is being saved adds nothing.
- The comment is saved without its surrounding spaces, only when it changed, and emptying the
  field removes it.

Also:

- **Nothing records that an activity was run**: no réalisation, no history.
- **There is no *Activité en cours* banner.** Leaving the run returns to the sheet.
- **A step's safety** shows as the activity's warning, not as a tab of the step.
- **No leader is named per step**, since there are no events yet.
