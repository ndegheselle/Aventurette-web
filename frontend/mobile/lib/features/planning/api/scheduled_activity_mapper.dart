import 'package:ajil/core/data/mapper.dart';
import 'package:ajil/core/files/file_url_resolver.dart';
import 'package:ajil/features/activities/api/activity_mapper.dart';
import 'package:ajil/features/activities/models/activity.dart';
import 'package:ajil/features/planning/api/event_mapper.dart';
import 'package:ajil/features/planning/models/day_plan.dart';
import 'package:ajil/features/planning/models/scheduled_activity.dart';

/// A `user_planned_activities` record: who, which activity, and when it starts. Its length is
/// not stored: it is read from the activity's steps, as the day plan reads it, so the activity
/// and its steps are expanded.
class ScheduledActivityMapper implements EntityMapper<ScheduledActivity> {
  const ScheduledActivityMapper();

  static const _activity = ActivityMapper();

  @override
  List<String> get relations => const ['activity', 'activity.steps'];

  @override
  ScheduledActivity toEntity(Payload payload, FileUrlResolver files) {
    final expanded = (payload['expand'] as Map?)?['activity'] as Map?;
    // Only the steps are expanded: the activity's other relations read as empty.
    final activity = expanded == null ? null : _activity.toEntity(Payload.from(expanded), files);

    return ScheduledActivity(
      id: payload['id'] as String,
      user: payload['user'] as String,
      activityId: payload['activity'] as String,
      start: localDate(payload['start']),
      name: activity?.name ?? '',
      minutes: lengthOf(activity == null ? 0 : timingOf(activity).play),
    );
  }

  @override
  Payload toPayload(ScheduledActivity activity) => {
    'user': activity.user,
    'activity': activity.activityId,
    'start': backendDate(activity.start),
  };
}
