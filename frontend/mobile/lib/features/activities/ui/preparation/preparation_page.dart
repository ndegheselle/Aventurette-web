import 'package:ajil/features/activities/models/activity.dart';
import 'package:ajil/features/activities/models/preparation.dart';
import 'package:ajil/features/activities/models/step.dart';
import 'package:ajil/features/activities/state/catalogue.dart';
import 'package:ajil/features/activities/state/preparation.dart';
import 'package:ajil/features/activities/ui/_parts/supplies.dart';
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

    Widget item(ActivityMaterial material) => _MaterialItem(
      material: material,
      ticked: ticked.contains(material.id),
      onToggle: () => checklist.toggle(material.id),
    );

    return _TabBody(
      children: [
        for (final material in preparation.materials) item(material),
        for (final group in preparation.workshops) ...[
          Text(t.workshop(name: group.workshop), style: context.labelText),
          for (final material in group.materials) item(material),
        ],
        if (preparation.resources.isNotEmpty) ...[
          Text(t.resources, style: context.labelText),
          Supplies(materials: const [], resources: preparation.resources),
        ],
      ],
    );
  }
}

/// A card to tick: the material, and its quantity under it.
class _MaterialItem extends StatelessWidget {
  const _MaterialItem({required this.material, required this.ticked, required this.onToggle});

  final ActivityMaterial material;
  final bool ticked;
  final VoidCallback onToggle;

  @override
  Widget build(BuildContext context) => Panel(
    child: FCheckbox(
      value: ticked,
      onChange: (_) => onToggle(),
      label: Text(material.name),
      description: material.quantity.isEmpty ? null : Text(material.quantity),
    ),
  );
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
        if (preparation.setupMinutes > 0)
          Text(t.preparation.setupTotal(minutes: preparation.setupMinutes), style: context.headingText),
        for (final step in preparation.setup)
          _Card(
            title: [
              step.title.isEmpty ? t.stepKind[step.kind.name]! : step.title,
              if (step.duration > 0) t.minutes(minutes: step.duration),
            ].join(' · '),
            description: step.description,
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
        for (final instruction in preparation.safety)
          _Card(overline: t.safety, title: instruction.name, description: instruction.description),
        for (final StepTip tip in preparation.tips)
          _Card(overline: t.tips, title: tip.name, description: tip.description),
      ],
    );
  }
}

/// A card of the set-up or the advice: a title, and its rich text under it.
class _Card extends StatelessWidget {
  const _Card({required this.title, required this.description, this.overline});

  final String? overline;
  final String title;
  final String description;

  @override
  Widget build(BuildContext context) => Panel(
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      spacing: 4,
      children: [
        if (overline != null) Text(overline!.toUpperCase(), style: context.overlineText),
        Text(title, style: context.headingText),
        HtmlText(description, style: context.captionText),
      ],
    ),
  );
}
