import 'package:aventurette/core/core.dart';
import 'package:aventurette/features/activities/api/material.mapper.dart';
import 'package:aventurette/features/activities/model/workshop.dart';

/// A workshop as the backend stores it: `activities_workshops`, with the material links it
/// recalls under `materials`.
class WorkshopMapper implements EntityMapper<ActivityWorkshopData> {
  const WorkshopMapper();

  @override
  List<String> get relations => [
    'materials',
    ...activityMaterialMapper.relations.map((relation) => 'materials.$relation'),
  ];

  @override
  ActivityWorkshopData toEntity(JsonMap payload, FileUrlResolver files) {
    return ActivityWorkshopData(
      id: payload['id'] as String,
      name: asString(payload['name']),
      theme: asString(payload['theme']),
      challenges: asString(payload['challenges']),
      adultsRequired: asInt(payload['adults_required']),
      materials: toEntities(expanded(payload, 'materials'), activityMaterialMapper, files),
    );
  }
}

const workshopMapper = WorkshopMapper();
