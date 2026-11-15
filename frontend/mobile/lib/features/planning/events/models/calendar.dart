/// The *Calendrier* (B01): a day chosen, the week it is in, and the events on it.
library;

import 'package:ajil/features/planning/events/models/event.dart';

/// The first day of [day]'s month.
DateTime monthOf(DateTime day) => DateTime(day.year, day.month);

/// The Monday of [day]'s week.
DateTime weekOf(DateTime day) => DateTime(day.year, day.month, day.day - (day.weekday - DateTime.monday));

/// The days whose events are read while a day of [month] is chosen: from the month before it to
/// the end of the month after, so a week across two months carries its marks on both sides.
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
