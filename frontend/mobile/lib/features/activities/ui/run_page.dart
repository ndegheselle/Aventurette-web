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
import 'package:ajil/ui/inputs/pills.dart';
import 'package:ajil/ui/shell/page.dart';
import 'package:ajil/ui/theme/styles.dart';
import 'package:ajil/ui/theme/text.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:remix/remix.dart';

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
        body: EmptyState(icon: LucideIcons.circleQuestionMark, message: context.t.activities.run.empty),
      );
    }

    final index = runStepIndexOf(stepParam, loaded.steps.length);
    return _Run(activity: loaded, index: index);
  }
}

class _Run extends StatefulWidget {
  const _Run({required this.activity, required this.index});

  final ActivityData activity;
  final int index;

  @override
  State<_Run> createState() => _RunState();
}

enum _StepTab { instructions, tips }

class _RunState extends State<_Run> {
  var _tab = _StepTab.instructions;

  @override
  void didUpdateWidget(_Run oldWidget) {
    super.didUpdateWidget(oldWidget);
    // Each step opens on its instructions.
    if (oldWidget.index != widget.index) _tab = _StepTab.instructions;
  }

  void _goTo(int index) => context.replace(ActivitiesRoutes.run(widget.activity.id, index + 1));

  @override
  Widget build(BuildContext context) {
    final t = context.t.activities;
    final steps = widget.activity.steps;
    final index = widget.index;
    final step = steps[index];
    final isLast = index == steps.length - 1;

    return AppPage(
      header: BackHeader(title: widget.activity.name),
      body: PageScroll(
        // A new scroll position for each step: it opens at its top.
        key: ValueKey(step.id),
        children: [
          StyledText(
            t.run.step(current: index + 1, total: steps.length),
            style: overlineText(),
          ),
          StyledText(step.title.isEmpty ? t.stepKind[step.kind.name]! : step.title, style: titleText()),
          if (step.tips.isNotEmpty)
            PillTabs(
              values: _StepTab.values,
              selected: _tab,
              labelOf: (tab) => tab == _StepTab.instructions ? t.run.instructions : t.run.tips,
              onChanged: (tab) => setState(() => _tab = tab),
            ),
          ..._content(step),
          if (step.materials.isNotEmpty || step.resources.isNotEmpty)
            Panel(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                spacing: 10,
                children: [
                  StyledText(t.run.supplies, style: labelText()),
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
                child: RemixButton(
                  label: t.run.previous,
                  enabled: index > 0,
                  style: buttonStyle(variant: ButtonVariant.outline, size: ControlSize.lg),
                  onPressed: () => _goTo(index - 1),
                ),
              ),
              Expanded(
                child: isLast
                    ? RemixButton(
                        label: t.run.finish,
                        style: buttonStyle(size: ControlSize.lg),
                        onPressed: () => context.replace(ActivitiesRoutes.feedback(widget.activity.id)),
                      )
                    : RemixButton(
                        label: t.run.next,
                        style: buttonStyle(size: ControlSize.lg),
                        onPressed: () => _goTo(index + 1),
                      ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  List<Widget> _content(ActivityStep step) => switch (_tab) {
    _StepTab.instructions => [HtmlText(step.description, style: bodyText().fontSize(18))],
    _StepTab.tips => [
      for (final tip in step.tips)
        Panel(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            spacing: 4,
            children: [
              StyledText(tip.name, style: labelText()),
              HtmlText(tip.description, style: captionText()),
            ],
          ),
        ),
    ],
  };
}
