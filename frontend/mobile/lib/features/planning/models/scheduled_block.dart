/// A block saved on the planning: a day plan's block, on a date.
library;

import 'package:ajil/core/data/mapper.dart';
import 'package:ajil/features/planning/models/day_plan.dart';

class ScheduledBlock implements Identified {
  const ScheduledBlock({
    required this.id,
    required this.user,
    required this.label,
    required this.start,
    required this.end,
    this.activityId,
  });

  /// Empty until the backend created it.
  @override
  final String id;
  final String user;

  /// The activity it runs. Null for a block the user named, and once the activity is deleted.
  final String? activityId;

  /// Set when the block is planned, and kept: renaming the activity does not change it.
  final String label;

  /// In the device's time. The length is set when the block is planned, and kept: editing the
  /// activity's steps does not move it.
  final DateTime start;
  final DateTime end;
}

/// [blocks] of a day plan, each at its time on [day], as long as on the plan.
List<ScheduledBlock> scheduledOn(DateTime day, List<PlannedBlock> blocks, String user) => [
  for (final block in blocks)
    ScheduledBlock(
      id: '',
      user: user,
      activityId: block.activityId,
      label: block.label,
      start: DateTime(day.year, day.month, day.day, 0, block.start),
      end: DateTime(day.year, day.month, day.day, 0, block.end),
    ),
];

/// Whether [block] takes part of [from, until).
bool scheduledWithin(ScheduledBlock block, DateTime from, DateTime until) =>
    block.start.isBefore(until) && block.end.isAfter(from);
