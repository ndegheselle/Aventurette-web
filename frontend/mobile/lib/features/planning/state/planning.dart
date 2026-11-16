import 'package:ajil/features/planning/api/events_api.dart';
import 'package:ajil/features/planning/models/event.dart';
import 'package:ajil/features/planning/models/period.dart';
import 'package:ajil/features/user/state/session.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

/// Today, at midnight. A provider so a spec can say which day it is.
final todayProvider = Provider<DateTime>((ref) => dayOf(DateTime.now()));

/// What the planning shows: the day chosen, and the range around it.
class PlanningView {
  const PlanningView({required this.day, required this.range});

  /// A local midnight.
  final DateTime day;
  final TimeRange range;

  Period get period => periodOf(range, day);
}

/// The planning opens on today's week. Another range keeps the day chosen.
class PlanningNotifier extends Notifier<PlanningView> {
  @override
  PlanningView build() => PlanningView(day: ref.read(todayProvider), range: TimeRange.week);

  void select(DateTime day) => state = PlanningView(day: dayOf(day), range: state.range);

  void show(TimeRange range) => state = PlanningView(day: state.day, range: range);
}

final planningProvider = NotifierProvider<PlanningNotifier, PlanningView>(PlanningNotifier.new);

/// The user's events of the period shown, grouped. Another day of the same period reads nothing
/// again.
final planningEventsProvider = FutureProvider.autoDispose<List<EventGroup>>((ref) async {
  final (range, period) = ref.watch(planningProvider.select((view) => (view.range, view.period)));
  final events = await ref
      .read(eventsApiProvider)
      .between(ref.watch(currentUserIdProvider), period.from, period.until);
  final inPeriod = events.where((event) => overlaps(event, period.from, period.until)).toList();
  return groupedEvents(inPeriod, range, period);
});
