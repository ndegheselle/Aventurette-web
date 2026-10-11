import 'package:aventurette/core/core.dart';
import 'package:aventurette/features/activities/api/material.mapper.dart';
import 'package:aventurette/features/activities/api/tip.mapper.dart';
import 'package:aventurette/features/activities/model/step.dart';

/// A resource as the backend stores it: `steps_resources` with a `name` and the stored name of
/// its `file`, which becomes the `url` everything above `api/` reads.
class ResourceMapper implements EntityMapper<ActivityResourceData> {
  const ResourceMapper();

  @override
  List<String> get relations => const [];

  @override
  ActivityResourceData toEntity(JsonMap payload, FileUrlResolver files) {
    final file = asString(payload['file']);

    return ActivityResourceData(
      id: payload['id'] as String,
      name: asString(payload['name']),
      url: file.isEmpty ? '' : files.getUrl(payload, file),
    );
  }
}

const resourceMapper = ResourceMapper();

/// A step as the backend stores it: `activities_steps`, with the material links, resources and
/// tips it lists under `materials`, `resources` and `tips`.
///
/// `actions` is a JSON column: never set reads as no action. The columns the app sets aside —
/// `visual_brief` and the end criteria — are not read.
class StepMapper implements EntityMapper<ActivityStepData> {
  const StepMapper();

  @override
  List<String> get relations => [
    'materials',
    ...activityMaterialMapper.relations.map((relation) => 'materials.$relation'),
    'resources',
    'tips',
  ];

  @override
  ActivityStepData toEntity(JsonMap payload, FileUrlResolver files) {
    return ActivityStepData(
      id: payload['id'] as String,
      kind: choiceOf(StepKind.values, payload['kind']) ?? StepKind.custom,
      title: asString(payload['title']),
      description: asString(payload['description']),
      duration: asInt(payload['duration']),
      actions: asStrings(payload['actions']),
      materials: toEntities(expanded(payload, 'materials'), activityMaterialMapper, files),
      resources: toEntities(expanded(payload, 'resources'), resourceMapper, files),
      tips: toEntities(expanded(payload, 'tips'), tipMapper, files),
    );
  }
}

const stepMapper = StepMapper();
