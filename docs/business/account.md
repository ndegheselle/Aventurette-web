# Account and my space

Signing in, the first visit, and everything behind the avatar: the user's contents, preferences,
account, settings and notifications.

| Screen | | Status |
|---|---|---|
| — | Signing in | Built |
| — | Onboarding | Built |
| E01 | *Mon espace* | Built, as a page rather than a menu |
| E02 | *Mes contenus* | Not built |
| E03 | *Mes préférences* | Built, with other content than designed |
| E04 | *Mon compte* | Partly built, inside *Mon espace* |
| E05–E07, E09 | *Paramètres*: structures, permissions, templates | Not built |
| E08, E10 | Notifications | Not built |

Signing in and the onboarding are not in the wireframes; they come from the earlier web app.

## Signing in

- **With a code sent by email.** The user types their email and taps *Recevoir un code*, then
  types the 6-digit code, valid 10 minutes. *Changer d'e-mail* goes back to the first step, which
  is also how to get a new code.
- **Only accounts that Ajil created can sign in**: the beta testers. There is no sign-up.
- **The screen answers the same for any email**, so it never tells whether someone has an
  account.
- A code allows 5 attempts every 3 minutes.
- **The session is kept on the device and renewed** as long as it is used within 7 days. There is
  no *Rester connecté*.
- Someone signed out sees only this screen; someone signed in never sees it.
- A development version also accepts a password, to sign in without a mailbox.
- There is no sign-in with Google, Microsoft or Apple.

## Onboarding

**Once, at the first sign-in, before anything else**: the user picks the catalogue's default
filters — ages, number of children, places. *Enregistrer* keeps them, *Plus tard* keeps nothing.
Either way it is not shown again, and the defaults can be changed later in
[*Mes préférences*](#my-preferences).

## My space

*Mon espace* (E01) opens from the avatar in every tab's header. **The design makes it a menu over
the current page**: the user's name, then *Mes contenus*, *Mes préférences*, *Mon compte*,
*Paramètres* and *Notifications*.

What is built is a full page with the same entries, plus the language, the theme (automatic,
light, dark) and *Se déconnecter*.

## My contents

*Mes contenus* (E02) gathers what is the user's own, with one search (title, tag or folder):

- *Mes dossiers* — the user's folders (*Camp · sorties · idées à tester*);
- *Mes créations* — activity sheets and events;
- *Mes favoris*;
- *Partagés avec moi* — read-only;
- *Mes journées types* — personal templates;
- *Mes récapitulatifs* — folders and reports saved.

**These open the same objects, in their own tab. Nothing is copied.** *Mon planning*, the
calendar showing only what concerns the user, is also reached from here (UF-12).

## My preferences

*Mes préférences* (E03), as designed:

- the language;
- the group used by default;
- how the planning opens: day, week or month;
- *Conserver mes filtres* — find the previous search again;
- *Réduire les animations*.

**Permissions to create or validate are not set here.**

What is built holds the catalogue's default filters, as at the [onboarding](#onboarding). A range
with no bound has no limit on that side. The language and the theme are in
[*Mon espace*](#my-space).

## My account

*Mon compte* (E04): first name, last name, email; *Mes accès* (structures and roles); *Sécurité du
compte* (password and sign-in); *Se déconnecter*.

What is built shows the name and the email, and signs out after a confirmation.

## Settings

*Paramètres* (E05) shows only what the user's rights allow, apart from the personal preferences.

- ***Structures*** (E06): the active structure (*Les Deux Rives · Scouts et Guides de France*),
  the user's role in it, the default unit, access and roles, and the
  [inventory](preparation.md#material-and-stock). **Changing structure changes the access, the
  templates and the resources available.**
- ***Autorisations*** (E07): for a structure and a role, what it may do:
  - create an activity — a new sheet, or one taken up from another;
  - create and modify an event — within the group's scope;
  - validate activities;
  - manage the structure's templates.

  **What was shared with the structure stays read-only, whatever the role.**
- ***Modèles*** (E09): which day templates show — Ajil's, the structure's, the user's own. **A
  structure can hide Ajil's for its members. That never removes an event already made from
  one.**
- ***Notifications*** (E08): see below.

## Notifications

**Preferences** (E08), each on or off:

- validation requests — only those concerning the user;
- the user's tasks and due dates;
- changes to the planning of a group or event followed;
- bilans to complete, after a saved réalisation.

**The list** (E10): *Toutes* or *Non lues*. Each one opens where the work is — *À valider · Sortie
SG* opens it in Suivi. **They are shortcuts, not a second to-do list.**

## Roles today

Only two roles exist: a user, and an Ajil admin who writes the catalogue in the back office. A
role is given by Ajil, never by the user. Structures, groups and the roles of *Autorisations* do
not exist yet.

## Not decided

- ***Ma progression*** — badges, experience — is marked "to discuss".
