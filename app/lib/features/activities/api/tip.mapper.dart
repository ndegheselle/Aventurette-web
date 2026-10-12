import 'package:aventurette/core/core.dart';
import 'package:aventurette/features/activities/model/step.dart';

/// A tip as the backend stores it: `catalog_tips` with a `name` and a `description`.
class TipMapper implements EntityMapper<ActivityTipData> {
  const TipMapper();

  @override
  List<String> get relations => const [];

  @override
  ActivityTipData toEntity(JsonMap payload, FileUrlResolver files) {
    return ActivityTipData(
      id: payload['id'] as String,
      name: asString(payload['name']),
      description: asString(payload['description']),
    );
  }
}

const tipMapper = TipMapper();
