import 'package:ajil/features/activities/routes.dart';
import 'package:ajil/features/planning/models/period.dart';
import 'package:ajil/features/planning/routes.dart';
import 'package:ajil/features/planning/state/day_plan.dart';
import 'package:ajil/features/planning/state/planning.dart';
import 'package:ajil/features/planning/ui/day_plan/planned_activity_card.dart';
import 'package:ajil/features/planning/ui/period_bar.dart';
import 'package:ajil/features/planning/ui/planning_text.dart';
import 'package:ajil/ui/async/async_view.dart';
import 'package:ajil/ui/i18n/strings.g.dart';
import 'package:ajil/ui/shell/page.dart';
import 'package:ajil/ui/theme/text.dart';
import 'package:ajil/ui/theme/tokens.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:forui/forui.dart';
import 'package:go_router/go_router.dart';

/// The Planning tab: a period — a day, a week, a month or a year — and its events, grouped.
class PlanningPage extends ConsumerWidget {
  const PlanningPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final t = context.t.planning;
    final range = ref.watch(planningProvider.select((view) => view.range));

    return AppPage(
      header: TabHeader(title: t.screens.tab),
      body: PageScroll(
        children: [
          const PeriodBar(),
          AsyncView(
            value: ref.watch(planningGroupsProvider),
            onRetry: () => ref.invalidate(planningGroupsProvider),
            data: (groups) => _PeriodGroups(range: range, groups: groups),
          ),
          FButton(
            prefix: const Icon(FLucideIcons.calendarPlus),
            onPress: () {
              ref.read(dayPlanProvider.notifier).start();
              context.go(ActivitiesRoutes.catalogue);
            },
            child: Text(t.start),
          ),
        ],
      ),
    );
  }
}

/// The period's events and saved activities, under a heading per day, week or month. A day's
/// are not headed: the period already names it. Events are tiles; activities, the day plan's cards.
class _PeriodGroups extends StatelessWidget {
  const _PeriodGroups({required this.range, required this.groups});

  final TimeRange range;
  final List<PeriodGroup> groups;

  @override
  Widget build(BuildContext context) {
    final t = context.t;
    if (groups.isEmpty) {
      return Padding(
        padding: const EdgeInsets.symmetric(vertical: AppSpaces.page),
        child: Text(t.planning.empty, style: context.captionText, textAlign: TextAlign.center),
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      spacing: AppSpaces.page,
      children: [
        for (final group in groups)
          Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            spacing: AppSpaces.spacing,
            children: [
              if (range != TimeRange.day) Text(partTitle(t, range, group.part), style: context.labelText),
              if (group.events.isNotEmpty)
                FTileGroup(
                  children: [
                    for (final event in group.events)
                      FTile(
                        title: Text(event.name),
                        subtitle: Text(eventSubtitle(t, event)),
                        suffix: const Icon(FLucideIcons.chevronRight),
                        onPress: () => context.push(PlanningRoutes.event(event.id)),
                      ),
                  ],
                ),
              for (final activity in group.activities)
                PlannedActivityCard(
                  name: activity.name,
                  time: scheduledText(t, range, activity),
                  onTap: () => context.push(ActivitiesRoutes.activity(activity.activityId)),
                ),
            ],
          ),
      ],
    );
  }
}
