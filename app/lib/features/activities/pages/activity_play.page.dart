import 'package:aventurette/app/i18n.dart';
import 'package:aventurette/features/activities/components/activity_notices.dart';
import 'package:aventurette/features/activities/composables/use_activity_play.dart';
import 'package:aventurette/features/activities/model/play.dart';
import 'package:aventurette/features/activities/model/step.dart';
import 'package:aventurette/features/activities/routes.dart';
import 'package:aventurette/ui/layout/container.dart';
import 'package:aventurette/ui/layout/html_text.dart';
import 'package:aventurette/ui/layout/panel.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

class ActivityPlayPage extends StatefulWidget {
  const ActivityPlayPage({super.key, required this.id});

  final String id;

  @override
  State<ActivityPlayPage> createState() => _ActivityPlayPageState();
}

class _ActivityPlayPageState extends State<ActivityPlayPage> {
  final _play = UseActivityPlay();

  @override
  void initState() {
    super.initState();
    _play.load(widget.id);
  }

  @override
  void didUpdateWidget(ActivityPlayPage oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.id != widget.id) _play.load(widget.id);
  }

  @override
  void dispose() {
    _play.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return ListenableBuilder(
      listenable: _play,
      builder: (context, _) {
        final activity = _play.source.activity;
        if (activity == null) {
          return Center(
            child: _play.source.isLoading
                ? const CircularProgressIndicator()
                : Text(context.t('data.noData')),
          );
        }

        final current = _play.current;

        return Column(
          children: [
            _TopBar(play: _play),
            if (current == null)
              Expanded(
                child: Center(
                  child: Opacity(
                    opacity: 0.4,
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      spacing: 8,
                      children: [
                        const Icon(LucideIcons.circleQuestionMark),
                        Text(context.t('activities.play.empty')),
                      ],
                    ),
                  ),
                ),
              )
            else ...[
              LinearProgressIndicator(value: (_play.index + 1) / _play.steps.length),
              Expanded(
                child: _StepPanel(play: _play, step: current),
              ),
              _BottomBar(play: _play, activityId: activity.id),
            ],
          ],
        );
      },
    );
  }
}

/// What a step reads as: its own title, or else its kind's name, as a generated step has no title.
String _headingOf(BuildContext context, PlayStep step) {
  return step.title.isNotEmpty ? step.title : context.t('activities.steps.kind.${step.kindKey}');
}

class _TopBar extends StatelessWidget {
  const _TopBar({required this.play});

  final UseActivityPlay play;

  @override
  Widget build(BuildContext context) {
    final activity = play.source.activity!;

    return Padding(
      padding: const EdgeInsets.all(4),
      child: Row(
        spacing: 8,
        children: [
          TextButton.icon(
            icon: const Icon(LucideIcons.arrowLeft),
            label: Text(context.t('actions.back')),
            onPressed: () => context.goNamed(routesNames.page, pathParameters: {'id': activity.id}),
          ),
          Expanded(child: Text(activity.name, overflow: TextOverflow.ellipsis)),
          if (play.steps.isNotEmpty)
            Text(
              context.t('activities.play.progress', {'current': play.index + 1, 'total': play.steps.length}),
            ),
          ActivityNotices(safety: activity.safety.instructions),
        ],
      ),
    );
  }
}

class _StepPanel extends StatelessWidget {
  const _StepPanel({required this.play, required this.step});

