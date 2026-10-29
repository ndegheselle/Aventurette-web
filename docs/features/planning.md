# planning

The user's calendar: when they mean to run which activity.

## Routes

| Name | Path | Screen |
|---|---|---|
| `planning` | `/planning` | The calendar of the user's plans |

The dock and the sidebar link it where the search used to be; search is now the catalogue's filters in the
library ([activities](activities.md#routes)). The page is loaded when it is first opened:
FullCalendar would otherwise add about a third to the main bundle.

## Planning an activity

Two ways in, one sheet.

**From the planning.** Tapping a time in the week or the day view, or the plus button, opens a
sheet on a new plan, drawn in the calendar where it will land (a dashed preview event, removed
when the sheet closes). The month view has no time to tap: a tap there opens the day instead
(`calendarTapOf`); the all-day row plans at the hour a new plan would start now. The plus button
plans at the next full hour, or at that hour on the first day shown when today is not on screen
(`newPlanStart`). On a phone it floats above the dock, as an activity's actions do; on a
desktop it ends the toolbar.

The sheet holds the date and time, and *Choose an activity*. That sets the pick
(`usePlanningPick`, module state) and opens the catalogue, which shows a banner saying what the
pick is for, with a way to give it up. On the activity's page, the planning button then stands
out and reads *Add to planning*.

**From an activity's page**, with no pick: the plan is made at the next full hour
(`defaultPlanningStart`), with no sheet.

Either way `usePlanActivity` writes what `planningWriteOf` decides — a new plan, or the
picked plan's activity changed — clears the pick, and opens the planning with `?plan=<id>`. The
planning goes to that plan's date and opens its sheet, then drops the query so a reload does
not open it again. Arriving on the planning any other way also clears the pick.

**A plan's sheet** shows its activity, the same date and time — a change is saved at once and
the event moves — a link to the activity, *Change*, which picks another activity the same way
for this plan, and *Remove*; the toast for that has a *Cancel* that plans it again.

The time is a `datetime-local` input, which holds a local time with no zone.
`toDateTimeInput` and `fromDateTimeInput` translate it field by field — `toISOString` would show
the UTC hour, and `new Date` accepts half-typed values.

## The calendar

FullCalendar v7 (`@fullcalendar/vue3`, its plugins imported from its subpaths) with its classic
theme. The theme's palette is not imported: `Planning.page.vue` sets every one of its variables
from the daisyUI theme, so the calendar follows a theme switch, dark included.

Its own header is off: the screen draws its toolbar — the dates shown, previous and next,
today, and a dropdown of the views (month, week, day, list). The calendar reports its title and
view through `datesSet`, and the toolbar moves it through its API. A phone opens on the week as
a list, a desktop on the month. That first view is read once: an option that changes is applied
again, and would put the calendar back on it.

An event is a plan, titled with the activity's name and lasting as long as its steps add up to,
preparation included (`planningEventsOf`). An activity with no duration gets the calendar's
default length.

`usePlanning` is the screen. The calendar reads its events through `fetchEvents`, the event
source it is given, each time its dates change. They are not passed as reactive options: the
calendar re-applies changed options, which fires a date change, which would read them again in
a loop. A write asks the calendar to read again. Only the last read asked for may report a
failure: moving quickly through the calendar sends a read before the last is back, and the
backend client aborts the older one.

## Data

`user_planned_activities`: `user`, `activity`, `start`. Each user reads and writes their own
plans, and nobody else's — admins included. Deleting the user or the activity deletes them.
There is no unique index on the pair, since an activity may be planned several times; the
index is on `user, start`, which is how the calendar reads.

`PlannedActivityData` in `models/planning.ts`; `plannedActivityMapper` in
`api/plannedActivity.mapper.ts` expands the activity whole, with every relation it has, so the
calendar can sum its steps. An activity the read did not expand reads as null, and the calendar
leaves the plan out.

**Dates are written the way PocketBase stores them** (`toBackendDate`): UTC, a space between the
day and the time. A filter compares the stored text, so a bound written with ISO's `T` would
sort wrong. `planningApi.between` reads one user's plans over `[from, to)`, at most 200 of them.

## Rules that hold

*`tests/planning.spec.ts`*

- An event ends when the activity's steps add up to; one with no duration is left to the
  calendar; a plan whose activity was not read is left out.
- The sheet shows a date in local time to the minute, and reads what it holds back as that
  local time; an empty or half-typed value is no date. A new plan starts on the next full hour.
- A tap in the month opens the day; elsewhere it plans at the time tapped, or, on the all-day
  row, at the next full hour's time. The plus button plans today when today is shown, else on
  the first day shown.
- Adding an activity changes the plan picked for, plans at the time picked, or, picked for
  nothing, plans at the next full hour.
- The mapper reads PocketBase's date and the activity whole, an unexpanded activity as none,
  and writes the activity as its id and the date as PocketBase compares it.

## Not finished

- **The list view has no time to tap.** A plan is added there with the plus button.
- **A pick outlives leaving the catalogue** for anywhere but the planning: the banner and the
  standing-out button stay until it is used or given up.
- **Only the activity's page plans.** The library's cards have the heart but not the planning
  button.
- **More than 200 plans in the dates shown** are not all read.
- **Nothing reminds the user** of what they planned.
