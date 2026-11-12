import 'package:ajil/features/activities/models/activity.dart';
import 'package:ajil/features/activities/state/favorites.dart';
import 'package:flutter_test/flutter_test.dart';

import '../../support/container.dart';
import '../../support/fake_crud.dart';

void main() {
  const activity = ActivityData(id: 'a1', name: 'La quête du remède');

  Future<(FakeCrudFactory, FavoritesNotifier)> setUpFavorites() async {
    final crud = FakeCrudFactory({
      'users': [
        {'id': 'u1', 'favorites': <String>[]},
      ],
    });
    final container = await signedInContainer(crud: crud);
    container.listen(favoritesProvider, (_, _) {});
    await container.read(favoritesProvider.future);
    return (crud, container.read(favoritesProvider.notifier));
  }

  test('a change sends one activity, never the list', () async {
    final (crud, favorites) = await setUpFavorites();

    expect(await favorites.toggle(activity), FavoriteChange.added);
    expect(await favorites.toggle(activity), FavoriteChange.removed);

    expect(crud.writes['users'], ['link u1 favorites a1', 'unlink u1 favorites a1']);
  });

  test('taking a removal back writes the favorite again, not only shows it', () async {
    final (crud, favorites) = await setUpFavorites();
    await favorites.toggle(activity);
    await favorites.toggle(activity);

    await favorites.add(activity);

    expect(crud.records['users']!.single['favorites'], ['a1']);
    expect(favorites.isFavorite('a1'), isTrue);
  });
}
