import 'dart:async';

import 'package:ajil/backend/backend.dart';
import 'package:ajil/core/data/crud.dart';
import 'package:ajil/features/activities/api/activities_api.dart';
import 'package:ajil/features/activities/models/activity.dart';
import 'package:ajil/features/activities/models/catalogue_filters.dart';
import 'package:ajil/features/activities/state/catalogue.dart';
import 'package:ajil/features/user/api/filter_defaults_api.dart';
import 'package:ajil/features/user/models/user.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

import '../../support/container.dart';

/// The catalogue's port, answering each page when the spec says so.
class _ControlledCatalogue implements ActivitiesApi {
  final asked = <(String search, Completer<Paginated<ActivityData>> answer)>[];

  @override
  Future<Paginated<ActivityData>> catalogue(CatalogueFilters filters, String search, PageRequest page) {
    final answer = Completer<Paginated<ActivityData>>();
    asked.add((search, answer));
    return answer.future;
  }

  @override
  Future<ActivityData?> byId(String id) => throw UnimplementedError();
}

class _NoDefaults implements FilterDefaultsApi {
  @override
  Future<FilterDefaults> of(String userId) async => const FilterDefaults();

  @override
  Future<void> save(String userId, FilterDefaults defaults) async {}

  @override
  Future<void> skip(String userId) async {}
}

Paginated<ActivityData> page(List<String> names, {int total = 100}) => Paginated(
  items: [for (final name in names) ActivityData(id: name, name: name)],
  total: total,
);

Future<void> settle() => Future<void>.delayed(Duration.zero);

void main() {
  late _ControlledCatalogue catalogue;
  late ProviderContainer container;

  setUp(() async {
    catalogue = _ControlledCatalogue();
    container = ProviderContainer(
      overrides: [
        activitiesApiProvider.overrideWithValue(catalogue),
        filterDefaultsApiProvider.overrideWithValue(_NoDefaults()),
        authProviderProvider.overrideWithValue(FakeAuth(sessionRecord())),
      ],
    );
    addTearDown(container.dispose);
    container.listen(libraryFeedProvider, (_, _) {});
    await settle();
  });

  test('appends each page to the list', () async {
    catalogue.asked.single.$2.complete(page(['a', 'b']));
    await settle();
    container.read(libraryFeedProvider.notifier).loadMore();
    catalogue.asked.last.$2.complete(page(['c']));
    await settle();

    expect(container.read(libraryFeedProvider).items.map((a) => a.id), ['a', 'b', 'c']);
  });

  test('a new search starts the list over, and drops a page asked for the previous one', () async {
    final stale = catalogue.asked.single.$2;

    container.read(catalogueQueryProvider.notifier).search('remède');
    await settle();
    catalogue.asked.last.$2.complete(page(['remède']));
    stale.complete(page(['old']));
    await settle();

    expect(catalogue.asked.last.$1, 'remède');
    expect(container.read(libraryFeedProvider).items.map((a) => a.id), ['remède']);
  });

  test('a page that failed ends the list until asked again', () async {
    catalogue.asked.single.$2.completeError(Exception('offline'));
    await settle();

    final feed = container.read(libraryFeedProvider);
    expect((feed.failed, feed.done), (true, true));

    container.read(libraryFeedProvider.notifier).loadMore();
    expect(catalogue.asked, hasLength(1), reason: 'the scroll would otherwise ask again at once, forever');

    container.read(libraryFeedProvider.notifier).retry();
    expect(catalogue.asked, hasLength(2));
  });
}
