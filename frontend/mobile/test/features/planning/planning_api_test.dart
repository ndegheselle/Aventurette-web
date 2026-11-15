import 'package:ajil/core/data/mapper.dart';
import 'package:ajil/features/planning/day_templates/models/day_template.dart';
import 'package:ajil/features/planning/day_templates/state/day_templates.dart';
import 'package:ajil/features/planning/events/api/event_mapper.dart';
import 'package:ajil/features/planning/events/models/calendar.dart';
import 'package:ajil/features/planning/events/state/planning.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
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
  test("the calendar reads the user's events taking part of the period, and no one else's", () async {
    final crud = FakeCrudFactory({
      'events': [
        eventRecord('before', DateTime(2026, 11, 14, 10), DateTime(2026, 11, 14, 12)),
        eventRecord('spills in', DateTime(2026, 11, 15, 18), DateTime(2026, 11, 16, 12)),
        eventRecord('saturday', DateTime(2026, 11, 21, 9, 30), DateTime(2026, 11, 21, 17, 30)),
        eventRecord('ends as it starts', DateTime(2026, 11, 15, 10), DateTime(2026, 11, 16)),
        eventRecord('next week', DateTime(2026, 11, 23, 10), DateTime(2026, 11, 23, 12)),
        eventRecord('not mine', DateTime(2026, 11, 21, 10), DateTime(2026, 11, 21, 12), owner: 'u2'),
      ],
    });
    final container = await signedInContainer(crud: crud);
    container.read(calendarProvider.notifier).openDay(DateTime(2026, 11, 18));
    container.read(calendarProvider.notifier).zoom(CalendarScale.week);

    final events = await container.read(calendarEventsProvider.future);

    expect([for (final event in events) event.id], ['spills in', 'saturday']);
  });

  test('a date is written in UTC and read back in the device time', () {
    final moment = DateTime(2026, 11, 21, 9, 30);

    expect(backendDate(moment), endsWith('Z'));
    expect(localDate(backendDate(moment)), moment);
  });

  group('day templates', () {
    final crud = FakeCrudFactory({
      'day_templates': [
        {'id': 't1', 'owner': '', 'name': 'Sortie scouts', 'startMinutes': 570, 'endMinutes': 1050},
        {'id': 't2', 'owner': 'u1', 'name': 'Mon mercredi', 'startMinutes': 0, 'endMinutes': 0},
        {'id': 't3', 'owner': 'u2', 'name': "Celle d'un autre"},
      ],
    });

    Future<ProviderContainer> showing(TemplateSource source) async {
      final container = await signedInContainer(crud: crud);
      container.read(dayTemplatesQueryProvider.notifier).show(source);
      return container;
    }

    test("Ajil's have no owner, and set their times", () async {
      final templates = await (await showing(TemplateSource.ajil)).read(dayTemplatesProvider.future);

      expect([for (final template in templates) template.name], ['Sortie scouts']);
      expect(templates.single.owner, isNull);
      expect(clockOf(templates.single.startMinutes!), (hours: 9, minutes: 30));
    });

    test("the user's own are theirs alone, and a time of 0 is unset", () async {
      final templates = await (await showing(TemplateSource.personal)).read(dayTemplatesProvider.future);

      expect([for (final template in templates) template.id], ['t2']);
      expect(templates.single.startMinutes, isNull);
    });

    test("a structure's are not built yet", () async {
      final container = await showing(TemplateSource.structure);

      await expectLater(container.read(dayTemplatesProvider.future), throwsUnimplementedError);
    });
  });
}
