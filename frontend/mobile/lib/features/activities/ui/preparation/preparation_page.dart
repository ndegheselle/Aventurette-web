import 'package:ajil/features/activities/models/activity.dart';
import 'package:ajil/features/activities/models/preparation.dart';
import 'package:ajil/features/activities/models/step.dart';
import 'package:ajil/ui/async/run_action.dart';
import 'package:ajil/features/activities/state/catalogue.dart';
import 'package:ajil/features/activities/state/preparation.dart';
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
import 'package:url_launcher/url_launcher.dart';

/// An activity's *Préparation* (A05): the material to gather, ticked off as it is; the set-up
/// before the game; and the safety and tips to keep in mind. Reached from the sheet, and goes
/// back to it.
class PreparationPage extends ConsumerWidget {
  const PreparationPage({super.key, required this.activityId});

  final String activityId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final activity = ref.watch(activityProvider(activityId));
    final loaded = activity.value;
    if (loaded != null) return _Preparation(activity: loaded);

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

class _Preparation extends StatelessWidget {
  const _Preparation({required this.activity});

  final ActivityData activity;

  @override
  Widget build(BuildContext context) {
    final t = context.t.activities.preparation;
    final preparation = preparationOf(activity);

    Widget body(PreparationTab tab) => switch (tab) {
      PreparationTab.materials => _Materials(activityId: activity.id, preparation: preparation),
      PreparationTab.setup => _Setup(preparation: preparation),
      PreparationTab.advice => _Advice(preparation: preparation),
    };

    return AppPage(
      header: BackHeader(title: activity.name),
      body: Padding(
        padding: const EdgeInsets.fromLTRB(AppSpaces.page, AppSpaces.spacing, AppSpaces.page, 0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          spacing: AppSpaces.spacing,
          children: [
            Text(t.title, style: context.titleText),
            Expanded(
              child: FTabs(
                expands: true,
                children: [
                  for (final tab in PreparationTab.values) .entry(label: Text(t.tabs[tab.name]!), child: body(tab)),
                ],
              ),
            ),
          ],
        ),
      ),
      actions: BottomActionBar(
        children: [FButton(size: .lg, onPress: () => Navigator.of(context).maybePop(), child: Text(t.back))],
      ),
    );
  }
}

/// One tab's content, scrolling, with the note on where this preparation goes at the end.
class _TabBody extends StatelessWidget {
  const _TabBody({required this.children});

  final List<Widget> children;

  @override
  Widget build(BuildContext context) => ListView(
    padding: const EdgeInsets.symmetric(vertical: AppSpaces.spacing),
    children: [
      for (final child in children) Padding(padding: const EdgeInsets.only(bottom: 10), child: child),
      HintBox(context.t.activities.preparation.hint),
    ],
  );
}

class _Materials extends ConsumerWidget {
  const _Materials({required this.activityId, required this.preparation});

  final String activityId;
  final ActivityPreparation preparation;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final t = context.t.activities.preparation;
    if (!preparation.hasMaterials) {
      return _TabBody(
        children: [EmptyState(icon: FLucideIcons.package, message: t.noMaterials)],
      );
    }

    final ticked = ref.watch(preparationChecklistProvider(activityId));
    final checklist = ref.read(preparationChecklistProvider(activityId).notifier);

    FTileMixin item(ActivityMaterial material) {
      void toggle() => checklist.toggle(material.id);

      return .tile(
        prefix: FCheckbox(value: ticked.contains(material.id), onChange: (_) => toggle()),
        title: Text(material.name),
        subtitle: material.quantity.isEmpty ? null : Text(material.quantity),
        onPress: toggle,
      );
    }

    return _TabBody(
      children: [
        if (preparation.materials.isNotEmpty)
          FTileGroup(children: [for (final material in preparation.materials) item(material)]),
        for (final group in preparation.workshops)
          FTileGroup(
            label: Text(t.workshop(name: group.workshop)),
            children: [for (final material in group.materials) item(material)],
          ),
        if (preparation.resources.isNotEmpty)
          FTileGroup(
            label: Text(t.resources),
            children: [
              for (final resource in preparation.resources)
                .tile(
                  prefix: const Icon(FLucideIcons.fileText),
                  title: Text(resource.name),
                  suffix: const Icon(FLucideIcons.externalLink),
                  onPress: () => runAction(context, () => launchUrl(Uri.parse(resource.url))),
                ),
            ],
          ),
      ],
    );
  }
}

class _Setup extends StatelessWidget {
  const _Setup({required this.preparation});

  final ActivityPreparation preparation;

  @override
  Widget build(BuildContext context) {
    final t = context.t.activities;
    if (preparation.setup.isEmpty) {
      return _TabBody(
        children: [EmptyState(icon: FLucideIcons.tent, message: t.preparation.noSetup)],
      );
    }

    return _TabBody(
      children: [
        FTileGroup(
          label: Text(
            preparation.setupMinutes > 0
                ? t.preparation.setupTotal(minutes: preparation.setupMinutes)
                : t.preparation.tabs['setup']!,
          ),
          children: [
            for (final step in preparation.setup)
              _richTile(
                context,
                title: step.title.isEmpty ? t.stepKind[step.kind.name]! : step.title,
                description: step.description,
                duration: step.duration > 0 ? t.minutes(minutes: step.duration) : null,
              ),
          ],
        ),
      ],
    );
  }
}

class _Advice extends StatelessWidget {
  const _Advice({required this.preparation});

  final ActivityPreparation preparation;

  @override
  Widget build(BuildContext context) {
    final t = context.t.activities.preparation;
    if (!preparation.hasAdvice) {
      return _TabBody(
        children: [EmptyState(icon: FLucideIcons.lightbulb, message: t.noAdvice)],
      );
    }

    return _TabBody(
      children: [
        if (preparation.safety.isNotEmpty)
          FTileGroup(
            label: Text(t.safety),
            children: [
              for (final instruction in preparation.safety)
                _richTile(
                  context,
                  title: instruction.name,
                  description: instruction.description,
                  prefix: Icon(FLucideIcons.triangleAlert, color: context.theme.colors.destructive),
                ),
            ],
          ),
        if (preparation.tips.isNotEmpty)
          FTileGroup(
            label: Text(t.tips),
            children: [
              for (final tip in preparation.tips)
                _richTile(
                  context,
                  title: tip.name,
                  description: tip.description,
                  prefix: const Icon(FLucideIcons.lightbulb),
                ),
            ],
          ),
      ],
    );
  }
}

/// A tile whose subtitle is rich text, shown whole: the set-up's steps and the advice.
FTileMixin _richTile(
  BuildContext context, {
  required String title,
  required String description,
  Widget? prefix,
  String? duration,
}) => .tile(
  prefix: prefix,
  title: Text(title),
  suffix: duration == null ? null : Text(duration),
  // The tile cuts its subtitle to one line; this shows the whole description.
  subtitle: description.isEmpty
      ? null
      : DefaultTextStyle.merge(
          overflow: TextOverflow.visible,
          child: HtmlText(description, style: context.captionText.copyWith(height: 1.4)),
        ),
);
