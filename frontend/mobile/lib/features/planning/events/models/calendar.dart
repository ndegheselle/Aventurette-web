/// The *Calendrier* (B01): one period at a time — a day, a week, a month or a year — and the
/// events in it.
library;

import 'package:ajil/features/planning/events/models/event.dart';

enum CalendarScale { day, week, month, year }

/// The days [start, end) the calendar shows, at [scale]. Days are local midnights; a week starts
/// on Monday.
class CalendarPeriod {
  const CalendarPeriod._(this.scale, this.start, this.end);

  /// The period at [scale] holding [day].
  factory CalendarPeriod.of(CalendarScale scale, DateTime day) {
    final date = dayOf(day);
    return switch (scale) {
      CalendarScale.day => CalendarPeriod._(scale, date, _addDays(date, 1)),
      CalendarScale.week => () {
        final monday = _addDays(date, -(date.weekday - DateTime.monday));
        return CalendarPeriod._(scale, monday, _addDays(monday, 7));
      }(),
      CalendarScale.month => CalendarPeriod._(
        scale,
        DateTime(date.year, date.month),
        DateTime(date.year, date.month + 1),
      ),
      CalendarScale.year => CalendarPeriod._(scale, DateTime(date.year), DateTime(date.year + 1)),
    };
  }

  final CalendarScale scale;
  final DateTime start;

  /// The first day after the period.
  final DateTime end;

  /// The period [by] steps away at the same scale: -1 for the one before.
  CalendarPeriod shift(int by) => CalendarPeriod.of(scale, switch (scale) {
    CalendarScale.day => _addDays(start, by),
    CalendarScale.week => _addDays(start, 7 * by),
    CalendarScale.month => DateTime(start.year, start.month + by),
    CalendarScale.year => DateTime(start.year + by),
  });

  /// Every day of the period, in order.
  List<DateTime> get days => [for (var day = start; day.isBefore(end); day = _addDays(day, 1)) day];

  bool contains(DateTime moment) => !moment.isBefore(start) && moment.isBefore(end);

  @override
  bool operator ==(Object other) =>
      other is CalendarPeriod && other.scale == scale && other.start == start && other.end == end;

  @override
  int get hashCode => Object.hash(scale, start, end);
}

/// Through `DateTime`'s constructor rather than a `Duration`: a day is not always 24 hours.
DateTime _addDays(DateTime day, int days) => DateTime(day.year, day.month, day.day + days);

/// The events taking part of [day], in the order they start.
List<PlanningEvent> eventsOn(List<PlanningEvent> events, DateTime day) {
  final date = dayOf(day);
  return sortedByStart([
    for (final event in events)
      if (overlaps(event, date, _addDays(date, 1))) event,
  ]);
}

List<PlanningEvent> sortedByStart(List<PlanningEvent> events) =>
    [...events]..sort((a, b) => a.start.compareTo(b.start));

/// A month as the calendar draws it: weeks of seven days from Monday, null where a day belongs to
/// the month before or after.
List<List<DateTime?>> monthGrid(DateTime month) {
  final first = DateTime(month.year, month.month);
  final daysInMonth = DateTime(month.year, month.month + 1, 0).day;
  final leading = first.weekday - DateTime.monday;
  final cells = <DateTime?>[
    for (var i = 0; i < leading; i++) null,
    for (var day = 1; day <= daysInMonth; day++) DateTime(month.year, month.month, day),
  ];
  while (cells.length % 7 != 0) {
    cells.add(null);
  }
  return [for (var week = 0; week < cells.length; week += 7) cells.sublist(week, week + 7)];
}

/// How many events take part of each month of [year], January first.
List<int> eventCountsByMonth(List<PlanningEvent> events, int year) => [
  for (var month = 1; month <= 12; month++)
    events.where((event) => overlaps(event, DateTime(year, month), DateTime(year, month + 1))).length,
];
