import 'package:ajil/features/activities/models/activity.dart';
import 'package:ajil/features/activities/routes.dart';
import 'package:ajil/features/activities/state/catalogue.dart';
import 'package:ajil/features/activities/state/favorites.dart';
import 'package:ajil/features/activities/ui/activity/activity_card.dart';
import 'package:ajil/features/activities/ui/activity/activity_details.dart';
import 'package:ajil/features/activities/ui/_parts/favorite_button.dart';
import 'package:ajil/features/activities/ui/_parts/supplies.dart';
import 'package:ajil/features/activity_editor/routes.dart';
import 'package:ajil/ui/async/async_view.dart';
import 'package:ajil/ui/async/run_action.dart';
import 'package:ajil/ui/content/html_text.dart';
import 'package:ajil/ui/content/surfaces.dart';
import 'package:ajil/ui/i18n/strings.g.dart';
import 'package:ajil/ui/overlays/sheet.dart';
import 'package:ajil/ui/shell/page.dart';
import 'package:ajil/ui/theme/text.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:forui/forui.dart';
import 'package:go_router/go_router.dart';

/// An activity's sheet (A03): what it is, what it takes, how it runs. Full screen, its actions
/// at the bottom; *Mode guidé* is the only way into a run.
class ActivityPage extends ConsumerWidget {
  const ActivityPage({super.key, required this.activityId});

  final String activityId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final activity = ref.watch(activityProvider(activityId));
    final loaded = activity.value;
    if (loaded != null) return _ActivitySheet(activity: loaded);

    // Loading, failed, or no activity under that id.
    return AppPage(
      header: const BackHeader(title: ''),
      body: AsyncView(
        value: activity,
        onRetry: () => ref.invalidate(activityProvider(activityId)),
        data: (_) => const ErrorView(),
      ),
    );
  }
}

class _ActivitySheet extends ConsumerWidget {
  const _ActivitySheet({required this.activity});

  final ActivityData activity;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final t = context.t;
    ref.watch(favoritesProvider);
    final saved = ref.read(favoritesProvider.notifier).isFavorite(activity.id);

    final place = [
      if (activity.place.outdoor) t.activities.fields.outdoor,
      if (activity.place.indoor) t.activities.fields.indoor,
    ];
    final resources = resourcesOf(activity);

    return AppPage(
      header: BackHeader(
        title: activity.name,
        trailing: [if (activity.safety.isNotEmpty) _SafetyButton(activity: activity)],
      ),
      body: PageScroll(
        children: [
          Text(factsOf(t, activity), style: context.labelText),
          if (place.isNotEmpty) Wrap(spacing: 6, children: [for (final where in place) Tag(where)]),
          if (activity.summary.isNotEmpty)
            Text(activity.summary, style: context.bodyText.copyWith(fontSize: context.headingText.fontSize)),
          HtmlText(activity.description),
          FTile(
            title: Text(t.activities.sheet.preparation),
            subtitle: Text(t.activities.sheet.preparationHint),
            suffix: const Icon(FLucideIcons.chevronRight),
            onPress: () => context.push(ActivitiesRoutes.preparation(activity.id)),
          ),
          ActivityDetails(activity: activity),
          if (activity.materials.isNotEmpty || resources.isNotEmpty)
            _Section(
              title: t.activities.sheet.supplies,
              child: Supplies(materials: activity.materials, resources: resources),
            ),
          if (activity.workshops.isNotEmpty)
            _Section(
              title: t.activities.sheet.workshops,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                spacing: 10,
                children: [
                  for (final workshop in activity.workshops)
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      spacing: 2,
                      children: [
                        Text(
                          workshop.theme.isEmpty ? workshop.name : '${workshop.name} · ${workshop.theme}',
                          style: context.labelText,
                        ),
                        HtmlText(workshop.challenges, style: context.captionText),
                        if (workshop.adultsRequired > 0) Tag(t.activities.sheet.adults(count: workshop.adultsRequired)),
                      ],
                    ),
                ],
              ),
            ),
          if (activity.steps.isNotEmpty)
            FTileGroup(
              label: Text(t.activities.sheet.steps),
              children: [
                for (final (index, step) in activity.steps.indexed)
                  .tile(
                    prefix: Text(
                      (index + 1).toString().padLeft(2, '0'),
                      style: context.titleText.copyWith(fontWeight: FontWeight.w300),
                    ),
                    title: Text(
                      [
                        step.title.isEmpty ? t.activities.stepKind[step.kind.name]! : step.title,
                        if (step.duration > 0) t.activities.minutes(minutes: step.duration),
                      ].join(' · '),
                    ),
                    // The tile cuts its subtitle to one line; this shows the whole description.
                    subtitle: DefaultTextStyle.merge(
                      overflow: TextOverflow.visible,
                      child: HtmlText(step.description, style: context.captionText),
                    ),
                  ),
              ],
            ),
        ],
      ),
      actions: BottomActionBar(
        children: [
          Row(
            spacing: 8,
            mainAxisSize: .min,
            children: [
              FTooltip(
                tipBuilder: (context, _) => Text(t.activities.actions.share),
                child: FButton.icon(
                variant: .outline,
                  // A10, the share sheet, is not built yet.
                onPress: () => runAction<void>(context, () => throw UnimplementedError('A10')),
                  child: const Icon(FLucideIcons.share2),
                ),
              ),
              FTooltip(
                tipBuilder: (context, _) => Text(saved ? t.activities.actions.saved : t.activities.actions.save),
                child: FButton.icon(
                  variant: .outline,
                  onPress: () => toggleFavorite(context, ref, activity),
                  child: const Icon(FLucideIcons.heart),
                ),
              ),
              FTooltip(
                tipBuilder: (context, _) => Text(t.activities.actions.guided),
                child: FButton.icon(
                  onPress: () => context.push(ActivitiesRoutes.run(activity.id, 1)),
                  child: const Icon(FLucideIcons.play),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _Section extends StatelessWidget {
  const _Section({required this.title, required this.child});

  final String title;
  final Widget child;

  @override
  Widget build(BuildContext context) => Panel(
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      spacing: 10,
      children: [
        Text(title, style: context.headingText),
        child,
      ],
    ),
  );
}

/// The warning beside the title, when the activity has safety instructions: opens them all.
class _SafetyButton extends StatelessWidget {
  const _SafetyButton({required this.activity});

  final ActivityData activity;

  @override
  Widget build(BuildContext context) {
    final title = context.t.activities.fields.safetyInstructions;

    return FButton.icon(
      variant: .ghost,
      semanticsLabel: title,
      onPress: () => showAppSheet<void>(
        context,
        title: title,
        builder: (_) => Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          spacing: 8,
          children: [
            for (final instruction in activity.safety)
              Panel(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  spacing: 4,
                  children: [
                    Text(instruction.name, style: context.labelText),
                    HtmlText(instruction.description, style: context.captionText),
                  ],
                ),
              ),
          ],
        ),
      ),
      child: Icon(FLucideIcons.triangleAlert, color: context.theme.colors.destructive),
    );
  }
}
