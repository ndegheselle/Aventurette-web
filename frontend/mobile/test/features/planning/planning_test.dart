import 'package:ajil/core/data/mapper.dart';
import 'package:ajil/features/planning/api/event_mapper.dart';
import 'package:ajil/features/planning/models/period.dart';
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

    final groups = await container.read(planningEventsProvider.future);

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
}
