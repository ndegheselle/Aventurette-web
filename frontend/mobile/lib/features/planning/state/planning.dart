import 'package:ajil/features/planning/api/events_api.dart';
import 'package:ajil/features/planning/api/scheduled_blocks_api.dart';
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

/// The user's events and saved blocks of the period shown, grouped. Another day of the same
/// period reads nothing again.
final planningGroupsProvider = FutureProvider.autoDispose<List<PeriodGroup>>((ref) async {
  final (range, period) = ref.watch(planningProvider.select((view) => (view.range, view.period)));
  final user = ref.watch(currentUserIdProvider);
  final (events, blocks) = await (
    ref.read(eventsApiProvider).between(user, period.from, period.until),
    ref.read(scheduledBlocksApiProvider).between(user, period.from, period.until),
  ).wait;
  final inPeriod = events.where((event) => overlaps(event, period.from, period.until)).toList();
  return groupedByPart(inPeriod, blocks, range, period);
});
