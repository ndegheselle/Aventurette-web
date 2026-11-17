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
    this.name = '',
    this.minutes = defaultActivityMinutes,
  });

  /// Empty until the backend created it.
  @override
  final String id;
  final String user;
  final String activityId;

  /// In the device's time.
  final DateTime start;

  /// The activity's, as the day plan read it: see [lengthOf].
  final String name;
  final int minutes;

  DateTime get end => start.add(Duration(minutes: minutes));
}

/// [activities] of a day plan, each at its time on [day].
List<ScheduledActivity> scheduledOn(DateTime day, List<PlannedActivity> activities, String user) => [
  for (final activity in activities)
    ScheduledActivity(
      id: '',
      user: user,
      activityId: activity.activityId,
      name: activity.name,
      minutes: activity.minutes,
      start: DateTime(day.year, day.month, day.day, 0, activity.start),
    ),
];

/// Whether [activity] takes part of [from, until).
bool scheduledWithin(ScheduledActivity activity, DateTime from, DateTime until) =>
    activity.start.isBefore(until) && activity.end.isAfter(from);
