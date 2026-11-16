import 'package:ajil/features/planning/models/event.dart';
import 'package:ajil/features/planning/models/period.dart';
import 'package:flutter_test/flutter_test.dart';

PlanningEvent event(String id, DateTime start, DateTime end) =>
    PlanningEvent(id: id, owner: 'u1', name: id, start: start, end: end);

List<String> idsOf(EventGroup group) => [for (final event in group.events) event.id];

void main() {
  group('the period holding a day', () {
    final saturday = DateTime(2026, 11, 21, 15);

    test('is the day, its week from Monday, its month or its year', () {
      expect(periodOf(TimeRange.day, saturday), Period(DateTime(2026, 11, 21), DateTime(2026, 11, 22)));
      expect(periodOf(TimeRange.week, saturday), Period(DateTime(2026, 11, 16), DateTime(2026, 11, 23)));
      expect(periodOf(TimeRange.month, saturday), Period(DateTime(2026, 11), DateTime(2026, 12)));
      expect(periodOf(TimeRange.year, saturday), Period(DateTime(2026), DateTime(2027)));
    });

    test('has a week across a month or a year, a Sunday ending its week', () {
      expect(periodOf(TimeRange.week, DateTime(2026, 11, 15)).from, DateTime(2026, 11, 9));
      expect(periodOf(TimeRange.week, DateTime(2027, 1, 2)), Period(DateTime(2026, 12, 28), DateTime(2027, 1, 4)));
    });
  });

  test('a week is listed by day, a month by week cut at its edges, a year by month', () {
    final week = partsOf(TimeRange.week, periodOf(TimeRange.week, DateTime(2026, 11, 16)));
    expect(week, hasLength(7));
    expect(week.last, Period(DateTime(2026, 11, 22), DateTime(2026, 11, 23)));

    // November 2026 starts on a Sunday and ends on a Monday.
    final month = partsOf(TimeRange.month, periodOf(TimeRange.month, DateTime(2026, 11)));
    expect(month.first, Period(DateTime(2026, 11), DateTime(2026, 11, 2)));
    expect(month[1], Period(DateTime(2026, 11, 2), DateTime(2026, 11, 9)));
    expect(month.last, Period(DateTime(2026, 11, 30), DateTime(2026, 12)));
    expect(month, hasLength(6));

    final year = partsOf(TimeRange.year, periodOf(TimeRange.year, DateTime(2026)));
    expect([for (final part in year) part.from.month], [for (var month = 1; month <= 12; month++) month]);

    expect(partsOf(TimeRange.day, periodOf(TimeRange.day, DateTime(2026, 11, 21))), hasLength(1));
  });

  group("a period's events", () {
    final week = periodOf(TimeRange.week, DateTime(2026, 11, 16));

    test('are grouped by part, in the order they start, empty parts left out', () {
      final late = event('late', DateTime(2026, 11, 18, 14), DateTime(2026, 11, 18, 16));
      final early = event('early', DateTime(2026, 11, 18, 9), DateTime(2026, 11, 18, 11));
      final friday = event('friday', DateTime(2026, 11, 20, 18), DateTime(2026, 11, 20, 20));

      final groups = groupedEvents([friday, late, early], TimeRange.week, week);

      expect([for (final group in groups) group.part.from], [DateTime(2026, 11, 18), DateTime(2026, 11, 20)]);
      expect(idsOf(groups.first), ['early', 'late']);
    });

    test('are in each part they take part of, one ending at midnight ending the day before', () {
      final weekend = event('weekend', DateTime(2026, 11, 21, 10), DateTime(2026, 11, 23));

      final groups = groupedEvents([weekend], TimeRange.week, week);

      expect([for (final group in groups) group.part.from], [DateTime(2026, 11, 21), DateTime(2026, 11, 22)]);
    });
  });

  test('an event is on one day until it ends past the midnight after', () {
    expect(onOneDay(event('day', DateTime(2026, 11, 21, 9), DateTime(2026, 11, 22))), isTrue);
    expect(onOneDay(event('night', DateTime(2026, 11, 21, 9), DateTime(2026, 11, 22, 10))), isFalse);
  });
}
