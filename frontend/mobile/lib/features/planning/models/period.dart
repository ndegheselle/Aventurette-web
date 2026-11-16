/// What the planning shows: the period of a time range holding the day chosen, and its events
/// grouped by the next smaller unit.
library;

import 'package:ajil/features/planning/models/event.dart';

/// How much time the planning shows at once.
enum TimeRange { day, week, month, year }

/// Days in a row, from the midnight of the first to the midnight after the last.
class Period {
  const Period(this.from, this.until);

  final DateTime from;
  final DateTime until;

  /// The last day, at midnight.
  DateTime get lastDay => DateTime(until.year, until.month, until.day - 1);

  @override
  bool operator ==(Object other) => other is Period && other.from == from && other.until == until;

  @override
  int get hashCode => Object.hash(from, until);
}

/// The Monday of [day]'s week.
DateTime weekOf(DateTime day) => DateTime(day.year, day.month, day.day - (day.weekday - DateTime.monday));

/// [count] days from [from]. Counted on the calendar, so a day stays a day across a change of time.
Period _days(DateTime from, int count) => Period(from, DateTime(from.year, from.month, from.day + count));

/// The period of [range] holding [day]: the day itself, its week from Monday, its month or its year.
Period periodOf(TimeRange range, DateTime day) {
  final date = dayOf(day);
  return switch (range) {
    TimeRange.day => _days(date, 1),
    TimeRange.week => _days(weekOf(date), DateTime.daysPerWeek),
    TimeRange.month => Period(DateTime(date.year, date.month), DateTime(date.year, date.month + 1)),
    TimeRange.year => Period(DateTime(date.year), DateTime(date.year + 1)),
  };
}

/// What a period of [range] is listed by: a week by day, a month by week, a year by month. A day
/// is not split.
TimeRange _partRange(TimeRange range) => switch (range) {
  TimeRange.day || TimeRange.week => TimeRange.day,
  TimeRange.month => TimeRange.week,
  TimeRange.year => TimeRange.month,
};

/// The parts [period] of [range] is listed in, in order. A week across the edge of a month is cut
/// at it, so every part is inside [period].
List<Period> partsOf(TimeRange range, Period period) {
  final parts = <Period>[];
  var from = period.from;
  while (from.isBefore(period.until)) {
    final whole = periodOf(_partRange(range), from);
    final until = whole.until.isAfter(period.until) ? period.until : whole.until;
    parts.add(Period(from, until));
    from = until;
  }
  return parts;
}

/// Events under a heading: the part of the period they take part of.
class EventGroup {
  const EventGroup(this.part, this.events);

  final Period part;

  /// In the order they start.
  final List<PlanningEvent> events;
}

/// [events] grouped by the parts of [period]. A part with no event is left out; an event over
/// several parts is in each.
List<EventGroup> groupedEvents(List<PlanningEvent> events, TimeRange range, Period period) {
  final groups = <EventGroup>[];
  for (final part in partsOf(range, period)) {
    final inPart = events.where((event) => overlaps(event, part.from, part.until));
    if (inPart.isEmpty) continue;
    groups.add(EventGroup(part, sortedByStart(inPart)));
  }
  return groups;
}
