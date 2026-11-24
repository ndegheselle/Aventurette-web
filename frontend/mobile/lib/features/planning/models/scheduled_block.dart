/// An activity saved on the planning: a day plan's activity, on a date.
library;

import 'package:ajil/core/data/mapper.dart';
import 'package:ajil/features/planning/models/day_plan.dart';

class ScheduledActivity implements Identified {
  const ScheduledActivity({
    required this.id,
    required this.user,
    required this.activityId,
    required this.start,
    required this.end,
    this.name = '',
  });

  /// Empty until the backend created it.
  @override
  final String id;
  final String user;
  final String activityId;

  /// In the device's time. The length is set when the activity is planned, and kept: editing the
  /// activity's steps does not move it.
  final DateTime start;
  final DateTime end;

  /// The activity's.
  final String name;
}

/// [activities] of a day plan, each at its time on [day], as long as on the plan.
List<ScheduledActivity> scheduledOn(DateTime day, List<PlannedActivity> activities, String user) => [
  for (final activity in activities)
    ScheduledActivity(
      id: '',
      user: user,
      activityId: activity.activityId,
      name: activity.name,
      start: DateTime(day.year, day.month, day.day, 0, activity.start),
      end: DateTime(day.year, day.month, day.day, 0, activity.end),
    ),
];

/// Whether [activity] takes part of [from, until).
bool scheduledWithin(ScheduledActivity activity, DateTime from, DateTime until) =>
    activity.start.isBefore(until) && activity.end.isAfter(from);
