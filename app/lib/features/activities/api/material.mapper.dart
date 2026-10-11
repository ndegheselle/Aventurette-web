import 'package:aventurette/core/core.dart';
import 'package:aventurette/features/activities/model/material.dart';

/// An activity's link to a catalogue material, as the backend stores it: `activities_materials`
/// with a `quantity`, and the catalogue row — `material`, with its `name` — when expanded.
///
/// The link is read with the catalogue material's name folded in, so a list of what an activity
/// needs is one list.
class ActivityMaterialMapper implements EntityMapper<ActivityMaterialData> {
  const ActivityMaterialMapper();

  @override
  List<String> get relations => const ['material'];

  @override
  ActivityMaterialData toEntity(JsonMap payload, FileUrlResolver files) {
    final material = expanded(payload, 'material');

    return ActivityMaterialData(
      id: payload['id'] as String,
      name: material.isEmpty ? '' : asString(material.first['name']),
      quantity: asString(payload['quantity']),
    );
  }
}

const activityMaterialMapper = ActivityMaterialMapper();
