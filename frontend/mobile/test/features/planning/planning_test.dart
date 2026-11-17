import 'package:ajil/core/data/mapper.dart';
import 'package:ajil/features/planning/api/event_mapper.dart';
import 'package:ajil/features/planning/models/period.dart';
import 'package:ajil/core/data/crud.dart';
import 'package:ajil/features/activities/models/activity.dart';
import 'package:ajil/features/planning/state/day_plan.dart';
import 'package:ajil/features/planning/state/planning.dart';
import 'package:flutter_test/flutter_test.dart';

import '../../support/container.dart';
import '../../support/fake_crud.dart';

Payload eventRecord(String id, DateTime start, DateTime end, {String owner = 'u1'}) => {
  'id': id,
  'owner': owner,
  'name': id,
  'start': backendDate(start),
  'end': backendDate(end),
};

void main() {
  test("the planning reads the user's events of the period shown, and no one else's", () async {
    final crud = FakeCrudFactory({
      'events': [
        eventRecord('too early', DateTime(2026, 10, 31, 10), DateTime(2026, 10, 31, 12)),
        eventRecord('spills in', DateTime(2026, 10, 31, 18), DateTime(2026, 11, 1, 12)),
        eventRecord('ends as it starts', DateTime(2026, 10, 31, 10), DateTime(2026, 11)),
        eventRecord('saturday', DateTime(2026, 11, 21, 9, 30), DateTime(2026, 11, 21, 17, 30)),
        eventRecord('too late', DateTime(2026, 12, 1, 10), DateTime(2026, 12, 1, 12)),
        eventRecord('not mine', DateTime(2026, 11, 21, 10), DateTime(2026, 11, 21, 12), owner: 'u2'),
      ],
    });
    final container = await signedInContainer(crud: crud);
    container.read(planningProvider.notifier)
      ..select(DateTime(2026, 11, 18))
      ..show(TimeRange.month);

    final groups = await container.read(planningGroupsProvider.future);

    expect([for (final group in groups) ...group.events.map((event) => event.id)], ['spills in', 'saturday']);
  });

  test('another range keeps the day chosen', () async {
    final container = await signedInContainer();
    final planning = container.read(planningProvider.notifier)..select(DateTime(2026, 11, 18));

    planning.show(TimeRange.year);

    expect(container.read(planningProvider).day, DateTime(2026, 11, 18));
    expect(container.read(planningProvider).period, Period(DateTime(2026), DateTime(2027)));
  });

  test('a date is written in UTC and read back in the device time', () {
    final moment = DateTime(2026, 11, 21, 9, 30);

    expect(backendDate(moment), endsWith('Z'));
    expect(localDate(backendDate(moment)), moment);
  });

  group('saved activities', () {
    test('show at their time, as long as their play steps, or half an hour with none', () async {
      final crud = FakeCrudFactory({
        'user_planned_activities': [
          {
            'id': 's1',
            'user': 'u1',
            'activity': 'a1',
            'start': backendDate(DateTime(2026, 11, 18, 9)),
            'expand': {
              'activity': {
                'id': 'a1',
                'name': 'La quête du remède',
                'expand': {
                  'steps': [
                    {'id': 'p', 'kind': 'PREPARE', 'duration': 20},
                    {'id': 'g', 'kind': 'CUSTOM', 'duration': 45},
                  ],
                },
              },
            },
          },
          {'id': 's2', 'user': 'u1', 'activity': 'a2', 'start': backendDate(DateTime(2026, 11, 19, 14))},
          {'id': 'other', 'user': 'u2', 'activity': 'a1', 'start': backendDate(DateTime(2026, 11, 18, 9))},
        ],
      });
      final container = await signedInContainer(crud: crud);
      container.read(planningProvider.notifier).select(DateTime(2026, 11, 18));

      final groups = await container.read(planningGroupsProvider.future);

      final activities = [for (final group in groups) ...group.activities];
      expect([for (final activity in activities) activity.id], ['s1', 's2']);
      expect(activities.first.name, 'La quête du remède');
      expect(activities.first.minutes, 45, reason: 'the preparation is before the children arrive');
      expect(activities.last.minutes, 30);
    });

    test("saving writes each activity at its time on the day, then leaves planning mode on that day", () async {
      final crud = FakeCrudFactory();
      final container = await signedInContainer(crud: crud);
      final plan = container.read(dayPlanProvider.notifier)
        ..pick(const ActivityData(id: 'a1', name: 'Un'))
        ..pick(const ActivityData(id: 'a2', name: 'Deux'))
        ..schedule(9 * 60);

      await plan.save(DateTime(2026, 12, 5));

      final records = crud.records['user_planned_activities']!;
      expect([for (final record in records) record['activity']], ['a1', 'a2']);
      expect(records.last['start'], backendDate(DateTime(2026, 12, 5, 9, 30)));
      expect(records.first['user'], 'u1');
      expect(container.read(dayPlanProvider), isNull);
      expect(container.read(planningProvider).day, DateTime(2026, 12, 5));
    });

    test('a plan that could not be saved stays', () async {
      final container = await signedInContainer(crud: _FailingCrudFactory());
      final plan = container.read(dayPlanProvider.notifier)
        ..pick(const ActivityData(id: 'a1', name: 'Un'))
        ..schedule(9 * 60);

      await expectLater(plan.save(DateTime(2026, 12, 5)), throwsStateError);

      expect(container.read(dayPlanProvider)!.activities, hasLength(1));
    });
  });
}

/// The backend refusing every creation.
class _FailingCrudFactory extends FakeCrudFactory {
  @override
  DataCrud<T> of<T>(String collection, EntityMapper<T> mapper) =>
      _FailingCrud<T>(mapper, records.putIfAbsent(collection, () => []), writes.putIfAbsent(collection, () => []));
}

class _FailingCrud<T> extends FakeCrud<T> {
  _FailingCrud(super.mapper, super.records, super.writes);

  @override
  Future<T> create(T entity) async => throw StateError('Backend down');
}
