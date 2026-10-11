/// What the backend sends and takes: one record as JSON, `expand` included.
typedef JsonMap = Map<String, dynamic>;

/// The minimum a record must expose to the data layer.
abstract interface class BaseEntity {
  String get id;
}

List<T> distinctById<T extends BaseEntity>(Iterable<T> items) {
  final byId = <String, T>{};
  for (final item in items) {
    byId.putIfAbsent(item.id, () => item);
  }
  return byId.values.toList();
}
