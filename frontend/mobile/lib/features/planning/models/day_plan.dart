/// A day being planned: activities picked from the catalogue, each at a time of a single day.
library;

import 'dart:math';

/// The length given to an activity whose steps say none, so it still takes room on the day.
const defaultActivityMinutes = 30;

/// Where a plan starts when the user does not say: 9h.
const defaultStartMinutes = 9 * 60;

const minutesPerDay = 24 * 60;

/// An activity of the plan, at a time of the day.
class PlannedActivity {
  const PlannedActivity({
    required this.key,
    required this.activityId,
    required this.name,
    required this.minutes,
    this.start = 0,
  });

  /// Tells apart the same activity planned twice.
  final int key;
  final String activityId;
  final String name;

  /// Its length, never 0: see [lengthOf].
  final int minutes;

  /// Minutes since midnight. 0 until the plan is scheduled.
  final int start;

  int get end => start + minutes;

  PlannedActivity copyWith({String? activityId, String? name, int? minutes, int? start}) => PlannedActivity(
    key: key,
    activityId: activityId ?? this.activityId,
    name: name ?? this.name,
    minutes: minutes ?? this.minutes,
    start: start ?? this.start,
  );
}

/// The plan in progress. [scheduled] is false until the user gave its start time: until then its
/// activities have no time, only an order.
class DayPlan {
  const DayPlan({this.activities = const [], this.scheduled = false, this.replacing});

  /// In the order they were picked.
  final List<PlannedActivity> activities;
  final bool scheduled;

  /// The key of the activity the catalogue is picking a replacement for; null when adding.
  final int? replacing;

  PlannedActivity? get replaced => activities.where((activity) => activity.key == replacing).firstOrNull;

  DayPlan copyWith({List<PlannedActivity>? activities, bool? scheduled}) =>
      DayPlan(activities: activities ?? this.activities, scheduled: scheduled ?? this.scheduled, replacing: replacing);

  DayPlan replacingNone() => DayPlan(activities: activities, scheduled: scheduled);
}

/// What an activity's planning button does.
enum PickAction { add, remove, replace }

/// What the button of [activityId] does on [plan], null outside planning mode: replace the
/// activity being replaced; otherwise take the activity out when it is in the plan, else add it.
PickAction pickActionOf(DayPlan? plan, String activityId) {
  if (plan?.replacing != null) return PickAction.replace;
  final planned = plan?.activities.any((activity) => activity.activityId == activityId) ?? false;
  return planned ? PickAction.remove : PickAction.add;
}

/// An activity's length on the plan: its own, or [defaultActivityMinutes] when it has none; a
/// day at most.
int lengthOf(int minutes) => minutes > 0 ? minutes.clamp(1, minutesPerDay) : defaultActivityMinutes;

/// [start] moved so an activity of [minutes] stays inside the day.
int clampStart(int start, int minutes) => start.clamp(0, minutesPerDay - minutes);

/// [activities] one after the other, in their order, from [from]. Those that would run past
/// midnight end the day instead.
List<PlannedActivity> chained(List<PlannedActivity> activities, int from) {
  final placed = <PlannedActivity>[];
  var next = from;
  for (final activity in activities) {
    final start = clampStart(next, activity.minutes);
    placed.add(activity.copyWith(start: start));
    next = start + activity.minutes;
  }
  return placed;
}

/// Where an activity added to a scheduled plan goes: after the one ending last.
int nextStart(List<PlannedActivity> activities, int minutes) {
  if (activities.isEmpty) return clampStart(defaultStartMinutes, minutes);
  final lastEnd = activities.map((activity) => activity.end).reduce(max);
  return clampStart(lastEnd, minutes);
}

/// An activity's place on the timeline: side by side with those it overlaps, in [lanes]
/// columns, in column [lane].
class TimelineSlot {
  const TimelineSlot(this.activity, {required this.lane, required this.lanes});

  final PlannedActivity activity;
  final int lane;
  final int lanes;
}

/// [activities] laid out on the timeline, by start. Overlapping ones share the width, each in
/// the first column free; an activity is drawn at least [minimumMinutes] long, and that is the
/// length its overlaps are judged by.
List<TimelineSlot> timelineOf(List<PlannedActivity> activities, {int minimumMinutes = defaultActivityMinutes}) {
  final byStart = [...activities]..sort((a, b) => a.start.compareTo(b.start));
  int drawnEnd(PlannedActivity activity) => activity.start + max(activity.minutes, minimumMinutes);

  final slots = <TimelineSlot>[];
  var cluster = <(PlannedActivity, int)>[];
  var laneEnds = <int>[];
  var clusterEnd = 0;

  void closeCluster() {
    slots.addAll([for (final (activity, lane) in cluster) TimelineSlot(activity, lane: lane, lanes: laneEnds.length)]);
    cluster = [];
    laneEnds = [];
  }

  for (final activity in byStart) {
    if (cluster.isNotEmpty && activity.start >= clusterEnd) closeCluster();

    var lane = laneEnds.indexWhere((end) => end <= activity.start);
    if (lane == -1) {
      lane = laneEnds.length;
      laneEnds.add(0);
    }
    laneEnds[lane] = drawnEnd(activity);
    cluster.add((activity, lane));
    clusterEnd = cluster.length == 1 ? drawnEnd(activity) : max(clusterEnd, drawnEnd(activity));
  }
  if (cluster.isNotEmpty) closeCluster();
  return slots;
}
