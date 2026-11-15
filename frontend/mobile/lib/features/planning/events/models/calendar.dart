/// The *Calendrier* (B01): a day chosen on a calendar, and the events on it.
library;

import 'package:ajil/features/planning/events/models/event.dart';

/// The first day of [day]'s month.
DateTime monthOf(DateTime day) => DateTime(day.year, day.month);

/// The days whose events are read while [month] is shown: from the month before it to the end
/// of the month after, so the days a calendar draws beside the month carry their marks too.
({DateTime from, DateTime until}) calendarWindow(DateTime month) =>
    (from: DateTime(month.year, month.month - 1), until: DateTime(month.year, month.month + 2));

/// forui's calendars count days as UTC midnights; the app, as local ones.
DateTime toCalendarDate(DateTime day) => DateTime.utc(day.year, day.month, day.day);

DateTime fromCalendarDate(DateTime date) => DateTime(date.year, date.month, date.day);

/// The events taking part of [day], in the order they start.
List<PlanningEvent> eventsOn(List<PlanningEvent> events, DateTime day) {
  final date = dayOf(day);
  return sortedByStart([
    for (final event in events)
      if (overlaps(event, date, DateTime(date.year, date.month, date.day + 1))) event,
  ]);
}

List<PlanningEvent> sortedByStart(List<PlanningEvent> events) =>
    [...events]..sort((a, b) => a.start.compareTo(b.start));
