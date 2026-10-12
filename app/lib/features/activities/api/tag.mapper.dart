import 'package:aventurette/core/core.dart';
import 'package:aventurette/features/activities/model/tag.dart';

/// A tag as the backend stores it: `catalog_tags` with a `name` and a `type`.
class TagMapper implements EntityMapper<ActivityTagData> {
  const TagMapper();

  @override
  List<String> get relations => const [];

  @override
  ActivityTagData toEntity(JsonMap payload, FileUrlResolver files) {
    return ActivityTagData(
      id: payload['id'] as String,
      name: asString(payload['name']),
      type: choiceOf(ActivityTagType.values, payload['type']),
    );
  }
}

const tagMapper = TagMapper();
