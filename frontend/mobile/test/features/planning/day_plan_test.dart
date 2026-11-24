import 'package:ajil/features/activities/models/activity.dart';
import 'package:ajil/features/activities/models/step.dart';
import 'package:ajil/features/planning/models/day_plan.dart';
import 'package:ajil/features/planning/state/day_plan.dart';
import 'package:flutter_test/flutter_test.dart';

import '../../support/container.dart';

PlannedBlock planned(int key, {int minutes = 60, int start = 0}) =>
    PlannedBlock(key: key, activityId: 'a$key', label: 'a$key', minutes: minutes, start: start);

ActivityData activity(String id, {int minutes = 0}) => ActivityData(
  id: id,
  name: id,
  steps: [if (minutes > 0) ActivityStep(id: 's', kind: StepKind.custom, duration: minutes)],
);

List<int> startsOf(List<PlannedBlock> blocks) => [for (final block in blocks) block.start];

void main() {
  test('an activity with no length takes the default one', () {
    expect(lengthOf(0), defaultActivityMinutes);
    expect(lengthOf(45), 45);
  });

  test('a length the user sets lands on five minutes, at least five, a day at most', () {
    expect(blockLengthOf(43), 45);
    expect(blockLengthOf(0), blockStepMinutes);
    expect(blockLengthOf(minutesPerDay + 60), minutesPerDay);
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

      expect([for (final slot in slots) slot.block.key], [2, 1], reason: 'by start');
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

    test('counts the activities wholly out of view, a short one by the length it is drawn at', () {
      final morning = planned(1, start: 480, minutes: 5);
      final cut = planned(2, start: 520, minutes: 60);
      final evening = planned(3, start: 1200);

      final outside = outOfView([morning, cut, evening], 540, 720);

      expect(outside, (above: 1, below: 1), reason: 'the one starting before the view still shows its end');
      expect(outOfView([morning], 505, 720), (above: 0, below: 0), reason: 'drawn half an hour tall, until 8h30');
    });
  });

  group('planning mode', () {
    test('activities picked before the start time follow it, in the order picked', () async {
      final container = await signedInContainer();
      final plan = container.read(dayPlanProvider.notifier)
        ..pick(activity('long', minutes: 90))
        ..pick(activity('none'));

      plan.schedule(10 * 60);

      expect(startsOf(container.read(dayPlanProvider)!.blocks), [600, 690]);
    });

    test('an activity already planned is taken out, every time it is in the plan', () async {
      final container = await signedInContainer();
      final plan = container.read(dayPlanProvider.notifier)
        ..pick(activity('first'))
        ..pick(activity('second'));
      expect(pickActionOf(container.read(dayPlanProvider), 'first'), PickAction.remove);

      final action = plan.pick(activity('first'));

      expect(action, PickAction.remove);
      expect([for (final planned in container.read(dayPlanProvider)!.blocks) planned.label], ['second']);
    });

    test('while replacing, an activity already planned replaces rather than leaves', () async {
      final container = await signedInContainer();
      final plan = container.read(dayPlanProvider.notifier)..pick(activity('first'));
      plan.replace(container.read(dayPlanProvider)!.blocks.single.key);

      expect(pickActionOf(container.read(dayPlanProvider), 'first'), PickAction.replace);
    });

    test('a replacement takes the place and time of the one it replaces', () async {
      final container = await signedInContainer();
      final plan = container.read(dayPlanProvider.notifier)
        ..pick(activity('first', minutes: 60))
        ..pick(activity('second', minutes: 60))
        ..schedule(9 * 60);
      final second = container.read(dayPlanProvider)!.blocks.last;

      plan.replace(second.key);
      final outcome = plan.pick(activity('third', minutes: 45));

      final blocks = container.read(dayPlanProvider)!.blocks;
      expect(outcome, PickAction.replace);
      expect([for (final block in blocks) block.label], ['first', 'third']);
      expect(blocks.last.start, 10 * 60);
      expect(blocks.last.minutes, 45, reason: 'the replacement lasts its own play time');
      expect(container.read(dayPlanProvider)!.replacing, isNull);
    });

    test('a named block is never taken for an activity, whatever its label', () async {
      final container = await signedInContainer();
      final plan = container.read(dayPlanProvider.notifier)..addBlock(label: 'first', start: 9 * 60, minutes: 30);

      expect(pickActionOf(container.read(dayPlanProvider), 'first'), PickAction.add);
      plan.pick(activity('first'));

      expect([for (final block in container.read(dayPlanProvider)!.blocks) block.activityId], [null, 'first']);
    });

    test('a named block gives the plan its times, those picked before following the usual start', () async {
      final container = await signedInContainer();
      final plan = container.read(dayPlanProvider.notifier)..pick(activity('game', minutes: 60));

      plan.addBlock(label: ' Repas ', start: 12 * 60, minutes: 90);

      final day = container.read(dayPlanProvider)!;
      expect(day.scheduled, isTrue);
      expect(startsOf(day.blocks), [defaultStartMinutes, 12 * 60]);
      expect(day.blocks.last.label, 'Repas');
      expect(day.blocks.last.minutes, 90);
    });

    test('a longer block keeps its start, unless it would run past midnight', () async {
      final container = await signedInContainer();
      final plan = container.read(dayPlanProvider.notifier)
        ..addBlock(label: 'Veillée', start: 22 * 60, minutes: 60)
        ..addBlock(label: 'Goûter', start: 16 * 60, minutes: 20);
      final [evening, snack] = container.read(dayPlanProvider)!.blocks;

      plan
        ..resize(evening.key, 180)
        ..resize(snack.key, 30);

      final [longer, shorter] = container.read(dayPlanProvider)!.blocks;
      expect((longer.start, longer.minutes), (minutesPerDay - 180, 180));
      expect((shorter.start, shorter.minutes), (16 * 60, 30));
    });
  });
}
