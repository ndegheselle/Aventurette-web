import 'package:ajil/core/data/mapper.dart';
import 'package:ajil/core/files/file_url_resolver.dart';
import 'package:ajil/features/activities/api/activity_mapper.dart';
import 'package:ajil/features/activities/models/activity.dart';

/// Reads a user record for their favorites, each one a whole activity, and nothing else of it.
class FavoritesMapper implements EntityMapper<List<ActivityData>> {
  const FavoritesMapper();

  static const _activities = ActivityMapper();

  @override
  List<String> get relations => ['favorites', for (final relation in _activities.relations) 'favorites.$relation'];

  @override
  List<ActivityData> toEntity(Payload payload, FileUrlResolver files) =>
      toEntities(payload, 'favorites', _activities, files);

  /// A change sends one activity at a time, never the list: see `FavoritesApi`.
  @override
  Payload toPayload(List<ActivityData> favorites) => {'favorites': toIds(favorites)};
}
