import 'package:ajil/features/activities/models/activity.dart';
import 'package:ajil/features/activities/models/run.dart';
import 'package:ajil/features/activities/models/step.dart';
import 'package:ajil/features/activities/routes.dart';
import 'package:ajil/features/activities/state/catalogue.dart';
import 'package:ajil/features/activities/ui/supplies.dart';
import 'package:ajil/ui/async/async_view.dart';
import 'package:ajil/ui/content/html_text.dart';
import 'package:ajil/ui/content/surfaces.dart';
import 'package:ajil/ui/i18n/strings.g.dart';
import 'package:ajil/ui/shell/page.dart';
import 'package:ajil/ui/theme/text.dart';
import 'package:ajil/ui/theme/tokens.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:forui/forui.dart';
import 'package:go_router/go_router.dart';

/// Guided mode (A07, A15): the steps the author wrote, one to a page. The step is in the route,
/// and moving replaces it, so the whole run is one history entry: leaving it goes back to the
/// sheet. The last step's *Terminer* replaces the run with the feedback screen.
class RunPage extends ConsumerWidget {
  const RunPage({super.key, required this.activityId, required this.stepParam});

  final String activityId;
  final String? stepParam;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final activity = ref.watch(activityProvider(activityId));
    final loaded = activity.value;

    if (loaded == null) {
      return AppPage(
        header: const BackHeader(title: ''),
        body: AsyncView(value: activity, data: (_) => const ErrorView()),
      );
    }

    if (loaded.steps.isEmpty) {
      return AppPage(
        header: BackHeader(title: loaded.name),
        body: EmptyState(icon: FLucideIcons.circleQuestionMark, message: context.t.activities.run.empty),
      );
    }

    final index = runStepIndexOf(stepParam, loaded.steps.length);
    return _Run(activity: loaded, index: index);
  }
}

class _Run extends StatelessWidget {
  const _Run({required this.activity, required this.index});

  final ActivityData activity;
  final int index;

  @override
  Widget build(BuildContext context) {
    final t = context.t.activities;
    final steps = activity.steps;
    final step = steps[index];
    final isLast = index == steps.length - 1;

    void goTo(int index) => context.replace(ActivitiesRoutes.run(activity.id, index + 1));

    return AppPage(
      header: BackHeader(title: activity.name),
      body: PageScroll(
        // A new scroll position for each step: it opens at its top, on its instructions.
        key: ValueKey(step.id),
        children: [
          Text(
            t.run.step(current: index + 1, total: steps.length).toUpperCase(),
            style: context.overlineText,
          ),
          Text(step.title.isEmpty ? t.stepKind[step.kind.name]! : step.title, style: context.titleText),
          if (step.tips.isEmpty)
            _Instructions(step)
          else
            FTabs(
              children: [
                .entry(label: Text(t.run.instructions), child: _Instructions(step)),
                .entry(label: Text(t.run.tips), child: _Tips(step)),
              ],
            ),
          if (step.materials.isNotEmpty || step.resources.isNotEmpty)
            Panel(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                spacing: 10,
                children: [
                  Text(t.run.supplies, style: context.labelText),
                  Supplies(materials: step.materials, resources: step.resources),
                ],
              ),
            ),
        ],
      ),
      actions: BottomActionBar(
        children: [
          Row(
            spacing: 8,
            children: [
              Expanded(
                child: FButton(
                  variant: .outline,
                  size: .lg,
                  onPress: index > 0 ? () => goTo(index - 1) : null,
                  child: Text(t.run.previous),
                ),
              ),
              Expanded(
                child: isLast
                    ? FButton(
                        size: .lg,
                        onPress: () => context.replace(ActivitiesRoutes.feedback(activity.id)),
                        child: Text(t.run.finish),
                      )
                    : FButton(size: .lg, onPress: () => goTo(index + 1), child: Text(t.run.next)),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _Instructions extends StatelessWidget {
  const _Instructions(this.step);

  final ActivityStep step;

  @override
  Widget build(BuildContext context) {
    return HtmlText(step.description, style: context.bodyText.copyWith(fontSize: context.headingText.fontSize));
  }
}

class _Tips extends StatelessWidget {
  const _Tips(this.step);

  final ActivityStep step;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      spacing: AppSpaces.spacing,
      children: [
        for (final tip in step.tips)
          Panel(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              spacing: 4,
              children: [
                Text(tip.name, style: context.labelText),
                HtmlText(tip.description, style: context.captionText),
              ],
            ),
          ),
      ],
    );
  }
}
