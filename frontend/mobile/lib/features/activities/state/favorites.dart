import 'package:ajil/features/activities/api/activities_api.dart';
import 'package:ajil/features/activities/models/activity.dart';
import 'package:ajil/features/activities/models/favorites.dart';
import 'package:ajil/features/user/state/session.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

enum FavoriteChange { added, removed }

/// The signed-in user's favorite activities: one list, shared by every heart and the Favoris
/// segment, read once per user and kept in step with each change after that.
class FavoritesNotifier extends AsyncNotifier<List<ActivityData>> {
  FavoritesApi get _api => ref.read(favoritesApiProvider);
  String get _userId => ref.read(currentUserIdProvider);

  @override
  Future<List<ActivityData>> build() => ref.read(favoritesApiProvider).of(ref.watch(currentUserIdProvider));

  bool isFavorite(String activityId) => (state.value ?? const []).any((favorite) => favorite.id == activityId);

  /// Adds the activity, or removes it if it is a favorite already. Says which, so the screen can
  /// offer to take a removal back.
  Future<FavoriteChange> toggle(ActivityData activity) async {
    if (isFavorite(activity.id)) {
      await _api.remove(_userId, activity.id);
      state = AsyncData(withoutFavorite(state.value ?? const [], activity.id));
      return FavoriteChange.removed;
    }

    await add(activity);
    return FavoriteChange.added;
  }

  /// Also what taking a removal back does: the favorite is written again, not only shown.
  Future<void> add(ActivityData activity) async {
    await _api.add(_userId, activity.id);
    state = AsyncData(withFavorite(state.value ?? const [], activity));
  }
}

final favoritesProvider = AsyncNotifierProvider<FavoritesNotifier, List<ActivityData>>(FavoritesNotifier.new);
