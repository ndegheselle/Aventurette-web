import 'package:ajil/features/planning/events/models/calendar.dart';
import 'package:ajil/features/planning/events/models/event.dart';
import 'package:ajil/features/planning/events/routes.dart';
import 'package:ajil/features/planning/events/state/planning.dart';
import 'package:ajil/features/planning/events/ui/create_event_button.dart';
import 'package:ajil/features/planning/events/ui/event_text.dart';
import 'package:ajil/ui/async/async_view.dart';
import 'package:ajil/ui/content/surfaces.dart';
import 'package:ajil/ui/i18n/strings.g.dart';
import 'package:ajil/ui/inputs/pills.dart';
import 'package:ajil/ui/theme/text.dart';
import 'package:ajil/ui/theme/tokens.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:forui/forui.dart';
import 'package:go_router/go_router.dart';

/// The *Calendrier* (B01): a scale, a group, the period with a way to step through it, and the
/// events in it, each with its status.
class CalendarView extends ConsumerWidget {
  const CalendarView({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final t = context.t.events;
    final view = ref.watch(calendarProvider);
    final calendar = ref.read(calendarProvider.notifier);
    final period = view.period;
    final events = ref.watch(calendarEventsProvider);
    // The marks on the days follow the list; while it loads, the days are drawn bare.
    final shown = forGroup(events.value ?? const [], view.group);

    return ListView(
      padding: const EdgeInsets.only(bottom: AppSpaces.page),
      children: [
        ChoicePills(
          values: CalendarScale.values,
          selected: period.scale,
          labelOf: (scale) => t.calendar.scales[scale.name]!,
          onSelected: calendar.zoom,
        ),
        const SizedBox(height: AppSpaces.spacing),
        const _GroupSelect(),
        const SizedBox(height: AppSpaces.spacing),
        _PeriodHeader(period: period),
        const SizedBox(height: AppSpaces.spacing),
        switch (period.scale) {
          CalendarScale.day => const SizedBox.shrink(),
          CalendarScale.week => _WeekStrip(period: period, events: shown),
          CalendarScale.month => _MonthGrid(period: period, events: shown),
          CalendarScale.year => _YearGrid(year: period.start.year, events: shown),
        },
        const SizedBox(height: AppSpaces.spacing),
        // A year lists by month, above: a card per event would bury them.
        if (period.scale != CalendarScale.year)
          AsyncView(
            value: events,
            onRetry: () => ref.invalidate(calendarEventsProvider),
            data: (_) => _EventCards(events: sortedByStart(shown)),
          ),
        const SizedBox(height: AppSpaces.spacing),
        const CreateEventButton(),
        const SizedBox(height: AppSpaces.spacing),
        HintBox(t.calendar.hint),
      ],
    );
  }
}

/// Which group the calendar shows: the groups the user's events are for. Hidden while none is
/// named, as there is nothing to choose.
class _GroupSelect extends ConsumerWidget {
  const _GroupSelect();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final t = context.t.events.calendar;
    final groups = ref.watch(eventGroupsProvider).value ?? const [];
    if (groups.isEmpty) return const SizedBox.shrink();

    return FSelect<String>(
      label: Text(t.group),
      hint: t.allGroups,
      clearable: true,
      items: {for (final group in groups) group: group},
      control: .lifted(
        value: ref.watch(calendarProvider.select((view) => view.group)),
        onChange: ref.read(calendarProvider.notifier).selectGroup,
      ),
    );
  }
}

/// The period's name, between the buttons going to the one before and the one after.
class _PeriodHeader extends ConsumerWidget {
  const _PeriodHeader({required this.period});

  final CalendarPeriod period;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final t = context.t;
    final calendar = ref.read(calendarProvider.notifier);
    final showsToday = period.contains(ref.watch(todayProvider));

    return Row(
      spacing: 4,
      children: [
        // On one line, shrunk rather than wrapped when *Aujourd'hui* takes its room.
        Expanded(
          child: FittedBox(
            fit: BoxFit.scaleDown,
            alignment: Alignment.centerLeft,
            child: Text(periodTitle(t, period), style: context.titleText, maxLines: 1),
          ),
        ),
        if (!showsToday)
          FButton(
            variant: .ghost,
            size: .sm,
            mainAxisSize: MainAxisSize.min,
            onPress: calendar.today,
            child: Text(t.events.calendar.today),
          ),
        FButton.icon(
          variant: .ghost,
          semanticsLabel: t.events.calendar.previous,
          onPress: calendar.previous,
          child: const Icon(FLucideIcons.chevronLeft),
        ),
        FButton.icon(
          variant: .ghost,
          semanticsLabel: t.events.calendar.next,
          onPress: calendar.next,
          child: const Icon(FLucideIcons.chevronRight),
        ),
      ],
    );
  }
}

