/// A day being planned: blocks on the timeline of a single day, each an activity picked from the
/// catalogue or a time the user names — a meal, a transition.
library;

import 'dart:math';

/// The length given to an activity whose steps say none, so it still takes room on the day. Also
/// the length offered for a block the user adds.
const defaultActivityMinutes = 30;

/// Where a plan starts when the user does not say: 9h.
const defaultStartMinutes = 9 * 60;

const minutesPerDay = 24 * 60;

/// The shortest length a user sets, and the step it moves by.
const blockStepMinutes = 5;

/// A block of the plan, at a time of the day.
class PlannedBlock {
  const PlannedBlock({required this.key, required this.label, required this.minutes, this.activityId, this.start = 0});

  /// Tells apart the same activity planned twice.
  final int key;

  /// The activity it runs; null for a block the user named.
  final String? activityId;

  /// The activity's name when it was picked, or the user's. Set once: renaming the activity
  /// afterwards does not change it.
  final String label;

  /// Its length, never 0: see [lengthOf] and [blockLengthOf].
  final int minutes;

  /// Minutes since midnight. 0 until the plan is scheduled.
  final int start;

  int get end => start + minutes;

  bool get isActivity => activityId != null;

  PlannedBlock copyWith({String? activityId, String? label, int? minutes, int? start}) => PlannedBlock(
    key: key,
    activityId: activityId ?? this.activityId,
    label: label ?? this.label,
    minutes: minutes ?? this.minutes,
    start: start ?? this.start,
  );
}

/// The plan in progress. [scheduled] is false until the user gave its start time: until then its
/// blocks have no time, only an order.
class DayPlan {
  const DayPlan({this.blocks = const [], this.scheduled = false, this.replacing});

  /// In the order they were added.
  final List<PlannedBlock> blocks;
  final bool scheduled;

  /// The key of the activity the catalogue is picking a replacement for; null when adding.
  final int? replacing;

  PlannedBlock? get replaced => blocks.where((block) => block.key == replacing).firstOrNull;

  DayPlan copyWith({List<PlannedBlock>? blocks, bool? scheduled}) =>
      DayPlan(blocks: blocks ?? this.blocks, scheduled: scheduled ?? this.scheduled, replacing: replacing);

  DayPlan replacingNone() => DayPlan(blocks: blocks, scheduled: scheduled);
}

/// What an activity's planning button does.
enum PickAction { add, remove, replace }

/// What the button of [activityId] does on [plan], null outside planning mode: replace the
/// activity being replaced; otherwise take the activity out when it is in the plan, else add it.
/// A block the user named never counts, whatever its label.
PickAction pickActionOf(DayPlan? plan, String activityId) {
  if (plan?.replacing != null) return PickAction.replace;
  final planned = plan?.blocks.any((block) => block.activityId == activityId) ?? false;
  return planned ? PickAction.remove : PickAction.add;
}

/// An activity's length on the plan: its own, or [defaultActivityMinutes] when it has none; a
/// day at most.
int lengthOf(int minutes) => minutes > 0 ? minutes.clamp(1, minutesPerDay) : defaultActivityMinutes;

/// A length the user set: on the nearest [blockStepMinutes], at least one step, a day at most.
int blockLengthOf(int minutes) {
  final snapped = (minutes / blockStepMinutes).round() * blockStepMinutes;
  return snapped.clamp(blockStepMinutes, minutesPerDay);
}

/// [start] moved so a block of [minutes] stays inside the day.
int clampStart(int start, int minutes) => start.clamp(0, minutesPerDay - minutes);

/// [blocks] one after the other, in their order, from [from]. Those that would run past
/// midnight end the day instead.
List<PlannedBlock> chained(List<PlannedBlock> blocks, int from) {
  final placed = <PlannedBlock>[];
  var next = from;
  for (final block in blocks) {
    final start = clampStart(next, block.minutes);
    placed.add(block.copyWith(start: start));
    next = start + block.minutes;
  }
  return placed;
}

/// Where a block added to a scheduled plan goes: after the one ending last.
int nextStart(List<PlannedBlock> blocks, int minutes) {
  if (blocks.isEmpty) return clampStart(defaultStartMinutes, minutes);
  final lastEnd = blocks.map((block) => block.end).reduce(max);
  return clampStart(lastEnd, minutes);
}

/// A block's place on the timeline: side by side with those it overlaps, in [lanes] columns, in
/// column [lane].
class TimelineSlot {
  const TimelineSlot(this.block, {required this.lane, required this.lanes});

  final PlannedBlock block;
  final int lane;
  final int lanes;
}

/// [blocks] laid out on the timeline, by start. Overlapping ones share the width, each in the
/// first column free; a block is drawn at least [minimumMinutes] long, and that is the length its
/// overlaps are judged by.
List<TimelineSlot> timelineOf(List<PlannedBlock> blocks, {int minimumMinutes = defaultActivityMinutes}) {
  final byStart = [...blocks]..sort((a, b) => a.start.compareTo(b.start));
  int drawnEnd(PlannedBlock block) => block.start + max(block.minutes, minimumMinutes);

  final slots = <TimelineSlot>[];
  var cluster = <(PlannedBlock, int)>[];
  var laneEnds = <int>[];
  var clusterEnd = 0;

  void closeCluster() {
    slots.addAll([for (final (block, lane) in cluster) TimelineSlot(block, lane: lane, lanes: laneEnds.length)]);
    cluster = [];
    laneEnds = [];
  }

  for (final block in byStart) {
    if (cluster.isNotEmpty && block.start >= clusterEnd) closeCluster();

    var lane = laneEnds.indexWhere((end) => end <= block.start);
    if (lane == -1) {
      lane = laneEnds.length;
      laneEnds.add(0);
    }
    laneEnds[lane] = drawnEnd(block);
    cluster.add((block, lane));
    clusterEnd = cluster.length == 1 ? drawnEnd(block) : max(clusterEnd, drawnEnd(block));
  }
  if (cluster.isNotEmpty) closeCluster();
  return slots;
}

/// How many of [blocks] are wholly out of the minutes [from] to [until] in view: above them, and
/// below them. Each is as tall as it is drawn, at least [minimumMinutes].
({int above, int below}) outOfView(
  List<PlannedBlock> blocks,
  double from,
  double until, {
  int minimumMinutes = defaultActivityMinutes,
}) {
  final above = blocks.where((block) => block.start + max(block.minutes, minimumMinutes) <= from);
  final below = blocks.where((block) => block.start >= until);
  return (above: above.length, below: below.length);
}
