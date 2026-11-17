import 'package:ajil/features/activities/models/activity.dart';
import 'package:ajil/features/planning/api/scheduled_activities_api.dart';
import 'package:ajil/features/planning/models/day_plan.dart';
import 'package:ajil/features/planning/models/scheduled_activity.dart';
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
  /// in it, or replaces the activity being replaced with it: see [pickActionOf].
  PickAction pick(ActivityData activity) {
    final plan = state ?? const DayPlan();
    final action = pickActionOf(plan, activity.id);
    final minutes = lengthOf(timingOf(activity).play);

    if (action == PickAction.remove) {
      state = plan.copyWith(
        activities: [
          for (final planned in plan.activities)
            if (planned.activityId != activity.id) planned,
        ],
      );
      return action;
    }

    final replaced = plan.replaced;
    if (replaced != null) {
      final replacement = replaced.copyWith(
        activityId: activity.id,
        name: activity.name,
        minutes: minutes,
        start: clampStart(replaced.start, minutes),
      );
      state = _with(plan, replaced.key, (_) => replacement).replacingNone();
      return action;
    }

    final added = PlannedActivity(
      key: _nextKey++,
      activityId: activity.id,
      name: activity.name,
      minutes: minutes,
      start: plan.scheduled ? nextStart(plan.activities, minutes) : 0,
    );
    state = plan.copyWith(activities: [...plan.activities, added]);
    return action;
  }

  /// Saves the plan's activities on [day], then leaves planning mode and shows that day on the
  /// planning. When saving fails, the plan stays as it was.
  Future<void> save(DateTime day) async {
    final plan = state;
    if (plan == null || plan.activities.isEmpty) return;

    final user = ref.read(currentUserIdProvider);
    await ref.read(scheduledActivitiesApiProvider).createAll(scheduledOn(day, plan.activities, user));

    state = null;
    ref.read(planningProvider.notifier).select(day);
    ref.invalidate(planningGroupsProvider);
  }

  /// Gives the plan its start time: its activities follow each other from [from], in the order
  /// they were picked.
  void schedule(int from) {
    final plan = state;
    if (plan == null) return;
    state = plan.copyWith(activities: chained(plan.activities, from), scheduled: true);
  }

  /// Moves the activity [key] to [start], kept inside the day.
  void moveTo(int key, int start) {
    final plan = state;
    if (plan == null) return;
    state = _with(plan, key, (activity) => activity.copyWith(start: clampStart(start, activity.minutes)));
  }

  void remove(int key) {
    final plan = state;
    if (plan == null) return;
    state = plan.copyWith(
      activities: [
        for (final activity in plan.activities)
          if (activity.key != key) activity,
      ],
    );
  }

  /// The next activity picked replaces [key] rather than being added.
  void replace(int key) {
    final plan = state;
    if (plan == null) return;
    state = DayPlan(activities: plan.activities, scheduled: plan.scheduled, replacing: key);
  }

  void stopReplacing() => state = state?.replacingNone();

  DayPlan _with(DayPlan plan, int key, PlannedActivity Function(PlannedActivity) change) => plan.copyWith(
    activities: [for (final activity in plan.activities) activity.key == key ? change(activity) : activity],
  );
}

final dayPlanProvider = NotifierProvider<DayPlanNotifier, DayPlan?>(DayPlanNotifier.new);
