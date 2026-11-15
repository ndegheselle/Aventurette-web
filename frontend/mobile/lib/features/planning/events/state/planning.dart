import 'package:ajil/features/planning/events/api/events_api.dart';
import 'package:ajil/features/planning/events/models/calendar.dart';
import 'package:ajil/features/planning/events/models/event.dart';
import 'package:ajil/features/user/state/session.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

/// Today, at midnight. A provider so a spec can say which day it is.
final todayProvider = Provider<DateTime>((ref) => dayOf(DateTime.now()));

/// What the *Calendrier* (B01) shows: the day chosen, whose week is drawn, and the group, null
/// for all.
class CalendarView {
  const CalendarView({required this.selected, this.group});

  /// A local midnight.
  final DateTime selected;
  final String? group;
}

/// The calendar opens on today, for every group.
class CalendarNotifier extends Notifier<CalendarView> {
  @override
  CalendarView build() => CalendarView(selected: ref.read(todayProvider));

  void select(DateTime day) => state = CalendarView(selected: dayOf(day), group: state.group);

  void selectGroup(String? group) => state = CalendarView(selected: state.selected, group: group);
}

final calendarProvider = NotifierProvider<CalendarNotifier, CalendarView>(CalendarNotifier.new);

/// The user's events around the chosen day's month, for every group: another day of it, or a
/// group, reads nothing again.
final calendarEventsProvider = FutureProvider.autoDispose<List<PlanningEvent>>((ref) async {
  final window = calendarWindow(ref.watch(calendarProvider.select((view) => monthOf(view.selected))));
  final events = await ref.read(eventsApiProvider).between(ref.watch(currentUserIdProvider), window.from, window.until);
  return [
    for (final event in events)
      if (overlaps(event, window.from, window.until)) event,
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
