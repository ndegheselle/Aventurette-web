import 'package:ajil/features/planning/events/models/calendar.dart';
import 'package:ajil/features/planning/events/models/event.dart';
import 'package:flutter_test/flutter_test.dart';

PlanningEvent event(DateTime start, DateTime end, {String group = ''}) =>
    PlanningEvent(id: 'e', owner: 'u1', name: 'Sortie', start: start, end: end, group: group);

void main() {
  group('a period', () {
    test('a week runs from Monday to the next Monday, whatever day it is asked from', () {
      final week = CalendarPeriod.of(CalendarScale.week, DateTime(2026, 11, 21, 15));

      expect(week.start, DateTime(2026, 11, 16));
      expect(week.end, DateTime(2026, 11, 23));
      expect(week.days, hasLength(7));
    });

    test('a week across two months keeps its seven days', () {
      final week = CalendarPeriod.of(CalendarScale.week, DateTime(2026, 12, 1));

      expect(week.start, DateTime(2026, 11, 30));
      expect(week.days.last, DateTime(2026, 12, 6));
    });

    test('stepping a month from December goes to January of the next year', () {
      final december = CalendarPeriod.of(CalendarScale.month, DateTime(2026, 12, 15));

      expect(december.shift(1).start, DateTime(2027, 1));
      expect(december.shift(1).end, DateTime(2027, 2));
      expect(december.shift(-12).start, DateTime(2025, 12));
    });

    test('a day across a change of clock is still one day', () {
      // Europe moves its clocks on the last Sunday of October.
      final day = CalendarPeriod.of(CalendarScale.day, DateTime(2026, 10, 25));

      expect(day.shift(1).start, DateTime(2026, 10, 26));
    });
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

    test('is counted in each month it takes part of', () {
      final camp = event(DateTime(2026, 7, 28), DateTime(2026, 8, 10, 12));

      final counts = eventCountsByMonth([camp], 2026);

      expect(counts[6], 1, reason: 'July');
      expect(counts[7], 1, reason: 'August');
      expect(counts.reduce((a, b) => a + b), 2);
    });
  });

  test('a month grid starts on Monday and fills its last week', () {
    // November 2026 starts on a Sunday.
    final weeks = monthGrid(DateTime(2026, 11));

    expect(weeks.first.take(6), everyElement(isNull));
    expect(weeks.first.last, DateTime(2026, 11, 1));
    expect(weeks.every((week) => week.length == 7), isTrue);
    expect(weeks.expand((week) => week).whereType<DateTime>(), hasLength(30));
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
