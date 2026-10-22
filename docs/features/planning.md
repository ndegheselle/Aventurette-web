# planning

The user's calendar: when they mean to run which activity.

## Routes

| Name | Path | Screen |
|---|---|---|
| `planning` | `/planning` | The calendar of the user's plans |

The dock and the sidebar link it where the search used to be; search is now a tab of the
library ([activities](activities.md#routes)). The page is loaded when it is first opened:
FullCalendar would otherwise add about a third to the main bundle.

## Planning an activity

A button beside the heart on an activity's page (`ui/PlanButton.vue`) opens a sheet with a date
and time, set to the next full hour (`defaultPlanningStart`). Confirming saves the plan and a
toast says so. An activity may be planned any number of times.

The sheet is teleported to the body: the actions holding the button stick above the dock on a
phone, and a sheet opened inside them would sit under the dock.

The picker is a `datetime-local` input, which holds a local time with no zone.
`toDateTimeInput` and `fromDateTimeInput` translate it field by field — `toISOString` would show
the UTC hour, and `new Date` accepts half-typed values.

## The calendar

FullCalendar v7 (`@fullcalendar/vue3`, its plugins imported from its subpaths) with its classic
theme. The theme's palette is not imported: `Planning.page.vue` sets every one of its variables
from the daisyUI theme, so the calendar follows a theme switch, dark included.

On a desktop: month, week and list views. On a phone: the week as a list, since a month grid
does not fit and neither does the full toolbar.

An event is a plan, titled with the activity's name and lasting as long as its steps add up to,
preparation included (`planningEventsOf`). An activity with no duration gets the calendar's
default length. Tapping one opens a sheet with its date, a link to the activity, and a button
taking the plan off; the toast for that has a *Cancel* that plans it again.

`usePlanning` is the screen. The calendar reads its events through `fetchEvents`, the event
source it is given, each time its dates change. They are not passed as reactive options: the
calendar re-applies changed options, which fires a date change, which would read them again in
a loop. A removal asks the calendar to read again. Only the last read asked for may report a
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
- The picker shows a date in local time to the minute, and reads what it holds back as that
  local time; an empty or half-typed value is no date. It opens on the next full hour.
- The mapper reads PocketBase's date and the activity whole, an unexpanded activity as none,
  and writes the activity as its id and the date as PocketBase compares it.

## Not finished

- **A plan cannot be moved.** Taking it off and planning it again is the only way.
- **Only the activity's page plans.** The library's cards have the heart but not the planning
  button.
- **More than 200 plans in the dates shown** are not all read.
- **Nothing reminds the user** of what they planned.
