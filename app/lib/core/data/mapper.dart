import 'package:aventurette/core/data/entity.dart';
import 'package:aventurette/core/files/resolver.dart';

/// Translates one collection between the backend's payload and the app's entity. It is the
/// only place the two shapes meet: relations inlined and files resolved on the way out,
/// relation ids on the way in.
abstract interface class EntityMapper<TEntity extends BaseEntity> {
  /// Relations `toEntity` reads, as the paths the backend expands (`steps.materials` for a
  /// nested one). The data layer fetches exactly these, so the list and the mapper cannot drift.
  List<String> get relations;

  TEntity toEntity(JsonMap payload, FileUrlResolver files);
}

/// A mapper whose entity is also written.
abstract interface class WritableMapper<TEntity extends BaseEntity> implements EntityMapper<TEntity> {
  /// What a write sends.
  JsonMap toPayload(TEntity entity);
}

/// The records a payload expanded under `key`, whether the relation is single or multiple.
List<JsonMap> expanded(JsonMap payload, String key) {
  final value = (payload['expand'] as Map?)?[key];
  if (value is List) return value.cast<JsonMap>();
  if (value is Map) return [value.cast<String, dynamic>()];
  return const [];
}

List<T> toEntities<T extends BaseEntity>(
  Iterable<JsonMap> payloads,
  EntityMapper<T> mapper,
  FileUrlResolver files,
) {
  return payloads.map((payload) => mapper.toEntity(payload, files)).toList();
}

/// A relation goes back as the ids of its records.
List<String> toIds(Iterable<BaseEntity> records) {
  return records.map((record) => record.id).toList();
}

/// The payload without `expand`: what a record with no relation to read is made of.
JsonMap withoutExpand(JsonMap payload) {
  return Map.of(payload)..remove('expand');
}
