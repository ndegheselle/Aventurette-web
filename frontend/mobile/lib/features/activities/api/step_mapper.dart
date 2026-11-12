import 'package:ajil/core/data/mapper.dart';
import 'package:ajil/core/files/file_url_resolver.dart';
import 'package:ajil/features/activities/models/step.dart';

/// The app only reads these: a write would be the editor's (A04, A19), which is not built yet.
Never _readOnly(String what) => throw UnimplementedError('$what are written by the activity editor');

int _intOf(Object? value) => (value as num?)?.toInt() ?? 0;

/// An activity's link to a catalogue material, read with the material's name folded in.
class ActivityMaterialMapper implements EntityMapper<ActivityMaterial> {
  const ActivityMaterialMapper();

  @override
  List<String> get relations => const ['material'];

  @override
  ActivityMaterial toEntity(Payload payload, FileUrlResolver files) {
    final material = (payload['expand'] as Map?)?['material'] as Map?;
    return ActivityMaterial(
      id: payload['id'] as String,
      name: (material?['name'] as String?) ?? '',
      quantity: (payload['quantity'] as String?) ?? '',
    );
  }

  @override
  Payload toPayload(ActivityMaterial entity) => _readOnly('material links');
}

/// `file` is the stored file's name: the resource reads it as the url it is served at.
class StepResourceMapper implements EntityMapper<StepResource> {
  const StepResourceMapper();

  @override
  List<String> get relations => const [];

  @override
  StepResource toEntity(Payload payload, FileUrlResolver files) {
    final file = (payload['file'] as String?) ?? '';
    return StepResource(
      id: payload['id'] as String,
      name: (payload['name'] as String?) ?? '',
      url: file.isEmpty ? '' : files.urlOf(payload, file),
    );
  }

  @override
  Payload toPayload(StepResource entity) => _readOnly('resources');
}

class StepTipMapper implements EntityMapper<StepTip> {
  const StepTipMapper();

  @override
  List<String> get relations => const [];

  @override
  StepTip toEntity(Payload payload, FileUrlResolver files) => StepTip(
    id: payload['id'] as String,
    name: (payload['name'] as String?) ?? '',
    description: (payload['description'] as String?) ?? '',
  );

  @override
  Payload toPayload(StepTip entity) => _readOnly('tips');
}

/// A step, with its relations read out of `expand`. The columns the app sets aside — the visual
/// brief and the end criteria — are never read.
class StepMapper implements EntityMapper<ActivityStep> {
  const StepMapper();

  static const _materials = ActivityMaterialMapper();
  static const _resources = StepResourceMapper();
  static const _tips = StepTipMapper();

  @override
  List<String> get relations => [
    'materials',
    for (final relation in _materials.relations) 'materials.$relation',
    'resources',
    'tips',
  ];

  @override
  ActivityStep toEntity(Payload payload, FileUrlResolver files) => ActivityStep(
    id: payload['id'] as String,
    kind: enumOf(StepKind.values, payload['kind']) ?? StepKind.custom,
    title: (payload['title'] as String?) ?? '',
    description: (payload['description'] as String?) ?? '',
    duration: _intOf(payload['duration']),
    materials: toEntities(payload, 'materials', _materials, files),
    resources: toEntities(payload, 'resources', _resources, files),
    tips: toEntities(payload, 'tips', _tips, files),
  );

  @override
  Payload toPayload(ActivityStep entity) => _readOnly('steps');
}
