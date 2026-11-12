import 'package:ajil/backend/backend.dart';
import 'package:ajil/core/data/crud.dart';
import 'package:ajil/core/data/filters.dart';
import 'package:ajil/features/activities/api/activity_mapper.dart';
import 'package:ajil/features/activities/api/favorites_mapper.dart';
import 'package:ajil/features/activities/api/feedback_mapper.dart';
import 'package:ajil/features/activities/models/activity.dart';
import 'package:ajil/features/activities/models/catalogue_filters.dart';
import 'package:ajil/features/activities/models/feedback.dart';
import 'package:riverpod/riverpod.dart';

class ActivitiesApi {
  const ActivitiesApi(this._activities);

  final DataCrud<ActivityData> _activities;

  Future<ActivityData?> byId(String id) => _activities.getById(id);

  /// One page of the catalogue, searched and filtered.
  Future<Paginated<ActivityData>> catalogue(CatalogueFilters filters, String search, PageRequest page) =>
      _activities.filter(catalogueFilterOf(filters, search), page);
}

/// The favorites are a field of the user record. The `users` rules keep it to its owner.
class FavoritesApi {
  const FavoritesApi(this._users);

  final DataCrud<List<ActivityData>> _users;

  /// The user's favorite activities, in the order they were added.
  Future<List<ActivityData>> of(String userId) async => (await _users.getById(userId)) ?? const [];

  // One activity at a time, never the whole list: two hearts tapped at once both land.
  Future<void> add(String userId, String activityId) => _users.link(userId, 'favorites', [activityId]);
  Future<void> remove(String userId, String activityId) => _users.unlink(userId, 'favorites', [activityId]);
}

/// A user reads and writes their own feedback only.
class FeedbackApi {
  const FeedbackApi(this._feedback);

  final DataCrud<ActivityFeedback> _feedback;

  /// The user's feedback on the activity, or null when they never gave one.
  Future<ActivityFeedback?> of(String userId, String activityId) async {
    final found = await _feedback.filter(
      FilterGroup([
        Filter('user', userId, operator: FilterOperator.equals),
        Filter('activity', activityId, operator: FilterOperator.equals),
      ]),
      const PageRequest(page: 1, perPage: 1),
    );
    return found.items.firstOrNull;
  }

  Future<ActivityFeedback> create(ActivityFeedback feedback) => _feedback.create(feedback);

  Future<ActivityFeedback> update(String id, {bool? liked, String? comment}) =>
      _feedback.update(id, {'liked': ?liked, 'comment': ?comment});
}

final activitiesApiProvider = Provider(
  (ref) => ActivitiesApi(ref.watch(crudFactoryProvider).of('activities', const ActivityMapper())),
);

final favoritesApiProvider = Provider(
  (ref) => FavoritesApi(ref.watch(crudFactoryProvider).of('users', const FavoritesMapper())),
);

final feedbackApiProvider = Provider(
  (ref) => FeedbackApi(ref.watch(crudFactoryProvider).of('user_activity_feedback', const FeedbackMapper())),
);
