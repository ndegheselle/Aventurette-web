import 'package:ajil/features/activities/models/activity.dart';
import 'package:ajil/features/planning/api/scheduled_blocks_api.dart';
import 'package:ajil/features/planning/models/day_plan.dart';
import 'package:ajil/features/planning/models/scheduled_block.dart';
import 'package:ajil/features/planning/state/planning.dart';
import 'package:ajil/features/user/state/session.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

/// Planning mode: the plan in progress, or null outside it. Kept in memory only.
class DayPlanNotifier extends Notifier<DayPlan?> {
  var _nextKey = 0;

  @override
  DayPlan? build() => null;

  /// Enters planning mode, keeping a plan already in progress.
  void start() => state ??= const DayPlan();

  /// Leaves planning mode, dropping the plan.
  void cancel() => state = null;

  /// Adds [activity] to the plan — entering planning mode if needed —, takes it out when it is
  /// in it, or replaces the activity being replaced with it: see [pickActionOf]. The block takes
  /// the activity's name and play time as they are now.
  PickAction pick(ActivityData activity) {
    final plan = state ?? const DayPlan();
    final action = pickActionOf(plan, activity.id);
    final minutes = lengthOf(timingOf(activity).play);

    if (action == PickAction.remove) {
      state = plan.copyWith(
        blocks: [
          for (final block in plan.blocks)
            if (block.activityId != activity.id) block,
        ],
      );
      return action;
    }

    final replaced = plan.replaced;
    if (replaced != null) {
      final replacement = replaced.copyWith(
        activityId: activity.id,
        label: activity.name,
        minutes: minutes,
        start: clampStart(replaced.start, minutes),
      );
      state = _with(plan, replaced.key, (_) => replacement).replacingNone();
      return action;
    }

    final added = PlannedBlock(
      key: _nextKey++,
      activityId: activity.id,
      label: activity.name,
      minutes: minutes,
      start: plan.scheduled ? nextStart(plan.blocks, minutes) : 0,
    );
    state = plan.copyWith(blocks: [...plan.blocks, added]);
    return action;
  }

  /// Adds a block the user named, at [start] for [minutes]. It has a time, so the plan has one
  /// from then on: blocks added before any start time follow each other from the usual one.
  void addBlock({required String label, required int start, required int minutes}) {
    final plan = state ?? const DayPlan();
    final length = blockLengthOf(minutes);
    final added = PlannedBlock(key: _nextKey++, label: label.trim(), minutes: length, start: clampStart(start, length));
    final placed = plan.scheduled ? plan.blocks : chained(plan.blocks, defaultStartMinutes);
    state = plan.copyWith(blocks: [...placed, added], scheduled: true);
  }

  /// Saves the plan's blocks on [day], then leaves planning mode and shows that day on the
  /// planning. When saving fails, the plan stays as it was.
  Future<void> save(DateTime day) async {
    final plan = state;
    if (plan == null || plan.blocks.isEmpty) return;

    final user = ref.read(currentUserIdProvider);
    await ref.read(scheduledBlocksApiProvider).createAll(scheduledOn(day, plan.blocks, user));

    state = null;
    ref.read(planningProvider.notifier).select(day);
    ref.invalidate(planningGroupsProvider);
  }

  /// Gives the plan its start time: its blocks follow each other from [from], in the order they
  /// were added.
  void schedule(int from) {
    final plan = state;
    if (plan == null) return;
    state = plan.copyWith(blocks: chained(plan.blocks, from), scheduled: true);
  }

  /// Moves the block [key] to [start], kept inside the day.
  void moveTo(int key, int start) {
    final plan = state;
    if (plan == null) return;
    state = _with(plan, key, (block) => block.copyWith(start: clampStart(start, block.minutes)));
  }

  /// Makes the block [key] last [minutes]; it keeps its start unless it would run past midnight.
  void resize(int key, int minutes) {
    final plan = state;
    if (plan == null) return;
    final length = blockLengthOf(minutes);
    state = _with(plan, key, (block) => block.copyWith(minutes: length, start: clampStart(block.start, length)));
  }

  void remove(int key) {
    final plan = state;
    if (plan == null) return;
    state = plan.copyWith(
      blocks: [
        for (final block in plan.blocks)
          if (block.key != key) block,
      ],
    );
  }

  /// The next activity picked replaces [key] rather than being added.
  void replace(int key) {
    final plan = state;
    if (plan == null) return;
    state = DayPlan(blocks: plan.blocks, scheduled: plan.scheduled, replacing: key);
  }

  void stopReplacing() => state = state?.replacingNone();

  DayPlan _with(DayPlan plan, int key, PlannedBlock Function(PlannedBlock) change) =>
      plan.copyWith(blocks: [for (final block in plan.blocks) block.key == key ? change(block) : block]);
}

final dayPlanProvider = NotifierProvider<DayPlanNotifier, DayPlan?>(DayPlanNotifier.new);
