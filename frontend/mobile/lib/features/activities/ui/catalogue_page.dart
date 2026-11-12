import 'package:ajil/features/activities/models/activity.dart';
import 'package:ajil/features/activities/models/catalogue_filters.dart';
import 'package:ajil/features/activities/state/catalogue.dart';
import 'package:ajil/features/activities/state/favorites.dart';
import 'package:ajil/features/activities/ui/activity_card.dart';
import 'package:ajil/features/activities/ui/catalogue_filters_sheet.dart';
import 'package:ajil/features/user/state/filter_defaults.dart';
import 'package:ajil/ui/async/async_view.dart';
import 'package:ajil/ui/content/surfaces.dart';
import 'package:ajil/ui/i18n/strings.g.dart';
import 'package:ajil/ui/inputs/fields.dart';
import 'package:ajil/ui/inputs/pills.dart';
import 'package:ajil/ui/shell/page.dart';
import 'package:ajil/ui/theme/app_theme.dart';
import 'package:ajil/ui/theme/styles.dart';
import 'package:ajil/ui/theme/tokens.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:remix/remix.dart';

/// The catalogue's segments (A01, A02, A16, A14): one page, the segment choosing what lists.
enum CatalogueSegment { all, favorites, mine, shared }

/// The Catalogue tab: the activities, searched and filtered, or the user's favorites. *Mes
/// créations* and *Partagés avec moi* need data that does not exist yet.
class CataloguePage extends StatefulWidget {
  const CataloguePage({super.key});

  @override
  State<CataloguePage> createState() => _CataloguePageState();
}

class _CataloguePageState extends State<CataloguePage> {
  var _segment = CatalogueSegment.all;

  @override
  Widget build(BuildContext context) {
    final t = context.t.activities.catalogue;
    final gutter = context.token(AppSpaces.page);

    final body = switch (_segment) {
      CatalogueSegment.all => const _Library(),
      CatalogueSegment.favorites => const _Favorites(),
      CatalogueSegment.mine => const ComingSoonView(wireframe: 'A16'),
      CatalogueSegment.shared => const ComingSoonView(wireframe: 'A14'),
    };

    return AppPage(
      header: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          TabHeader(title: t.title),
          Padding(
            padding: EdgeInsets.symmetric(horizontal: gutter),
            child: PillTabs(
              values: CatalogueSegment.values,
              selected: _segment,
              labelOf: (segment) => t.segments[segment.name]!,
              onChanged: (segment) => setState(() => _segment = segment),
            ),
          ),
          const SizedBox(height: 8),
        ],
      ),
      body: body,
    );
  }
}

/// Every activity, searched and filtered, in an endless list.
class _Library extends ConsumerWidget {
  const _Library();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final feed = ref.watch(libraryFeedProvider);
    final gutter = context.token(AppSpaces.page);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Padding(
          padding: EdgeInsets.symmetric(horizontal: gutter),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            spacing: 8,
            children: [
              SearchField(
                hintText: context.t.activities.catalogue.searchHint,
                onSearch: ref.read(catalogueQueryProvider.notifier).search,
              ),
              const _QuickFilters(),
            ],
          ),
        ),
        const SizedBox(height: 8),
        Expanded(
          child: feed.empty
              ? EmptyState(icon: LucideIcons.searchX, message: context.t.activities.catalogue.empty)
              : _ActivityList(
                  items: feed.items,
                  loading: feed.loading,
                  failed: feed.failed,
                  onEndReached: ref.read(libraryFeedProvider.notifier).loadMore,
                  onRetry: ref.read(libraryFeedProvider.notifier).retry,
                ),
        ),
      ],
    );
  }
}

/// The full filters' button, with how many are set, then the quick ones on a line that scrolls.
class _QuickFilters extends ConsumerWidget {
  const _QuickFilters();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final t = context.t;
    final filters = ref.watch(catalogueQueryProvider).filters;
    final count = activeFilterCount(filters);

    Future<void> open({QuickFilter? only}) async {
      final edited = await showCatalogueFilters(
        context,
        applied: filters,
        defaults: ref.read(filterDefaultsProvider).value,
        only: only,
      );
      if (edited != null) ref.read(catalogueQueryProvider.notifier).apply(edited);
    }

    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        spacing: 8,
        children: [
          RemixButton(
            label: count > 0 ? '${t.activities.filters.title} · $count' : t.activities.filters.title,
            leadingIcon: LucideIcons.slidersHorizontal,
            style: pillStyle(selected: count > 0),
            semanticLabel: t.activities.filters.open,
            onPressed: open,
          ),
          for (final quick in QuickFilter.values)
            RemixButton(
              label: quickFilterText(t, filters, quick),
              trailingIcon: LucideIcons.chevronDown,
              style: pillStyle(selected: isQuickFilterSet(filters, quick)),
              onPressed: () => open(only: quick),
            ),
        ],
      ),
    );
  }
}

/// The user's favorites, in the order they were added.
class _Favorites extends ConsumerWidget {
  const _Favorites();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return AsyncView(
      value: ref.watch(favoritesProvider),
      onRetry: () => ref.invalidate(favoritesProvider),
      data: (favorites) => favorites.isEmpty
          ? EmptyState(icon: LucideIcons.heart, message: context.t.activities.catalogue.favoritesEmpty)
          : _ActivityList(items: favorites),
    );
  }
}

/// Cards, one under the other. [onEndReached] asks for more as the end comes into view.
class _ActivityList extends StatelessWidget {
  const _ActivityList({
    required this.items,
    this.loading = false,
    this.failed = false,
    this.onEndReached,
    this.onRetry,
  });

  final List<ActivityData> items;
  final bool loading;
  final bool failed;
  final VoidCallback? onEndReached;
  final VoidCallback? onRetry;

  @override
  Widget build(BuildContext context) {
    final gutter = context.token(AppSpaces.page);
    final spacing = context.token(AppSpaces.spacing);

    return NotificationListener<ScrollNotification>(
      onNotification: (notification) {
        final nearEnd = notification.metrics.extentAfter < 400;
        if (nearEnd) onEndReached?.call();
        return false;
      },
      child: ListView.separated(
        padding: EdgeInsets.fromLTRB(gutter, 4, gutter, gutter),
        itemCount: items.length + 1,
        separatorBuilder: (_, _) => SizedBox(height: spacing),
        itemBuilder: (context, index) {
          if (index < items.length) return ActivityCard(activity: items[index]);
          if (loading) return const LoadingView();
          if (failed) return ErrorView(onRetry: onRetry);
          return const SizedBox.shrink();
        },
      ),
    );
  }
}
