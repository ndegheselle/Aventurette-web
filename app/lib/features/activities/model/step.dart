import 'package:aventurette/core/core.dart';
import 'package:aventurette/features/activities/model/material.dart';

enum StepKind implements WireEnum {
  prepare('PREPARE'),
  custom('CUSTOM'),
  conclusion('CONCLUSION');

  const StepKind(this.wire);

  @override
  final String wire;
}

/// One step of the activity: what the animator does, as short actions to tick, and how long it
/// takes. `materials` are the activity's own, recalled here; `tips` are the catalogue's, linked.
class ActivityStepData implements BaseEntity {
  const ActivityStepData({
    required this.id,
    required this.kind,
    this.title = '',
    this.description = '',
    this.duration = 0,
    this.actions = const [],
    this.materials = const [],
    this.resources = const [],
    this.tips = const [],
  });

  @override
  final String id;
  final StepKind kind;
  final String title;

  /// Rich text.
  final String description;

  /// Estimated, in minutes. 0 is not estimated.
  final int duration;
  final List<String> actions;
  final List<ActivityMaterialData> materials;
  final List<ActivityResourceData> resources;
  final List<ActivityTipData> tips;
}

/// A step's position as the list shows it: `01`, `02`… from its zero-based index.
String stepNumber(int index) => (index + 1).toString().padLeft(2, '0');

/// A piece of advice for running a step. Tips are a catalogue every step draws from: a step
/// links the ones it gives, it never writes them.
class ActivityTipData implements BaseEntity {
  const ActivityTipData({required this.id, required this.name, this.description = ''});

  @override
  final String id;
  final String name;

  /// Rich text.
  final String description;
}

/// A file uploaded for one step.
class ActivityResourceData implements BaseEntity {
  const ActivityResourceData({required this.id, required this.name, this.url = ''});

  @override
  final String id;
  final String name;

  /// Where the stored file can be read.
  final String url;
}
