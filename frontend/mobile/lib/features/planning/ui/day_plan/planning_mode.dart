import 'package:ajil/features/activities/models/activity.dart';
import 'package:ajil/features/planning/models/day_plan.dart';
import 'package:ajil/features/planning/routes.dart';
import 'package:ajil/features/planning/state/day_plan.dart';
import 'package:ajil/ui/i18n/strings.g.dart';
import 'package:ajil/ui/shell/page.dart';
import 'package:ajil/ui/theme/text.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:forui/forui.dart';
import 'package:go_router/go_router.dart';

/// The bar the catalogue's pages end with in planning mode: *Planification en cours*, how many
/// activities are picked, *Annuler* and *Valider*. While an activity is being replaced, it names it, and *Annuler* stops the
/// replacement only. Draws nothing outside planning mode.
class PlanningFooter extends ConsumerWidget {
  const PlanningFooter({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final t = context.t.planning.mode;
    final plan = ref.watch(dayPlanProvider);
    if (plan == null) return const SizedBox.shrink();

    final notifier = ref.read(dayPlanProvider.notifier);
    final replaced = plan.replaced;

    return BottomActionBar(
      children: [
        Row(
          spacing: 8,
          children: [
            Expanded(
              child: Text(
                replaced == null
                    ? '${t.title} · ${t.count(n: plan.activities.length)}'
                    : t.replacing(name: replaced.name),
                style: context.labelText,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
            ),
            FButton(
              variant: .outline,
              size: .sm,
              mainAxisSize: .min,
              onPress: replaced == null ? notifier.cancel : notifier.stopReplacing,
              child: Text(t.cancel),
            ),
            FButton(
              size: .sm,
              mainAxisSize: .min,
              onPress: () {
                notifier.stopReplacing();
                context.push(PlanningRoutes.dayPlan);
              },
              child: Text(t.confirm),
            ),
          ],
        ),
      ],
    );
  }
}

/// *Ajouter au planning*, on an activity's sheet: adds it to the plan, entering planning mode
/// if needed; the planning's bar under it counts it. *Retirer du planning* once it is in the
/// plan. While an activity is being replaced, it reads *Remplacer* and goes back to the plan.
class AddToPlanningButton extends ConsumerWidget {
  const AddToPlanningButton({super.key, required this.activity});

  final ActivityData activity;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final t = context.t.planning.mode;
    final action = ref.watch(dayPlanProvider.select((plan) => pickActionOf(plan, activity.id)));

    return FTooltip(
      tipBuilder: (context, _) => Text(switch (action) {
        PickAction.add => t.add,
        PickAction.remove => t.remove,
        PickAction.replace => t.replace,
      }),
      child: FButton.icon(
        variant: .secondary,
        onPress: () {
          final done = ref.read(dayPlanProvider.notifier).pick(activity);
          if (done == PickAction.replace) context.push(PlanningRoutes.dayPlan);
        },
        child: Icon(switch (action) {
          PickAction.add => FLucideIcons.calendarPlus,
          PickAction.remove => FLucideIcons.calendarMinus,
          PickAction.replace => FLucideIcons.replace,
        }),
      ),
    );
  }
}
