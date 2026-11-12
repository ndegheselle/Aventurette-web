import 'package:ajil/core/data/crud.dart';
import 'package:ajil/features/activities/api/activities_api.dart';
import 'package:ajil/features/activities/models/activity.dart';
import 'package:ajil/features/activities/models/catalogue_filters.dart';
import 'package:ajil/features/user/state/filter_defaults.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

/// What the catalogue is asked for: the search, settled, and the filters applied.
class CatalogueQuery {
  const CatalogueQuery({this.filters = const CatalogueFilters(), this.search = ''});

  final CatalogueFilters filters;
  final String search;
}

/// The catalogue's search and filters. The filters start from the user's profile, once, when
/// it has been read; after that only the user changes them.
class CatalogueQueryNotifier extends Notifier<CatalogueQuery> {
  @override
  CatalogueQuery build() {
    var seeded = false;
    ref.listen(filterDefaultsProvider, (previous, next) {
      final defaults = next.value;
      if (seeded || defaults == null) return;
      seeded = true;
      // An empty profile changes nothing: the list need not start over for it.
      if (isProfileEmpty(defaults)) return;
      state = CatalogueQuery(filters: withProfile(state.filters, defaults), search: state.search);
    }, fireImmediately: true);

    return const CatalogueQuery();
  }

  void search(String search) => state = CatalogueQuery(filters: state.filters, search: search);

  void apply(CatalogueFilters filters) => state = CatalogueQuery(filters: filters, search: state.search);
}

final catalogueQueryProvider = NotifierProvider<CatalogueQueryNotifier, CatalogueQuery>(CatalogueQueryNotifier.new);

const libraryPageSize = 12;

class LibraryFeed {
  const LibraryFeed({this.items = const [], this.total, this.loading = false, this.failed = false});

  final List<ActivityData> items;

  /// Null until the backend answered.
  final int? total;
  final bool loading;
  final bool failed;

  /// No more to ask for: everything is here, or a page failed — the scroll would otherwise ask
  /// again at once, forever.
  bool get done => failed || (total != null && items.length >= total!);

  /// The backend answered, and nothing matches: not the same as a page that failed.
  bool get empty => total == 0;
}

/// The catalogue's endless list: each [loadMore] appends the next page matching the query, until
/// the backend has no more to give. A new query starts the list over, and a page asked for the
/// previous one is dropped when it comes back.
class LibraryFeedNotifier extends Notifier<LibraryFeed> {
  /// Which query the list is for: a page for an older one is not appended.
  int _generation = 0;
  int _page = 0;

  @override
  LibraryFeed build() {
    ref.listen(catalogueQueryProvider, (previous, next) => _restart());
    _generation += 1;
    _page = 0;
    Future.microtask(loadMore);
    return const LibraryFeed();
  }

  void _restart() {
    _generation += 1;
    _page = 0;
    state = const LibraryFeed();
    loadMore();
  }

  /// After a page failed: ask for it again.
  Future<void> retry() {
    state = LibraryFeed(items: state.items, total: state.total);
    return loadMore();
  }

  Future<void> loadMore() async {
    if (state.loading || state.done) return;

    final asked = _generation;
    final query = ref.read(catalogueQueryProvider);
    state = LibraryFeed(items: state.items, total: state.total, loading: true);

    try {
      final next = await ref
          .read(activitiesApiProvider)
          .catalogue(query.filters, query.search, PageRequest(page: _page + 1, perPage: libraryPageSize));
      if (asked != _generation) return;
      _page += 1;
      state = LibraryFeed(items: [...state.items, ...next.items], total: next.total);
    } catch (_) {
      if (asked != _generation) return;
      state = LibraryFeed(items: state.items, total: state.total, failed: true);
    }
  }
}

final libraryFeedProvider = NotifierProvider<LibraryFeedNotifier, LibraryFeed>(LibraryFeedNotifier.new);

/// One activity, read whole.
final activityProvider = FutureProvider.autoDispose.family<ActivityData?, String>(
  (ref, id) => ref.read(activitiesApiProvider).byId(id),
);
