import 'package:ajil/features/planning/events/models/calendar.dart';
import 'package:ajil/features/planning/events/models/event.dart';
import 'package:flutter_test/flutter_test.dart';

PlanningEvent event(DateTime start, DateTime end, {String group = ''}) =>
    PlanningEvent(id: 'e', owner: 'u1', name: 'Sortie', start: start, end: end, group: group);

void main() {
  test('the events read while a month is shown run from the month before to the end of the next', () {
    final window = calendarWindow(DateTime(2026, 12));

    expect(window.from, DateTime(2026, 11));
    expect(window.until, DateTime(2027, 2));
  });

  test("forui's calendar dates are UTC midnights, the app's local ones", () {
    final day = DateTime(2026, 11, 21);

    expect(toCalendarDate(day), DateTime.utc(2026, 11, 21));
    expect(fromCalendarDate(toCalendarDate(day)), day);
  });

  group('an event', () {
    test('ending at midnight ends the day before', () {
      final saturday = event(DateTime(2026, 11, 28, 9), DateTime(2026, 11, 29));

      expect(lastDayOf(saturday), DateTime(2026, 11, 28));
      expect(spanOf(saturday), EventSpan.oneDay);
      expect(eventsOn([saturday], DateTime(2026, 11, 29)), isEmpty);
    });

    test('reads as one day, days of a month, or across months', () {
      expect(spanOf(event(DateTime(2026, 11, 21, 9, 30), DateTime(2026, 11, 21, 17, 30))), EventSpan.oneDay);
      expect(spanOf(event(DateTime(2026, 11, 28, 10), DateTime(2026, 11, 29, 16))), EventSpan.sameMonth);
      expect(spanOf(event(DateTime(2026, 7, 28), DateTime(2026, 8, 10, 12))), EventSpan.acrossMonths);
    });

    test('over several days is on each of them', () {
      final weekend = event(DateTime(2026, 11, 28, 10), DateTime(2026, 11, 29, 16));

      expect(eventsOn([weekend], DateTime(2026, 11, 28)), [weekend]);
      expect(eventsOn([weekend], DateTime(2026, 11, 29)), [weekend]);
      expect(eventsOn([weekend], DateTime(2026, 11, 30)), isEmpty);
    });
  });

  test("a group's calendar keeps the events for every group", () {
    final scouts = event(DateTime(2026, 11, 21), DateTime(2026, 11, 22), group: 'Scouts-Guides');
    final cubs = event(DateTime(2026, 11, 21), DateTime(2026, 11, 22), group: 'Louveteaux');
    final everyone = event(DateTime(2026, 11, 28), DateTime(2026, 11, 29));

    expect(forGroup([scouts, cubs, everyone], 'Scouts-Guides'), [scouts, everyone]);
    expect(forGroup([scouts, cubs, everyone], null), hasLength(3));
    expect(groupsOf([scouts, cubs, everyone, scouts]), ['Louveteaux', 'Scouts-Guides']);
  });
}
