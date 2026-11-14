/// What an activity's *Préparation* (A05) shows, drawn from the activity: the material to
/// gather, the set-up to do before the children arrive, and the advice to keep in mind.
library;

import 'package:ajil/features/activities/models/activity.dart';
import 'package:ajil/features/activities/models/step.dart';

/// The screen's three tabs, in their order.
enum PreparationTab { materials, setup, advice }

/// The material one workshop needs, apart from the activity's own.
class WorkshopMaterials {
  const WorkshopMaterials({required this.workshop, required this.materials});

  final String workshop;
  final List<ActivityMaterial> materials;
}

class ActivityPreparation {
  const ActivityPreparation({
    this.materials = const [],
    this.workshops = const [],
    this.resources = const [],
    this.setup = const [],
    this.setupMinutes = 0,
    this.safety = const [],
    this.tips = const [],
  });

  /// The activity's own material.
  final List<ActivityMaterial> materials;

  /// Only the workshops that need some.
  final List<WorkshopMaterials> workshops;

  /// The files the steps use, to print or to have at hand.
  final List<StepResource> resources;

  /// The steps preparing the game, in order.
  final List<ActivityStep> setup;
  final int setupMinutes;

  final List<SafetyInstruction> safety;

  /// The tips of every step, each once, in first-use order.
  final List<StepTip> tips;

  bool get hasMaterials => materials.isNotEmpty || workshops.isNotEmpty || resources.isNotEmpty;

  bool get hasAdvice => safety.isNotEmpty || tips.isNotEmpty;
}

ActivityPreparation preparationOf(ActivityData activity) {
  final seenTips = <String>{};

  return ActivityPreparation(
    materials: activity.materials,
    workshops: [
      for (final workshop in activity.workshops)
        if (workshop.materials.isNotEmpty) WorkshopMaterials(workshop: workshop.name, materials: workshop.materials),
    ],
    resources: resourcesOf(activity),
    setup: [
      for (final step in activity.steps)
        if (step.kind == StepKind.prepare) step,
    ],
    setupMinutes: timingOf(activity).preparation,
    safety: activity.safety,
    tips: [
      for (final step in activity.steps)
        for (final tip in step.tips)
          if (seenTips.add(tip.id)) tip,
    ],
  );
}
