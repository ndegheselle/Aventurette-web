import 'package:aventurette/features/activities/model/activity.dart';
import 'package:aventurette/features/activities/model/material.dart';
import 'package:aventurette/features/activities/model/step.dart';

// ── The steps of a run ──────────────────────────────────────────────────────────────────────

/// The steps the template has the app produce rather than the author write. They exist only
/// while an activity is being run: nothing in the data stands for them.
enum GeneratedStepKind { gatherMaterial, gatherChildren }

/// One step as the run screen shows it, whether the author wrote it or the app generated it.
/// A generated step has no `title`: its kind is what it reads as. Exactly one of `kind` and
/// `generatedKind` is set.
class PlayStep {
  const PlayStep({
    required this.key,
    this.kind,
    this.generatedKind,
    this.title = '',
    this.description = '',
    this.duration = 0,
    this.actions = const [],
    this.materials = const [],
    this.resources = const [],
    this.tips = const [],
  });

  /// Unique within the run: the authored step's id, or the generated step's kind.
  final String key;
  final StepKind? kind;
  final GeneratedStepKind? generatedKind;
  final String title;
  final String description;

  /// Estimated, in minutes. 0 is not estimated.
  final int duration;
  final List<String> actions;
  final List<ActivityMaterialData> materials;
  final List<ActivityResourceData> resources;
  final List<ActivityTipData> tips;

  /// Whether the app produced the step, rather than the author writing it.
  bool get isGenerated => generatedKind != null;

  /// The name of the step's kind in the translations: `PREPARE`, `GATHER_MATERIAL`…
  String get kindKey => generatedKind?.key ?? kind!.wire;
}

extension on GeneratedStepKind {
  String get key => switch (this) {
    GeneratedStepKind.gatherMaterial => 'GATHER_MATERIAL',
    GeneratedStepKind.gatherChildren => 'GATHER_CHILDREN',
  };
}

/// A material as an action to tick while gathering it: its name, then how much of it.
String _materialAction(ActivityMaterialData material) {
  return material.quantity.isEmpty ? material.name : '${material.name} — ${material.quantity}';
}

PlayStep _generatedStep(GeneratedStepKind kind, [List<String> actions = const []]) {
  return PlayStep(key: kind.key, generatedKind: kind, actions: actions);
}

PlayStep _authoredStep(ActivityStepData step) {
  return PlayStep(
    key: step.id,
    kind: step.kind,
    title: step.title,
    description: step.description,
    duration: step.duration,
    actions: step.actions,
    materials: step.materials,
    resources: step.resources,
    tips: step.tips,
  );
}

/// Every step of a run, in the order the animator goes through them. Gathering the material
/// comes first, before anything is set up, and only when there is material to gather. Gathering
/// the children comes once the game is ready: before the first step that is not preparing it,
/// and not at all when every step is.
List<PlayStep> playStepsOf(ActivityData? activity) {
  if (activity == null) return [];

  final steps = activity.steps.map(_authoredStep).toList();

  // Inserted before anything is put in front: the index counts the authored steps only.
  final firstWithChildren = activity.steps.indexWhere((step) => step.kind != StepKind.prepare);
  if (firstWithChildren != -1) {
    steps.insert(firstWithChildren, _generatedStep(GeneratedStepKind.gatherChildren));
  }

  if (activity.materials.isNotEmpty) {
    final gathering = activity.materials.map(_materialAction).toList();
    steps.insert(0, _generatedStep(GeneratedStepKind.gatherMaterial, gathering));
  }

  return steps;
}

// ── Ticking actions ─────────────────────────────────────────────────────────────────────────

/// What identifies one action of one step, so the ticks of a run fit in one set.
String actionKey(PlayStep step, int actionIndex) => '${step.key}:$actionIndex';
