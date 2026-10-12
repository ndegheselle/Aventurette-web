import 'package:aventurette/app/i18n.dart';
import 'package:aventurette/features/activities/composables/use_activities_list.dart';
import 'package:aventurette/features/activities/routes.dart';
import 'package:aventurette/ui/data/pagination.dart';
import 'package:aventurette/ui/data/search_input.dart';
import 'package:aventurette/ui/layout/html_text.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

class ActivitiesPage extends StatefulWidget {
  const ActivitiesPage({super.key});

  @override
  State<ActivitiesPage> createState() => _ActivitiesPageState();
}

class _ActivitiesPageState extends State<ActivitiesPage> {
  final _list = UseActivitiesList();

  @override
  void initState() {
    super.initState();
    _list.refresh();
  }

  @override
  void dispose() {
    _list.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return ListenableBuilder(
      listenable: _list,
      builder: (context, _) {
        final options = _list.paginated.options;
        final total = _list.paginated.total;

        return Column(
          children: [
            Padding(
              padding: const EdgeInsets.all(8),
              child: SearchInput(onSearch: _list.searchFor),
            ),
            Expanded(
              child: _list.cards.isEmpty
                  ? Center(
                      child: Opacity(
                        opacity: 0.4,
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          spacing: 8,
                          children: [
                            const Icon(LucideIcons.circleQuestionMark),
                            Text(context.t('data.noData')),
                          ],
                        ),
                      ),
                    )
                  : _ActivityGrid(cards: _list.cards),
            ),
            if (options.perPage < total)
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 8),
                child: Pagination(
                  page: options.page,
                  perPage: options.perPage,
                  total: total,
                  onPage: _list.goToPage,
                ),
              ),
          ],
        );
      },
    );
  }
}

class _ActivityGrid extends StatelessWidget {
  const _ActivityGrid({required this.cards});

  final List<ActivityCard> cards;

  @override
  Widget build(BuildContext context) {
    return GridView.builder(
      padding: const EdgeInsets.all(8),
      gridDelegate: const SliverGridDelegateWithMaxCrossAxisExtent(
        maxCrossAxisExtent: 480,
        mainAxisExtent: 190,
        crossAxisSpacing: 8,
        mainAxisSpacing: 8,
      ),
      itemCount: cards.length,
      itemBuilder: (context, index) => _ActivityCardTile(card: cards[index]),
    );
  }
}

class _ActivityCardTile extends StatelessWidget {
  const _ActivityCardTile({required this.card});

  final ActivityCard card;

  @override
  Widget build(BuildContext context) {
    final activity = card.activity;
    final ageLabel = context.t(card.ageLabel.key, card.ageLabel.params);

    return Card(
      clipBehavior: Clip.antiAlias,
      margin: EdgeInsets.zero,
      child: InkWell(
        onTap: () => context.goNamed(routesNames.page, pathParameters: {'id': activity.id}),
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            spacing: 8,
            children: [
              Text(activity.name, style: Theme.of(context).textTheme.titleMedium),
              Wrap(
                spacing: 4,
                children: [
                  Tooltip(
                    message: context.t('activities.fields.age'),
                    child: Chip(avatar: const Icon(LucideIcons.cake, size: 14), label: Text(ageLabel)),
                  ),
                  if (card.totalMinutes > 0)
                    Tooltip(
                      message: context.t('activities.fields.totalTime'),
                      child: Chip(
                        avatar: const Icon(LucideIcons.clock, size: 14),
                        label: Text(context.t('activities.minutes', {'minutes': card.totalMinutes})),
                      ),
                    ),
                ],
              ),
              // Clipped, not measured: three lines of rich text at most.
              Expanded(child: ClipRect(child: HtmlText(activity.description))),
            ],
          ),
        ),
      ),
    );
  }
}
