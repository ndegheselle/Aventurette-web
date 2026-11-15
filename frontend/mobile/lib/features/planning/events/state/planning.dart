import 'package:ajil/features/planning/events/api/events_api.dart';
import 'package:ajil/features/planning/events/models/calendar.dart';
import 'package:ajil/features/planning/events/models/event.dart';
import 'package:ajil/features/user/state/session.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

/// Today, at midnight. A provider so a spec can say which day it is.
final todayProvider = Provider<DateTime>((ref) => dayOf(DateTime.now()));

/// What the *Calendrier* (B01) shows: a period, and the group it is narrowed to, null for all.
class CalendarView {
  const CalendarView({required this.period, this.group});

  final CalendarPeriod period;
  final String? group;
}

/// The calendar opens on this week, for every group. Changing the scale keeps today when it is
/// in view, and the period's first day otherwise.
class CalendarNotifier extends Notifier<CalendarView> {
  @override
  CalendarView build() => CalendarView(period: CalendarPeriod.of(CalendarScale.week, ref.read(todayProvider)));

  DateTime get _focus {
    final today = ref.read(todayProvider);
    return state.period.contains(today) ? today : state.period.start;
  }

  void zoom(CalendarScale scale) => _show(CalendarPeriod.of(scale, _focus));

  void previous() => _show(state.period.shift(-1));

  void next() => _show(state.period.shift(1));

  void today() => _show(CalendarPeriod.of(state.period.scale, ref.read(todayProvider)));

  /// A day of the week or of the month, tapped: that day alone.
  void openDay(DateTime day) => _show(CalendarPeriod.of(CalendarScale.day, day));

  /// A month of the year, tapped.
  void openMonth(DateTime month) => _show(CalendarPeriod.of(CalendarScale.month, month));

  void selectGroup(String? group) => state = CalendarView(period: state.period, group: group);

  void _show(CalendarPeriod period) => state = CalendarView(period: period, group: state.group);
}

final calendarProvider = NotifierProvider<CalendarNotifier, CalendarView>(CalendarNotifier.new);

/// The user's events in the period shown, for every group: narrowing to a group reads nothing
/// again.
final calendarEventsProvider = FutureProvider.autoDispose<List<PlanningEvent>>((ref) async {
  final period = ref.watch(calendarProvider.select((view) => view.period));
  final events = await ref.read(eventsApiProvider).between(ref.watch(currentUserIdProvider), period.start, period.end);
  return [
    for (final event in events)
      if (overlaps(event, period.start, period.end)) event,
  ];
});

/// The groups the user's events are for: the calendar's group choices.
final eventGroupsProvider = FutureProvider.autoDispose<List<String>>(
  (ref) async => groupsOf(await ref.read(eventsApiProvider).mine(ref.watch(currentUserIdProvider), '')),
);

/// Which of the *Événements* (B02) lists is shown.
enum EventsSegment { mine, shared }

/// The *Événements* list's search and segment.
class EventsQuery {
  const EventsQuery({this.segment = EventsSegment.mine, this.search = ''});

  final EventsSegment segment;
  final String search;
}

class EventsQueryNotifier extends Notifier<EventsQuery> {
  @override
  EventsQuery build() => const EventsQuery();

  void search(String search) => state = EventsQuery(segment: state.segment, search: search);

  void show(EventsSegment segment) => state = EventsQuery(segment: segment, search: state.search);
}

final eventsQueryProvider = NotifierProvider<EventsQueryNotifier, EventsQuery>(EventsQueryNotifier.new);

/// The events the *Événements* list shows, for its segment and search.
final eventsListProvider = FutureProvider.autoDispose<List<PlanningEvent>>((ref) {
  final query = ref.watch(eventsQueryProvider);
  final api = ref.read(eventsApiProvider);
  return switch (query.segment) {
    EventsSegment.mine => api.mine(ref.watch(currentUserIdProvider), query.search),
    EventsSegment.shared => api.shared(query.search),
  };
});
