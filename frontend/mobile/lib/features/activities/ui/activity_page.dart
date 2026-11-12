import 'package:ajil/features/activities/models/activity.dart';
import 'package:ajil/features/activities/routes.dart';
import 'package:ajil/features/activities/state/catalogue.dart';
import 'package:ajil/features/activities/state/favorites.dart';
import 'package:ajil/features/activities/ui/activity_card.dart';
import 'package:ajil/features/activities/ui/activity_details.dart';
import 'package:ajil/features/activities/ui/favorite_button.dart';
import 'package:ajil/features/activities/ui/supplies.dart';
import 'package:ajil/features/activity_editor/routes.dart';
import 'package:ajil/ui/async/async_view.dart';
import 'package:ajil/ui/async/run_action.dart';
import 'package:ajil/ui/content/html_text.dart';
import 'package:ajil/ui/content/surfaces.dart';
import 'package:ajil/ui/i18n/strings.g.dart';
import 'package:ajil/ui/overlays/sheet.dart';
import 'package:ajil/ui/shell/page.dart';
import 'package:ajil/ui/theme/styles.dart';
import 'package:ajil/ui/theme/text.dart';
import 'package:ajil/ui/theme/tokens.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:remix/remix.dart';

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
          StyledText(factsOf(t, activity), style: labelText()),
          if (place.isNotEmpty) Wrap(spacing: 6, children: [for (final where in place) Tag(where)]),
          if (activity.summary.isNotEmpty) StyledText(activity.summary, style: bodyText().fontSize(AppSizes.fontLg())),
          HtmlText(activity.description),
          LinkCard(
            title: t.activities.sheet.preparation,
            subtitle: t.activities.sheet.preparationHint,
            onTap: () => context.push(ActivitiesRoutes.preparation(activity.id)),
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
                        StyledText(
                          workshop.theme.isEmpty ? workshop.name : '${workshop.name} · ${workshop.theme}',
                          style: labelText(),
                        ),
                        HtmlText(workshop.challenges, style: captionText()),
                        if (workshop.adultsRequired > 0) Tag(t.activities.sheet.adults(count: workshop.adultsRequired)),
                      ],
                    ),
                ],
              ),
            ),
          if (activity.steps.isNotEmpty)
            _Section(
              title: t.activities.sheet.steps,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                spacing: 12,
                children: [
                  for (final (index, step) in activity.steps.indexed)
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      spacing: 12,
                      children: [
                        StyledText(
                          (index + 1).toString().padLeft(2, '0'),
                          style: titleText().fontWeight(FontWeight.w300),
                        ),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            spacing: 2,
                            children: [
                              StyledText(
                                [
                                  step.title.isEmpty ? t.activities.stepKind[step.kind.name]! : step.title,
                                  if (step.duration > 0) t.activities.minutes(minutes: step.duration),
                                ].join(' · '),
                                style: labelText(),
                              ),
                              HtmlText(step.description, style: captionText()),
                            ],
                          ),
                        ),
                      ],
                    ),
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
                  label: t.activities.actions.share,
                  leadingIcon: LucideIcons.share2,
                  style: buttonStyle(variant: ButtonVariant.outline),
                  // A10, the share sheet, is not built yet.
                  onPressed: () => runAction<void>(context, () => throw UnimplementedError('A10')),
                ),
              ),
              Expanded(
                child: RemixButton(
                  label: saved ? t.activities.actions.saved : t.activities.actions.save,
                  leadingIcon: LucideIcons.heart,
                  style: buttonStyle(variant: ButtonVariant.outline),
                  onPressed: () => toggleFavorite(context, ref, activity),
                ),
              ),
            ],
          ),
          Row(
            spacing: 8,
            children: [
              Expanded(
                child: RemixButton(
                  label: t.activities.actions.edit,
                  leadingIcon: LucideIcons.pencil,
                  style: buttonStyle(variant: ButtonVariant.outline),
                  onPressed: () => context.push(ActivityEditorRoutes.edit(activity.id)),
                ),
              ),
              Expanded(
                child: RemixButton(
                  label: t.activities.actions.guided,
                  leadingIcon: LucideIcons.play,
                  style: buttonStyle(),
                  onPressed: () => context.push(ActivitiesRoutes.run(activity.id, 1)),
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
        StyledText(title, style: headingText()),
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

    return RemixIconButton(
      icon: LucideIcons.triangleAlert,
      semanticLabel: title,
      style: iconButtonStyle().color(AppColors.warning.fill()).iconColor(AppColors.warning.foreground()),
      onPressed: () => showAppSheet<void>(
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
                    StyledText(instruction.name, style: labelText()),
                    HtmlText(instruction.description, style: captionText()),
                  ],
                ),
              ),
          ],
        ),
      ),
    );
  }
}
