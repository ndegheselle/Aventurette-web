import 'package:ajil/features/planning/events/api/events_api.dart';
import 'package:ajil/features/planning/events/models/calendar.dart';
import 'package:ajil/features/planning/events/models/event.dart';
import 'package:ajil/features/user/state/session.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

/// Today, at midnight. A provider so a spec can say which day it is.
final todayProvider = Provider<DateTime>((ref) => dayOf(DateTime.now()));

/// What the *Calendrier* (B01) shows: the day chosen, the month being browsed, whether the whole
/// month is drawn or a line of days, and the group, null for all.
class CalendarView {
  const CalendarView({required this.selected, required this.month, this.expanded = false, this.group});

  /// A local midnight.
  final DateTime selected;

  /// The first day of the month the calendar is on: the selected day's, until the user pages.
  final DateTime month;
  final bool expanded;
  final String? group;

  CalendarView copyWith({DateTime? selected, DateTime? month, bool? expanded, String? Function()? group}) =>
      CalendarView(
        selected: selected ?? this.selected,
        month: month ?? this.month,
        expanded: expanded ?? this.expanded,
        group: group == null ? this.group : group(),
      );
}

/// The calendar opens on today, as a line of days, for every group.
class CalendarNotifier extends Notifier<CalendarView> {
  @override
  CalendarView build() {
    final today = ref.read(todayProvider);
    return CalendarView(selected: today, month: monthOf(today));
  }

  void select(DateTime day) => state = state.copyWith(selected: dayOf(day), month: monthOf(day));

  /// The month calendar paged to another month, without choosing a day.
  void browse(DateTime month) => state = state.copyWith(month: monthOf(month));

  /// Back to the line of days, the browsed month is the chosen day's again.
  void toggleExpanded() => state = state.copyWith(expanded: !state.expanded, month: monthOf(state.selected));

  void selectGroup(String? group) => state = state.copyWith(group: () => group);
}

final calendarProvider = NotifierProvider<CalendarNotifier, CalendarView>(CalendarNotifier.new);

/// The user's events around the month browsed, for every group: choosing a day in it, or a
/// group, reads nothing again.
final calendarEventsProvider = FutureProvider.autoDispose<List<PlanningEvent>>((ref) async {
  final window = calendarWindow(ref.watch(calendarProvider.select((view) => view.month)));
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