  final UseActivityPlay play;
  final PlayStep step;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return PageContainer(
      children: [
        _StepList(play: play),
        Panel(
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              spacing: 12,
              children: [
                Text(
                  stepNumber(play.index),
                  style: theme.textTheme.displaySmall?.copyWith(color: theme.disabledColor),
                ),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(_headingOf(context, step), style: theme.textTheme.headlineSmall),
                      Wrap(
                        spacing: 4,
                        children: [
                          if (step.title.isNotEmpty)
                            Chip(label: Text(context.t('activities.steps.kind.${step.kindKey}'))),
                          if (step.duration > 0)
                            Tooltip(
                              message: context.t('activities.steps.fields.duration'),
                              child: Chip(
                                avatar: const Icon(LucideIcons.clock, size: 14),
                                label: Text(context.t('activities.minutes', {'minutes': step.duration})),
                              ),
                            ),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
            if (step.isGenerated) Text(context.t('activities.play.generated.${step.kindKey}')),
            if (step.description.isNotEmpty) HtmlText(step.description),
            if (step.actions.isNotEmpty) _Actions(play: play, step: step),
            if (step.tips.isNotEmpty) _Tips(step: step),
            if (step.materials.isNotEmpty)
              _Section(
                title: context.t('activities.steps.fields.materials.title'),
                icon: LucideIcons.packageOpen,
                child: Wrap(
                  spacing: 4,
                  children: [
                    for (final material in step.materials)
                      Chip(
                        label: Text(
                          material.quantity.isEmpty ? material.name : '${material.name} ${material.quantity}',
                        ),
                      ),
                  ],
                ),
              ),
            if (step.resources.isNotEmpty)
              _Section(
                title: context.t('activities.steps.fields.resources.title'),
                icon: LucideIcons.fileText,
                child: Wrap(
                  spacing: 4,
                  children: [for (final resource in step.resources) Chip(label: Text(resource.name))],
                ),
              ),
          ],
        ),
      ],
    );
  }
}

/// The steps of the run, to jump around in.
class _StepList extends StatelessWidget {
  const _StepList({required this.play});

  final UseActivityPlay play;

  @override
  Widget build(BuildContext context) {
    return Wrap(
      spacing: 4,
      children: [
        for (final (index, step) in play.steps.indexed)
          ChoiceChip(
            label: Text(_headingOf(context, step)),
            selected: index == play.index,
            onSelected: (_) => play.goTo(index),
          ),
      ],
    );
  }
}

class _Actions extends StatelessWidget {
  const _Actions({required this.play, required this.step});

  final UseActivityPlay play;
  final PlayStep step;

  @override
  Widget build(BuildContext context) {
    return _Section(
      title: context.t('activities.steps.fields.actions.title'),
      icon: LucideIcons.listChecks,
      child: Column(
        children: [
          for (final (index, action) in step.actions.indexed)
            CheckboxListTile(
              dense: true,
              contentPadding: EdgeInsets.zero,
              controlAffinity: ListTileControlAffinity.leading,
              value: play.isTicked(step, index),
              onChanged: (_) => play.toggle(step, index),
              title: Text(
                action,
                style: play.isTicked(step, index)
                    ? const TextStyle(decoration: TextDecoration.lineThrough)
                    : null,
              ),
            ),
        ],
      ),
    );
  }
}

class _Tips extends StatelessWidget {
  const _Tips({required this.step});

  final PlayStep step;

  @override
  Widget build(BuildContext context) {
    return _Section(
      title: context.t('activities.tips.title'),
      icon: LucideIcons.info,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        spacing: 8,
        children: [
          for (final tip in step.tips)
            Card(
              color: Theme.of(context).colorScheme.secondaryContainer,
              margin: EdgeInsets.zero,
              child: Padding(
                padding: const EdgeInsets.all(12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(tip.name, style: const TextStyle(fontWeight: FontWeight.bold)),
                    HtmlText(tip.description),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }
}

class _Section extends StatelessWidget {
  const _Section({required this.title, required this.icon, required this.child});

  final String title;
  final IconData icon;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          spacing: 4,
          children: [
            Icon(icon, size: 16),
            Text(title, style: Theme.of(context).textTheme.bodySmall),
          ],
        ),
        child,
      ],
    );
  }
}

class _BottomBar extends StatelessWidget {
  const _BottomBar({required this.play, required this.activityId});

  final UseActivityPlay play;
  final String activityId;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(8),
      child: Row(
        children: [
          OutlinedButton.icon(
            icon: const Icon(LucideIcons.arrowLeft),
            label: Text(context.t('activities.play.previous')),
            onPressed: play.isFirst ? null : play.previous,
          ),
          const Spacer(),
          if (!play.isLast)
            FilledButton.icon(
              iconAlignment: IconAlignment.end,
              icon: const Icon(LucideIcons.arrowRight),
              label: Text(context.t('activities.play.next')),
              onPressed: play.next,
            )
          else
            FilledButton.icon(
              icon: const Icon(LucideIcons.flag),
              label: Text(context.t('activities.play.finish')),
              onPressed: () => context.goNamed(routesNames.page, pathParameters: {'id': activityId}),
            ),
        ],
      ),
    );
  }
}
