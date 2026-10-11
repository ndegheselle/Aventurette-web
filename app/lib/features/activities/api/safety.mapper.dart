import 'package:aventurette/core/core.dart';
import 'package:aventurette/features/activities/model/activity.dart';

/// A safety instruction as the backend stores it: `catalog_safety_instructions` with a `name`
/// and a `description`.
class SafetyInstructionMapper implements EntityMapper<SafetyInstructionData> {
  const SafetyInstructionMapper();

  @override
  List<String> get relations => const [];

  @override
  SafetyInstructionData toEntity(JsonMap payload, FileUrlResolver files) {
    return SafetyInstructionData(
      id: payload['id'] as String,
      name: asString(payload['name']),
      description: asString(payload['description']),
    );
  }
}

const safetyInstructionMapper = SafetyInstructionMapper();
