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

/// The *Calendrier* (B01): a group, a line of days or the whole month to choose a day on, and the
/// events of that day, each with its status. The month calendar's header pages through months
/// and years.
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
        Row(
          children: [
            // On one line, shrunk rather than wrapped beside the button.
            Expanded(
              child: FittedBox(
                fit: BoxFit.scaleDown,
                alignment: Alignment.centerLeft,
                child: Text(dayTitle(t, view.selected), style: context.titleText, maxLines: 1),
              ),
            ),
            FButton(
              variant: .ghost,
              size: .sm,
              mainAxisSize: MainAxisSize.min,
              prefix: Icon(view.expanded ? FLucideIcons.calendarRange : FLucideIcons.calendarDays),
              onPress: ref.read(calendarProvider.notifier).toggleExpanded,
              child: Text(view.expanded ? t.events.calendar.hideMonth : t.events.calendar.showMonth),
            ),
          ],
        ),
        const SizedBox(height: AppSpaces.spacing),
        if (view.expanded)
          _MonthCalendar(selected: view.selected, events: shown)
        else
          _LineCalendar(selected: view.selected, events: shown),
        const SizedBox(height: AppSpaces.spacing),
        AsyncView(
          value: events,
          onRetry: () => ref.invalidate(calendarEventsProvider),
          data: (_) => _DayEvents(day: view.selected, events: eventsOn(shown, view.selected)),
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

/// The days on one line that scrolls, centred on the day chosen.
class _LineCalendar extends ConsumerWidget {
  const _LineCalendar({required this.selected, required this.events});

  final DateTime selected;
  final List<PlanningEvent> events;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final calendar = ref.read(calendarProvider.notifier);

    return FLineCalendar(
      control: .lifted(
        date: toCalendarDate(selected),
        onChange: (date) {
          if (date != null) calendar.select(fromCalendarDate(date));
        },
      ),
      scrollControl: .managed(
        initialDate: toCalendarDate(selected),
        today: toCalendarDate(ref.watch(todayProvider)),
        initialAlignment: AlignmentDirectional.center,
      ),
      builder: (context, data, child) => _marked(
        child!,
        busy: eventsOn(events, fromCalendarDate(data.date)).isNotEmpty,
        color: context.theme.colors.primary,
      ),
    );
  }
}

/// The whole month, with the day chosen; its header pages through months and opens a month or a
/// year picker. Paging reads the events of the month shown, to mark its days.
class _MonthCalendar extends ConsumerStatefulWidget {
  const _MonthCalendar({required this.selected, required this.events});

  final DateTime selected;
  final List<PlanningEvent> events;

  @override
  ConsumerState<_MonthCalendar> createState() => _MonthCalendarState();
}

class _MonthCalendarState extends ConsumerState<_MonthCalendar> {
  late final FGridCalendarController _controller;

  @override
  void initState() {
    super.initState();
    _controller = FGridCalendarController(
      initial: toCalendarDate(widget.selected),
      today: toCalendarDate(ref.read(todayProvider)),
    );
    _controller.addListener(_paged);
  }

  void _paged() => ref.read(calendarProvider.notifier).browse(fromCalendarDate(_controller.currentMonth));

  @override
  void dispose() {
    _controller
      ..removeListener(_paged)
      ..dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final calendar = ref.read(calendarProvider.notifier);

    return FCalendar.grid(
      control: FGridCalendarControl(controller: _controller),
      selectionControl: .liftedSingle(
        value: toCalendarDate(widget.selected),
        toggleable: false,
        onChange: (date) {
          if (date != null) calendar.select(fromCalendarDate(date));
        },
      ),
      dayBuilder: (context, styles, localizations, date, variants) => _marked(
        FCalendar.defaultDayBuilder(context, styles, localizations, date, variants),
        busy: eventsOn(widget.events, fromCalendarDate(date)).isNotEmpty,
        color: context.theme.colors.primary,
      ),
    );
  }
}

/// The events of the day chosen, in a tile group.
class _DayEvents extends StatelessWidget {
  const _DayEvents({required this.day, required this.events});

  final DateTime day;
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
