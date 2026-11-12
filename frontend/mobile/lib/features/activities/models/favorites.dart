/// The user's favorite activities, in the order they were added.
library;

import 'package:ajil/features/activities/models/activity.dart';

/// Adding an activity already in the list leaves it as it was: the list holds each one once.
List<ActivityData> withFavorite(List<ActivityData> favorites, ActivityData activity) =>
    favorites.any((favorite) => favorite.id == activity.id) ? favorites : [...favorites, activity];

List<ActivityData> withoutFavorite(List<ActivityData> favorites, String activityId) => [
  for (final favorite in favorites)
    if (favorite.id != activityId) favorite,
];