/// One day of a strip or a grid: today stands out, a day with events carries a dot, and a tap
/// opens it alone.
class _DayCell extends ConsumerWidget {
  const _DayCell({required this.day, required this.label, required this.busy});

  final DateTime day;
  final String label;
  final bool busy;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final colors = context.theme.colors;
    final isToday = day == ref.watch(todayProvider);

    return Semantics(
      button: true,
      child: GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTap: () => ref.read(calendarProvider.notifier).openDay(day),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 6),
          decoration: BoxDecoration(
            color: isToday ? colors.secondary : colors.muted,
            borderRadius: context.theme.style.borderRadius.md,
          ),
          child: Column(
            spacing: 2,
            children: [
              Text(
                label,
                style: (isToday ? context.labelText : context.bodyText).copyWith(fontSize: context.labelText.fontSize),
                textAlign: TextAlign.center,
              ),
              Container(
                width: 5,
                height: 5,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: busy ? colors.primary : const Color(0x00000000),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// The week's seven days: *L 16* to *D 22*.
class _WeekStrip extends StatelessWidget {
  const _WeekStrip({required this.period, required this.events});

  final CalendarPeriod period;
  final List<PlanningEvent> events;

  @override
  Widget build(BuildContext context) {
    final letters = context.t.events.dates.weekdaysLetter;

    return Row(
      spacing: 4,
      children: [
        for (final day in period.days)
          Expanded(
            child: _DayCell(
              day: day,
              label: '${letters[day.weekday - 1]} ${day.day}',
              busy: eventsOn(events, day).isNotEmpty,
            ),
          ),
      ],
    );
  }
}

/// The month, a week to a line, from Monday.
class _MonthGrid extends StatelessWidget {
  const _MonthGrid({required this.period, required this.events});

  final CalendarPeriod period;
  final List<PlanningEvent> events;

  @override
  Widget build(BuildContext context) {
    final letters = context.t.events.dates.weekdaysLetter;

    return Column(
      spacing: 4,
      children: [
        Row(
          children: [
            for (final letter in letters)
              Expanded(
                child: Text(letter, style: context.captionText, textAlign: TextAlign.center),
              ),
          ],
        ),
        for (final week in monthGrid(period.start))
          Row(
            spacing: 4,
            children: [
              for (final day in week)
                Expanded(
                  child: day == null
                      ? const SizedBox.shrink()
                      : _DayCell(day: day, label: '${day.day}', busy: eventsOn(events, day).isNotEmpty),
                ),
            ],
          ),
      ],
    );
  }
}

/// The twelve months, three to a line, each with how many events it holds.
class _YearGrid extends ConsumerWidget {
  const _YearGrid({required this.year, required this.events});

  final int year;
  final List<PlanningEvent> events;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final t = context.t;
    final counts = eventCountsByMonth(events, year);

    Widget month(int month) => Expanded(
      child: Semantics(
        button: true,
        child: GestureDetector(
          behavior: HitTestBehavior.opaque,
          onTap: () => ref.read(calendarProvider.notifier).openMonth(DateTime(year, month)),
          child: Panel(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              spacing: 2,
              children: [
                Text(shortMonthText(t, month), style: context.headingText),
                Text(
                  counts[month - 1] == 0 ? '–' : t.events.calendar.eventCount(count: counts[month - 1]),
                  style: context.captionText,
                ),
              ],
            ),
          ),
        ),
      ),
    );

    return Column(
      spacing: AppSpaces.spacing,
      children: [
        for (var row = 0; row < 4; row++)
          Row(
            spacing: AppSpaces.spacing,
            children: [for (var column = 1; column <= 3; column++) month(row * 3 + column)],
          ),
      ],
    );
  }
}

/// The period's events, as cards opening each.
class _EventCards extends StatelessWidget {
  const _EventCards({required this.events});

  final List<PlanningEvent> events;

  @override
  Widget build(BuildContext context) {
    final t = context.t;
    if (events.isEmpty) {
      return Padding(
        padding: const EdgeInsets.symmetric(vertical: AppSpaces.page),
        child: Text(t.events.calendar.empty, style: context.captionText, textAlign: TextAlign.center),
      );
    }

    return Column(
      spacing: AppSpaces.spacing,
      children: [
        for (final event in events)
          LinkCard(
            title: calendarTitle(t, event),
            subtitle: calendarSubtitle(t, event),
            onTap: () => context.push(EventsRoutes.event(event.id)),
          ),
      ],
    );
  }
}
