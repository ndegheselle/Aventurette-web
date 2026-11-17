import 'package:ajil/features/activities/models/activity.dart';
import 'package:ajil/features/activities/models/step.dart';
import 'package:ajil/features/planning/models/day_plan.dart';
import 'package:ajil/features/planning/state/day_plan.dart';
import 'package:flutter_test/flutter_test.dart';

import '../../support/container.dart';

PlannedActivity planned(int key, {int minutes = 60, int start = 0}) =>
    PlannedActivity(key: key, activityId: 'a$key', name: 'a$key', minutes: minutes, start: start);

ActivityData activity(String id, {int minutes = 0}) => ActivityData(
  id: id,
  name: id,
  steps: [if (minutes > 0) ActivityStep(id: 's', kind: StepKind.custom, duration: minutes)],
);

List<int> startsOf(List<PlannedActivity> activities) => [for (final activity in activities) activity.start];

void main() {
  test('an activity with no length takes the default one', () {
    expect(lengthOf(0), defaultActivityMinutes);
    expect(lengthOf(45), 45);
  });

  test('activities follow each other from the start, and stop at the end of the day', () {
    final day = chained([planned(1, minutes: 90), planned(2, minutes: 30), planned(3, minutes: 600)], 20 * 60);

    expect(startsOf(day), [20 * 60, 21 * 60 + 30, minutesPerDay - 600]);
  });

  test('one added to a scheduled day goes after the one ending last, not the last picked', () {
    final late = planned(1, minutes: 60, start: 14 * 60);
    final early = planned(2, minutes: 30, start: 9 * 60);

    expect(nextStart([late, early], 30), 15 * 60);
    expect(nextStart([], 30), defaultStartMinutes);
  });

  group('the timeline', () {
    test('lays activities apart full width when they do not overlap', () {
      final slots = timelineOf([planned(1, start: 600), planned(2, start: 540)]);

      expect([for (final slot in slots) slot.activity.key], [2, 1], reason: 'by start');
      expect([for (final slot in slots) slot.lanes], [1, 1]);
    });

    test('puts overlapping ones side by side, each in the first free column', () {
      final slots = timelineOf([planned(1, start: 540, minutes: 120), planned(2, start: 560), planned(3, start: 620)]);

      expect([for (final slot in slots) slot.lane], [0, 1, 1]);
      expect([for (final slot in slots) slot.lanes], [2, 2, 2]);
    });

    test('judges a short activity by the length it is drawn at', () {
      final slots = timelineOf([planned(1, start: 540, minutes: 5), planned(2, start: 550)]);

      expect([for (final slot in slots) slot.lanes], [2, 2]);
    });
  });

  group('planning mode', () {
    test('activities picked before the start time follow it, in the order picked', () async {
      final container = await signedInContainer();
      final plan = container.read(dayPlanProvider.notifier)
        ..pick(activity('long', minutes: 90))
        ..pick(activity('none'));

      plan.schedule(10 * 60);

      expect(startsOf(container.read(dayPlanProvider)!.activities), [600, 690]);
    });

    test('an activity already planned is taken out, every time it is in the plan', () async {
      final container = await signedInContainer();
      final plan = container.read(dayPlanProvider.notifier)
        ..pick(activity('first'))
        ..pick(activity('second'));
      expect(pickActionOf(container.read(dayPlanProvider), 'first'), PickAction.remove);

      final action = plan.pick(activity('first'));

      expect(action, PickAction.remove);
      expect([for (final planned in container.read(dayPlanProvider)!.activities) planned.name], ['second']);
    });

    test('while replacing, an activity already planned replaces rather than leaves', () async {
      final container = await signedInContainer();
      final plan = container.read(dayPlanProvider.notifier)..pick(activity('first'));
      plan.replace(container.read(dayPlanProvider)!.activities.single.key);

      expect(pickActionOf(container.read(dayPlanProvider), 'first'), PickAction.replace);
    });

    test('a replacement takes the place and time of the one it replaces', () async {
      final container = await signedInContainer();
      final plan = container.read(dayPlanProvider.notifier)
        ..pick(activity('first', minutes: 60))
        ..pick(activity('second', minutes: 60))
        ..schedule(9 * 60);
      final second = container.read(dayPlanProvider)!.activities.last;

      plan.replace(second.key);
      final outcome = plan.pick(activity('third', minutes: 45));

      final activities = container.read(dayPlanProvider)!.activities;
      expect(outcome, PickAction.replace);
      expect([for (final activity in activities) activity.name], ['first', 'third']);
      expect(activities.last.start, 10 * 60);
      expect(container.read(dayPlanProvider)!.replacing, isNull);
    });
  });
}
