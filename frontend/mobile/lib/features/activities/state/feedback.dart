import 'package:ajil/features/activities/api/activities_api.dart';
import 'package:ajil/features/activities/models/feedback.dart';
import 'package:ajil/features/user/state/session.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

/// The screen after a run: what the user thought of the activity. A like is written the moment
/// it is toggled; the comment as the user leaves, if it changed. Null until they first give one.
///
/// The backend holds one feedback per user and activity, so every write after the first has to
/// be an update: a write asked for while another is in flight is dropped, so a quick second tap
/// cannot create a second record.
class FeedbackNotifier extends AsyncNotifier<ActivityFeedback?> {
  FeedbackNotifier(this.activityId);

  final String activityId;
  bool _writing = false;

  FeedbackApi get _api => ref.read(feedbackApiProvider);

  @override
  Future<ActivityFeedback?> build() => ref.read(feedbackApiProvider).of(ref.watch(currentUserIdProvider), activityId);

  bool get liked => state.value?.liked ?? false;

  Future<void> toggleLike() => _save(liked: !liked);

  /// Writes what was typed, if it changed. Throws when the backend refused it, so the screen
  /// keeps the user where they are.
  Future<void> saveComment(String typed) async {
    final changed = commentToSave(state.value?.comment ?? '', typed);
    if (changed == null) return;
    await _save(comment: changed);
  }

  Future<void> _save({bool? liked, String? comment}) async {
    if (_writing || state.isLoading) return;

    _writing = true;
    try {
      final saved = state.value;
      final written = saved == null
          ? await _api.create(
              ActivityFeedback(
                id: '',
                user: ref.read(currentUserIdProvider),
                activity: activityId,
                liked: liked ?? false,
                comment: comment ?? '',
              ),
            )
          : await _api.update(saved.id, liked: liked, comment: comment);
      state = AsyncData(written);
    } finally {
      _writing = false;
    }
  }
}

final feedbackProvider = AsyncNotifierProvider.autoDispose.family<FeedbackNotifier, ActivityFeedback?, String>(
  FeedbackNotifier.new,
);
