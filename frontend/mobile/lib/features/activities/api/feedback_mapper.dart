import 'package:ajil/core/data/mapper.dart';
import 'package:ajil/core/files/file_url_resolver.dart';
import 'package:ajil/features/activities/models/feedback.dart';

class FeedbackMapper implements EntityMapper<ActivityFeedback> {
  const FeedbackMapper();

  @override
  List<String> get relations => const [];

  @override
  ActivityFeedback toEntity(Payload payload, FileUrlResolver files) => ActivityFeedback(
    id: payload['id'] as String,
    user: payload['user'] as String,
    activity: payload['activity'] as String,
    liked: (payload['liked'] as bool?) ?? false,
    comment: (payload['comment'] as String?) ?? '',
  );

  @override
  Payload toPayload(ActivityFeedback feedback) => {
    'user': feedback.user,
    'activity': feedback.activity,
    'liked': feedback.liked,
    'comment': feedback.comment,
  };
}
