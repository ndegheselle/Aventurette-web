import 'package:ajil/core/data/mapper.dart';
import 'package:ajil/core/files/file_url_resolver.dart';
import 'package:ajil/features/planning/api/event_mapper.dart';
import 'package:ajil/features/planning/models/scheduled_activity.dart';

/// A `user_planned_activities` record: who, which activity, when it starts and when it ends. The
/// activity is expanded for its name only.
class ScheduledActivityMapper implements EntityMapper<ScheduledActivity> {
  const ScheduledActivityMapper();

  @override
  List<String> get relations => const ['activity'];

  @override
  ScheduledActivity toEntity(Payload payload, FileUrlResolver files) {
    final activity = (payload['expand'] as Map?)?['activity'] as Map?;

    return ScheduledActivity(
      id: payload['id'] as String,
      user: payload['user'] as String,
      activityId: payload['activity'] as String,
      start: localDate(payload['start']),
      end: localDate(payload['end']),
      name: (activity?['name'] as String?) ?? '',
    );
  }

  @override
  Payload toPayload(ScheduledActivity activity) => {
    'user': activity.user,
    'activity': activity.activityId,
    'start': backendDate(activity.start),
    'end': backendDate(activity.end),
  };
}
