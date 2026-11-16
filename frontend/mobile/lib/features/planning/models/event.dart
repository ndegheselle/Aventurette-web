/// An event: a dated programme for a group, from two hours to a camp.
library;

import 'package:ajil/core/data/mapper.dart';

/// How far along an event is. A validation is not one of these: it stays apart.
enum EventStatus { draft, preparing, ready }

class PlanningEvent implements Identified {
  const PlanningEvent({
    required this.id,
    required this.owner,
    required this.name,
    required this.start,
    required this.end,
    this.place = '',
    this.overnight = false,
    this.group = '',
    this.status,
  });

  /// Empty until the backend created it.
  @override
  final String id;
  final String owner;
  final String name;

  /// In the device's time.
  final DateTime start;
  final DateTime end;
  final String place;
  final bool overnight;

  /// The group it is for, as text until groups exist. Empty for every group.
  final String group;

  /// Null when unset, or set to a value this version does not know.
  final EventStatus? status;
}

/// Whether [event] starts and ends on the same day. One ending at midnight ends the day before.
bool onOneDay(PlanningEvent event) => dayOf(event.start) == lastDayOf(event);

/// The day a moment falls on, at midnight.
DateTime dayOf(DateTime moment) => DateTime(moment.year, moment.month, moment.day);

/// The last day [event] takes part of: the day it ends, or the day before when it ends at
/// midnight sharp.
DateTime lastDayOf(PlanningEvent event) {
  final endDay = dayOf(event.end);
  final endsAtMidnight = event.end == endDay && event.end.isAfter(event.start);
  return endsAtMidnight ? DateTime(endDay.year, endDay.month, endDay.day - 1) : endDay;
}

/// Whether [event] takes part of [from, until): one ending as the range starts does not, one
/// with no length counts where it stands.
bool overlaps(PlanningEvent event, DateTime from, DateTime until) {
  if (!event.start.isBefore(until)) return false;
  if (event.end.isAfter(from)) return true;
  return event.end == event.start && !event.start.isBefore(from);
}

/// [events] in the order they start.
List<PlanningEvent> sortedByStart(Iterable<PlanningEvent> events) =>
    [...events]..sort((a, b) => a.start.compareTo(b.start));
