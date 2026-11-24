import 'package:ajil/backend/backend.dart';
import 'package:ajil/core/data/crud.dart';
import 'package:ajil/core/data/filters.dart';
import 'package:ajil/features/planning/api/event_mapper.dart';
import 'package:ajil/features/planning/api/scheduled_activity_mapper.dart';
import 'package:ajil/features/planning/models/scheduled_activity.dart';
import 'package:riverpod/riverpod.dart';

/// A user's activities saved on the planning. The `user_planned_activities` rules keep each to
/// its user.
class ScheduledActivitiesApi {
  const ScheduledActivitiesApi(this._scheduled);

  final DataCrud<ScheduledActivity> _scheduled;

  /// As many as one screen lists.
  static const _limit = 200;

  /// The user's activities taking part of [from, until), in the order they start.
  Future<List<ScheduledActivity>> between(String user, DateTime from, DateTime until) async {
    final found = await _scheduled.filter(
      FilterGroup([
        Filter('user', user, operator: FilterOperator.equals),
        Filter('start', backendDate(until), operator: FilterOperator.lessThan),
        Filter('end', backendDate(from), operator: FilterOperator.greaterThan),
      ]),
      const PageRequest(page: 1, perPage: _limit, sort: 'start'),
    );
    return found.items;
  }

  /// Creates [activities], all at once.
  Future<void> createAll(List<ScheduledActivity> activities) =>
      Future.wait([for (final activity in activities) _scheduled.create(activity)]);
}

final scheduledActivitiesApiProvider = Provider(
  (ref) => ScheduledActivitiesApi(
    ref.watch(crudFactoryProvider).of('user_planned_activities', const ScheduledActivityMapper()),
  ),
);
