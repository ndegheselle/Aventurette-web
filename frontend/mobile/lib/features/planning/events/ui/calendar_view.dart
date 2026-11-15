import 'package:ajil/features/planning/events/models/calendar.dart';
import 'package:ajil/features/planning/events/models/event.dart';
import 'package:ajil/features/planning/events/state/planning.dart';
import 'package:ajil/features/planning/events/ui/create_event_button.dart';
import 'package:ajil/features/planning/events/ui/event_text.dart';
import 'package:ajil/features/planning/events/ui/event_tile.dart';
import 'package:ajil/ui/async/async_view.dart';
import 'package:ajil/ui/content/surfaces.dart';
import 'package:ajil/ui/i18n/strings.g.dart';
import 'package:ajil/ui/theme/text.dart';
import 'package:ajil/ui/theme/tokens.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:forui/forui.dart';

/// The *Calendrier* (B01): a group, the day chosen — another is picked on the date field's
/// calendar —, its week on one line, and the events of that day, each with its status.
class CalendarView extends ConsumerWidget {
  const CalendarView({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final t = context.t;
    final view = ref.watch(calendarProvider);
    final events = ref.watch(calendarEventsProvider);
    // The marks on the days follow the list; while it loads, the days are drawn bare.
    final shown = forGroup(events.value ?? const [], view.group);

    return ListView(
      padding: const EdgeInsets.only(bottom: AppSpaces.page),
      children: [
        const _GroupSelect(),
        const SizedBox(height: AppSpaces.spacing),
        _DateField(selected: view.selected),
        const SizedBox(height: AppSpaces.spacing),
        // A new week is a new line: forui's line calendar scrolls to its first date only once.
        _WeekLine(key: ValueKey(weekOf(view.selected)), selected: view.selected, events: shown),
        const SizedBox(height: AppSpaces.spacing),
        AsyncView(
          value: events,
          onRetry: () => ref.invalidate(calendarEventsProvider),
          data: (_) => _DayEvents(events: eventsOn(shown, view.selected)),
        ),
        const SizedBox(height: AppSpaces.spacing),
        const CreateEventButton(),
        const SizedBox(height: AppSpaces.spacing),
        HintBox(t.events.calendar.hint),
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

/// A dot under a day that has events, over forui's own drawing of it.
Widget _marked(Widget day, {required bool busy, required Color color}) => Stack(
  children: [
    Positioned.fill(child: day),
    if (busy)
      Positioned(
        bottom: 4,
        left: 0,
        right: 0,
        child: Center(
          child: Container(
            width: 4,
            height: 4,
            decoration: BoxDecoration(color: color, shape: BoxShape.circle),
          ),
        ),
      ),
  ],
);

/// The day chosen, written out; tapping it opens a calendar to pick another.
class _DateField extends ConsumerWidget {
  const _DateField({required this.selected});

  final DateTime selected;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final t = context.t;
    final calendar = ref.read(calendarProvider.notifier);

    return FDateField.calendar(
      label: Text(t.events.calendar.date),
      format: (context, date, _) => dayTitle(t, fromCalendarDate(date)),
      selectionControl: .liftedSingle(
        value: toCalendarDate(selected),
        toggleable: false,
        onChange: (date) {
          if (date != null) calendar.select(fromCalendarDate(date));
        },
      ),
    );
  }
}

/// The chosen day's week, Monday to Sunday, on one line that fits the width rather than
/// scrolls: forui sizes a day by its height, so the spacing inside a day is what makes seven fit.
class _WeekLine extends ConsumerWidget {
  const _WeekLine({super.key, required this.selected, required this.events});

  final DateTime selected;
  final List<PlanningEvent> events;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final calendar = ref.read(calendarProvider.notifier);
    final style = context.theme.lineCalendarStyle;
    final scale = MediaQuery.textScalerOf(context);
    final textHeight =
        scale.scale(style.dateTextStyle.resolve(const {}).fontSize ?? 0) +
        scale.scale(style.weekdayTextStyle.resolve(const {}).fontSize ?? 0) +
        style.contentSpacing;

    return LayoutBuilder(
      builder: (context, constraints) => FLineCalendar(
        style: .delta(
          contentEdgeSpacing: ((constraints.maxWidth / DateTime.daysPerWeek - textHeight) / 2).clamp(
            2,
            style.contentEdgeSpacing,
          ),
        ),
        physics: const NeverScrollableScrollPhysics(),
        control: .lifted(
          date: toCalendarDate(selected),
          onChange: (date) {
            if (date != null) calendar.select(fromCalendarDate(date));
          },
        ),
        scrollControl: .managed(
          initialDate: toCalendarDate(weekOf(selected)),
          initialAlignment: AlignmentDirectional.centerStart,
          today: toCalendarDate(ref.watch(todayProvider)),
        ),
        builder: (context, data, child) => _marked(
          child!,
          busy: eventsOn(events, fromCalendarDate(data.date)).isNotEmpty,
          // Light on the chosen day, which is drawn in the primary colour.
          color: data.variants.contains(FLineCalendarItemVariant.selected)
              ? context.theme.colors.primaryForeground
              : context.theme.colors.primary,
        ),
      ),
    );
  }
}

/// The events of the day chosen, in a tile group.
class _DayEvents extends StatelessWidget {
  const _DayEvents({required this.events});

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

    return FTileGroup(
      children: [for (final event in events) eventTile(context, event, subtitle: calendarSubtitle(t, event))],
    );
  }
}
